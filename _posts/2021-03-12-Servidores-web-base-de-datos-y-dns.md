---
title: "Servidores Web, base de Datos y DNS en Openstack"
date: 2021-03-12T14:18:01+01:00
categories: [Servicios]
excerpt: "Haciendo uso de nuestro escenario openstack creado en practicas anteriores instalaremos y configuraremos distintos servidores en los nodos del escenario (Servidor DNS, Servidor Web y Servidor BBDD)."
---

### **Introducción** ###

Haciendo uso de nuestro escenario openstack creado en practicas anteriores instalaremos y configuraremos los siguientes servidores en los distintos nodos del escenario:

**Servidor DNS**

Vamos a instalar un servidor dns en freston que nos permita gestionar la resolución directa e inversa de nuestros nombres. Tendremos un servidor dns con autoridad sobre un subdominio de nuestro dominio principal gonzalonazareno.org, que se llamará tu_nombre.gonzalonazareno.org. A partir de este momento no será necesario la resolución estática en los servidores.

Tendremos que determinar la regla DNAT en dulcinea para que podamos hacer consultas DNS desde el exterior.

Configuraremos de forma adecuada todas las máquinas para que usen como servidor DNS a freston.

Comprobaremos que los servidores tienen configurados el nuevo nombre de dominio de forma adecuada después de volver a reiniciar el servidor (o tomar una nueva configuración DHCP). Para que el servidor tenga el FQDN debemos tener configurado de forma correcta el parámetro domain y el parámetro search en el fichero /etc/resolv.conf, además debemos evitar que este fichero se sobreescriba con los datos que manda el servidor DHCP de OpenStack.

El servidor DNS se va a configurar en un principio de la siguiente manera:

* El servidor DNS se llama freston.tu_nombre.gonzalonazareno.org y va a ser el servidor con autoridad para la zona tu_nombre.gonzalonazareno.org.

* El servidor debe resolver el nombre de todas las máquinas.
* El servidor debe resolver los distintos servicios (virtualhosh, servidor de base de datos, servido ldap, ...).

Debemos determinar cómo vas a nombrar a dulcinea, para que seamos capaz de resolver la ip flotante y la ip fija. Para ello vamos a usar vistas en bind9.

Debemos considerar la posibilidad de hacer tres zonas de resolución inversa: para las redes 10.0.0.0/24, 10.0.1.0/24 y 10.0.2.0/24. (No vamos a crear la zona inversa para la red externa de ip flotantres). para resolver ip fijas y flotantes del cloud.

Realizaremos las siguientes consultas desde un cliente interno a nuestra red y otro externo:

* El servidor DNS con autoridad sobre la zona del dominio tu_nombre.gonzalonazareno.org
* La dirección IP de dulcinea.
* Una resolución de www.
* Un resolución inversa de IP fija en cada una de las redes. (Esta consulta sólo funcionará desde una máquina interna).

**Servidor Web**

En quijote (CentOs)(Servidor que está en la DMZ) vamos a instalar un servidor web apache. Configuraremos el servidor para que sea capaz de ejecutar código php (para ello vamos a usar un servidor de aplicaciones php-fpm). Como prueba de funcionamiento accederemos a www.tunombre.gonzalonazareno.org/info.php donde se vea la salida del fichero info.php. 

**Servidor de base de datos**

En sancho (Ubuntu) vamos a instalar un servidor de base de datos mariadb (bd.tu_nombre.gonzalonazareno.org). Haremos una prueba de funcionamiento donde se vea como se realiza una conexión a la base de datos desde quijote

### **Configuración bind con vistas** ###

En la maquina de Freston empezamos instalando el servidor dns:

~~~
sudo apt install bind9
~~~

Una vez instalado bind9, lo primero sera configurar las vistas en /etc/bind/named.conf.local:

~~~
acl interna { 10.0.1.0/24; };
acl DMZ { 10.0.2.0/24; };
acl externa { 172.22.0.0/15; };

view interna {
    match-clients { interna; };
    allow-recursion { any; };   

        zone "gonzalonazareno.org"
        {
                type master;
                file "db.interna.gonzalonazareno.org";
        };
        zone "1.0.10.in-addr.arpa"
        {
                type master;
                file "db.1.0.10";
        };
	  zone "2.0.10.in-addr.arpa"
        {
                type master;
                file "db.2.0.10";
        };
        include "/etc/bind/zones.rfc1918";
        include "/etc/bind/named.conf.default-zones";
};

view DMZ {
    match-clients { DMZ; };
    allow-recursion { any; };   

        zone "gonzalonazareno.org"
        {
                type master;
                file "db.dmz.gonzalonazareno.org";
        };
        zone "1.0.10.in-addr.arpa"
        {
                type master;
                file "db.1.0.10";
        };
	  zone "2.0.10.in-addr.arpa"
        {
                type master;
                file "db.2.0.10";
        };
        include "/etc/bind/zones.rfc1918";
        include "/etc/bind/named.conf.default-zones";
};

view externa {
    match-clients { externa; 192.168.202.2; };
    allow-recursion { any; };   

        zone "gonzalonazareno.org"
        {
                type master;
                file "db.externa.gonzalonazareno.org";
        };
        include "/etc/bind/zones.rfc1918";
        include "/etc/bind/named.conf.default-zones";
};
~~~

Una vez configuradas las vistas, empezamos a configurar las distintas zonas en /var/cache/bind/:

db.externa.gonzalonazareno.org:

~~~
$TTL    604800
$TTL    604800
@       IN      SOA     dulcinea.sergio.gonzalonazareno.org. root.iesgn.org. (
                              5         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      dulcinea.sergio.gonzalonazareno.org.

$ORIGIN sergio.gonzalonazareno.org.

dulcinea	IN	A	172.22.200.151
www	IN	CNAME	dulcinea

~~~

db.interna.gonzalonazareno.org:

~~~
$TTL    604800
@       IN      SOA     freston.sergio.gonzalonazareno.org. root.iesgn.org. (
                              5         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      freston.sergio.gonzalonazareno.org.

$ORIGIN sergio.gonzalonazareno.org.

dulcinea	IN	A	10.0.1.5
sancho	IN	A	10.0.1.8
freston	IN	A	10.0.1.3
quijote	IN	A	10.0.2.5
www	IN	CNAME	quijote
bd	IN	CNAME	sancho

~~~

db.1.0.10:

~~~
$TTL    604800
@       IN      SOA     freston.sergio.gonzalonazareno.org. root.iesgn.org. (
                              5         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@	IN	NS	freston.sergio.gonzalonazareno.org.

$ORIGIN 1.0.10.in-addr.arpa.

3	IN	PTR	freston
8	IN	PTR	sancho
5	IN	PTR	dulcinea
~~~

db.2.0.10:

~~~
$TTL    604800
@       IN      SOA     freston.sergio.gonzalonazareno.org. root.iesgn.org. (
                              5         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@	IN	NS	freston.sergio.gonzalonazareno.org.

$ORIGIN 2.0.10.in-addr.arpa.

3	IN	PTR	dulcinea
5	IN	PTR	quijote
~~~

db.dmz.gonzalonazareno.org:

~~~
$TTL    604800
@       IN      SOA     freston.sergio.gonzalonazareno.org. root.iesgn.org. (
                              5         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      freston.sergio.gonzalonazareno.org.

$ORIGIN sergio.gonzalonazareno.org.

dulcinea	IN	A	10.0.2.3
sancho	IN	A	10.0.1.8
freston	IN	A	10.0.1.3
quijote	IN	A	10.0.2.5
www	IN	CNAME	quijote
bd	IN	CNAME	sancho
~~~

A parte de las zonas, también deberán de configurarse los siguientes ficheros:

/etc/bind/named.conf:

~~~
include "/etc/bind/named.conf.options";
include "/etc/bind/named.conf.local";
//include "/etc/bind/named.conf.default-zones";
~~~

Una vez configurado el servidor DNS configuraremos la regla DNAT en dulcinea para redirigir trafico DNS a freston.

~~~
iptables -A OUTPUT -o eth1 -p udp --dport 53 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT -i eth1 -p udp --sport 53 -m state --state ESTABLISHED -j ACCEPT
~~~

Hacemos una prueba de funcionamiento usando bind con clientes en distintas redes.

Prueba de funcionamiento desde la red 10.0.1.0/24:

~~~
debian@dulcinea:~$ dig www.sergio.gonzalonazareno.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> www.sergio.gonzalonazareno.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 44719
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 48901442818c6672534fe2f55fd90b0d24f7b1320c4d3afa (good)
;; QUESTION SECTION:
;www.sergio.gonzalonazareno.org.	IN	A

;; ANSWER SECTION:
www.sergio.gonzalonazareno.org.	604800 IN CNAME	quijote.sergio.gonzalonazareno.org.
quijote.sergio.gonzalonazareno.org. 604800 IN A	10.0.2.5

;; AUTHORITY SECTION:
gonzalonazareno.org.	604800	IN	NS	freston.sergio.gonzalonazareno.org.

;; ADDITIONAL SECTION:
freston.sergio.gonzalonazareno.org. 604800 IN A	10.0.1.3

;; Query time: 1 msec
;; SERVER: 10.0.1.3#53(10.0.1.3)
;; WHEN: Tue Dec 15 20:14:21 CET 2020
;; MSG SIZE  rcvd: 163
~~~

Prueba de funcionamiento desde la red 10.0.2.0/24:

~~~
[centos@quijote ~]$ dig bd.gonzalonazareno.org

; <<>> DiG 9.11.20-RedHat-9.11.20-5.el8 <<>> bd.gonzalonazareno.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 44056
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 922ab462f44820362e9611fe5fd90b54944a9f3228cb888f (good)
;; QUESTION SECTION:
;bd.gonzalonazareno.org.		IN	A

;; AUTHORITY SECTION:
gonzalonazareno.org.	604800	IN	SOA	freston.sergio.gonzalonazareno.org. root.iesgn.org. 5 604800 86400 2419200 604800

;; Query time: 2 msec
;; SERVER: 10.0.1.3#53(10.0.1.3)
;; WHEN: Tue Dec 15 20:15:32 CET 2020
;; MSG SIZE  rcvd: 141
~~~

Una vez hecho lo anterior nos aseguraremos que /etc/resolv.conf tiene domain, search, nameserver bien configurado, después del reinicio. Hostname -f

Freston:

~~~
debian@freston:~$ hostname -f
freston.sergio.gonzalonazareno.org
~~~

fichero /etc/resolv.conf:

~~~
nameserver 10.0.1.3
nameserver 192.168.202.2
search freston.sergio.gonzalonazareno.org
domain freston.sergio.gonzalonazareno.org
~~~

Dulcinea:

~~~
debian@dulcinea:~$ hostname -f
dulcinea.sergio.gonzalonazareno.org
~~~

fichero /etc/resolv.conf:

~~~
nameserver 10.0.1.3
nameserver 192.168.202.2
search dulcinea.sergio.gonzalonazareno.org
domain dulcinea.sergio.gonzalonazareno.org
~~~

Sancho:

~~~
ubuntu@sancho:~$ hostname -f
sancho.sergio.gonzalonazareno.org
~~~

fichero /etc/resolv.conf:

~~~
nameserver 10.0.1.3
nameserver 192.168.202.2
search sancho.sergio.gonzalonazareno.org
domain sancho.sergio.gonzalonazareno.org
~~~

Quijote:

~~~
[centos@quijote ~]$ hostname -f
quijote.sergio.gonzalonazareno.org
~~~

fichero /etc/resolv.conf:

~~~
nameserver 10.0.1.3
nameserver 192.168.202.2
search quijote.sergio.gonzalonazareno.org
domain quijote.sergio.gonzalonazareno.org
~~~

Para que estos cambios permanezcan después de un reinicio, sera necesario desactivar cloud-init:

* Para desactivar cloud-init en las máquinas debian, tendremos que configurar el fichero /etc/cloud/cloud.cfg modificando la linea manage_etc_hosts cambiando su valor a false.

* Para hacerlo en la máquina ubuntu, creamos el siguiente fichero /etc/cloud/cloud-init.disabled.

* Para hacerlo en la máquina centos, al igual que en ubuntu, creamos el siguiente fichero /etc/cloud/cloud-init.disabled, pero en este caso con el siguiente contenido cloud-init=disabled, indicando de esta forma que en momento del arranque, el valor de cloud-init sea disabled.

Delegamos la zona: es decir subdominio e ip flotante.

Nombre de subdominio: sergio.gonzalonazareno.org

ip flotante: 172.22.200.151

### **Instalamos apache2 en quijote (CentOs)(SELinux)** ###

~~~
sudo dnf install httpd
~~~

Instalamos tambien php-fpm y configuramos php-fpm

~~~
sudo dnf install php-fpm
~~~

Para comprobar que php-fpm a sido bien instalado y esta funcionando, creamos un fichero info.php en /var/www/html con el siguiente contenido:

~~~
<?php
        phpinfo();
~~~

De forma que si accedemos a quijote a través del navegador obtengamos algo como esto:

![info.php](/assets/images/servidor-web-bbdd-y-dns/info.php.png)

Añadimos la regla dnat en dulcinea para acceder al puerto 80,443 a quijote.

~~~
sudo iptables -A OUTPUT -o eth2 -p tcp -m multiport --dports 80,443 -m state --state NEW,ESTABLISHED -j ACCEPT

sudo iptables -A INPUT -i eth2 -p tcp -m multiport --sports 80,443 -m state --state ESTABLISHED -j ACCEPT
~~~

### **Instalamos mariadb en sancho** ###

Instalación:

~~~
sudo apt install mariadb-server
~~~

Ademas de instalar mariadb-server, para hacer el servidor de datos mas seguro se hará una instalación segura ejecutando mysql_secure_installation:

~~~
ubuntu@sancho:~$ sudo mysql_secure_installation

NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!

In order to log into MariaDB to secure it, we'll need the current
password for the root user.  If you've just installed MariaDB, and
you haven't set the root password yet, the password will be blank,
so you should just press enter here.

Enter current password for root (enter for none): 
OK, successfully used password, moving on...

Setting the root password ensures that nobody can log into the MariaDB
root user without the proper authorisation.

You already have a root password set, so you can safely answer 'n'.

Change the root password? [Y/n] y
New password: 
Re-enter new password: 
Password updated successfully!
Reloading privilege tables..
 ... Success!


By default, a MariaDB installation has an anonymous user, allowing anyone
to log into MariaDB without having to have a user account created for
them.  This is intended only for testing, and to make the installation
go a bit smoother.  You should remove them before moving into a
production environment.

Remove anonymous users? [Y/n] y
 ... Success!

Normally, root should only be allowed to connect from 'localhost'.  This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? [Y/n] n
 ... skipping.

By default, MariaDB comes with a database named 'test' that anyone can
access.  This is also intended only for testing, and should be removed
before moving into a production environment.

Remove test database and access to it? [Y/n] n
 ... skipping.

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? [Y/n] n
 ... skipping.

Cleaning up...

All done!  If you've completed all of the above steps, your MariaDB
installation should now be secure.

Thanks for using MariaDB!
~~~

Configuraremos la base de datos para tener acceso desde quijote.

Modificamos el fichero /etc/mysql/mariadb.conf.d/50-server.cnf cambiando la linea bind-address de 127.0.0.1 a 0.0.0.0 o bien a 10.0.2.5 que sera nuestra ip de quijote.

Creamos un usuario y configuramos los permisos necesarios para que el usuario pueda acceder de forma remota 

GRANT ALL PRIVILEGES ON *.* TO 'centos'@'quijote.sergio.gonzalonazareno.org' IDENTIFIED BY 'quijote-01' WITH GRANT OPTION;

Comprobamos el acceso usando la base de datos de pruebas de mysql:

~~~
[centos@quijote ~]$ mysql --host=sancho --protocol=tcp --port=3306 mysql -p
Enter password: 
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 37
Server version: 5.5.5-10.3.25-MariaDB-0ubuntu0.20.04.1 Ubuntu 20.04

Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
~~~

Podemos acceder sin problemas a la base de datos de pruebas de sancho.