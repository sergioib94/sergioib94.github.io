---
title: "Cortafuegos en escenario Openstack"
date: 2021-03-12T17:53:20+01:00
categories: [Seguridad]
excerpt: "En el siguiente post se va a configurar un cortafuegos que nos permita controlar el trafico de red en un nodo instalado en un escenario en openstack creado en practicas anteriores."
---

### **Introducción** ###

Vamos a construir un cortafuegos en la maquina dulcinea de nuestro escenario en openstack que nos permita controlar el tráfico de nuestra red. El cortafuegos que vamos a construir debe funcionar tras un reinicio.

En este caso la maquina dulcinea cuenta con 3 interfaces de red:

* eth0: interfaz al exterior
* eth1: interfaz de la red interna donde estan alojadas las maquinas freston(servidor ldap y de correos) y sancho (servidor base de datos y de copias de seguridad)
* eth2: interfaz a red dmz donde esta la maquina quijote (servidor web)

Política por defecto

La política por defecto que vamos a configurar en nuestro cortafuegos será de tipo DROP.

### **Configuraciones de reglas NAT** ###

1. Configura de manera adecuada las reglas NAT para que todas las máquinas de nuestra red tenga acceso al exterior.

~~~
iptables -t nat -A POSTROUTING -s 10.0.1.0/24 -o eth0 -j MASQUERADE
iptables -t nat -A POSTROUTING -s 10.0.2.0/24 -o eth0 -j MASQUERADE
~~~

2. Configura de manera adecuada todas las reglas NAT necesarias para que los servicios expuestos al exterior sean accesibles.

~~~
iptables -t nat -A PREROUTING -i eth0 -p udp --dport 53 -j DNAT --to 10.0.1.3
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 53 -j DNAT --to 10.0.1.3
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j DNAT --to 10.0.2.5
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j DNAT --to 10.0.2.5
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 25 -j DNAT --to 10.0.1.3
~~~

### **Reglas iptables** ###

Para cada configuración, hay que mostrar las reglas que se han configurado y una prueba de funcionamiento de la misma:

### **Reglas ping** ###

1. Todas las máquinas de las dos redes pueden hacer ping entre ellas.

* Dulcinea → LAN

~~~
	iptables -A OUTPUT -o eth1 -p icmp -m icmp --icmp-type echo-request -j ACCEPT
	iptables -A INPUT -i eth1 -p icmp -m icmp --icmp-type echo-reply -j ACCEPT
~~~

* Dulcinea → DMZ

~~~
	iptables -A OUTPUT -o eth2 -p icmp -m icmp --icmp-type echo-request -j ACCEPT
	iptables -A INPUT -i eth2 -p icmp -m icmp --icmp-type echo-reply -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
root@dulcinea:/home/debian# ping sancho
PING sancho.sergio.gonzalonazareno.org (10.0.1.8) 56(84) bytes of data.
64 bytes from sancho.sergio.gonzalonazareno.org (10.0.1.8): icmp_seq=1 ttl=64 time=1.31 ms
64 bytes from sancho.sergio.gonzalonazareno.org (10.0.1.8): icmp_seq=2 ttl=64 time=0.604 ms
64 bytes from sancho.sergio.gonzalonazareno.org (10.0.1.8): icmp_seq=3 ttl=64 time=0.677 ms
64 bytes from sancho.sergio.gonzalonazareno.org (10.0.1.8): icmp_seq=4 ttl=64 time=0.783 ms
64 bytes from sancho.sergio.gonzalonazareno.org (10.0.1.8): icmp_seq=5 ttl=64 time=0.633 ms
^C
--- sancho.sergio.gonzalonazareno.org ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 40ms
rtt min/avg/max/mdev = 0.604/0.800/1.306/0.261 ms
root@dulcinea:/home/debian# ping quijote
PING quijote.sergio.gonzalonazareno.org (10.0.2.5) 56(84) bytes of data.
64 bytes from quijote.sergio.gonzalonazareno.org (10.0.2.5): icmp_seq=1 ttl=64 time=1.17 ms
64 bytes from quijote.sergio.gonzalonazareno.org (10.0.2.5): icmp_seq=2 ttl=64 time=0.603 ms
64 bytes from quijote.sergio.gonzalonazareno.org (10.0.2.5): icmp_seq=3 ttl=64 time=0.530 ms
64 bytes from quijote.sergio.gonzalonazareno.org (10.0.2.5): icmp_seq=4 ttl=64 time=0.453 ms
64 bytes from quijote.sergio.gonzalonazareno.org (10.0.2.5): icmp_seq=5 ttl=64 time=0.562 ms
^C
--- quijote.sergio.gonzalonazareno.org ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 61ms
rtt min/avg/max/mdev = 0.453/0.662/1.165/0.257 ms
~~~
	
* DMZ → LAN
	
~~~
	iptables -A FORWARD -i eth2 -o eth1 -p icmp -m icmp --icmp-type echo-request -j ACCEPT
	iptables -A FORWARD -i eth1 -o eth2 -p icmp -m icmp --icmp-type echo-reply -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
	[centos@quijote ~]$ ping sancho
PING sancho.sergio.gonzalonazareno.org (10.0.1.8) 56(84) bytes of data.
64 bytes from sancho.sergio.gonzalonazareno.org (10.0.1.8): icmp_seq=1 ttl=63 time=1.83 ms
64 bytes from sancho.sergio.gonzalonazareno.org (10.0.1.8): icmp_seq=2 ttl=63 time=1.38 ms
64 bytes from sancho.sergio.gonzalonazareno.org (10.0.1.8): icmp_seq=3 ttl=63 time=1.68 ms
^C
--- sancho.sergio.gonzalonazareno.org ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 5ms
rtt min/avg/max/mdev = 1.376/1.626/1.827/0.190 ms
~~~

* LAN → DMZ
	
~~~
	iptables -A FORWARD -i eth1 -o eth2 -p icmp -m icmp --icmp-type echo-request -j ACCEPT
	iptables -A FORWARD -i eth2 -o eth1 -p icmp -m icmp --icmp-type echo-reply -j ACCEPT
~~~

* Prueba de funcionaiento:

~~~
	debian@freston:~$ ping quijote
PING quijote.sergio.gonzalonazareno.org (10.0.2.5) 56(84) bytes of data.
64 bytes from quijote.sergio.gonzalonazareno.org (10.0.2.5): icmp_seq=1 ttl=63 time=1.86 ms
64 bytes from quijote.sergio.gonzalonazareno.org (10.0.2.5): icmp_seq=2 ttl=63 time=1.26 ms
64 bytes from quijote.sergio.gonzalonazareno.org (10.0.2.5): icmp_seq=3 ttl=63 time=1.18 ms
64 bytes from quijote.sergio.gonzalonazareno.org (10.0.2.5): icmp_seq=4 ttl=63 time=1.37 ms
^C
--- quijote.sergio.gonzalonazareno.org ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 8ms
rtt min/avg/max/mdev = 1.183/1.416/1.859/0.265 ms
~~~

2. Todas las máquinas pueden hacer ping a una máquina del exterior.

* LAN → EXT

~~~
	iptables -A FORWARD -i eth1 -o eth0 -p icmp -m icmp --icmp-type echo-request -j ACCEPT
	iptables -A FORWARD -i eth0 -o eth1 -p icmp -m icmp --icmp-type echo-reply -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
	debian@freston:~$ ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=111 time=44.6 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=111 time=42.9 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=111 time=43.1 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=111 time=44.2 ms
^C
--- 8.8.8.8 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 8ms
rtt min/avg/max/mdev = 42.922/43.716/44.595/0.715 ms
~~~

* DMZ → EXT

~~~
iptables -A FORWARD -i eth2 -o eth0 -p icmp -m icmp --icmp-type echo-request -j ACCEPT
iptables -A FORWARD -i eth0 -o eth2 -p icmp -m icmp --icmp-type echo-reply -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
	[centos@quijote ~]$ ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=111 time=63.10 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=111 time=43.0 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=111 time=142 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=111 time=42.9 ms
^C
--- 8.8.8.8 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 7ms
rtt min/avg/max/mdev = 42.864/73.079/142.492/40.984 ms
~~~

3. Desde el exterior se puede hacer ping a dulcinea.

~~~
iptables -A OUTPUT -o eth0 -p icmp -m icmp --icmp-type echo-reply -j ACCEPT
iptables -A INPUT -i eth0 -p icmp -m icmp --icmp-type echo-request -j ACCEPT
~~~
	
* Prueba de funcionamiento:

~~~
sergioib@debian-sergio:~$ ping 172.22.200.151
PING 172.22.200.151 (172.22.200.151) 56(84) bytes of data.
64 bytes from 172.22.200.151: icmp_seq=1 ttl=61 time=180 ms
64 bytes from 172.22.200.151: icmp_seq=2 ttl=61 time=102 ms
64 bytes from 172.22.200.151: icmp_seq=3 ttl=61 time=126 ms
64 bytes from 172.22.200.151: icmp_seq=4 ttl=61 time=116 ms
64 bytes from 172.22.200.151: icmp_seq=5 ttl=61 time=97.8 ms
64 bytes from 172.22.200.151: icmp_seq=6 ttl=61 time=94.3 ms
~~~

4. A dulcinea se le puede hacer ping desde la DMZ, pero desde la LAN se le debe rechazar la conexión (REJECT).

* DMZ → Dulcinea

~~~
iptables -A OUTPUT -o eth2 -p icmp -m icmp --icmp-type echo-reply -j ACCEPT
iptables -A INPUT -i eth2 -p icmp -m icmp --icmp-type echo-request -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
[centos@quijote ~]$ ping dulcinea
PING dulcinea.sergio.gonzalonazareno.org (10.0.2.3) 56(84) bytes of data.
64 bytes from dulcinea.sergio.gonzalonazareno.org (10.0.2.3): icmp_seq=1 ttl=64 time=0.608 ms
64 bytes from dulcinea.sergio.gonzalonazareno.org (10.0.2.3): icmp_seq=2 ttl=64 time=0.721 ms
64 bytes from dulcinea.sergio.gonzalonazareno.org (10.0.2.3): icmp_seq=3 ttl=64 time=0.676 ms
64 bytes from dulcinea.sergio.gonzalonazareno.org (10.0.2.3): icmp_seq=4 ttl=64 time=0.730 ms
^C
--- dulcinea.sergio.gonzalonazareno.org ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 90ms
rtt min/avg/max/mdev = 0.608/0.683/0.730/0.057 ms
~~~

* LAN → Dulcinea	

~~~
iptables -A INPUT -i eth1 -p icmp -m icmp --icmp-type echo-request -j REJECT --reject-with icmp-port-unreachable
iptables -A OUTPUT -o eth1 -p icmp -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
debian@freston:~$ ping 10.0.1.5
PING 10.0.1.5 (10.0.1.5) 56(84) bytes of data.
From 10.0.1.5 icmp_seq=1 Destination Port Unreachable
From 10.0.1.5 icmp_seq=2 Destination Port Unreachable
From 10.0.1.5 icmp_seq=3 Destination Port Unreachable
^C
--- 10.0.1.5 ping statistics ---
3 packets transmitted, 0 received, +3 errors, 100% packet loss, time 4ms
~~~

### **Reglas ssh** ###

1. Podemos acceder por ssh a todas las máquinas.

* DMZ → LAN
		
~~~
	iptables -A FORWARD -i eth2 -o eth1 -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth1 -o eth2 -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT
~~~
	
* LAN → DMZ

~~~
	iptables -A FORWARD -i eth1 -o eth2 -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth2 -o eth1 -p tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT
~~~

	
* Dulcinea → LAN

~~~
	iptables -A OUTPUT -o eth1 -p tcp -m tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A INPUT -i eth1 -p tcp -m tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT
~~~
	
* Prueba de funcionamiento:

~~~
root@dulcinea:/home/debian# ssh -i .ssh/2asir.pem ubuntu@sancho
Welcome to Ubuntu 20.04.1 LTS (GNU/Linux 5.4.0-54-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Fri Jan 29 10:13:01 CET 2021

  System load:  0.16              Processes:             109
  Usage of /:   31.8% of 9.52GB   Users logged in:       0
  Memory usage: 65%               IPv4 address for ens3: 10.0.1.8
  Swap usage:   0%

 * Introducing self-healing high availability clusters in MicroK8s.
   Simple, hardened, Kubernetes for production, from RaspberryPi to DC.

     https://microk8s.io/high-availability

32 updates can be installed immediately.
0 of these updates are security updates.
To see these additional updates run: apt list --upgradable


*** System restart required ***
Last login: Fri Jan 29 08:29:29 2021 from 10.0.1.5
ubuntu@sancho:~$
~~~ 

* Dulcinea → DMZ
	
~~~
	iptables -A OUTPUT -o eth2 -p tcp -m tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A INPUT -i eth2 -p tcp -m tcp --sport 22 -m state --state ESTABLISHED -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
root@dulcinea:/home/debian# ssh -i .ssh/2asir.pem centos@quijote
Last login: Tue Jan 26 14:20:42 2021 from 10.0.2.3
[centos@quijote ~]$
~~~ 

2. Todas las máquinas pueden hacer ssh a máquinas del exterior.
	
* LAN → EXT

~~~
	iptables -A FORWARD -i eth1 -o eth0 -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth0 -o eth1 -p tcp --dport 22 -m state --state ESTABLISHED -j ACCEPT
~~~


* DMZ → EXT

~~~
	iptables -A FORWARD -i eth2 -o eth0 -p tcp --dport 22 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth0 -o eth2 -p tcp --dport 22 -m state --state ESTABLISHED -j ACCEPT
~~~

### **Reglas DNS** ###
    
1. El único dns que pueden usar los equipos de las dos redes es freston, no pueden utilizar un DNS externo.

* Freston → EXT

~~~
	iptables -A FORWARD -s 10.0.1.3 -d 0.0.0.0/0 -p udp --dport 53 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -s 0.0.0.0/0 -d 10.0.1.3 -p udp --sport 53 -m state --state ESTABLISHED -j ACCEPT
~~~
	
* DMZ → Freston

~~~
	iptables -A FORWARD -s 10.0.2.0/24 -d 10.0.1.3 -p udp --dport 53 -m state --state NEW,ESTABLISHED -j ACCEPT
  	iptables -A FORWARD -s 10.0.1.3 -d 10.0.2.0/24 -p udp --sport 53 -m state --state ESTABLISHED -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
[centos@quijote ~]$ dig dulcinea.sergio.gonzalonazareno.org

; <<>> DiG 9.11.20-RedHat-9.11.20-5.el8 <<>> dulcinea.sergio.gonzalonazareno.org
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 8104
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
; COOKIE: 223207db578b4d4d2daf835f6013ecc74e18914c1562b393 (good)
;; QUESTION SECTION:
;dulcinea.sergio.gonzalonazareno.org. IN	A

;; ANSWER SECTION:
dulcinea.sergio.gonzalonazareno.org. 604800 IN A 10.0.2.3

;; AUTHORITY SECTION:
sergio.gonzalonazareno.org. 604800 IN	NS	freston.sergio.gonzalonazareno.org.

;; ADDITIONAL SECTION:
freston.sergio.gonzalonazareno.org. 604800 IN A	10.0.1.3

;; Query time: 1 msec
;; SERVER: 10.0.1.3#53(10.0.1.3)
;; WHEN: Fri Jan 29 12:08:55 CET 2021
;; MSG SIZE  rcvd: 146
~~~

2. Dulcinea puede usar cualquier servidor DNS.

* Dulcinea → Freston

~~~
	iptables -A OUTPUT -d 10.0.1.3 -p udp --sport 53 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A INPUT -s 10.0.1.3 -d 10.0.1.5 -p udp --sport 53 -m state --state ESTABLISHED -j ACCEPT
~~~

* Dulcinea → Cualquier red

~~~
	iptables -A OUTPUT -o eth0 -p udp --dport 53 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A INPUT -i eth0 -p udp --sport 53 -m state --state ESTABLISHED -j ACCEPT
~~~

3. Tenemos que permitir consultas dns desde el exterior a freston, para que, por ejemplo, papion-dns pueda preguntar.

~~~
	iptables -A FORWARD -i eth0 -o eth1 -s 0.0.0.0/0 -d 10.0.1.3 -p udp --dport 53 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth1 -o eth0 -s 10.0.1.3 -p udp --sport 53 -m state --state ESTABLISHED -j ACCEPT
~~~

### **Reglas Base de datos** ###

1. A la base de datos de sancho sólo pueden acceder las máquinas de la DMZ.

~~~
	iptables -A FORWARD -i eth2 -o eth1 -p tcp --dport 3306 -m state --state NEW,ESTABLISHED -j ACCEPT 
	iptables -A FORWARD -i eth1 -o eth2 -p tcp --sport 3306 -m state --state ESTABLISHED -j ACCEPT	
~~~

* Prueba de funcionamiento:

~~~
[centos@quijote ~]$ mysql --host=sancho --protocol=tcp --port=3306 mysql -p
Enter password: 
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 228
Server version: 5.5.5-10.3.25-MariaDB-0ubuntu0.20.04.1 Ubuntu 20.04

Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 
~~~

### **Reglas Web** ###

1. Las páginas web de quijote (80, 443) pueden ser accedidas desde todas las máquinas de nuestra red y desde el exterior.

~~~
	iptables -t nat -A PREROUTING -i eth0 -p tcp -m multiport --dports 80,443 -j DNAT --to 10.0.2.3
~~~

* DMZ ↔ EXT

~~~
	iptables -A FORWARD -i eth2 -o eth0 -p tcp -m multiport --dports 80,443 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth0 -o eth2 -p tcp -m multiport --sports 80,443 -m state --state ESTABLISHED -j ACCEPT
~~~

![prueba web externa](/cortafuegos/prueba_web_externa.png)

* LAN ↔ EXT

~~~
	iptables -A FORWARD -i eth1 -o eth0 -p tcp -m multiport --dports 80,443 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth0 -o eth1 -p tcp -m multiport --sports 80,443 -m state --state ESTABLISHED -j ACCEPT
~~~

* Dulcinea → EXT

~~~
	iptables -A OUTPUT -o eth0 -p tcp -m multiport --dports 80,443 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A INPUT -i eth0 -p tcp -m multiport --sports 80,443 -m state --state ESTABLISHED -j ACCEPT
~~~

* LAN ↔ Quijote

~~~
	iptables -A FORWARD -i eth1 -o eth2 -p tcp -m multiport --dports 80,443 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth2 -o eth1 -p tcp -m multiport --sports 80,443 -m state --state ESTABLISHED -j ACCEPT
~~~

* Quijote ↔ EXT

~~~
	iptables -A FORWARD -i eth0 -o eth2 -p tcp -m multiport --dports 80,443 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth2 -o eth0 -p tcp -m multiport --sports 80,443 -m state --state ESTABLISHED -j ACCEPT
~~~

* Dulcinea → Quijote

~~~
	iptables -A OUTPUT -o eth2 -p tcp -m multiport --dports 80,443 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A INPUT -i eth2 -p tcp -m multiport --sports 80,443 -m state --state ESTABLISHED -j ACCEPT
~~~

**Más servicios**

1. Configura de manera adecuada el cortafuegos, para otros servicios que tengas instalado en tu red (ldap, correo, …)
	
**envios desde dulcinea**

~~~
iptables -A OUTPUT -o eth1 -p tcp --dport 25 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT -i eth1 -p tcp --sport 25 -m state --state ESTABLISHED -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
root@dulcinea:/home/debian# telnet 10.0.1.3 25
Trying 10.0.1.3...
Connected to 10.0.1.3.
Escape character is '^]'.
220 freston.sergio.gonzalonazareno.org ESMTP Postfix (Debian/GNU)
quit
Connection closed by foreign host.
~~~

**envios desde red interna**

~~~
iptables -A FORWARD -i eth0 -o eth1 -p tcp --dport 25 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i eth1 -o eth0 -p tcp --sport 25 -m state --state ESTABLISHED -j ACCEPT
~~~

![prueba de correo freston](/cortafuegos/prueba_correo_freston.png)

**envios desde dmz**

~~~
iptables -A FORWARD -i eth2 -o eth1 -p tcp --dport 25 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i eth1 -o eth2 -p tcp --sport 25 -m state --state ESTABLISHED -j ACCEPT
~~~

**prueba de funcionamiento:**

~~~
[centos@quijote ~]$ telnet 10.0.1.3 25
Trying 10.0.1.3...
Connected to 10.0.1.3.
Escape character is '^]'.
220 freston.sergio.gonzalonazareno.org ESMTP Postfix (Debian/GNU)
quit
221 2.0.0 Bye
Connection closed by foreign host.
~~~

* DMZ → LAN

~~~
iptables -A FORWARD -i eth2 -o eth1 -p tcp -m multiport --dports 389,636 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i eth1 -o eth2 -p tcp -m multiport --sports 389,636 -m state --state ESTABLISHED -j ACCEPT
~~~

**prueba de funcionamiento**

~~~
[centos@quijote ~]$ telnet 10.0.1.3 636
Trying 10.0.1.3...
Connected to 10.0.1.3.
Escape character is '^]'.
quit
Connection closed by foreign host.
[centos@quijote ~]$ telnet 10.0.1.3 389
Trying 10.0.1.3...
Connected to 10.0.1.3.
Escape character is '^]'.
~~~

* Dulcinea → LAN

~~~
iptables -A OUTPUT -o eth1 -p tcp -m multiport --dports 389,636 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A INPUT -i eth1 -p tcp -m multiport --sports 389,636 -m state --state ESTABLISHED -j ACCEPT
~~~

**prueba de funcionamiento**

~~~
root@dulcinea:/home/debian# telnet 10.0.1.3 636
Trying 10.0.1.3...
Connected to 10.0.1.3.
Escape character is '^]'.
^CConnection closed by foreign host.
root@dulcinea:/home/debian# telnet 10.0.1.3 389
Trying 10.0.1.3...
Connected to 10.0.1.3.
Escape character is '^]'.
^Cquit
~~~

### **Reglas Bacula** ###

* LAN (Sancho) ↔ DMZ

~~~
	iptables -A FORWARD -i eth2 -o eth1 -p tcp --dport 9101:9103 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth1 -o eth2 -p tcp --sport 9101:9103 -m state --state ESTABLISHED -j ACCEPT

	iptables -A FORWARD -i eth1 -o eth2 -p tcp --dport 9101:9103 -m state --state NEW,ESTABLISHED -j ACCEPT
	iptables -A FORWARD -i eth2 -o eth1 -p tcp --sport 9101:9103 -m state --state ESTABLISHED -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
ubuntu@sancho:~$ sudo bconsole
Connecting to Director 10.0.1.8:9101
1000 OK: 103 sancho-dir Version: 9.4.2 (04 February 2019)
Enter a period to cancel a command.
*status
Status available for:
     1: Director
     2: Storage
     3: Client
     4: Scheduled
     5: Network
     6: All
Select daemon type for status (1-6): 3
The defined Client resources are:
     1: sancho-fd
     2: quijote-fd
     3: freston-fd
     4: dulcinea-fd
Select Client (File daemon) resource (1-4): 2
Connecting to Client quijote-fd at 10.0.2.5:9102

quijote-fd Version: 9.0.6 (20 November 2017) x86_64-redhat-linux-gnu redhat (Core)
Daemon started 26-Jan-21 14:16. Jobs: run=3 running=0.
 Heap: heap=4,096 smbytes=21,068 max_bytes=989,931 bufs=63 max_bufs=262
 Sizes: boffset_t=8 size_t=8 debug=0 trace=0 mode=0,0 bwlimit=0kB/s

Running Jobs:
Director connected at: 29-Jan-21 18:38
No Jobs running.
====

Terminated Jobs:
 JobId  Level      Files    Bytes   Status   Finished        Name 
===================================================================
    11  Full      32,049    192.0 M  OK       27-Jan-21 00:00 Quijote
    15  Incr          28    843.3 K  OK       27-Jan-21 23:59 Quijote
    19  Incr          28    849.8 K  OK       28-Jan-21 23:59 Quijote
====
You have messages.
~~~

* LAN (Sancho) ↔ Dulcinea

~~~
	iptables -A OUTPUT -d 10.0.1.8 -p tcp -m multiport --dports 9101:9103 -j ACCEPT
	iptables -A INPUT -s 10.0.1.8 -p tcp -m multiport --sports 9101:9103 -j ACCEPT
	iptables -A OUTPUT -d 10.0.1.8 -p tcp -m multiport --sports 9101:9103 -j ACCEPT
	iptables -A INPUT -s 10.0.1.8 -p tcp -m multiport --dports 9101:9103 -j ACCEPT
~~~

* Prueba de funcionamiento:

~~~
*status
Status available for:
     1: Director
     2: Storage
     3: Client
     4: Scheduled
     5: Network
     6: All
Select daemon type for status (1-6): 3
The defined Client resources are:
     1: sancho-fd
     2: quijote-fd
     3: freston-fd
     4: dulcinea-fd
Select Client (File daemon) resource (1-4): 4
Connecting to Client dulcinea-fd at 10.0.1.5:9102

dulcinea-fd Version: 9.4.2 (04 February 2019)  x86_64-pc-linux-gnu debian 10.5
Daemon started 29-Jan-21 09:21. Jobs: run=0 running=0.
 Heap: heap=114,688 smbytes=23,206 max_bytes=23,223 bufs=73 max_bufs=73
 Sizes: boffset_t=8 size_t=8 debug=0 trace=0 mode=0,0 bwlimit=0kB/s
 Plugin: bpipe-fd.so 

Running Jobs:
Director connected at: 29-Jan-21 18:43
No Jobs running.
====

Terminated Jobs:
 JobId  Level    Files      Bytes   Status   Finished        Name 
===================================================================
     8  Full      2,878    22.95 M  OK       25-Jan-21 23:59 Dulcinea
     9  Incr         45    709.9 K  OK       26-Jan-21 10:13 Dulcinea
    13  Incr         11    60.87 K  OK       26-Jan-21 23:59 Dulcinea
    17  Incr         45    736.3 K  OK       27-Jan-21 23:59 Dulcinea
    21  Incr         45    752.3 K  OK       28-Jan-21 23:59 Dulcinea
~~~

* LAN → EXT

~~~
iptables -A FORWARD -i eth0 -o eth1 -p tcp --dport 9101:9103 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i eth1 -o eth0 -p tcp --sport 9101:9103 -m state --state ESTABLISHED -j ACCEPT

iptables -A FORWARD -i eth1 -o eth0 -p tcp --dport 9101:9103 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A FORWARD -i eth0 -o eth1 -p tcp --sport 9101:9103 -m state --state ESTABLISHED -j ACCEPT
~~~

Estas ultimas reglas no serian necesarias, son para el caso de hacer copias de seguridad de equipos externos como pueden ser la maquina real o el servidor virtual OVH.