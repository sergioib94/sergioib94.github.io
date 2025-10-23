---
title: "Despliegue CMS Java"
date: 2021-03-12T13:49:27+01:00
categories: [Aplicaciones Web]
excerpt: "En este post, se va a desplegar una aplicacion cms java, en este caso Guacamole.

Guacamole es una aplicacion que permite acceder a uno o más escritorios desde cualquier lugar de forma remota, sin tener que instalar un cliente, especialmente cuando no es posible instalar un cliente."
---

### **Introduccion** ###

En este post, se va a desplegar una aplicacion cms java, en este caso Guacamole.

Guacamole es una aplicacion que permite acceder a uno o más escritorios desde cualquier lugar de forma remota, sin tener que instalar un cliente, especialmente cuando no es posible instalar un cliente. Al configurar un servidor Guacamole, puede proporcionar acceso a cualquier otra maquina en la red desde prácticamente cualquier otra maquina en Internet, en cualquier parte del mundo. Incluso se pueden utilizar teléfonos móviles o tablets, sin tener que instalar nada. La presencia de un proxy o firewall corporativo no impide el uso de Guacamole.

### **Instalacion** ###

Comenzamos instalando tomcat:

~~~
sudo apt install tomcat9
~~~

Después de la instalación de tomcat, pasamos a instalar el servidor guacamole haciendo uso de wget:

~~~
sudo wget http://archive.apache.org/dist/guacamole/1.2.0/source/guacamole-server-1.2.0.tar.gz
~~~

Una vez tengamos guacamole-server en la maquina, lo descomprimimos y accedemos al directorio. Dentro del directorio ejecutaremos ./configure --with-init-dir=/etc/init.d. .configure, preparará la compilación de forma que guacamole pueda ser instalado. Instalamos guacamole ejecutando los siguientes comandos:

~~~
make
sudo make install
sudo ldconfig
~~~

Ahora pasamos a instalar guacamole client en el mismo servidor, al igual que con guacamole server lo hacemos usando wget, pero esta vez usando el fichero .war.

~~~
sudo wget http://archive.apache.org/dist/guacamole/1.2.0/binary/guacamole-1.2.0.war
~~~

Después copiamos ese fichero .war descargado en la siguiente ruta /var/lib/tomcat9/webapps/ y ya tendremos guacamole instalado en nuestro equipo. En estos momentos solo nos quedara configurarlo.

La configuración de guacamole se hará de la siguiente forma:

Creamos en la ruta /usr/share/tomcat9/ un directorio llamado .guacamole en el que mas adelante crearemos un enlace simbólico por el que tomcat cogerá la configuración creada en el fichero guacamole.properties.

Se crea el fichero guacamole.properties en /etc/guacamole/ con el siguiente contenido:

~~~
guacd-hostname: localhost
guacd-port: 4822
user-mapping: /etc/guacamole/user-mapping.xml
auth-provider: net.sourceforge.guacamole.net.basic.BasicFileAuthenticationProvider
basic-user-mapping: /etc/guacamole/user-mapping.xml
~~~

Creamos el enlace simbólico apuntando al directorio .guacamole creado anteriormente.

~~~
sudo ln -s /etc/guacamole/guacamole.properties /usr/share/tomcat9/.guacamole/
~~~

Se configuran tanto los usuarios con autoridad para acceder en la aplicación de guacamole y también las conexiones que tendrá creando el fichero user-mapping.xml en /etc/guacamole y configurándolo de la siguiente forma:

~~~
<user-mapping>
        <authorize 
         username="usuario" 
         password="usuario">
                <connection name="Real">
                        <protocol>ssh</protocol>
                        <param name="hostname">192.168.1.74</param>
                        <param name="port">22</param>
                        <param name="username">sergioib</param>
                </connection>
                <connection name="Vagrant">
                        <protocol>ssh</protocol>
                        <param name="hostname">192.168.1.81</param>
                        <param name="port">22</param>
                        <param name="username">sergio</param>
                </connection>
        </authorize>
</user-mapping>
~~~

En este caso el usuario con autoridad para acceder a la aplicación de guacamole sera usuario con una contraseña usuario y podrá establecer 2 conexiones, una a mi maquina real y otra creada en vagrant. En este caso al no contar aun con una base de datos, los usuarios que se creen entraran logueados como usuarios normales, ya que para crear un usuarios administrador es necesario que haya una base de datos creada.

Se le asigna a tomcat permisos sobre el fichero user-mapping:

~~~
sudo chmod 600 /etc/guacamole/user-mapping.xml 
sudo chown tomcat:tomcat /etc/guacamole/user-mapping.xml
~~~

* ¿Has necesitado instalar alguna librería?¿Has necesitado instalar un conector de una base de datos?

Si, para poder instalar de forma correcta guacamole son necesarias varias librerias:

Librerias obligatorias:

libcairo2-dev libjpeg-dev libpng-dev libossp-uuid-dev libtool

Dependiendo del uso que se le vaya a dar a guacamole hay otras librerias que son opcionales:

libavutil-dev libswscale-dev libpango1.0-dev libssh2-1-dev libtelnet-dev libvncserver-dev libpulse-dev libssl-dev libvorbis-dev libwebp-dev 

Comprobamos que guacamole realmente esta funcionando

![Guacamole server](/images/guacamole/Guacamole-server.png)

* Una vez instalado guacamole, realizaremos la configuración necesaria en apache2 y tomcat (utilizando el protocolo AJP) para que la aplicación sea servida por el servidor web.
	
El protocolo AJP no funciona en guacamole, por lo que en su lugar se creará y configurará un proxy inverso con apache.

Empezamos instalando apache2 en nuestro servidor

~~~
sudo apt install apache2
~~~

Para configurar nuestro proxy inverso tenemos que configurar varias lineas en /var/lib/tomcat9/conf/server.xml

Lo primero sera descomentar las siguientes lineas, en caso de que estén comentadas:

~~~
<Connector port="8080" protocol="HTTP/1.1"
               connectionTimeout="20000"
               URIEncoding="UTF-8"
               redirectPort="8443" />
~~~

Ademas de estas lineas, tendremos que añadir las siguientes al final del fichero, en el apartado host:

~~~
<Valve className="org.apache.catalina.valves.RemoteIpValve"
               internalProxies="127.0.0.1"
               remoteIpHeader="x-forwarded-for"
               remoteIpProxiesHeader="x-forwarded-by"
               protocolHeader="x-forwarded-proto" />
~~~

Después de configurar el fichero server.xml, habilitamos los módulos necesarios de apache2 para configurar mas adelante nuestro proxy, estos módulos serán mod_proxy y mod_proxy_http.

~~~
sudo a2enmod proxy
sudo a2enmod proxy_http
~~~

Ahora pasamos a configurar nuestro fichero de configuración en apache, en este caso como fichero de configuración se ha usado el fichero por defecto 000.default.conf, añadiendo en el las siguientes lineas.

~~~
<VirtualHost *:80>

        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/html
        ServerName guacamole.sergio.org

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        ProxyPreserveHost On
        ProxyRequests Off
        ProxyPass / http://127.0.0.1:8080/guacamole/
        ProxyPassReverse / http://127.0.0.1:8080/guacamole/
</VirtualHost>
~~~

Reiniciamos el servicio de apache para que los cambios se guarden y añadimos el ServerName al /etc/hosts de la maquina real para comprobar que realmente funciona.

* Comprobamos que la aplicación esta funcionando servida por apache2.

Ponemos en el navegador el nombre que le hemos dado en apache a la aplicacion, en mi caso guacamole.sergio.org y comprobamos que se nos abre la aplicación de guacamole.

![guacamole inicio](/images/guacamole/guacamole_inicio.png)

Accedemos a través del usuario y contraseña configurados anterior mente en el fichero user-mapping.xml.

![guacamole](/images/guacamole/guacamole.png)

En la parte inferior se nos muestran las dos conexiones configuradas anteriormente, una a mi maquina real, y otra a una maquina vagrant, comprobamos que realmente guacamole funciona conectándonos como ejemplo a la maquina real.

![conexion guacamole](/images/guacamole/conexion_guacamole.png)

Comprobamos que funciona la aplicación perfectamente.

### **Autentificación a través de base de datos** ###

Instalamos en este caso la base de datos postgresql

~~~
sudo apt install postgresql
~~~

Para poder hacer uso de este tipo de autentificación sera necesario descargar 2 ficheros:

El primero guacamole-auth-jdbc:

~~~
wget http://archive.apache.org/dist/guacamole/1.2.0/binary/guacamole-auth-jdbc-1.2.0.tar.gz
~~~

Extraemos el contenido del paquete y creamos en /etc/guacamole/ un directorio /extensions donde a continuación se tendrá que poner el fichero .jar que esta en guacamole-auth-jdbc-1.2.0/postgresql/

~~~
tar -xvf guacamole-auth-jdbc-1.2.0.tar.gz 
root@Guacd:~# mv guacamole-auth-jdbc-1.2.0/postgresql/guacamole-auth-jdbc-postgresql-1.2.0.jar /etc/guacamole/extensions/
~~~

Nos descargamos también el conector postgres necesario para que guacamole use la base de datos.

~~~
wget https://jdbc.postgresql.org/download/postgresql-42.2.18.jar
~~~

Creamos un directorio /lib en /etc/guacamole/ donde pondremos el fichero postgres.jar instalado anteriormente

~~~
mv postgresql-42.2.18.jar /etc/guacamole/lib/
~~~

Una vez hecho esto, se podrá empezar a crear la base de datos metiéndonos como usuario postgres (por defecto no trae contraseña, por lo que hay que ponérsela)

Ya logueados como usuario postgres, creamos la base de datos

~~~
createdb guacamole_db
~~~

Creamos las tablas y el usuario administrador de guacamole cargando el esquema por defecto en la base de datos creada 

~~~
postgres@Guacd:/home/vagrant/guacamole-auth-jdbc-1.2.0/postgresql$ cat schema/*.sql | psql -d guacamole_db -f -
~~~

Entramos en la base de datos para crear un usuario y asignarle algunos permisos sobre la base de datos creada.

~~~
postgres@Guacd:~$ psql -d guacamole_db
psql (11.9 (Debian 11.9-0+deb10u1))
Type "help" for help.

guacamole_db=# CREATE USER sergio WITH PASSWORD 'uaurio01';
CREATE ROLE
guacamole_db=# GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO sergio;
GRANT
guacamole_db=# GRANT SELECT,USAGE ON ALL SEQUENCES IN SCHEMA public TO sergio;
GRANT
~~~

De esta forma el usuario sergio tendrá permisos para hacer select, inserts, updates, deletes sobre todas las tablas del esquema cargado anteriormente. Para poder autentificarnos mediante la base de datos, tendremos que modificar nuestro fichero guacamole.properties añadiendo las siguientes lineas:

~~~
postgresql-hostname: localhost
postgresql-port: 5432
postgresql-database: guacamole_db
postgresql-username: sergio
postgresql-password: uaurio01
~~~

De esta forma contaremos con un usuario a parte del administrador para acceder a nuestro guacamole. Ahora probamos a crear una conexión remota accediendo como administrador.

![admin](/images/guacamole/admin.png)

Una vez que hemos accedido como admin, en el apartado de configuración, vamos a conexiones y una vez ahí probamos a crear la conexión que hemos hecho anteriormente con el usuario normal a nuestra maquina.

![creacion conexion](/images/guacamole/creacion_conexion.png)

Los parámetros a configurar son los mismos que se configuran en user-pammipn.xml, al guardar esta conexion, volvemos al inicio y podremos acceder sin problemas a la maquina.

![conexion autentificada](/images/guacamole/conexion_autentificada.png)

Probamos tambien a conectarnos a alguna de las maquinas del escenario openstack con el que contamos, en este caso nos conectamos a Dulcinea.

![conexion Dulcinea](/images/guacamole/conexion_dulcinea.png)