---
title: "Introducción práctica a Nagios Core: instalación, configuración y monitorización paso a paso"
date: 2026-02-01T112:35:00+02:00
categories: [Monitorización, Nagios]
excerpt: "Nagios Core es una de las herramientas clásicas de monitorización de sistemas en entornos Linux. En este artículo se explica qué es Nagios, cómo funciona su arquitectura y cómo instalarlo desde cero. A través de ejemplos prácticos aprenderás a configurar servicios, entender los estados OK/WARNING/CRITICAL y poner a prueba la monitorización forzando alertas reales en un entorno de laboratorio."
card_image: /assets/images/cards/nagios.png
---

## Introducción

En este artículo veremos cómo instalar Nagios Core desde cero y, lo más importante, cómo aprender a usarlo de forma práctica, entendiendo qué se monitoriza y cómo interpretar las alertas.

El objetivo no es solo “tener Nagios funcionando”, sino comprender qué hace cada servicio y por qué.

**¿Qué es Nagios?**

Nagios Core es una herramienta de monitorización de sistemas y servicios ampliamente utilizada en entornos profesionales. Su función principal es detectar problemas antes de que afecten a los usuarios, alertando cuando un sistema empieza a degradarse o cuando un servicio deja de funcionar.

Nagios se basa en una idea muy simple:

*"Comprobar periódicamente el estado de hosts y servicios, y avisar cuando algo no va bien."*

**Principales características de Nagios:**

* Monitorización de hosts (servidores, routers, máquinas virtuales)
* Monitorización de servicios (CPU, disco, red, procesos, aplicaciones)
* Sistema de alertas basado en estados: OK, WARNING y CRITICAL
* Arquitectura extensible mediante plugins
* Configuración basada en ficheros de texto (muy flexible)
* Enfoque preventivo: detectar problemas antes de la caída

Nagios no soluciona los problemas, pero te avisa con antelación para que puedas actuar.

# instalación y configuración

**Actualización del sistema**

Lo primero que haremos al tener lista la maquina (en el caso de que sea nueva), sera actualizar el sistema y asegurarnos de que la maquina tenga red.

~~~
sudo apt update && sudo apt upgrade -y
~~~

**Instalación de dependencias**

Nagios Core se compila desde código fuente y necesitamos: servidor web (Apache), pp para la interfaz web, herramientas de compilación y librerías para gráficos y plugins

~~~
sudo apt install -y autoconf gcc libc6 make wget unzip apache2 php libapache2-mod-php libgd-dev libssl-dev bc gawk dc build-essential snmp libnet-snmp-perl gettext
~~~

**Configuración de usuarios y grupos**

Nagios requiere un usuario propio para ejecutarse y permisos específicos para que el servidor web Apache pueda interactuar con él de forma segura.

* Crear usuario: sudo useradd nagios
* Crear grupo: sudo groupadd nagios
* Vinculamos Apache: sudo usermod -a -G nagios www-data

**Instalación de Nagios Core**

Compilaremos Nagios desde el código fuente para garantizar la versión más estable y personalizada. Para la descarga y compilación usaremos los siguientes comandos:

~~~
cd /tmp
wget -O nagioscore.tar.gz https://github.com/NagiosEnterprises/nagioscore/archive/nagios-4.5.8.tar.gz
tar xzf nagioscore.tar.gz
cd nagioscore-nagios-4.5.8/

# Configuración e Instalación
sudo ./configure --with-httpd-conf=/etc/apache2/sites-enabled
sudo make all
sudo make install-groups-users
sudo make install
sudo make install-daemoninit
sudo make install-commandmode
sudo make install-config
sudo make install-webconf
~~~

**Acceso a la interfaz web**

Crea una contraseña para el usuario administrador (nagiosadmin):

~~~
sudo htpasswd -c /usr/local/nagios/etc/htpasswd.users nagiosadmin
sudo a2enmod cgi
sudo systemctl restart apache2
~~~

**Instalación de Nagios Plugins**

Nagios Core es el "motor", pero los Plugins son las herramientas que realizan los chequeos (CPU, Disco, Ping). Para dicha instalación ejecutaremos los siguientes comandos.

~~~
cd /tmp
wget --no-check-certificate -O nagios-plugins.tar.gz https://github.com/nagios-plugins/nagios-plugins/archive/release-2.4.6.tar.gz
tar zxf nagios-plugins.tar.gz
cd nagios-plugins-release-2.4.6/

sudo ./tools/setup
sudo ./configure
sudo make
sudo make install
~~~

**Verificación y pruebas**

Para verificar que todo funciona, iniciamos el servicio:

~~~
sudo systemctl start nagios
~~~

¿Cómo aprender practicando?

Desde la máquina anfitrión, abrimos el navegador y escribimos la IP de su VM: http://[IP_DE_TU_VM]/nagios, nos pedirá las credenciales de administrador para entrar, y una vez que entremos estaremos ya en la pagina de inicio de Nagios.

![inicio Nagios](/assets/images/Nagios/inicio_nagios.PNG)

Para configurar las alertas en Nagios, debemos trabajar principalmente en el archivo de configuración del host (por defecto /usr/local/nagios/etc/objects/localhost.cfg para la máquina local). Nagios funciona definiendo Servicios, cada servicio utiliza un comando y unos parámetros (separados por !). La estructura básica de estos comandos suele ser "check_command NOMBRE_COMANDO!parametro1!parametro2"

**Ejemplo de monitorización de carga CPU (check_local_load):**

Este comando no mide el "uso de CPU" (0-100%), sino la Carga del Sistema (Load Average), es decir, el número de procesos que están usando la CPU o esperando a que la CPU se libere.

* Si tienes 1 CPU y la carga es 1.0, la CPU está perfectamente ocupada.
* Si la carga es 2.0, la CPU está saturada y hay un proceso haciendo cola.

La estructura del comando (por defecto) es la siguiente:

~~~
check_command       check_local_load!5.0,4.0,3.0!10.0,6.0,4.0
~~~

El comando se divide en dos bloques separados por "!", la primera parte afecta al warning, la segunda parte afecta al critical.

* warning: avisa de un problema potencial.
* critical: indica un problema real que requiere intervención inmediata.

Los números que encontramos en cada apartado son los límites máximos permitidos de carga, en orden 1m–5m–15m (orden fijo). Poniendo como ejemplo los valores por defecto, si en el primer minuto nuestra CPU alcanza una carga de 7 cuando por defecto esta a 5 (7 > 5), Nagios entiende esto como warning, en el caso de que después la carga del sistema baje y sea menor que los siguientes valores (4.0 y 3.0), pasara de warning a OK, en el caso contrario de que la carga de CPU siga subiendo pasará a critical.

Estos valores pueden verse afectados dependiendo de los cores que tenga la máquina, es decir, la configuración por defecto estaría pensada para máquinas de entre 2 a 4 núcleos. Para ajustar los parametros segun los cores de la maquina podemos emplear la siguiente regla:

* WARNING ≈ 0.7 × núcleos
* CRITICAL ≈ 1.0–1.5 × núcleos

Ejemplo: 

**1 core**

~~~
!0.7,0.5,0.3!1.5,1.2,1.0
~~~

**4 cores**

~~~
!3.0,2.5,2.0!5.0,4.0,3.5
~~~

**Ejercicio para forzar el warning y el critical**

Para entender como funciona el Load Average y cuando Nagios cambia de estado podemos hacer uso de los siguientes comandos:

* Podemos comprobar la carga actual del sistema usando **uptime**. Ejemplo: load average: 0.05, 0.03, 0.01
* Para ver cuanto núcleos tiene la maquina haremos uso de **nproc**.
* Podemos generar carga de CPU con el comando yes. Ejemplo: yes > /dev/null. Esto consume 1 core al 100% por lo que si nuestra maquina es de 1 core, al ejecutar uptime de nuevo podremos comprobar que estará en estado de warning. Si este proceso lo repetimos abriendo varios terminales, nuestra cpu pasara a critical.
* Para acabar con el proceso yes usaremos **pkill** yes.

**Ejemplo de monitorización de espacio en disco (check_local_disk):**

check_local_disk compara el espacio total libre con un porcentaje, por defecto el valor suele ser "check_local_disk!20%!10%!/".

* El primer parámetro indica que si el espacio en el disco baja (en este caso de 20%), el estado pasa a warning.
* El segundo parámetro indica que si el espacio en el disco baja (en este caso de 10%), el estado pasa a critical.
* El tercer parámetro indica la ruta del disco. En Linux, / es el disco principal.

**Ejercicio para forzar alerta de estado en disco**

* Para ver el estado disponible en disco hacemos uso de df -h /.
* Podemos crear un fichero grande (1 Gb) usando: dd if=/dev/zero of=/tmp/testfile bs=1M count=1024. este comando lo podemos ir repitiendo para ir consumiendo espacio en disco y provocar la alerta.
* Limpiamos en sistema ejecutando rm -f /tmp/testfile.

**Ejemplo de monitorización del estado de la red (check_ping):**

Envía paquetes de prueba ICMP. Ejemplo: check_ping!100.0,20%!500.0,60%.

* El primer parámetro es el warning, se activa si el tiempo de respuesta es mayor a 100ms o si se pierde mas del 20% de los paquetes enviados.

* El segundo parámetro es el critical, se activa si la respuesta tarda más de 500ms o se pierde más del 60% de la información.

**Ejercicio para forzar critical en la red**

* Podemos bloquear temporalmente ICMP ejecutando iptables -A INPUT -p icmp --icmp-type echo-request -j DROP (como root), de esta forma ping empezará a fallar, cuando empiecen a perderse paquetes se pondrá en estado warning y pasara a critical cuando cuando la perdida sea alta.

* Posteriormente para restaurar el estado de la red ejecutaremos iptables -D INPUT -p icmp --icmp-type echo-request -j DROP (como root)

**Ejemplo de monitorización del servicio SSH (check_ssh):**

Intenta realizar un "apretón de manos" (handshake) con el protocolo SSH en el puerto 22. Si el puerto está abierto y el servicio responde "OK", si el puerto está cerrado o el servicio SSH se ha caído: CRITICAL. Por lo general no suele llevar parámetros en su forma base.

A diferencia con el Ping te dice que el "servidor está encendido" el SSH te dice que el "servicio de administración está funcionando".

**Ejemplo de monitorización de la memoria swap (check_local_swap):**

La Swap es el espacio de intercambio en disco si Debian empieza a usar mucha Swap, es porque se ha quedado sin RAM física. En los parámetros que suelen ponerse suelen indicar el porcentaje de swap libre. Por ejemplo: 

~~~
check_local_swap!20!10
~~~

En este caso la swap pasara a estado warning cuando le quede un 20% libre, mientras que si llega a 10% pasara a estado critical lo que indicara que el servidor estará a punto de "congelarse" o de empezar a cerrar programas por falta de memoria.

**Ejercicio para detectar la falta de RAM**

Podemos detectar la falta de memoria RAM.

* Primero necesitamos instalar la herramienta de estres "apt install stress".
* Consumimos la memoria: stress --vm 2 --vm-bytes 512M
* Observamos el uso de swap usando free -h, cuando la swap empiece a llenarse, cuando le quede un 20% de espacio libre debería de ponerse en estado warning, y al llegar a 10% debería de pasar a critical.
* Una vez que hayamos hecho la prueba detenemos stress usando **pkill stress**.

# Ediciones de Nagios: Core y Nagios XI

Una vez entendido cómo funciona Nagios Core y cómo se configuran los servicios básicos, es importante conocer qué otras ediciones y enfoques existen dentro del ecosistema Nagios, y en qué casos es recomendable cada uno.

**¿Qué es Nagios Core?**

Nagios Core es el motor de monitorización. Es software libre (open source) y es la base de todo lo demás.

**Qué incluye**

* Motor de chequeos (scheduler)
* Sistema de estados: OK / WARNING / CRITICAL / UNKNOWN
* Sistema de alertas (email, scripts, etc.)
* Soporte de plugins
* Configuración por ficheros .cfg
* Interfaz web muy básica

**Ventajas**

* Ligero
* Extremadamente flexible
* Muy estable
* Gran ecosistema de plugins

**Inconvenientes**

* Curva de aprendizaje
* Mucha configuración manual
* Interfaz obsoleta

# NAGIOS XI #

Nagios XI es un producto comercial que usa Nagios Core por debajo, pero añade una capa completa de gestión.

**¿Qué añade sobre Core?**

* Interfaz web moderna
* Dashboards personalizables
* Configuración 100% gráfica
* Informes avanzados
* Gestión de usuarios y roles
* Asistentes de configuración (wizards)
* Soporte oficial de Nagios Enterprises

**Ventajas**

* Fácil de usar
* Mucho más visual
* Menos errores humanos
* Soporte profesional

**Inconvenientes**

* De pago
* Menos control fino
* Más consumo de recursos

# Conclusión #

Nagios es una herramienta potente para detectar problemas antes de que ocurran. La clave está en entender qué mide cada servicio, ajustar correctamente los umbrales y practicar provocando situaciones reales.