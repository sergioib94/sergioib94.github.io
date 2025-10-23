---
title: "Instalacion y configuracion básica OpenLDAP"
date: 2021-03-12T14:11:19+01:00
categories: [Sistemas]
excerpt: "Haciendo uso de una de las maquinas virtuales creada y configurada en el post modificaciones del excenario openstack, se instalara y configurara un servidor ldap."
---

### **Introducción** ###

En la maquina Freston de Openstack creada y configurada en la practica "modificaciones del escenario openstack", se hara una instalacion y configuracion basica de un servidor Ldap utilizando como base el nombre DNS asignado.

**¿Que es LDAP?**

Se trata de un conjunto de protocolos de licencia abierta que son utilizados para acceder a la información que está almacenada de forma centralizada en una red. Este protocolo se utiliza a nivel de aplicación para acceder a los servicios de directorio remoto.

Un directorio remoto es un conjunto de objetos que están organizados de forma jerárquica, tales como nombre claves direcciones, etc. Estos objetos estarán disponibles por una serie de cliente conectados mediante una red, normalmente interna o LAN, y proporcionarán las identidades y permisos para esos usuarios que los utilicen.

### **Instalación Ldap** ###

~~~
sudo apt install slapd
~~~

Por defecto nuestro DN (nombre de dominio) será dc=gonzalonazareno,dc=org por lo que se cambiara la configuración básica de slapd de forma que coja como dn el nombre completo de nuestro servidor, que en mi caso es freston-sergio.gonzalonazareno.org, este cambio lo hacemos ejecutando:

~~~
sudo dpkg-reconfigure -plow slapd
~~~

Indicando primero cual sera el nuevo nombre de dominio que usara ldap y después cambiando el nombre de la organización a IES Gonzalo Nazareno.

Crearemos dos unidades organizativas, una para personas y otra para grupos

Para crear estas unidades, necesitamos un fichero.ldif por lo que creamos uno en el directorio home, en este caso llamado ou.ldif con el siguiente contenido:

~~~
dn: ou=People,dc=freston-sergio,dc=gonzalonazareno,dc=org
ou: People
objectClass: organizationalUnit

dn: ou=Group,dc=freston-sergio,dc=gonzalonazareno,dc=org
ou: Group
objectClass: organizationalUnit
~~~

Una vez creado el fichero con la configuración necesaria, lo añadimos a nuestro árbol ldap ejecutando el ldapadd.

~~~
ldapadd -x -D "cn=admin,dc=freston-sergio,dc=gonzalonazareno,dc=org" -W -f ou.ldif
~~~

Nuestro servidor ldap quedara de la siguiente forma:

~~~
debian@freston:~$ sudo slapcat
dn: dc=freston-sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: dcObject
objectClass: organization
o: IES Gonzalo Nazareno
dc: freston-sergio
structuralObjectClass: organization
entryUUID: a394a590-d284-103a-9869-af259156f1d8
creatorsName: cn=admin,dc=freston-sergio,dc=gonzalonazareno,dc=org
createTimestamp: 20201214181924Z
entryCSN: 20201214181924.616104Z#000000#000#000000
modifiersName: cn=admin,dc=freston-sergio,dc=gonzalonazareno,dc=org
modifyTimestamp: 20201214181924Z

dn: cn=admin,dc=freston-sergio,dc=gonzalonazareno,dc=org
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: admin
description: LDAP administrator
userPassword:: e1NTSEF9Mm4zR1hIZnB5TklMOTJseExobGZvcjFwdG5BNVpWVjY=
structuralObjectClass: organizationalRole
entryUUID: a39b1fa6-d284-103a-986a-af259156f1d8
creatorsName: cn=admin,dc=freston-sergio,dc=gonzalonazareno,dc=org
createTimestamp: 20201214181924Z
entryCSN: 20201214181924.658632Z#000000#000#000000
modifiersName: cn=admin,dc=freston-sergio,dc=gonzalonazareno,dc=org
modifyTimestamp: 20201214181924Z

dn: ou=People,dc=freston-sergio,dc=gonzalonazareno,dc=org
ou: People
objectClass: organizationalUnit
structuralObjectClass: organizationalUnit
entryUUID: 9bd8b4a4-d289-103a-9037-499b5284f496
creatorsName: cn=admin,dc=freston-sergio,dc=gonzalonazareno,dc=org
createTimestamp: 20201214185459Z
entryCSN: 20201214185459.124066Z#000000#000#000000
modifiersName: cn=admin,dc=freston-sergio,dc=gonzalonazareno,dc=org
modifyTimestamp: 20201214185459Z

dn: ou=Group,dc=freston-sergio,dc=gonzalonazareno,dc=org
ou: Group
objectClass: organizationalUnit
structuralObjectClass: organizationalUnit
entryUUID: 9bdf0b42-d289-103a-9038-499b5284f496
creatorsName: cn=admin,dc=freston-sergio,dc=gonzalonazareno,dc=org
createTimestamp: 20201214185459Z
entryCSN: 20201214185459.165633Z#000000#000#000000
modifiersName: cn=admin,dc=freston-sergio,dc=gonzalonazareno,dc=org
modifyTimestamp: 20201214185459Z
~~~