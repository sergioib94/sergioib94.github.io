---
title: "Configuracion apache con .htaccess"
date: 2021-03-11T16:17:14+01:00
categories: [Servicios]
excerpt: "En el siguiente post se iran indicando los pasos o tareas para ir configurando apache con .htaccess, para ello lo primero sera darnos de alta en un proveedor de hosting como puede ser en este caso 000.webhost (gratuito)."
card_image: /assets/images/cards/apache.png
---

* Date de alta en un proveedor de hosting. ¿Si necesitamos configurar el servidor web que han configurado los administradores del proveedor?, ¿qué podemos hacer? Explica la directiva AllowOverride de apache2. Utilizando archivos .htaccess realiza las siguientes configuraciones:

Se ha dado de alta en 000.webhost

* Tarea1: Habilita el listado de ficheros en la URL http://host.dominio/nas.

Configuramos el fichero .htaccess añadiéndole la siguiente linea:

~~~
Options +Indexes
~~~

Creamos una carpeta llamada nas y un par de ficheros para hacer una prueba de funcionamiento.

![prueba de listado](/assets/images/htaccess/ejercicio6-1.png)

* Tarea2: Crea una redirección permanente: cuando entremos en http://host.dominio/google salte a www.google.es.

En el fichero .htaccess introducimos la siguiente linea para crear la redirección:

~~~
RedirectMatch 301 /google http://www.google.es
~~~

De forma que creamos una carpeta llamada google y al acceder a nuestro host/google nos redirecciona a la pagina de google.

* Tarea3: Pedir autentificación para entrar en la URL http://host.dominio/prohibido. (No la hagas si has elegido como proveedor CDMON, en la plataforma de prueba, no funciona.)

Para que la url nos pida la redirección, lo primero sera crear el directorio prohibido, esto en 000.webhost se hace simplemente haciendo clic en "new folder".

Creamos un fichero .htpasswd indicando un usuario y una contraseña que más adelante el fichero .htaccess usara para validar el acceso, en ese caso he creado un directorio /home/sergio para tener localizado el .htpasswd Una vez creado el directorio prohibido, creamos dentro un fichero .htaccess con la siguiente configuración:

~~~
AuthType Basic
AuthName "contraseña"
AuthUserFile "/home/sergio/.htpasswd"
require valid-user
~~~

Una vez que lo tenemos todo listo, hacemos la prueba de funcionamiento para comprobar si se nos pide usuario y contraseña:

![prueba de autentificacion](/assets/images/htaccess/ejercicio6-3.png)