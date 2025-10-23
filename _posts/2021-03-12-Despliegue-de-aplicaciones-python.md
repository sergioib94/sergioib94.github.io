---
title: "Despliegue de aplicaciones python"
date: 2021-03-12T12:22:28+01:00
categories: [Aplicaciones Web]
excerpt: "En el siguiente post, se realizaran una serie de tarseas con las que se ira mostrando como se realizara un despliegue de aplicaciones python usando para ello nuestro propio equipo como entorno de desarrollo."
---

* Tarea 1: Entorno de desarrollo

Vamos a desarrollar la aplicación del tutorial de django 3.1. Vamos a configurar tu equipo como entorno de desarrollo para trabajar con la aplicación, para ello:

* Realiza un fork del repositorio de GitHub: https://github.com/josedom24/django_tutorial.
* Crea un entorno virtual de python3 e instala las dependencias necesarias para que funcione el proyecto (fichero requirements.txt).

Creamos el entorno virtual:

~~~
sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv$ python3 -m venv practica_despliegue
~~~

Clonamos el repositorio de django-tutorial en el entorno virtual:

~~~
sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/practica_despliegue$ git clone git@github.com:sergioib94/django_tutorial.git
Clonando en 'django_tutorial'...
remote: Enumerating objects: 37, done.
remote: Counting objects: 100% (37/37), done.
remote: Compressing objects: 100% (32/32), done.
remote: Total 129 (delta 4), reused 24 (delta 3), pack-reused 92
Recibiendo objetos: 100% (129/129), 4.25 MiB | 747.00 KiB/s, listo.
Resolviendo deltas: 100% (28/28), listo.
~~~

Instalamos las dependencias con pip para que funcione el proyecto:

~~~
(practica_despliegue) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/practica_despliegue/django_tutorial$ pip install -r requirements.txt
Collecting asgiref==3.3.0 (from -r requirements.txt (line 1))
  Downloading https://files.pythonhosted.org/packages/c0/e8/578887011652048c2d273bf98839a11020891917f3aa638a0bc9ac04d653/asgiref-3.3.0-py3-none-any.whl
Collecting Django==3.1.3 (from -r requirements.txt (line 2))
  Downloading https://files.pythonhosted.org/packages/7f/17/16267e782a30ea2ce08a9a452c1db285afb0ff226cfe3753f484d3d65662/Django-3.1.3-py3-none-any.whl (7.8MB)
    100% |████████████████████████████████| 7.8MB 227kB/s 
Collecting pytz==2020.4 (from -r requirements.txt (line 3))
  Downloading https://files.pythonhosted.org/packages/12/f8/ff09af6ff61a3efaad5f61ba5facdf17e7722c4393f7d8a66674d2dbd29f/pytz-2020.4-py2.py3-none-any.whl (509kB)
    100% |████████████████████████████████| 512kB 2.2MB/s 
Collecting sqlparse==0.4.1 (from -r requirements.txt (line 4))
  Downloading https://files.pythonhosted.org/packages/14/05/6e8eb62ca685b10e34051a80d7ea94b7137369d8c0be5c3b9d9b6e3f5dae/sqlparse-0.4.1-py3-none-any.whl (42kB)
    100% |████████████████████████████████| 51kB 2.1MB/s 
Installing collected packages: asgiref, sqlparse, pytz, Django
Successfully installed Django-3.1.3 asgiref-3.3.0 pytz-2020.4 sqlparse-0.4.1
~~~

* Comprueba que vamos a trabajar con una base de datos sqlite (django_tutorial/settings.py). ¿Cómo se llama la base de datos que vamos a crear?

Vamos ha crear una base de datos db.sqlite3.

* Crea la base de datos: python3 manage.py migrate. A partir del modelo de datos se crean las tablas de la base de datos.

~~~
(practica_despliegue) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/practica_despliegue/django_tutorial$ python3 manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, polls, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  Applying admin.0003_logentry_add_action_flag_choices... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying auth.0007_alter_validators_add_error_messages... OK
  Applying auth.0008_alter_user_username_max_length... OK
  Applying auth.0009_alter_user_last_name_max_length... OK
  Applying auth.0010_alter_group_name_max_length... OK
  Applying auth.0011_update_proxy_permissions... OK
  Applying auth.0012_alter_user_first_name_max_length... OK
  Applying polls.0001_initial... OK
  Applying sessions.0001_initial... OK
~~~

* Crea un usuario administrador: python3 manage.py createsuperuser.

~~~
(practica_despliegue) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/practica_despliegue/django_tutorial$ python3 manage.py createsuperuser
Username (leave blank to use 'sergioib'): debian02
Email address: a@a.com
Password: 
Password (again): 
The password is too similar to the username.
Bypass password validation and create user anyway? [y/N]: y
Superuser created successfully.
~~~

* Ejecuta el servidor web de desarrollo y entra en la zona de administración (\admin) para comprobar que los datos se han añadido correctamente.

Arrancamos nuestro proyecto y en nuestro navegador accedemos a http://127.0.0.1:8000/admin:

~~~
(practica_despliegue) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/practica_despliegue/django_tutorial$ python manage.py runserver
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
November 25, 2020 - 18:19:42
Django version 3.1.3, using settings 'django_tutorial.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
~~~

Acceso a /admin:

![/admin](/assets/images/despliegue-aplicacion-python/admin.png)

* Crea dos preguntas, con posibles respuestas.

Una vez en la zona de administración de nuestro proyecto, en el apartado questions, hacemos clic en add y creamos dos nuevas preguntas con sus respectivas respuestas.

![django](/assets/images/despliegue-aplicacion-python/django2.png)

![django](/assets/images/despliegue-aplicacion-python/django3.png)

* Comprueba en el navegador que la aplicación está funcionando, accede a la url \polls.

Accedemos ahora a http://127.0.0.1:8000/polls para comprobar que la aplicación funciona correctamente:

![django](/assets/images/despliegue-aplicacion-python/django-poll.png)

Comprobamos que se nos muestren las dos preguntas creadas anteriormente y que se nos muestren las posibles respuestas:

![django](/assets/images/despliegue-aplicacion-python/django.poll1.png)

![django](/assets/images/despliegue-aplicacion-python/django-poll2.png)

* Tarea2: entorno de producción

Vamos a realizar el despliegue de nuestra aplicación en un entorno de producción, para ello vamos a utilizar una instancia del cloud, sigue los siguientes pasos:

* Instala en el servidor los servicios necesarios (apache2). Instala el módulo de apache2 para ejecutar código python.

Instalación de apache2:

~~~
sudo apt install apache2
~~~

Instalación del modulo apache2:

~~~
sudo apt install libapache2-mod-wsgi-py3
~~~

* Clona el repositorio en el DocumentRoot de tu virtualhost.

~~~
debian@produccion:/var/www/html$ sudo git clone https://github.com/josedom24/django_tutorial
Cloning into 'django_tutorial'...
remote: Enumerating objects: 37, done.
remote: Counting objects: 100% (37/37), done.
remote: Compressing objects: 100% (32/32), done.
remote: Total 129 (delta 4), reused 24 (delta 3), pack-reused 92
Receiving objects: 100% (129/129), 4.25 MiB | 4.56 MiB/s, done.
Resolving deltas: 100% (28/28), done.
~~~

* Crea un entorno virtual e instala las dependencias de tu aplicación.

Primero instalamos python3-env:

~~~
sudo apt install python3-venv
~~~

Una vez instalado creamos el entorno virtual en /var/www/html/django_tutorial/

~~~
root@produccion:~$ python3 -m venv despliegue
~~~

Instalacion de las dependencias:

~~~
(despliegue) root@produccion:/var/www/html/django_tutorial# pip install -r requirements.txt 
Collecting asgiref==3.3.0 (from -r requirements.txt (line 1))
  Downloading https://files.pythonhosted.org/packages/c0/e8/578887011652048c2d273bf98839a11020891917f3aa638a0bc9ac04d653/asgiref-3.3.0-py3-none-any.whl
Collecting Django==3.1.3 (from -r requirements.txt (line 2))
  Downloading https://files.pythonhosted.org/packages/7f/17/16267e782a30ea2ce08a9a452c1db285afb0ff226cfe3753f484d3d65662/Django-3.1.3-py3-none-any.whl (7.8MB)
    100% |████████████████████████████████| 7.8MB 117kB/s 
Collecting pytz==2020.4 (from -r requirements.txt (line 3))
  Downloading https://files.pythonhosted.org/packages/12/f8/ff09af6ff61a3efaad5f61ba5facdf17e7722c4393f7d8a66674d2dbd29f/pytz-2020.4-py2.py3-none-any.whl (509kB)
    100% |████████████████████████████████| 512kB 1.1MB/s 
Collecting sqlparse==0.4.1 (from -r requirements.txt (line 4))
  Downloading https://files.pythonhosted.org/packages/14/05/6e8eb62ca685b10e34051a80d7ea94b7137369d8c0be5c3b9d9b6e3f5dae/sqlparse-0.4.1-py3-none-any.whl (42kB)
    100% |████████████████████████████████| 51kB 512kB/s 
Installing collected packages: asgiref, sqlparse, pytz, Django
Successfully installed Django-3.1.3 asgiref-3.3.0 pytz-2020.4 sqlparse-0.4.1
~~~

* Instala el módulo que permite que python trabaje con mysql:

~~~
sudo apt install python3-mysqldb
~~~

Y en el entorno virtual:

~~~
(despliegue) root@produccion:/var/www/html/django_tutorial# pip install mysql-connector-python
Collecting mysql-connector-python
  Downloading https://files.pythonhosted.org/packages/8f/eb/4b449ee81b14aada746aa292481d3d522aa20b41cb124b24d6205251dcce/mysql_connector_python-8.0.22-cp37-cp37m-manylinux1_x86_64.whl (18.0MB)
    100% |████████████████████████████████| 18.0MB 47kB/s 
Collecting protobuf>=3.0.0 (from mysql-connector-python)
  Downloading https://files.pythonhosted.org/packages/e0/dd/5c5d156ee1c4dba470d76dac5ae57084829b4e17547f28e9f636ce3fa54b/protobuf-3.14.0-cp37-cp37m-manylinux1_x86_64.whl (1.0MB)
    100% |████████████████████████████████| 1.0MB 448kB/s 
Collecting six>=1.9 (from protobuf>=3.0.0->mysql-connector-python)
  Downloading https://files.pythonhosted.org/packages/ee/ff/48bde5c0f013094d729fe4b0316ba2a24774b3ff1c52d924a8a4cb04078a/six-1.15.0-py2.py3-none-any.whl
Installing collected packages: six, protobuf, mysql-connector-python
Successfully installed mysql-connector-python-8.0.22 protobuf-3.14.0 six-1.15.0
~~~

* Crea una base de datos y un usuario en mysql.

Instalación:

~~~
sudo apt install mariadb-server
~~~

creación de base de datos:

~~~
root@produccion:~# mysql -u root -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 53
Server version: 10.3.23-MariaDB-0+deb10u1 Debian 10

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> create database django;
Query OK, 1 row affected (0.000 sec)
~~~

Creación del usuario:

~~~
MariaDB [(none)]> CREATE USER 'sergio'@%;
Query OK, 0 rows affected (0.003 sec)

MariaDB [(none)]> grant all privileges on django.* to 'sergio'@'%' identified by 'usuario01';
Query OK, 0 rows affected (0.046 sec)
~~~

* Configura la aplicación para trabajar con mysql, para ello modifica la configuración de la base de datos en el archivo settings.py:

~~~
DATABASES = {
    'default': {
        'ENGINE': 'mysql.connector.django',
        'NAME': 'django',
        'USER': 'sergio'
        'PASSWORD': 'usuario01',
        'HOST': 'localhost',
        'PORT': '',
    }
}
~~~

* Como en la tarea 1, realiza la migración de la base de datos que creará la estructura de datos necesarias. comprueba en mariadb que la base de datos y las tablas se han creado.

~~~
(despliegue) root@produccion:/var/www/html/django_tutorial# python3 manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, polls, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  Applying admin.0003_logentry_add_action_flag_choices... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying auth.0007_alter_validators_add_error_messages... OK
  Applying auth.0008_alter_user_username_max_length... OK
  Applying auth.0009_alter_user_last_name_max_length... OK
  Applying auth.0010_alter_group_name_max_length... OK
  Applying auth.0011_update_proxy_permissions... OK
  Applying auth.0012_alter_user_first_name_max_length... OK
  Applying polls.0001_initial... OK
  Applying sessions.0001_initial... OK
~~~

* Crea un usuario administrador

~~~
(despliegue) root@produccion:/var/www/html/django_tutorial# python3 manage.py createsuperuser
Username (leave blank to use 'root'): admin
Email address: a@a.com
Password: 
Password (again):  
Superuser created successfully.
~~~

* Configura un virtualhost en apache2 con la configuración adecuada para que funcione la aplicación. El punto de entrada de nuestro servidor será django_tutorial/django_tutorial/wsgi.py. Puedes guiarte por el Ejercicio: Desplegando aplicaciones flask, por la documentación de django: How to use Django with Apache and mod_wsgi,…

~~~
<VirtualHost *:80>
	ServerName www.sergio-django.iesgn.org
	ServerAdmin webmaster@localhost
	DocumentRoot /var/www/html/django_tutorial

	ErrorLog ${APACHE_LOG_DIR}/error.log
	CustomLog ${APACHE_LOG_DIR}/access.log combined

	WSGIDaemonProcess django user=www-data group=www-data processes=1 threads=5 python-path=/var/www/html/django_tutorial:/var/www/html/django_tutorial/despliegue/lib/python3.7/site-packages
        WSGIScriptAlias / /var/www/html/django_tutorial/django_tutorial/wsgi.py

        <Directory /var/www/html/django_tutorial/django_tutorial>
                WSGIProcessGroup django
                WSGIApplicationGroup %{GLOBAL}
                Require all granted
        </Directory>
</VirtualHost>
~~~

Una vez hecho esto ya podremos accedes a nuestra aplicación desde el navegador:

![dejango](/assets/images/despliegue-aplicacion-python/django1.png)

![despliegue django](/assets/images/despliegue-aplicacion-python/despliegue_django.png)

* Debes asegurarte que el contenido estático se está sirviendo: ¿Se muestra la imagen de fondo de la aplicación? ¿Se ve de forma adecuada la hoja de estilo de la zona de administración?. Para arreglarlo puedes encontrar documentación en How to use Django with Apache and mod_wsgi.

No, en un principio la imagen de fondo no se muestra y la hoja de estilos tampoco, para solucionar esto, añadimos los siguientes alias a nuestro fichero despliegue.conf:

~~~
Alias /static/admin/ /var/www/html/django_tutorial/despliegue/lib/python3.7/site-packages/django/contrib/admin/static/admin/

        <Directory /var/www/html/django_tutorial/despliegue/lib/python3.7/site-packages/django/contrib/admin/static/admin/>
                Require all granted
        </Directory>

Alias /static/polls/ /var/www/html/django_tutorial/polls/static/

        <Directory /var/www/html/django_tutorial/polls/static>
                Require all granted
        </Directory>
~~~

Comprobamos que se vea ya de forma correcta:

![despliegue django](/assets/images/despliegue-aplicacion-python/despliegue_django2.png)

* Desactiva en la configuración (fichero settings.py) el modo debug a False. Para que los errores de ejecución no den información sensible de la aplicación.

~~~
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False
~~~

* Muestra la página funcionando. En la zona de administración se debe ver de forma adecuada la hoja de estilo.

Para probar el funcionamiento creamos una pregunta y entramos en /polls:

![despliegue django](/assets/images/despliegue-aplicacion-python/desoliegue_django3.png)

* Tarea 3: Modificación de nuestra aplicación.

Vamos a realizar cambios en el entorno de desarrollo y posteriormente vamos a subirlas a producción. Vamos a realizar tres modificaciones (entrega una captura de pantalla donde se ven cada una de ellas). Recuerda que primero lo haces en el entrono de desarrollo, y luego tendrás que llevar los cambios a producción:

* Modifica la página inicial donde se ven las encuestas para que aparezca tu nombre: Para ello modifica el archivo django_tutorial/polls/templates/polls/index.html.

Para ello o único que hacemos es introducir en el html una etiqueta h2 con nuestro nombre:

~~~
<h2> Sergio Ibañez Nuñez </h2>
~~~

![primer modificacion](/assets/images/despliegue-aplicacion-python/modificacion1.png)

* Modifica la imagen de fondo que se ve la aplicación.
Vamos a crear una nueva tabla en la base de datos, para ello sigue los siguientes pasos:

Para ello nos descargamos una imagen cualquiera y la guardamos en /polls/static/polls/assets/images/ con el mismo nombre que el fondo actual, background.jpg de forma que se sobrescriban y al actualizar se cambiara el fondo.

![modificacion 2](/assets/images/despliegue-aplicacion-python/modificacion2.png)

* Añade un nuevo modelo al fichero polls/models.py:

~~~
  class Categoria(models.Model):	
  	Abr = models.CharField(max_length=4)
  	Nombre = models.CharField(max_length=50)

  	def __str__(self):
  		return self.Abr+" - "+self.Nombre 		
~~~

* Crea una nueva migración: python3 manage.py makemigrations.

~~~
(practica_despliegue) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/practica_despliegue/django_tutorial$ python3 manage.py makemigrations
Migrations for 'polls':
  polls/migrations/0002_categoria.py
    - Create model Categoria
~~~

* Y realiza la migración: python3 manage.py migrate

~~~
(practica_despliegue) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/practica_despliegue/django_tutorial$ python3 manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, polls, sessions
Running migrations:
  Applying polls.0002_categoria... OK
~~~

* Añade el nuevo modelo al sitio de administración de django:

Para ello cambia la siguiente línea en el fichero polls/admin.py:

~~~
  from .models import Choice, Question
~~~

Por esta otra:

~~~
  from .models import Choice, Question, Categoria
~~~

Y añade al final la siguiente línea:

~~~
  admin.site.register(Categoria)
~~~

Comprobacion:

![modificacion 3](/assets/images/despliegue-aplicacion-python/modificacion3.png)

Despliega el cambio producido al crear la nueva tabla en el entorno de producción.

Una vez hecho todos los cambios en desarrollo, los subimos a github con git push y nos descargamos los cambios en produccion

~~~
root@produccion:/var/www/html/django_tutorial# git pull
remote: Enumerating objects: 26, done.
remote: Counting objects: 100% (26/26), done.
remote: Compressing objects: 100% (8/8), done.
remote: Total 14 (delta 4), reused 14 (delta 4), pack-reused 0
Unpacking objects: 100% (14/14), done.
From https://github.com/sergioib94/django_tutorial
   c10187a..b870dd1  master     -> origin/master
Updating c10187a..b870dd1
Fast-forward
 polls/admin.py                           |   3 ++-
 polls/migrations/0002_categoria.py       |  21 +++++++++++++++++++++
 polls/models.py                          |   7 +++++++
 polls/static/polls/assets/images/background.jpg | Bin 46418 -> 121137 bytes
 polls/templates/polls/index.html         |   4 +++-
 5 files changed, 33 insertions(+), 2 deletions(-)
 create mode 100644 polls/migrations/0002_categoria.py
~~~

Ejecutamos una migración de forma que los cambios hechos en el entorno de desarrollo para asi generar en nuestra base de datos la tabla categorias creada anteriormente. 

~~~
(despliegue) root@produccion:/var/www/html/django_tutorial# python3 manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, polls, sessions
Running migrations:
  Applying polls.0002_categoria... OK
~~~

Recargamos apache y comprobamos los cambios.

![migracion](/assets/images/despliegue-aplicacion-python/migracion.png)

