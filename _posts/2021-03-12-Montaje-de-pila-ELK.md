---
title: "Montaje de pila ELK"
date: 2021-03-12T18:22:23+01:00
categories: [Sistemas]
excerpt: "Es un conjunto de herramientas de gran potencial de código abierto que se combinan para crear una herramienta de administración de registros permitiendo la monitorización, consolidación y análisis de logs generados en múltiples servidores, estas herramientas son:ElasticSearch, Logstash y Kibana."
card_image: /assets/images/cards/elk.png
---

### **¿Que es una pila ELK?** ###

Es un conjunto de herramientas de gran potencial de código abierto que se combinan para crear una herramienta de administración de registros permitiendo la monitorización, consolidación y análisis de logs generados en múltiples servidores, estas herramientas son:ElasticSearch, Logstash y Kibana.

Para poder montar la pila completa sera necesario que la maquina que aloje las tres maquinas tenga mas de 2Gb de ram. Tambien es posible instalar estas herramientas en equipos distintos, sin embarlo la maquina donde se instale elasticsearch necesitara un minimo de 2gb.

### **Elasticsearch** ###

Elasticsearch es un motor de búsqueda que se basa en Lucene el cual nos permite realizar búsquedas por una gran cantidad de datos de un texto específico. Está escrito en Java y se basa sobre una licencia Apache.
Gracias al motor Lucene sobre el que está implementado, Elasticsearch nos ofrece capacidades de búsquedas de texto, autocompletado, soporte de geolocalización,…

Se podría decir que Elasticsearch es como una base de datos NoSQL orientada a documentos JSON, los cuales pueden ser consultados, creados, actualizados o borrados mediante un un sencillo API Rest.

Características:

* Acceso a datos: Podemos añadir, buscar y analizar grandes cantidades de datos en tiempo real de forma distribuida. Tanto la configuración como el acceso a los datos lo podemos hacer mediante APIrestful, además cuenta con varias librerías para clientes (java, python, php, ruby,…)
* Escalabilidad: Permite una arquitectura distribuida, escalable horizontalmente y en alta disponibilidad.
* Rapidez: Esta diseñado para realizar búsquedas de texto completo muy rápido.
* Permite almacenar documentos en formato json, lo que es muy util para soluciones NoSQL.

Instalación:

Elasticsearch como se ha dicho anteriormente esta basado en java, por lo que para poder instalarlo previamente sera necesario instalar el paquete default-jdk

~~~
apt install default-jdk
~~~

Establecemos una variable de entorno llamada $JAVA_HOME, esto no es obligatorio, pero si muy recomendable, de esta forma las herramientas basadas en java sabran donde se encuentran los paquetes java necesarios para el funcionamiento.

~~~
export JAVA_HOME="/usr/lib/jvm/default-java"
~~~

Instalamos ademas el paquete gnupg, ya que sera necesario para descargar y añadir la clave de elasticsearch a los repositorios.

~~~
apt install gnupg
~~~ 

Descargamos la clave oficial de elasticsearch:

~~~
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
~~~

Esta clave también sera usada por kibana y logstash.

Instalamos también apt-transport-https para poder usar los repositorios https de elastic:

~~~
sudo apt install apt-transport-https
~~~

Añadimos los repositorios de elasticsearch:

~~~
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
~~~

Actualizamos e instalamos elasticsearch

~~~
apt update && apt install elasticsearch
~~~

Iniciamos el demonio y habilitamos el servicio para que inicie al arrancar la maquina:

~~~
systemctl daemon-reload
systemctl enable elasticsearch.service
systemctl start elasticsearch.service
~~~

Configuración de elasticsearch (/etc/elasticsearch/elasticsearch.yml):

~~~
path.data: /var/lib/elasticsearch #donde almacena datos por defecto
path.logs: /var/log/elasticsearch #donde almacena logs por defecto
discovery.seed_hosts: [“localhost”, “10.0.0.12”]
network.host: 0.0.0.0 #direcciones de las que elasticsearch permite peticiones.
cluster.name: openstack #nombre del cluster
node.name: ${HOSTNAME} #nombre del nodo
bootstrap.system_call_filter: false
~~~

La opción boostrap.system se usa para reservar memoria para este servico, en este caso al no ser necesario se configura la opción a false.

Se reinicia el servicio:

~~~
systemctl restart elasticsearch.service
~~~

Para comprobar que funciona correctamente, instalamos el paquete curl:

~~~
apt install curl
~~~

Hacemos la prueba ejecutando curl -X GET ‘http://:9200’, despues podremos ver el estado del cluster con la siguiente consulta:

~~~
root@dulcinea:/home/debian# curl -X GET 'http://localhost:9200'
{
  "name" : "dulcinea",
  "cluster_name" : "Openstack",
  "cluster_uuid" : "CVM-GIa-SSaheA0bXU1QsA",
  "version" : {
    "number" : "7.10.2",
    "build_flavor" : "default",
    "build_type" : "deb",
    "build_hash" : "747e1cc71def077253878a59143c1f785afa92b9",
    "build_date" : "2021-01-13T00:42:12.435326Z",
    "build_snapshot" : false,
    "lucene_version" : "8.7.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
~~~

Esta consulta nos devuelve información básica del servidor.

~~~
root@dulcinea:/home/debian# curl -X GET 'http://localhost:9200/_cluster/health?pretty'
{
  "cluster_name" : "Openstack",
  "status" : "yellow",
  "timed_out" : false,
  "number_of_nodes" : 1,
  "number_of_data_nodes" : 1,
  "active_primary_shards" : 13,
  "active_shards" : 13,
  "relocating_shards" : 0,
  "initializing_shards" : 0,
  "unassigned_shards" : 2,
  "delayed_unassigned_shards" : 0,
  "number_of_pending_tasks" : 0,
  "number_of_in_flight_fetch" : 0,
  "task_max_waiting_in_queue_millis" : 0,
  "active_shards_percent_as_number" : 86.66666666666667
}
~~~ 

Esta consulta nos devuelve información del estado del servidor, en este caso esta en estado "yellow" ya que no tiene replicas creadas.

### **Kibana** ###

Kibana es una interfaz de usuario gratuita y abierta que te permite visualizar los datos de Elasticsearch y navegar en el ElasticStack. Realiza lo que desees, desde rastrear la carga de búsqueda hasta comprender la forma en que las solicitudes fluyen por tus apps.

Características:

    • Visualizaciones, histogramas, gráficas en tiempo, tartas y roscos, tablas…
    • Datos en tiempo real ya que elasticsearch busca la información en pocos segundos
    • Dashboards: se recogen visualizaciones en paneles donde tener una vista global de todas.
    • Geolocalizacion: coordenadas en mapas

Instalación de kibana:

En este caso como kibana va ha estar en la misma maquina que elasticsearch, no sera necesario volver a descargar la clave ni añadir el repositorio de nuevo, por lo que simplemente ejecutamos un install.

~~~
apt install kibana
~~~

Se habilita el servidor:

~~~
systemctl daemon-reload
systemctl enable kibana.service
systemctl start kibana.service
~~~

Configuración de kibana (/etc/kibana/kibana.yml):

~~~
server.port: 5601
server.host: 0.0.0.0 #dirección donde escuchara kibana
elasticsearch.hosts: “http://172.28.128.33:9200"
logging.dest: /var/log/kibana/kibana.log
~~~

El ultimo parámetro indica el fichero log de kibana, pero para que funcione tendrá que crearse el directorio kibana y hacerlo propiedad del usuario kibana:

~~~
mkdir /var/log/kibana
chown -R kibana:kibana /var/log/kibana
~~~

![kibana](/assets/images/monitorizacion/kibana.png)

### **Logstash** ###

logstash es un pipeline de procesamiento de datos gratuito y abierto del lado del servidor que ingresa datos de una multitud de fuentes, los transforma y luego los envía a la ubicación elegida.

Caracteristicas:

    • Soporta distintos formatos de entrada, permitiendo la entrada de datos simultanea de logs, métricas, bases de datos, etc.
    • Transformaciones al vuelo: estructura datos, añade geolocalizaciones, trabaja con fingerprints y reconoce fechas
    • Distintas salidas disponibles: encamina la información hacia ellas aportando flexibilidad para distintos casos de uso.
    • Extensibilidad: ofrece +200 plugins ademas de permitir crear plugins propios.
    • Durabilidad: permite usar una “cola” de almacenamiento temporal frente a errores.
    • Monitorizacion: visibilidad de los recurso de las maquinas y estadísticas del servicio.
    • Seguridad: ofrece información cifrada de la comunicación de los servicios tanto de entrada como de salida.
      

Se instala y se habilita logstash

~~~
apt install logstash
~~~

Habilitamos el logstash:

~~~
systemctl enable logstash
~~~

### **Instalación y configuración por parte de los clientes** ###

Metricbeats:

Descargamos e instalamos metricbeats para recoger métricas del sistema operativo y los servicios iniciados en la maquina.

~~~
curl -L -O https://artifacts.elastic.co/downloads/beats/metricbeat/metricbeat-7.10.2-amd64.deb
~~~

~~~
dpkg -i metricbeat-7.10.2-amd64.deb
~~~

Configuración de metricbeat (/etc/metricbeat/metricbeat.yml):

~~~
output.elasticsearch: 
hosts: 172.28.128.33 #direccion elasticsearch
username: "elastic" 
password: "<password>" 
setup.kibana: 
host: 172.28.128.33
~~~

Añadimos los modulos necesarios mara que metricbeats pueda comunicarse con nuestras herramientas:

~~~
metricbeat modules enable logstash
metricbeat modules enable elasticsearch
metricbeat modules enable kibana
~~~

Habilitamos metricbeats:

~~~
metricbeat setup
systemctl daemon-reload
systemctl enable filebeat
systemctl start filebeat
~~~

Por parte de los clientes, se va a instalar en tos ellos metricbeat y en algunos casos como en el caso de centos como en ubuntu se instalara también filebeat, en el caso de centos para obtener los logs de apache y en el caso de ubuntu para obtener los logs de mysql con el que se podrán monitorizar ademas las copias de seguridad.

En el caso de freston y sancho, la instalación de metricbeat y de filebeat se hace  de la misma forma que en dulcinea, se añade el repositorio, se instala con curl, se desempaqueta con dpkg, se instala y configura indicando el host de kibana y elasticsearch.

Por otro lado en centos importamos la clave de elastic:

~~~
rpm --import https://packages.elastic.co/GPG-KEY-elasticsearch
~~~

Creamos un fichero de configuración en el repositorio (/etc/yum.repos.d/elastic.repo):

~~~
[elastic-7.x]
name=Elastic repository for 7.x packages
baseurl=https://artifacts.elastic.co/packages/7.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
~~~

Instalamos metricbeat:

~~~
dnf install metricbeat
~~~

Se habilitan los modulos y se inicia tanto el servicio como el demonio.

~~~
metricbeat modules enable logstash
metricbeat modules enable elasticsearch
metricbeat modules enable kibana

metricbeat setup
systemctl daemon-reload
systemctl enable metricbeat
systemctl start metricbeat
~~~

Una vez montado todo comprobaremos su funcionamiento:

![monitorizacion de dulcinea](/assets/images/monitorizacion/dulcinea.png)

![comprobacion de metricas del servidor](/assets/images/monitorizacion/metricas.png)

![monitorizacion](/assets/images/monitorizacion/mon1.png)