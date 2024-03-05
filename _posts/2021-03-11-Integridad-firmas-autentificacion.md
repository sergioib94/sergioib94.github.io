---
title: "Integridad, firmas y autentificacion"
date: 2021-03-11T16:00:38+01:00
categories: [Seguridad]
excerpt: "En esta apartado mediante un conjunto de tareas trabajaremos temas de seguridad como las firmas electronicas usando gpg, correos seguros usando thunderbird/evolution, integridad de archivos y autentificacion con ssh."
---

## **Introduccion** ##

En esta apartado mediante un conjunto de tareas trabajaremos temas de seguridad como las firmas electronicas usando gpg, correos seguros usando thunderbird/evolution, integridad de archivos y autentificacion con ssh.

### **Firmas electrónicas** ###

* Para trabajar con una firma electronica, empezaremos mandando un documento y la firma electrónica del mismo a un compañero. Una vez recibida, verificaremos la firma que se ha recibido.

Creamos el fichero firmado:

~~~
sergioib@debian-sergio:~/Descargas$ gpg --output doc.sig --sign Triggers_I.ppt
~~~

Verificacion de la firma de documento con compañero Lora:

~~~
sergioib@debian-sergio:~/Descargas$ gpg --output lora --decrypt documentolora.pdf.sig
gpg: Firmado el mié 14 oct 2020 13:37:44 CEST
gpg:                usando RSA clave 9233303D1F5495739A6D2CB4636AE9EBCB7E3294
gpg: Firma correcta de "Manuel Lora Román <manuelloraroman@gmail.com>" [desconocido]
gpg: ATENCIÓN: ¡Esta clave no está certificada por una firma de confianza!
gpg:          No hay indicios de que la firma pertenezca al propietario.
Huellas dactilares de la clave primaria: 9233 303D 1F54 9573 9A6D  2CB4 636A E9EB CB7E 3294
~~~

* ¿Qué significa el mensaje que aparece en el momento de verificar la firma?

~~~
gpg: Firma correcta de "Pepe D <josedom24@gmail.com>" [desconocido]
 gpg: ATENCIÓN: ¡Esta clave no está certificada por una firma de confianza!
 gpg:          No hay indicios de que la firma pertenezca al propietario.
 Huellas dactilares de la clave primaria: E8DD 5DA9 3B88 F08A DA1D  26BF 5141 3DDB 0C99 55FC
~~~

Significa que aunque la firma este bien al no estar certificada por una firma de confianza, es posible que la persona que nos mande el mensaje no sea la misma con la que queremos contactar, que no sea de confianza. 

* Vamos a crear un anillo de confianza entre los miembros de nuestra clase, para ello nuestra clave pública debe estar en un servidor de claves.

* Te debes bajar al menos tres claves públicas de compañeros y firmamos estas claves.

Proceso de importación de claves:

~~~
Clave de Juanan:

	gpg --keyserver keyserver.ubuntu.com --recv-key 9987B52D (fingerprint)

Clave Celia:

	gpg --keyserver pgp.rediris.es --recv-key 08950F41
	
Clave Alejandro:

sergioib@debian-sergio:~/Descargas$ gpg --import alejandrogut.asc
gpg: key C3B291882C4EE5DF: 1 firma no comprobada por falta de una clave
gpg: clave C3B291882C4EE5DF: clave pública "Alejandro Gutierrez Valencia <tojandro@gmail.com>" importada
gpg: Cantidad total procesada: 1
gpg:               importadas: 1
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: nivel: 0  validez:   3  firmada:   3  confianza: 0-, 0q, 0n, 0m, 0f, 3u
gpg: nivel: 1  validez:   3  firmada:   1  confianza: 3-, 0q, 0n, 0m, 0f, 0u
gpg: siguiente comprobación de base de datos de confianza el: 2020-11-07
~~~

Proceso de firma:

~~~
Juanan:

gpg --sign-key 9987B52D

Celia:

gpg --sign-key 08950F41

Alejandro:

sergioib@debian-sergio:~/Descargas$ gpg --sign-key tojandro@gmail.com

pub  rsa3072/C3B291882C4EE5DF
     creado: 2020-10-08  caduca: 2020-11-07  uso: SC  
     confianza: desconocido   validez: no definido
sub  rsa3072/3C5DBE21F6961E37
     creado: 2020-10-08  caduca: 2020-11-07  uso: E   
[no definida] (1). Alejandro Gutierrez Valencia <tojandro@gmail.com>


pub  rsa3072/C3B291882C4EE5DF
     creado: 2020-10-08  caduca: 2020-11-07  uso: SC  
     confianza: desconocido   validez: no definido
Huella clave primaria: 443D 661D 9AAF 3ABA EDCA  93E1 C3B2 9188 2C4E E5DF

     Alejandro Gutierrez Valencia <tojandro@gmail.com>

Esta clave expirará el 2020-11-07.
¿Está realmente seguro de querer firmar esta clave
con su clave: "sergio ibañez <sergio_hd_sony@hotmail.com>" (CFCF1D130D5A52C5)?

¿Firmar de verdad? (s/N) s
~~~

En el caso de Alejandro, como a sido la ultima clave que he firmado, he puesto la salida completa del comando, con juanan y celia, solo he puesto el comando.

* Una vez que firmada la clave se la devolvemos a su dueño, para que otra persona se la firme.

~~~
Juanan:

gpg --export -a Juan Antonio Reifs > juanan.asc

Celia:

gpg --export -a celia garcia > celia.asc

Alejandro:

gpg --export -a Alejandro Gutierrez Valencia > alefirmado.asc

~~~

* Muestra las firmas que tiene tu clave pública.

Volvemos a bajarnos nuestra clave una vez que varias personas la hayan firmado y mostramos el resultado.

~~~
sergioib@debian-sergio:~$ gpg --list-sign
/home/sergioib/.gnupg/pubring.kbx
---------------------------------
pub   rsa3072 2020-10-06 [SC] [caduca: 2022-10-06]
      547D6FBDF49CD2340F1D5DB6CFCF1D130D5A52C5
uid        [  absoluta ] sergio ibañez <sergio_hd_sony@hotmail.com>
sig 3        CFCF1D130D5A52C5 2020-10-06  sergio ibañez <sergio_hd_sony@hotmail.com>
sig          4F54B5799987B52D 2020-10-28  Juan Antonio Reifs <initategnat9@gmail.com>
sig          7A01A1F808950F41 2020-11-04  celia garcia <cg.marquez95@gmail.com>
sig          C3B291882C4EE5DF 2020-11-06  Alejandro Gutierrez Valencia <tojandro@gmail.com>
sub   rsa3072 2020-10-06 [E] [caduca: 2022-10-06]
sig          CFCF1D130D5A52C5 2020-10-06  sergio ibañez <sergio_hd_sony@hotmail.com>
~~~

* Comprobamos que ya puedemos verificar sin “problemas” una firma recibida por una persona en la que confíamos.

~~~
sergioib@debian-sergio:~/Descargas$ gpg --output juanan --decrypt saludo.sig
gpg: Firmado el mar 10 nov 2020 08:53:41 CET
gpg:                usando RSA clave AD19812061DA946F8DA70E0C4F54B5799987B52D
gpg: Firma correcta de "Juan Antonio Reifs <initategnat9@gmail.com>" [total]
~~~

* Compruebamos que puedes verificar con confianza una firma de una persona en las que no confías, pero sin embargo si confía otra persona en la que tu tienes confianza total.

~~~
sergioib@debian-sergio:~/Descargas$ gpg --output verificacion_lora --decrypt documentolora.pdf.sig
El fichero 'verificacion_lora' ya existe. ¿Sobreescribir? (s/N) s
gpg: Firmado el mié 14 oct 2020 13:37:44 CEST
gpg:                usando RSA clave 9233303D1F5495739A6D2CB4636AE9EBCB7E3294
gpg: comprobando base de datos de confianza
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: nivel: 0  validez:   4  firmada:   2  confianza: 0-, 0q, 0n, 0m, 0f, 4u
gpg: nivel: 1  validez:   2  firmada:   0  confianza: 2-, 0q, 0n, 0m, 0f, 0u
gpg: siguiente comprobación de base de datos de confianza el: 2020-11-10
gpg: Firma correcta de "Manuel Lora Román <manuelloraroman@gmail.com>" [desconocido]
gpg: ATENCIÓN: ¡Esta clave no está certificada por una firma de confianza!
gpg:          No hay indicios de que la firma pertenezca al propietario.
Huellas dactilares de la clave primaria: 9233 303D 1F54 9573 9A6D  2CB4 636A E9EB CB7E 3294
~~~

### **Correo thunderbird/evolution** ###

Ahora vamos a configurar nuestro cliente de correo electrónico para poder mandar correos cifrados, para ello:

* Configuramos el cliente de correo evolution con nuestra cuenta de correo habitual.

* Añade a la cuenta las opciones de seguridad para poder enviar correos firmados con tu clave privada o cifrar los mensajes para otros destinatarios.

![](/static/integracion-firmas-autentificacion/seguridad_correo.png)

* Envíamos y recibimos varios mensajes de los compañeros y compruebamos el funcionamiento adecuado de GPG.

Prueba de correo de Celia a mi:

![prueba de correo 1](/static/integracion-firmas-autentificacion/prueb_correo.png)

Prueba de correo de mi a Celia:

![prueba de correo 2](/static/integracion-firmas-autentificacion/pruebcorreo1.png)

### **Integridad de ficheros** ###

Vamos a descargarnos la ISO de debian, y posteriormente vamos a comprobar su integridad. Puedes encontrar la ISO en la dirección: https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/. 

* Para validar el contenido de la imagen CD, solo asegúrese de usar la herramienta apropiada para sumas de verificación. Para cada versión publicada existen archivos de suma de comprobación con algoritmos fuertes (SHA256 y SHA512); debería usar las herramientas sha256sum o sha512sum para trabajar con ellos.

* Verificamos que el contenido del hash que hemos utilizado no ha sido manipulado, usando la firma digital que encontrarás en el repositorio. Puedes encontrar una guía para realizarlo en este artículo: How to verify an authenticity of downloaded Debian ISO images.

Para ello nos descargamos los ficheros necesarios en un mismo directorio. Para verificar la firma haremos lo siguiente:

~~~
wget https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA256SUMS.sign
wget https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA256SUMS

wget https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA512SUMS.sign
wget https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/SHA512SUMS
~~~

Comprobamos quien a firmado los ficheros de firma de comprobación para de esta forma saber así su ID de clave publica:

~~~
sergioib@debian-sergio:~/Descargas$ gpg --verify SHA512SUMS.sign 
gpg: asumiendo que los datos firmados están en 'SHA512SUMS'
gpg: Firmado el dom 27 sep 2020 02:24:23 CEST
gpg:                usando RSA clave DF9B9C49EAA9298432589D76DA87E80D6294BE9B
gpg: Imposible comprobar la firma: No public key
~~~

Una vez que conocemos la ID de la persona que ha firmado estos ficheros, nos descargamos su clave del servidor de claves de debian, ya que tendremos que tener la clave en nuestro sistema para mas adelante comprobar la firma.

En este caso probamos a verificar como ejemplo el SHA512.

~~~
sergioib@debian-sergio:~/Descargas$ gpg --keyserver keyring.debian.org --recv DF9B9C49EAA9298432589D76DA87E80D6294BE9B
gpg: clave DA87E80D6294BE9B: clave pública "Debian CD signing key <debian-cd@lists.debian.org>" importada
gpg: Cantidad total procesada: 1
gpg:               importadas: 1
~~~

Cuando ya tengamos la clave en nuestro equipo, ya podremos verificar la firma:

~~~
sergioib@debian-sergio:~/Descargas$ gpg --verify SHA512SUMS.sign SHA512SUMS
gpg: Firmado el dom 27 sep 2020 02:24:23 CEST
gpg:                usando RSA clave DF9B9C49EAA9298432589D76DA87E80D6294BE9B
gpg: comprobando base de datos de confianza
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: nivel: 0  validez:   3  firmada:   3  confianza: 0-, 0q, 0n, 0m, 0f, 3u
gpg: nivel: 1  validez:   3  firmada:   0  confianza: 3-, 0q, 0n, 0m, 0f, 0u
gpg: siguiente comprobación de base de datos de confianza el: 2020-11-10
gpg: Firma correcta de "Debian CD signing key <debian-cd@lists.debian.org>" [desconocido]
gpg: ATENCIÓN: ¡Esta clave no está certificada por una firma de confianza!
gpg:          No hay indicios de que la firma pertenezca al propietario.
Huellas dactilares de la clave primaria: DF9B 9C49 EAA9 2984 3258  9D76 DA87 E80D 6294 BE9B
~~~

### **Identidad y autenticidad (apt source)** ###

Cuando nos instalamos un paquete en nuestra distribución linux tenemos que asegurarnos que ese paquete es legítimo. Para conseguir este objetivo se utiliza criptografía asimétrica, y en el caso de Debian a este sistema se llama apt secure. Esto lo debemos tener en cuenta al utilizar los repositorios oficiales. Cuando añadamos nuevos repositorios tendremos que añadir las firmas necesarias para confiar en que los paquetes son legítimos y no han sido modificados.

* Busca información sobre apt secure y responde las siguientes preguntas:

* ¿Qué software utiliza apt secure para realizar la criptografía asimétrica? 

Utiliza gpg

* ¿Para que sirve el comando apt-key? ¿Qué muestra el comando apt-key list? Sirve para ver una lista de claves usadas por el comando apt. Apt-key list sirve para listar las claves dichas anteriormente.

Apt-key es una herramienta que sirve para gestionar las claves que apt usa para identificar paquetes.

* En que fichero se guarda el anillo de claves que guarda la herramienta apt-key?

Las claves se guardan en /etc/apt/trusted.gpg.d/

* ¿Qué contiene el archivo Release de un repositorio de paquetes?. ¿Y el archivo Release.gpg?. Puedes ver estos archivos en el repositorio http://ftp.debian.org/debian/dists/Debian10.1/. Estos archivos se descargan cuando hacemos un apt update.

Release → es el archivo usado para firmar el repositorio 
Release.gpg → en el fichero se guardan las firmas del fichero release

* Explica el proceso por el cual el sistema nos asegura que los ficheros que estamos descargando son legítimos.

* Añade de forma correcta el repositorio de virtualbox añadiendo la clave pública de virtualbox como se indica en la documentación.

Paso1: Añadir la clave publica de oracle

~~~
root@debian-sergio:~# wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | apt-key add -
~~~

Paso2: configuracion de /etc/apt/sources.list

~~~
sudo add-apt-repository "deb http://download.virtualbox.org/virtualbox/debian buster contrib"
~~~

Paso3: se hace un update

Paso4: se instala virtualbox.

### **Autentificación SSH** ###

* Explica los pasos que se producen entre el cliente y el servidor para que el protocolo cifre la información que se transmite? ¿Para qué se utiliza la criptografía simétrica? ¿Y la asimétrica?

Una vez que se establece conexión entre cliente y servidor se utiliza un algoritmo para generar un hash único a partir de los datos transmitidos. Si se manipulan los datos, el valor del hash también cambia automáticamente, lo que permite al destinatario reconocer si los datos han sido modificados por terceros.

La criptografía simétrica se utiliza para cifrar y descifrar haciendo uso de una única clave entre emisor y receptor. 

La criptografía asimétrica se utiliza al igual que la simétrica para cifrar y descifrar, pero haciendo uso de un par de claves publica y privada de forma que emisor y receptor intercambien claves publicas y usen sus claves privadas para cifrar (privada del emisor) y descifrar (privada del receptor).

* Explica los dos métodos principales de autentificación: por contraseña y utilizando un par de claves públicas y privadas.

Autentificación por contraseña → hace uso de la encriptación asimétrica haciendo uso de una contraseña para conectarse a un usuario por ssh

Autentificación por par de claves → esta forma hace uso de encriptación asimétrica, en este caso se utiliza un par de claves, en nuestro equipo se mantendrá la clave publica, mientras que la clave publica la mandaremos al equipo remoto para mas tarde poder conectarnos por ssh.

* En el cliente para que sirve el contenido que se guarda en el fichero ~/.ssh/know_hosts?

Este fichero contiene las claves de host DSA de los servidores SSH a los que se accede mediante el usuario. Este fichero es muy importante para asegurarse de que el cliente SHH está conectado al servidor SSH correcto.

* ¿Qué significa este mensaje que aparece la primera vez que nos conectamos a un servidor?

~~~
$ ssh debian@172.22.200.74
The authenticity of host '172.22.200.74 (172.22.200.74)' can't be established.
ECDSA key fingerprint is SHA256:7ZoNZPCbQTnDso1meVSNoKszn38ZwUI4i6saebbfL4M.
Are you sure you want to continue connecting (yes/no)? 
~~~

La primera vez, al no tener la clave publica en la maquina a la que nos queremos conectar, nos salta este mensaje ya que puede tratarse de un servidor poco seguro.

* En ocasiones cuando estamos trabajando en el cloud, y reutilizamos una ip flotante nos aparece este mensaje:

~~~
$ ssh debian@172.22.200.74
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the ECDSA key sent by the remote host is
SHA256:W05RrybmcnJxD3fbwJOgSNNWATkVftsQl7EzfeKJgNc.
Please contact your system administrator.
Add correct host key in /home/jose/.ssh/known_hosts to get rid of this message.
Offending ECDSA key in /home/jose/.ssh/known_hosts:103
    remove with:
    ssh-keygen -f "/home/jose/.ssh/known_hosts" -R "172.22.200.74"
ECDSA host key for 172.22.200.74 has changed and you have requested strict checking.
~~~

* ¿Qué guardamos y para qué sirve el fichero en el servidor ~/.ssh/authorized_keys?

En el fichero se guardan una lista de claves públicas "autorizadas". Si un usuario que se conecta puede comprobar que conoce la clave privada que corresponde a cualquiera de las claves públicas, entonces será autenticada.