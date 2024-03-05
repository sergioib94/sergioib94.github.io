---
title: "Introduccion a la Integracion Continua"
date: 2021-03-12T18:12:40+01:00
categories: [Aplicaciones Web]
excerpt: "La integración continua es una práctica de desarrollo de software mediante la cual los desarrolladores combinan los cambios en el código en un repositorio central de forma periódica, tras lo cual se ejecutan versiones y pruebas automáticas."
---

### **Introducción** ###

La integración continua es una práctica de desarrollo de software mediante la cual los desarrolladores combinan los cambios en el código en un repositorio central de forma periódica, tras lo cual se ejecutan versiones y pruebas automáticas. 

Los objetivos clave de la integración continua consisten en encontrar y arreglar errores con mayor rapidez, mejorar la calidad del software y reducir el tiempo que se tarda en validar y publicar nuevas actualizaciones de software.

### **Integración continua de aplicación Django (test + deploy)** ###

Vamos a trabajar con el repositorio de la aplicación django_tutorial. Esta aplicación tiene definidas una serie de test, que podemos estudiar en el fichero tests.py del directorio polls.

Para ejecutar las pruebas unitarias, ejecutamos la instrucción python3 manage.py test.

Clonamos nuestro repositorio github en nuestro entorno virtual:

~~~
(IC) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/IC$ git clone git@github.com:sergioib94/django_tutorial.git
Clonando en 'django_tutorial'...
remote: Enumerating objects: 51, done.
remote: Counting objects: 100% (51/51), done.
remote: Compressing objects: 100% (41/41), done.
remote: Total 143 (delta 9), reused 36 (delta 6), pack-reused 92
Recibiendo objetos: 100% (143/143), 4.37 MiB | 898.00 KiB/s, listo.
Resolviendo deltas: 100% (33/33), listo.
~~~

Instalamos los requirements

~~~
(IC) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/IC/django_tutorial$ pip install -r requirements.txt
Collecting asgiref==3.3.0 (from -r requirements.txt (line 1))
  Using cached https://files.pythonhosted.org/packages/c0/e8/578887011652048c2d273bf98839a11020891917f3aa638a0bc9ac04d653/asgiref-3.3.0-py3-none-any.whl
Collecting Django==3.1.3 (from -r requirements.txt (line 2))
  Using cached https://files.pythonhosted.org/packages/7f/17/16267e782a30ea2ce08a9a452c1db285afb0ff226cfe3753f484d3d65662/Django-3.1.3-py3-none-any.whl
Collecting pytz==2020.4 (from -r requirements.txt (line 3))
  Using cached https://files.pythonhosted.org/packages/12/f8/ff09af6ff61a3efaad5f61ba5facdf17e7722c4393f7d8a66674d2dbd29f/pytz-2020.4-py2.py3-none-any.whl
Collecting sqlparse==0.4.1 (from -r requirements.txt (line 4))
  Using cached https://files.pythonhosted.org/packages/14/05/6e8eb62ca685b10e34051a80d7ea94b7137369d8c0be5c3b9d9b6e3f5dae/sqlparse-0.4.1-py3-none-any.whl
Installing collected packages: asgiref, pytz, sqlparse, Django
Successfully installed Django-3.1.3 asgiref-3.3.0 pytz-2020.4 sqlparse-0.4.1
~~~

Testeo de django tutorial:

~~~
(IC) sergioib@debian-sergio:~/Escritorio/Informatica/Virtualenv/IC/django_tutorial$ python3 manage.py test
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..........
----------------------------------------------------------------------
Ran 10 tests in 0.027s

OK
Destroying test database for alias 'default'...
~~~

Estudia las distintas pruebas que se han realizado, y modifica el código de la aplicación (debes modificar el fichero views.py o los templates, no debes cambiar el fichero tests.py para que al menos una de ella no se ejecute de manera exitosa.

En /django_tutorial/polls/templates/polls/index.html eliminamos la linea "No polls are available" y comprobamos que nos salta el error.

~~~
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
..F.F.....
======================================================================
FAIL: test_future_question (polls.tests.QuestionIndexViewTests)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "/home/sergioib/Escritorio/Informatica/Virtualenv/IC/django_tutorial/polls/tests.py", line 73, in test_future_question
    self.assertContains(response, "No polls are available.")
  File "/home/sergioib/Escritorio/Informatica/Virtualenv/IC/lib/python3.7/site-packages/django/test/testcases.py", line 470, in assertContains
    self.assertTrue(real_count != 0, msg_prefix + "Couldn't find %s in response" % text_repr)
AssertionError: False is not true : Couldn't find 'No polls are available.' in response

======================================================================
FAIL: test_no_questions (polls.tests.QuestionIndexViewTests)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "/home/sergioib/Escritorio/Informatica/Virtualenv/IC/django_tutorial/polls/tests.py", line 51, in test_no_questions
    self.assertContains(response, "No polls are available.")
  File "/home/sergioib/Escritorio/Informatica/Virtualenv/IC/lib/python3.7/site-packages/django/test/testcases.py", line 470, in assertContains
    self.assertTrue(real_count != 0, msg_prefix + "Couldn't find %s in response" % text_repr)
AssertionError: False is not true : Couldn't find 'No polls are available.' in response

----------------------------------------------------------------------
Ran 10 tests in 0.032s

FAILED (failures=2)
Destroying test database for alias 'default'…
~~~

A continuación vamos a configurar la integración continúa para que cada vez que hagamos un commit se haga la ejecución de test en la herramienta de CI/CD que haya elegido.

Una vez comprobado que nos de error, preparamos la integración continua usando github actions. Para usar github actions, lo primero sera acceder a nuestro repositorio en github, en mi caso django_tutorial. Una vez en el repositorio accedemos a la pestaña actions y una vez hay seleccionamos “set up a workflow yourself”, esto nos permitirá editar un fichero yaml para hacer la integración continua.

Fichero.yaml

~~~
# This is a basic workflow to help you get started with Actions

name: CI

# Controls when the action will run. 
on:
  # Triggers the workflow on push or pull request events but only for the master branch
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.9]

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v2
      with:
        python-version: ${{ matrix.python-version }}
    - name: Instalar requerimientos
      run: |
        pip install --upgrade pip
        pip install -r requirements.txt
      
    - name: Probar python3
      run: python3 manage.py test
~~~

Prueba de Funcionamiento correcto:

![integracion continua funcionando](/integracion-continua/buen_ic.png)

Prueba de error:

![error integracion continua](/integracion-continua/error_ic.png)

Crea el pipeline en el sistema de CI/CD para que pase automáticamente los tests. Muestra el fichero de configuración y una captura de pantalla con un resultado exitoso de la IC y otro con un error.

A continuación vamos a realizar el despliegue continuo en un servicio de hosting, por ejemplo heroku.

Entrega un breve descripción de los pasos más importantes para realizar el despliegue desde el sistema de CI/CS y entrega una prueba de funcionamiento donde se compruebe cómo se hace el despliegue automático.

Realizamos el despliegue con heroku:

Dashboard → create new pipeline → le damos nombre y conectamos el repositorio github

Una vez hecho, modificamos el fichero yaml:

~~~
# This is a basic workflow to help you get started with Actions

name: CI

# Controls when the action will run. 
on:
  # Triggers the workflow on push or pull request events but only for the master branch
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:

    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.9]

    steps:
    - uses: actions/checkout@v2
    - uses: akhileshns/heroku-deploy@v3.8.9 # This is the action
      with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "djangotutorialora" #Must be unique in Heroku
          heroku_email: "manuelloraroman@gmail.com"
          procfile: "web: npm start"    

    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v2
      with:
        python-version: ${{ matrix.python-version }}
    - name: Instalar requerimientos
      run: |
        pip install --upgrade pip
        pip install -r requirements.txt
      
    - name: Probar python3
      run: python3 manage.py test
~~~

Por ultimo editamos el fichero settings.py añadiendo al principio la siguiente linea:

~~~
import os
~~~

Y al final la siguiente linea:

~~~
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
~~~

Y hacemos un git push para comprobar la integracion continua en heroku.