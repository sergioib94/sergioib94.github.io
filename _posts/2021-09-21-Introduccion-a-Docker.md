---
layout: single
title: "Introducción a Docker"
date: 2021-09-21T13:14:06+02:00
categories: [Aplicaciones Web, Apuntes]
excerpt: "Docker nos permite de forma sencilla crear contenedores ligeros y fáciles de mover donde ejecutar nuestras aplicaciones software sobre cualquier máquina con Docker instalado, independientemente del sistema operativo que la máquina tenga, facilitando así también los despliegues."
---

### **¿Qué es Docker?** ###

Docker es un proyecto de software libre que permite automatizar el despliegue de aplicaciones dentro de contenedores.

Docker nos permite de forma sencilla crear contenedores ligeros y fáciles de mover donde ejecutar nuestras aplicaciones software sobre cualquier máquina con Docker instalado, independientemente del sistema operativo que la máquina tenga, facilitando así también los despliegues.

**¿Que son los contenedores?**

Los contenedores son una forma de virtulización del sistema opertaivo, son como maquinas virtuales aisladas en los que podemos ejecutar cualquier cosa como por ejemplo microservicios, aplicaciones, etc... 

¿En qué se diferencian los contenedores de las máquinas virtuales?
Aunque tanto los contenedores como las máquinas virtuales permiten la ejecución de aplicaciones en entornos aislados, existen diferencias clave entre ambos.

|        Características          |        Contenedores (docker)        |        Máquinas Virtuales        |
|---------------------------------|-------------------------------------|----------------------------------|
| Aislamiento                     |    Compartido con el sistema host   |       Completamente aislado      |
|---------------------------------|-------------------------------------|----------------------------------|
| Consumo de recursos             |     Bajo (solo usa lo necesario)    |     Alto (requiere SO completo)  |
|---------------------------------|-------------------------------------|----------------------------------|
| Velocidad                       |       Muy rápido (milisegundos)     |      Lento (segundos/minutos)    |
|---------------------------------|-------------------------------------|----------------------------------|
| Tamaño                          |              Ligero (MB)            |             Pesado (GB)          |
|---------------------------------|-------------------------------------|----------------------------------|
| Arranque                        |              Inmediato              |               Lento              |
|---------------------------------|-------------------------------------|----------------------------------|
| Uso de CPU/RAM                  |    Optimizado, solo lo necesario    |        Consume más recursos      |
|---------------------------------|-------------------------------------|----------------------------------|

### **Caracteristicas de Docker** ###

* **Portabilidad**: El contenedor Docker podremos desplegarlo en cualquier otro sistema siempre y cuando soporte esta tecnología, con lo que nos ahorraremos el tener que instalar en este nuevo entorno todas aquellas aplicaciones que normalmente usemos.

* **Ligereza**: Los sistemas virtualizados con Docker suelen pesar mucho menos que usando otros medios como pueden ser maquinas virtuales.

* **Autosuficiencia**: Un contenedor Docker no contiene todo un sistema completo, sino únicamente aquellas librerías, archivos y configuraciones necesarias para desplegar las funcionalidades que contenga. Asimismo, Docker se encarga de la gestión del contenedor y de las aplicaciones que contenga.

* **Seguridad**: Es seguro haciendo uso de namespaces y cgroups, los recursos están aislados.

* **Uso de imágenes**: Una imagen Docker podríamos entenderla como un Sistema Operativo con aplicaciones instaladas. A partir de una imagen se puede crear un contenedor. Las imágenes de docker son portables entre diferentes plataformas, el único requisito es que en el sistema huésped esté disponible docker.

### **Instalación de Docker (Debian Buster)** ###

1. Empezamos actualizando la paqueteria:

~~~
sudo apt-get update
~~~

2. Instalamos los siguientes paquetes para el uso de docker:

~~~
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
~~~

3. Añadimos la clave gpg a nuestro repositorio (en este caso repositorios de debian):

~~~
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
~~~

4. Configuramos el repositorio estable de docker:

~~~
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
~~~

5. Instalamos Docker:

~~~
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
~~~

Si lo que queremos es usar docker sin sudo, ejecutaremos el siguiente comando:

~~~
sudo usermod -aG docker $USER
~~~

### **Comandos utiles de docker** ###

* Ejecutar un contenedor a partir de una imagen:

~~~
docker run "nombre de la imagen"
~~~

Podemos obtener varias imágenes de docker en la sigiente pagina [Dockerhub](https://hub.docker.com/). En el caso de que una imagen tenga varias versiones podemos ejecutar la version deseada de la siguiente forma:

~~~
docker run "nombre de la imagen":"version"
~~~

En el caso de no indicar la version, por defecto se ejecutara la ultima version que exista de la imagen.

* Ejecutar un contenedor en background o segundo plano:

~~~
docker run -d "nombre de la imagen"
~~~

* Descargar imágenes docker:

~~~
docker pull "nombre de la imagen"
~~~

Aunque este comando no es del todo necesario ya que si la imagen que queremos ejecutar no la tenemos, al ejecutar docker run se descarga de forma automatica siempre y cuando exista la imagen que queremos. Este comando se usa sobre todo en el caso de querer descargar imágenes sin que se ejecuten automticamente.

* Comprobar las imágenes que tenemos en nuestra maquina:

~~~
docker images
~~~

Ejemplo:

~~~
sergioib@debian-sergio:~$ docker images
REPOSITORY                 TAG                 IMAGE ID            CREATED             SIZE
sergioib94/drupal          v1                  ffabd2bb2653        6 months ago        334MB
sergioib94/bookmedik-php   v1                  5b857f8a175a        6 months ago        436MB
mysql                      5.6                 0abf1c71efa3        6 months ago        303MB
sergioib94/bookmedik2      v1                  5dd61ff34e91        6 months ago        435MB
sergioib94/bookmedik       v1                  3d1d3ed847f8        6 months ago        249MB
sergioib94/bookmedik       <none>              df7505c5a0ba        6 months ago        251MB
mariadb                    latest              70e69b4a7bda        7 months ago        401MB
joomla                     latest              6014b57fda53        7 months ago        458MB
php                        7.4-apache          83db90327db8        7 months ago        414MB
debian                     latest              5890f8ba95f6        7 months ago        114MB
php                        7.4.3-apache        d753d5b380a1        7 months ago       414MB
~~~

En mi caso estas son las imágenes que tengo en mi equipo, algunas usadas en otras practicas y ejemplos y otras descargadas y modificadas por mi.

Cada imagen cuenta con una ID unica que podremos usar posteriormente para eliminar las imágenes.

* Mostrar contenedores que se estan ejecutando:

~~~
docker ps
~~~

A este comando le podemos añadir la opción -a si lo que queremos es mostrar todos los contenedores que en algun momento se han ejecutado.

~~~
sergioib@debian-sergio:~$ docker ps
CONTAINER ID        IMAGE                         COMMAND                  CREATED             STATUS                          PORTS                     NAMES
83deaf076a51        joomla                        "/entrypoint.sh apac…"   6 months ago        Up 2 hours                      0.0.0.0:8080->80/tcp      deploy_joomla_1
530ef214963a        mysql:5.6                     "docker-entrypoint.s…"   6 months ago        Up 2 hours                      0.0.0.0:32768->3306/tcp   deploy_joomladb_1
220f6974c26f        mysql:5.6                     "docker-entrypoint.s…"   6 months ago        Restarting (1) 31 seconds ago                             deploy_db_1
b18afffe8d15        sergioib94/drupal:v1          "/usr/sbin/apache2ct…"   6 months ago        Up 2 hours                      0.0.0.0:8083->80/tcp      drupal
28dc5d493419        sergioib94/bookmedik-php:v1   "docker-php-entrypoi…"   6 months ago        Up 2 hours                      0.0.0.0:8081->80/tcp      bookmedik-php

sergioib@debian-sergio:~$ docker ps -a
CONTAINER ID        IMAGE                         COMMAND                  CREATED             STATUS                         PORTS                     NAMES
83deaf076a51        joomla                        "/entrypoint.sh apac…"   6 months ago        Up 2 hours                     0.0.0.0:8080->80/tcp      deploy_joomla_1
530ef214963a        mysql:5.6                     "docker-entrypoint.s…"   6 months ago        Up 2 hours                     0.0.0.0:32768->3306/tcp   deploy_joomladb_1
220f6974c26f        mysql:5.6                     "docker-entrypoint.s…"   6 months ago        Restarting (1) 6 seconds ago                             deploy_db_1
b18afffe8d15        sergioib94/drupal:v1          "/usr/sbin/apache2ct…"   6 months ago        Up 2 hours                     0.0.0.0:8083->80/tcp      drupal
631dc24356c6        5890f8ba95f6                  "/bin/sh -c 'apt-get…"   6 months ago        Exited (100) 6 months ago                                mystifying_visvesvaraya
28dc5d493419        sergioib94/bookmedik-php:v1   "docker-php-entrypoi…"   6 months ago        Up 2 hours                     0.0.0.0:8081->80/tcp      bookmedik-php
~~~

* Reiniciar un contenedor:

~~~
docker start "ID del contenedor"
~~~

* Mostrar logs de un contenedor:

~~~
docker logs "ID del contenedor" o bien docker logs "nombre del contenedor"
~~~

* Ejecutar comandos dentro de un contenedor que se este ejecutando:

~~~
docker exec "ID del contenedor"
~~~

Con este comando podemos usar las opciones -i para crear una sesion interactiva y -t emulara una terminal. Por ejemplo:

~~~
sergioib@debian-sergio:~$ docker exec -it 83deaf076a51 sh
# ls
LICENSE.txt  administrator  cache  components	      htaccess.txt  includes   language  libraries  modules  robots.txt  tmp
README.txt   bin	    cli    configuration.php  images	    index.php  layouts	 media	    plugins  templates	 web.config.txt
# 
~~~

En este caso por ejemplo abrimos una terminal sh para poder ejecutar comandos en el contenedor que en este caso es un contenedor joomla y probamos la ejecucion de ls.

* Parar uno o varios contenedores:

~~~
docker stop "ID del contenedor"
~~~

En el caso de querer parar varios contenedores simplemente se ponen las ID de los contenedores separadas por espacios una tras otra.

* Conectarse al contenedor:

~~~
docker attach "ID contenedor"
~~~

* Mostrar las caracteristicas del contenedor:

~~~
docker inspect "ID del conetedor"
~~~

Ejemplo:

~~~
sergioib@debian-sergio:~$ docker inspect b18afffe8d15
[
    {
        "Id": "b18afffe8d155d67e3992d10c4336a78c90afcadba4fbddc6f7379d66ca5ceec",
        "Created": "2021-03-03T15:57:19.599943415Z",
        "Path": "/usr/sbin/apache2ctl",
        "Args": [
            "-D",
            "FOREGROUND"
        ],
        "State": {
            "Status": "running",
            "Running": true,
            "Paused": false,
            "Restarting": false,
            "OOMKilled": false,
            "Dead": false,
            "Pid": 1976,
            "ExitCode": 0,
            "Error": "",
            "StartedAt": "2021-09-23T08:46:42.423040032Z",
            "FinishedAt": "2021-09-22T14:27:05.965384671Z"
        },
        "Image": "sha256:ffabd2bb26538aa1861095857117a51d13cae77cc89e9736cd69ddd006409803",
        "ResolvConfPath": "/var/lib/docker/containers/b18afffe8d155d67e3992d10c4336a78c90afcadba4fbddc6f7379d66ca5ceec/resolv.conf",
        "HostnamePath": "/var/lib/docker/containers/b18afffe8d155d67e3992d10c4336a78c90afcadba4fbddc6f7379d66ca5ceec/hostname",
        "HostsPath": "/var/lib/docker/containers/b18afffe8d155d67e3992d10c4336a78c90afcadba4fbddc6f7379d66ca5ceec/hosts",
        "LogPath": "/var/lib/docker/containers/b18afffe8d155d67e3992d10c4336a78c90afcadba4fbddc6f7379d66ca5ceec/b18afffe8d155d67e3992d10c4336a78c90afcadba4fbddc6f7379d66ca5ceec-json.log",
        "Name": "/drupal",
        "RestartCount": 0,
        "Driver": "overlay2",
        "Platform": "linux",
        "MountLabel": "",
        "ProcessLabel": "",
        "AppArmorProfile": "docker-default",
        "ExecIDs": null,
        "HostConfig": {
            "Binds": [
                "/home/sergio/Escritorio/Informatica/Github/docker-bookmedik/Tarea4/vol-app:/var/log/apache2:rw"
            ],
            "ContainerIDFile": "",
            "LogConfig": {
                "Type": "json-file",
                "Config": {}
            },
            "NetworkMode": "deploy_default",
            "PortBindings": {
                "80/tcp": [
                    {
                        "HostIp": "",
                        "HostPort": "8083"
                    }
                ]
            },
            "RestartPolicy": {
                "Name": "always",
                "MaximumRetryCount": 0
            },
            "AutoRemove": false,
            "VolumeDriver": "",
            "VolumesFrom": [],
            "CapAdd": null,
            "CapDrop": null,
            "Dns": [],
            "DnsOptions": [],
            "DnsSearch": [],
            "ExtraHosts": null,
            "GroupAdd": null,
            "IpcMode": "shareable",
            "Cgroup": "",
            "Links": null,
            "OomScoreAdj": 0,
            "PidMode": "",
            "Privileged": false,
            "PublishAllPorts": false,
            "ReadonlyRootfs": false,
            "SecurityOpt": null,
            "UTSMode": "",
            "UsernsMode": "",
            "ShmSize": 67108864,
            "Runtime": "runc",
            "ConsoleSize": [
                0,
                0
            ],
            "Isolation": "",
            "CpuShares": 0,
            "Memory": 0,
            "NanoCpus": 0,
            "CgroupParent": "",
            "BlkioWeight": 0,
            "BlkioWeightDevice": null,
            "BlkioDeviceReadBps": null,
            "BlkioDeviceWriteBps": null,
            "BlkioDeviceReadIOps": null,
            "BlkioDeviceWriteIOps": null,
            "CpuPeriod": 0,
            "CpuQuota": 0,
            "CpuRealtimePeriod": 0,
            "CpuRealtimeRuntime": 0,
            "CpusetCpus": "",
            "CpusetMems": "",
            "Devices": null,
            "DeviceCgroupRules": null,
            "DiskQuota": 0,
            "KernelMemory": 0,
            "MemoryReservation": 0,
            "MemorySwap": 0,
            "MemorySwappiness": null,
            "OomKillDisable": false,
            "PidsLimit": 0,
            "Ulimits": null,
            "CpuCount": 0,
            "CpuPercent": 0,
            "IOMaximumIOps": 0,
            "IOMaximumBandwidth": 0,
            "MaskedPaths": [
                "/proc/asound",
                "/proc/acpi",
                "/proc/kcore",
                "/proc/keys",
                "/proc/latency_stats",
                "/proc/timer_list",
                "/proc/timer_stats",
                "/proc/sched_debug",
                "/proc/scsi",
                "/sys/firmware"
            ],
            "ReadonlyPaths": [
                "/proc/bus",
                "/proc/fs",
                "/proc/irq",
                "/proc/sys",
                "/proc/sysrq-trigger"
            ]
        },
        "GraphDriver": {
            "Data": {
                "LowerDir": "/var/lib/docker/overlay2/99132561004d96471fbd8c8bf78bcdd3edb404b60bb6a56b7bd7b5210642cf9a-init/diff:/var/lib/docker/overlay2/8c19cff03760c3f3538225d3dda65f1417b24d7bf36620df33a0b82397ae0bdc/diff:/var/lib/docker/overlay2/59b79af32079cb6f562e43f6a2942e683371fedf54ab563b2d02a900328286a3/diff:/var/lib/docker/overlay2/7120a8197d4c96b9f28c9920a6efd08ef521c63dc59853c0b54d04cc147c2824/diff:/var/lib/docker/overlay2/8fd883ebf1a0ff23f7569944810d7e1442a78af7305c2ab7c5d7a94df2dfdba3/diff",
                "MergedDir": "/var/lib/docker/overlay2/99132561004d96471fbd8c8bf78bcdd3edb404b60bb6a56b7bd7b5210642cf9a/merged",
                "UpperDir": "/var/lib/docker/overlay2/99132561004d96471fbd8c8bf78bcdd3edb404b60bb6a56b7bd7b5210642cf9a/diff",
                "WorkDir": "/var/lib/docker/overlay2/99132561004d96471fbd8c8bf78bcdd3edb404b60bb6a56b7bd7b5210642cf9a/work"
            },
            "Name": "overlay2"
        },
        "Mounts": [
            {
                "Type": "bind",
                "Source": "/home/sergio/Escritorio/Informatica/Github/docker-bookmedik/Tarea4/vol-app",
                "Destination": "/var/log/apache2",
                "Mode": "rw",
                "RW": true,
                "Propagation": "rprivate"
            }
        ],
        "Config": {
            "Hostname": "b18afffe8d15",
            "Domainname": "",
            "User": "",
            "AttachStdin": false,
            "AttachStdout": false,
            "AttachStderr": false,
            "ExposedPorts": {
                "80/tcp": {}
            },
            "Tty": false,
            "OpenStdin": false,
            "StdinOnce": false,
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
            ],
            "Cmd": [
                "/usr/sbin/apache2ctl",
                "-D",
                "FOREGROUND"
            ],
            "ArgsEscaped": true,
            "Image": "sergioib94/drupal:v1",
            "Volumes": {
                "/var/log/apache2": {}
            },
            "WorkingDir": "",
            "Entrypoint": null,
            "OnBuild": null,
            "Labels": {
                "com.docker.compose.config-hash": "bdc0b1a85207601bcc1fd0c585c01d9686d3d4f0ff6fd4db65d59399d6b782eb",
                "com.docker.compose.container-number": "1",
                "com.docker.compose.oneoff": "False",
                "com.docker.compose.project": "deploy",
                "com.docker.compose.service": "drupal",
                "com.docker.compose.version": "1.21.0"
            }
        },
        "NetworkSettings": {
            "Bridge": "",
            "SandboxID": "ed755bb08c99f9185c07790e7a3d1c57a3d36fbb3424b680c0e6985ab6173f2c",
            "HairpinMode": false,
            "LinkLocalIPv6Address": "",
            "LinkLocalIPv6PrefixLen": 0,
            "Ports": {
                "80/tcp": [
                    {
                        "HostIp": "0.0.0.0",
                        "HostPort": "8083"
                    }
                ]
            },
            "SandboxKey": "/var/run/docker/netns/ed755bb08c99",
            "SecondaryIPAddresses": null,
            "SecondaryIPv6Addresses": null,
            "EndpointID": "",
            "Gateway": "",
            "GlobalIPv6Address": "",
            "GlobalIPv6PrefixLen": 0,
            "IPAddress": "",
            "IPPrefixLen": 0,
            "IPv6Gateway": "",
            "MacAddress": "",
            "Networks": {
                "deploy_default": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": [
                        "drupal",
                        "b18afffe8d15"
                    ],
                    "NetworkID": "2d13f9ba198280146426de0bc4704bd911c6a593640187644d83bda98cf8daab",
                    "EndpointID": "df8047a7c43eab47ea408f970c982eb6c86e743897d3c4328a013cc7415a4785",
                    "Gateway": "172.21.0.1",
                    "IPAddress": "172.21.0.4",
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "MacAddress": "02:42:ac:15:00:04",
                    "DriverOpts": null
                }
            }
        }
    }
]
~~~

En este caso vemos la informacion relacionada con un contenedor que aloja Drupal. Aqui podemos encontrar varia informacion como:

* El id del contenedor.
* Los puertos abiertos y sus redirecciones
* Los bind mounts y volúmenes usados.
* El tamaño del contenedor
* La configuración de red del contenedor.
* El ENTRYPOINT que es lo que se ejecuta al hacer docker run.
* El valor de las variables de entorno.
* Y muchas más cosas….

* Destruir o "matar" un contenedor:

~~~
docker kill "ID controlador"
~~~

* Pausar/reanudar un contenedor:

~~~
docker pause "ID controlador" / docker unpause "ID controlador"
~~~

* Ver o establecer un puerto para un contenedor:

~~~
docker port "numero de puerto" "ID contenedor"
~~~

A la hora de establecer el puerto de un contenedor tambien podemos hacerlo usando la opcion -p:

~~~
docker -p "nuemro de puerto" "ID contenedor"
~~~

* Renombrar un contenedor:

~~~
docker renamo "ID contenedor"
~~~

* Eliminar todos los contenedores:

~~~
docker rm -f $(docker ps -a -q)
~~~

* Comprobar la version de docker:

~~~
docker --version
~~~

Ejemplo:

~~~
sergioib@debian-sergio:~$ docker --version
Docker version 18.09.1, build 4c52b90
~~~

En mi caso la version esta un poco desactualizada ya que actualmente si no me equivoco la version actual es la 20.10.

### **Creación de imágenes** ###

#### **Modificando una imagen** ####

Con Docker tenemos la posibilidad de crear una imagen personalizada a partir de una imagen ya existente modificando el contenedor de la siguiente forma:

1. Arrancamos un contenedor artiendo de una imagen como base:
2. Realizamos algun tipo de modificacion:
3. Usamos el comando docker commit para crear una imagen que contenga la imagen base usasda + las modificaciones añadidas:

En el caso de que queramos añadir nuestra imagen personalizada en docker hub ejecutamos los siguientes comandos:

1. Nos logueamos en docker hub ejecutando el comando docker logine introduciendo nuestro usuario y contraseña.

2. Una vez logueados ejecutamos docker push subiendo nuestra imagen a docker hub.

~~~
sergioib@debian-sergio:~$ docker ps
CONTAINER ID        IMAGE                         COMMAND                  CREATED             STATUS                          PORTS                     NAMES
b18afffe8d15        sergioib94/drupal:v1          "/usr/sbin/apache2ct…"   6 months ago        Up 3 hours                      0.0.0.0:8083->80/tcp      drupal
~~~

En mi caso por ejemplo cuento con una imagen modificada por mi de un contenedor que cuenta con un drupal, en este caso si quiero subir este drupal mio a docker hub tendria que loguarme con docker login y una vez logueado subir la imagen con docker push:

~~~
docker push sergioib94/drupal:v1
~~~

De esta forma cualquier usuario de docker hub puede descargarse nuestra imagen y trabajar con ella ejecutando un docker pull.

#### **Haciendo uso de un fichero dockerfile** ####

Esta que hemos visto es una forma de crear una imagen personalizada en docker, pero lo abitual es crearla haciendo uso de un fichero dockerfile.

¿Que es un fichero dockerfile? este es un fichero de texto plano que contiene una serie de instrucciones, necesarias para crear una imagen que posteriormente, se convertirá en una aplicacion.

Unos ejemplos sobre el uso de dockerfile los podemos encontrar en el post [aplicaciones web php en docker](https://sergioib.netlify.app/posts/aplicaciones-web-php-en-docker/) en el que a traves de unos ejercicios hacemos uso de una imagen de la aplicacion bookmedic y la personalizamos.

La estructura de los dockerfile será la siguiente:

* En los ficheros dockerfile la primera linea que indicaremos será un **FROM** indicando la imagen "padre" o imagen base que va a usarse.

* La linea de **WORKDIR**, en el que se va a declarar en que directorio se va a realizar todo el trabajo, en el caso de que no exista el directorio, se creara de forma automática.

* En el caso necesario podemos tener tambien una linea **COPY** con la linea copy podremos copiar los ficheros del directorio donde esta nuestro dockerfile al directorio de trabajo de nuestro contenedor indicado en la linea workdir.

* Podemos hacer uso tambien de RUN en nuestro dockerfile para que se ejecuten los comandos indocados una vez se cree el contenedor.

* Todos los dockerfile deben acabar con una linea **CMD**, indicando los comandos o scripts que se van a ejecutar.

Ejemplo:

~~~
# Imágen base de PHP con docker
FROM php:7.4-apache

# Variables de entorno
ENV MARIADB_USER admin
ENV MARIADB_PASS admin
ENV MARIADB_HOST servidor_mysql2

# Instalación de paquetes necesarios
RUN apt-get update
RUN docker-php-ext-install pdo pdo_mysql mysqli json
RUN a2enmod rewrite

# Exponer puerto 80
EXPOSE 80

# Habilitar módulos de Apache
WORKDIR /var/www/html

# Copiar archivos de la aplicación
COPY bookmedik/ /var/www/html

ADD script.sh /usr/local/bin/script.sh

RUN chmod +x /usr/local/bin/script.sh

# Comando que ejecutará el contenedor
CMD ["script.sh"]
~~~

En este ejemplo usamos una imagen base de php version 7.4 con apache. Se han creado tres variables, mariadb_user, mariadb_pass y mariadb_host de forma que el mysql que tendremos en nuestro contenedor reciva las varioables a traves del script indicado al final del dockerfile.

Una vez creado el contenedor se ejecutaran los comandos indicados con run, es decir que el contenedor de actualizara, se descargaran varios paquetes y se habilitara el modulo rewrite de apache.

Como nuestro contenedor tendra un apache y php, se abrira el puerto 80 para que haga uso de el apache usando para ello la linea **EXPOSE**.

El directorio de trabajo indicado será /var/www/html y copiaremos en ese directorio los ficheros de nuestro directorio bookmedik (una aplicacion web que hace de agenda).

añdimos s nuestro contenedor el script indicado usando **ADD** en la ubicacion necesaria y jecutamos otro RUN para darle permisos de ejecucion a al script y que de esa forma mysql reciba los datos necesario y al ejecutar apache se pueda usar la aplicacion web de bookmedik

El contenido de nuestro script.sh será el siguiente:

~~~
#!/bin/bash
sed -i "s/$this->user=\"root\";/$this->user=\"$MARIADB_USER\";/g" /var/www/html/core/controller/Database.php
sed -i "s/$this->pass=\"\";/$this->pass=\"$MARIADB_PASS\";/g" /var/www/html/core/controller/Database.php
sed -i "s/$this->host=\"localhost\";/$this->host=\"$MARIADB_HOST\";/g" /var/www/html/core/controller/Database.php
~~~

Después para construir el contenedor, ejecutamos docker build -t "nombre de la imagen"

### **Redes en Docker** ###

A los contenedores que creemos, tenemos la posibilidad de añadirlos a una red haciendo uso de los siguientes comandos:

* Conectar/desconectar una red de un contenedor:

~~~
docker network connect/disconnect "ID red"
~~~

* Crear una nueva red:

~~~
docker network create
~~~

* Mostrar informacion de una red:

~~~
docker network inspect "ID red"
~~~

* Mostrar todas las redes docker 

~~~
docker network ls
~~~

* Eliminar red:

~~~
docker network rm
~~~

Por defecto al instalar docker se crean automaticamente tres redes, bridge, none y host:

~~~
sergioib@debian-sergio:~$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
1857a84cc7c7        bridge              bridge              local
daeb4ba11558        host                host                local
98f5e7fa91c2        none                null                local
~~~

* Red bridge: Es la red a la que se conectan los contenedores por defecto (con direccionamiento 172.17.0.0/16). Esta red corresponde a la interfaz docker0 en nuestra maquina fisica, esta interfaz hace de puerta de enlace de los contenedores.

    * Con esta red podremos aislar los distintos contenedores en distintas subredes docker, de tal manera que desde cada una de las subredes solo podremos acceder a los equipos de esa misma subred.

    * Aislar los contenedores del acceso exterior.

    * Publicar servicios que tengamos en los contenedores mediante redirecciones que docker implementará con las reglas de iptables.

* Si conectamos un contenedor a la red host, el contenedor estaría en la misma red que el host (por lo tanto toma direccionamiento del servidor DHCP de nuestra red). Además los puertos son accesibles directamente desde el host.

* La red none no configurará ninguna IP para el contenedor y no tiene acceso a la red externa ni a otros contenedores. Tiene la dirección loopback y se puede usar para ejecutar trabajos por lotes.

### **Almacenamiento en Docker** ###

La información de los contenedores que ejecutamos es efimera, lo que quiere decir que una vez cerramos sesión, toda la informacion se pierde por lo que necesitaremos crear volumenes si queremos que dicha informacion permanezca. Estos volumenes son simplemente directorios que se crean en nuestro sistema de ficheros para que docker pueda almacenar la información.

Para mantener la informacion de los contenedores tendremos varias opciones:

* Volumenes docker
* Bind mounts

#### **Volumenes docker** ####

Para gestionar los volumenes docker podemos ejecutar los siguientes comandos:

* Creacion de volumenes:

~~~
docker volume create "nombre del volumen"
~~~

* Eliminacion de volumenes:

~~~
docker volume rm "nombre del volumen"
~~~

* Mostrar volumenes que tenemos creados:

~~~
docker volume ls
~~~

* Eliminacion de volumenes que no se estan usando:

~~~
docker volume prune
~~~

* Mostrar detalles sobre los volumenes:

~~~
docker volume inspect "nombre del volumen"
~~~

Como ejemplo se va a crear un contenedor con una imagen base de debian haciendo uso de la opción -v para así indicar la ubicación de nuestro volumen creado.

~~~
#Creamos primero un volumen que usaremos de prueba.

sergioib@debian-sergio:~$ docker volume create prueba
prueba

#Ejecutamos el contenedor indicando tanto el nombre del contenedor, donde se ubicara el volumen y la imagen a usar.

sergioib@debian-sergio:~$ docker run -d --name debian-prueba -v prueba:/usr/share/prueba debian
905c1a3bac1bdce990d459aa9668e90d55135fc29f080a2056286c66b4a2c037

#Comprobamos que se ha creado.

sergioib@debian-sergio:~$ docker ps -a
CONTAINER ID        IMAGE                         COMMAND                  CREATED              STATUS                          PORTS                     NAMES                          prueba-mdb
905c1a3bac1b        debian                        "bash"                   3 minutes ago        UP 3 minutes ago                                  debian-prueba
~~~

#### **Bind mounts** ####

Con el método bind mount hacemos la información persistente y estará gestionada por nosotros mismos, a diferencia de los volúmenes Docker que requieren permisos. Este sistema es muy parecido ya que se trata de montar una parte del sistema de ficheros en el contenedor.

Para poner en practica este método, empezaremos creando un directorio donde se alojara nuestra información. Este volumen se usara más adelante como ejemplo a la hora de usar docker compose, en este caso se ha creado el directorio en la siguiente ruta "docker-bookmedik/Tarea4/".

### **Docker Compose** ###

Docker-Compose es una herramienta soluciona el problema de tener que repetir cada comando al levantar nuestro contenedores, ya que parte de un fichero YML en el que estan indicados todos los elementos que necesita Docker para montar nuestros escenarios de multicontenedor. Es importante el orden en el que se escriben los parámetros.

Para hacer uso de docker compose, lo primero será instalarlo:

~~~
# Añadimos la clave GPG
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -

# Buscamos el paquete 
sudo apt-cache policy docker-compose

# Lo instalamos
sudo apt-get install docker-compose
~~~

Ejemplo de uso:

Vamos ha hacer una prueba de instalación, instalando como ejemplo un contenedor docker con drupal que use una base de datos mysql.

Para ello crearemos una carpeta deply donde guardaremos nuestro docker compose, a diferencia de con dockerfile que lo guardabamos todo lo relacionado con la instalacion del contenedor en un directorio buil (no es necesaria esta distincion entre directorio build y directorio deploy, es solo para que se entienda mejor).

Nuestro fichero docker compose será el siguiente:

~~~
version: "3.1"

services:
  db:
    container_name: servidor_mysql_drupal
    image: mariadb
    restart: always
    environment:
      MYSQL_DATABASE: drupal
      MYSQL_USER: admin
      MYSQL_PASSWORD: admin
      MYSQL_ROOT_PASSWORD: drupal_admin
    volumes:
      - /home/sergio/Escritorio/Informatica/Github/docker-bookmedik/Tarea4/vol-maria:/var/lib/mysql

  drupal:
    container_name: drupal
    image: sergioib94/drupal:v1
    restart: always
    ports:
      - 8083:80
    volumes:
      - /home/sergio/Escritorio/Informatica/Github/docker-bookmedik/Tarea4/vol-app:/var/log/apache2
~~~

En este ejemplo estamos creando dos contenedores, uno al que llamamos db que alojara la base de datos de mariadb y otro contenedor en el que se desplegará drupal.

En el contenedor de mariadb, indicamos tanto la imagen que se usará, así como las variables de entorno necesarias para que dicha base de datos funcione correctamente (nombre de la base de datos, usuario, contraseña, contraseña de administrador) y querer que permanezcan persistentes los datos de nuestra base de datos, creamos un volumen persistente haciendo uso de bind mount.

Por otro lado al contenedor de drupal solo será necesario indicar la imagen que en este caso es una imagen drupal configurada por mi ya que la configuración por defecto daba error a la hora de instarse, indicamos los puertos a usar (en mi caso el puerto 8083 ya que los puertos 82, 81 y 80 los tengo ocupados con otros contenedores).

Desplegamos el docker compose ejecutando el siguiente comando en el directorio donde este el fichero:

~~~
sergioib@debian-sergio:~/Escritorio/Informatica/Github/docker-bookmedik/Tarea4/deploy$ docker-compose up -d
Creating servidor_mysql_drupal ... done
Creating drupal                ... done

sergioib@debian-sergio:~$ docker ps
CONTAINER ID        IMAGE                         COMMAND                  CREATED             STATUS              PORTS                     NAMES
205d30bcee2f        mariadb                       "docker-entrypoint.s…"   10 minutes ago      Up About a minute   3306/tcp                  servidor_mysql_drupal
b18afffe8d15        sergioib94/drupal:v1          "/usr/sbin/apache2ct…"   7 months ago        Up About a minute   0.0.0.0:8083->80/tcp      drupal
                    0.0.0.0:8083->80/tc
~~~

Una vez desplegado, comenzaremos con la instalación y comprobaremos que funciona correctamente, para ello en nuestro navegador accedemos al puerto indicado anteriormente, es decir a localhost:8083.

Comenzamos con la instalación y comprobamos que podemos usar drupal:

![Elección de idioma](/images/Intro-Docker/idioma.png)

![Comenzamos la instalación](/images/Intro-Docker/instalacion.png)

![Drupal](/images/Intro-Docker/drupal.png)

### **Instalación de Docker en Windows** ###

Aunque el proyecto de docker inicialmente era para uso de sistemas Linux, actualmente tambien es posible usarlo en sistemas operativos de windows siempre que nuestro windows cumpla con algunos requisitos:

* Windows 10 versión Professional o Enterprise.
* Virtualización activada en nuestro equipo.
* Windows actualizado.

La instalación de docker al igual que la mayoria de instalaciones en windows es bastante simple, lo descargamos [aqui](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe). En mi caso la version de docker que tengo es la 4.1.0.

Una vez descargado, ejecutamos el fichero .exe y comenzara el proceso de instalación.

![instalación docker](/images/Intro-Docker/docker1.png)

Cuando la instalación finalice, debera reiniciarse el equipo para que docker pueda poder usarse (en algunos casos se iniciará y abrirá sin necesidad de reinicio).

A la hora de empezar a usar docker por primera vez, es posible que nos salga un error parecido al siguiente:

![error wls2](/images/Intro-Docker/docker-error.png)

Este error se debe a que docker detecta que nuestra versión de WLS (Windows Subsystem for Linux) es antigua por lo que deberemos instalar la version actual que seria la versión 2 que es la que ahoramismo esta sustituyendo tanto el uso de Hyper-v y VirtualBox en el uso de docker.

Para reparar este error podemos hacer dos cosas, o bien actualizar a WSL2 o utilizar Hyper-V en lugar de WLS2 (Esta última opción en mi caso no ha funcionado con mi version de docker la 4.1.0):

* Actualizando WLS2:

Empezamos descargandonos la actualización [aqui](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi) (link valido para equipos x64).

Una vez descargado WLS2, ejecutamos el instalador y acabar la instalacion reiniciamos docker.

![instalación docker](/images/Intro-Docker/docker3.png)

Probamos a crear un par de contenedores a traves de la cmd:

![creación de contenedores](/images/Intro-Docker/docker4.png)

Podemos ver que en windows podemos trabajar tanto por linea de comandos como por entorno gráfico.

![docker desktop](/images/Intro-Docker/docker5.png)

* Usando Hyper-V:

Vamos a la configuración de windows:

~~~
Inicio > Configuración > Aplicaciones > Características Opcionales
~~~

Marcamos "Hyper-V" y damos click en "Aceptar" para reiniciar Windows.

![instalación Hyper-V](/images/Intro-Docker/docker2.png)

Después de reiniciar vamos a la configuración de docker, desmarcamos la opción de "Use the WSL 2 Based engine" y damos click en "Save & Restart".