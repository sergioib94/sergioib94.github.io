---
title: "Lab NOC/SOC: backups con Restic (II)"
date: 2026-08-04T12:27:00+02:00
categories: [Homelab, DevOps, Backups]
excerpt: "La Parte 1 dejó el mecanismo montado, probado con restauraciones parciales y en caliente, con troubleshooting real de por medio. Quedaba la prueba que de verdad importa: parar los servicios, borrar los volúmenes originales de raíz, y levantar el lab entero desde cero solo con lo que hay en el repositorio de Restic. Este post es esa prueba, componente a componente, con la hipótesis de partida y la tabla de resultados real."
card_image: /assets/images/cards/lab-noc-soc-restic-2.png
---

La [Parte 1](/lab-noc-soc-restic-1) dejó Restic instalado, el script de backup funcionando contra dos repositorios (local y Backblaze B2), la retención aplicada, y una restauración real puesta a prueba — pero en caliente, con los contenedores todavía corriendo, y de forma parcial, sin haber destruido nunca el estado original. Quedaba pendiente la prueba de fondo: destruir el lab de verdad, parar los servicios, borrar los volúmenes originales, y levantar todo de cero únicamente a partir de lo que hay en el repositorio. Este post es esa prueba, con el troubleshooting real que salió al hacerla.

## Preparación: dejar los dashboards en condiciones de servir de baseline

Antes de poder medir nada hacía falta algo que en su momento no tenía: dashboards de Grafana reales. La restauración en caliente de la Parte 1 se solapó con la pérdida del propio contenido de Grafana, así que el primer paso de esta Parte 2 no fue destruir nada, fue reconstruir el panel de control que luego iba a servir de evidencia antes/después.

Montar los dashboards (Docker Containers, Node Exporter, Logs, Overview) sacó a la luz tres problemas de fondo que merece la pena documentar, porque sin arreglarlos el baseline habría sido tan poco fiable como no tener baseline en absoluto.

### El backup llevaba días fallando sin que nadie se diera cuenta

El panel de "último backup" marcaba FALLO de forma persistente. La causa, una vez aislada con la salida completa del script:

```
error: lstat /var/lib/docker/volumes/monitoring_victoriametrics-data/_data/data/small/2026_08/18C9996AA117CAF7: no such file or directory
[...]
Warning: at least one source file could not be read
```

VictoriaMetrics usa un motor tipo LSM-tree que fusiona y borra ficheros pequeños en segundo plano de forma continua, incluso con el contenedor sirviendo tráfico normal. Restic escanea el directorio como una foto fija: si entre listar un fichero e intentar leerlo VictoriaMetrics ya lo fusionó y borró, Restic se encuentra un `lstat` sobre algo que ha dejado de existir. Es una condición de carrera inherente a hacer backup en caliente de un motor de series temporales, no un fallo de Restic ni del script.

El snapshot se generaba igualmente (`85fa74ad saved`, `a8b81c7c saved`), con exit code 3 — "completado con avisos", distinto de un fallo real. El script, sin embargo, trataba cualquier código de salida distinto de 0 como fallo total:

```bash
restic backup "${VOLUME_PATHS[@]}" --tag noc-soc --tag "$(date +%Y%m%d)" \
  || { echo "FALLO en restic backup"; BACKUP_OK=0; }
```

Arreglo, distinguiendo el exit code 3 de un fallo real, con `|| true` para que `set -e` no aborte el script antes de poder evaluarlo:

```bash
restic backup "${VOLUME_PATHS[@]}" --tag noc-soc --tag "$(date +%Y%m%d)" || true
rc=$?
if [ $rc -eq 3 ]; then
  echo "AVISO: backup completado con algunos ficheros no leíbles (normal en volúmenes activos como VictoriaMetrics)"
elif [ $rc -ne 0 ]; then
  echo "FALLO en restic backup"
  BACKUP_OK=0
fi
```

Mismo cambio replicado en el bloque de B2. Con esto, el dashboard pasó a reflejar la realidad: verde cuando el snapshot es utilizable, aunque tenga avisos benignos de ficheros transitorios, y solo rojo cuando de verdad no se genera un snapshot.

### Loki descartaba en bloque todo lo que llegaba de los contenedores Docker

Al añadir `discovery.docker` y `loki.source.docker` a la config de Alloy para dejar de depender solo de `/var/log`, Loki empezó a rechazar **todos** los envíos con HTTP 400:

```
error="server returned HTTP status 400 Bad Request (400): entry with timestamp ... too old, oldest acceptable timestamp is: ..."
```

`loki.source.docker` lee el histórico completo de logs de cada contenedor desde que arrancó, vía la API de Docker — y los contenedores del lab llevaban semanas corriendo, muy por encima del límite por defecto de Loki (7 días). Loki descarta el lote entero si contiene una sola entrada demasiado vieja, así que ni siquiera lo reciente pasaba. Arreglo, ampliando temporalmente la ventana aceptada:

```yaml
limits_config:
  reject_old_samples: true
  reject_old_samples_max_age: 2160h
```

Y, de paso, faltaba relabeling: todo caía bajo `service_name="unknown_service"` en vez de identificar cada contenedor. Se añadió un paso de `discovery.relabel` entre el discovery y el source:

```hcl
discovery.docker "containers" {
  host = "unix:///var/run/docker.sock"
}

discovery.relabel "containers" {
  targets = discovery.docker.containers.targets

  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
}

loki.source.docker "containers" {
  host          = "unix:///var/run/docker.sock"
  targets       = discovery.docker.containers.targets
  relabel_rules = discovery.relabel.containers.rules
  forward_to    = [loki.write.default.receiver]
}
```

Con esto, los 9 contenedores del lab empezaron a aparecer con su propio label `container` en vez de una única serie genérica.

### Las unidades del dashboard de Docker Containers no tenían sentido físico

CPU aparecía en mB/s y memoria en MB/s — ninguna de las dos cosas es correcta. Memoria (`container_memory_usage_bytes`) es un valor absoluto en un instante dado, no una tasa; llevaba un `rate()` de más y la unidad puesta en el panel no correspondía. Arreglo: quitar el `rate()` de la query de memoria y fijar la unidad del panel a **Data → bytes(IEC)**, que escala automáticamente a KiB/MiB/GiB sin necesidad de convertir nada en la query.

## Hipótesis

Con el baseline reconstruido, y antes de tocar nada, la expectativa por componente, apoyada en lo ya aprendido en la Parte 1:

- **VictoriaMetrics**: se auto-reconciliará, igual que hizo en el incidente de restauración en caliente de la Parte 1 ("unclean shutdown" detectado y reparado solo).
- **n8n**: recuperación con reintentos, sin intervención manual, como ya se vio antes.
- **Loki**: si esta vez se restaura con el contenedor parado de antemano (la lección de la Parte 1), no debería repetir el error fatal del WAL.
- **Grafana**: sin certeza previa — nunca se sometió a una destrucción real de raíz, solo a la restauración en caliente accidental.
- **Zabbix (Postgres)**: al ser un dump lógico, no un volumen en caliente, se espera una restauración limpia si el proceso (parar, restaurar, aplicar el dump) se sigue en orden.

## Fase 1: evidencia antes

Con los dashboards ya fiables, captura de un estado de referencia verificable, componente a componente:

```bash
docker exec zabbix-postgres-server-1 psql -U zabbix -c "SELECT count(*) FROM hosts;"
docker exec zabbix-postgres-server-1 psql -U zabbix -c "SELECT count(*) FROM triggers;"

curl -s -H "Authorization: Bearer <service-account-token>" \
  http://localhost:3000/api/search?type=dash-db | jq '. | length'
curl -s -H "Authorization: Bearer <service-account-token>" \
  http://localhost:3000/api/datasources | jq '.[].name'

curl -s 'http://localhost:8428/api/v1/query?query=count(up)'
curl -s 'http://localhost:8428/api/v1/label/__name__/values' | jq '.data | length'

curl -s -G 'http://localhost:3100/loki/api/v1/query_range' \
  --data-urlencode 'query={job=~".+"}' --data-urlencode 'limit=1' | jq '.data.result | length'
curl -s -G 'http://localhost:3100/loki/api/v1/label/container/values' | jq

docker exec automation-n8n-1 n8n list:workflow --active=true

cat /var/lib/node_exporter/textfile_collector/backup_status.prom
```

![baseline de Zabbix, Grafana, VictoriaMetrics, Loki y n8n](/assets/images/lab-noc-soc-bk2/fase1_previa.PNG)

*Troubleshooting: basic auth de Grafana devolvía 401 con la contraseña "correcta".* La primera pasada, con `curl -u admin:<contraseña>`, daba resultados inconsistentes entre endpoints — `/api/search` a veces devolvía datos con una contraseña que `/api/datasources` rechazaba con la misma credencial. Aislar el código HTTP real (`-o /tmp/resp.json -w "HTTP: %{http_code}\n"`, en vez de fiarse de si `jq` daba error o no) confirmó que una de las dos contraseñas probadas era la incorrecta de verdad (401 con `messageId: "password-auth.failed"`), y el resultado "positivo" que parecía dar en `/api/search` no era autenticación real. Arreglo definitivo: en vez de seguir depurando basic auth, migrar a un **Service Account token** (`Administration → Service accounts → Add service account token`), que da 401 limpio si falla y 200 real si funciona, sin la ambigüedad de si un fallback anónimo está devolviendo datos parciales.

*Troubleshooting: `n8n list:workflow --active` fallaba con "Expected string, received boolean".* En la versión de n8n del lab, el flag ya no es booleano de solo presencia — espera un valor explícito. Arreglo: `--active=true` en vez de `--active`.

## Fase 2: backup fresco garantizado

Antes de destruir nada, un backup nuevo contra ambos repositorios, para que el snapshot usado en la restauración incluya exactamente el estado capturado en la Fase 1:

```bash
sudo -E ~/noc-soc/backup_restic.sh

export RESTIC_PASSWORD_FILE=~/.restic-password
restic snapshots --repo /mnt/c/Users/sergio.ib/noc-soc-backups/restic-repo

source ~/.b2-credentials
restic snapshots --repo b2:noc-soc-restic-backup:restic-repo
```

*Troubleshooting: Restic pedía la contraseña del repositorio de forma interactiva.* En una sesión de bash nueva, sin `sudo -E` de por medio, no hay nada que propague `RESTIC_PASSWORD_FILE` — hay que exportarla explícitamente en cada sesión antes de operar sobre el repositorio, y para B2 además cargar `~/.b2-credentials`.

Con el backup confirmado en verde (esta vez de verdad, con el exit code 3 tratado como aviso), snapshot local `4a8ca03d` como el que ancla toda la restauración posterior.

## Fase 3: destrucción real

Servicios parados y volúmenes borrados de verdad, no una simulación.

```bash
cd ~/noc-soc

docker compose -f monitoring/docker-compose.yml stop grafana victoriametrics
docker compose -f logging/docker-compose.yml stop loki
docker compose -f automation/docker-compose.yml stop n8n
docker compose -f zabbix/docker-compose.yml stop postgres-server zabbix-server

sudo find /var/lib/docker/volumes/monitoring_grafana-storage/_data -mindepth 1 -delete
sudo find /var/lib/docker/volumes/monitoring_victoriametrics-data/_data -mindepth 1 -delete
sudo find /var/lib/docker/volumes/logging_loki-data/_data -mindepth 1 -delete
sudo find /var/lib/docker/volumes/automation_n8n-data/_data -mindepth 1 -delete
sudo find /var/lib/docker/volumes/zabbix_pgdata/_data -mindepth 1 -delete
```

![volúmenes confirmados vacíos tras el borrado](/assets/images/lab-noc-soc-bk2/eliminacion_de_datos.PNG)
![estado del stack tras la destrucción, todo Exited salvo lo que no tiene estado propio](/assets/images/lab-noc-soc-bk2/ps_tras_eliminacion.PNG)

Se optó por el escenario de destrucción total en Zabbix: no solo probar la restauración lógica del dump en un volumen intacto, sino borrar también `zabbix_pgdata` y depender enteramente de `zabbix_pgdump.sql` para reconstruir la base desde cero.

*Troubleshooting: `docker compose stop zabbix-postgres-server-1` fallaba con "no such service".* El nombre del contenedor (`zabbix-postgres-server-1`, con el sufijo `-1` de índice que añade Compose) no es el nombre del servicio definido en el `docker-compose.yml`. `docker compose stop`/`up` necesitan el nombre de servicio, no el de contenedor — se confirmó con `docker compose -f zabbix/docker-compose.yml config --services`.

Tras el borrado, `docker ps -a` mostró todo `Exited` salvo `alloy`, `node-exporter`, `cadvisor` y `zabbix-web` — los cuatro componentes sin estado persistente propio, que no formaban parte de esta prueba. Loki terminó con `Exited (137)` (SIGKILL tras timeout de cierre), coherente con lo ya visto en la Parte 1 sobre su comportamiento de cierre, aunque aquí sin consecuencia porque su volumen se borró de todas formas.

## Fase 4: restauración desde cero

Restauración de los cuatro volúmenes Docker con `--include`, uno por uno:

```bash
export RESTIC_REPOSITORY="/mnt/c/Users/sergio.ib/noc-soc-backups/restic-repo"
export RESTIC_PASSWORD_FILE=~/.restic-password

sudo -E restic restore latest --target / --include /var/lib/docker/volumes/monitoring_grafana-storage/_data
sudo -E restic restore latest --target / --include /var/lib/docker/volumes/monitoring_victoriametrics-data/_data
sudo -E restic restore latest --target / --include /var/lib/docker/volumes/logging_loki-data/_data
sudo -E restic restore latest --target / --include /var/lib/docker/volumes/automation_n8n-data/_data
```

![restauración por volumen, con --include filtrando de verdad esta vez](/assets/images/lab-noc-soc-bk2/restauracion_local.PNG)

A diferencia del incidente de la Parte 1, cada restauración devolvió un número de ficheros distinto y proporcional al volumen real (711, 700, 291, 18 ficheros/directorios), no los 1290 del snapshot completo — `--include` filtró correctamente esta vez.

Restauración del dump de Zabbix a una ruta temporal:

```bash
sudo -E restic restore latest --target /tmp/zabbix-restore --include /home/sergioib/noc-soc/backups/tmp
```

![dump de Zabbix restaurado a la carpeta temporal](/assets/images/lab-noc-soc-bk2/restauracion_dump.PNG)

Postgres arrancado sobre el volumen vacío, y el dump aplicado:

```bash
docker compose -f zabbix/docker-compose.yml up -d postgres-server
sleep 15
docker logs zabbix-postgres-server-1 --tail 20

sudo cat /tmp/zabbix-restore/home/sergioib/noc-soc/backups/tmp/zabbix_pgdump.sql \
  | docker exec -i zabbix-postgres-server-1 psql -U zabbix
```

*Troubleshooting: el `docker logs` tras el primer intento de `up -d` mostraba mensajes de cierre (`FATAL: terminating connection...`, `database system is shut down`).* Confundía porque parecía un fallo de arranque nuevo, pero eran los logs **residuales** del cierre del contenedor durante la Fase 3 — el propio `up -d` había fallado en seco por el mismo problema de nombre de servicio ya visto (`zabbix-postgres-server-1` como nombre de contenedor, no de servicio), así que nunca llegó a intentarse un arranque real. Con el nombre de servicio correcto, Postgres inicializó limpio sobre el volumen vacío.

*Troubleshooting: "Permission denied" al leer el dump restaurado.* El fichero pertenece a `root` por haberse restaurado con `sudo -E`. Solución trivial: leerlo también con `sudo` al aplicarlo (`sudo cat ... | docker exec -i ...`).

Con Postgres arriba, arranque del resto del stack:

```bash
docker compose -f zabbix/docker-compose.yml up -d zabbix-server
docker compose -f monitoring/docker-compose.yml up -d grafana victoriametrics
docker compose -f logging/docker-compose.yml up -d loki
docker compose -f automation/docker-compose.yml up -d n8n
```

![todos los servicios de nuevo Up tras la restauración completa](/assets/images/lab-noc-soc-bk2/servicios_restaurados.PNG)

Verificación inmediata de Zabbix contra el baseline:

```bash
docker exec zabbix-postgres-server-1 psql -U zabbix -c "SELECT count(*) FROM hosts;"
docker exec zabbix-postgres-server-1 psql -U zabbix -c "SELECT count(*) FROM triggers;"
```

![409 hosts y 6927 triggers, coincidencia exacta con el baseline](/assets/images/lab-noc-soc-bk2/verificacion_de_zabbix.PNG)

Y, la validación más relevante de toda la prueba: **Loki no repitió el error fatal de WAL de la Parte 1.** Al restaurarse con el contenedor ya parado desde el principio de la Fase 3 — en vez de en caliente como en el incidente accidental anterior — arrancó sin el bucle de reinicio, confirmando que la causa raíz identificada entonces (segmentos de WAL no secuenciales por restaurar sin parar el proceso) era correcta, y que seguir el proceso correcto la evita por completo.

## Fase 5: verificación

Los mismos comandos de la Fase 1, repetidos tal cual, para comparar número contra número:

```bash
curl -s -H "Authorization: Bearer <service-account-token>" \
  http://localhost:3000/api/search?type=dash-db | jq '. | length'
curl -s -H "Authorization: Bearer <service-account-token>" \
  http://localhost:3000/api/datasources | jq '.[].name'

curl -s 'http://localhost:8428/api/v1/query?query=count(up)'
curl -s 'http://localhost:8428/api/v1/label/__name__/values' | jq '.data | length'

curl -s -G 'http://localhost:3100/loki/api/v1/query_range' \
  --data-urlencode 'query={job=~".+"}' --data-urlencode 'limit=1' | jq '.data.result | length'
curl -s -G 'http://localhost:3100/loki/api/v1/label/container/values' | jq

docker exec automation-n8n-1 n8n list:workflow --active=true
```

![verificación final: Grafana, VictoriaMetrics, Loki y n8n contra el baseline](/assets/images/lab-noc-soc-bk2/verificaciones.PNG)

*Troubleshooting: el label `container` de Loki pasó de 9 valores en la Fase 1 a 8 en la Fase 5, faltando `monitoring-node-exporter-1`.* Antes de anotarlo como pérdida de datos, se comprobó directamente si el stream tenía entradas reales, sin depender del endpoint de labels:

```bash
curl -s -G 'http://localhost:3100/loki/api/v1/query_range' \
  --data-urlencode 'query={container="monitoring-node-exporter-1"}' \
  --data-urlencode 'limit=5' \
  --data-urlencode 'start='$(date -d '2 hours ago' +%s)000000000 | jq
```

![logs de node-exporter presentes pese a no aparecer en label/container/values](/assets/images/lab-noc-soc-bk2/entradas_node.PNG)

El query devolvió entradas reales y recientes, incluyendo logs propios del arranque del contenedor (`"TLS is disabled"`, `"Listening on"`). Los datos estaban ahí — fue un falso negativo del endpoint de labels, no una pérdida real, probablemente porque `label/container/values` refleja streams con actividad en cierta ventana o caché de índice, y en el momento exacto de la consulta ese stream concreto no había generado suficiente tráfico reciente para listarse, pese a tener datos ya escritos. La lección: para confirmar presencia o ausencia real de datos en Loki, consultar el propio contenido (`query_range`) es más fiable que consultar el índice de labels.

## Tabla de resultados

| Componente | Métrica | Fase 1 (baseline) | Fase 5 (post-restore) | Resultado |
|---|---|---|---|---|
| Zabbix | Hosts | 409 | 409 | Idéntico |
| Zabbix | Triggers | 6927 | 6927 | Idéntico |
| Grafana | Dashboards | 4 | 4 | Idéntico |
| Grafana | Datasources | 4 | 4 | Idéntico |
| VictoriaMetrics | `count(up)` | 2 | 2 | Idéntico |
| VictoriaMetrics | Series (`__name__`) | 387 | 387 | Idéntico |
| Loki | Query reciente con resultado | 1 | 1 | Idéntico |
| Loki | Contenedores con label `container` | 9 | 8 (falso negativo confirmado) | Sin pérdida real |
| n8n | Workflow activo | `JzRIkp8Yj0Rih5Q2` — Lab NOC-SOC | `JzRIkp8Yj0Rih5Q2` — Lab NOC-SOC | Idéntico |
| Backup | Estado tras el ciclo | OK | OK | Idéntico |

## Contraste con la hipótesis

- **VictoriaMetrics**: confirmado, sin novedad respecto a la Parte 1 — nada que reconciliar esta vez porque la restauración fue en frío, con el contenedor parado.
- **n8n**: el workflow quedó activo sin intervención manual, con el mismo ID que antes de la destrucción.
- **Loki**: confirmado con más solidez que la propia hipótesis — no solo "no debería repetir el error", sino que la ausencia del error valida retroactivamente el diagnóstico de la Parte 1.
- **Grafana**: sin sorpresas, dashboards y datasources íntegros. La incertidumbre de partida quedó despejada.
- **Zabbix**: restauración limpia con el proceso en orden (Postgres arriba primero, dump aplicado después), tal como se esperaba, con el único obstáculo siendo de nomenclatura de Compose, no del propio proceso de backup/restore.

## El lab sobrevive intacto

Con una destrucción real —servicios parados, los cinco volúmenes de datos borrados de raíz, incluido el escenario más agresivo en Zabbix (destrucción total del volumen de Postgres, dependiendo solo del dump lógico)— y una restauración completa desde Restic, el resultado es una tabla sin ninguna pérdida de datos real. El único desajuste encontrado (el label de Loki) se investigó hasta confirmar que era un falso negativo del índice, no una pérdida de contenido.

El mecanismo montado en la Parte 1, con las correcciones que salieron de ponerlo a prueba entonces (`--include` en vez de `--path`, parar los contenedores antes de restaurar, distinguir exit codes de Restic), sostiene lo que promete: el lab entero es reconstruible desde cero a partir del repositorio, sin depender de que ningún volumen original sobreviva.