---
title: "Servidor DHCP Linux"
date: 2021-03-11T09:33:55+01:00
categories: [Servicios]
---

### **Funcionamiento de un servidor DHCP** ###

El cliente al iniciarse se encuentra en estado init, sin saber sus parámetros ip en ese momento envía un mensaje DHCPDiscover a la dirección de broadcast para saber si algún servidor dhcp le puede ofrecer una ip. El cliente espera un tiempo entre 1 y 10 seg al enviar este dhcpdiscover para evitar posibles colisiones con otras peticiones de otros clientes.

Cuando ya se ha mandado el dhcpdiscover el cliente entra en fase selecting, en la que recibira las dhcpoffer de los servidores dhcp. En el caso de que un cliente reciba varios dhcpoffer, elegirá una de las ofertas indicándoselo al servidor con un dhcprequest y este servidor le responderá con un dhcpack. En el caso de que la ip ofrecida en el servidor ya este en uso en la red, el cliente responde al dhcpack con un dhcpdecline, rechazando así la oferta del servidor y volviendo así al estado de init.

En el caso de que el cliente acepte la ip que le ofrece el servidor, al cliente pasara a un estado de bound o asociado en el que recibirá un T1,T2 y T3:

* T1 → Tiempo en el que una ip ofrecida se renueva.
* T2 → Tiempo de reenganche, es decir, el tiempo que tarda en volver a recibir una ip cuando el servido se apaga por ejemplo.
* T3 → Tiempo que tendrá la ip ofrecida el cliente.

Cuando expira el T1, el cliente pasa a estado de renovación en el que negocia de nuevo con el servidor una nueva ip. En el caso de que el servidor por algún motivo no renueve la ip del cliente, este volverá al estado init en el que volverá a solicitar una nueva ip. En el caso de que el servidor si responda, recibirá el cliente un dhcpack con la ip, y la nueva duración.

Si el T2 expira mientras el cliente está esperando en el estado renewing, el cliente pasará al estado rebinding en el que envía de nuevo un DHCPrequest a cualquier servidor, ya que por el servidor original no estaría disponible. Si un servidor contesta con un dhcpack, el cliente renueva su ip y sus temporizadores y pasa al estado bound.

Al expirar T3 el cliente devuelve su ip y deja de usarla en la red, pero el cliente no necesita esperar a que expire el tiempo de alquiler para dejar de usar la ip, también puede renunciar a ella. 

### **Preparación de escenario** ###

Nuestro escenario vagrant contara con dos nodos, el node server y el cliente:
    • Servidor: Tiene dos tarjetas de red (una pública y una privada que se conectan a la red local).
    • nodo_lan1: Un cliente conectado a la red local.

El Vagrantfile empleado para la creacion del escenarios es el siguiente:

~~~
Vagrant.configure("2") do |config|
  config.vm.define :nodo1 do |nodo1|
      nodo1.vm.box = "debian/buster64"
      nodo1.vm.hostname = "server"
      nodo1.vm.network :public_network,:bridge=>"wlo1"
      nodo1.vm.network :private_network, ip: "192.168.100.1/24", virtualbox__intnet: "Red1"
  end
  config.vm.define :nodo2 do |nodo2|
      nodo2.vm.box = "debian/buster64"
      nodo2.vm.hostname = "nodo1"
      nodo2.vm.network :private_network, type: "dhcp", virtualbox__intnet: "Red1"
  end
~~~

Instala un servidor dhcp en el ordenador “servidor” que de servicio a los ordenadores de red local, teniendo en cuenta que el tiempo de concesión sea 12 horas y que la red local tiene el direccionamiento 192.168.100.0/24.

* Tarea 3: Muestra el fichero de configuración del servidor, la lista de concesiones, la modificación en la configuración que has hecho en el cliente para que tome la configuración de forma automática y muestra la salida del comando "ip address".

Configuraciones en el servidos dhcp en /etc/dhcp/dhcpd.conf:

~~~
Tiempo de concesión:
default-lease-time 600;
max-lease-time 43200;

Rango de Ips que el servidos va a servir:
subnet 192.168.100.0 netmask 255.255.255.0 {
  range 192.168.100.50 192.168.100.100;
}
~~~

Ip a del cliente

~~~
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever

2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:8d:c0:4d brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic eth0
       valid_lft 86294sec preferred_lft 86294sec
    inet6 fe80::a00:27ff:fe8d:c04d/64 scope link 
       valid_lft forever preferred_lft forever

3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:5c:a2:a9 brd ff:ff:ff:ff:ff:ff
    inet 192.168.100.50/24 brd 192.168.100.255 scope global dynamic eth1
       valid_lft 495sec preferred_lft 495sec
    inet6 fe80::a00:27ff:fe5c:a2a9/64 scope link 
       valid_lft forever preferred_lft forever
~~~

* Tarea 4: Configura el servidor para que funcione como router y NAT, de esta forma los clientes tengan internet.

Configuración de enrutamiento:

~~~
sudo ip r del default
sudo ip r add default via 192.168.1.1
~~~

Quitamos la ruta ip por defecto (eth0) y ponemos por defecto la eth1 que es la interfaz por la que accederemos a internet.

Añadimos la linea iptable al fichero /etc/network/interfaces de forma que indicamos la interfaz por la que haremos nat.

~~~
up iptables -t nat -A POSTROUTING -s 192.168.100.0/24 -o eth1 -j MASQUERADE
~~~

-A → añade una regla a postrouting
Postrouting → Permite modificar paquetes justo antes de que salgan del equipo.
-s → se aplica a la dirección de origen, en este caso nuestra red interna
-o → se indica la interfaz por la que saldrán los paquetes, eth1
-J MASQUERADE → cambia la dirección origen por la que tenga la interfaz de salida
De forma que al hacer un ip route show o ip r deberíamos tener algo asi:

~~~
vagrant@nodo1:~$ ip route show
default via 192.168.1.1 dev eth1 
10.0.2.0/24 dev eth0 proto kernel scope link src 10.0.2.15 
192.168.1.0/24 dev eth1 proto kernel scope link src 192.168.1.50 
192.168.100.0/24 dev eth2 proto kernel scope link src 192.168.100.1
~~~

* Tarea 5: Realizar una captura, desde el servidor usando tcpdump, de los cuatro paquetes que corresponden a una concesión: DISCOVER, OFFER, REQUEST, ACK.

~~~
vagrant@nodo1:~$ sudo tcpdump -i eth2
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth2, link-type EN10MB (Ethernet), capture size 262144 bytes
15:02:53.325447 IP 192.168.100.50.bootpc > 192.168.100.1.bootps: BOOTP/DHCP, Request from 08:00:27:a4:37:9b (oui Unknown), length 300
15:02:53.338628 IP 192.168.100.1.bootps > 192.168.100.50.bootpc: BOOTP/DHCP, Reply, length 300
15:02:58.391241 ARP, Request who-has 192.168.100.1 tell 192.168.100.50, length 46
15:02:58.391311 ARP, Reply 192.168.100.1 is-at 08:00:27:8f:2b:27 (oui Unknown), length 28
15:02:58.490871 ARP, Request who-has 192.168.100.50 tell 192.168.100.1, length 28
15:02:58.491611 ARP, Reply 192.168.100.50 is-at 08:00:27:a4:37:9b (oui Unknown), length 46
~~~

* Tarea 8: Indica las modificaciones realizadas en los ficheros de configuración y entrega una comprobación de que el cliente ha tomado esa dirección.*

Añadimos la siguiente configuración a /etc/dhcp/dhcpd.conf:

~~~
host nodo2 {
hardware ethernet 08:00:27:a4:37:9b;
fixed-address 192.168.100.100;
}
~~~

De esta forma, una vez que se reinicie el servicio, y el tiempo de concesión de nuestro cliente pase, se cambiara de forma automática la ip por la 192.168.100.100

Cliente antes:

~~~
vagrant@nodo2:~$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever

2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:8d:c0:4d brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic eth0
       valid_lft 85888sec preferred_lft 85888sec
    inet6 fe80::a00:27ff:fe8d:c04d/64 scope link 
       valid_lft forever preferred_lft forever

3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:a4:37:9b brd ff:ff:ff:ff:ff:ff
    inet 192.168.100.50/24 brd 192.168.100.255 scope global dynamic eth1
       valid_lft 45sec preferred_lft 45sec
    inet6 fe80::a00:27ff:fea4:379b/64 scope link 
       valid_lft forever preferred_lft forever
~~~

Cliente ahora:

~~~
vagrant@nodo2:~$ ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever

2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:8d:c0:4d brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic eth0
       valid_lft 85864sec preferred_lft 85864sec
    inet6 fe80::a00:27ff:fe8d:c04d/64 scope link 
       valid_lft forever preferred_lft forever

3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 08:00:27:a4:37:9b brd ff:ff:ff:ff:ff:ff
    inet 192.168.100.100/24 brd 192.168.100.255 scope global dynamic eth1
       valid_lft 50sec preferred_lft 50sec
    inet6 fe80::a00:27ff:fea4:379b/64 scope link 
       valid_lft forever preferred_lft forever
~~~

Uso de varios ámbitos

Modifica el escenario Vagrant para añadir una nueva red local y un nuevo nodo:

    • Servidor: En el servidor hay que crear una nueva interfaz
    • nodo_lan2: Un cliente conectado a la segunda red local.
    
Configura el servidor dhcp en el ordenador “servidor” para que de servicio a los ordenadores de la nueva red local, teniendo en cuenta que el tiempo de concesión sea 24 horas y que la red local tiene el direccionamiento 192.168.200.0/24.

* Tarea 9: Entrega el nuevo fichero Vagrantfile que define el escenario.

En este caso he añadido una maquina windows ya existente y la he conectado a la red del server y el nodo1 por lo que el fichero vagrant file no ha sido modificado.

* Tarea 10: Explica las modificaciones que has hecho en los distintos ficheros de configuración. Entrega las comprobaciones necesarias de que los dos ámbitos están funcionando.*

Configuracion en /etc/dhcp/dhcpd.conf

~~~
option domain-name "example.org";
option domain-name-servers ns1.example.org, ns2.example.org;
default-lease-time 60;
max-lease-time 60;
ddns-update-style none;

#Rango de direcciones

subnet 192.168.100.0 netmask 255.255.255.0 {
  range 192.168.100.50 192.168.100.100;
}

#Reservas IP

host nodo2 {
hardware ethernet 08:00:27:a4:37:9b;
fixed-address 192.168.200.100;
}
~~~