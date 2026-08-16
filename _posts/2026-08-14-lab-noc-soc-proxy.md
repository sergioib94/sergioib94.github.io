---
title: "Lab NOC/SOC: Reverse Proxy"
date: 2026-08-16T11:00+02:00
categories: [Homelab, DevOps, Ansible]
excerpt: "Cerrando el lab NOC/SOC con el rol 8 de Ansible: Traefik como único punto de entrada, TLS con CA propia (mkcert) y Authelia delante de Grafana, Zabbix y n8n. Sin puertos expuestos al host, con SSO a nivel de proxy y 2FA, y validado a base de destruir y reconstruir todo el stack desde cero."
card_image: /assets/images/cards/lab-noc-soc-proxy.png
---

Stack: Traefik + Authelia + TLS con CA propia (mkcert) Objetivo: Rol 8 (reverse_proxy) del repo noc-soc-ansible, que ponga Traefik+Authelia delante de Zabbix, Grafana y n8n sin tocar la config interna de esos servicios.

## Preparación

* Rama de trabajo: crea una rama en noc-soc-ansible (git checkout -b hardening-reverse-proxy) para no tocar main hasta validar todo.

```bash
cd noc-soc-ansible
git checkout -b hardening-reverse-proxy
```

* Resolución de nombres: decidimos el dominio interno del lab y lo dejamos guardado en roles/reverse_proxy/defaults/main.yml:

```yaml
lab_domain: "lab.local"
lab_subdomains:
  traefik: "traefik.lab.local"
  grafana: "grafana.lab.local"
  zabbix: "zabbix.lab.local"
  n8n: "n8n.lab.local"
  auth: "auth.lab.local"
```

Antes del siguiente paso, confirmaremos como llega el trafico a wsl2.

Desde powershell (windows):

~~~
172.26.142.224 172.20.0.1 172.17.0.1 172.18.0.1 172.19.0.1
~~~

* DNS en WSL2: como no hay DNS real, añade las entradas en:

    * C:\Windows\System32\drivers\etc\hosts en Windows (para que el navegador resuelva), apuntando todas al IP de WSL2 (hostname -I desde WSL2, o 127.0.0.1 si usas port-forwarding de Windows a WSL2, que es lo habitual con localhost en WSL2 moderno).

    ```bash
    127.0.0.1  traefik.lab.local
    127.0.0.1  grafana.lab.local
    127.0.0.1  zabbix.lab.local
    127.0.0.1  n8n.lab.local
    127.0.0.1  auth.lab.local
    ```

    * /etc/hosts dentro de WSL2 (para que los contenedores/host resuelvan si usas network_mode: host o accedes desde WSL2 directamente).

    ```bash
    127.0.0.1  traefik.lab.local
    127.0.0.1  grafana.lab.local
    127.0.0.1  zabbix.lab.local
    127.0.0.1  n8n.lab.local
    127.0.0.1  auth.lab.local
    ```

    Para evitar que WSL2 sobrescriban el hosts en cada arranque comprobamos el fichero /etc/wsl.conf:

    ```bash
    cat /etc/wsl.conf 2>/dev/null
    ```

    Si el fichero no existe o no tiene sección [network], debemos crearlo/editarlo

    ```bash
    sudo tee -a /etc/wsl.conf << 'EOF'
    [network]
    generateHosts = false
    EOF
    ```

Luego reiniciamos WSL2 desde powershell:

```powershell
wsl --shutdown
```

Tras el reinicio comprobaremos si /etc/hosts conserva las lineas añadidas y lo validamos

```bash
ping -c 1 grafana.lab.local
```

```powershell
ping grafana.lab.local
```

* Red Docker dedicada: crea (o documenta en el rol) una red lab_proxy de tipo bridge, para que Traefik y los servicios backend compartan red sin exponer puertos directamente al host.

```bash
docker network create lab_proxy
```

Este es el paso que aísla: Traefik y los backends comparten esta red interna; nada más se publica al host. Documéntalo en el rol para que Ansible la cree si no existe (idempotente):

```yaml
# roles/reverse_proxy/tasks/main.yml
- name: Crear red Docker para el reverse proxy
  community.docker.docker_network:
    name: lab_proxy
    state: present
```

Verificamos que se ha creado correctamente:

```bash
docker network inspect lab_proxy
```

## Fase 1: CA local con mkcert

Instalamos mkcert:

```bash
sudo apt update
sudo apt install -y libnss3-tools

curl -JLO "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64"
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert

mkcert --version
```

Debería devolver v1.4.4

Instalamos CA local:

Debemos definir donde estará la CA (dentro del repo para que quede versionado, aunque no la clave privada)

```bash
mkdir -p ~/noc-soc-ansible/certs/ca
export CAROOT=~/noc-soc-ansible/certs/ca
mkcert -install
```

Verificamos:

```bash
ls $CAROOT
```

Deberia devolver rootCA-key.pem y rootCA.pem


Certificado wildcard para el lab:

```bash
mkdir -p ~/noc-soc-ansible/certs
cd ~/noc-soc-ansible/certs

CAROOT=~/noc-soc-ansible/certs/ca mkcert -cert-file lab.crt -key-file lab.key "*.lab.local" lab.local
```

Verificamos que cubre wildcard correctamente:

```bash
openssl x509 -in lab.crt -noout -text | grep -A1 "Subject Alternative Name"
```

Debe mostrar DNS:*.lab.local, DNS:lab.local.

Tras comprobar que la verificación es correcta, protegemos la clave privada en git.

```bash
cd ~/noc-soc-ansible
cat >> .gitignore << 'EOF'
certs/ca/rootCA-key.pem
certs/*.key
EOF
```

Confiar en la CA desde windows:

Copia el cert raíz (público, sin la clave) a una ruta accesible desde Windows:

```bash
cp ~/noc-soc-ansible/certs/ca/rootCA.pem /mnt/c/Users/sergio.ib/Downloads/rootCA.pem # Indicamos nuestro usuario windows
```

Desde Windows:

* Abrimos los certificados (Win + R > certmgr.msc)
* Buscamos en el árbol izquierdo "Entidades de certificación raíz de confianza" > Certificados
* Clic derecho → Todas las tareas → Importar...
* Selecciona rootCA.pem desde Descargas, siguiente, siguiente, finalizar
* Windows pedirá confirmación de seguridad (huella del certificado) → acepta

Validación de la Fase 1

```bash
openssl verify -CAfile ~/noc-soc-ansible/certs/ca/rootCA.pem ~/noc-soc-ansible/certs/lab.crt
```

Debe devolver lab.crt: OK.

## Fase 2: Traefik

Hasta ahora, cada servicio del lab (Grafana, Zabbix, n8n) exponía su puerto directamente al host: localhost:3000, localhost:8080, etc. Eso significa tres cosas expuestas por separado, cada una con su propia superficie de ataque, sin cifrado (HTTP plano) y sin ningún control de acceso común entre ellas. Un reverse proxy resuelve esto centralizando el tráfico: en vez de que cada servicio reciba peticiones directamente, todas pasan primero por un único punto de entrada, que decide a qué servicio interno redirigir según el dominio solicitado (grafana.lab.local, zabbix.lab.local...). Esto permite aplicar TLS, autenticación y logging en un solo sitio, en vez de replicarlo (o directamente no tenerlo) en cada aplicación por separado.

Traefik es el reverse proxy elegido para esta fase. A diferencia de un proxy tradicional tipo Nginx (donde defines manualmente cada ruta en un archivo de configuración central), Traefik se integra directamente con Docker: detecta automáticamente los contenedores en marcha y lee su configuración de enrutado desde labels puestas en el propio docker-compose de cada servicio. Eso significa que añadir o quitar un servicio del proxy no requiere tocar ningún archivo de Traefik, basta con etiquetar (o desetiquetar) el contenedor correspondiente, lo cual encaja bien con un enfoque de infraestructura declarativa como el que se sigue en el resto de este repo con Ansible.

### Estructura y Docker-compose

Creamos la estructura del rol: 

```bash
mkdir -p ~/noc-soc-ansible/roles/reverse_proxy/{tasks,templates,defaults,handlers}
```

Dentro de /noc-soc-ansible/ crearemos el docker-compose de reverse proxy con la siguiente configuración:

```yaml
services:
  traefik:
    image: traefik:v3.1
    container_name: traefik
    restart: unless-stopped
    command:
      - "--configFile=/etc/traefik/traefik.yml"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./traefik/traefik_dynamic.yml:/etc/traefik/dynamic/dynamic.yml:ro
      - ./certs:/certs:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - lab_proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik-dashboard.rule=Host(`traefik.lab.local`)"
      - "traefik.http.routers.traefik-dashboard.entrypoints=websecure"
      - "traefik.http.routers.traefik-dashboard.tls=true"
      - "traefik.http.routers.traefik-dashboard.service=api@internal"

networks:
  lab_proxy:
    external: true
```

Configuración estática (traefik/traefik.yml):

```bash
mkdir -p ~/noc-soc-ansible/traefik
```

Configuramos traefik.yml:

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https

  websecure:
    address: ":443"

providers:
  docker:
    exposedByDefault: false
    network: lab_proxy
  file:
    directory: /etc/traefik/dynamic
    watch: true

api:
  dashboard: true

log:
  level: INFO
```

Configuración dinámica (traefik/traefik_dynamic.yml):

```yaml
tls:
  certificates:
    - certFile: /certs/lab.crt
      keyFile: /certs/lab.key
  stores:
    default:
      defaultCertificate:
        certFile: /certs/lab.crt
        keyFile: /certs/lab.key
```

Levantamos y validamos que arranca sin errores:

```bash
docker compose -f docker-compose.reverse-proxy.yml up -d
docker compose -f docker-compose.reverse-proxy.yml logs -f traefik
```

**Troubleshooting error version traefik**: El cliente interno del provider Docker esta negociando con la API en la version 1.24 (version por defecto de traefik), mientras que Docker Engine exige como mínimo la 1.40. Como solución se fija explícitamente la version de la API de Docker que debe usar el provider, añadiendo la variable `DOCKER_API_VERSION` en el docker-compose de traefik. 

Comprobamos la version de API expone el Docker Engine:

```bash
docker version --format '{{.Server.APIVersion}}'
```

En mi caso la version es la 1.55, por lo que docker-compose.reverse-proxy.yml quedaria de la siguiente forma:

```yaml
services:
  traefik:
    image: traefik:v3.1
    container_name: traefik
    restart: unless-stopped
    command:
      - "--configFile=/etc/traefik/traefik.yml"
    environment:
      - "DOCKER_API_VERSION=1.55"   # ajusta al valor que te devolvió el comando anterior
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ./traefik/traefik_dynamic.yml:/etc/traefik/dynamic/dynamic.yml:ro
      - ./certs:/certs:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - lab_proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik-dashboard.rule=Host(`traefik.lab.local`)"
      - "traefik.http.routers.traefik-dashboard.entrypoints=websecure"
      - "traefik.http.routers.traefik-dashboard.tls=true"
      - "traefik.http.routers.traefik-dashboard.service=api@internal"
```

Tras esto, reiniciamos el contenedor:

```bash
docker compose -f docker-compose.reverse-proxy.yml down
docker compose -f docker-compose.reverse-proxy.yml up -d
docker compose -f docker-compose.reverse-proxy.yml logs -f traefik
```

**Troubleshooting version traefik**: Tras realizar los pasos anteriores se comprobó que el error persistia, este fallo no era debido a una mala configuracion ni a algun problema relacionado con docker, sino en un bug de Traefik, ya que por lo visto las versiones de Traefik hasta la v3.5.x tienen hardcodeada la versión 1.24 en su cliente interno del provider Docker e ignoran la variable DOCKER_API_VERSION por completo por lo que la solucion fue indicar en el fichero docker-compose.reverse-proxy.yml una version de traefik superior a la 3.5 (el bug mencionado anteriormente queda solucionado a partir de la version 3.6).

Tras el cambio de version, reiniciamos el contenedor:

```bash
docker compose -f docker-compose.reverse-proxy.yml pull traefik
docker compose -f docker-compose.reverse-proxy.yml up -d --force-recreate traefik
docker compose -f docker-compose.reverse-proxy.yml logs -f traefik
```

Verificamos que todo funciona correctamente a traves del navegador o a traves del terminal:

* Navegador:

![verificación de traefik en navegador](/assets/images/lab-noc-soc-proxy/traefik_web.PNG)

* Terminal:

![verificación de traefik en terminal](/assets/images/lab-noc-soc-proxy/traefik_terminal.PNG)

```bash
docker ps | grep traefik
curl -v https://traefik.lab.local 2>&1 | grep -i "subject\|issuer"
```

## Fase 3: Migración de servicios al proxy

En esta parte, en vez de exponer los servicios como Grafana directamente al host, pasa a estar solo detrás de Traefik.

### Grafana

En el docker-compose del stack de monitorización (donde tienes definido el servicio Grafana creado en post anteriores), añadimos:

```yaml
services:
  grafana:
    # ... configuración existente ...
    networks:
      - lab_proxy          # añade esta red además de la que ya tenga
      - default         # (o el nombre que uses internamente, si aplica)
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(`grafana.lab.local`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls=true"
      - "traefik.docker.network=lab_proxy"
```

traefik.docker.network es importante si Grafana está conectado a más de una red, le dice a Traefik por cuál de ellas debe enrutar.

### Quitamos la exposición directa

Es decir, en docker-compose que acabamos de modificar comentamos o eliminamos las lineas de ports.

En el caso de que no este previamente creada, tendremos que añadir también la red lab_proxy como red externa en este mismo docker-compose, se añadiría a final del fichero en el aparado networks:

```yaml
networks:
  lab_proxy:
    external: true
```

Tras estos cambios, reconstruimos y validamos el contenedor de grafana:

```bash
docker compose -f /noc-soc/monitoring/docker-compose.yml up -d --force-recreate grafana
```

* Comprobamos si puede accederse a Grafana desde la url: https://grafana.lab.local:

![grafana cargado en grafana.lab.local](/assets/images/lab-noc-soc-proxy/comprobacion_grafana_ok.PNG)

* Comprobamos que acceso a traves de localhost ya no funciona:

![grafana no carga en grafana localhost](/assets/images/lab-noc-soc-proxy/comprobacion_curl_ok.PNG)


### Zabbix

Zabbix suele desplegarse con varios contenedores: zabbix-web, zabbix-server y a veces zabbix-agent/postgres. Solo zabbix-web necesita las labels de Traefik, porque es el único que sirve HTTP/interfaz.

En el docker-compose de zabbix solo tendremos que añadir las siguientes lineas al apartado zabbix-web:

```yaml
networks:
    - default        # mantiene su red interna actual, para hablar con zabbix-server/postgres
    - lab_proxy
labels:
    - "traefik.enable=true"
    - "traefik.http.routers.zabbix.rule=Host(`zabbix.lab.local`)"
    - "traefik.http.routers.zabbix.entrypoints=websecure"
    - "traefik.http.routers.zabbix.tls=true"
    - "traefik.docker.network=lab_proxy"
    - "traefik.http.services.zabbix.loadbalancer.server.port=8080"
```

En ese mismo fichero eliminamos/comentamos el apartado "ports", ademas de comentar el apartado ports, se añade tambien el apartado network al final del fichero al igual que con grafana:

```yaml
networks:
  lab_proxy:
    external: true
```

### n8n

Al igual que con los servicios de zabbix y grafana, en n8n tendremos que añadir las labels, eliminar/comentar ports y añadir el aparado networks

```yaml
networks:
      - default
      - lab_proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(`n8n.lab.local`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls=true"
      - "traefik.docker.network=lab_proxy"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"
```

### Reconstruimos ambos servicios:

```yaml
docker compose -f /home/sergioib/noc-soc/zabbix/docker-compose.yml up -d --force-recreate zabbix-web
docker compose -f /home/sergioib/noc-soc/automation/docker-compose.yml up -d --force-recreate n8n
```

Validamos los accesos a traves del navegador y el terminal:

* navegador zabbix:

![validación de zabbix](/assets/images/lab-noc-soc-proxy/validacion_zabbix.PNG)

* navegador n8n:

![validación de n8n](/assets/images/lab-noc-soc-proxy/comprobacion_n8n.PNG)

* comprobación de curl:

![comprobación de curl](/assets/images/lab-noc-soc-proxy/curl_servicios.PNG)

## Fase 4: Authelia (SSO + 2FA)

Authelia es un servidor de autenticación y autorización que se coloca delante de tus aplicaciones web (en este caso, Grafana, Zabbix y n8n) para centralizar el control de acceso en un único punto, en vez de depender del login individual de cada servicio.

### Cómo funciona en la práctica

Cuando alguien intenta entrar a https://grafana.lab.local, Traefik primero le pregunta a Authelia "¿este usuario está autenticado?" (eso es lo que hace el middleware forwardAuth que configuramos). Si no lo está, Authelia lo redirige a su propia pantalla de login en auth.lab.local. Una vez autenticado ahí, Authelia genera una sesión válida para todo el dominio *.lab.local, así que al volver a Grafana ya entra directo — y si después visita zabbix.lab.local, no le vuelve a pedir login, porque la sesión ya es válida para ese dominio también. Eso es el SSO (Single Sign-On): un solo login sirve para todos los servicios detrás del proxy.

### Añadimos el servicio Authelia

En el docker-compose.reverse-proxy.yml añadimos las siguientes lineas tras la configuración de traefik:

```yaml
services:
  traefik:
    # ... configuración ya existente ...

  authelia:
    image: authelia/authelia:latest
    container_name: authelia
    restart: unless-stopped
    volumes:
      - ./authelia/configuration.yml:/config/configuration.yml:ro
      - ./authelia/users_database.yml:/config/users_database.yml:ro
      - authelia-data:/config/data
    networks:
      - lab_proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.authelia.rule=Host(`auth.lab.local`)"
      - "traefik.http.routers.authelia.entrypoints=websecure"
      - "traefik.http.routers.authelia.tls=true"
      - "traefik.docker.network=lab_proxy"

networks:
  lab_proxy:
    external: true

volumes:
  authelia-data:
```

### Generamos la base de usuarios

Creamos el directorio y generamos el hash de la contraseña con el propio binario de Authelia (via docker):

```bash
mkdir -p ~/noc-soc-ansible/authelia

docker run --rm authelia/authelia:latest authelia crypto hash generate argon2 --password 'tu contraseña'
```

Esto devolverá un hash tipo `$argon2id$v=19$...` que tendremos que guardar ya que sera necesario para el siguiente paso. Creamos el fichero ~/noc-soc-ansible/authelia/users_database.yml y añadimos la siguiente configuración para los usuarios:

```yaml
users:
  sergio:
    displayname: "Sergio"
    password: "$argon2id$v=19$...(el hash generado arriba)..."
    email: sergio@lab.local
    groups:
      - admins
```

Creamos y configuramos el fichero de configuración principal de Authelia (~/noc-soc-ansible/authelia/configuration.yml):

```yaml
theme: dark

server:
  address: 'tcp://:9091'

log:
  level: info

totp:
  issuer: lab.local

authentication_backend:
  file:
    path: /config/users_database.yml

access_control:
  default_policy: deny
  rules:
    - domain: "auth.lab.local"
      policy: bypass
    - domain: "*.lab.local"
      policy: two_factor

session:
  name: authelia_session
  secret: 'SECRETO_ALEATORIO'
  cookies:
    - domain: 'lab.local'
      authelia_url: 'https://auth.lab.local'

storage:
  local:
    path: /config/data/db.sqlite3

notifier:
  filesystem:
    filename: /config/data/notification.txt
```

Generamos secretos aleatorios en vez de dejar placeholders:

```bash
openssl rand -hex 32   # úsalo para 'session.secret'
```

### Middleware forward-auth en Traefik

En traefik/traefik_dynamic.yml añadimos el middleware:

```yaml
http:
  middlewares:
    authelia:
      forwardAuth:
        address: "http://authelia:9091/api/verify?rd=https://auth.lab.local"
        trustForwardHeader: true
        authResponseHeaders:
          - Remote-User
          - Remote-Groups
          - Remote-Name
          - Remote-Email

tls:
  certificates:
    - certFile: /certs/lab.crt
      keyFile: /certs/lab.key
  stores:
    default:
      defaultCertificate:
        certFile: /certs/lab.crt
        keyFile: /certs/lab.key
```

Levantamos y validamos Authella solo (antes de aplicarlo a los servicios)

```bash
cd ~/noc-soc-ansible
docker compose -f docker-compose.reverse-proxy.yml up -d authelia
docker compose -f docker-compose.reverse-proxy.yml logs -f authelia
```

Para verificar que todo esta bien, probamos a acceder en el navegador a https://auth.lab.local, deberia mostrar la pantalla de login de Authelia (aunque sin ningun servicio asociado por ahora).

**Troubleshooting logs authelia**: Con la ejecución de `docker compose -f docker-compose.reverse-proxy.yml logs -f authelia` se muestran dos errores de validacion de configuración:

* El primer error **storage.encryption_key**: obligatorio siempre para cifrar los datos de la base SQLite (sesiones, dispositivos 2FA, etc). Solucionamos esto añadiendo un segundo secreto y añadiendolo al fichero /noc-soc-ansible/authelia/configuration.yml:

```yaml
identity_validation:
  reset_password:
    jwt_secret: 'SEGUNDO_HEX_GENERADO'
```

**Nota**: En este fichero de configuracion serian necesarios **tres** secretos distintos en total ((session.secret, storage.encryption_key, identity_validation.reset_password.jwt_secret)).

* El Segundo no es tanto un error, sino un aviso **chown: ... Read-only file system**, esto es solo ruido innecesario del esntrypoint al intentar ajustar permisos en archivos montados como `:ro`. La solucion seria editar el apartado volumes de docker-compose.reverse-proxy.yml y dejarlo de la siguiente forma:

```yaml
volumes:
      - ./authelia/configuration.yml:/config/configuration.yml
      - ./authelia/users_database.yml:/config/users_database.yml
      - authelia-data:/config/data
```

Reintentamos el levantamiento y validacion para comprobar que esta todo bien:

```bash
docker compose -f docker-compose.reverse-proxy.yml up -d --force-recreate authelia
docker compose -f docker-compose.reverse-proxy.yml logs -f authelia
```

Verificacion en el navegador:

![comprobación de authelia web](/assets/images/lab-noc-soc-proxy/authelia_web.PNG)

**Troubleshooting error de acceso authelia nombre o contraseña incorrectos**: A la hora de probar el acceso a usuaria con el usuario (indicado en ~/noc-soc-ansible/authelia/users_database.yml, en mi caso sergio) y la contraseña, especificada al ejecutar 
`docker run --rm authelia/authelia:latest authelia crypto hash generate argon2 --password 'tu contraseña'` se comprobó que daba error de usuario o contarseña incorrecta. Para solucionarlo se comprobó que la configuracion fuese correcta, al comprobar que lo era, se ejecutó de nuevo `docker run --rm authelia/authelia:latest authelia crypto hash generate argon2 --password 'tu contraseña'` pero esta vez en lugar de copiarla a mano, para evitar errores lo hacemos con el comando cat:

```bash
cat > ~/noc-soc-ansible/authelia/users_database.yml << 'EOF'
users:
  sergio:
    displayname: "Sergio"
    password: "$argon2id$v=19$m=65536,t=3,p=4$AHri2KwV4aP+0kj2Fpt4zw$lah4yWZo96Ok3OT2efD6s7qK2Otr5gHy/d/OPuA4Luo"
    email: sergio@lab.local
    groups:
      - admins
EOF
```

Recreamos el contenedor y hacemos la prueba:

```bash
docker compose -f ~/noc-soc-ansible/docker-compose.reverse-proxy.yml up -d --force-recreate authelia
docker compose -f ~/noc-soc-ansible/docker-compose.reverse-proxy.yml logs -f authelia
```

Comprobacion: 

![comprobación de primer acceso](/assets/images/lab-noc-soc-proxy/primer_acceso.PNG)

**Nota**: Al acceder por primera vez, no aparecera la pantalla anterior en el login dandonos opcion de registrar dispositivo. Al registrar dispositivo, Authelia genera un QR que al escanearse con una app TOTP como google authenticator, te muestra un codigo de 6 digitos que cambia cada 30 seg. Este codigo debe ser introducido en Authelia para confirmar el vinculo y a partir de ahi cada vez que se inicie sesion pedira el codigo tras el usuario/contraseña.

Como actualmente no hay servicios conectados a Authelia antes de registrar algun dispositivo, vamos a aplicar el middleware a cada uno de los servicios (grafana, zabbix y n8n).

### Middleware Grafana

Editamos noc-soc/monitoring/docker-compose.yml añadiendo la linea middleware a las labels ya existentes dejandolo de la siguiente forma:

```yaml
labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(`grafana.lab.local`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls=true"
      - "traefik.docker.network=lab_proxy"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"
      - "traefik.http.routers.grafana.middlewares=authelia@file"
```

Recreamos el contenedor de Grafana:

```bash
docker compose -f /home/sergioib/noc-soc/monitoring/docker-compose.yml up -d --force-recreate grafana
```

Una vez realizados estos cambios, al intentar acceder a Grafana, nos deberia redirigir a Authelia para identificarnos, y despues devolvernos a Grafana (solo si tenemos ya configurado el TOTP comentado anteriormente).

### Middleware Zabbix

Al igual que con grafana, añadimos la linea de middleware, esta vez en noc-soc/monitoring/zabbix/docker-compose.yml:

```yaml
- "traefik.http.routers.zabbix.middlewares=authelia@file"
```

Recreamos el contenedor zabbix-web:

```bash
docker compose -f /home/sergioib/noc-soc/zabbix/docker-compose.yml up -d --force-recreate zabbix-web
```

### Midleware n8n

Añadimos en el fichero /automation/docker-compose.yml la siguiente linea a labels:

```yaml
- "traefik.http.routers.n8n.middlewares=authelia@file"
```

Recreamos el contenedor n8n:

```yaml
docker compose -f /home/sergioib/noc-soc/automation/docker-compose.yml up -d --force-recreate n8n
```

Una vez tengamos los 3 servicios en Middleware pasamos a registrar el dispositivo dentro de Authelia. La opcion que usaremos seria la de Contraseña de un solo uso OTP y le damos a "añadir".

**Troubleshooting al añadir el dispositivo se queda cargando sin hacer nada**: Al intentar registrar un dispositivo, se comprueba que al añadir, la opcion se queda cargando sin hacer nada. Solucion:

Empezamos revisando notificacion.txt dado que ahi es donde deberia mandar Authelia el codigo de verificacion (al no tener configurado todavia ningun SMTP se manda a notification por defecto)

```bash
docker exec authelia cat /config/data/notification.txt
```

En mi caso el comando anterior no devolvia nada, lo que indicaba que Authelia fallaba al mandar el codigo por lo que pasamos a realizar una seria de revisiones:

* Verificamos si el fichero existe por si se da el caso de que Authalia no lo haya generado:

```bash
docker exec authelia ls -la /config/data/
```

* Revisamos los logs en el intento de registro:

```bash
docker logs authelia --tail 50
```

Se comprobo que la petición para iniciar el registro no está llegando al backend de Authelia en absoluto, así que el problema no es el notifier sino que la propia acción de "Añadir" en el navegador no se está completando.

* Dejamos los logs corriendo en el terminal mientras en el navegador intentamos registrar el dispositivo en modo incognito:

```bash
docker compose -f ~/noc-soc-ansible/docker-compose.reverse-proxy.yml logs -f authelia
```

Esta vez desde incognito si solicito un codigo y se comprobo que si se mando al notification, por lo que se continua con el registro a traves de incognito hasta completarlo.

Registro completado:

![consola](/assets/images/lab-noc-soc-proxy/console.PNG)

![paso 2](/assets/images/lab-noc-soc-proxy/paso_2.PNG)

![paso 3](/assets/images/lab-noc-soc-proxy/paso_3.PNG)

![paso 4](/assets/images/lab-noc-soc-proxy/paso_4.PNG)

![registro completo](/assets/images/lab-noc-soc-proxy/otp_completo.PNG)

## Fase 5: Validación y pruebas de hardening

### Pruebas de exposición

Confirma que ningún servicio backend es alcanzable sin pasar por Traefik:

```bash
curl http://localhost:3000    
curl http://localhost:8080    
curl http://localhost:5678    
curl -k https://localhost
```

Estos comandos deben fallar todos, confirmando asi que ninguno de los servicios es accesible sin pasar por traefik. En el caso del curl -k https://localhost, este devolvera un error 404 ya que `localhost` ya no coincide con ninguno de los routers definidos (grafana.lab.local, zabbix.lab.local, etc) por lo que traefik no encuentra ningun router al que enroutar.

Antes de convertir reverse_proxy en una tarea ansible para automatizarlo, ha que realizar una prueba rapida para comprobar que los tres servicios grafana.lab.local, zabbix.lab.local y n8n.lab.local redirigen a auth.lab.local y tras logearse con usuario/contraseña y codigo, te devuelve al servicio ya autenticado por lo que al intentar acceder al resto de servicios no seria necesario volver a pasar por Authelia.

**Nota:** Una limitación que vale la pena dejar clara: el SSO que consigue Authelia aquí es a nivel de proxy, no de aplicación. Una sola sesión en auth.lab.local basta para pasar el control de acceso de los tres servicios sin volver a loguearte en Authelia pero cada aplicación conserva su propio sistema de login interno, así que Grafana, Zabbix y n8n te siguen pidiendo sus credenciales individuales la primera vez que entras en cada una. Para cerrar del todo esa brecha haría falta que cada app confiara en los headers que Authelia ya envía (Remote-User, Remote-Groups), algo que Grafana soporta de forma nativa vía auth.proxy pero que Zabbix y n8n no ofrecen de forma fiable. De momento se queda así: doble capa de autenticación en vez de un login único de extremo a extremo que tampoco es una mala solución de defensa en profundidad.

## Fase 6: Reconstruccion de reserve_proxy en Ansible

Vamos a convertir todo el proceso manual en el rol reverse_proxy de Ansible. Dado que ya validamos cada pieza a mano, esto es "traducir" los comandos que ya funcionan a tareas idempotentes.

Empezamos configurando defaults/main.yml:

```yaml
lab_domain: "lab.local"
lab_base_dir: "/home/sergioib/noc-soc-ansible"

mkcert_ca_root: "{{ lab_base_dir }}/certs/ca"
certs_dir: "{{ lab_base_dir }}/certs"

traefik_image: "traefik:v3.6"
authelia_image: "authelia/authelia:latest"

# Secretos: NO hardcodear valores reales aquí, se inyectan vía vault o variables de entorno
authelia_session_secret: "{{ vault_authelia_session_secret }}"
authelia_storage_encryption_key: "{{ vault_authelia_storage_encryption_key }}"
authelia_jwt_secret: "{{ vault_authelia_jwt_secret }}"
```

**Nota**: los tres secretos de Authelia no deben ir en texto plano en el repo, la forma correcta de indicarlos es meterlos en el fichero ansible-vaul, ya que los secretos ya estarian generados.

```bash
ansible-vault edit ~/noc-soc-ansible/group_vars/all/vault.yml
```

Añadimos las linea vault al fichero ya existente:

```yaml
vault_authelia_session_secret: "tu_valor_generado"
vault_authelia_storage_encryption_key: "tu_valor_generado"
vault_authelia_jwt_secret: "tu_valor_generado"
```

Añadimos la configuracion de tasks/main.yml:

```yaml
---
- name: Incluir tareas de red Docker
  ansible.builtin.import_tasks: network.yml

- name: Incluir tareas de CA local (mkcert)
  ansible.builtin.import_tasks: mkcert.yml

- name: Incluir tareas de Traefik
  ansible.builtin.import_tasks: traefik.yml

- name: Incluir tareas de Authelia
  ansible.builtin.import_tasks: authelia.yml
```

Añadimos la configuracion de tasks/network.yml:

```yaml
---
- name: Crear red Docker lab_proxy
  community.docker.docker_network:
    name: lab_proxy
    state: present
```

Añadimos la configuracion de tasks/mkcert.yml

```yaml
---
- name: Instalar libnss3-tools
  ansible.builtin.apt:
    name: libnss3-tools
    state: present
    update_cache: true
  become: true

- name: Comprobar si mkcert ya está instalado
  ansible.builtin.stat:
    path: /usr/local/bin/mkcert
  register: mkcert_bin

- name: Descargar binario de mkcert
  ansible.builtin.get_url:
    url: "https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64"
    dest: /usr/local/bin/mkcert
    mode: '0755'
  become: true
  when: not mkcert_bin.stat.exists

- name: Comprobar si la CA ya existe
  ansible.builtin.stat:
    path: "{{ mkcert_ca_root }}/rootCA.pem"
  register: ca_root_cert

- name: Crear directorio de la CA
  ansible.builtin.file:
    path: "{{ mkcert_ca_root }}"
    state: directory
    mode: '0755'
  when: not ca_root_cert.stat.exists

- name: Instalar CA local de mkcert
  ansible.builtin.command: mkcert -install
  environment:
    CAROOT: "{{ mkcert_ca_root }}"
  when: not ca_root_cert.stat.exists

- name: Comprobar si el certificado wildcard ya existe
  ansible.builtin.stat:
    path: "{{ certs_dir }}/lab.crt"
  register: wildcard_cert

- name: Generar certificado wildcard para el lab
  ansible.builtin.command: >
    mkcert -cert-file {{ certs_dir }}/lab.crt
           -key-file {{ certs_dir }}/lab.key
           "*.{{ lab_domain }}" {{ lab_domain }}
  environment:
    CAROOT: "{{ mkcert_ca_root }}"
  args:
    chdir: "{{ certs_dir }}"
  when: not wildcard_cert.stat.exists
```

Añadimos la configuracion tasks/traefik.yml:

```yaml
---
- name: Crear directorio de Traefik
  ansible.builtin.file:
    path: "{{ lab_base_dir }}/traefik"
    state: directory
    mode: '0755'

- name: Desplegar configuración estática de Traefik
  ansible.builtin.template:
    src: traefik.yml.j2
    dest: "{{ lab_base_dir }}/traefik/traefik.yml"
    mode: '0644'
  notify: Recrear traefik

- name: Desplegar configuración dinámica de Traefik
  ansible.builtin.template:
    src: traefik_dynamic.yml.j2
    dest: "{{ lab_base_dir }}/traefik/traefik_dynamic.yml"
    mode: '0644'
  notify: Recrear traefik

- name: Desplegar docker-compose del reverse proxy
  ansible.builtin.template:
    src: docker-compose.reverse-proxy.yml.j2
    dest: "{{ lab_base_dir }}/docker-compose.reverse-proxy.yml"
    mode: '0644'
  notify: Recrear stack reverse-proxy

- name: Levantar Traefik y Authelia
  community.docker.docker_compose_v2:
    project_src: "{{ lab_base_dir }}"
    files:
      - docker-compose.reverse-proxy.yml
    state: present
```

Añadimos la configuracion tasks/authelia.yml:

```yaml
---
- name: Crear directorio de Authelia
  ansible.builtin.file:
    path: "{{ lab_base_dir }}/authelia"
    state: directory
    mode: '0755'

- name: Desplegar configuración de Authelia
  ansible.builtin.template:
    src: authelia_configuration.yml.j2
    dest: "{{ lab_base_dir }}/authelia/configuration.yml"
    mode: '0644'
  notify: Recrear authelia

- name: Desplegar base de usuarios de Authelia
  ansible.builtin.copy:
    src: users_database.yml
    dest: "{{ lab_base_dir }}/authelia/users_database.yml"
    mode: '0644'
  notify: Recrear authelia
```

Añadimos la configuracion handlers/mail.yml:

```yaml
---
- name: Recrear traefik
  community.docker.docker_compose_v2:
    project_src: "{{ lab_base_dir }}"
    files:
      - docker-compose.reverse-proxy.yml
    state: present
    recreate: always
  listen: "Recrear traefik"

- name: Recrear authelia
  ansible.builtin.command: >
    docker compose -f {{ lab_base_dir }}/docker-compose.reverse-proxy.yml
    up -d --force-recreate authelia
  listen: "Recrear authelia"

- name: Recrear stack reverse-proxy
  community.docker.docker_compose_v2:
    project_src: "{{ lab_base_dir }}"
    files:
      - docker-compose.reverse-proxy.yml
    state: present
  listen: "Recrear stack reverse-proxy"
```

A parte de los ficheros indicados anteriormente tendremos que editar las plantillas, excepto templates/traefik.yml.j2 que en principio se quedaria igual.

templates/traefik.yml.j2:

```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https

  websecure:
    address: ":443"

providers:
  docker:
    exposedByDefault: false
    network: lab_proxy
  file:
    directory: /etc/traefik/dynamic
    watch: true

api:
  dashboard: true

log:
  level: INFO
```

templates/traefik_dynamic.yml.j2:

```yaml
http:
  middlewares:
    authelia:
      forwardAuth:
        address: "http://authelia:9091/api/verify?rd=https://auth.{{ lab_domain }}"
        trustForwardHeader: true
        authResponseHeaders:
          - Remote-User
          - Remote-Groups
          - Remote-Name
          - Remote-Email

tls:
  certificates:
    - certFile: /certs/lab.crt
      keyFile: /certs/lab.key
  stores:
    default:
      defaultCertificate:
        certFile: /certs/lab.crt
        keyFile: /certs/lab.key
```

templates/authelia_configuration.yml.j2:

```yaml
theme: dark

server:
  address: 'tcp://:9091'

log:
  level: info

totp:
  issuer: {{ lab_domain }}

identity_validation:
  reset_password:
    jwt_secret: '{{ authelia_jwt_secret }}'

authentication_backend:
  file:
    path: /config/users_database.yml

access_control:
  default_policy: deny
  rules:
    - domain: "auth.{{ lab_domain }}"
      policy: bypass
    - domain: "*.{{ lab_domain }}"
      policy: two_factor

session:
  name: authelia_session
  secret: '{{ authelia_session_secret }}'
  cookies:
    - domain: '{{ lab_domain }}'
      authelia_url: 'https://auth.{{ lab_domain }}'

storage:
  encryption_key: '{{ authelia_storage_encryption_key }}'
  local:
    path: /config/data/db.sqlite3

notifier:
  filesystem:
    filename: /config/data/notification.txt
```

templates/docker-compose.reverse-proxy.yml.j2:

```yaml
services:
  traefik:
    image: {{ traefik_image }}
    container_name: traefik
    restart: unless-stopped
    command:
      - "--configFile=/etc/traefik/traefik.yml"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - {{ lab_base_dir }}/traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - {{ lab_base_dir }}/traefik/traefik_dynamic.yml:/etc/traefik/dynamic/dynamic.yml:ro
      - {{ certs_dir }}:/certs:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - lab_proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik-dashboard.rule=Host(`traefik.{{ lab_domain }}`)"
      - "traefik.http.routers.traefik-dashboard.entrypoints=websecure"
      - "traefik.http.routers.traefik-dashboard.tls=true"
      - "traefik.http.routers.traefik-dashboard.service=api@internal"

  authelia:
    image: {{ authelia_image }}
    container_name: authelia
    restart: unless-stopped
    volumes:
      - {{ lab_base_dir }}/authelia/configuration.yml:/config/configuration.yml
      - {{ lab_base_dir }}/authelia/users_database.yml:/config/users_database.yml
      - authelia-data:/config/data
    networks:
      - lab_proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.authelia.rule=Host(`auth.{{ lab_domain }}`)"
      - "traefik.http.routers.authelia.entrypoints=websecure"
      - "traefik.http.routers.authelia.tls=true"
      - "traefik.docker.network=lab_proxy"

networks:
  lab_proxy:
    external: true

volumes:
  authelia-data:
```

files/users_database.yml:

```bash
cp ~/noc-soc-ansible/authelia/users_database.yml ~/noc-soc-ansible/roles/reverse_proxy/files/users_database.yml
```

### Ejecutamos el rol

En nuestro site.yml (playbook principal) hay que incluir el rol nuevo:

```yaml
- { role: reverse_proxy, tags: reverse_proxy }
```

Ejecutamos el playbook:

```bash
ansible-playbook site.yml --ask-vault-pass --tags reverse_proxy
```

Surge un error debido a un error de configuracio en defaults/main.yml. Tras revisar la configuracion y corregirla, ejecutamos de nuevo.

```bash
ansible-playbook site.yml --ask-vault-pass --tags reverse_proxy
```

**Troubleshooting falta de handlers/main.yml**

![error handler](/assets/images/lab-noc-soc-proxy/error_handler.PNG)

Este error es distinto a los anteriores: no es un problema de tu infraestructura, es que el archivo handlers/main.yml no se creó (o no se guardó completo), Ansible no encuentra ningún handler llamado Recrear stack reverse-proxy, que es el que la tarea de plantilla intenta notificar. Solucion:

Configuracion handlers/main.yml:

```yaml
---
- name: Recrear traefik
  community.docker.docker_compose_v2:
    project_src: "{{ lab_base_dir }}"
    files:
      - docker-compose.reverse-proxy.yml
    state: present
    recreate: always
  listen: "Recrear traefik"

- name: Recrear authelia
  ansible.builtin.command: >
    docker compose -f {{ lab_base_dir }}/docker-compose.reverse-proxy.yml
    up -d --force-recreate authelia
  listen: "Recrear authelia"

- name: Recrear stack reverse-proxy
  community.docker.docker_compose_v2:
    project_src: "{{ lab_base_dir }}"
    files:
      - docker-compose.reverse-proxy.yml
    state: present
  listen: "Recrear stack reverse-proxy"
```

Hacemos la prueba ejecutando de nuevo:

```bash
ansible-playbook site.yml --ask-vault-pass --tags reverse_proxy
```

![comprobacion de solucion](/assets/images/lab-noc-soc-proxy/handler_ok.PNG)

**Troubleshooting Authelia restarting**; aparentemente ansible-playbook se habia ejecutado sin errores, pero al revisar `docker ps | grep -E "traefik|authelia"` para comprobar si ambos servicios estaban levantados, se comprueba que traefik si esta levantado, pero authelia queda en restarting y no llega a levantarse.

![Authelia restarting](/assets/images/lab-noc-soc-proxy/fallo_authelia.PNG)

Revisamos los logs:

```bash
docker logs authelia --tail 40
```

![authelia log](/assets/images/lab-noc-soc-proxy/authelia_restarting_log.PNG)

El error que aparece es `the configured encryption key does not appear to be valid for this database`. Esto pasa porque el volumen authelia-data que ya existía (de cuando lo levantaste manualmente antes de "ansibilizarlo") tiene la base de datos SQLite cifrada con el storage.encryption_key que generaste a mano en su momento pero ahora el rol Ansible generó secretos nuevos y distintos en el vault, así que la clave de cifrado ya no coincide con la que se usó para crear esa base de datos. Por eso Authelia rechaza arrancar: no puede leer sus propios datos con la clave nueva.

la solución más simple es empezar la base de datos de Authelia desde cero con los secretos nuevos gestionados por el vault, en vez de intentar hacer coincidir los antiguos:

```bash
docker compose -f ~/noc-soc-ansible/docker-compose.reverse-proxy.yml stop authelia
docker volume ls | grep authelia
```

Confirmamos el nombre del volumen y lo eliminamos:

```bash
docker rm authelia
docker volume rm noc-soc-ansible_authelia-data
```

**Troubleshooting sudo: a password in required**: Tras esto, al ejecutar de nuevo `ansible-playbook site.yml --ask-vault-pass --tags reverse_proxy` da un error distinto a que la sesión de sudo en tu terminal caducó (es normal tras un rato sin usar sudo, vuelve a pedir contraseña) y el playbook necesita permisos elevados para alguna tarea. Solucion:

```bash
ansible-playbook site.yml --ask-vault-pass --ask-become-pass --tags reverse_proxy
```

![problema sudo](/assets/images/lab-noc-soc-proxy/error_reverse_proxy_3.PNG)

Tras esto comprobamos que authelia esta Up:

```bash
docker ps | grep authelia
```

![authelia up](/assets/images/lab-noc-soc-proxy/reverse_proxy_ok.PNG)

Tendremos que registrar de nuevo el dispositivo que usemos en Authelia tras eliminar el contenedor que teniamos para solucionar el error anteriormente. Una vez este todo listo y Ok, podremos pasar a realizar una prueba de destruccion y restauracion completa.

## Destruccion y Restauracion

Una vez tengamos el dispositivo registrado de nuevo, destruimos todo lo que gestiona este rol y comprobamos que Ansible lo reconstruye sin intervención manual:

```bash
cd ~/noc-soc-ansible
docker compose -f docker-compose.reverse-proxy.yml down
docker volume rm noc-soc-ansible_authelia-data
```

Relanzamos playbook completo para restaurarlo:

```bash
ansible-playbook site.yml --ask-vault-pass --ask-become-pass --tags reverse_proxy
```

![ejecucion de playbook tras destruccion](/assets/images/lab-noc-soc-proxy/playbook-restaurado.PNG)

Comprobamos que tanto traefik como authelia estan up una vez restaurados:

```bash
docker ps | grep -E "traefik|authelia"
```

![registro completo](/assets/images/lab-noc-soc-proxy/servicios_up.PNG)

## Resultados

Con esto queda cerrado el rol 8 (reverse_proxy) del repo noc-soc-ansible: Grafana, Zabbix y n8n ya no exponen ningún puerto directo al host, el único punto de entrada es Traefik con TLS válido gracias a la CA propia generada con mkcert, y una capa de autenticación centralizada con Authelia (usuario/contraseña + TOTP) delante de los tres.

Todo el proceso quedó primero validado a mano, servicio a servicio, y después convertido en tareas Ansible idempotentes, mismo criterio que en los 7 roles anteriores del repo. El rol pasó las pruebas que me importan de verdad: ejecución repetida sin cambios (changed=0), y una destrucción completa del stack (contenedores + volumen de Authelia) seguida de una reconstrucción íntegra vía ansible-playbook, sin ningún paso manual salvo el registro del TOTP (que se pierde al recrear la base de datos de Authelia desde cero, algo asumido y documentado como limitación conocida).

Una aclaración honesta que vale la pena dejar por escrito: el SSO que monté es a nivel de proxy, no de aplicación. Una sola sesión en Authelia basta para pasar el control de acceso de los tres servicios sin volver a loguearte ahí pero cada aplicación conserva su propio sistema de login interno. Grafana soporta auto-login vía headers (auth.proxy) para cerrar esa brecha; Zabbix y n8n no lo permiten de forma fiable, así que de momento se quedan con esa doble capa (Authelia + login propio), que tampoco es mala idea como defensa en profundidad.

Como en los posts anteriores, el código completo del rol está en el repo: [enlace a noc-soc-ansible]. El siguiente paso natural sería [aquí puedes cerrar con tu plan real, por ejemplo, retomar la automatización de la restauración de Restic que quedó pendiente, o el salto a Kubernetes/cloud que mencionaste como objetivo a más largo plazo].