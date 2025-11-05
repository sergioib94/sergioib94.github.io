---
title: "Configuración Apache con .htaccess"
date: 2021-03-11T16:17:14+01:00
categories: [Servicios]
excerpt: "En el siguiente post se irán indicando los pasos o tareas para ir configurando Apache con .htaccess, para ello lo primero sera darnos de alta en un proveedor de hosting como puede ser en este caso 000.webhost (gratuito)."
card_image: /assets/images/cards/apache.png
---

### Introducción ###

En Apache, los archivos .htaccess permiten modificar la configuración del servidor web a nivel de directorio sin necesidad de acceder al archivo principal apache2.conf o httpd.conf.

Estos archivos son útiles en entornos donde no tenemos acceso directo al servidor (por ejemplo, en un proveedor de hosting compartido como 000webhost).

En este post veremos cómo usar .htaccess para realizar configuraciones básicas: mostrar listados de ficheros, redirigir URLs y proteger directorios mediante autenticación.

**La directiva AllowOverride**

La directiva AllowOverride en Apache define qué directivas pueden sobrescribirse mediante archivos .htaccess.

Se configura en el archivo principal del servidor (apache2.conf o 000-default.conf), dentro de un bloque <Directory>:

~~~
<Directory /var/www/html>
    AllowOverride All
</Directory>
~~~

* AllowOverride None: desactiva .htaccess.
* AllowOverride All: permite que el archivo .htaccess tenga efecto.

En proveedores de hosting compartido, esta opción suele venir ya habilitada, pero en un entorno local de Apache deberías activarla manualmente.

* Date de alta en un proveedor de hosting. ¿Si necesitamos configurar el servidor web que han configurado los administradores del proveedor?, ¿qué podemos hacer? Explica la directiva AllowOverride de apache2. Utilizando archivos .htaccess realiza las siguientes configuraciones:

Se ha dado de alta en 000.webhost

* Tarea1: Habilita el listado de ficheros en la URL http://host.dominio/nas.

Configuramos el fichero .htaccess añadiéndole la siguiente linea:

~~~
Options +Indexes
~~~

Esto habilita la opción Indexes, que permite mostrar los ficheros del directorio si no existe un index.html.

Creamos una carpeta llamada nas y un par de ficheros para hacer una prueba de funcionamiento.

![prueba de listado](/assets/images/htaccess/ejercicio6-1.png)

* Tarea2: Crea una redirección permanente: cuando entremos en http://host.dominio/google salte a www.google.es.

Queremos que al acceder a http://host.dominio/google se redirija automáticamente a www.google.es, por lo que en el fichero .htaccess introducimos la siguiente linea para crear la redirección:

~~~
RedirectMatch 301 /google http://www.google.es
~~~

* RedirectMatch permite aplicar expresiones regulares para coincidencias de ruta.
* El código 301 indica que se trata de una redirección permanente.

Creamos una carpeta llamada google y al acceder a http://host.dominio/google, seremos redirigidos a la página de Google.

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

![prueba de autentificación](/assets/images/htaccess/ejercicio6-3.png)

### Conclusión ###

En este post hemos aprendido a utilizar archivos .htaccess para modificar la configuración de Apache sin acceso al servidor principal.
Hemos visto cómo habilitar el listado de ficheros, crear redirecciones y proteger carpetas con autenticación básica.

Estas configuraciones son especialmente útiles cuando trabajamos en entornos compartidos o de hosting gratuito, donde no podemos editar la configuración global del servidor.