---
title: "Instalación, configuración y monitorización usando Zabbix"
date: 2025-05-01T13:19:00+02:00
categories: [Sistemas, Monitorización]
excerpt: "Este post describe paso a paso cómo instalar y configurar Zabbix 6.0 LTS en una máquina virtual con Debian 12. Está pensado para crear un entorno de prácticas de monitorización que incluya carga simulada, agentes remotos, monitorización de logs, SNMP y dashboards personalizados."
---

## **¿Que es Zabbix?** ##

Zabbix es una plataforma de monitorización de infraestructura de TI de código abierto que permite supervisar el estado y rendimiento de servidores, redes, aplicaciones, servicios y otros recursos tecnológicos en tiempo real.

## **Requisitos previos** ##

Para este post se han usado los siguientes elementos para realizar instalación, configuración y monitorización haciendo uso de Zabbix:

* Maquina virtual con sistema operativo Debían 12 (Zabbix server)
* Al menos 1 GB de RAM, 2 CPU y 10 GB de disco duro 
* Acceso a red y tener privilegios de superusuario (root)

Lo primero que haremos al arrancar nuestro servidor Debian sera actualizar el sistema en el caso de que no lo este.

~~~
sudo apt update && sudo apt upgrade -y
~~~

Una vez se tenga actualizado el sistema lo primero que haremos sera instalar LAMP en nuestra maquina (Apache, Mariadb y Php), inicialmente lo que necesitaremos sera solo mariadb, pero como mas adelante necesitaremos también Apache y php evitaremos problemas a la hora de usar Zabbix.

**Instalación de Apache**

~~~
sudo apt install apache2 -y
~~~

Apache lo usara Zabbix para incluir una interfaz web que necesita un servidor web.

**Instalación de Mariadb**

~~~
sudo apt install mariadb-server mariadb-client -y
~~~

Zabbix almacena todos sus datos (eventos, hosts, métricas, configuración, etc.) en una base de datos.

**Aseguramos Mariadb**

~~~
sudo mysql_secure_installation
~~~

A la hora de asegurar mariadb tendremos que indicar las siguientes opciones:

* Set root password: si
* Remove anonymous users: si
* Disallow root login remotely: sí
* Remove test database: sí
* Reload privilege tables: sí

**Instalación de PHP y extensiones necesarias**

~~~
sudo apt install php php-mysql php-bcmath php-mbstring php-gd php-xml php-ldap php-json php-zip php-snmp php-curl libapache2-mod-php -y
~~~

La interfaz web de Zabbix está hecha en PHP, por lo que se necesita tenerlo instalado con ciertas extensiones.

## **Instalación de Zabbix** ## ##

A la hora de instalar Zabbix en nuestro sistema lo primero sera añadir el repositorio oficial de Zabbix.

~~~
wget https://repo.zabbix.com/zabbix/6.0/debian/pool/main/z/zabbix-release/zabbix-release_6.0-5+debian12_all.deb
sudo dpkg -i zabbix-release_6.0-5+debian12_all.deb
sudo apt update
~~~

*Nota: Es posible que dependiendo de la distribución del sistema operativo que se este usando o de la version escogida de Zabbix de error al instalar el paquete con dpkg, en caso de error ejecutar el comando "sudo apt --fix-broken install -y" para reparar las dependencias que falten* 


Una vez hayamos añadido el repositorio y hayamos descargado e instalado el paquete Zabbix, pasamos a instalar servidor, frontend, agente y base de datos.

~~~
sudo apt install zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-sql-scripts zabbix-agent -y
~~~

Despues crearemos la base de datos de zabbix en mariadb previamente instalada:

~~~
sudo mysql -u root -p
~~~

Dentro del prompt de mariadb, añadiremos los siguientes códigos:

~~~
CREATE DATABASE zabbix CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
CREATE USER sergioib@localhost IDENTIFIED BY 'contraseña';
GRANT ALL PRIVILEGES ON zabbix.* TO sergioib@localhost;
FLUSH PRIVILEGES;
EXIT;
~~~

* Con la primera linea lo que haremos sera crear una base de datos llamada zabbix, a parte de eso con "CHARACTER SET utf8mb4": Especificamos que se usará el conjunto de caracteres UTF-8 de 4 bytes, compatible con emojis y otros símbolos especiales. Es el más recomendado hoy en día y con "COLLATE utf8mb4_bin" Define la forma en que se comparan y ordenan los datos. utf8mb4_bin hace que las comparaciones sean sensibles a mayúsculas/minúsculas y a acentos (comparación binaria).

* Con la segunda linea creamos un usuario de base de datos con el nombre que especifiquemos (en mi caso sergioib) que solo puede conectarse desde el servidor local (localhost), con una contraseña personalizada (indicándola donde pone 'contraseña').

* Con la tercera linea concedemos todos los permisos (lectura, escritura, modificación, etc.) al usuario creado anteriormente sobre todas las tablas (*) dentro de la base de datos zabbix.

* Por ultimo con la cuarta linea recargamos las tablas de privilegios de MariaDB para asegurarse de que los cambios (como la creación de usuarios o la asignación de permisos) se apliquen de inmediato.

Cuando ya tengamos la base de datos creada, ya podremos importar el esquema de la base de datos

~~~
zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | mysql -u sergioib -p zabbix
~~~

Introducimos la contraseña especificada anteriormente para completar la importación y en cuanto a la instalación de zabbix ya estaría todo listo.

## **Configuración de zabbix** ## ##

Para la configuración empezamos abriendo el fichero zabbix-server.conf para editarlo

~~~
sudo nano /etc/zabbix/zabbix_server.conf
~~~

En este fichero tendremos que buscar la linea en la que se indique el parámetro DBpassword y primero descomentar la linea y después sustituir la password por defecto por la que hayamos puesto en pasos anteriores para la base de datos mariadb

Después de eso reiniciamos y habilitamos el servicio

~~~
sudo systemctl restart zabbix-server zabbix-agent apache2
sudo systemctl enable zabbix-server zabbix-agent apache2
~~~
Ya con todo configurado y habilitado podemos acceder al frontend web y empezar a usar zabbix.

## **Frontend web** ##

Para acceder al frontend de zabbix abrimos un navegador y realizamos una búsqueda indicando la ip de la maquina en la que se haya instalado zabbix, en mi caso seria "https://192.168.149.129/zabbix/".

La primera vez que accedamos a zabbix tendremos que indicar una serie de configuraciones previas, por ejemplo el tema del idioma, por defecto zabbix solo trae instalados los paquetes de español e ingles (al menos en mi caso) por lo que para otros idiomas se tendrá que descargar el paquete de idiomas a parte.

![inicio en zabbix](/images/Zabbix/zabbix1.PNG)

En la siguiente pantalla se realizara una comprobación de los requisitos previos para el uso de zabbix, en este caso como al inicio del post se instalaron tanto apache como php no debería haber ningún problema, en caso de que falte algún paquete en concreto seria solo cuestión de instalarlo, el caso es que todo tiene que estar "OK".

![requisitos previos](/images/Zabbix/zbbix_requisitos.PNG)

Después introducimos la información de la base de datos que hemos configurado en mariadb

![BBDD](/images/Zabbix/zabbix_bbdd.PNG)

Por ultimo le pondremos nombre a nuestro servidor zabbix y con esto completaremos la instalación para poder acceder. El acceso lo realizaremos con el usuario por defecto "Admin" y la contraseña "zabbix".

![zabbix server](/images/Zabbix/zabbix_server.PNG)