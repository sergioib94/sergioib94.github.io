---
title: "Vpn Site to Site"
date: 2021-03-12T19:00:38+01:00
categories: [Seguridad]
---

### Introduccion ###

Configuraremos una conexión VPN sitio a sitio entre dos equipos del cloud openstack:

Cada equipo estará conectado a dos redes, una de ellas en común. Para la autenticación de los extremos se usarán obligatoriamente certificados digitales, que se generarán utilizando openssl y se almacenarán en el directorio /etc/openvpn, junto con con los parámetros Diffie-Helman y el certificado de la propia Autoridad de Certificación.

Se utilizarán direcciones de la red 10.99.99.0/24 para las direcciones virtuales de la VPN.
Tras el establecimiento de la VPN, una máquina de cada red detrás de cada servidor VPN debe ser capaz de acceder a una máquina del otro extremo.

### **VPN sitio a sitio con OpenVPN y certificados x509** ###

* Servidor 1: vpn_server

    * Red común 172.22.201.64
    * Red 10.0.0.8
    * Red1 192.168.100.2

* Maquina de la red local 1: lan

    * Red1 192.168.100.10

* Servidor 2: vpn_server2

    * Red común 172.22.201.33
    * Red 10.0.0.13
    * Red2 192.168.200.8

* Maquina de la red local 1: lan2

    * Red2 192.168.200.4

Tras el establecimiento de la VPN, una máquina de cada red detrás de cada servidor VPN debe ser capaz de acceder a una máquina del otro extremo.

Cabe decir que tenemos instalado en las 4 máquinas el paquete openvpn.

### **Configuración** ###

En este caso mi servidor hace de cliente del servidor del servidor de mi compañera celia.

Fichero de configuracion de mi maquina que hara de cliente:

~~~
#### Fichero de sit-to-site vpn ####
#Dispositivo de túnel
dev tun

#IP del servidor
remote 172.22.201.33 (ip del servidor interno)

#Encaminamiento
ifconfig 10.99.99.2 10.99.99.1

# Subred remota
route 192.168.200.0 255.255.255.0 (ip externa del servidor)

#Rol de cliente
tls-client

#Certificado de la CA
ca /etc/openvpn/ca_celia.crt

#Certificado cliente
cert /etc/openvpn/cliente_celia.crt

#Clave privada cliente
key /etc/openvpn/cliente_celia.key

#Activar la compresión LZO
comp-lzo

#Detectar caídas de la conexión
keepalive 10 60

#Nivel de la información
verb 3

log /var/log/vpn.log
~~~

Para ello mi compañera celia a tenido que pasarme los certificados y claves necesarias para que la conexion se establezca de forma corracta.

Fichero Servidor celia:

~~~
# Use a dynamic TUN device
dev tun

# Virtual ip
ifconfig 10.99.99.1 10.99.99.2

# Local subnet
route 192.168.100.0 255.255.255.0 (ruta de mi maquina que hace de cliente)

# Enable TLS and assume server role
tls-server

# Diffie-Hellman
dh /etc/openvpn/keys/dh.pem

# Certificado de la CA
ca /etc/openvpn/keys/ca.crt

# Certificado local
cert /etc/openvpn/keys/servidor.crt

# Clave privada 
key /etc/openvpn/keys/servidor.key

# Use fast LZO compression
comp-lzo

# Ping remote every 10sg and restart after 60sg passed without sign of file from remote.
keepalive 10 60

# Set output verbosity to normal usage range
verb 3

log /var/log/office1.log
~~~

Una vez establecido el tunel vpn comprobamos que tanto servidor como cliente en ambas redes tienen conexion ejecutando un ping por ejemplo.

![Pueba de ping](/site-to-site/Pueba_ping.jpeg)