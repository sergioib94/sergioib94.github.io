---
title: "Instalacion local CMS PHP"
date: 2021-03-11T10:13:49+01:00
categories: [Aplicaciones Web]
excerpt: "En el siguiente post veremos haciendo uso de una maquina virtual en vagrant con sistema operativo unix e instalaremos en dicha maquina un servidor LAMP para instalar y configurar drupal."
---

### **Instalación de un servidor LAMP** ###

Empezamos creando una instancia de vagrant basado en un box debian o ubuntu y una vez creado ejecutamos vagrant init en el directorio donde crearemos el vagrantfile.
	
Configuración del vagrantfile:

~~~
Vagrant.configure("2") do |config|
config.vm.define :nodo1 do |nodo1|
    nodo1.vm.box = "debian/buster64"
    nodo1.vm.hostname = "server"
    nodo1.vm.network :private_network, type: "dhcp"
end
~~~

Una vez configurado el vagrantfile levantamos el escenario usando vagrant up y luego nos conectamos al servidor con vagrant ssh.

Lo primero que haremos en la maquina sera ejecutar un update y un upgrade. Después de el update y el upgrade, empezaremos a descargar la pila LAMP (apache, mariadb y php): 

Apache:

~~~
sudo apt install apache2
~~~

Mariadb:

~~~
apt install mariadb-server mariadb-client
~~~

PHP:

~~~
apt install php7.3
~~~

### **Instalación de Drupal en el servidor local** ###

* Configuraremos el servidor web con virtual hosting para que el CMS sea accesible desde la dirección: www.nombrealumno-drupal.org.

Configuración en el servidor en drupal.conf:

~~~
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /srv/www/
    ServerName www.sergioib-drupal.org
    <Directory /srv/www/drupal>
        	Options Indexes FollowSymLinks
        	AllowOverride All
        	Require all granted
    </Directory>
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
~~~

Configuración en el cliente en etc/hosts:

~~~
172.28.128.16   www.sergioib-drupal.org
~~~

* Creamos un usuario en la base de datos para trabajar con la base de datos donde se van a guardar los datos del CMS.

~~~
vagrant@server:~$ sudo mysql -u root -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 51
Server version: 10.3.25-MariaDB-0+deb10u1 Debian 10

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> create database drupalbd;
Query OK, 1 row affected (0.001 sec)

MariaDB [(none)]> create user drupal;
Query OK, 0 rows affected (0.001 sec)
MariaDB [(none)]> grant all on drupalbd.* to drupal identified by 'drupal';
Query OK, 0 rows affected (0.001 sec)
~~~

* Descargamos la versión que nos parezca más oportuna de Drupal y realiza la instalación.

~~~
wget https://www.drupal.org/download-latest/zip
~~~

Una vez instalado, abrimos en un navegador la url de nuestro sitio para seguir con la instalacion en 6 pasos:

El primer paso al elegir el idioma español, da error porque en la instalacion no se instalo la carpeta de idiomas, por lo que en el directorio /drupal/sites/default creamos el directorio /files/translations y en ese directorio translations descargamos el paquete del idioma español.

~~~
wget https://ftp.drupal.org/files/translations/all/drupal/drupal-8.9.7.es.po
~~~

En el segundo paso elegimos el perfil que vamos a tener, en este caso uno estándar.

En el tercer paso hubo varios problemas con los requistos:

◦ Extensiones php
    ▪ Solucion → sudo apt instal php-gd php-xml

◦ Funcionalidad de bases de datos
    ▪ Solucion → sudo apt install php7.3-pdo php7.3-mysqli

◦ Problemas de permisos /sites/default/files
    ▪ Solución → sudo chmod a+w sites/default/files

◦ Archivo de configuración
    ▪ Solución:
        • sudo cp sites/default/default.settings.php sites/default/settings.php
        • sudo chmod a+w sites/default/settings.php

En el cuarto introducimos los datos de nuestra base de datos, nombre de la base, usuario que la va a usar y contraseña. Después instalamos el sitio y lo configuramos.

* Realizamos una configuración mínima de la aplicación (Cambia la plantilla, crea algún contenido, …)

Apariencia → instalar nuevo tema → pegar enlace donde este el tema → buscarlo y descargarlo

Contenido → Añadir contenido → Elegir contenido a crear (en este caso un articulo) → Guardar los cambios

* Instalamos un módulo para añadir alguna funcionalidad a drupal.

Ampliar → seleccionamos un modulo, en este caso el foro→ instalar, en mi caso como ejemplo instale el modulo forum.

Prueba de funcionamiento de Drupal 9 con las configuraciones ya realizadas:

### **Configuración multimodo** ###

* Realizamos una copia de seguridad de la base de datos mysql:

~~~
mysqldump --user=drupal --password=drupal drupalbd > copiadrupalbd.sql
~~~

* Creamos otra máquina con vagrant, conectada con una red interna a la anterior y configuramos un servidor de base de datos.

Configuración de vagrantfile:

~~~
Vagrant.configure("2") do |config|
  config.vm.define :nodo1 do |nodo1|
    nodo1.vm.box = "debian/buster64"
    nodo1.vm.hostname = "server"
    nodo1.vm.network :public_network,:bridge=>"wlo1"
    nodo1.vm.network :private_network, ip: "192.168.100.10/24", virtualbox__intnet: "Red_int"
  end

  config.vm.define :nodo2 do |nodo2|
    nodo2.vm.box = "debian/buster64"
    nodo2.vm.hostname = "server-bd"
    nodo2.vm.network :private_network, ip: "192.168.100.20/24", virtualbox__intnet: "Red_int"
  end
~~~

* Creamos un usuario en la base de datos para trabajar con la nueva base de datos.

Instalamos mariadb igual que en la maquina anterior:

~~~
sudo apt install mariadb-server mariadb-client
~~~

Y creamos un usuario igual que en la maquina anterior:

~~~
vagrant@server-bd:~$ sudo mysql -u root -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 49
Server version: 10.3.25-MariaDB-0+deb10u1 Debian 10

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> create user drupal identified by drupal;
Query OK, 0 rows affected (0.001 sec)
~~~

* Restauramos la copia de seguridad en el nuevo servidor de base datos.

~~~
mysql -u drupal -pdrupal drupalbd < copiadrupaldb.sql
~~~

* Desinstalamos el servidor de base de datos en el servidor principal.

~~~
sudo apt purge mariadb-*
~~~

* Realizamos los cambios de configuración necesario en drupal para que la página funcione.

Configuración de settings.php

~~~
$databases['default']['default'] = array (
'database' => 'drupalbd',
'username' => 'drupal',
'password' => 'drupal',
'prefix' => '',
'host' => '192.168.100.20',
'port' => '3306',
'namespace' => 'Drupal\\Core\\Database\\Driver\\mysql',
'driver' => 'mysql',
);
~~~

### **Instalación de otro CMS PHP** ###

Como segundo cms en instalacion se ha escogido moddle, por lo tanto igual que hemos hecho anteriormente con drupal comenzamos con su instalacion.

Instalación de moodle: 

~~~
sudo wget https://es.osdn.net/projects/sfnet_moodle/downloads/Moodle/stable38/moodle-latest-38.zip
~~~

En este caso no se ha podido descargar de la pagina oficial www.download.moodle.org ya que por algún motivo a la hora de descargarse no se descargaba completa y en ese caso al intentar desempaquetar el zip que se descargaba con unzip, no se podía.

* Configuramos otro virtualhost y elegimos otro nombre en el mismo dominio.

Una vez que tengamos la moodle en nuestro equipo empezamos a configurar el virtualhost. Copiamos el fichero drupal.conf en /etc/apache2/sites-availables y creamos un moodle.conf:

~~~
sudo cp /etc/apache2/sites-available/drupal.conf /etc/apache2/sites-available/moodle.conf
~~~

Configuración de moodle.conf:

~~~
<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /srv/www/
    ServerName www.sergioib-drupal.org
    <Directory /srv/www/moodle>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
		</Directory>
~~~

Instalación de la base de datos para moodle (en el servidor de base de datos): 

~~~
vagrant@server-bd:~$ sudo mysql -u root -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 40
Server version: 10.3.25-MariaDB-0+deb10u1 Debian 10

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> create database moodlebd;
Query OK, 1 row affected (0.001 sec)

MariaDB [(none)]> create user moodle;
Query OK, 0 rows affected (0.001 sec)

MariaDB [(none)]> grant all on moodlebd.* to moodle identified by 'moodle'
    -> ;
Query OK, 0 rows affected (0.001 sec)
~~~

Modificamos de permisos /srv ya que a la hora de instalar se creara un directorio moodledata en /srv y no tiene el directorio permisos de escritura  de un fichero config.php en el directorio /srv/www/moodle ya que el script de instalación no fue capaz de generarlo.

Contenido de config.php:

~~~
<?php  // Moodle configuration file

unset($CFG);
global $CFG;
$CFG = new stdClass();

$CFG->dbtype    = 'mysql';
$CFG->dblibrary = 'native';
$CFG->dbhost    = '192.168.100.20';
$CFG->dbname    = 'moodlebd';
$CFG->dbuser    = 'moodle';
$CFG->dbpass    = 'moodle';
$CFG->prefix    = 'mdl_';
$CFG->dboptions = array (
  'dbpersist' => 0,
  'dbport' => '',
  'dbsocket' => '',
  'dbcollation' => 'utf8mb4_general_ci',
);
$CFG->wwwroot   = 'http://www.sergioib-drupal.org/moodle';
$CFG->dataroot  = '/srv/moodledata';
$CFG->admin     = 'admin';

$CFG->directorypermissions = 0777;

require_once(__DIR__ . '/lib/setup.php');

// There is no php closing tag in this file,
// it is intentional because it prevents trailing whitespace problems!
~~~

Algunos de los fallos saltaron en la instalacion fueron los siguientes:

* dbtype en config.php debía ser cambiado a mariadb indicando asi el tipo de base de datos que usamos.
* Es necesaria extensión php-intl

Reiniciamos el servidor y al continuar la instalación, solo faltara poner los datos de administrador para de esa forma tener operativa la moodle. 

### **Necesidad de otros servicios** ###

* La mayoría de los CMS tienen la posibilidad de mandar correos electrónicos (por ejemplo para notificar una nueva versión, notificar un comentario, etc…)

Instalaremos un servidor de correo electrónico en tu servidor, por lo que debemos configurar un servidor relay de correo, para ello en el fichero /etc/postfix/main.cf, debemos poner la siguiente línea:

Lo primero que haremos será instalar el paquete postfix

~~~
sudo apt install postfix
~~~

Una vez que lo instalamos, en el menú de instalación podremos configurar el correo que se usara, en este caso escogemos la opción Internet Site y despues ponemos el nombre del correo que se va a usar, en este caso sergioib-drupal.org. Ahora pasamos a introducir la siguiente linea en /etc/postfix/main.cf:

~~~
relayhost = babuino-smtp.gonzalonazareno.org
~~~

De forma que el fichero quede de esta forma:

~~~
smtpd_relay_restrictions = permit_mynetworks permit_sasl_authenticated defer_unauth_destination
myhostname = server.home
alias_maps = hash:/etc/aliases
alias_database = hash:/etc/aliases
myorigin = /etc/mailname
mydestination = $myhostname, sergioib-drupal.org, server, localhost.localdomain, localhost
relayhost = babuino-smtp.gonzalonazareno.org
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
mailbox_size_limit = 0
recipient_delimiter = +
inet_interfaces = all
inet_protocols = all
~~~

Ahora solo queda configurar alguno de los CMS para que nos envíe algún correo:

* En el caso de drupal lo configuramos de la siguiente forma: Configurar -> People -> Accont -> setting -> Notification email addres.

* En el caso de la moodle: Configuración -> Usuarios -> Cuentas -> Acciones de usuario masivas
