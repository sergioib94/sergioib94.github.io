---
layout: post
title: "Active Directory"
date: 2021-05-23T15:28:17+02:00
categories: [Sistemas, Apuntes]
excerpt: "Active Directory es un servicio de directorio que almacena objetos de datos en su entorno de red local. El servicio registra datos en los usuarios, dispositivos, aplicaciones, grupos, y dispositivos en una estructura jerárquica."
---

### **¿Que es?** ###

Active Directory es un servicio de directorio que almacena objetos de datos en su entorno de red local. El servicio registra datos en los usuarios, dispositivos, aplicaciones, grupos, y dispositivos en una estructura jerárquica.

La estructura jerárquica de Active Directory facilita la localización y administración de los recursos de la red desde un único punto. En esencia, Active Directory actúa como un directorio telefónico para su red, por lo que puede buscar y administrar dispositivos fácilmente.

**Bosque**

Es el nivel más alto de organizacion en active directory. Un bosque es un grupo de dominios, cuando múltiples árboles se agrupan juntos se convierten en un bosque.

**Árbol**

El árbol es una entidad con un solo dominio o grupo de objetos seguido por dominios secundarios. Los distintos árboles en un bosque se conectan entre sí a través de relaciones de confianza, permitiendo compartir información entre dominios de manera automática (la confianza entre los distintos dominios se hara de forma automatica) que permite que los distintos dominios compartan la información.

**Dominios**

Un dominio de Active Directory es un contenedor lógico utilizado para administrar usuarios, grupos y computadoras entre otros objetos.

Todos estos objetos son contenidos en una partición específica dentro de la base de datos de Active Directory (ADDS).

**Unidad Organizativa**

Las unidades organizativas (OU) son contenedores de Active Diretory dentro de un dominio con los que podemos agrupar para organizar multitud de objetos de active directory como pueden ser: usuarios de dominios, grupos de dominios, equipos e incluso otras unidades organizativas.

![jerarquia active directory](/images/Active-Directory/jerarquia.png)


| **Elemento**  | **Descripción** | **Ejemplo** |
|--------------|----------------|------------|
| **Bosque**   | Grupo de uno o más dominios que comparten un esquema y configuración. | `Empresa.com` y `Filial.empresa.com` forman parte del mismo bosque. |
| **Árbol**    | Conjunto de dominios organizados jerárquicamente dentro de un bosque. | `ventas.empresa.com`, `soporte.empresa.com` son parte del mismo árbol. |
| **Dominio**  | Contenedor lógico que administra objetos como usuarios y equipos. | `dominio.local` |
| **Unidad Organizativa (OU)** | Contenedor dentro de un dominio que agrupa objetos y facilita la gestión. | `Usuarios`, `Equipos`, `Grupos` |


### Instalacion (En windows server 2016) ###

1. Nos dirigimos al Administrador de Servidor o Server Manager y hacemos clic en Agregar roles o características.

![agregar roles](/images/Active-Directory/ws-1.png)

2. En la ventana inicial hacemos clic en siguiente y elegimos la opción de la Instalación basada en roles.

![](/images/images/Active-Directory/ws-2.png)

3. Hacemos clic en siguiente y elegimos el servidor donde queremos instalar nuestro rol de AD DS.

![](/images/Active-Directory/ws-3.png)

4. Hacemos clic en siguiente y elegimos el rol solicitado (Servicios de dominio de Active Directory), agregamos las características.

![](/images/Active-Directory/ws-4.png)

5. Hacemos clic en siguiente seleccionamos las características y clic en siguiente y se desplegarán las caracteristicas que se van a instalar.
       
6. Hacemos clic en siguiente y comenzamos con la instalacion.

![](/images/Active-Directory/ws-6.png)
       
7. Una vez instalado nuestro rol de Active Directory reiniciamos el servidor para aplicar los cambios. Antes de iniciar nuestro asistente de AD DS debemos promover nuestro servidor a controlador de dominio.
       
8. Para promover el servidor a DC nos dirigimos a nuestro Administrador de Servidor y desplegamos el flag de información (la bandera) e indicamos la opcion "promover este servidor a controlador de dominio".
       
Hacemos clic en esta opción y se desplegará el asistente para configuración de servicios de dominio de Directorio Activo.
       
Veremos que contamos con 3 opciones de configuración:

* Agregar un controlador de dominio a un dominio existente:
* Agregar un nuevo dominio a un bosque existente:
* Agregar un nuevo bosque:

En nuestro caso elegiremos la opción Agregar un nuevo bosque, elegiremos el nombre para nuestro domino y damos clic en Siguiente.

![](/images/Active-Directory/ws-8.png)

9. Después que el sistema valide si el nombre de dominio es válido, se desplegarán las opciones del controlador de dominio, donde contamos con algunas opciones muy importantes que debemos tener en cuenta a nivel de funcionalidad de nuestro servidor. 

El nivel funcional que se indique debe ser siempre el más bajo de la red, es decir, en mi caso el servidor con Active Directory cuenta con windows server 2012 por lo que el nivel funcional tanto de dominio como de bosque, será de windows 2012, sin embargo si en nuestra red contamos con algun otro servidor con windows server 2008 por ejemplo, el nivel funcional se debe de establecer en windows server 2008.

![](/images/Active-Directory/ws-10.png)

10. En la siguiente ventana tenemos las opciones de DNS.

![](/images/Active-Directory/ws-11.png)
       
11. Hacemos clic en siguiente, y veremos el nombre de NETBIOS asignado por el sistema, nosotros decidimos si lo cambiamos o dejamos ése por defecto.

![](/images/Active-Directory/ws-12.png)
       
12. Clic en Siguiente, se desplegará la ventana informativa de ubicación de la base de datos de AD DS.

![](/images/Active-Directory/ws-13.png)
       
13. Clic en Siguiente, a continuación se desplegará una ventana informativa con el proceso a realizar, si notamos en la parte inferior podemos realizar este mismo procedimiento usando Powershell, Windows Server nos da la opción de ver y copiar el script.

![](/images/Active-Directory/ws-14.png)
       
14. Hacemos clic en siguiente, y Windows Server realizará una validación para que todos los requisitos de instalación estén correctos y así poder comenzar la instalación.

![](/images/Active-Directory/ws-15.png)
       
15. Hacemos clic en Instalar para iniciar el proceso de promover nuestro servidor a controlador de dominio.
       
16. El sistema se reiniciará para guardar la configuración y veremos en el panel del Administrador del Servidor que ya contamos con las opciones relacionadas al Directorio Activo.
       
En caso de que necesitemos borrar un controlador de dominio de nuestra estructura de red, debemos seguir los siguientes pasos:

1. Entramos al menú Administrar y elegimos "Quitar roles y funciones".

2. Se desplegará la ventana informativa, Hacemos clic en Siguiente

3. Seleccionamos el servidor donde tenemos instalado el rol de AD DS

4. En la ventana de Roles de servidor seleccionamos la opción Servicios de dominio de directorio activo (debe quedar desactivada), quitamos las características de AD DS.

5. Hacemos clic en siguiente, seleccionamos las características que deseemos eliminar y hacemos clic en siguiente, se mostrará un resumen de la tarea que estamos por ejecutar y hacemos clic en Quitar.

## Creación y administración de usuarios y equipos ##

Podemos crear un usuario a través de diferentes herramientas como lo son: Los asistentes de la consola de AD DS, el comando DSADD.EXE, PowerShell entre otros, en nuestro ejemplo usaremos el asistente de AD DS. Para ello vamos a realizar los siguientes pasos:

* Ingresamos al administrador del servidor, elegimos en el menú Herramientas la opción "Centro de administración de Active Directory".

* Se desplegará la consola del centro de administración de AD.

* Seleccionamos nuestro servidor en el panel lateral izquierdo podremos ver que se despliegan una serie de opciones, como por ejemplo, equipos, usuarios, sistema, dispositivos TPM entre otros.

* En el panel lateral derecho, en la parte inferior veremos que se abren las opciones referentes al objeto Users.

Allí podremos elegir lo que deseemos crear, usuarios, equipos, grupos, etc. Elegimos Usuario y podremos ver cómo cambia la estructura de creación comparada con versiones anteriores (a nivel de apariencia).

![](/images/Active-Directory/ad-3.png)

Una vez tengamos los cambios necesarios en el perfil del usuario damos clic en Aceptar para guardar dicha configuración.

![](/images/Active-Directory/ad-5.png)

Si deseamos crear nuestros usuarios o equipos a través de cmd, podemos ejecutar el comando DCA.MSC o dirigirnos al menú Herramientas y elegir la opción Usuarios y equipos de Active Directory.

El mismo procedimiento realizamos para la creación de cualquier otro objeto en nuestro Directorio Activo, equipos, OUs, etc. Por ejemplo para la creación de un equipo nos dirigimos al menú inferior derecho del Centro de administración de Active Directory y elegimos Nuevo / Equipo.

En la ventana desplegada ingresamos información del equipo, así mismo indicamos a que dominio se va a incluir dicho equipo y para guardar los cambios damos clic en Aceptar.

![](/images/Active-Directory/ad-4.png)

En el centro de administración de Active Directory podemos gestionar otras funciones de nuestro rol, en el panel lateral derecho podemos encontrar lo siguiente:

* Cambiar el controlador de dominio: nos da la posibilidad de modificar nuestro DC.

* Elevar el nivel funcional del bosque: nos permite elevar la funcionalidad del bosque de nuestro servidor.

* Elevar el nivel funcional del dominio: da la posibilidad de elevar la funcionalidad de nuestro dominio.

* Habilitar la papelera de reciclaje: permite recuperar objetos eliminados en AD

### **Creación y administración de OUs (unidades organizacioneales)** ###

Dentro de nuestro dominios podemos crear Unidades Organizacionales para tener un control más específico de los usuarios u objetos, así mismo podemos crear diferentes perfiles para cada OU. 

Para ello abrimos el Centro de administración de Active Directory desde el menú Herramientas y elegiremos del panel lateral derecho la opción Nuevo / Unidad Organizativa.

Allí debemos especificar el nombre de la OU (en este caso usemos Pruebas) y podemos agregar comentarios y en la opción superior derecha Crear en: podemos definir en qué parte de nuestro Árbol vamos a crear dicha OU.

Podríamos incluir Pruebas dentro de la OU:

* Ingresamos los datos en la ventana del Centro de administración:

![](/images/Active-Directory/ad-6.png)

* Podremos ver que nuestra OU Pruebas ha sido creada correctamente dentro de nuestro árbol:

![](/images/Active-Directory/ad-7.png)

## **Tareas Active Directory** ##

* #### **Crear cuentas de usuario** ####

Esta vez crearemos un usuario de forma distinta al creado anteriormente. Esta vez entramos en el administrador del servidor y accedemos a las herramientas, pero esta vez no elegiremos la opcion de configuracion de administracion de active directory, sino que elegiremos la opcion de usuarios y equipos de active directory.

Una vez estemos en la ventana de usuarios y equipos de active directory podremos crear un usuario haciendo clic derecho en cualquier lugar de la ventana y eligiendo la opción "nuevo" y despues la opcion de "usuario". Por ejemplo en mi caso si quiero crear un usuario dentro de mi dominio de pruebas lo que haria seria hacer clic en el nombre de mi dominio para que al crear el usuario, se crease el usuario dentro del dominio. Ej:

![](/images/Active-Directory/usuario1.png)

![](/images/Active-Directory/usuario2.png)

Cuando se nos abra la ventana para crearnos el usuarios e introduzcamos los datos, tendremos que ponerle una contraseña (la contraseña que se pone incialmente suele ser una contraseña temporal) aunque tendremos varias opciones de configuracion de la cuenta:

![](/images/Active-Directory/usuario3.png)

* La primera opción que encontramos es la que nos permite que el usuario cambie la contraseña por la que el quiera al loguearse ya que la contraseña con la que el admin creo su cuenta seria temporal y de un solo uso.

* La segunda opción es para que el usuario no pueda cambiar la contraseña aunque esta expire, por lo que solo el admin tendra autoridad para cambiarla.

* La tercera opción hace que las contraseñas no expiren.

* La ultima opción que encontramos es para indicar que la cuenta del usuario esta deshabilitada, por ejemplo si estamos en una empresa y ese empleado a dejado el trabajo.

Una vez creados los usuario lo siguiente será agregar dichos usuarios a los grupos apropiados en caso de que sea necesario.


| **Opción** | **Descripción** |
|------------|----------------|
| **El usuario debe cambiar la contraseña al iniciar sesión** | Se usa para forzar el cambio en el primer inicio de sesión. |
| **El usuario no puede cambiar la contraseña** | Solo un administrador podrá modificarla. |
| **La contraseña nunca expira** | Se usa en cuentas de servicio o equipos sin usuarios. |
| **La cuenta está deshabilitada** | Se usa cuando un empleado deja la empresa. |


* #### **Crear grupos** ####

Cuando un usuario inicia sesión en el dominio, Active Directory crea un token o una especie de identidad que indica automáticamente en que grupos está incluido este usuario; Un grupo puede crearse para fines distintos, por ejemplo, para acceder a ciertas rutas, para poder imprimir, para que le lleguen determinados correos etc.

Hacemos clic en la raíz de nuestro dominio, en mi caso el dominio Practicas y haciendo clic derecho elegimos la opción "nuevo" y despues la opción "grupo". Una vez que se nos abra la ventana para crear el grupo tendremos que asignarle un nombre así como elegir el ambito y el tipo de grupo que será. Ej:

![](/images/Active-Directory/grupos1.png)

Los ámbitos de grupos son los sigientes: 

* **Dominio Local**

Es el grupo más restrictivo ya que solo será accesible por usuarios que esten en el mismo dominio.
 
* **Global**

En este caso el grupo global permite que el grupo sea accesible por cuelaquier dominio siempre y cuando esten dentro del mismo bosque.

* **Universal**

Este es el tipo menos restrictivo ya que permite el acceso a cualquier dominio de cualquier bosque, es decir acceso a todo el mundo.

Por otro lado tenemos dos tipos de grupos:
    
* Distribución: Son creados básicamente para el envío de información a una o más personas.
* Seguridad: Son creados para garantizar el acceso a los recursos de la organización (permitir/restringir acceso a archivos otorgandoles permisos a usuarios concretos).

En este ejemplo para tener mejor organizados los grupos, he creado una Unidad Organizativa (OU), llamada grupo donde estan alojados varios grupos (como si fuese una empresa real):

![](/images/Active-Directory/grupos2.png)

![](/images/Active-Directory/grupos3.png)


| **Tipo de Grupo** | **Descripción** | **Ejemplo de uso** |
|------------------|----------------|--------------------|
| **Grupo de Seguridad** | Se usa para asignar permisos de acceso a recursos. | Acceso a carpetas compartidas o permisos en aplicaciones. |
| **Grupo de Distribución** | Se usa para enviar correos electrónicos a múltiples usuarios. | Grupo de correo para empleados de un departamento. |


* #### **Agregar usuarios a grupos** ####

Para ello hacemos clic en el usuario que se haya creado y abrimos las propiedades del usuario. Una vez se nos habra la ventana de propiedades, vamos a la pestaña "miembro de" y hacemos clic en agregar.

Después de agregar tendremos que indicar a que grupo se agregara el usuario, por ejemplo si mi dominio se llama Pruebas y en la empresa será uno de los administradores, seria Admin (para ello debe existir previamente el grupo que especifiquemos sino obviamente no podremos agregar ningun usuario). Ej:

![](/images/Active-Directory/ug1.png)

* #### **Restablecer cuentas de usuario** ####

Esta opción es bastante util ya que a la gente se les suele olvidar a menudo la contraseña, al quedarse la centa bloqueada, el admin puede restablecer la contraseña por defecto para que así el usuario pueda volver a tener acceso con otra contraseña.

En el caso de que la cuenta haya sido bloqueada por algun motivo y el suaurio no puede acceder a ella la solución seria bastante facil ya que lo unico que habria que hacer es abrir las propiedades de la cuenta de usuario y en la pestaña "cuenta/account" seleccionar la opción desbloquear cuenta.

Por otro lado en el caso de que la cuenta no este bloqueada sino que se haya olvidado la contraseña y haya que restablecerla, se haria lo siguiente:

* Comprobar primero que el usuario al que vamos a resyablecerle la contraseña es el usuario correcto ya que en entornos empresariales por ejemplo es probable encontrar a uno o varios empleados que se llamen igual (para ello podemos hacer uso de la busqueda de usuarios, contactos y grupos).
    
* Cuando estemos sehuro del usuario al que restablecer la contraseña, lo que hacemos es hacer clic en el y elegir la opción de restablecer contraseña lo cual nos permitirá indicar una contraseña nueva con la opción de que el usuario deba cambiarla una vez logeado.

* #### **Eliminacion de cuenta de usuario** ####

Basicamente la eliminacion de una cuenta de usuario es batante simple ya que basta con hacer clic en el usuario y elegir la opcion de eliminar cuenta.

* #### **Configurar ficheros compartidos** ####

Hacemos clic en la raíz de nuestro dominio, en mi caso el dominio Practicas y haciendo clic derecho elegimos la opción "nuevo" y despues la opción "objeto".

Empezamos poniendole un nombre a la carpeta compartida y luego pasamos a indicar la ruta de la carpeta a esta carpeta podemos añadirle los permisos necesarios para que solo un grupo del dominio pueda accedes a ella por ejemplo.