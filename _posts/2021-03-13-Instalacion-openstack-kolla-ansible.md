---
title: "Instalacion Openstack con Kolla Ansible"
date: 2021-03-13T13:08:14+01:00
categories: [Cloud]
excerpt: "En este post crearemos un escenario virtual haciendo uso de vagrant y montaremos una instalacion de openstack haciendo uso de varias maquinas"
---

### **Introduccion** ###

Para esta practica contaremos con un escenario de 3 nodos creados con vagrant:

* Instalador (sistema ubuntu), sera donde se preparara openstack para su despliegue.
* Master (sistema ubuntu)
* Compute (sistema ubuntu)

El montaje de openstack requiere de mucho recurso por parte de la maquina anfitriona, el nodo master debe de tener al menos 6Gb de ram para que sea capaz de funcionar y de poder desplegarse sin problemas, con respecto a los otros 2 nodos se recomienda usar al menos 2Gb.

Tambien es recomendable usar sistemas operativos o ubuntu o centos en estos nodos (obviamente los 3 nodos deben de tener el mismo sistema operativo).

### Vgrantfile ###

~~~
Vagrant.configure("2") do |config|
  config.vm.define :instalador do |instalador|
    instalador.vm.box = "ubuntu/bionic64"
    instalador.vm.hostname = "instalador"
    instalador.vm.network :public_network, :bridge=>"wlo1"
    instalador.vm.network :private_network, ip: "10.10.1.4", virtualbox__intnet: "redinterna"
  end
  config.vm.define :master do |master|
    master.vm.box = "ubuntu/bionic64"
    master.vm.hostname = "master"
    master.vm.network :public_network, :bridge=>"wlo1"
    master.vm.network :private_network, ip: "10.10.1.2", virtualbox__intnet: "redinterna"
    master.vm.network :public_network, :bridge=>"wlo1"
    master.vm.provider "virtualbox" do |mv|
      mv.customize ["modifyvm", :id, "--memory", "6144"]
    end
  end
  config.vm.define :compute do |compute|
    compute.vm.box = "ubuntu/bionic64"
    compute.vm.hostname = "compute"
    compute.vm.network :public_network, :bridge=>"wlo1"
    compute.vm.network :private_network, ip: "10.10.1.3", virtualbox__intnet: "redinterna"
    compute.vm.provider "virtualbox" do |mv|
      mv.customize ["modifyvm", :id, "--memory", "2048"]
    end
  end
end
~~~

Como podemos ver, en master tenemos 2 interfaces de red, sin embargo a una de las interfaces sera necesario quitarle la ip, esto lo podremos hacer ejecutando lo siguiente:

~~~
ip a del (interfaz de red)(ip de la interfaz)
~~~

### Nodo Instalador ###

Lo primero que haremos sera actualizar la maquina:

~~~
apt update
apt upgrade
~~~

Instalamos las dependencias de kolla ansible:

Empezamos instalando python3-venv ya que openstack se montara en un entorno virtual:

~~~
apt-get install python3-venv
~~~

Una vez instalado, creamos el entorno y accedemos a el:

~~~
python3 -m venv openstack
source openstack/bin/activate
~~~

Instalamos las dependencias de kolla-ansible
	
~~~
apt install python-dev libffi-dev gcc libssl-dev python-selinux sshpass
~~~

En nuestro entorno virtual instalamos tanto pip como ansible (la version de ansible debe ser 2.9.x sino no funciona):

~~~	
pip install -U pip
pip install 'ansible<2.10'
~~~

La opcion -U (upgrade) es para que pip se instale ya actualizado, es decir la ultima versión. Es importante que se instale una version de ansible inferior a la 2.10, de lo contrario en kolla ansible fallara el despliegue mas adelante.

Creamos el directorio ansible en /etc con el siguiente fichero.

ansible.cfg:

~~~
[defaults]
host_key_checking=False
pipelining=True
forks=100
~~~

Y ponemos como propietario de este directorio a $USER

~~~
chown $USER:$USER /etc/ansible
~~~

En nuestro entorno virtual ya podemos instalar kolla-ansible

~~~
pip install -U kolla-ansible
~~~

Creamos un directorio kolla en /etc y copiamos todos los ficheros necesarios para el despliegue de openstack en ese directorio:

~~~
cp -r openstack/share/kolla-ansible/etc_examples/kolla/* /etc/kolla

cp openstack/share/kolla-ansible/ansible/inventory/* .
~~~

Al igual que con /etc/ansible, hacemos propietario del directorio kolla a $USER.

~~~
chown $USER:$USER /etc/kolla
~~~

Del inventory copiaremos tanto el fichero multinode, que es el que usaremos como el all-in-one, pero estos ficheros deben estar dentro de nuestro entorno virtual, por lo tanto dentro del directorio openstack.

Añadimos en el /etc/host de nuestro nodo instalador, la ip de la maquina master y de compute:

~~~
192.168.1.76	master
192.168.1.77	compute
~~~

Editamos el fichero multinodo:

~~~
[control]
master ansible_user=root ansible_password=password

[network:children]
control

[compute]
compute ansible_user=root ansible_password=password

[monitoring:children]
control

[storage:children]
control

[deployment]
localhost ansible_connection=local
~~~

Comprobamos que las maquinas se hacen ping con el siguiente comando:

~~~
ansible -i multinode all -m ping
~~~

Para que el ping funcione correctamente, las tres maquinas tienen que tener instalado el paquete python3-dev y ademas tener la misma configuracion /etc/ssh/sshd_config habilitando y permitiendo que root pueda acceder por ssh y que pida autentificacion:

~~~
PermitRootLogin yes
PasswordAuthentication yes
~~~

Una vez que el ping se haga correctamente podremos empezar con el despliegue de openstack

Generamos la clave kolla:

~~~
kolla-genpwd
~~~

Modificamos el fichero global en /etc/kolla de la siguiente forma:

~~~
kolla_base_distro: "ubuntu"  #distribucion que usa, en este caso ubuntu
kolla_install_type: "binary"
openstack_release: "victoria" #version de openstack que se instalara
kolla_internal_vip_address: "10.10.1.254" #rango de ip interno, en este caso 10.10.1.x
kolla_external_vip_address: "192.168.1.200" #ip que se le asignara a la interfaz vacia del nodo master (te la inventas)
network_interface: "enp0s9" #interfaz de red interna
kolla_external_vip_interface: "enp0s10" #interfaz de red externa en master (la que no tiene ip)
neutron_external_interface: "enp0s10" #interfaz de red anterior, external_vip

enable_cinder: "yes"
enable_cinder_backup: "yes"
enable_cinder_backend_hnas_nfs: "yes"
enable_cinder_backend_nfs: "yes"
nova_compute_virt_type: "qemu"
~~~

### Despliegue de openstack ###

~~~
kolla-ansible -i multinode bootstrap-servers
~~~

Si todo sale correctamente, seguiremos con el siguiente comando para comprobar que todo esta listo para el despliegue:

~~~
kolla-ansible -i multinode prechecks
~~~

Si tenemos okey, podemos empezar con el despliegue:

~~~
kolla-ansible -i multinode deploy
~~~

En el deploy, en mi caso, he tenido que habilitar las siguientes opciones en el fichero global porque de lo contrario me saltaba un error diciendo que era necesarios

~~~
enable_cinder_backend_hnas_nfs: "yes"
enable_cinder_backend_nfs: "yes"
~~~

A parte de este error, al haber habilitado los backend, este despliegue nos saltara un error mas, ya que al haber habilitado los backend_nfs tendremos que hacer previamente una serie de configuraciones para poder hacer el deploy.

Instalamos nfs-kernel-server:

~~~
apt install nfs-kernel-server
~~~

Despues en el fichero /etc/exports añadimos la siguiente configuracion:

~~~
/kolla_nfs 10.10.1.0/24(rw,sync,no_root_squash)
~~~

Creamos el directorio /kolla_nfs

~~~
mkdir /kolla_nfs
~~~

Reiniciamos el servicio:

~~~
systemctl restart nfs-kernel-server
~~~

Ahora creamos un directorio config en /etc/kolla con el siguiente fichero:

fichero nfs_shares:

~~~
storage01:/kolla_nfs
storage02:/kolla_nfs
~~~

Este fichero básicamente lo que hara sera indicar donde se almacenaran los datos de nuestro openstack.

Una vez hecho todo lo anterior si podemos completar el despliegue de nuestro openstack, eso si, si el proceso de despliegue se queda parado mucho tiempo en algun sitio, querra decir que el nodo no dispone de los recursos necesarios y que necesitara mas ram.

Si disponemos con los recursos necesarios, y el despliegue se completa correctamente sin problemas, haremos un kolla-ansible post-deploy para confirmar que es posible desplegar openstack.

Podemos comprobar el funcionamiento de openstack entrando en el navegador y poniendo la ip que pusimos anteriormente (external_vip)
El usuario y contraseña por defecto de openstack los encontramos en el fichero /etc/kolla/admin-source.sh

En lugar de usar el navegador, tambien podemos instalar openstackclient en nuestro entorno virtual y acceder a openstack a traves de linea de comandos.

~~~
pip install python3-openstackclient
~~~

Con esto ya tendriamos un Openstack desplegado y dispuesto para su uso:

![openstack](/instalacion-openstack/openstack.png)

![proyecto openstack](/instalacion-openstack/proyecto_openstack.png)