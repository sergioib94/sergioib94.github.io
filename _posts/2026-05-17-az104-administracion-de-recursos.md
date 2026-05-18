---
title: "Implementación y administración de recursos de proceso"
date: 2026-05-18T17:15:00+02:00
categories: [Azure, AZ-104, Apuntes]
description: "Apuntes del módulo 4 del AZ-104: máquinas virtuales, disponibilidad, escalado, App Service, Azure Container Instances y Container Apps."
card_image: /assets/images/cards/az.png
---

Este módulo cubre los servicios de cómputo de Azure: cómo crear y dimensionar máquinas virtuales, garantizar su disponibilidad, desplegar aplicaciones web con App Service y trabajar con contenedores.

---

## Máquinas virtuales de Azure

### Lista de comprobación antes de crear una VM

Crear una VM en Azure no es simplemente pulsar un botón. Hay decisiones que conviene tomar antes para no tener que rehacerlo todo después:

**Red** — Lo primero y más importante. Diseña la red antes de crear nada. Las redes virtuales (VNet), subredes y rangos de IP son difíciles de cambiar una vez configurados. Piensa en qué servicios necesitan comunicarse entre sí y si hay que conectar con la red local (on-premises).

Para proteger el tráfico entre subredes usa **Grupos de seguridad de red (NSG)**: actúan como firewalls de software que filtran tráfico entrante y saliente a nivel de interfaz de red y subred.

**Nombre** — El nombre de la VM se convierte en el nombre del equipo dentro del SO y en el nombre del recurso en Azure. Difícil de cambiar después. Usa una convención que incluya entorno, región, rol e instancia. Ejemplo: `prodeus-webvm01` (producción, East US, servidor web, instancia 01).

**Región** — Elige la región más cercana a los usuarios para reducir latencia. Ten en cuenta que no todos los tamaños de VM están disponibles en todas las regiones, y los precios varían entre regiones.

**Tamaño** — Azure ofrece familias de VM según la carga de trabajo:

| Familia | Relación | Cuándo usarla |
|---|---|---|
| **Uso general** | CPU/memoria equilibrada | Desarrollo, BBDDs pequeñas, servidores web ligeros |
| **Optimizada para cómputo** | CPU alta | Servidores web de alto tráfico, procesamiento por lotes |
| **Optimizada para memoria** | Memoria alta | Bases de datos relacionales, cachés, análisis en memoria |
| **Optimizada para almacenamiento** | I/O alta | Bases de datos con muchas operaciones de disco |
| **GPU** | Gráficos/IA | Renderizado, entrenamiento de modelos de ML |
| **Alto rendimiento** | CPU máxima + red rápida | HPC, simulaciones científicas |

> 💡 Puedes cambiar el tamaño de una VM en caliente si el nuevo tamaño está disponible en el mismo clúster de hardware. Si no, hay que detener y desasignar la VM primero (esto sí permite cualquier tamaño disponible en la región).

---

### Discos de una VM

Toda VM tiene al menos dos discos: el de SO y un disco temporal. Los datos de aplicación deben ir en **discos adicionales** independientes, así puedes desasociarlos y reasignarlos si la VM falla.

Tipos de disco de mejor a peor rendimiento:

| Tipo | Caso de uso |
|---|---|
| **Ultra Disk** | SAP HANA, Oracle, SQL de misión crítica |
| **SSD Premium v2** | Producción con alta carga de I/O |
| **SSD Premium** | Producción general sensible al rendimiento |
| **SSD Estándar** | Servidores web, entornos de dev/test |
| **HDD Estándar** | Backups, datos de acceso poco frecuente |

> ⚠️ Ultra Disk y SSD Premium v2 **no pueden usarse como disco del SO**, solo como discos de datos.

---

### Modelo de precios

Los costes de una VM tienen dos componentes independientes:

**Cómputo** — Se factura por minuto. Se para cuando desasignas la VM (no cuando la "paras" sin desasignar). Dos opciones de pago:

- **Pago por uso**: flexible, sin compromiso, ideal para cargas variables o temporales
- **Instancias reservadas**: compromiso de 1 o 3 años, hasta un 72% de descuento. Ideal para VMs que corren continuamente

**Almacenamiento** — Se cobra siempre, incluso cuando la VM está parada o desasignada. Los discos existen aunque la VM no esté corriendo.

---

### Opciones para crear y gestionar VMs

| Herramienta | Cuándo usarla |
|---|---|
| **Azure Portal** | Primeras pruebas, operaciones puntuales |
| **CLI de Azure** | Scripts en Linux/macOS, automatización multiplataforma |
| **Azure PowerShell** | Scripts en Windows, automatización de tareas repetidas |
| **Plantillas ARM / Bicep** | Infraestructura como código, despliegues reproducibles |
| **Terraform** | IaC multi-cloud con HCL |
| **SDK (C#, Python, Java...)** | Gestión de VMs dentro de una aplicación |
| **Extensiones de VM** | Configuración e instalación de software post-despliegue |
| **Azure Automation** | Automatización de mantenimiento: actualizaciones, configuración, monitorización |

---

## Disponibilidad de máquinas virtuales

### Tipos de interrupciones

Azure distingue tres tipos de eventos que pueden afectar a una VM:

- **Mantenimiento no planeado**: el hardware está a punto de fallar. Azure usa **migración en vivo** para mover la VM a un servidor sano con una pausa mínima.

- **Tiempo de inactividad inesperado**: fallo imprevisto de hardware (disco, red, alimentación). Azure mueve la VM automáticamente, pero hay un reinicio.

- **Mantenimiento planeado**: Microsoft actualiza la plataforma. Se hace de forma escalonada para minimizar el impacto.

---

### Conjuntos de disponibilidad

Agrupación lógica de VMs que garantiza que no todas se vean afectadas por el mismo evento de mantenimiento o fallo de hardware. Azure distribuye las VMs del conjunto entre **dominios de error** y **dominios de actualización**.

- **Dominio de error**: grupo de VMs que comparten el mismo bastidor físico (fuente de alimentación, switches). Máximo 2 dominios de error por defecto. Protege contra fallos de hardware físico.

- **Dominio de actualización**: grupo de VMs que se reinician juntas durante el mantenimiento planeado. De 1 a 20 dominios (5 por defecto). Solo se reinicia un dominio de actualización a la vez.

> 💡 Una VM solo puede añadirse a un conjunto de disponibilidad **en el momento de su creación**. No se puede cambiar después sin recrear la VM.

Buenas prácticas con conjuntos de disponibilidad:

- Coloca cada capa de la aplicación (web, app, BBDD) en su propio conjunto de disponibilidad
- Combínalos con Azure Load Balancer para distribuir el tráfico

---

### Zonas de disponibilidad

Llevan la protección un nivel más arriba: cada zona es un datacenter físicamente separado dentro de la misma región, con energía, red y refrigeración independientes. Hay mínimo 3 zonas por región habilitada.

Diferencia clave respecto a los conjuntos de disponibilidad:

- **Conjuntos de disponibilidad**: protegen contra fallos dentro de un datacenter
- **Zonas de disponibilidad**: protegen contra la caída de un datacenter completo

---

### Escalado: vertical vs horizontal

**Escalado vertical** (scale up/down): cambiar el tamaño de la VM. Más sencillo pero requiere reinicio y tiene límite de hardware.

**Escalado horizontal** (scale out/in): añadir o quitar instancias de VM. Más flexible, sin límite práctico, no requiere reinicio. Es la opción recomendada para cargas variables en producción.

---

### Virtual Machine Scale Sets (VMSS)

Permiten crear y gestionar un grupo de VMs idénticas que escalan automáticamente según la demanda. No hay que aprovisionar las VMs por adelantado.

Características principales:

- Dos modos de orquestación: **Uniforme** (todas idénticas) y **Flexible** (pueden variar entre sí). El modo flexible es el recomendado para nuevas implementaciones.

- Compatible con **Azure Load Balancer** (capa 4) y **Azure Application Gateway** (capa 7)

- El escalado automático se configura con reglas basadas en métricas (CPU, memoria) o en programación horaria

Parámetros de escalado automático a configurar:

- Número mínimo, máximo y predeterminado de instancias
- Umbral de CPU para escalar hacia fuera (añadir instancias)
- Umbral de CPU para escalar hacia dentro (eliminar instancias)
- Duración de la consulta de métricas (para estabilizar antes de actuar)

---

### Continuidad de negocio y backup

**Azure Site Recovery**: replica VMs completas a una región secundaria. Si la región principal cae, puedes hacer failover a la secundaria en minutos. También sirve para probar planes de recuperación ante desastres sin afectar producción.

**Azure Backup**: copia de seguridad como servicio. Guarda los datos en un **almacén de Recovery Services**. Soporta VMs Windows y Linux, SQL Server, SharePoint, Exchange y ficheros. Ventajas clave: sin límite de retención, cifrado de datos, copias coherentes con la aplicación y sin coste por la transferencia de datos.

---

## Azure App Service

### ¿Qué es App Service?

Plataforma como servicio (PaaS) para hospedar aplicaciones web, APIs REST y backends móviles sin gestionar servidores. Soporta .NET, Java, Node.js, Python y PHP en Windows y Linux.

Ventajas principales:

- Integración CI/CD con GitHub, Azure DevOps, Bitbucket y Docker Hub
- Escalado automático horizontal y vertical
- Certificados SSL, autenticación integrada y cumplimiento normativo (ISO, SOC, PCI)
- Visual Studio y VS Code integrados

---

### Planes de App Service

El plan determina los recursos (CPU, RAM) y las funcionalidades disponibles. Los niveles son: Free, Shared, Basic, Standard, Premium e Isolated. A partir de **Standard** se pueden usar slots de despliegue.

---

### Slots de despliegue

Un slot es una instancia paralela de la aplicación con su propio hostname. Permiten:

- Desplegar en staging y validar antes de pasar a producción
- Hacer **swap** (intercambio) entre slots sin tiempo de inactividad: las instancias ya están calientes cuando se intercambian
- Revertir al estado anterior haciendo el swap inverso

La configuración se divide en dos tipos:

- **Intercambiable**: pasa de un slot al otro al hacer swap (código, extensiones, cadenas de conexión marcadas como no específicas de slot...)

- **Específica del slot**: permanece en el slot aunque se haga swap (nombre de dominio personalizado, certificados, configuración de escala...)

---

### Dominios personalizados

Por defecto App Service asigna un subdominio de `azurewebsites.net`. Para usar tu propio dominio:

1. Reserva el dominio (puedes hacerlo desde el Portal de Azure)
2. Crea un registro DNS: **CNAME** (para subdominios, apunta al nombre de Azure) o **A** (para el dominio raíz, apunta a la IP de Azure)
3. Valida y añade el dominio en el Portal

> 💡 Prefiere CNAME cuando sea posible: si cambia la IP de Azure, el CNAME sigue funcionando. Un registro A requeriría actualización manual.

---

### Seguridad y autenticación

App Service tiene un módulo de autenticación y autorización integrado que se ejecuta antes de que llegue el código de la aplicación. No requiere cambios en el código.

Soporta Microsoft Entra ID, Google, Facebook y X (Twitter). Dos modos:

- **Permitir solicitudes anónimas**: el código de la aplicación gestiona la autenticación
- **Solo solicitudes autenticadas**: redirige automáticamente a login; sin código necesario

---

### Application Insights

Extensión de Azure Monitor para supervisar aplicaciones en tiempo real. Detecta anomalías automáticamente y permite analizar tasas de solicitud, tiempos de respuesta, errores, dependencias externas, excepciones y rendimiento de carga de páginas. Útil para correlacionar problemas con despliegues recientes.

---

## Contenedores en Azure

### VM vs Contenedor

| | **VM** | **Contenedor** |
|---|---|---|
| Aislamiento | SO completo independiente | Comparte el kernel del SO host |
| Tamaño | Gigabytes | Megabytes |
| Arranque | Minutos | Segundos |
| SO | Propio completo | Modo usuario del SO |
| Gestión | Hyper-V, VMware | Docker, Kubernetes |
| Tolerancia a fallos | Failover a otro servidor | El orquestador recrea el contenedor en segundos |

Los contenedores son ideales cuando necesitas desplegar muchas instancias pequeñas rápidamente, o cuando quieres garantizar que la aplicación se comporta igual en desarrollo, staging y producción.

---

### Azure Container Instances (ACI)

La forma más rápida de correr un contenedor en Azure sin gestionar infraestructura. Sin VMs, sin Kubernetes, sin configuración de clústeres.

Características:

- Arranque en segundos
- IP pública y nombre DNS configurables
- CPU y memoria asignables por contenedor (0,1-4 vCPU, 0,1-16 GB)
- Soporta contenedores Linux y Windows
- Puede montar Azure Files para almacenamiento persistente
- Despliegue en VNet para comunicación privada

**Grupos de contenedores**: varios contenedores que comparten host, IP, ciclo de vida y volúmenes. Similar a un pod de Kubernetes. Se definen con plantillas ARM, Bicep o YAML.

Casos de uso típicos para grupos multicontenedor: app web + sidecar de logs, app + contenedor de monitorización, frontend + backend en el mismo grupo.

> ⚠️ ACI es ideal para tareas aisladas, de corta duración o lotes. Para microservicios a largo plazo, considera Container Apps o AKS.

---

### Azure Container Apps (ACA)

Plataforma serverless para microservicios y aplicaciones basadas en eventos. Construida sobre Kubernetes internamente, pero sin exponer su complejidad.

Escala automáticamente en función de tráfico HTTP, eventos (colas, mensajes), CPU/memoria o reglas KEDA. Puede escalar hasta cero instancias cuando no hay tráfico.

Diferencias clave respecto a ACI y AKS:

| | **ACI** | **Container Apps** | **AKS** |
|---|---|---|---|
| Complejidad | Mínima | Media | Alta |
| Casos de uso | Tareas cortas, aisladas | Microservicios, APIs, eventos | Orquestación compleja |
| Control Kubernetes | Ninguno | Abstraído | Completo |
| Escalado automático | No | Sí (hasta cero) | Sí |
| Gestión de infraestructura | Nula | Nula | Parcial (nodos gestionados) |

---

## Resumen del módulo 4

| Concepto | Clave |
|---|---|
| Planificación de red | Diseñar VNet y subredes antes de crear VMs; difícil de cambiar después |
| NSG | Firewall de software a nivel de subred e interfaz de red |
| Tamaños de VM | Elegir según carga: uso general, cómputo, memoria, almacenamiento, GPU |
| Discos | SO + temporal incluidos; añadir discos de datos para la aplicación |
| Pago por uso vs RI | RI: hasta 72% de descuento para VMs que corren continuamente |
| Conjuntos de disponibilidad | Dominios de error (hardware) + dominios de actualización (mantenimiento planeado) |
| Zonas de disponibilidad | Protección a nivel de datacenter completo dentro de una región |
| VMSS | Escalado automático de grupos de VMs idénticas |
| Escalado horizontal | Añadir/quitar instancias; más flexible y sin límite que el vertical |
| Azure Backup | Backup como servicio con almacén de Recovery Services; sin límite de retención |
| Azure Site Recovery | Replicación y failover entre regiones para continuidad de negocio |
| App Service | PaaS para web, APIs y móvil; sin gestionar servidores |
| Slots de despliegue | Entornos paralelos para validar antes de pasar a producción con swap sin downtime |
| ACI | Contenedores aislados sin infraestructura; arranque en segundos |
| Container Apps | Microservicios serverless con escalado automático hasta cero |
| AKS | Kubernetes gestionado para orquestación compleja; máximo control |