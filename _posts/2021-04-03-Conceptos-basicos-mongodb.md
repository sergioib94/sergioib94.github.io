---
layout: post
title: "Conceptos Basicos de Mongodb"
date: 2021-04-03T13:25:45+02:00
categories: [Base-de-Datos, Apuntes]
excerpt: "En este post se va a explicar tanto la instalación y configuración de mongodb ademas de varios de los conceptos basicos como pueden ser el uso de proyecciones y operadores CRUD."
---

### **Introducción** ###

En este post se va a explicar tanto la instalación y configuración de mongodb ademas de varios de los conceptos basicos como pueden ser el uso de proyecciones y operadores CRUD. 

Este post son una serie de explicaciones y apuntes realizados siguiendo varios cursos online. Se usarán varias herramientas como pueden ser mongo shell (cliente de linea de comandos), mongo compass (cliente grafico) y un servidor Atlas de Mongodb (proporcionado en el curso de mongo university).

### Instalación de mongodb (debian 10) ###

Para descargar mongodb en debian, necesitaremos tener instalado el paquete gnupg, por lo que si no  lo tenemos, tendremos que instalarlo.

~~~
apt install gnupg
~~~

Como los paquetes que vamos a descargarnos de mongo estan firmados, lo primero que haremos sera importar la clave publica del certificado:

~~~
wget https://www.mongodb.org/static/pgp/server-4.4.asc -qO- | sudo apt-key add -
~~~

Cuando tengamos la clave en nuestro equipo, añadiremos el repositorio de mongo de la siguiente forma, editamos el fichero /etc/apt/sources.list.d/mongodb-org.list y añadimos la siguiente linea:

~~~
deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main
~~~

Una vez que tengamos listo el repositorio, ya podremos instalar mongo en el equipo.

~~~
apt install mongodb-org
~~~

Arrancamos el servicio de forma manual y lo habilitamos para que se inicie automaticamente en el arranque:

~~~
systemctl enable --now mongod
~~~

Ya tendremos mongo instalado y listo para usar.

### Configuración basica y conexion de herramientas ###

### Mongodb compass ###

Compass cuenta con una interfaz visual para MongoDB que permite explorar y gestionar los datos de la base de datos.

### Mongo shell ###

La shell de mongo es una interfaz javascript interactiva para mongodb. La shell mongo para consultar y actualizar datos, así como para realizar operaciones administrativas.

Instalación de la shell en Linux

* Para ello, vamos al centro de descargas de mongodb (https://www.mongodb.com/try/download/shell) y al seleccionar nuestro sistema operativo, descargamos el archivo.

* Movemos el archivo al directorio principal.
      
* Lo descomprimimos y actualizamos la ruta de la shell.
    * Exec bash

* Abrimos /etc/path (con nano)
      
* El terminal pedira una contraseña e introduciremos nuestra contraseña de admin.
      
* Accedemos al directorio principal y abrimos la carpeta extraida donde veremos un directorio bin. Copiaremos la ruta del directorio bin en /etc/path.
      
* Comprobamos que la shell funciona sin problemas ejecutando el siguiente comando:

~~~
mongo --nodb
~~~

Con esto lo que haremos sera iniciar la mongo shell sin necesidad de conectarse a ninguna instancia de mongodb. Si todo funciono correctamente se nos mostrara la version de mongo shell que tenemos instalada.

~~~
mongo --nodb
MongoDB shell version v4.4.4
> 
~~~

### Atlas ###

Atlas es una base de datos de mongodb como solucion de servicio que proporciona funcionalidad para configurar la base de datos en la nube sin necesidad de usar la shell. Tambien maneja las replicas, es decir que mantiene copias redundantes de los datos.

Funcionamiento:

En Atlas los usuarios pueden implementar un cluster, estos servidores configurados en un conjunto de replicas, esto quiere decir que cada vez que se inserte o actualicen los documentos, los cambios se almacenaran de forma redundante.

Uno de los principales motivos para el uso de atlas es lo facil que es de configurar, ademas administra la creacion de clusteres por lo que la implementacion del sistema se hace mucho mas facil.

La interfaz de atlas facilita tanto la administracion e implementacion de mongodb en los proveedores y en la nube.

Para esta introduccion a mongodb se va a usar el nivel gratuito de atlas (en el cual el cluster que podremos usar con 512 mb de almacenamiento nunca caducara).

Inicio atlas:

En colecciones podremos ver los datos que tenemos en nuestro cluster, en colecciones podremos ver todos los documentos dentro de nuestra base de datos asi como buscar documentos especificos. Atlas tambien nos permite configurar usuarios con distintos privilegios.

![Inicio Atlas](/images/Mongo-01/inicio_atlas.png)

### Conexion a Mongo compass ###

Mongo Compass es un cliente de mongo al igual que mongo shell, solo que este cuenta con interfaz grafica.

Descargamos compass en el siguiente enlace (https://www.mongodb.com/try/download/compass) es recomendable usar la version estable, o de lo contrario actualizarla una vez instalada.

Al abrir mongo compass, nos debera salir una ventana que ponga “nueva conexion”, esta conexión podemos hacerla de dos formas:

* Usando una cadena:

Añadimos la siguiente cadena para facilitar la conexión cada vez que entremos en compass.

~~~
mongodb + srv: // m001-student: m001-mongodb-basics@cluster0-jxeqq.mongodb.net/test
~~~

* Completando los campos individuales:

Hacemos clic en “fill in connection fields individually” y pegamos la cadena srv (como la puesta en el caso anterior). Antes de conectarse tendremos que rellenar los siguientes campos:

nombre de host → nombre de nuestro cluster.
puerto → por defecto mongo utiliza el 27017.
autentificacion → username/password
nombre de usuario → por defecto m001-student
contraseña del usuario → por defecto m001-mongodb-basics
base de datos de autentificacion → admin

Mas opciones:

Replica set name → cluster0-shard-0
Read preference → Primary preferred
ssl → system ca/atlas deployment
ssh tunel → none

En mi caso me conecte usando la cadena ya que es mas facil a la hora de entrar varias veces:

![Mongo compass conexion](/images/Mongo-01/compass.png)

![Mongo compass](/images/Mongo-01/compass2.png)

### Conexion de cluster con Mongo Compass ### 

En la ventana de cluster sandbox al igual que cuando conectamos atlas a mongo shell, hacemos clic en “connect”, pero esta vez eligiendo la opcion “connect using mongodb compass”.

En el caso de no tenerlo instalado, elegimos la opcion “i do not have mongodb compass” lo descargamos e instalamos, pero como no es este caso, copiamos la cadena que se nos da en mongo compass cambiando la parte <password> por nuestra contraseña y ya tendremos conectado nuestro cluster con mongo compass.

![Compass conectado al cluster](/images/Mongo-01/compass-cluster.png)

### Panel principal de mongo compass ###

En este panel principal podemos ver todas las bases de datos con las que contamos en el cluster. En mongodb una base de datos sirve como espacio de nombres para las colecciones, las colecciones almacenan los registros individuales o documentos. Hacemos referecia a una colección poniendo primero el nombre de la base de datos a la que pertenece,“.” y el nombre de la colección. Ej: 

~~~
city.neighborhoods
~~~

Ademas de el listados de las bases de datos con las que contamos, podremos ver el tamaño que ocupa cada una, el numero de colecciones que contiene y los indices que contienen dichas direcciones.

### Colecciones en compass ###

En el menu izquierdo, hacemos clic sobre una de las bases de datos que queramos explorar y despues hacemos clic en la colección, por ejemplo videos.movies. La pestaña schema es bastante util ya que nos proporciona una lista de campos encontrados en documentos de la colección como por ejemplo los id de las peliculas, director, genre (genero), etc.

En la pestaña documents, encontraremos una lista de documentos que componen esa colección. Mas adelante podremos ver como insertar datos nuevos, actualizarlos, filtrarlos, etc.

En los documentos de mongo, podemos encontrarnos valores: 

* Escalables, como las cadenas/strings.
      
* Enteros y dobles
      
* Anidaciones de documentos → es el valor de un documento dentro de otro. Por ejemplo, en base de datos de temperaturas al ver la temperatura del aire encontramos dos campos, calidad que es string y temperatura que es number.
      
* Matrices o arrays → campos que contienen un conjunto particular de campos suplementarios. Estos campos suplementarios se indican con un indice numerico, por lo que a la hora de filtrar la busqueda se hace muy facil.

Estos dos ultimos tipos, anidacion y matrices pueden encontrarse juntos como en el siguiente ejemplo:

~~~
skycoverlayer o position
~~~

### Consultas mongo compass ###

En mongo compass una de las formas que tenemos de filtrar documentos, es poner en el apartado “Filter” una consulta, por ejemplo usando la colección tips de la base de datos citibike:

~~~
{'end station name': 'Broadway & E 22 St'}
~~~

Las consultas que se hagan para filtrar siempre deben ir entre llaves, en ese caso estamos filtrando para que se muestren todos los documentos en los que la estacion final, el nombre tenga el valor Brodway y East 22 street. En este caso el filtro aplicado es un filtro de igualdad, lo que quiere decir que filtrara todos los documentos donde el nombre de la estacion final sea Brodway & East 22 street.

Otro tipo de filtros es el filtrado por rangos, por ejemplo mostrar los documentos en los que el ciclista haya nacido entre 1985 y 1990:

~~~
{'birth year': {$gte: 1985,$lt: 1990}}
~~~

En este caso para filtrar por un rango se utilizan los operadores, indicandolos con “$”.

### Conexion Mongo shell - Atlas ###

Para esta conexión usaremos el siguiente comando:

~~~
mongo "mongodb+srv://cluster0-jxeqq.mongodb.net/test" --username m001-student -password m001-mongodb-basics
~~~

El resultado sera algo como esto:

~~~
MongoDB shell version v4.4.4
connecting to: mongodb://cluster0-shard-00-01-jxeqq.mongodb.net:27017,cluster0-shard-00-02-jxeqq.mongodb.net:27017,cluster0-shard-00-00-jxeqq.mongodb.net:27017/test?authSource=admin&compressors=disabled&gssapiServiceName=mongodb&replicaSet=Cluster0-shard-0&ssl=true
Implicit session: session { "id" : UUID("030690e8-f6dc-43b1-b66a-a8b49baee295") }
MongoDB server version: 4.2.12
WARNING: shell and server versions do not match
MongoDB Enterprise Cluster0-shard-0:PRIMARY> 
~~~

En este caso nos salta un error ya que la shell descargada y el server son de versiones distintas (4.4.4.) y (4.2.12), pero aun asi podemos acceder sin problemas al nodo principal del cluster.

En el caso de que no funcione, probar este otro:

~~~
mongo "mongodb://cluster0-shard-00-00-jxeqq.mongodb.net:27017,cluster0-shard-00-01-jxeqq.mongodb.net:27017,cluster0-shard-00-02-jxeqq.mongodb.net:27017/test?replicaSet=Cluster0-shard-0" --authenticationDatabase admin --ssl --username m001-student --password m001-mongodb-basics
~~~

### Conexion Atlas - Mongo shell ###

1. Iniciar sesion en el cluster Atlas
2. En la ventana “clusters” hacer clic en “connect”

![Atlas cluster](/images/Mongo-01/connect_atlas.png)

3. Una vez le demos a connect, elegimos la opcion “connect with the mongo shell”.
4. Elegimos “i have the mongo shell instaled” en caso de tener mongo shell ya instalado en el equipo y copiamos el comando que se nos da.
5. Pegamos el comando en la terminal.
6. Añadimos la opcion de password al comando obtenido anteriormente y comprobamos el acceso.

~~~
sergioib@debian-sergio:~$ mongo "mongodb+srv://cluster0.hqn5x.mongodb.net/myFirstDatabase" --username m001-student --password m001-mongodb-basics
MongoDB shell version v4.4.4
connecting to: mongodb://cluster0-shard-00-01.hqn5x.mongodb.net:27017,cluster0-shard-00-02.hqn5x.mongodb.net:27017,cluster0-shard-00-00.hqn5x.mongodb.net:27017/myFirstDatabase?authSource=admin&compressors=disabled&gssapiServiceName=mongodb&replicaSet=Cluster0-shard-0&ssl=true
Implicit session: session { "id" : UUID("07c7b3ff-c7fe-493d-91a4-07777d316bff") }
MongoDB server version: 4.4.4
Welcome to the MongoDB shell.
For interactive help, type "help".
For more comprehensive documentation, see
	https://docs.mongodb.com/
Questions? Try the MongoDB Developer Community Forums
	https://community.mongodb.com
Error while trying to show server startup warnings: user is not allowed to do action [getLog] on [admin.]
MongoDB Enterprise Cluster0-shard-0:PRIMARY> 
~~~

Si es como en este caso y nos sale “MongoDB Enterprise Cluster0-shard-0:PRIMARY> ” significara que nos hemos podido conectar correctamente.

### Carga de datos en Atlas ###

Comandos mongo shell:

* Ver bases de datos → show dbs

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> show dbs
admin     0.000GB
local     3.784GB
~~~

* Carga de datos:

En mi caso al realizar el curso de mongodb, cargue un fichero de una base de datos llamada videos con colecciones de peliculas (parecido a la base da datos de peliculas que se ha visto anteriormente con mongo compass). Al descargar el fichero zip los descomprimi en un directorio que hice para tenerlo organizado y bien ubicado y cargue la base de datos al cluster ejecutando load(“nombre del fichero.js”).

Una vez cargado, volvemos a ejecutar show dbs al igual que antes y comprobamos si se ha cargadao correctamente:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> show dbs
admin     0.000GB
local     3.784GB
video     0.001GB
~~~

Para acceder a los datos de la base de datos, usamos primero la base de datos, despues vemos las colecciones que hay y por ultimo realizamos una busqueda usando la colección:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> use video
switched to db video
MongoDB Enterprise Cluster0-shard-0:PRIMARY> show collections
movieDetails
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.find().pretty()
{
	"_id" : ObjectId("5e7754bbff453565d25411a9"),
	"title" : "Slow West",
	"year" : 2015,
	"rated" : "R",
	"runtime" : 84,
	"countries" : [
		"UK",
		"New Zealand"
	],
	"genres" : [
		"Action",
		"Thriller",
		"Western"
	],
	"director" : "John Maclean",
	"writers" : [
		"John Maclean"
	],
	"actors" : [
		"Kodi Smit-McPhee",
		"Michael Fassbender",
		"Ben Mendelsohn",
		"Aorere Paki"
	],
	"plot" : "A young Scottish man travels across America in pursuit of the woman he loves, attracting the attention of an outlaw who is willing to serve as a guide.",
	"poster" : "http://ia.media-imdb.com/images/M/MV5BNTYxNDA5ODk5NF5BMl5BanBnXkFtZTgwNzMwMzIwNTE@._V1_SX300.jpg",
	"imdb" : {
		"id" : "tt3205376",
		"rating" : 7,
		"votes" : 19101
	},
	"tomato" : {
		"meter" : 92,
		"image" : "certified",
		"rating" : 7.5,
		"reviews" : 115,
		"fresh" : 106,
		"consensus" : "Slow West serves as an impressive calling card for first-time writer-director John M. Maclean -- and offers an inventive treat for fans of the Western.",
		"userMeter" : 75,
		"userRating" : 3.7,
		"userReviews" : 9850
	},
	"metacritic" : 72,
	"awards" : {
		"wins" : 2,
		"nominations" : 9,
		"text" : "2 wins & 9 nominations."
	},
	"type" : "movie"
}
{
	"_id" : ObjectId("5e7754bbff453565d25411d4"),
	"title" : "The Adventures of Buckaroo Banzai Across the 8th Dimension",
	"year" : 1984,
	"rated" : "PG",
	"runtime" : 103,
	"countries" : [
		"USA"
	],
	"genres" : [
		"Adventure",
		"Comedy",
		"Romance"
	],
	"director" : "W.D. Richter",
	"writers" : [
		"Earl Mac Rauch"
	],
	"actors" : [
		"Peter Weller",
		"John Lithgow",
		"Ellen Barkin",
		"Jeff Goldblum"
	],
	"plot" : "Adventurer/surgeon/rock musician Buckaroo Banzai and his band of men, the Hong Kong Cavaliers, take on evil alien invaders from the 8th dimension.",
	"poster" : "http://ia.media-imdb.com/images/M/MV5BMTk3OTAwNDQwOF5BMl5BanBnXkFtZTgwOTE0MzQxMDE@._V1_SX300.jpg",
	"imdb" : {
		"id" : "tt0086856",
		"rating" : 6.4,
		"votes" : 17154
	},
	"awards" : {
		"wins" : 0,
		"nominations" : 5,
		"text" : "5 nominations."
	},
	"type" : "movie"
}
{
	"_id" : ObjectId("5e7754bbff453565d25411ac"),
	"title" : "How the West Was Won",
	"year" : 1962,
	"rated" : "APPROVED",
	"runtime" : 164,
	"countries" : [
		"USA"
	],
	"genres" : [
		"Western"
	],
	"director" : "John Ford, Henry Hathaway, George Marshall, Richard Thorpe",
	"writers" : [
		"James R. Webb"
	],
	"actors" : [
		"Carroll Baker",
		"Lee J. Cobb",
		"Henry Fonda",
		"Carolyn Jones"
	],
	"plot" : "A family saga covering several decades of Westward expansion in the nineteenth century--including the Gold Rush, the Civil War, and the building of the railroads.",
	"poster" : "http://ia.media-imdb.com/images/M/MV5BNTk2NDk1NjY0MV5BMl5BanBnXkFtZTgwMzkzNTcxMTE@._V1_SX300.jpg",
	"imdb" : {
		"id" : "tt0056085",
		"rating" : 7.1,
		"votes" : 13640
	},
	"awards" : {
		"wins" : 7,
		"nominations" : 5,
		"text" : "Won 3 Oscars. Another 7 wins & 5 nominations."
	},
	"type" : "movie"
}
...
Type "it" for more
MongoDB Enterprise Cluster0-shard-0:PRIMARY>
~~~

### ¿Que es mongodb? ###

Mongodb es una base de datos de documentos en el que sera necesarios cierto nivel de comprension de json para su uso, ya que tanto los el lenguaje de los documentos que usa la base de datos, asi como gran parte de la administracion de mongo, se hace en formato json.

Hay dos tipos de datos con los que trabajaremos en mongodb:

* Datos simples

    * números → enteros (negativos y positivos), decimales, etc...
    * cadenas de texto
    * fecha
    * hora
    * boleanos

* Datos Complejos

    * arrays → listas
    * objetos → documento incrustado o añadido en el documento principal.
    * binarios → almacenar elementos multimedia
    * objectid → clave unica que asigna mongo a cada documento si el usuario no la especifica.
    * expresiones regulares

### Conceptos basicos de operaciones CRUD (Create Read Delete Update) ###

### Create ###

En mongodb se entiende a crear operaciones como la insercion de documentos o simplemente hacer inserciones.

Inserción de colecciones y documentos:

* Mongo compass

Usando la vista de la base de datos en compas, podemos crear una colección simplemente haciendo clic en alguna base de datos que tengamos, y despues haciendo clic en “create collection”. Por ejemplo en la base de datos peliculas, he creado la colección peliculas_prueba.

Al crear una nueva colección obviamente estara vacia, pero con compass podemos insertar un documento de forma sencilla haciendo clc en “add data” → “insert document”.

![insercion de documentos](/images/Mongo-01/ejemplo_insert.png)

Creamos un pequeño documento a modo de prueba.

* Mongo shell

En mongo shell podemos realizar la misma insercion de datos que en compass, pero al no tener entorno grafico esto se hara a traves del uso de los metodos, concretamente el metodo insertOne, que es un metodo de colecciones.

Para usar insertOne, primero tendremos que especificar la base de datos a usar, en este caso como ejemplo se usara la base de datos de videos, y una vez especificada insertamos el documento. Ej:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> show databases
admin     0.000GB
local     3.837GB
practica  0.002GB
video     0.001GB
MongoDB Enterprise Cluster0-shard-0:PRIMARY> use video
switched to db video
MongoDB Enterprise Cluster0-shard-0:PRIMARY> show collections
movieDetails
peliculas_prueba
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.peliculas_prueba.insertOne({title: "Rogue One", year: 2016})
{
	"acknowledged" : true,
	"insertedId" : ObjectId("605b1d03653110148a9b1edf")
}
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.peliculas_prueba.find().pretty()
{
	"_id" : ObjectId("605b14c6798aa68ea3f5e7cd"),
	"title" : "The Avengers EndGame",
	"year" : 2019
}
{
	"_id" : ObjectId("605b1993798aa68ea3f5e7ce"),
	"title" : "Raya",
	"year" : 2021
}
{
	"_id" : ObjectId("605b1d03653110148a9b1edf"),
	"title" : "Rogue One",
	"year" : 2016
}
~~~

Con este mismo metodo, si la colección peliculas_prueba no existiese se crearia de forma automatica al crear el documento.

Como se puede ver en el ejemplo anterior, si no especificamos ningun id (todo objeto en la colección debe tener un identificador unico), el propio mongo o el cliente que se este usando le especifica uno por defecto. En el caso de introducir manualmente la id, tendremos que asegurarnos de que no se repita en ningun momento en la colección, sino nos saltara un mensaje de error como “duplicate key error collection”.

Seguramente, despues de ver el ejemplo de insertOne mas de uno piense por ejemplo ¿y si por ejemplo quiero una base de datos para saber que canciones o videojuegos tengo? ¿que hago un insertOne por cada uno de ellos? 

Pues no, para ello mongo cuenta con otro metodo llamado insertMany, con el que es posible insertar varios documentos a la vez. Ej:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.peliculas_prueba.insertMany([{title: "Star Wars: Episodio I - La amenaza fantasma", year: 1999}, {title: "Star Wars: Episodio II - El ataque de los clones", year: 2002}, {title: "Star Wars: Episodio III - La venganza de los Sith", year: 2005}])

{
	"acknowledged" : true,
	"insertedIds" : [
		ObjectId("605b21f2653110148a9b1ee3"),
		ObjectId("605b21f2653110148a9b1ee4"),
		ObjectId("605b21f2653110148a9b1ee5")
	]
}
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.peliculas_prueba.find().pretty()
{
	"_id" : ObjectId("605b14c6798aa68ea3f5e7cd"),
	"title" : "The Avengers EndGame",
	"year" : 2019
}
{
	"_id" : ObjectId("605b1993798aa68ea3f5e7ce"),
	"title" : "Raya",
	"year" : 2021
}
{
	"_id" : ObjectId("605b1d03653110148a9b1edf"),
	"title" : "Rogue One",
	"year" : 2016
}
{
	"_id" : ObjectId("605b21f2653110148a9b1ee3"),
	"title" : "Star Wars: Episodio I - La amenaza fantasma",
	"year" : 1999
}
{
	"_id" : ObjectId("605b21f2653110148a9b1ee4"),
	"title" : "Star Wars: Episodio II - El ataque de los clones",
	"year" : 2002
}
{
	"_id" : ObjectId("605b21f2653110148a9b1ee5"),
	"title" : "Star Wars: Episodio III - La venganza de los Sith",
	"year" : 2005
}
~~~

InsertMany hace una insercion ordenada de los datos por defecto, lo que significa que si por ejemplo introducimos 10 documentos, si al insertar salta un error en el documento 4 por ejemplo, solo se introducen los 3 primeros. Esto podemos cambiarlo haciendo que insertMany no haga una insercion ordenada, sino una insercion desordenada.

Para cambiar la forma de actuar del metodo insertMany, itroducimos la siguiente instrucción en la insercion:

{“ordered”: false}

De esta forma, aunque salgan errores, insertMany continuara insertando documentos.

### Read ###

### Filtros ###

* Filtros de igualdad:

Anteriormente vimos ya algún ejemplo de filtro de igualdad, ahora veremos varios ejemplos de filtros tanto en compass como en shell:

**Compass**

En el caso de compass la consulta es bastante sencilla ya que simplemente tendremos que introducir la consulta y hacer clic en filtrar. Por ejemplo filtraremos en la base de datos de peliculas las que esten calificadas como PG-13.

Si en lugar de un valor de busqueda ponemos varios, solo se mostraran aquellos documentos que contengan ambos valores.

**Shell**

En shell utilizamos para el filtro de igualdad el metodo find, este metodo ya se ha usado anteriormente. Como ejemplo realizaremos la misma consulta que en compass.

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> use video
switched to db video
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movies.find({mpaaRating: "PG-13"})
{ "_id" : ObjectId("58c59c6c99d4ee0af9e10b9d"), "title" : "Wings", "year" : 1927, "imdbId" : "tt0018578", "mpaaRating" : "PG-13", "genre" : "Drama, Romance, War", "viewerRating" : 7.8, "viewerVotes" : 7196, "runtime" : 144, "director" : "William A. Wellman, Harry d'Abbadie d'Arrast", "cast" : [ "Clara Bow", "Charles 'Buddy' Rogers", "Richard Arlen", "Jobyna Ralston" ], "plot" : "Two young men, one rich, one middle class, who are in love with the same woman, become fighter pilots in World War I.", "language" : "English" }
{ "_id" : ObjectId("58c59c6d99d4ee0af9e14d35"), "title" : "Kate & Leopold", "year" : 2001, "imdbId" : "tt0035423", "mpaaRating" : "PG-13", "genre" : "Comedy, Fantasy, Romance", "viewerRating" : 6.3, "viewerVotes" : 59951, "runtime" : 118, "director" : "James Mangold", "cast" : [ "Meg Ryan", "Hugh Jackman", "Liev Schreiber", "Breckin Meyer" ], "plot" : "Kate and her actor brother live in N.Y. in the 21st Century. Her ex-boyfriend, Stuart, lives above her apartment. Stuart finds a space near the Brooklyn Bridge where there is a gap in time....", "language" : "English, French" }
{ "_id" : ObjectId("58c59c6f99d4ee0af9e17da0"), "title" : "Rebel Without a Cause", "year" : 1955, "imdbId" : "tt0048545", "mpaaRating" : "PG-13", "genre" : "Drama", "viewerRating" : 7.8, "viewerVotes" : 58627, "runtime" : 111, "director" : "Nicholas Ray", "cast" : [ "James Dean", "Natalie Wood", "Sal Mineo", "Jim Backus" ], "plot" : "A rebellious young man with a troubled past comes to a new town, finding friends and enemies.", "language" : "English" }
…
~~~

De esta forma se ve muy mal la informacion, para que se vea mejor usamos .pretty()

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movies.find({mpaaRating: "PG-13"}).pretty()
{
	"_id" : ObjectId("58c59c6c99d4ee0af9e10b9d"),
	"title" : "Wings",
	"year" : 1927,
	"imdbId" : "tt0018578",
	"mpaaRating" : "PG-13",
	"genre" : "Drama, Romance, War",
	"viewerRating" : 7.8,
	"viewerVotes" : 7196,
	"runtime" : 144,
	"director" : "William A. Wellman, Harry d'Abbadie d'Arrast",
	"cast" : [
		"Clara Bow",
		"Charles 'Buddy' Rogers",
		"Richard Arlen",
		"Jobyna Ralston"
	],
	"plot" : "Two young men, one rich, one middle class, who are in love with the same woman, become fighter pilots in World War I.",
	"language" : "English"
}
{
	"_id" : ObjectId("58c59c6d99d4ee0af9e14d35"),
	"title" : "Kate & Leopold",
	"year" : 2001,
	"imdbId" : "tt0035423",
	"mpaaRating" : "PG-13",
	"genre" : "Comedy, Fantasy, Romance",
	"viewerRating" : 6.3,
	"viewerVotes" : 59951,
	"runtime" : 118,
	"director" : "James Mangold",
	"cast" : [
		"Meg Ryan",
		"Hugh Jackman",
		"Liev Schreiber",
		"Breckin Meyer"
	],
	"plot" : "Kate and her actor brother live in N.Y. in the 21st Century. Her ex-boyfriend, Stuart, lives above her apartment. Stuart finds a space near the Brooklyn Bridge where there is a gap in time....",
	"language" : "English, French"
}
~~~

En el caso de no introducir ningun parametro en el filtro con find, se mostraran todos los documentos de la colección. Hay algunos casos en los que a lo mejor queremos filtrar algo que a su vez se divide en varios campos. Este caso lo podemos encontrar varias veces en la base de datos del tiempo como por ejemplo el viento que a su vez tiene el campo type por lo que si queremos filtrar por tipo de viento seria de la siguiente forma:

**Compass**

![Primer filtro](/images/Mongo-01/filtro1.png)

**Shell**

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> use 100YWeatherSmall
switched to db 100YWeatherSmall
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.data.find({"wind.type": "N"}).pretty()
{
	"_id" : ObjectId("5553a98ce4b02cf7150dee3c"),
	"st" : "x-00700+086000",
	"ts" : ISODate("1984-01-01T00:00:00Z"),
	"position" : {
		"type" : "Point",
		"coordinates" : [
			86,
			-0.7
		]
	},
	"elevation" : 9999,
	"callLetters" : "PHQK",
	"qualityControlProcess" : "V020",
	"dataSource" : "4",
	"type" : "FM-13",
	"airTemperature" : {
		"value" : 27.5,
		"quality" : "1"
	},
	"dewPoint" : {
		"value" : 999.9,
		"quality" : "9"
	},
	"pressure" : {
		"value" : 1012.2,
		"quality" : "1"
	},
	"wind" : {
		"direction" : {
			"angle" : 290,
			"quality" : "1"
		},
		"type" : "N",
		"speed" : {
			"rate" : 2.6,
			"quality" : "1"
		}
	},
	"visibility" : {
		"distance" : {
			"value" : 20000,
			"quality" : "1"
		},
	...
~~~

A esta forma de filtrar se le llama notación de puntos y este tipo de filtro se puede usar tanto para filtrar campos dentro de un objeto así como para filtrar en campos anidados.

### Filtrado en listas ###

Para filtrar en una lista utilizamos los índices. Por ejemplo en la base de datos de películas tenemos varias listas en el campo cast (reparto), en el ejemplo se mostraran todas las peliculas en el que en el reparto Jeff Bridges sea el primero de la lista.

**Compass**

![Filtrado de lista](/images/Mongo-01/filtros5.png)

**Shell**

En la shell se filtra de igual forma:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> use video
switched to db video
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movies.find({"cast.0": "Jeff Bridges"}).pretty()
{
	"_id" : ObjectId("58c59c7199d4ee0af9e1c2ee"),
	"title" : "Bad Company",
	"year" : 1972,
	"imdbId" : "tt0068245",
	"mpaaRating" : "PG",
	"genre" : "Drama, Western",
	"viewerRating" : 7.1,
	"viewerVotes" : 2423,
	"runtime" : 93,
	"director" : "Robert Benton",
	"cast" : [
		"Jeff Bridges",
		"Barry Brown",
		"Jim Davis",
		"David Huddleston"
	],
	"plot" : "A god-fearing Ohio boy dodging the Civil War draft arrives in Jefferson City where he joins up with a hardscrabble group of like runaways heading west.",
	"language" : "English"
}
{
	"_id" : ObjectId("58c59c7199d4ee0af9e1ca26"),
	"title" : "The Last American Hero",
	"year" : 1973,
	"imdbId" : "tt0070287",
	"mpaaRating" : "PG",
	"genre" : "Drama, Sport",
	"viewerRating" : 6.3,
	"viewerVotes" : 1016,
	"runtime" : 95,
	"director" : "Lamont Johnson",
	"cast" : [
		"Jeff Bridges",
		"Valerie Perrine",
		"Geraldine Fitzgerald",
		"Ned Beatty"
	],
	"plot" : "A young hellraiser quits his moonshine business to try to become the best NASCAR racer the south had ever seen.",
	"language" : "English"
}
…
~~~

### Cursores ###

Los métodos de búsqueda como find, devuelven cursores. Los cursores son básicamente un puntero a la ubicación actual en un conjunto de resultados.

En mongo shell el cursor se itera de forma automática mostrando los primeros 20 resultados. En el caso de necesitar mostrar mas resultados de busqueda, la shell proporciona un 
“metodo” para mostrar los siguientes 20 resultados, esto se haria escribiendo “it” (abreviatura de iterar) al mostrar los primeros resultados, de esta forma podemos iterar un conjunto completo de resultados de busqueda.

### Proyecciones ###

Las proyecciones la sobrecarga y el procesamiento de la red requisitos, limitando los campos que son devueltos en los documentos de resultados.

Por defecto mongodb devuelve todos los campos en todos los documentos que coinciden con las consultas.

Las proyecciones son un segundo argumento al argumento de busqueda, por ejemplo si en lugar de mostrar todos los datos de todas las peliculas de un genero en especifico, solo queremos mostrar los titulos, esto se haria de la siguiente forma:

**Shell**

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movies.find({genre: "Action"}, {title: 1})
{ "_id" : ObjectId("58c59c6a99d4ee0af9e0d24c"), "title" : "The Exploits of Elaine" }
{ "_id" : ObjectId("58c59c6a99d4ee0af9e0d2f1"), "title" : "The Hazards of Helen" }
{ "_id" : ObjectId("58c59c6a99d4ee0af9e0d3ce"), "title" : "Lucille Love: The Girl of Mystery" }
{ "_id" : ObjectId("58c59c6a99d4ee0af9e0d486"), "title" : "The Perils of Pauline" }
{ "_id" : ObjectId("58c59c6a99d4ee0af9e0d836"), "title" : "The Girl and the Game" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0dfbc"), "title" : "The Shielding Shadow" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0e0d5"), "title" : "The Yellow Menace" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0dfa6"), "title" : "The Secret of the Submarine" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0dfa3"), "title" : "The Scarlet Runner" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0e20c"), "title" : "The Fatal Ring" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0e42b"), "title" : "The Purple Mask" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0e991"), "title" : "The Adventures of Ruth" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0e702"), "title" : "The House of Hate" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0ea70"), "title" : "Elmo, the Mighty" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0eb83"), "title" : "The Lion Man" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0ee14"), "title" : "The Branded Four" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0eeac"), "title" : "The Evil Eye" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0ee92"), "title" : "The Dragon's Net" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0ee68"), "title" : "Daredevil Jack" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0efb2"), "title" : "King of the Circus" }
Type "it" for more
~~~

Vemos como en lugar de mostrar toda la información, solo muestra la id (por defecto) y el titulo, que es lo que hemos especificado. Tambien vemos lo explicado anteriormente en los cursores, el “it”, si escribimos it obtenemos los siguientes 20 titulos.

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movies.find({genre: "Action"}, {title: 1})
{ "_id" : ObjectId("58c59c6a99d4ee0af9e0d24c"), "title" : "The Exploits of Elaine" }
{ "_id" : ObjectId("58c59c6a99d4ee0af9e0d2f1"), "title" : "The Hazards of Helen" }
{ "_id" : ObjectId("58c59c6a99d4ee0af9e0d3ce"), "title" : "Lucille Love: The Girl of Mystery" }
{ "_id" : ObjectId("58c59c6a99d4ee0af9e0d486"), "title" : "The Perils of Pauline" }
{ "_id" : ObjectId("58c59c6a99d4ee0af9e0d836"), "title" : "The Girl and the Game" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0dfbc"), "title" : "The Shielding Shadow" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0e0d5"), "title" : "The Yellow Menace" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0dfa6"), "title" : "The Secret of the Submarine" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0dfa3"), "title" : "The Scarlet Runner" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0e20c"), "title" : "The Fatal Ring" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0e42b"), "title" : "The Purple Mask" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0e991"), "title" : "The Adventures of Ruth" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0e702"), "title" : "The House of Hate" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0ea70"), "title" : "Elmo, the Mighty" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0eb83"), "title" : "The Lion Man" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0ee14"), "title" : "The Branded Four" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0eeac"), "title" : "The Evil Eye" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0ee92"), "title" : "The Dragon's Net" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0ee68"), "title" : "Daredevil Jack" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0efb2"), "title" : "King of the Circus" }
Type "it" for more
MongoDB Enterprise Cluster0-shard-0:PRIMARY> it
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0efef"), "title" : "The Mystery of 13" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f16a"), "title" : "The Whirlwind" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f22a"), "title" : "Cameron of the Royal Mounted" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f223"), "title" : "Cold Steel" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f5ac"), "title" : "The Boss of Camp Four" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f3b6"), "title" : "Miracles of the Jungle" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f485"), "title" : "The Secret Four" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f557"), "title" : "The Yellow Arm" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f623"), "title" : "The Cub Reporter" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f6a3"), "title" : "Great Alone" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f9c0"), "title" : "The Eagle's Talons" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f7fb"), "title" : "Reckless Chances" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f845"), "title" : "Smiles Are Trumps" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0f843"), "title" : "Speed" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0fbd2"), "title" : "The Thrill Chaser" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0fd22"), "title" : "Dynamite Dan" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0fc6a"), "title" : "American Manners" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0fced"), "title" : "The Cyclone Rider" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e0fd3d"), "title" : "A Fighting Heart" }
{ "_id" : ObjectId("58c59c6b99d4ee0af9e10109"), "title" : "The Great Jewel Robbery" }
~~~

En las proyecciones se usa el valor 1 para incluir campos a la busqueda y el valor 0 para excluir campos de la busqueda, por lo que si quisieramos quitar el id de la busqueda anterior podriamos hacerlo de la siguiente forma:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movies.find({genre: "Action"}, {title: 1, _id: 0})
{ "title" : "The Exploits of Elaine" }
{ "title" : "The Hazards of Helen" }
{ "title" : "Lucille Love: The Girl of Mystery" }
{ "title" : "The Perils of Pauline" }
{ "title" : "The Girl and the Game" }
{ "title" : "The Shielding Shadow" }
{ "title" : "The Yellow Menace" }
{ "title" : "The Secret of the Submarine" }
{ "title" : "The Scarlet Runner" }
{ "title" : "The Fatal Ring" }
{ "title" : "The Purple Mask" }
{ "title" : "The Adventures of Ruth" }
{ "title" : "The House of Hate" }
{ "title" : "Elmo, the Mighty" }
{ "title" : "The Lion Man" }
{ "title" : "The Branded Four" }
{ "title" : "The Evil Eye" }
{ "title" : "The Dragon's Net" }
{ "title" : "Daredevil Jack" }
{ "title" : "King of the Circus" }
~~~

### Operadores de Mongodb ###

* Operadores de comparacion: Como su propio nombre indica, nos permiten comparar dos valores en una consulta.
      
    * $gt (mayor que): se utiliza para hacer una consulta comparando un campo de los documentos de la colección con uno mayor. Por ejemplo, mostrar el titulo de todas las peliculas que duren mas de 90 min:

    ~~~      
        MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.find({runtime: {$gt: 90}}, {_id: 0, title: 1, runtime: 1})
        { "title" : "Once Upon a Time in the West", "runtime" : 175 }
        { "title" : "A Million Ways to Die in the West", "runtime" : 116 }
        { "title" : "Wild Wild West", "runtime" : 106 }
        { "title" : "West Side Story", "runtime" : 152 }
        { "title" : "Red Rock West", "runtime" : 98 }
        { "title" : "How the West Was Won", "runtime" : 164 }
        { "title" : "Journey to the West", "runtime" : 110 }
        { "title" : "West of Memphis", "runtime" : 147 }
        { "title" : "Star Wars: Episode IV - A New Hope", "runtime" : 121 }
        { "title" : "Star Wars: Episode V - The Empire Strikes Back", "runtime" : 124 }
        { "title" : "Star Wars: Episode VI - Return of the Jedi", "runtime" : 131 }
        { "title" : "Star Wars: Episode I - The Phantom Menace", "runtime" : 136 }
        { "title" : "Star Wars: Episode III - Revenge of the Sith", "runtime" : 140 }
        { "title" : "Star Trek", "runtime" : 127 }
        { "title" : "Star Wars: Episode II - Attack of the Clones", "runtime" : 142 }
        { "title" : "Star Trek Into Darkness", "runtime" : 132 }
        { "title" : "Star Trek: First Contact", "runtime" : 111 }
        { "title" : "Star Trek II: The Wrath of Khan", "runtime" : 113 }
        { "title" : "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb", "runtime" : 95 }
        { "title" : "Love Actually", "runtime" : 135 }
        Type "it" for more
    ~~~

Como vemos, todas las peliculas que se muestran tienen una duracion mayor de 90 min. De la misma forma que existe $gt, tambien existe $lt (menor que), que se usar para filtrar por valores inferiores. Haciendo uso de los dos a la vez podemos ser capaces de filtrar en un rango, por ejemplo, peliculas que duren mas de 90 min, y menos de 100.

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.find({runtime: {$gt: 90, $lt: 100}}, {_id: 0, title: 1, runtime: 1})
{ "title" : "Red Rock West", "runtime" : 98 }
{ "title" : "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb", "runtime" : 95 }
{ "title" : "Punch-Drunk Love", "runtime" : 95 }
{ "title" : "From Paris with Love", "runtime" : 92 }
{ "title" : "I Love You Phillip Morris", "runtime" : 98 }
{ "title" : "2001: A Space Travesty", "runtime" : 99 }
{ "title" : "The Adventures of Sharkboy and Lavagirl 3-D", "runtime" : 93 }
{ "title" : "The Adventures of Rocky & Bullwinkle", "runtime" : 92 }
{ "title" : "Shaun of the Dead", "runtime" : 99 }
{ "title" : "Evil Dead", "runtime" : 91 }
{ "title" : "Night of the Living Dead", "runtime" : 96 }
{ "title" : "Treasure Planet", "runtime" : 95 }
{ "title" : "Planet 51", "runtime" : 91 }
{ "title" : "Forbidden Planet", "runtime" : 98 }
{ "title" : "Beneath the Planet of the Apes", "runtime" : 95 }
{ "title" : "Alien Nation", "runtime" : 91 }
{ "title" : "Alien Autopsy", "runtime" : 95 }
{ "title" : "Diary of a Wimpy Kid", "runtime" : 94 }
{ "title" : "Trail of the Pink Panther", "runtime" : 96 }
{ "title" : "Crossfire Trail", "runtime" : 92 }
Type "it" for more
~~~

Sin embargo, este filtro muestra solo las que duran mas de 90 y menos de 100, es decir, si una pelicula dura 90 min o 100 min, no aparecera ya que solo se muestran valores superiores e inferiores. Para incluir a las peliculas de 90 y 100 min, usamos los operadores $gte (mayor o igual que) y $lt3 (menor o igual que):

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.find({runtime: {$gte: 90, $lte: 100}}, {_id: 0, title: 1, runtime: 1})
{ "title" : "Red Rock West", "runtime" : 98 }
{ "title" : "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb", "runtime" : 95 }
{ "title" : "Punch-Drunk Love", "runtime" : 95 }
{ "title" : "From Paris with Love", "runtime" : 92 }
{ "title" : "I Love You Phillip Morris", "runtime" : 98 }
{ "title" : "2001: A Space Travesty", "runtime" : 99 }
{ "title" : "The Adventures of Sharkboy and Lavagirl 3-D", "runtime" : 93 }
{ "title" : "The Adventures of Rocky & Bullwinkle", "runtime" : 92 }
{ "title" : "The Rocky Horror Picture Show", "runtime" : 100 }
{ "title" : "Best in Show", "runtime" : 90 }
{ "title" : "Shaun of the Dead", "runtime" : 99 }
{ "title" : "Evil Dead", "runtime" : 91 }
{ "title" : "Night of the Living Dead", "runtime" : 96 }
{ "title" : "Treasure Planet", "runtime" : 95 }
{ "title" : "Planet 51", "runtime" : 91 }
{ "title" : "Forbidden Planet", "runtime" : 98 }
{ "title" : "Beneath the Planet of the Apes", "runtime" : 95 }
{ "title" : "Alien Nation", "runtime" : 91 }
{ "title" : "Alien Autopsy", "runtime" : 95 }
{ "title" : "Alien Outpost", "runtime" : 90 }
Type "it" for more
~~~

En el caso de querer mostrar solo un resultado igual, se usa $eq (igual que)

    ◦ $ne (no igual): Es lo contrario a $eq, si por ejemplo si usando db.movieDetails.find({runtime: {$eq: 90}}, {_id: 0, title: 1, runtime: 1}) se nos muestran las peliculas que duran exactamente 90 min, con $ne se nos mostraran todas menos las de 90 min:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.find({runtime: {$eq: 90}}, {_id: 0, title: 1, runtime: 1})
{ "title" : "Best in Show", "runtime" : 90 }
{ "title" : "Alien Outpost", "runtime" : 90 }
{ "title" : "Bill & Ted's Excellent Adventure", "runtime" : 90 }
{ "title" : "Trouble Bound", "runtime" : 90 }
{ "title" : "Little Nicky", "runtime" : 90 }
{ "title" : "Il Bi e il Ba", "runtime" : 90 }
{ "title" : "Fink fährt ab", "runtime" : 90 }
{ "title" : "Die Post geht ab", "runtime" : 90 }
{ "title" : "Ao qi xiong ying", "runtime" : 90 }
{ "title" : "Shou zhi ao chu", "runtime" : 90 }
{ "title" : "Enchantress Eo-eul", "runtime" : 90 }
{ "title" : "Babylon A.D.", "runtime" : 90 }
{ "title" : "B.J.: Black Jocks", "runtime" : 90 }
{ "title" : "Ed Gein: The Butcher of Plainfield", "runtime" : 90 }
{ "title" : "Il trucido e lo sbirro", "runtime" : 90 }
{ "title" : "Tout le monde n'a pas eu la chance d'avoir des parents communistes", "runtime" : 90 }
{ "title" : "Eu Não Faço a Menor Ideia do Que Eu Tô Fazendo Com a Minha Vida", "runtime" : 90 }
{ "title" : "The Death of J.P. Cuenca", "runtime" : 90 }
{ "title" : "Class of Nuke 'Em High Part II: Subhumanoid Meltdown", "runtime" : 90 }
{ "title" : "KJ: Music and Life", "runtime" : 90 }
Type "it" for more
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.find({runtime: {$ne: 90}}, {_id: 0, title: 1, runtime: 1})
{ "title" : "Once Upon a Time in the West", "runtime" : 175 }
{ "title" : "A Million Ways to Die in the West", "runtime" : 116 }
{ "title" : "Wild Wild West", "runtime" : 106 }
{ "title" : "West Side Story", "runtime" : 152 }
{ "title" : "Slow West", "runtime" : 84 }
{ "title" : "An American Tail: Fievel Goes West", "runtime" : 75 }
{ "title" : "Red Rock West", "runtime" : 98 }
{ "title" : "How the West Was Won", "runtime" : 164 }
{ "title" : "Journey to the West", "runtime" : 110 }
{ "title" : "West of Memphis", "runtime" : 147 }
{ "title" : "Star Wars: Episode IV - A New Hope", "runtime" : 121 }
{ "title" : "Star Wars: Episode V - The Empire Strikes Back", "runtime" : 124 }
{ "title" : "Star Wars: Episode VI - Return of the Jedi", "runtime" : 131 }
{ "title" : "Star Wars: Episode I - The Phantom Menace", "runtime" : 136 }
{ "title" : "Star Wars: Episode III - Revenge of the Sith", "runtime" : 140 }
{ "title" : "Star Trek", "runtime" : 127 }
{ "title" : "Star Wars: Episode II - Attack of the Clones", "runtime" : 142 }
{ "title" : "Star Trek Into Darkness", "runtime" : 132 }
{ "title" : "Star Trek: First Contact", "runtime" : 111 }
{ "title" : "Star Trek II: The Wrath of Khan", "runtime" : 113 }
Type "it" for more
~~~


| **Operador** | **Descripción** | **Ejemplo** |
|-------------|----------------|-------------|
| `$gt` | Mayor que | `db.usuarios.find({edad: {$gt: 18}})` |
| `$lt` | Menor que | `db.usuarios.find({edad: {$lt: 60}})` |
| `$gte` | Mayor o igual que | `db.usuarios.find({edad: {$gte: 21}})` |
| `$lte` | Menor o igual que | `db.usuarios.find({edad: {$lte: 65}})` |
| `$eq` | Igual a | `db.usuarios.find({nombre: {$eq: "Pedro"}})` |
| `$ne` | No igual a | `db.usuarios.find({nombre: {$ne: "Pedro"}})` |


* Operadores lógicos
      
    * $and y $or: ambos operadores unen dos valores de una consulta, sin embargo $and mostrara todos los documentos que coincidan con ambos valores mientras que $or mostrara todos los documentos que coincidan con uno de los dos valores.

    * $not: devuelve los documentos que no esten relacionados con los valores de consulta.
          
    * $nor: devuelve los documentos que no coinciden con ambos valores de busqueda.

+ Operadores de elementos

    * $exists: muestra los documentos que coinciden con la busqueda.
    * $type: muestra los documentos si un campo es del typo especificado.

* Operadores de matrices

    * $all: coincide con las matrices o arrays que contienen todos los elementos especificados en una consulta. 
    * $size: muestra los documentos siempre que la array tenga el tamaño especificado.
    * $elemMatch: muestra los documentos si el elemento del campo array coincide con los valores especificados

* Operadores de evaluación
      
    * $regexp: muestra documentos donde los valores coinciden con la expresion regular especificada.


### Metodo para contabilizar los resultados de busqueda ###

En mongodb hay dos formas bastante parecidas de contabilizar los resultados de una busqueda:

* Usando el metodo count. Ej contar las peliculas que hay en la base de datos de peliculas:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.count()
2295
~~~

* Usando el metodo count junto al metodo find:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.find().count()
2295
~~~

Ambas formas dan el mismo resultado, sin embargo la diferencia entre estos dos metodos, es que usando solamente count no es posible filtrar, es decir no puedo pedir contar las peliculas de un genero especifico, ya que count solo lo que hace es mostrar la cantidad de documentos que componen la colección de la base de datos.

Esto actualmente parece que ya no es asi, ya que he podido comprobar que en ambos es posible filtrar:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.count({genres: "Comedy"})
749
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.find({genres: "Comedy"}).count()
749
~~~

### Metodo limit ###

El metodo limit, limitara el numero de resultado en un filtro, por ejemplo si en lugar de mostrar todas las peliculas, solo quieres mostrar las 3 o 4 primeras.

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.find({genres: "Comedy"}).limit(2).pretty()
{
	"_id" : ObjectId("5e7754bbff453565d25411d4"),
	"title" : "The Adventures of Buckaroo Banzai Across the 8th Dimension",
	"year" : 1984,
	"rated" : "PG",
	"runtime" : 103,
	"countries" : [
		"USA"
	],
	"genres" : [
		"Adventure",
		"Comedy",
		"Romance"
	],
	"director" : "W.D. Richter",
	"writers" : [
		"Earl Mac Rauch"
	],
	"actors" : [
		"Peter Weller",
		"John Lithgow",
		"Ellen Barkin",
		"Jeff Goldblum"
	],
	"plot" : "Adventurer/surgeon/rock musician Buckaroo Banzai and his band of men, the Hong Kong Cavaliers, take on evil alien invaders from the 8th dimension.",
	"poster" : "http://ia.media-imdb.com/images/M/MV5BMTk3OTAwNDQwOF5BMl5BanBnXkFtZTgwOTE0MzQxMDE@._V1_SX300.jpg",
	"imdb" : {
		"id" : "tt0086856",
		"rating" : 6.4,
		"votes" : 17154
	},
	"awards" : {
		"wins" : 0,
		"nominations" : 5,
		"text" : "5 nominations."
	},
	"type" : "movie"
}
{
	"_id" : ObjectId("5e7754bbff453565d25411ba"),
	"title" : "Love Actually",
	"year" : 2003,
	"rated" : "R",
	"runtime" : 135,
	"countries" : [
		"UK",
		"USA",
		"France"
	],
	"genres" : [
		"Comedy",
		"Drama",
		"Romance"
	],
	"director" : "Richard Curtis",
	"writers" : [
		"Richard Curtis"
	],
	"actors" : [
		"Bill Nighy",
		"Gregor Fisher",
		"Rory MacGregor",
		"Colin Firth"
	],
	"plot" : "Follows the lives of eight very different couples in dealing with their love lives in various loosely interrelated tales all set during a frantic month before Christmas in London, England.",
	"poster" : "http://ia.media-imdb.com/images/M/MV5BMTY4NjQ5NDc0Nl5BMl5BanBnXkFtZTYwNjk5NDM3._V1_SX300.jpg",
	"imdb" : {
		"id" : "tt0314331",
		"rating" : 7.7,
		"votes" : 306036
	},
	"tomato" : {
		"meter" : 63,
		"image" : "fresh",
		"rating" : 6.4,
		"reviews" : 192,
		"fresh" : 120,
		"consensus" : "A sugary tale overstuffed with too many stories. Still, the cast charms.",
		"userMeter" : 72,
		"userRating" : 3.1,
		"userReviews" : 31625241
	},
	"metacritic" : 55,
	"awards" : {
		"wins" : 10,
		"nominations" : 24,
		"text" : "Nominated for 2 Golden Globes. Another 10 wins & 24 nominations."
	},
	"type" : "movie"
}
~~~

Anteriormente vimos que de genero comedy habia 749 resultados, sin embargo ahora solo se muestran 2 por estar limiado a 2.

### Update ###

Una de las cosas que distingue a mongodb de los gestores de datos relaciones, es la flexibilidad que tiene, ya que por ejemplo en mongodb no es necesario que los documentos de una misma colección tengan el mismo esquema, al contrario que en las bases de datos relacionales. Por ejemplo en la bases de datos de peliculas, todos los documentos tienen los mismos campos basicos, sin embargo hay campos que solo tienen algunas, como por ejemplo el campo premios que obviamente solo tienen las peliculas que ganaron alguno o por ejemplo el campo poster.

Usando compass es muy facil actualizar un documento ya que lo podemos editar a mano y simplemente podemos hacer clic en actualizar.

En shell por otro lado, la actualización de un documento se hace a traves del metodo updateOne(). Para ello primero se hace un filtro para concretar el documento a actualizar, hay que tener en cuenta que este metodo solo actualizara el primer documento que coincida con el filtro.

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.updateOne({title: “The Martian”}, {$set: {poster: https://www.google.com/url?sa=i&url=http%3A%2F%2Fwww.sensacine.com%2Fpeliculas%2Fpelicula-221524%2F&psig=AOvVaw1MypUGK_TXWkglEMdCNTXV&ust=1616771781342000&source=images&cd=vfe&ved=2ahUKEwiJs_mu3svvAhUJxOAKHXI0BEMQjRx6BAgAEAc}})
~~~

En este caso hacemos uso del operador $set para indicar el campo que se va a añadir a la pelicula con el titulo “The Martian”. En el caso de que el campo poster ya exista, si usamos $set se modificara el campo poster con el nuevo valor que hemos añadido.

Este metodo seguramente resulte familiar al uso de insertOne e insertMany y al igual que ocurre con insert, tambien existe un updateMany.

La diferencia entre updateOne y updateMany es que updateMany actualizara o modificara todos aquellos documentos que coincidan con el filtro, mientras updateOne solo actualiza o modifica el primero. Por ejemplo en la base de datos de peliculas, en algunos de los documentos se encuentrar campos que aparecen nulos (nulls) y se van a eliminar de la siguiente forma:

~~~
MongoDB Enterprise Cluster0-shard-0:PRIMARY> db.movieDetails.updateMany({rated: null}, {$unset: {rated: “”}})
~~~

En este caso se usa el operador $unset para eliminar el contenido, en este caso a todas las peliculas cuyo campo rated sea null se le eliminara el campo rated.

### Remplazar ###

ReplaceOne lo podemos usar tanto para modificar la informacion de la base de datos como para añadir contenido nuevo usando para ello upset.

La sintaxis de replaceOne seria la siguiente, replaceOne({Objeto a reemplazar},{reemplazo}). Por ejemplo, si contamos con una base de datos de alumnos y queremos reemplazar la informacion de un alumno que tenga como apellido "Gonzalez" y lo queramos sustituir por "nombre: sergio, apellido: ibañez", seria de la siguiente forma:

db.alumnos.replaceOne({apellido: Gonzalez},{nombre: sergio, apellido: ibañez})

### Delete ###

Para eliminar datos en mongodb, tenemos dos opciones al igual que con insert y update, deleteOne y deleteMany.

deleteOne elimina solo el primer documento que coincida con el filtro realizado, es decir, que si por ejemplo haciendo uso de nuestra base de datos de peliculas queremos eliminar todas aquellas peliculas de un genero especifico como Comedy, seria de la siguiente forma:

db.peliculas.deleteOne(genre: "Comedy")

Sin embargo, de este genero hay varias peliculas, pero solo se eliminaria el primer resultado ya que deleteOne lo que hace es eliminar solo la primera coincidencia.

Es aqui donde entra en juego el uso de deleteMany, ya que elimina todos aquellos documentos que coincidan con el filtro, es decir, que en este caso hacemos lo mismo que en el caso anterior, pero esta vez eliminariamos todas las peliculas del genero especificado en el filtro.