---
title: "Introducción a Terraform (I): conceptos y primeros pasos"
date: 2025-07-12T13:19:00+02:00
categories: [DevOps, Infraestructura, Terraform]
excerpt: "Terraform es una de las herramientas más populares de **Infraestructura como Código (IaC)**. Permite **definir, desplegar y gestionar infraestructura** (máquinas virtuales, redes, contenedores, bases de datos, etc.) **de forma declarativa y reproducible**."
card_image: /assets/images/cards/terraform.png
---

## Introducción ##

Terraform es una de las herramientas más populares de **Infraestructura como Código (IaC)**. Permite **definir, desplegar y gestionar infraestructura** (máquinas virtuales, redes, contenedores, bases de datos, etc.) **de forma declarativa y reproducible**.  
En este post aprenderás **desde cero** qué es Terraform, cómo funciona y cómo crear tu **primer despliegue práctico usando Docker y Nginx**.

## ¿Qué es Terraform? ##

Terraform es una herramienta desarrollada por **HashiCorp** que permite definir la infraestructura con código.  
En lugar de crear manualmente servidores o redes, describes todo en archivos `.tf` (Terraform) y Terraform se encarga del resto.

Terraform se integra con cientos de plataformas gracias a los **providers**: AWS, Azure, Google Cloud, VMware, Docker, GitHub, etc.

### ¿Cuando usar terraform? ###

Terraform brilla especialmente en ciertos escenarios donde la infraestructura necesita ser automatizada, replicable y coherente. A continuación, te explico los casos más comunes donde su uso resulta más recomendable:

* Cuando necesitas desplegar infraestructuras reproducibles: puedes crear, destruir y volver a crear entornos idénticos (por ejemplo, desarrollo, pruebas y producción) sin depender de configuraciones manuales.

* Cuando trabajas con multiples proveedores de nube: Terraform es multicloud, por lo que puedes administrar recursos en AWS, Azure, Google Cloud o incluso en entornos locales de forma unificada.

* Cuando quieres automatizar despliegues de forma controlada: puedes revisar un plan detallado de lo que va a modificar, lo que reduce errores y facilita auditorías o revisiones por parte del equipo.

* Cuando deseas mantener el control de versiones de la estructura: Al estar basada en archivos de texto (.tf), toda la configuración puede almacenarse en Git u otro sistema de control de versiones.

* Cuando se gestionan estructuras complejas o a gran escala: Terraform facilita la organización de grandes despliegues mediante módulos reutilizables, lo que permite mantener un código limpio, organizado y fácilmente escalable.

* Cuando se quiere integrar con otras herramientas DevOps: Terraform se integra perfectamente con herramientas como Ansible, Docker, Jenkins, GitLab CI/CD o Kubernetes, formando parte de pipelines de despliegue automatizado. Por ejemplo, puedes usar Terraform para crear servidores y luego usar Ansible para configurar su software interno.

### Ejemplo de definición simple:

~~~
resource "docker_container" "nginx" {
  image = "nginx:latest"
  name  = "mi_nginx"
  ports {
    internal = 80
    external = 8080
  }
}
~~~

Con esto, Terraform entiende que quieres ejecutar un contenedor Nginx con el puerto 8080 expuesto.

### Ventajas y desventajas de usar Terraform ###

**Ventajas:**

* **Reproducibilidad:** Tu infraestructura es código; puedes recrearla con precisión.

* **Auditable y versionable:** Historial completo en Git del estado y cambios. Cuenta con un fichero de estados, por ejemplo en CloudFormation si se hace un cambio manual, este no nota el cambio. Terraform por otra parte una vez creada la infraestructura se crea un fichero de estado y una vez que se realiza algun cambio se puede comparar lo que esta declarado en el estado con lo creado en el proveedor.

* **Multi-cloud:** Un único lenguaje/herramienta para múltiples proveedores. Permite crear estructuras hibridas, por ejemplo cuando se usa CloudFormation, esta orientado a crear recursos en Amazon, sin embargo con terraform podriamos crear una estructura en la que parte de la aplicacion estuviese en Amazon y la CDN podria ser externa, no tendriamos porque usar tambien la de Amazon.

* **Planificación previa:** terraform plan muestra cambios antes de aplicarlos, reduciendo sorpresas.

* **Modularidad:** Módulos reutilizables facilitan la organización y escalabilidad.

* **Ecosistema maduro:** Muchos providers, módulos en el registry y herramientas complementarias.

**Desventajas:**

* **Curva de aprendizaje:** Conceptos como state, backends y módulos requieren tiempo para dominarse.

* **State sensible:** El terraform.tfstate puede contener información sensible; hay que gestionarlo y cifrarlo correctamente.

* **No es de configuración interna:** Terraform es ideal para “infraestructura”; para la configuración detallada dentro de servidores (instalar paquetes, configurar servicios) otras herramientas (Ansible) suelen ser más adecuadas.

* **Conflictos en equipos:** Si no se usa backend con locking, pueden ocurrir corrupciones de state por cambios concurrentes.

* **Cambios destructivos:** Si no revisas el plan, puedes provocar eliminaciones involuntarias.

* **Verbosidad en infra compleja:** Proyectos muy grandes requieren buena organización para no volverse inmanejables.

* Al ser un proyecto opensource terraform va detras del resto de proveedores, es decir, si por ejemplo amazon saca un nuevo servicio, este servicio nuevo siempre va a tener antes la integracion en CloudFormation que en terraform.

### Conceptos básicos ###

Algunos conceptos basicos que debemos conocer antes de trabajar con terraform son:

* Provider: Plugin que permite a Terraform comunicarse con una plataforma (AWS, Docker, etc.)
* Resource: Es el bloque fundamental: define algo que Terraform crea o gestiona (contenedor, red, VM…)
* Variable: Valores dinámicos que puedes definir fuera del código (para reutilizar configuraciones)
* Output: Datos de salida que Terraform puede mostrar tras aplicar los cambios (por ejemplo, una IP)
* State: Archivo terraform.tfstate donde Terraform guarda el estado actual de los recursos
* Backend: Dónde se almacena el estado (por defecto local, pero puede ser remoto como S3 o Terraform Cloud)

**Flujo de trabajo en Terraform**

Terraform sigue un ciclo muy claro de comandos que debes memorizar una vez que se define la estructura en el fichero main.tf:

* terraform init: Inicializa el entorno y descarga los providers necesarios
* terraform plan: Muestra los cambios que se van a aplicar
* terraform apply: Crea o actualiza los recursos
* terraform destroy: Elimina todos los recursos definidos

### Ejemplo practico: Despliegue de contenedor Nginx con Terraform y docker ###

Vamos a crear un proyecto simple para desplegar Nginx usando Terraform y el provider de Docker.
Este ejemplo no requiere cuenta en la nube — solo necesitas Docker y Terraform instalados en tu máquina.

**Estructura del proyecto**

~~~
terraform-docker-demo/
├─ main.tf
├─ variables.tf
├─ outputs.tf
└─ terraform.tfvars
~~~

**Instalacion de Terraform**

Para la instalacion, accedemos a la pagina oficial [Terraform](https://www.terraform.io/downloads.html) de terraform donde podremos encontrar los binarios para poder descargarlos segun el sistema y arquitectura que usemos.

En el caso de linux por ejemplo se descargara un fichero zip que tendremos que descomprimir usando el comando unzip. Una vez descomprimido podremos empezar a usar terraform ejecutando simplemente el comando terraform en la terminal.

**Configuración de main.tf**

Este es el núcleo del proyecto. Aquí se definen:

* Qué providers usa Terraform
* Qué recursos se van a crear
* (Opcionalmente) configuraciones adicionales

~~~
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.2"
    }
  }
}

provider "docker" {}

resource "docker_image" "nginx" {
  name = "nginx:latest"
}

resource "docker_container" "nginx" {
  image = docker_image.nginx.latest
  name  = "nginx_terraform"
  ports {
    internal = 80
    external = var.external_port
  }
}
~~~

**Explicación de main.tf**

* Bloque terraform: indica la configuración global del proyecto. En este caso, se define qué provider (plugin) es necesario para trabajar.
    * source: indica el origen del provider.
    * version: fija la version para garantizar la compatibilidad.

* Bloque provider "docker": inicializa el provider Docker. Aquí podrías definir parámetros (como credenciales o conexión a un host remoto), pero al estar en local, queda vacío {}.

* Bloque resource "docker_image" "nginx": Cada bloque resource indica algo que Terraform debe crear o gestionar. Aquí se declara que se usará una imagen de Docker llamada nginx:latest. En el caso de que la imagen no exista localmente, terraform la descargara automaticamente.

* Bloque resource "docker_container" "nginx": Define el contenedor basado en la imagen anterior.
    * image: referencia al recurso docker_image.nginx.latest (ya creado arriba).
    * name: nombre del contenedor.
    * ports: mapea el puerto interno 80 (Nginx) con el puerto externo especificado por la variable var.external_port.

**Configuracion de variables.tf**

Este archivo define valores personalizables. Así no tienes que cambiar el código de main.tf cada vez que quieras modificar algo.

~~~
variable "external_port" {
  description = "Puerto expuesto en el host"
  type        = number
  default     = 8080
}
~~~

**Explicacion de variables.tf**

* variable "external_port": Se indica el nombre de la variable.
* description: sirve para documentar su propósito.
* type: tipo de dato (string, number, bool, list, map…).
* default: valor por defecto (opcional).

Estas variables pueden sobrescribirse desde:

* El archivo terraform.tfvars
* La línea de comandos (-var)
* Variables de entorno (TF_VAR_...)

**Configuracion outputs.tf**

Aquí defines qué información mostrará Terraform al terminar el apply.

~~~
output "nginx_url" {
  value = "http://localhost:${var.external_port}"
}
~~~

Al aplicar el plan, Terraform mostrará:

~~~
Outputs:

nginx_url = "http://localhost:8080"
~~~

Esto es muy útil para mostrar IPs, URLs, IDs de recursos o contraseñas generadas.

### Ejecución del entorno ###

* Iniciamos el entorno

~~~
terraform init
~~~

* Validamos el entorno

~~~
terraform validate
~~~

* Planifica los cambios

~~~
terraform plan -out=tfplan
~~~

* Aplica la configuración

~~~
terraform apply tfplan
~~~

Terraform descargará la imagen de Nginx y lanzará el contenedor. Al terminar, verás una salida similar a:

~~~
Apply complete! Resources: 2 added, 0 changed, 0 destroyed.

Outputs:

nginx_url = "http://localhost:8080"
~~~

Una vez realizados los pasos anteriores, para comprobar que todo funciona correctamente debemos acceder a http://localhost:8080 y deberia mostrarse la pagina de inicio de Nginx

### Conclusión ###

Terraform te permite pasar de configurar servidores manualmente a desplegar infraestructura completa mediante código.
Con este ejemplo, ya conoces su flujo, estructura y forma de trabajar.