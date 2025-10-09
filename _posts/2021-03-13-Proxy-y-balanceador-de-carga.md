---
layout: single
title: "Proxy y balanceador de carga"
date: 2021-03-13T12:44:43+01:00
categories: [Servicios]
excerpt: "En este posts se explicara el uso y configuracion de un balanceador de carga usando para ello una maquina virtual de un escenario virtual creado en posts anteriores."
---

### **Balanceador de carga** ###

En la maquina de nuestro escenario llamada balanceador, instalamos haproxy:

~~~
apt install haproxy
~~~

Configuramos haproxy (/etc/haproxy/haproxy.cfg) de la siguiente forma:

~~~
global
    daemon
    maxconn 256
    user    haproxy
    group   haproxy
    log     127.0.0.1       local0
    log     127.0.0.1       local1  notice     
defaults
    mode    http
    log     global
    timeout connect 5000ms
    timeout client  50000ms
    timeout server  50000ms        
listen granja_cda 
    bind 172.22.5.31:80 #aquí pon la dirección ip del balanceador
    mode http
    stats enable
    stats auth  cda:cda
    balance roundrobin
    server uno 10.10.10.11:80 maxconn 128
    server dos 10.10.10.22:80 maxconn 128
~~~

Una vez configurado, tendremos que iniciar el servicio, pero antes para ello tendremos que añadir la siguiente linea al fichero /etc/default/haproxy de forma que haproxy pueda arrancar desde el script de inicio.

~~~
ENABLED=1
~~~

Balanceador en funcionamiento:

![apache1](/images/proxy-balanceador/apache1.png)

![apache2](/images/proxy-balanceador/apache2.png)

Tarea 2: Entrega una captura de pantalla donde se vea la página web de estadísticas de haproxy (abrir en un navegador web la URL http://172.22.x.x/haproxy?stats, pedirá un usuario y un password, ambos cda).

![estadisticas haproxy](/images/proxy-balanceador/tarea2_balanceador.png)

Tarea 3: Desde uno de los servidores (apache1 ó apache2), verificar los logs del servidor Apache. En todos los casos debería figurar como única dirección IP cliente la IP interna de la máquina balanceador 10.10.10.1. ¿Por qué?

~~~
root@apache1:/home/vagrant# cat /var/log/apache2/access.log 
10.10.10.1 - - [23/Feb/2021:09:25:15 +0000] "GET / HTTP/1.1" 200 436 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"
10.10.10.1 - - [23/Feb/2021:09:32:23 +0000] "GET / HTTP/1.1" 200 436 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"
10.10.10.1 - - [23/Feb/2021:09:32:25 +0000] "GET / HTTP/1.1" 200 436 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"
10.10.10.1 - - [23/Feb/2021:09:32:27 +0000] "GET / HTTP/1.1" 200 436 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"
10.10.10.1 - - [23/Feb/2021:09:32:28 +0000] "GET / HTTP/1.1" 200 436 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"
10.10.10.1 - - [23/Feb/2021:09:32:30 +0000] "GET / HTTP/1.1" 200 436 "-" "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"
~~~

Como podemos ver, siempre se nos muestra la ip interna de la maquina balanceadora ya que es la que se encarga de preguntar a los servidores web y también el que manda la respuesta al cliente.

### Configurar la persistencia de conexiones web (sticky sessions) ###

Configuramos para empezar el fichero /etc/haproxy/haproxy.cfg añadiéndole las siguientes lineas

~~~
    cookie PHPSESSID prefix                               
    server uno 10.10.10.11:80 cookie EL_UNO maxconn 128   
    server dos 10.10.10.22:80 cookie EL_DOS maxconn 128
~~~

Tarea 4: Verificar la estructura y valores de las cookies PHPSESSID intercambiadas. En la primera respuesta HTTP (inicio de sesión), se establece su valor con un parámetro HTTP SetCookie en la cabecera de la respuesta. Las sucesivas peticiones del cliente incluyen el valor de esa cookie (parámetro HTTP Cookie en la cabecera de las peticiones.

![coockie1](/images/proxy-balanceador/coockie1.png)

![coockie2](/images/proxy-balanceador/coockie2.png)

![cabecera cookie](/images/proxy-balanceador/cabecera_cookie.png)

### Proxy ###

Tarea 1: Instala squid en la máquina squid y configúralo para que permita conexiones desde la red donde este tu ordenador.

Instalamos haciendo apt install squid3

Configuracion (/etc/squid/squid.conf):

tenemos que comprobar que la linea http_port este descomentada y tenga el puerto por defecto 3128.

También creamos una acl por ejemplo llamada en este caso redlocal y modificamos la linea http_access allow localhost de forma que permitamos las conexiones desde nuestra red.

~~~
acl redlocal src 192.168.200.0/24

http_access allow redlocal
~~~

![acceso proxy](/images/proxy-balanceador/acceso_proxy.png)

Tarea 2: Prueba que tu ordenador está navegando a través del proxy (HTTP/HTTPS) configurando el proxy de dos maneras diferentes:
      
* Directamente indicándolo en el navegador.

Una vez configuradas estas lineas, en nuestra maquina cliente configuraremos en nuestra maquina el proxy en un navegador firefox.

Para configurar el acceso a proxy en firefox:

Menú → Preferencias → General → Configuración de red → Configuración

![configuracion proxy](/images/proxy-balanceador/configuracion_proxy.png)

Configuramos el proxy de la siguiente forma y accedemos a alguna pagina mientras vemos los logs de nuestro proxy para comprobar su correcto funcionamiento.

~~~
Cat /var/log/squid/access.log

1614097489.287   8227 192.168.200.1 TCP_TUNNEL/200 26299 CONNECT www.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
1614097489.294   5112 192.168.200.1 TCP_TUNNEL/200 4046 CONNECT www.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
1614097489.294   5120 192.168.200.1 TCP_TUNNEL/200 20014 CONNECT www.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
1614097489.296   5120 192.168.200.1 TCP_TUNNEL/200 20421 CONNECT www.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
1614097489.309   5116 192.168.200.1 TCP_TUNNEL/200 18348 CONNECT www.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
1614097489.396   5215 192.168.200.1 TCP_TUNNEL/200 8312 CONNECT plataforma.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
1614097489.478   5294 192.168.200.1 TCP_TUNNEL/200 239366 CONNECT www.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
~~~

* Configurando el proxy del sistema en el entorno gráfico (tienes que indicar en el navegador que vas a hacer uso del proxy del sistema).
      
Muestra el contenido del fichero ´/var/log/squid/access.log` para comprobar que está funcionando el proxy.
      
Tarea 3: Configura squid para que pueda ser utilizado desde el cliente interno. En el cliente interno configura el proxy desde la línea de comandos (con una variable de entorno). Fíjate que no hemos puesto ninguna regla SNAT y podemos navegar (protocolo HTTP), pero no podemos hacer ping o utilizar otro servicio.

Para que nuestro cliente use el proxy, volvemos a modificar el fichero /etc/squid/squid.conf, añadiendo esta vez las siguientes lineas:

~~~
acl redinterna src 10.0.0.0/24

http_access allow redinterna
~~~

En este caso como el cliente no tiene entorno gráfico, instalamos el paquete w3m por ejemplo para comprobar el funcionamiento del proxy.

Configuramos las variables de entorno:

Como ejemplo, en el cliente accedemos por w3m a la moodle mientras en la maquina proxy comprobamos el log.

![acceso w3m](/images/proxy-balanceador/acceso_w3m.png)

Log:

~~~
1614098739.005    240 10.0.0.11 TCP_MISS/301 479 GET http://dit.gonzalonazareno.org/ - HIER_DIRECT/80.59.1.152 text/html
1614098739.249    241 10.0.0.11 TCP_TUNNEL_ABORTED/200 4242 CONNECT dit.gonzalonazareno.org:443 - HIER_DIRECT/80.59.1.152 -
1614098739.493    241 10.0.0.11 TCP_TUNNEL/200 4243 CONNECT dit.gonzalonazareno.org:443 - HIER_DIRECT/80.59.1.152 -
1614098739.975    480 10.0.0.11 TCP_TUNNEL/200 16764 CONNECT dit.gonzalonazareno.org:443 - HIER_DIRECT/80.59.1.152 -
1614098784.423     45 10.0.0.11 TCP_MISS/301 485 GET http://dit.gonzalonazareno.org/moodle - HIER_DIRECT/80.59.1.152 text/html
1614098784.661    234 10.0.0.11 TCP_TUNNEL/200 4241 CONNECT dit.gonzalonazareno.org:443 - HIER_DIRECT/80.59.1.152 -
1614098787.455   2790 10.0.0.11 TCP_TUNNEL/200 57844 CONNECT dit.gonzalonazareno.org:443 - HIER_DIRECT/80.59.1.152 -
~~~
      
Tarea 4: Con squid podemos filtrar el acceso por url o dominios, realiza las configuraciones necesarias para implementar un filtro que funcione como lista negra (todo el acceso es permitido menos las url o dominios que indiquemos en un fichero.)

Crearemos una lista negra poniendo un fichero con los dominios “prohibidos” para nuestros usuarios, este fichero debe estar en /etc/squid/.

Fichero blacklist:

~~~
www.twitter.es
www.instagram.es
www.marca.es
~~~

Una vez tengamos el fichero, añadimos una nueva acl y un http_access al fichero /etc/squid/squid.conf:

~~~
acl bloqueo url_regex ”/etc/squid/blacklist”
http_access deny bloqueo
~~~

log:

~~~
1614100108.079    176 10.0.0.11 TCP_DENIED/403 3908 GET http://www.twitter.es/ - HIER_NONE/- text/html
1614100259.716      0 10.0.0.11 TCP_DENIED/403 3914 GET http://www.instagram.es/ - HIER_NONE/- text/html
1614100278.343      0 10.0.0.11 TCP_DENIED/403 3902 GET http://www.marca.es/ - HIER_NONE/- text/html
1614100625.023    264 10.0.0.11 TCP_MISS/301 641 GET http://www.josedomingo.org/ - HIER_DIRECT/37.187.119.60 text/html
1614100625.198    172 10.0.0.11 TCP_TUNNEL/200 4238 CONNECT www.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
1614100625.342    140 10.0.0.11 TCP_TUNNEL/200 10130 CONNECT www.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
~~~

Como vemos los 3 son bloqueados, sin embargo www.josedomingo.org no.

Tarea 5: Realiza las configuraciones necesarias para implementar un filtro que funcione como lista blanca (todo el acceso es denegado menos las url o dominios que indiquemos en un fichero.)
      
La lista blanca se hace de forma parecida a la lista negra, en este caso creamos un fichero a los que se podrá acceder, indicamos este fichero en la acl y esta vez ponemos 2 http_access, uno con la opcion allow “nombre de la regla acl” y otra deny all, de forma que las paginas del fichero son permitidas, y el resto todas bloqueadas.

Fichero whitelist:

~~~
dit.gonzalonazareno.es
www.josedomingo.org
~~~

~~~
acl seguro /etc/squid/whitelist
http_access allow seguro
http_access deny all
~~~

Comprobamos el log:

~~~
1614101137.290    380 10.0.0.11 TCP_MISS/301 479 GET http://dit.gonzalonazareno.org/ - HIER_DIRECT/80.59.1.152 text/html
1614101137.537    241 10.0.0.11 TCP_TUNNEL_ABORTED/200 4242 CONNECT dit.gonzalonazareno.org:443 - HIER_DIRECT/80.59.1.152 -
1614101137.774    236 10.0.0.11 TCP_TUNNEL_ABORTED/200 4243 CONNECT dit.gonzalonazareno.org:443 - HIER_DIRECT/80.59.1.152 -
1614101138.415    639 10.0.0.11 TCP_TUNNEL/200 16764 CONNECT dit.gonzalonazareno.org:443 - HIER_DIRECT/80.59.1.152 -
1614101141.482     44 10.0.0.11 TCP_MISS/301 485 GET http://dit.gonzalonazareno.org/moodle - HIER_DIRECT/80.59.1.152 text/html
1614101141.884    400 10.0.0.11 TCP_TUNNEL_ABORTED/200 4241 CONNECT dit.gonzalonazareno.org:443 - HIER_DIRECT/80.59.1.152 -
1614101144.121   2234 10.0.0.11 TCP_TUNNEL/200 57844 CONNECT dit.gonzalonazareno.org:443 - HIER_DIRECT/80.59.1.152 -
1614101161.543    370 10.0.0.11 TCP_MISS/301 641 GET http://www.josedomingo.org/ - HIER_DIRECT/37.187.119.60 text/html
1614101161.685    139 10.0.0.11 TCP_TUNNEL/200 4238 CONNECT www.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
1614101161.830    137 10.0.0.11 TCP_TUNNEL/200 10130 CONNECT www.josedomingo.org:443 - HIER_DIRECT/37.187.119.60 -
1614101181.478      0 10.0.0.11 TCP_DENIED/403 3902 GET http://www.hola.com/ - HIER_NONE/- text/html
1614101204.068      0 10.0.0.11 TCP_DENIED/403 3914 GET http://www.dockerhub.es/ - HIER_NONE/- text/html
1614101216.040      0 10.0.0.11 TCP_DENIED/403 3905 GET http://www.github.es/ - HIER_NONE/- text/html
~~~