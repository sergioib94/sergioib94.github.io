---
title: "Lab NOC/SOC: backups con Restic (I)"
date: 2026-08-04T7:11:16+02:00
categories: [Homelab, DevOps, Backups]
excerpt: "El lab lleva varios posts sometido a picos de carga y cambios de stack, pero nunca a la pregunta de qué pasa si un volumen se corrompe. Restic es la pieza que responde: deduplicación real, cifrado de fábrica y verificación de integridad del propio repositorio, sin tener que montar nada de eso a mano."
card_image: /assets/images/cards/lab-noc-soc-restic.png
---

Tras el cambio de stack de monitorización al sustituir Prometheus por VictoriaMetrics y Promtail por Alloy, quedaba un frente pendiente que ningún post había tocado todavía: la persistencia de los datos del lab. Ningún pico de carga ni ningún cambio de stack sirve de nada si un volumen se corrompe y no hay forma de recuperarlo. Este post cubre justo eso: cómo queda montado el backup del lab con **Restic**, de principio a fin, con el troubleshooting real que surgió al ponerlo a prueba.

## Por qué Restic y no otra alternativa

Antes de escribir nada, comparé Restic con `offen/docker-volume-backup`, la alternativa más específica para entornos Docker Compose. La diferencia que me hizo decantarme por Restic no es de funcionalidad, ambas cifran y ambas gestionan retención, la diferencia se encuentra en el alcance: Restic hace backup de cualquier directorio, en cualquier sistema, no solo de volúmenes Docker. Es la misma herramienta que usaría el día que parte del lab viva en una VM de Azure sin un solo contenedor, o en un servidor sin Docker de por medio. Y su formato de repositorio (basado en *content-defined chunking*) da una deduplicación real entre ejecuciones sucesivas: si un volumen apenas cambia entre un backup y el siguiente, Restic solo almacena los bloques nuevos, no la copia entera otra vez.

## Instalación

Restic es un único binario, sin dependencias. Lo instalo directamente en la VM de WSL2, sin contenedor de por medio, porque necesita leer los datos de los volúmenes desde el propio filesystem del host:

```bash
sudo apt update && sudo apt install -y restic
restic version
```

En este lab se ha usado restic version 0.16.4, compilado con go1.22.2.

## El concepto clave: repositorio y snapshots

Antes del primer backup, hay que inicializar un **repositorio**: la estructura donde Restic va a almacenar todo, cifrada de principio a fin. Cada ejecución de `restic backup` no genera un fichero nuevo suelto, sino un **snapshot**: una referencia a un estado concreto en el tiempo, construida a partir de bloques de datos que Restic deduplica automáticamente contra todo lo que ya tenía guardado.

Uso como destino del repositorio una ruta del disco de Windows, no de la propia VM de WSL2, así la copia queda automáticamente fuera del disco virtual que aloja el lab, sin un paso de `cp` aparte:

```bash
mkdir -p "/mnt/c/Users/sergio.ib/noc-soc-backups/restic-repo"

echo "un-passphrase-largo-y-real-aqui" > ~/.restic-password
chmod 600 ~/.restic-password

export RESTIC_REPOSITORY="/mnt/c/Users/sergio.ib/noc-soc-backups/restic-repo"
export RESTIC_PASSWORD_FILE=~/.restic-password

restic init
```

![salida restic init](/assets/images/lab-noc-soc-bk1/restic_init.PNG)

El `chmod 600` sobre el fichero de passphrase no es opcional: sin eso, cualquier otro usuario del sistema podría leer la contraseña que cifra todos los backups.

## El script de backup

Un detalle importante antes de verlo: los volúmenes con nombre de Docker (driver `local`) son, por dentro, carpetas normales del host en `/var/lib/docker/volumes/<nombre>/_data`. Restic puede apuntar directamente ahí sin necesidad de un contenedor intermedio, pero esa ruta pertenece a `root`, así que el script necesita ejecutarse con `sudo`.

```bash
nano ~/noc-soc/backup_restic.sh
```

```bash
#!/bin/bash
# backup_restic.sh backup del lab con Restic: dedup, cifrado y verificación reales
set -euo pipefail

export RESTIC_REPOSITORY="/mnt/c/Users/sergio.ib/noc-soc-backups/restic-repo"
export RESTIC_PASSWORD_FILE=~/.restic-password
TEXTFILE_DIR=/var/lib/node_exporter/textfile_collector
DUMP_DIR=~/noc-soc/backups/tmp
BACKUP_OK=1

mkdir -p "$DUMP_DIR" "$TEXTFILE_DIR"

# --- 1. Zabbix (Postgres): dump lógico, para no copiar los ficheros de datos en caliente ---
# No metemos el volumen zabbix_pgdata en crudo el dump ya es la copia consistente.
echo "Volcando Zabbix (Postgres)..."
docker exec zabbix-postgres-server-1 pg_dumpall -U zabbix > "${DUMP_DIR}/zabbix_pgdump.sql" \
  || { echo "FALLO en pg_dumpall"; BACKUP_OK=0; }

# --- 2. Backup con Restic de los volúmenes basados en ficheros + el dump ---
VOLUME_PATHS=(
  "/var/lib/docker/volumes/monitoring_grafana-storage/_data"
  "/var/lib/docker/volumes/monitoring_victoriametrics-data/_data"
  "/var/lib/docker/volumes/logging_loki-data/_data"
  "/var/lib/docker/volumes/automation_n8n-data/_data"
  "$DUMP_DIR"
)

echo "Ejecutando restic backup..."
restic backup "${VOLUME_PATHS[@]}" \
  --tag noc-soc --tag "$(date +%Y%m%d)" \
  || { echo "FALLO en restic backup"; BACKUP_OK=0; }

# --- 3. Retención: 7 diarios, 4 semanales, 6 mensuales, purgando el resto ---
echo "Aplicando política de retención..."
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune \
  || { echo "FALLO en forget/prune"; BACKUP_OK=0; }

# --- 4. Verificación de integridad del repositorio, no solo del contenido restaurado ---
echo "Verificando integridad del repositorio..."
restic check || { echo "FALLO en restic check"; BACKUP_OK=0; }

# --- 5. Métrica de estado para Grafana ---
cat > "${TEXTFILE_DIR}/backup_status.prom" <<EOF
backup_last_run_timestamp $(date +%s)
backup_last_run_success ${BACKUP_OK}
EOF

rm -rf "$DUMP_DIR"
echo "Backup con Restic completado (éxito: $BACKUP_OK)"
```

```bash
chmod +x ~/noc-soc/backup_restic.sh
sudo -E ~/noc-soc/backup_restic.sh
```

![restic snapshot](/assets/images/lab-noc-soc-bk1/snapshot_1.PNG)

El `-E` en `sudo -E` es necesario para que `sudo` conserve las variables de entorno (`RESTIC_REPOSITORY`, `RESTIC_PASSWORD_FILE`) que exporté como mi usuario normal, sin eso `restic` no sabría dónde está el repositorio ni cómo descifrarlo al ejecutarse como root.

## Qué aporta cada pieza del script

- **`restic check`** verifica la integridad estructural del propio repositorio, que los bloques de datos no estén corruptos, que los índices cuadren, no solo que un contenido restaurado no esté vacío.

- **`restic forget --prune`** aplica una política de retención real, en capas (diaria/semanal/mensual), en vez de un corte binario por fecha.

- **La deduplicación** hace que, a partir del segundo backup, solo se almacenen los bloques que cambiaron. El ahorro de espacio y tiempo se nota sobre todo en `monitoring_victoriametrics-data`, que crece de forma incremental y donde gran parte del contenido de un backup al siguiente es idéntico.

- **El cifrado** ocurre antes de que Restic escriba nada en el repositorio, no hay ningún paso intermedio en el que un backup sin cifrar llegue a tocar disco.

## Comprobar lo que hay

```bash
restic snapshots
```

Esto lista cada snapshot con su fecha, tamaño y los tags que le puse (`noc-soc`, la fecha).

## Restaurar: probar contra un destino de prueba primero

Antes de restaurar sobre el volumen real (y arriesgarme a pisar algo), Restic permite restaurar a cualquier ruta, sin tocar el volumen original. Y aquí hay un matiz que importa: si el objetivo de la prueba es comprobar que sobrevivo a una pérdida de la VM de WSL2, el destino de la restauración de prueba tiene que vivir **fuera** de WSL2 también, restaurar dentro de `/tmp` no demuestra nada porque `/tmp` está en el mismo disco virtual que se supone que se ha perdido:

```bash
sudo -E restic restore latest \
  --target /mnt/c/Users/sergio.ib/noc-soc-backups/restore-test \
  --path /var/lib/docker/volumes/monitoring_grafana-storage/_data
```

![restauración de prueba](/assets/images/lab-noc-soc-bk1/restore_prueba.PNG)

Con `--path` filtro para restaurar solo ese volumen del snapshot, y `--target` lo manda a una carpeta de prueba en Windows en vez de sobrescribir nada ni de quedarse dentro de la propia VM. Solo cuando confirmo que el contenido es el esperado, restauro de verdad sobre el volumen (con el contenedor parado):

```bash
docker stop monitoring-grafana-1
sudo rm -rf /var/lib/docker/volumes/monitoring_grafana-storage/_data/*
sudo -E restic restore latest \
  --target / \
  --path /var/lib/docker/volumes/monitoring_grafana-storage/_data
docker start monitoring-grafana-1
```

![restore en destino de prueba](/assets/images/lab-noc-soc-bk1/primer_restore.PNG)

## Troubleshooting: `--path` no filtra nada, y no todos los servicios reaccionan igual a una restauración en caliente

Al ejecutar la restauración real sobre el volumen de Grafana, algo no cuadraba en el resumen de Restic:

```
restoring <Snapshot d506bb7b of [/var/lib/docker/volumes/monitoring_grafana-storage/_data
/var/lib/docker/volumes/monitoring_victoriametrics-data/_data
/var/lib/docker/volumes/logging_loki-data/_data
/var/lib/docker/volumes/automation_n8n-data/_data
/home/sergioib/noc-soc/backups/tmp] at ... to /
Summary: Restored 1290 files/dirs (182.045 MiB)
```

1290 ficheros y 182.045 MiB son exactamente los números del backup completo, no solo del volumen de Grafana. **`--path` no filtra qué se restaura**, solo sirve para desambiguar qué snapshot elegir cuando "latest" podría corresponder a varios candidatos. El flag correcto para restaurar un único volumen dentro de un snapshot con varios es `--include`:

```bash
sudo -E restic restore latest \
  --target / \
  --include /var/lib/docker/volumes/monitoring_grafana-storage/_data
```

El resultado real fue que Restic sobrescribió, con destino `/`, los cuatro volúmenes del snapshot a la vez **mientras VictoriaMetrics, Loki y n8n seguían corriendo**, sin haberlos parado antes. Docker Compose seguía mostrando los tres como `Up`, pero "sigue arriba" no es lo mismo que "los datos siguen siendo consistentes". Comprobé cada uno por separado, y los tres reaccionaron de forma distinta.

```bash
docker ps -a
```

![docker ps -a tras la restauración](/assets/images/lab-noc-soc-bk1/ts1.PNG)

### VictoriaMetrics: se recuperó solo

```bash
docker logs monitoring-victoriametrics-1 --tail 50
```

![logs VictoriaMetrics tras la restauración](/assets/images/lab-noc-soc-bk1/victoria1.PNG)
![logs VictoriaMetrics reconciliación completada](/assets/images/lab-noc-soc-bk1/victoria2.PNG)

El log mostró varios minutos de reconciliación tras detectar el problema:

```
deleting "/storage/data/small/.../..." because it isn't listed in "parts.json"
; this is the expected case after unclean shutdown
...
successfully opened storage "/storage" in 84.296 seconds
started VictoriaMetrics in 84.845 seconds
```

El propio motor de almacenamiento reconoce el estado inconsistente como un "unclean shutdown" y lo repara solo, borrando particiones huérfanas y descartando cachés obsoletas antes de volver a servir tráfico. El `curl` que en su momento no devolvió nada probablemente se ejecutó durante esos 84 segundos de reconciliación, antes de que el servidor HTTP estuviera escuchando, no fue una pérdida de datos.

### n8n: se recuperó solo, tras un par de reintentos

```bash
docker logs automation-n8n-1 --tail 50
```

![logs n8n tras la restauración](/assets/images/lab-noc-soc-bk1/n8n.PNG)

```
Last session crashed
Database ping failed (1/3): Database connection timed out
Database ping failed (2/3): Database connection timed out
Database connection recovered
Instance registered
Activated workflow "Lab NOC-SOC" (ID: JzRIkp8Yj0Rih5Q2)
```

Mismo patrón: detecta el problema, reintenta, y se recupera solo sin intervención.

### Loki: no se recupera solo, y no tolera la restauración en caliente

```bash
docker logs logging-loki-1 --tail 50
```

![logs Loki error fatal de WAL](/assets/images/lab-noc-soc-bk1/loki1.PNG)
![logs Loki el mismo error repitiéndose en bucle](/assets/images/lab-noc-soc-bk1/loki2.PNG)

```
level=error ... err="get segment range: segments are not sequential\n
error initialising module: ingester
```

A diferencia de los otros dos, el WAL (write-ahead log) de Loki exige que sus segmentos estén numerados de forma estrictamente secuencial. La restauración en caliente, sin parar el contenedor antes, dejó el WAL en un estado que no cumple esa condición y este es un error fatal, no uno del que el propio proceso pueda recuperarse: el contenedor entra en un bucle de reinicio (`Restarting`), cayendo en el mismo error cada vez, sin ningún mecanismo de auto-reconciliación como el de VictoriaMetrics.

Al tratarse de logs sintéticos de pruebas (no datos que necesite conservar), la solución fue reinicializar limpio en vez de intentar reparar el WAL a mano pero el intento obvio no funcionó, y el motivo resultó ser una trampa bastante más sutil que un problema del propio Loki.

### El "borrado que no borraba nada"

```bash
docker compose stop loki
sudo rm -rf /var/lib/docker/volumes/logging_loki-data/_data/*
sudo ls -la /var/lib/docker/volumes/logging_loki-data/_data
```

![el rm -rf no cambia nada, mismas fechas de siempre](/assets/images/lab-noc-soc-bk1/loki_persiste.PNG)

Con el contenedor ya confirmado `Exited`, el `rm -rf` no devolvía ningún error y aun así, el `ls -la` posterior seguía mostrando exactamente el mismo contenido, con las mismas fechas de siempre (`wal` del 31 de julio, `chunks` del 24 de julio). Ni rastro de un fallo visible, pero tampoco ningún cambio real.

Antes de repetir el mismo comando esperando un resultado distinto, tocaba aislar la causa con evidencia:

```bash
sudo rm -rfv /var/lib/docker/volumes/logging_loki-data/_data/*   # exit 0, sin errores
type rm                                                           # /usr/bin/rm, sin alias raros
findmnt /var/lib/docker/volumes/logging_loki-data/_data           # sin salida, no es un punto de montaje aparte
docker info --format '{{.DockerRootDir}}'                         # /var/lib/docker, la ruta correcta
sudo touch .../test-delete && sudo rm -fv .../test-delete          # esto sí borra sin problema
```

![diagnóstico paso a paso del rm que no borraba](/assets/images/lab-noc-soc-bk1/ts_loki1.PNG)
![confirmación final: el contenedor sigue Restarting antes del arreglo](/assets/images/lab-noc-soc-bk1/ts_loki2.PNG)

Los cinco resultados descartaban uno a uno los sospechosos habituales (alias de `rm`, montaje raro, ruta equivocada, permisos), el borrado *sí funcionaba* en general, solo fallaba con `*`. La explicación real: **el comodín `*` lo expande la shell, como usuario normal, antes de que `sudo` entre en juego**. `sudo` solo escala privilegios sobre el comando ya expandido, no sobre el proceso de resolver qué ficheros coinciden con `*`. Cuando esa expansión no ocurre como se espera, bash pasa el asterisco literal a `rm`, que intenta borrar un fichero llamado `*` no existe, y con `-f` eso no genera ningún error, solo un `exit 0` completamente silencioso y cero cambios reales. Encajaba con cada síntoma observado.

La confirmación fue directa:

```bash
echo /var/lib/docker/volumes/logging_loki-data/_data/*
```

Y el arreglo, evitar depender del comodín por completo, con `find` en su lugar:

```bash
sudo find /var/lib/docker/volumes/logging_loki-data/_data -mindepth 1 -delete
sudo ls -la /var/lib/docker/volumes/logging_loki-data/_data   # solo . y .. esta vez
docker compose up -d loki
docker logs logging-loki-1 --tail 30
```

El `-mindepth 1` es la parte que importa: sin él, `find` también borraría la propia carpeta `_data`, que tiene que sobrevivir (vacía) para que Docker la vuelva a montar correctamente. Esta vez sí, Loki arrancó limpio, sin el error de WAL, confirmado también con una query en Grafana Explore sin el error de plugin que aparecía antes.

### La lección real

De los tres servicios afectados por el mismo error de restauración, solo uno no toleraba en absoluto una restauración en caliente y arreglarlo se complicó no por Loki en sí, sino por una trampa clásica de shell (`sudo` y comodines no se llevan bien) que no tiene nada que ver con Restic ni con contenedores. Dos lecciones, no una: "sigue arriba" y "sus datos siguen siendo consistentes" no son la misma garantía, cada motor de almacenamiento reacciona distinto a un estado a medias, y un `rm -rf` con comodín bajo `sudo` puede fallar en completo silencio si la expansión no ocurre como se espera, conviene verificar con `echo` antes de confiar o usar `find -delete` directamente. La forma correcta de haber evitado todo esto desde el principio tampoco era confiar en la resiliencia de cada servicio: parar los contenedores afectados antes de restaurar, y usar `--include` para restaurar solo el volumen que se necesita en cada caso.

## Hasta dónde protege esto de verdad

`RESTIC_REPOSITORY` vive en `/mnt/c/...`, es decir, en el disco `C:` real de Windows, no en el `.vhdx` de WSL2 así que el repositorio sobrevive sin problema a que la VM se corrompa, o a un `docker compose down -v` por error. Eso cubre el escenario más probable en la práctica.

Lo que **no** cubre es la pérdida física de la máquina: `C:` y el disco virtual de WSL2 normalmente comparten el mismo disco físico del portátil, así que un robo, un incendio, o que el disco simplemente muera, se lleva por delante las dos cosas a la vez. Para cerrar esa brecha de verdad hace falta que el repositorio (o una copia de él) viva fuera del propio equipo, un disco externo o NAS mitigan parte del riesgo, pero solo un backend remoto (Backblaze B2, S3) elimina la dependencia de cualquier hardware que tenga delante ahora mismo. Lo dejo como próximo paso pendiente, no como algo ya resuelto por tener el repositorio en `C:`.

## Cerrando las tareas pendientes

### Tarea 1: medir la deduplicación real
 
Con el incidente de restauración descartado de la comparación (el par `d506bb7b`→`b2613c36` no es representativo: entre esos dos snapshots ocurrió la restauración accidental documentada en el troubleshooting y la reinicialización completa de Loki, no actividad orgánica del lab), se generaron backups en días distintos con actividad real variada (`generate_log_burst.sh` + `stress-ng`, y un backup en frío sin apenas cambios) para tener ambos extremos del espectro medidos. Estos son los datos reales, medidos por separado en los dos repositorios.
 
#### Repositorio local (`/mnt/c/Users/sergio.ib/noc-soc-backups/restic-repo`)
 
| Snapshot | Parent | Ficheros `unmodified` | Añadido (sin dedup) | Almacenado real | Tiempo |
|---|---|---|---|---|---|
| `d506bb7b` (base) | — (1er backup) | — | 182.045 MiB | 65.292 MiB | 0:17 |
| `b2613c36` (con carga real) | `d506bb7b` | 0/1141 (0%) — *no representativo, incidente de por medio* | 178.095 MiB | 10.620 MiB | 0:19 |
| `e575bc33` (en frío) | `b2613c36` | 1017/1141 (**89%**) | 175.737 MiB | 4.988 MiB | 0:15 |
| `15729b3a` | `e575bc33` | 1078/1143 (**94.3%**) | 177.876 MiB | 3.446 MiB | 0:01 |
 
![resumen de los dos primeros backups locales](/assets/images/lab-noc-soc-bk1/bk_D.PNG)
![tercer backup local, comparación en frío](/assets/images/lab-noc-soc-bk1/bk_S.PNG)
 
Tras aplicar la política de retención (`--keep-daily 7 --keep-weekly 4 --keep-monthly 6`), el repositorio local conserva 4 snapshots (`d506bb7b`, `b2613c36`, `e575bc33`, `15729b3a`, el snapshot duplicado del mismo día `dccb38ee`, fue purgado por `--prune`). Tamaño final del repositorio tras la purga: **89.970 MiB**, con solo 3.349 MiB de espacio sin usar (3.72%). `restic check` confirma 4/4 snapshots sin errores.
 
#### Repositorio remoto (Backblaze B2: `b2:noc-soc-restic-backup:restic-repo`)
 
| Snapshot | Parent | Ficheros `unmodified` | Añadido (sin dedup) | Almacenado real | Tiempo |
|---|---|---|---|---|---|
| `340b060d` (1er backup en B2) | — | — (`no parent snapshot found, will read all files`) | 177.514 MiB | 56.118 MiB | 0:21 |
| `7525b1cd` | `340b060d` | 1079/1143 (**94.4%**) | 177.876 MiB | 3.631 MiB | 0:03 |
 
![primer backup subido a B2, sin parent](/assets/images/lab-noc-soc-bk1/bk_remoto.PNG)
![bucket B2 tras el primer backup — 58.9 MB](/assets/images/lab-noc-soc-bk1/B2_browse_bk1.PNG)
![segundo backup en B2, con deduplicación](/assets/images/lab-noc-soc-bk1/backup2-1.PNG)
![retención aplicada correctamente en ambos repositorios tras el arreglo](/assets/images/lab-noc-soc-bk1/backup2-2.PNG)
![prune del repositorio local y verificación de integridad en ambos](/assets/images/lab-noc-soc-bk1/backup2-3.PNG)
![bucket B2 tras el segundo backup — 62.7 MB](/assets/images/lab-noc-soc-bk1/B2_browse_bk2.PNG)
 
Retención tras el segundo backup en B2: 2 snapshots conservados (el primero se mantiene aunque exista uno más reciente del mismo día, porque al ser el único snapshot del repositorio también reclama las razones "semanal" y "mensual", comportamiento esperado de `--keep-weekly`/`--keep-monthly` en un repositorio recién creado, no un fallo). `restic check` confirma 2/2 snapshots sin errores.
 
#### Lectura de los datos
 
**La deduplicación es consistente entre backends: ~94% en ambos repositorios**, sobre el mismo contenido, subido por vías completamente distintas (disco local vs red a B2). Confirma que el ahorro no depende de dónde se guarda el repositorio, es el propio formato de Restic (*content-defined chunking*) el que lo aporta, tanto en local como en remoto.
 
**El primer backup de cada repositorio no tiene nada con lo que deduplicar** (`no parent snapshot found` en B2 es el mismo caso que `d506bb7b` en local), es el comportamiento esperado, no una anomalía, y por eso el ahorro real solo se aprecia a partir del segundo backup de cada repositorio en adelante.
 
**El par con actividad real de carga (`b2613c36`) queda excluido de la conclusión sobre deduplicación** no de la tabla, está documentado como no representativo por el incidente de restauración que se solapó justo en esa ventana, y se explica en detalle en la sección de troubleshooting de la restauración.

### Tarea 2: backend remoto en Backblaze B2
 
**1. Crear el bucket**
 
Backblaze → **B2 Cloud Storage → Buckets → Create a Bucket**:
- Nombre: `noc-soc-restic-backup`
- Archivos: **Privados**
- Default Encryption: deshabilitado (Restic ya cifra en el cliente antes de subir nada, así que esta capa adicional es opcional)
- Object Lock: deshabilitado (añade complejidad no justificada para un lab personal)

![creación del bucket en B2](/assets/images/lab-noc-soc-bk1/B2.PNG)
 
**2. Crear una Application Key restringida al bucket**
 
**Application Keys → Add a New Application Key**, restringida específicamente a `noc-soc-restic-backup`, no la master key de la cuenta.
 
![application key creada, restringida al bucket](/assets/images/lab-noc-soc-bk1/B2_key2.PNG)
 
*Troubleshooting: `B2_ACCOUNT_ID` vs `B2_ACCOUNT_KEY`.* Es fácil confundir cuál es cuál — `B2_ACCOUNT_ID` **no** es el ID de la cuenta de Backblaze en general, sino el `keyID` de esta Application Key en concreto (visible en el listado de `Application Keys`). `B2_ACCOUNT_KEY` es la `applicationKey`, que Backblaze **solo muestra una vez**, en el momento exacto de crear la clave si se cierra esa pantalla sin copiarla, no hay forma de recuperarla después, ni desde el panel ni por soporte; la única opción es borrar la clave y crear una nueva.
 
**3. Guardar las credenciales fuera del script**
 
```bash
nano ~/.b2-credentials
```
```bash
export B2_ACCOUNT_ID="<keyID>"
export B2_ACCOUNT_KEY="<applicationKey>"
```
```bash
chmod 600 ~/.b2-credentials
source ~/.b2-credentials
echo "$B2_ACCOUNT_ID"   # confirma que se cargó bien antes de seguir
```
 
**4. Inicializar el repositorio remoto**
 
```bash
export RESTIC_REPOSITORY="b2:noc-soc-restic-backup:restic-repo"
export RESTIC_PASSWORD_FILE=~/.restic-password
restic init
```
 
Confirmar en el propio panel de Backblaze (**Browse Files → noc-soc-restic-backup**) que aparece la estructura de carpetas que Restic crea al inicializar.
 
**5. Adaptar `backup_restic.sh` para escribir en los dos repositorios**
 
```bash
nano ~/noc-soc/backup_restic.sh
```
 
Al principio del script:
```bash
source ~/.b2-credentials
LOCAL_REPO="/mnt/c/Users/sergio.ib/noc-soc-backups/restic-repo"
REMOTE_REPO="b2:noc-soc-restic-backup:restic-repo"
export RESTIC_PASSWORD_FILE=~/.restic-password
```
 
Backup en ambos repositorios:
```bash
echo "Ejecutando restic backup (local)..."
export RESTIC_REPOSITORY="$LOCAL_REPO"
restic backup "${VOLUME_PATHS[@]}" --tag noc-soc --tag "$(date +%Y%m%d)" \
  || { echo "FALLO en restic backup (local)"; BACKUP_OK=0; }
 
echo "Ejecutando restic backup (B2)..."
export RESTIC_REPOSITORY="$REMOTE_REPO"
restic backup "${VOLUME_PATHS[@]}" --tag noc-soc --tag "$(date +%Y%m%d)" \
  || { echo "FALLO en restic backup (B2)"; BACKUP_OK=0; }
```
 
*Troubleshooting: retención y verificación solo se aplicaban a un repositorio.* La primera ejecución con los dos repositorios (ver captura) mostró que `restic forget --prune` y `restic check` solo corrían **una vez**, contra el último `RESTIC_REPOSITORY` que había quedado exportado (B2), el repositorio local se quedó una ejecución entera sin retención ni verificación de integridad, sin ningún error visible que lo delatara. El arreglo: repetir ambos pasos, una vez por repositorio, explícitamente:
 
```bash
echo "Aplicando política de retención (local)..."
export RESTIC_REPOSITORY="$LOCAL_REPO"
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune \
  || { echo "FALLO en forget/prune (local)"; BACKUP_OK=0; }
 
echo "Aplicando política de retención (B2)..."
export RESTIC_REPOSITORY="$REMOTE_REPO"
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune \
  || { echo "FALLO en forget/prune (B2)"; BACKUP_OK=0; }
 
echo "Verificando integridad del repositorio (local)..."
export RESTIC_REPOSITORY="$LOCAL_REPO"
restic check || { echo "FALLO en restic check (local)"; BACKUP_OK=0; }
 
echo "Verificando integridad del repositorio (B2)..."
export RESTIC_REPOSITORY="$REMOTE_REPO"
restic check || { echo "FALLO en restic check (B2)"; BACKUP_OK=0; }
```
 
![ejecución con el fallo: retención/check solo contra B2](/assets/images/lab-noc-soc-bk1/bk_remoto.PNG)
![ejecución corregida: retención y check contra ambos repositorios](/assets/images/lab-noc-soc-bk1/backup2-2.PNG)

### Tarea 3: Alerta en Grafana sobre `backup_last_run_success`

**1. Habilitar el textfile collector de node-exporter**
 
```yaml
node-exporter:
  volumes:
    - /var/lib/node_exporter/textfile_collector:/var/lib/node_exporter/textfile_collector:ro
  command:
    - "--collector.textfile.directory=/var/lib/node_exporter/textfile_collector"
```
 
```bash
cd ~/noc-soc/monitoring
docker compose up -d --force-recreate node-exporter
```
 
*Troubleshooting: la alerta se quedaba en "No Data".* Antes de tener esto activo, `curl http://localhost:9100/metrics | grep backup_last_run` no devolvía nada, el fichero `.prom` existía en disco pero node-exporter no estaba configurado para leerlo, así que la métrica nunca llegaba a VictoriaMetrics y la regla de Grafana no tenía datos que evaluar. Confirmación tras el arreglo:
 
```bash
curl -s 'http://localhost:8428/api/v1/query?query=backup_last_run_success'
```
![confirmación de que la métrica llega a VictoriaMetrics](/assets/images/lab-noc-soc-bk1/curl.PNG)
 
**2. Crear la regla de alerta**
 
**Alerting → Alert rules → New alert rule**:
 
- **Query A**: `backup_last_run_success`
- **Query B**: `time() - backup_last_run_timestamp`
- **Expresión C** (Threshold): `A IS BELOW 1`
- **Expresión D** (Threshold): `B IS ABOVE 93600` (26 horas)

![queries A y B configuradas](/assets/images/lab-noc-soc-bk1/g_define.PNG)
 
*Troubleshooting: la expresión OR fallaba con "D_threshold" is missing".* El primer intento de combinar las dos condiciones usó una expresión Math con `$A_threshold || $B_threshold` sintaxis inválida, porque `A` y `B` son las queries en crudo, no las condiciones ya evaluadas. La combinación tiene que referenciar los RefID de los propios thresholds:
 
```
$C || $D
```
 
![expresión E corregida, combinando C y D](/assets/images/lab-noc-soc-bk1/g_expresion.PNG)
 
Con `E` marcada como `Alert condition` (no `C` en solitario, que solo cubriría el caso de fallo explícito, no el de "backup que dejó de ejecutarse").
 
- **Evaluation group**: cada 5 minutos.
- **Pending period**: 5m (para no disparar por un pico puntual).

![evaluation group y pending period configurados](/assets/images/lab-noc-soc-bk1/g_behavour.PNG)
 
**3. Prueba de fuego: forzar un fallo simulado**
 
*Troubleshooting: `cat > archivo <<EOF` bajo `sudo` no escribía nada, sin dar ningún error.* La redirección `>` la resuelve la shell **antes** de que `sudo` entre en juego, si el fichero de destino pertenece a `root`, el `sudo` delante del `cat` no sirve de nada, porque no es el `cat` quien necesita privilegios, es la apertura del fichero de salida. El mismo tipo de trampa que el comodín `*` sin expandir en el troubleshooting de Loki. Arreglo, con `tee` en vez de redirección directa:
 
```bash
cat <<EOF | sudo tee /var/lib/node_exporter/textfile_collector/backup_status.prom
backup_last_run_timestamp $(($(date +%s) - 100000))
backup_last_run_success 0
EOF
```
 
Con esto, la regla completó el ciclo esperado: **Normal → Pending (5 min) → Firing**, y de vuelta a **Normal** tras relanzar un backup real.
 
**4. El contact point y la cadena de notificación hasta Jira**
 
Con el mismo webhook que ya usa el pipeline **Grafana Alerting → n8n → Jira** de la serie, añadiendo una condición en n8n (`Filter1`) sobre `labels.alertname` para distinguir esta alerta de las demás:
 
![filtro en n8n comprobando el alertname](/assets/images/lab-noc-soc-bk1/filter.PNG)
 
*Troubleshooting: el ticket no se creaba en Jira, con el error "Bad request the target project doesn't exist or you don't have permission to create issues in it".* Investigación en cadena, cada capa descartada antes de llegar a la causa real:
 
1. **Proyecto e Issue Type del post original, ya no válidos.** El desplegable `Project` de n8n solo mostraba un ID numérico (`10033`) sin nombre, y `Issue Type` fallaba con 404 al intentar cargarse.

![error 404 al crear el issue con el proyecto/tipo originales](/assets/images/lab-noc-soc-bk1/jira.PNG)

2. **Confirmación por API directa de que el proyecto y el tipo sí eran válidos.** Consultando `https://sergi301094.atlassian.net/rest/api/3/project/10033` y `.../rest/api/3/issuetype/project?projectId=10033` directamente (con la sesión de navegador, no con la credencial de n8n), se confirmó que `10033` es el proyecto `Lab NOC-SOC` (clave `SOP`, tipo `service_desk`) y que `[System] Incident` (id `10039`) sí existe en su esquema, el desplegable de n8n simplemente no resuelve bien los proyectos de tipo Jira Service Management.

3. **Fijando los IDs a mano (`Project` y `Issue Type` en modo "By ID"), el mismo error 400 seguía apareciendo**, a pesar de que los datos ya estaban confirmados como correctos por la API.

![mismo error 400 con los IDs correctos fijados a mano](/assets/images/lab-noc-soc-bk1/persiste.PNG)

4. **Verificación manual: el ticket sí se podía crear a mano, desde la propia interfaz de Jira, con el mismo usuario.** Esto descartó un problema de permisos del usuario o de licencia de agente en el proyecto — si el usuario podía crear el ticket a mano, el bloqueo no estaba en Jira, sino en cómo n8n se estaba autenticando.

![comprobación de roles del usuario en Jira](/assets/images/lab-noc-soc-bk1/personas.PNG)

5. **La causa real: la credencial de Jira en n8n nunca llegó a autenticarse.** Al revisar `Credentials → Jira SW Cloud account` en n8n, el propio panel mostraba: `Couldn't connect with these settings: Authorization failed — please check your credentials`. El mensaje de error genérico de la API de Jira (`"the target project doesn't exist or you don't have permission"`) es indistinguible entre un problema de datos, de permisos, o de autenticación — por eso la investigación tuvo que descartar las dos primeras causas antes de llegar a la tercera, que era la real: **el API token había caducado** desde que se configuró la integración en el primer post de la serie.

**Arreglo**: token nuevo generado desde `id.atlassian.com/manage-profile/security/api-tokens`, credencial de n8n actualizada (mismo email, token nuevo), reconexión confirmada, y creación del ticket verificada con el mismo fallo simulado de la prueba de fuego.
 
Con esto, el ciclo completo de la alerta queda verificado de punta a punta: **fichero de métrica → node-exporter → VictoriaMetrics → Grafana (Normal → Pending → Firing) → n8n → Jira (ticket creado)**, y su vuelta a `Normal` tras un backup real correcto.

## Próximos pasos: la Parte 2

Este post cubre el mecanismo, instalación, script, y todo lo que salió mal (y por qué) al ponerlo a prueba con una restauración real. Lo que falta, y que dejo para la **Parte 2**, es la prueba completa de fondo: destruir el lab de verdad parando los servicios y borrando los volúmenes originales, no solo simulándolo y levantarlo desde cero únicamente a partir de lo que hay en el repositorio de Restic, componente a componente, verificando al final que cada dato crítico (dashboards de Grafana, histórico de VictoriaMetrics, hosts de Zabbix, workflows de n8n) sobrevive intacto al ciclo completo.