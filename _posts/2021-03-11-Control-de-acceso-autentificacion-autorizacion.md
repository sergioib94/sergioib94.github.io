---
layout: single
title: "Control de acceso, autentificacion y autorizacion"
date: 2021-03-11T16:13:52+01:00
categories: [Servicios]
excerpt: "Haciendo uso de la practica anterior en la que instalamos el virtualhosting apache en vagrant o bien creando un escenario nuesvo en el que instalaremos un servidor dhcp, configuraremos el control de acceso, autentificacion y autorizacion para acceder al sitio web creado."
---

## **Introduccion** ##

Haciendo uso de la practica anterior en la que instalamos el virtualhosting apache en vagrant o bien creando un escenario nuesvo en el que instalaremos un servidor dhcp, configuraremos el control de acceso, autentificacion y autorizacion para acceder al sitio web creado.

## **Configuración** ##

* Tarea1: A la URL departamentos.iesgn.org/intranet sólo se debe tener acceso desde el cliente de la red local, y no se pueda acceder desde la anfitriona por la red pública. A la URL departamentos.iesgn.org/internet, sin embargo, sólo se debe tener acceso desde la anfitriona por la red pública, y no desde la red local.

Empezamos modificando el fichero departamentos.conf en /etc/apache2/sites-available de la siguiente forma:

~~~
ServerAdmin webmaster@localhost
DocumentRoot /srv/www/departamentos
ServerName www.departamento.iesgn.org

<Directory /srv/www/departamentos/intranet/>
       Option Indexes FollowLinks
       Require ip 192.168.100
</Directory>
<Directory /srv/www/departamentos/internet/>
       Option Indexes FollowLinks
     <RequireAll>
             Require all granted
             Require not ip 192.168.100
    </RequireAll>
</Directory>
~~~

Ya que la red interna tiene ip 192.168.100 (.1 servidor y .2 cliente) en el caso de intranet pondremos como ip requerida en el rango 192.168.100 y para Internet lo contrario, se pondrá como requerido que no tenga la ip en el rango de la red interna.

Una vez que este todo listo iniciamos la prueba de funcionamiento:

* Intranet de equipo en red interna

~~~
Bienvenido a la pagina intranet
~~~

* Internet de equipo en red interna

~~~
Forbidden

You don't have permission to access this resource.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apache/2.4.38 (Debian) Server at www.departamentos.iesgn.org Port 80
~~~

* Intranet equipo fuera de la red

![prueba desde navegador](/images/control-accesos/intranet.png)

* Internet equipo fuera de la red

![prueba desde navegador](/images/control-accesos/internet.png)

* Tarea2: Autentificación básica. Limita el acceso a la URL departamentos.iesgn.org/secreto. Comprueba las cabeceras de los mensajes HTTP que se intercambian entre el servidor y el cliente. ¿Cómo se manda la contraseña entre el cliente y el servidor?. Entrega una breve explicación del ejercicio.*

Creamos en /src/www/departamentos un directorio secreto con un index.html

En /etc/apache2 creamos un directorio claves

~~~
mkdir claves
~~~

Creamos un usuario con su contraseña

~~~
vagrant@server:/etc/apache2$ sudo htpasswd -c /etc/apache2/claves/passwd.txt sergio
New password: 
Re-type new password: 
Adding password for user sergio
~~~

Editamos departamentos.conf

~~~
<Directory /srv/www/departamentos/secreto/>
                AuthUserFile "/etc/apache2/claves/passwd.txt"
                AuthName "password"
                AuthType Basic
                Require valid-user
</Directory>
~~~

Se ejecuta tcpdump -vi en el servidor mientras que en el cliente intentamos acceder a www.departamentos.iesgn.org/secretos

~~~
vagrant@server:/etc/apache2$ sudo tcpdump -vi eth2
tcpdump: listening on eth2, link-type EN10MB (Ethernet), capture size 262144 bytes
10:32:30.587861 IP (tos 0x0, ttl 64, id 48967, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.100.2.39280 > 192.168.100.1.http: Flags [S], cksum 0x4dc7 (correct), seq 2846383261, win 64240, options [mss 1460,sackOK,TS val 772204519 ecr 0,nop,wscale 6], length 0
10:32:30.587894 IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.100.1.http > 192.168.100.2.39280: Flags [S.], cksum 0x4983 (incorrect -> 0x933c), seq 960572023, ack 2846383262, win 65160, options [mss 1460,sackOK,TS val 1366884784 ecr 772204519,nop,wscale 6], length 0
10:32:30.588178 IP (tos 0x0, ttl 64, id 48968, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.39280 > 192.168.100.1.http: Flags [.], cksum 0xbca4 (correct), ack 1, win 1004, options [nop,nop,TS val 772204519 ecr 1366884784], length 0
10:32:30.588810 IP (tos 0x0, ttl 64, id 48969, offset 0, flags [DF], proto TCP (6), length 286)
    192.168.100.2.39280 > 192.168.100.1.http: Flags [P.], cksum 0x8d82 (correct), seq 1:235, ack 1, win 1004, options [nop,nop,TS val 772204519 ecr 1366884784], length 234: HTTP, length: 234
	GET /secreto HTTP/1.0
	User-Agent: w3m/0.5.3+git20190105
	Accept: text/html, text/*;q=0.5, image/*, application/*
	Accept-Encoding: gzip, compress, bzip, bzip2, deflate
	Accept-Language: en;q=1.0
	Host: www.departamentos.iesgn.org
	
10:32:30.588832 IP (tos 0x0, ttl 64, id 28880, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.39280: Flags [.], cksum 0x497b (incorrect -> 0xbbae), ack 235, win 1015, options [nop,nop,TS val 1366884785 ecr 772204519], length 0
10:32:30.589077 IP (tos 0x0, ttl 64, id 28881, offset 0, flags [DF], proto TCP (6), length 751)
    192.168.100.1.http > 192.168.100.2.39280: Flags [P.], cksum 0x4c36 (incorrect -> 0x238f), seq 1:700, ack 235, win 1015, options [nop,nop,TS val 1366884785 ecr 772204519], length 699: HTTP, length: 699
	HTTP/1.1 401 Unauthorized
	Date: Sat, 31 Oct 2020 10:32:30 GMT
	Server: Apache/2.4.38 (Debian)
	WWW-Authenticate: Basic realm="password"
	Content-Length: 474
	Connection: close
	Content-Type: text/html; charset=iso-8859-1
	
	<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
	<html><head>
	<title>401 Unauthorized</title>
	</head><body>
	<h1>Unauthorized</h1>
	<p>This server could not verify that you
	are authorized to access the document
	requested.  Either you supplied the wrong
	credentials (e.g., bad password), or your
	browser doesn't understand how to supply
	the credentials required.</p>
	<hr>
	<address>Apache/2.4.38 (Debian) Server at www.departamentos.iesgn.org Port 80</address>
	</body></html>
10:32:30.589159 IP (tos 0x0, ttl 64, id 28882, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.39280: Flags [F.], cksum 0x497b (incorrect -> 0xb8f2), seq 700, ack 235, win 1015, options [nop,nop,TS val 1366884785 ecr 772204519], length 0
10:32:35.728779 ARP, Ethernet (len 6), IPv4 (len 4), Request who-has 192.168.100.2 tell 192.168.100.1, length 28
10:32:35.729117 ARP, Ethernet (len 6), IPv4 (len 4), Request who-has 192.168.100.1 tell 192.168.100.2, length 46
10:32:35.729146 ARP, Ethernet (len 6), IPv4 (len 4), Reply 192.168.100.1 is-at 08:00:27:23:e5:a4 (oui Unknown), length 28
10:32:35.729205 ARP, Ethernet (len 6), IPv4 (len 4), Reply 192.168.100.2 is-at 08:00:27:c3:6c:a0 (oui Unknown), length 46
10:32:42.652286 IP (tos 0x0, ttl 64, id 48972, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.39280 > 192.168.100.1.http: Flags [F.], cksum 0x89dd (correct), seq 235, ack 701, win 1002, options [nop,nop,TS val 772216584 ecr 1366884785], length 0
10:32:42.652336 IP (tos 0x0, ttl 64, id 28883, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.39280: Flags [.], cksum 0x497b (incorrect -> 0x5ab0), ack 236, win 1015, options [nop,nop,TS val 1366896849 ecr 772216584], length 0
10:32:42.652499 IP (tos 0x0, ttl 64, id 10193, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.100.2.39282 > 192.168.100.1.http: Flags [S], cksum 0xe722 (correct), seq 1435363385, win 64240, options [mss 1460,sackOK,TS val 772216584 ecr 0,nop,wscale 6], length 0
10:32:42.652535 IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.100.1.http > 192.168.100.2.39282: Flags [S.], cksum 0x4983 (incorrect -> 0xb312), seq 1802912422, ack 1435363386, win 65160, options [mss 1460,sackOK,TS val 1366896849 ecr 772216584,nop,wscale 6], length 0
10:32:42.653177 IP (tos 0x0, ttl 64, id 10194, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.39282 > 192.168.100.1.http: Flags [.], cksum 0xdc79 (correct), ack 1, win 1004, options [nop,nop,TS val 772216585 ecr 1366896849], length 0
10:32:42.653528 IP (tos 0x0, ttl 64, id 10195, offset 0, flags [DF], proto TCP (6), length 329)
    192.168.100.2.39282 > 192.168.100.1.http: Flags [P.], cksum 0xc2bf (correct), seq 1:278, ack 1, win 1004, options [nop,nop,TS val 772216585 ecr 1366896849], length 277: HTTP, length: 277
	GET /secreto HTTP/1.0
	User-Agent: w3m/0.5.3+git20190105
	Accept: text/html, text/*;q=0.5, image/*, application/*
	Accept-Encoding: gzip, compress, bzip, bzip2, deflate
	Accept-Language: en;q=1.0
	Host: www.departamentos.iesgn.org
	Authorization: Basic c2VyZ2lvOnBhc3N3ZA==
	
10:32:42.653594 IP (tos 0x0, ttl 64, id 58770, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.39282: Flags [.], cksum 0x497b (incorrect -> 0xdb59), ack 278, win 1014, options [nop,nop,TS val 1366896850 ecr 772216585], length 0
10:32:42.655595 IP (tos 0x0, ttl 64, id 58771, offset 0, flags [DF], proto TCP (6), length 639)
    192.168.100.1.http > 192.168.100.2.39282: Flags [P.], cksum 0x4bc6 (incorrect -> 0x723a), seq 1:588, ack 278, win 1014, options [nop,nop,TS val 1366896852 ecr 772216585], length 587: HTTP, length: 587
	HTTP/1.1 301 Moved Permanently
	Date: Sat, 31 Oct 2020 10:32:42 GMT
	Server: Apache/2.4.38 (Debian)
	Location: http://www.departamentos.iesgn.org/secreto/
	Content-Length: 344
	Connection: close
	Content-Type: text/html; charset=iso-8859-1
	
	<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
	<html><head>
	<title>301 Moved Permanently</title>
	</head><body>
	<h1>Moved Permanently</h1>
	<p>The document has moved <a href="http://www.departamentos.iesgn.org/secreto/">here</a>.</p>
	<hr>
	<address>Apache/2.4.38 (Debian) Server at www.departamentos.iesgn.org Port 80</address>
	</body></html>
10:32:42.655836 IP (tos 0x0, ttl 64, id 58772, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.39282: Flags [F.], cksum 0x497b (incorrect -> 0xd90b), seq 588, ack 278, win 1014, options [nop,nop,TS val 1366896852 ecr 772216585], length 0
10:32:42.655970 IP (tos 0x0, ttl 64, id 10196, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.39282 > 192.168.100.1.http: Flags [.], cksum 0xd915 (correct), ack 588, win 1002, options [nop,nop,TS val 772216588 ecr 1366896852], length 0
10:32:42.656539 IP (tos 0x0, ttl 64, id 10197, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.39282 > 192.168.100.1.http: Flags [F.], cksum 0xd913 (correct), seq 278, ack 589, win 1002, options [nop,nop,TS val 772216588 ecr 1366896852], length 0
10:32:42.656653 IP (tos 0x0, ttl 64, id 58773, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.39282: Flags [.], cksum 0x497b (incorrect -> 0xd906), ack 279, win 1014, options [nop,nop,TS val 1366896853 ecr 772216588], length 0
10:32:42.657247 IP (tos 0x0, ttl 64, id 17530, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.100.2.39284 > 192.168.100.1.http: Flags [S], cksum 0x14f4 (correct), seq 3977388764, win 64240, options [mss 1460,sackOK,TS val 772216589 ecr 0,nop,wscale 6], length 0
10:32:42.657259 IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.100.1.http > 192.168.100.2.39284: Flags [S.], cksum 0x4983 (incorrect -> 0xc682), seq 2215986275, ack 3977388765, win 65160, options [mss 1460,sackOK,TS val 1366896854 ecr 772216589,nop,wscale 6], length 0
10:32:42.657506 IP (tos 0x0, ttl 64, id 17531, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.39284 > 192.168.100.1.http: Flags [.], cksum 0xefea (correct), ack 1, win 1004, options [nop,nop,TS val 772216589 ecr 1366896854], length 0
10:32:42.657524 IP (tos 0x0, ttl 64, id 17532, offset 0, flags [DF], proto TCP (6), length 330)
    192.168.100.2.39284 > 192.168.100.1.http: Flags [P.], cksum 0x1cba (correct), seq 1:279, ack 1, win 1004, options [nop,nop,TS val 772216589 ecr 1366896854], length 278: HTTP, length: 278
	GET /secreto/ HTTP/1.0
	User-Agent: w3m/0.5.3+git20190105
	Accept: text/html, text/*;q=0.5, image/*, application/*
	Accept-Encoding: gzip, compress, bzip, bzip2, deflate
	Accept-Language: en;q=1.0
	Host: www.departamentos.iesgn.org
	Authorization: Basic c2VyZ2lvOnBhc3N3ZA==
	
10:32:42.657537 IP (tos 0x0, ttl 64, id 28220, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.39284: Flags [.], cksum 0x497b (incorrect -> 0xeeca), ack 279, win 1014, options [nop,nop,TS val 1366896854 ecr 772216589], length 0
10:32:42.657983 IP (tos 0x0, ttl 64, id 28221, offset 0, flags [DF], proto TCP (6), length 296)
    192.168.100.1.http > 192.168.100.2.39284: Flags [P.], cksum 0x4a6f (incorrect -> 0xdbf1), seq 1:245, ack 279, win 1014, options [nop,nop,TS val 1366896854 ecr 772216589], length 244: HTTP, length: 244
	HTTP/1.1 200 OK
	Date: Sat, 31 Oct 2020 10:32:42 GMT
	Server: Apache/2.4.38 (Debian)
	Last-Modified: Sat, 31 Oct 2020 09:38:47 GMT
	ETag: "0-5b2f447a9b98e"
	Accept-Ranges: bytes
	Content-Length: 0
	Connection: close
	Content-Type: text/html
	
10:32:42.658063 IP (tos 0x0, ttl 64, id 28222, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.39284: Flags [F.], cksum 0x497b (incorrect -> 0xedd4), seq 245, ack 279, win 1014, options [nop,nop,TS val 1366896855 ecr 772216589], length 0
10:32:42.658124 IP (tos 0x0, ttl 64, id 17533, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.39284 > 192.168.100.1.http: Flags [.], cksum 0xede1 (correct), ack 245, win 1002, options [nop,nop,TS val 772216590 ecr 1366896854], length 0
10:32:42.658427 IP (tos 0x0, ttl 64, id 17534, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.39284 > 192.168.100.1.http: Flags [F.], cksum 0xedde (correct), seq 279, ack 246, win 1002, options [nop,nop,TS val 772216590 ecr 1366896855], length 0
10:32:42.658448 IP (tos 0x0, ttl 64, id 28223, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.39284: Flags [.], cksum 0x497b (incorrect -> 0xedd2), ack 280, win 1014, options [nop,nop,TS val 1366896855 ecr 772216590], length 0
~~~

Explicación del ejercicio:

Cuando desde el cliente intentamos acceder a la pagina del servidor que necesita autorización, el servidor manda una respuesta del tipo 401 HTTP/1.1 401 Authorization Required con una cabecera WWW-Authenticate al cliente y el navegador del cliente muestra una ventana emergente preguntando por el nombre de usuario y contraseña y cuando se rellena se manda una petición con una cabecera Authorization.

Esta contraseña al mandarse en base 64, es muy facil de decodificar por lo que este método es muy poco seguro.

* Tarea3: Cómo hemos visto la autentificación básica no es segura, modifica la autentificación para que sea del tipo digest, y sólo sea accesible a los usuarios pertenecientes al grupo directivos. Comprueba las cabeceras de los mensajes HTTP que se intercambian entre el servidor y el cliente. ¿Cómo funciona esta autentificación?

Activamos el modulo digest y reiniciamos apache

~~~
vagrant@server:/etc/apache2$ sudo a2enmod auth_digest
Considering dependency authn_core for auth_digest:
Module authn_core already enabled
Enabling module auth_digest.
To activate the new configuration, you need to run:
  systemctl restart apache2
~~~

Cambiamos el tipo de autentificación en departamentos.conf

~~~
<Directory /srv/www/departamentos/secreto/>
                AuthUserFile /etc/apache2/claves/passwdigest.txt
                AuthName "password"
                AuthType Digest
                Require valid-user
</Directory>
~~~

Se añade el usuario y la contraseña

~~~
vagrant@server:/etc/apache2$ sudo htdigest -c /etc/apache2/claves/passwdigest passwd sergio
Adding password for sergio in realm passwd.
New password: 
Re-type new password: 
~~~

Creación del grupo

Para ello habilitamos el modulo authz_groupfile y una vez instalado, reiniciamos el servicio apache y creamos un fichero con los grupos y usuarios que podrán acceder en el directorio claves:

~~~
vagrant@server:/etc/apache2/claves$ sudo a2enmod authz_groupfile 
Considering dependency authz_core for authz_groupfile:
Module authz_core already enabled
Enabling module authz_groupfile.
To activate the new configuration, you need to run:
  systemctl restart apache2
~~~

Contenido de fichero group:

~~~
directivos: sergio 
~~~

Y configuramos el fichero departamentos.conf añadiendo la linea require group de forma que en lugar de validar un usuario, se valide un grupo.

~~~
<Directory /srv/www/departamentos/secreto/>
                AuthUserFile /etc/apache2/claves/passwdigest.txt
                AuthGroupFile /etc/apache2/claves/grupos.txt
                AuthName "password"
                AuthType Digest
                Require group directivos
</Directory>
~~~

Cabeceras Http:

~~~
vagrant@server:/srv/www/departamentos$ sudo tcpdump -vi eth2
tcpdump: listening on eth2, link-type EN10MB (Ethernet), capture size 262144 bytes
16:49:37.157798 IP (tos 0x0, ttl 64, id 58074, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.100.2.37394 > 192.168.100.1.http: Flags [S], cksum 0x167e (correct), seq 680969265, win 64240, options [mss 1460,sackOK,TS val 1980495879 ecr 0,nop,wscale 6], length 0
16:49:37.157871 IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.100.1.http > 192.168.100.2.37394: Flags [S.], cksum 0x4983 (incorrect -> 0x61a1), seq 2286756866, ack 680969266, win 65160, options [mss 1460,sackOK,TS val 2584308442 ecr 1980495879,nop,wscale 6], length 0
16:49:37.159568 IP (tos 0x0, ttl 64, id 58075, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.37394 > 192.168.100.1.http: Flags [.], cksum 0x8b08 (correct), ack 1, win 1004, options [nop,nop,TS val 1980495880 ecr 2584308442], length 0
16:49:37.160214 IP (tos 0x0, ttl 64, id 58076, offset 0, flags [DF], proto TCP (6), length 286)
    192.168.100.2.37394 > 192.168.100.1.http: Flags [P.], cksum 0x5be4 (correct), seq 1:235, ack 1, win 1004, options [nop,nop,TS val 1980495882 ecr 2584308442], length 234: HTTP, length: 234
	GET /secreto HTTP/1.0
	User-Agent: w3m/0.5.3+git20190105
	Accept: text/html, text/*;q=0.5, image/*, application/*
	Accept-Encoding: gzip, compress, bzip, bzip2, deflate
	Accept-Language: en;q=1.0
	Host: www.departamentos.iesgn.org
	
16:49:37.160262 IP (tos 0x0, ttl 64, id 24103, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.37394: Flags [.], cksum 0x497b (incorrect -> 0x8a0e), ack 235, win 1015, options [nop,nop,TS val 2584308445 ecr 1980495882], length 0
16:49:37.161173 IP (tos 0x0, ttl 64, id 24104, offset 0, flags [DF], proto TCP (6), length 841)
    192.168.100.1.http > 192.168.100.2.37394: Flags [P.], cksum 0x4c90 (incorrect -> 0xcf5e), seq 1:790, ack 235, win 1015, options [nop,nop,TS val 2584308446 ecr 1980495882], length 789: HTTP, length: 789
	HTTP/1.1 401 Unauthorized
	Date: Mon, 02 Nov 2020 16:49:37 GMT
	Server: Apache/2.4.38 (Debian)
	WWW-Authenticate: Digest realm="password", nonce="/h4ZiCKzBQA=74ac3d5cfcc6e98652142b3bcc88d18843cf66d4", algorithm=MD5, qop="auth"
	Content-Length: 474
	Connection: close
	Content-Type: text/html; charset=iso-8859-1
	
	<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
	<html><head>
	<title>401 Unauthorized</title>
	</head><body>
	<h1>Unauthorized</h1>
	<p>This server could not verify that you
	are authorized to access the document
	requested.  Either you supplied the wrong
	credentials (e.g., bad password), or your
	browser doesn't understand how to supply
	the credentials required.</p>
	<hr>
	<address>Apache/2.4.38 (Debian) Server at www.departamentos.iesgn.org Port 80</address>
	</body></html>
16:49:37.161383 IP (tos 0x0, ttl 64, id 24105, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.37394: Flags [F.], cksum 0x497b (incorrect -> 0x86f7), seq 790, ack 235, win 1015, options [nop,nop,TS val 2584308446 ecr 1980495882], length 0
16:49:37.210384 IP (tos 0x0, ttl 64, id 58078, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.37394 > 192.168.100.1.http: Flags [.], cksum 0x86d2 (correct), ack 791, win 1002, options [nop,nop,TS val 1980495932 ecr 2584308446], length 0
16:49:42.378189 ARP, Ethernet (len 6), IPv4 (len 4), Request who-has 192.168.100.1 tell 192.168.100.2, length 46
16:49:42.378226 ARP, Ethernet (len 6), IPv4 (len 4), Reply 192.168.100.1 is-at 08:00:27:23:e5:a4 (oui Unknown), length 28
16:49:42.378743 ARP, Ethernet (len 6), IPv4 (len 4), Request who-has 192.168.100.2 tell 192.168.100.1, length 28
16:49:42.379214 ARP, Ethernet (len 6), IPv4 (len 4), Reply 192.168.100.2 is-at 08:00:27:c3:6c:a0 (oui Unknown), length 46
16:49:46.004749 IP (tos 0x0, ttl 64, id 58079, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.37394 > 192.168.100.1.http: Flags [F.], cksum 0x6477 (correct), seq 235, ack 791, win 1002, options [nop,nop,TS val 1980504726 ecr 2584308446], length 0
16:49:46.004838 IP (tos 0x0, ttl 64, id 24106, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.37394: Flags [.], cksum 0x497b (incorrect -> 0x41df), ack 236, win 1015, options [nop,nop,TS val 2584317289 ecr 1980504726], length 0
16:49:46.005002 IP (tos 0x0, ttl 64, id 59506, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.100.2.37396 > 192.168.100.1.http: Flags [S], cksum 0x1d14 (correct), seq 2539531329, win 64240, options [mss 1460,sackOK,TS val 1980504727 ecr 0,nop,wscale 6], length 0
16:49:46.005109 IP (tos 0x0, ttl 64, id 0, offset 0, flags [DF], proto TCP (6), length 60)
    192.168.100.1.http > 192.168.100.2.37396: Flags [S.], cksum 0x4983 (incorrect -> 0x5af5), seq 3389181183, ack 2539531330, win 65160, options [mss 1460,sackOK,TS val 2584317289 ecr 1980504727,nop,wscale 6], length 0
16:49:46.005530 IP (tos 0x0, ttl 64, id 59507, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.37396 > 192.168.100.1.http: Flags [.], cksum 0x845d (correct), ack 1, win 1004, options [nop,nop,TS val 1980504727 ecr 2584317289], length 0
16:49:46.005638 IP (tos 0x0, ttl 64, id 59508, offset 0, flags [DF], proto TCP (6), length 549)
    192.168.100.2.37396 > 192.168.100.1.http: Flags [P.], cksum 0x93dd (correct), seq 1:498, ack 1, win 1004, options [nop,nop,TS val 1980504727 ecr 2584317289], length 497: HTTP, length: 497
	GET /secreto HTTP/1.0
	User-Agent: w3m/0.5.3+git20190105
	Accept: text/html, text/*;q=0.5, image/*, application/*
	Accept-Encoding: gzip, compress, bzip, bzip2, deflate
	Accept-Language: en;q=1.0
	Host: www.departamentos.iesgn.org
	Authorization: Digest username="sergio", realm="password", nonce="/h4ZiCKzBQA=74ac3d5cfcc6e98652142b3bcc88d18843cf66d4", uri="/secreto", response="093386273ee965f9c0314ff4355476da", algorithm=MD5, cnonce="d8f54c9aa44e17187a8343c5473fdf75", qop=auth, nc=00000001
	
16:49:46.005670 IP (tos 0x0, ttl 64, id 36050, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.37396: Flags [.], cksum 0x497b (incorrect -> 0x8264), ack 498, win 1011, options [nop,nop,TS val 2584317290 ecr 1980504727], length 0
16:49:46.006293 IP (tos 0x0, ttl 64, id 36051, offset 0, flags [DF], proto TCP (6), length 869)
    192.168.100.1.http > 192.168.100.2.37396: Flags [P.], cksum 0x4cac (incorrect -> 0x99ed), seq 1:818, ack 498, win 1011, options [nop,nop,TS val 2584317291 ecr 1980504727], length 817: HTTP, length: 817
	HTTP/1.1 500 Internal Server Error
	Date: Mon, 02 Nov 2020 16:49:46 GMT
	Server: Apache/2.4.38 (Debian)
	Content-Length: 625
	Connection: close
	Content-Type: text/html; charset=iso-8859-1
	
	<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
	<html><head>
	<title>500 Internal Server Error</title>
	</head><body>
	<h1>Internal Server Error</h1>
	<p>The server encountered an internal error or
	misconfiguration and was unable to complete
	your request.</p>
	<p>Please contact the server administrator at 
	 webmaster@localhost to inform them of the time this error occurred,
	 and the actions you performed just before this error.</p>
	<p>More information about this error may be available
	in the server error log.</p>
	<hr>
	<address>Apache/2.4.38 (Debian) Server at www.departamentos.iesgn.org Port 80</address>
	</body></html>
16:49:46.006405 IP (tos 0x0, ttl 64, id 36052, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.37396: Flags [F.], cksum 0x497b (incorrect -> 0x7f31), seq 818, ack 498, win 1011, options [nop,nop,TS val 2584317291 ecr 1980504727], length 0
16:49:46.006466 IP (tos 0x0, ttl 64, id 59509, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.37396 > 192.168.100.1.http: Flags [.], cksum 0x7f3a (correct), ack 818, win 1002, options [nop,nop,TS val 1980504728 ecr 2584317291], length 0
16:49:46.007359 IP (tos 0x0, ttl 64, id 59510, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.2.37396 > 192.168.100.1.http: Flags [F.], cksum 0x7f37 (correct), seq 498, ack 819, win 1002, options [nop,nop,TS val 1980504729 ecr 2584317291], length 0
16:49:46.007408 IP (tos 0x0, ttl 64, id 36053, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.100.1.http > 192.168.100.2.37396: Flags [.], cksum 0x497b (incorrect -> 0x7f2d), ack 499, win 1011, options [nop,nop,TS val 2584317292 ecr 1980504729], length 0
~~~

Explicación breve de la autorización:

En este caso al igual que en anterior el servidor manda una respuesta del tipo 401 HTTP/1.1 401 Authorization Required con una cabecera WWW-Authenticate (aunque de forma distinta) al cliente y el navegador del cliente muestra una ventana emergente preguntando por el nombre de usuario y contraseña y cuando se rellena se manda una petición con una cabecera Authorization, sin embargo con el método digest esta clave ya no se manda en base 64 que es fácilmente descifrable, sino en md5. 

Por medio de md5 se calcula el H1 (se calcula el md5 del nombre de usuario, del dominio (realm) y la contraseña), el H2 (se calcula el md5 del método de la petición (por ejemplo GET) y de la uri a la que estamos accediendo). El resultado que se manda es el md5 de HA1, un número aleatorio (nonce), el contador de peticiones (nc), el qop y el HA2. Este resultado se manda al servidor para que este haga los mismos cálculos para comprobar la validez de los datos y permitir así, o no el acceso.

h3. *Tarea4: Vamos a combinar el control de acceso (ejercicio 1) y la autentificación (Ejercicios 2 y 3), y vamos a configurar el virtual host para que se comporte de la siguiente manera: el acceso a la URL departamentos.iesgn.org/secreto se hace forma directa desde la intranet, desde la red pública te pide la autentificación. Muestra el resultado al profesor.*

Configuración departamentos.conf:

~~~
<VirtualHost *:80>
        ServerAdmin webmaster@localhost
        DocumentRoot /srv/www/departamentos
        ServerName www.departamentos.iesgn.org

        <Directory /srv/www/departamentos/intranet/>
                Options Indexes FollowSymLinks
                Require ip 192.168.100
        </Directory>
        <Directory /srv/www/departamentos/internet/>
                Options Indexes FollowSymLinks
                <RequireAll>
                        Require all granted
                        Require not ip 192.168.100
                </RequireAll>
        </Directory>

        <Directory /srv/www/departamentos/secreto/>
                AuthUserFile /etc/apache2/claves/passwdigest.txt
                AuthName "password"
                AuthType Digest
                Require valid-user
                <RequireAll>
                        Require all granted
                        Require ip 192.168.100
                </RequireAll>
        </Directory>
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
~~~

* Funcionamiento desde la red interna:

~~~
Bienvenido directivo
~~~

* Funcionamiento desde fuera de la red:

![autentificcion](/images/control-accesos/secreto2.png)