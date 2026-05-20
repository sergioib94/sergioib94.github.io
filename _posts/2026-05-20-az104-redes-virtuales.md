---
title: "Configuración y administración de redes virtuales"
date: 2026-05-20T16:30:00+02:00
categories: [Azure, AZ-104, Apuntes]
description: "Apuntes del módulo 5 del AZ-104: redes virtuales, subredes, NSG, DNS, emparejamiento de VNets, Load Balancer, Application Gateway y Network Watcher."
card_image: /assets/images/cards/az.png
---

Este módulo cubre la capa de red de Azure: cómo diseñar y segmentar redes virtuales, controlar el tráfico con grupos de seguridad, resolver nombres con DNS, conectar redes entre sí y distribuir carga entre servidores.

---

## Redes virtuales y subredes

### ¿Qué es una red virtual (VNet)?

Una red virtual de Azure (VNet) es el aislamiento lógico de tu infraestructura en la nube. Es el equivalente a tu red privada en un datacenter, pero en Azure. Dentro de una VNet, los recursos pueden comunicarse entre sí de forma privada y segura. Para comunicarse con el exterior (Internet u otras redes), necesitas configurarlo explícitamente.

Casos de uso principales:

- **Solo nube**: VMs y servicios que se comunican entre sí sin necesidad de conexión local
- **Híbrida (site-to-site VPN)**: conectar tu datacenter local con Azure de forma segura mediante IPsec
- **Nube híbrida flexible**: conectar aplicaciones en la nube con sistemas locales (mainframes, Unix...)

---

### Subredes

Las subredes dividen la VNet en segmentos más pequeños para mejorar la seguridad, el rendimiento y la administración. Reglas fundamentales:

- Cada subred tiene su propio rango de IPs dentro del espacio de la VNet (notación CIDR)
- Los rangos de subredes no pueden solaparse entre sí
- Azure reserva **5 direcciones IP** en cada subred (las 4 primeras y la última). Por ejemplo, en `192.168.1.0/24`:

| Dirección | Uso |
|---|---|
| 192.168.1.0 | Dirección de red |
| 192.168.1.1 | Puerta de enlace predeterminada (Azure) |
| 192.168.1.2 y .3 | DNS de Azure |
| 192.168.1.255 | Difusión |

> 💡 Si planeas conectar la VNet a otra red (local o en la nube), los rangos de IP no deben solaparse. Coordina con el responsable de red antes de asignar espacios de direcciones.

---

### Direcciones IP: privadas y públicas

**Direcciones privadas**: permiten comunicación dentro de la VNet y con redes locales conectadas. Se asignan a VMs, load balancers internos y application gateways.

**Direcciones públicas**: permiten comunicación con Internet. Se asignan a VMs, load balancers públicos, VPN gateways y Application Gateway.

Ambas pueden ser:

- **Dinámicas**: Azure asigna la IP y puede cambiar si el recurso se detiene/reinicia
- **Estáticas**: la IP no cambia aunque el recurso se reinicie. Necesarias para DNS, firewalls con reglas basadas en IP, certificados TLS vinculados a IP y servidores de roles críticos como controladores de dominio

> 💡 Para las IPs públicas, usa siempre el **SKU Estándar** (estático, seguro por defecto, compatible con zonas de disponibilidad). El SKU Básico está en proceso de deprecación.

---

## Grupos de seguridad de red (NSG)

### ¿Qué son los NSG?

Un NSG es un firewall de software que controla el tráfico entrante y saliente en Azure. Puedes asociarlo a una **subred** (afecta a todos los recursos de la subred) o a una **interfaz de red** de una VM concreta (afecta solo a esa VM).

Cada NSG contiene **reglas de seguridad** con estos campos:

| Campo | Descripción |
|---|---|
| Origen / Destino | IP, rango CIDR, etiqueta de servicio o grupo de seguridad de aplicaciones |
| Puerto | Puerto o rango de puertos |
| Protocolo | TCP, UDP, ICMP o Any |
| Acción | Permitir o Denegar |
| Prioridad | 100-4096. Menor número = mayor prioridad |

Las reglas se evalúan **en orden de prioridad**. La primera regla que coincide se aplica; el resto se ignoran.

---

### Reglas predeterminadas

Azure crea automáticamente estas reglas en cada NSG (no se pueden eliminar, pero sí se pueden sobreescribir con reglas de mayor prioridad):

**Entrante por defecto:**

- Permite tráfico dentro de la misma VNet
- Permite tráfico del Azure Load Balancer
- Deniega todo lo demás

**Saliente por defecto:**

- Permite tráfico hacia la misma VNet
- Permite tráfico hacia Internet
- Deniega todo lo demás

---

### Orden de evaluación del tráfico

- **Tráfico entrante**: Azure evalúa primero el NSG de la **subred**, luego el NSG de la **interfaz de red**
- **Tráfico saliente**: Azure evalúa primero el NSG de la **interfaz de red**, luego el NSG de la **subred**

> ⚠️ Si tienes un NSG en la subred Y otro en la NIC, ambos se evalúan de forma independiente. Para que el tráfico pase, debe ser permitido por los dos.

---

### Reglas de seguridad aumentadas

En lugar de crear una regla por cada IP o puerto, puedes combinar varios valores en una sola regla:

- Múltiples IPs o rangos en el mismo campo
- Múltiples puertos (ej: `80,443,8080`)
- Mezcla de etiquetas de servicio, grupos de seguridad de aplicaciones e IPs

Esto reduce el número total de reglas y simplifica la administración.

---

### Grupos de seguridad de aplicaciones (ASG)

Los ASG permiten agrupar VMs por rol o carga de trabajo y referenciarlas en las reglas del NSG por nombre de grupo en lugar de por IP.

Ventajas:

- No necesitas conocer ni actualizar las IPs de cada VM
- Las reglas se aplican automáticamente a las VMs nuevas que se unan al grupo
- Organización lógica por aplicación (ej: `WebServers`, `AppServers`, `DBServers`)

Ejemplo práctico: en vez de crear reglas para las IPs `10.0.1.4`, `10.0.1.5` y `10.0.1.6`, creas el ASG `WebServers` y usas ese nombre en la regla. Cuando añades una nueva VM web al ASG, la regla se aplica automáticamente sin tocar el NSG.

---

## Azure DNS

### ¿Cómo funciona DNS?

DNS traduce nombres legibles (como `www.contoso.com`) en direcciones IP. Cuando haces una petición, tu equipo consulta un servidor DNS que busca en su caché local; si no encuentra el dominio, consulta otros servidores hasta encontrar una respuesta.

### Tipos de registros DNS más importantes

| Tipo | Uso |
|---|---|
| **A** | Mapea un nombre de dominio a una dirección IPv4 |
| **AAAA** | Mapea un nombre de dominio a una dirección IPv6 |
| **CNAME** | Alias de un dominio a otro dominio |
| **MX** | Servidor de correo para el dominio |
| **TXT** | Texto libre; usado para verificar propiedad de dominio (Microsoft 365, Azure) |
| **NS** | Servidores de nombres autoritativos para la zona |
| **SOA** | Inicio de autoridad; creado automáticamente con la zona |

---

### Azure DNS

Azure DNS permite hospedar y gestionar zonas DNS usando la infraestructura global de Microsoft. Se integra con las credenciales y herramientas de Azure (Portal, CLI, PowerShell).

> ⚠️ Azure DNS **no registra dominios**. Necesitas comprar el dominio en un registrador externo (GoDaddy, Namecheap, o desde el Portal de Azure) y luego delegar la gestión DNS a Azure.

Para delegar un dominio a Azure DNS:

1. Crea la zona DNS en Azure
2. Azure te proporciona 4 servidores de nombres (NS)
3. Actualiza los registros NS en tu registrador de dominios para apuntar a los servidores de Azure
4. Verifica la delegación con `nslookup -type=SOA tudominio.com`

---

### Zonas DNS privadas

Las zonas privadas permiten resolución de nombres **dentro de tu VNet** sin exponer nada a Internet. Útil para que las VMs se llamen por nombre en lugar de IP.

Para activarlas: crea la zona privada y vincula las VNets que necesiten resolución de nombres en ella. Puedes vincular varias VNets a la misma zona privada.

Las zonas privadas también soportan **split-horizon DNS**: el mismo nombre puede resolver a IPs diferentes según si la consulta viene de dentro o fuera de la VNet.

---

### Registros de alias

Los registros de alias permiten que el vértice de zona (el dominio raíz, ej: `contoso.com` sin subdominio) apunte directamente a recursos de Azure como un Load Balancer, Traffic Manager o CDN endpoint.

El problema sin alias: los registros CNAME no pueden usarse en el vértice de zona, y los registros A apuntan a una IP que puede cambiar. Con un alias, si cambia la IP del recurso de Azure, el DNS se actualiza automáticamente.

---

## Emparejamiento de redes virtuales (VNet Peering)

### ¿Qué es el peering?

El emparejamiento conecta dos VNets para que sus recursos se comuniquen como si estuvieran en la misma red. El tráfico viaja por la red troncal privada de Microsoft, sin pasar por Internet, sin cifrado adicional necesario y con baja latencia.

Dos tipos:

- **Regional**: VNets en la misma región
- **Global**: VNets en regiones distintas

> ⚠️ El peering **no es transitivo**. Si A está emparejada con B, y B con C, A no puede comunicarse con C automáticamente. Necesitas emparejar A con C explícitamente, o usar una arquitectura hub-and-spoke con rutas definidas.

---

### Requisitos importantes

- Los espacios de direcciones IP de las VNets emparejadas **no pueden solaparse**
- Si necesitas cambiar el rango de IPs de una VNet emparejada, debes eliminar el peering primero
- Necesitas el rol **Network Contributor** para crear peerings

---

### Opciones de configuración del peering

Al crear un peering hay cuatro opciones clave:

| Opción | Descripción |
|---|---|
| **Tráfico a la VNet remota** | Permite/bloquea tráfico desde esta VNet hacia la remota |
| **Tráfico desde la VNet remota** | Permite/bloquea tráfico reenviado desde la VNet emparejada |
| **Puerta de enlace de red virtual** | Permite que la VNet emparejada use tu VPN Gateway (tránsito de gateway) |
| **Puerta de enlace remota** | Permite que esta VNet use la VPN Gateway de la VNet emparejada |

El **tránsito de gateway** es especialmente útil en arquitecturas hub-and-spoke: las VNets de radio no necesitan su propia VPN Gateway; usan la del hub para conectarse a la red local.

---

### Arquitecturas para extender el peering

Como el peering no es transitivo, estas son las opciones para comunicar recursos de redes no directamente emparejadas:

- **Hub-and-spoke**: una VNet central (hub) con VPN Gateway y/o NVA (Network Virtual Appliance), emparejada con varias VNets de radio. El tráfico entre radios pasa por el hub.
- **Rutas definidas por el usuario (UDR)**: rutas personalizadas que fuerzan el tráfico por una NVA o VPN Gateway de otra VNet.
- **Encadenamiento de servicios**: combinación de UDRs para encadenar el tráfico a través de varios saltos.
- **Azure Virtual Network Manager**: gestión centralizada de topologías de peering a gran escala, sin configuración manual por VNet.

---

## Azure Load Balancer

### ¿Qué hace?

Azure Load Balancer distribuye el tráfico de red entre varias VMs de forma equitativa. Opera en la **capa 4** del modelo OSI (TCP/UDP), lo que significa que enruta basándose en IPs y puertos, sin leer el contenido de las peticiones.

Dos tipos:

- **Load Balancer público**: distribuye tráfico de Internet hacia un grupo de VMs. Asigna la IP pública del LB a las IPs privadas de las VMs del backend.

- **Load Balancer interno (privado)**: distribuye tráfico dentro de la VNet o desde redes locales conectadas. Nunca expone IPs a Internet.

---

### Componentes principales

**Dirección IP de frontend**: la IP que recibe el tráfico (pública o privada).

**Reglas de equilibrio de carga**: definen cómo distribuir el tráfico. Usan un hash de 5 tuplas para decidir qué VM del backend atiende cada conexión: IP origen, puerto origen, IP destino, puerto destino, protocolo.

**Grupo de backend**: conjunto de VMs o instancias de VMSS que atienden las peticiones.

**Sondeos de estado (health probes)**: comprueban periódicamente si cada VM del backend está sana. Si una VM no responde, el LB deja de enviarle tráfico. Tipos: TCP, HTTP y HTTPS.

**Persistencia de sesión**: por defecto el LB envía cada petición a la VM más disponible. Puedes configurar que las peticiones del mismo cliente vayan siempre a la misma VM:

- **IP de cliente** (2 tuplas): misma IP siempre a la misma VM
- **IP + protocolo** (3 tuplas): misma IP y protocolo a la misma VM

**Puertos de alta disponibilidad (HA ports)**: una regla con protocolo `All` y puerto `0` balancea todo el tráfico TCP y UDP independientemente del puerto. Útil para NVAs.

**Reglas NAT de entrada**: permiten acceso directo a una VM concreta del backend (ej: RDP al puerto 3389 de una VM específica).

---

### ¿Cuándo usar Load Balancer?

Úsalo cuando necesites alta disponibilidad y baja latencia para tráfico TCP/UDP dentro de una región. No es adecuado para:

| Necesidad | Mejor alternativa |
|---|---|
| Enrutamiento basado en URL o cabeceras HTTP | Azure Application Gateway |
| Balanceo global entre regiones | Azure Front Door o Azure Traffic Manager |
| Enrutamiento basado en DNS | Azure Traffic Manager |

---

## Azure Application Gateway

### ¿Qué lo diferencia del Load Balancer?

Application Gateway opera en la **capa 7** (HTTP/HTTPS), lo que significa que puede tomar decisiones de enrutamiento basándose en el contenido de las peticiones: ruta URL, nombre de host, cabeceras... Es el ADC (Application Delivery Controller) de Azure.

---

### Componentes principales

**Frontend IP**: IP pública o privada que recibe las peticiones de los clientes.

**Listeners (agentes de escucha)**: escuchan en una combinación de IP, puerto, protocolo y nombre de host. Dos tipos:

- **Básico**: enruta según la ruta de la URL
- **Multisitio**: enruta según el hostname de la URL (varios dominios en la misma gateway)

**Reglas de enrutamiento**: vinculan un listener a un grupo de backend. Dos métodos:

- **Basado en ruta**: `/images/*` → grupo de servidores de imágenes; `/video/*` → grupo de streaming
- **Multisitio**: `contoso.com` → un grupo; `fabrikam.com` → otro grupo

**Grupos de backend**: VMs, VMSS, App Service o servidores locales.

**Configuración HTTP**: define si el tráfico entre la gateway y el backend va cifrado (TLS/SSL de extremo a extremo), el protocolo, la persistencia de sesión y los sondeos de estado.

---

### Firewall de aplicaciones web (WAF)

Componente opcional que inspecciona las peticiones antes de llegar al listener. Detecta y bloquea ataques comunes según las reglas OWASP (OWASP Core Rule Set): inyección SQL, XSS, inclusión de ficheros remotos, contrabando de peticiones HTTP...

Versiones disponibles: CRS 3.2 (recomendado), 3.1, 3.0 y 2.2.9.

---

### Terminación TLS/SSL

Application Gateway puede terminar la conexión TLS en la gateway, descifrar el tráfico y reenviarlo al backend en HTTP (alivia la carga de CPU de los servidores backend). También soporta **TLS de extremo a extremo**: descifra en la gateway y vuelve a cifrar antes de enviar al backend.

---

### ¿Cuándo usar Application Gateway?

- Necesitas enrutamiento basado en URL o nombre de host
- Necesitas WAF para proteger aplicaciones web
- Necesitas terminación TLS para aliviar los servidores
- Necesitas persistencia de sesión (afinidad de sesión basada en cookies)
- Tus aplicaciones usan estado de sesión almacenado en servidores individuales

---

### Comparativa de soluciones de balanceo

| Servicio | Capa OSI | Ámbito | Cuándo usarlo |
|---|---|---|---|
| **Azure Load Balancer** | 4 (TCP/UDP) | Regional | Alta disponibilidad, baja latencia, tráfico masivo |
| **Application Gateway** | 7 (HTTP/HTTPS) | Regional | Enrutamiento por URL/host, WAF, TLS termination |
| **Azure Front Door** | 7 | Global | Balanceo entre regiones, CDN, WAF global |
| **Traffic Manager** | DNS | Global | Distribución de tráfico por DNS entre regiones |

---

## Azure Network Watcher

### ¿Para qué sirve?

Network Watcher es el conjunto de herramientas de diagnóstico y monitorización de red para recursos **IaaS** en Azure (VMs, VNets, VPN gateways, Load Balancers...). No sirve para diagnosticar problemas de PaaS o aplicaciones web.

Se activa automáticamente al crear una VNet en una región.

---

### Herramientas de monitorización

**Topología**: visualización gráfica interactiva de todos los recursos de una VNet y sus relaciones. Útil para entender la configuración actual antes de solucionar problemas.

**Monitor de conexión**: supervisión continua de conectividad entre dos endpoints. Detecta cambios de latencia o pérdida de conectividad con el tiempo. Requiere instalar el agente de Network Watcher en las VMs.

---

### Herramientas de diagnóstico

| Herramienta | Qué resuelve |
|---|---|
| **Verificación del flujo de IP** | ¿Este paquete TCP/UDP está siendo bloqueado? ¿Por qué regla NSG? |
| **Diagnósticos de NSG** | Similar al anterior pero a nivel de subred, VMSS o Application Gateway |
| **Próximo salto** | ¿Por dónde está enrutando el tráfico? ¿Está llegando donde debería? |
| **Reglas de seguridad vigentes** | Muestra todas las reglas NSG efectivas aplicadas a una NIC concreta |
| **Solución de problemas de conexión** | Prueba de conectividad puntual entre dos endpoints (similar al Monitor de conexión pero en un momento dado) |
| **Captura de paquetes** | Captura tráfico de red de una VM de forma remota, sin acceso físico |
| **Solución de problemas de VPN** | Diagnostica el estado de VPN Gateways y sus conexiones |

---

### Herramientas de tráfico

**Registros de flujo**: registran información sobre el tráfico IP que pasa por un NSG o VNet. Los datos se guardan en Azure Storage.

**Análisis de tráfico**: visualizaciones enriquecidas de los registros de flujo. Muestra patrones de tráfico, puertos más usados, IPs con más actividad y posibles amenazas de seguridad.

---

### Casos de uso típicos

- Una VM no puede conectarse a otra por PowerShell remoto → usa **Verificación del flujo de IP** para ver qué regla NSG está bloqueando el puerto 5986
- Tráfico que debería llegar a un servidor acaba en otro lado → usa **Próximo salto** para ver si hay rutas mal configuradas
- Una conexión VPN site-to-site falla → usa **Solución de problemas de VPN** para obtener el diagnóstico
- Quieres saber si hay latencia entre dos regiones para decidir dónde desplegar recursos → configura **Monitor de conexión** entre VMs de las dos regiones

> ⚠️ Network Watcher no diagnostica servicios PaaS (App Service, SQL Database, etc.) ni problemas de aplicaciones web. Para eso usa Application Insights o los logs del servicio correspondiente.

---

## Resumen del módulo 5

| Concepto | Clave |
|---|---|
| VNet | Aislamiento lógico de red en Azure; diseñar espacios de IP antes de crear recursos |
| Subredes | Segmentan la VNet; Azure reserva 5 IPs por subred |
| IP estática | Necesaria para DNS, firewalls basados en IP, certificados TLS vinculados a IP |
| NSG | Firewall de software; reglas evaluadas por prioridad (menor número = mayor prioridad) |
| ASG | Agrupa VMs por rol para simplificar reglas NSG sin depender de IPs |
| Azure DNS | Hospeda zonas DNS; no registra dominios; requiere delegar NS en el registrador |
| Zonas privadas | Resolución de nombres dentro de la VNet sin exposición a Internet |
| Registros de alias | Apuntan el vértice de zona a recursos Azure con IP dinámica sin registros colgantes |
| VNet Peering | Conecta VNets por la red troncal de Microsoft; no es transitivo |
| Tránsito de gateway | Permite que VNets emparejadas compartan una VPN Gateway central |
| Hub-and-spoke | Arquitectura para enrutar tráfico entre VNets no emparejadas directamente |
| Load Balancer | Capa 4; distribución de tráfico TCP/UDP regional; alta disponibilidad |
| Application Gateway | Capa 7; enrutamiento por URL/host; WAF; TLS termination |
| Network Watcher | Diagnóstico de red IaaS; no sirve para PaaS |
| Verificación flujo IP | Identifica qué regla NSG está bloqueando el tráfico |
| Monitor de conexión | Supervisión continua de latencia y conectividad entre endpoints |