---
title: "Modificaciones del escenario Openstack"
date: 2021-03-12T14:06:50+01:00
categories: [Cloud]
---
### **Introducción** ###

En el siguiente post, haciendo uso del escenario openstack creado en una de las practicas anteriores haremos una serie de modificaciones en dicho escenario.

Modificaciones:

* Creación de la red DMZ:
    Nombre: DMZ de "nombre de usuario"
    10.0.2.0/24

* Creación de las instancias:
    freston:
        Debian Buster sobre volumen de 10GB con sabor m1.mini
        Conectada a la red interna
        Accesible indirectamente a través de dulcinea
        IP estática
* Modificación de la ubicación de quijote
    Pasa de la red interna a la DMZ y su direccionamiento tiene que modificarse apropiadamente

### **Modificaciones del escenario openstack** ###

* Creación de maquina Freston:

Esta maquina se creara igual que las anteriores, mediante un volumen con debian buster y se le agregara una interfaz en la red 10.0.1.0/24.

En un principio como en esta red esta deshabilitado el servidor dhcp, esta maquina no recibirá ip ninguna y por lo tanto no se podrá acceder a ella de ningún modo, por lo que lo primero que se hará sera habilitar el dhcp en esta red para que freston obtenga una ip y una vez que se realicen los cambios básicos tales como asignarle una ip dinámica y asignarle al usuario freston una contraseña por si fuese necesario entrar por consola, se volverá a deshabilitar el dhcp.
Deshabilitamos el servidor dhcp de nuevo y una vez que comprobamos que la maquina freston tiene ip, accedemos a ella de forma remota para comenzar con las configuraciones necesarias.

Empezamos configurando el nombre de la maquina añadiendo a /etc/host el nombre de freston y a /etc/hosts el nombre freston-sergio.gonzalonazareno.org ademas del nombre y dirección del resto de maquinas del escenario para que freston sea capaz de reconocerlos.

Creamos el usuario profesor asignándole una password mediante el comando useradd profesor -m -s/bin/bash. En el directorio /home de profesor creamos con mkdir la carpeta .ssh y se añaden las contraseñas de los profesores de modo que tengan acceso. 

En el fichero /etc/apt/sources.list añadimos los siguientes repositorios para permitir que el equipo permanezca actualizado:

~~~
deb https://ftp.cica.es/debian/ buster main
deb https://ftp.cica.es/debian/ buster-updates main
deb https://ftp.cica.es/debian-security/ buster/updates main
~~~

Ademas de estos cambios, se pondrá en hora el reloj configurando el servicio ntp y se desactivara cloud-init ya que de no desactivarlo, algunos de los cambios realizados anteriormente se borraran.

NTP

Eliminamos ntp:

~~~
apt purge ntp
~~~

modificamos /etc/systemd/timesyncd.conf con la siguiente linea, indicando de donde cogerá la configuración:

~~~
ntp
     es.pool.ntp.org
~~~

Reiniciamos el servicio

~~~
systemctl restart systemd-timesyncd.service
~~~

Ponemos la zona horaria

~~~
timedatectl set-timezone Europe/Madrid
~~~

Cloud-init

Modificamos el fichero /etc/cloud/cloud.cfg y cambiar la linea manage_etc_hosts poniéndolo a false.

* Modificaciones en Quijote

En la maquina quijote los cambios que hay que hacer básicamente son desactivarle la interfaz que tiene y añadirle una nueva conectada a la nueva red DMZ (10.0.2.0/24)
Al ser una nueva red, esta se creo con el dhcp activado ya que sino hubiésemos tenido el mismo problema que freston, por lo que al conectarnos a quijote lo primero sera modificar la configuración de red modificando tanto la ip, como la puerta de enlace y la mac de la interfaz nuevas.
Una vez modificada la configuración de red solo faltara agregar el hostname de freston al /etc/hosts de quijote y modificar su enrutamiento ya que su ruta por defecto esta en la red 10.0.1.0/24

* Modificaciones en Sancho

Sancho al ser una maquina que no ha sido afectada por las modificaciones del escenario, en ella el único cambio que hay que realizar es incluir la nueva maquina freston en su /etc/hosts.

* Modificaciones en Dulcinea

En dulcinea al igual que en sancho pocos cambios se deben realizar ya que solo agregaremos una nueva interfaz de red que conectara con la red nueva DMZ.

Se añadirá la nueva configuración de red para la interfaz eth2 y se modificara el enrutamiento de forma que tengamos algo así:

~~~
default via 10.0.0.1 dev eth0 
10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.12 
10.0.1.0/24 dev eth1 proto kernel scope link src 10.0.1.5 
10.0.2.0/24 dev eth2 proto kernel scope link src 10.0.2.3
~~~

Añadimos también la nueva regla de ip tables de forma que dulcinea haga de nat tanto en la red 1.0 como en la 2.0:

~~~
  123  8630 MASQUERADE  all  --  *      eth0    10.0.1.0/24          0.0.0.0/0           
    0     0 MASQUERADE  all  --  *      eth0    10.0.2.0/24          0.0.0.0/0
~~~

Una vez hecho todo, añadimos a freston al etc/hosts de dulcinea y ya estará todo listo. En esta practica por error quite la interfaz 10.0.1.0/24 de dulcinea, por lo que al volver a conectarla a la red cambio la ip de 10.0.1.4 a 10.0.1.5 por lo que en el resto de equipos cambie la ip de dulcinea en los etc/hosts y la ip de puerta de enlace en los enrutamientos de la red 10.0.1.0/24.