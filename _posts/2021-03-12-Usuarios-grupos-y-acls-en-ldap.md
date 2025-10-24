---
title: "Usuarios, grupos y ACLs en Ldap"
date: 2021-03-12T14:14:51+01:00
categories: [Sistemas]
excerpt: "En esta practica se realizaran una serie de tareas en las que se iran indicando como realizar distintas tareas en LDAP como pueden ser por ejemplo, creacion de usuarios, creacion de grupos, modificacion de datos o hacer uso de ACLS"
card_image: /assets/images/cards/debian.png
---

* Crea 10 usuarios con los nombres que prefieras en LDAP, esos usuarios deben ser objetos de los tipos posixAccount e inetOrgPerson. Estos usuarios tendrán un atributo userPassword.

Para crear estos usuarios, creamos un fichero .ldif llamado por ejemplo usuarios con el siguiente contenido:

~~~
dn: uid=sergio,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
cn: Sergio Ibañez
uid: sergio
uidNumber: 2000
gidNumber: 2000
homeDirectory: /home/sergio
loginShell: /bin/bash
userPassword: {SSHA}PkyDS12f+fo6sR3uHGsY25CvUjMrmrVy 
sn: ibañez

dn: uid=manuel,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
cn: Manuel Lora
uid: manuel
uidNumber: 2001
gidNumber: 2001
homeDirectory: /home/lora
loginShell: /bin/bash
userPassword: {SSHA}ODN7zIXBS0rDW+Uf9Z1J1/GUcBXhtrS/
sn: lora

dn: uid=juanan,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
cn: Juan Antonio
uid: juanan
uidNumber: 2002
gidNumber: 2002
homeDirectory: /home/juanan
loginShell: /bin/bash
userPassword: {SSHA}V+mrXKnbB/ReYwrdQ7Gh85ZQZw1A2iqs
sn: reifs

dn: uid=fran,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
cn: Fran Madueño
uid: fran
uidNumber: 2003
gidNumber: 2003
homeDirectory: /home/fran
loginShell: /bin/bash
userPassword: {SSHA}RnYnua1fD3L1UCc4arAfVrfNWrokHsoF
sn: madueño

dn: uid=alejandro,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
cn: Alejando Gutierrez
uid: alejandro
uidNumber: 2004
gidNumber: 2004
homeDirectory: /home/alejandro
loginShell: /bin/bash
userPassword: {SSHA}H4js7CR0IjdgRIYJFtHA7zkq7+9gWNff 
sn: gutierrez

dn: uid=calderon,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
cn: Jose Miguel
uid: calderon
uidNumber: 2005
gidNumber: 2005
homeDirectory: /home/calderon
loginShell: /bin/bash
userPassword: {SSHA}ioP7oyy5KXGXmTQE8sLajhSTPV0bUyVk
sn: calderon

dn: uid=adrian,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
cn: Adrian Jaramillo
uid: adrian
uidNumber: 2006
gidNumber: 2006
homeDirectory: /home/adrian
loginShell: /bin/bash
userPassword: {SSHA}jGxqVD3yK9yRm8qtWVuFW7du/I75p9Qv
sn: jaramillo

dn: uid=celia,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
cn: Celia Garcia
uid: celia
uidNumber: 2007
gidNumber: 2007
homeDirectory: /home/celia
loginShell: /bin/bash
userPassword: {SSHA}WQ8IgcfkrrAz5sNwfqsdJhBtNXHJ1OyQ
sn: garcia

dn: uid=alvaro,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
cn: Alvaro Vaca
uid: alvaro
uidNumber: 2008
gidNumber: 2008
homeDirectory: /home/alvaro
loginShell: /bin/bash
userPassword: {SSHA}W0XxEk1ojVDliy4jIN3IyZ4RVqFwiLxi 
sn: vaca

dn: uid=juanlu,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
cn: Juan Luis
uid: juanlu
uidNumber: 2009
gidNumber: 2009
homeDirectory: /home/juanlu
loginShell: /bin/bash
userPassword: {SSHA}u+yL9u8EiUlYVKHvsD+j+Ww7iOGaNOBW 
sn: millan
~~~

En este fichero, la estructura con la que se van a crear los usuarios es la misma:

Todos tendrán tanto un objectClass posixAccount como un inetOrgPerson ya que los pide el propio ejercicio ademas de un atributo userPasswdord que aunque no es obligatorio también se pide, esta password esta cifrada en formato SSHA usando el comando sudo slappassword.

Al tener el objectClass posixAccount, debemos poner ciertos atributos obligatorios para poner crear los usuarios como son por ejemplo:

* cn (commonName): nombre del usuario.

* uid (id del usuario): En este caso al contrario que con la uid del sistema no es un numero sino el propio nombre característico del usuario, esta uid numérica que identifica al usuario, en ldap se pone usando el atributo uidNumber.

* gidNumber: es el identificador de grupo. 

* homeDirectory: directorio que usara el usuario

Tanto uidNumbre como gidNumber, deben tener un numero bastante alejado del 1000 para que no haya conflicto con las uid de los usuarios del propio sistema, por lo que en este caso se pusieron por encima del 2000.

Se podrían poner mas atributos al usuario, pero inetOrgPerson no tiene atributos que sean obligatorios por lo que en este caso no se pondría ninguno.

Una vez creado el fichero, agregamos los nuevos usuarios a ldap:

~~~
debian@freston:~$ ldapadd -x -D cn=admin,dc=sergio,dc=gonzalonazareno,dc=org -W -f usuarios.ldif
Enter LDAP Password: 
adding new entry "uid=sergio,ou=People,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "uid=manuel,ou=People,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "uid=juanan,ou=People,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "uid=fran,ou=People,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "uid=alejandro,ou=People,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "uid=calderon,ou=People,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "uid=adrian,ou=People,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "uid=celia,ou=People,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "uid=alvaro,ou=People,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "uid=juanlu,ou=People,dc=sergio,dc=gonzalonazareno,dc=org"
~~~

* Crea 3 grupos en LDAP dentro de una unidad organizativa diferente que sean objetos del tipo groupOfNames. Estos grupos serán: comercial, almacén y admin

Ahora hacemos lo mismo pero con los grupos, creamos un fichero llamado grupos.ldif con la configuración de los 3 grupos necesarios y los añadimos.

Configuración del fichero grupos.ldif

~~~
dn: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: groupOfNames
cn: comercial
member:

dn: cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: groupOfNames
cn: almacen
member:

dn: cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: groupOfNames
cn: admin
member:
~~~

Básicamente les estamos poniendo nombre a los grupos a través del atributo "cn" y los estamos poniendo en la unidad organizativa Group con el objectClass groupOfNames.

Se añaden los grupos:

~~~
debian@freston:~$ ldapadd -x -D cn=admin,dc=sergio,dc=gonzalonazareno,dc=org -W -f grupos.ldif
Enter LDAP Password: 
adding new entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"
~~~

Ahora una vez añadidos los usuarios y los grupos, toca meter a dichos usuarios en los grupos, para ello, creamos un nuevo fichero.ldif indicando que usuario ira dentro de que grupo de la siguiente manera:

~~~
dn: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=sergio,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=calderon,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=manuel,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=adrian,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=juanan,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=juanan,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=celia,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=celia,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=fran,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=fran,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=alvaro,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=alvaro,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=alejandro,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

dn: cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
changetype:modify
add: member
member: uid=juanlu,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
~~~

De esta forma, haciendo uso de la uid (que en principio debe ser única para cada usuario), indicamos a que grupo se incluye cada usuario. Se añaden los cambios:

~~~
debian@freston:~$ ldapmodify -x -D cn=admin,dc=sergio,dc=gonzalonazareno,dc=org -W -f usuariosengrupos.ldif
Enter LDAP Password: 
modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"
~~~

Comprobamos que los usuarios han sido añadidos a los grupos correctamente:

~~~
debian@freston:~$ ldapsearch -x -h freston -b ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
# extended LDIF
#
# LDAPv3
# base <ou=Group,dc=sergio,dc=gonzalonazareno,dc=org> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# Group, sergio.gonzalonazareno.org
dn: ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
ou: Group
objectClass: organizationalUnit

# admin, Group, sergio.gonzalonazareno.org
dn: cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: groupOfNames
cn: admin
member:
member: uid=fran,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=alvaro,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=alejandro,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=juanlu,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

# almacen, Group, sergio.gonzalonazareno.org
dn: cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: groupOfNames
cn: almacen
member:
member: uid=manuel,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=adrian,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=juanan,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=celia,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

# comercial, Group, sergio.gonzalonazareno.org
dn: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
objectClass: top
objectClass: groupOfNames
cn: comercial
member:
member: uid=sergio,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=calderon,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=juanan,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=celia,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=fran,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
member: uid=alvaro,ou=People,dc=sergio,dc=gonzalonazareno,dc=org

# search result
search: 2
result: 0 Success

# numResponses: 5
# numEntries: 4
~~~

Se han añadido correctamente a los grupos.

* Modifica OpenLDAP apropiadamente para que se pueda obtener los grupos a los que pertenece cada usuario a través del atributo "memberOf".

Creamos tres ficheros.ldif para añadir los módulos necesarios para que aparezca el atributo memberOf. En el primer fichero llamado por ejemplo memberofconf.ldif para cargar el modulo memberof a la configuración:

~~~
dn: cn=module,cn=config
cn: module
objectClass: olcModuleList
objectclass: top
olcModuleLoad: memberof.la
olcModulePath: /usr/lib/ldap

dn: olcOverlay={0}memberof,olcDatabase={1}mdb,cn=config
objectClass: olcConfig
objectClass: olcMemberOf
objectClass: olcOverlayConfig
objectClass: top
olcOverlay: memberof
olcMemberOfDangling: ignore
olcMemberOfRefInt: TRUE
olcMemberOfGroupOC: groupOfNames
olcMemberOfMemberAD: member
olcMemberOfMemberOfAD: memberOf
~~~

En los otros dos ficheros se van a configurar la relación entre los objetos de grupos y usuarios de forma que no pierda coherencia en la configuración:

Fichero refint1.ldif:

~~~
dn: cn=module,cn=config
cn: module
objectclass: olcModuleList
objectclass: top
olcmoduleload: refint.la
olcmodulepath: /usr/lib/ldap

dn: olcOverlay={1}refint,olcDatabase={1}mdb,cn=config
objectClass: olcConfig
objectClass: olcOverlayConfig
objectClass: olcRefintConfig
objectClass: top
olcOverlay: {1}refint
olcRefintAttribute: memberof member manager owne
~~~

Fichero refint2.ldif:

~~~
dn: olcOverlay=memberof,olcDatabase={1}mdb,cn=config
objectClass: olcOverlayConfig
objectClass: olcMemberOf
olcOverlay: memberof
olcMemberOfRefint: TRUE
~~~

Cargamos los ficheros de configuración creados:

~~~
debian@freston:~$ sudo ldapadd -Q -Y EXTERNAL -H ldapi:/// -f memberofconf.ldif 
adding new entry "cn=module,cn=config"

adding new entry "olcOverlay={0}memberof,olcDatabase={1}mdb,cn=config"

debian@freston:~$ sudo ldapadd -Q -Y EXTERNAL -H ldapi:/// -f refint1.ldif
adding new entry "cn=module,cn=config"

adding new entry "olcOverlay={1}refint,olcDatabase={1}mdb,cn=config"
ldap_add: Other (e.g., implementation specific) error (80)
	additional info: olcRefintAttribute <owne>: attribute type undefined

debian@freston:~$ sudo ldapadd -Q -Y EXTERNAL -H ldapi:/// -f refint2.ldif
adding new entry "olcOverlay=memberof,olcDatabase={1}mdb,cn=config"
~~~

Para que los cambios se realicen sobre los grupos ya creados, se tendrán que eliminar los objetos creados y volverlos a crear:

~~~
debian@freston:~$ sudo ldapdelete -x -D "cn=admin,dc=sergio,dc=gonzalonazareno,dc=org" 'cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org' -W
Enter LDAP Password: 
debian@freston:~$ sudo ldapdelete -x -D "cn=admin,dc=sergio,dc=gonzalonazareno,dc=org" 'cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org' -W 
Enter LDAP Password: 
debian@freston:~$ sudo ldapdelete -x -D "cn=admin,dc=sergio,dc=gonzalonazareno,dc=org" 'cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org' -W 
Enter LDAP Password: 
~~~

Y se vuelve a añadir el fichero grupos.ldif y las modificaciones de los grupos, con la relación entre los grupos y los usuarios, que se había guardado en el fichero usuariosengrupos.ldif.

~~~
debian@freston:~$ ldapadd -x -D cn=admin,dc=sergio,dc=gonzalonazareno,dc=org -W -f grupos.ldif
Enter LDAP Password: 
adding new entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

adding new entry "cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

debian@freston:~$ ldapmodify -x -D cn=admin,dc=sergio,dc=gonzalonazareno,dc=org -W -f usuariosengrupos.ldif
Enter LDAP Password: 
modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"

modifying entry "cn=admin,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org"
~~~

Como memberOf no es parte de la configuración básica de LDAP, para que aparezca al realizar una búsqueda hay que especificar que éste aparezca:

~~~
debian@freston:~$ ldapsearch -LL -Y EXTERNAL -H ldapi:/// "(uid=sergio)" -b dc=sergio,dc=gonzalonazareno,dc=org memberOf
SASL/EXTERNAL authentication started
SASL username: gidNumber=1000+uidNumber=1000,cn=peercred,cn=external,cn=auth
SASL SSF: 0
version: 1

dn: uid=sergio,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
memberOf: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org

debian@freston:~$ ldapsearch -LL -Y EXTERNAL -H ldapi:/// "(uid=celia)" -b dc=sergio,dc=gonzalonazareno,dc=org memberOf
SASL/EXTERNAL authentication started
SASL username: gidNumber=1000+uidNumber=1000,cn=peercred,cn=external,cn=auth
SASL SSF: 0
version: 1

dn: uid=celia,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
memberOf: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
memberOf: cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org

debian@freston:~$ ldapsearch -LL -Y EXTERNAL -H ldapi:/// "(uid=juanan)" -b dc=sergio,dc=gonzalonazareno,dc=org memberOf
SASL/EXTERNAL authentication started
SASL username: gidNumber=1000+uidNumber=1000,cn=peercred,cn=external,cn=auth
SASL SSF: 0
version: 1

dn: uid=juanan,ou=People,dc=sergio,dc=gonzalonazareno,dc=org
memberOf: cn=comercial,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
memberOf: cn=almacen,ou=Group,dc=sergio,dc=gonzalonazareno,dc=org
~~~