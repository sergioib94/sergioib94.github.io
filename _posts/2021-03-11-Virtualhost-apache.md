---
layout: post
title: "Virtualhost apache"
date: 2021-03-11T09:47:06+01:00
categories: [Servicios]
excerpt: "En este post mediando una serie de tareas se configurara un virtualhost apache en un una maquina virtual creada con vagrant."
---

### **Introducción** ###

En este post mediando una serie de tareas se configurara un virtualhost apache en un una maquina virtual creada con vagrant.

¿Que es un virtualhost?

El término Hosting Virtual o vertialhost se refiere a hacer funcionar más de un sitio web (como en este caso www.iesgn.org y www.departamentosgn.org) en una sola máquina. Los sitios web virtuales pueden estar “basados en direcciones IP”, lo que significa que cada sitio web tiene una dirección IP diferente, o “basados en nombres diferentes”, lo que significa que con una sola dirección IP están funcionando sitios web con diferentes nombres (de dominio). Apache fue uno de los primeros servidores web en soportar hosting virtual basado en direcciones IP.

### **Configuración de VirtualHosting** ###

Lo primero sera instalar apache2 en nuestra maquina virtual vagrant.

~~~
sudo apt install apache2
~~~

Una vez descargado apache2, creamos los ficheros.conf que usaran tanto www.iesgn.org como www.departamentosgn.org para ello primero copiamos el 000-default para crearlos y luego los modificamos dejándolos de la siguiente forma:

~~~
vagrant@nodo1:/etc/apache2/sites-available$ sudo cp 000-default.conf iesgn.conf
vagrant@nodo1:/etc/apache2/sites-available$ sudo cp 000-default.conf departamentos.conf
~~~

### **Modificaciones de iesgn.conf y departamentos.conf** ###

* iesgn.conf:

~~~
<VirtualHost *:80>
        ServerAdmin webmaster@localhost
        DocumentRoot /srv/www/iesgn
        ServerName www.iesgn.org
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
~~~

* departamentos.conf:

~~~
<VirtualHost *:80>
        ServerAdmin webmaster@localhost
        DocumentRoot /srv/www/departamentos
        ServerName www.departamentosgn.org
        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
~~~

En estos ficheros lo que haremos sera indicar tanto el ServerName que sera el nombre de nuestro sitio web y el DocumentRoot que es la ruta donde estaran alojadas los documentos que usara nuestro sitio web, en este en srv/www/iesgn y srv/www/departamentos.

Cuando estén configurados, creamos los directorios que alojaran los index de iesgn y departamentos en /srv/www.

~~~
vagrant@nodo1:/srv$ sudo mkdir -p www/iesgn
vagrant@nodo1:/srv$ sudo mkdir -p www/departamentos
~~~

Se configura el fichero apache2.conf para que srv sea accesible dejándolo de la siguiente forma:

~~~
<Directory /srv/www/>
        Options Indexes FollowSymLinks
        AllowOverride None
        Require all granted
</Directory>
~~~

Creamos los enlaces simbólicos de ficheros a apache2/sites-enabled usando para ello el comando a2ensite.

~~~
vagrant@nodo1:/srv/www/iesgn$ sudo a2ensite iesgn.conf
Enabling site iesgn.
To activate the new configuration, you need to run:
  systemctl reload apache2

vagrant@nodo1:/srv/www/departamentos$ sudo a2ensite departamentos.conf 
Enabling site departamento.
To activate the new configuration, you need to run:
  systemctl reload apache2
~~~

Creamos los index en los directorios creados anteriormente.

~~~
vagrant@nodo1:/srv$ sudo touch www/iesgn/index.html
vagrant@nodo1:/srv$ sudo touch www/departamentos/index.html
~~~

Una vez hecho todo reiniciamos el servicio y comprobamos que ambas paginas son accesibles desde nuestro navegador.

~~~
vagrant@nodo1:/srv/www/iesgn$ sudo systemctl restart apache2
~~~

Esto es todo por parte del servidor web, ahora solo quedara modificar el fichero /etc/hosts de nuestra maquina para que se haga una conversion entre los nombres de los dominios y la ip de nuestro servidor de forma que seamos capaces de acceder a las paginas.

### **Prueba de funcionamiento** ###

![iesgn.org](/images/virtualhosting/iesgn.png)

![departamentosgn.org](/images/virtualhosting/depart.png)