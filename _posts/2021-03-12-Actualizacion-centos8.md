---
layout: single
title: "Actualizacion de Centos7 a Centos8"
date: 2021-03-12T12:52:53+01:00
categories: [Sistemas]
excerpt: "Esta practica se realizara en una maquina virtual llamada Quijote en un escenario opestack creado en practicas anteriores que cuenta con un sistema operativo Centos 7 que se actualizara a Centos 8."
---

### **Introduccion** ###

Esta practica se realizara en una maquina virtual llamada Quijote en un escenario opestack creado en practicas anteriores que cuenta con un sistema operativo Centos 7 que se actualizara a Centos 8.

### **Actualizacion de Centos 7 a Centos 8 en la maquina quijote** ###

Antes de comenzar con la actualización comprobamos la versión de nuestra maquina centos:

~~~
[centos@quijote ~]$ cat /etc/centos-release
CentOS Linux release 7.9.2009 (Core)
~~~

En este caso comenzaremos con la version 7.9.2009 de centos.

Instalamos el repositorio epel en nuestro centos 7:

~~~
sudo yum install -y epel-release.noarch
~~~

Creamos una cache para el repositorio epel (opcional):

~~~
sudo yum makecache fast
~~~

Mediante este comando crearemos una cache de forma manual, haciendo que acciones como instalar o actualizar se hagan mucho mas rápido, pero sin embargo con la desventaja de poder almacenar un menor numero de repositorios.

Instalamos los paquetes requeridos en centos 7:

~~~
sudo yum install -y yum-utils rpmconf
~~~

Eliminación de paquetes duplicados/no usados:

~~~
sudo rpmconf -a
~~~

Listamos tanto los paquetes innecesarios como los paquetes huerfanos:

~~~
sudo package-cleanup --leaves
sudo package-cleanup --orphans
~~~

Eliminamos los paquetes resultado de los comandos anteriores, en mi caso los siguientes:

~~~
sudo yum remove -y \ 
	> libndp-1.2-9.el7.x86_64 \ 
	> libsysfs-2.1.0-16.el7.x86_64 \ 
	> kernel-3.10.0-1127.el7.x86_64
~~~

También podemos eliminar estos paquetes ejecutando simplemente yum remove package-cleanup --leaves y yum remove package-cleanup --orphans.

Actualizamos el administrador de paquetes pasando de yum a dnf (el que usa centos 8):

~~~
sudo yum install -y dnf
~~~

Eliminamos yum de nuestro sistema ya que al tener dnf ya no sera necesario:

~~~
sudo dnf remove -y yum yum-metadata-parser
~~~

Eliminamos cualquier configuración de yum existente:

~~~
sudo rm -Rf /etc/yum
~~~

Creamos una cache para repositorios dnf (opcional):

~~~
sudo dnf makecache
~~~

Actualizamos los paquetes para empezar con la actualización:

~~~
sudo dnf upgrade -y
~~~

Actualizamos centos-release:

~~~
sudo dnf upgrade -y http://mirror.centos.org/centos/8/BaseOS/x86_64/os/Packages/{centos-release-8.2-2.2004.0.2.el8.x86_64.rpm,centos-gpg-keys-8.2-2.2004.0.2.el8.noarch.rpm,centos-repos-8.2-2.2004.0.2.el8.x86_64.rpm}
~~~

Actualizamos el repositorio de EPEL 7 a 8:

~~~
sudo dnf upgrade -y epel-release
~~~

Creamos cache para todos los repositorios (opcional):

~~~
sudo dnf makecache
~~~

Eliminamos los núcleos instalados:

~~~
sudo rpm -e rpm -q kernel
~~~

Eliminamos los paquetes que pueden ocasionar conflictos (en este caso no salio ningún paquete):

~~~
sudo rpm -e --nodeps sysvinit-tools
~~~

Iniciamos la actualización del sistema operativo:

~~~
sudo dnf -y --releasever=8 --allowerasing --setopt=deltarpm=false distro-sync
~~~

En caso de algún error en algún paquete sera necesarios eliminarlo puesto que si se queda en el sistema posterior mente causara conflicto con los paquetes de centos 8. En este caso había problemas de conflicto con python36-rpmconf-1.0.22-1.el7.noarch por lo que se elimino haciendo uso de sudo dnf remove y se volvio a ejecutar sudo dnf -y --releasever=8 --allowerasing --setopt=deltarpm=false distro-sync.

Instalamos el nuevo kernel para centos 8:

~~~
sudo dnf install -y kernel-core
~~~

Si da problemas por no haber eliminado anteriormente los paquetes conflictivos ejecutaremos el siguiente comando para solucionarlo:

~~~
sudo dnf install -y --allowerasing kernel-core
~~~

Instalamos los grupos de paquete “core” y “minimal install”:

~~~
sudo dnf -y groupupdate "Core" "Minimal Install"
~~~

Reiniciamos el sistema para comprobar si la actualización a sido un éxito:

Comprobamos que realmente la maquina a sido actualizada a centos 8:

Comprobación del kernel

~~~
[centos@quijote ~]$ uname -r
4.18.0-193.28.1.el8_2.x86_64
~~~

Comprobación del sistema

~~~
[centos@quijote ~]$ cat /etc/centos-release
CentOS Linux release 8.2.2004 (Core) 
~~~