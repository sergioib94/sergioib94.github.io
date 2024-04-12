---
title: "Monitorizacion de servidores con grafana"
date: 2024-04-11T13:14:06+02:00
categories: [Sistemas, Monitorización]
excerpt: "Grafana open source es un software de análisis y visualización de código abierto. Le permite consultar, visualizar, alertar y explorar sus métricas, registros y seguimientos sin importar dónde estén almacenados. Le proporciona herramientas para convertir los datos de su base de datos de series temporales (TSDB) en gráficos y visualizaciones interesantes."
---

### **Instalación de grafana en debian** ###

Empezaremos instalando Grafana en nuestro sistema debian haciendo uso del repositorio oficial de grafana, pero antes necesitaremos instalar el software necesario que necesita grafana para poder funcionar ejecutando los siguientes comandos.

~~~
sudo apt install -y apt-transport-https
sudo apt install -y software-properties-common wget
~~~

El siguiente paso es descargar la llave GPG, para poder firmar los paquetes instalado

~~~
sudo wget -q -O /usr/share/keyrings/grafana.key https://apt.grafana.com/gpg.key
~~~

Ahora es necesario crear el fichero /etc/apt/sources.list.d/grafana.list para añadir los repositorios de Grafana.

~~~
echo "deb [signed-by=/usr/share/keyrings/grafana.key] https://apt.grafana.com stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
~~~

Actualizamos la lista de paquetes de nuestro sistema

~~~
sudo apt update
~~~

Una vez actualizado los paquetes del sistema ya podemos empezar a instalar grafana

~~~
sudo apt install grafana
~~~

Cuando ya tengamos grafana instalado, podremos iniciarlo y añadirlo al arranque de nuestra maquina

~~~
sudo systemctl start grafana-server
~~~

Para poder asegurarnos de que el servidor se inicia correctamente (debe aparecer con estado active (running)) podemos ejecutar el comando usado anterioremente haciendo uso de la opcion "status"

~~~
sudo systemctl status grafana-server
~~~

Finalmente habilitamos grafana en el inicio de servidor para que inicie en el arranque

~~~
sudo systemctl enable grafana-server.service
~~~

Con esto ya estaria completa la instalacion de grafana y ya podriamos acceder a la web de grafana para poder loguearnos, para ello hay que indicar en la barra de busqueda de cualquier navegador la ip de nuestra maquina (o su dominio), indicando el puerto 3000 que es el usado por grafana por defecto. en mi caso se accede con la direccion 192.168.1.146:3000

![Grafana login](sergioib94.github.io\images\grafana_login.png)

NOTA: por defecto la primera vez que se accede a grafana las credenciales siempre van a ser admin/admin, una ves se acceda por primera vez pedira un cambio e contraseña y podremos empezar a trabajar con grafana.

Al acceder a grafana, en el menu de la izquierda encontraremos varias opciones interesantes para trabajar como pueden ser los dashboards que podremos configurar para revisar las metricas y monitorizar las maquinas de nuestro sistema, explorar Si su fuente de datos admite datos de gráficos y tablas, Explore muestra los resultados tanto en forma de gráfico como de tabla, alertas que nos permitira conocer los problemas en sus sistemas momentos después de que ocurren o data sources que proporciona instrucciones paso a paso sobre cómo agregar una fuente de datos de Prometheus, InfluxDB o MS SQL Server.

### **Instalacion de prometheus** ###

Grafana necesitas añadir un nuevo data source, que es la base de datos que guarda las métricas que muestra Grafana, en este caso se hara uso de prometheus por lo que empezaremos con la instalacion de prometheus en nuestra maquina. Prometheus en un sistema open-source de moitorizacion y alerta.

Comenzamos instalando prometheus

~~~
apt install prometheus prometheus-node-exporter
~~~

Tras la instalacion de prometheus tenemos que comprobar tanto que tenemos dos conexiones TCP escuchando en los puertos 9090 y 9100, esto lo comprobamos con el siguiente comando

~~~
netstat -plunt
~~~

Nota: para poder hacer uso del comando netstat tendremos que tener instalado en el sistema el paquete net-tools

Como la version de prometheus que usemos tiene que ser comptible con la de grafana, es recomendable revisar nuestra version de prometheus

~~~
prometheus-node-exporter --version
~~~

En mi caso la version de prometheus usada es la siguiente

~~~
node_exporter, version 1.5.1 (branch: debian/sid, revision: 1.5.0-1)
~~~

### **Configuración del data source de prometheus** ###

Grafana necesita una base de datos que guarde las metricas guardadas por grafana, en este caso se hara uso de prometheus, otras opciones pueden ser graphite, influxDB u openTSDB entre otros.

Para añadir la base de datos de prometeus a grafana accedemos primero al sitio web de nuestro grafana como se ha indicado anteriormente, buscando en nuestro navegador la ip o dominio de nuestra maquina e indicando el puerto 3000.

En el menu de la izquierda vamos a la opcion "connections" y despues a la opcion "data sources", donde nos aparecera la opcion para añadir nuestra base de datos, en este caso prometheus, para ello sera necesario añadir la URL http://localhost:9090.

![Data source](sergioib94.github.io\images\data-source.png)

### **Cracion de dashboards** ###

Con grafana tenemos la opcion tanto de crear nuestro propio dashboard dependiendo de las necesidaddes de monitarizacion que tenga neustro sistema asi como tambien la opcion de importar dashboards creados por la comunidad en https://grafana.com/grafana/dashboards/

En este caso para importar los dashboards se puede indicar tanto la url del dashboard como la ID, en esta practica se ha usado el dashboard Node exporter siendo el mas descargado por lo que para su uso indicamos la ID de node-exportes (1860) y ya podremos empezar a usar el dashboard.

![Dashboard](sergioib94.github.io\images\metrica.png)