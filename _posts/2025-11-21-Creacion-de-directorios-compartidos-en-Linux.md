---
title: "Creación de directorios compartidos en Linux"
date: 2025-11-21T11:27:00+02:00
categories: [Apuntes, Sistemas, Linux]
excerpt: "Aprende todo lo necesarios para poder compartir directorio haciendo uso de NFS y SAMBA"
card_image: /assets/images/cards/debian.png
---

Existen dos protocolos que hacen posible compartir directorios: NFS (en sistemas Linux) y Samba (entre Linux, indos y MacOs)

# Instalación y configuración de servidor NFS

## Instalación de servidor (Debian)

Primero verificamos primero si el paquete esta instalado ejecutando el siguiente comando:

~~~
sudo apt info nfs-kernel-server
~~~

Si esta ya instalado comprobaremos si el servidor esta activo, en caso de que no lo este, se instalara usando apt install nfs-kernel-server. Comprobamos si esta activo con el comando sudo systemctl status nfs-kernel-server. En caso de que este activo, seguimos adelante, si esta inactivo tendremos que activarlo.

~~~
sudo systemctl enable --now nfs-kernel-server
~~~

Crearemos un directorio sobre el que vamos a definir el directorio compartido:

~~~
sudo mkdir nfs_comp
~~~

Accedemos a /etc/exports y vamos a agregar la siguiente linea para definir los parámetros del compartimiento del directorio:

~~~
/nfs_comp    192.168.1.0/24(rw,sync,no_subtree_check)
~~~

Indicamos la red donde sera posible compartir el directorio y el nombre del directorio, rw permite escritura y lectura en este directorio, sync hace que el host sincronice los directorios y no subtree_check evita comprobaciones innecesarias.

Ademas de estas opciones usadas, podemos usar otras que también pueden sernos útiles:

* ro: solo lectura
* root_squash: evita que root actué como root en el servidor
* no_root_squash: Permite a root remoto tener privilegios (no es recomendable) 

Aplicamos los cambios.

~~~
sudo exportfs -ra
~~~

Podemos ver los recursos que estamos exportando con el comando exportfs -v.

## Configuración del Firewall (opcional)

Para UFW:

~~~
sudo ufw allow from 192.168.1.0/24 to any port nfs
~~~

Para firewalld (CentOS):

~~~
sudo firewall-cmd --permanent --add-service=nfs
sudo firewall-cmd --reload
~~~

# Instalación y configuración de un cliente NFS

Empezamos instalando el cliente NFS.

~~~
sudo apt install nfs-common -y
~~~

A continuación tendremos que crear el punto de montaje donde podremos acceder al directorio que comparte el servidor.

~~~
sudo mkdir -p /mnt/nfs_compartido
~~~

Este directorio se podrá montar de dos formas, de forma manual o permanente:

* Montaje manual: Es un montaje temporal que tú realizas con un comando, y solo existe hasta que reinicias la máquina o desmontas el recurso. Ej:

~~~
sudo mount 192.168.1.10:/srv/nfs/compartido /mnt/nfs_compartido
~~~

Esta opción es usada sobre todo para realizar pruebas

* Montaje permanente: Es un montaje que se configura para realizarse automáticamente en cada arranque del sistema, sin necesidad de que el usuario lo monte manualmente. Esto se consigue añadiendo una línea en /etc/fstab:

~~~
192.168.1.10:/srv/nfs/nfs_comp /mnt/nfs_compartido nfs defaults 0 0
~~~

Esta opción se usa mas en entornos de producción y carpetas en red usadas a diario.

## Instalación y configuración de un servidor SAMBA

Samba permite compartir archivos entre Linux ↔ Windows. Es imprescindible en entornos mixtos. Para realizar una instalación de samba en Linux ejecutaremos el siguiente comando.

~~~
sudo apt install samba -y
~~~

Al igual que con nfs comprobaremos si esta activo una vez instalado con systemctl status smbd, en caso de no estar activo, tendremos que activarlo con la opción enable.

Creamos el directorio a compartir

~~~
sudo mkdir /smb_comp
~~~

En el caso de samba la configuracion la realizaremos modificando el fichero /etc/samba/smb.conf aadiendo las siguientes lineas:

~~~
[smb_comp]
   path = /srv/samba/smb_comp
   browseable = yes
   read only = no
   writable = yes
   guest ok = yes #acceso sin contraseñas para pruebas
   create mask = 0777
   directory mask = 0777
~~~

Una vez instalado y configurado todo reiniciamos el servicio,

~~~
sudo systemctl restart smbd
~~~

Realizamos la prueba desde Linux

~~~
smbclient //192.168.1.10/smb_comp -N
~~~

O montamos

~~~
sudo mount -t cifs //192.168.1.10/smb_comp /mnt/smb -o guest
~~~

En el caso de windows podremos acceder al directorio ejecutamos win+R ejecutando \\192.168.1.10\smb_comp.

## SAMBA con usuarios (opción mas segura)

Esta configuración iría cara a entornos reales dado que la configuración anterior era muy poco segura y mas orientada a entornos de prueba.

Empezaremos creando un usuario a modo de prueba

~~~
sudo useradd -m sergio
sudo passwd sergio
~~~

La opción -m la usaremos para que al usuario se le cree el home, aunque esto no es obligatorio.

Este usuario recién creado lo añadimos a samba.

~~~
sudo smbpasswd -a sergio
sudo smbpasswd -e sergio
~~~

Configuramos el fichero smb.conf añadiendo las siguientes lineas:

~~~
[smb_comp]
   path = /srv/samba/smb_comp
   valid users = sergio
   read only = no
   browsable = yes
   create mask = 0660
   directory mask = 0770
~~~

Reiniciamos el servicio para que la configuración indicada empiece a funcionar.

~~~
sudo systemctl restart smbd
~~~

Esta vez a la hora de realizar el montaje en linux, al tener un usuario creado ejecutaremos el mismo comando pero indicando el usuario que tiene acceso

~~~
sudo mount -t cifs //192.168.1.10/smb_comp /mnt/smb -o username=sergio
~~~

El acceso a través de windows sera exactamente igual, a través de win+R y ejecutando \\192.168.1.10\smb_comp, la diferencia en este caso es que al ejecutar la linea anterior, se nos pedirá usuario y contraseña para poder acceder.