---
title: "AZ-104: Implementación y administración del almacenamiento en Azure"
date: 2026-05-16T20:43:00+02:00
categories: [Azure, az-104, Apuntes]
description: "Apuntes del módulo 3 del AZ-104: servicios de Azure Storage, tipos de cuentas, estrategias de replicación, Blob Storage, niveles de acceso, seguridad, Azure Files y File Sync."
card_image: /assets/images/cards/az.png
---

Este módulo cubre todo lo relacionado con el almacenamiento en Azure: qué servicios existen, cómo elegir el tipo de cuenta adecuado, cómo proteger los datos y cómo gestionar el ciclo de vida de la información.

---

## Azure Storage: conceptos fundamentales

### ¿Qué es Azure Storage?

Azure Storage es la solución de almacenamiento en la nube de Microsoft. Es escalable, duradero, seguro y accesible desde cualquier lugar vía HTTP/HTTPS. Microsoft se encarga del mantenimiento, las actualizaciones y el hardware; tú solo gestionas los datos.

Soporta tres categorías de datos:

| Categoría | Descripción | Servicios |
|---|---|---|
| **Datos de VM** | Discos y archivos para máquinas virtuales | Azure Managed Disks |
| **Datos no estructurados** | Datos sin formato relacional (binarios, texto libre) | Blob Storage, Data Lake Storage |
| **Datos estructurados** | Datos relacionales o NoSQL con esquema | Table Storage, Cosmos DB, Azure SQL |

---

### Los cuatro servicios de Azure Storage

**Azure Blob Storage**

Almacén de objetos para datos no estructurados (imágenes, vídeos, documentos, backups, logs...). Accesible desde cualquier lugar vía HTTP/HTTPS o SDK. Ideal para streaming, distribución de contenido, backups y análisis.

**Azure Files**

Recursos compartidos de archivos en la nube accesibles mediante SMB o NFS. Varias VMs pueden montar el mismo recurso compartido. Es el reemplazo natural de un servidor de archivos local.

**Azure Queue Storage**

Cola de mensajes para procesamiento asíncrono. Cada mensaje puede pesar hasta 64 KB y una cola puede contener millones de mensajes. Útil para desacoplar componentes de una aplicación.

**Azure Table Storage**

Base de datos NoSQL sin esquema para datos estructurados no relacionales. Rápida y económica. Para escenarios más avanzados existe la **Table API de Azure Cosmos DB**, con mejor rendimiento y distribución global.

---

### Tipos de cuentas de almacenamiento

Al crear una cuenta de almacenamiento en Azure debes elegir el tipo según tus necesidades:

| Tipo | Servicios | Rendimiento | Cuándo usarlo |
|---|---|---|---|
| **Standard GPv2** | Blob, Files, Queue, Table | HDD | La opción por defecto para la mayoría de escenarios |
| **Premium blobs en bloques** | Blob (blobs en bloques y anexos) | SSD | Aplicaciones con muchas transacciones o baja latencia requerida |
| **Premium recursos compartidos de archivos** | Azure Files | SSD | Recursos compartidos de alto rendimiento con SMB/NFS |
| **Premium blobs en páginas** | Solo blobs en páginas | SSD | Discos de VMs, bases de datos |

> 💡 Standard usa HDD (más barato, para uso general). Premium usa SSD (más caro, para cargas de trabajo intensivas en I/O).

---

### Estrategias de replicación

Todos los datos en Azure Storage se replican automáticamente. La pregunta es **cuánto** y **dónde**:

| Opción | Qué protege | Lectura en región secundaria |
|---|---|---|
| **LRS** (Local Redundant Storage) | Fallos de nodo dentro del mismo datacenter | No |
| **ZRS** (Zone Redundant Storage) | Caída de una zona de disponibilidad completa | No |
| **GRS** (Geo Redundant Storage) | Desastre regional completo | Solo tras failover iniciado por Microsoft |
| **RA-GRS** | Lo mismo que GRS | Sí, siempre disponible |
| **GZRS** | Caída de zona + desastre regional | Solo tras failover |
| **RA-GZRS** | Lo mismo que GZRS | Sí, siempre disponible |

La regla para elegir es sencilla: cuanto mayor sea el riesgo que quieres cubrir, más redundancia necesitas, y mayor será el coste. Para producción crítica lo recomendado es **RA-GRS** o **RA-GZRS**.

> ⚠️ LRS es el mínimo: protege contra fallos de hardware dentro de un datacenter, pero si el datacenter entero falla (incendio, inundación), pierdes los datos.

---

### Acceso y puntos de conexión

Cada cuenta de almacenamiento tiene URLs predeterminadas por servicio:

```
Blob:   https://<cuenta>.blob.core.windows.net
Files:  https://<cuenta>.file.core.windows.net
Queue:  https://<cuenta>.queue.core.windows.net
Table:  https://<cuenta>.table.core.windows.net
```

Para acceder a un blob concreto: `https://<cuenta>.blob.core.windows.net/<contenedor>/<blob>`

Puedes configurar un **dominio personalizado** creando un registro CNAME en DNS que apunte desde tu subdominio al endpoint de Azure. Por ejemplo: `blobs.contoso.com → miCuenta.blob.core.windows.net`.

Para restringir el acceso por red tienes dos opciones:

- **Puntos de conexión de servicio**: mantienen el endpoint público pero limitan el acceso a redes virtuales y subredes específicas. Válido para entornos de desarrollo.

- **Puntos de conexión privados**: asignan una IP privada de tu VNet a la cuenta de almacenamiento. Todo el tráfico va por la red troncal de Microsoft, sin exposición a Internet. **Recomendado para producción.**

---

## Azure Blob Storage

### Estructura de Blob Storage

Blob Storage organiza los datos en tres niveles:

```
Cuenta de almacenamiento
    └── Contenedor
            └── Blob
```

Un blob no puede existir fuera de un contenedor. Una cuenta puede tener contenedores ilimitados y un contenedor puede tener blobs ilimitados.

Al crear un contenedor debes definir su **nivel de acceso público**:

- **Privado** (por defecto): solo el propietario puede acceder
- **Blob**: acceso anónimo de lectura solo a los blobs individuales
- **Contenedor**: acceso anónimo de lectura y listado a todo el contenedor

> 💡 Mantén el acceso anónimo deshabilitado en cuentas con datos sensibles. Las nuevas cuentas lo tienen deshabilitado por defecto.

---

### Tipos de blobs

| Tipo | Uso |
|---|---|
| **Blob en bloques** | El tipo por defecto. Para texto, imágenes, vídeos, cualquier fichero general |
| **Blob en anexos** | Optimizado para añadir datos al final (logs, registros de auditoría) |
| **Blob en páginas** | Hasta 8 TB. Para operaciones frecuentes de lectura/escritura. Lo usan los discos de VMs |

---

### Niveles de acceso de blobs

El nivel de acceso controla el coste: **más frío = más barato almacenar, más caro acceder**.

| Nivel | Mínimo almacenamiento | Latencia | Cuándo usarlo |
|---|---|---|---|
| **Frecuente (Hot)** | Sin mínimo | Milisegundos | Datos activos, accedidos constantemente |
| **Esporádico (Cool)** | 30 días | Milisegundos | Backups a corto plazo, contenido multimedia antiguo |
| **Frío (Cold)** | 90 días | Milisegundos | Datos poco usados, archivado a medio plazo |
| **Archivo (Archive)** | 180 días | Horas | Cumplimiento legal, backups secundarios, datos raramente accedidos |

Para recuperar datos del nivel Archivo hay que **rehidratarlos** primero, lo que puede tardar hasta 15 horas (prioridad estándar) o hasta 1 hora para objetos menores de 10 GB (alta prioridad, con coste adicional).

---

### Reglas de ciclo de vida

En lugar de gestionar manualmente los niveles, puedes definir reglas automáticas que mueven o eliminan blobs según su antigüedad. Funcionan con bloques `if → then`:

- **If**: condición basada en días desde la última modificación o acceso
- **Then**: acción a ejecutar (mover a Cool, mover a Cold, mover a Archive, eliminar)

Ejemplo práctico: datos accedidos frecuentemente los primeros 14 días → mover a Cool a los 30 días → mover a Archive a los 90 días → eliminar a los 365 días.

Las reglas se pueden aplicar a toda la cuenta, a contenedores concretos o filtrar por prefijo de nombre o etiquetas.

---

### Replicación de objetos de blob

Permite copiar blobs de forma asíncrona entre contenedores, incluso entre cuentas de almacenamiento en distintas regiones. Útil para reducir latencia de lectura acercando los datos a los usuarios, o para procesar los mismos datos en varias regiones.

Requisitos: el **versionado de blobs** debe estar habilitado en las cuentas origen y destino. Las instantáneas no se replican.

---

### Herramientas de gestión de blobs

- **Portal de Azure**: para operaciones puntuales con pocos ficheros
- **Azure Storage Explorer**: aplicación de escritorio (Windows/macOS/Linux) para gestión visual completa
- **AzCopy**: herramienta de línea de comandos para copias masivas entre contenedores y cuentas
- **Azure Data Box Disk**: para transferencias físicas cuando los datos son muy grandes o la red es limitada

---

## Seguridad en Azure Storage

### Cifrado

Todo en Azure Storage está cifrado por defecto con **AES-256**. No puedes desactivarlo, no requiere configuración adicional y es transparente para el usuario.

Tienes tres opciones para gestionar las claves:

- **Claves administradas por la plataforma (PMK)**: Azure genera y gestiona las claves. Sin coste adicional, sin esfuerzo de gestión. Es el valor por defecto.

- **Claves administradas por el cliente (CMK)**: tú creas y gestionas las claves en **Azure Key Vault**. Más control, ideal para entornos con requisitos de cumplimiento estrictos. La cuenta de almacenamiento y el Key Vault deben estar en la misma región.

- **Cifrado de infraestructura**: doble cifrado, en dos capas con algoritmos y claves distintas. Para los requisitos de seguridad más exigentes.

> 💡 Microsoft recomienda usar **Azure Key Vault** para gestionar y rotar las claves periódicamente, con rotación automática cada 90 días.

---

### Métodos de autorización

| Método | Descripción | Recomendación |
|---|---|---|
| **Microsoft Entra ID + RBAC** | Acceso granular basado en roles de identidad | ✅ Recomendado por Microsoft |
| **Clave compartida** | Clave de acceso de la cuenta con acceso total | Evitar en producción; deshabilitar si usas Entra ID |
| **SAS (Shared Access Signature)** | URI con permisos y tiempo de validez limitados | Para acceso temporal o externo |
| **Acceso anónimo** | Sin autenticación | Deshabilitado por defecto; no usar con datos sensibles |

---

### Firmas de acceso compartido (SAS)

Una SAS es una URL que concede acceso temporal y limitado a un recurso específico. Es la forma segura de dar acceso a terceros sin exponer las claves de la cuenta.

Hay tres tipos:

- **SAS de delegación de usuario**: basada en credenciales de Entra ID. La más segura. Solo para Blob y Data Lake.

- **SAS de cuenta**: acceso a múltiples servicios y operaciones de la cuenta.

- **SAS de servicio**: acceso a un recurso específico (un contenedor, un fichero...).

Una SAS se compone de la URL del recurso más un token con parámetros como:

```
sv=versión  ss=servicio  st=inicio  se=expiración  
sr=recurso  sp=permisos  sip=IPs permitidas  spr=protocolo  sig=firma
```

**Buenas prácticas con SAS:**

- Usa siempre HTTPS para distribuirlas
- Define tiempos de expiración cortos
- Aplica el principio de mínimos privilegios (solo los permisos necesarios)
- Usa **directivas de acceso almacenadas** para poder revocarlas sin regenerar claves
- No pongas la hora de inicio como "ahora"; usa al menos 15 minutos en el pasado para evitar problemas de sesgo de reloj

---

### Monitorización y protección

**Storage Insights**: supervisión pasiva integrada en Azure Monitor. Métricas de rendimiento, capacidad, disponibilidad y latencia. Útil para auditorías y detección de tendencias.

**Microsoft Defender for Storage**: detección activa de amenazas en tiempo real. Escanea blobs en busca de malware, detecta almacenamiento inapropiado de datos sensibles (PII, credenciales) y patrones de acceso anómalos. Complementa a Storage Insights con protección proactiva.

---

## Azure Files y File Sync

### ¿Qué es Azure Files?

Un recurso compartido de archivos totalmente gestionado en la nube (PaaS), accesible mediante **SMB** o **NFS** desde Windows, macOS y Linux. Sin servidores que mantener, sin actualizaciones que gestionar.

Capacidad de hasta **100 TiB** por recurso compartido, con ficheros de hasta 4 TiB. Los datos se cifran en reposo y en tránsito.

Casos de uso principales:

- Reemplazar o complementar servidores de archivos locales o dispositivos NAS
- Migración lift-and-shift de aplicaciones que usan rutas de ficheros locales
- Compartir herramientas, configuraciones y utilidades entre múltiples VMs
- Almacenar logs, métricas y volcados de diagnóstico en un punto centralizado

---

### Azure Files vs Blob Storage

| | **Azure Files** | **Azure Blob Storage** |
|---|---|---|
| Estructura | Jerárquica (carpetas reales) | Plana (namespace plano) |
| Acceso | SMB, NFS, REST | HTTP/HTTPS, REST, SDK |
| Ideal para | Aplicaciones que usan APIs de sistema de ficheros | Datos no estructurados, streaming, backups |
| Acceso desde múltiples VMs | Sí, montado como unidad compartida | Sí, pero vía API, no como unidad |

---

### Niveles de Azure Files

| Nivel | Almacenamiento | Facturación | Cuándo usarlo |
|---|---|---|---|
| **Premium** | SSD | Aprovisionado (pagas capacidad reservada) | Alto rendimiento, baja latencia |
| **Optimizado para transacciones** | HDD | Pago por uso | Muchas transacciones, acceso frecuente |
| **Caliente** | HDD | Pago por uso | Uso general, colaboración de equipo |
| **Frío** | HDD | Pago por uso | Archivado, backups online |

---

### Autenticación en Azure Files

| Método | Descripción |
|---|---|
| **Basada en identidad (SMB)** | Usa AD DS local, Microsoft Entra Domain Services o Entra Kerberos. Asigna roles RBAC a usuarios. Recomendado. |
| **Clave de acceso** | Acceso total estático. No compartir; evitar en producción. |
| **SAS** | Solo para acceso desde código vía API REST. |

---

### Protección de datos en Azure Files

**Instantáneas de recurso compartido**

Copias puntuales, incrementales y de solo lectura de todo el recurso compartido. Permiten recuperar archivos, carpetas o el recurso completo a un momento anterior. Hasta 200 instantáneas por recurso compartido. Se eliminan cuando se elimina el recurso compartido (Azure Backup puede protegerlas).

**Eliminación temporal (Soft Delete)**

Cuando se elimina un fichero o recurso compartido, en lugar de borrarse permanentemente pasa a un estado de "eliminado temporalmente" durante un período configurable de entre 1 y 365 días. Protege contra eliminaciones accidentales, ransomware y fallos en actualizaciones.

---

### Azure File Sync

Permite convertir cualquier **Windows Server en una caché local** de un recurso compartido de Azure Files. El servidor almacena en local los ficheros accedidos recientemente; el resto permanece en Azure y se descarga bajo demanda (**jerarquización en la nube**).

Componentes principales:

```
Servicio de sincronización de almacenamiento (en Azure)
    └── Grupo de sincronización
            ├── Punto de conexión en la nube (recurso compartido de Azure Files)
            └── Puntos de conexión de servidor (rutas NTFS en Windows Servers)
                    └── Agente de Azure File Sync (instalado en cada servidor)
```

Límites relevantes: hasta **100 grupos de sincronización** por servicio, **50 puntos de conexión de servidor** por grupo, **99 servidores Windows** registrados.

Casos de uso:

- Sucursales con acceso local rápido y backup centralizado en Azure
- Lift-and-shift de aplicaciones que necesitan acceso tanto local como en la nube
- Recuperación ante desastres: Azure Backup hace copia de los datos locales y permite restaurar inmediatamente los metadatos

---

## Resumen del módulo 3

| Concepto | Clave |
|---|---|
| Blob Storage | Objetos no estructurados; organizado en cuenta → contenedor → blob |
| Azure Files | Recurso compartido SMB/NFS gestionado; reemplaza servidores de ficheros |
| Queue Storage | Mensajes asincrónicos hasta 64 KB; para desacoplar componentes |
| Table Storage | NoSQL sin esquema; Cosmos DB Table API para escenarios avanzados |
| GPv2 Standard | Tipo de cuenta para la mayoría de escenarios |
| Premium | SSD para cargas intensivas en I/O o baja latencia |
| LRS | Redundancia mínima: un datacenter, menor coste |
| ZRS | Protege ante caída de zona de disponibilidad |
| GRS / RA-GRS | Protege ante desastre regional; RA permite lectura continua en secundaria |
| GZRS / RA-GZRS | Combinación ZRS + GRS; máxima durabilidad |
| Niveles de blob | Hot → Cool → Cold → Archive: menor coste de almacenamiento, mayor coste de acceso |
| Ciclo de vida | Reglas automáticas If/Then para mover o eliminar blobs por antigüedad |
| Cifrado | AES-256 siempre activo; claves de Microsoft (PMK) o propias (CMK con Key Vault) |
| SAS | URL temporal con permisos limitados; usar HTTPS y expiración corta |
| Endpoint privado | IP privada en tu VNet para acceso sin exposición a Internet; recomendado en producción |
| Instantáneas Files | Copias puntuales incrementales; hasta 200 por recurso compartido |
| Soft Delete | Retención de 1-365 días para ficheros eliminados |
| Azure File Sync | Windows Server como caché local de Azure Files con jerarquización en la nube |
