---
title: "Seguridad en sistemas Linux"
date: 2025-11-21T14:00:00+02:00
categories: [Apuntes, Sistemas, Linux]
excerpt: "Aprende todo lo necesario sobre seguridad en sistemas Linux"
card_image: /assets/images/cards/debian.png
---

# Introducción

La seguridad en sistemas Linux es uno de los pilares fundamentales para cualquier administrador de sistemas, técnico NOC o profesional de IT. Aunque Linux es considerado uno de los sistemas operativos más robustos, una configuración incorrecta puede convertirlo en un sistema vulnerable.

# Administración de contraseñas

Linux gestiona las contraseñas de manera muy segura gracias a varios archivos y herramientas diseñados específicamente para proteger la integridad de los usuarios del sistema.

## Archivos principales

* /etc/passwd: Contiene información básica de los usuarios. Ya no almacena contraseñas desde hace muchos años; en su lugar, se usa el símbolo "x" indicando que la contraseña está oculta en shadow.

* /etc/shadow: Contiene el hash de las contraseñas, junto a información de caducidad y políticas. Solo el usuario root puede leer este archivo.

Ejemplo de línea:

~~~
usuario:$6$D3a2d...$mMbg...:18900:7:90:7:::
~~~

* $6$: indica hashing con SHA-512.
* 5º valor, en este caso 90, indica los días que faltan para la caducidad.

## Herramientas para gestionar las contraseñas

En linux contamos con dos herramientas principales para gestionar las contraseñas de los usuarios:

* passwd: permite cambiar, bloquear o desbloquear contraseñas. Ej:

~~~
passwd usuario      # cambia contraseña
passwd -l usuario   # bloquear
passwd -u usuario   # desbloquear
passwd -e usuario   # caducidad inmediata
~~~

* chage: Este comando nos permite un control avanzado de políticas de expiración. Ej:

~~~
chage -M 90 usuario # La contraseña de usuario caducara cada 90 días
chage -d 0 usuario  # forzar cambio de contraseña al iniciar sesión
chage -l usuario    # ver políticas actuales de la contraseña
~~~

También tenemos la opción de bloquear un usuario tras varios accesos fallidos editando el fichero /etc/security/faillock.conf. Ej de como bloquear a un usuario tras 3 accesos fallidos y mantener al usuario bloqueado durante 10 min:

~~~
deny = 3
unlock_time = 600 #el tiempo de bloqueo se establece en segundos
~~~

Los usuarios que sean bloqueados podemos verlos con el comando faillock. Ej:

~~~
faillock --user sergio
~~~

El comando anterior mostrara si el usuario sergio esta o no bloqueado, en el caso de por ejemplo un empleado que tiene que seguir trabajando en la empresa, podemos resetear los intentos fallidos de forma que el usuario pueda volver a acceder al sistema.

~~~
faillock --user sergio --resets
~~~

# Monitoreo de puertos

Monitorizar puertos nos permite detectar servicios no autorizados, posibles intrusiones o fallos de configuración.

## Herramientas principales

En linux contamos con tres herramientas principales para monitorizar los puertos de nuestros equipos:

* ss: Herramienta moderna para ver puertos y sockets.

Con la opción -tuln: veremos todos los puertos que están actualmente escuchando. Podemos hacer uso del comando grep para identificar que procesos usan un puerto concreto. Ej: ss -tuln | grep :22.

* nmap: Escáner puertos de tu propia máquina.

Con este comando podemos escanear tanto los puertos abiertos de nuestra maquina, como escanear puertos de un servidor remoto dándonos la opción de buscar incluso los puertos que sean vulnerables o inseguros. Ej:

Escaneo local:

~~~
nmap localhost
~~~

Escaneo de servidor remoto para comprobar que servicios expone:

~~~
nmap -sV 192.168.1.50
~~~

Búsqueda de puertos vulnerables o inseguros:

~~~
nmap --script vuln 192.168.1.50
~~~

* lsof: Muestra que procesos están utilizando cada puerto. Ejemplo de uso:

Ver que proceso esta usando un puerto concreto:

~~~
lsof -i :80
~~~

Ver ficheros y puertos abiertos de un usuario:

~~~
lsof -u sergio
~~~

# Monitorización de usuarios en el sistema

Observar quién está conectado, qué comandos ejecuta y qué historial de accesos existe permite detectar accesos sospechosos o comportamientos maliciosos.

## Comandos esenciales

* who / w / users: Información en tiempo real sobre usuarios conectados.

    * who: con este comando vemos que usuarios están conectados ahora mismo.
    * w: con este comando no solo veremos los usuarios que están conectados sino que ademas veremos lo que están haciendo.
    * users: nos muestra los nombres de los usuarios conectados.

* last / lastb: Historial de accesos exitosos y fallidos.

    * last: nos muestra los últimos inicios de sesión del sistema.
    * lastb: este comando requiere que tengamos permisos de root y con el podemos ver los intentos de login fallidos.

* journalctl: Logs del sistema.

* auditd: Sistema avanzado de auditoría. Este comando puede ser util por ejemplo para revisar quien a hecho cambios en el fichero /etc/passwd. Ej

~~~
ausearch -f /etc/passwwd
~~~

# Firewalls en Linux

Linux ofrece múltiples opciones de firewall, desde herramientas simples para iniciarse hasta sistemas avanzados utilizados en producción.

* iptables (legacy): Sistema clásico basado en tablas y cadenas.

Ejemplo para permitir el puerto 22 (ssh):

~~~
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
~~~

* nftables (moderno): Reemplazo oficial de iptables. Más rápido, moderno y fácil de mantener.

Ejemplo para permitir el puerto 22:

~~~
nft add rule inet filter input tcp dport 22 accept
~~~

* ufw (ubuntu): Firewall simplificado para administradores menos avanzados.

Ejemplo para permitir ssh:

~~~
ufw allow ssh
ufw enable
~~~

* firewalld (RHEL/CentOS): Basado en zonas y dinámico, ideal para servidores en producción.

~~~
firewall-cmd --add-service=ssh --permanent
firewall-cmd --reload
~~~