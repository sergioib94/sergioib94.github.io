---
title: "Creacion blog Pelican"
date: 2021-03-13T22:18:18+01:00
categories: [Aplicaciones Web]
---

### **Instalacion de Pelican** ###

Para poder instalar este gestor de paginas web, ejecutamos apt install pelican y una vez instalado ejecutamos apt install markdown, que es el idioma en el que se escribirán los artículos del blog. Una vez instalados pelican y markdown en nuestro entorno de desarrollo (nuestra máquina) estará listo para usarse.

~~~
apt install pelican
apt install markdown
~~~

### **Configuracion de un sitio web** ###

Para comenzar la configuracion de nuestro sitio web, lo primero sera ejecutar el comando pelican-quickstart donde empezaran a salir preguntas sobre la configuracion que deberan responderse:

~~~
* Where do you want to create your new web site? [.] /home/sergioib/Pelican/Proyecto2

Indicamos donde se van a generar los los archivos una vez que nuestro sitio web se genere.

* What will be the title of this web site? primer proyecto

Le damos un nombre a nuestro sitio web. El nombre en principio no importa demasiado ya que mas adelante, al igual que otros parametros podra modificarse en pelicanconfig.py

* Who will be the author of this web site? Sergio Ibañez

Indicamos el nombre del autor del sitio, es decir de la persona que crea el sitio, no es lo mismo que el autor de los artículos ya que un autor puede tener varios autores.

* What will be the default language of this web site? [es] es

Indicamos el idioma por defecto de nuestro sitio web en formato ISO-639-1, en mi caso "es" de español.

* Do you want to specify a URL prefix? e.g., https://example.com   (Y/n) y

Indicamos si queremos generar una URL como prefijo de nuestra web

* What is your URL prefix? (see above example; no trailing slash) http://www.proyecto2.com

En el caso de haber indicado en la opcion anterior que si, indicamos la URL que tendra nuestro sitio.

* Do you want to enable article pagination? (Y/n) y

Habilitamos la paginación de artículos (esto solo es necesario si se van ha crear varios articulos)

* How many articles per page do you want? [10] 10

Si la opcion anterior la hemos habilitado, indicamos el numero de articulos que apareceran por pagina

* What is your time zone? [Europe/Paris] Europe/Madrid

Indicamos la zona horaria

* Do you want to generate a tasks.py/Makefile to automate generation and publishing? (Y/n) y
~~~

Indicamos si queremos que se generen un archivo markfile y un tasks.py. Esta opcion es muy util habilitarla ya que mas adelante es la opcion que nos permitira automatizar las tareas de creacion y administracion de nuestro sitio.

Por ultimo dependiendo de donde vayamos a subir nuestra pagina para desplegarla posteriormente se indicara o no alguna de las siguientes opciones:

~~~
* Do you want to upload your website using FTP? (y/N) n

Si deseamos subir nuestro sitio web usando FTP

+ Do you want to upload your website using SSH? (y/N) n

Si deseamos subir nuestro sitio web usando SSH

* Do you want to upload your website using Dropbox? (y/N) n

Si deseamos subir nuestro sitio web usando dropbox

* Do you want to upload your website using S3? (y/N) n

Si deseamos subirlo usando S3

* Do you want to upload your website using Rackspace Cloud Files? (y/N) n

Si deseamos subirlo usando Rockspace Cloud Files

* Do you want to upload your website using GitHub Pages? (y/N) y

Si deseamos subirlo usando Github

* Is this your personal page (username.github.io)? (y/N) n
~~~

Por ultimo si elegios subir la pagina a github, nos preguntaran si username.github.io es nuestra pagina principal, en el caso de serlohabra que indicar yes.

En mi caso elegi Github ya que mas adelante se usara Netlify que cogera el repositorio github de nuestro sitio web y lo desplegará.

### **Configurando el generador para hacer cambios** ###

Hay varias configuracione que podemos hacer en el fichero pelicanconf.py y que os pueden ser utiles a la hora de configurar nuestro sitio, como pueden ser por ejemplo el cambio de nombre de nuestro sitio web o por ejemplo cambiar el tema que usara nuestro sitio.

### **Cambiando el nombre de nuestro sitio web** ###

Para ello simplemente en el fichero pelicanconf.py editamos la opcion SINTENAME.

### **Cambio de tema** ###

lo primero sera conseguir un tema que nos guste, esto se podra hacer de dos formas:

* Ejecutando el comando pelican-themes -i. Ej:

~~~
pelican-themes -i https://github.com/arulrajnet/Attila.git
~~~

o bien clonando un repositorio github donde esta el tema.

~~~
git clone https://github.com/alexandrevicenzi/Flex.git
~~~


Una vez descargado el tema, se comprueba que lo tenemos instalado en pelican ejecutando pelican-theme -l. Cuando ya se tenga el tema, se configurarara el fichero pelicanconf.py, creamos un apartado llamado "Theme" indicandole la ruta donde tenemos almacenada el tema usado, por defecto, estos temas se almacenan en /usr/lib/python3/dist-packages/pelican/themes.

![inicio pelican](/blog-pelican/pelican_inicio.png)
