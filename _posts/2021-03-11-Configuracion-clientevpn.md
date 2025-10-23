---
title: "Configuracion cliente VPN con certificado x509"
date: 2021-03-11T16:19:25+01:00
categories: [Cloud]
excerpt: "En el siguiente post se configurara una configuracion de VPN para poder acceder desde casa a una red distinta como puede ser la red del centro de trabajo o en este caso la red del instituto."
---

## **Introducción** ##

Teniendo en cuenta que en el instituto y en casa cuentan con redes distintas, se configurara un cliente vpn para poder permitir la conexion entre las distintas redes.

## **Configuración del cliente VPN** ##

* Empezamos generando una clave privada RSA 4096

Para generarnos nuestra clave privada rsa hacemos uso del comando openssl:

~~~
root@debian-sergio:~# openssl genrsa 4096 > /etc/ssl/private/debian-sergio.ibanez.key
Generating RSA private key, 4096 bit long modulus (2 primes)
........................++++
.....................................................................................................................................................................................................................................................................................................................................................................................................................++++
e is 65537 (0x010001)
~~~

* Generamos una solicitud de firma de certificado (fichero CSR).

Creamos el fichero csr para que sea firmado con el siguiente comando y rellenamos los parámetros necesarios que se nos piden: Country Name,  State or Province Name (full name), Locality Name, Organization Name, Organizational Unit Name y Common Name (e.g. server FQDN or YOUR name), el resto de los parámetros son opcionales.

~~~
root@debian-sergio:~# openssl req -new -key /etc/ssl/private/debian-sergio.ibanez.key -out /root/debian-sergio.ibanez.csr
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:ES
State or Province Name (full name) [Some-State]:Sevilla
Locality Name (eg, city) []:Dos Hermanas
Organization Name (eg, company) [Internet Widgits Pty Ltd]:IES Gonzalo Nazareno
Organizational Unit Name (eg, section) []:Informatica
Common Name (e.g. server FQDN or YOUR name) []:debian-sergio.ibanez
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
~~~

* Descargamos el certificado firmado cuando esté disponible

Una vez disponible y firmado nuestro csr, lo descargamos de Gestiona en Utilidades -> Certificados

* Instalamos y configuramos apropiadamente el cliente openvpn y muestra los registros (logs) del sistema que demuestren que se ha establecido una conexión.

Instalamos openvpn como root ejecutando apt openvpn

Una vez instalado en el directorio /etc/openvp, se creara un fichero .conf (en mi caso GN.conf) con la configuración que te tendrá nuestro vpn:

Configuración del fichero .conf:

~~~
dev tun
remote sputnik.gonzalonazareno.org
ifconfig 172.23.0.0 255.255.255.0
pull
proto tcp-client
tls-client
remote-cert-tls server
ca /etc/ssl/certs/gonzalonazareno.crt
cert /etc/openvpn/debian-sergio.ibanez.crt
key /etc/ssl/private/debian-sergio.ibanez.key
comp-lzo
keepalive 10 60
log /var/log/openvpn-sputnik.log
verb 1
~~~

En el caso del fichero.key, le deberemos de cambiar los permisos con chmod y ponerle 600 

Una vez configurado el fichero, reiniciamos el servicio openvpn para comprobar que se crea el túnel y que se ha añadido la nueva ruta en encaminamiento.

~~~
systemctl restart openvpn.service
~~~

~~~
sergioib@debian-sergio:~$ ip r
default via 192.168.1.1 dev wlo1 proto dhcp metric 600 
169.254.0.0/16 dev wlo1 scope link metric 1000 
172.22.0.0/16 via 172.23.0.65 dev tun0 
172.23.0.1 via 172.23.0.65 dev tun0 
172.23.0.65 dev tun0 proto kernel scope link src 172.23.0.66 
192.168.1.0/24 dev wlo1 proto kernel scope link src 192.168.1.74 metric 600 
~~~

Comprobamos también el contenido del log en /var/log:

~~~
root@debian-sergio:/var/log# cat openvpn-sputnik.log 
Mon Nov  2 11:54:25 2020 OpenVPN 2.4.7 x86_64-pc-linux-gnu [SSL (OpenSSL)] [LZO] [LZ4] [EPOLL] [PKCS11] [MH/PKTINFO] [AEAD] built on Feb 20 2019
Mon Nov  2 11:54:25 2020 library versions: OpenSSL 1.1.1d  10 Sep 2019, LZO 2.10
Mon Nov  2 11:54:25 2020 WARNING: using --pull/--client and --ifconfig together is probably not what you want
Mon Nov  2 11:54:25 2020 TCP/UDP: Preserving recently used remote address: [AF_INET]92.222.86.77:1194
Mon Nov  2 11:54:25 2020 Attempting to establish TCP connection with [AF_INET]92.222.86.77:1194 [nonblock]
Mon Nov  2 11:54:26 2020 TCP connection established with [AF_INET]92.222.86.77:1194
Mon Nov  2 11:54:26 2020 TCP_CLIENT link local: (not bound)
Mon Nov  2 11:54:26 2020 TCP_CLIENT link remote: [AF_INET]92.222.86.77:1194
Mon Nov  2 11:54:26 2020 [sputnik.gonzalonazareno.org] Peer Connection Initiated with [AF_INET]92.222.86.77:1194
Mon Nov  2 11:54:28 2020 TUN/TAP device tun0 opened
Mon Nov  2 11:54:28 2020 /sbin/ip link set dev tun0 up mtu 1500
Mon Nov  2 11:54:28 2020 /sbin/ip addr add dev tun0 local 172.23.0.66 peer 172.23.0.65
Mon Nov  2 11:54:28 2020 WARNING: this configuration may cache passwords in memory -- use the auth-nocache option to prevent this
Mon Nov  2 11:54:28 2020 Initialization Sequence Completed
~~~

* Cuando hayas establecido la conexión VPN tendrás acceso a la red 172.22.0.0/16 a través de un túnel SSL. Compruébalo haciendo ping a 172.22.0.1

Prueba de funcionamiento con ping:

~~~
sergioib@debian-sergio:~$ ping 172.22.0.1
PING 172.22.0.1 (172.22.0.1) 56(84) bytes of data.
64 bytes from 172.22.0.1: icmp_seq=1 ttl=63 time=80.6 ms
64 bytes from 172.22.0.1: icmp_seq=2 ttl=63 time=152 ms
64 bytes from 172.22.0.1: icmp_seq=3 ttl=63 time=72.9 ms
64 bytes from 172.22.0.1: icmp_seq=4 ttl=63 time=73.1 ms
64 bytes from 172.22.0.1: icmp_seq=5 ttl=63 time=77.10 ms
64 bytes from 172.22.0.1: icmp_seq=6 ttl=63 time=81.5 ms
64 bytes from 172.22.0.1: icmp_seq=7 ttl=63 time=72.9 ms
64 bytes from 172.22.0.1: icmp_seq=8 ttl=63 time=73.1 ms
^C
--- 172.22.0.1 ping statistics ---
8 packets transmitted, 8 received, 0% packet loss, time 17ms
rtt min/avg/max/mdev = 72.873/85.504/151.959/25.347 ms
~~~

Comprobamos que funciona perfectamente.