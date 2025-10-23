var store = [{
        "title": "Sobre mí",
        "excerpt":"¡Hola! Soy Sergio Ibáñez Núñez, Técnico IT y entusiasta de la automatización. Mi experiencia Especializado en sistemas, DevOps y automatización de procesos. Habilidades técnicas Administración de sistemas Linux/Windows Docker y contenedores Automatización con scripts (PowerShell, Bash) Infraestructura como código DevOps practices Contacto 📧 [Tu email profesional] 💼 LinkedIn 💻 GitHub...","categories": [],
        "tags": [],
        "url": "/about/",
        "teaser": null
      },{
        "title": "Categorías",
        "excerpt":"Explorar por Categorías Sistemas 12 post12 Instalación, configuración y monitorización usando Zabbix Monitorización de servidores con Grafana Active Directory ...y 9 más Aplicaciones Web 9 post9 Introducción a Docker Creacion blog Pelican Introduccion a la Integracion Continua ...y 6 más Seguridad 6 post6 Introducción SoftEther VPN Vpn Site to Site...","categories": [],
        "tags": [],
        "url": "/categories/",
        "teaser": null
      },{
        "title": "Todos los Posts",
        "excerpt":"Todos los Posts Instalación, configuración y monitorización usando Zabbix 01/05/2025 8 min Sistemas Monitorización Monitorización de servidores con Grafana 11/04/2024 12 min Sistemas Monitorización Introducción SoftEther VPN 21/12/2021 72 min Seguridad Introducción a Docker 21/09/2021 24 min Aplicaciones Web Apuntes Introducción a PLSQL (Oracle) 13/09/2021 10 min Base de Datos...","categories": [],
        "tags": [],
        "url": "/posts/",
        "teaser": null
      },{
        "title": "Buscar",
        "excerpt":" ","categories": [],
        "tags": [],
        "url": "/search/",
        "teaser": null
      },{
        "title": "Etiquetas",
        "excerpt":"Explorar por Etiquetas   Todavía no hay etiquetas. Añade etiquetas a tus posts para verlas aquí.  ","categories": [],
        "tags": [],
        "url": "/tags/",
        "teaser": null
      },{
        "title": "Instalacion de Debian 10",
        "excerpt":"Instacacion Debian 10 Introducción En un portátil (HP pavilion 15) con 1TB de disco se crearan particiones LVM donde se instalara un sistema debían 10. En el caso de mi disco ya tiene dos particiones en disco dedicadas a Windows 10 y otros, por lo que como Windows no es...","categories": ["Sistemas"],
        "tags": [],
        "url": "/sistemas/2021/03/10/Instalacion-debian10.html",
        "teaser": null
      },{
        "title": "Creacion blog Hugo",
        "excerpt":"Introducción En este post se hablara de como ha sido creado este blog usando hugo donde se van a ir publicando trabajos y apuntos relacionados con el grado superior de Administracion de Sistemas Informaticos en Red (ASIR) ademas de apuntes o documentacion de interes y ademas la configuracion continua que...","categories": ["Aplicaciones Web"],
        "tags": [],
        "url": "/aplicaciones%20web/2021/03/11/Creacion-blog-hugo.html",
        "teaser": null
      },{
        "title": "Cifrado Asimetrico GPG Y Openssl",
        "excerpt":"Tarea 1: Generación de claves Genera un par de claves (pública y privada). ¿En que directorio se guarda las claves de un usuario? gpg --gen-key Se nos piden algunos datos como nombre y apellidos, correo y contraseña y una vez introducida la información, se ve que la clave se nos...","categories": ["Seguridad"],
        "tags": [],
        "url": "/seguridad/2021/03/11/Cifrado-asimetrico-gpg-y-openssl.html",
        "teaser": null
      },{
        "title": "Servidor DHCP Linux",
        "excerpt":"Funcionamiento de un servidor DHCP El cliente al iniciarse se encuentra en estado init, sin saber sus parámetros ip en ese momento envía un mensaje DHCPDiscover a la dirección de broadcast para saber si algún servidor dhcp le puede ofrecer una ip. El cliente espera un tiempo entre 1 y...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/11/Servidor-DHCP-Linux.html",
        "teaser": null
      },{
        "title": "Virtualhost apache",
        "excerpt":"Introducción En este post mediando una serie de tareas se configurara un virtualhost apache en un una maquina virtual creada con vagrant. ¿Que es un virtualhost? El término Hosting Virtual o vertialhost se refiere a hacer funcionar más de un sitio web (como en este caso www.iesgn.org y www.departamentosgn.org) en...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/11/Virtualhost-apache.html",
        "teaser": null
      },{
        "title": "Mapeo URL Virtualhost",
        "excerpt":"Crea un nuevo host virtual que es accedido con el nombre www.mapeo.com, cuyo DocumentRoot sea /srv/mapeo. Creación del fichero .conf vagrant@nodo1:/etc/apache2/sites-available$ sudo cp 000-default.conf mapeo.conf Modificaciones en mapeo.conf &lt;VirtualHost *:80&gt; ServerAdmin webmaster@localhost DocumentRoot /srv/mapeo ServerName www.mapeo.com ErrorLog ${APACHE_LOG_DIR}/error.log CustomLog ${APACHE_LOG_DIR}/access.log combined &lt;/VirtualHost&gt; Creamos el directorio en srv vagrant@nodo1:/srv$ sudo mkdir...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/11/Mapeo-url-servidor-dhcp.html",
        "teaser": null
      },{
        "title": "Despliegue de un servidor LAMP local y configuración de CMS PHP",
        "excerpt":"Introducción En el siguiente post desplegaremos un entorno LAMP (Linux, Apache, MySQL y PHP) sobre una maquina virtual en Vagrant con sistema operativo unix con el fin de alojar un CMS local en este caso Drupal. Este tipo de infraestructura es ampliamente utilizada para entornos de desarrollo, pruebas e incluso...","categories": ["Aplicaciones Web"],
        "tags": [],
        "url": "/aplicaciones%20web/2021/03/11/Despliegue-de-un-servidor-LAMP-local-y-configuraci%C3%B3n-de-CMS-PHP.html",
        "teaser": null
      },{
        "title": "Integridad, firmas y autentificacion",
        "excerpt":"Introduccion En esta apartado mediante un conjunto de tareas trabajaremos temas de seguridad como las firmas electronicas usando gpg, correos seguros usando thunderbird/evolution, integridad de archivos y autentificacion con ssh. Firmas electrónicas Para trabajar con una firma electronica, empezaremos mandando un documento y la firma electrónica del mismo a un...","categories": ["Seguridad"],
        "tags": [],
        "url": "/seguridad/2021/03/11/Integridad-firmas-autentificacion.html",
        "teaser": null
      },{
        "title": "Compilacion programa C con Makefile",
        "excerpt":"Introduccion En este post a modo de aprendizaje para aprender mas sobre debian y su paqueteria se va a proceder a la compilacion de un paquete escrito en C, en este caso el paquete less para posteriormente ser capaces de compilar nuestro sistema operativo. Compilacion paquete less Para dicha compilacion...","categories": ["Sistemas"],
        "tags": [],
        "url": "/sistemas/2021/03/11/Compilacion-programa-C-makefile.html",
        "teaser": null
      },{
        "title": "Control de acceso, autentificacion y autorizacion",
        "excerpt":"Introduccion Haciendo uso de la practica anterior en la que instalamos el virtualhosting apache en vagrant o bien creando un escenario nuesvo en el que instalaremos un servidor dhcp, configuraremos el control de acceso, autentificacion y autorizacion para acceder al sitio web creado. Configuración Tarea1: A la URL departamentos.iesgn.org/intranet sólo...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/11/Control-de-acceso-autentificacion-autorizacion.html",
        "teaser": null
      },{
        "title": "Configuracion apache con .htaccess",
        "excerpt":"Date de alta en un proveedor de hosting. ¿Si necesitamos configurar el servidor web que han configurado los administradores del proveedor?, ¿qué podemos hacer? Explica la directiva AllowOverride de apache2. Utilizando archivos .htaccess realiza las siguientes configuraciones: Se ha dado de alta en 000.webhost Tarea1: Habilita el listado de ficheros...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/11/Configuracion-apache-con-htaccess.html",
        "teaser": null
      },{
        "title": "Configuracion cliente VPN con certificado x509",
        "excerpt":"Introducción Teniendo en cuenta que en el instituto y en casa cuentan con redes distintas, se configurara un cliente vpn para poder permitir la conexion entre las distintas redes. Configuración del cliente VPN Empezamos generando una clave privada RSA 4096 Para generarnos nuestra clave privada rsa hacemos uso del comando...","categories": ["Cloud"],
        "tags": [],
        "url": "/cloud/2021/03/11/Configuracion-clientevpn.html",
        "teaser": null
      },{
        "title": "Servidor Web Nginx",
        "excerpt":"Introducción NGINX es un servidor web open source de alta performance que ofrece el contenido estático de un sitio web de forma rápida y fácil de configurar. Ofrece recursos de equilibrio de carga, proxy inverso y streaming, además de gestionar miles de conexiones simultáneas. El resultado de sus aportes es...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/11/Servidor-web-nginx.html",
        "teaser": null
      },{
        "title": "OVH Lemp",
        "excerpt":"Introduccion En este post instalaremos un servidor Lemp (Linux, (E)nginx, Mariadb y PHP) en una maquina virtual alojada en OVH en la que mas adelante instalaremos varias aplicaciones. Instalacion de servidor web nginx sudo apt install nginx Instalacion de MariaDB asegurando el servicio, ya que lo vamos a tener corriendo...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/12/OVH-Lemp.html",
        "teaser": null
      },{
        "title": "Aplicaciones PHP en OVH",
        "excerpt":"Introduccion En este post aprenderemos a migrar dos aplicaciones, Drupal y Nextcloud, para ello contamos con un un escenario compuesto por dos maquinas virtuales en redes distintas. La primera maquina virtual estara echa en vagrant y sera la maquina usada en la practica anterior “Instalacion local CMS PHP”. La segunda...","categories": ["Aplicaciones Web"],
        "tags": [],
        "url": "/aplicaciones%20web/2021/03/12/Aplicaciones-php-ovh.html",
        "teaser": null
      },{
        "title": "Creacion de escenario Openstack",
        "excerpt":"Introduccion En este post se creara un escenario en openstack con varias maquinas virtuales donde a lo largo del curso se realizaran la mayoria de las practicas. Creacion del escenario Tarea 1: Creación de la red interna: ◦ Nombre red interna de ◦ 10.0.1.0/24 Tarea 2: Creación de las instancias:...","categories": ["Cloud"],
        "tags": [],
        "url": "/cloud/2021/03/12/Creacion-escenario-openstack.html",
        "teaser": null
      },{
        "title": "Despliegue de aplicaciones python",
        "excerpt":"Tarea 1: Entorno de desarrollo Vamos a desarrollar la aplicación del tutorial de django 3.1. Vamos a configurar tu equipo como entorno de desarrollo para trabajar con la aplicación, para ello: Realiza un fork del repositorio de GitHub: https://github.com/josedom24/django_tutorial. Crea un entorno virtual de python3 e instala las dependencias necesarias...","categories": ["Aplicaciones Web"],
        "tags": [],
        "url": "/aplicaciones%20web/2021/03/12/Despliegue-de-aplicaciones-python.html",
        "teaser": null
      },{
        "title": "Actualizacion de Centos7 a Centos8",
        "excerpt":"Introduccion Esta practica se realizara en una maquina virtual llamada Quijote en un escenario opestack creado en practicas anteriores que cuenta con un sistema operativo Centos 7 que se actualizara a Centos 8. Actualizacion de Centos 7 a Centos 8 en la maquina quijote Antes de comenzar con la actualización...","categories": ["Sistemas"],
        "tags": [],
        "url": "/sistemas/2021/03/12/Actualizacion-centos8.html",
        "teaser": null
      },{
        "title": "Instalacion y configuracion servidor DNS",
        "excerpt":"Introducción En post a traves de una serie de tareas, configuraremos e instalaremos dos servidores dns para comprobar y ver su funcionamiento, dnsmaq y bind9. En nuestra red local tenemos un servidor Web que sirve dos páginas web: www.iesgn.org, departamentos.iesgn.org. Instalaremos en nuestra red local un servidor DNS. El nombre...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/12/Instalacion-y-configuracion-servidor-dns.html",
        "teaser": null
      },{
        "title": "Despliegue CMS Java",
        "excerpt":"Introduccion En este post, se va a desplegar una aplicacion cms java, en este caso Guacamole. Guacamole es una aplicacion que permite acceder a uno o más escritorios desde cualquier lugar de forma remota, sin tener que instalar un cliente, especialmente cuando no es posible instalar un cliente. Al configurar...","categories": ["Aplicaciones Web"],
        "tags": [],
        "url": "/aplicaciones%20web/2021/03/12/Despliegue-cms-java.html",
        "teaser": null
      },{
        "title": "Modificaciones del escenario Openstack",
        "excerpt":"Introducción En el siguiente post, haciendo uso del escenario openstack creado en una de las practicas anteriores haremos una serie de modificaciones en dicho escenario. Modificaciones: Creación de la red DMZ: Nombre: DMZ de “nombre de usuario” 10.0.2.0/24 Creación de las instancias: freston: Debian Buster sobre volumen de 10GB con...","categories": ["Cloud"],
        "tags": [],
        "url": "/cloud/2021/03/12/Modificaciones-del-escenario-openstack.html",
        "teaser": null
      },{
        "title": "Instalacion y configuracion básica OpenLDAP",
        "excerpt":"Introducción En la maquina Freston de Openstack creada y configurada en la practica “modificaciones del escenario openstack”, se hara una instalacion y configuracion basica de un servidor Ldap utilizando como base el nombre DNS asignado. ¿Que es LDAP? Se trata de un conjunto de protocolos de licencia abierta que son...","categories": ["Sistemas"],
        "tags": [],
        "url": "/sistemas/2021/03/12/Instalacion-y-configuracion-openldap.html",
        "teaser": null
      },{
        "title": "Ldaps",
        "excerpt":"Introducción Configuraremos el servidor LDAP de frestón instalado y configurado en la practica anterior para que utilice el protocolo ldaps:// a la vez que el ldap:// utilizando el certificado x509 de la práctica de https o solicitando el correspondiente a través de gestiona. Realiza las modificaciones adecuadas en el cliente...","categories": ["Sistemas"],
        "tags": [],
        "url": "/sistemas/2021/03/12/Ldaps.html",
        "teaser": null
      },{
        "title": "Usuarios, grupos y ACLs en Ldap",
        "excerpt":"Crea 10 usuarios con los nombres que prefieras en LDAP, esos usuarios deben ser objetos de los tipos posixAccount e inetOrgPerson. Estos usuarios tendrán un atributo userPassword. Para crear estos usuarios, creamos un fichero .ldif llamado por ejemplo usuarios con el siguiente contenido: dn: uid=sergio,ou=People,dc=sergio,dc=gonzalonazareno,dc=org objectClass: top objectClass: posixAccount objectClass:...","categories": ["Sistemas"],
        "tags": [],
        "url": "/sistemas/2021/03/12/Usuarios-grupos-y-acls-en-ldap.html",
        "teaser": null
      },{
        "title": "Servidores Web, base de Datos y DNS en Openstack",
        "excerpt":"Introducción Haciendo uso de nuestro escenario openstack creado en practicas anteriores instalaremos y configuraremos los siguientes servidores en los distintos nodos del escenario: Servidor DNS Vamos a instalar un servidor dns en freston que nos permita gestionar la resolución directa e inversa de nuestros nombres. Tendremos un servidor dns con...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/12/Servidores-web-base-de-datos-y-dns.html",
        "teaser": null
      },{
        "title": "Instalación y configuración basica Vmware ESXI",
        "excerpt":"Introducción ¿Que es Vmware? Vmware, es una de las herramientas más populares que se utilizan a la hora de virtualizar. La virtualización es el proceso a través del cual se emula un recurso, como por ejemplo puede ser un sistema operativo, a través de una herramienta de software. Este software...","categories": ["Cloud"],
        "tags": [],
        "url": "/cloud/2021/03/12/Instalacion-y-configuracion-basica-vmware.html",
        "teaser": null
      },{
        "title": "HTTPS en Openstack",
        "excerpt":"Introducción El siguiente paso en nuestro escenario opensatack sera configurar de forma adecuada el protocolo HTTPS en nuestro servidor web para nuestra aplicaciones web. Para ello vamos a emitir un certificado wildcard en la AC Gonzalo Nazareno utilizando para la petición la utilidad “gestiona”. Instalamos openssl para crear nuestro certificado...","categories": ["Seguridad"],
        "tags": [],
        "url": "/seguridad/2021/03/12/Https-en-openstack.html",
        "teaser": null
      },{
        "title": "Instalacion de Mezzanine en Openstack",
        "excerpt":"Introducción En este post vamos a desplegar un CMS python basado en django, en este caso se ha elegido Mezzanine. Para ello contaremos con dos entornos de trabajo, uno sera el entorno de desarrollo que sera mi propia maquina con un entorno virtual, y por otro lado el entorno de...","categories": ["Aplicaciones Web"],
        "tags": [],
        "url": "/aplicaciones%20web/2021/03/12/Instalacion-de-aplicacion-web-python-openstack.html",
        "teaser": null
      },{
        "title": "Sistemas de ficheros Btrfs",
        "excerpt":"Introducción Btrfs es un sistema de archivos copy-on-write anunciado por Oracle Corporation para GNU/Linux. Su objetivo es sustituir al actual sistema de archivos ext4, eliminando el mayor número de sus limitaciones, en especial con el tamaño máximo de los ficheros; además de la adopción de nuevas tecnologías no soportadas por...","categories": ["Sistemas"],
        "tags": [],
        "url": "/sistemas/2021/03/12/Sistemas-de-ficheros-btrfs.html",
        "teaser": null
      },{
        "title": "Cortafuegos en escenario Openstack",
        "excerpt":"Introducción Vamos a construir un cortafuegos en la maquina dulcinea de nuestro escenario en openstack que nos permita controlar el tráfico de nuestra red. El cortafuegos que vamos a construir debe funcionar tras un reinicio. En este caso la maquina dulcinea cuenta con 3 interfaces de red: eth0: interfaz al...","categories": ["Seguridad"],
        "tags": [],
        "url": "/seguridad/2021/03/12/Cortafuegos-en-escenario-openstack.html",
        "teaser": null
      },{
        "title": "Introduccion a la Integracion Continua",
        "excerpt":"Introducción La integración continua es una práctica de desarrollo de software mediante la cual los desarrolladores combinan los cambios en el código en un repositorio central de forma periódica, tras lo cual se ejecutan versiones y pruebas automáticas. Los objetivos clave de la integración continua consisten en encontrar y arreglar...","categories": ["Aplicaciones Web"],
        "tags": [],
        "url": "/aplicaciones%20web/2021/03/12/Integracion-continua.html",
        "teaser": null
      },{
        "title": "Montaje de pila ELK",
        "excerpt":"¿Que es una pila ELK? Es un conjunto de herramientas de gran potencial de código abierto que se combinan para crear una herramienta de administración de registros permitiendo la monitorización, consolidación y análisis de logs generados en múltiples servidores, estas herramientas son:ElasticSearch, Logstash y Kibana. Para poder montar la pila...","categories": ["Sistemas"],
        "tags": [],
        "url": "/sistemas/2021/03/12/Montaje-de-pila-ELK.html",
        "teaser": null
      },{
        "title": "ISCSI",
        "excerpt":"Introducción ISCSI es un estándar que permite el uso del protocolo SCSI sobre redes TCP/IP. iSCSI es un protocolo de la capa de transporte definido en las especificaciones SCSI-3. Para esta practica se han creado 3 maquinas virtuales, 2 debian 10, una cliente y otra servidor con 3 discos de...","categories": ["Cloud"],
        "tags": [],
        "url": "/cloud/2021/03/12/ISCSI.html",
        "teaser": null
      },{
        "title": "Rendimiento de servidor Web con Varnish",
        "excerpt":"Tarea 1: Vamos a configurar una máquina con la configuración ganadora: nginx + fpm_php (socket unix.Para ello ejecuta la receta ansible que encontraras en este repositorio. Accede al wordpress y termina la configuración del sitio. Una vez que tengamos el repositorio en nuestra maquina, debemos de modificar la ip que...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/12/Rendimiento-de-servidor-web-con-varnish.html",
        "teaser": null
      },{
        "title": "Vpn Site to Site",
        "excerpt":"Introduccion Configuraremos una conexión VPN sitio a sitio entre dos equipos del cloud openstack: Cada equipo estará conectado a dos redes, una de ellas en común. Para la autenticación de los extremos se usarán obligatoriamente certificados digitales, que se generarán utilizando openssl y se almacenarán en el directorio /etc/openvpn, junto...","categories": ["Seguridad"],
        "tags": [],
        "url": "/seguridad/2021/03/12/Vpn-site-to-site.html",
        "teaser": null
      },{
        "title": "Kubernetes Letschat",
        "excerpt":"Introduccion En este post, lo que haremos sera primero crear un cluster de kubernetes, para lo cual nuestro equipo debe de contar con al menos 4 o 5 Gb de ram al menos ya se van a crear 3 maquinas virtuales, un nodo master o controlador y 2 nodos secundarios....","categories": ["Cloud"],
        "tags": [],
        "url": "/cloud/2021/03/13/Kubernetes-lets-chat.html",
        "teaser": null
      },{
        "title": "Proxy y balanceador de carga",
        "excerpt":"Balanceador de carga En la maquina de nuestro escenario llamada balanceador, instalamos haproxy: apt install haproxy Configuramos haproxy (/etc/haproxy/haproxy.cfg) de la siguiente forma: global daemon maxconn 256 user haproxy group haproxy log 127.0.0.1 local0 log 127.0.0.1 local1 notice defaults mode http log global timeout connect 5000ms timeout client 50000ms timeout...","categories": ["Servicios"],
        "tags": [],
        "url": "/servicios/2021/03/13/Proxy-y-balanceador-de-carga.html",
        "teaser": null
      },{
        "title": "Instalacion Openstack con Kolla Ansible",
        "excerpt":"Introduccion Para esta practica contaremos con un escenario de 3 nodos creados con vagrant: Instalador (sistema ubuntu), sera donde se preparara openstack para su despliegue. Master (sistema ubuntu) Compute (sistema ubuntu) El montaje de openstack requiere de mucho recurso por parte de la maquina anfitriona, el nodo master debe de...","categories": ["Cloud"],
        "tags": [],
        "url": "/cloud/2021/03/13/Instalacion-openstack-kolla-ansible.html",
        "teaser": null
      },{
        "title": "Creacion blog Pelican",
        "excerpt":"Instalacion de Pelican Para poder instalar este gestor de paginas web, ejecutamos apt install pelican y una vez instalado ejecutamos apt install markdown, que es el idioma en el que se escribirán los artículos del blog. Una vez instalados pelican y markdown en nuestro entorno de desarrollo (nuestra máquina) estará...","categories": ["Aplicaciones Web"],
        "tags": [],
        "url": "/aplicaciones%20web/2021/03/13/Creacion-blog-pelican.html",
        "teaser": null
      },{
        "title": "Bacula",
        "excerpt":"Introduccion Bacula es un sistema de copias de seguridad que funciona como cliente y servidor. Este sistema de copias de seguridad va a ser instalado en una de las maquinas virtuales de nuestro escenario openstack que hemos creado en posts anteriores, mas concretamente como bacula necesita de una base de...","categories": ["Sistemas"],
        "tags": [],
        "url": "/sistemas/2021/03/14/Bacula.html",
        "teaser": null
      },{
        "title": "Aplicaciones web PHP en Docker",
        "excerpt":"Introduccion En esta practica haciendo uso de docker, vamos a desplegar distintas aplicaciones en contenedores, en los primeros ejercicios se trabajara con bookmedik (aplicacion para organizar citas medicas) y en las dos ultimas se usara drupal y joomla. La forma de trabajar sera la siguiente, en nuestro equipo tendremos un...","categories": ["Aplicaciones web"],
        "tags": [],
        "url": "/aplicaciones%20web/2021/03/14/Aplicaciones-web-php-en-docker.html",
        "teaser": null
      },{
        "title": "Conceptos Basicos de Mongodb",
        "excerpt":"Introducción En este post se va a explicar tanto la instalación y configuración de mongodb ademas de varios de los conceptos basicos como pueden ser el uso de proyecciones y operadores CRUD. Este post son una serie de explicaciones y apuntes realizados siguiendo varios cursos online. Se usarán varias herramientas...","categories": ["Base de Datos","Apuntes"],
        "tags": [],
        "url": "/base%20de%20datos/apuntes/2021/04/03/Conceptos-basicos-mongodb.html",
        "teaser": null
      },{
        "title": "Active Directory",
        "excerpt":"¿Que es? Active Directory es un servicio de directorio que almacena objetos de datos en su entorno de red local. El servicio registra datos en los usuarios, dispositivos, aplicaciones, grupos, y dispositivos en una estructura jerárquica. La estructura jerárquica de Active Directory facilita la localización y administración de los recursos...","categories": ["Sistemas","Apuntes"],
        "tags": [],
        "url": "/sistemas/apuntes/2021/05/23/Active-directory.html",
        "teaser": null
      },{
        "title": "Introducción a C++",
        "excerpt":"Introducción C++ es un lenguaje de programación compilado creado en 1979 derivado del lenguaje C quedándose con lo mejor de C y añadiendo funcionalidades nuevas. Una de las mejoras que añade C++ es la posibilidad de usar la programación orientada a objetos la cual nos permite ampliar los tipos de...","categories": ["Apuntes"],
        "tags": [],
        "url": "/apuntes/2021/06/09/Introduccion-a-C++.html",
        "teaser": null
      },{
        "title": "Introducción a las Bases De Datos (Oracle)",
        "excerpt":"**Introducción Las bases de datos son una parte fundamental en el almacenamiento y gestión de información en el mundo digital. Oracle Database es uno de los sistemas de gestión de bases de datos más utilizados en entornos empresariales debido a su potencia, escalabilidad y seguridad. Este post proporciona una introducción...","categories": ["Base de Datos","Apuntes"],
        "tags": [],
        "url": "/base%20de%20datos/apuntes/2021/09/07/Introduccion-a-las-bases-de-datos-Oracle.html",
        "teaser": null
      },{
        "title": "Introducción a PLSQL (Oracle)",
        "excerpt":"Introducción de PLSQ ¿Que es? PL/SQL (Procedural Language/Structured Query Language) es un lenguaje de programación procedimental desarrollado por Oracle como una extensión de SQL. Permite combinar las capacidades de consulta de datos de SQL con estructuras de programación avanzadas como variables, bucles, condiciones, procedimientos, funciones y cursores. ¿Para que sirve?...","categories": ["Base de Datos","Apuntes"],
        "tags": [],
        "url": "/base%20de%20datos/apuntes/2021/09/13/Introduccion-a-PLSQL-oracle.html",
        "teaser": null
      },{
        "title": "Introducción a Docker",
        "excerpt":"¿Qué es Docker? Docker es un proyecto de software libre que permite automatizar el despliegue de aplicaciones dentro de contenedores. Docker nos permite de forma sencilla crear contenedores ligeros y fáciles de mover donde ejecutar nuestras aplicaciones software sobre cualquier máquina con Docker instalado, independientemente del sistema operativo que la...","categories": ["Aplicaciones Web","Apuntes"],
        "tags": [],
        "url": "/aplicaciones%20web/apuntes/2021/09/21/Introduccion-a-Docker.html",
        "teaser": null
      },{
        "title": "Introducción SoftEther VPN",
        "excerpt":"Introducción Softether VPN es uno de los softwares VPN multiprotocolo mas potentes y rápido del mundo actualmente. Funciona en sistemas Windows, Solaris, Mac, FreeBSD y algunas distribuciones de Linux. Además de ser de software libre, también es una alternativa muy buena a openvpn y a los servidores VPN de microsoft....","categories": ["Seguridad"],
        "tags": [],
        "url": "/seguridad/2021/12/21/SoftEther-VPN.html",
        "teaser": null
      },{
        "title": "Monitorización de servidores con Grafana",
        "excerpt":"Requisitos previos Tener acceso a una máquina debian (máquina virtual o física) con permisos de root Conocimientos básicos de administración de sistemas Linux Conexión a internet para descargar paquetes Herramientas necesarias instaladas: wget, curl, net-tools (si no están, instálalas con sudo apt install -y wget curl net-tools). ¿Que es grafana?...","categories": ["Sistemas","Monitorización"],
        "tags": [],
        "url": "/sistemas/monitorizaci%C3%B3n/2024/04/11/Monitorizaci%C3%B3n-de-servidores-con-grafana.html",
        "teaser": null
      },{
        "title": "Instalación, configuración y monitorización usando Zabbix",
        "excerpt":"¿Que es Zabbix? Zabbix es una plataforma de monitorización de infraestructura de TI de código abierto que permite supervisar el estado y rendimiento de servidores, redes, aplicaciones, servicios y otros recursos tecnológicos en tiempo real. Requisitos previos Para este post se han usado los siguientes elementos para realizar instalación, configuración...","categories": ["Sistemas","Monitorización"],
        "tags": [],
        "url": "/sistemas/monitorizaci%C3%B3n/2025/05/01/Instalacion-configuracion-y-monitoreo-zabbix.html",
        "teaser": null
      }]
