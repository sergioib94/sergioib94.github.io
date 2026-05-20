---
title: "Supervisión y copia de seguridad de recursos"
date: 2026-05-20T18:15:00+02:00
categories: [Azure, AZ-104, Apuntes]
description: "Apuntes del módulo 6 del AZ-104: Azure Backup para proteger VMs y datos, y Azure Monitor para supervisar el rendimiento y estado de los recursos."
card_image: /assets/images/cards/az.png
---

Este módulo cubre dos pilares fundamentales de la operación en Azure: cómo proteger los datos con copias de seguridad y cómo supervisar el estado y rendimiento de los recursos.

---

## Azure Backup

### ¿Qué es Azure Backup?

Azure Backup es el servicio de copia de seguridad nativo de Azure. Sin servidores que mantener, sin almacenamiento que aprovisionar, sin infraestructura que gestionar. Microsoft se encarga de todo eso; tú defines qué quieres proteger y con qué política.

Protege una amplia gama de recursos:

- Máquinas virtuales de Azure (Windows y Linux)
- Discos administrados de Azure
- SQL Server en VMs de Azure
- Bases de datos SAP HANA en VMs de Azure
- Recursos compartidos de Azure Files
- Blobs de Azure
- Azure Database for PostgreSQL y MySQL
- Clústeres de Kubernetes

---

### Conceptos clave: RTO y RPO

Antes de hablar de cómo funciona el backup, hay dos conceptos críticos que definen los requisitos de protección de datos:

- **RPO (Recovery Point Objective)**: la máxima pérdida de datos tolerable medida en tiempo. Si tu RPO es de 1 hora, necesitas hacer backups cada hora como mínimo. Si falla algo, perderás como máximo 1 hora de datos.

- **RTO (Recovery Time Objective)**: el tiempo máximo tolerable para recuperarse de un desastre. Si tu RTO es de 4 horas, el sistema debe estar operativo en menos de 4 horas tras el incidente.

Cuanto más estrictos sean el RPO y el RTO, más frecuentes deben ser los backups y más rápido debe ser el proceso de restauración, lo que generalmente implica mayor coste.

---

### Cómo funciona Azure Backup

El servicio se organiza en tres capas:

**Capa de integración con la carga de trabajo**

Una extensión de backup se instala en la VM origen. En el momento definido por la política, genera la copia de seguridad (instantánea para VMs o Azure Files, backup en streaming para bases de datos).

**Plano de datos: tres niveles de almacenamiento**

| Nivel | Descripción | Acceso |
|---|---|---|
| **Instantánea** | Copia local almacenada junto al disco durante max. 5 días | Más rápido para restaurar |
| **Estándar (Vault)** | Copia aislada en un tenant administrado por Microsoft | Mayor seguridad y retención |
| **Archivo** | Para datos de retención a largo plazo (cumplimiento legal) | Más económico, acceso menos frecuente |

> 💡 La restauración desde el nivel de instantánea (llamada **restauración instantánea**) es mucho más rápida que desde el vault, porque los datos están localmente disponibles sin necesidad de descargarlos primero.

**Plano de administración: almacenes**

El **almacén de Recovery Services** es el contenedor donde se gestionan y almacenan los backups. Actúa como límite de RBAC para controlar quién puede hacer qué con las copias de seguridad.

El **Centro de copias de seguridad (Backup Center)** es la consola centralizada para gestionar backups de múltiples almacenes, suscripciones, regiones e inquilinos desde un solo panel.

---

### Tipos de backup soportados

| Tipo | Descripción | Cuándo usarlo |
|---|---|---|
| **Completo** | Copia de toda la base de datos o VM | Máximo una vez al día; base de la cadena de backups |
| **Diferencial** | Solo cambios desde el último backup completo | Máximo una vez al día; no compatible el mismo día que el completo |
| **Incremental** | Solo cambios desde el backup anterior (completo o incremental) | El más eficiente en espacio y tiempo |
| **Log de transacciones** | Para SQL Server; permite recuperación a un punto exacto | Cada 15 minutos; RPO de 15 minutos |
| **Por hora** | VMs con política mejorada | Intervalos de 4, 6, 8, 12 o 24 horas |

---

### Redundancia del almacenamiento de backups

Al igual que con Azure Storage, puedes elegir cómo se replican los datos del backup:

| Opción | Protege contra | Cuándo usarla |
|---|---|---|
| **LRS** | Fallos de hardware en un datacenter | Escenarios no críticos, menor coste |
| **ZRS** | Caída de una zona de disponibilidad | Alta disponibilidad dentro de una región |
| **GRS** | Desastre regional completo | Recomendado para la mayoría de backups |

---

### Seguridad en Azure Backup

- **Cifrado**: los datos se cifran en tránsito y en reposo con claves administradas por Microsoft (PMK) o por el cliente (CMK en Azure Key Vault)
- **RBAC**: controla quién puede configurar, ejecutar o restaurar backups
- **Eliminación temporal (Soft Delete)**: los backups eliminados se conservan 14 días adicionales de forma gratuita, protegiéndolos contra eliminaciones accidentales o ataques de ransomware. La **eliminación temporal mejorada** permite mantener el estado eliminado por más tiempo y puede configurarse como siempre activa
- **Sin conectividad a Internet**: para VMs de Azure, todo el tráfico de backup viaja por la red troncal de Microsoft, sin necesidad de IPs públicas ni FQDNs

---

### Coherencia de las instantáneas de VM

Cuando Azure Backup hace una instantánea de una VM, puede obtener distintos niveles de coherencia:

- **Coherente con la aplicación**: captura el estado completo de la VM incluyendo memoria y operaciones de I/O pendientes (usa VSS en Windows, scripts pre/post en Linux). Es el nivel ideal: restauración sin necesidad de limpiar nada.

- **Coherente con el sistema de ficheros**: si falla VSS o los scripts, se crea una instantánea coherente a nivel de ficheros. La VM arranca sin daños pero las aplicaciones pueden necesitar limpieza al iniciar.

- **Coherente frente a bloqueos**: si la VM estaba apagada durante el backup. No captura memoria ni I/O pendiente. Similar a desconectar el cable de corriente; las aplicaciones harán su propia recuperación al arrancar.

---

### Azure Backup vs Azure Site Recovery

Es importante no confundirlos:

| | **Azure Backup** | **Azure Site Recovery** |
|---|---|---|
| Objetivo | Copias puntuales para recuperar datos | Replicación continua para failover |
| RPO | Minutos u horas (según política) | Segundos (replicación casi en tiempo real) |
| Caso de uso | Eliminación accidental, ransomware, corrupción de datos | Desastre regional, continuidad de negocio |
| Datos perdidos en un fallo | Hasta el último punto de backup | Mínimos (segundos) |

En resumen: Backup para recuperar datos del pasado; Site Recovery para mantener el servicio activo ante fallos.

---

### Opciones de restauración de VMs

| Opción | Descripción |
|---|---|
| **Crear nueva VM** | Despliega una VM nueva a partir del punto de restauración |
| **Restaurar disco** | Restaura el disco para adjuntarlo a una VM existente o crear una nueva personalizada |
| **Reemplazar disco existente** | Sustituye el disco de la VM actual por el del punto de recuperación |
| **Entre regiones** | Restaura en la región secundaria emparejada (solo crear VM o recuperar disco) |
| **Entre suscripciones** | Restaura en una suscripción diferente del mismo tenant |
| **Entre zonas** | Restaura en una zona de disponibilidad diferente |
| **Discos selectivos** | Restaura solo un subconjunto de los discos de la VM |

También puedes recuperar **ficheros individuales** sin restaurar toda la VM, montando la instantánea como un disco iSCSI en el equipo de destino.

---

### Retención: corto y largo plazo

- **Retención a corto plazo**: minutos o días
- **Retención a largo plazo (LTR)**: semanas, meses o años para cumplimiento normativo
  - **Planeada**: sabes de antemano que necesitarás los datos durante X años
  - **No planeada**: backup a petición con retención personalizada, independiente de la política programada

> ⚠️ Los backups a petición tienen su propia configuración de retención; la política programada del almacén no se aplica a ellos.

---

## Azure Monitor para máquinas virtuales

### ¿Qué es Azure Monitor?

Azure Monitor es la solución centralizada de supervisión de Azure. Recopila, analiza y permite actuar sobre datos de monitorización de todos los recursos de Azure (y también de recursos externos).

Dos tipos de datos fundamentales:

- **Métricas**: valores numéricos recogidos a intervalos regulares (porcentaje de CPU, bytes de red, operaciones de disco...). Se almacenan automáticamente durante 93 días.

- **Registros (logs)**: eventos del sistema con marca de tiempo y datos estructurados. Requieren configuración para recopilarlos; se almacenan en un **área de trabajo de Log Analytics**.

---

### Capas de supervisión de una VM

Una VM tiene cuatro capas que pueden necesitar supervisión independiente:

```
VM Host          → métricas automáticas (CPU, disco, red del host)
SO invitado      → requiere Azure Monitor Agent + DCR
Cargas de trabajo → requiere Azure Monitor Agent + DCR
Aplicaciones     → Application Insights (si aplica)
```

---

### Métricas del host (automáticas)

Azure recopila automáticamente estas métricas de cada VM sin configuración adicional:

- **Disponibilidad de la VM**: ¿está corriendo?
- **Porcentaje de CPU**
- **Bytes de disco** (lectura + escritura)
- **Tráfico de red** (entrante + saliente)
- **Operaciones de disco por segundo**

Puedes verlas en la pestaña **Supervisión** de la página de la VM en el Portal, o explorar métricas adicionales con el **Explorador de métricas de Azure Monitor**.

---

### Alertas recomendadas

Al crear una VM (o desde su configuración posterior), puedes habilitar **reglas de alerta recomendadas**: un conjunto predefinido de alertas basadas en umbrales de CPU, memoria, disco y red, incluyendo una alerta de disponibilidad que notifica cuando la VM deja de correr.

Las alertas pueden notificar por correo electrónico, SMS o webhook.

---

### Registros de actividad

Azure registra automáticamente todos los eventos de gestión de la VM (creación, modificación, inicio, parada...) en el **Registro de actividad**. Por defecto se conservan 90 días; puedes enviarlo a Log Analytics (hasta 2 años), Azure Storage (archivado barato) o Event Hubs (reenvío externo).

---

### Diagnósticos de arranque

Permiten ver capturas de pantalla del hipervisor y la salida de la consola serie durante el arranque de la VM. Imprescindibles para diagnosticar VMs que no arrancan correctamente. Se habilitan al crear la VM o desde la configuración posterior.

---

### Azure Monitor Agent y DCR

Para recopilar métricas y logs del **sistema operativo invitado** (no solo del host), necesitas dos cosas:

- **Azure Monitor Agent (AMA)**: se instala dentro de la VM y envía datos a Azure Monitor
- **Data Collection Rule (DCR)**: define qué datos recopilar (contadores de rendimiento, logs de eventos, Syslog...) y a dónde enviarlos (métricas de Azure Monitor o Log Analytics)

Una DCR puede asociarse a múltiples VMs. Puedes tener varias DCRs para recopilar distintos tipos de datos de distintas VMs.

---

### VM Insights

VM Insights es la forma más rápida de empezar a supervisar el interior de una VM. Al habilitarlo:

1. Instala automáticamente el **Azure Monitor Agent** en la VM
2. Crea una **DCR predefinida** que recoge los contadores de rendimiento más comunes (CPU, memoria, disco, red del SO invitado)
3. Genera **libros (workbooks) predefinidos** con gráficos de rendimiento listos para usar
4. Opcionalmente activa el **mapa de dependencias**: visualiza los procesos en ejecución y sus conexiones de red hacia otros servicios

> 💡 VM Insights es el punto de partida recomendado. Si necesitas recopilar datos adicionales (eventos de Windows, Syslog de Linux, contadores personalizados), crea DCRs adicionales.

---

### Log Analytics y KQL

Los datos de registro recopilados por las DCRs se almacenan en un **área de trabajo de Log Analytics**. Para consultarlos se usa **KQL (Kusto Query Language)**, el lenguaje de consulta de Azure Monitor.

Ejemplo básico para ver todos los eventos de Syslog de una VM Linux:

```kql
Syslog
| where TimeGenerated > ago(1h)
| order by TimeGenerated desc
```

Puedes acceder a Log Analytics desde la VM (menú Registros) o desde la página de Azure Monitor.

---

### Explorador de métricas

Herramienta visual para crear gráficos personalizados de métricas. Permite:
- Combinar varias métricas en el mismo gráfico
- Cambiar la agregación (promedio, máximo, mínimo, suma, recuento)
- Seleccionar intervalos de tiempo flexibles (30 minutos a 30 días)
- Comparar la misma métrica entre varias VMs
- Anclar gráficos a paneles de Azure

---

### Backup Explorer y supervisión a escala

Para entornos con muchos almacenes y suscripciones:

- **Backup Explorer**: vista agregada de todos los recursos de backup en Azure. Permite supervisar actividades operativas a través de múltiples inquilinos, regiones y suscripciones desde un único panel.

- **Azure Monitor + Log Analytics**: Azure Backup se integra con Log Analytics para supervisión avanzada, consultas complejas e informes mediante Workbooks.

---

## Resumen del módulo 6

| Concepto | Clave |
|---|---|
| RPO | Máxima pérdida de datos tolerable en tiempo; define la frecuencia del backup |
| RTO | Tiempo máximo para recuperarse; define la velocidad necesaria de restauración |
| Almacén de Recovery Services | Contenedor de gestión y almacenamiento de backups; límite de RBAC |
| Backup Center | Consola centralizada para gestionar backups a escala multi-almacén |
| Nivel de instantánea | Copia local, max. 5 días; restauración instantánea más rápida |
| Nivel de vault | Copia aislada en tenant de Microsoft; mayor seguridad y retención larga |
| Nivel de archivo | Retención a largo plazo para cumplimiento; acceso esporádico |
| Soft Delete | 14 días de retención adicional gratuita tras eliminar un backup |
| Coherencia con la aplicación | Nivel óptimo; captura estado completo incluyendo memoria |
| Backup vs Site Recovery | Backup = recuperar datos del pasado; Site Recovery = mantener servicio ante desastres |
| Métricas del host | Automáticas; no requieren configuración; 93 días de retención |
| Azure Monitor Agent | Necesario para supervisar el SO invitado; recoge datos desde dentro de la VM |
| DCR | Define qué datos recopilar y a dónde enviarlos |
| VM Insights | Instalación rápida de AMA + DCR predefinida + workbooks de rendimiento |
| Log Analytics + KQL | Almacén y consulta de logs; permite análisis de causa raíz |
| Explorador de métricas | Gráficos personalizados de métricas del host |
| Alertas recomendadas | Conjunto predefinido de alertas de CPU, memoria, disco y disponibilidad |