---
title: "Lab NOC/SOC cambios de stack: VictoriaMetrics y Alloy"
date: 2026-07-22T:10:00:00+02:00
categories: [Homelab, Monitorización, DevOps]
excerpt: "Promtail llegó a su fin de soporte el pasado marzo, así que además de curiosidad técnica ahora tengo una razón de peso para el cambio. Repito la misma batería de pruebas de carga de los dos posts anteriores, pero esta vez con VictoriaMetrics y Alloy — y el resultado del nivel más agresivo no es lo que esperaba."
card_image: /assets/images/cards/lab-noc-soc-modificado.png
---

En los dos posts anteriores de esta serie sometí mi [lab NOC/SOC en 8GB de RAM](/homelab/monitorización/devops/2026/07/11/lab-noc-soc.html) a una batería de pruebas de carga real para comprobar si aparecían gaps de telemetría cuando coincidían picos de logs con el scraping de Prometheus. La conclusión, tras corregir un error de metodología por el camino, fue que **no hubo huecos ni pérdida de datos, pero sí una señal medible de degradación de latencia** en el nivel más agresivo (~1.800 líneas/seg reales + estrés de CPU/IO), con un pico de `scrape_duration_seconds` de ~0.25s.

Ese hallazgo dejaba una pregunta abierta: ¿esa degradación es una particularidad de Prometheus y Promtail, o es un límite más general del hardware de 8GB que se repetiría con cualquier stack? Y además de la curiosidad, ahora hay un motivo práctico para el cambio: **Promtail dejó de tener soporte comercial el 28 de febrero de 2026 y llegó a su fin de vida (EOL) el 2 de marzo de 2026.** Todo el desarrollo futuro del lado de recolección de logs se centra en Grafana Alloy, así que este cambio tocaba tarde o temprano.

## Hipótesis

Sustituyendo Prometheus por VictoriaMetrics (compatible con PromQL y con el modelo de scraping de Prometheus) y Promtail por Grafana Alloy (su sucesor oficial), y repitiendo los mismos cuatro niveles de carga sobre el mismo hardware, el comportamiento observado sin pérdida de logs, sin caídas de scrape, degradación de latencia visible solo en el nivel más agresivo— se mantendría aproximadamente igual, porque el cuello de botella real estaría en los recursos del host compartidos, no en la implementación concreta del recolector.

Spoiler: los datos no le dan la razón a esta hipótesis, y es la parte más interesante del post.

## Qué cambia y qué se mantiene igual

**Se mantiene exactamente igual:** el hardware, el límite de 8GB de RAM, los cuatro niveles de carga con las mismas tasas objetivo, `generate_log_burst.sh` (versión corregida por lotes) y `capture_stats.sh` sin tocar una línea, y la forma de generar carga de CPU/IO con `stress-ng`.

**Cambia:** el motor de métricas (Prometheus → VictoriaMetrics), el recolector de logs (Promtail → Grafana Alloy), el script de verificación (`verify_promtail.sh` → `verify_alloy.sh`, con nombres de métrica distintos), y el datasource de Grafana para métricas.

## Migración: respetando la organización por stacks

Prometheus se sustituye dentro de `~/noc-soc/monitoring/docker-compose.yml` (donde ya conviven Grafana, node-exporter y cAdvisor), y Promtail se sustituye dentro de `~/noc-soc/logging/docker-compose.yml` (donde ya vive Loki). 

### Sustituyendo Prometheus por VictoriaMetrics en `~/noc-soc/monitoring/`

```bash
cd ~/noc-soc/monitoring
nano docker-compose.yml
```

Elimino el bloque `prometheus` y lo sustituyo por `victoriametrics`, dejando Grafana, node-exporter y cAdvisor tal cual estaban:

```yaml
services:
  victoriametrics:
    image: victoriametrics/victoria-metrics:latest
    ports: ["8428:8428"]
    volumes:
      - ./victoriametrics.yml:/etc/victoriametrics/scrape.yml
      - victoriametrics-data:/storage
    command:
      - "-storageDataPath=/storage"
      - "-promscrape.config=/etc/victoriametrics/scrape.yml"
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports: ["3000:3000"]
    volumes:
      - grafana-storage:/var/lib/grafana
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    ports: ["9100:9100"]
    restart: unless-stopped

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports: ["8081:8080"]
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    restart: unless-stopped

networks:
  default:
    name: noc-soc-shared
    external: true

volumes:
  grafana-storage:
  victoriametrics-data:
```

El bloque `networks` que apunta a `noc-soc-shared` ya estaba en este fichero desde que conecté Grafana con Loki en la fase 5 del post de arranque, así que no cambia nada ahí. Sí que hay que recordar la lección de la fase 3 del primer post: `victoriametrics-data` y `grafana-storage` deben quedar montados explícitamente en su servicio, no solo declarados al final del fichero, o cualquier recreación del contenedor se lleva por delante los datos.

Creo el fichero de scrape aparte, en la misma carpeta, reutilizando casi tal cual el `prometheus.yml` que ya tenía (mismo formato `scrape_configs`, solo quito el job que apuntaba al propio Prometheus en `localhost:9090`, que ya no aplica):

```yaml
scrape_configs:
  - job_name: 'node-exporter'
    static_configs: [{targets: ['node-exporter:9100']}]
  - job_name: 'cadvisor'
    static_configs: [{targets: ['cadvisor:8080']}]
```

```bash
docker compose up -d
docker compose ps
```

```
[+] up 5/5
✔ Image victoriametrics/victoria-metrics:latest  Pulled
✔ Volume monitoring_victoriametrics-data         Created
✔ Container monitoring-node-exporter-1           Running
✔ Container monitoring-cadvisor-1                Running
✔ Container monitoring-grafana-1                 Running
✔ Container monitoring-victoriametrics-1         Started
```

VictoriaMetrics trae su propia UI en `http://localhost:8428/target` para confirmar targets, y en Grafana el datasource pasa de tipo Prometheus apuntando a `http://prometheus:9090` a tipo Prometheus apuntando a `http://victoriametrics:8428` — mismo tipo de datasource, porque VictoriaMetrics expone una API compatible con Prometheus.

![victoriametrics target](/assets/images/lab-noc-soc-modificado/vm_target.PNG)

### Sustituyendo Promtail por Alloy en `~/noc-soc/logging/`

```bash
cd ~/noc-soc/logging
nano docker-compose.yml
```

```yaml
services:
  loki:
    image: grafana/loki:latest
    ports: ["3100:3100"]
    restart: unless-stopped

  alloy:
    image: grafana/alloy:latest
    ports: ["12345:12345"]
    volumes:
      - /var/log:/var/log:ro
      - ./alloy-config.alloy:/etc/alloy/config.alloy
    command: run --server.http.listen-addr=0.0.0.0:12345 /etc/alloy/config.alloy
    restart: unless-stopped

networks:
  default:
    name: noc-soc-shared
    external: true
```
Y el `alloy-config.alloy` (lenguaje River en vez del YAML de Promtail), en la misma carpeta, equivalente al `promtail-config.yml` que leía `/var/log/*.log` y lo enviaba a Loki:

```
local.file_match "varlogs" {
  path_targets = [{
    __address__ = "localhost",
    __path__    = "/var/log/*.log",
    job         = "varlogs",
  }]
}

loki.source.file "varlogs" {
  targets    = local.file_match.varlogs.targets
  forward_to = [loki.write.default.receiver]
}

loki.write "default" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}
```

Grafana Labs ofrece una herramienta de conversión (`alloy convert --source-format=promtail`) para traducir configuraciones de Promtail a River automáticamente, aunque avisan de que es "best effort" — para un caso tan simple como este, fue más rápido escribirlo a mano partiendo del `promtail-config.yml` original.

## Troubleshooting: un problema que Docker Compose no resuelve solo

Antes de dar la migración por cerrada, hay un detalle que conviene comprobar y que es fácil pasar por alto: al editar `docker-compose.yml` para quitar el bloque `promtail` y añadir `alloy`, un simple `docker compose up -d` **no detiene ni elimina el contenedor de Promtail**. Docker Compose solo crea o actualiza los servicios que sigan declarados en el fichero; el contenedor de un servicio que ya no aparece se queda huérfano y sigue corriendo, con Compose limitándose a avisar de su existencia sin tocarlo.

Esto es más grave de lo que parece en un lab de 8GB: significa que Promtail y Alloy podrían quedar corriendo **a la vez**, ambos leyendo los mismos archivos de `/var/log` y ambos escribiendo en Loki, duplicando el consumo de CPU/RAM justo en la fase que se supone iba a liberar recursos, y contaminando el volumen de Loki con entradas duplicadas sin que salte ningún error visible.

```bash
cd ~/noc-soc/logging
docker compose ps
```

Si `promtail` sigue apareciendo como `Up`, hay que retirarlo explícitamente:

```bash
docker compose up -d --remove-orphans
```

O, si se prefiere hacerlo a mano y limpiar también la imagen:

```bash
docker stop promtail
docker rm promtail
docker image rm grafana/promtail:latest
```

Y de paso, borrar el `promtail-config.yml` que ya no se usa, para no dejar en la carpeta un fichero de configuración de un servicio que ya no existe y que podría confundir en una revisión futura.

## Ajuste necesario en `verify_alloy.sh`: los nombres de métrica cambian

Alloy no expone las métricas con los mismos nombres que Promtail. Comprobé las equivalencias reales contra el endpoint `/metrics`:

| Métrica en Promtail | Métrica confirmada en Alloy |
|---|---|
| `promtail_read_lines_total` | `loki_source_file_read_lines_total` |
| `promtail_sent_entries_total` | `loki_write_sent_entries_total` |
| `promtail_dropped_entries_total` | `loki_write_dropped_entries_total` |

Con una diferencia importante en el formato: en Alloy, la etiqueta `path` no va justo después de la llave de apertura como en Promtail (`{path="..."`), sino detrás de `component_id` y `component_path`. El `grep` tiene que buscar el valor en cualquier posición:

```bash
nano ~/noc-soc/verify_alloy.sh
```

```bash
#!/bin/bash
# verify_alloy.sh <nombre_del_snapshot>
LABEL=$1
FILE="/var/log/synthetic-load.log"

echo "=== Snapshot: $LABEL ($(date '+%H:%M:%S')) ===" | tee -a alloy_verificacion.log

READ=$(curl -s http://localhost:12345/metrics | grep "^loki_source_file_read_lines_total{.*path=\"$FILE\"" | awk '{print $2}')
SENT=$(curl -s http://localhost:12345/metrics | grep "^loki_write_sent_entries_total" | awk '{sum+=$2} END {print sum}')
DROPPED_TOTAL=$(curl -s http://localhost:12345/metrics | grep "^loki_write_dropped_entries_total" | awk '{sum+=$2} END {print sum}')

echo "read_lines(mi archivo)=$READ  sent_entries(global)=$SENT  dropped_entries(global)=$DROPPED_TOTAL" | tee -a alloy_verificacion.log
```

```bash
chmod +x ~/noc-soc/verify_alloy.sh
```

`sent_entries_total` sale en Alloy en una única línea (`loki.write.default`), y `dropped_entries_total` sí viene desglosado en cinco líneas por `reason` (`ingester_error`, `line_too_long`, `queue_is_full`, `rate_limited`, `stream_limited`) — el mismo patrón que tenía Promtail, así que el `awk '{sum+=$2}'` las suma correctamente.

## Metodología: la misma de siempre

| Nivel | CPU/IO (`stress-ng`) | Logs (`generate_log_burst.sh`) |
|---|---|---|
| 0 — Control | — | — |
| 1 — Ligero | — | 100 líneas/seg |
| 2 — Medio | `--cpu 2 --timeout 120s` | 500 líneas/seg |
| 3 — Alto | `--cpu 4 --io 2 --timeout 120s` | 2000 líneas/seg |

## Resultados

### Nivel 0 — Control

| Métrica | Valor |
|---|---|
| `read_lines` antes / después | 466.776 → 466.776 (sin incremento) |
| `sent_entries` antes / después | 478.124 → 478.126 (+2, ruido de fondo) |
| `dropped_entries` | 0 |
| Rango `scrape_duration_seconds` | ~0.01–0.097s |
| `up` | Sin caídas |
| Loki (sin filtro) | Solo actividad de fondo (`CRON`, `pam_unix`), sin `synthetic-load` |

![preparación prueba 0](/assets/images/lab-noc-soc-modificado/vm_0.PNG)

![prueba 0 up](/assets/images/lab-noc-soc-modificado/vm_0_up.PNG)

![prueba 0 scrape](/assets/images/lab-noc-soc-modificado/vm_0_scrape.PNG)

![prueba 0 loki](/assets/images/lab-noc-soc-modificado/vm_0_loki.PNG)

### Nivel 1 — Ligero (100 líneas/seg objetivo)

| Métrica | Valor |
|---|---|
| Incremento `read_lines` | 11.100 líneas |
| Esperado (100 × 120s) | 12.000 líneas |
| % conseguido | **92.5%** |
| Tasa real conseguida | ~92.5 líneas/seg |
| `dropped_entries` | 0 |
| Volumen confirmado en Loki | 11.1K (coincide con `read_lines`) |
| Rango `scrape_duration_seconds` | 0.0125–0.0325s |
| `up` | Sin caídas |

![preparación prueba 1](/assets/images/lab-noc-soc-modificado/vm_1.PNG)

![prueba 1 up](/assets/images/lab-noc-soc-modificado/vm_1_up.PNG)

![prueba 1 scrape](/assets/images/lab-noc-soc-modificado/vm_1_scrape.PNG)

![prueba 1 loki](/assets/images/lab-noc-soc-modificado/vm_1_loki.PNG)

### Nivel 2 — Medio (500 líneas/seg objetivo + `stress-ng --cpu 2`)

| Métrica | Valor |
|---|---|
| Incremento `read_lines` | 55.500 líneas |
| Esperado (500 × 120s) | 60.000 líneas |
| % conseguido | **92.5%** |
| Tasa real conseguida | ~462.5 líneas/seg |
| `dropped_entries` | 0 |
| Volumen confirmado en Loki | 55.5K (coincide con `read_lines`) |
| Rango `scrape_duration_seconds` | 0.012–0.026s |
| `up` | Sin caídas |

![preparacion prueba 2](/assets/images/lab-noc-soc-modificado/vm_2.PNG)

![prueba 2 up](/assets/images/lab-noc-soc-modificado/vm_2_up.PNG)

![prueba 2 scrape](/assets/images/lab-noc-soc-modificado/vm_2_scrape.PNG)

![prueba 2 loki](/assets/images/lab-noc-soc-modificado/vm_2_loki.PNG)

### Nivel 3 — Alto (2000 líneas/seg objetivo + `stress-ng --cpu 4 --io 2`)

| Métrica | Valor |
|---|---|
| Incremento `read_lines` | 208.000 líneas |
| Esperado (2000 × 120s) | 240.000 líneas |
| % conseguido | **86.7%** |
| Tasa real conseguida | ~1.733 líneas/seg |
| `dropped_entries` | 0 |
| Volumen confirmado en Loki | 208K (coincide con `read_lines`) |
| Rango `scrape_duration_seconds` | **0.015–0.04s** |
| `up` | Sin caídas |

![preparacion prueba 3](/assets/images/lab-noc-soc-modificado/vm_3.PNG)

![prueba 3 up](/assets/images/lab-noc-soc-modificado/vm_3_up.PNG)

![prueba 3 scrape](/assets/images/lab-noc-soc-modificado/vm_3_scrape.PNG)

![prueba 3 loki](/assets/images/lab-noc-soc-modificado/vm_3_loki.PNG)

En los tres niveles con carga, `read_lines` y `sent_entries` de Alloy suben exactamente lo mismo (11.100, 55.500 y 208.000 respectivamente), y el volumen en Loki coincide al dígito en cada caso. Igual que con Promtail: cero logs perdidos en todo el rango de carga probado.

## Comparativa: Promtail/Prometheus frente a Alloy/VictoriaMetrics

| Nivel | % conseguido (Promtail) | % conseguido (Alloy) | Pico `scrape_duration_seconds` (Prometheus) | Pico `scrape_duration_seconds` (VictoriaMetrics) | `dropped_entries` (ambos) |
|---|---|---|---|---|---|
| 0 — Control | — | — | 0.02–0.12s (pico aislado 1.2s) | 0.01–0.097s | 0 |
| 1 — Ligero | 96.7% | 92.5% | 0.055s | 0.0325s | 0 |
| 2 — Medio | 96.7% | 92.5% | 0.0325s | 0.026s | 0 |
| 3 — Alto | 90% | 86.7% | **0.25s** | **0.04s** | 0 |

Dos lecturas de esta tabla, y no tienen el mismo peso:

**La diferencia en % conseguido (92.5% / 92.5% / 86.7% frente a 96.7% / 96.7% / 90%) es sistemáticamente algo más baja con Alloy, pero no le doy demasiada importancia.** `generate_log_burst.sh` es el mismo script en ambas rondas y su rendimiento depende del reloj real del sistema y de cuánta CPU le queda libre en cada ejecución una diferencia de 3-4 puntos porcentuales, igual de consistente en los tres niveles, encaja tanto con variabilidad normal de ejecución como con que el propio contenedor de Alloy consuma algo más de recursos de fondo que Promtail. No es un dato que pueda separar de forma limpia con una sola ejecución por nivel.

**Lo que sí es una diferencia real y no me esperaba: el pico de `scrape_duration_seconds` en el nivel 3 es seis veces menor con VictoriaMetrics (0.04s) que con Prometheus (0.25s), a pesar de que la carga real conseguida es prácticamente la misma (~1.733 líneas/seg frente a ~1.800, ambas con `stress-ng --cpu 4 --io 2`).** Esto contradice directamente mi hipótesis de partida. Si el cuello de botella fuera puramente el hardware compartido de 8GB, esperaría ver una degradación de magnitud similar en ambos stacks bajo la misma carga y no es lo que ocurre. La señal apunta a que la degradación de latencia que documenté en el post anterior era, al menos en parte, una particularidad de cómo Prometheus (o su interacción concreta con Promtail y el resto de contenedores del lab) gestiona el scraping bajo contención, no un límite general e inevitable del hardware.

## Conclusiones

**Sin pérdida de logs y sin caídas de scrape con ningún stack**, en los cuatro niveles probados con ambas combinaciones. Esa parte de la conclusión de los dos posts anteriores se sostiene igual con VictoriaMetrics y Alloy.

**La hipótesis de partida de este post no se cumple.** Esperaba un comportamiento similar entre stacks porque asumía que el límite estaba en el hardware compartido; en su lugar, encontré que VictoriaMetrics mantiene la latencia de scrape muchísimo más contenida que Prometheus bajo exactamente la misma carga real. Es el tipo de resultado que vale más que uno que confirme lo que ya esperaba: cambia la pregunta de "¿aguanta mi lab la carga?" a "¿qué hace Prometheus distinto de VictoriaMetrics en ese momento concreto?" — y esa es una pregunta que este experimento, tal como está diseñado, no puede responder por sí solo.

**Con una sola ejecución por nivel y por stack, esto es una observación, no una ley.** Antes de escribirlo como una conclusión firme sobre qué motor de métricas "es mejor", necesitaría repetir el nivel 3 varias veces en ambos stacks para descartar que ese pico de 0.25s en Prometheus fuera una anomalía puntual de esa ejecución concreta y no un patrón reproducible.
