---
title: "Lab NOC/SOC para equipo de bajos recursos"
date: 2026-07-11T19:55:00+02:00
categories: [Homelab, Monitorización, DevOps]
excerpt: "Construye un laboratorio NOC/SOC con Docker, Zabbix, Prometheus, Grafana, Loki, n8n y Jira. Una guía práctica para crear un entorno de monitorización, observabilidad y automatización en hardware de recursos limitados."
card_image: /assets/images/cards/lab-noc-soc.png
---

Todo el stack corre como contenedores directamente sobre el host, sin capa de virtualización intermedia con 8GB de RAM no hay margen para máquinas virtuales completas. Por el mismo motivo, en vez de un SIEM tradicional tipo Wazuh (cuyo motor de búsqueda recomienda un mínimo de ~4GB solo para él), la capa de seguridad se construye con Loki + Promtail + alertas en Grafana: mismo concepto de correlación de eventos, con una fracción del consumo.

## 1. Arquitectura objetivo

![arquitectura lab](/assets/images/lab-noc-soc/arquitectura_noc_soc_lab.png)

**Presupuesto de RAM estimado con todo corriendo a la vez: ~1.2-1.5GB.** Deja margen de sobra incluso en un host con overhead de SO. La pieza de ticketing (Jira Cloud Free) es SaaS, así que no consume nada de tu máquina — decisión deliberada para no gastar tu presupuesto de RAM en algo que puedes tener gratis en la nube.

---

## 2. Prerrequisitos: base sobre Windows 10

Con Windows 10 de por medio y solo 8GB, la combinación más eficiente es **WSL2 + Docker Engine instalado directamente dentro de la distro Linux** (nada de Docker Desktop). Docker Desktop añade una capa gráfica y un daemon de gestión que en tu caso es puro gasto de RAM que no necesitas — todo lo que vas a hacer es por línea de comandos.

### 2.1 Instalar WSL2 + Ubuntu

```powershell
# En PowerShell como administrador
wsl --install -d Ubuntu
```
Reinicia si te lo pide, y completa la creación de usuario/contraseña de la distro.

**Nota:** Es posible que dependiendo del sistema, wsl no funcione porque sea necesario activar alguna opción en el equipo (en el caso de mi portátil tuve que activar la virtualización en la BIOS por ejemplo) para asegurar que todo este bien ejecutaremos en powershell el siguiente comando **Get-ComputerInfo -Property "HyperVRequirementVirtualizationFirmwareEnabled"**, si este comando devuelve True estará todo listo para poder empezar.

### 2.2 Limitar el consumo de WSL2

Crea `%UserProfile%\.wslconfig` (ej. `C:\Users\<tu_usuario>\.wslconfig`):

```ini
[wsl2]
memory=6GB
processors=4
swap=2GB
```

Esto deja ~2GB reservados para Windows 10 y sus procesos en background, y evita que WSL2 acapare toda la RAM. Reinicia WSL (`wsl --shutdown` desde PowerShell) para que aplique.

### 2.3 Instalar Docker Engine dentro de WSL2 (sin Docker Desktop)

Para acceder a wsl solo tendremos que indicar en el buscador de windows el nombre del sistema que estemos usando, en mi caso seria buscar "Ubuntu". Ya dentro de tu terminal Ubuntu (WSL2):

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# cierra y reabre la terminal WSL para que el grupo surta efecto
sudo service docker start
```

Como WSL2 no usa systemd por defecto en todas las instalaciones, si `systemctl` no te funciona para arrancar Docker al inicio, añade esto a tu `~/.bashrc` para autoarrancarlo en cada sesión:

```bash
if ! service docker status > /dev/null 2>&1; then
  sudo service docker start > /dev/null 2>&1
fi
```

### 2.4 Verifica
```bash
docker run hello-world
docker compose version
```

---

## 3. Roadmap por fases (= posts de blog)

| Fase | Contenido |
|---|---|
| 1 | Hardening del host: Docker, UFW, Fail2Ban, ClamAV, Maldet |
| 2 | Zabbix: infraestructura y alertas |
| 3 | Prometheus + Grafana: observabilidad de contenedores |
| 4 | Dashboard unificado (Zabbix + Prometheus en Grafana) |
| 5 | Loki + Promtail: SIEM ligero basado en logs |
| 6 | Jira Cloud Free + n8n: de la alerta al ticket |
| 7 | Retrospectiva: arquitectura final y lecciones aprendidas |

---

## 4. Hardening del host

Con WSL2, tu "host" real sigue siendo Windows 10; WSL2 es un subsistema Linux dentro de él, no un servidor Linux completo. Esto significa dos capas de hardening distintas:

- **Dentro de WSL2 (Ubuntu)**: aplica lo de abajo. Protege lo que corre en Docker.

- **En Windows 10 directamente**: activa Windows Defender Firewall con reglas explícitas, revisa Windows Update (crítico dado que Windows 10 ya no recibe parches oficiales), y considera Windows Defender Antivirus como equivalente a ClamAV a nivel de host Windows.

Para lo que corre en contenedores, el hardening se aplica una sola vez dentro de tu Ubuntu de WSL2.

### Instalación de UFW

```bash
# UFW - firewall
sudo apt update && sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000/tcp   # Grafana
sudo ufw allow 8080/tcp   # Zabbix web
sudo ufw enable
```

Al ejecutar enable te pedirá confirmación (y). Verifica el resultado:

```bash
sudo ufw status verbose
```

Debería mostrar una lista con las reglas que acabas de crear y el estado "active".

![UFW](/assets/images/lab-noc-soc/ufw.PNG)

### Instalación y activación de Fail2Ban (protección fuerza bruta)

```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

**Nota:** Si systemctl te da un error tipo "System has not been booted with systemd", es normal en algunas configuraciones de WSL2, usa en su lugar: sudo service fail2ban start

Verificamos el resultado:

![fail2ban](/assets/images/lab-noc-soc/fail2ban.PNG)

### Instalación de ClamAV - antivirus (ligero, escaneo bajo demanda para no consumir RAM en background)

```bash
sudo apt install -y clamav clamav-daemon
sudo freshclam
sudo systemctl enable --now clamav-freshclam
```

Freshclam descarga las firmas de virus más recientes (tardará un par de minutos la primera vez). Gracias a este comando podremos hacer escaneos puntuales cuando queramos comprobar algo ejecutando: clamscan -r /home/tu_usuario --bell -i

**Nota:** Es posible que a la hora de ejecutar sudo freshclam de error, realmente no es un error como tal ya que al ejecutarse previamente paquete clamav-daemon, este paquete arranca automáticamente el servicio freshclam en segundo plano por lo que al ejecutar después sudo freshclam de forma manual ambos comandos "chocan" entre si llegando a provocar un posible error.

### Instalación de Maldet

```bash
cd /tmp
wget https://github.com/rfxn/linux-malware-detect/archive/refs/heads/master.tar.gz
tar -xzf master.tar.gz && cd linux-malware-detect-master
sudo ./install.sh
```

Prueba que funciona con un escaneo de ejemplo:

```bash
sudo maldet -a /tmp
```

![maldet](/assets/images/lab-noc-soc/maldet.PNG)

---

## 5. Zabbix (imagen ligera)

Creamos el docker-compose.yml:

```bash
cd ~/noc-soc/zabbix
nano docker-compose.yml
```

Dentro del fichero docker-compose.yml añadimos la siguiente configuración:

```bash
services:
  postgres-server:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: zabbix
      POSTGRES_PASSWORD: zabbix_pwd
      POSTGRES_DB: zabbix
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  zabbix-server:
    image: zabbix/zabbix-server-pgsql:alpine-7.0-latest
    environment:
      DB_SERVER_HOST: postgres-server
      POSTGRES_USER: zabbix
      POSTGRES_PASSWORD: zabbix_pwd
      POSTGRES_DB: zabbix
    ports:
      - "10051:10051"
    depends_on:
      - postgres-server
    restart: unless-stopped

  zabbix-web:
    image: zabbix/zabbix-web-nginx-pgsql:alpine-7.0-latest
    environment:
      DB_SERVER_HOST: postgres-server
      POSTGRES_USER: zabbix
      POSTGRES_PASSWORD: zabbix_pwd
      POSTGRES_DB: zabbix
      ZBX_SERVER_HOST: zabbix-server
      PHP_TZ: Europe/Madrid
    ports:
      - "8080:8080"
    depends_on:
      - zabbix-server
    restart: unless-stopped

volumes:
  pgdata:
```

**Nota:** El método con `docker-compose` y PostgreSQL es el soportado oficialmente.

### Levantamos el stack

```bash
docker compose up -d
```

La primera vez tarda 1-2 minutos en que Postgres inicialice la base de datos y Zabbix la pueble. Una vez este todo inicializado, comprobamos el estado de los servicios ejecutando **docker compose ps**.

Cuando hayamos comprobado que esta todo iniciado, ya podremos acceder a Zabbix a traves de nuestro navegador usando la url: http://localhost:8080, las credenciales por defecto serán Admin/zabbix, sin embargo la primera vez que accedamos, podremos cambiar la contraseña.

![inicio de zabbix](/assets/images/lab-noc-soc/dashboard_zabbix.PNG)

### Instalación de zabbix-agent para monitorizarlo

```bash
wget https://repo.zabbix.com/zabbix/7.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_7.0-2+ubuntu24.04_all.deb
sudo dpkg -i zabbix-release_7.0-2+ubuntu24.04_all.deb
sudo apt update
sudo apt install -y zabbix-agent2
```

Tras la instalación de Zabbix-agent, tenemos que acceder a "sudo nano /etc/zabbix/zabbix_agent2.conf" y editar las siguientes lineas:

```bash
Server=127.0.0.1
ServerActive=127.0.0.1
Hostname=Zabbix Server
```

Estas tres lineas que hay que modificar por defecto suelen estar comentadas con "#" por lo que hay que descomentarlas en caso de que lo estén y ademas modificar tanto la linea de Server como la linea de Hostname.

* Server: Por defecto aparecerá la ip 127.0.0.1, esta ip tenemos que cambiarla/añadir la ip de nuestra red docker para que asi zabbix y el host se comuniquen entre si.

* Hostname: El hostname es recomendable cambiarlo dado que por defecto el hostname es Zabbix Server, pero ese nombre es también el nombre por defecto del host interno, por lo que a la hora de monitorizar los servicios puede provocar confusión/conflictos.

En mi caso la configuración queda de la siguiente forma:

```bash
Server=127.0.0.1,172.18.0.0/16
ServerActive=127.0.0.1
Hostname=wsl2-host
```

**Nota:** En caso de no saber cual es la ip de la red de zabbix, ejecutamos el comando **docker network inspect zabbix_default**. Hay que aclarar que en este caso se usa zabbix_default dado que en mi proyecto se ha creado la carpeta zabbix que es donde esta todo lo relacionado con zabbix, el nombre a poner dependerá del nombre que cada uno le ponga al directorio de su proyecto.

Guardaremos los cambios y reiniciamos el servicio:

```bash
sudo service zabbix-agent2 restart
```

Antes de empezar a trabajar con zabbix y seguir adelante, habilitaremos el puesto 10050 en nuestro firewall para evitar bloqueos en la comunicación entre zabbix y el host.

```bash
sudo ufw allow 10050/tcp
```

Una vez tengamos todo habilitado ya tendremos nuestro servicio zabbix preparado y podremos avanzar configurando e instalando el resto de servicios del stack. Antes de avanzar con el resto de configuraciones tendremos que acceder a zabbix a traves del navegador y confirmar en el apartado Data Collection → Hosts que el host indicado anteriormente esta habilitado correctamente, es decir, que aparezca en verde, si por el contrario aparece en rojo querrá decir que zabbix tiene algún tipo de problema de comunicación con el host y la monitorización no funcionara correctamente. 

Para comprobar que esta habilitado correctamente lo primero sera ir a Data collection → Hosts → Create host para asi poder crear el host. A la hora de crear un host en zabbix simplemente tendremos que indicar algunos datos y darle a crear:

- **Host name:** `wsl2-host` (debe coincidir exactamente con el `Hostname` del agente)
- **Host groups:** escribe un nombre nuevo, por ejemplo `Lab NOC-SOC`, y selecciona "Create new" (es el primer host, así que no habrá ningún grupo existente todavía)
- **Templates:** añade `Linux by Zabbix agent`
- **Interfaces:** tipo Agent, con la IP de la máquina WSL2 (en caso de no conocer la IP, ejecutar `ip addr show eth0 | grep inet`) y puerto `10050`

![add host](/assets/images/lab-noc-soc/add_host_zabbix.PNG)

Una vez creado en Data collection → Hosts debe aparecer en verde.

![hosts zabbix](/assets/images/lab-noc-soc/zabbix-host.PNG)

### Troubleshooting real de esta fase
 
Durante el despliegue aparecieron dos problemas típicos de este tipo de arquitectura (agente en el host, servidor en un contenedor), que merece la pena documentar porque son fallos muy probables de repetirse:
 
**1. "Connection reset by peer" al comprobar disponibilidad del host.**

El log del agente (`/var/log/zabbix/zabbix_agent2.log`) mostraba:
```
connection from "172.18.0.3" rejected, allowed hosts: "127.0.0.1"
```
La IP real desde la que se conecta el contenedor de Zabbix no es `127.0.0.1` sino una IP dentro de la red interna de Docker. La solución fue añadir el rango completo de esa red (`172.18.0.0/16`) al parámetro `Server=` del agente, en vez de perseguir IPs sueltas que cambian entre reinicios de los contenedores.

---

## 6. Prometheus + Grafana + exporters

```bash
mkdir -p ~/noc-soc/monitoring && cd ~/noc-soc/monitoring
```

Dentro del directorio monitoring recién creado, empezaremos creando el documento docker-compose.yml añadiéndole la siguiente configuración:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
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
volumes:
  grafana-storage:
  prometheus-data:
```

**Nota:** los volúmenes `grafana-storage` y `prometheus-data` deben estar montados explícitamente en cada servicio (líneas `volumes:` dentro de `grafana` y `prometheus`), no solo declarados al final del archivo. Sin ese montaje, cualquier cambio futuro que obligue a recrear el contenedor (por ejemplo, editar el compose para añadir una red) borra toda la configuración interna de Grafana — datasources, dashboards, usuarios — porque vivía solo en la capa de escritura temporal del contenedor anterior. Este es un fallo real que ocurrió durante el desarrollo del lab (ver Fase 5) y que este montaje explícito evita desde el principio.

También en este mismo directorio, crearemos el fichero de configuración para prometheus:

```yaml
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: 'node-exporter'
    static_configs: [{targets: ['node-exporter:9100']}]
  - job_name: 'cadvisor'
    static_configs: [{targets: ['cadvisor:8080']}]
  - job_name: 'prometheus'
    static_configs: [{targets: ['localhost:9090']}]
```

Para verificar que todo este correctamente, ademas de ejecutar **docker compose ps** para comprobar que los servicios están iniciados, podemos acceder a la url de prometheus (http://localhost:9090/) y una vez dentro deberíamos poder ver en Status → target los servicios de cadvisor, node-exporter y prometheus en estado up.

![prometheus](/assets/images/lab-noc-soc/prometheus.PNG)

Luego accedemos a Grafana (http://localhost:3000), por defecto las credenciales serán admin/admin, sin embargo grafana en el primer acceso te pedirá un cambio de contraseña por seguridad. Una vez dentro de grafana añadiremos el datasource de prometheus, para ello vamos a Connections → Data sources → Add data source → Prometheus y añadimos la url http://prometheus:9090.

Por ultimo, importaremos el dashboard de node exporter para poder hacer capturas antes de tener nuestros propios dashboards, para ello nos dirigimos a Dashboards → New → Import, y usamos el ID 1860, nos debería quedar una pantalla como a continuación:

![dashboard node exporter grafana](/assets/images/lab-noc-soc/grafana_dashboard.PNG)

---

## 7. Dashboard unificado

Localizamos el nombre del contenedor de grafana:

```bash
docker compose -f ~/noc-soc/monitoring/docker-compose.yml ps
```

Instalamos el plugin de Zabbix para Grafana:

```bash
docker exec -it <container_grafana> grafana cli plugins install alexanderzobnin-zabbix-app
docker restart <container_grafana>
```

Habilitamos el plugin y creamos el Datasource, para ello en Grafana, ve a Administration → Plugins, busca "Zabbix" y haz clic en Enable (es posible que a la hora de buscar el plugin de zabbix ya nos aparezca enable desde el principio).

Creamos el Datasource, nos dirigimos a Connections → Data sources → Add data source → Zabbix:

### Troubleshooting: el datasource de Zabbix no aparecía en el buscador

En mi caso, este Datasource me dio problemas/error dado que a la hora de añadir de Datasource en Add data source, buscaba zabbix pero no me aparecía nada. En el caso de pasar esto, se deben seguir los siguientes pasos para intentar solucionarlo:

![error búsqueda de zabbix](/assets/images/lab-noc-soc/error_data_zabbix.PNG)

Comprobamos directamente en la API de grafana si el plugin esta o no habilitado:

```bash
curl -s -u admin:<tu_password_grafana> http://localhost:3000/api/plugins/alexanderzobnin-zabbix-app/settings
```

En la respuesta que nos de este comando nos debe aparecer un campo enabled (booleano), si aparece como False, significa que el plugin esta instalado pero no habilitado, por lo que ese sera el motivo por el que no aparezca en la búsqueda en Grafana. Para solucionar esto y habilitarlo, ejecutamos:

```bash
curl -s -u admin:<tu_password_grafana> -X POST http://localhost:3000/api/plugins/alexanderzobnin-zabbix-app/settings \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "pinned": true}'
```

Tras esto reiniciamos el servicio de grafana:

```bash
docker compose -f ~/noc-soc/monitoring/docker-compose.yml restart grafana
```

Una vez reiniciado el servicio de Grafana, volvemos a ejecutar el primer comando a modo de comprobación y esta vez la respuesta debería devolvernos "Enabled: True".

Si la búsqueda de Zabbix en el Datasource se hace correctamente, nos debería de aparecer Zabbix para meter los parámetros de configuración, los parámetros a configurar serian básicamente:

* URL: dirección donde esta alojado nuestro servicio Zabbix, http://<IP-de-tu-host>:8080/api_jsonrpc.php.
* Username: Usuario de acceso a Zabbix.
* Password: Contraseña de acceso a Zabbix.

![conexion grafana-zabbix](/assets/images/lab-noc-soc/conexion_grafana_zabbix.PNG)

Una vez conectado Zabbix a Grafana podremos crear dashboards donde podremos capturar y visualizar métricas tanto de prometheus como de zabbix.

### El dashboard
 
**Dashboards → New → New dashboard → Add visualization**, un panel con datasource Prometheus (ej. uso de CPU vía Node Exporter) y otro panel con datasource Zabbix (ej. un item del host monitorizado), colocados uno junto al otro. Este panel es el equivalente propio al "dashboard ejecutivo NOC/SOC" que inspiró todo el proyecto.

![dashboard unificado](/assets/images/lab-noc-soc/dashboard_unificado.PNG)

### Troubleshooting real de esta fase

**1. Bloqueo de la cuenta `Admin` tras varios intentos fallidos al conectar Grafana con Zabbix.**

Al configurar el datasource de Zabbix en Grafana con credenciales equivocadas repetidas veces, Zabbix activó su protección antifuerza-bruta y bloqueó la cuenta. Cambiar la contraseña desde la propia interfaz dejó de funcionar mientras el bloqueo seguía activo. La solución fue resetear la contraseña directamente en la base de datos PostgreSQL:

```bash
# Genera un hash bcrypt para la nueva contraseña
htpasswd -bnBC 10 "" "NuevaPassword" | cut -d: -f2
 
# Aplica el hash y resetea el contador de intentos fallidos

docker exec -it $(docker compose ps -q postgres-server) \
  psql -U zabbix -d zabbix -c \
  "UPDATE users SET passwd = '<HASH_GENERADO>', attempt_failed = 0, attempt_clock = 0 WHERE username = 'Admin';"
```
Para verificar que el hash era correcto antes de aplicarlo (y no perder tiempo con reintentos a ciegas), se comprobó con `bcrypt` en Python:

```bash
python3 -c "
import bcrypt
print(bcrypt.checkpw(b'NuevaPassword', b'<HASH_GENERADO>'))
"
```

Un `True` confirma que el hash es válido antes de tocar la base de datos.
 
**Lección de fondo:** tras esto, se creó un usuario dedicado (`grafana-api`) solo para la integración con Grafana, en vez de seguir usando la cuenta `Admin` — principio de menor privilegio, y evita que un fallo de configuración en una integración bloquee la cuenta de administrador principal.

---

## 8. Loki + Promtail ("SIEM lite")

Creamos la carpeta del proyecto:

```bash
mkdir -p ~/noc-soc/logging
cd ~/noc-soc/logging
```

Creamos el fichero docker-compose.yml en la carpeta recién creada con la siguiente configuración:

```yaml
services:
  loki:
    image: grafana/loki:latest
    ports: ["3100:3100"]
    restart: unless-stopped

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped
```

Creamos también el fichero promtail-config.yml (mínimo viable, recoge `auth.log` para detectar intentos de fuerza bruta SSH y logs de Fail2Ban/ClamAV):

```yaml
server:
  http_listen_port: 9080
positions:
  filename: /tmp/positions.yaml
clients:
  - url: http://loki:3100/loki/api/v1/push
scrape_configs:
  - job_name: system
    static_configs:
      - targets: [localhost]
        labels:
          job: varlogs
          __path__: /var/log/*.log
```
Levantamos el stack:

```bash
docker compose up -d
docker compose ps
```
Conectamos Loki a Grafana:

A diferencia con la conexión realizada entre Zabbix y Grafana que fue por IP, esta vez realizaremos una conexión mas simple, esta vez lo que haremos sera conectar el conector de Loki a la red de monitoring directamente, lo cual resulta una opción mas robusta que la opción de usar la IP. Para realizar dicha conexión editamos docker-compose.yml para añadir esto al final: 

```bash
networks:
  default:
    name: noc-soc-shared
    external: true
```

Después creamos esa red compartida antes de nada:

```bash
docker network create noc-soc-shared
```

Luego las mismas lineas añadidas anteriormente, las añadimos también en el docker-compose.yml de grafana (en el directorio monitorig)

Añadimos Loki como datasource en Grafana:

En Grafana accedemos a Connections → Data sources → Add data source → Loki, solo tendremos que indicar la url de Loki (http://loki:3100). Para comprobar que todo funciona correctamente, podemos acceder al apartado Explore → selecciona datasource Loki → query y a modo de ejemplo indicar una query básica como puede ser:

```bash
{job="varlogs"}
```

Con esta query, podremos ver logs reales de tu sistema fluyendo.

![query](/assets/images/lab-noc-soc/query.PNG)

Para acercarse al concepto de "SIEM lite" (detectar patrones de seguridad en los logs, no solo visualizarlos), una query filtrada de ejemplo:

```bash
{job="varlogs"} |= "Failed password"
```

---

## 9. Gestión de incidentes: Jira Cloud Free + n8n

### Cuenta y proyecto en Jira

Creamos una cuenta y un proyecto en Jira Cloud:

1. Vamos a www.atlassian.com/software/jira/free y crea una cuenta (o usa una existente).
2. Al crear el sitio, elegimos un nombre de dominio (por defecto tu-nombre.atlassian.net).
3. Crea un proyecto nuevo: Create project → IT Support.
4. Le damos nombre al proyecto.

Teniendo ya la cuenta y el proyecto creados, lo que haremos sera generar un API Token para la autentificación.

1. Vamos a id.atlassian.com/manage-profile/security/api-tokens.
2. Creamos el API token, dándole un nombre descriptivo y copiamos el token generado (esto es importante dado que el Token se muestra una única vez y mas adelante sera necesario usarlo).

**Nota:** El token es una credencial sensible — nunca debe incluirse en texto plano en documentación pública, capturas de pantalla, ni en el propio repositorio del proyecto. Trátalo con el mismo cuidado que una contraseña.

Configuramos el Contact Point en Grafana Alerting

Para realizar la configuración, nos dirigimos en Grafana a Alerting → Contact points → Add contact point indicando la siguiente configuración:

* Name: nombre identificativo del punto de contacto, en mi caso jira-webhook
* Integración: Webhook
* URL: Url apuntando al servicio que mandara la alerta a grafana

En este caso se va a usar el servicio de n8n para automatizar las alertas por lo que la URL que obtengamos una vez que en n8n este todo listo, sera la URL que tendremos que indicar en el apartado anterior de Grafana.

### Por qué n8n como intermediario, en vez de un webhook directo Grafana → Jira
 
Grafana Alerting permite webhooks salientes, pero no permite reformatear fácilmente el payload para que coincida con la estructura que exige la API de Jira (`fields.project.key`, `fields.issuetype.name`, etc.). En vez de pelear con plantillas de notificación limitadas, se usa **n8n** como capa de automatización intermedia: recibe la alerta de Grafana en formato libre, y la transforma en una petición correcta a la API de Jira usando su nodo nativo (con mapeo de campos visual, sin construir el JSON a mano).

## Despliegue n8n

Creamos la carpeta del proyecto:

```bash
mkdir -p ~/noc-soc/automation
cd ~/noc-soc/automation
```

Creamos el fichero docker-compose.yml con la siguiente configuración:

```bash
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_SECURE_COOKIE=false
    volumes:
      - n8n-data:/home/node/.n8n
    restart: unless-stopped

networks:
  default:
    name: noc-soc-shared
    external: true
 
volumes:
  n8n-data:
```

**Nota:** N8N_SECURE_COOKIE=false es necesario porque accedes por http:// en vez de https:// (típico en un lab local) — sin esto, n8n puede rechazar el login por cookies inseguras.

Levantamos el contenedor:

```bash
docker compose up -d
docker compose ps
```

Accedemos a n8n a traves de la URL http://localhost:5678. La primera vez pedirá crear una cuenta (email/contraseña), esta cuenta se trata de una cuenta local, por lo que no es necesario que sea real.

Una vez accedamos por primera vez, empezaremos creando el workflow, para ello buscamos la opción **Add first step → Webhook**. La configuración del Webhook sera la siguiente:

* Method: POST
* Path: aquí podemos dejar tanto el que se genera automáticamente o bien indicar un nombre descriptivo.
* Copiamos la Production URL que muestra (algo como http://localhost:5678/webhook/grafana-alert), esta es la URL que usará Grafana Alerting.

![config webhook](/assets/images/lab-noc-soc/config_n8n.PNG)

Al nodo ya creado, tendremos que crear otro, en este caso de Jira (aparecerá como **Jira Software** al buscarla):

* Credential: crea una nueva credencial de Jira:
  * Email: tu email de Atlassian
  * API Token: el que generaste
  * Domain: https://tu-dominio.atlassian.net
* Operation: Create an Issue
* Project: seleccionamos el proyecto del desplegable, en mi caso Lab NOC-SOC
* Issue Type: Incident (o el que tengas disponible)
* Summary: puedes mapear esto dinámicamente desde el payload del webhook de Grafana, por ejemplo {{ $json.body.alerts[0].labels.alertname }}

![config Jira](/assets/images/lab-noc-soc/config_n8n_jira.PNG)

Conectamos los dos nodos arrastrando el nodo Webhook hacia el nodo Jira y activamos el workflow.

![workflow n8n](/assets/images/lab-noc-soc/n8n.PNG)

Antes de realizar la prueba con Grafana, realizaremos una pequeña prueba para verificar que la automatización de n8n funciona correctamente. Para realizar dicha comprobación una vez activado ambos nodos en n8n, en la maquina de Ubuntu en la que se ha estado realizando el proyecto ejecutamos el siguiente **curl** para realizar las pruebas:

**Prueba-test:** 

```bash
curl -X POST http://localhost:5678/webhook-test/708e946f-1313-465c-9846-94e6d6d8d106 \
  -H "Content-Type: application/json" \
  -d '{"alerts":[{"labels":{"alertname":"Test desde curl"}}]}'
```

Tras ejecutar el curl anterior, en Jira se nos debería mostrar en nuestro proyecto, en el apartado "colas" la alerta generada automáticamente y mandada a Jira.

![cola de jira](/assets/images/lab-noc-soc/n8n-test.PNG)

**Prueba en producción:**

```bash
curl -X POST http://localhost:5678/webhook/708e946f-1313-465c-9846-94e6d6d8d106 \
  -H "Content-Type: application/json" \
  -d '{"alerts":[{"labels":{"alertname":"Test desde curl"}}]}'
```

Esta vez el curl seria similar al anterior, pero al tratarse de la URL en producción las diferencias serian principalmente dos:

* La primera diferencia estaría en la URL, ya que al tratarse de una URL en producción cambiaríamos el "webhook-test" por "webhook".

* La segunda diferencia y mas importante seria que al hacer uso de la URL en producción, antes de ejecutar el comando **curl** deberemos publicar nuestro proyecto, dado que de lo contrario el comando curl devolverá un error 404.

Verificamos en Jira que las alertas/incidencias han entrado en cola:

Al comprobar el workflow ente webhook y Jira funciona correctamente, realizaremos algunas configuraciones en Grafana. En grafana las modificaciones serán dos:

* En el apartado Alerting → Contact Points, en el que configuraremos las notificaciones en Grafana, asignándole nombre descriptivo a las notificaciones, indicando que la notificación sera de tipo Webhook y apuntando a la URL del Webhook de n8n.

![contact point](/assets/images/lab-noc-soc/contact_point_grafana.PNG)

* La segunda notificación también sera en Alerting → Notification Policies, asociamos un Contact Point apuntando a n8n

![notification policy](/assets/images/lab-noc-soc/notification_policy_grafana.PNG)

Con esto, el ciclo queda cerrado de extremo a extremo: **Zabbix/Prometheus/Loki detectan → Grafana Alerting evalúa → n8n transforma → Jira crea el ticket**, sin intervención manual.

## Verificación

Para realizar una comprobación de que el flujo de trabajo funciona de correctamente generaremos una alerta en Ubuntu, esta alerta se reflejara en grafana a traves de un Alert Rule que configuraremos y a traves del contact point configurado anteriormente esta alerta sera mandada de forma automática primero a n8n y después a Jira donde se creara e ticket automáticamente.

Una alerta que podemos activar fácilmente es por ejemplo un error de acceso haciendo uso de ssh, para ello lo primero sera instalar 

```bash
sudo apt install -y openssh-server
sudo service ssh start
```

Una vez iniciado el servicio ssh, ejecutaremos **ssh usuario_que_no_existe@localhost**, con ello al indicar un usuario que no existe, provocaremos un error. Buscamos el fichero de log para comprobar el error ejecutando **sudo grep "Failed password" /var/log/auth.log**, pero antes de nada tendremos que configurar el alert rule en grafana.

Cuando tengamos el servicio ssh instalado e iniciado pasamos a crear el Alert Rule en grafana Alerting → Alert Rules. Para configurar correctamente una Alert Rule, le pondremos un nombre descriptivo a la regla que vamos a crear, en mi caso "failed password".

A la hora de configurar la regla lo importante sera seleccionar que servicio mandara la alerta y después indicar la query que activara la alerta y posteriormente se mandara a n8n.

En este caso el servicio a seleccionar sera **Loki**, básicamente porque es el servicio que trabaja con logs por lo que al ejecutar ssh usuario_que_no_existe@localhost el error de acceso se ve reflejado en los logs, estos logs los recoge Loki y este avisa a Grafana a traves de la query, que se activa creando la alerta y la manda a n8n.

La query en cuestión que usaremos para la Alert Rule sera:

```bash
count_over_time({job="varlogs"} |= "Failed password" [5m])
```

Cuando ya este la regla configurada y ejecutemos el comando ssh, para comprobar que todo funciona correctamente tendremos que revisar varias cosas que indican que todo ha funcionado automáticamente:

1. Revisar sudo grep "Failed password" /var/log/auth.log y comprobar que aparece el error de usuario invalido.
2. En Grafana → Alerting → Alert Rules, la regla configurada anteriormente debería cambiar de estado, es decir, al no haber ningún intento de acceso fallido reciente, la regla debería mostrar estado 'Normal'. Cuando la ventana de 5 minutos no encuentra ninguna coincidencia, es posible que aparezca temporalmente como 'No Data'.

![alert rule](/assets/images/lab-noc-soc/alert_rule.PNG)

3. Revisar también en Alerting → Active Notifications para comprobar que la notificación de alerta a entrado en Grafana.

![active notification](/assets/images/lab-noc-soc/active_notification.PNG)

4. En Jira confirmamos que en el apartado "cola" se genera de forma automática el ticket. En caso de no generarse habría que revisar en n8n.

![Jira notifications](/assets/images/lab-noc-soc/jira-alert.PNG)

### Troubleshooting: tickets duplicados sin un segundo evento real

Al ejecutar la verificación anterior, aparecieron dos tickets en Jira por un único intento de login fallido, con varios minutos de diferencia entre ellos.

Descartando las causas más obvias. Antes de llegar a la causa real, se comprobó que no hubiera dos instancias de la regla evaluándose por separado (revisando el detalle de la Alert Rule, solo había una), que el nodo Webhook de n8n no estuviera reintentando por timeout (confirmado con "Respond: Immediately" configurado), y que no hubiera contact points o notification policies duplicados (solo existía uno de cada).

La causa real: el estado "No Data" también notifica. Revisando el historial de estado de la regla (Alerting → Alert rules → Failed password → State history), se detectó que entre los dos tickets no había un ciclo limpio de Firing → Resolved → Firing, sino transiciones a un estado Nodata. 

![history](/assets/images/lab-noc-soc/history.PNG)

La query:

```bash
count_over_time({job="varlogs"} |= "Failed password" [5m])
```

Solo devuelve un punto de datos cuando hay al menos una coincidencia en la ventana de 5 minutos. En cuanto esa ventana queda vacía, la query no devuelve nada, y Grafana interpreta la ausencia de datos como un estado No Data — que, por defecto, también genera notificaciones, con un alertname genérico (DatasourceNoData) distinto al de la alerta real.
Como el workflow de n8n no distinguía el origen de la notificación, creaba un ticket tanto para la alerta real como para esta pseudo-alerta de "sin datos".

La solución: filtrar por nombre de alerta en n8n. Se añadió un nodo Filter en el workflow, justo entre el Webhook y el nodo de Jira, con la condición:

```bash
{{ $json.body.alerts[0].labels.alertname }} is equal to Failed password
```

![workflow final](/assets/images/lab-noc-soc/workflow_final.PNG)

Con esto, únicamente las notificaciones correspondientes a la alerta real llegan a Jira; cualquier otro evento del sistema de alertas queda descartado sin generar ruido.
 
Verificación: tras el cambio, una prueba con un único intento SSH fallido generó exactamente un ticket. Revisando n8n Executions se confirmó que sí llegó una segunda ejecución minutos después (correspondiente a la transición a No Data), pero quedó correctamente bloqueada en el nodo Filter sin llegar a Jira.

![bloqueo n8n](/assets/images/lab-noc-soc/last_wf.PNG)

En la captura se ve como en la ultima prueba, aparecen dos ejecuciones con varios minutos de diferencia, la primera ejecucion que se ve es la alerta que crea el ticket en Jira (siguiente imagen), sin embargo la ultima ejecucion seria el ticket duplicado que como se ve en la imagen anterior pasa la alerta de webhook a filter y este filter la bloquea por lo que no avaba llegando a Jira.

![jira final](/assets/images/lab-noc-soc/jira_final.PNG)
---