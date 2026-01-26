---
title: "Laboratorio Site-to-site con Softether en Linux"
date: 2026-01-26T16:34:30+01:00
categories: [Seguridad, Redes, Linux]
excerpt: "Implementación práctica de una VPN Site-to-Site con SoftEther sobre Linux, conectando dos redes independientes mediante un escenario virtualizado. Incluye configuración del servidor y cliente, routing, Virtual Hub, troubleshooting y documentación completa orientada a entornos empresariales."
card_image: /assets/images/cards/softether-bg.jpg
---

### Introducción

Softether VPN es una solución VPN de código abierto, multiplataforma y multiprotocolo, diseñada para proporcionar conectividad remota y site-to-site segura con alto rendimiento y gran flexibilidad. Puede operar como servidor VPN, bridge VPN o cliente VPN, y está orientada tanto a entornos corporativos como a laboratorios y escenarios de formación técnica.

## Características principales

* Multiplataforma: Servidor y cliente disponibles para Windows, Linux y macOS; clientes adicionales para Android e iOS (mediante L2TP/IPsec).
* Alto rendimiento: Optimizado para latencias altas y redes inestables; puede superar el rendimiento de OpenVPN en escenarios comparables.
* NAT Traversal: Atraviesa NAT y firewalls sin configuraciones complejas.
* SSL-VPN sobre HTTPS (TCP/443): El tráfico puede encapsularse como HTTPS, facilitando su paso por proxies y firewalls restrictivos.
* Gestión centralizada: Consola gráfica (Windows) y CLI (vpncmd) para automatización y administración remota.
* Virtual Hub: Concepto lógico que permite segmentar usuarios, políticas y autenticación dentro del mismo servidor.
* Open Source: Auditable y extensible.

## Protocolos soportados

SoftEther no se limita a un único protocolo, actúa como plataforma de compatibilidad:

* SoftEther SSL-VPN (propietario): Protocolo nativo, encapsulado en SSL/TLS. Muy eficaz para atravesar firewalls.
* L2TP/IPsec: Compatible con clientes nativos de Windows, macOS, iOS y Android.
* OpenVPN: Permite conectar clientes OpenVPN estándar al servidor SoftEther.
* SSTP (Secure Socket Tunneling Protocol): Integración nativa con clientes Windows.
* EtherIP / L2TPv3 (escenarios específicos de bridging).

## Métodos de autentificación

Softether ofrece múltiples mecanismos, combinables según la política de seguridad:

* Usuario y contraseña: Autenticación local contra la base de datos del servidor.
* Certificados X.509: Autenticación fuerte basada en certificados cliente.
* RADIUS: Integración con servidores RADIUS (p. ej., NPS, FreeRADIUS).
* Active Directory / LDAP: Autenticación centralizada contra AD.
* One-Time Password (OTP): Mediante tokens o sistemas compatibles.
* Autenticación anónima o por MAC/IP: Útil en laboratorios o entornos controlados (no recomendado en producción).

## Cifrado y seguridad

* TLS/SSL para el túnel (cifrado fuerte).
* Algoritmos modernos (AES, SHA-2).
* Control granular de sesiones, políticas por usuario y por Virtual Hub.
* Soporte para listas de control, logs detallados y auditoría.

## Casos de uso

* Acceso remoto seguro para técnicos y teletrabajo.
* VPN site-to-site entre sedes.
* Laboratorios de redes y seguridad (ideal para formación NOC/SOC).
* Entornos con firewalls restrictivos, donde otras VPN fallan.
* Sustituto o complemento de OpenVPN/IPsec.

## Ventajas y consideraciones

**Ventajas**

* Muy flexible y compatible.
* Excelente para atravesar firewalls.
* Amplias opciones de autenticación.
* Gratuito y open source.

**Consideraciones**

* Curva de aprendizaje inicial (especialmente con vpncmd).
* Interfaz de gestión gráfica solo en Windows (aunque el servidor puede ser Linux).
* Configuración avanzada requiere buen conocimiento de redes y seguridad.

## Comparativa entre OpenVPN, Wireguard y SoftEtherVPN

| **Característica**             | **OpenVPN**      | **WireGuard**         | **SoftEther**     |
|--------------------------------|-----------------|-----------------------|------------------|
| **Seguridad** |   Alta    |   Muy Alta   |     Alta     |
| **Rendimiento**              |   Media    |      Muy Alta      |    Alta    |
| **Facilidad**                  |     Media      |      Alta      |     Media      |
| **Flexibilidad**                |     Alta     |        Baja         |      Muy Alta      |
| **Evasión de Firewall**    |     Media     |         Baja         |      Muy Alta       |
| **Multiprotocolo** |      No      |       No      |       Si      |

# Configuración del escenario

El escenario esta compuesto por cuatro maquinas virtuales creadas con Vmware Workstation 17, estas cuatro maquinas virtuales contaran todas con un sistema operativo Linux, Debian en este caso sin entorno gráfico (para disminuir el consumo de recursos ya que el sistema host cuenta con 8 Gb de RAM).

**Características de los clientes:**

* Ambos clientes contaran con un sistema operativo Debian sin entorno gráfico.
* Al menos 20 GB de almacenamiento (lo recomendado por Vmware).
* Una sola tarjeta de red, en el caso del cliente1 configurada con NAT, en el caso del cliente2 configurada con una red interna con una ip dentro del rango 10.10.10.0/24 que sera el rango ip que usara la Red2 (red de empresa simulada).
* Ambas maquinas tendrán solo 1 CPU para disminuir el consumo de recursos.

**Características de los servidores**

* Ambos servidores (uno que hará de servidor SoftetherVPN y otro que hará de cliente para acceder a la Red2) tendrán 1 Gb de RAM.
* Ambos servidores tendrán al menos 20 GB de almacenamiento.
* Al igual que los clientes tendrán sistemas operativos Debian sin entorno gráfico.
* Los servidores contaran con dos tarjetas de red, una en modo NAT para tener red y otra en modo host-only apuntando a su red interna.

# Configuración del escenario

## Servidor Softether (Servidor LAN 1)

Configuración de la Infraestructura de Red (Host-Only)

Antes de proceder con la capa de aplicación, es importante establecer el direccionamiento estático y las capacidades de enrutamiento del núcleo (kernel) en cada servidor.

Definimos la interfaz interna que servirá de puerta de enlace para las máquinas de la LAN. Editamos /etc/network/interfaces:

~~~
auto ens34
iface ens34 inet static
    address 192.168.10.10
    netmask 255.255.255.0
~~~

Una vez configuradas la tarjeta host-only sera necesario ejecutar los siguientes comandos, por un lado systemctl restart networking para reiniciar el servicio y que cargue la nueva configuración y por otro lado sysctl -w net.ipv4.ip_forward=1 para activar el ip forwarding.

Una vez la red base es estable, desplegamos el software y aseguramos su ejecución automática. Se instalan las herramientas de compilación y se descarga el binario correspondiente (Server o Client según el nodo).

~~~
apt update && apt upgrade -y
apt install build-essential wget -y
~~~

Descarga de Softether server:

~~~
wget https://github.com/SoftEtherVPN/SoftEtherVPN_Stable/releases/download/v4.44-9807-rtm/softether-vpnserver-v4.44-9807-rtm-2025.04.16-linux-x64-64bit.tar.gz
tar xzf softether-vpnserver-*.tar.gz
cd vpnserver
make
~~~

Una vez descargado, instalamos el servicio:

~~~
mv vpnserver /usr/local/
cd /usr/local/vpnserver
chmod 600 *
chmod 700 vpnserver vpncmd
./vpnserver start
~~~

Una vez iniciado el servidor vpn, podremos acceder a la configuración ejecutando ./vpncmd. Hay que tener en cuenta que esta forma de iniciar el servicio sera solo temporal dado que una vez que el equipo se reinicie, tendremos que volver a iniciar vpnserver de forma manual, como esto no es algo optimo, crearemos el servicio systemd para que de esa forma el servicio se ejecute automáticamente en el arranque del sistema.

Este servicio systemd lo crearemos editando/creando el fichero en la siguiente ruta: /etc/systemd/system/softether-vpnserver.service y añadiendo el siguiente contenido con nano.

~~~
[Unit]
Description=SoftEther VPN Server
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/vpnserver/vpnserver start
ExecStop=/usr/local/vpnserver/vpnserver stop
ExecReload=/usr/local/vpnserver/vpnserver restart

[Install]
WantedBy=multi-user.target
~~~

Ya configurado el fichero al que en este caso llamamos softether-vpnserver.service ejecutamos los comandos systemctl daemon-reexec con el que reiniciamos el proceso systemd systemctl daemon-reload con el que recargamos los archivos .service en este caso. 

Por ultimo ejecutamos systemctl enable softether-vpnserver y systemctl restart softether-vpnserver para dejar habilitado el servicio.

Tras esto seguiremos con la configuración básica del servidor:

Al principio, al ejecutar ./vpncmd nos aparecerán 3 opciones de configuración a elegir:

* Management of VPN Server or VPN Bridge
* Management of VPN client
* Use of VPN Tools (certificate creation and network traffic speed test tool)

En este caso como estamos configurando lo que será nuestro servidor, seleccionamos la opción 1.

Después se nos pedirá que indiquemos el hostname o dirección de red del destino, es decir la dirección del servidor para administrarlo de forma remota, en este caso como estamos dentro del propio servidor no sera necesario indicar nada, por lo que simplemente haríamos "enter" lo que equivale a indicar que estamos en localhost.

En el siguiente paso nos pedirá que especificamos el nombre de virtual hub, como en este caso aun no ha sido creado, le daremos a "enter" saltándonos este paso que mas adelante configuraremos.

Por ultimo ya estaremos dentro del servidor VPN, una vez dentro lo primero sera crear el virtual hub que nos ha solicitado antes en la configuración, esta virtual hub sera la red lógica donde se conectaran los clientes, este virtual hub lo crearemos ejecutando hubcreate [nombre del hub] como en el ejemplo a continuación.

~~~
VPN Server> hubcreate Empresa 
~~~

Al crear el hub nos va a pedir una contraseña, esto es algo opcional ya que podemos dejarlo vacío, pero para mayor seguridad le daremos una.

Una vez que tengamos el hub creado podremos acceder a el usando el comando hub [nombre hub]. Ejemplo:

~~~
VPN Server>hub Empresa
~~~

Dentro de este hub crearemos el usuario vpn. Ejemplo:

~~~
VPN Server/Empresa>usercreate vpnuser
~~~

A este usuario tendremos que asignarle una serie de datos como nombre de grupo, nombre real y descripción y le asignaremos la contraseña con userpasswordset vpnuser.

Es importante indicar que los comandos anteriores para crear el usuario vpn se ejecutarían a modo de practica ya que aunque en una empresa seria posible crear los usuarios vpn para cada empleado de la empresa, pero crearlos uno por uno es bastante ineficaz si la empresa tiene muchos trabajadores. Por suerte softetherVPN permite crear múltiples usuarios automáticamente tanto a través de scripts como a través de ficheros CSV, aunque en un entorno real los usuarios seguramente no se creen en softetherVPN si no que los usuarios están ya creados en entornos como pueden ser Active directory, LDAP o RADIUS por lo que en casos reales, Softether se integrara con estos entornos donde estarán los usuarios y lo que hará sera simplemente validar la autentificación.

Después de la creación del hub y del usuario, tendremos que revisar que la función SecureNat esta desactivada. Por defecto esta opción suele estar habilitada por lo que para asegurarnos del estado en el que se encuentra y para evitar conflictos futuros ejecutaremos el comando "StatusGet" dentro de nuestro hub.

~~~
VPN Server/Empresa>statusget
~~~

Este comando nos mostrara una tabla con varios valores en los que tendremos que revisar que el parámetro "SecureNAT" debe aparecer con el valor "disabled". En el caso de que aparezca con el estado "enabled" ejecutaremos el siguiente comando para deshabilitarlo.

~~~
VPN Server/Empresa>securenatdisable
~~~

La razón de dejarlo deshabilitado seria la siguiente, este escenario cuenta con una infraestructura de red (maquinas virtuales con IPs estáticas en Vmware). Si activamos SecureNAT, Softether creara un router virtual, un servidor DHCP y un NAT interno dentro del hub lo que provocara varios conflictos de cara al futuro:

1. **Conflicto de IPs:** SecureNAT intentara asignar IPs (por defecto la 192.168.30.1) que no coinciden con el esquema de la red.

1. **Rendimiento:** Consume mucha CPU si hay mucho trafico. El local bridge es mucho mas rápido ya "habla" directamente con el kernel de Linux y la tarjeta.

1. **Transparencia:** Con el Local Bridge, el servidor VPN se comporta como si hubieras tirado un cable físico desde el túnel hasta el switch virtual de Vmware. 

Con esto ya quedaría instalado y configurado todo lo necesario para que el servidor Softether quedara funcionando, el siguiente paso sera acceder al nodo que tendremos de servidor en la otra red, es decir la maquina que hará de puente entre las dos redes y la que permitirá el site to site.

SecureNAT solo se suele utilizar en los siguientes casos:

* Falta de privilegios o acceso al Kernel: Si estás instalando el servidor VPN en una máquina donde no puedes crear puentes (bridges) o no tienes permisos de administrador total sobre las interfaces de red, SecureNAT funciona totalmente en modo usuario sin tocar el hardware.

* VPS en la nube (AWS, Azure, Google Cloud)
En la mayoría de nubes públicas, las tarjetas de red virtuales no permiten el modo promiscuo. Si intentas hacer un Local Bridge, el tráfico de otras IPs será bloqueado por el proveedor.

   * Solución: Activas SecureNAT para que todas las conexiones de los clientes salgan hacia internet usando la IP única de la instancia, como si fuera un router doméstico.

* Configuración rápida para Clientes Móviles
Si solo quieres que un usuario con un iPhone o un PC desde su casa se conecte para navegar por internet de forma segura (sin importar la red interna):

   * Habilitas SecureNAT.

   * El usuario recibe una IP automáticamente del DHCP interno de SoftEther.

   * Navega a través de la IP del servidor.

El siguiente paso sera preparar la configuración del Local bridge, para tendremos que acceder a ./vpncmd y acceder al hub que hemos creado anteriormente. Para la creación del Local bridge ejecutaremos el siguiente comando:

~~~
VPN Server/Empresa>BridgeCreate Empresa /DEVICE:ens34 /TAP:no
~~~

Esto hace que cualquier tráfico que llegue al Hub se "inyecte" directamente en la red 192.168.10.0/24. Para comprobar que el puente se ha creado correctamente, ejecutaremos el siguiente comando.

~~~
VPN SERVER/Empresa>Bridgelist
~~~

Si el puente creado aparece en estado "operating", significara que el puente esta correctamente creado y configurado, por el contrario, si aparece en estado de error significara que el puente no esta funcionando, generalmente esto suele deberse a problemas de configuración con la tarjeta de red o bien la interfaz de red indicada esta en estado "down".

En el caso de que la tarjeta de red no aparezca la configuración o la interfaz aparezca "down", intentaremos forzar la ip y levantar la interfaz.

~~~
ip addr add 192.168.10.10/24 dev ens34
~~~

Con este comando asignamos manualmente la IP a la interfaz.

~~~
ip link set ens34 up
~~~

Con este comando nos aseguramos de que la interfaz este activa.

~~~
ip a show ens34
~~~

Con esto comprobaremos si vuelve a tener ip y si esta levantada. Si ya esta todo listo, ya no seria necesaria mas configuración por parte del softether server, por lo que ahora pasaríamos a la parte de softether client.

## Servidor Softether Client (LAN 2)

En el caso del servidor de la segunda red, los pasos iniciales serán los mismos, salvo que esta vez se instalara la version client en lugar de la server.

Configuración de la Infraestructura de Red (Host-Only)

Antes de proceder con la capa de aplicación, es importante establecer el direccionamiento estático y las capacidades de enrutamiento del núcleo (kernel) en cada servidor.

Definimos la interfaz interna que servirá de puerta de enlace para las máquinas de la LAN. Editamos /etc/network/interfaces:

~~~
auto ens33
iface ens33 inet static
    address 10.10.10.10
    netmask 255.255.255.0
~~~

Una vez configuradas la tarjeta host-only sera necesario ejecutar los siguientes comandos, por un lado systemctl restart networking para reiniciar el servicio y que cargue la nueva configuración y por otro lado sysctl -w net.ipv4.ip_forward=1 para activar el ip forwarding.

Una vez la red base es estable, desplegamos el software y aseguramos su ejecución automática. Se instalan las herramientas de compilación y se descarga el binario correspondiente (Server o Client según el nodo).

Actualización e instalación de paquetes base:

~~~
apt update && apt upgrade -y
apt install build-essential wget -y
~~~

Descarga de softether server:

~~~
wget https://github.com/SoftEtherVPN/SoftEtherVPN_Stable/releases/download/v4.44-9807-rtm/softether-vpnclient-v4.44-9807-rtm-2025.04.16-linux-x64-64bit.tar.gz
tar xzf softether-vpnclient-*.tar.gz
cd vpnclient
make
~~~

Una vez descargado, instalamos el servicio:

~~~
mv vpnclient /usr/local/
cd /usr/local/vpnclient
chmod 600 *
chmod 700 vpnclient vpncmd
./vpnclient start
~~~

Una vez iniciado el cliente vpn, podremos acceder a la configuración ejecutando ./vpncmd al igual que en el servidor. 

Al ejecutar ./vpncmd, aparecerá un menú con 3 opciones en el que tendremos que elegir en este caso la opción 2 (Management of VPN client).

Si seguimos avanzando en la configuración lo siguiente que nos pedirá sera indicar el hostname o IP del destino, al igual que con el server le daremos a "enter" indicando que la configuración sera local.

Dentro de la configuración de softether client la primera configuración sera para crear el adaptador virtual de red con el comando NicCreate [nombre].

~~~
VPN Client>niccreate vpn
~~~

Luego creamos una cuenta de conexión hacia el servidor haciendo uso del comando Accountcreate e indicando la conexión:

~~~
VPN Client>accountcreate conexión /SERVER:192.168.149.143:443 /HUB:Empresa /USER:vpnuser /NICNAME:vpn
~~~

De esta forma vincularemos el cliente con el servidor de la LAN1. Esta conexión actualmente no seria segura, por lo que por seguridad añadiremos una contraseña a la conexión.

~~~
VPN Client>AccountPasswordSet Conexión /PASSWORD:12345678 /TYPE:standard
~~~

Una vez establecida la contraseña ya podremos conectar el túnel de conexión entre ambos servidores haciendo uso del comando accountconnect

~~~
VPN Client>accountconnect conexión
~~~

Si todo ha salido bien y se a conectado el túnel al ejecutar el comando accountstatusget debería estar en estado de "connection completed".

~~~
VPN Client>accountstatusget conexión
accountstatusget command - Get Current VPN Conecction Setting Status
| Item | Value |
| ---- | ---- |
| VPN Connection Setting Name | conexion |
| Session Status | Connection Completed (Session Established) |
| VLAN ID | - |
| Server Name | 192.168.149.143 |
| Port Number | TCP Port 443 |
| Server Product Name | SoftEther VPN Server (64 bit) |
| Server Version | 4.44 |
| Server Build | Build 9807 |
| Connection Started at | 2026-01-26 (Mon) 10:25:21 |
| First Session has been Established since | 2026-01-26 (Mon) 10:32:41 |
| Current Session has been Established since | 2026-01-26 (Mon) 10:32:41 |
| Number of Established Sessions | 1 Times |
| Half Duplex TCP Connection Mode | No (Full Duplex Mode) |
| VoIP / QoS Function | Enabled |
| Number of TCP Connections | 2 |
| Maximum Number of TCP Connections | 2 |
| Encryption | Enabled (Algorithm: TLS_AES_256_GCM_SHA384) |
| Use of Compression | No (No Compression) |
| Physical Underlay Protocol | Standard TCP/IP (IPv4) / IPv4 UDPAccel_Ver=2 ChachaPoly_OpenSSL UDPAccel_MSS=1309 |
| UDP Acceleration is Supported | Yes |
| UDP Acceleration is Active | Yes |
| Session Name | SID-VPNUSER-2 |
| Connection Name | CID-223 |
| Session Key (160 bit) | D7E692313E548AF491975454132784B5B1B2BD69 |
| Bridge / Router Mode | No |
| Monitoring Mode | No |
| Outgoing Data Size | 4,870 bytes |
| Incoming Data Size | 3,317 bytes |
| Outgoing Unicast Packets | 8 packets |
| Outgoing Unicast Total Size | 656 bytes |
| Outgoing Broadcast Packets | 28 packets |
| Outgoing Broadcast Total Size | 2,152 bytes |
| Incoming Unicast Packets | 4 packets |
| Incoming Unicast Total Size | 344 bytes |
| Incoming Broadcast Packets | 4 packets |
| Incoming Broadcast Total Size | 848 bytes |
~~~

**NOTA:** Si accountstatusget devuelve un estado retraying (no recibe respuesta del servidor) o connecting (intenta conectarse) durante mas de 1 minuto significara que algo esta fallando a la hora de intentar establecer la conexión con el servidor de la LAN1 o bien el servidor no esta escuchando las peticiones.

Para corregir el estado **retrying** algunas posibles soluciones pueden ser:

* Comprobar que los parámetros introducidos al ejecutar accountcreate estén todos bien (nombre de hub, usuario, nicname, etc... todos los nombres deben ponerse exactamente igual).

* Revisar el firewall del servidor (LAN1) por si el firewall esta bloqueando la conexión. Para comprobar que el firewall esta realmente bien, tenemos que ejecutar el comando **netstat -tunlp | grep vpnserver** y debemos ver el proceso vpnserver escuchando en el puerto 0.0.0.0:443. Si no tiene el puerto abierto sera necesario abrirlo, bien con **iptables -I INPUT -p tcp --dport 443 -j ACCEPT** o con **ufw allow 443/tcp**.

* Revisar que el servicio esta activo.

Para corregir el estado **connecting** algunas posibles soluciones pueden ser:

* Re-configurar la autentificación (accountpasswordset).

* Reiniciar el adaptador virtual por si tiene algún conflicto con el kernel de Debian:

~~~
# Desconecta primero
VPN Client>AccountDisconnect Conexion

# Desactiva y activa el adaptador
VPN Client>NicDisable vpn
VPN Client>NicEnable vpn

# Vuelve a intentar
VPN Client>AccountConnect Conexion
~~~

* Verificar el estado del HUB en el servidor (LAN1)

* Borrar y recrear la cuenta:

~~~
# Detenemos cualquier intento
VPN Client>AccountDisconnect Conexion

# Borramos la cuenta para empezar de cero
VPN Client>AccountDelete Conexion

# La creamos con la sintaxis mínima y puerto 443
VPN Client>AccountCreate Conexion /SERVER:192.168.149.143:443 /HUB:Empresa /USER:vpnuser /NICNAME:vpn

# Establecemos la contraseña (Asegúrate de que en el servidor sea la misma)
VPN Client>AccountPasswordSet Conexion /PASSWORD:12345678 /TYPE:standard

# Intentamos conectar de nuevo
VPN Client>AccountConnect Conexion
~~~

Cuando tengamos ya todo configurado podremos salir de vpncmd y podremos asignarle una IP en el rango de la LAN1 a la interfaz virtual creada (suele aparecer la interfaz como vpn_vpn) ejemplo de configuración:

~~~
ip addr add 192.168.10.15/24 dev vpn_vpn
ip link set vpn_vpn up
~~~

**Comprobación de conexión**

Para comprobar que la conexión es correcta y esta establecida, desde el servidor de LAN2 haremos ping al cliente interno de la LAN1 (192.168.10.128).

Si se hace ping a ambas maquinas de la LAN1, lo único que quedara sera establecer el enrutamiento en los clientes internos de ambas redes.

Cliente interno (LAN1):

~~~
ip route add 10.10.10.0/24 via 192.168.10.10
PING 10.10.10.5 (10.10.10.5) 56(84) bytes of data.
64 bytes from 10.10.10.5: icmp_seq=1 ttl=127 time=658 ms
64 bytes from 10.10.10.5: icmp_seq=2 ttl=127 time=1.66 ms
64 bytes from 10.10.10.5: icmp_seq=3 ttl=127 time=2.99 ms
64 bytes from 10.10.10.5: icmp_seq=4 ttl=127 time=3.10 ms
64 bytes from 10.10.10.5: icmp_seq=5 ttl=127 time=3.15 ms
64 bytes from 10.10.10.5: icmp_seq=6 ttl=127 time=1.71 ms
~~~

Cliente interno (LAN2):

~~~
ip route add 192.168.10.0/24 via 10.10.10.10
PING 192.168.10.128 (192.168.10.128) 56(84) bytes of data.
64 bytes from 192.168.10.128: icmp_seq=1 ttl=64 time=1.82 ms
64 bytes from 192.168.10.128: icmp_seq=2 ttl=64 time=3.56 ms
64 bytes from 192.168.10.128: icmp_seq=3 ttl=64 time=3.78 ms
64 bytes from 192.168.10.128: icmp_seq=4 ttl=64 time=3.35 ms
64 bytes from 192.168.10.128: icmp_seq=5 ttl=64 time=3.78 ms
64 bytes from 192.168.10.128: icmp_seq=6 ttl=64 time=3.85 ms
~~~

En este caso, de la forma en la que se ha realizado la configuración del puente entre los servidores, el propio servidor VPN no podrá comunicarse con la red bridged a través del túnel, aunque las máquinas detrás de él sí podrán hacerlo.

Hay varios tipos de puente que se pueden configurar, en este caso se ha realizado un puente "físico" en el que softether se "engancha" directamente a la tarjeta de red lo que permite que aun estando en distintas redes los clientes se vean entre ellos realizando asi un site-to-site sin problemas con la limitación de que el servidor queda "aislado" de su propia red. La razón de que esto suceda es que cuando puenteas a la tarjeta física ens34, SoftEther "secuestra" los paquetes antes de que el kernel de Linux los vea. Esto hace que el servidor se vuelva "sordo" a su propia red VPN.

Si lo que se busca es que el propio servidor sea accesible desde el túnel (y no solo las máquinas que están detrás de él), el Bridge tipo TAP (vlink) es la opción ganadora. En lugar de usar una tarjeta física, SoftEther crea una tarjeta de red virtual en el kernel de Debian (tap_vlink) lo que permite que el servidor sea un miembro más de la red VPN, pudiendo enviar y recibir pings como si fuera un cliente más, eliminando las restricciones del kernel de Linux sobre interfaces físicas.

Para configurar un puente tipo TAP de forma profesional en un escenario Site-to-Site, debemos ajustar el Servidor 1 (el que recibe la conexión). En el Servidor 2 (el cliente), no necesitas cambiar nada, ya que su interfaz virtual vpn_vpn ya actúa de forma similar a un dispositivo TAP.

Aquí tienes los pasos exactos para dejar el Servidor 1 perfectamente configurado:

* Limpieza y creación del TAP:

Primero, eliminamos el puente físico que bloqueaba la comunicación con el propio servidor y creamos el nuevo.

Dentro de vpncmd (Opción 1):

~~~
# Entrar al Hub
VPN Server>Hub Empresa

# Borrar el puente físico antiguo (si existía)
VPN Server>BridgeDelete Empresa /DEVICE:ens34

# Crear el puente tipo TAP. El nombre 'vlink' es arbitrario, puedes usar el que quieras.
VPN Server>BridgeCreate Empresa /DEVICE:vlink /TAP:yes
~~~

A diferencia de la creación del puente físico, esta vez no indicamos la tarjeta de red como /DEVICE, sino que indicamos vlink (tarjeta de red virtual) añadiendo la opción /TAP:yes. Al ejecutar el comando anterior, SoftEther habrá creado una interfaz en tu Linux llamada tap_vlink. Ahora debemos darle vida.

En la terminal de Debian del Servidor 1:

~~~
# Levantar la interfaz física (sin IP, solo para que pase el tráfico)
ip link set ens34 up

# Levantar la interfaz TAP creada por SoftEther
ip link set tap_vlink up

# Asignar la IP del servidor a la interfaz TAP
ip addr add 192.168.10.10/24 dev tap_vlink
~~~

Para que el tráfico que llega por el túnel VPN pueda "saltar" a la tarjeta física ens34 (y así llegar al cliente interno 192.168.10.128), lo ideal es unir ambas interfaces en un puente de Linux.

Instala las utilidades de puente si no las tienes:

~~~
apt update && apt install bridge-utils -y
~~~

Configuramos el puente (br0):

~~~
# Crear el puente de sistema
brctl addbr br0

# Añadir la interfaz física y la del túnel al puente
brctl addif br0 ens34
brctl addif br0 tap_vlink

# Levantar el puente
ip link set br0 up
~~~

Con esto ya quedaría configurado un puente de tipo TAP.

## Conclusión ## 

La implementación exitosa de este escenario demuestra la versatilidad de SoftEther VPN para crear túneles de Capa 2. La transición de un Local Bridge físico a uno basado en TAP y Bridge de Linux (br0) fue fundamental para garantizar la gestión local del servidor sin perder la transparencia del tráfico entre sedes. El uso del puerto TCP 443 asegura, además, una alta capacidad de evasión frente a firewalls corporativos restrictivos.