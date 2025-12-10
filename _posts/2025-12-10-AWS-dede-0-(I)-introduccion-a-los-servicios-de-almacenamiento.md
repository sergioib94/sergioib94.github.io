---
title: "AWS desde 0 (I): Introducción a los servicios de almacenamiento"
date: 2025-12-10T15:35:00+02:00
categories: [Apuntes, Cloud, AWS]
excerpt: "En este post se presenta una guía completa para comprender y trabajar con los principales servicios de AWS orientados a cómputo y almacenamiento: EC2, S3, EBS, EFS y Glacier. Se abordan conceptos fundamentales como tipos de instancias, creación y configuración de máquinas virtuales, seguridad con IAM y grupos de seguridad, gestión de buckets, versionado, cifrado, replicación, y administración de volúmenes. Una referencia práctica y detallada para quienes inician o consolidan conocimientos en la arquitectura básica de AWS."
card_image: /assets/images/cards/AWS.png
---

AWS desde 0 (I): Introducción a los servicios de almacenamiento

# Introducción a Amazon EC2

## ¿Qué es EC2?

EC2 (Amazon Elastic Compute Cloud) es un servicio de computación en la nube de Amazon Web Services (AWS) que te permite crear y gestionar servidores virtuales, conocidos como instancias, en la nube. Básicamente, te da la capacidad de tener máquinas virtuales que puedes configurar, arrancar, detener o eliminar según tus necesidades, sin necesidad de tener hardware físico propio. EC2 usa instancias virtualizadas o bare metal dependiendo del tipo.

Ventajas:

* Escalable: Puedes lanzar tantas instancias como necesites y adaptarlas a la carga de trabajo.
* Flexible: Puedes elegir el sistema operativo, la cantidad de CPU, memoria, almacenamiento y red.
* Pagas por uso: Solo pagas por el tiempo que la instancia está activa, lo que ahorra costos frente a servidores físicos.
* Integración con otros servicios AWS: EC2 se puede usar junto con S3 (almacenamiento), RDS (bases de datos), VPC (redes) y muchos otros.
* Tipos de instancias: AWS ofrece diferentes tipos según necesidad: computación, memoria, GPU, almacenamiento, etc.

Ejemplo práctico: Si quieres montar una web, puedes lanzar una instancia EC2 con Linux, instalar un servidor web (Apache/Nginx) y tu aplicación, y estará accesible desde internet.

## Tipos de instancias EC2 y casos de uso

AWS EC2 ofrece varios tipos de instancias, diseñadas según el tipo de carga de trabajo que quieras ejecutar. Cada tipo se centra en un balance diferente entre CPU, memoria, almacenamiento y GPU.

Tipos instancias EC2

* Instancias Generales: Ofrecen un equilibrio entre computación, memoria y recursos de red. Son usadas para aplicaciones web, servidores de desarrollo y entornos de prueba. Ejemplos: t2, t3, m5, t4g o m6g.
* Instancias optimizadas para computación: diseñadas para cargas de trabajo que requieren alta capacidad de procesamiento. Son usadas para el procesamiento de datos a gran escala, servidores de juego y aplicaciones de alto rendimiento. Ejemplos: c5 y c6g.
* Instancias optimizadas para la memoria: ideales para cargas de trabajo intensivas en memoria. Son usadas para base de datos, procesamiento en tiempo real  de grandes volúmenes de datos y análisis de Big Data. Ejemplo: r5, r6g, x1 y x2gd.
* Instancias optimizadas para el almacenamiento: aquellas que requieren un acceso rápido a la información. son usada en bases de datos SQL por ejemplo. Ejemplo: serie I: i3, i4i, im4gn, etc.
* Instancias para la computación acelerado: para cargas de trabajo de alto rendimiento. Se usan para machine learning, análisis de video y aplicaciones científicas. Ejemplos: p3, p4 y g4.

Independientemente del tipo de instancia que se use, cada tipo de instancia dispone de varios tamaños: nano, micro, small, medium, large, xlarge, 2xlarge y 4xlarge:

# Tabla de tamaños de instancias EC2

| Familia | Tamaño       | vCPU | RAM (GB) | Usos Típicos |
|---------|--------------|------|----------|------------|
| **General (t3, t4g)** | nano         | 2    | 0.5      | Microservicios ligeros, pruebas |
|                               | micro        | 2    | 1-2      | Servidores web ligeros |
|                               | small        | 2    | 2        | Aplicaciones web pequeñas |
|                               | medium       | 2    | 4        | Aplicaciones estándar |
|                               | large        | 2    | 8        | Aplicaciones web y bases de datos medianas |
|                               | xlarge       | 4    | 16       | Bases de datos y apps de mayor carga |
|                               | 2xlarge      | 8    | 32       | Aplicaciones críticas |
| **Computo optimizado (c6i, c7g)** | large     | 2    | 4        | CPU intensa, microservicios |
|                                 | xlarge    | 4    | 8        | Procesamiento de alto rendimiento |
|                                 | 2xlarge   | 8    | 16       | HPC, servidores de juegos |
|                                 | 4xlarge   | 16   | 32       | Aplicaciones intensivas en CPU |
| **Memoria optimizada (r6i, x2idn)** | large    | 2    | 16       | Bases de datos medianas |
|                                   | xlarge   | 4    | 32       | Bases de datos grandes |
|                                   | 2xlarge  | 8    | 64       | Procesamiento de datos en memoria |
|                                   | 4xlarge  | 16   | 128      | Aplicaciones críticas en RAM |
|                                   | 24xlarge | 96   | 768      | Big data, HPC |
| **Almacenamiento optimizado (i3, d3, h1)** | large   | 2    | 16       | Bases de datos NoSQL pequeñas |
|                                   | xlarge   | 4    | 32       | Almacenamiento de alto IOPS |
|                                   | 2xlarge  | 8    | 64       | Sistemas de archivos distribuidos |
| **Computo Acelerado (p4, g5)** | xlarge  | 4    | 61       | ML/IA ligera |
|                                   | 8xlarge  | 32   | 488      | Entrenamiento de ML |
|                                   | 24xlarge | 96   | 1,152    | ML/IA intensiva, renderizado |

Para mas información sobre los tipos de instancia o los casos de uso se puede visitar la URL de Amazon [tipos de instancia Amazon EC2](https://aws.amazon.com/es/ec2/instance-types/).

## Creación de instancias EC2

Para poder crear una instancia EC2 tenemos que tener en cuenta que primero debemos tener creada una cuenta AWS para poder acceder, ademas de la cuenta tenemos que tener también una VPC configurada. Una VPC es una red virtual privada, por defecto se nos crea una VPC para poder crear instancias, esta VPC la podemos eliminar para crear una con la configuración que deseemos.

Para eliminar/crear una VPC, en nuestra cuenta AWS buscamos el servicio "VPC", tanto para eliminar la vpc como para crearla tendremos un desplegable llamado "acciones" en el que dependiendo de lo que queramos podremos elegir una cosa u otra. En el caso de querer eliminar una VPC simplemente seleccionamos la opción de "eliminar la vpc" dentro de acciones y seleccionamos la VPC que queremos eliminar (en caso de tener mas de una).

Por el contrario en el caso de que queramos crear una nueva, en el desplegable de acciones seleccionaremos la opción "crear nueva vpc predeterminada". Una vez tengamos creada la VPC ya podemos crear las instancias, para ello buscamos el servicio EC2. Entre las distintas opciones del servicio EC2, usamos la opción "lanzar una instancia" para crear una instancia, a la hora de lanzar la instancia nos pedirá algunos datos de configuración:

* Nombre y etiquetas: nombre que le pondremos a la instancia.
* Imágenes de máquina Amazon (AMI): sistema operativo que tendrá nuestra instancia, Amazon Linux, MacOS, ubuntu, Microsoft, Red Hat, etc.
* Tipo de instancia: especificar el tipo de instancia que queremos (esto influirá en el precio).
* Par de claves: posteriormente usaremos para conectarnos, normalmente suele ser RSA.
* Configuraciones de red: seleccionar la VPC que se va a usar, subred de aprovisionamiento, gestionar la seguridad, activar o desactivar SSH, configuración almacenamiento, etc.

Cuando ya lo tengamos todo configurado simplemente le damos a la opción "lanzar instancia" y empezara el proceso de creación. Una vez creada, podemos seleccionar la instancia y conectarnos a ella con la opción "conectar" lo que abriría en el navegador una instancia SSH para poder conectarnos a la instancia.

Al lanzar una instancia se vincula por defecto un security group default, una subred y un par de claves (key pair) si no se elige otro.

## Configuración de seguridad en EC2: Grupos de Seguridad y Roles IAM

### Grupos de seguridad

Con respecto a la configuración de seguridad, podremos verla al selecciona la instancia que queramos revisar en la pestaña de seguridad, aquí podremos ver tanto las reglas de entrada y salida que tiene nuestra instancia asi como editarlas/añadir reglas nuevas. por ejemplo en el caso de que queramos permitir la entrada tanto a http como a https, lo que haremos sera seleccionar la opción de editar reglas de entrada, seleccionando nuestra instancia, indicando los protocolos que se van a permitir (http y https en este caso) y por ultimo permitir la entrada a cualquier máquina, usando 0.0.0.0/0 y guardamos la regla (esto en producción no es recomendable).

Es posible que no tengamos permisos suficientes para modificar las reglas de entrada y salida por lo que en caso de que la instancia no nos permita modificar las reglas, lo que podemos hacer sera crear una nueva instancia configurando directamente las reglas de seguridad en la propia configuración de la instancia que ahi si nos permitirá activar el tráfico de tipo http y https.

Esto es algo muy util que podemos utilizar para controlar quien accede a la máquina y para mantener un buen control de seguridad.

Estas reglas también es posible cambiarlas a través de CLI. Ejemplo:

~~~
# permitir HTTP/HTTPS público
aws ec2 authorize-security-group-ingress \
  --group-id sg-0abcd1234efgh5678 \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-0abcd1234efgh5678 \
  --protocol tcp --port 443 --cidr 0.0.0.0/0
~~~

Buenas practicas con respecto a la seguridad:

* Principio de mínimo privilegio de red: solo abre puertos estrictamente necesarios y desde orígenes específicos. 
* Evita usar el security group default para producción. Crea grupos de seguridad con nombres y descripciones claras. 
* Seguridad por capas: usa NACLs (Network ACLs) para filtrado a nivel subred si necesitas, pero no confíes solo en ellos: los grupos de seguridad son el principal control en VPC. 
* Usa referencias entre security groups para comunicaciones internas (más seguro que abrir subredes enteras).
* Reglas explícitas y pequeñas: evita rangos de puertos amplios; usa rangos reducidos. 
* Registro y monitorización: habilita VPC Flow Logs y verifica flujos inusuales.

### Roles IAM

Un Role IAM es una identidad con permisos (políticas) que puede asumir una entidad (por ejemplo, una instancia EC2). Un role no tiene credenciales estáticas (password/keys); en su lugar la instancia obtiene credenciales temporales que rota automáticamente. Esto evita hardcodear claves en el código/instancias.

dentro del servicio IAM, buscaremos la opción “users” y se nos abrirá una pantalla en la que se nos mostraran los usuarios que tengamos creados, en el caso de que la cuenta sea nueva pues nos aparecerá el listado vacío.

Podremos crear un usuario con el botón “adduser”, esta opción nos abrirá una pantalla que nos pedirá el nombre para el usuario que queremos crear y también tendremos que decidir el tipo de acceso:

Acceso programado: Este acceso dará permisos para crear los recursos en Amazon, es decir, este tipo de acceso no usara la consola.

AWS Management Console Access: Al contrario que el acceso anterior, este si va a permitir el acceso a la consola de AWS.

Después tendremos que seleccionar que permisos tendrá el usuario que estamos creando, en este caso como lo que queremos es usar varios recursos para la integración con Terraform, como mínimo el usuario tendrá que tener el permiso AdministratorAccess (permisos de root, esto no es lo recomendado excepto para prueba, en desarrollo lo recomendado es un rol con permisos mínimos necesarios).

Una vez que hayamos seleccionados los permisos para este usuario, lo creamos y nos aparecerá una pantalla con los algunos datos como el nombre de usuario, el Access Key ID o el Secret access Key.

## Elastic Load Balancing (ELB) y Auto Scaling

Elastic Load Balancing o balanceador de carga es el servicio que distribuye automáticamente el tráfico de aplicaciones en múltiples instancias de EC2 para asegurar el equilibrio de carga y que no haya una máquina sobrecargada, es decir las solicitudes se reparten entre las máquinas. Hay varios tipos de balanceadores, algunos que nos podemos encontrar son: 

* Application Load Balancer (ALB): ideal para aplicaciones web, soporta enrutamiento a nivel de aplicación.
* Network Load Balancer (NLB): diseñado para cargas de trabajo de alto rendimiento a nivel de red, baja latencia.

El Auto Scaling por otro lado es una herramienta que permite ajustar automáticamente la capacidad de las instancias EC2 según la carga de trabajo. Al igual que con los balanceadores de carga tenemos distintos tipos:

* Escalado basado en demanda: ajusta la capacidad en función de métricas que nosotros definimos. Las metricas que mas se pueden usar son: 
    * CPUUtilization: porcentaje de uso de CPU.
    * Networking / NetworkOut: tráfico de entrada y salida.
    * RequestCount: numero de solicitudes para aplicaciones web
* Escalado programado: ideal para picos de demanda predecibles.
* Escalado predictivo: utiliza machine learning para anticiparse a la demanda en función de patrones históricos.

## Monitoreo de instancias con CloudWatch

CloudWatch es el servicio de observabilidad y monitorización de AWS. Recopila y almacena métricas, logs y eventos de recursos AWS (EC2, RDS, Lambda, etc.), de aplicaciones y de servidores on-prem/instancias fuera de AWS. Con esos datos puedes visualizar (dashboards), alertar (alarms), buscar/analizar logs y automatizar acciones (EventBridge, acciones de alarmas).

Este servicio nos va a permitir tanto crear nuestros propios dashboards//paneles asi como alarmas, registros, etc. Para ello previamente tendremos que tener creada alguna instancia para tener algo que monitorizar, en el caso de que ya tengamos alguna instancia creada, para crear un dashboard accedemos al servicio Cloudwatch, accedemos al apartado dashboards y seleccionamos "crear un panel" y le asignamos un nombre al panel.

Una vez que le asignemos un nombre al panel, indicaremos tanto el tipo de origen de los datos (Cloudwatch, otros tipos de contenido o crear orígenes de datos). Al indicar el tipo de origen tendremos que indicar también el tipo de visualización que usaremos en Cloudwatch (gráficos de lineas, tablas de datos, tipo numérico, medidores, áreas apiladas, gráfico de barras, etc). Dependiendo de la visualización que elijamos podremos visualizar unas métricas u otras, por ejemplo si seleccionamos que queremos usar gráfica de lineas al añadir el gráfico de métrica se nos abrirá una ventana con todas las métricas disponibles que se pueden visualizar con el gráfico de lineas como por ejemplo el uso de CPU.

En un mismo panel podemos agregar diferentes gráficas o incluso mismas gráficas que usen distintas métricas personalizando todo de forma que Cloudwatch recogería los datos necesarios para ir monitorizando el estado de nuestra instancia.

# Introducción a Amazon S3

## ¿Qué es Amazon S3?

Amazon S3 (Simple Storage Service) es un servicio de almacenamiento de objetos de AWS diseñado para guardar y acceder a cualquier cantidad de datos desde cualquier lugar.

En otras palabras: es como un almacén en la nube donde puedes subir archivos (objetos) de forma segura, escalable y económica.

Características:

1. Almacenamiento de objetos: No funciona como un disco duro tradicional, los datos se guardan como objetos dentro de buckets.
2. Altamente escalable: Puedes almacenar desde unas pocas imágenes hasta petabytes de datos sin preocuparte por capacidad.
3. Durabilidad: Gracias a la replicación interna de AWS. Ideal para datos importantes.
4. Acceso a través de Internet: Puedes acceder a los archivos mediante (Consola web, API, CLI y SDKs)
5. Muy flexible: Permite elegir políticas de acceso, cifrado, versiones de archivos, reglas de ciclo de vida, etc.
6. Pago por uso: Solo pagas por lo que almacenas y transfieres.

Usos de Amazon S3

* Almacenamiento de copias de seguridad (backups)
* Hosting de sitios web estáticos
* Repositorios de datos para análisis (Big Data)
* Guardar imágenes, vídeos o documentos de apps web
* Integración con servicios como CloudFront, EC2, Lambda, Athena, etc.
* Almacenamiento de logs
* Bucket para Terraform o Ansible (state remoto)

Componentes:

* Buckets: Contenedores donde se almacenan los datos en Amazon s3. Cada bucket es único en la región en la que se crea.
* Objetos: Unidad básica de almacenamiento en s3, que incluye datos y metadatos asociados.
* Keys: Identificador único de cada objeto dentro de cada bucket.
* Regiones y disponibilidad: AWS permite seleccionar una región especifica para almacenar los datos, mejorando la disponibilidad y reduciendo la latencia.

## Creación de buckets en S3

La creación de los buckets en S3 es muy sencilla, simplemente dentro de nuestra cuenta AWS, buscamos el servicio S3, dentro de S3 buscamos el campo "buckets" y seleccionamos la opción "crear bucket" en la que tendremos que indicar la configuración general del bucket (región de AWS, tipo de bucket, nombre del bucket que debe ser único a nivel mundial, si se va a copiar la configuración de un bucket existente, lista de control de accesos, etc).

## Carga y descarga de objetos en S3

Una vez tengamos creado el bucket, una de las opciones que tendremos al seleccionar el bucket que queramos usar sera la opción de "objeto", la cual nos permitirá cargar un objeto (especificando el archivo) en el bucket para asi almacenarlo.

## Control de accesos y permisos en S3

Para configurar este control de accesos y permisos en nuestros buckets, Amazon nos ofrece varias opciones:

* IAM policies: controlan qué acciones puede hacer un principal (usuario/rol) sobre S3.
* Bucket policies: políticas en el bucket para permitir/denegar accesos desde condiciones (IPs, VPC, TLS, etc.) esta política se configuraría en formato JSON.
* ACLs (legacy): controles a nivel de objeto/bucket; AWS recomienda evitarlas salvo casos puntuales.
* S3 Access Points: para dar accesos distintos por aplicación/uso con políticas específicas.

Buenas practicas:

* Evita ACLs públicas: usa bucket policies + IAM.
* Practica principio de menor privilegio en IAM.
* Usa roles de IAM para servicios (EC2, Lambda) en vez de claves estáticas.
* Habilita logging (S3 server access logs o CloudTrail) para auditoría.

## Versionado y restauración de objetos en S3

S3 Versioning mantiene todas las versiones de un objeto en el mismo bucket, te permite recuperar versiones previas o objetos borrados. Muy útil contra borrados accidentales o sobreescrituras.

## Cifrado de datos en reposo y en tránsito en S3

* Cifrado en tránsito

S3 soporta HTTPS/TLS (TLS 1.2 y TLS 1.3; los SDKs modernos negocian la versión más segura). Puedes forzar TLS vía bucket policy.

* Cifrado en reposo

Opciones principales:

  * SSE-S3 (Amazon S3 managed keys): S3 gestiona claves, cifrado AES-256 por objeto. (Default en nuevos objetos). 
  * SSE-KMS (AWS KMS managed keys): usa KMS, control más fino (políticas KMS, auditoría CloudTrail, grants). Recomendado para control de claves. 
  * SSE-C (Customer provided keys): tú proporcionas la clave en cada request, S3 no la almacena (mayor responsabilidad).
  * Client-side encryption: cifra en el cliente antes de enviar, S3 guarda el objeto ya cifrado.

## Replicación entre regiones y S3 Transfer Acceleration

La replicación entre regiones permite copiar objetos de un bucket S3 en una region a otro bucket en una region diferente automáticamente.

Ventajas:

* Mejora de la disponibilidad de datos en múltiples ubicaciones geográficas.
* Preparación para recuperación ante desastres, minimizando la perdida de datos en caso de interrupciones en una region.
* Cumplimiento con requisitos de seguridad y normativa que exigen copias de datos en diferentes ubicaciones.

# Almacenamiento en bloques: Amazon Elastic Block Store (EBS)

## ¿Qué es EBS y cuándo usarlo?

EBS (Elastic Block Store) es un servicio de almacenamiento en bloque diseñado para su uso con EC2.

Características:

* Persistencia de datos: Los datos almacenados en EBS son persistentes, lo que significa que se conservan incluso después de detener o apagar una instancia EC2.

* Escalabilidad: Los volúmenes EBS pueden aumentar o reducirse según las necesidades de almacenamiento sin afectar a la instancia de EC2

* Alto rendimiento: Proporciona almacenamiento en bloque de alto rendimiento, ideal para aplicaciones que requieren acceso rápido a datos.

* Opciones de configuración:  Amazon EBS ofrece varios tipos de volúmenes para diferentes necesidades de rendimiento y costo.

Casos en los que se usa EBS:

* Con bases de datos transaccionales como MySQL, PostgreSQL, Oracle o Microsoft SQL Server, donde la consistencia y persistencia de los datos es crucial.

* Aplicaciones empresariales que requieren un almacenamiento de alto rendimiento y baja latencia como aplicaciones de análisis de datos en tiempo real.

* Aplicaciones que necesitan almacenar datos en persistencia mas allá del ciclo de vida de la instancia como archivos de configuración, aplicaciones y archivos temporales que deben mantenerse en caso de reinicios o apagados.

## Crear y conectar volúmenes EBS a instancias EC2

La conexión y creación de estos volúmenes EBS en instancias EC2 la podemos realizar de dos formas en AWS. La primera seria básicamente en el apartado de configuración de almacenamiento a la hora en el que creamos una instancia EC2 ya que sera en ese apartado de configuración donde podremos añadir nuevos volúmenes sino editarlos también (cambiar tamaño, ponerle nombre a los volúmenes, cambiar el tipo de volumen, etc).

Otra opción seria si tenemos una instancia EC2 ya creada, en este caso accedemos al servicio EC2 y en el menu lateral buscamos la opción de Elastic Block Store y seleccionamos el campo de "volúmenes" para que se nos muestren los volúmenes que tenemos actualmente, hacemos clic en "crear volumen" y pasaremos a una pantalla donde nos aparecerán varios campos de configuración (tipo de volumen, tamaño, zona de disponibilidad, tipo de cifrado, nombre de volumen, etc).

Una vez creado el volumen, seleccionamos la opción de "Acciones" y se nos desplegaran varias opciones, de las cuales elegiremos "Adjuntar volumen", a la hora de adjuntar el volumen nos aparecerá un listado de instancias EC2 que tendremos creadas y seleccionaremos la instancia a la que le queremos adjuntar el volumen y una vez seleccionada la instancia, adjuntamos.

*Nota: El volumen EBS solo puede conectarse a instancias EC2 que estén en la misma zona de disponibilidad*

## Tipos de volúmenes EBS (General Purpose, Provisioned IOPS, etc)

Dependiendo del uso que se le vayan a dar a los volúmenes EBS creados, podemos crearlos de un tipo u otro, estos serias los distintos tipos de volúmenes EBS que podemos encontrar:

* SSD de uso general (gp3 y gp2): ideal para aplicaciones con carga de trabajo moderada y aplicaciones de bases de datos de uso general.

* SSD provisionado (io1 e io2): diseñado para aplicaciones de misión critica que requieren un rendimiento de entrada/salida (IOPS) constante y alto.

* HDD de uso frecuente o Thoughput Optimized HHD (st1): volúmenes HDD con rendimiento secuencial alto, adecuado para aplicaciones con grandes volúmenes de datos de acceso frecuente.

* HDD de acceso poco frecuente o Cold HHD (sc1): volúmenes HDD de bajo costo, adecuados para datos de acceso poco frecuente como por ejemplo archivos de backup.

Recomendaciones:

* Para aplicaciones criticas y de misión: volúmenes IOPS SSD para asegurar la baja latencia y la alta disponibilidad.

* Para aplicaciones de uso general: SSD de uso general para aplicaciones de rendimiento moderado y bajo coste.

* Para análisis de Big Data: HHD de uso frecuente para las cargas secuenciales y ancho de banda alto.

* Para el almacenamiento de bajo coste: HHD poco frecuente para el almacenamiento a largo plazo de datos de acceso infrecuente.

## Realización de snapshots y restauración de volúmenes

Estas snapshots son útiles para realizar copias de seguridad de los volúmenes que sean necesarios, de modo que si hay algún problema en disco, vamos a poder restaurar los datos a través de esta snapshot y también podremos crear un nuevo volumen a raíz de los datos de la snapshot.

Para crear estas snapshot tenemos que abrir el servicio EC2 acceder en el menu a la opción "volúmenes" y una vez seleccionado el volumen al que queramos realizar un snapshot y seleccionamos la opción "crear instantánea" para que se genere.

## Optimización del rendimiento en EBS

Recomendaciones: 

* Usar gp3 en lugar de gp2, ya que permite definir IOPS y throughput de forma independiente.
* Para BBDD transaccionales elegir io2 con IOPS provisionadas.
* Para almacenamiento de datos en frio, usar st1 o sc1.
* IOPS (operaciones entrada/salida): define la velocidad de acceso a los datos.
* Throughput: Afecta el rendimiento de operaciones de transferencia de datos masivas.
* Para volúmenes gp3, asignar el throughput de acuerdo a la carga esperada (máximo 1000 MB/s).
* Monitorizar el uso de IOPS con CloudWatch y ajustar valores si hay cuellos de botella.

Es recomendable implementar discos en Raid:

* Raid 0:
  * Dividir los datos entre varios volúmenes EBS.
  * Recomendado para bases de datos de alto rendimiento.
  * No ofrece redundancia, si un disco falla se pierden los datos.

* Raid 1:
  * Duplica los datos en dos volúmenes EBS.
  * Util para aplicaciones criticas con alta disponibilidad.

# Almacenamiento de archivos: Amazon Elastic File System (EFS)

## ¿Qué es EFS y cuándo usarlo?

EFS (Amazon Elastic File System) es un servicio que permite tener un sistema de archivo totalmente administrado que proporciona almacenamiento compartido para aplicaciones y servidores. EFS permite que múltiples instancias de EC2 accedan simultáneamente al mismo sistema de archivos.

Características

* Escalabilidad automática: EFS ajusta automáticamente su capacidad de almacenamiento a medida que se agregan o eliminan archivos.

* Acceso compartido: permite que varias instancias de EC2 en una misma region accedan al sistema de archivos al mismo tiempo.

* Durabilidad y disponibilidad: los datos en EFS están diseñados para ser altamente duraderos y se distribuyen de manera redundante.

* Compatibilidad con NFS: EFS usa el protocolo NFS estándar, lo cual facilita la integración con aplicaciones y servicios que soportan NFS.

Casos de uso:

* Los entornos de análisis y big data, donde los datos deben procesarse simultáneamente desde varios nodos, pueden beneficiarse del acceso concurrente y escalabilidad de EFS.

* En entornos donde varios usuarios necesitan acceder a su propio directorio de inicio desde diferentes servidores, EFS proporciona un sistema de archivos centralizado que permite que los usuarios accedan a sus datos desde cualquier servidor que este conectado al sistema de archivos.

* Las aplicaciones de aprendizaje automático y ciencia de de datos que requieren acceso simultaneo a grandes volúmenes de datos pueden usar EFS para garantizar que los datos estén disponibles en todos los nodos de procesamiento sin necesidad de replicación o sincronización adicional.

Al igual que en EBS, tenemos dos tipos de EFS:

* Standard: almacenamiento de alto rendimiento para datos accedidos frecuentemente.
* Infrequent access (IA): almacenamiento de bajo costo para datos de acceso poco frecuente, que reduce los costos.

## Crear y configurar un sistema de archivos EFS

Para la creación un sistema de ficheros EFS, tendremos que tener previamente creada alguna instancia EC2 (la instancia tiene que tener configurada en las reglas del grupo de seguridad el tipo NFS). Una vez creada la instancia, buscamos el servicio EFS y seleccionamos la opción de "crear un sistema de archivos".

Se nos abrirá una ventana que nos pedirá un nombre y lo tendremos que asociar a una vpc, en cuanto a configuración esto seria todo lo necesario, el resto de configuraciones que podríamos tener serian a modo de personalización.

* Tipo de sistema de archivos:
  * Regional: ofrece los niveles mas altos de disponibilidad y durabilidad al almacenar los datos del sistema de archivos en varias zonas de disponibilidad dentro de una region AWS.

  * Única zona: proporciona disponibilidad continua a los datos dentro de una única zona de disponibilidad dentro de una region de AWS.

* Permitir copias de seguridad automáticas
* Administración del ciclo de vida
* Habilitar cifrado

## Integrar EFS con instancias EC2

EC2 > conectar > una vez dentro de la máquina nos logamos con permisos de administrador, lo primero ejecutaremos update para actualizar la máquina, una vez actualizado los repositorios, instalaremos el paquete efs.

~~~
yum install -y amazon-efs-utils
~~~

Después creamos un directorio en el que se almacenara la información a modo de prueba. Ejemplo: 

~~~
mkdir efs
~~~

Y montamos el sistema efs dentro en el directorio.

~~~
sudo mount -t efs -o tls [ID sistema de archivos]:/ efs
~~~

Al lanzar el comando se estaría montando ya el sistema de ficheros dentro del directorio creado previamente. Una vez que este todo montado ya se podrán compartir ficheros entre instancias siempre que otras instancias tengan configurado este mismo sistema de ficheros.

## Seguridad en EFS: Control de acceso y cifrado

Como EFS aparece en las instancias como un filesystem Linux, el control interno se hace mediante:

* UID (User ID)
* GID (Group ID)
* Permisos POSIX tradicionales
* chmod, chown, chgrp
* ACLs POSIX extendidas (opcional)

### Permisos por usuario/grupo

Al montar EFS, los permisos funcionan igual que en un Linux local. Ejemplo:

~~~
sudo chown sergio:sergio /mnt/efs
sudo chmod 700 /mnt/efs
~~~

Con esto solo el usuario sergio podrá leer y escribir en esa carpeta.

### ACLs POSIX extendidas

Permiten permisos más granulares, como otorgar acceso a varios usuarios o grupos. Ejemplo:

~~~
setfacl -m u:sergio:rwx /mnt/efs/proyectos
~~~

Esto facilita escenarios multiusuario.

### Identity Access Management (IAM)

IAM no controla el acceso dentro del filesystem, pero sí: Quién puede crear, modificar o eliminar un EFS y quién puede montarlo mediante IAM authorization (opcional con EFS Access Points y IAM). EFS supporta IAM Authorization mediante tres componentes:

* IAM Policies para montajes: Permite autorizar o denegar que una instancia monte un EFS basado en credenciales IAM.
* IAM Resource Policies: Aplicadas directamente al EFS, permiten:
  * Restringir acceso por VPC
  * Restringir por AWS Account
  * Restringir por rol IAM

### Access Points (muy importantes)

Los Access Points permiten:

* Definir un UID y GID por defecto para sesiones que montan el filesystem.
* Crear "vistas" segmentadas del filesystem.
* Controlar acceso por directorio raíz.

Ejemplo de uso práctico: Cada microservicio monta el EFS mediante un access point con permisos específicos.

### Cifrado en EFS (Encryption)

Amazon EFS implementa dos tipos de cifrado:

* Cifrado en reposo (At-rest encryption): Funciona mediante AWS KMS.

  * Se habilita al crear el filesystem.
  * Usa claves KMS gestionadas por AWS o claves personalizadas (CMK).
  * Cifra automáticamente (Metadatos, datos almacenados y replicas internas)

El cifrado no se puede activar en un EFS ya existente, solo al crearlo. (La alternativa es migrar los datos a un nuevo EFS cifrado.)

* Cifrado en tránsito (In-transit encryption): Protege datos enviados desde y hacia EFS mediante:

  * TLS 1.2 o superior
  * Debe habilitarse al montar el filesystem

Ejemplo de comando de montaje para habilitar TLS:

~~~
sudo mount -t efs -o tls fs-12345678:/ /mnt/efs
~~~

Ventajas: Evita que atacantes intercepten tráfico NFS y recomendado especialmente si la VPC tiene conectividad híbrida.

Ambos cifrados pueden habilitarse de manera independiente.

## Rendimiento y costos en EFS

Modos de trabajar con EFS:

* Modo de rendimiento:
  * Bursting Throughput: ideal para aplicaciones con patrones de acceso variable o picos ocasionales. EFS acumula créditos de rendimiento en periodos de baja actividad que se pueden gastar durante picos de uso.

  * Provisioned Throughput: permite configurar un rendimiento garantizado independientemente del tamaño del sistema de archivos, ideal para aplicaciones con cargas de trabajo constantes y requisitos específicos de rendimiento.

Factores que afectan al rendimiento:

* Tamaño del sistema de archivos: cuanto mayor sea el sistema de archivos, mayor sera el rendimiento máximo disponible.
* Tipos de acceso: acceso aleatorio frente a acceso secuencial, que puede afectar el rendimiento de los datos.
* Latencia y regiones: el rendimiento es optimo cuando las instancias EC2 están en la misma region que el sistema de archivos EFS.

# Almacenamiento de largo plazo: Amazon S3 Glacier

## Introducción a S3 Glacier: Almacenamiento en frío

Es un servicio de almacenamiento en frio de AWS diseñado para el almacenamiento a largo plazo de datos a un costo significativamente menor. Este tipo de almacenamiento esta optimizado para datos que son accedidos con poca frecuencia.

Características: 

* Bajo coste (se paga por GB almacenado y velocidad a la que se recupera la información)
* Alta durabilidad
* Seguridad y cumplimiento
* Integración con S3

Casos de uso:

* Archivos de respaldo y restauración de datos: es ideal para copias de seguridad a largo plazo, ya que los datos pueden ser almacenados a bajo costo y recuperados cuando sea necesario.

* Cumplimiento regulatorio y retención de datos: muchas industrias requieren la conservación de registros durante años o décadas y glacier facilita este almacenamiento económico con políticas de retención.

* Almacenamiento de datos para investigación y análisis históricos.

Glacier esta basado en la creación de archivos, que son los objetos que se almacenan dentro de los "cofres" (vaults), los contenedores de almacenamiento. Estos cofres pueden ser administrados y monitoreados para aplicar políticas de retención y auditoria.

## Configuración y uso de S3 Glacier

Para poder configurar nuestro S3 glacier, buscamos el servicio S3, nos aparecerán dos opciones: S3 que es el que se a usado anteriormente y S3 Glacier que sera el que usaremos ahora. Usamos la opción "crear almacén" crear un almacén de S3 glacier, esta seria una forma de trabajar con S3 glacier.

Otra forma seria accediendo al servicio S3 > Buckets y crear un bucket, a la hora de cargar archivos en estos buckets es cuando nos aparecerá la opción de cargar glacier al agregar archivo (en la opción clase de almacenamiento).

## Recuperación de datos en S3 Glacier

Tipos de recuperación:

* Standard:
  * Tiempo de recuperación: 3 a 5 horas
  * Costo: intermedio
  * Uso recomendado: para recuperación de datos planificadas donde la urgencia no es un problema.

* Acelerada:
  * Tiempo de recuperación: 1 a 5 min
  * Costo: alto
  * Uso recomendado: para recuperación inmediata de archivos en caso de necesidad critica.

* Bulk:
  * Tiempo de recuperación: 5 a 12 horas
  * Costo: mas bajo
  * Uso recomendado: para recuperación de grandes volúmenes de datos cuando el tiempo no es un problema.

Esta recuperación la podremos realizar mediante la consola de AWS, la CLI de AWS o el SDK de AWS. En la consola, buscamos el servicio S3, seleccionamos el bucket y el luego el archivo almacenado en glacier y en las opciones de recuperación, elegimos el tipo de recuperación.

Por defecto el acceso a la restauración es de 1 dia (se puede modificar), una vez pasado ese tiempo sera necesario restaurarlo de nuevo ya que dejara de ser accesible.

# Kubernetes en AWS: Introducción a Amazon EKS

## ¿Qué es Amazon EKS?

Amazon EKS (Elastic Kubernetes Service) es el servicio administrado de Kubernetes de AWS. Su objetivo es permitir que las empresas ejecuten aplicaciones basadas en contenedores sin tener que encargarse del manejo complejo del plano de control de Kubernetes.

Características:

* Administración Completa: EKS gestiona la infraestructura subyacente y las operaciones del plano de control de Kubernetes, lo que permite a los usuarios centrarse en el desarrollo y administración de aplicaciones en lugar de en la infraestructura.

* Alta disponibilidad y seguridad: EKS ejecuta Kubernetes en varias zonas de disponibilidad, asegurando alta disponibilidad. Ademas EKS se integra con otros servicios de AWS como IAM para asegurar recursos.

* Compatibilidad completa con Kubernetes: EKS es compatible con Kubernetes nativo, lo que significa que las aplicaciones desarrolladas para Kubernetes pueden ejecutarse en EKS sin modificaciones.

* Escalabilidad automática: permite escalar aplicaciones y nodos automáticamente.

* Integración con AWS: EKS se integra con otros servicios de AWS como Amazon VPC, IAM, Cloudwatch y ELB.

Componentes:

* Plano de control: EKS administra el plano de control, que incluye los componentes clave de Kubernetes como servidor API y la BBDD.

* Nodos de trabajo: son las instancias EC2 donde se ejecutan los contenedores.

* Amazon EKS Managed Node Groups: EKS permite crear grupos de nodos administrados que se integran fácilmente en el cluster y se mantienen actualizados de manera automática.

Casos de uso:

* Para ejecutar aplicaciones basadas en microservicios que requieren escalabilidad.

* Aplicaciones que necesitan despliegues frecuentes o pipelines de CI/CD.

* Facilita la ejecución de cargas de trabajo intensivas en datos, como entrenamiento de modelos de Machine Learning y aplicaciones de IA.

## Crear un clúster EKS y nodos de trabajo

Buscamos el servicio EKS y dentro nos aparecerá la opción de "crear cluster" y se nos abrirá la pantalla de configuración (nombre del cluster, rol de IAM, version de kubernetes, subred, etc.)

Si la creacion del cluster la hacemos a traves de la terminal, necesitaremos instalar varios paquetes:

AWS CLI:

~~~
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
~~~

kubectl:

~~~
curl -o kubectl https://amazon-eks.s3.amazonaws.com/latest/2023-11-15/bin/linux/amd64/kubectl
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
~~~

Y por ultimo eksctl:

~~~
curl -s https://api.github.com/repos/eksctl-io/eksctl/releases/latest \
| grep browser_download_url | grep linux_amd64 | cut -d '"' -f 4 \
| wget -qi -
tar -xzf eksctl_*_linux_amd64.tar.gz
sudo mv eksctl /usr/local/bin/
~~~

Una vez que tengamos los paquetes anteriores instalados, podemos crear un cluster creando un fichero con la configuracion que queramos con la extension yaml. Ejemplo:

cluster.yaml:

~~~
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: mi-eks
  region: eu-west-1
  version: "1.29"

vpc:
  cidr: "10.0.0.0/16"
  subnets:
    public:
      eu-west-1a: { cidr: "10.0.1.0/24" }
      eu-west-1b: { cidr: "10.0.2.0/24" }
    private:
      eu-west-1a: { cidr: "10.0.3.0/24" }
      eu-west-1b: { cidr: "10.0.4.0/24" }

managedNodeGroups:
  - name: ng-general
    instanceTypes: ["t3.medium"]
    desiredCapacity: 2
    minSize: 1
    maxSize: 4
    volumeSize: 30
    privateNetworking: true
~~~

Y una vez que tengamos toda la configuración en el fichero, ejecutamos el comando eksctl.

~~~
eksctl create cluster -f cluster.yaml
~~~

Esto creara el cluster EKS, la VPC y subredes (si no existen), Node group administrado y roles IAM, esto suele tardar entre 10 y 15 min.

Por otro lado la creacion de los nodos de trabajo se realizaria dentro del propio cluster, en la opcion "compute" y despues "add node group" donde tendremos que configurar (nombre del nodo, rol IAM, tipo de instancia, tamaño, disco, subredes, etc.)

Por ultimo nos conectariamos al cluster ejecutando kubectl:

~~~
aws eks update-kubeconfig --region eu-west-1 --name mi-eks
~~~

## Integración de EKS con EC2 y otros servicios de AWS

Integración de EKS con EC2

EKS depende de EC2 en dos capas principales: cómputo y networking.

* Worker Nodes en EC2

Los nodos del cluster EKS suelen ser EC2 instances (a menos que uses Fargate). Roles principales de EC2 dentro de EKS:

  * Ejecutar los pods y contenedores de Kubernetes.
  * Ejecutar kubelet y kube-proxy.
  * Mantener conectividad con el API Server de EKS.
  * Montar volúmenes EBS para los pods (si se usa almacenamiento persistente).
  * Gestionar seguridad a través de IAM Roles for Service Accounts (IRSA).

Tipos de nodos:

  * Managed Node Groups (recomendado): EKS gestiona AMI, actualizaciones y reemplazo de nodos.

  * Self-managed nodes: tú gestionas AMIs, autoscaling y parches.

  * EC2 Spot nodes: nodos baratos pero interrumpibles.

Beneficios del uso de EC2:

  * Control del tipo de instancia (CPU, RAM).

  * Acceso a GPU (NVIDIA A10/A100) para cargas de IA en pods.

  * Autoscaling dinámico (con Auto Scaling Groups).

  * Integración con EBS, ENI, VPC CNI y Security Groups.

## Despliegue de aplicaciones en contenedores con EKS

Integración con VPC, Subnets y Networking (CNI)

EKS está profundamente integrado con el networking de AWS:

* Amazon VPC CNI Plugin

EKS utiliza el AWS VPC CNI (Container Network Interface), lo que significa que:

  * Cada pod recibe una IP de la VPC.
  * Los pods pueden comunicarse directamente con otros recursos de AWS sin NAT.
  * Kubernetes networking es nativo dentro de AWS.

Esto permite:

  * Visibilidad completa en el VPC flow logs.

  * Seguridad a nivel de Security Groups.

  * Integración directa con Load Balancers.

Componentes importantes:

  * ENI (Elastic Network Interfaces): se asignan a los nodos para proveer IPs a los pods.

  * IPAMD: daemon que gestiona IPs y ENIs en cada nodo.

## Monitoreo y escalabilidad de clústeres EKS

El monitoreo en EKS se basa en dos capas:

* Monitoreo del clúster (nodos, pods, control plane)
* Monitoreo de aplicaciones (logs, métricas, trazas)

Para cubrir ambas se usan CloudWatch, Prometheus/Grafana, el AWS Observability Add-on y servicios adicionales.

* CloudWatch Container Insights

Se habilita instalando AWS Distro for OpenTelemetry (ADOT) o Fluent Bit.

Beneficios:

  * Dashboards automáticos en CloudWatch (sin configuraciones complejas).

  * Alertas mediante CloudWatch Alarms.

  * Integración completa con CloudWatch Logs.

Pometheus y Grafana

EKS se integra de manera nativa con:

* Amazon Managed Prometheus (AMP): Prometheus server sin tener que mantenerlo.

* Amazon Managed Grafana (AMG): Grafana administrado por AWS.

Métricas que se recopilan:

* Kubelet, kube-proxy

* API Server

* Scheduler y Controller Manager

* Métricas de pods y deployments

* Métricas de aplicaciones instrumentadas