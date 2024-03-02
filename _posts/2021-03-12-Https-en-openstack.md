---
title: "HTTPS en Openstack"
date: 2021-03-12T15:52:50+01:00
categories: [Seguridad]
---

### **Introducción** ###

El siguiente paso en nuestro escenario opensatack sera configurar de forma adecuada el protocolo HTTPS en nuestro servidor web para nuestra aplicaciones web. Para ello vamos a emitir un certificado wildcard en la AC Gonzalo Nazareno utilizando para la petición la utilidad "gestiona".

### **Instalamos openssl para crear nuestro certificado** ###

~~~
sudo apt install openssl
~~~

Se crea la clave 

~~~
openssl genrsa 4096 > /etc/ssl/private/sergio.ibanez.key
~~~

Se crea el fichero csr

~~~
openssl req -new -key /etc/ssl/private/sergio.ibanez.key -out /root/sergio.ibanez.csr

C=ES
ST=Sevilla
L=Dos Hermanas
O=IES Gonzalo Nazareno
OU=Informatica
CN = *.sergio.gonzalonazareno.org
~~~

C → Country Name, en este caso como el dominio esta en España ponemos ES.
ST → Estado/Provincia
L → Localidad/Ciudad
O → Nombre de la organización
OU → Nombre de la unidad organizativa a la que se le pide el certificado.
CN → Nombre del dominio para el que se hará el certificado, en este caso usamos * para que dicho certificado pueda usarse en cualquier maquina con el dominio sergio.gonzalonazareno.org.

Debemos hacer una redirección para forzar el protocolo https (en centos).

Para hacer la redirección sera necesario instalar el modulo ssl y reiniciamos httpd para habilitarlo:

~~~
[centos@quijote ~]$ sudo dnf -y install mod_ssl
~~~

Activamos el puerto 443 en centos:

~~~
[centos@quijote ~]$ sudo firewall-cmd --zone=public --permanent --add-service=https
success
[centos@quijote ~]$ sudo firewall-cmd --reload
success
~~~

Movemos los certificados a /etc/pki/tls/certs y la clave a /etc/pki/tls/private y una vez movidos, modificamos el fichero /etc/httpd/conf.d/ssl.conf modificando las siguientes lineas dejandolas de la siguiente forma:

~~~
SSLEngine on
SSLCertificateFile /etc/pki/tls/certs/sergio.ibanez.crt   
SSLCertificateKeyFile /etc/pki/tls/private/sergio.ibanez.key
~~~

Recargamos httpd:

~~~
sudo systemctl reload httpd
~~~

Para que funcionen los ficheros pki, ejecutamos el siguiente comando de forma que se permitirá la restauración de los ficheros en selinux:

~~~
restorecon -RvF /etc/pki
~~~

Se añaden las siguientes lineas en el fichero nuevo una vez puestos los certificados en sus respectivos sitios.

Fichero inicio_https.conf:

~~~
<VirtualHost *:443> 
	ServerName www.sergio.gonzalonazareno.org
	DocumentRoot /var/www/sergio

	ErrorLog /var/www/sergio/log/error.log
    	CustomLog /var/www/sergio/log/requests.log combined

    	SSLEngine on
    	SSLCertificateFile /etc/pki/tls/certs/sergio.ibanez.crt
    	SSLCertificateKeyFile /etc/pki/tls/private/sergio.ibanez.key
</VirtualHost>
~~~

Fichero inicio.conf:

~~~
<VirtualHost *:80>
	ServerName www.sergio.gonzalonazareno.org
	DocumentRoot /var/www/html

        Redirect 301 / https://www.sergio.gonzalonazareno.org

        ErrorLog /var/www/sergio/log/error.log
        CustomLog /var/www/sergio/log/requests.log combined
</VirtualHost>
~~~

Creamos los enlaces simbólicos:

~~~
sudo ln -s /etc/httpd/sites-available/inicio.conf /etc/httpd/sites-enabled/
sudo ln -s /etc/httpd/sites-available/inicio_https.conf /etc/httpd/sites-enabled/
~~~

Hay que indicarle a selinux que debe permitir a apache para que pueda acceder al directorio que contiene la clave y el certificado que hemos creado.

Configuraremos una regla DNAT en el cortafuego de la maquina Dulcinea para abrir el puerto 443 y el 80 haciendo uso de iptable.

~~~
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j DNAT --to 10.0.2.5
iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j DNAT --to 10.0.2.5
~~~

* Instalamos el certificado del AC Gonzalo Nazareno en tu navegador para comprobar que se pueda verificar tu certificado.

Instalamos el certificado en nuestro navegador, por ejemplo en Mozilla Firefox, para ello entramos en Preferencias -> Privacidad & Seguridad -> Certificados -> Ver certificados -> Importar.

![certificado](/https-openstack/certificado.png)

Probamos a acceder al fichero info.php que tenemos ya en nuestro servidor web:

![prueba https](/https-openstack/prueba_https.png)

Como se ve en la imagen, nos aparece el candado, aunque nos sale como sitio seguro, esto puede deberse a que a la hora de crear el fichero csr, el dato OU esta mal y por lo tanto no queda validado correctamente (se puso informatica cuando debe ser informática).