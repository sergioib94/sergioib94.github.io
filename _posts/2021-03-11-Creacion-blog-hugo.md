---
title: "Creacion blog Hugo"
date: 2021-03-11T08:07:44+01:00
categories: [Aplicaciones Web]
excerpt: "En este post se hablara de como ha sido creado este blog usando hugo donde se van a ir publicando trabajos y apuntos relacionados con el grado superior de Administracion de Sistemas Informaticos en Red (ASIR) ademas de apuntes o documentacion de interes y ademas la configuracion continua que se hara a traves de Github y Netlify."
---

### **Introducción** ##

En este post se hablara de como ha sido creado este blog usando hugo donde se van a ir publicando trabajos y apuntos relacionados con el grado superior de Administracion de Sistemas Informaticos en Red (ASIR) ademas de apuntes o documentacion de interes y ademas la configuracion continua que se hara a traves de Github y Netlify.

### **Creación del blog** ###

Para poder crear nuestro blog con hugo, lo primero que necesitaremos sera instalar hugo en nuestro sistema, en mi caso debian 10. Esta instalación la podemos hacer de la siguiente forma:

```
sudo apt install hugo
```

Sin embargo, en mi caso por defecto se instala la version 0.54 de hugo, lo cual no sirve para casi nada ya que la mayoria de plantillas hugo actualmente requieren de la version 0.55 para arriba, por lo que en mi caso lo que hice fue descargar hugo directamente de la paqueteria debian e instalarlo con dpkg:

```
sergioib@debian-sergio:`/Descargas$ sudo dpkg -i hugo_0.81.0_Linux-64bit.deb
(Leyendo la base de datos ... 255116 ficheros o directorios instalados actualmente.)
Preparando para desempaquetar hugo_0.81.0_Linux-64bit.deb ...
Desempaquetando hugo (0.81.0) sobre (0.55.6+really0.54.0-1) ...
Configurando hugo (0.81.0) ...
Procesando disparadores para man-db (2.8.5-2) ...
```

Una vez lo tengamos instalamos creamos nuestro proyecto en mi caso llamado myblog, que sera donde tendremos todo el contenido de nuestro blog.

```
hugo new site myblog
```

Accedemos a nuestro proyecto usando cd:

```
cd myblog
```

Una vez dentro de la carpeta, iniciamos git:

```
git init
```

Ahora ejecutaremos un git-clone y clonaremos el tema que hayamos elegido para el blog, en mi caso m10c. hay mucho mas [aqui](https://themes.gohugo.io/tags/blog/)

Una vez detengamos el tema en nuestro equipo lo configuramos en nustro fichero config.toml de la siguiente forma:

```
theme = m10c
```

Cuando este configurada la plantilla y tengamos nuestra plantilla metida en nuestro directorio themes, sera hora de crear algun post y comprobar si se ve correctamente de forma local.

Creamos un post de prueba:

```
hugo new posts/my-first-post.md
```

Para ejecutar nuestra pagina de forma local, ejecutamos:

```
hugo server -D
```

### **Despliegue Netlify** ###

Despues de comprobar en local que la plantilla esta bien, pasaremos a despleguarlo en Netlify, para ello , usaremos github. En nuestra cuenta de github nos crearemos un repositorio, en mi caso lo llame igual que mi proyecto hugo, myblog.

Una vez creado el repositorio que alojara nuestro blog en github, lo vincularemos al directorio de nuestro proyecto, para ello en el directorio de nuestro blog ejecutamos los siguientes comandos:

```
git add . #Esto añadira todo el contenido de nuestro directorio a git.
git commit -m "primera versión del sitio"
git remote add origin https://github.com/sergioib94/myblog.git
git push origin master
`````

Despues de tener preparado nuestro repositorio github, nos creamos una cuenta en netlify y una vez la tengamos creada sincronizamos nuestro proyecto netlify con el repositorio github:

En el profile de Netlify hay que conectar la cuenta con el repositorio que se va a usar como GitHub, GitLab o Bitbucket. En este caso estoy usando GitHub.

– clic en botón “new site from git”

Seguimos el asistente el cual nos pedirá permisos para acceder a nuestro repositorio y establecemos la configuración para que Netlify sepa cómo realizar el deploy de nuestro sitio.

– elijo el repositorio git usado (GitHub). Aparece una ventana modal de GitHub pidiendo autorización.

– Selecciona el repositorio: myblog

Una vez seleccionado, aparece una pantalla para la configuración básica. Aquí se puede seleccionar la rama que se desea publicar, el comando de compilación y el directorio de publicación. El directorio de publicación debe reflejar lo que se ha indicado en la configuración del sitio, cuyo valor predeterminado es public. Los siguientes pasos asumen que se está publicando desde la rama master.

Es posible que dependiendo de la plantilla que se haya usado a la hora de desplegar nuestro blog en Netlify nos de un error con la version de hugo, como me ha pasado a mi, que tenia la version 0.81 y sin embargo me daba un error de versiones ya que netlify cojia la version de hugo stable que es la 0.54 y esa version no era compatible con la plantilla.

En este caso tendremos que crear un fichero llamado netlify.toml en el directorio de nuestro blog con el siguiente contenido:

```
[build]
  command = "hugo"
  context = "production"
  publish = "public"

[context.production.environment]
  HUGO_VERSION = "0.81.0"
  HUGO_ENV = "production"
```

De esta forma indicamos a netlify que en lugar de usar la version estable de hugo, use la version 0.81 y despues de esto podremos desplegar tranquilamente la pagina.

Cuando el despliegue haya acabado, sera necesario modificar en nuestro fichero config.toml la linea baseURL, indicando ahi la URL que hayamos configurado en netlify para nuestro sitio web.

Otro de error que puede salir en el despliegue es el siguiente:

```
Failing build: Failed to prepare repo
2:31:55 PM: Failed during stage 'preparing repo': Error checking out submodules: fatal: No url found for submodule path 'themes/hugo-theme-m10c' in .gitmodules
```

En este caso tendremos que modificar o crear si no esta creado un fichero llamado .gitmodule con el siguiente contenido:

```
[submodule "ruta donde tengamos nuestro tema"]
	path = ruta donde tengamos nuestro tema
	url = URL origen desde la que clonamos el tema
```

En mi caso seria de la siguiente forma:

```
[submodule "themes/m10c"]
	path = themes/m10c
	url = https://github.com/vaga/hugo-theme-m10c.git
```