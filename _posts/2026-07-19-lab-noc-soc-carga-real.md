---
title: "Lab NOC/SOC bajo carga real: ¿hay gaps?"
date: 2026-07-19T11:00:00+02:00
categories: [Homelab, Monitorización, DevOps]
excerpt: "Un comentario en LinkedIn planteó una duda legítima sobre mi lab NOC/SOC: ¿aguanta la telemetría cuando coinciden picos de logs y de scraping? Diseñé un experimento reproducible para comprobarlo y el hallazgo más interesante no fue el que esperaba."
card_image: /assets/images/cards/carga-real.png
---

Tras publicar la serie sobre el [lab NOC/SOC en 8GB de RAM](/homelab/monitorización/devops/2026/07/11/lab-noc-soc.html), uno de los comentarios recibí merecía una respuesta con datos, no solo con palabras. El comentario fue el siguiente:

*"En un NOC/SOC real, la métrica que importa no es cuánto cabe en RAM, sino cuánto flujo puede procesar tu stack sin saturarse y sin perder la ventana de detección [...] las tareas de correlación y las de recolección compiten por los mismos recursos. Cuando un pico de logs coincide con un ciclo de scraping de Prometheus, vas a ver gaps en la telemetría que en producción serían puntos ciegos."*

Es una objeción técnicamente sólida y verificable. Diseñé un experimento reproducible para comprobarla y, tras corregir un par de errores de metodología por el camino (que documento igual, porque forman parte del proceso), el resultado final ha sido más interesante de lo que esperaba: **no encontré gaps de telemetría, pero encontré otro problema que no había anticipado en absoluto.**

## ¿Qué es exactamente un "gap" de telemetría?

Prometheus funciona con un modelo *pull*: cada X segundos (`scrape_interval`, 15s en mi caso), se conecta a cada exporter y le pide sus métricas actuales. Si en el momento exacto de ese scrape el sistema está muy ocupado por ejemplo, procesando un pico de logs que satura CPU o I/O, el exporter puede tardar demasiado en responder, y Prometheus se queda sin datos para ese ciclo. Si esto se repite en varios ciclos seguidos, en una gráfica de Grafana se ve como una línea que se corta durante un tramo y vuelve a aparecer después: un hueco real, no solo una gráfica fea.

En un SOC/NOC, esto importa porque el gap suele coincidir con el peor momento posible: si un pico de CPU o un intento de intrusión genera el propio pico de logs que satura el sistema, te quedas ciego exactamente cuando más necesitabas visibilidad.

## Hipótesis

Cuando el host sufre un pico de carga de CPU/IO simultáneo a un aumento súbito de volumen de logs, Prometheus puede fallar en completar algunos ciclos de scrape a tiempo, generando huecos reales en las series temporales.

## Metodología: cómo reproducirlo tú mismo

En vez de mirar una gráfica y juzgar a ojo si "hay un hueco", usé tres señales objetivas de Prometheus, más una verificación cruzada del propio pipeline de logs (Promtail → Loki). Todo lo que sigue es literal puedes copiarlo y ejecutarlo en tu propio entorno.

### Las métricas de referencia

**`scrape_duration_seconds{job="node-exporter"}`** — Con esta métrica mediremos cuánto tarda cada ciclo de recolección.

**`up{job="node-exporter"}`** — vale `1` si el scrape tuvo éxito, `0` si falló.

**`promtail_read_lines_total{path="..."}`, `promtail_sent_entries_total`, `promtail_dropped_entries_total`** — cuántas líneas leyó, envió y descartó Promtail, para cruzar con el volumen real recibido en Loki.

### Instalación de la herramienta de carga de CPU/IO

```bash
sudo apt update && sudo apt install -y stress-ng
```

### El generador de ráfagas de log

```bash
sudo touch /var/log/synthetic-load.log
sudo chmod 666 /var/log/synthetic-load.log
```

```bash
nano ~/noc-soc/generate_log_burst.sh
```

```bash
#!/bin/bash
LOGFILE=/var/log/synthetic-load.log
DURATION=${1:-180}
RATE=${2:-100}
END=$((SECONDS + DURATION))

echo "Generando ~${RATE} líneas/seg durante ${DURATION}s..."

while [ $SECONDS -lt $END ]; do
  for i in $(seq 1 "$RATE"); do
    echo "$(date '+%Y-%m-%dT%H:%M:%S') synthetic-load INFO test-line-${RANDOM}" >> "$LOGFILE"
  done
  sleep 1
done

echo "Generación finalizada."
```

**Nota:** Es un script que simula que una aplicación está escribiendo muchísimas líneas de registro (logs) muy rápido, como si de repente tu servidor empezara a recibir miles de peticiones o errores. Se le indican dos números: cuántos segundos debe durar la prueba y cuántas líneas por segundo debe intentar escribir. El script se limita a escribir frases de relleno (test-line- seguido de un número aleatorio) en un archivo, una y otra vez, durante ese tiempo.

```bash
chmod +x ~/noc-soc/generate_log_burst.sh
```

### El script de captura de recursos

```bash
nano ~/noc-soc/capture_stats.sh
```

```bash
#!/bin/bash
# Captura automática de docker stats durante la prueba
# Uso: ./capture_stats.sh <nombre_archivo>
OUTPUT_FILE=${1:-"stats_$(date +%Y%m%d_%H%M%S).log"}

echo "Capturando stats cada 5 segundos. Presiona Ctrl+C para detener."
echo "=== INICIO CAPTURA $(date) ===" > "$OUTPUT_FILE"

while true; do
  echo "=== $(date '+%H:%M:%S') ===" >> "$OUTPUT_FILE"
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" >> "$OUTPUT_FILE"
  echo "---" >> "$OUTPUT_FILE"
  sleep 5
done
```

**Nota:** Este script no genera nada, solo observa. Cada cinco segundos le pregunta a Docker (la herramienta que aloja los distintos servicios del lab: Prometheus, Loki, Grafana, etc.) cuánta CPU, memoria y red está usando cada uno, y lo va apuntando en un archivo de texto. Es el equivalente a tener a alguien anotando cada pocos segundos "ahora mismo el motor va a tantas revoluciones", para poder revisar después si hubo algún momento de esfuerzo extremo.

```bash
chmod +x ~/noc-soc/capture_stats.sh
```

### El script de verificación de Promtail

Promtail solo expone la métrica `promtail_read_lines_total` para un archivo mientras detecta actividad reciente en él — si el archivo lleva un rato inactivo, la serie desaparece del todo en vez de quedarse en 0. Por eso el script incluye un pequeño "calentamiento" antes de cada snapshot inicial.

```bash
nano ~/noc-soc/verify_promtail.sh
```

```bash
#!/bin/bash
# verify_promtail.sh <nombre_del_snapshot>
LABEL=$1
FILE="/var/log/synthetic-load.log"

echo "=== Snapshot: $LABEL ($(date '+%H:%M:%S')) ===" | tee -a promtail_verificacion.log

READ=$(curl -s http://localhost:9080/metrics | grep "promtail_read_lines_total{path=\"$FILE\"}" | awk '{print $2}')
SENT=$(curl -s http://localhost:9080/metrics | grep 'promtail_sent_entries_total{host="loki:3100"}' | awk '{print $2}')
DROPPED_TOTAL=$(curl -s http://localhost:9080/metrics | grep "promtail_dropped_entries_total" | awk '{sum+=$2} END {print sum}')

echo "read_lines(mi archivo)=$READ  sent_entries(global)=$SENT  dropped_entries(global)=$DROPPED_TOTAL" | tee -a promtail_verificacion.log
```

**Nota:** Promtail es el componente que lee los logs del sistema y se los envía a Loki (donde quedan almacenados y consultables). Este script simplemente le pregunta a Promtail, en un instante concreto, tres cosas: cuántas líneas ha leído del archivo de prueba, cuántas ha conseguido enviar en total, y cuántas ha tenido que descartar por algún fallo. Lo ejecuto una vez antes de lanzar la ráfaga de logs y otra vez después; la diferencia entre ambos números es la carga real que se procesó en ese intervalo, y sirve para comprobar si Promtail perdió algo por el camino.

```bash
chmod +x ~/noc-soc/verify_promtail.sh
```

### Los cuatro niveles de prueba

| Nivel | CPU/IO (`stress-ng`) | Logs (`generate_log_burst.sh`) |
|---|---|---|
| 0 — Control | — | — |
| 1 — Ligero | — | 100 líneas/seg |
| 2 — Medio | `--cpu 2 --timeout 120s` | 500 líneas/seg |
| 3 — Alto | `--cpu 4 --io 2 --timeout 120s` | 2000 líneas/seg |

Para cada nivel, la secuencia con 2-3 terminales fue:

```bash
# Terminal 1 (durante todo el nivel)
./capture_stats.sh nivel_X_stats.log

# Terminal 2 (solo niveles 2-3)
stress-ng --cpu N --timeout 120s

# Terminal 3 (o Terminal 2 en niveles 0-1)
echo "warmup" | sudo tee -a /var/log/synthetic-load.log
sleep 5
./verify_promtail.sh nivel_X_antes
~/noc-soc/generate_log_burst.sh 120 <tasa>
./verify_promtail.sh nivel_X_despues
```

Y en Grafana Explore, tras cada nivel (ajustando el rango de tiempo a la ventana exacta de la prueba, y usando una query limpia por captura, sin acumular queries anteriores):

- Datasource Prometheus: `scrape_duration_seconds{job="node-exporter"}`, después `up{job="node-exporter"}`
- Datasource Loki: `{job="varlogs"} |= "synthetic-load"`

## Resultados

### Nivel 0 — Control

Sin carga sintética, la métrica `promtail_read_lines_total` para mi archivo directamente no aparece, comportamiento esperado ya que Promtail solo la expone mientras hay actividad reciente en el archivo. `scrape_duration_seconds` se mantuvo entre 0.02-0.12s, y `up` permaneció en `1` durante toda la ventana. En Loki, la query filtrada por `synthetic-load` devolvió 0 resultados (confirmando que no había contaminación de pruebas anteriores), y la query sin filtro mostró solo 3 líneas de actividad normal de fondo del sistema.

![](/assets/images/lab-noc-soc-carga-real/A/prueba_0.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_0_up.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_0_scrape.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_0_loki1.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_0_loki2.PNG)

### Nivel 1 — Ligero (100 líneas/seg)

| Métrica | Valor |
|---|---|
| Incremento `read_lines` | 9.600 líneas |
| Esperado (100 × 120s) | 12.000 líneas |
| % conseguido | 80% |
| Tasa real conseguida | ~80 líneas/seg |
| `dropped_entries` | 0 |
| Volumen confirmado en Loki | 9.60K (coincide con `read_lines`) |
| Pico `scrape_duration_seconds` | ~0.12s |
| `up` | Sin caídas |

![](/assets/images/lab-noc-soc-carga-real/A/prueba_1.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_1_up.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_1_scrape.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_1_loki.PNG)


### Nivel 2 — Medio (500 líneas/seg + `stress-ng --cpu 2`)

| Métrica | Valor |
|---|---|
| Incremento `read_lines` | 28.000 líneas |
| Esperado (500 × 120s) | 60.000 líneas |
| % conseguido | 46.7% |
| Tasa real conseguida | ~233 líneas/seg |
| `dropped_entries` | 0 |
| Volumen confirmado en Loki | 28K (coincide con `read_lines`) |
| Pico `scrape_duration_seconds` | ~0.05s |
| `up` | Sin caídas |

![](/assets/images/lab-noc-soc-carga-real/A/prueba_2.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_2_up.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_2_scrape.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_2_loki.PNG)

### Nivel 3 — Alto (2000 líneas/seg + `stress-ng --cpu 4 --io 2`)

| Métrica | Valor |
|---|---|
| Incremento `read_lines` | 38.000 líneas |
| Esperado (2000 × 120s) | 240.000 líneas |
| % conseguido | 15.8% |
| Tasa real conseguida | ~317 líneas/seg |
| `dropped_entries` | 0 |
| Volumen confirmado en Loki | 38K (coincide con `read_lines`) |
| Pico `scrape_duration_seconds` | ~0.04s |
| `up` | Sin caídas |

![](/assets/images/lab-noc-soc-carga-real/A/prueba_3.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_3_up.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_3_scrape.PNG)

![](/assets/images/lab-noc-soc-carga-real/A/prueba_3_loki.PNG)

## El hallazgo real: no fue el sistema, fue mi propio script de prueba

Antes de sacar ninguna conclusión sobre Prometheus o Loki, hay un patrón que salta a la vista en la tabla: **la tasa de logs realmente conseguida se queda muy por debajo de la configurada, y esa diferencia crece cuanto más agresiva es la tasa que pido.** Al 80% en el nivel ligero, cae al 46.7% en el medio, y se desploma al 15.8% en el alto.

La causa no está en Prometheus, ni en Promtail, ni en Loki — está en mi propio `generate_log_burst.sh`. El script escribe cada línea con una llamada `echo` individual dentro de un bucle `for`, y ese bucle interno (más la llamada `sleep 1`) tarda en ejecutarse más de un segundo real cuanto mayor es el número de líneas por iteración. El control de duración del script se basa en el contador `$SECONDS` de bash, que mide tiempo real transcurrido así que, en vez de completar exactamente 120 iteraciones de un segundo cada una, el script completa **cada vez menos iteraciones** a medida que cada una tarda más en escribirse: 96 iteraciones en el nivel 1, 56 en el nivel 2, solo 19 en el nivel 3.

Es decir: **nunca llegué a generar la carga de logs que creía estar generando.** El "nivel alto" de 2000 líneas/seg, en la práctica, entregó una carga real más parecida a 317 líneas/seg sostenidas, bastante menos agresiva de lo que el diseño del experimento pretendía.

## Lo que sí puedo afirmar con los datos que tengo

**No hubo pérdida de logs en ningún nivel.** En los tres niveles con carga, el incremento de `promtail_read_lines_total` coincide casi exactamente con el volumen total confirmado en Loki (9.600↔9.60K, 28.000↔28K, 38.000↔38K), y `promtail_dropped_entries_total` se mantuvo en 0 durante todo el experimento. Lo que Promtail leyó, Loki lo recibió sin excepciones, en las tres intensidades probadas.

**No hubo caídas de scrape en Prometheus.** `up{job="node-exporter"}` permaneció en `1` durante las cuatro ventanas de prueba, sin ninguna caída a `0`. Y `scrape_duration_seconds` se mantuvo en el rango de milisegundos esperado (0.02-0.12s) en todos los niveles de hecho, curiosamente, los picos más altos aparecieron en el nivel 0 (control) y el nivel 1 (el más ligero), no en el nivel 3 (el más intenso), lo cual no encaja con la hipótesis de degradación progresiva y probablemente sea ruido normal de muestra pequeña más que una señal real.

**El experimento no llegó a probar lo que pretendía probar.** Con la carga real conseguida limitada a un máximo de ~317 líneas/seg (muy lejos de las 2000 nominales del nivel 3), no puedo afirmar que mi stack aguante picos de carga verdaderamente agresivos sin gaps, solo puedo afirmar que aguanta sin problema los niveles de carga que realmente logré generar, que fueron más modestos de lo planeado.

## Por qué prefiero contar esto así, y no maquillarlo

Podría haber presentado la tabla de resultados sin más comentario, con una conclusión bonita tipo "mi lab aguanta 2000 líneas/segundo sin gaps". Sería falso, el sistema nunca llegó a recibir esa carga. El hallazgo real de este experimento no es sobre Prometheus ni sobre Loki, es sobre **la importancia de verificar que la carga que crees estar aplicando es la que realmente se está aplicando**, algo tan básico como fácil de pasar por alto cuando confías en el propio script sin instrumentarlo. Es, con diferencia, la lección más valiosa que me llevo de todo el experimento más que cualquier cifra de `scrape_duration_seconds`.

## Próximos pasos

Antes de repetir este experimento con una carga real más agresiva, necesito reescribir `generate_log_burst.sh` para que escriba en lotes (por ejemplo, construyendo el bloque de líneas en memoria y volcándolo con una sola escritura al archivo, en vez de cientos de llamadas `echo` individuales) así la tasa configurada se acercará de verdad a la tasa real conseguida, y podré poner a prueba mi lab con la intensidad que originalmente planteaba el comentario.

## Corrección de carga real

Modificaciones en el fichero generate_log_burst.sh:

```bash
#!/bin/bash
# generate_log_burst.sh <duracion_segundos> <lineas_por_segundo>
# Versión optimizada: sin fork de 'date' por línea, escritura por lotes

LOGFILE=/var/log/synthetic-load.log
DURATION=${1:-60}
RATE=${2:-100}
END=$((SECONDS + DURATION))

echo "Generando ~${RATE} líneas/seg durante ${DURATION}s (escritura por lotes)..."

while [ $SECONDS -lt $END ]; do
  printf -v TS '%(%Y-%m-%dT%H:%M:%S)T' -1
  {
    for ((i=0; i<RATE; i++)); do
      printf '%s synthetic-load INFO test-line-%s\n' "$TS" "$RANDOM"
    done
  } >> "$LOGFILE"
  sleep 1
done

echo "Generación finalizada."
```

**Nota:** Es necesario verificar que bash en WSL2 soporta **printf -v TS '%(...)T'** (es necesario bash 4.2 minimo). La version de bash podemos comprobarla con **bash --version**, si contamos con la version requerida, pasaremos a realizar unas pruebas de calibracion para comprobar si los datos son correctos y despues realizar de nuevo las pruebas de carga.


## Segunda ronda: repitiendo las pruebas con el script corregido

Con `generate_log_burst.sh` reescrito para escribir en lotes (un solo `printf -v` para la marca de tiempo por segundo, y un único bloque de líneas volcado de una vez con `>>`, en lugar de cientos de `echo` individuales), tocaba comprobar si esta vez sí conseguía acercarme a las tasas nominales antes de sacar ninguna conclusión sobre el stack de monitorización. `bash --version` en mi WSL2 confirmó soporte de sobra para `printf -v TS '%(%Y-%m-%dT%H:%M:%S)T' -1` (bash 5.x), así que repetí los cuatro niveles exactamente con la misma metodología del intento anterior: `stress-ng` en una terminal, `capture_stats.sh` en otra, y la secuencia warmup → snapshot "antes" → `generate_log_burst.sh` → snapshot "después" en una tercera, cruzando cada resultado con Grafana Explore (Prometheus para `scrape_duration_seconds` y `up`, Loki para el volumen real recibido).

### Nivel 0 — Control (repetición)

Igual que en la primera ronda: sin carga sintética, `promtail_read_lines_total` para mi archivo no aparece (comportamiento esperado, la serie solo existe mientras hay actividad reciente), y `sent_entries_total` global apenas se mueve por el ruido de fondo del sistema (546 → 559 en casi cuatro minutos). En Loki, la query filtrada por `synthetic-load` no devolvió resultados, y la query sin filtro solo mostró actividad normal de red del host. `scrape_duration_seconds` se mantuvo en el rango de milisegundos habitual (0.02–0.12s, con un pico aislado de 1.2s al arrancar la ventana de Explore, probablemente el primer scrape tras abrir el panel) y `up` no registró ninguna caída. Nada nuevo aquí, tal y como cabía esperar de un control.

![](/assets/images/lab-noc-soc-carga-real/B/prueba_0.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_0_up.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_0_scrape.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_0_loki.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_0_lok2.PNG)

### Nivel 1 — Ligero corregido (100 líneas/seg objetivo)

| Métrica | Valor |
|---|---|
| Incremento `read_lines` | 11.600 líneas |
| Esperado (100 × 120s) | 12.000 líneas |
| % conseguido | **96.7%** |
| Tasa real conseguida | ~96.7 líneas/seg |
| `dropped_entries` | 0 |
| Volumen confirmado en Loki | 11.6K (coincide con `read_lines`) |
| Rango `scrape_duration_seconds` | 0.015–0.055s |
| `up` | Sin caídas |

![](/assets/images/lab-noc-soc-carga-real/B/prueba_1.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_1_up.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_1_scrape.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_1_loki.PNG)

Frente al 80% de la primera ronda, el script corregido se queda a menos de un 3.5% del objetivo. La gráfica de volumen en Loki muestra barras consistentes en torno a las 50 líneas por bucket de 10s, sin los huecos irregulares que delataban al bucle antiguo.

### Nivel 2 — Medio corregido (500 líneas/seg objetivo + `stress-ng --cpu 2`)

| Métrica | Valor |
|---|---|
| Incremento `read_lines` | 58.000 líneas |
| Esperado (500 × 120s) | 60.000 líneas |
| % conseguido | **96.7%** |
| Tasa real conseguida | ~483 líneas/seg |
| `dropped_entries` | 0 |
| Volumen confirmado en Loki | 58K (coincide con `read_lines`) |
| Rango `scrape_duration_seconds` | 0.015–0.0325s |
| `up` | Sin caídas |

![](/assets/images/lab-noc-soc-carga-real/B/prueba_2.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_2_up.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_2_scrape.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_2_loki.PNG)

Aquí está el salto más claro respecto al intento anterior: del 46.7% conseguido con el script antiguo al 96.7% con el corregido, con `stress-ng --cpu 2` corriendo en paralelo durante toda la ventana. Sí aparecen dos picos discretos en `scrape_duration_seconds` (~0.03s) que coinciden aproximadamente con el arranque del burst de logs y con el tramo central de `stress-ng`, pero siguen siendo del mismo orden de magnitud que el ruido del nivel 0.

### Nivel 3 — Alto corregido (2000 líneas/seg objetivo + `stress-ng --cpu 4 --io 2`)

| Métrica | Valor |
|---|---|
| Incremento `read_lines` | 216.000 líneas |
| Esperado (2000 × 120s) | 240.000 líneas |
| % conseguido | **90%** |
| Tasa real conseguida | ~1.800 líneas/seg |
| `dropped_entries` | 0 |
| Volumen confirmado en Loki | 216K (coincide con `read_lines`) |
| Pico `scrape_duration_seconds` | **~0.25s** |
| `up` | Sin caídas |

![](/assets/images/lab-noc-soc-carga-real/B/prueba_3.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_3_up.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_3_scrape.PNG)

![](/assets/images/lab-noc-soc-carga-real/B/prueba_3_loki.PNG)

Este es el nivel que por fin se acerca a lo que el comentario original planteaba: casi 1.800 líneas/seg reales sostenidas, combinadas con `stress-ng --cpu 4 --io 2`. Y aquí, por primera vez en las dos rondas, `scrape_duration_seconds` deja de moverse en el rango habitual de 0.015–0.055s: hay un pico claro de **~0.25s** alrededor de las 19:10:40, justo en mitad de la ventana en la que coinciden el stress de CPU/IO y el tramo más denso del burst de logs. El resto de la ventana vuelve a caer a valores de 0.02–0.05s.

## Comparativa entre rondas

| Nivel | % conseguido (script antiguo) | % conseguido (script corregido) |
|---|---|---|
| 1 — Ligero | 80% | 96.7% |
| 2 — Medio | 46.7% | 96.7% |
| 3 — Alto | 15.8% | 90% |

La corrección del generador de carga no fue un detalle menor: cambió por completo lo que el experimento era capaz de medir. Con el script antiguo, el "nivel alto" nunca superó los ~317 líneas/seg reales; con el corregido, llega a ~1.800 líneas/seg, casi seis veces más carga real aplicada al mismo hardware.

## Análisis: esta vez sí apareció una señal real

Con carga real mucho más cercana al objetivo, las conclusiones de fondo de la primera ronda se mantienen en los niveles 1 y 2: **cero líneas perdidas** en todo el pipeline Promtail → Loki (`dropped_entries_total` en 0 en los tres niveles con carga, y el volumen en Loki coincide casi al dígito con `read_lines` en cada uno: 11.6K, 58K y 216K), y **ninguna caída de scrape** (`up{job="node-exporter"}` se mantuvo en `1` durante las cuatro ventanas, incluida la de nivel 3).

Pero el nivel 3 corregido sí deja una señal que no había aparecido en ningún momento de la primera ronda: un pico de `scrape_duration_seconds` unas 5–16 veces por encima del rango habitual, ubicado exactamente en el tramo donde coinciden `stress-ng --cpu 4 --io 2` y el pico de escritura de logs. No es un fallo de scrape ni un hueco en la serie —el pico sigue estando muy por debajo de cualquier `scrape_timeout` razonable, por eso `up` no se movió— pero es la primera evidencia medible, reproducible y localizada en el tiempo de que las tareas de recolección sí compiten por recursos cuando la carga real se acerca a la que el comentario original planteaba.

## Qué significa esto para la hipótesis original

La hipótesis decía que un pico de CPU/IO simultáneo a un aumento de logs podía hacer que Prometheus fallara en completar scrapes a tiempo, generando gaps reales. Con la carga que finalmente conseguí aplicar (90–97% del objetivo nominal, hasta ~1.800 líneas/seg reales + `stress-ng --cpu 4 --io 2`), el resultado es matizado:

- **No hay gaps reales en este hardware y esta configuración**, ni con la carga más agresiva que logré generar.
- **Pero sí hay una degradación medible en la latencia de scrape**, justo en la dirección que predecía la hipótesis, y justo en el tramo de mayor contención. El sistema tiene margen de sobra respecto al umbral de fallo, pero el margen se está reduciendo de forma visible bajo carga real.

Es la diferencia entre "el sistema no se satura" y "el sistema no se satura *todavía*, con esta carga y en este hardware". Extrapolando la tendencia del nivel 3, es razonable esperar que una carga sostenida mayor, un `scrape_timeout` más ajustado, o una ventana de contención más prolongada sí lleguen a producir un gap real.

## Conclusiones finales

**La corrección de metodología fue la que realmente movió la aguja.** Pasar de escribir línea a línea con `echo` a escribir por lotes con `printf` cambió el porcentaje de carga real conseguida del 15.8%–80% al 90%–96.7%, dependiendo del nivel.

**El pipeline de logs sigue sin perder datos**, incluso con ~1.800 líneas/seg reales sostenidas combinadas con estrés de CPU e IO: `dropped_entries_total` en 0 y el volumen en Loki cuadra con lo leído por Promtail en los tres niveles.

**Prometheus tampoco perdió ningún scrape** (`up` en 1 durante toda la prueba), pero por primera vez apareció una señal de degradación real y localizada en `scrape_duration_seconds` durante el nivel de mayor contención, la primera evidencia concreta de que el comentario original apuntaba a algo real, aunque en mi lab de 8GB el sistema todavía tenga margen antes de que esa degradación se convierta en un hueco visible en las gráficas.

## Próximos pasos
 
Antes de dar el experimento por cerrado, quiero llevarlo un paso más allá para intentar cruzar el umbral que en esta ronda no llegué a cruzar:
 
- Repetir el nivel 3 con una tasa aún más agresiva (o sostenida durante más tiempo) para ver si el pico de `scrape_duration_seconds` crece lo suficiente como para provocar un fallo de scrape real.
- Reducir `scrape_timeout` en la configuración de Prometheus para bajar artificialmente el umbral de fallo y comprobar si con eso sí se hace visible un gap con la carga actual.
- Repetir el nivel 3 varias veces para confirmar que el pico de 0.25s es un patrón reproducible y no ruido de una sola muestra.

Pero antes de seguir subiendo la carga sobre el mismo stack, el siguiente post va a cambiar de terreno: voy a sustituir Prometheus por VictoriaMetrics y Promtail por Alloy en el lab, y repetir exactamente esta misma batería de pruebas — los mismos cuatro niveles, los mismos scripts, las métricas equivalentes — para comprobar si el comportamiento bajo carga real se mantiene, mejora o empeora con ese cambio de stack. Si el pico de `scrape_duration_seconds` del nivel 3 era una particularidad de Prometheus/Promtail o un límite más general del hardware de 8GB, es algo que solo se puede responder repitiendo el experimento con otras herramientas — y es exactamente lo que toca hacer a continuación.