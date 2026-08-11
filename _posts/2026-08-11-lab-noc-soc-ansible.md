---
title: "Lab NOC/SOC: de comandos manuales a IaC con Ansible"
date: 2026-08-07T18:0015:28+02:00
categories: [Homelab, DevOps, Ansible]
excerpt: "Los dos posts de Restic dejaron el lab con backups fiables y una prueba de destrucción de datos superada. Quedaba el siguiente hueco real: todo el proceso de construcción vivía en la cabeza y en el historial de bash, no en código. Este post documenta la migración a Ansible, rol a rol, y la prueba definitiva: destruir el host entero —no solo los datos— y reconstruirlo con un único comando."
card_image: /assets/images/cards/lab-noc-soc-ansible.png
---

Los dos posts sobre backups con Restic ([I](https://sergioib94.github.io/homelab/devops/backups/2026/08/04/lab-soc-noc-backup-1.html), [II](https://sergioib94.github.io/homelab/devops/backups/2026/08/04/lab-soc-noc-backup-2.html)) dejaron algo importante demostrado: los **datos** del lab sobreviven a una destrucción real. Pero todo el proceso para llegar a ese estado: instalar Docker, levantar cada stack, configurar Loki, provisionar la alerta de Grafana, seguía viviendo en mi cabeza y en el historial de bash. Nada de eso estaba versionado, y nada garantizaba que fuera reproducible en una máquina distinta a la mía.

Este post cubre la migración de todo el lab a Ansible: la estructura del repositorio, los 7 roles, el troubleshooting real de cada uno, y la prueba que de verdad importaba, no solo si el playbook corre sin errores, sino si es capaz de reconstruir el **host entero**, desde una máquina vacía con un único comando.

## Por qué Ansible y no Terraform, para esta parte

Terraform aprovisiona infraestructura, crea y destruye recursos por otro lado Ansible configura estado sobre algo que ya existe. Todo lo que hasta ahora hacía a mano en este lab (instalar paquetes, levantar `docker-compose.yml`, editar configs) es configuración, no aprovisionamiento, así que Ansible es la herramienta correcta para esta fase. Terraform entrará en juego el día que parte del lab viva fuera de esta máquina como por ejemplo en una VM de Azure, candidata natural dado que estoy preparandome el AZ-104.

## Estructura del repositorio

```
noc-soc-ansible/
├── ansible.cfg
├── requirements.yml
├── inventory/hosts.yml
├── group_vars/all/
│   ├── vars.yml       # variables en claro
│   └── vault.yml      # secretos, cifrados con ansible-vault
├── roles/
│   ├── docker_base/
│   ├── restic/
│   ├── zabbix_stack/
│   ├── monitoring_stack/
│   ├── logging_stack/
│   ├── automation_stack/
│   └── backup_alerting/
└── site.yml
```

Cada rol mapea 1:1 con una sección de los posts anteriores. `docker_base` instala Docker y crea la red compartida `noc-soc-shared`; `restic` instala el binario, inicializa los repositorios y despliega el script de backup como plantilla; los cuatro roles de stack (`zabbix_stack`, `monitoring_stack`, `logging_stack`, `automation_stack`) despliegan cada `docker-compose.yml` y lo levantan vía el módulo `community.docker.docker_compose_v2`; `backup_alerting` provisiona por código la regla de alerta de Grafana y el cron diario del backup.

Los secretos como contraseña de Restic, credenciales de B2, contraseña de Postgres de Zabbix, viven cifrados en `group_vars/all/vault.yml`, nunca en texto plano en el repo.

## Troubleshooting real durante la construcción de los roles

Cada rol trajo su propia fricción. Merece la pena documentarla, porque es exactamente el tipo de detalle que se pierde si el proceso solo vive en la memoria.

**`ansible_user_id` no es fiable con `become: true` a nivel de play.** Con `become` aplicado, los hechos se recogen ya como el usuario elevado, así que `ansible_user_id` valía `root`, no `sergioib`, y el directorio del lab se creó en `/home/root/noc-soc`. Arreglo: una variable explícita `lab_user`, independiente de los hechos de Ansible.

**Los nombres de servicio de Compose no coinciden con los nombres de contenedor.** `docker compose stop/up` necesitan el nombre de servicio (`postgres-server`), no el de contenedor (`zabbix-postgres-server-1`), el mismo problema que ya salió en la Parte 2 de los posts de backup, ahora resuelto de forma permanente en el código con `docker compose config --services`.

**`--check` no es fiable con instalaciones encadenadas.** El rol de Restic (descarga → descompresión → copia del binario) falla en modo dry-run porque cada paso "simula" el resultado sin ejecutar nada real, y el siguiente paso depende de un fichero que nunca se creó. Validar ese rol requiere `--diff` sin `--check`.

**Una dependencia implícita que nunca se había notado: `bzip2`.** El binario de Restic se distribuye como `.bz2`, y `bunzip2` no viene en una instalación mínima de Ubuntu. Nunca lo eché en falta a mano porque ya estaba instalado por otra cosa invisible hasta que Ansible fuerza una instalación limpia y lo revela.

**`zabbix_stack` necesita un arranque secuencial real, no solo `depends_on`.** `depends_on` en Compose solo garantiza el orden de arranque de los contenedores, no que el servicio interno esté listo. Postgres necesita estar aceptando conexiones antes de que `zabbix-server` intente conectarse así que el rol levanta `postgres-server` en un paso separado, con una espera activa vía `pg_isready` ejecutado dentro del propio contenedor (no `wait_for` contra el host, porque ese servicio no publica su puerto fuera de la red Docker interna).

**Una pérdida de configuración real por una plantilla incompleta.** Al construir `monitoring_stack`, la primera versión de la plantilla del compose no incluía el volumen del textfile_collector de node-exporter, el mecanismo que expone `backup_last_run_success` a VictoriaMetrics. Ansible, al aplicar la plantilla, recreó el contenedor **sin ese volumen**, y el dashboard de "último backup" dejó de recibir datos. La lección: cuando Ansible reporta `changed`, el `--diff` no es opcional, hay que leerlo con atención antes de asumir que el cambio es benigno.

**La regla de alerta de Grafana, provisionada por código.** Exportada vía la API de provisioning (`/api/v1/provisioning/alert-rules`) y desplegada como fichero YAML montado en `/etc/grafana/provisioning/alerting/`. Tras aplicarla, `"provenance": "file"` confirma que Grafana la gestiona desde el fichero, no desde la UI.

## Prueba 1 y 2: ejecución completa e idempotencia

Antes de la prueba de destrucción, dos validaciones más simples pero igual de necesarias.

**Ejecución completa, sin tags**, con los 7 roles aplicándose en el orden real de dependencias:

```bash
ansible-playbook site.yml --ask-become-pass --diff
```

Resultado: `ok=34, changed=0, failed=0, skipped=4` (los 4 `skipped` son los pasos condicionales de instalación de Restic, que se saltan porque la versión ya coincide).

![Recap de la ejecución completa: ok=34, changed=0, failed=0](/assets/images/lab-noc-soc-ansible/prueba1-completa.png)

**Idempotencia**: relanzar el mismo comando inmediatamente después, sin cambiar nada.

```bash
ansible-playbook site.yml --ask-become-pass --diff
```

Resultado idéntico: `changed=0` en la segunda pasada. 

![Recap de la segunda ejecución, idéntico al anterior](/assets/images/lab-noc-soc-ansible/prueba2-idempotencia.png)

La propiedad que define si algo es IaC de verdad, ejecutar el mismo playbook dos veces no debería producir ningún cambio la segunda vez queda confirmada con datos reales, no solo como afirmación.

## Hipótesis de la Prueba 3

Con el mecanismo ya validado en ejecución repetida, quedaba la prueba de fondo: no destruir solo los volúmenes de datos (ya hecho en la Parte 2 de los posts de backup), sino el **host entero**, toda la configuración de aplicación y Docker mismo y reconstruirlo con un único comando.

- **La infraestructura** (Docker, red, los 7 stacks) se reconstruirá sin fricción real, dado que ya está validada en las Pruebas 1 y 2.

- **La restauración de datos** seguirá siendo un paso manual, porque ningún rol la cubre (hallazgo esperado), no una carencia a corregir en esta pasada.

- **Zabbix** puede tropezar de nuevo con algo relacionado al arranque desde volumen vacío, dado que la imagen de Postgres tiene comportamiento propio en el primer arranque que puede chocar con `pg_dumpall`.

- **Loki** es el componente de mayor riesgo, dado su historial de fragilidad con el WAL en ambos posts anteriores.

## Fase 1: evidencia antes

```bash
docker exec zabbix-postgres-server-1 psql -U zabbix -c "SELECT count(*) FROM hosts;"
docker exec zabbix-postgres-server-1 psql -U zabbix -c "SELECT count(*) FROM triggers;"
curl -s -H "Authorization: Bearer <token>" http://localhost:3000/api/search?type=dash-db | jq '. | length'
curl -s -H "Authorization: Bearer <token>" http://localhost:3000/api/datasources | jq '.[].name'
curl -s 'http://localhost:8428/api/v1/query?query=count(up)'
curl -s 'http://localhost:8428/api/v1/label/__name__/values' | jq '.data | length'
curl -s -G 'http://localhost:3100/loki/api/v1/query_range' --data-urlencode 'query={job=~".+"}' --data-urlencode 'limit=1' | jq '.data.result | length'
curl -s -G 'http://localhost:3100/loki/api/v1/label/container/values' | jq
docker exec automation-n8n-1 n8n list:workflow --active=true
crontab -l
curl -s -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/provisioning/alert-rules | jq '.[] | select(.title=="Failed Backup")'
```

Baseline capturado: 409 hosts, 6927 triggers, 4 dashboards, 4 datasources, `count(up)=2`, 387 series, 6 contenedores con logs en Loki, workflow activo `JzRIkp8Yj0Rih5Q2`, cron instalado para `root`, alerta con `datasourceUid: dfsoxl3imcqo0a`.

![Baseline completo capturado antes de destruir nada](/assets/images/lab-noc-soc-ansible/fase1-baseline.png)

*Troubleshooting: el backup de la Fase 2 falló con `wrong password or no key found` en ambos repositorios.* Al revisar el vault, `vault_restic_password` seguía teniendo el valor de marcador (`"usuario"`) puesto durante la construcción inicial del rol, nunca corregido con la contraseña real. Peor aún: `site.yml` tenía el rol `restic` sin su tag correspondiente, así que un primer intento de corrección con `ansible-playbook --tags restic` no aplicó ningún cambio real, el playbook se saltó el rol entero sin avisar. Con el tag añadido y la contraseña real localizada (afortunadamente, sí estaba anotada fuera del sistema), el backup local se resolvió. El repositorio B2 dio un segundo problema independiente, 401 en `b2_authorize_account` resuelto regenerando la Application Key desde la consola de Backblaze. Ambos incidentes confirman por qué un valor de marcador nunca debería quedar en un vault sin verificar que abre de verdad lo que dice proteger.

## Fase 2: backup fresco garantizado

```bash
sudo -E ~/noc-soc/backup_restic.sh
restic snapshots --repo /mnt/c/Users/sergio.ib/noc-soc-backups/restic-repo
restic snapshots --repo b2:noc-soc-restic-backup:restic-repo
```

Con ambos repositorios confirmados y snapshot fresco anotado, red de seguridad real antes de destruir nada.

## Fase 3: destrucción total del host

```bash
docker compose -f zabbix/docker-compose.yml down -v
docker compose -f monitoring/docker-compose.yml down -v
docker compose -f logging/docker-compose.yml down -v
docker compose -f automation/docker-compose.yml down -v
docker network rm noc-soc-shared

rm -rf ~/noc-soc
sudo crontab -r -u root
rm -f ~/.restic-password ~/.b2-credentials

sudo apt remove -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo apt autoremove -y
sudo rm -rf /var/lib/docker /etc/docker
sudo rm -f /etc/apt/sources.list.d/docker.list /etc/apt/keyrings/docker.asc
sudo gpasswd -d sergioib docker
```

Verificación: `which docker` sin resultado, `~/noc-soc` inexistente. El host quedó limpio de verdad, no solo "parado" , a diferencia de la Parte 2 aquí no sobrevive ni Docker ni ningún fichero de configuración.

![Verificación de que el host quedó realmente limpio: sin Docker, sin ~/noc-soc](/assets/images/lab-noc-soc-ansible/fase3-host-limpio.png)

## Fase 4: reconstrucción íntegra

```bash
cd ~/noc-soc-ansible
ansible-playbook site.yml --ask-become-pass --diff
```

*Troubleshooting: `permission denied while trying to connect to the docker API` tras la reinstalación.* El propio rol `docker_base` reañade al usuario al grupo `docker`, pero un cambio de grupo no surte efecto en una sesión de shell ya abierta, el kernel no reevalúa los grupos de un proceso en marcha. Cerrar y reabrir la terminal (o `newgrp docker` para verificar sin reiniciar del todo) resolvió el problema. Es el mismo tipo de fricción invisible en ejecuciones incrementales que solo aparece al reconstruir un host realmente virgen.

![Error de permisos contra el socket de Docker tras la reinstalación](/assets/images/lab-noc-soc-ansible/permission-denied-docker.png)

Con la sesión corregida, infraestructura confirmada arriba pero con volúmenes vacíos, 402 hosts (correspondientes a las plantillas por defecto de Zabbix 7.0, no a datos reales) antes de restaurar nada.

*Troubleshooting: la restauración de Zabbix perdió 7 hosts y 48 triggers en el primer intento.* El dump SQL, verificado línea a línea contra el fichero (`awk` sobre el bloque `COPY public.hosts`), contenía los 409/6927 correctos, el problema no estaba en el backup, sino en su aplicación. La imagen `postgres:16-alpine`, al arrancar con `POSTGRES_DB=zabbix` sobre un volumen vacío, se autoinicializa creando ya el rol y la base `zabbix` antes de que el dump se aplicara encima. El `pg_dumpall`, que también incluye sus propias sentencias `CREATE ROLE`/`CREATE DATABASE`, chocó parcialmente con lo ya creado, y `psql` sin `ON_ERROR_STOP` siguió adelante en silencio tras cada conflicto puntual, dejando algunas filas sin insertar. Arreglo: `DROP DATABASE zabbix`, filtrar la sentencia `CREATE ROLE zabbix` del propio dump (el rol ya existe, generado por la imagen, y no puede eliminarse estando conectado como sí mismo), y reaplicar con `-v ON_ERROR_STOP=1` para que cualquier conflicto futuro pare la ejecución en vez de pasar desapercibido:

```bash
sudo sed '/^CREATE ROLE zabbix;/d' zabbix_pgdump.sql \
  | docker exec -i zabbix-postgres-server-1 psql -U zabbix -d template1 -v ON_ERROR_STOP=1
```

Resultado: 409 hosts, 6927 triggers, coincidencia exacta.

*Troubleshooting: Loki repitió el bucle de reinicio por WAL no secuencial, pese a haber parado el contenedor antes de restaurar, la misma lección aplicada de la Parte 1.* Este fue el hallazgo más interesante de toda la prueba: parar el contenedor antes de restaurar no basta si el propio snapshot capturó a Loki con escritura activa en el WAL en el momento del backup. Un primer intento de limpiar solo el directorio `wal/` no resolvió nada; la solución real fue reinicializar el volumen completo desde cero y restaurar de nuevo:

![Log de Loki con "get segment range: segments are not sequential" tras la restauración](/assets/images/lab-noc-soc-ansible/loki-wal-error.png)

```bash
docker compose -f logging/docker-compose.yml stop loki
docker compose -f logging/docker-compose.yml rm -f loki
sudo find /var/lib/docker/volumes/logging_loki-data/_data -mindepth 1 -delete
sudo -E restic restore latest --target / --include /var/lib/docker/volumes/logging_loki-data/_data
docker compose -f logging/docker-compose.yml up -d loki
```

Con esto, Loki arrancó limpio. La lección revisada respecto a la Parte 1: parar el contenedor antes de restaurar reduce el riesgo, pero la garantía real de consistencia exige parar Loki **antes de ejecutar el backup**, no solo antes de restaurarlo.

## Fase 5: verificación

| Componente | Métrica | Fase 1 (antes) | Fase 5 (después) | Resultado |
|---|---|---|---|---|
| Zabbix | Hosts | 409 | 409 | Idéntico |
| Zabbix | Triggers | 6927 | 6927 | Idéntico (tras el fix del rol autocreado) |
| Grafana | Dashboards | 4 | 4 | Idéntico |
| Grafana | Datasources | 4 | 4 | Idéntico |
| Grafana | Alerta "Failed Backup", `datasourceUid` | `dfsoxl3imcqo0a` | `dfsoxl3imcqo0a` | Idéntico (sin regenerar UID) |
| VictoriaMetrics | `count(up)` | 2 | 2 | Idéntico |
| VictoriaMetrics | Series (`__name__`) | 387 | 387 | Idéntico |
| Loki | Query reciente con resultado | 1 | 1 | Idéntico (tras reinicializar el volumen) |
| Loki | Contenedores con label `container` | 6 | 6 | Idéntico |
| n8n | Workflow activo | `JzRIkp8Yj0Rih5Q2` | `JzRIkp8Yj0Rih5Q2` | Idéntico |
| Cron | Backup diario (root) | presente | presente | Idéntico |

![Verificación final: Loki con los 6 contenedores y length=1, tras reinicializar el volumen](/assets/images/lab-noc-soc-ansible/fase5-verificacion.png)

## El host es reconstruible, con matices honestos

La infraestructura: Docker, red, los 7 stacks, la alerta de Grafana, el cron, se reconstruyó sin fricción real más allá de un problema de sesión de grupo, esperable y ya documentado. Los datos, una vez más, sobrevivieron por completo, pero no sin trabajo: dos incidentes reales (el conflicto de rol autocreado en Postgres, y una recaída del problema de WAL en Loki que ya se creía resuelto) demuestran que "funcionó en la Parte 2" no es garantía permanente, y que cada prueba de restauración real puede seguir revelando matices nuevos incluso sobre problemas ya conocidos.

Lo que este post no resuelve, y queda como línea abierta: la restauración de datos sigue siendo manual, fuera de cualquier rol de Ansible. Automatizarla, un rol `restic_restore` que aplique la misma secuencia documentada aquí es el candidato más claro para una próxima iteración, junto con Terraform el día que el lab deje de vivir enteramente en esta máquina.