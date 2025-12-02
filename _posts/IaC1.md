---
title: "IaC con Terraform: arquitectura multicloud"
date: 2025-11-26T13:16:00+02:00
categories: [Apuntes, Sistemas, Terraform]
excerpt: "IaC (Infrastructure as Code) es la práctica de gestionar y aprovisionar la infraestructura mediante archivos de configuración legibles y versionables, en lugar de hacerlo manualmente. Esto permite automatizar despliegues, mejorar la reproducibilidad, evitar errores humanos y mantener un control de versiones sobre toda la infraestructura."
card_image: /assets/images/cards/terraform.png
---

# Introducción

IaC (Infrastructure as Code) es la práctica de gestionar y aprovisionar la infraestructura mediante archivos de configuración legibles y versionables, en lugar de hacerlo manualmente. Esto permite automatizar despliegues, mejorar la reproducibilidad, evitar errores humanos y mantener un control de versiones sobre toda la infraestructura.

Terraform es una herramienta para construir, combinar y poner en marcha de manera segura y eficiente la infraestructura. desde servidores físicos a contenedores hasta productos Saas como Kubernetes. Terraform es capaz de crear y componer todos los componentes necesarios para ejecutar cualquier servicio o aplicación utilizando la API de cada proveedor para desplegar los servicios.

Instalación de Terraform

Para poder instalar Terraform en nuestra maquina local, buscaremos en nuestro navegador la url del sitio web de Terraform [sitio oficial terraform](https://developer.hashicorp.com/terraform/install) y seleccionamos el sistema operativo donde queramos instalarlo y lo descargamos.

A modo de buenas practicas seria importante veriicar la instalacion con:

~~~
terraform version
~~~

# Definición de proveedores

Los proveedores son una extracción lógica de una API las cuales son responsables de comprender las interacciones de la api y exponer los recursos. Las configuraciones del proveedor deben declararse en el modulo raíz de su proyecto, es recomendable nombrar el fichero de configuración de los proveedores como "providers.tf" para que sea fácilmente identificable.

Hay proveedores que necesitan configuración extra para poder configurarse, en el caso de necesitar información de dichos proveedores para su configuración podemos acceder a la url [proveedores](https://registry.terraform.io/namespaces/hashicorp) ahi encontraremos información de todos los proveedores disponibles en Terraform. Por ejemplo, si queremos usar el proveedor AWS entramos en la url anterior y accedemos a la información de AWS para después acceder a la opción "use provider" donde podremos ver el código base para la configuración de este proveedor.

* Configuración de proveedor AWS

~~~
terraform {
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "6.23.0"
        }
    }
}

provider "aws" {
    #opciones de configuración para aws
}
~~~

Una vez tengamos nuestro fichero de configuración preparado, ejecutando el comando Terraform init que instalara localmente lo indicado en la configuración.

* Configuración de proveedor Azure

~~~
terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "4.54.0"
    }
  }
}

provider "azurerm" {
  # opciones de configuración para azure
}
~~~

* Configuración de proveedor Google Cloud

~~~
terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "7.12.0"
    }
  }
}

provider "google" {
  # opciones de configuración para google
}
~~~

* Kubernetes y TLS

En este caso vamos a incluir la configuración de Kubernetes y TLS dentro del fichero de configuración de aws indicado anteriormente.

~~~
terraform {
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "6.23.0"
        }

        kubernetes = {
            source = "hashicorp/kubernetes"
            version = "2.21.0"
        }

        tls = "" {
            source = "hashicorp/tls"
            version = "4.0.4"
        }
    }
}

provider "aws" {
    #opciones de configuración para aws
}

provider "kubernetes" {
    #opciones de configuración para kubernetes
}

provider "tls" {
    #opciones de configuración para tls
}
~~~

Buenas prácticas:

* Mantener las versiones de proveedores fijas para garantizar estabilidad.
* Separar la configuración de los proveedores en un archivo providers.tf.

# Variables en Terraform

## Variables de entrada y salida

Las variables son una manera de definir valores reutilizables controlados de forma centralizada. La información de las variables de Terraform se guarda independientemente de los planes de implementación, lo que hace que los valores sean fáciles de leer y editar. Dependiendo del uso de estas variables de Terraform, podemos clasificarlas en variables de entrada o variables de salida.

* Variables de entrada: se utilizan para definir valores que configuran su infraestructura. Estas variables se pueden usar una y otra vez.

* Variables de salida: se utilizan para obtener información sobre la infraestructura después de la implementación. Esto es util para mostrar información sobre las direcciones IP, para conectarnos a algún servidor o mostrar los IDs de los componentes.

Formas de declarar las variables de entrada:

* Declarándolas dentro de un fichero de configuración llamado "variables.tf" por ejemplo. Dentro de este fichero podemos definir cada variable utilizando el bloque denominado "variable". Ejemplo:

~~~
variable "nombre_variable" {
    description = "breve comentario sobre el uso de la variable"
    type = tipo de variable #realmente no es necesario ya que terraform identifica el tipo según el valor que se asigne
    default = valor por defecto
}
~~~

* Variables por linea de comando: estas variables deben de haber sido definidas previamente. Ejemplos: 

Por ejemplo para indicar la variable para especificar la region, usaríamos

~~~
terraform apply -var region="eu-west-1"
~~~

Si tenemos varias variables que indicar, para no usar "-var" para cada variable podemos tener las variables definidas en un fichero y después usar la opción "-var-file".

~~~
terraform apply -var-file "nombre de fichero variable"
~~~

Al usar las variables a través de la linea de comandos, puede ser util hace uso de los outputs, esto nos permitirá visualizar el contenido de nuestras variables. Para usar los outputs primero crearemos un fichero. Ejemplo de output:

~~~
output "valor-variable-proyecto" {
    value = var.nombre-proyecto
}
~~~

Esto al ejecutar apply nos mostrara en la salida el valor de la variable, en este caso el nombre del proyecto.

Formas de declarar variables de salida:

* Haciendo uso de los outputs anteriormente mencionados, estas variables de salida deben estar todas definidas en el fichero output de forma que al estar todas centralizadas emn el fichero, se facilita la gestión de la información.

Estructura de un output (despliegue de recursos):

~~~
output "nombre de salida" {     # titulo a mostrar en pantalla
    value = nombre-api-proveedor.nombre-recurso.atributo
}
~~~

Estructura de un output (visualizar variables):

~~~
output "nombre de salida" {
    value = var.nombre-variable
}
~~~

Estructura de un output (consultar información de infraestructura):

~~~
output "nombre de salida" {
    value = data.nombre-api-proveedor.nombre-recurso.atributo
}
~~~

## Variables de ambiente

Podemos establecer variables sensibles en su variable de entorno con el prefijo tf_bar, evitando la necesidad de guardarlas en un archivo. Sintaxis para exportar una variable en Terraform: 

~~~
export TF_VAR_nombre-variable = "valor"
~~~

Por ejemplo podemos tener en el fichero variable.tf, la siguiente variable declarada:

~~~
variable "ambiente" {}
~~~

En windows por ejemplo para colocar una variable como variable de ambiente podemos ejecutar en la terminal "$env:TF_VAR_ambiente="staging"" (en el caso de ser un sistema Linux en lugar de $env se usaría export).

## Variables de tipo cadena

Estas variables permiten definir una secuencia de caracteres Unicode para representar un texto. para definir cadenas usamos string. Sintaxis para definir un string:

~~~
variable "vpc {
    description = "vpc"
    type = string
}
~~~

Esta configuración seria la que tenemos en variables.tf, por otra parte en el fichero terraform.tfvars añadiríamos la siguiente linea para asignar le valor a la variable:

~~~
vpc = "10.10.0.0/0"
~~~

En este caso como el valor es de tipo string, el valor va entre comillas dobles. Por ultimo para comprobar que todo funciona correctamente podemos hacer uso del output.

## Variables de tipo numéricos

Hacemos uso de number para definir valores numéricos, pueden ser tanto enteros como fraccionarios. Ejemplo: 

~~~
variable "puesrto-ssh" {
    descripcion = "puerto ssh"
    type = number
}
~~~

Luego en nuestro fichero terraform.tfvars asignamos el valor numérico, en este caso añadiendo la siguiente linea:

~~~
puerto-ssh = 22
~~~

## Variables de tipo Booleano

Usamos Bool para valores booleanos donde podemos usar True o False. Ejemplo para indicar que el estado de resolución del DNS este o no activado:

~~~
variable "resolucion-dns" {
    descripcion = "Estado de resolución del DNS"
    type = bool
}
~~~

En terraform.tfvars indicaremos si la variable resolver-dns sera true o false.

## Variables tipo lista

Usamos list para listar una serie de valores. Cada elemento de la lista se identifica con un numero entero, empezando en 0. Estos valores que se almacenan en la lista pueden ser tipo string, number y bools, también es posible definir listas con tipos de datos mas complejos como por ejemplo listas de listas, listas de objetos o listas de mapeo. Por ejemplo de lista de cadenas:

~~~
variable "subred-priv" {
    description = "lista de subredes privadas"
    type = list(string)
    default []
}
~~~

En terraform.tfvars definimos los valores de subred-priv:

~~~
subred-priv = ["10.0.10.0/24", "10.0.20.0/24"]
~~~

## Variables de tipo mapeo

map permite definir un una lista clave-valor, con el propósito de que los items de la lista puedan ser referenciadas por la clave definida.

Buenas prácticas:

* Mantener las variables centralizadas en variables.tf.
* Usar terraform.tfvars o -var-file para valores específicos de entornos.
* Evitar hardcodear credenciales o valores sensibles.

# Preparación de usuarios AWS, Azure y GPC para Terraform

## Creación de usuario en AWS para conectar con Terraform

Para crear un usuario de WS tenemos que tener primero una cuenta aws, una vez tenemos nuestra cuenta creada, accedemos y buscamos el servicio IAM, una vez dentro en el menu de la izquierda seleccionado la opción de usuario dentro de "administración del acceso", a continuación seleccionamos la opción crear usuario y se nos abrirá una pantalla que nos pedirá información para el usuario.

Al administrar las políticas de permisos para el usuario tendremos que asegurarnos de tener permiso "AdministratorAccess" (permiso de administrador). Por ultimo le damos a crear usuario.

Una vez que tengamos el usuario creado lo primero que tendremos que hacer con el sera abrir la sección de "credenciales de seguridad" donde tendremos la opción de clave de acceso, donde seleccionaremos crear clave con la opción de "servicio de terceros" (opción para herramientas como Terraform).

## Conexión de Terraform con la nube AWS

Para poder realizar esta conexión, vamos ha hacer uso del fichero de configuración del provider AWS pero añadiendo las lineas de configuración de forma que el fichero quede completo de la siguiente forma:

~~~
terraform {
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "6.23.0"
        }
    }
}

provider "aws" {
    region = "${var.region}"         
    access_key = "${var.access-key}"
    secret_key = "${var.secret_key}"
}
~~~

Estos tres atributos que se añaden para configurar esa conexión serian atributos fijos, es decir, siempre tienen que tener ese mismo nombre y siempre serán necesario poner los 3.

* region: corresponderá a la region/zona horaria del usuario
* access_key: contraseña de tu usuario
* secret key: clave que pusimos en la sección credenciales de seguridad

A modo de buenas practicas lo mas recomendable es que estas opciones anteriores se configuren haciendo uso de variables para poder encapsular estos valores y hacer que el código sea reutilizable.

## Creación de usuario en Azure para conectar con Terraform

Para la creación del usuario en azure, al igual que en AWS tenemos que tener previamente creando una cuenta de usuario. Una vez tengamos nuestra cuenta, para crear el usuario tendremos que buscar el servicio de azure active directory y después le daríamos a la opción "agregar", al agregar nos aparecerán 4 opciones: usuario, grupo, aplicación empresarial y registro de aplicación, la que necesitaríamos seria la opción registro de aplicación.

Definimos un nombre para nuestra aplicación por ejemplo "Terraform-az", en la sección tipo de cuentas compatibles tendremos que asegurarnos de que este marcada la opción "solo cuentas de este directorio (solo default directory: inquilino único)" y registramos para crearla.

Cuando ya tengamos registrada nuestra aplicación nos aparecerá una pantalla con varios datos, con los que nos tendremos que quedar sera con el ID de aplicación (cliente) y el ID de directorio (inquilino) ya que ambos serán necesarios para establecer la conexión de Terraform con azure.

En esa misma pantalla donde se nos indican los IDs, seleccionamos la opción "agregar un certificado o secreto", en la pestaña secretos de los expedientes tendremos que añadir un nuevo secreto de cliente, para ello pondremos una descripción y definimos la fecha de expiración y por ultimo agregamos. De este secreto que acabamos de crear tendremos que quedarnos con el "valor y con el ID secreto".

## Conexión de Terraform con Azure

Para poder realizar la conexión de Terraform a azure, usaremos el fichero de azure en providers.tf para completar la configuración.

~~~
terraform {
  required_providers {
    azurerm = {
      source = "hashicorp/azurerm"
      version = "4.54.0"
    }
  }
}

provider "azurerm" {
  features {}
  client_id = "${var.id-cliente}"
  tenant_id = "${var.id-tenant}"
  client_secret = "${var.secreto-cliente}"
  subscription_id = "${var.id-subscription}"
}
~~~

* features: Es un parámetro obligatorio que suele declararse vacío, permite habilitar funcionalidades avanzadas del provider si es necesario, pero si solo quieres una conexión básica, basta con dejarlo vacío.
* client_id: id de la aplicación registrada en azure que Terraform usara para autentificarse. Representa la "identidad" de Terraform dentro de azure.
* tenant_id: es el id del directorio de azure donde esta registrada la aplicación, permite que Terraform sepa en que tenant debe autentificarse.
* client_secret: es el secreto o contraseña de la aplicación registrada en azure, se genera al crear la aplicación o un secret en azure
* subscription_id: id de la suscripción de azure donde Terraform va a crear recursos.

Al igual que en el ejemplo con AWS, se usaran variables para que el código sea reutilizable.

## Creación de usuario en Google Cloud para conectar con Terraform

Para la creación del usuario, lo primero que haremos al acceder a la cuenta de Google sera acceder a la sección "seleccionar proyecto" y dentro de esa sección acceder a la opción crear nuevo proyecto.

Una vez creado el proyecto, podremos seleccionarlo y entre los servicios del proyecto buscaremos el servicio IAM. En el menu de la izquierda dentro del servicio IAM, veremos la opción de "cuentas de servicio", seleccionamos esta opción y creamos una cuenta de servicio nueva. A la hora de crear esta cuenta se nos pedirán algunos datos como el nombre de la cuenta, el id de la cuenta (por defecto Google pone en el id el mismo nombre que se le dio a la cuenta) y una breve descripción.

También tendremos que asignarle un rol a la cuenta, en este caso asignaríamos el rol de propietario (la asignación del rol dependerá del uso que se le vaya a dar a Google cloud).

Por ultimo nos faltaría agregar una clave en la sección "clave" la podemos crear seleccionando para ello que la clave sea tipo JSON y cuando ya tengamos la clave, tendremos que habilitar el servicio "cloud resource manager api" para que fuese posible conectarnos desde Terraform.
 
## Conexión de Terraform con Google Cloud

Para poder realizar la conexión de Terraform a Google cloud, usaremos el fichero de Google en providers.tf para completar la configuración.

~~~
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.12.0"
    }
  }
}

provider "google" {
  project     = "${var.project_id}"
  region      = "${var.region}"
  credentials = file(var.credentials_file)
}
~~~

* project: id del proyecto google cloud.
* region: region por defecto de los recursos.
* credentials: ruta al fichero JSON de la cuenta de servicio.