---
title: "Sistemas de ficheros Btrfs"
date: 2021-03-12T17:50:31+01:00
categories: [Sistemas]
excerpt: "Btrfs es un sistema de archivos copy-on-write anunciado por Oracle Corporation para GNU/Linux.

Su objetivo es sustituir al actual sistema de archivos ext4, eliminando el mayor número de sus limitaciones, en especial con el tamaño máximo de los ficheros; además de la adopción de nuevas tecnologías no soportadas por ext3. Se afirma también que se "centrará en la tolerancia a fallos, reparación y fácil administración."
---

### **Introducción** ###

Btrfs es un sistema de archivos copy-on-write anunciado por Oracle Corporation para GNU/Linux.

Su objetivo es sustituir al actual sistema de archivos ext4, eliminando el mayor número de sus limitaciones, en especial con el tamaño máximo de los ficheros; además de la adopción de nuevas tecnologías no soportadas por ext3. Se afirma también que se "centrará en la tolerancia a fallos, reparación y fácil administración".

En este post crearemos un escenario vagrant con una maquina que incluya varios discos y a traves de varias pruebas comprobaremos el funcionamiento y rendimiento de btrfs.

### **Escenario** ###

El escenario con el que contamos para esta practica es el de una maquina virtual con sistema operativo debían 10 creada con vagrant con 4 discos adicionales en el que se instalara un Raid5 usando los 3 primeros discos, y el ultimo disco se dejara para posteriormente comprobar sustituciones de discos simulando fallos.

~~~
vagrant@Btrfs:~$ lsblk -f
NAME   FSTYPE LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINT
sda                                                                     
├─sda1 ext4         983742b1-65a8-49d1-a148-a3865ea09e24   16.1G     7% /
├─sda2                                                                  
└─sda5 swap         04559374-06db-46f1-aa31-e7a4e6ec3286                [SWAP]
sdb                                                                     
sdc                                                                     
sdd                                                                     
sde                 
~~~ 

* Instalamos Btrfs.

~~~
sudo apt install btrfs-tools
~~~

### **Pruebas con Btrfs** ###

* Gestión de un solo disco btrfs:

Creamos un sistema de ficheros btrfs sobre un solo disco (también se puede hacer sobre una partición):

~~~
mffs.btrfs /dev/sdb
~~~

~~~
vagrant@Btrfs:~$ sudo mkfs.btrfs /dev/sdb
btrfs-progs v4.20.1 
See http://btrfs.wiki.kernel.org for more information.

Label:              (null)
UUID:               5bf5fcf2-e41a-44f7-891e-afd10e40b898
Node size:          16384
Sector size:        4096
Filesystem size:    1.00GiB
Block group profiles:
  Data:             single            8.00MiB
  Metadata:         DUP              51.19MiB
  System:           DUP               8.00MiB
SSD detected:       no
Incompat features:  extref, skinny-metadata
Number of devices:  1
Devices:
   ID        SIZE  PATH
    1     1.00GiB  /dev/sdb
~~~

Comprobación:

~~~
vagrant@Btrfs:~$ lsblk -f
NAME   FSTYPE LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINT
sda                                                                     
├─sda1 ext4         983742b1-65a8-49d1-a148-a3865ea09e24   16.1G     7% /
├─sda2                                                                  
└─sda5 swap         04559374-06db-46f1-aa31-e7a4e6ec3286                [SWAP]
sdb    btrfs        0113a314-9022-4668-886d-3f4fc4f7700d                
sdc                                                                     
sdd                                                                     
sde                                                                    
~~~ 

* Gestión de múltiples discos (pool de almacenamiento)

~~~
mkfs.btrfs /dev/sdb /dev/sdc
~~~

~~~
vagrant@Btrfs:~$ sudo mkfs.btrfs -f /dev/sdb /dev/sdc
btrfs-progs v4.20.1 
See http://btrfs.wiki.kernel.org for more information.

Label:              (null)
UUID:               717e0d5d-3322-4f91-a528-d1540d9fc52d
Node size:          16384
Sector size:        4096
Filesystem size:    3.00GiB
Block group profiles:
  Data:             RAID0           307.12MiB
  Metadata:         RAID1           153.56MiB
  System:           RAID1             8.00MiB
SSD detected:       no
Incompat features:  extref, skinny-metadata
Number of devices:  2
Devices:
   ID        SIZE  PATH
    1     1.00GiB  /dev/sdb
    2     2.00GiB  /dev/sdc
~~~

Comprobación:

~~~
vagrant@Btrfs:~$ lsblk -f
NAME   FSTYPE LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINT
sda                                                                     
├─sda1 ext4         983742b1-65a8-49d1-a148-a3865ea09e24   16.1G     7% /
├─sda2                                                                  
└─sda5 swap         04559374-06db-46f1-aa31-e7a4e6ec3286                [SWAP]
sdb    btrfs        717e0d5d-3322-4f91-a528-d1540d9fc52d                
sdc    btrfs        717e0d5d-3322-4f91-a528-d1540d9fc52d                
sdd                                                                     
sde                                                                     

vagrant@Btrfs:~$ sudo mount /dev/sdb /mnt/
vagrant@Btrfs:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            227M     0  227M   0% /dev
tmpfs            49M  976K   48M   2% /run
/dev/sda1        19G  1.4G   17G   8% /
tmpfs           242M     0  242M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           242M     0  242M   0% /sys/fs/cgroup
tmpfs            49M     0   49M   0% /run/user/1000
/dev/sdb        3.0G   17M  1.7G   1% /mnt
~~~

Cuando gestionamos varios discos, las capacidades de estos se agregan formando un pool de almacenamiento, es decir que si contamos con un disco de 2 GB y uno de 4 GB, obtendremos un pool de 6 GB.

* Configuramos los discos en RAID, haciendo pruebas de fallo de algún disco y haciendo sustitución y restauración del RAID comparando las ventajas e inconvenientes respecto al uso de RAID software con mdadm.

Una de las ventajas que tiene el uso de un raid con btrfs respecto a mdadm, es que btrfs gestiona el uso de almacenamiento lo que permite que no se desperdicie espacio en disco, al contrario que con mdadm que en el caso de tener distintos discos con distintas capacidades, limita la capacidad de almacenaje a la del disco mas pequeño, es decir si tenemos un disco de 1GB y dos de 2GB con mdadm solo seremos capaces de almacenar un máximo de 1GB por lo que en los otros discos estamos desaprovechando espacio.

Btrfs por otro lado gestiona los discos de forma que la información que se almacena se va repartiendo entre los distintos discos por lo que permite utilizar la máxima capacidad de cada disco que tengamos.

Btrfs soporta actualmente raid 0, raid 1, raid 10, raid 5, raid 6 y single, sin embargo, raid 5 y 6 al ser los mas recientes contienen algunos bugs que impiden el correscto funcionamiento de alguna de sus funciones. 

Creación de raid5 con btrfs:

~~~
vagrant@Btrfs:~$ sudo mkfs.btrfs -d raid5 -m raid5 -f /dev/sdb /dev/sdc /dev/sdd
btrfs-progs v4.20.1 
See http://btrfs.wiki.kernel.org for more information.

Label:              (null)
UUID:               0ad6fabb-6a4b-4f2b-ba33-54086764dba1
Node size:          16384
Sector size:        4096
Filesystem size:    7.00GiB
Block group profiles:
  Data:             RAID5           477.75MiB
  Metadata:         RAID5           477.75MiB
  System:           RAID5            16.00MiB
SSD detected:       no
Incompat features:  extref, raid56, skinny-metadata
Number of devices:  3
Devices:
   ID        SIZE  PATH
    1     1.00GiB  /dev/sdb
    2     2.00GiB  /dev/sdc
    3     4.00GiB  /dev/sdd
~~~

~~~
vagrant@Btrfs:~$ sudo btrfs filesystem show
Label: none  uuid: 0ad6fabb-6a4b-4f2b-ba33-54086764dba1
	Total devices 3 FS bytes used 128.00KiB
	devid    1 size 1.00GiB used 485.75MiB path /dev/sdb
	devid    2 size 2.00GiB used 485.75MiB path /dev/sdc
	devid    3 size 4.00GiB used 485.75MiB path /dev/sdd
~~~

Montamos uno de los discos del raid y comprobamos su capacidad actual:

~~~
vagrant@Btrfs:~$ sudo mount /dev/sdb /mnt/
vagrant@Btrfs:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            227M     0  227M   0% /dev
tmpfs            49M  1.6M   47M   4% /run
/dev/sda1        19G  1.4G   17G   8% /
tmpfs           242M     0  242M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           242M     0  242M   0% /sys/fs/cgroup
tmpfs            49M     0   49M   0% /run/user/1000
/dev/sdb        7.0G   17M  6.1G   1% /mnt
~~~

Haciendo uso de las opciones -d y -m lo que conseguimos es indicar que tanto los datos como los metadatos, se almacenen de forma redundante en varios discos de forma que el raid sea tolerante a fallos.

En este caso practico, comprobamos que el disco de nuestro raid montado, tiene como capacidad máxima de almacenamiento, la suma del almacenamiento de los discos usados, es decir 7GB, aunque solo estan libres 6,1 dado que los 900M restantes pasan a convertirse en grupos de bloques para datos y metadatos, 477MB en los dos primeros discos.

Para comprobar el estado de los discos, btrfs raid cuenta con la función scrub (función no habilitada en sistemas ubuntu):

iniciar scrub → btrfs scrub start ‘punto de montaje’
ver estado → btrfs scrub status ‘punto de montaje’
desactivar scrub → btrfs scrub cancel ‘punto de montaje’

Ejemplo:

~~~
vagrant@Btrfs:~$ sudo btrfs scrub start /dev/sdb
scrub started on /dev/sdb, fsid 0ad6fabb-6a4b-4f2b-ba33-54086764dba1 (pid=1223)

vagrant@Btrfs:~$ sudo btrfs scrub status /dev/sdb
scrub status for 0ad6fabb-6a4b-4f2b-ba33-54086764dba1
	scrub started at Sat Jan 16 11:02:40 2021 and finished after 00:00:00
	total bytes scrubbed: 0.00B with 0 errors
~~~

Como vemos, nuestro disco recién montado no cuenta con errores.

En caso de que algun disco falle, se podrá intentar recuperar ejecutando el siguiente comando, para ello el disco debe estar montado:

~~~
mount -o recovery /dev/sdb /mnt/
~~~

En caso de ser necesario sustituir alguno de los discos se hará ejecutando los siguientes pasos:

1- Agregar disco nuevo (para ello el sistema de ficheros debe estar montado)

~~~
vagrant@Btrfs:~$ sudo btrfs device add /dev/sde /mnt/
vagrant@Btrfs:~$ lsblk -f
NAME   FSTYPE LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINT
sda                                                                     
├─sda1 ext4         983742b1-65a8-49d1-a148-a3865ea09e24   16.1G     7% /
├─sda2                                                                  
└─sda5 swap         04559374-06db-46f1-aa31-e7a4e6ec3286                [SWAP]
sdb    btrfs        0ad6fabb-6a4b-4f2b-ba33-54086764dba1    6.6G     0% /mnt
sdc    btrfs        0ad6fabb-6a4b-4f2b-ba33-54086764dba1                
sdd    btrfs        fcb1c3b8-5929-49a7-9439-e69b8ad306be                
sde                                                                     

vagrant@Btrfs:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            227M     0  227M   0% /dev
tmpfs            49M  1.6M   47M   4% /run
/dev/sda1        19G  1.4G   17G   8% /
tmpfs           242M     0  242M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           242M     0  242M   0% /sys/fs/cgroup
tmpfs            49M     0   49M   0% /run/user/1000
/dev/sdb        8.0G   17M  6.6G   1% /mnt
~~~
	
2- Comprobar el uso del disco a sustituir, en este caso vamos a sustituir como ejemplo el disco /dev/sdd:	
	 
~~~
	vagrant@Btrfs:~$ sudo btrfs filesystem show
	Label: none  uuid: 0ad6fabb-6a4b-4f2b-ba33-54086764dba1
	Total devices 4 FS bytes used 256.00KiB
	devid    1 size 1.00GiB used 637.75MiB path /dev/sdb
	devid    2 size 2.00GiB used 637.75MiB path /dev/sdc
	devid    3 size 4.00GiB used 637.75MiB path /dev/sdd
	devid    4 size 1.00GiB used 0.00B path /dev/sde
~~~

Comprobamos de esta forma que el disco sde se agrego correctamente.

3- Eliminar disco:

~~~
vagrant@Btrfs:~$ sudo btrfs device delete /dev/sdd /mnt/
vagrant@Btrfs:~$ sudo btrfs filesystem show
Label: none  uuid: 0ad6fabb-6a4b-4f2b-ba33-54086764dba1
	Total devices 3 FS bytes used 320.00KiB
	devid    1 size 1.00GiB used 368.00MiB path /dev/sdb
	devid    2 size 2.00GiB used 368.00MiB path /dev/sdc
	devid    4 size 1.00GiB used 368.00MiB path /dev/sde

vagrant@Btrfs:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            227M     0  227M   0% /dev
tmpfs            49M  1.6M   47M   4% /run
/dev/sda1        19G  1.4G   17G   8% /
tmpfs           242M     0  242M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           242M     0  242M   0% /sys/fs/cgroup
tmpfs            49M     0   49M   0% /run/user/1000
/dev/sdb        4.0G   17M  3.4G   1% /mnt
~~~

4- Balanceo de datos → Para cuando agregamos un disco nuevo y queremos distribuir la información existente entre todos los discos.

~~~
vagrant@Btrfs:~$ sudo btrfs balance start --full-balance /mnt/
Done, had to relocate 3 out of 3 chunks
vagrant@Btrfs:~$ sudo btrfs filesystem show
Label: none  uuid: 0ad6fabb-6a4b-4f2b-ba33-54086764dba1
	Total devices 3 FS bytes used 256.00KiB
	devid    1 size 1.00GiB used 368.00MiB path /dev/sdb
	devid    2 size 2.00GiB used 368.00MiB path /dev/sdc
	devid    4 size 1.00GiB used 368.00MiB path /dev/sde
~~~

Como podemos comprobar, el disco sde ya no tiene 0B, sino 368MB.

### **Funcionamiento de las principales funcionalidades btrfs** ###

* Compresión al vuelo:

Con la compresión activa o al vuelo, los bloques se comprimen antes de escribirse y se descomprimen de manera automática en las lecturas, de este modo las aplicaciones simplemente se dedican a escribir/leer en el sistema de archivos pero se ahorra espacio en disco. La desventaja que tiene esta funcionalidad es que ahorramos espacio, pero sin embargo aumentamos el uso de CPU.

~~~
vagrant@Btrfs:~$ sudo mount -o compress=zlib /dev/sde /mnt/

vagrant@Btrfs:~$ sudo dd if=/dev/zero of=/mnt/fichero_pruebas
dd: writing to '/mnt/fichero_pruebas': No space left on device
3534154+0 records in
3534153+0 records out
1809486336 bytes (1.8 GB, 1.7 GiB) copied, 11.3729 s, 159 MB/s
~~~

Podemos comprobar que al comprimir podemos almacenar mas datos de lo normal, excediendo la capacidad del disco que en este caso es de 1 GB.

~~~
vagrant@Btrfs:~$ ls -lh /mnt/
total 1.7G
-rw-r--r-- 1 root root 1.7G Jan 16 11:36 fichero_pruebas
vagrant@Btrfs:~$ sudo btrfs filesystem show /mnt/
Label: none  uuid: 0ad6fabb-6a4b-4f2b-ba33-54086764dba1
	Total devices 3 FS bytes used 1.69GiB
	devid    1 size 1.00GiB used 1023.00MiB path /dev/sdb
	devid    2 size 2.00GiB used 1023.00MiB path /dev/sdc
	devid    4 size 1.00GiB used 1023.00MiB path /dev/sde
~~~

* CoW (copy on write):

Nos permite tener varios ficheros iguales pero solo ocupando el espacio de uno, esto se produce porque al ser ficheros exactamente iguales las copias del original están referenciadas al original, pero si se produce un cambio, la copia ocupa el tamaño del original más el cambio.

Para utilizar esto con el comando cp debemos indicarle el parámetro –reflink=always.

~~~
vagrant@Btrfs:/mnt$ sudo cp --reflink=always fichero_pruebas copia_fichero_prueba
vagrant@Btrfs:/mnt$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            227M     0  227M   0% /dev
tmpfs            49M  1.6M   47M   4% /run
/dev/sda1        19G  1.4G   17G   8% /
tmpfs           242M     0  242M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           242M     0  242M   0% /sys/fs/cgroup
tmpfs            49M     0   49M   0% /run/user/1000
/dev/sdb        4.0G  1.8G  1.1G  64% /mnt
~~~

* Snapshots de subvolumenes:

Para usar las snapshots, previamente hemos tenido que crear subvolumenes, en este caso como ejemplo, se han creado 4:

~~~
vagrant@Btrfs:~$ sudo btrfs subvolume create /mnt/subv1
Create subvolume '/mnt/subv1'
vagrant@Btrfs:~$ sudo btrfs subvolume create /mnt/subv2
Create subvolume '/mnt/subv2'
vagrant@Btrfs:~$ sudo btrfs subvolume create /mnt/subv3
Create subvolume '/mnt/subv3'
vagrant@Btrfs:~$ sudo btrfs subvolume create /mnt/subv4
Create subvolume '/mnt/subv4'
~~~

Listamos los volúmenes creados:

~~~
vagrant@Btrfs:~$ sudo btrfs subvolume list /mnt/
ID 266 gen 68 top level 5 path subv1
ID 267 gen 69 top level 5 path subv2
ID 268 gen 70 top level 5 path subv3
ID 269 gen 71 top level 5 path subv4
~~~

Para trabajar con estos subvolumenes, necesitaremos conocer su ID, para ello ejecutamos el siguiente comando:

~~~
vagrant@Btrfs:~$ sudo btrfs subvolume show /mnt/subv1
subv1
	Name: 			subv1
	UUID: 			c7a28a90-eb88-054b-bb41-0276b7791311
	Parent UUID: 		-
	Received UUID: 		-
	Creation time: 		2021-01-16 12:06:54 +0000
	Subvolume ID: 		266
	Generation: 		68
	Gen at creation: 	68
	Parent ID: 		5
	Top level ID: 		5
	Flags: 			-
	Snapshot(s):
~~~

De esta forma vemos algunos datos del subvolumen creado como la ID, fecha de creación o incluso si ese subvolumen cuenta con laguna snapshot.

Montamos el subvolumen creado, en este caso por ejemplo el subvolumen1:

~~~
vagrant@Btrfs:~$ sudo mount -o subvolid=266 /dev/sdb /home/
vagrant@Btrfs:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
udev            227M     0  227M   0% /dev
tmpfs            49M  1.6M   47M   4% /run
/dev/sda1        19G  1.4G   17G   8% /
tmpfs           242M     0  242M   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           242M     0  242M   0% /sys/fs/cgroup
tmpfs            49M     0   49M   0% /run/user/1000
/dev/sdb        4.0G  1.8G  1.1G  64% /mnt
/dev/sdb        4.0G  1.8G  1.1G  64% /home
~~~

Creamos varios ficheros dentro del subvolumen1 y creamos una snapshot:

~~~
vagrant@Btrfs:~$ sudo btrfs subvolume snapshot /mnt/subv1/ /mnt/snapshot_subv1
Create a snapshot of '/mnt/subv1/' in '/mnt/snapshot_subv1'
vagrant@Btrfs:/mnt/subv1$ ls -l /mnt/
total 3534160
-rw-r--r-- 1 root root 1809486336 Jan 16 11:47 copia_fichero_prueba
-rw-r--r-- 1 root root 1809486336 Jan 16 11:36 fichero_pruebas
drwxr-xr-x 1 root root         10 Jan 16 13:18 snapshot_subv1
drwxr-xr-x 1 root root       1582 Jan 16 13:17 subv1
drwxr-xr-x 1 root root          0 Jan 16 12:06 subv2
drwxr-xr-x 1 root root          0 Jan 16 12:06 subv3
drwxr-xr-x 1 root root          0 Jan 16 12:07 subv4
~~~

* Cifrado (no incorporado actualmente).

* Checksum:

Cada bloque, de datos o metadatos, está protegido mediante una suma de verificación CRC32C (en el futuro está planeado añadir otros algoritmos). En cada lectura se comprueba la integridad del bloque y si se detecta un error automáticamente se busca una copia alternativa. Este mecanismo protege la corrupción de bloques particulares.

* Fragmentación:

Uno de los problemas con los que cuenta btrfs es la fragmentacion, por ello es necesario desfragmentar, esto lo hacemos ejecutando el siguiente comando:

~~~
vagrant@Btrfs:~$ sudo btrfs filesystem defrag /mnt/subv1/
~~~

* Redimensionar discos:

Btrfs permite redimensionar los discos en caliente, de forma que podemos tanto aumentar como reducir el tamaño de un disco:

~~~
vagrant@Btrfs:~$ sudo btrfs filesystem show /mnt/
Label: none  uuid: 203319dd-9732-49e7-920f-f8019bc30d4a
	Total devices 3 FS bytes used 256.00KiB
	devid    1 size 1.00GiB used 485.75MiB path /dev/sdb
	devid    2 size 2.00GiB used 485.75MiB path /dev/sdc
	devid    3 size 4.00GiB used 485.75MiB path /dev/sdd
~~~

	* Reducir:

~~~
vagrant@Btrfs:~$ sudo btrfs filesystem resize -500m /mnt/
Resize '/mnt/' of '-500m'
vagrant@Btrfs:~$ sudo btrfs filesystem show /mnt/
Label: none  uuid: 203319dd-9732-49e7-920f-f8019bc30d4a
	Total devices 3 FS bytes used 256.00KiB
	devid    1 size 524.00MiB used 485.75MiB path /dev/sdb
	devid    2 size 2.00GiB used 485.75MiB path /dev/sdc
	devid    3 size 4.00GiB used 485.75MiB path /dev/sdd
~~~

	* Aumentar:

~~~
vagrant@Btrfs:~$ sudo btrfs filesystem resize +350m /mnt/
Resize '/mnt/' of '+350m'
vagrant@Btrfs:~$ sudo btrfs filesystem show /mnt/
Label: none  uuid: 203319dd-9732-49e7-920f-f8019bc30d4a
	Total devices 3 FS bytes used 256.00KiB
	devid    1 size 874.00MiB used 485.75MiB path /dev/sdb
	devid    2 size 2.00GiB used 485.75MiB path /dev/sdc
	devid    3 size 4.00GiB used 485.75MiB path /dev/sdd
~~~