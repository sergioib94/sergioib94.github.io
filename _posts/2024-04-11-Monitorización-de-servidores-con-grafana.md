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

Con esto ya estaria completa la instalacion de grafana y ya podriamos acceder a la web de grafana para poder loguearnos, para ello hay que indicar en la barra de busqueda de cualquier navegador la ip de nuestra maquina (o su dominio), indicando el puerto 3000 que es el usado por grafana por defecto. en mi caso se accede con la direccion 192.168.110.129:3000

![Grafana login](/images/Grafana/grafana_login.png)

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

![Data source](/images/Grafana/data-source.png)

### **Cracion de dashboards** ###

Con grafana tenemos la opcion tanto de crear nuestro propio dashboard dependiendo de las necesidaddes de monitarizacion que tenga neustro sistema asi como tambien la opcion de importar dashboards creados por la comunidad en [Grafana dashboards](https://grafana.com/grafana/dashboards/)

En este caso para importar los dashboards en el menu de la izquierda buscamos la opcion de "dashboards", abrimos la opcion "create dashboard" y despues entre las tres opciones que nos ofrece grafana seleccionamos la opcion "import dashboard". Una vez ahi para importar el dashboard podemos indicar tanto la url del dashboard como la ID, 

A modo de ejemplo se ha usado el dashboard Node exporter siendo el mas descargado por lo que para su uso indicamos la ID de node-exportes (1860) y ya podremos empezar a usar el dashboard.

![Dashboard](/images/Grafana/metrica.png)

Si por el contrario en lugar de importar dashboards creados por la comunidad queremos crear nuestros propios dashboards personalizados dependiendo de las necesidades que tengamos a la hora de monitorizar tendriamos que realizar los siguientes pasos:

Al igual que se ha hecho anteriormente, en el menu de la izquierda buscamos la opcion de "dashboards" y abrimos la opcion "create dashboard" pero esta vez en lugar de seleccionar la opcion "import dashboard", elegimos la opcion "+ add visualization".

Al acceder a "add visualization" lo primero que nos pedira grafana sera que elijamos un data source que sera desde donde grafana obtenga los datos de las metricas. Al tratarse de una maquina recien creada en mi caso el unico data source que da la opcion de seleccionar sera el de prometheus pero segun las necesidades que tengamos podemos instalar cualquier otro para poder usarlo.

![Prometheus](/images/Grafana/prometheus.png)

Al crear un dashboard vacio, lo primero que haremos sera crear los paneles. Un panel es el bloque básico para la visualización de los datos. Grafana provee diferentes tipos de paneles y cada uno de ellos provee un editor de consulta (query) dependiendo del tipo de Data Source seleccionado.

![Panel vacio](/images/Grafana/panel.png)

Vamos a crear un panel de tipo grafico en el que por ejemplo consultaremos la tasa promedio de solicitudes HTTP en los últimos 5 minutos, para ello en la parte de abajo donde visualizamos los paneles encontraremos la opcion "query" donde podremos realizar diversas consultas de datos en el apartado "metrics". Como por ejemplo lo que queremos consultar es la tasa promedio de solicitudes http la metrica que necesitamos seia la de "prometheus_http_request_total".

Tambien podemos agrgar un rango de tiempo para que los datos esten lo mas actualizados posibles, en este caso como rango de tiempo se ha puesto de 5 min, para ello bajo el apartado metrica nos aparecera una opcion llamada "hint: add rate" donde tendremos para elegir distintos rangos de actualizacion, desde 1 min a 24h.

Cuando tengamos claro el tipo de consulta que haremos, en el apartado derecho seleccionaremos el tipo de grafica para mostrar los datos ademas de poder seleccionar diversas opciones para que esos datos se muestren lo mejor y mas claramente posible.

### **Configuraciones de paneles** ###

A la hora de configurar y editar nuestros paneles en el menu de la derecha contamos con varias opciones que nos pueden ser utiles para poder diferenciar los datos que mostrara dicho panel en el dashboard. La primera opcion que veremos sera la que nos permitira seleccionar la forma grafica en la que los datos se nos mostraran.

* Panel options

En este apartado podremos ponerle un nombre y descripcion (si fuese necesario) al panel que se haya creado. Ademas de indicar un nombre y descripcion tambien contaremos con una opcion que puede ser muy util que seria la opcion "panel links" lo que nos permitira compartir paneles entre distintos miembros de un equipo o distintos usuarios compartiendo la url que genere el panel.