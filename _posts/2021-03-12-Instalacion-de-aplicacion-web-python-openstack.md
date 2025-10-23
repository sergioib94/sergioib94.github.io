---
title: "Instalacion de Mezzanine en Openstack"
date: 2021-03-12T16:01:48+01:00
categories: [Aplicaciones Web]
excerpt: "En este post vamos a desplegar un CMS python basado en django, en este caso se ha elegido Mezzanine."
---

### **Introducción** ###

En este post vamos a desplegar un CMS python basado en django, en este caso se ha elegido Mezzanine.

Para ello contaremos con dos entornos de trabajo, uno sera el entorno de desarrollo que sera mi propia maquina con un entorno virtual, y por otro lado el entorno de produccion que sera el nodo Quijote del entorno openstack creado y la practica de "Creacion de escenario Openstack".

### **Entorno de desarrollo** ###

Creamos el entorno virtual:

~~~
sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv$ python3 -m venv mezzanine
sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv$ source mezzanine/bin/activate
~~~

Instalamos mezzanine:

~~~
(mezzanine) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/mezzanine$ pip install mezzanine
Collecting mezzanine
  Downloading https://files.pythonhosted.org/packages/7f/cf/0f2cbd27edfc9568c7fad26ca217e02d209031e0298562a29040e2b75a5e/Mezzanine-4.3.1-py2.py3-none-any.whl (5.9MB)
    100% |████████████████████████████████| 5.9MB 188kB/s 
Collecting tzlocal>=1.0 (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/5d/94/d47b0fd5988e6b7059de05720a646a2930920fff247a826f61674d436ba4/tzlocal-2.1-py2.py3-none-any.whl
Collecting grappelli-safe>=0.5.0 (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/3e/af/10804d792cfe4eb0029959c55169086e2d4ab02b99d88bd4d85281f48245/grappelli_safe-0.5.2-py2.py3-none-any.whl (163kB)
    100% |████████████████████████████████| 163kB 745kB/s 
Collecting django-contrib-comments (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/67/45/1c55c21d5151e8c39c7991b351bb4fae152ce863bb4b6a1ed35e88f31511/django_contrib_comments-2.0.0-py3-none-any.whl (414kB)
    100% |████████████████████████████████| 419kB 739kB/s 
Collecting future>=0.9.0 (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/45/0b/38b06fd9b92dc2b68d58b75f900e97884c45bedd2ff83203d933cf5851c9/future-0.18.2.tar.gz (829kB)
    100% |████████████████████████████████| 829kB 801kB/s 
Collecting bleach>=2.0 (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/03/c8/b7ed0dfea5cb287907bd22c5ff7c3ed0a65b346f2a4cf916eb9e83be66b3/bleach-3.2.1-py2.py3-none-any.whl (145kB)
    100% |████████████████████████████████| 153kB 1.7MB/s 
Collecting chardet (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/19/c7/fa589626997dd07bd87d9269342ccb74b1720384a4d739a1872bd84fbe68/chardet-4.0.0-py2.py3-none-any.whl (178kB)
    100% |████████████████████████████████| 184kB 1.1MB/s 
Collecting requests>=2.1.0 (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/29/c1/24814557f1d22c56d50280771a17307e6bf87b70727d975fd6b2ce6b014a/requests-2.25.1-py2.py3-none-any.whl (61kB)
    100% |████████████████████████████████| 61kB 1.3MB/s 
Collecting requests-oauthlib>=0.4 (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/a3/12/b92740d845ab62ea4edf04d2f4164d82532b5a0b03836d4d4e71c6f3d379/requests_oauthlib-1.3.0-py2.py3-none-any.whl
Collecting filebrowser-safe>=0.5.0 (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/77/f2/373598a98fe4643f4e2aeb99b2af5861a8cff75e0ab814f056b91f4d9c76/filebrowser_safe-0.5.0-py2.py3-none-any.whl (230kB)
    100% |████████████████████████████████| 235kB 1.5MB/s 
Collecting beautifulsoup4>=4.5.3 (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/d1/41/e6495bd7d3781cee623ce23ea6ac73282a373088fcd0ddc809a047b18eae/beautifulsoup4-4.9.3-py3-none-any.whl (115kB)
    100% |████████████████████████████████| 122kB 1.3MB/s 
Collecting django<1.12,>=1.8 (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/49/49/178daa8725d29c475216259eb19e90b2aa0b8c0431af8c7e9b490ae6481d/Django-1.11.29-py2.py3-none-any.whl (6.9MB)
    100% |████████████████████████████████| 7.0MB 152kB/s 
Collecting pillow (from mezzanine)
  Downloading https://files.pythonhosted.org/packages/eb/8e/d2f7a67cf8da9b83c1e3ee38dbf49448f3c8acb2cb38f76e4301f4a70223/Pillow-8.1.0-cp37-cp37m-manylinux1_x86_64.whl (2.2MB)
    100% |████████████████████████████████| 2.2MB 485kB/s 
Collecting pytz (from tzlocal>=1.0->mezzanine)
  Downloading https://files.pythonhosted.org/packages/89/06/2c2d3034b4d6bf22f2a4ae546d16925898658a33b4400cfb7e2c1e2871a3/pytz-2020.5-py2.py3-none-any.whl (510kB)
    100% |████████████████████████████████| 512kB 959kB/s 
Collecting six>=1.9.0 (from bleach>=2.0->mezzanine)
  Using cached https://files.pythonhosted.org/packages/ee/ff/48bde5c0f013094d729fe4b0316ba2a24774b3ff1c52d924a8a4cb04078a/six-1.15.0-py2.py3-none-any.whl
Collecting packaging (from bleach>=2.0->mezzanine)
  Downloading https://files.pythonhosted.org/packages/b1/a7/588bfa063e7763247ab6f7e1d994e331b85e0e7d09f853c59a6eb9696974/packaging-20.8-py2.py3-none-any.whl
Collecting webencodings (from bleach>=2.0->mezzanine)
  Downloading https://files.pythonhosted.org/packages/f4/24/2a3e3df732393fed8b3ebf2ec078f05546de641fe1b667ee316ec1dcf3b7/webencodings-0.5.1-py2.py3-none-any.whl
Collecting certifi>=2017.4.17 (from requests>=2.1.0->mezzanine)
  Downloading https://files.pythonhosted.org/packages/5e/a0/5f06e1e1d463903cf0c0eebeb751791119ed7a4b3737fdc9a77f1cdfb51f/certifi-2020.12.5-py2.py3-none-any.whl (147kB)
    100% |████████████████████████████████| 153kB 756kB/s 
Collecting urllib3<1.27,>=1.21.1 (from requests>=2.1.0->mezzanine)
  Using cached https://files.pythonhosted.org/packages/f5/71/45d36a8df68f3ebb098d6861b2c017f3d094538c0fb98fa61d4dc43e69b9/urllib3-1.26.2-py2.py3-none-any.whl
Collecting idna<3,>=2.5 (from requests>=2.1.0->mezzanine)
  Using cached https://files.pythonhosted.org/packages/a2/38/928ddce2273eaa564f6f50de919327bf3a00f091b5baba8dfa9460f3a8a8/idna-2.10-py2.py3-none-any.whl
Collecting oauthlib>=3.0.0 (from requests-oauthlib>=0.4->mezzanine)
  Downloading https://files.pythonhosted.org/packages/05/57/ce2e7a8fa7c0afb54a0581b14a65b56e62b5759dbc98e80627142b8a3704/oauthlib-3.1.0-py2.py3-none-any.whl (147kB)
    100% |████████████████████████████████| 153kB 1.3MB/s 
Collecting soupsieve>1.2; python_version >= "3.0" (from beautifulsoup4>=4.5.3->mezzanine)
  Downloading https://files.pythonhosted.org/packages/02/fb/1c65691a9aeb7bd6ac2aa505b84cb8b49ac29c976411c6ab3659425e045f/soupsieve-2.1-py3-none-any.whl
Collecting pyparsing>=2.0.2 (from packaging->bleach>=2.0->mezzanine)
  Using cached https://files.pythonhosted.org/packages/8a/bb/488841f56197b13700afd5658fc279a2025a39e22449b7cf29864669b15d/pyparsing-2.4.7-py2.py3-none-any.whl
Building wheels for collected packages: future
  Running setup.py bdist_wheel for future ... error
  Complete output from command /home/sergioib/Escritorio/Informatica/Virtualenv/mezzanine/bin/python3 -u -c "import setuptools, tokenize;__file__='/tmp/pip-install-_8krtl_r/future/setup.py';f=getattr(tokenize, 'open', open)(__file__);code=f.read().replace('\r\n', '\n');f.close();exec(compile(code, __file__, 'exec'))" bdist_wheel -d /tmp/pip-wheel-cdnpy4r_ --python-tag cp37:
  usage: -c [global_opts] cmd1 [cmd1_opts] [cmd2 [cmd2_opts] ...]
     or: -c --help [cmd1 cmd2 ...]
     or: -c --help-commands
     or: -c cmd --help
  
  error: invalid command 'bdist_wheel'
  
  ----------------------------------------
  Failed building wheel for future
  Running setup.py clean for future
Failed to build future
Installing collected packages: pytz, tzlocal, grappelli-safe, django, django-contrib-comments, future, six, pyparsing, packaging, webencodings, bleach, chardet, certifi, urllib3, idna, requests, oauthlib, requests-oauthlib, filebrowser-safe, soupsieve, beautifulsoup4, pillow, mezzanine
  Running setup.py install for future ... done
Successfully installed beautifulsoup4-4.9.3 bleach-3.2.1 certifi-2020.12.5 chardet-4.0.0 django-1.11.29 django-contrib-comments-2.0.0 filebrowser-safe-0.5.0 future-0.18.2 grappelli-safe-0.5.2 idna-2.10 mezzanine-4.3.1 oauthlib-3.1.0 packaging-20.8 pillow-8.1.0 pyparsing-2.4.7 pytz-2020.5 requests-2.25.1 requests-oauthlib-1.3.0 six-1.15.0 soupsieve-2.1 tzlocal-2.1 urllib3-1.26.2 webencodings-0.5.1
~~~

Creamos el fichero requirements:

~~~
pip freeze > requirements.txt
~~~

fichero requirements:

~~~
beautifulsoup4==4.9.3
bleach==3.2.1
certifi==2020.12.5
chardet==4.0.0
Django==1.11.29
django-contrib-comments==2.0.0
filebrowser-safe==0.5.0
future==0.18.2
grappelli-safe==0.5.2
idna==2.10
Mezzanine==4.3.1
oauthlib==3.1.0
packaging==20.8
Pillow==8.1.0
pkg-resources==0.0.0
pyparsing==2.4.7
pytz==2020.5
requests==2.25.1
requests-oauthlib==1.3.0
six==1.15.0
soupsieve==2.1
tzlocal==2.1
urllib3==1.26.2
webencodings==0.5.1
~~~

De los requeriments, tendremos que borrar pkg-resources==0.0.0 para evitar futuros conflictos.

Creamos el proyecto mezzanine:

~~~
mezzanine-project cmspython

(mezzanine) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/mezzanine$ python3 cmspython/manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, blog, conf, contenttypes, core, django_comments, forms, galleries, generic, pages, redirects, sessions, sites, twitter
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying auth.0007_alter_validators_add_error_messages... OK
  Applying auth.0008_alter_user_username_max_length... OK
  Applying sites.0001_initial... OK
  Applying blog.0001_initial... OK
  Applying blog.0002_auto_20150527_1555... OK
  Applying blog.0003_auto_20170411_0504... OK
  Applying conf.0001_initial... OK
  Applying core.0001_initial... OK
  Applying core.0002_auto_20150414_2140... OK
  Applying django_comments.0001_initial... OK
  Applying django_comments.0002_update_user_email_field_length... OK
  Applying django_comments.0003_add_submit_date_index... OK
  Applying pages.0001_initial... OK
  Applying forms.0001_initial... OK
  Applying forms.0002_auto_20141227_0224... OK
  Applying forms.0003_emailfield... OK
  Applying forms.0004_auto_20150517_0510... OK
  Applying forms.0005_auto_20151026_1600... OK
  Applying forms.0006_auto_20170425_2225... OK
  Applying galleries.0001_initial... OK
  Applying galleries.0002_auto_20141227_0224... OK
  Applying generic.0001_initial... OK
  Applying generic.0002_auto_20141227_0224... OK
  Applying generic.0003_auto_20170411_0504... OK
  Applying pages.0002_auto_20141227_0224... OK
  Applying pages.0003_auto_20150527_1555... OK
  Applying pages.0004_auto_20170411_0504... OK
  Applying redirects.0001_initial... OK
  Applying sessions.0001_initial... OK
  Applying sites.0002_alter_domain_unique... OK
  Applying twitter.0001_initial... OK
~~~

Creamos el superusuario:

~~~
(mezzanine) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/mezzanine$ python3 cmspython/manage.py createsuperuser
Username (leave blank to use 'sergioib'): sergioib
Email address: sergio_hd_sony@hotmail.com
Password: cmspython
Password (again): cmspython 
Superuser created successfully.


(mezzanine) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/mezzanine$ python3 cmspython/manage.py runserver
              .....
          _d^^^^^^^^^b_
       .d''           ``b.
     .p'                `q.
    .d'                   `b.
   .d'                     `b.   * Mezzanine 4.3.1
   ::                       ::   * Django 1.11.29
  ::    M E Z Z A N I N E    ::  * Python 3.7.3
   ::                       ::   * SQLite 3.27.2
   `p.                     .q'   * Linux 4.19.0-13-amd64
    `p.                   .q'
     `b.                 .d'
       `q..          ..p'
          ^q........p^
              ''''

Performing system checks...

System check identified no issues (0 silenced).
January 17, 2021 - 13:04:43
Django version 1.11.29, using settings 'cmspython.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
~~~

Una vez instalado personalizaremos la página cambiando por ejemplo el nombre al blog y añadimos contenido (algún artículo con alguna imagen por ejemplo).

En la página de administración en el menú de configuración(settings) podemos cambiar de nombre nuestro blog mientras que el articulo con la imagen lo podemos añadir en el apartado blog posts.

Ejemplo de nombre:

![mezzanine](/assets/images/mezzanine/mezzanine1.png)

Ejemplo de post:

![mezzanine](/assets/images/mezzanine/mezzanine2.png)

![mezzanine post](/assets/images/mezzanine/mezzanine_post.png)

Guardamos los ficheros generados durante la instalación en un repositorio github. Guardaremos también en ese repositorio la copia de seguridad de la bese de datos. 

Por otro lado hay que tener en cuenta que en el entorno de desarrollo voy a tener una base de datos sqlite mientras que en el entorno de producción base de datos una mariadb, por lo tanto es recomendable para hacer la copia de seguridad y recuperarla los comandos: python manage.py dumpdata y python manage.py loaddata.

Copiamos la base de datos en un fichro .json

~~~
(mezzanine) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/mezzanine$ python3 cmspython/manage.py dumpdata > cmspython/copiabd.json
~~~

Se sube todo a github

Realizamos el despliegue de la aplicación en el entorno de producción (servidor web y servidor de base de datos en el cloud). Utilizamos un entorno virtual. Como servidor de aplicación puedes usar gunicorn o uwsgi (creando una unidad systemd para gestionar este servicio). El contenido estático debe servirlo el servidor web. La aplicación será accesible en la url python.tunombre.gonzalonazareno.org.

### **Entorno de produccion (centos8)** ###

Clonamos el directorio github dentro del documentroot.

~~~
[centos@quijote www]$ sudo git clone https://github.com/sergioib94/cmspython.git
~~~

En sancho tendremos que añadir python al dns como CNAME de quijote

~~~
GNU nano 3.2                                      /var/cache/bind/db.interna.gonzalonazareno.org                                                

$TTL    604800
@       IN      SOA     freston.sergio.gonzalonazareno.org. root.iesgn.org. (
                              5         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
@       IN      NS      freston.sergio.gonzalonazareno.org.

$ORIGIN sergio.gonzalonazareno.org.

dulcinea        IN      A       10.0.1.5
sancho  IN      A       10.0.1.8
freston IN      A       10.0.1.3
quijote IN      A       10.0.2.5
www     IN      CNAME   quijote
bd      IN      CNAME   sancho
ldap    IN      CNAME   freston
python  IN      CNAME   quijote
~~~

Creamos el entorno virtual en quijote

~~~
python3 -m venv mezzanine
source mezzanine/bin/activate
~~~

Se instalan los paquetes del requirement

~~~
(mezzanine) [centos@quijote cmspython]$ pip install -r requirements.txt 
Collecting beautifulsoup4==4.9.3 (from -r requirements.txt (line 1))
  Retrying (Retry(total=4, connect=None, read=None, redirect=None, status=None)) after connection broken by 'ReadTimeoutError("HTTPSConnectionPool(host='files.pythonhosted.org', port=443): Read timed out. (read timeout=15)",)': /packages/d1/41/e6495bd7d3781cee623ce23ea6ac73282a373088fcd0ddc809a047b18eae/beautifulsoup4-4.9.3-py3-none-any.whl
  Downloading https://files.pythonhosted.org/packages/d1/41/e6495bd7d3781cee623ce23ea6ac73282a373088fcd0ddc809a047b18eae/beautifulsoup4-4.9.3-py3-none-any.whl (115kB)
    100% |████████████████████████████████| 122kB 629kB/s 
Collecting bleach==3.2.1 (from -r requirements.txt (line 2))
  Downloading https://files.pythonhosted.org/packages/03/c8/b7ed0dfea5cb287907bd22c5ff7c3ed0a65b346f2a4cf916eb9e83be66b3/bleach-3.2.1-py2.py3-none-any.whl (145kB)
    100% |████████████████████████████████| 153kB 1.6MB/s 
Collecting certifi==2020.12.5 (from -r requirements.txt (line 3))
  Downloading https://files.pythonhosted.org/packages/5e/a0/5f06e1e1d463903cf0c0eebeb751791119ed7a4b3737fdc9a77f1cdfb51f/certifi-2020.12.5-py2.py3-none-any.whl (147kB)
    100% |████████████████████████████████| 153kB 1.9MB/s 
Collecting chardet==4.0.0 (from -r requirements.txt (line 4))
  Downloading https://files.pythonhosted.org/packages/19/c7/fa589626997dd07bd87d9269342ccb74b1720384a4d739a1872bd84fbe68/chardet-4.0.0-py2.py3-none-any.whl (178kB)
    100% |████████████████████████████████| 184kB 1.4MB/s 
Collecting Django==1.11.29 (from -r requirements.txt (line 5))
  Downloading https://files.pythonhosted.org/packages/49/49/178daa8725d29c475216259eb19e90b2aa0b8c0431af8c7e9b490ae6481d/Django-1.11.29-py2.py3-none-any.whl (6.9MB)
    100% |████████████████████████████████| 7.0MB 106kB/s 
Collecting django-contrib-comments==2.0.0 (from -r requirements.txt (line 6))
  Downloading https://files.pythonhosted.org/packages/67/45/1c55c21d5151e8c39c7991b351bb4fae152ce863bb4b6a1ed35e88f31511/django_contrib_comments-2.0.0-py3-none-any.whl (414kB)
    100% |████████████████████████████████| 419kB 1.6MB/s 
Collecting filebrowser-safe==0.5.0 (from -r requirements.txt (line 7))
  Downloading https://files.pythonhosted.org/packages/77/f2/373598a98fe4643f4e2aeb99b2af5861a8cff75e0ab814f056b91f4d9c76/filebrowser_safe-0.5.0-py2.py3-none-any.whl (230kB)
    100% |████████████████████████████████| 235kB 2.2MB/s 
Collecting future==0.18.2 (from -r requirements.txt (line 8))
  Downloading https://files.pythonhosted.org/packages/45/0b/38b06fd9b92dc2b68d58b75f900e97884c45bedd2ff83203d933cf5851c9/future-0.18.2.tar.gz (829kB)
    100% |████████████████████████████████| 829kB 872kB/s 
Collecting grappelli-safe==0.5.2 (from -r requirements.txt (line 9))
  Downloading https://files.pythonhosted.org/packages/3e/af/10804d792cfe4eb0029959c55169086e2d4ab02b99d88bd4d85281f48245/grappelli_safe-0.5.2-py2.py3-none-any.whl (163kB)
    100% |████████████████████████████████| 163kB 2.2MB/s 
Collecting idna==2.10 (from -r requirements.txt (line 10))
  Downloading https://files.pythonhosted.org/packages/a2/38/928ddce2273eaa564f6f50de919327bf3a00f091b5baba8dfa9460f3a8a8/idna-2.10-py2.py3-none-any.whl (58kB)
    100% |████████████████████████████████| 61kB 2.3MB/s 
Collecting Mezzanine==4.3.1 (from -r requirements.txt (line 11))
  Downloading https://files.pythonhosted.org/packages/7f/cf/0f2cbd27edfc9568c7fad26ca217e02d209031e0298562a29040e2b75a5e/Mezzanine-4.3.1-py2.py3-none-any.whl (5.9MB)
    100% |████████████████████████████████| 5.9MB 158kB/s 
Collecting oauthlib==3.1.0 (from -r requirements.txt (line 12))
  Downloading https://files.pythonhosted.org/packages/05/57/ce2e7a8fa7c0afb54a0581b14a65b56e62b5759dbc98e80627142b8a3704/oauthlib-3.1.0-py2.py3-none-any.whl (147kB)
    100% |████████████████████████████████| 153kB 2.8MB/s 
Collecting packaging==20.8 (from -r requirements.txt (line 13))
  Downloading https://files.pythonhosted.org/packages/b1/a7/588bfa063e7763247ab6f7e1d994e331b85e0e7d09f853c59a6eb9696974/packaging-20.8-py2.py3-none-any.whl
Collecting Pillow==8.1.0 (from -r requirements.txt (line 14))
  Downloading https://files.pythonhosted.org/packages/b6/c0/442d9d87e0da00bf856ef6dd4916f84a2d710b5f1a367d42d7f3c4e99a6c/Pillow-8.1.0-cp36-cp36m-manylinux1_x86_64.whl (2.2MB)
    100% |████████████████████████████████| 2.2MB 372kB/s 
Collecting pyparsing==2.4.7 (from -r requirements.txt (line 15))
  Downloading https://files.pythonhosted.org/packages/8a/bb/488841f56197b13700afd5658fc279a2025a39e22449b7cf29864669b15d/pyparsing-2.4.7-py2.py3-none-any.whl (67kB)
    100% |████████████████████████████████| 71kB 5.0MB/s 
Collecting pytz==2020.5 (from -r requirements.txt (line 16))
  Downloading https://files.pythonhosted.org/packages/89/06/2c2d3034b4d6bf22f2a4ae546d16925898658a33b4400cfb7e2c1e2871a3/pytz-2020.5-py2.py3-none-any.whl (510kB)
    100% |████████████████████████████████| 512kB 1.4MB/s 
Collecting requests==2.25.1 (from -r requirements.txt (line 17))
  Downloading https://files.pythonhosted.org/packages/29/c1/24814557f1d22c56d50280771a17307e6bf87b70727d975fd6b2ce6b014a/requests-2.25.1-py2.py3-none-any.whl (61kB)
    100% |████████████████████████████████| 61kB 4.6MB/s 
Collecting requests-oauthlib==1.3.0 (from -r requirements.txt (line 18))
  Downloading https://files.pythonhosted.org/packages/a3/12/b92740d845ab62ea4edf04d2f4164d82532b5a0b03836d4d4e71c6f3d379/requests_oauthlib-1.3.0-py2.py3-none-any.whl
Collecting six==1.15.0 (from -r requirements.txt (line 19))
  Downloading https://files.pythonhosted.org/packages/ee/ff/48bde5c0f013094d729fe4b0316ba2a24774b3ff1c52d924a8a4cb04078a/six-1.15.0-py2.py3-none-any.whl
Collecting soupsieve==2.1 (from -r requirements.txt (line 20))
  Downloading https://files.pythonhosted.org/packages/02/fb/1c65691a9aeb7bd6ac2aa505b84cb8b49ac29c976411c6ab3659425e045f/soupsieve-2.1-py3-none-any.whl
Collecting tzlocal==2.1 (from -r requirements.txt (line 21))
  Downloading https://files.pythonhosted.org/packages/5d/94/d47b0fd5988e6b7059de05720a646a2930920fff247a826f61674d436ba4/tzlocal-2.1-py2.py3-none-any.whl
Collecting urllib3==1.26.2 (from -r requirements.txt (line 22))
  Downloading https://files.pythonhosted.org/packages/f5/71/45d36a8df68f3ebb098d6861b2c017f3d094538c0fb98fa61d4dc43e69b9/urllib3-1.26.2-py2.py3-none-any.whl (136kB)
    100% |████████████████████████████████| 143kB 846kB/s 
Collecting webencodings==0.5.1 (from -r requirements.txt (line 23))
  Downloading https://files.pythonhosted.org/packages/f4/24/2a3e3df732393fed8b3ebf2ec078f05546de641fe1b667ee316ec1dcf3b7/webencodings-0.5.1-py2.py3-none-any.whl
Installing collected packages: soupsieve, beautifulsoup4, pyparsing, packaging, six, webencodings, bleach, certifi, chardet, pytz, Django, django-contrib-comments, filebrowser-safe, future, grappelli-safe, idna, urllib3, requests, oauthlib, requests-oauthlib, tzlocal, Pillow, Mezzanine
  Running setup.py install for future ... done
Successfully installed Django-1.11.29 Mezzanine-4.3.1 Pillow-8.1.0 beautifulsoup4-4.9.3 bleach-3.2.1 certifi-2020.12.5 chardet-4.0.0 django-contrib-comments-2.0.0 filebrowser-safe-0.5.0 future-0.18.2 grappelli-safe-0.5.2 idna-2.10 oauthlib-3.1.0 packaging-20.8 pyparsing-2.4.7 pytz-2020.5 requests-2.25.1 requests-oauthlib-1.3.0 six-1.15.0 soupsieve-2.1 tzlocal-2.1 urllib3-1.26.2 webencodings-0.5.1
You are using pip version 9.0.3, however version 20.3.3 is available.
You should consider upgrading via the 'pip install --upgrade pip' command.
~~~

De paso actualizamos también el comando pip ya que nuestra maquina centos cuenta con una versión muy inferior a la actual:

~~~
(mezzanine) [centos@quijote cmspython]$ pip install --upgrade pip
Collecting pip
  Downloading https://files.pythonhosted.org/packages/54/eb/4a3642e971f404d69d4f6fa3885559d67562801b99d7592487f1ecc4e017/pip-20.3.3-py2.py3-none-any.whl (1.5MB)
    100% |████████████████████████████████| 1.5MB 614kB/s 
Installing collected packages: pip
  Found existing installation: pip 9.0.3
    Uninstalling pip-9.0.3:
      Successfully uninstalled pip-9.0.3
Successfully installed pip-20.3.3
~~~

Una vez hecho esto, creamos la base de datos y el usuario en mariadb de sancho

~~~
root@sancho:/home/ubuntu# mysql -u root -p
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 243
Server version: 10.3.25-MariaDB-0ubuntu0.20.04.1 Ubuntu 20.04

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> CREATE USER 'mezzanine'@10.0.2.5 IDENTIFIED BY 'mezzanine;'
    -> ;
Query OK, 0 rows affected (0.048 sec)

MariaDB [(none)]> CREATE DATABASE mezzanine;

MariaDB [(none)]> GRANT ALL privileges ON `mezzanine`.* TO 'mezzanine'@'10.0.2.5';
~~~

instalamos el modulo wsgi

~~~
[centos@quijote ~]$ sudo dnf install python3-mod_wsgi
~~~

instalamos también los paquetes gcc y python3-level

~~~
[centos@quijote ~]$ sudo dnf install gcc python3-devel

(mezzanine) [centos@quijote ~]$ pip install uwsgi
Collecting uwsgi
  Downloading uWSGI-2.0.19.1.tar.gz (803 kB)
     |████████████████████████████████| 803 kB 824 kB/s 
Using legacy 'setup.py install' for uwsgi, since package 'wheel' is not installed.
Installing collected packages: uwsgi
    Running setup.py install for uwsgi ... done
Successfully installed uwsgi-2.0.19.1
~~~

Volvemos a quijote y modificamos el fichero settings.py indicando la base de datos que se va ha utilizar y además de indicar la base de datos a usar, hay que indicar también el allowed_host (python.sergio.gonzalonazareno.org).

~~~
DATABASES = {
    "default": {
        # Add "postgresql_psycopg2", "mysql", "sqlite3" or "oracle".
        "ENGINE": "django.db.backends.mysql",
        # DB name or path to database file if using sqlite3.
        "NAME": "mezzanine",
        # Not used with sqlite3.
        "USER": "mezzanine",
        # Not used with sqlite3.
        "PASSWORD": "mezzanine;",
        # Set to empty string for localhost. Not used with sqlite3.
        "HOST": "10.0.1.8",
        # Set to empty string for default. Not used with sqlite3.
        "PORT": "",
    }
}
~~~

Ejecutamos un migrate para mandar los datos de nuestra aplicación mezzanine a la base de datos

~~~
(mezzanine) [centos@quijote cmspython]$ python3 manage.py migrate
~~~

Una vez se haya hecho el migrate, ejecutamos python3 loaddata migrate

Creamos los ficheros .conf en /etc/httpd/sites-aviables:

fichero mezzanine.conf:

~~~
<VirtualHost *:80>
    ServerName python.sergio.gonzalonazareno.org
    DocumentRoot /var/www/cmspython/cmspython
    ErrorLog /var/www/cmspyrhon/log/error.log
    CustomLog /var/www/cmspython/log/requests.log combined

    <Proxy "unix:/run/php-fpm/www.sock|fcgi://php-fpm">
    ProxySet disablereuse=off
    </Proxy>

    <FilesMatch \.php$>
           SetHandler proxy:fcgi://php-fpm
    </FilesMatch>

    Redirect permanent / https://python.sergio.gonzalonazareno.org
</Virtualhost>
~~~

fichero mezzanine_https.conf

~~~
<VirtualHost *:443>
    ServerName python.sergio.gonzalonazareno.org
    DocumentRoot /var/www/cmspython/cmspython
    ErrorLog /var/www/cmspython/log/error.log
    CustomLog /var/www/cmspython/log/requests.log combined

    <Proxy "unix:/run/php-fpm/www.sock|fcgi://php-fpm">
    ProxySet disablereuse=off
    </Proxy>

    <FilesMatch \.php$>
           SetHandler proxy:fcgi://php-fpm
    </FilesMatch>

    Alias /static "/var/www/cmspython/cmspython/static"

    <Directory /var/www/cmspython/cmspython/static>
    Require all granted
    Options FollowSymlinks
    </Directory>
    ProxyPass /static !
    ProxyPass / http://127.0.0.1:8080/

    SSLEngine on
    SSLCertificateFile /etc/pki/tls/certs/sergio.ibanez.crt
    SSLCertificateKeyFile /etc/pki/tls/private/sergio.ibanez.key

</VirtualHost>
~~~

iniciamos uwsgi usando un fichero .ini y comprobamos que el sitio funciona correctamente.

~~~
(mezzanine) [centos@quijote ~]$ uwsgi uwsgi.ini
~~~