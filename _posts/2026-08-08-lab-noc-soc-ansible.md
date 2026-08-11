---
title: "Lab NOC/SOC: de comandos manuales a IaC con Ansible"
date: 2026-08-14T18:0015:28+02:00
categories: [Homelab, DevOps, Ansible]
excerpt: "Los dos posts de Restic dejaron el lab con backups fiables y una prueba de destrucción de datos superada. Quedaba el siguiente hueco real: todo el proceso de construcción vivía en la cabeza y en el historial de bash, no en código. Este post documenta la migración a Ansible, rol a rol, y la prueba definitiva: destruir el host entero —no solo los datos— y reconstruirlo con un único comando."
card_image: /assets/images/cards/lab-noc-soc-ansible.png
---

Los dos posts sobre backups con Restic ([I](https://sergioib94.github.io/homelab/devops/backups/2026/08/04/lab-soc-noc-backup-1.html), [II](https://sergioib94.github.io/homelab/devops/backups/2026/08/04/lab-soc-noc-backup-2.html)) dejaron algo importante demostrado: los **datos** del lab sobreviven a una destrucción real. Pero todo el proceso para llegar a ese estado: instalar Docker, levantar cada stack, configurar Loki, provisionar la alerta de Grafana, seguía viviendo en mi cabeza y en el historial de bash. Nada de eso estaba versionado, y nada garantizaba que fuera reproducible en una máquina distinta a la mía.

Este post cubre la migración de todo el lab a Ansible: la estructura del repositorio, los 7 roles, el troubleshooting real de cada uno, y la prueba que de verdad importaba, no solo si el playbook corre sin errores, sino si es capaz de reconstruir el **host entero**, desde una máquina vacía con un único comando.

## Por qué Ansible y no Terraform, para esta parte

Terraform aprovisiona infraestructura, crea y destruye recursos por otro lado Ansible configura estado sobre algo que ya existe. Todo lo que hasta ahora hacía a mano en este lab (instalar paquetes, levantar `docker-compose.yml`, editar configs) es configuración, no aprovisionamiento, así que Ansible es la herramienta correcta para esta fase. Terraform entrará en juego el día que parte del lab viva fuera de esta máquina como por ejemplo en una VM de Azure, candidata natural dado que estoy preparandome el AZ-104.

## Estructura del repositorio

### Base del repositorio
 
Antes de escribir ningún rol, toca dejar Ansible operativo y el esqueleto del repositorio en su sitio.
 
**Instalación de Ansible** en la VM de WSL2:
 
```bash
sudo apt update
sudo apt install -y ansible
ansible --version
```

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

### Estructura

Empezamos con la creación del repositorio y la estructura base
 
```bash
mkdir -p ~/noc-soc-ansible/{inventory,group_vars/all,roles}
cd ~/noc-soc-ansible
git init
```
 
```bash
cat > ansible.cfg << 'EOF'
[defaults]
inventory = inventory/hosts.yml
roles_path = roles
host_key_checking = False
vault_password_file = .vault_pass
EOF
```
 
**Inventario**: como todo el lab corre en la misma VM de WSL2 donde se ejecuta Ansible, no hace falta SSH —conexión local:
 
```yaml
# inventory/hosts.yml
all:
  hosts:
    lab:
      ansible_connection: local
      ansible_python_interpreter: /usr/bin/python3
```

Comprobamos que se conecta correctamente:

```bash
ansible lab -m ping
# lab | SUCCESS => { "changed": false, "ping": "pong" }
```
 
**Colección de Docker**, necesaria para el módulo que levanta los `docker-compose.yml`:
 
```bash
ansible-galaxy collection install community.docker
```
 
```yaml
# requirements.yml
collections:
  - name: community.docker
    version: ">=3.0.0"
```

Fijar la versión en requirements.yml (en vez de depender de lo que tengas instalado en este momento) es lo que hace el repo reproducible en otra máquina
 
**Configuración de Vault**

Antes de tocar código, hay que decidir la contraseña maestra del vault y crear el fichero de secretos vacío, para que desde el primer commit ya tengamos el hábito de nunca escribir una credencial en texto plano:
 
```bash
mkdir -p group_vars/all
ansible-vault create group_vars/all/vault.yml
```

Pedirá la contraseña del vault (guardada en un gestor de contraseñas, no en el repo) y abrirá un editor en el que dejaremos una primera entrada de pruebas:

```bash
vault_test: "vault funcionando"
```

Verificamos que se puede leer:

```bash
ansible-vault view group_vars/all/vault.yml
```
 
**Esqueleto de los 7 roles**, vacíos por ahora:
 
```bash
cd roles
for role in docker_base restic zabbix_stack monitoring_stack logging_stack automation_stack backup_alerting; do
  ansible-galaxy init "$role"
done
cd ..
```

ansible-galaxy init genera la estructura estándar de cada rol (tasks/, handlers/, templates/, defaults/, meta/) para que no tengas que crearla a mano, se queda vacía de lógica, lista para rellenar.
 
**Variables globales**:
 
```yaml
# group_vars/all/vars.yml
lab_user: sergioib
noc_soc_home: "/home/{{ lab_user }}/noc-soc"
restic_repo_local: "/mnt/c/Users/sergio.ib/noc-soc-backups/restic-repo"
restic_repo_remote: "b2:noc-soc-restic-backup:restic-repo"
```
 
**Playbook principal**, con los 7 roles ya referenciados y etiquetados:
 
```yaml
# site.yml
- name: Provisionar el lab NOC/SOC completo
  hosts: lab
  become: true
  roles:
    - docker_base
    - { role: restic, tags: restic }
    - { role: zabbix_stack, tags: zabbix_stack }
    - { role: monitoring_stack, tags: monitoring_stack }
    - { role: logging_stack, tags: logging_stack }
    - { role: automation_stack, tags: automation_stack }
    - { role: backup_alerting, tags: backup_alerting }
```
 
**Publicación en GitHub**, vía SSH (más cómodo que tokens HTTPS para iterar sin fricción):
 
```bash
ssh-keygen -t ed25519 -C "sergioib94@users.noreply.github.com"
# clave pública añadida en GitHub → Settings → SSH and GPG keys
 
git config --global user.name "sergioib94"
git config --global user.email "sergioib94@users.noreply.github.com"
git remote add origin git@github.com:sergioib94/noc-soc-ansible.git
git add .
git commit -m "Estructura base del repositorio Ansible para el lab NOC/SOC"
git push -u origin main
```
 
## Construcción de los 7 roles
 
Cada rol traduce a tareas idempotentes lo que hasta ahora hacía a mano, documentado paso a paso en los posts anteriores.
 
### Rol `docker_base`
 
Instala Docker Engine y el plugin de Compose, crea la red compartida entre stacks y el directorio base del lab:

```yaml
# roles/docker_base/defaults/main.yml
---
docker_users:
  - "{{ lab_user }}"
```

roles/docker_base/tasks/main.yml: Traduce a tareas idempotentes lo que en su día fue instalación manual, el objetivo es que ejecutar esto en una máquina nueva deje Docker exactamente como lo tienes ahora:

```yaml
# roles/docker_base/tasks/main.yml
---
- name: Instalar dependencias previas
  ansible.builtin.apt:
    name:
      - ca-certificates
      - curl
      - gnupg
    state: present
    update_cache: true

- name: Crear directorio para la clave GPG de Docker
  ansible.builtin.file:
    path: /etc/apt/keyrings
    state: directory
    mode: "0755"

- name: Descargar la clave GPG oficial de Docker
  ansible.builtin.get_url:
    url: https://download.docker.com/linux/ubuntu/gpg
    dest: /etc/apt/keyrings/docker.asc
    mode: "0644"

- name: Añadir el repositorio de Docker
  ansible.builtin.apt_repository:
    repo: >-
      deb [arch={{ 'amd64' if ansible_architecture == 'x86_64' else ansible_architecture }}
      signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu
      {{ ansible_distribution_release }} stable
    state: present
    filename: docker

- name: Instalar Docker Engine y el plugin de Compose
  ansible.builtin.apt:
    name:
      - docker-ce
      - docker-ce-cli
      - containerd.io
      - docker-compose-plugin
    state: present
    update_cache: true

- name: Asegurar que el servicio Docker está activo y habilitado
  ansible.builtin.systemd:
    name: docker
    state: started
    enabled: true

- name: Añadir usuarios al grupo docker
  ansible.builtin.user:
    name: "{{ item }}"
    groups: docker
    append: true
  loop: "{{ docker_users }}"

- name: Crear el directorio base del lab
  ansible.builtin.file:
    path: "{{ noc_soc_home }}"
    state: directory
    owner: "{{ ansible_user_id }}"
    mode: "0755"

- name: Crear la red Docker compartida del lab
  community.docker.docker_network:
    name: noc-soc-shared
    state: present
```

**Nota:** En el paso del grupo Docker, si el usuario aún no pertenecía a ese grupo el cambio no surte efecto hasta la siguiente sesión de login.

### Rol `restic`
 
Instala el binario en una versión fija, guarda las credenciales cifradas, inicializa ambos repositorios y despliega el script de backup como plantilla:

```yaml
# roles/restic/defaults/main.yml
---
restic_version: "0.17.3"
restic_binary_path: /usr/local/bin/restic
```

Fija la versión explícitamente en vez de instalar "la última" para que el rol sea reproducible.
 
```yaml
# roles/restic/tasks/main.yml (resumen)
---
- name: Comprobar si Restic ya está instalado con la versión correcta
  ansible.builtin.command: "{{ restic_binary_path }} version"
  register: restic_check
  changed_when: false
  failed_when: false

- name: Instalar bzip2 (necesario para descomprimir el binario de Restic)
  ansible.builtin.apt:
    name: bzip2
    state: present
  when: restic_version not in (restic_check.stdout | default(''))

- name: Descargar el binario de Restic
  ansible.builtin.get_url:
    url: "https://github.com/restic/restic/releases/download/v{{ restic_version }}/restic_{{ restic_version }}_linux_amd64.bz2"
    dest: "/tmp/restic_{{ restic_version }}_linux_amd64.bz2"
    mode: "0644"
  when: restic_version not in (restic_check.stdout | default(''))

- name: Descomprimir el binario
  ansible.builtin.command: "bunzip2 -f /tmp/restic_{{ restic_version }}_linux_amd64.bz2"
  args:
    creates: "/tmp/restic_{{ restic_version }}_linux_amd64"
  when: restic_version not in (restic_check.stdout | default(''))

- name: Instalar el binario en el PATH
  ansible.builtin.copy:
    src: "/tmp/restic_{{ restic_version }}_linux_amd64"
    dest: "{{ restic_binary_path }}"
    mode: "0755"
    remote_src: true
  when: restic_version not in (restic_check.stdout | default(''))

- name: Guardar la contraseña del repositorio Restic
  ansible.builtin.copy:
    content: "{{ vault_restic_password }}"
    dest: "/home/{{ lab_user }}/.restic-password"
    owner: "{{ lab_user }}"
    mode: "0600"
  no_log: true

- name: Guardar las credenciales de Backblaze B2
  ansible.builtin.template:
    src: b2-credentials.j2
    dest: "/home/{{ lab_user }}/.b2-credentials"
    owner: "{{ lab_user }}"
    mode: "0600"
  no_log: true

- name: Inicializar el repositorio local de Restic (si no existe)
  ansible.builtin.command: "{{ restic_binary_path }} init"
  environment:
    RESTIC_REPOSITORY: "{{ restic_repo_local }}"
    RESTIC_PASSWORD_FILE: "/home/{{ lab_user }}/.restic-password"
  register: restic_init_local
  failed_when:
    - restic_init_local.rc != 0
    - "'config file already exists' not in restic_init_local.stderr"
  changed_when: "'created restic repository' in restic_init_local.stdout"

- name: Desplegar el script de backup
  ansible.builtin.template:
    src: backup_restic.sh.j2
    dest: "{{ noc_soc_home }}/backup_restic.sh"
    owner: "{{ lab_user }}"
    mode: "0750"
```
 
```jinja2
# roles/restic/templates/b2-credentials.j2
export B2_ACCOUNT_ID="{{ vault_b2_account_id }}"
export B2_ACCOUNT_KEY="{{ vault_b2_account_key }}"
```

```jinja2
# roles/restic/templates/backup_restic.sh.j2
#!/bin/bash
set -euo pipefail

source /home/{{ ansible_user_id }}/.b2-credentials
export RESTIC_PASSWORD_FILE="/home/{{ ansible_user_id }}/.restic-password"

VOLUME_PATHS=(
  "{{ noc_soc_home }}/backups/tmp"
  /var/lib/docker/volumes/automation_n8n-data/_data
  /var/lib/docker/volumes/logging_loki-data/_data
  /var/lib/docker/volumes/monitoring_grafana-storage/_data
  /var/lib/docker/volumes/monitoring_victoriametrics-data/_data
)

BACKUP_OK=1

echo "Volcando Zabbix (Postgres)..."
mkdir -p "{{ noc_soc_home }}/backups/tmp"
docker exec zabbix-postgres-server-1 pg_dumpall -U zabbix > "{{ noc_soc_home }}/backups/tmp/zabbix_pgdump.sql"

echo "Ejecutando restic backup (local)..."
export RESTIC_REPOSITORY="{{ restic_repo_local }}"
restic backup "${VOLUME_PATHS[@]}" --tag noc-soc --tag "$(date +%Y%m%d)" || true
rc=$?
if [ $rc -eq 3 ]; then
  echo "AVISO: backup local completado con algunos ficheros no leíbles (normal en volúmenes activos como VictoriaMetrics)"
elif [ $rc -ne 0 ]; then
  echo "FALLO en restic backup (local)"
  BACKUP_OK=0
fi

echo "Ejecutando restic backup (B2)..."
export RESTIC_REPOSITORY="{{ restic_repo_remote }}"
restic backup "${VOLUME_PATHS[@]}" --tag noc-soc --tag "$(date +%Y%m%d)" || true
rc=$?
if [ $rc -eq 3 ]; then
  echo "AVISO: backup B2 completado con algunos ficheros no leíbles (normal en volúmenes activos como VictoriaMetrics)"
elif [ $rc -ne 0 ]; then
  echo "FALLO en restic backup (B2)"
  BACKUP_OK=0
fi

echo "Aplicando política de retención (local)..."
export RESTIC_REPOSITORY="{{ restic_repo_local }}"
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune

echo "Aplicando política de retención (B2)..."
export RESTIC_REPOSITORY="{{ restic_repo_remote }}"
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune

echo "Verificando integridad del repositorio (local)..."
export RESTIC_REPOSITORY="{{ restic_repo_local }}"
restic check

echo "Verificando integridad del repositorio (B2)..."
export RESTIC_REPOSITORY="{{ restic_repo_remote }}"
restic check

mkdir -p /var/lib/node_exporter/textfile_collector
cat <<EOM > /var/lib/node_exporter/textfile_collector/backup_status.prom
backup_last_run_timestamp $(date +%s)
backup_last_run_success $BACKUP_OK
EOM

echo "Backup con Restic completado (éxito: $BACKUP_OK)"
```

Aquí es donde entra el script ya corregido de la Parte 2 (con el manejo de exit code 3), ahora como plantilla.

Una vez configurado el fichero, debemos añadir las variables del vault correspondiente:

```bash
ansible-vault edit group_vars/all/vault.yml --vault-password-file .vault_pass
```

```yaml
vault_test: "vault funcionando"
vault_restic_password: "tu-contraseña-real-de-restic"
vault_b2_account_id: "tu-account-id-real"
vault_b2_account_key: "tu-account-key-real"
```

Probamos solo estos dos roles antes de seguir con el resto para ir validando los roles por partes:

```bash
ansible-playbook site.yml --check --ask-become-pass --diff
```
 
### `monitoring_stack`
 
VictoriaMetrics, Grafana, node-exporter y cadvisor, copiados fielmente del compose real —incluido el montaje del textfile_collector en node-exporter (el mecanismo que expone `backup_last_run_success`) y el directorio de provisioning de Grafana:

```yaml
# roles/monitoring_stack/defaults/main.yml
---
monitoring_dir: "{{ noc_soc_home }}/monitoring"
grafana_admin_user: admin
```
 
```yaml
# roles/monitoring_stack/tasks/main.yml
---
- name: Crear el directorio del stack de monitoring
  ansible.builtin.file:
    path: "{{ monitoring_dir }}"
    state: directory
    owner: "{{ lab_user }}"
    mode: "0755"

- name: Desplegar el docker-compose.yml de monitoring
  ansible.builtin.template:
    src: docker-compose.yml.j2
    dest: "{{ monitoring_dir }}/docker-compose.yml"
    owner: "{{ lab_user }}"
    mode: "0644"
  register: monitoring_compose_file

- name: Desplegar la config de scrape (victoriametrics.yml)
  ansible.builtin.template:
    src: victoriametrics.yml.j2
    dest: "{{ monitoring_dir }}/victoriametrics.yml"
    owner: "{{ lab_user }}"
    mode: "0644"
  register: monitoring_scrape_config

- name: Levantar el stack de monitoring
  community.docker.docker_compose_v2:
    project_src: "{{ monitoring_dir }}"
    state: present
    recreate: "{{ 'always' if (monitoring_compose_file.changed or monitoring_scrape_config.changed) else 'auto' }}"
```
 
El recreate condicional es la pieza clave del patrón: si cambia el compose o el config de scrape, fuerza a recrear los contenedores para que el cambio surta efecto; si no cambió nada, Ansible no reinicia servicios innecesariamente en cada ejecución, esto es lo que hace que el playbook sea seguro de correr repetidamente sin causar downtime evitable.

```yaml
# roles/monitoring_stack/templates/docker-compose.yml.j2
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
    volumes:
      - /var/lib/node_exporter/textfile_collector:/var/lib/node_exporter/textfile_collector:ro
    command:
      - "--collector.textfile.directory=/var/lib/node_exporter/textfile_collector"
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

```yaml
# roles/monitoring_stack/templates/victoriametrics.yml.j2
---
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: 'node-exporter'
    static_configs: [{targets: ['node-exporter:9100']}]
  - job_name: 'cadvisor'
    static_configs: [{targets: ['cadvisor:8080']}]
```

Promabos el rol igual que hemos hecho anteriormente:

```bash
ansible-playbook site.yml --ask-become-pass --diff --tags monitoring_stack
```
 
### `logging_stack`
 
Loki + Alloy, con el `discovery.docker` y el relabeling que ya se corrigió en la Parte 2 de los posts de backup —Alloy sin eso solo veía logs del sistema, no de los contenedores:

```yml
# roles/logging_stack/defaults/main.yml
---
logging_dir: "{{ noc_soc_home }}/logging"
```

```yml
# roles/logging_stack/tasks/main.yml
---
- name: Crear el directorio del stack de logging
  ansible.builtin.file:
    path: "{{ logging_dir }}"
    state: directory
    owner: "{{ lab_user }}"
    mode: "0755"

- name: Desplegar el docker-compose.yml de logging
  ansible.builtin.template:
    src: docker-compose.yml.j2
    dest: "{{ logging_dir }}/docker-compose.yml"
    owner: "{{ lab_user }}"
    mode: "0644"
  register: logging_compose_file

- name: Desplegar la config de Alloy
  ansible.builtin.template:
    src: alloy-config.alloy.j2
    dest: "{{ logging_dir }}/alloy-config.alloy"
    owner: "{{ lab_user }}"
    mode: "0644"
  register: logging_alloy_config

- name: Levantar el stack de logging
  community.docker.docker_compose_v2:
    project_src: "{{ logging_dir }}"
    state: present
    recreate: "{{ 'always' if (logging_compose_file.changed or logging_alloy_config.changed) else 'auto' }}"
```

```yml
# roles/logging_stack/templates/docker-compose.yml.j2
---
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki
    restart: unless-stopped

  #promtail:
  # image: grafana/promtail:latest
  #ports:
  # - "9080:9080"
  #volumes:
  # - /var/log:/var/log:ro
  #- ./promtail-config.yml:/etc/promtail/config.yml
  #command: -config.file=/etc/promtail/config.yml
  #restart: unless-stopped

  alloy:
    image: grafana/alloy:latest
    ports: ["12345:12345"]
    volumes:
      - /var/log:/var/log:ro
      - ./alloy-config.alloy:/etc/alloy/config.alloy
      - /var/run/docker.sock:/var/run/docker.sock:ro
    command: run --server.http.listen-addr=0.0.0.0:12345 /etc/alloy/config.alloy
    restart: unless-stopped

networks:
  default:
    name: noc-soc-shared
    external: true

volumes:
  loki-data:
```

```hlc
# roles/logging_stack/templates/alloy-config.alloy.j2 (fragmento)
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

Comprobamos el rol:

```bash
ansible-playbook site.yml --ask-become-pass --diff --tags logging_stack
```

### `automation_stack`
 
n8n, el rol más simple de los siete un único servicio, sin red compartida (sus integraciones son por API externa, no contenedores internos):

```yaml
# roles/automation_stack/defaults/main.yml
---
automation_dir: "{{ noc_soc_home }}/automation"
```

```yaml
# roles/automation_stack/tasks/main.yml
---
- name: Crear el directorio del stack de automation
  ansible.builtin.file:
    path: "{{ automation_dir }}"
    state: directory
    owner: "{{ lab_user }}"
    mode: "0755"

- name: Desplegar el docker-compose.yml de automation
  ansible.builtin.template:
    src: docker-compose.yml.j2
    dest: "{{ automation_dir }}/docker-compose.yml"
    owner: "{{ lab_user }}"
    mode: "0644"
  register: automation_compose_file

- name: Levantar el stack de automation
  community.docker.docker_compose_v2:
    project_src: "{{ automation_dir }}"
    state: present
    recreate: "{{ 'always' if automation_compose_file.changed else 'auto' }}"
```

```yaml
# roles/automation_stack/templates/docker-compose.yml.j2
services:
  n8n:
    image: n8nio/n8n:latest
    ports: ["5678:5678"]
    environment:
      - N8N_SECURE_COOKIE=false
    volumes:
      - n8n-data:/home/node/.n8n
    restart: unless-stopped
 
volumes:
  n8n-data:
```

Realizamos la comprobacion del rol:

```bash
ansible-playbook site.yml --ask-become-pass --diff --tags automation_stack
```
 
Este fue el único rol que quedó `changed=0` desde el primer intento —la plantilla coincidió byte a byte con el compose real.
 
### `backup_alerting`
 
La regla de alerta de Grafana ("Failed Backup", el ciclo Normal → Pending → Firing sobre `backup_last_run_success`) exportada vía la API de provisioning y desplegada como fichero, más el cron diario del backup:
 
```yaml
# roles/backup_alerting/tasks/main.yml
- name: Desplegar la regla de alerta de backup fallido
  ansible.builtin.template:
    src: backup-alert.yaml.j2
    dest: "{{ noc_soc_home }}/monitoring/provisioning/alerting/backup-alert.yaml"
 
- name: Programar la ejecución diaria del backup
  ansible.builtin.cron:
    name: "Backup NOC-SOC con Restic"
    minute: "0"
    hour: "3"
    job: "{{ noc_soc_home }}/backup_restic.sh >> /var/log/noc-soc-backup.log 2>&1"
    user: root
```
 
La regla, en `backup-alert.yaml.j2`, reproduce exactamente las dos condiciones que ya se explicaban en el post de la Parte 1 de backups: `backup_last_run_success < 1` o `time() - backup_last_run_timestamp > 93600` (26 horas), combinadas con un `math` de tipo OR, `for: 5m`. Tras aplicarla, `"provenance": "file"` en la API de Grafana confirma que la regla ya se gestiona desde el fichero, no desde la UI.

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