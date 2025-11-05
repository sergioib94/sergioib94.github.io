---
title: "Cifrado Asimétrico GPG Y Openssl"
date: 2021-03-11T09:15:13+01:00
categories: [Seguridad]
excerpt: "En el siguiente post a través de una serie de tareas se ira indicando como realizar un cifrado asimétrico haciendo uso de GPG y openssl."
card_image: /assets/images/cards/denian.png
---

### Introducción ###

En la criptografía asimétrica se utilizan dos claves: una pública (para cifrar) y otra privada (para descifrar). Este sistema garantiza la confidencialidad de la información incluso cuando se comparte la clave pública.
En este post veremos cómo generar y usar pares de claves con GPG (GNU Privacy Guard) y, al final, cómo realizar operaciones similares con OpenSSL.

### **Tarea 1: Generación de claves** ###

* Genera un par de claves (pública y privada). ¿En que directorio se guarda las claves de un usuario?

GPG permite generar un par de claves (pública y privada) que se almacenan en el directorio ~/.gnupg. A continuación, se muestra el proceso paso a paso:

~~~
gpg --gen-key
~~~

Se nos piden algunos datos como nombre y apellidos, correo y contraseña y una vez introducida la información, se ve que la clave se nos crea en un directorio oculto .gnupg

~~~
      gpg: clave CFCF1D130D5A52C5 marcada como de confianza absoluta
      gpg: creado el directorio '/home/sergioib/.gnupg/openpgp-revocs.d'
      gpg: certificado de revocación guardado como '/home/sergioib/.gnupg/openpgp-revocs.d/547D6FBDF49CD2340F1D5DB6CFCF1D130D5A52C5.rev'
      claves pública y secreta creadas y firmadas.
      pub   rsa3072 2020-10-06 [SC] [caduca: 2022-10-06]
            547D6FBDF49CD2340F1D5DB6CFCF1D130D5A52C5
      uid                      sergio ibañez <sergio_hd_sony@hotmail.com>
      sub   rsa3072 2020-10-06 [E] [caduca: 2022-10-06]
~~~

**Nota:** para crear claves con una duración específica, se usa --full-generate-key y se puede establecer la validez con parámetros como 1m (un mes), 1y (un año), etc.

* Lista las claves públicas que tienes en tu almacén de claves. Explica los distintos datos que nos muestra. ¿Cómo deberías haber generado las claves para indicar, por ejemplo, que tenga un 1 mes de validez?

~~~
sergioib@debian:~$ gpg --list-key
gpg: comprobando base de datos de confianza
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: nivel: 0  validez:   1  firmada:   0  confianza: 0-, 0q, 0n, 0m, 0f, 1u
gpg: siguiente comprobación de base de datos de confianza el: 2022-10-06
/home/sergioib/.gnupg/pubring.kbx
---------------------------------
pub   rsa3072 2020-10-06 [SC] [caduca: 2022-10-06]
      547D6FBDF49CD2340F1D5DB6CFCF1D130D5A52C5
uid        [  absoluta ] sergio ibañez <sergio_hd_sony@hotmail.com>
sub   rsa3072 2020-10-06 [E] [caduca: 2022-10-06]
~~~

Para que las claves durasen un mes se tendría que crear la clave ejecutando el comando gpg –full-generate-key indicando el tipo de clave deseada y la duración:

~~~
gpg (GnuPG) 2.2.12; Copyright (C) 2018 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Por favor seleccione tipo de clave deseado:
   (1) RSA y RSA (por defecto)
   (2) DSA y ElGamal
   (3) DSA (sólo firmar)
   (4) RSA (sólo firmar)
Su elección: 1
las claves RSA pueden tener entre 1024 y 4096 bits de longitud.
¿De qué tamaño quiere la clave? (3072) 4096
El tamaño requerido es de 4096 bits
Por favor, especifique el período de validez de la clave.
         0 = la clave nunca caduca
      <n>  = la clave caduca en n días
      <n>w = la clave caduca en n semanas
      <n>m = la clave caduca en n meses
      <n>y = la clave caduca en n años
¿Validez de la clave (0)? 1m
La clave caduca lun 09 nov 2020 09:53:39 CET
¿Es correcto? (s/n) s

GnuPG debe construir un ID de usuario para identificar su clave.

Nombre y apellidos: sergio iabañez
Dirección de correo electrónico: sergio_hd_sony@hotmail.com
Comentario: 
Está usando el juego de caracteres 'utf-8'.
Ha seleccionado este ID de usuario:
    "sergio iabañez <sergio_hd_sony@hotmail.com>"

¿Cambia (N)ombre, (C)omentario, (D)irección o (V)ale/(S)alir? v
Es necesario generar muchos bytes aleatorios. Es una buena idea realizar
alguna otra tarea (trabajar en otra ventana/consola, mover el ratón, usar
la red y los discos) durante la generación de números primos. Esto da al
generador de números aleatorios mayor oportunidad de recoger suficiente
entropía.
Es necesario generar muchos bytes aleatorios. Es una buena idea realizar
alguna otra tarea (trabajar en otra ventana/consola, mover el ratón, usar
la red y los discos) durante la generación de números primos. Esto da al
generador de números aleatorios mayor oportunidad de recoger suficiente
entropía.
gpg: clave D370C4C1866F1A64 marcada como de confianza absoluta
gpg: certificado de revocación guardado como '/home/sergioib/.gnupg/openpgp-revocs.d/AE3976FA2F04BE111FC7FDFDD370C4C1866F1A64.rev'
claves pública y secreta creadas y firmadas.

pub   rsa4096 2020-10-11 [SC] [caduca: 2020-11-10]
      AE3976FA2F04BE111FC7FDFDD370C4C1866F1A64
uid                      sergio iabañez <sergio_hd_sony@hotmail.com>
sub   rsa4096 2020-10-11 [E] [caduca: 2020-11-10]
~~~

* Lista las claves privadas de tu almacén de claves.

~~~
sergioib@debian:~$ gpg --list-secret-keys
gpg: comprobando base de datos de confianza
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: nivel: 0  validez:   3  firmada:   0  confianza: 0-, 0q, 0n, 0m, 0f, 3u
gpg: siguiente comprobación de base de datos de confianza el: 2020-11-10
/home/sergioib/.gnupg/pubring.kbx
---------------------------------
sec   rsa3072 2020-10-06 [SC] [caduca: 2022-10-06]
      547D6FBDF49CD2340F1D5DB6CFCF1D130D5A52C5
uid        [  absoluta ] sergio ibañez <sergio_hd_sony@hotmail.com>
ssb   rsa3072 2020-10-06 [E] [caduca: 2022-10-06]

sec   rsa4096 2020-10-11 [SC] [caduca: 2020-11-10]
      AE3976FA2F04BE111FC7FDFDD370C4C1866F1A64
uid        [  absoluta ] sergio iabañez <sergio_hd_sony@hotmail.com>
ssb   rsa4096 2020-10-11 [E] [caduca: 2020-11-10]
~~~

### **Tarea 2: Importar / exportar clave pública** ###

* Exporta tu clave pública en formato ASCII y guárdalo en un archivo nombre_apellido.asc y envíalo al compañero con el que vas a hacer esta práctica.

~~~
sergioib@debian:~$ gpg --export -a sergio ibañez > sergio_ibañez.asc
~~~

--export -a → exporta una clave en formato ASCII.

* Importa las claves públicas recibidas de vuestro compañero.

~~~
sergioib@debian:~$ gpg --import /home/sergioib/Descargas/Juan_Antonio_Reifs.asc 
gpg: clave 4263921B50A28F3C: clave pública "Juan Antonio Reifs <initiategnat9@gmail.com>" importada
gpg: Cantidad total procesada: 1
gpg:              importadas: 1
~~~

--import → importa una clave pública externa.

* Comprueba que las claves se han incluido correctamente en vuestro keyring.

~~~
ssergioib@debian:~$ gpg --list-keys
/home/sergioib/.gnupg/pubring.kbx
---------------------------------
pub   rsa3072 2020-10-06 [SC] [caduca: 2022-10-06]
      547D6FBDF49CD2340F1D5DB6CFCF1D130D5A52C5
uid        [  absoluta ] sergio ibañez <sergio_hd_sony@hotmail.com>
sub   rsa3072 2020-10-06 [E] [caduca: 2022-10-06]

sec   rsa4096 2020-10-11 [SC] [caduca: 2020-11-10]
      AE3976FA2F04BE111FC7FDFDD370C4C1866F1A64
uid        [  absoluta ] sergio iabañez <sergio_hd_sony@hotmail.com>
ssb   rsa4096 2020-10-11 [E] [caduca: 2020-11-10]

pub   rsa3072 2020-10-07 [SC] [caduca: 2022-10-07]
      5E5C8311F16A66DDEA19682B4263921B50A28F3C
uid        [desconocida] Juan Antonio Reifs <initiategnat9@gmail.com>
sub   rsa3072 2020-10-07 [E] [caduca: 2022-10-07]
~~~

--list-keys → muestra todas las claves disponibles en el almacén.

### **Tarea 3: Cifrado asimétrico con claves públicas** ##

* Cifraremos un archivo cualquiera y lo remitiremos por email a uno de nuestros compañeros que nos proporcionó su clave pública.

~~~
sergioib@debian:~$ gpg -e -u "sergio ibañez" -r "Juan Antonio Reifs" ficheroprueba 
gpg: 30EF1E1A3CD0955C: No hay seguridad de que esta clave pertenezca realmente
al usuario que se nombra

sub  rsa3072/30EF1E1A3CD0955C 2020-10-07 Juan Antonio Reifs <initiategnat9@gmail.com>
 Huella clave primaria: 51FB 86E1 DD5E D7C4 B50D  AC37 DBD6 9ECD 888B D164
      Huella de subclave: EFE3 F3FA EDC7 04AB 1B15  BB58 30EF 1E1A 3CD0 955C

No es seguro que la clave pertenezca a la persona que se nombra en el
identificador de usuario. Si *realmente* sabe lo que está haciendo,
puede contestar sí a la siguiente pregunta.

¿Usar esta clave de todas formas? (s/N) s
~~~

* Nuestro compañero, a su vez, nos remitirá un archivo cifrado para que nosotros lo descifremos.

~~~
sergioib@debian:~$ ls -l Descargas/ | grep .gpg
-rw-r--r-- 1 sergioib sergioib        505 oct  7 18:23 texto_cifrado.gpg
~~~

* Tanto nosotros como nuestro compañero comprobaremos que hemos podido descifrar los mensajes recibidos respectivamente.

~~~
sergioib@debian:~$ gpg -d texto_cifrado.gpg
gpg: cifrado con clave de 3072 bits RSA, ID 1D736BA23965AD7C, creada el 2020-10-06
      "sergio ibañez <sergio_hd_sony@hotmail.com>"
Esto es un mensaje de prueba
~~~

* Por último, enviaremos el documento cifrado a alguien que no estaba en la lista de destinatarios y comprobaremos que este usuario no podrá descifrar este archivo.

En este caso mi compañero (Manuel Lora) me mando un “fichero” o en este caso un paquete cifrado para que intentase descifrarlo, pero al no tener yo su clave publica, se ve que no es posible y da error.

~~~
sergioib@debian:~$ gpg -d atom-amd64.deb.gpg
gpg: cifrado con clave RSA, ID 85F2ABD7882FE7F6
gpg: descifrado fallido: No secret key
~~~

* Para terminar, indica los comandos necesarios para borrar las claves públicas y privadas que posees.

~~~
sergioib@debian:~$ gpg --delete-key Juan Antonio Reifs
gpg (GnuPG) 2.2.12; Copyright (C) 2018 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.


pub  rsa3072/DBD69ECD888BD164 2020-10-07 Juan Antonio Reifs <initiategnat9@gmail.com>

¿Eliminar esta clave del anillo? (s/N) s

pub  rsa4096/A909D4476EB509BD 2020-10-07 Juan Antonio Reifs ("Esta clave caduca el mes que viene") <initiategnat9@gmail.com>

¿Eliminar esta clave del anillo? (s/N) s
gpg: clave "Reifs" no encontrada: Not found
gpg: Reifs: delete key failed: Not found
~~~

### **Tarea 4: Exportar clave a un servidor público de claves PGP** ###

* Genera la clave de revocación de tu clave pública para utilizarla en caso de que haya problemas.

~~~
sergioib@debian:~$ gpg --gen-revoke "sergio ibañez"

sec rsa3072/CFCF1D130D5A52C5 2020-10-06 sergio ibañez <sergio_hd_sony@hotmail.com>

¿Crear un certificado de revocación para esta clave? (s/N) s
Por favor elija una razón para la revocación:
  0 = No se dio ninguna razón
  1 = La clave ha sido comprometida
  2 = La clave ha sido reemplazada
  3 = La clave ya no está en uso
  Q = Cancelar
(Probablemente quería seleccionar 1 aquí)
¿Su decisión? 0
Introduzca una descripción opcional; acábela con una línea vacía:
> 
Razón para la revocación: No se dio ninguna razón
(No se dió descripción)
¿Es correcto? (s/N) s
se fuerza salida con armadura ASCII.
-----BEGIN PGP PUBLIC KEY BLOCK-----
Comment: This is a revocation certificate

iQG2BCABCgAgFiEEVH1vvfSc0jQPHV22z88dEw1aUsUFAl9+64wCHQAACgkQz88d
Ew1aUsU10wv6A/Qlgxu0/BUeunkM2aDgDpeKkqruIUt3Eq6EoX77efu1tmSxb6+w
2Ry5lhBJrL3024xe3Zl1V6Bg2DOgFiCLNdo/7UPhxdHTOyoLnf6qcQ0Bnww1m3ZL
YAaI2b7F4Z/20mid4toBiSuuKKdoS3BuIsQsosZRxOfhO2Evh/KDeWxrXme4Rfxz
JSJRd5CsdMsnR/16+SJzWD4HKGF6t/2hpjxuv/weciqIR2PTC+d2kBfH7Z+da391
ZGakyR7Cp50AIRHrGSGwqlxDTZKrO9Y1nszivlnkn6mIJ5sWmDoIRQNeCZBE4q7c
ue2CNaAGKlxpoT7vrY7owU4/1E1pTBMUr6iAAFLGefgMxOGUDxJ3x4OrI5oWF87k
OE4rCU8spXC22w/TS630bQVOIwFP7E77mUfcyL7riQJ+Tc7En35Jtgd/f88iRWzx
9amJlhDKq4+QrrVwfPhp1siynUDRaybBzyQRBm0pZT9sqx1QHNYj+G9vNRBYk4vH
mJxiOAPtqpDv
=9kmu
-----END PGP PUBLIC KEY BLOCK-----
Certificado de revocación creado.

Por favor consérvelo en un medio que pueda esconder; si alguien consigue
acceso a este certificado puede usarlo para inutilizar su clave.
Es inteligente imprimir este certificado y guardarlo en otro lugar, por
si acaso su medio resulta imposible de leer. Pero precaución: ¡el sistema
de impresión de su máquina podría almacenar los datos y hacerlos accesibles
a otras personas!
~~~

* Exporta tu clave pública al servidor pgp.rediris.es

~~~
sergioib@debian:~$ gpg --keyserver pgp.rediris.es --send-key 547D6FBDF49CD2340F1D5DB6CFCF1D130D5A52C5
gpg: enviando clave CFCF1D130D5A52C5 a hkp://pgp.rediris.es
~~~

* Borra la clave pública de alguno de tus compañeros de clase e impórtala ahora del servidor público de rediris.

~~~
gpg --delete-key Juan Antonio Reifs
~~~

Una vez borrada tendremos que importarla pero para ello sera necesario ir a pgp.rediris.es y buscarla ya que para importarla en nuestro equipo tendremos que saber la ID de la clave, en el caso de mi compañero es D1DFA955. Una vez que sabemos su ID la importamos de la siguiente forma:

~~~
sergioib@debian:~$ gpg --keyserver pgp.rediris.es --recv-key D1DFA955
gpg: clave B07FA892D1DFA955: clave pública "Juan Antonio Reifs <initiategnat9@gmail.com>" importada
gpg: Cantidad total procesada: 1
gpg:               importadas: 1
~~~

### **Tarea 5: Cifrado asimétrico con openssl** ###

* Genera un par de claves (pública y privada).

~~~
sergioib@debian:~$ openssl genrsa -out clave.pem 4096
Generating RSA private key, 4096 bit long modulus (2 primes)
..............................................................................................................................................................................................................................++++
.............................................................++++
e is 65537 (0x010001))
~~~

Al igual que gpg con openssl genrsa crearemos el par de clave, para poder enviar la clave publica extraeremos la clave publica del fichero de la siguiente forma.

~~~
sergioib@debian:~$ openssl rsa -in clave.pem -out clve.pub.pem
writing RSA key
~~~

* Utilizando la clave pública cifra un fichero de texto y envíalo a tu compañero.

Lo primero sera crear un fichero para encriptar, en este caso openssl.txt y usando la clave publica extraída anteriormente ciframos el fichero como fichero.enc.

~~~
sergioib@debian:~$ openssl rsautl -encrypt -in openssl.txt -out fichero.enc -inkey clve.pub.pem
~~~

Si se intenta leer el fichero encriptado vemos que no se puede.

~~~
sergioib@debian:~$ cat fichero.enc 
,���	_�F�,�Y�ۖ/B�|^&C��ys�Qbp�0���DfZ��#��Yo
                                             _���U}s��
                                                      ���〗�)d���
��R#�/�Z=�7�Ha�r��K�Q:�Vҧ܆	!��k�9H��
                                         ��I�ɩ��oQLR�����F���shbg5�>��O�L/�kҬ�xQ��*����C#P:��)�^��誻��k�/gګ��cdAX��<iu|����s��>/��$�������LMl�Y澇v��k�RN����S��9kYgB��5��s�����+ί���Scө��ƌ:��^<�0։���AY�3��hKG�50E�ܺ4h�
   �w'yUm
?+D�C��G�&3d������$��+�4W��z]:-�i$�ȭ$��ʘ�F�:�[�l0�-�k��ɛ#6$�V���o���*�8����O��@��s�)�����~@�Z��%�Щwǒ	�"��	��-��8Ϥ�M
~~~

* Tu compañero te ha mandado un fichero cifrado, muestra el proceso para el descifrado.

~~~
openssl rsautl -decrypt -inkey clve.pub.pem -in fichero.enc -out desen.txt
~~~

En este caso a la hora de descifrarlo, el compañero usa la clave publica nuestra que debe tener y extrae el contenido del fichero cifrado en un nuevo fichero.txt en el que el mensaje ya puede leerse.

~~~
sergioib@debian:~$ cat desen.txt
se ha podido descifrar
~~~

### Conclusión ###

En este post hemos visto cómo crear y gestionar claves asimétricas con GPG, intercambiarlas con otros usuarios y realizar cifrados seguros.
Además, hemos comprobado cómo solo los destinatarios autorizados pueden descifrar los mensajes.
Finalmente, hemos mostrado brevemente cómo realizar estas operaciones con OpenSSL, otra herramienta fundamental para la seguridad en sistemas.