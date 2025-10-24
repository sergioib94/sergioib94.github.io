---
title: "Aplicaciones PHP en OVH"
date: 2021-03-12T10:37:20+01:00
categories: [Aplicaciones Web]
excerpt: "En este post aprenderemos a migrar dos aplicaciones, Drupal y Nextcloud, para ello contamos con un un escenario compuesto por dos maquinas virtuales en redes distintas. La primera maquina virtual estara echa en vagrant y sera la maquina usada en la practica anterior Instalacion local CMS PHP."
card_image: /assets/images/cards/drupal.png
---

## **Introduccion** ##

En este post aprenderemos a migrar dos aplicaciones, Drupal y Nextcloud, para ello contamos con un un escenario compuesto por dos maquinas virtuales en redes distintas. La primera maquina virtual estara echa en vagrant y sera la maquina usada en la practica anterior "Instalacion local CMS PHP".

La segunda maquina estara alojada en OVH y es la maquina hecha en la practica anterior "OVH LEMP".

Lo que haremos sera instalar la aplicacion Nextcloud en la maquina vagrant local y migrar tanto drupal como nextcloud a la maquina OVH.

### **Preparativos y configuración de migracion** ###

La aplicación se tendrá que migrar a un nuevo virtualhost al que se accederá con el nombre portal.iesgnXX.es por lo que empezamos creando el virtualhost Portal, para ello accedemos a /etc/nginx/sites-availables/ y ejecutamos un sudo cp default portal:

Configuración de portal:

~~~
server {
    listen 80;
    listen [::]:80;
    root /srv/www/portal;
    index index.html index.htm index.nginx-debian.html;
    server_name portal.iesgn07.es;
    location / {
            try_files $uri $uri/ =404;
    }
    location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/run/php/php7.3-fpm.sock;
    }
~~~

Reiniciamos el servicio y creamos el enlace simbólico en /etc/nginx/sites-enabled/:

~~~
sudo systemctl restart nginx.service
sudo ln -s /etc/nginx/sites-available/iesgn /etc/nginx/sites-enabled/
~~~

Configuramos en nuestra zona DNS de OVH un nuevo CNAME:

![zona dns en ovh](/assets/images/ovh-aplicaciones-php/zona_dns.png)

Ahora vamos a nombrar el servicio de base de datos que tenemos en producción. Como es un servicio interno no lo vamos a nombrar en la zona DNS, lo vamos a nombrar usando resolución estática. El nombre del servicio de base de datos se llamara bd.iesgnXX.es (XX sera un numero asignado).

Configuramos el fichero /etc/hosts añadiendo la siguiente linea:

~~~
127.0.0.1 bd.iesgn07.es
~~~ 

Una vez configurado el nombre del servicio, configuraremos la base de datos con la siguiente informacion, los recursos que se crearan en la base de datos serán los siguientes:

* Dirección de la base de datos: bd.iesgnXX.es
* Base de datos: bd_drupal
* Usuario: user_drupal
* Password: pass_drupal

Creamos el usuario user_drupal y le asignamos contraseña (como usuario root):

~~~
create user user_drupal;

set password for user_drupal = password('pass_drupal');
~~~

Creamos la base de datos bd_drupal y le damos los permisos necesarios al usuario user_drupal:

~~~
create database bd_drupal;

grant all on bd_drupal.* to user_drupal identified by 'pass_drupal';
~~~

Una vez hecho y configurado todo comenzaremos la migración de la aplicación.

## **Migracion de Drupal** ##

Migramos primero la base de datos de nuestro entorno de desarrollo (local) al entorno de producción(ovh):

En desarrollo enviamos la copia de seguridad previamente creada haciendo uso de scp:

~~~
scp copiadrupalbd.sql debian@146.59.196.89:/home/debian
~~~

Una vez se haya enviado la copia de seguridad, se importan los datos en la base de datos creada anteriormente 

~~~
mysql -u user_drupal -p bd_drupal < copiadrupalbd.sql
~~~

Despues que la base de datos este migrada, pasaremos a migrar la aplicación de drupal:

~~~
scp -r Linux/drupal/ debian@146.59.196.89:/srv/www
~~~

Luego tenemos el directorio drupal en el nuevo servidor, editamos el fichero settings.php (drupal/sites/default/) de la siguiente forma:

~~~
$databases['default']['default'] = array (
  'database' => 'bd_drupal',
  'username' => 'user_drupal',
  'password' => 'pass_drupal',
  'prefix' => '',
  'host' => 'localhost',
  'port' => '3306',
  'namespace' => 'Drupal\\Core\\Database\\Driver\\mysql',
  'driver' => 'mysql',
);
$settings['config_sync_directory'] = 'sites/default/files/config_wGnfMPSoSAYjv-l4ZzdcDPpLHsqA_5AGGtjXvqWd1AafgbBo8fqSjD9SIx7zo6Qhg0OLxY7xvQ/sync';
~~~

A continuacion de esto, al entrar en la pagina obtendremos el siguiente error:

![error inicial](/assets/images/ovh-aplicaciones-php/error_inicial.png)

Este error se debe a que son necesarios varios módulos php7.3 que no están instalados

~~~
sudo apt install php7.3-gd, php7.3-xml y php7.3-mysql
~~~

Cuando estén instalados dichos modulo, comprobamos que realmente funciona y se puede acceder a drupal sin ningún tipo de problema.

![drupal](/assets/images/ovh-aplicaciones-php/proyecto-drupal2.png)

Tendremos que asegurarnos que las URL limpias de drupal siguen funcionando en nginx debido a que en la maquina local no contamos con nginx, sino apache2.

A drupal ahora mismo, tendremos acceso pero solo a la pagina principal no podremos usar nada ya que las url no están limpias, para ello volvemos a modificar el fichero de configuración portal añadiendo /index.php?$args

~~~
server {
    listen 80;
    listen [::]:80;
    root /srv/www/portal;
    index index.html index.htm index.nginx-debian.html;
    server_name portal.iesgn07.es;
    location / {
            try_files $uri $uri/ /index.php?$args;
    }
    location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/run/php/php7.3-fpm.sock;
    }
~~~

Prueba de error accediendo al contenido de drupal:

![error](/assets/images/ovh-aplicaciones-php/error.png)

Prueba de funcionamiento al acceder al mismo sitio, el contenido de nuestro drupal:

![funcionamiento drupal](/assets/images/ovh-aplicaciones-php/protyecto-drupal3.png)

La aplicación debe estar disponible en la URL: portal.iesgnXX.es (Sin ningún directorio) por lo que comprobamos que podemos acceder a drupal desde esa url sin ningún directorio:

![drupal](/ovh-aplicaciones-php/proyecto-drupal2.png)

### **Instalación/migración de la aplicación Nextcloud** ###

Instalamos la aplicación web Nextcloud en nuestra maquina local haciendo uso de wget:

~~~
sudo wget https://download.nextcloud.com/server/releases/nextcloud-20.0.1.zip
~~~

Descomprimimos el fichero descargado en /srv/www/iesgn:

~~~
sudo unzip nextcloud-20.0.1.zip
~~~

Cambiamos de usuario el directorio nextcloud y se lo asignamos a www-data:

~~~
sudo chown -R www-data: /srv/www/nextcloud/
~~~

Una vez hecho esto sera necesario instalar varios módulos php para que nextcloud funcione de forma correcta:

~~~
sudo apt install -y php-bcmath php-curl php-gd php-gmp php-imagick php-intl php-mbstring php-xml php-zip php-acpu
~~~

La instalación de php acpu puede ser opcional, lo que hace es configurar un sistema de cache por si se da el caso de que nuestro sistema tiene mucha carga de trabajo. Cuando este todo instalado reiniciamos apache2 y empezamos a preparar la configuración para usar nextcloud.

Habilitamos el modulo rewrite (solo en caso de usar apache) y creamos un fichero nextcloud.conf con la siguiente configuración en /etc/apache2/sites-available/

~~~
sudo a2enmod rewrite

Nextcloud.conf:

<Directory /srv/www/nextcloud>
		AllowOverride all
		php_value memory_limit "512M"
</Directory>
~~~

Habilitamos el sitio haciendo uso de a2ensite nextcloud.conf y volvemos a reiniciar el servidor. Con esto ya tendremos la configuración preparada y lo siguiente sera preparar la base de datos que en nuestro caso es mysql. Como en este entorno de desarrollo se elimino mysql al migrar la base de datos a otro servidor se tendrá que volver instalar mysql y php-mysql o bien crear la base en el segundo servidor, En este caso se vuelve a instalar mysql en el server1.

Creación de base de datos:

~~~
mysql -u root -p
create database bd_nextcloud;
~~~

Creamos el usuario y le asignamos una contraseña:

~~~
create user nextcloud;
set password for nextcloud = password('pass_next');
~~~

Le asignamos los permisos necesarios al usuario para usar la base de datos creada:

~~~
grant all on bd_nextcloud.* to nextcloud identified by 'pass_next';
~~~

Después de tenerlo todo listo comenzamos con la instalación a través de un navegador web:

!nextcloud.png!

Ya tendremos nextcloud operativo, una vez instalado en caso de haber instalado php-acpu, se tendrá que modificar el fichero config.php en srv/www/nextcloud/config/ añadiendo la siguiente linea al final.

!nextcloud_instalado.png!

~~~
'memcache.local' => '\OC\Memcache\APCu',
);
~~~

Esto se debe a que la cache por defecto no se activa en la instalación. A continuación pasamos a migrar nuestro nextcloud al entorno de producción.

Ahora prodremos realizar la migración al servidor en producción, para que la aplicación sea accesible en la URL: www.iesgnXX.es/cloud

Entorno de desarrollo:

Empezamos haciendo la copia de seguridad de la base de datos y posteriormente haciendo uso de scp, se enviara tanto la copia de seguridad de la base de datos como el directorio nextcloud al entorno de producción.

~~~
scp copianextcloud.sql debian@hades.iesgn07.es:/home/debian
scp -r /srv/www/nextcloud debian@hades.iesgn07.es:/home/debian
~~~

Entorno de producción:

Empezamos a prepararlo todo para usar nextcloud, para empezar moveré el directorio nextcloaud a /srv/www/iesgn cambiándole el nombre por claud y una vez tenga el directorio en esa ubicación, se le cambiara de usuario y grupo y se le asignara a www-data.

~~~
sudo chown -R www-data:www-data cloud/
~~~

Después, al igual que en entorno de desarrollo, para que nextcloud funcione correctamente sera necesario instalar una serie de módulos php:

~~~
sudo apt install -y php-bcmath php-curl php-gd php-gmp php-imagick php-intl php-mbstring php-xml php-zip
~~~

Ahora que están todos los módulos instalados se configurara el sitio iesgn de la siguiente forma:

~~~
server {
    listen 80;
    listen [::]:80;
    root /srv/www/iesgn;
    index index.html index.htm index.nginx-debian.html index.php;
    server_name www.iesgn07.es;
    location / {
            return 301 http://www.iesgn07.es/principal;
    }
    location /principal {
            try_files $uri $uri/ =404;
    }
    location = /robots.txt {
            allow all;
            log_not_found off;
            access_log off;
    }

    location /.well-known {
            rewrite ^/\.well-known/host-meta\.json  /cloud/public.php?service=host-meta-json    last;
            rewrite ^/\.well-known/host-meta        /cloud/public.php?service=host-meta         last;
            rewrite ^/\.well-known/webfinger        /cloud/public.php?service=webfinger         last;
            rewrite ^/\.well-known/nodeinfo         /cloud/public.php?service=nodeinfo          last;

            location = /.well-known/carddav   { return 301 /cloud/remote.php/dav/; }
            location = /.well-known/caldav    { return 301 /cloud/remote.php/dav/; }

            try_files $uri $uri/ =404;
    }

    location ^~ /cloud {
            client_max_body_size 512M;
            fastcgi_buffers 64 4K;

            gzip on;
            gzip_vary on;
            gzip_comp_level 4;
            gzip_min_length 256;
            gzip_proxied expired no-cache no-store private no_last_modified no_etag auth;
            gzip_types application/atom+xml application/javascript application/json application/ld+json application/manifest+json application/rss+xml application/vnd.geo+json application/vnd.ms-fontobject a$

            add_header Referrer-Policy                      "no-referrer"   always;
            add_header X-Content-Type-Options               "nosniff"       always;
            add_header X-Download-Options                   "noopen"        always;
            add_header X-Frame-Options                      "SAMEORIGIN"    always;
            add_header X-Permitted-Cross-Domain-Policies    "none"          always;
            add_header X-Robots-Tag                         "none"          always;
            add_header X-XSS-Protection                     "1; mode=block" always;

            fastcgi_hide_header X-Powered-By;
            index index.php index.html /cloud/index.php$request_uri;

            expires 1m;

    location = /cloud {
        if ( $http_user_agent ~ ^DavClnt ) {
            return 302 /cloud/remote.php/webdav/$is_args$args;
        }
    }

    location ~ ^/cloud/(?:build|tests|config|lib|3rdparty|templates|data)(?:$|/)    { return 404; }
    location ~ ^/cloud/(?:\.|autotest|occ|issue|indie|db_|console)                { return 404; }

    location ~ \.php(?:$|/) {
        fastcgi_split_path_info ^(.+?\.php)(/.*)$;
        set $path_info $fastcgi_path_info;

        try_files $fastcgi_script_name =404;

        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $path_info;

        fastcgi_param modHeadersAvailable true;
        fastcgi_param front_controller_active true;
        fastcgi_pass unix:/run/php/php7.3-fpm.sock;

        fastcgi_intercept_errors on;
        fastcgi_request_buffering off;
    }

    location ~ \.(?:css|js|svg|gif)$ {
        try_files $uri /cloud/index.php$request_uri;
        expires 6M;
        access_log off;
    }

    location ~ \.woff2?$ {
        try_files $uri /cloud/index.php$request_uri;
        expires 7d;
        access_log off;
    }

    location /cloud {
        try_files $uri $uri/ /cloud/index.php$request_uri;
    }
}
~~~

Una vez configurado el sitio, se reinicia nginx y se crea de nuevo la base de datos que usara nextcloud, en este caso como ya tenemos un usuario y contraseña para la base de datos de drupal, se escogerán ese mismo usuario y contraseña para la base de datos de nextcloud.

~~~
create databases bd_nextcloud;
grant all on bd_nextcloud.* to user_drupal identified by 'pass_drupal';
~~~

Después de crear la base de datos y de asignarle los permisos necesarios al usuario, user_drupal, pasamos a importar la base de datos:

~~~
mysql -u user_drupal -p bd_nextcloud < copianextcloud.sql
~~~

Luego configuramos el fichero config.sample.php en /srv/www/iesgn/cloud/config/ rellenando los datos necesarios:

~~~
<?php
$CONFIG = array (
  'instanceid' => 'ockxv791djwa',
  'passwordsalt' => '017uPUlqFzZ5vMuJruRg4588K9KPvp',
  'secret' => 'dBC2OZz/46h+uMbxtcgzDK/yIMX/ipq8mwBfJXXmigC7aK9K',
  'trusted_domains' => 
  array (
    0 => 'www.iesgn07.es',
  ),
  'datadirectory' => '/srv/www/cloud/data',
  'dbtype' => 'mysql',
  'version' => '20.0.1.1',
  'overwrite.cli.url' => 'http://www.iesgn07/cloud',
  'dbname' => 'bd_nextcloud',
  'dbhost' => 'localhost',
  'dbport' => '',
  'dbtableprefix' => 'oc_',
  'mysql.utf8mb4' => true,
  'dbuser' => 'user_drupal',
  'dbpassword' => 'pass_drupal',
  'installed' => true,
  'memcache.local' => '\OC\Memcache\APCu',
);
~~~

La linea memcache.local solo sera necesaria en caso de haber instalado php-apcu anteriormente.

Prueba de funcionamiento de Nextcloud:

![nextcloud migrado](/assets/images/ovh-aplicaciones-php/nextcloud_migrado.png)

* Tarea 3. Instala en un ordenador el cliente de nextcloud y realiza la configuración adecuada para acceder a "tu nube".

Instalamos el cliente de nextcloud:

~~~
sudo apt instalar nextcloud-desktop
~~~

Abrimos nextcloud y al hacerlo nos preguntaran si nos queremos registrar en un proveedor o entrar, en nuestro caso como tenemos un nextcloud montado en nuestro servidor hacemos clic en "Entrar". Después de eso nos preguntara la dirección de nuestro nextcloud:

![](/assets/images/ovh-aplicaciones-php/cliente1.png)

Luego, iniciaremos sesión con nuestro usuario:

![]/images(/ovh-aplicaciones-php/cliente2.png)

A continuación conectamos con nuestro nexclaud del servidor:

![](/assets/images/ovh-aplicaciones-php/cliente3.png)

En este caso se sincronizara el directorio Nextcloud de nuestra maquina, con un directorio llamado Documentos creado en el servidor nextcloud.

Prueba de funcionamiento:

Maquina cliente:

Creamos un fichero llamado prueba_funcionamiento dentro del directorio Nextcloud

~~~
sergioib@debian-sergio:~/Nextcloud$ touch prueba_funcionamiento
~~~

Nextcloud:

![](/assets/images/ovh-aplicaciones-php/cliente5.png)

Probamos a copiar un par de documentos de apuntes en Nextcloud.

Nextcloud:

![](/assets/images/ovh-aplicaciones-php/cliente6.png)

Como podemos comprobar, funciona.
