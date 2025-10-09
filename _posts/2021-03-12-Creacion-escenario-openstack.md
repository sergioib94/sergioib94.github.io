---
layout: single
title: "Creacion de escenario Openstack"
date: 2021-03-12T11:43:35+01:00
categories: [Cloud]
excerpt: "En este post se creara un escenario en openstack con varias maquinas virtuales donde a lo largo del curso se realizaran la mayoria de las practicas."
---

### **Introduccion** ###

En este post se creara un escenario en openstack con varias maquinas virtuales donde a lo largo del curso se realizaran la mayoria de las practicas.

## **Creacion del escenario** ##

* Tarea 1: Creación de la red interna:
        ◦ Nombre red interna de <sergio.ibañez>
        ◦ 10.0.1.0/24

* Tarea 2: Creación de las instancias:
        ◦ Dulcinea:
            ▪ Debian Buster sobre volumen con sabor m1.mini
            ▪ Accesible directamente a través de la red externa y con una IP flotante
            ▪ Conectada a la red interna, de la que será la puerta de enlace
        ◦ Sancho:
            ▪ Ubuntu 20.04 sobre volumen con sabor m1.mini
            ▪ Conectada a la red interna
            ▪ Accesible indirectamente a través de dulcinea
        ◦ Quijote:
            ▪ CentOS 7 sobre volumen con sabor m1.mini
            ▪ Conectada a la red interna
            ▪ Accesible indirectamente a través de dulcinea

Escenario una vez creadas las instancias:

![escenario openstack](/images/escenario-openstack/topologia.png)

Una vez creadas las instancias, solo faltaría hacer accesible de forma indirecta a las instancias de sancho y quijote a través de dulcinea. En este caso la red 10.0.0.0/24, tiene 2 maquinas de un trabajo creado anteriormente para otra asignatura.

* Tarea 3: Configuración de NAT en Dulcinea (Es necesario deshabilitar la seguridad en todos los puertos de dulcinea).
       
Deshabilitamos la seguridad:

~~~
       (openstackclient) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/openstackclient$ openstack port list
       +--------------------------------------+------+-------------------+-------------------------------------------------------------------------+--------+
       | ID                                   | Name | MAC Address       | Fixed IP Addresses                                                      | Status |
       +--------------------------------------+------+-------------------+-------------------------------------------------------------------------+--------+
       | 0d8be2be-d440-4038-93e3-1eefdf2be853 |      | fa:16:3e:13:42:a1 | ip_address='10.0.0.3', subnet_id='4f9841a0-12bc-48a4-a89c-1b5f4dd3fbf7' | ACTIVE |
       | 44dbc572-eb86-4f34-99a5-e23b81e83aff |      | fa:16:3e:80:c5:0c | ip_address='10.0.0.2', subnet_id='4f9841a0-12bc-48a4-a89c-1b5f4dd3fbf7' | ACTIVE |
       | 52dd0fee-42f4-4d85-ae81-cff268c7924e |      | fa:16:3e:dd:20:7b | ip_address='10.0.1.4', subnet_id='dd45ee2a-7d50-4da8-b421-8f8844b65c0d' | ACTIVE |
       | 5b9bf738-2b3b-4844-ad00-ceee38670008 |      | fa:16:3e:42:35:7c | ip_address='10.0.0.1', subnet_id='4f9841a0-12bc-48a4-a89c-1b5f4dd3fbf7' | ACTIVE |
       | 7fecf2dd-e6ba-4959-b0e8-823ae013421c |      | fa:16:3e:64:51:7f | ip_address='10.0.0.5', subnet_id='4f9841a0-12bc-48a4-a89c-1b5f4dd3fbf7' | ACTIVE |
       | a0f080fa-4b6e-40a1-9ef2-6ffb0195ba11 |      | fa:16:3e:a8:ba:5c | ip_address='10.0.1.3', subnet_id='dd45ee2a-7d50-4da8-b421-8f8844b65c0d' | ACTIVE |
       | abbc307e-b9f0-4ca1-ac2f-130eb8230906 |      | fa:16:3e:3b:d5:a6 | ip_address='10.0.0.8', subnet_id='4f9841a0-12bc-48a4-a89c-1b5f4dd3fbf7' | ACTIVE |
       | cb2e3a19-a2d3-43ce-83d6-9257d1967b93 |      | fa:16:3e:86:3d:2d | ip_address='10.0.1.2', subnet_id='dd45ee2a-7d50-4da8-b421-8f8844b65c0d' | ACTIVE |
       | db5ea957-1ea1-4b0e-b9d8-80b3be8cf4b6 |      | fa:16:3e:b6:b1:24 | ip_address='10.0.1.8', subnet_id='dd45ee2a-7d50-4da8-b421-8f8844b65c0d' | ACTIVE |
       +--------------------------------------+------+-------------------+-------------------------------------------------------------------------+--------+
~~~ 
       
En este caso Dulcinea cuenta con dos interfaces, la 10.0.1.4 (Red Interna) y la 10.0.0.3 (red externa) por lo que deshabilitamos el grupo de seguridad en ambas interfaces:

~~~
(openstackclient) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/openstackclient$ openstack port set --disable-port-security 0d8be2be-d440-4038-93e3-1eefdf2be853
(openstackclient) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/openstackclient$ openstack port set --disable-port-security 52dd0fee-42f4-4d85-ae81-cff268c7924e
~~~

Configuración de NAT (Dulcinea):

En dulcinea empezamos poniendo la nueva regla de iptables

~~~
iptables -t nat -A POSTROUTING -s 10.0.1.0/24 -o eth1 -j MASQUERADE
~~~

De esta forma se indicara la interfaz por la que se hará nat, que en este caso es la eth0 (interfaz interna). Una vez tengamos esto, tendremos que activar nat de la siguiente forma:

~~~
sed -i '/^#net.ipv4.ip\_forward/s/^#//g' /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.conf
~~~

* Tarea 4: Definición de contraseña en todas las instancias (para poder modificarla desde consola en caso necesario)
       
Dulcinea:

~~~
sudo passwd debian
~~~

sancho:

~~~
sudo passwd ubuntu
~~~

quijote:

~~~
sudo passwd centos
~~~

* Tarea 5: Modificación de las instancias sancho y quijote para que usen direccionamiento estático y dulcinea como puerta de enlace

Configuración de sancho (/etc/netplan/50-cloud-init.yaml):
~~~
       network:
           version: 2
           ethernets:
               ens3:
                   dhcp4: no
                   addresses:
                   - 10.0.1.8/24
                   macaddress: fa:16:3e:b6:b1:24
                   gateway4: 10.0.1.4
~~~
       
Una vez configurado reiniciamos el servicio ejecutando sudo netplan apply

Configuración de quijote:

~~~
BOOTPROTO=static
DEVICE=eth0
HWADDR=fa:16:3e:a8:ba:5c
ONBOOT=yes
IPADDR=10.0.1.3
NETMASK=255.255.255.0
GATEWAY=10.0.1.4
TYPE=Ethernet
USERCTL=no
~~~

Una vez configurado, reiniciamos el servicio ejecutando service network restart.

* Tarea 6: Modificación de la subred de la red interna, deshabilitando el servidor DHCP

Comprobamos con openstackclient las subnet que tenemos y cogemos la ID de la que subnet a la que le quitaremos el dhcp, en este caso la red-toboso.

~~~
(openstackclient) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/openstackclient$ openstack subnet list
+--------------------------------------+------------+--------------------------------------+-------------+
| ID                                   | Name       | Network                              | Subnet      |
+--------------------------------------+------------+--------------------------------------+-------------+
| 4f9841a0-12bc-48a4-a89c-1b5f4dd3fbf7 |            | 086ed7a1-2831-403b-9b0f-bc01be9184e2 | 10.0.0.0/24 |
| dd45ee2a-7d50-4da8-b421-8f8844b65c0d | red-toboso | 0212c291-3149-4cac-b5bd-04cbbe112008 | 10.0.1.0/24 |
+--------------------------------------+------------+--------------------------------------+-------------+
~~~

Una ve que se sepa la ID se ejecutara openstack subnet set --no-dhcp dd45ee2a-7d50-4da8-b421-8f8844b65c0d para dejar la subnet sin dhcp.

* Tarea 7: Utilización de ssh-agent para acceder a las instancias

~~~
sergioib@debian-sergio:~$ ssh-agent /bin/bash
sergioib@debian-sergio:~$ ssh-add .ssh/2asir.pem 
Identity added: .ssh/2asir.pem (.ssh/2asir.pem)
sergioib@debian-sergio:~$ ssh -i .ssh/2asir.pem debian@172.22.200.151
Linux dulcinea 4.19.0-11-cloud-amd64 #1 SMP Debian 4.19.146-1 (2020-09-17) x86_64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Sat Nov 14 19:54:18 2020 from 172.23.0.66
~~~
       
* Tarea 8. Creación del usuario profesor en todas las instancias. Usuario que puede utilizar sudo sin contraseña
 
Creamos los usuarios en las distintas instancias haciendo uso del comando useradd o adduser y una vez creados los usuario profesor, editamos el siguiente fichero para que a la hora de hacer sudo no solicite contraseña

Creamos los usuarios ejecutando:

~~~
sudo useradd -m -s /bin/bash profesor
~~~

En centos7 sera suficiente ejecutando sudo adduser profesor ya que por defecto se crea el /home/usuario de forma automática cogiendo los ficheros de /etc/skell.

~~~
nano /etc/sudoers
profesor ALL=(ALL) NOPASSWD: ALL
~~~