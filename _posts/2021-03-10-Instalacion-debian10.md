---
title: "Instalacion de Debian10"
date: 2021-03-10T21:20:45+01:00
categories: [Sistemas]
---

## **Instacacion Debian 10** ##

### **Introducción** ###

En un portátil (HP pavilion 15) con 1TB de disco se crearan particiones LVM donde se instalara un sistema debían 10. En el caso de mi disco ya tiene dos particiones en disco dedicadas a Windows 10 y otros, por lo que como Windows no es compatible con LVM, esas dos particiones no se van a tocar y la partición para Linux ocupara 500GB.

### **Ventajas de instalar el sistema en particiones lvm** ###

* Permite un almacenamiento mas flexible de archivos que haciendo particiones normales, ya que si a lo largo del tiempo se acaba el espacio de la partición puede redimensionarse e incluso añadir discos adicionales para aumentar el tamaño.

* LVM también nos permitirá hacer snapshots, que nos permitirán crear una copia exacta del volumen lógico deseado por si en el futuro fallase poder recuperarlo sin problemas.

### **Instalación** ###

Al iniciar la instalación lo primero es seleccionar el idioma, la ubicación y el idioma del teclado, en mi caso español y España. Después configuramos tanto el nombre como la contraseña para el superusuario (root) y para nuestro usuario. Luego configuramos el reloj y seleccionamos un particionado manual del disco. Hasta aquí todo es como una instalación normal de Debian.
Ahora bien, para crear una partición con volúmenes lógicos para instalar el sistema, se empieza seleccionando el disco a particionar (sda) y en el espacio libre que hay en el disco crear una partición nueva que se utilizara como volumen físico lvm.

Una vez que tengamos el volumen físico, en este caso de 500 GB, volveremos al menú de particionamiento de disco y seleccionaremos la opción de configurar el gestor de volúmenes lógicos (LVM) para así crear el grupo de volúmenes dentro del volumen físico creado anteriormente.

Dentro del grupo de volúmenes creado se crearan los volúmenes lógicos para el sistema Debian 10. En este caso he creado un volumen lógico de 50 GB con formato ext4 para /, puse la partición de ese tamaño puesto que en instalaciones anteriores / nunca llego a ocupar mas de 20 GB por lo que decidí ponerle mas del doble de espacio por si acaso. 

A parte también cree un volumen lógico para /home con un tamaño de unos 200 GB y con formato ext4 también puesto que mi sistema anterior el home no llego a superar los 100 GB. Al tener mi portátil 8GB de RAM, no ha sido necesaria partición de swap por lo que el resto de la partición lo dejare como espacio libre para futuras redimensiones en caso de andar falto de espacio. De forma que ejecutando lsblk, el equipo queda de la siguiente forma:

~~~
sergioib@debian:~$ lsblk 
NAME MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
sda 8:0 0 931,5G 0 disk 
├─sda1 8:1 0 450M 0 part 
├─sda2 8:2 0 100M 0 part /boot/efi
├─sda3 8:3 0 16M 0 part 
├─sda4 8:4 0 248,5G 0 part 
├─sda5 8:5 0 1011M 0 part 
├─sda6 8:6 0 500G 0 part 
│ ├─Linux-root 253:0 0 46,6G 0 lvm /
│ └─Linux-home 253:1 0 186,3G 0 lvm /home
└─sda9 8:9 0 181,5G 0 part
~~~

### **Problemas encontrados al instalar** ###

* Al acabar la instalación el portátil no detecta la señal wifi. En mi caso ya tenia guardados los controladores necesarios para la tarjeta de red de instalaciones anteriores, por lo que solo tuve que ejecutar un dpkg -i firmware-realtek_20190114-2_all.deb donde estaban los controladores para que pudiese funcionar.

En caso de no contar con los controladores, lo primero seria comprobar que modelo de tarjeta de red tengo ejecutando lspci y una vez que se compruebe la tarjeta que se tiene, ir a la pagina oficial de Debian y buscar un paquete que contenga el modelo que tengamos.

~~~
sergioib@debian:~$ lspci
00:00.0 Host bridge: Intel Corporation Xeon E3-1200 v6/7th Gen Core Processor Host Bridge/DRAM Registers (rev 08)
00:02.0 VGA compatible controller: Intel Corporation UHD Graphics 620 (rev 07)
00:04.0 Signal processing controller: Intel Corporation Skylake Processor Thermal Subsystem (rev 08)
00:14.0 USB controller: Intel Corporation Sunrise Point-LP USB 3.0 xHCI Controller (rev 21)
00:14.2 Signal processing controller: Intel Corporation Sunrise Point-LP Thermal subsystem (rev 21)
00:16.0 Communication controller: Intel Corporation Sunrise Point-LP CSME HECI #1 (rev 21)
00:17.0 RAID bus controller: Intel Corporation 82801 Mobile SATA Controller [RAID mode] (rev 21)
00:1c.0 PCI bridge: Intel Corporation Sunrise Point-LP PCI Express Root Port (rev f1)
00:1c.4 PCI bridge: Intel Corporation Sunrise Point-LP PCI Express Root Port #5 (rev f1)
00:1c.5 PCI bridge: Intel Corporation Sunrise Point-LP PCI Express Root Port #6 (rev f1)
00:1c.7 PCI bridge: Intel Corporation Sunrise Point-LP PCI Express Root Port #8 (rev f1)
00:1f.0 ISA bridge: Intel Corporation Sunrise Point LPC Controller/eSPI Controller (rev 21)
00:1f.2 Memory controller: Intel Corporation Sunrise Point-LP PMC (rev 21)
00:1f.3 Audio device: Intel Corporation Sunrise Point-LP HD Audio (rev 21)
00:1f.4 SMBus: Intel Corporation Sunrise Point-LP SMBus (rev 21)
01:00.0 VGA compatible controller: NVIDIA Corporation GP107M [GeForce GTX 1050 Mobile] (rev a1)
01:00.1 Audio device: NVIDIA Corporation GP107GL High Definition Audio Controller (rev a1)
02:00.0 Network controller: Realtek Semiconductor Co., Ltd. RTL8822BE 802.11a/b/g/n/ac WiFi adapter
03:00.0 Ethernet controller: Realtek Semiconductor Co., Ltd. RTL8111/8168/8411 PCI Express Gigabit Ethernet Controller (rev 15)
04:00.0 Unassigned class [ff00]: Realtek Semiconductor Co., Ltd. RTS522A PCI Express Card Reader (rev 01)
~~~

Mi controlador network vemos en este caso que es el RTL8822BE.

* Otro de los problemas a sido que Debian no detecta la tarjeta gráfica (problema corregido en versiones superiores de debian 10), en mi caso Nvidia GTX 1050. Para solucionar este problema lo primero es saber cual es el controlador necesario para que la gráfica funcione, esto se puede saber ejecutando el comando nvidia-detect. Este comando lo que hará sera indicar cual es el controlador que necesitara nuestro sistema, en este caso Nvidia-driver.

~~~
sergioib@debian:~$ nvidia-detect
Detected NVIDIA GPUs:
01:00.0 VGA compatible controller [0300]: NVIDIA Corporation GP107M [GeForce GTX 1050 Mobile] [10de:1c8d] (rev a1)

Checking card: NVIDIA Corporation GP107M [GeForce GTX 1050 Mobile] (rev a1)
Your card is supported by the default drivers and legacy driver series 390.
It is recommended to install the
nvidia-driver
package.
~~~

Ejecutamos un apt install nvidia driver y una vez hecho esto Debian ya sera capaz de detectar la gráfica. Pero aun detectando la gráfica se sigue teniendo un problema y es que el configurador de la gráfica envidia no funciona, esto se debe a que el kernel de Debian en la versión 4.19 no ofrece soporte a este tipo de gráfica por lo que para que funcionase, se tendría que actualizar el kernel de a una versión superior a la 5. En este caso como el kernel 5 no es estable he preferido dejar el equipo tal y como esta ahora, pero en caso de seguir adelante habría que seguir los siguientes pasos:

Primero comprobar que versión del kernel esta disponible y estable para nuestro sistema.

~~~
sergioib@debian:~$ apt search linux-image
Ordenando... Hecho
Buscar en todo el texto... Hecho
linux-headers-4.19.0-10-amd64/stable 4.19.132-1 amd64
Header files for Linux 4.19.0-10-amd64

linux-headers-4.19.0-10-cloud-amd64/stable 4.19.132-1 amd64
Header files for Linux 4.19.0-10-cloud-amd64

linux-headers-4.19.0-10-rt-amd64/stable 4.19.132-1 amd64
Header files for Linux 4.19.0-10-rt-amd64

linux-headers-4.19.0-11-amd64/stable,now 4.19.146-1 amd64 [instalado, automático]
Header files for Linux 4.19.0-11-amd64

linux-headers-4.19.0-11-cloud-amd64/stable 4.19.146-1 amd64
Header files for Linux 4.19.0-11-cloud-amd64

linux-headers-4.19.0-11-rt-amd64/stable 4.19.146-1 amd64
Header files for Linux 4.19.0-11-rt-amd64

linux-headers-4.19.0-6-amd64/stable 4.19.67-2+deb10u2 amd64
Header files for Linux 4.19.0-6-amd64

linux-headers-4.19.0-6-cloud-amd64/stable 4.19.67-2+deb10u2 amd64
Header files for Linux 4.19.0-6-cloud-amd64

linux-headers-4.19.0-6-rt-amd64/stable 4.19.67-2+deb10u2 amd64
Header files for Linux 4.19.0-6-rt-amd64

linux-headers-4.19.0-8-amd64/stable 4.19.98-1+deb10u1 amd64
Header files for Linux 4.19.0-8-amd64

linux-headers-4.19.0-8-cloud-amd64/stable 4.19.98-1+deb10u1 amd64
Header files for Linux 4.19.0-8-cloud-amd64

linux-headers-4.19.0-8-rt-amd64/stable 4.19.98-1+deb10u1 amd64
Header files for Linux 4.19.0-8-rt-amd64

linux-headers-4.19.0-9-amd64/stable 4.19.118-2+deb10u1 amd64
Header files for Linux 4.19.0-9-amd64

linux-headers-4.19.0-9-cloud-amd64/stable 4.19.118-2+deb10u1 amd64
Header files for Linux 4.19.0-9-cloud-amd64

linux-headers-4.19.0-9-rt-amd64/stable 4.19.118-2+deb10u1 amd64
Header files for Linux 4.19.0-9-rt-amd64

linux-image-4.19.0-10-amd64/stable 4.19.132-1 amd64
Linux 4.19 for 64-bit PCs (signed)

linux-image-4.19.0-10-amd64-dbg/stable 4.19.132-1 amd64
Debug symbols for linux-image-4.19.0-10-amd64

linux-image-4.19.0-10-amd64-unsigned/stable 4.19.132-1 amd64
Linux 4.19 for 64-bit PCs

linux-image-4.19.0-10-cloud-amd64/stable 4.19.132-1 amd64
Linux 4.19 for x86-64 cloud (signed)

linux-image-4.19.0-10-cloud-amd64-dbg/stable 4.19.132-1 amd64
Debug symbols for linux-image-4.19.0-10-cloud-amd64

linux-image-4.19.0-10-cloud-amd64-unsigned/stable 4.19.132-1 amd64
Linux 4.19 for x86-64 cloud

linux-image-4.19.0-10-rt-amd64/stable 4.19.132-1 amd64
Linux 4.19 for 64-bit PCs, PREEMPT_RT (signed)

linux-image-4.19.0-10-rt-amd64-dbg/stable 4.19.132-1 amd64
Debug symbols for linux-image-4.19.0-10-rt-amd64

linux-image-4.19.0-10-rt-amd64-unsigned/stable 4.19.132-1 amd64
Linux 4.19 for 64-bit PCs, PREEMPT_RT

linux-image-4.19.0-11-amd64/stable,now 4.19.146-1 amd64 [instalado, automático]
Linux 4.19 for 64-bit PCs (signed)

linux-image-4.19.0-11-amd64-dbg/stable 4.19.146-1 amd64
Debug symbols for linux-image-4.19.0-11-amd64

linux-image-4.19.0-11-amd64-unsigned/stable 4.19.146-1 amd64
Linux 4.19 for 64-bit PCs

linux-image-4.19.0-11-cloud-amd64/stable 4.19.146-1 amd64
Linux 4.19 for x86-64 cloud (signed)

linux-image-4.19.0-11-cloud-amd64-dbg/stable 4.19.146-1 amd64
Debug symbols for linux-image-4.19.0-11-cloud-amd64

linux-image-4.19.0-11-cloud-amd64-unsigned/stable 4.19.146-1 amd64
Linux 4.19 for x86-64 cloud

linux-image-4.19.0-11-rt-amd64/stable 4.19.146-1 amd64
Linux 4.19 for 64-bit PCs, PREEMPT_RT (signed)

linux-image-4.19.0-11-rt-amd64-dbg/stable 4.19.146-1 amd64
Debug symbols for linux-image-4.19.0-11-rt-amd64

linux-image-4.19.0-11-rt-amd64-unsigned/stable 4.19.146-1 amd64
Linux 4.19 for 64-bit PCs, PREEMPT_RT

linux-image-4.19.0-6-amd64/stable,now 4.19.67-2+deb10u2 amd64 [instalado, automático]
Linux 4.19 for 64-bit PCs (signed)

linux-image-4.19.0-6-amd64-dbg/stable 4.19.67-2+deb10u2 amd64
Debug symbols for linux-image-4.19.0-6-amd64

linux-image-4.19.0-6-amd64-unsigned/stable 4.19.67-2+deb10u2 amd64
Linux 4.19 for 64-bit PCs

linux-image-4.19.0-6-cloud-amd64/stable 4.19.67-2+deb10u2 amd64
Linux 4.19 for x86-64 cloud (signed)

linux-image-4.19.0-6-cloud-amd64-dbg/stable 4.19.67-2+deb10u2 amd64
Debug symbols for linux-image-4.19.0-6-cloud-amd64

linux-image-4.19.0-6-cloud-amd64-unsigned/stable 4.19.67-2+deb10u2 amd64
Linux 4.19 for x86-64 cloud

linux-image-4.19.0-6-rt-amd64/stable 4.19.67-2+deb10u2 amd64
Linux 4.19 for 64-bit PCs, PREEMPT_RT (signed)

linux-image-4.19.0-6-rt-amd64-dbg/stable 4.19.67-2+deb10u2 amd64
Debug symbols for linux-image-4.19.0-6-rt-amd64

linux-image-4.19.0-6-rt-amd64-unsigned/stable 4.19.67-2+deb10u2 amd64
Linux 4.19 for 64-bit PCs, PREEMPT_RT

linux-image-4.19.0-8-amd64/stable 4.19.98-1+deb10u1 amd64
Linux 4.19 for 64-bit PCs (signed)

linux-image-4.19.0-8-amd64-dbg/stable 4.19.98-1+deb10u1 amd64
Debug symbols for linux-image-4.19.0-8-amd64

linux-image-4.19.0-8-amd64-unsigned/stable 4.19.98-1+deb10u1 amd64
Linux 4.19 for 64-bit PCs

linux-image-4.19.0-8-cloud-amd64/stable 4.19.98-1+deb10u1 amd64
Linux 4.19 for x86-64 cloud (signed)

linux-image-4.19.0-8-cloud-amd64-dbg/stable 4.19.98-1+deb10u1 amd64
Debug symbols for linux-image-4.19.0-8-cloud-amd64

linux-image-4.19.0-8-cloud-amd64-unsigned/stable 4.19.98-1+deb10u1 amd64
Linux 4.19 for x86-64 cloud

linux-image-4.19.0-8-rt-amd64/stable 4.19.98-1+deb10u1 amd64
Linux 4.19 for 64-bit PCs, PREEMPT_RT (signed)

linux-image-4.19.0-8-rt-amd64-dbg/stable 4.19.98-1+deb10u1 amd64
Debug symbols for linux-image-4.19.0-8-rt-amd64

linux-image-4.19.0-8-rt-amd64-unsigned/stable 4.19.98-1+deb10u1 amd64
Linux 4.19 for 64-bit PCs, PREEMPT_RT

linux-image-4.19.0-9-amd64/stable 4.19.118-2+deb10u1 amd64
Linux 4.19 for 64-bit PCs (signed)

linux-image-4.19.0-9-amd64-dbg/stable 4.19.118-2+deb10u1 amd64
Debug symbols for linux-image-4.19.0-9-amd64

linux-image-4.19.0-9-amd64-unsigned/stable 4.19.118-2+deb10u1 amd64
Linux 4.19 for 64-bit PCs

linux-image-4.19.0-9-cloud-amd64/stable 4.19.118-2+deb10u1 amd64
Linux 4.19 for x86-64 cloud (signed)

linux-image-4.19.0-9-cloud-amd64-dbg/stable 4.19.118-2+deb10u1 amd64
Debug symbols for linux-image-4.19.0-9-cloud-amd64

linux-image-4.19.0-9-cloud-amd64-unsigned/stable 4.19.118-2+deb10u1 amd64
Linux 4.19 for x86-64 cloud

linux-image-4.19.0-9-rt-amd64/stable 4.19.118-2+deb10u1 amd64
Linux 4.19 for 64-bit PCs, PREEMPT_RT (signed)

linux-image-4.19.0-9-rt-amd64-dbg/stable 4.19.118-2+deb10u1 amd64
Debug symbols for linux-image-4.19.0-9-rt-amd64

linux-image-4.19.0-9-rt-amd64-unsigned/stable 4.19.118-2+deb10u1 amd64
Linux 4.19 for 64-bit PCs, PREEMPT_RT

linux-image-amd64/stable,now 4.19+105+deb10u6 amd64 [instalado]
Linux for 64-bit PCs (meta-package)

linux-image-amd64-dbg/stable 4.19+105+deb10u6 amd64
Debugging symbols for Linux amd64 configuration (meta-package)

linux-image-amd64-signed-template/stable 4.19.146-1 amd64
Template for signed linux-image packages for amd64

linux-image-cloud-amd64/stable 4.19+105+deb10u6 amd64
Linux for x86-64 cloud (meta-package)

linux-image-cloud-amd64-dbg/stable 4.19+105+deb10u6 amd64
Debugging symbols for Linux cloud-amd64 configuration (meta-package)

linux-image-rt-amd64/stable 4.19+105+deb10u6 amd64
Linux for 64-bit PCs (meta-package), PREEMPT_RT

linux-image-rt-amd64-dbg/stable 4.19+105+deb10u6 amd64
Debugging symbols for Linux rt-amd64 configuration (meta-package)
~~~

Una vez que sepamos las versiones con las que contamos, ejecutar un apt install de la que se desee tener. Despues comprobamos nuestra version del kernel con uname -a.

* Despues de que se haya comprobado que la versión del kernel a cambiado y que el configurador de nvidia ya nos permite configurar la gráfica ya podremos usarla, aunque por defecto nuestro sistema seguirá usando la grafica integrada (en mi caso una gráfica intel) en lugar de la gráfica dedicada (nvidia) por lo que para poder cambiar el uso de la gráfica. Actualmente en la version 10.8.0 de debian viene con un controlador envidia ya instalado, por lo que es posible que no haya problemas de gráfica.