---
title: "Linux desde 0"
date: 2025-11-20T15:55:00+02:00
categories: [Apuntes, Sistemas, Linux]
excerpt: "Aprende todo lo necesario para empezar a administrar sistemas Linux"
card_image: /assets/images/cards/debian.png
---

# Introducción

¿Qué es Linux?

Es un sistema operativo de código abierto y gratuito, que funciona como una alternativa a sistemas como Windows y macOS. Se basa en el kernel de Linux (El kernel seria el "programa" que se comunicar hardware con el software), que actúa como el núcleo fundamental que permite la comunicación entre el hardware y el software del sistema.

## Características principales

* **Código abierto:** Su código fuente es público y cualquiera puede colaborar, modificarlo y distribuirlo. Esto fomenta la innovación y la personalización.
* **Gratuito:** No requiere licencias para su uso, lo que lo hace una opción atractiva para usuarios y empresas.
* **Versátil:** Está presente en una gran diversidad de dispositivos, desde los más pequeños hasta los más potentes.
* **Multitarea:** Permite ejecutar varios programas y aplicaciones de manera simultánea.
* **Seguro y estable:** Se utiliza comúnmente en servidores web y otras aplicaciones críticas debido a su estabilidad y robustez.
* **Comunidad activa:** Una gran comunidad de desarrolladores contribuye a su continuo desarrollo y mantenimiento. 

## Principales usos

* **Servidores:** Es el sistema operativo más usado en servidores web por su estabilidad y seguridad.
* **Dispositivos móviles:** Android, el sistema operativo móvil más popular del mundo, está basado en el kernel de Linux.
* **Supercomputadoras:** Las 500 supercomputadoras más potentes del mundo utilizan alguna versión de Linux.
* **Computación en la nube:** La mayoría de los servicios en la nube se ejecutan sobre sistemas Linux.
* **Computadoras personales:** Sirve como alternativa a otros sistemas operativos de escritorio y portátiles.

## Principales distribuciones

¿Que es una distribución? Como se ha mencionado anteriormente, Linux es un sistema operativo de código abierto, lo que quiere

* Debian: Estable, robusta y muy usada en servidores.
* Archlinux: Muy personalizable.
* Fedora: Incluye tecnologías recientes
* Ubuntu: Ideal para escritorio y servidores.

# Directorios principales

Este sistema operativo hace uso de directorios UNIX que ha evolucionado actualmente a un formato FHS. Actualmente nos podemos encontrar varios tipos de directorio.

## Directorios Estáticos

* bin y sbin: alojan binarios, ficheros que son ejecutables.
* lib*: bibliotecas, trozos de códigos que se necesitan en muchos programas y por tema de reutilización de código se ejecutan una sola vez
* opt: 
* boot: contiene todos los ficheros que necesita el sistema para el arranque
* usr: se guardan las configuraciones y binarios de Linux

## Directorios Dinámicos

* var: variables, ficheros de log, etc...
* home: donde se guarda la información de los usuarios.
* tmp: este directorio se limpia en cada reinicio de sistema.

## Directorio de Sistemas

* etc: se alojan todas las configuraciones y programas que se instalen en el sistema.
* proc y sys: guardan información de discos, cpu, memorias, etc...
* dev: dispositivos de almacenamiento que se pueden conectar en un equipo de Linux.

## Directorios Compartidos

* tmp
* mnt: donde montamos las particiones donde se instalara el sistema operativo.

# Instalación de Linux

* Descargar ISO

Debian se descarga SIEMPRE desde su sitio oficial, en el caso de por ejemplo debian de descargaria desde [Sitio oficial Debian](https://www.debian.org/distrib)

* Instalación del sistema

# Trabajando con el sistema de archivos

## Archivos y directorios

* Archivo: parte del almacenamiento que contienen datos, pueden ser regulares (archivo de texto, imagen, video, etc...) o binario (contiene datos, pero lo que hace es ejecutar un programa, por ejemplo la ejecución de Firefox).

* Directorio: contienen archivos, el directorio principal es /

# Comandos básicos del terminal

## Listar y propiedades

* ls: listamos archivos y directorios dentro del directorio en el que estamos o bien del que se le indique. Haciendo por ejemplo de la opción -l podremos distinguir entre directorios y archivos ya que ls -l mostrara los directorios y archivos dentro de un directorio y en los permisos los directorios aparecerán con la letra "d".

## Crear archivos y directorios

* touch: para crear archivos
* mkdir: para crear directorios

## Mover, copiar y borrar

* mv: movemos el archivo o el directorio, ej: mv dir1/file1 dir2/, esto moverá el fichero dentro de dir1 a dir2.
* cp: copiamos el archivo o directorio, ej: cp file1 dir1/, esto copiara el fichero file1 dentro de dir1.
* rm: eliminamos el archivo, ej: rm file, para eliminar ficheros, en el caso de los directorios vacíos seria rmdir, en caso de que se quiera eliminar un directorio lleno se ejecutaría rm -fr (-f: forzado, -r: recursivo).

# Editores de archivos

Existen varios comandos para poder ver el contenido de los archivos: cat, less y head/tail.

* cat: muestra el contenido de un archivo.
* less: se usa sobre todo para ficheros grandes ya que nos permite subir y bajar por el.
* head/tail: head nos muestra la cabecera del archivo (las primeras 10 lineas por defecto), tail nos muestra las ultimas lineas del archivo (por defecto las 10 ultimas).

Para poder editar el contenido de los ficheros, las principales serian nano y vim, ambos harían lo mismo la diferencia entre uno y otro es básicamente que nano es mucho mas fácil de usar. Vim tiene dos modos escritura y comandos.

## Permisos de archivos y directorios

En Linux los archivos pueden pertenecer a un usuario y a un grupo de usuarios. Sien algun momento necesitamos cambiar de propietario un archivo o directorio, ejecutaríamos chown o bien chgrp si lo que necesita es cambiar el grupo.

## Permisos

Cada fichero y directorio tiene tres tipos de permisos:

* r: Permiso de lectura
* w: Permiso de escritura 
* x: Permiso de ejecución

Cada fichero/directorio define permisos para tres categorías:

* Usuario (propietario)	u: El dueño del archivo
* Grupo	(g): Usuarios que pertenecen al mismo grupo
* Otros	(o): Cualquier usuario del sistema

Ejemplo de permisos

~~~
-rwxr-x---
~~~

Esto significa:

* u (dueño): rwx → lectura, escritura, ejecución
* g (grupo): r-x → lectura y ejecución
* o (otros): --- → sin permisos

Podemos cambiar los permisos de usuarios y grupos usando chmod de dos formas, usando símbolos o los números.

* Usando símbolos:

~~~
chmod u+r archivo
chmod g-w archivo
~~~

* Usando números:

De esta forma los permisos se asignan sumando valores.

| Permiso | Valor |
| ------- | ----- |
| r       | 4     |
| w       | 2     |
| x       | 1     |

Ejemplos

~~~
chmod 644 archivo.txt   # rw-r--r--
chmod 755 script.sh     # rwxr-xr-x
chmod 700 privado       # rwx------
~~~

# Enlaces en los archivos

Los enlaces son archivos que hacen referencia a otro archivos (similar a un acceso directo en windows).

* enlaces blando o simbólico: similar a un acceso directo, hacemos referencia a otro fichero con la ruta.
* enlaces duro: dos referencias al mismo inodo,. esto solo se puede usar dentro del mismo sistema de archivos, es decir no puedes enlazar un fichero de un disco con otro fichero en otro disco.

# Búsqueda en la terminal

## Búsqueda por nombre

* find: comando de búsqueda, ej: find /home/usuario -name "file", esto buscara el fichero con el nombre exacto dentro de la ruta indicada.

## Búsqueda por propiedades

* usamos la opción -type del comando find, ej: find /home/usuario -type d, esto buscara todos los directorios dentro de /home/usuario. Para esta búsqueda podemos usar varios parámetros que podemos consultar ejecutando el comando man find, este seria el comando de manual con el que podremos consultar todos los parámetros de cualquier comando que se le indique.

## Búsqueda por contenido

* grep: permite buscar algún dato dentro de ficheros, ej: grep "hola" file, esto buscara la palabra hola dentro de file.

# Administración del sistema

## Identificar la distribución

Para poder identificar la distribución en la que estamos trabajamos podemos ejecutar los siguientes comandos.

* cat /etc/os-release con el que podremos ver el nombre de nuestra distribución.

## Conocer características hardware

Para saber por ejemplo información sobre el almacenamiento disponemos de los siguientes comandos:

* lsblk: muestra la información del disco y de sus particiones.
* df -h: muestra el espacio que ocupa los sistemas de ficheros montados en el disco.
* fdisk: crear y modificar particiones donde se alojara el sistema operativo.

# Gestión de usuarios y grupos

## Tipos de usuarios

* administrador (root): hay que tener cuidado con este usuario ya que tendrá permisos para todo.
* servicios: se suelen crear en el sistema al instalar una aplicación, por ejemplo cuando se instala Apache y se crea el usuario Apache.
* comunes: el usuario

## Crear usuarios

Hay dos opciones adduser o useradd (comando antiguo), para ello tenemos que ser root o usar el comando sudo, ej: sudo adduser sergio, esto creara el usuario y posteriormente nos pedirá una password. Tras la password pedirá información mas concreta y detallada para que la introduzcamos.

La información de todos los usuarios la podemos ver en /etc/passwd, es posible que se necesite permisos de root o usar sudo ya que esta información no debería mostrarse a cualquiera.

También podemos ver información de los usuarios con el comando id.

## Crear grupos 

Hay dos opciones addgroup o groupadd (comando antiguo)

## Modificar usuarios

Podemos cambiar la password, el home, cambiar o agregar a un grupo, etc...

* passwd: con este comando cambiamos la contraseña siempre y cuando sea nuestra, en el caso de que sea necesario cambiársela a otro usuario se tendrá que hacer con permisos de root o usando sudo.

* usermod (solo con permisos de root o sudo): cambia a un usuario de grupo.

## Eliminación de un usuario

Podemos bloquear el acceso si esta realizando actividades sospechosas y eliminar el usuario, para ello podemos eliminar el login.

* usermod con la opcion -L: bloquea el acceso al usuario que se le indique. El desbloqueo se haría con la opción -U.

* deluser o userdel: con ello eliminaremos al usuario, según la opción que le pongamos podemos eliminar solo el login o todo el contenido.

# Gestión de software

La gestión de paquetes depende sobre todo de la distribución por lo que en principio se comentara en el caso de Debian. Los gestores principales de paquetes son apt (basados en Debian), yum (basados en redhat), pacman (basados en archlinux) y snap (basados en ubuntu).

* Para la gestión de paquetes en Debian se hace uso del comando dpkg, para instalar paquetes se suele utilizar apt, este sistema apt se basa en repositorios.

* Para la gestión de paquetes en redhat se hace uso de rpm que también esta basado en repositorios, también tenemos dnf que es como la evolución de yum a la hora de realizar instalaciones.

* Para la gestión de paquetes usa pacman y también hace uso de repositorios.

* Para ubuntu tenemos snap, es un empaquetado de aplicaciones.

## Ver paquetes instalados

* distribuciones debian: dpkg -i / apt list --installed
* distribuciones redhat: yum list installed
* distribuciones arclinux: pacman -Q
* distribuciones snap: snap list

## Búsqueda de paquetes:

* Debian: apt search "nombre del paquete"
* redhat: yum search "nombre del paquete"
* archlinux: pacman -Ss "nombre del paquete"
* snap: snap search "nombre del paquete"

## Instalación de paquetes:

* Debian: apt install "nombre del paquete"
* redhat: yum install "nombre del paquete"
* archlinux: pacman -S "nombre del paquete"
* snap: snap install "nombre del paquete"

## Desinstalación de paquetes

* Debien: apt remove "nombre del paquete"
* redhat: yum remove "nombre del paquete"
* archlinux: pacman -R "nombre del paquete"
* snap: snap remove "nombre del paquete"

# Procesos y servicios

¿que es un proceso? es un programa en ejecución, por ejemplo cuando se abre el navegador. Para poder identificar los procesos en el sistema se usa el identificador PID.

## Tipos de procesos

* de usuario: los lanza un usuario, como por ejemplo abrir el navegador.
* de sistema: son todos los servicios que debe lanzar el sistema, como por ejemplo comprobar el estado del sistema.

## Gestión de procesos

Para realizar dicha gestión de procesos contamos con los siguientes comandos:

* ps: muestra los procesos.
* top: monitoriza los recursos.
* kill: envía señal a los procesos y los "mata".
* nice y renice: prioriza un proceso frente a otros para no malgastar recursos.

## Gestión de servicios

En Linux contamos con la opción systemd que es el mas usado, sus comandos mas básicos son: systemctl status (para saber el estado del servicio), systemctl start (para iniciar el servicio) y systemctl stop (para detener el servicio), estos comandos debes ser lanzados con sudo.

# Automatización de tareas con cron

¿que es cron? Es como el administrador de tareas de windows que se usa para programar comandos o scripts en momentos específicos o de manera periódica, como por ejemplo para hacer copias de backup de un sistema semanalmente.

Por ejemplo para acceder a cron, ejecutamos crontab -l para listar las tareas y crontab -e para añadir tareas a cron.

Estructura de crontab:

~~~
MIN HORA DIA MES DIA_SEMANA  COMANDO
~~~
~~~
| Campo            | Valor                 |
| ---------------- | --------------------- |
| Minuto           | 0–59                  |
| Hora             | 0–23                  |
| Día del mes      | 1–31                  |
| Mes              | 1–12                  |
| Día de la semana | 0–7 (0 y 7 = domingo) |
~~~

Ejemplo practico

~~~
0 18 * * 0 /usr/local/bin/backup_semanal.sh >> /var/log/backup_semanal.log 2>&1
~~~
~~~
| Campo   | Significado           |
| ------- | --------------------- |
| 0       | minuto 0              |
| 18      | 18:00 horas           |
| *       | cualquier día del mes |
| *       | cualquier mes         |
| 0       | domingo (0 o 7)       |
| comando | script de backup      |
~~~

Con este ejemplo haremos que automáticamente se haga una copia de seguridad todos los domingos a las 18:00 sin importar el dia que caiga o el mes que sea.

# Redes y seguridad

## Configuración de redes en Linux

En Linux para configurar la red contamos con las interfaces de red, estas interfaces son los puntos de conexión del pc con internet, esta conexión puede ser cableada o por wifi.

La configuración de red puede ser por DHCP (le pides al router una ip dentro de su rango) o ip fija (debes conocer las ip libres dentro de tu rango).

Las interfaces cableadas suelen llamarse eth, las interfaces por wifi suelen ser wlan, en algunos casos como en el de maquinas virtuales, estas interfaces pueden aparecer como enp0s1.

## Configuración manual

Para hacerlo de forma manual contamos con el comando ip.

* ip address show: con este comando podremos ver la ip que tenemos.
* ip addr add 192.168.1.11/24 dev eth0, para añadir una nueva ip a nuestra interfaz de red, en este caso eth0.
* ip route para ver por donde sale el acceso de nuestra maquina a internet.
* ip link set eth0 up/down: para activar o desactivar la interfaz de red.

En lugar de usar el comando ip podremos hacer uso del fichero interfaces (etc/network/interfaces) con este fichero podemos indicar que el equipo solicite la ip via dhcp o ponerla nosotros manualmente.

## Copias de seguridad y recuperación

Tipos de copias de seguridad

* Completa: se hace copia de todo el almacenamiento en otro disco/partición.
* Incrementales: una vez hecha la copia se van a ir añadiendo los datos de las próximas copias.
* Diferenciales: Los cambios realizados se realizan desde la copia completa.

## Alojamiento de copias

Para estar protegidos ante desastres es buenos que no estén en el mismo dispositivo o incluso en distinto lugar físico. Las herramientas mas comunes son:

* tar para empaquetar los datos.
* rsync: mover esos empaquetados a otros alojamientos.
* cron: automatiza las copias de seguridad.

# Seguridad

## Firewalls

* ufw (simple)
* iptables
* nftables (sustituto moderno)

Ejemplo:

ufw enable
ufw allow 22/tcp

## AppArmor / SELinux

Sistemas de seguridad obligatoria (MAC).

* Ubuntu usa AppArmor
* RHEL, Fedora usan SELinux

Ver estado:

aa-status       # AppArmor
sestatus        # SELinux