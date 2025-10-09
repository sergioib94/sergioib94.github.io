---
layout: single
title: "Instalacion y configuracion servidor DNS"
date: 2021-03-12T12:56:19+01:00
categories: [Servicios]
excerpt: "En post a traves de una serie de tareas, configuraremos e instalaremos dos servidores dns para comprobar y ver su funcionamiento, dnsmaq y bind9."
---

### **Introducción** ###

En post a traves de una serie de tareas, configuraremos e instalaremos dos servidores dns para comprobar y ver su funcionamiento, dnsmaq y bind9.

En nuestra red local tenemos un servidor Web que sirve dos páginas web: www.iesgn.org, departamentos.iesgn.org.

Instalaremos en nuestra red local un servidor DNS. El nombre del servidor será tunombre.iesgn.org.

### **Servidor DNSmasq** ###

* Instalamos el servidor dns dnsmasq en pandora.iesgn.org y configúralo para que los clientes puedan conocer los nombres necesarios.*

Instalación:

~~~
sudo apt install dnsmasq
~~~

Configuración de dnsmasq (/etc/dnsmasq.conf):

En este fichero lo que haremos sera primero descomentar la linea strict-order para que de esta forma en el caso de que nuestro dns no sea capaz de resolver una petición, lea el fichero resolv.conf y le pregunte a la maquina que tengamos indicada en el fichero para que ella resuelva la petición. Ademas de eso, agregamos tanto la linea interfaz para indicar por que interfaz se permite recibir peticiones  e incluimos las listen-address para indicar desde que ips se permiten peticiones, dejando el fichero de la siguiente forma:

~~~
strict-order
interfaces=eth0
listen-address=10.0.0.8
listen-address=127.0.0.1
~~~

Un vez configurado todo, en el /etc/resolv de nuestro servidor añadimos la ip de nuestro servidor dns.

~~~
nameserver 10.0.0.8
~~~

* Modificaremos los clientes para que utilicen el nuevo servidor dns. Realizaremos una consulta a www.iesgn.org, y a www.josedomingo.org. Realizaremos una prueba de funcionamiento para comprobar que el servidor dnsmasq funciona como cache dns. Muestra el fichero hosts del cliente para demostrar que no estás utilizando resolución estática. Realizaremos una consulta directa al servidor dnsmasq. ¿Se puede realizar resolución inversa?. Documenta la tarea en redmine.

Configuración del cliente indicando la ip del servidor - /etc/resolv.conf

~~~
nameserver 10.0.0.8
~~~

Configuración del cliente /etc/hosts:

~~~
# Your system has configured 'manage_etc_hosts' as True.
# As a result, if you wish for changes to this file to persist
# then you will need to either
# a.) make changes to the master file in /etc/cloud/templates/hosts.debian.tmpl
# b.) change or remove the value of 'manage_etc_hosts' in
#     /etc/cloud/cloud.cfg or cloud-config from user-data
#
10.0.0.8 sergio.iesgn.org sergio
127.0.1.1 cliente.novalocal cliente
127.0.0.1 localhost


# The following lines are desirable for IPv6 capable hosts
::1 ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
ff02::3 ip6-allhosts
~~~

Resolución a nombre de la red interna:

~~~
debian@cliente:~$ dig www.iesgn.org
; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> www.iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 60367
;; flags: qr aa rd ra ad; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.iesgn.org.			IN	A

;; ANSWER SECTION:
www.iesgn.org.		0	IN	A	10.0.0.8

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Thu Nov 26 18:18:42 UTC 2020
;; MSG SIZE  rcvd: 58
~~~

Resolución a nombre de la red externa:

~~~
debian@cliente:~$ dig www.josedomingo.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> www.josedomingo.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 502
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 5, ADDITIONAL: 6

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 6b611b0df8646083e7790d825fca28756b8edc04e838c352 (good)
;; QUESTION SECTION:
;www.josedomingo.org.		IN	A

;; ANSWER SECTION:
www.josedomingo.org.	900	IN	CNAME	playerone.josedomingo.org.
playerone.josedomingo.org. 900	IN	A	137.74.161.90

;; AUTHORITY SECTION:
josedomingo.org.	22283	IN	NS	ns3.cdmon.net.
josedomingo.org.	22283	IN	NS	ns4.cdmondns-01.org.
josedomingo.org.	22283	IN	NS	ns5.cdmondns-01.com.
josedomingo.org.	22283	IN	NS	ns1.cdmon.net.
josedomingo.org.	22283	IN	NS	ns2.cdmon.net.

;; ADDITIONAL SECTION:
ns1.cdmon.net.		4075	IN	A	35.189.106.232
ns2.cdmon.net.		4075	IN	A	35.195.57.29
ns3.cdmon.net.		4075	IN	A	35.157.47.125
ns4.cdmondns-01.org.	22283	IN	A	52.58.66.183
ns5.cdmondns-01.com.	4075	IN	A	52.59.146.62

;; Query time: 137 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Fri Dec 04 12:15:49 UTC 2020
;; MSG SIZE  rcvd: 322
~~~

Prueba de resolución inversa:

~~~
debian@cliente:~$ dig -x 137.74.161.90
; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> -x 137.74.161.90
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 50679
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: ef0e2a1cd067b8be3e9f48ad5fc0bef573ca377e3c628a89 (good)
;; QUESTION SECTION:
;90.161.74.137.in-addr.arpa.	IN	PTR

;; ANSWER SECTION:
90.161.74.137.in-addr.arpa. 472	IN	PTR	playerone.josedomingo.org.

;; AUTHORITY SECTION:
161.74.137.in-addr.arpa. 86865	IN	NS	ns16.ovh.net.
161.74.137.in-addr.arpa. 86865	IN	NS	dns16.ovh.net.

;; Query time: 2 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Fri Nov 27 08:55:17 UTC 2020
;; MSG SIZE  rcvd: 168
~~~

Aunque la resolución inversa no este configurada, dnsmasq es capaz de hacerla sin problemas.

Prueba de funcionamiento dnscache:

Para comprobar que dnsmasq funciona como cache dns, volvemos ha hacer una consulta hecha previamente y comprobamos que el tiempo de respuesta en mucho menor.

~~~
debian@cliente:~$ dig www.josedomingo.org
; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> www.josedomingo.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 16342
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;www.josedomingo.org.		IN	A

;; ANSWER SECTION:
www.josedomingo.org.	768	IN	CNAME	playerone.josedomingo.org.
playerone.josedomingo.org. 768	IN	A	137.74.161.90

;; Query time: 0 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Thu Nov 26 18:23:14 UTC 2020
;; MSG SIZE  rcvd: 103
~~~

Como se puede ver, la resolución de la petición a tardado 0 msec (nada), cuando antes tardo 137 msec, es decir, que funciona como cache dns.

### **Servidor DNS bind9** ###

* Desinstalamos el servidor dnsmasq del ejercicio anterior e instala un servidor dns bind9. Las características del servidor DNS que queremos instalar son las siguientes:

Instalación:

~~~
sudo apt install bind9
~~~

• El servidor DNS se llama pandora.iesgn.org y por supuesto, va a ser el servidor con autoridad para la zona iesgn.org.
• Vamos a suponer que tenemos un servidor para recibir los correos que se llame correo.iesgn.org y que está en la dirección x.x.x.200 (esto es ficticio).
• Vamos a suponer que tenemos un servidor ftp que se llame ftp.iesgn.org y que está en x.x.x.201 (esto es ficticio)
• Además queremos nombrar a los clientes.
• También hay que nombrar a los virtual hosts de apache: www.iesgn.org y departementos.iesgn.org 
• Se tienen que configurar la zona de resolución inversa.

* Realizamos la instalación y configuración del servidor bind9 con las características anteriormente señaladas. Entrega las zonas que has definido. Muestra al profesor su funcionamiento.

Empezamos la configuración de bind9 configurando las zonas, para ello modificamos el fichero /etc/bind/named.conf.local añadiendo tanto la información de la zona directa como de la zona inversa.

~~~
zone "iesgn.org" {
        type master;
        file "/var/cache/bind/db.sergio.iesgn.org";
        notify yes;
};

zone "0.0.10.in-addr.arpa" {
        type master;
        file "/var/cache/bind/db.10.0.0";
};
~~~

Una vez modificado este fichero, tendrán que crearse los ficheros especificados anteriormente (db.sergio.iesgn.org y db.10.0.0) en /var/cache/bind.

Configuración del fichero db.sergio.iesgn.org (zona directa):

~~~
$TTL    604800
@       IN      SOA     sergio.iesgn.org. root.iesgn.org. (
                              2         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      sergio.iesgn.org.
@       IN      MX      10      correo.iesgn.org.

$ORIGIN iesgn.org.

sergio  IN      A       10.0.0.8
Correo  IN      A       10.0.0.200
ftp     IN      A       10.0.0.201
Cliente IN      A       10.0.0.5
www     IN      CNAME   sergio
departamentos   IN      CNAME   sergio
~~~

Configuración del fichero db.10.0.0 (zona inversa):

~~~
$TTL    604800
@       IN      SOA     sergio.iesgn.org. root.iesgn.org. (
                              2         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      sergio.iesgn.org.

$ORIGIN 0.0.10.in-addr.arpa.

8  IN   PTR     sergio.iesgn.org
200     IN      PTR     correo.iesgn.org.
201     IN      PTR     ftp.iesgn.org
5       IN      PTR     cliente
~~~

* Realizamos las consultas dig/nslookup desde los clientes preguntando por los siguientes:

• Dirección de sergio.iesgn.org, www.iesgn.org, ftp.iesgn.org

sergio.iesgn.org:

~~~
debian@cliente:~$ dig sergio.iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> sergio.iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 23195
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 07c7ebbd1e78aed497b5dd115fc89fa93edeb69e2898b17f (good)
;; QUESTION SECTION:
;sergio.iesgn.org.		IN	A

;; ANSWER SECTION:
sergio.iesgn.org.	604800	IN	A	10.0.0.8

;; AUTHORITY SECTION:
iesgn.org.		604800	IN	NS	sergio.iesgn.org.

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Thu Dec 03 08:19:53 UTC 2020
;; MSG SIZE  rcvd: 103
~~~

www.iesgn.org:

~~~
debian@cliente:~$ dig www.iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> www.iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 42971
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: f8069af8059d08ea20bfd19d5fc89fb866928b1444d81737 (good)
;; QUESTION SECTION:
;www.iesgn.org.			IN	A

;; ANSWER SECTION:
www.iesgn.org.		604800	IN	CNAME	sergio.iesgn.org.
sergio.iesgn.org.	604800	IN	A	10.0.0.8

;; AUTHORITY SECTION:
iesgn.org.		604800	IN	NS	sergio.iesgn.org.

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Thu Dec 03 08:20:08 UTC 2020
;; MSG SIZE  rcvd: 121
~~~

ftp.iesgn.org:

~~~
debian@cliente:~$ dig ftp.iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> ftp.iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 22365
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 968a2aeb6f9f53a8750a446e5fc89fbf4a00bed504e7fedf (good)
;; QUESTION SECTION:
;ftp.iesgn.org.			IN	A

;; ANSWER SECTION:
ftp.iesgn.org.		604800	IN	A	10.0.0.201

;; AUTHORITY SECTION:
iesgn.org.		604800	IN	NS	sergio.iesgn.org.

;; ADDITIONAL SECTION:
sergio.iesgn.org.	604800	IN	A	10.0.0.8

;; Query time: 0 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Thu Dec 03 08:20:15 UTC 2020
;; MSG SIZE  rcvd: 123
~~~

• El servidor DNS con autoridad sobre la zona del dominio iesgn.org.

~~~
debian@cliente:~$ dig ns iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> ns iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 64390
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: af88604f689a141777cd57995fc89fdf2fd30ae8acbac7ca (good)
;; QUESTION SECTION:
;iesgn.org.			IN	NS

;; ANSWER SECTION:
iesgn.org.		604800	IN	NS	sergio.iesgn.org.

;; ADDITIONAL SECTION:
sergio.iesgn.org.	604800	IN	A	10.0.0.8

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Thu Dec 03 08:20:47 UTC 2020
;; MSG SIZE  rcvd: 103
~~~

• El servidor de correo configurado para iesgn.org

~~~
debian@cliente:~$ dig mx iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> mx iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 35476
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 3

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: fa6d2a1230306832ea8c52955fc89fecb97b33c4b6ee882c (good)
;; QUESTION SECTION:
;iesgn.org.			IN	MX

;; ANSWER SECTION:
iesgn.org.		604800	IN	MX	10 correo.iesgn.org.

;; AUTHORITY SECTION:
iesgn.org.		604800	IN	NS	sergio.iesgn.org.

;; ADDITIONAL SECTION:
Correo.iesgn.org.	604800	IN	A	10.0.0.200
sergio.iesgn.org.	604800	IN	A	10.0.0.8

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Thu Dec 03 08:21:00 UTC 2020
;; MSG SIZE  rcvd: 149
~~~

• La dirección IP de www.josedomingo.org

~~~
debian@cliente:~$ dig www.josedomingo.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> www.josedomingo.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 11171
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 5, ADDITIONAL: 6

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 3ee6b7084022db8666672c565fc8a0019224264dbd90ee3c (good)
;; QUESTION SECTION:
;www.josedomingo.org.		IN	A

;; ANSWER SECTION:
www.josedomingo.org.	900	IN	CNAME	playerone.josedomingo.org.
playerone.josedomingo.org. 900	IN	A	137.74.161.90

;; AUTHORITY SECTION:
josedomingo.org.	86399	IN	NS	ns5.cdmondns-01.com.
josedomingo.org.	86399	IN	NS	ns1.cdmon.net.
josedomingo.org.	86399	IN	NS	ns4.cdmondns-01.org.
josedomingo.org.	86399	IN	NS	ns2.cdmon.net.
josedomingo.org.	86399	IN	NS	ns3.cdmon.net.

;; ADDITIONAL SECTION:
ns1.cdmon.net.		172800	IN	A	35.189.106.232
ns2.cdmon.net.		172800	IN	A	35.195.57.29
ns3.cdmon.net.		172800	IN	A	35.157.47.125
ns4.cdmondns-01.org.	86399	IN	A	52.58.66.183
ns5.cdmondns-01.com.	172800	IN	A	52.59.146.62

;; Query time: 1799 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Thu Dec 03 08:21:21 UTC 2020
;; MSG SIZE  rcvd: 322
~~~

• Una resolución inversa

~~~
debian@cliente:~$ dig -x 10.0.0.200

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> -x 10.0.0.200
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 33916
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 3453bb16686f692dfcc6ca255fc8a061e575b42adcfc43b2 (good)
;; QUESTION SECTION:
;200.0.0.10.in-addr.arpa.	IN	PTR

;; ANSWER SECTION:
200.0.0.10.in-addr.arpa. 604800	IN	PTR	correo.iesgn.org.

;; AUTHORITY SECTION:
0.0.10.in-addr.arpa.	604800	IN	NS	sergio.iesgn.org.

;; ADDITIONAL SECTION:
sergio.iesgn.org.	604800	IN	A	10.0.0.8

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Thu Dec 03 08:22:57 UTC 2020
;; MSG SIZE  rcvd: 147
~~~

## **Servidor DNS esclavo** ##

El servidor DNS actual funciona como DNS maestro. Vamos a instalar un nuevo servidor DNS que va a estar configurado como DNS esclavo del anterior, donde se van a ir copiando periódicamente las zonas del DNS maestro. Suponemos que el nombre del servidor DNS esclavo se va llamar afrodita.iesgn.org.

* Realizamos la instalación del servidor DNS esclavo. Documenta los siguientes apartados:

• Entrega la configuración de las zonas del maestro y del esclavo.

Configuración del maestro zonas:

~~~
	zone "iesgn.org" {
        type master;
        file "/var/cache/bind/db.sergio.iesgn.org";
        allow-transfer {10.0.0.6;};
        notify yes;
};

zone "0.0.10.in-addr.arpa" {
        type master;
        file "/var/cache/bind/db.10.0.0";
        allow-transfer {10.0.0.6;};
};
~~~

Configuración de zona directa maestro:

~~~
$TTL    604800
@       IN      SOA     sergio.iesgn.org. root.iesgn.org. (
                              5         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      sergio.iesgn.org.
@       IN      NS      afrodita.iesgn.org.
@       IN      MX      10      correo.iesgn.org.

$ORIGIN iesgn.org.

sergio  IN      A       10.0.0.8
afrodita IN     A       10.0.0.6
Correo  IN      A       10.0.0.200
ftp     IN      A       10.0.0.201
Cliente IN      A       10.0.0.5
www     IN      CNAME   sergio
departamentos   IN      CNAME   sergio
~~~

Configuración de zona inversa maestro:

~~~
$TTL    604800
@       IN      SOA     sergio.iesgn.org. root.iesgn.org. (
                              5         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      sergio.iesgn.org.
@       IN      NS      afrodita.iesgn.org.

$ORIGIN 0.0.10.in-addr.arpa.

8  IN   PTR     sergio.iesgn.org
200     IN      PTR     correo.iesgn.org.
201     IN      PTR     ftp.iesgn.org.
5       IN      PTR     cliente
6       IN      PTR     afrodita
~~~

Configuración del esclavo:

~~~
	zone "iesgn.org" {
        type slave;
        file "/var/cache/bind/db.sergio.iesgn.org";
        masters {10.0.0.8;};
        notify yes;
};

zone "0.0.10.in-addr.arpa" {
        type slave;
        file "/var/cache/bind/db.10.0.0";
        masters {10.0.0.8;};
};
~~~

Con estas configuraciones lo que conseguimos es por parte del maestro indicar que se haga una transferencia de la configuración de las zonas al esclavo, y por parte del esclavo se indica la ip del servidor maestro.

• Compruebamos si las zonas definidas en el maestro tienen algún error con el comando adecuado.

zona directa:

~~~
debian@sergio:~$ sudo named-checkzone iesgn.org /var/cache/bind/db.sergio.iesgn.org 
zone iesgn.org/IN: loaded serial 4
OK
~~~

zona indirecta:

~~~
debian@sergio:~$ sudo named-checkzone 0.0.10.in-addr.arpa /var/cache/bind/db.10.0.0
zone 0.0.10.in-addr.arpa/IN: loaded serial 4
OK
~~~

• Compruebamos si la configuración de named.conf tiene algún error con el comando adecuado.

~~~
named-checkconf
~~~

No nos muestra ningún error.

• Reiniciamos los servidores y comprueba en los logs si hay algún error. No olvides incrementar el número de serie en el registro SOA si has modificado la zona en el maestro.

~~~
debian@sergio:~$ sudo rndc reload
server reload successful
debian@sergio:~$ tail /var/log/syslog
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:503:c27::2:30#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:200::b#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:9f::42#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:a8::e#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:503:ba3e::2:30#53
Dec  4 14:28:35 sergio named[5959]: all zones loaded
Dec  4 14:28:35 sergio named[5959]: running
Dec  4 14:28:35 sergio named[5959]: client @0x7f7c300d59b0 10.0.0.6#60715 (iesgn.org): transfer of 'iesgn.org/IN': AXFR-style IXFR started (serial 5)
Dec  4 14:28:35 sergio named[5959]: client @0x7f7c300d59b0 10.0.0.6#60715 (iesgn.org): transfer of 'iesgn.org/IN': AXFR-style IXFR ended
Dec  4 14:28:36 sergio named[5959]: managed-keys-zone: Key 20326 for zone . acceptance timer complete: key now trusted
~~~

• Muestra la salida del log donde se demuestra que se ha realizado la transferencia de zona.
	
cat /var/log/syslog

~~~
Dec  4 14:28:35 sergio named[5959]: received control channel command 'reload'
Dec  4 14:28:35 sergio named[5959]: loading configuration from '/etc/bind/named.conf'
Dec  4 14:28:35 sergio named[5959]: reading built-in trust anchors from file '/etc/bind/bind.keys'
Dec  4 14:28:35 sergio named[5959]: initializing GeoIP Country (IPv4) (type 1) DB
Dec  4 14:28:35 sergio named[5959]: GEO-106FREE 20181108 Build
Dec  4 14:28:35 sergio named[5959]: initializing GeoIP Country (IPv6) (type 12) DB
Dec  4 14:28:35 sergio named[5959]: GEO-106FREE 20181108 Build
Dec  4 14:28:35 sergio named[5959]: GeoIP City (IPv4) (type 2) DB not available
Dec  4 14:28:35 sergio named[5959]: GeoIP City (IPv4) (type 6) DB not available
Dec  4 14:28:35 sergio named[5959]: GeoIP City (IPv6) (type 30) DB not available
Dec  4 14:28:35 sergio named[5959]: GeoIP City (IPv6) (type 31) DB not available
Dec  4 14:28:35 sergio named[5959]: GeoIP Region (type 3) DB not available
Dec  4 14:28:35 sergio named[5959]: GeoIP Region (type 7) DB not available
Dec  4 14:28:35 sergio named[5959]: GeoIP ISP (type 4) DB not available
Dec  4 14:28:35 sergio named[5959]: GeoIP Org (type 5) DB not available
Dec  4 14:28:35 sergio named[5959]: GeoIP AS (type 9) DB not available
Dec  4 14:28:35 sergio named[5959]: GeoIP Domain (type 11) DB not available
Dec  4 14:28:35 sergio named[5959]: GeoIP NetSpeed (type 10) DB not available
Dec  4 14:28:35 sergio named[5959]: using default UDP/IPv4 port range: [32768, 60999]
Dec  4 14:28:35 sergio named[5959]: using default UDP/IPv6 port range: [32768, 60999]
Dec  4 14:28:35 sergio named[5959]: sizing zone task pool based on 7 zones
Dec  4 14:28:35 sergio named[5959]: none:106: 'max-cache-size 90%' - setting to 437MB (out of 485MB)
Dec  4 14:28:35 sergio named[5959]: obtaining root key for view _default from '/etc/bind/bind.keys'
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 10.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 16.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 17.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 18.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 19.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 20.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 21.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 22.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 23.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 24.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 25.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 26.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 27.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 28.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 29.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 30.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 31.172.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 168.192.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 64.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 65.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 66.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 67.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 68.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 69.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 70.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 71.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 72.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 73.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 74.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 75.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 76.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 77.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 78.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 79.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 80.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 81.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 82.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 83.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 84.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 85.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 86.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 87.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 88.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 89.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 90.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 91.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 92.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 93.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 94.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 95.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 96.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 97.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 98.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 99.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 100.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 101.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 102.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 103.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 104.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 105.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 106.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 107.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 108.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 109.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 110.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 111.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 112.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 113.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 114.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 115.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 116.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 117.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 118.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 119.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 120.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 121.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 122.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 123.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 124.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 125.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 126.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 127.100.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 254.169.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 2.0.192.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 100.51.198.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 113.0.203.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 255.255.255.255.IN-ADDR.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.IP6.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.IP6.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: D.F.IP6.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 8.E.F.IP6.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 9.E.F.IP6.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: A.E.F.IP6.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: B.E.F.IP6.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: 8.B.D.0.1.0.0.2.IP6.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: EMPTY.AS112.ARPA
Dec  4 14:28:35 sergio named[5959]: automatic empty zone: HOME.ARPA
Dec  4 14:28:35 sergio named[5959]: none:106: 'max-cache-size 90%' - setting to 437MB (out of 485MB)
Dec  4 14:28:35 sergio named[5959]: configuring command channel from '/etc/bind/rndc.key'
Dec  4 14:28:35 sergio named[5959]: configuring command channel from '/etc/bind/rndc.key'
Dec  4 14:28:35 sergio named[5959]: reloading configuration succeeded
Dec  4 14:28:35 sergio named[5959]: reloading zones succeeded
Dec  4 14:28:35 sergio named[5959]: zone 0.0.10.in-addr.arpa/IN: loaded serial 5
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:dc3::35#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:1::53#53
Dec  4 14:28:35 sergio named[5959]: zone 0.0.10.in-addr.arpa/IN: sending notifies (serial 5)
Dec  4 14:28:35 sergio named[5959]: zone iesgn.org/IN: loaded serial 5
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:7fd::1#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:7fe::53#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:2f::f#53
Dec  4 14:28:35 sergio named[5959]: zone iesgn.org/IN: sending notifies (serial 5)
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:2::c#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:2d::d#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:12::d0d#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:503:c27::2:30#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:200::b#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:9f::42#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:500:a8::e#53
Dec  4 14:28:35 sergio named[5959]: network unreachable resolving './DNSKEY/IN': 2001:503:ba3e::2:30#53
Dec  4 14:28:35 sergio named[5959]: all zones loaded
Dec  4 14:28:35 sergio named[5959]: running
Dec  4 14:28:35 sergio named[5959]: client @0x7f7c300d59b0 10.0.0.6#60715 (iesgn.org): transfer of 'iesgn.org/IN': AXFR-style IXFR started (serial 5)
Dec  4 14:28:35 sergio named[5959]: client @0x7f7c300d59b0 10.0.0.6#60715 (iesgn.org): transfer of 'iesgn.org/IN': AXFR-style IXFR ended
Dec  4 14:28:36 sergio named[5959]: managed-keys-zone: Key 20326 for zone . acceptance timer complete: key now trusted
~~~

* Configuramos un cliente para que utilice los dos servidores como servidores DNS.

Configuramos el /etc/resolv.conf del cliente añadiendo la ip de nuestro segundo servidor dns.

~~~
nameserver 10.0.0.6
~~~
      
* Realizamos una consulta con dig tanto al maestro como al esclavo para comprobar que las respuestas son autorizadas. ¿En qué te tienes que fijar?

Consulta al maestro:

~~~
debian@cliente:~$ dig +norec @10.0.0.8 iesgn.org. soa

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> +norec @10.0.0.8 iesgn.org. soa
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 32479
;; flags: qr aa ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 3

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: edcce1fe4553bad39b4f2cc95fca498c65baf028eb0117bf (good)
;; QUESTION SECTION:
;iesgn.org.			IN	SOA

;; ANSWER SECTION:
iesgn.org.		604800	IN	SOA	sergio.iesgn.org. root.iesgn.org. 5 604800 86400 2419200 604800

;; AUTHORITY SECTION:
iesgn.org.		604800	IN	NS	afrodita.iesgn.org.
iesgn.org.		604800	IN	NS	sergio.iesgn.org.

;; ADDITIONAL SECTION:
sergio.iesgn.org.	604800	IN	A	10.0.0.8
afrodita.iesgn.org.	604800	IN	A	10.0.0.6

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Fri Dec 04 14:37:00 UTC 2020
;; MSG SIZE  rcvd: 183
~~~

Consulta servidor secundario:

~~~
debian@cliente:~$ dig +norec @10.0.0.6 iesgn.org. soa

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> +norec @10.0.0.6 iesgn.org. soa
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 9337
;; flags: qr aa ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 3

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 93240ea3d7322da75a563ff45fca49a87521479a8cb52c68 (good)
;; QUESTION SECTION:
;iesgn.org.			IN	SOA

;; ANSWER SECTION:
iesgn.org.		604800	IN	SOA	sergio.iesgn.org. root.iesgn.org. 5 604800 86400 2419200 604800

;; AUTHORITY SECTION:
iesgn.org.		604800	IN	NS	sergio.iesgn.org.
iesgn.org.		604800	IN	NS	afrodita.iesgn.org.

;; ADDITIONAL SECTION:
sergio.iesgn.org.	604800	IN	A	10.0.0.8
afrodita.iesgn.org.	604800	IN	A	10.0.0.6

;; Query time: 3 msec
;; SERVER: 10.0.0.6#53(10.0.0.6)
;; WHEN: Fri Dec 04 14:37:28 UTC 2020
;; MSG SIZE  rcvd: 183
~~~

A la hora de hacer las peticiones nos tenemos que fijar en que el numero de serie sea el mismo en las dos consultas.

* Solicitamos una copia completa de la zona desde el cliente ¿qué tiene que ocurrir?. Solicita una copia completa desde el esclavo ¿qué tiene que ocurrir?

En el cliente no nos debe salir ningún tipo de información ya que la ip del cliente no esta especificada como allow-transfer en el fichero de configuración de las zonas, por lo que al solicitar la copia obtenemos loo siguiente:

~~~
debian@cliente:~$ dig @10.0.0.8 iesgn.org. axfr

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> @10.0.0.8 iesgn.org. axfr
; (1 server found)
;; global options: +cmd
; Transfer failed.
~~~

Por el contrario, el dns esclavo o secundario al estar especificado en el allow-transfer de las zonas, obtiene la copia sin ningún problema:

~~~
debian@afrodita:~$ dig @10.0.0.8 iesgn.org. axfr

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> @10.0.0.8 iesgn.org. axfr
; (1 server found)
;; global options: +cmd
iesgn.org.		604800	IN	SOA	sergio.iesgn.org. root.iesgn.org. 5 604800 86400 2419200 604800
iesgn.org.		604800	IN	NS	sergio.iesgn.org.
iesgn.org.		604800	IN	NS	afrodita.iesgn.org.
iesgn.org.		604800	IN	MX	10 correo.iesgn.org.
afrodita.iesgn.org.	604800	IN	A	10.0.0.6
Cliente.iesgn.org.	604800	IN	A	10.0.0.5
Correo.iesgn.org.	604800	IN	A	10.0.0.200
departamentos.iesgn.org. 604800	IN	CNAME	sergio.iesgn.org.
ftp.iesgn.org.		604800	IN	A	10.0.0.201
sergio.iesgn.org.	604800	IN	A	10.0.0.8
www.iesgn.org.		604800	IN	CNAME	sergio.iesgn.org.
iesgn.org.		604800	IN	SOA	sergio.iesgn.org. root.iesgn.org. 5 604800 86400 2419200 604800
;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Fri Dec 04 14:51:12 UTC 2020
;; XFR size: 12 records (messages 1, bytes 355)
~~~

* Realizamos una consulta desde el cliente y compruebamos que el servidor esclavo está respondiendo.

~~~
debian@cliente:~$ dig departamentos.iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> departamentos.iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 62226
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 2, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 56b7de6e5e1d379fe8a814415fca4e79d60ff26e2f7e4581 (good)
;; QUESTION SECTION:
;departamentos.iesgn.org.	IN	A

;; ANSWER SECTION:
departamentos.iesgn.org. 604800	IN	CNAME	sergio.iesgn.org.
sergio.iesgn.org.	604800	IN	A	10.0.0.8

;; AUTHORITY SECTION:
iesgn.org.		604800	IN	NS	afrodita.iesgn.org.
iesgn.org.		604800	IN	NS	sergio.iesgn.org.

;; ADDITIONAL SECTION:
afrodita.iesgn.org.	604800	IN	A	10.0.0.6

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Fri Dec 04 14:58:01 UTC 2020
;; MSG SIZE  rcvd: 170
~~~

En este caso esta respondiendo el servidor 10.0.0.8 (sergio.iesgn.org)

* Posteriormente apagamos el servidor maestro y vuelve a realizar una consulta desde el cliente ¿quién responde?

~~~
debian@cliente:~$ dig departamentos.iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> departamentos.iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 20870
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 2, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: b15e3204e03a922cc9c6461e5fca4ec0e1e6a133b88d15c1 (good)
;; QUESTION SECTION:
;departamentos.iesgn.org.	IN	A

;; ANSWER SECTION:
departamentos.iesgn.org. 604800	IN	CNAME	sergio.iesgn.org.
sergio.iesgn.org.	604800	IN	A	10.0.0.8

;; AUTHORITY SECTION:
iesgn.org.		604800	IN	NS	sergio.iesgn.org.
iesgn.org.		604800	IN	NS	afrodita.iesgn.org.

;; ADDITIONAL SECTION:
afrodita.iesgn.org.	604800	IN	A	10.0.0.6

;; Query time: 2 msec
;; SERVER: 10.0.0.6#53(10.0.0.6)
;; WHEN: Fri Dec 04 14:59:12 UTC 2020
;; MSG SIZE  rcvd: 170
~~~

En este caso esta respondiendo el servidor 10.0.0.6 (afrodita.iesgn.org)

### **Delegación de dominios** ###

Tenemos un servidor DNS que gestiona la zona correspondiente al nombre de dominio iesgn.org, en esta ocasión queremos delegar el subdominio informatica.iesgn.org para que lo gestione otro servidor DNS. Por lo tanto tenemos un escenario con dos servidores DNS:

• pandora.iesgn.org, es servidor DNS autorizado para la zona iesgn.org.
• ns.informatica.iesgn.org, es el servidor DNS para la zona informatica.iesgn.org y, está instalado en otra máquina.
Los nombres que vamos a tener en ese subdominio son los siguientes:
• www.informatica.iesgn.org corresponde a un sitio web que está alojado en el servidor web del departamento de informática.
• Vamos a suponer que tenemos un servidor ftp que se llame ftp.informatica.iesgn.org y que está en la misma máquina.
• Vamos a suponer que tenemos un servidor para recibir los correos que se llame correo.informatica.iesgn.org.

* Realizamos la instalación y configuración del nuevo servidor dns con las características anteriormente señaladas. Muestra el resultado al profesor.

En este caso se usara como subdominio el servidor esclavo usado anteriormente, por lo tanto no sera necesario instalar bind9 de nuevo ya que estará instalado.

Configuración en el servidor maestro (/var/cache/bind/db.sergio.iesgn.org):

~~~
$TTL    604800
@       IN      SOA     sergio.iesgn.org. root.iesgn.org. (
                              5         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      sergio.iesgn.org.
@       IN      NS      afrodita.iesgn.org.
@       IN      MX      10      correo.iesgn.org.

$ORIGIN iesgn.org.

sergio  IN      A       10.0.0.8
afrodita IN     A       10.0.0.6
Correo  IN      A       10.0.0.200
ftp     IN      A       10.0.0.201
Cliente IN      A       10.0.0.5
www     IN      CNAME   sergio
departamentos   IN      CNAME   sergio

$ORIGIN informatica.iesgn.org.
@       IN      NS      ns
ns      IN      A       10.0.0.6
~~~

De esta forma, añadimos la delegación de subdominio, indicando que el subdominio de informatica.iesgn.org estará en el servidor 10.0.0.6 (servidor afrodita)

Una vez hecho esto pasamos a configurar el servidor esclavo:

Añadimos la zona del subdominio al fichero /etc/bind/named.conf.local

~~~
zone "informatica.iesgn.org" {
        type master;
        file "db.informatica.iesgn.org";
        forwarders { };
};
~~~

Una vez configurada la zona, se configura el subdominio (/var/cache/bind/db.informatica.iesgn.org)

~~~
$TTL    604800
@       IN      SOA     ns.informatica.iesgn.org. root.iesgn.org. (
                              1         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL

$ORIGIN informatica.iesgn.org.
@       IN      NS      ns
ns      IN      A       10.0.0.6
www     IN      A       10.0.0.9
ftp     IN      CNAME   ns
correo  IN      CNAME   ns

~~~

* Realizamos las consultas dig/neslookup desde los clientes preguntando por los siguientes:

• Dirección de www.informatica.iesgn.org, ftp.informatica.iesgn.org

www.Informatica.iesgn.org:

~~~
debian@cliente:~$ dig @10.0.0.8 www.informatica.iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> @10.0.0.8 www.informatica.iesgn.org
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 29246
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: a7340d1eb6e70b88f75b919f5fca5d68bbad799477b38004 (good)
;; QUESTION SECTION:
;www.informatica.iesgn.org.	IN	A

;; ANSWER SECTION:
www.informatica.iesgn.org. 604715 IN	A	10.0.0.9

;; AUTHORITY SECTION:
informatica.iesgn.org.	604800	IN	NS	ns.informatica.iesgn.org.

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Fri Dec 04 16:01:44 UTC 2020
;; MSG SIZE  rcvd: 115
~~~

ftp.informatica.iesgn.org:

~~~
debian@cliente:~$ dig @10.0.0.8 ftp.informatica.iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> @10.0.0.8 ftp.informatica.iesgn.org
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 46209
;; flags: qr rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 26c3b56b97638681d0bf4c365fca5d74dada0e70e1f2c0eb (good)
;; QUESTION SECTION:
;ftp.informatica.iesgn.org.	IN	A

;; ANSWER SECTION:
ftp.informatica.iesgn.org. 604800 IN	CNAME	ns.informatica.iesgn.org.
ns.informatica.iesgn.org. 604800 IN	A	10.0.0.6

;; AUTHORITY SECTION:
informatica.iesgn.org.	604800	IN	NS	ns.informatica.iesgn.org.

;; Query time: 7 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Fri Dec 04 16:01:56 UTC 2020
;; MSG SIZE  rcvd: 129
~~~

• El servidor DNS que tiene configurado la zona del dominio informatica.iesgn.org. ¿Es el mismo que el servidor DNS con autoridad para la zona iesgn.org?

iesgn.org:

~~~
debian@cliente:~$ dig soa iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> soa iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 62552
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 2, ADDITIONAL: 3

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 075e43a16237f6b22f7be3c55fca63ccff215a248bee99c6 (good)
;; QUESTION SECTION:
;iesgn.org.			IN	SOA

;; ANSWER SECTION:
iesgn.org.		604800	IN	SOA	sergio.iesgn.org. root.iesgn.org. 5 604800 86400 2419200 604800

;; AUTHORITY SECTION:
iesgn.org.		604800	IN	NS	afrodita.iesgn.org.
iesgn.org.		604800	IN	NS	sergio.iesgn.org.

;; ADDITIONAL SECTION:
sergio.iesgn.org.	604800	IN	A	10.0.0.8
afrodita.iesgn.org.	604800	IN	A	10.0.0.6

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Fri Dec 04 16:29:00 UTC 2020
;; MSG SIZE  rcvd: 183
~~~

informatica.iesgn.org:

~~~
debian@cliente:~$ dig soa informatica.iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> soa informatica.iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 36242
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 5e0c09930e159a27976b05e45fca63d79d81aaa0423d6fa2 (good)
;; QUESTION SECTION:
;informatica.iesgn.org.		IN	SOA

;; ANSWER SECTION:
informatica.iesgn.org.	604800	IN	SOA	ns.informatica.iesgn.org. root.iesgn.org. 2 604800 86400 2419200 604800

;; AUTHORITY SECTION:
informatica.iesgn.org.	604700	IN	NS	ns.informatica.iesgn.org.

;; ADDITIONAL SECTION:
ns.informatica.iesgn.org. 603165 IN	A	10.0.0.6

;; Query time: 4 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Fri Dec 04 16:29:11 UTC 2020
;; MSG SIZE  rcvd: 152
~~~

No es el mismo ya que el servidor de autoridad para informatica.iesgn.org es ns.informatica.iesgn.org mientras que para iesgn.org son tanto sergio.iesgn.org como afrodita.iesgn.org

• El servidor de correo configurado para informatica.iesgn.org

~~~
debian@cliente:~$ dig mx correo.informatica.iesgn.org

; <<>> DiG 9.11.5-P4-5.1+deb10u2-Debian <<>> mx correo.informatica.iesgn.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 47184
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: ff78a52132cd503179bec4965fca630370c173662cf2f816 (good)
;; QUESTION SECTION:
;correo.informatica.iesgn.org.	IN	MX

;; ANSWER SECTION:
correo.informatica.iesgn.org. 603384 IN	CNAME	ns.informatica.iesgn.org.

;; AUTHORITY SECTION:
informatica.iesgn.org.	10711	IN	SOA	ns.informatica.iesgn.org. root.iesgn.org. 2 604800 86400 2419200 604800

;; Query time: 1 msec
;; SERVER: 10.0.0.8#53(10.0.0.8)
;; WHEN: Fri Dec 04 16:25:39 UTC 2020
;; MSG SIZE  rcvd: 143
~~~