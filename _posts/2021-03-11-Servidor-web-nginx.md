---
layout: single
title: "Servidor Web Nginx"
date: 2021-03-11T16:43:41+01:00
categories: [Servicios]
excerpt: "NGINX es un servidor web open source de alta performance que ofrece el contenido estático de un sitio web de forma rápida y fácil de configurar. Ofrece recursos de equilibrio de carga, proxy inverso y streaming, además de gestionar miles de conexiones simultáneas. El resultado de sus aportes es una mayor velocidad y escalabilidad."
---

## **Introducción** ##

NGINX es un servidor web open source de alta performance que ofrece el contenido estático de un sitio web de forma rápida y fácil de configurar. Ofrece recursos de equilibrio de carga, proxy inverso y streaming, además de gestionar miles de conexiones simultáneas. El resultado de sus aportes es una mayor velocidad y escalabilidad.

Además de otras tareas, los servidores web son los encargados de la entrega de aplicaciones web, respondiendo a peticiones HTTPS realizadas por usuarios, normalmente desde un navegador web.

El funcionamiento base de Nginx es similar al de otros servidores web, en el que un usuario realiza una petición a través del navegador al servidor, y este le envía la información solicitada al navegador.

Lo que hace diferente a Nginx es su arquitectura a la hora de manejar procesos, ya que otros servidores web como Apache crean un hilo por cada solicitud.

## **Servidor web Nginx** ##

* Tarea 1: Creamos una máquina en el cloud (openstack) con una red pública. Añadimos la clave pública del profesor a la máquina para poder comprobarla por ssh. Instalamos el servidor web nginx en la máquina. Modificamos la página index.html que viene por defecto y accede a ella desde nuestro navegador.

Instalamos Ngingx en nuestra maquina:

Para instalar Nginx vamos a usar el repositorio de Debian, así que lo primero será actualizar la información de paquetes.

~~~
sudo su
apt update
apt upgrade
~~~
Instalamos el paquete nginx

~~~
apt install nginx
~~~

Modificamos el html y visualizamos nuestro sitio

~~~
root@servidor-nginx:/var/www/html# nano index.html 
~~~

* Entrega una captura de pantalla accediendo a ella.

Configuración de index.html default:

~~~
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Bienvenido al sitio web de sergio</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
~~~

Funcionamiento:

![inicio](/images/nginx/nginx1.png)

### **Virtualhosting** ###

Queremos que nuestro servidor web ofrezca dos sitios web, teniendo en cuenta lo siguiente:

* Cada sitio web tendrá nombres distintos.

* Cada sitio web compartirán la misma dirección IP y el mismo puerto (80).
Los dos sitios web tendrán las siguientes características:

* El nombre de dominio del primero será www.iesgn.org, su directorio base será /srv/www/iesgn y contendrá una página llamada index.html, donde sólo se verá una bienvenida a la página del Instituto Gonzalo Nazareno.
      
* En el segundo sitio vamos a crear una página donde se pondrán noticias por parte de los departamento, el nombre de este sitio será departamentos.iesgn.org, y su directorio base será /srv/www/departamentos. En este sitio sólo tendremos una página inicial index.html, dando la bienvenida a la página de los departamentos del instituto.

* Tarea 2: Configuramos la resolución estática en los clientes y muestra el acceso a cada una de las páginas.

Empezamos haciendo un cp de default para así crear los ficheros de configuración de los dos sitios web y una vez creados los configuramos de la siguiente forma:

Iesgn:

~~~
server {
    listen 80;
    listen [::]:80;

    root /srv/www/iesgn;

    index index.html index.htm index.nginx-debian.html;

    server_name www.iesgn.org;

    location / {
                try_files $uri $uri/ =404;
    }
}
~~~

departamentos:

~~~
server {
    listen 80;
    listen [::]:80;

    root /srv/www/departamentos;

    # Add index.php to the list if you are using PHP
    index index.html index.htm index.nginx-debian.html;

    server_name departamentos.iesgn.org;

    location / {
        try_files $uri $uri/ =404;
    }
}
~~~

Creamos los enlaces simbólicos con el comando ln -s ya que nginx no cuenta con el comando a2ensite como apache.

Prueba de funcionamiento:

iesgn

![iesgn](/images/nginx/nginx2.png)

departamentos:

![departamentos.iesgn](/images/nginx/nginx3.png)

### **Mapeo URL** ###

Cambia la configuración del sitio web www.iesgn.org para que se comporte de la siguiente forma:

* Tarea 3: Cuando se entre a la dirección www.iesgn.org se redireccionará automáticamente a www.iesgn.org/principal, donde se mostrará el mensaje de bienvenida. En el directorio principal no se permite ver la lista de los ficheros, no se permite que se siga los enlaces simbólicos y no se permite negociación de contenido. Muestra al profesor el funcionamiento.

Lo primero sera crear el directorio principal en /srv/www/iesgn y dentro de este directorio el index.html dando la bienvenida a iesgn. Luego configuraremos la redirección en el fichero iesgn creado anteriormente de la siguiente forma:

~~~
server {
    listen 80;
    listen [::]:80;

    root /srv/www/iesgn;

    index index.html index.htm index.nginx-debian.html;

    server_name www.iesgn.org;

    location / {
            return 301 http://www.iesgn.org/principal;
    }
    location /principal {
            try_files $uri $uri/ =404;
    }
}
~~~

Reiniciamos nginx para que se cargue la nueva configuración ejecutando systemctl restart gnix o bien systemctl reload gnix (como root).

* Tarea 4: Si accedes a la página www.iesgn.org/principal/documentos se visualizarán los documentos que hay en /srv/doc. Por lo tanto se permitirá el listado de fichero y el seguimiento de enlaces simbólicos siempre que sean a ficheros o directorios cuyo dueño sea el usuario. Muestra al profesor el funcionamiento.

Creamos el directorio doc en srv y una vez creado, configuramos un alias en iesgn de la siguiente forma:

~~~
server {
    listen 80;
    listen [::]:80;

    root /srv/www/iesgn;

    index index.html index.htm index.nginx-debian.html;

    server_name www.iesgn.org;

    #Redireccion
    location / {
            return 301 http://www.iesgn.org/principal;
    }

    location /principal {
            try_files $uri $uri/ =404;
    }

    location /principal/documentos {
            try_files $uri $uri/ =404;
            alias /srv/doc;
            autoindex on;
            disable_symlinks if_not_owner;
    }
~~~

Creamos algunos ficheros, uno cuyo usuario sea el mismo propietario que el enlace simbólico y otro en el que fichero y enlace tengan distintos propietarios para comprobar el funcionamiento:

~~~
debian@nginx:/srv/www/iesgn/principal/documentos$ sudo ln -s /srv/doc/ficherodata 
debian@nginx:/srv/www/iesgn/principal/documentos$ sudo ln -s /srv/doc/ficherousuario 
debian@nginx:/srv/www/iesgn/principal/documentos$ sudo chown -R www-data:www-data ficherodata
~~~

Propietarios de los ficheros:

~~~
debian@nginx:/srv/www/iesgn/principal/documentos$ ls -l
total 0
lrwxrwxrwx 1 www-data www-data 20 Nov  4 11:45 ficherodata -> /srv/doc/ficherodata
lrwxrwxrwx 1 www-data www-data 23 Nov  4 11:45 ficherousuario -> /srv/doc/ficherousuario
debian@nginx:/srv/www/iesgn/principal/documentos$ ls -l /srv/doc/
total 0
-rw-r--r-- 1 www-data www-data 0 Nov  4 11:10 ficherodata
-rw-r--r-- 1 debian   debian   0 Nov  4 11:10 ficherousuario
~~~

* Tarea 5: En todo el host virtual se debe redefinir los mensajes de error de objeto no encontrado y no permitido. Para ello se crearan dos ficheros html dentro del directorio error. Entrega las modificaciones necesarias en la configuración y una comprobación del buen funcionamiento.*

Creamos el directorio errores en /srv/www/iesgn y creamos en el los ficheros de error para no encontrado y prohibido. Después configuramos iesgn para que muestre los mensajes personalizados de la siguiente forma:

~~~
server {
    listen 80;
    listen [::]:80;

    root /srv/www/iesgn;

    index index.html index.htm index.nginx-debian.html;

    server_name www.iesgn.org;

    #Redireccion
    location / {
            return 301 http://www.iesgn.org/principal;
    }

    location /principal {
            try_files $uri $uri/ =404;
    }

    #Alias
    location /principal/documentos {
            try_files $uri $uri/ =404;
            alias /srv/doc;
            autoindex on;
            disable_symlinks if_not_owner;
    }

    #Errores

    error_page 404 /error/404.html;
            location /error/404.html {
                   internal;
            }

    error_page 403 /error/403.html;
            location /error/403.html {
                    internal;
            }
~~~

Prueba de funcionamiento:

![error 404](/images/nginx/nginx6.png)

* Tarea 6: Añade al escenario otra máquina conectada por una red interna al servidor. A la URL departamentos.iesgn.org/intranet sólo se debe tener acceso desde el cliente de la red local, y no se pueda acceder desde la anfitriona por la red pública. A la URL departamentos.iesgn.org/internet, sin embargo, sólo se debe tener acceso desde la anfitriona por la red pública, y no desde la red local.

Creamos los directorios intranet e internet en /departamentos:

~~~
debian@nginx:~$ sudo mkdir /srv/www/departamentos/intranet
debian@nginx:~$ sudo mkdir /srv/www/departamentos/internet
debian@nginx:~$ sudo touch /srv/www/departamentos/internet/index.html
debian@nginx:~$ sudo touch /srv/www/departamentos/intranet/index.html
~~~

Configuramos departamentos:

~~~
server {
    listen 80;
    listen [::]:80;

    root /srv/www/departamentos;

    index index.html index.htm index.nginx-debian.html;

    server_name departamentos.iesgn.org;

    location / {
            try_files $uri $uri/ =404;
    }
    location /internet {
            deny 172.22.200.0/24;
            allow all;
    }

    location /intranet {
            allow 172.22.200.0/24;
            deny all;
    }
}
~~~

Pruebas de funcionamiento:

Cliente de la red interna (intranet):

Ejecutando w3m departamentos.iesgn.org/intranet

~~~
Bienvenido desde intranet
~~~

Cliente fuera de la red (intranet):

![error 403](/images/nginx/nginx8.png)

Cliente de la red interna (internet):

~~~
                                 403 Forbidden

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                 nginx/1.14.2

~~~

Cliente fuera de la red (internet):

![](/nginx/nginx9.png)

* Tarea 7: Autentificación básica. Limita el acceso a la URL departamentos.iesgn.org/secreto. Comprueba las cabeceras de los mensajes HTTP que se intercambian entre el servidor y el cliente.

Para la configurar la autentificación básica sera necesario instalar apache2-utils. 

~~~
sudo apt install apache2-utils
~~~

Creamos el directorio secreto en /srv/www/departamentos con un fichero y añadimos al fichero de configuración de departamentos las siguientes lineas:

~~~
location /secreto {
                auth_basic "Secreto";
                auth_basic_user_file /etc/nginx/.htpasswd;
~~~

Se añade el usuario al .htpasswd como en apache, de la siguiente forma:

~~~
debian@nginx:/srv/www/departamentos$ sudo htpasswd -c -m /etc/nginx/.htpasswd usuarioNew password: 
Re-type new password: 
Adding password for user usuario
~~~

Prueba de funcionamiento:

!nginx7.png!

Cabeceras http:

~~~
tcpdump: listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
    172.22.200.142.47276 > 10.0.0.8.http: Flags [S], cksum 0x4637 (correct), seq 139924513, win 62370, options [mss 8910,sackOK,TS val 1249792621 ecr 0,nop,wscale 6], length 0
    10.0.0.8.http > 172.22.200.142.47276: Flags [S.], cksum 0x7edb (incorrect -> 0x39b8), seq 2814053701, ack 139924514, win 62286, options [mss 8910,sackOK,TS val 3541337260 ecr 1249792621,nop,wscale 6], length 0
    172.22.200.142.47276 > 10.0.0.8.http: Flags [.], cksum 0x751c (correct), ack 1, win 975, options [nop,nop,TS val 1249792622 ecr 3541337260], length 0
    172.22.200.142.47276 > 10.0.0.8.http: Flags [P.], cksum 0xebec (correct), seq 1:231, ack 1, win 975, options [nop,nop,TS val 1249792622 ecr 3541337260], length 230: HTTP, length: 230
    10.0.0.8.http > 172.22.200.142.47276: Flags [.], cksum 0x7ed3 (incorrect -> 0x743a), ack 231, win 970, options [nop,nop,TS val 3541337261 ecr 1249792622], length 0
    10.0.0.8.http > 172.22.200.142.47276: Flags [P.], cksum 0x8058 (incorrect -> 0x57e1), seq 1:390, ack 231, win 970, options [nop,nop,TS val 3541337262 ecr 1249792622], length 389: HTTP, length: 389
    172.22.200.142.47276 > 10.0.0.8.http: Flags [.], cksum 0x72b3 (correct), ack 390, win 969, options [nop,nop,TS val 1249792624 ecr 3541337262], length 0
    10.0.0.8.http > 172.22.200.142.47276: Flags [F.], cksum 0x7ed3 (incorrect -> 0x72b0), seq 390, ack 231, win 970, options [nop,nop,TS val 3541337263 ecr 1249792624], length 0
    172.22.200.142.47276 > 10.0.0.8.http: Flags [.], cksum 0x7287 (correct), ack 391, win 969, options [nop,nop,TS val 1249792666 ecr 3541337263], length 0
    172.22.200.142.47276 > 10.0.0.8.http: Flags [F.], cksum 0x534b (correct), seq 231, ack 391, win 969, options [nop,nop,TS val 1249800661 ecr 3541337263], length 0
    10.0.0.8.http > 172.22.200.142.47276: Flags [.], cksum 0x33e4 (correct), ack 232, win 970, options [nop,nop,TS val 3541345301 ecr 1249800661], length 0
    172.22.200.142.47278 > 10.0.0.8.http: Flags [S], cksum 0x4e42 (correct), seq 1886291091, win 62370, options [mss 8910,sackOK,TS val 1249800662 ecr 0,nop,wscale 6], length 0
    10.0.0.8.http > 172.22.200.142.47278: Flags [S.], cksum 0x7edb (incorrect -> 0xa48d), seq 762774870, ack 1886291092, win 62286, options [mss 8910,sackOK,TS val 3541345301 ecr 1249800662,nop,wscale 6], length 0
    172.22.200.142.47278 > 10.0.0.8.http: Flags [.], cksum 0xdff1 (correct), ack 1, win 975, options [nop,nop,TS val 1249800663 ecr 3541345301], length 0
    172.22.200.142.47278 > 10.0.0.8.http: Flags [P.], cksum 0xfed2 (correct), seq 1:274, ack 1, win 975, options [nop,nop,TS val 1249800663 ecr 3541345301], length 273: HTTP, length: 273
    10.0.0.8.http > 172.22.200.142.47278: Flags [.], cksum 0x7ed3 (incorrect -> 0xdee5), ack 274, win 969, options [nop,nop,TS val 3541345302 ecr 1249800663], length 0
    10.0.0.8.http > 172.22.200.142.47278: Flags [P.], cksum 0x805d (incorrect -> 0xf467), seq 1:395, ack 274, win 969, options [nop,nop,TS val 3541345306 ecr 1249800663], length 394: HTTP, length: 394
	Location: http://departamentos.iesgn.org/secreto/
    10.0.0.8.http > 172.22.200.142.47278: Flags [F.], cksum 0x7ed3 (incorrect -> 0xdd56), seq 395, ack 274, win 969, options [nop,nop,TS val 3541345306 ecr 1249800663], length 0
    172.22.200.142.47278 > 10.0.0.8.http: Flags [.], cksum 0xdd52 (correct), ack 395, win 969, options [nop,nop,TS val 1249800668 ecr 3541345306], length 0
    172.22.200.142.47278 > 10.0.0.8.http: Flags [F.], cksum 0xdd4f (correct), seq 274, ack 396, win 969, options [nop,nop,TS val 1249800669 ecr 3541345306], length 0
    10.0.0.8.http > 172.22.200.142.47278: Flags [.], cksum 0x7ed3 (incorrect -> 0xdd4e), ack 275, win 969, options [nop,nop,TS val 3541345307 ecr 1249800669], length 0
    172.22.200.142.47280 > 10.0.0.8.http: Flags [S], cksum 0xe159 (correct), seq 1069621792, win 62370, options [mss 8910,sackOK,TS val 1249800669 ecr 0,nop,wscale 6], length 0
    10.0.0.8.http > 172.22.200.142.47280: Flags [S.], cksum 0x7edb (incorrect -> 0x2885), seq 1484253550, ack 1069621793, win 62286, options [mss 8910,sackOK,TS val 3541345308 ecr 1249800669,nop,wscale 6], length 0
~~~

* Tarea 8: Vamos a combinar el control de acceso (tarea 6) y la autentificación (tarea 7), y vamos a configurar el virtual host para que se comporte de la siguiente manera: el acceso a la URL departamentos.iesgn.org/secreto se hace forma directa desde la intranet, desde la red pública te pide la autentificación. Muestra el resultado al profesor.

Configuracion de departamentos:

~~~
location /secreto {
            satisfy any;
            allow 172.22.200.0/24;
            deny all;
            auth_basic "Contenido Secreto Nginx";
            auth_basic_user_file /etc/nginx/.htpasswd.txt ;
          }
~~~

Prueba de funcionamiento:

Intranet ejecutando w3m departamentos.iesgn.org/secreto nos muestra el mensaje de la pagina sin autentificación.

~~~
pagina secreta revelada
~~~

Desde fuera de la red interna por el contrario se nos pide autentificacion:

![](/images/nginx/nginx10.png)

![](/images/nginx/nginx11.png)

Como vemos en esta practica es muy similar a la anteriormente hecha usando un virtualhost apache debido a que apache y nginx cumplen la misma funcion, salvo que nginx a demostrado tener mejor rendimiento.