---
title: "Mapeo URL Virtualhost"
date: 2021-03-11T09:54:31+01:00
categories: [Servicios]
excerpt: "En el siguiente post se creara un nuevo host virtual en vagrant y se realizara una configuracion para mapear urls."
---

* Crea un nuevo host virtual que es accedido con el nombre www.mapeo.com, cuyo DocumentRoot sea /srv/mapeo.

Creación del fichero .conf

~~~
vagrant@nodo1:/etc/apache2/sites-available$ sudo cp 000-default.conf mapeo.conf
~~~

Modificaciones en mapeo.conf

~~~
<VirtualHost *:80>
        ServerAdmin webmaster@localhost
        DocumentRoot /srv/mapeo
        ServerName www.mapeo.com
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
~~~

Creamos el directorio en srv

~~~
vagrant@nodo1:/srv$ sudo mkdir -p mapeo/principal
vagrant@nodo1:/srv$ chown -R www-data:www-data mapeo/ 
~~~

Configuración apache2

~~~
<Directory /srv/>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
</Directory>
~~~

Creación del enlace simbólico

~~~
vagrant@nodo1:/srv/mapeo$ sudo a2ensite mapeo.conf
~~~

* Tarea 1: Cuando se entre a la dirección www.mapeo.com se redireccionará automáticamente a www.mapeo.com/principal, donde se mostrará el mensaje de bienvenida.

Para hacer la redirección lo primero será crear el directorio principal en /srv/mapeo y dentro del directorio principal un pequeño index.html con el mensaje de bienvenida. Una vez hecho esto en el fichero mapeo.conf se tendrá que añadir la siguiente linea para que la redirección funcione.

~~~
RedirectMatch 301 ^/$ http://www.mapeo.com/principal/ 
~~~

Con la linea anterior se indicara una redirección permanente (301) a la ruta /principal.

![pagina principal](/mapeo-url/principal.png)

* Tarea 2: En el directorio principal no se permite ver la lista de los ficheros, no se permite que se siga los enlaces simbólicos y no se permite negociación de contenido. Muestra al profesor el funcionamiento. ¿Qué configuración tienes que poner?

Options: Determina para que sirven las siguientes opciones de funcionamiento:

All → Todas las opciones salvo multiviews
FollowSymLinks → Se pueden seguir los enlaces simbólicos.
Indexes → En el caso de acceder a un directorio y no encontrar un index.html, se mostrara la lista de ficheros del directorio.
MultiViews → Dependiendo del usuario que acceda al sitio web, se muestra un contenido u otro, como por ejemplo el idioma.
SymLinksOwnerMatch → Se pueden seguir los enlaces simbólicos siempre y cuando el destino y el enlace simbólico sean del mismo propietario.
ExecCGI → Permite usar script CGI.

Determina como funciona si delante de las opciones pongo el signo + o -.

En el caso de usar “+” activamos la opcion y en el caso de usar “-”, la desactivamos. En este caso como se pide que en el directorio principal no se vea lista de ficheros, ni enlaces simbólicos ni negociación de contenido, la configuración seria la siguiente:

~~~
<Directory /srv/mapeo/principal>
	Options -Indexes -FollowSymLinks -Multiviews
	AllowOverride All
	Require all granted
</Directory>
~~~

* Tarea 3: Si accedes a la página www.mapeo.com/principal/documentos se visualizarán los documentos que hay en /home/usuario/doc. Por lo tanto se permitirá el listado de fichero y el seguimiento de enlaces simbólicos siempre que el propietario del enlace y del fichero al que apunta sean el mismo usuario. Explica bien y pon una prueba de funcionamiento donde se vea bien el seguimiento de los enlaces simbólicos. 

Para empezar en /home/vagrant, se creara un directorio con unos ficheros a los que se les a llamado prueba.txt. Después se configurara en el fichero mapeo.conf un alias añadiendo la siguiente linea:

~~~
Alias /principal/documentos /home/vagrant/doc
~~~ 

Luego en este mismo mapeo.conf o bien en apache2.conf se configurará el directory del directorio /doc de la siguiente forma:

~~~
Directory /home/vagrant/doc>
        Options Indexes SymLinksIfOwnerMatch
        AllowOverride All
        Require all granted
</Directory>
~~~

Por ultimo para comprobar que funciona se crearan los enlaces simbólicos en /srv/mapeo/principal/documentos apuntando a los ficheros creados previamente en /home/vagrant/doc

~~~
vagrant@nodo1:/srv/mapeo/principal/documentos$ sudo ln -s /home/vagrant/doc/prueba1.txt
vagrant@nodo1:/srv/mapeo/principal/documentos$ sudo chown -R www-data:www-data prueba1.txt 
vagrant@nodo1:/srv/mapeo/principal/documentos$ sudo ln -s /home/vagrant/doc/prueba2.txt
vagrant@nodo1:/srv/mapeo/principal/documentos$ sudo chown www-data:www-data prueba2.txt 
~~~ 

Con los comandos anteriores creamos los enlaces simbólicos y los cambiamos de propietario, de esta forma tanto el fichero1 como el enlace al fichero1 serán de www-data, mientras que el fichero2 sera de www-data y el enlace de root, quedando los ficheros de la siguiente forma:

~~~
vagrant@nodo1:~$ ls -l /srv/mapeo/principal/documentos/
total 0
lrwxrwxrwx 1 www-data www-data 29 Oct 22 10:06 prueba1.txt -> /home/vagrant/doc/prueba1.txt
lrwxrwxrwx 1 root     root     29 Oct 22 10:08 prueba2.txt -> /home/vagrant/doc/prueba2.txt
vagrant@nodo1:~$ ls -l /home/vagrant/doc/
total 8
-rw-r--r-- 1 www-data www-data 28 Oct 22 16:13 prueba1.txt
-rw-r--r-- 1 www-data www-data 24 Oct 22 16:13 prueba2.txt
~~~

De esta forma al acceder a /documentos en un navegador se nos mostraran ambos ficheros, pero solo se podrá acceder al contenido del fichero1 ya que es el único de los dos cuyo propietario es el mismo tanto en fichero como en enlace.

Pruebas de funcionamiento:

fichero1:

![primer fichero](/mapeo-url/fichero1.png)

fichero2

![forbiden](/mapeo-url/forbiden.png)

En este caso el error 403 del fichero2 sale personalizado ya que es el ultimo ejercicio que hice, pero no se nos permite el acceso ya que los propietarios de fichero y enlace no son los mismos.

* Tarea 4: En todo el host virtual se debe redefinir los mensajes de error de objeto no encontrado y no permitido. Para el ello se crearan dos ficheros html dentro del directorio error. Entrega las modificaciones necesarias en la configuración y una comprobación del buen funcionamiento.

Para los mensajes de error personalizados empezamos creando un directorio errores con dos ficheros html con los errores que vamos a personalizar, en este caso el 404 y el 403, este directorio errores estará ubicado en /srv/mapeo.

Una vez creados el directorio y los ficheros.html, se configuraran dos cosas en el fichero mapeo.conf:

Primero, crear un alias para que resulte mas sencillo poner la ruta hacia los ficheros.html en lugar de poner la ruta completa

~~~
Alias /error /srv/mapeo/errores
~~~

Segundo usar las lineas ErrorDocument de forma que que cuando salte un error, se muestre el mensaje personalizado que se ha creado anteriormente de la siguiente forma:

~~~
ErrorDocument 404 /error/404.html
ErrorDocument 403 /error/403.html
~~~

Ejecutamos un systemctl reload apache2 como root y comprobamos que se muestren los mensajes.

Error 404:

![error 404](/mapeo-url/error_404.png)

Error 403:

![error 403](/mapeo-url/error_403.png)