---
title: "Aplicaciones web PHP en Docker"
date: 2021-03-14T13:26:35+01:00
categories: [Aplicaciones web]
---
### Introduccion ###

En esta practica haciendo uso de docker, vamos a desplegar distintas aplicaciones en contenedores, en los primeros ejercicios se trabajara con bookmedik (aplicacion para organizar citas medicas) y en las dos ultimas se usara drupal y joomla.

La forma de trabajar sera la siguiente, en nuestro equipo tendremos un directorio con todo lo necesario para los distintos ejercicios y dentro de este directorio habra otros dos (en los casos que sea necesario), tendremos un directorio buil donde tendremos tanto el directorio de la aplicacion con los ficheros necesarios para su ejecucion, un dockerfile que usaremos para crear los contenedores y un fichero script ue modificara y añadira los datos necesario en los contenedores.

Aparte tendremos un fichero deploy en el que lo unico que tendremos sera un fichero docker-compose.

Para los ejercicios usaremos dos contenedores, uno donde se alojara la plaicacion que vamos a usar y otro que alojara la base de datos que usara la aplicacion.

La estructura de ficheros quedara de la siguiente forma:

~~~
├── Tareax
│   ├── build
│   │   ├── bookmedik
│   │   ├── dockerfile
│   │   └── script.sh
│   ├── deploy
│   │   └── docker-compose.yaml
~~~

### Tarea 1: Ejecución de la aplicación web en docker ###

* Queremos ejecutar en un contenedor docker la aplicación web escrita en PHP: bookMedik (https://github.com/evilnapsis/bookmedik).

~~~
git clone https://github.com/evilnapsis/bookmedik
~~~

* Es necesario tener un contenedor con mariadb donde vamos a crear la base de datos y los datos de la aplicación. El script para generar la base de datos y los registros lo encuentras en el repositorio y se llama schema.sql. Debes crear un usuario con su contraseña en la base de datos. La base de datos se llama bookmedik y se crea al ejecutar el script
      
* Ejecuta el contenedor mariadb y carga los datos del script schema.sql. Para más información.
Para que funcione la carga de datos tendremos que eliminar o comentar la linea create database bookmedik, de lo contrario ono podremos cargar los datos ya que ya hay una tabla bookmedik creada.
      
* El contenedor mariadb debe tener un volumen para guardar la base de datos.
      
* El contenedor que creas debe tener un volumen para guardar los logs de apache2.
      
* Crea una imagen docker con la aplicación desde una imagen base de debian o ubuntu. Ten en cuenta que el fichero de configuración de la base de datos (core\controller\Database.php) lo tienes que configurar utilizando las variables de entorno del contenedor mariadb. (Nota: Para obtener las variables de entorno en PHP usar la función getenv. Para más infomación).
      
* La imagen la tienes que crear en tu máquina con el comando docker build.
      
* Crea un script con docker compose que levante el escenario con los dos contenedores.(Usuario: admin, contraseña: admin).

Enpezamos la tarea creando y configurando nuestro dockerfile de la siguiente forma:

~~~
FROM debian
RUN apt-get update && apt-get install -y apache2 libapache2-mod-php7.3 php7.3 php7.3-mysql && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN rm /var/www/html/index.html

ENV MARIADB_USER admin
ENV MARIADB_PASS admin
ENV MARIADB_HOST servidor_mysql
ENV DB_NAME bookmedik

EXPOSE 80

COPY bookmedik/ /var/www/html

ADD script.sh /usr/local/bin/script.sh

RUN chmod +x /usr/local/bin/script.sh

CMD ["script.sh"]
~~~

Con esto lo que hacemos basicamente es configurar los contenedores con un sistema debian indicando que se realicen tanto un update como la instalacion de varios paquetes para que la aplicacion funcione correctamente.

Indicamos tambien las variables de nuestra base de datos con el atributo "ENV". Por otro lado, con "copy" copiamos el directorio bokkmedik en build al /var/www/html del contenedor (en lugar de copy tambien se podria usar workdir).

Por ultimo añadimos en el contenedor nuestro fichero script.sh que tendremos en el build y le damos permisos al contenedor para que se ejecute. Con la orden cmd nuestro script sera lo primero que se ejecute al arrancar el contenedor.

Pasemos ahora a la configuracion del fichero script.sh:

~~~
#!/bin/bash

sed -i "s/$this->user=\"root\";/$this->user=\"$MARIADB_USER\";/g" /var/www/html/core/controller/Database.php
sed -i "s/$this->pass=\"\";/$this->pass=\"$MARIADB_PASS\";/g" /var/www/html/core/controller/Database.php
sed -i "s/$this->host=\"localhost\";/$this->host=\"$MARIADB_HOST\";/g" /var/www/html/core/controller/Database.php
sed -i "s/$this->ddbb=\"bookmedik\";/$this->ddbb=\"$DB_NAME\";/g" /var/www/html/core/controller/Database.php

apache2ctl -D FOREGROUND
~~~

¿Que hace esto? pues esto lo que hace es coger los datos de las variables indicadas con "$" en este caso las variables indicadas en dokerfile (usuario, contraseña, contenedor y nombre de la base de datos).

### Creacion de la imagen ###

~~~
sergioib@debian-sergio:~/bookmedik/build$ docker build -t sergioib94/bookmedik:v1 .
Sending build context to Docker daemon  3.667MB
Step 1/12 : FROM debian
 ---> 5890f8ba95f6
Step 2/12 : RUN apt-get update && apt-get install -y apache2 libapache2-mod-php7.3 php7.3 php7.3-mysql && apt-get clean && rm -rf /var/lib/apt/lists/*
 ---> Running in 80716c56547d
Get:1 http://deb.debian.org/debian buster InRelease [122 kB]
Get:2 http://security.debian.org/debian-security buster/updates InRelease [65.4 kB]
Get:3 http://deb.debian.org/debian buster-updates InRelease [51.9 kB]
Get:4 http://deb.debian.org/debian buster/main amd64 Packages [7907 kB]
Get:5 http://security.debian.org/debian-security buster/updates/main amd64 Packages [267 kB]
Get:6 http://deb.debian.org/debian buster-updates/main amd64 Packages [9504 B]
Fetched 8422 kB in 2s (3712 kB/s)
Reading package lists...
Reading package lists...
Building dependency tree...
Reading state information...
The following additional packages will be installed:
  apache2-bin apache2-data apache2-utils bzip2 ca-certificates file
  krb5-locales libapr1 libaprutil1 libaprutil1-dbd-sqlite3 libaprutil1-ldap
  libargon2-1 libbrotli1 libbsd0 libcurl4 libedit2 libexpat1 libgdbm-compat4
  libgdbm6 libgpm2 libgssapi-krb5-2 libicu63 libjansson4 libk5crypto3
  libkeyutils1 libkrb5-3 libkrb5support0 libldap-2.4-2 libldap-common
  liblua5.2-0 libmagic-mgc libmagic1 libncurses6 libnghttp2-14 libpcre2-8-0
  libperl5.28 libprocps7 libpsl5 librtmp1 libsasl2-2 libsasl2-modules
  libsasl2-modules-db libsodium23 libsqlite3-0 libssh2-1 libssl1.1 libxml2
  lsb-base mime-support netbase openssl perl perl-modules-5.28 php-common
  php7.3-cli php7.3-common php7.3-json php7.3-opcache php7.3-readline procps
  psmisc publicsuffix sensible-utils ssl-cert ucf xz-utils
Suggested packages:
  apache2-doc apache2-suexec-pristine | apache2-suexec-custom www-browser
  bzip2-doc php-pear gdbm-l10n gpm krb5-doc krb5-user
  libsasl2-modules-gssapi-mit | libsasl2-modules-gssapi-heimdal
  libsasl2-modules-ldap libsasl2-modules-otp libsasl2-modules-sql perl-doc
  libterm-readline-gnu-perl | libterm-readline-perl-perl make libb-debug-perl
  liblocale-codes-perl openssl-blacklist
The following NEW packages will be installed:
  apache2 apache2-bin apache2-data apache2-utils bzip2 ca-certificates file
  krb5-locales libapache2-mod-php7.3 libapr1 libaprutil1
  libaprutil1-dbd-sqlite3 libaprutil1-ldap libargon2-1 libbrotli1 libbsd0
  libcurl4 libedit2 libexpat1 libgdbm-compat4 libgdbm6 libgpm2
  libgssapi-krb5-2 libicu63 libjansson4 libk5crypto3 libkeyutils1 libkrb5-3
  libkrb5support0 libldap-2.4-2 libldap-common liblua5.2-0 libmagic-mgc
  libmagic1 libncurses6 libnghttp2-14 libpcre2-8-0 libperl5.28 libprocps7
  libpsl5 librtmp1 libsasl2-2 libsasl2-modules libsasl2-modules-db libsodium23
  libsqlite3-0 libssh2-1 libssl1.1 libxml2 lsb-base mime-support netbase
  openssl perl perl-modules-5.28 php-common php7.3 php7.3-cli php7.3-common
  php7.3-json php7.3-mysql php7.3-opcache php7.3-readline procps psmisc
  publicsuffix sensible-utils ssl-cert ucf xz-utils
0 upgraded, 70 newly installed, 0 to remove and 1 not upgraded.
Need to get 30.3 MB of archives.
After this operation, 132 MB of additional disk space will be used.
Get:1 http://deb.debian.org/debian buster/main amd64 perl-modules-5.28 all 5.28.1-6+deb10u1 [2873 kB]
Get:2 http://security.debian.org/debian-security buster/updates/main amd64 libssl1.1 amd64 1.1.1d-0+deb10u5 [1539 kB]
Get:3 http://security.debian.org/debian-security buster/updates/main amd64 libldap-common all 2.4.47+dfsg-3+deb10u6 [90.0 kB]
Get:4 http://security.debian.org/debian-security buster/updates/main amd64 libldap-2.4-2 amd64 2.4.47+dfsg-3+deb10u6 [224 kB]
Get:5 http://security.debian.org/debian-security buster/updates/main amd64 openssl amd64 1.1.1d-0+deb10u5 [844 kB]
Get:6 http://security.debian.org/debian-security buster/updates/main amd64 php7.3-common amd64 7.3.27-1~deb10u1 [960 kB]
Get:7 http://security.debian.org/debian-security buster/updates/main amd64 php7.3-json amd64 7.3.27-1~deb10u1 [18.6 kB]
Get:8 http://security.debian.org/debian-security buster/updates/main amd64 php7.3-opcache amd64 7.3.27-1~deb10u1 [184 kB]
Get:9 http://security.debian.org/debian-security buster/updates/main amd64 php7.3-readline amd64 7.3.27-1~deb10u1 [12.0 kB]
Get:10 http://security.debian.org/debian-security buster/updates/main amd64 php7.3-cli amd64 7.3.27-1~deb10u1 [1414 kB]
Get:11 http://deb.debian.org/debian buster/main amd64 libgdbm6 amd64 1.18.1-4 [64.7 kB]
Get:12 http://deb.debian.org/debian buster/main amd64 libgdbm-compat4 amd64 1.18.1-4 [44.1 kB]
Get:13 http://deb.debian.org/debian buster/main amd64 libperl5.28 amd64 5.28.1-6+deb10u1 [3894 kB]
Get:14 http://security.debian.org/debian-security buster/updates/main amd64 libapache2-mod-php7.3 amd64 7.3.27-1~deb10u1 [1362 kB]
Get:15 http://security.debian.org/debian-security buster/updates/main amd64 php7.3 all 7.3.27-1~deb10u1 [46.8 kB]
Get:16 http://security.debian.org/debian-security buster/updates/main amd64 php7.3-mysql amd64 7.3.27-1~deb10u1 [119 kB]
Get:17 http://deb.debian.org/debian buster/main amd64 perl amd64 5.28.1-6+deb10u1 [204 kB]
Get:18 http://deb.debian.org/debian buster/main amd64 libapr1 amd64 1.6.5-1+b1 [102 kB]
Get:19 http://deb.debian.org/debian buster/main amd64 libexpat1 amd64 2.2.6-2+deb10u1 [106 kB]
Get:20 http://deb.debian.org/debian buster/main amd64 libaprutil1 amd64 1.6.1-4 [91.8 kB]
Get:21 http://deb.debian.org/debian buster/main amd64 libsqlite3-0 amd64 3.27.2-3+deb10u1 [641 kB]
Get:22 http://deb.debian.org/debian buster/main amd64 libaprutil1-dbd-sqlite3 amd64 1.6.1-4 [18.7 kB]
Get:23 http://deb.debian.org/debian buster/main amd64 libsasl2-modules-db amd64 2.1.27+dfsg-1+deb10u1 [69.1 kB]
Get:24 http://deb.debian.org/debian buster/main amd64 libsasl2-2 amd64 2.1.27+dfsg-1+deb10u1 [106 kB]
Get:25 http://deb.debian.org/debian buster/main amd64 libaprutil1-ldap amd64 1.6.1-4 [16.8 kB]
Get:26 http://deb.debian.org/debian buster/main amd64 libbrotli1 amd64 1.0.7-2+deb10u1 [269 kB]
Get:27 http://deb.debian.org/debian buster/main amd64 libkeyutils1 amd64 1.6-6 [15.0 kB]
Get:28 http://deb.debian.org/debian buster/main amd64 libkrb5support0 amd64 1.17-3+deb10u1 [65.8 kB]
Get:29 http://deb.debian.org/debian buster/main amd64 libk5crypto3 amd64 1.17-3+deb10u1 [122 kB]
Get:30 http://deb.debian.org/debian buster/main amd64 libkrb5-3 amd64 1.17-3+deb10u1 [369 kB]
Get:31 http://deb.debian.org/debian buster/main amd64 libgssapi-krb5-2 amd64 1.17-3+deb10u1 [158 kB]
Get:32 http://deb.debian.org/debian buster/main amd64 libnghttp2-14 amd64 1.36.0-2+deb10u1 [85.0 kB]
Get:33 http://deb.debian.org/debian buster/main amd64 libpsl5 amd64 0.20.2-2 [53.7 kB]
Get:34 http://deb.debian.org/debian buster/main amd64 librtmp1 amd64 2.4+20151223.gitfa8646d.1-2 [60.5 kB]
Get:35 http://deb.debian.org/debian buster/main amd64 libssh2-1 amd64 1.8.0-2.1 [140 kB]
Get:36 http://deb.debian.org/debian buster/main amd64 libcurl4 amd64 7.64.0-4+deb10u1 [331 kB]
Get:37 http://deb.debian.org/debian buster/main amd64 libjansson4 amd64 2.12-1 [38.0 kB]
Get:38 http://deb.debian.org/debian buster/main amd64 liblua5.2-0 amd64 5.2.4-1.1+b2 [110 kB]
Get:39 http://deb.debian.org/debian buster/main amd64 libicu63 amd64 63.1-6+deb10u1 [8300 kB]
Get:40 http://deb.debian.org/debian buster/main amd64 libxml2 amd64 2.9.4+dfsg1-7+deb10u1 [689 kB]
Get:41 http://deb.debian.org/debian buster/main amd64 apache2-bin amd64 2.4.38-3+deb10u4 [1307 kB]
Get:42 http://deb.debian.org/debian buster/main amd64 apache2-data all 2.4.38-3+deb10u4 [165 kB]
Get:43 http://deb.debian.org/debian buster/main amd64 apache2-utils amd64 2.4.38-3+deb10u4 [237 kB]
Get:44 http://deb.debian.org/debian buster/main amd64 lsb-base all 10.2019051400 [28.4 kB]
Get:45 http://deb.debian.org/debian buster/main amd64 mime-support all 3.62 [37.2 kB]
Get:46 http://deb.debian.org/debian buster/main amd64 libncurses6 amd64 6.1+20181013-2+deb10u2 [102 kB]
Get:47 http://deb.debian.org/debian buster/main amd64 libprocps7 amd64 2:3.3.15-2 [61.7 kB]
Get:48 http://deb.debian.org/debian buster/main amd64 procps amd64 2:3.3.15-2 [259 kB]
Get:49 http://deb.debian.org/debian buster/main amd64 apache2 amd64 2.4.38-3+deb10u4 [251 kB]
Get:50 http://deb.debian.org/debian buster/main amd64 netbase all 5.6 [19.4 kB]
Get:51 http://deb.debian.org/debian buster/main amd64 sensible-utils all 0.0.12 [15.8 kB]
Get:52 http://deb.debian.org/debian buster/main amd64 bzip2 amd64 1.0.6-9.2~deb10u1 [48.4 kB]
Get:53 http://deb.debian.org/debian buster/main amd64 libmagic-mgc amd64 1:5.35-4+deb10u2 [242 kB]
Get:54 http://deb.debian.org/debian buster/main amd64 libmagic1 amd64 1:5.35-4+deb10u2 [118 kB]
Get:55 http://deb.debian.org/debian buster/main amd64 file amd64 1:5.35-4+deb10u2 [66.4 kB]
Get:56 http://deb.debian.org/debian buster/main amd64 krb5-locales all 1.17-3+deb10u1 [95.4 kB]
Get:57 http://deb.debian.org/debian buster/main amd64 ucf all 3.0038+nmu1 [69.0 kB]
Get:58 http://deb.debian.org/debian buster/main amd64 xz-utils amd64 5.2.4-1 [183 kB]
Get:59 http://deb.debian.org/debian buster/main amd64 ca-certificates all 20200601~deb10u2 [166 kB]
Get:60 http://deb.debian.org/debian buster/main amd64 libbsd0 amd64 0.9.1-2 [99.5 kB]
Get:61 http://deb.debian.org/debian buster/main amd64 libedit2 amd64 3.1-20181209-1 [94.0 kB]
Get:62 http://deb.debian.org/debian buster/main amd64 psmisc amd64 23.2-1 [126 kB]
Get:63 http://deb.debian.org/debian buster/main amd64 php-common all 2:69 [15.0 kB]
Get:64 http://deb.debian.org/debian buster/main amd64 libargon2-1 amd64 0~20171227-0.2 [19.6 kB]
Get:65 http://deb.debian.org/debian buster/main amd64 libpcre2-8-0 amd64 10.32-5 [213 kB]
Get:66 http://deb.debian.org/debian buster/main amd64 libsodium23 amd64 1.0.17-1 [158 kB]
Get:67 http://deb.debian.org/debian buster/main amd64 libgpm2 amd64 1.20.7-5 [35.1 kB]
Get:68 http://deb.debian.org/debian buster/main amd64 libsasl2-modules amd64 2.1.27+dfsg-1+deb10u1 [104 kB]
Get:69 http://deb.debian.org/debian buster/main amd64 publicsuffix all 20190415.1030-1 [116 kB]
Get:70 http://deb.debian.org/debian buster/main amd64 ssl-cert all 1.0.39 [20.8 kB]
debconf: delaying package configuration, since apt-utils is not installed
Fetched 30.3 MB in 3s (11.6 MB/s)
Selecting previously unselected package perl-modules-5.28.
(Reading database ... 6677 files and directories currently installed.)
Preparing to unpack .../00-perl-modules-5.28_5.28.1-6+deb10u1_all.deb ...
Unpacking perl-modules-5.28 (5.28.1-6+deb10u1) ...
Selecting previously unselected package libgdbm6:amd64.
Preparing to unpack .../01-libgdbm6_1.18.1-4_amd64.deb ...
Unpacking libgdbm6:amd64 (1.18.1-4) ...
Selecting previously unselected package libgdbm-compat4:amd64.
Preparing to unpack .../02-libgdbm-compat4_1.18.1-4_amd64.deb ...
Unpacking libgdbm-compat4:amd64 (1.18.1-4) ...
Selecting previously unselected package libperl5.28:amd64.
Preparing to unpack .../03-libperl5.28_5.28.1-6+deb10u1_amd64.deb ...
Unpacking libperl5.28:amd64 (5.28.1-6+deb10u1) ...
Selecting previously unselected package perl.
Preparing to unpack .../04-perl_5.28.1-6+deb10u1_amd64.deb ...
Unpacking perl (5.28.1-6+deb10u1) ...
Selecting previously unselected package libapr1:amd64.
Preparing to unpack .../05-libapr1_1.6.5-1+b1_amd64.deb ...
Unpacking libapr1:amd64 (1.6.5-1+b1) ...
Selecting previously unselected package libexpat1:amd64.
Preparing to unpack .../06-libexpat1_2.2.6-2+deb10u1_amd64.deb ...
Unpacking libexpat1:amd64 (2.2.6-2+deb10u1) ...
Selecting previously unselected package libssl1.1:amd64.
Preparing to unpack .../07-libssl1.1_1.1.1d-0+deb10u5_amd64.deb ...
Unpacking libssl1.1:amd64 (1.1.1d-0+deb10u5) ...
Selecting previously unselected package libaprutil1:amd64.
Preparing to unpack .../08-libaprutil1_1.6.1-4_amd64.deb ...
Unpacking libaprutil1:amd64 (1.6.1-4) ...
Selecting previously unselected package libsqlite3-0:amd64.
Preparing to unpack .../09-libsqlite3-0_3.27.2-3+deb10u1_amd64.deb ...
Unpacking libsqlite3-0:amd64 (3.27.2-3+deb10u1) ...
Selecting previously unselected package libaprutil1-dbd-sqlite3:amd64.
Preparing to unpack .../10-libaprutil1-dbd-sqlite3_1.6.1-4_amd64.deb ...
Unpacking libaprutil1-dbd-sqlite3:amd64 (1.6.1-4) ...
Selecting previously unselected package libsasl2-modules-db:amd64.
Preparing to unpack .../11-libsasl2-modules-db_2.1.27+dfsg-1+deb10u1_amd64.deb ...
Unpacking libsasl2-modules-db:amd64 (2.1.27+dfsg-1+deb10u1) ...
Selecting previously unselected package libsasl2-2:amd64.
Preparing to unpack .../12-libsasl2-2_2.1.27+dfsg-1+deb10u1_amd64.deb ...
Unpacking libsasl2-2:amd64 (2.1.27+dfsg-1+deb10u1) ...
Selecting previously unselected package libldap-common.
Preparing to unpack .../13-libldap-common_2.4.47+dfsg-3+deb10u6_all.deb ...
Unpacking libldap-common (2.4.47+dfsg-3+deb10u6) ...
Selecting previously unselected package libldap-2.4-2:amd64.
Preparing to unpack .../14-libldap-2.4-2_2.4.47+dfsg-3+deb10u6_amd64.deb ...
Unpacking libldap-2.4-2:amd64 (2.4.47+dfsg-3+deb10u6) ...
Selecting previously unselected package libaprutil1-ldap:amd64.
Preparing to unpack .../15-libaprutil1-ldap_1.6.1-4_amd64.deb ...
Unpacking libaprutil1-ldap:amd64 (1.6.1-4) ...
Selecting previously unselected package libbrotli1:amd64.
Preparing to unpack .../16-libbrotli1_1.0.7-2+deb10u1_amd64.deb ...
Unpacking libbrotli1:amd64 (1.0.7-2+deb10u1) ...
Selecting previously unselected package libkeyutils1:amd64.
Preparing to unpack .../17-libkeyutils1_1.6-6_amd64.deb ...
Unpacking libkeyutils1:amd64 (1.6-6) ...
Selecting previously unselected package libkrb5support0:amd64.
Preparing to unpack .../18-libkrb5support0_1.17-3+deb10u1_amd64.deb ...
Unpacking libkrb5support0:amd64 (1.17-3+deb10u1) ...
Selecting previously unselected package libk5crypto3:amd64.
Preparing to unpack .../19-libk5crypto3_1.17-3+deb10u1_amd64.deb ...
Unpacking libk5crypto3:amd64 (1.17-3+deb10u1) ...
Selecting previously unselected package libkrb5-3:amd64.
Preparing to unpack .../20-libkrb5-3_1.17-3+deb10u1_amd64.deb ...
Unpacking libkrb5-3:amd64 (1.17-3+deb10u1) ...
Selecting previously unselected package libgssapi-krb5-2:amd64.
Preparing to unpack .../21-libgssapi-krb5-2_1.17-3+deb10u1_amd64.deb ...
Unpacking libgssapi-krb5-2:amd64 (1.17-3+deb10u1) ...
Selecting previously unselected package libnghttp2-14:amd64.
Preparing to unpack .../22-libnghttp2-14_1.36.0-2+deb10u1_amd64.deb ...
Unpacking libnghttp2-14:amd64 (1.36.0-2+deb10u1) ...
Selecting previously unselected package libpsl5:amd64.
Preparing to unpack .../23-libpsl5_0.20.2-2_amd64.deb ...
Unpacking libpsl5:amd64 (0.20.2-2) ...
Selecting previously unselected package librtmp1:amd64.
Preparing to unpack .../24-librtmp1_2.4+20151223.gitfa8646d.1-2_amd64.deb ...
Unpacking librtmp1:amd64 (2.4+20151223.gitfa8646d.1-2) ...
Selecting previously unselected package libssh2-1:amd64.
Preparing to unpack .../25-libssh2-1_1.8.0-2.1_amd64.deb ...
Unpacking libssh2-1:amd64 (1.8.0-2.1) ...
Selecting previously unselected package libcurl4:amd64.
Preparing to unpack .../26-libcurl4_7.64.0-4+deb10u1_amd64.deb ...
Unpacking libcurl4:amd64 (7.64.0-4+deb10u1) ...
Selecting previously unselected package libjansson4:amd64.
Preparing to unpack .../27-libjansson4_2.12-1_amd64.deb ...
Unpacking libjansson4:amd64 (2.12-1) ...
Selecting previously unselected package liblua5.2-0:amd64.
Preparing to unpack .../28-liblua5.2-0_5.2.4-1.1+b2_amd64.deb ...
Unpacking liblua5.2-0:amd64 (5.2.4-1.1+b2) ...
Selecting previously unselected package libicu63:amd64.
Preparing to unpack .../29-libicu63_63.1-6+deb10u1_amd64.deb ...
Unpacking libicu63:amd64 (63.1-6+deb10u1) ...
Selecting previously unselected package libxml2:amd64.
Preparing to unpack .../30-libxml2_2.9.4+dfsg1-7+deb10u1_amd64.deb ...
Unpacking libxml2:amd64 (2.9.4+dfsg1-7+deb10u1) ...
Selecting previously unselected package apache2-bin.
Preparing to unpack .../31-apache2-bin_2.4.38-3+deb10u4_amd64.deb ...
Unpacking apache2-bin (2.4.38-3+deb10u4) ...
Selecting previously unselected package apache2-data.
Preparing to unpack .../32-apache2-data_2.4.38-3+deb10u4_all.deb ...
Unpacking apache2-data (2.4.38-3+deb10u4) ...
Selecting previously unselected package apache2-utils.
Preparing to unpack .../33-apache2-utils_2.4.38-3+deb10u4_amd64.deb ...
Unpacking apache2-utils (2.4.38-3+deb10u4) ...
Selecting previously unselected package lsb-base.
Preparing to unpack .../34-lsb-base_10.2019051400_all.deb ...
Unpacking lsb-base (10.2019051400) ...
Selecting previously unselected package mime-support.
Preparing to unpack .../35-mime-support_3.62_all.deb ...
Unpacking mime-support (3.62) ...
Selecting previously unselected package libncurses6:amd64.
Preparing to unpack .../36-libncurses6_6.1+20181013-2+deb10u2_amd64.deb ...
Unpacking libncurses6:amd64 (6.1+20181013-2+deb10u2) ...
Selecting previously unselected package libprocps7:amd64.
Preparing to unpack .../37-libprocps7_2%3a3.3.15-2_amd64.deb ...
Unpacking libprocps7:amd64 (2:3.3.15-2) ...
Selecting previously unselected package procps.
Preparing to unpack .../38-procps_2%3a3.3.15-2_amd64.deb ...
Unpacking procps (2:3.3.15-2) ...
Selecting previously unselected package apache2.
Preparing to unpack .../39-apache2_2.4.38-3+deb10u4_amd64.deb ...
Unpacking apache2 (2.4.38-3+deb10u4) ...
Selecting previously unselected package netbase.
Preparing to unpack .../40-netbase_5.6_all.deb ...
Unpacking netbase (5.6) ...
Selecting previously unselected package sensible-utils.
Preparing to unpack .../41-sensible-utils_0.0.12_all.deb ...
Unpacking sensible-utils (0.0.12) ...
Selecting previously unselected package bzip2.
Preparing to unpack .../42-bzip2_1.0.6-9.2~deb10u1_amd64.deb ...
Unpacking bzip2 (1.0.6-9.2~deb10u1) ...
Selecting previously unselected package libmagic-mgc.
Preparing to unpack .../43-libmagic-mgc_1%3a5.35-4+deb10u2_amd64.deb ...
Unpacking libmagic-mgc (1:5.35-4+deb10u2) ...
Selecting previously unselected package libmagic1:amd64.
Preparing to unpack .../44-libmagic1_1%3a5.35-4+deb10u2_amd64.deb ...
Unpacking libmagic1:amd64 (1:5.35-4+deb10u2) ...
Selecting previously unselected package file.
Preparing to unpack .../45-file_1%3a5.35-4+deb10u2_amd64.deb ...
Unpacking file (1:5.35-4+deb10u2) ...
Selecting previously unselected package krb5-locales.
Preparing to unpack .../46-krb5-locales_1.17-3+deb10u1_all.deb ...
Unpacking krb5-locales (1.17-3+deb10u1) ...
Selecting previously unselected package ucf.
Preparing to unpack .../47-ucf_3.0038+nmu1_all.deb ...
Moving old data out of the way
Unpacking ucf (3.0038+nmu1) ...
Selecting previously unselected package xz-utils.
Preparing to unpack .../48-xz-utils_5.2.4-1_amd64.deb ...
Unpacking xz-utils (5.2.4-1) ...
Selecting previously unselected package openssl.
Preparing to unpack .../49-openssl_1.1.1d-0+deb10u5_amd64.deb ...
Unpacking openssl (1.1.1d-0+deb10u5) ...
Selecting previously unselected package ca-certificates.
Preparing to unpack .../50-ca-certificates_20200601~deb10u2_all.deb ...
Unpacking ca-certificates (20200601~deb10u2) ...
Selecting previously unselected package libbsd0:amd64.
Preparing to unpack .../51-libbsd0_0.9.1-2_amd64.deb ...
Unpacking libbsd0:amd64 (0.9.1-2) ...
Selecting previously unselected package libedit2:amd64.
Preparing to unpack .../52-libedit2_3.1-20181209-1_amd64.deb ...
Unpacking libedit2:amd64 (3.1-20181209-1) ...
Selecting previously unselected package psmisc.
Preparing to unpack .../53-psmisc_23.2-1_amd64.deb ...
Unpacking psmisc (23.2-1) ...
Selecting previously unselected package php-common.
Preparing to unpack .../54-php-common_2%3a69_all.deb ...
Unpacking php-common (2:69) ...
Selecting previously unselected package php7.3-common.
Preparing to unpack .../55-php7.3-common_7.3.27-1~deb10u1_amd64.deb ...
Unpacking php7.3-common (7.3.27-1~deb10u1) ...
Selecting previously unselected package php7.3-json.
Preparing to unpack .../56-php7.3-json_7.3.27-1~deb10u1_amd64.deb ...
Unpacking php7.3-json (7.3.27-1~deb10u1) ...
Selecting previously unselected package php7.3-opcache.
Preparing to unpack .../57-php7.3-opcache_7.3.27-1~deb10u1_amd64.deb ...
Unpacking php7.3-opcache (7.3.27-1~deb10u1) ...
Selecting previously unselected package php7.3-readline.
Preparing to unpack .../58-php7.3-readline_7.3.27-1~deb10u1_amd64.deb ...
Unpacking php7.3-readline (7.3.27-1~deb10u1) ...
Selecting previously unselected package libargon2-1:amd64.
Preparing to unpack .../59-libargon2-1_0~20171227-0.2_amd64.deb ...
Unpacking libargon2-1:amd64 (0~20171227-0.2) ...
Selecting previously unselected package libpcre2-8-0:amd64.
Preparing to unpack .../60-libpcre2-8-0_10.32-5_amd64.deb ...
Unpacking libpcre2-8-0:amd64 (10.32-5) ...
Selecting previously unselected package libsodium23:amd64.
Preparing to unpack .../61-libsodium23_1.0.17-1_amd64.deb ...
Unpacking libsodium23:amd64 (1.0.17-1) ...
Selecting previously unselected package php7.3-cli.
Preparing to unpack .../62-php7.3-cli_7.3.27-1~deb10u1_amd64.deb ...
Unpacking php7.3-cli (7.3.27-1~deb10u1) ...
Selecting previously unselected package libapache2-mod-php7.3.
Preparing to unpack .../63-libapache2-mod-php7.3_7.3.27-1~deb10u1_amd64.deb ...
Unpacking libapache2-mod-php7.3 (7.3.27-1~deb10u1) ...
Selecting previously unselected package libgpm2:amd64.
Preparing to unpack .../64-libgpm2_1.20.7-5_amd64.deb ...
Unpacking libgpm2:amd64 (1.20.7-5) ...
Selecting previously unselected package libsasl2-modules:amd64.
Preparing to unpack .../65-libsasl2-modules_2.1.27+dfsg-1+deb10u1_amd64.deb ...
Unpacking libsasl2-modules:amd64 (2.1.27+dfsg-1+deb10u1) ...
Selecting previously unselected package php7.3.
Preparing to unpack .../66-php7.3_7.3.27-1~deb10u1_all.deb ...
Unpacking php7.3 (7.3.27-1~deb10u1) ...
Selecting previously unselected package php7.3-mysql.
Preparing to unpack .../67-php7.3-mysql_7.3.27-1~deb10u1_amd64.deb ...
Unpacking php7.3-mysql (7.3.27-1~deb10u1) ...
Selecting previously unselected package publicsuffix.
Preparing to unpack .../68-publicsuffix_20190415.1030-1_all.deb ...
Unpacking publicsuffix (20190415.1030-1) ...
Selecting previously unselected package ssl-cert.
Preparing to unpack .../69-ssl-cert_1.0.39_all.deb ...
Unpacking ssl-cert (1.0.39) ...
Setting up perl-modules-5.28 (5.28.1-6+deb10u1) ...
Setting up libexpat1:amd64 (2.2.6-2+deb10u1) ...
Setting up lsb-base (10.2019051400) ...
Setting up libkeyutils1:amd64 (1.6-6) ...
Setting up libpsl5:amd64 (0.20.2-2) ...
Setting up libsodium23:amd64 (1.0.17-1) ...
Setting up libgpm2:amd64 (1.20.7-5) ...
Setting up mime-support (3.62) ...
Setting up libmagic-mgc (1:5.35-4+deb10u2) ...
Setting up psmisc (23.2-1) ...
Setting up libssl1.1:amd64 (1.1.1d-0+deb10u5) ...
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline
Setting up libargon2-1:amd64 (0~20171227-0.2) ...
Setting up libprocps7:amd64 (2:3.3.15-2) ...
Setting up libbrotli1:amd64 (1.0.7-2+deb10u1) ...
Setting up libsqlite3-0:amd64 (3.27.2-3+deb10u1) ...
Setting up libsasl2-modules:amd64 (2.1.27+dfsg-1+deb10u1) ...
Setting up libnghttp2-14:amd64 (1.36.0-2+deb10u1) ...
Setting up libmagic1:amd64 (1:5.35-4+deb10u2) ...
Setting up libapr1:amd64 (1.6.5-1+b1) ...
Setting up krb5-locales (1.17-3+deb10u1) ...
Setting up file (1:5.35-4+deb10u2) ...
Setting up bzip2 (1.0.6-9.2~deb10u1) ...
Setting up libldap-common (2.4.47+dfsg-3+deb10u6) ...
Setting up libicu63:amd64 (63.1-6+deb10u1) ...
Setting up libjansson4:amd64 (2.12-1) ...
Setting up libkrb5support0:amd64 (1.17-3+deb10u1) ...
Setting up libsasl2-modules-db:amd64 (2.1.27+dfsg-1+deb10u1) ...
Setting up librtmp1:amd64 (2.4+20151223.gitfa8646d.1-2) ...
Setting up libncurses6:amd64 (6.1+20181013-2+deb10u2) ...
Setting up xz-utils (5.2.4-1) ...
update-alternatives: using /usr/bin/xz to provide /usr/bin/lzma (lzma) in auto mode
Setting up libpcre2-8-0:amd64 (10.32-5) ...
Setting up libk5crypto3:amd64 (1.17-3+deb10u1) ...
Setting up libsasl2-2:amd64 (2.1.27+dfsg-1+deb10u1) ...
Setting up liblua5.2-0:amd64 (5.2.4-1.1+b2) ...
Setting up sensible-utils (0.0.12) ...
Setting up procps (2:3.3.15-2) ...
update-alternatives: using /usr/bin/w.procps to provide /usr/bin/w (w) in auto mode
Setting up libssh2-1:amd64 (1.8.0-2.1) ...
Setting up netbase (5.6) ...
Setting up libkrb5-3:amd64 (1.17-3+deb10u1) ...
Setting up apache2-data (2.4.38-3+deb10u4) ...
Setting up openssl (1.1.1d-0+deb10u5) ...
Setting up libbsd0:amd64 (0.9.1-2) ...
Setting up publicsuffix (20190415.1030-1) ...
Setting up libxml2:amd64 (2.9.4+dfsg1-7+deb10u1) ...
Setting up libgdbm6:amd64 (1.18.1-4) ...
Setting up libaprutil1:amd64 (1.6.1-4) ...
Setting up php-common (2:69) ...
Setting up libedit2:amd64 (3.1-20181209-1) ...
Setting up libldap-2.4-2:amd64 (2.4.47+dfsg-3+deb10u6) ...
Setting up libaprutil1-ldap:amd64 (1.6.1-4) ...
Setting up libaprutil1-dbd-sqlite3:amd64 (1.6.1-4) ...
Setting up ca-certificates (20200601~deb10u2) ...
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline
Updating certificates in /etc/ssl/certs...
137 added, 0 removed; done.
Setting up ssl-cert (1.0.39) ...
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline
Setting up libgssapi-krb5-2:amd64 (1.17-3+deb10u1) ...
Setting up libgdbm-compat4:amd64 (1.18.1-4) ...
Setting up ucf (3.0038+nmu1) ...
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline
Setting up libperl5.28:amd64 (5.28.1-6+deb10u1) ...
Setting up libcurl4:amd64 (7.64.0-4+deb10u1) ...
Setting up apache2-utils (2.4.38-3+deb10u4) ...
Setting up perl (5.28.1-6+deb10u1) ...
Setting up php7.3-common (7.3.27-1~deb10u1) ...
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/calendar.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/ctype.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/exif.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/fileinfo.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/ftp.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/gettext.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/iconv.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/pdo.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/phar.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/posix.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/shmop.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/sockets.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/sysvmsg.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/sysvsem.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/sysvshm.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/tokenizer.ini with new version
Setting up php7.3-mysql (7.3.27-1~deb10u1) ...
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/mysqlnd.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/mysqli.ini with new version
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/pdo_mysql.ini with new version
Setting up php7.3-opcache (7.3.27-1~deb10u1) ...
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/opcache.ini with new version
Setting up php7.3-json (7.3.27-1~deb10u1) ...
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/json.ini with new version
Setting up php7.3-readline (7.3.27-1~deb10u1) ...
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/mods-available/readline.ini with new version
Setting up apache2-bin (2.4.38-3+deb10u4) ...
Setting up php7.3-cli (7.3.27-1~deb10u1) ...
update-alternatives: using /usr/bin/php7.3 to provide /usr/bin/php (php) in auto mode
update-alternatives: using /usr/bin/phar7.3 to provide /usr/bin/phar (phar) in auto mode
update-alternatives: using /usr/bin/phar.phar7.3 to provide /usr/bin/phar.phar (phar.phar) in auto mode
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/cli/php.ini with new version
Setting up apache2 (2.4.38-3+deb10u4) ...
Enabling module mpm_event.
Enabling module authz_core.
Enabling module authz_host.
Enabling module authn_core.
Enabling module auth_basic.
Enabling module access_compat.
Enabling module authn_file.
Enabling module authz_user.
Enabling module alias.
Enabling module dir.
Enabling module autoindex.
Enabling module env.
Enabling module mime.
Enabling module negotiation.
Enabling module setenvif.
Enabling module filter.
Enabling module deflate.
Enabling module status.
Enabling module reqtimeout.
Enabling conf charset.
Enabling conf localized-error-pages.
Enabling conf other-vhosts-access-log.
Enabling conf security.
Enabling conf serve-cgi-bin.
Enabling site 000-default.
invoke-rc.d: could not determine current runlevel
invoke-rc.d: policy-rc.d denied execution of start.
Setting up libapache2-mod-php7.3 (7.3.27-1~deb10u1) ...
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline

Creating config file /etc/php/7.3/apache2/php.ini with new version
Module mpm_event disabled.
Enabling module mpm_prefork.
apache2_switch_mpm Switch to prefork
invoke-rc.d: could not determine current runlevel
invoke-rc.d: policy-rc.d denied execution of restart.
apache2_invoke: Enable module php7.3
invoke-rc.d: could not determine current runlevel
invoke-rc.d: policy-rc.d denied execution of restart.
Setting up php7.3 (7.3.27-1~deb10u1) ...
Processing triggers for libc-bin (2.28-10) ...
Processing triggers for ca-certificates (20200601~deb10u2) ...
Updating certificates in /etc/ssl/certs...
0 added, 0 removed; done.
Running hooks in /etc/ca-certificates/update.d...
done.
Removing intermediate container 80716c56547d
 ---> 2723e70cd2c7
Step 3/12 : RUN rm /var/www/html/index.html
 ---> Running in 06a58a81d544
Removing intermediate container 06a58a81d544
 ---> c363f5d843d6
Step 4/12 : ENV MARIADB_USER admin
 ---> Running in 75b746ba409f
Removing intermediate container 75b746ba409f
 ---> a564277b53c6
Step 5/12 : ENV MARIADB_PASS admin
 ---> Running in a692407299b3
Removing intermediate container a692407299b3
 ---> c793207d01db
Step 6/12 : ENV MARIADB_HOST servidor_mysql
 ---> Running in ef4fb2624c0b
Removing intermediate container ef4fb2624c0b
 ---> 881f667093e9
Step 7/12 : ENV DB_NAME bookmedik
 ---> Running in d18484892e70
Removing intermediate container d18484892e70
 ---> 0f271ef9e447
Step 8/12 : EXPOSE 80
 ---> Running in 9610f9eccaac
Removing intermediate container 9610f9eccaac
 ---> 33f677a12dcc
Step 9/12 : COPY bookmedik/ /var/www/html
 ---> 14764194a08e
Step 10/12 : ADD script.sh /usr/local/bin/script.sh
 ---> b8ab84f7cee6
Step 11/12 : RUN chmod +x /usr/local/bin/script.sh
 ---> Running in ed9fee5e8f9c
Removing intermediate container ed9fee5e8f9c
 ---> 898867530d13
Step 12/12 : CMD ["script.sh"]
 ---> Running in b28221c15921
Removing intermediate container b28221c15921
 ---> 3d1d3ed847f8
Successfully built 3d1d3ed847f8
Successfully tagged sergioib94/bookmedik:v1
~~~

Como podemos ver se ejecuta todo lo indicado en el dockerfile sin ningun problema, sergioib94/bookmedik:v1 sera el nombre que tendra la imagen y con "." indicamos que se haga en el mismo directorio build.

Una vez que tenemos la imagen vamos al directorio deploy y ejecutamos el docker-compose.yaml.

Configuracion de docker-compose:

~~~
version: '3.1'

services:

  app:
    container_name: bookmedik
    image: sergioib94/bookmedik:v1
    restart: always
    environment:
      DB_HOST: db
      DB_USER: admin
      DB_PASSWORD: admin
      DB_NAME: bookmedik
    ports:
      - 80:8080
    volumes:
      - /home/sergioib//bookmedik/vol-app:/var/log/apache2

  db:
    container_name: servidor_mysql
    image: mariadb
    restart: always
    environment:
      MYSQL_DATABASE: bookmedik
      MYSQL_USER: admin
      MYSQL_PASSWORD: admin
      MYSQL_ROOT_PASSWORD: bookmedik_admin
    volumes:
      - /home/sergioib//bookmedik/vol-maria:/var/lib/mysql
~~~

En el docker-compose, indicamos los dos contenedores que se van a despleguar, si usara alguna imagen, las variables que usaran dichos contenedores y donde se almacenaran los datos. Es imporatante indicar que la informacion de los contenedores es efimera, por lo que si no se les indica una ubicacion para que se almacena la informacion, esta se perdera una vez se apague el contenedor.

### Despliegue del docker-compose ###

~~~
sergioib@debian-sergio:~//bookmedik/deploy$ docker-compose up -d
Creating network "deploy_default" with the default driver
Pulling app (sergioib94/bookmedik:v1)...
v1: Pulling from sergioib94/bookmedik
0ecb575e629c: Already exists
cbd4c501590f: Pull complete
cd0be11536e1: Pull complete
f36ad0cac2ed: Pull complete
6790c859e7e3: Pull complete
4e0f6c5b1952: Pull complete
Digest: sha256:3e1c1cd5a79d94fb1f69686dcb06d6901e0606cf03e3f165b0a771ebb1ccff37
Status: Downloaded newer image for sergioib94/bookmedik:v1
Pulling db (mariadb:)...
latest: Pulling from library/mariadb
83ee3a23efb7: Pull complete
db98fc6f11f0: Pull complete
f611acd52c6c: Pull complete
aa2333e25466: Pull complete
f53ac4b825fd: Pull complete
c20afcf9b055: Pull complete
54c5dc6dcf19: Pull complete
b1c71d744483: Pull complete
863a8cc01d1c: Pull complete
ea6c59f9e205: Pull complete
6aa441240c22: Pull complete
c1fee6e1dead: Pull complete
Digest: sha256:a13b01d9af44097efeca7a3808a524c8052870e59a1eeef074857ba01e70c1f2
Status: Downloaded newer image for mariadb:latest
Creating bookmedik      ... done
Creating servidor_mysql ... done
~~~

Una vez echo esto cargamos el schema.sql en la base de datos mariadb:

~~~
sergioib@debian-sergio:~//bookmedik$ cat build/bookmedik/schema.sql | docker exec -i servidor_mysql /usr/bin/mysql -u root --password=bookmedik_admin bookmedik
~~~

Comprobacion de funcionamiento:

![bookmedik_1](/tarea-docker/Tarea1.png)

### Tarea 2: Ejecución de una aplicación web PHP en docker ###

* Realiza la imagen docker de la aplicación a partir de la imagen oficial PHP que encuentras en docker hub. 

* Lee la documentación de la imagen para configurar una imagen con apache2 y php, además seguramente tengas que instalar alguna extensión de php.

* Crea esta imagen en docker hub.

* Crea un script con docker compose que levante el escenario con los dos contenedores.

Configuracion de dockerfile:

~~~
FROM php:7.4-apache

ENV MARIADB_USER admin
ENV MARIADB_PASS admin
ENV MARIADB_HOST servidor_mysql2

RUN apt-get update
RUN docker-php-ext-install pdo pdo_mysql mysqli json
RUN a2enmod rewrite

EXPOSE 80

WORKDIR /var/www/html

COPY bookmedik/ /var/www/html

ADD script.sh /usr/local/bin/script.sh

RUN chmod +x /usr/local/bin/script.sh

CMD ["script.sh"]
~~~

Configuracion script.sh:

~~~
sed -i "s/$this->user=\"root\";/$this->user=\"$MARIADB_USER\";/g" /var/www/html/core/controller/Database.php
sed -i "s/$this->pass=\"\";/$this->pass=\"$MARIADB_PASS\";/g" /var/www/html/core/controller/Database.php
sed -i "s/$this->host=\"localhost\";/$this->host=\"$MARIADB_HOST\";/g" /var/www/html/core/controller/Database.php

apache2ctl -D FOREGROUND
~~~

Generamos la imagen nueva:

~~~
sergioib@debian-sergio:~/docker-bookmedik/Tarea2/build$ docker build -t sergioib94/bookmedik-php:v1 .
Sending build context to Docker daemon  3.667MB
Step 1/13 : FROM php:7.4-apache
 ---> 83db90327db8
Step 2/13 : ENV MARIADB_USER admin
 ---> Using cache
 ---> da1cc91e2cc6
Step 3/13 : ENV MARIADB_PASS admin
 ---> Using cache
 ---> 0ef8ceb967bf
Step 4/13 : ENV MARIADB_HOST servidor_mysql2
 ---> Using cache
 ---> 9caececadc71
Step 5/13 : RUN apt-get update
 ---> Using cache
 ---> 2b798bee671c
Step 6/13 : RUN docker-php-ext-install pdo pdo_mysql mysqli json
 ---> Using cache
 ---> ffd14ce4443f
Step 7/13 : RUN a2enmod rewrite
 ---> Using cache
 ---> 53e31ffd7ab6
Step 8/13 : EXPOSE 80
 ---> Using cache
 ---> 2f62894a39a8
Step 9/13 : WORKDIR /var/www/html
 ---> Using cache
 ---> 5fdc0294f850
Step 10/13 : COPY bookmedik/ /var/www/html
 ---> b360b294cf3d
Step 11/13 : ADD script.sh /usr/local/bin/script.sh
 ---> cf45198aa12d
Step 12/13 : RUN chmod +x /usr/local/bin/script.sh
 ---> Running in 05b958caea59
Removing intermediate container 05b958caea59
 ---> 651b463266a8
Step 13/13 : CMD ["script.sh"]
 ---> Running in 2df65d082273
Removing intermediate container 2df65d082273
 ---> 5b857f8a175a
Successfully built 5b857f8a175a
Successfully tagged sergioib94/bookmedik-php:v1
~~~

Una vez que tengamos la imagen preparada, configuramos el docker-compose y lo desplegamos:

~~~
version: '3.1'

services:

 app:
    container_name: bookmedik-php
    image: sergioib94/bookmedik-php:v1
    restart: always
    ports:
      - 8081:80
    volumes:
      - /home/sergio/docker-bookmedik/Tarea2/vol-app:/var/log/apache2
 
db:
    container_name: servidor_mysql2
    image: mariadb
    restart: always
    environment:
      MYSQL_DATABASE: bookmedik
      MYSQL_USER: admin
      MYSQL_PASSWORD: admin
      MYSQL_ROOT_PASSWORD: bookmedik_admin
    volumes:
- /home/sergio/docker-bookmedik/Tarea2/vol-maria:/var/lib/mysql
~~~

Comprobamos su funcionamiento despues de desplegarlo:

![bookmedik_2](/tarea-docker/Tarea2.png)

### Tarea 4: Ejecución de un CMS en docker ###

* A partir de una imagen base (que no sea una imagen con el CMS), genera una imagen que despliegue un CMS PHP (que no sea wordpress).

* Crea los volúmenes necesarios para que la información que se guarda sea persistente.

Para este caso sera necesario descargar drupal y poner el directorio con todo su contenido en el directorio build.

Configuracion de dockerfile:

~~~
FROM debian

RUN apt-get update && apt-get install -y apache2 libapache2-mod-php7.3 php7.3 php7.3-mysql php-xml php-gd php-mysql php-mbstring php7.3-pdo php7.3-mysqli && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN rm /var/www/html/index.html && a2enmod rewrite

EXPOSE 80

COPY ./drupal-9.1.4 /var/www/html

CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
~~~

Como podemos ver, en este caso no sera necesario crear un fichero script.sh. Por lo que una vez creada la imagen, podemos desplegar el docker compose para comprobar su funcionamiento.

Configuracion de docker-compose:

~~~
version: "3.1"

services:
  db:
    container_name: servidor_mysql_drupal
    image: mariadb
    restart: always
    environment:
      MYSQL_DATABASE: drupal
      MYSQL_USER: admin
      MYSQL_PASSWORD: admin
      MYSQL_ROOT_PASSWORD: drupal_admin
    volumes:
      - /home/sergio/docker-bookmedik/Tarea4/vol-maria:/var/lib/mysql

  drupal:
    container_name: drupal
    image: sergioib94/drupal:v1
    restart: always
    ports:
      - 8083:80
    volumes:
      - /home/sergio/docker-bookmedik/Tarea4/vol-app:/var/log/apache2
~~~

Comprobamos su funcionamiento:

![drupal](/tarea-docker/Tarea4.png)

### Tarea 5: Ejecución de un CMS en docker ###

* Busca una imagen oficial de un CMS PHP en docker hub (distinto al que has instalado en la tarea anterior, ni wordpress), y crea los contenedores necesarios para servir el CMS, siguiendo la documentación de docker hub.

En este caso como cogemos la imagen de joomla de dockerhub, no es necesario tener un directorio build, solo sera necesario un fichero dockerfile.

Configuracion docker-compose:

~~~
version: '3.1'

services:
  joomla:
    image: joomla
    restart: always
    links:
      - joomladb:mysql
    ports:
      - 8080:80
    volumes:
      - "../:/var/www/html"
    environment:
      JOOMLA_DB_HOST: joomladb
      JOOMLA_DB_PASSWORD: example

  joomladb:
    image: mysql:5.6
    ports:
      - 3306
    restart: always
    volumes:
      - "./data:/var/lib/mysql"
    environment:
      MYSQL_ROOT_PASSWORD: example
~~~

Comprobacion del funcionamiento:

![joomla](/tarea-docker/Tarea5.png)