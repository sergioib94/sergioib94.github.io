---
title: "Terraform (II): Terraform + AWS"
date: 2025-11-26T13:16:00+02:00
categories: [Apuntes, Sistemas, Terraform, AWS]
excerpt: "En este post aprenderás los conceptos fundamentales para trabajar con Terraform de forma profesional: qué es un backend y cómo permite mantener estados remotos seguros en equipos de trabajo, cómo crear y estructurar módulos reutilizables, qué es Packer y por qué es una herramienta clave para automatizar la creación de imágenes, y finalmente cómo generar tu propia AMI personalizada para AWS. Un recorrido completo y actualizado para entender cómo construir infraestructura reproducible, modular y preparada para entornos reales."
card_image: /assets/images/cards/terraform.png
---

# Introducción

Terraform se ha convertido en una herramienta esencial para cualquier administrador de sistemas, DevOps o ingeniero de infraestructura que desee automatizar despliegues de forma segura, reproducible y escalable. Sin embargo, para trabajar con Terraform de manera profesional es imprescindible entender algunos pilares clave: cómo se almacenan y gestionan los estados mediante los backends, cómo se estructuran y reutilizan módulos, y cómo se integran herramientas externas como Packer para construir imágenes personalizadas.

En este post exploraremos estos conceptos paso a paso, incluyendo la creación de una AMI propia en AWS, la definición de módulos reutilizables y la configuración de un backend remoto. Tras leerlo, tendrás una base sólida para construir entornos más limpios, organizados y adecuados para equipos y proyectos reales.

Si es tu primera vez usando Terraform, te recomiendo comenzar por el post anterior “Introducción a Terraform: conceptos y primeros pasos”, donde explico el funcionamiento básico de la herramienta antes de entrar en temas avanzados como backends remotos, módulos o AMIs personalizadas.

# Providers

Son los que proveen la integración de Terraform con otras herramientas, Amazon, Google cloud, Mysql, Azure, etc... Podemos ver todos los providers de Terraform en la pagina oficial  . Estos providers hasta la version 0.10 de Terraform, usaban el mismo repositorio, es decir que Terraform y los providers venían juntos, pero a partir de la version 0.10, esto cambia y los providers pasan a estar en un repositorio a parte.

## Ejemplo de provider AWS

A modo de ejemplo se va ha indicar como se va a realizar la integración de AWS provider. Para dicha integración tendremos que tener una cuenta en AWS y una vez que tengamos una cuenta, acceder a ella y abrir el servicio IAM (servicio que gestiona los accesos de los usuarios y las claves), dentro del servicio IAM, buscaremos la opción "users" y se nos abrirá una pantalla en la que se nos mostraran los usuarios que tengamos creados, en el caso de que la cuenta sea nueva pues nos aparecerá el listado vacío.

Podremos crear un usuario con el botón "adduser", esta opción nos abrirá una pantalla que nos pedirá el nombre para el usuario que queremos crear y también tendremos que decidir el tipo de acceso:

* **Acceso programado:** Este acceso dará permisos para crear los recursos en Amazon, es decir, este tipo de acceso no usara la consola.

* **AWS Management Console Access:** Al contrario qe el acceso anterior, este si va a permitir el acceso a la consola de AWS.

Después tendremos que seleccionar que permisos tendrá el usuario que estamos creando, en este caso como lo que queremos es usar varios recursos para la integración con Terraform, como mínimo el usuario tendrá que tener el permiso AdministratorAccess (permisos de root). Hay que aclarar que nunca se recomienda usar AdministratorAccess solo para Terraform, actualmente se usa privilegios mínimos (least privilege).

Una vez que hayamos seleccionados los permisos para este usuario, lo creamos y nos aparecerá una pantalla con los algunos datos como el nombre de usuario, el Access Key ID o el Secret access Key.

Para realizar la configuración, tendremos que tener previamente instalado el CLI de Amazon (esta en el repositorio de Amazon). Al tener instalado el CLI de Amazon, deberíamos tener en el home de nuestro usuario un fichero llamado "credentials" dentro del directorio .aws en el que haciendo uso del editor nano (o vim) pegaremos en este fichero tanto la access key ID como la secret access key dejando el fichero con la siguiente estructura:

~~~
[nombre de nuestro profile]
aws_access_key_id=nuestra access key id
aws_secret_access_key=nuestra secret access key
region=eu-west-1 #la region seria necesario revisarla para comprobar cual nos corresponde
~~~

## Empezando con la integración

Para que todo quede mas claro y ordenado, crearemos un directorio y dentro de el un fichero llamado main.tf que sera el fichero principal de Terraform (plantilla Terraform).

Para hacer la integración y poder utilizar el provider AWS lo primero sera limitar la version de Terraform que queremos utilizar.

~~~
terraform {
    required_version = ">= 1.0.0" #tendremos de asegurarnos antes de que la version que indiquemos sea la misma que     tengamos descargada

    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 5.0"
        }
    }
}
~~~

Con esta linea dejamos indicado que el proyecto sera compatible con la version de Terraform 1.0.0 en adelante y después escribimos la configuración de providers de la siguiente forma:

~~~
provider "aws" {
    region= "eu-west-1"
    allowed_account_ids = ["Id de nuestra cuenta"] #Cuentas de Amazon en las que estarán permitidos que se creen recursos (opcional).
    profile = "nombre profile" #indicado anteriormente en .aws/credentials
}
~~~

Ejecutamos nuestro proyecto en la carpeta con el comando terraform init, al iniciar se descargaran e instalaran los providers declarados, en este caso a modo de ejemplo solo aparecerá el aws.

# Desarrollo de plantilla básica de Terraform

## Creación del primer recurso

El primer recursos que se va a configurar dentro de nuestro fichero main.tf, sera el recurso mas básico, el recurso vpc. Para ello añadiremos a nuestro main.tf la siguiente configuración:

~~~
resource "aws_vpc" "vpc"{
    cidr_block = "10.0.0.0/16"
    enable_dns_hostnames = true
    enable_dns_support = true
    tags {
        Name = "nombre del vpc"
    }
}
~~~

* **aws_vpc:** este campo sera el nombre del recurso dentro del provider aws.
* **vpc:** nombre del recurso, como esto es algo identificativo realmente podemos nombrarlo como queramos.
* **cidr_block:** para que funcione vpc tenemos que indicar el segmento ip que va a poder usar vpc.
* **enable_dns_hostnames:** las instancias tengan acceso a un dns interno, privado y puedan resolver los nombres internos entre las instancias.

Esta configuración creara el recurso vpc en Amazon, pero esto es solo la configuración, para aplicarla usaremos el comando terraform plan, que comparara la configuración anterior con la actual para comprobar que todo este correcto y para aplicar el cambio seria el comando terraform apply que conectara con la api de Amazon y creara el recurso.

Podremos comprobar que el vpc esta realmente creado entrando en la cuenta de Amazon y accediendo a la opción Services > Networking & Content Delivery > VPC y ahi veremos una pantalla con los datos de los VPC que tengamos creados. 

## States (fichero de estados)

Este fichero de estados seria el terraform.tfstate, en un fichero que al principio no tendremos pero que se creara después de la instalación en el momento que empecemos a realizar configuraciones, como puede ser la configuración de los providers, este fichero ira cambiando a medida que vayamos realizando configuraciones en el proyecto.

Cuando hagamos un cambio, en nuestro fichero main y ejecutemos terraform plan para que se compare el fichero anterior con el actual y apliquemos el cambio con apply, los cambios se reflejaran en el fichero de estados. Terraform por seguridad también crea un fichero de backup del fichero de estados anterior a la modificación para tener la opción de recuperar una version anterior de la estructura que tengamos montada, este fichero de backup se genera automáticamente.

Tanto el fichero de estados, como la backup de dicho ficheros son importantes ya que si son eliminados, Terraform interpreta que nuestro proyecto no tiene ninguna infraestructura dado que al no encontrar los ficheros entiende que la infraestructura no existe, por lo que si son eliminados se tendría que empezar de nuevo y crearlo todo desde el principio.

## Variables

Las variables nos darán la posibilidad de crear plantillas reutilizables haciendo uso de algún fichero de variables que crearemos. Ejemplo:

~~~
variable "cidr" {
    type = "string"
    default = "10.0.0.0/16"
}
~~~

Con este fichero donde declaramos la variable cidr, estaremos creando una variable cuyo valor sera el fragmento de red. Para poder usar esta variable en el fichero que ya tenemos creado usamos "${var}" de modo que el fichero quedaría de la siguiente forma:

~~~
resource "aws_vpc" "vpc"{
    cidr_block = var.cidr
    enable_dns_hostnames = true
    enable_dns_support = true
    tags {
        name = "nombre de vpc"
    }
}
~~~

De esta forma el parámetro cidr_block tendrá el valor indicado en el fichero de variables. A modo de buena practica a la hora de trabajar con Terraform, lo ideal seria que la infraestructura estuviese dividida en distintos ficheros dependiendo de los recursos que se vayan necesitando ya que en el caso de ponerlo todo en el fichero de main, nuestro fichero de infraestructura podría llegar a ser demasiado grande y complejo y en caso de evitar o corregir errores se haría muy difícil detectarlos. En este punto nuestra estructura debería de ser algo asi:

* **main.df:** donde definimos la compatibilidad de la version de Terraform y los providers que vayan a usarse.
* **vpc.tf:** donde se declarara todo lo relacionado con el recurso vpc que vamos a usar.
* **variables.tf:** donde se irán declarando las variables que vayamos usando a lo largo de nuestro proyecto.

## Outputs

Crearemos un nuevo recurso para asi mostrar su output en la instalación, para ello creamos un nuevo fichero con el siguiente contenido como ejemplo:

~~~
resource "aws_instance" "web-server" {
    ami = "identificador ami"
    instance_type = "t2.micro"  #este tipo permite usar una instancia al rededor de 700horas
}
~~~

Estos serian los datos mínimos que requiere este recurso, el ami lo podemos consultar en la siguiente ruta: Instances > launch instance en nuestra cuenta de Amazon. 

Una vez configurado este fichero, crearemos otro al que llamaremos por ejemplo output en el que añadiremos el siguiente contenido:

~~~
output "server-ip" {    #este es el nombre que se le estará dando al output
    value = aws_instance.wev-server.public_ip
}
~~~

De esta forma a la hora de ejecutar el apply, haremos referencia ala instancia de aws y se nos muestre la ip publica de web-server y una vez creado el nuevo recurso, se nos mostrara la ip de nuestro servidor web.

## Data sources

Son lectores de información, permiten obtener datos de recursos que ya existen en una nube, proveedor o sistema externo sin crearlos... Para consultar los data sources tenemos la propia pagina oficial de Terraform en el apartado "Data Sources". Ej:

~~~
data "aws_ami" "ubuntu" {
    most_recent = true
    owners = ["id ami"]
}
~~~

De esta forma lo que haremos sera crear una instancia con un sistema operativo ubuntu comunicándose con la api de aws buscando la ami indicada y creándola.

## Templates

Los templates son una forma de generar textos dinámicos a partir de variables, expresiones y estructuras de control. Se usan mucho para construir archivos de configuración, scripts, bloques de YAML/JSON, configuraciones de cloud-init, plantillas de user-data, etc.

Ejemplo de template:

A modo de buena practica organizativa, vamos a crear un directorio llamado templates, donde crearemos y configuraremos los templates que vayamos a usar (esto es algo opcional). Dentro del directorio crearemos un fichero llamado userdata.tpl (los templates deben tener todos una extension tpl) para nuestro primer template.

~~~
#!/bin/bash
yum install ${webserver} --assumeyes
serve ${webserver} start
~~~

A continuación tenemos que abrir el fichero webserver.tf y añadir la siguiente linea:

~~~
data "templatefile" "userdata" {
  template = file("${path.module}/templates/userdata.tpl")

  vars = {
    webserver = "httpd"
  }
}
~~~

Aquí estamos usando un data sources de tipo template_file, para iniciar este template_file que en este caso se trataría como si fuese un provider, ejecutamos terraform plan y después un terraform apply.

# Importar recursos existentes

Para ello por ejemplo se va a importar una instancia Linux previamente creada, para ello crearemos un nuevo directorio llamado por ejemplo "import" en el que vamos a crear un fichero de configuración llamado por ejemplo instancia.tf que sera donde importemos la instancia ya creada.

Hay un requisito inicial que debemos cumplir para poder importar recursos y este requisito es que el recurso debe estar declarado. Importante indicar que no todos los recursos se pueden importar dado que algunos no están soportados. Por lo que en este caso como queremos importar una instancia, empezamos declarándola añadiendo las siguientes lineas al fichero instancia.tf:

~~~
resource "aws_instance" "web" {
    ami = "ami-acd005d5"    #ami de una instancia Linux
    instance_type = "t2.micro"
}
~~~

Esto son los datos mínimos a la hora de crear un recurso. Después para importarlo, ejecutamos "terraform import [nombre de recurso.nombre que se le puso][ID de la instancia]". Ej:

~~~
terraform import aws_instance.web i-0c1846cf31ab6881
~~~

Donde aws_instance sera el recurso de aws que queremos importar, en este caso una instancia, web hace referencia al nombre que le hemos puesto al recurso a la hora de declararlo anteriormente y la numeración final seria la ID para identificar la instancia que se va a importar (esta ID podemos obtenerla de nuestra cuenta de aws revisando las instancias que tengamos creadas). Este comando importara la instancia indicada en el fichero de estados.

Mas adelante si necesitamos realizar alguna modificación en la instancia, ejecutaremos un terraform plan como siempre y después un terraform apply.

Aunque esta forma de importar recursos se puede seguir usando, actualmente a partir de la version 1.5 Terraform permite importar recursos de forma declarativa, en el caso de importar de forma declarativa el contenido del fichero instancia.tf seria el siguiente: 

~~~
import {
  id = "i-0c1846cf31ab6881"
  to = aws_instance.web
}
~~~

# Desarrollo de una plantilla completa de Terraform

## Crear N recursos

A modo de ejemplo, en nuestro fichero main.tf creado en el inicio ya tendríamos declarado tanto la version de Terraform como los datos mínimos del provider (aws), en el fichero de variables vamos a crear un recurso en el fichero webserver.tf. Ej:

~~~
resource "aws_instance" "webservers" {
    ami = lookup(var.aws_amis, var.region)
    instance_type = var.instance_type
    count = 3
    tags = {
        Name = "webservers"
    }
}
~~~

Donde el valor de instance_type ya lo tendríamos declarado en el ficheros de variables, en el caso de no tenerlo, lo tendríamos que declarar de la siguiente forma:

~~~
variable "instance_type" {
    type = string
    default = "t2.micro"
}
~~~

De igual forma el valor de ami lo tendremos que tener también declarado en el fichero de variables, esto lo haremos añadiendo las siguientes lineas:

~~~
variable "region" {
    type = string
    default = "eu-west-1"
}

variable "aws_amis" {
    type = map(string)
    default = {
        "eu-west-1" = "ami-acd005d5"
        "eu-east-1" = "ami-8c1be5f6"
        "eu-central-1" = "ami-c7ee5ca8"
    }
}
~~~

Cada uno de los campos "eu" representa una region distinta, por ejemplo eu-west-1 (irlanda), eu-east-1 (virginia) y eu-central-1 (franfurt). Los amis indicados en default corresponden todos a la misma ami (AWS linux) pero en distintas regiones, por lo que dependiendo de con que region trabajemos, se instalara una u otra.

Este recurso creará tres instancias idénticas usando count = 3. El AMI utilizado dependerá de la región seleccionada. Cada instancia recibirá una etiqueta única: webserver-0, webserver-1 y webserver-2.

## Reutilizar plantillas

Para este ejemplo vamos a reutilizar variables ya creadas y a añadir nuevos recursos que representen una arquitectura real: varias instancias detrás de un Application Load Balancer (ALB).

La idea es mostrar cómo Terraform permite reutilizar estructuras, variables, templates y recursos de forma ordenada. Para ello creamos un fichero llamado por ejemplo balanceador.tf con el siguiente contenido:

~~~
data "aws_availability_zones" "az" {}

resource "aws_lb" "elb_web" {
    name = "elb_web"

    listener {
        instance_port = 80
        instance_protocol = "http"
        lb_port = 80
        lb_protocol = "http"
    }

    availability_zones = data.aws_availability_zones.az.names
}
~~~
* **"data "aws_availability_zones" "az" {}":** Con esto obtendremos las zonas disponibles para la region seleccionada.
* **aws_lb:** es el recurso de aws para crear un balanceador de carga.
* **elb_web:** el primero es el nombre que se le da al recurso interno de terraform, el segundo indicado con el name, es el nombre que va a tener el balanceador (no tiene porque ser el mismo).

Para que pueda funcionar el balanceador de carga como mínimo lo que debe tener es un listener con los siguientes datos mínimos:

* **instance_port:** puerto por el que va a estar escuchando, en este caso el puerto 80.
* **instance_protocol:** protocolo que va a escuchar, en este caso como anteriormente hemos creado un servidor web va a escuchar el protocolo http.
* **lb_port:** misma configuración dado que la instancia y el balanceador van a escuchar en el mismo puerto.
* **lb_protocol:** misma configuración ya que la instancia y el balanceador van a escuchar el mismo protocolo.

* **availability_zones:** esto devolverá un listado con los nombres de las zonas en disponibilidad. Una vez configurado todo ejecutamos terraform plan y el terraform apply.

Una vez hecho todo lo anterior ya tendriamos un balanceador de carga creado ¿que es lo que pasa ahora? en aws los nombres de los recursos no pueden repetirse por lo que en caso de necesitar otro balanceador de carga para otro proyecto, no se podría llamar "elb_web" por lo que para poder solucionar esto tenemos varias opciones.

1. A través de variables. Ej:

~~~
variable "proyecto" {
    type = string
    default = "sweb"
}

variable "environment {
    type = string
    default = "prod"
}"
~~~

Con estas variables, podemos abrir la configuracion de nuestro balanceador en balanceador.tf y editar el fichero de la siguiente forma:

~~~
data "aws_availability_zones" "az" {}

resource "aws_lb" "elb_web" {
    name = "${var.environment}-${var.proyecto}"

    listener {
        instance_port = 80
        instance_protocol = "http"
        lb_port = 80
        lb_protocol = "http"
    }

    availability_zones = ["${data.aws_availability_zones.az.names}"]
}
~~~

Como hemos modificado el fichero, ejecutamos el terraform plan, comos los nombres de los balanceadores deben de ser únicos ya que son como las ID, en este caso como se ha cambiado el nombre, al ejecutar el terraform plan se nos indicara que el balanceador va a ser destruido y se va a crear otro con el nombre nuevo, en este caso el nombre lo cogerá a través de las variables creadas llamándose prod-sweb de esta forma no se crearan un nombre fijo. Después ejecutaremos el apply para aplicar los cambios.

1. Haciendo uso de prefijos. Ej:

~~~
data "aws_availability_zones" "az" {}

resource "aws_lb" "elb_web" {
    name_prefix = "${var.proyecto}-"

    listener {
        instance_port = 80
        instance_protocol = "http"
        lb_port = 80
        lb_protocol = "http"
    }

    availability_zones = ["${data.aws_availability_zones.az.names}"]
}
~~~

Al añadir prefix, terraform lo que hará sera añadir un prefijo de números aleatorios (un hash) que ira cambiando cada vez que se cree el recurso, por lo que en este caso podríamos crear varios balanceadores y cada uno al tener prefix tendrían prefijo distinto. Importante, para poder usar prefix, el parámetro que se le pase no puede ser superior a 6 caracteres, en este caso como var.proyecto hace referencia a "sweb" no habría problemas.

## Crear y asociar recursos entre ellos

En este apartado vamos a ir integrando varias recursos que se han ido integrando a lo largo del post, ya que hasta ahora se ha estado operando con los distintos recursos pero de manera individual.

A modo de ejemplo vamos a crear varias subnets para nuestra infraestructura, para ello en nuestro fichero de variables.tf añadiremos las siguientes lineas:

~~~
variable "pub1_cidr" {
    type = string
    default = "10.0.0.0/24"
}

variable "pub2_cidr" {
    type = string
    default = "10.0.1.0/24"
}

variable "pri1_cidr" {
    type = string
    default = "10.0.10.0/24"
}

variable "pri2_cidr" {
    type = string
    default = "10.0.11.0/24"
}
~~~

De esta forma a la hora de declarar las subnets (2 publicas y 2 privadas) en el fichero de vpc, se vera mucho mas claro y limpio el contenido. Por otra parte en el fichero vpc.tf tendremos que declarar las subnets:

~~~
resource "aws_subnet" "pub1" {
    cidr_block = var.pub1_cidr
    vpc_id = aws_vpc.vpc.id
    map_public_ip_on_launch = true
    availability_zone = data.aws_availability_zones.az.names[0]
    tags = {
        Name = "pub1"
    }
}

resource "aws_subnet" "pub2" {
    cidr_block = var.pub2_cidr
    vpc_id = aws_vpc.vpc.id
    map_public_ip_on_launch = true
    availability_zone = data.aws_availability_zones.az.names[1]
    tags = {
        Name = "pub2"
    }
}

resource "aws_subnet" "pri1" {
    cidr_block = var.pri1_cidr
    vpc_id = aws_vpc.vpc.id
    map_public_ip_on_launch = false
    availability_zone = data.aws_availability_zones.az.names[0]
    tags = {
        Name = "pri1"
    }
}

resource "aws_subnet" "pri2" {
    cidr_block = var.pri2_cidr
    vpc_id = aws_vpc.vpc.id
    map_public_ip_on_launch = false
    availability_zone = data.aws_availability_zones.az.names[1]
    tags = {
        Name = "pri2"
    }
}

resource "aws_internet_gateway" "igw" {
    vpc_id = aws_vpc.vpc.id
}

resource "aws_route" "default_route" {
    route_table_id = aws_vpc.vpc.default_route_table_id
    destination_cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
}
~~~

* **map_public_ip_on_launch:** hará que al levantarse las instancias, se levanten con ip publica.
* **availability_zone:** la instancia de la subnet1 se levantara en la primera region de la lista. Esta separación de las subnets en distintas zonas, aumenta la alta disponibilidad del recurso elb y de la infraestructura.
* **resource:** ruta por defecto para que todo el trafico de red pase por ahi.
* **route_table_id:** referenciamos las tablas de ruta por defecto que se crean al crear los vpc.

Con esto ya tendríamos declaradas las subnets, lo siguiente sera configurar el security_group, para ello simplemente creamos un fichero llamado por ejemplo security_group.tf y añadimos las siguientes lineas:

~~~
resource "aws_security_group" "elb_sg" {
    name = "elb_sg"
    vpc_id = aws_vpc.vpc.id
    ingress {
        from_port = 80
        protocol = "tcp"
        to_port = 80
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port = 0
        protocol = "-1"
        to_port = 0
        cidr_blocks = ["0.0.0.0/0"]
    }
}

resource "aws_security_group" "web_sg" {
    name = "web_sg"
    vpc_id = aws_vpc.vpc.id
    ingress {
        from_port = 80
        protocol = "tcp"
        to_port = 80
        security_groups = [aws_security_group.elb-sg.id]
    }

    egress {
        from_port = 0
        protocol = "-1"
        to_port = 0
        cidr_blocks = ["0.0.0.0/0"]
    }
}
~~~

El primer security_group sera el del balanceador de carga y el segundo el de las instancias. Luego tendremos que realizar algunas modificaciones en la configuración de nuestro balanceador (balanceador.tf).

~~~
resource "aws_lb" "elb_web" {
    name = "${var.environment}-${var.proyecto}"
    cross_zone_load_balancing = true
    subnets = [aws_subnet.pub1.id, aws_subnet.pub2.id]

    listener {
        instance_port = 80
        instance_protocol = "http"
        lb_port = 80
        lb_protocol = "http"
    }
}
~~~

De esta forma eliminaremos el availability_zone ya que esa opción ya no sera necesaria al indicar las subnets, ya que en estas subnets ya estarán declaradas la zona de las regiones a la que corresponde cada instancia. Ala hora de declarar un balanceador en Terraform solo permite declararlo o bien usando las subnets o la availability_zone, solo una de las opciones, no se usan las dos a la vez.

Por otro lado la linea "data "aws_availability_zones" "az" {}" que antes iba al principio de nuestro fichero balanceador, pasaría a indicarse en nuestro fichero main.tf ya que con la nueva configuración el availability_zone ya no seria una configuración especifica del balanceador, sino que pasaría a ser una configuración mas genérica.

Para poder asociar las instancias a nuestro balanceador, tendremos que realizar algunos cambios en nuestro fichero webservers.tf (usado en el ejemplo de como utilizar N recursos).

~~~
resource "aws_instance" "webservers" {
    ami = lookup(var.aws_amis, var.region)
    instance_type = var.instance_type
    vpc_security_group_ids = [aws_security_group.web-sg.id]
    subnet_id = aws_subnet.pri1.id
    count = 2   #usando count, crearemos dos instancias idénticas. Cada instancia tendrá un ID distinto, y Terraform generará una lista para referenciarlas.
    tags = {
        Name = "${var.environment}-webservers"
    } 
}
~~~

Después tenemos que que añadir las siguientes lineas al fichero balanceador para referenciar las instancias declaradas en webservers, dejando el fichero de la siguiente forma:

~~~
resource "aws_lb" "elb_web" {
    name = "${var.environment}-${var.proyecto}"
    cross_zone_load_balancing = true
    subnets = ["${aws_subnet.pub1.id}", "${aws_subnet.pub2.id}"]

    listener {
        instance_port = 80
        instance_protocol = "http"
        lb_port = 80
        lb_protocol = "http"
    }
    instances = aws_instance.webservers[*].id #con "*" indicamos que se indiquen todos los ids de la lista de webservers

    security_groups = [aws_security_group.elb-sg.id]
}
~~~

Una vez tengamos todo configurado y ejecutemos terraform plan, se empezara a checkear los recursos de Amazon con lo que nosotros tenemos definido en los recursos. Terraform es capaz de enlazar y manejar todas las dependencias que tenemos actualmente declaradas de forma nativa ya que actualmente tenemos el balanceador que depende de que estén creados los security_groups y a su vez el balanceador también depende de que las instancias estén creadas y todo depende de que la vpc este creada.

Terraform también nos da la opción de para ciertos casos de especificar las dependencia especifica a través del atributo depends_on para indicar de que recurso especifico depende otro recurso.

# Conceptos Avanzados

## Backends

Un backend en Terraform es el mecanismo que permite almacenar y gestionar el estado (state) en un lugar externo y seguro. Existen varios tipos de backends, los mas usados serian:

**Local (por defecto):** guarda terraform.tfstate en tu pc. Es válido para pruebas, no para trabajo en equipo.
**S3 + DynamoDB (backend recomendada para aws):** Guarda el estado en un bucket S3 y usa DynamoDB para evitar modificaciones simultáneas (state locking). Ej:

~~~
terraform {
  backend "s3" {
    bucket         = "mi-bucket-terraform"
    key            = "proyecto/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
~~~

Ventajas de esta opción: 

* Bloqueo del estado (solo 1 modifica).
* Accesible por todo el equipo.
* Encriptado.
* Versionado automático.

**Terraform CloudTerraform Enterprise:** Backend remoto oficial con ejecución remota, colas y RBAC.
**GitHub, Consul, GCS, Azure Blob Storage, etc.**

## Creación de módulos

Un módulo es un conjunto de ficheros .tf que encapsulan recursos para que puedan usarse desde otros proyectos. Ejemplos de cosas típicamente convertidas en módulos:

* Una VPC completa
* Un ALB
* Un Auto Scaling Group
* Una base de datos RDS
* Un cluster EKS
* Una instancia con su SG, IAM, etc.

¿Por qué usar módulos?

* Reutilización
* Orden
* Facilitan crear infraestructuras estándar
* Evitan repetir código
* Aportan separación lógica

¿Como se crea un módulo?

La estructura minima que deben tener los modulos es la siguiente:

~~~
mi-modulo/
 ├── main.tf
 ├── variables.tf
 └── outputs.tf
~~~

Ejemplo de modulo simple para crear una instancia EC2:

* Fichero variables.tf:

~~~
variable "ami" {
  type = string
}

variable "instance_type" {
  type = string
  default = "t3.micro"
}
~~~

* Fichero main.tf:

~~~
resource "aws_instance" "ec2" {
  ami           = var.ami
  instance_type = var.instance_type
}
~~~

* Fichero outputs.tf:

~~~
output "instance_id" {
  value = aws_instance.ec2.id
}
~~~

¿Cómo se usa el módulo?

Desde el proyecto principal:

~~~
module "webserver" {
  source        = "./modulos/ec2"
  ami           = "ami-123456789"
  instance_type = "t3.small"
}
~~~

# Packer

## Que es packer

Packer es una herramienta de HashiCorp como Terraform, pero su función es diferente. Packer sirve para crear imágenes de máquinas preconfiguradas:

* AMIs (AWS)
* Imágenes de Azure
* Imágenes de GCP
* Vagrant boxes
* Imágenes Docker
* QEMU/VMware/VirtualBox

Lo importante:

* Terraform crea infraestructura
* Packer crea imágenes que luego Terraform usa

Un template de Packer incluye:

* Builders → qué tipo de imagen vas a crear
* Provisioners → cómo se configura la imagen (Bash, Ansible…)
* Variables (opcional)

Ejemplo:

~~~
{
  "builders": [
    {
      "type": "amazon-ebs",
      "region": "eu-west-1",
      "instance_type": "t3.micro",
      "source_ami": "ami-base-123",
      "ssh_username": "ubuntu",
      "ami_name": "webserver-{{timestamp}}"
    }
  ],

  "provisioners": [
    {
      "type": "shell",
      "inline": [
        "sudo apt update -y",
        "sudo apt install -y nginx"
      ]
    }
  ]
}
~~~

## Creación de una AMI

* Instalamos packer:

~~~
sudo apt install packer
~~~

* Creamos el fichero packer.json o packer.pkr.hcl. Ej:

~~~
source "amazon-ebs" "ubuntu" {
  region        = "eu-west-1"
  instance_type = "t3.micro"
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["099720109477"] # Canonical
    most_recent = true
  }
  ssh_username = "ubuntu"
  ami_name     = "web-ami-${uuid()}"
}

build {
  name = "web-ami"

  sources = [
    "source.amazon-ebs.ubuntu"
  ]

  provisioner "shell" {
    inline = [
      "sudo apt update -y",
      "sudo apt install -y nginx",
      "sudo systemctl enable nginx"
    ]
  }
}
~~~

* Validamos la configuracion:

~~~
packer validate packer.pkr.hcl
~~~

* Ejecutar packer:

~~~
packer build packer.pkr.hcl
~~~

## Como integrar packer + terraform

~~~
data "aws_ami" "web_ami" {
  most_recent = true

  filter {
    name   = "name"
    values = ["web-ami-*"]
  }

  owners = ["self"]
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.web_ami.id
  instance_type = "t3.micro"
}
~~~