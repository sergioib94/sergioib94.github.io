---
title: "Administración de identidades"
date: 2026-05-12T16:50:00+02:00
categories: [Azure, AZ-104, Apuntes]
description: "Apuntes del módulo 2 del AZ-104: Microsoft Entra ID, gestión de usuarios, grupos, dispositivos, licencias, infraestructura física de Azure, jerarquía de administración y Azure Policy."
card_image: /assets/images/cards/az.png
---

Este módulo cubre la gestión de identidades en Azure. El eje central es **Microsoft Entra ID**, el servicio que controla quién puede acceder a qué dentro del ecosistema de Azure y Microsoft 365.

---

## Microsoft Entra ID

### ¿Qué es Microsoft Entra ID?

Si conoces **Active Directory Domain Services (AD DS)**, puedes ver Microsoft Entra ID como su equivalente en la nube. Es un servicio **PaaS**: Microsoft lo gestiona por ti, sin servidores que mantener ni controladores de dominio que actualizar.

Entre las cosas que puedes hacer con él:

- Gestionar usuarios y grupos
- Configurar inicio de sesión único (**SSO**) para aplicaciones SaaS
- Habilitar autenticación multifactor (**MFA**)
- Configurar acceso condicional según usuario, dispositivo o ubicación
- Extender tu Active Directory local a la nube
- Detectar inicios de sesión sospechosos

**Precio:** tiene un nivel gratuito incluido con cualquier suscripción de Azure. Las funcionalidades avanzadas requieren los planes **P1 o P2**.

---

### Inquilinos de Microsoft Entra

Un **inquilino** (tenant) es la instancia de Microsoft Entra ID que representa a tu organización. Puntos clave:

- Una suscripción de Azure **siempre está vinculada a exactamente un inquilino**.
- Un inquilino puede tener **varias suscripciones** asociadas.
- Cada inquilino tiene un dominio por defecto con formato `nombreempresa.onmicrosoft.com`, al que puedes añadir tu propio dominio personalizado.
- Puedes crear varios inquilinos en una misma suscripción, útil para hacer pruebas sin afectar al entorno de producción.

El inquilino actúa como **límite de seguridad**: los usuarios, grupos y aplicaciones de un inquilino no tienen acceso a los de otro salvo que se configure explícitamente.

---

### Microsoft Entra ID vs Active Directory Domain Services

Son servicios distintos aunque compartan el concepto de directorio de identidades:

| | **AD DS** | **Microsoft Entra ID** |
|---|---|---|
| Tipo | Servicio local en Windows Server | Servicio en la nube (PaaS) |
| Estructura | Jerárquica (X.500, OUs, GPOs) | Plana (sin OUs ni GPOs) |
| Protocolo de consulta | LDAP | API REST sobre HTTP/HTTPS |
| Autenticación | Kerberos | SAML, OpenID Connect, OAuth |
| Gestión de equipos | Sí (objetos de equipo, GPO) | No (usa gestión moderna) |
| Diseño | Un dominio / bosque | Multiinquilino por diseño |

> ⚠️ Desplegar un controlador de dominio AD DS en una VM de Azure **no es lo mismo** que usar Microsoft Entra ID. Son dos cosas distintas.

En AD DS se usan las OUs principalmente para aplicar GPOs. En Microsoft Entra ID eso no existe, pero puedes conseguir una organización equivalente usando **grupos** para categorizar y gestionar objetos.

---

### Planes de licencia

**Nivel Gratuito** — incluido con cualquier suscripción de Azure o Microsoft 365. Cubre la gestión básica de usuarios, grupos y aplicaciones.

**Plan P1** — añade funcionalidades avanzadas:

- Grupos de autoservicio: los usuarios crean y gestionan sus propios grupos
- MFA completa para aplicaciones locales (VPN, RADIUS), Azure y servicios Microsoft
- Acceso condicional por dispositivo, grupo o ubicación
- Informes avanzados de seguridad basados en machine learning
- SLA del 99,9% de disponibilidad
- Restablecimiento de contraseña con escritura diferida al AD local
- Microsoft Entra Connect Health para monitorizar el estado del servicio

**Plan P2** — todo lo de P1, más:

- **Protección de identidades**: define políticas de riesgo por usuario o inicio de sesión y marca cuentas sospechosas automáticamente

- **Privileged Identity Management (PIM)**: control granular sobre cuentas con privilegios administrativos, con flujos de aprobación y administradores temporales

---

### Microsoft Entra Domain Services

Está pensado para organizaciones con aplicaciones heredadas que necesitan características clásicas de dominio: unión a dominio, GPOs, Kerberos, NTLM o LDAP.

En lugar de montar controladores de dominio en VMs de Azure, **Microsoft Entra Domain Services** ofrece esas capacidades directamente como servicio, sin gestionar ningún controlador de dominio.

**Úsalo cuando:**

- Tienes aplicaciones antiguas que no pueden migrar a autenticación moderna
- Quieres llevarlas a Azure sin montar infraestructura de AD adicional
- No quieres mantener una VPN permanente entre tu red local y Azure solo para autenticación

**Limitaciones:**

- La estructura de OUs es plana, sin anidamiento
- No se puede ampliar el esquema
- Solo hay un GPO integrado por defecto
- No se puede filtrar GPOs por grupos de seguridad o WMI

> 💡 Se habilita desde el Portal de Azure y se cobra **por hora** según el tamaño del directorio.

---

## Usuarios, grupos, dispositivos y licencias

### Tipos de usuarios en Microsoft Entra ID

Hay tres formas en que Microsoft Entra ID define a los usuarios:

- **Identidades en la nube**: existen solo en Microsoft Entra ID. Por ejemplo, cuentas de administrador o usuarios creados directamente.

- **Identidades sincronizadas**: viven en un AD local y se sincronizan con Microsoft Entra ID. La herramienta recomendada es **Microsoft Entra Cloud Sync** (ligera, admite varios bosques). Para escenarios complejos existe **Microsoft Entra Connect Sync**.

- **Usuarios invitados**: externos a la organización (proveedores, contratistas). Se eliminan cuando ya no son necesarios, revocando todo su acceso de una vez.

#### Gestión de usuarios: operaciones básicas

Desde el **Centro de administración de Microsoft Entra** puedes crear, editar, eliminar y restaurar usuarios.

> 💡 Un usuario eliminado permanece en estado de suspensión durante **30 días**, período en el que puede restaurarse con todas sus propiedades. Pasado ese plazo, se elimina permanentemente de forma automática.

Para restaurar o eliminar usuarios de forma permanente necesitas uno de estos roles: **Administrador global**, **Administrador de usuarios** o roles de soporte de nivel 1/2 para socios.

---

### Grupos en Microsoft Entra ID

Los grupos simplifican la asignación de permisos: en lugar de configurar acceso usuario a usuario, asignas permisos al grupo y todos sus miembros los heredan automáticamente.

Hay dos tipos de grupos:

- **Grupos de seguridad**: el más común. Controla el acceso a recursos. Puede incluir usuarios, dispositivos y entidades de servicio. Requiere un administrador de Microsoft Entra.

- **Grupos de Microsoft 365**: orientado a colaboración. Da acceso a buzón compartido, calendario, SharePoint, etc. Permite incluir personas externas a la organización.

Y tres tipos de pertenencia:

- **Asignada**: los miembros se añaden y eliminan manualmente.
- **Usuario dinámico**: los usuarios se añaden o eliminan automáticamente según reglas basadas en atributos (departamento, cargo, ubicación...). Requiere licencia **P1**.
- **Dispositivo dinámico**: igual que el anterior pero para dispositivos. Solo disponible en grupos de seguridad.

> 💡 Los grupos dinámicos son muy útiles para entornos grandes. Por ejemplo, una regla que añada automáticamente al grupo "Marketing" a todos los usuarios cuyo atributo `Department` sea igual a "Marketing".

---

### Gestión de dispositivos

Microsoft Entra ID ofrece tres modalidades de registro de dispositivos, según el escenario de la organización:

**Dispositivos registrados en Microsoft Entra**

- Para escenarios **BYOD** (dispositivos personales).
- El usuario usa su dispositivo personal pero añade su cuenta de organización.
- Compatible con Windows 10/11, macOS, iOS, Android y Linux.
- Se gestiona con **Microsoft Intune** (MDM).

**Dispositivos unidos a Microsoft Entra**

- Para organizaciones **solo en la nube o híbridas**.
- El dispositivo es propiedad de la organización e inicia sesión directamente con cuenta de Microsoft Entra.
- Compatible con Windows 10/11 y Windows Server 2019+.
- Se gestiona con Intune o Configuration Manager.
- Mantiene SSO también para recursos locales cuando está dentro de la red corporativa.

**Dispositivos unidos a Microsoft Entra híbrido**

- Para organizaciones con **infraestructura AD local existente** que quieren aprovechar también Microsoft Entra ID.
- El dispositivo está unido tanto al AD local como a Microsoft Entra ID.
- Compatible con Windows 10/11 y Windows Server 2016/2019/2022.
- Se puede seguir gestionando con **GPO o Configuration Manager**, además de Intune.

---

### Licencias basadas en grupos

Asignar licencias usuario a usuario es inviable a gran escala. Microsoft Entra ID permite asignar licencias a **grupos**, de forma que todos los miembros las reciben automáticamente y las pierden cuando salen del grupo.

**Requisitos:**

- Licencia **Microsoft Entra ID P1** o superior, o bien Office 365 Enterprise E3 o superior.
- Necesitas tantas licencias como miembros únicos haya en los grupos con licencia.

**Características clave:**

- Funciona con grupos de seguridad, incluyendo los sincronizados desde AD local y los grupos dinámicos.
- Puedes deshabilitar planes de servicio concretos dentro de una licencia (por ejemplo, asignar Microsoft 365 pero deshabilitar Viva Engage).
- Si un usuario recibe la misma licencia por varios grupos, solo consume una licencia.
- La gestión se hace desde el **Centro de administración de Microsoft 365**.

#### Errores comunes en la asignación de licencias

| Error | Causa | Solución |
|---|---|---|
| Escasez de licencias | No hay suficientes licencias disponibles | Comprar más o liberar las no usadas |
| Planes de servicio en conflicto | Dos planes incompatibles asignados al mismo usuario (ej: E1 y E3) | Deshabilitar uno de los planes en conflicto |
| Dependencia de otro producto | Se intenta quitar un plan del que depende otro | Asegurarse de que el plan dependiente sigue asignado por otro medio |
| Ubicación de uso no permitida | El servicio no está disponible en el país del usuario | Establecer la ubicación de uso correcta en el perfil del usuario |
| Direcciones proxy duplicadas | Dos usuarios con la misma dirección proxy en Exchange Online | Resolver el conflicto de proxy y reprocesar las licencias del grupo |

> 💡 Cuando resuelves un error de licencias, puede que necesites forzar el reprocesamiento manualmente desde el panel del grupo o del usuario → **Licencias** → botón **Reprocesar**.

---

### Atributos de seguridad personalizados

Son pares **clave-valor** específicos de tu organización que puedes definir y asignar a objetos de Microsoft Entra (usuarios, aplicaciones...).

Casos de uso típicos:

- Añadir campos personalizados a perfiles de usuario (ej: salario por hora, centro de coste)
- Restringir la visibilidad de ciertos atributos solo a administradores
- Clasificar y filtrar aplicaciones para auditorías
- Controlar el acceso a recursos de Azure según el valor de un atributo

Soportan tipos de datos: booleano, entero y cadena, con valores únicos o múltiples, libres o predefinidos.

> ⚠️ Los atributos de seguridad personalizados **no se incluyen** en tokens SAML, JWT ni en reclamaciones de Microsoft Entra Domain Services.

---

### Aprovisionamiento automático de usuarios (SCIM)

**SCIM** (System for Cross-Domain Identity Management) es el protocolo estándar para automatizar la creación y eliminación de cuentas de usuario entre sistemas. Su objetivo es que cuando alguien entra o sale de la organización en el sistema de RR. HH., su cuenta en Microsoft Entra ID se cree o elimine automáticamente, sin intervención manual.

El flujo habitual es:

1. El sistema de RR. HH. (HCM) es la fuente de verdad
2. El **Microsoft Entra Provisioning Service** conecta con el endpoint SCIM de la aplicación destino
3. Los usuarios se crean, actualizan o eliminan en Microsoft Entra ID de forma automática

Para sistemas de RR. HH. que no exponen un endpoint SCIM, existe el **aprovisionamiento de entrada controlado por API** (disponible desde 2024), que permite a cualquier script o herramienta de automatización enviar datos desde sistemas como Workday, SAP SuccessFactors o cualquier sistema de RR. HH. personalizado.

> 💡 La clave de SCIM es reducir el riesgo de seguridad: si un empleado es dado de baja en RR. HH., su acceso a Azure se revoca automáticamente sin depender de procesos manuales.

---

## Componentes arquitectónicos principales de Azure

### ¿Qué es Azure?

Azure es la plataforma de servicios en la nube de Microsoft. Permite crear, desplegar y gestionar aplicaciones e infraestructura en una red global de centros de datos. Puedes usarlo tanto para migrar lo que ya tienes (mover una aplicación a una VM) como para construir desde cero con arquitecturas modernas.

Para usar Azure necesitas una **cuenta de Azure** con al menos una **suscripción** asociada. Puedes crear varias suscripciones bajo la misma cuenta para separar entornos, equipos o presupuestos.

> 💡 Azure ofrece una **cuenta gratuita** con 12 meses de acceso a servicios populares, crédito para los primeros 30 días y más de 65 servicios siempre gratuitos. Los estudiantes tienen una oferta específica con 100 USD de crédito sin necesidad de tarjeta de crédito.

---

### Infraestructura física: regiones y zonas de disponibilidad

La infraestructura de Azure se organiza en capas geográficas para garantizar disponibilidad y resistencia.

**Centros de datos**

Son las instalaciones físicas con servidores, red y energía dedicada. No interactúas directamente con ellos; Azure los agrupa en unidades lógicas superiores.

**Regiones**

Una región es un área geográfica que contiene uno o varios centros de datos cercanos, conectados con red de baja latencia. Al desplegar un recurso en Azure, normalmente debes elegir en qué región se crea.

**Zonas de disponibilidad**

Son centros de datos físicamente separados dentro de la misma región, cada uno con energía, refrigeración y red independientes. Si una zona falla, las otras siguen funcionando. Están conectadas entre sí con fibra óptica de alta velocidad.

Los servicios de Azure se clasifican en tres categorías según su relación con las zonas de disponibilidad:

| Categoría | Descripción | Ejemplos |
|---|---|---|
| **Servicios de zona** | El recurso se ancla a una zona específica | VMs, discos administrados, IPs |
| **Redundancia de zona** | La plataforma replica automáticamente entre zonas | Storage con redundancia de zona, SQL Database |
| **Servicios no regionales** | Siempre disponibles, resistentes a fallos de zona y región completa | Azure DNS, Azure AD |

---

### Pares de región y regiones soberanas

**Pares de región**

La mayoría de regiones de Azure tienen una región emparejada en la misma zona geográfica, a un mínimo de 500 km de distancia. Esto permite que si una región sufre un desastre mayor, los servicios puedan conmutar a su par automáticamente.

Ventajas clave de los pares de región:

- En una interrupción grave de Azure, se prioriza restaurar al menos una región del par
- Las actualizaciones de Azure se despliegan de forma escalonada entre regiones emparejadas, minimizando el riesgo de downtime simultáneo
- Los datos se mantienen dentro de la misma geografía (excepto Brasil Sur)

**Regiones soberanas**

Son instancias de Azure aisladas de la nube pública, pensadas para cumplir requisitos legales o de cumplimiento específicos:

- **US Gov** (Virginia, Arizona, DoD Central...): para agencias gubernamentales de EE. UU., operadas por personal con habilitación de seguridad

- **China** (Este, Norte): operadas por 21Vianet bajo acuerdo con Microsoft, no directamente por Microsoft

---

### Infraestructura de administración: la jerarquía de Azure

Azure organiza los recursos en una jerarquía de cuatro niveles. Entenderla es clave para gestionar accesos, costes y políticas a escala.

```
Grupos de administración
    └── Suscripciones
            └── Grupos de recursos
                    └── Recursos
```

**Recursos**

El bloque básico de Azure. Todo lo que creas es un recurso: una VM, una base de datos, una red virtual, un servicio de IA...

**Grupos de recursos**

Contenedores lógicos que agrupan recursos relacionados. Reglas importantes:

- Cada recurso pertenece a **exactamente un** grupo de recursos
- Los grupos de recursos **no se pueden anidar**
- Las acciones sobre el grupo afectan a todos sus recursos: si eliminas el grupo, eliminas todo lo que contiene
- Los permisos aplicados al grupo se heredan por todos sus recursos

> 💡 Un uso habitual es crear un grupo de recursos por entorno o proyecto, de modo que al terminar basta con eliminar el grupo para limpiar todos los recursos de golpe.

**Suscripciones**

Unidad de facturación y control de acceso. Toda cuenta de Azure necesita al menos una. Puedes crear varias para separar:

- **Entornos**: desarrollo, pruebas, producción
- **Equipos o proyectos**: cada uno con su propia suscripción y presupuesto
- **Facturación**: seguimiento de costes por separado

Hay dos tipos de límites en una suscripción: el **límite de facturación** (genera facturas independientes) y el **límite de control de acceso** (permite aplicar políticas de acceso distintas por suscripción).

**Grupos de administración**

Se sitúan por encima de las suscripciones y permiten aplicar políticas y permisos a múltiples suscripciones a la vez. Todas las suscripciones dentro de un grupo heredan automáticamente sus condiciones.

Datos clave:
- Un directorio admite hasta **10.000 grupos de administración**
- Se pueden anidar hasta **6 niveles** de profundidad (sin contar el raíz ni el nivel de suscripción)
- Cada grupo o suscripción solo puede tener **un elemento primario**
- Existe un **grupo raíz de inquilino** único por directorio, del que cuelgan todos los demás

Un ejemplo práctico: puedes crear un grupo de administración "Producción" con una política que restrinja la creación de VMs solo a la región West Europe. Todas las suscripciones dentro de ese grupo heredarán esa restricción automáticamente, sin tener que configurarla suscripción a suscripción.

---

## Azure Policy

### ¿Qué es Azure Policy?

Azure Policy es el servicio de gobernanza de Azure. Permite crear reglas que se aplican automáticamente a los recursos de tu suscripción para garantizar que cumplan con los estándares de tu organización. Por ejemplo: que nadie pueda crear VMs fuera de Europa, que todas las cuentas de almacenamiento tengan cifrado activado, o que todos los recursos lleven una etiqueta de proyecto.

Lo importante es que Azure Policy actúa **antes y después**: impide que se creen recursos que no cumplan las reglas (acción preventiva) y también detecta los recursos existentes que ya no las cumplen (acción correctiva).

---

### Gobernanza en la nube: el contexto

Antes de entrar en los detalles técnicos de Azure Policy, conviene entender el marco más amplio. La gobernanza en la nube consiste en gestionar y controlar cómo se usa Azure dentro de tu organización. Microsoft proporciona el **Cloud Adoption Framework (CAF)** como guía, que divide la gobernanza en cinco pasos iterativos:

1. **Construir un equipo de gobernanza** responsable de definir y mantener las políticas
2. **Evaluar los riesgos** propios de la organización: seguridad, costes, cumplimiento, datos...
3. **Documentar las políticas** que mitiguen esos riesgos
4. **Hacer cumplir las políticas** con herramientas automatizadas como Azure Policy
5. **Monitorizar** continuamente el cumplimiento

Los pasos 2 a 5 deben repetirse de forma continua; la gobernanza no es algo que se configura una vez y se olvida.

---

### Cómo funciona Azure Policy internamente

Azure utiliza dos planos de operación:

- **Plano de control**: gestiona los recursos (crear, modificar, eliminar). Azure Policy actúa aquí, interceptando las solicitudes que pasan por **Azure Resource Manager** antes de que se ejecuten.

- **Plano de datos**: operaciones directas sobre los datos de un recurso ya creado (subir un fichero a Storage, consultar una base de datos...). Azure Policy también puede actuar aquí en servicios concretos como Key Vault, Kubernetes o Data Factory.

Hay dos escenarios de evaluación:

- **Greenfield** (política primero): la política ya existe cuando se crea o modifica un recurso. La evaluación ocurre en tiempo real al recibir la solicitud.

- **Brownfield** (recurso primero): los recursos ya existían cuando se asignó la política. La evaluación se hace mediante un **escaneo de cumplimiento** que se ejecuta automáticamente cada 24 horas, o manualmente cuando sea necesario.

> ⚠️ Al asignar una nueva política puede haber un retraso de hasta 30 minutos antes de que entre en vigor, debido a la caché de Azure Resource Manager.

---

### Estructura de Azure Policy

Azure Policy se compone de seis elementos que trabajan juntos:

**Definiciones**
Son las reglas en sí, escritas en JSON. Describen qué condición evaluar y qué efecto aplicar si se cumple. Pueden ser **integradas** (proporcionadas por Microsoft) o **personalizadas** (creadas por ti).

**Iniciativas**
Un conjunto de definiciones agrupadas bajo un objetivo común. Por ejemplo, una iniciativa de "Cumplimiento PCI-DSS" puede agrupar 30 políticas distintas. En lugar de asignar cada política por separado, asignas la iniciativa de una vez. También se llaman *conjuntos de políticas*.

**Asignaciones**
Vinculan una definición o iniciativa a un **ámbito** concreto (grupo de administración, suscripción, grupo de recursos o recurso individual). Todo lo que esté dentro de ese ámbito queda sujeto a la política, y los niveles inferiores la heredan automáticamente.

**Exenciones**
Permiten excluir un recurso o jerarquía de la evaluación de una política concreta, sin modificar la política en sí. Hay dos tipos:

- *Mitigado*: la intención de la política se cumple por otro medio
- *Renuncia*: se acepta temporalmente el incumplimiento

**Certificaciones**
Para políticas con efecto *manual*, permiten que un administrador certifique manualmente el estado de cumplimiento de un recurso.

**Remediaciones**
Tareas que corrigen recursos que no cumplen con políticas de tipo `deployIfNotExists` o `modify`. Los recursos nuevos se remedian automáticamente; los existentes requieren lanzar una tarea de remediación.

---

### Anatomía de una definición de política

Cada definición tiene dos bloques principales:

**Bloque `if`** — define la condición que activa la política. Usa operadores lógicos:
- `allOf`: todas las condiciones deben cumplirse (equivale a AND)
- `anyOf`: basta con que una se cumpla (equivale a OR)
- `not`: invierte el resultado de una condición

**Bloque `then`** — define el efecto que se aplica cuando la condición es verdadera.

Ejemplo: una política que deniega la creación de recursos fuera de las regiones permitidas:

```json
{
  "if": {
    "allOf": [
      {
        "field": "location",
        "notIn": "[parameters('listOfAllowedLocations')]"
      },
      {
        "field": "location",
        "notEquals": "global"
      }
    ]
  },
  "then": {
    "effect": "deny"
  }
}
```

---

### Efectos disponibles

El efecto determina qué hace Azure Policy cuando una condición se cumple:

| Efecto | Cuándo usarlo |
|---|---|
| `deny` | Bloquea la creación o modificación del recurso si no cumple la condición |
| `audit` | Permite la operación pero registra un aviso de incumplimiento en el log |
| `modify` | Añade, actualiza o elimina propiedades o etiquetas del recurso automáticamente |
| `deployIfNotExists` | Despliega un recurso relacionado si no existe (ej: instalar un agente en una VM) |
| `auditIfNotExists` | Registra un aviso si un recurso relacionado no existe |
| `append` | Añade campos al recurso (prácticamente reemplazado por `modify`) |
| `denyAction` | Bloquea acciones específicas sobre recursos ya creados (actualmente solo DELETE) |
| `disabled` | Desactiva la política sin eliminarla |
| `manual` | Requiere certificación manual del cumplimiento |

> 💡 `audit` y `deny` suelen ser intercambiables según el nivel de control que quieras. `auditIfNotExists` y `deployIfNotExists` también. `manual` y `disabled` no son intercambiables con los demás.

---

### Estados de cumplimiento

Tras evaluar un recurso, Azure Policy le asigna uno de estos estados:

| Estado | Significado |
|---|---|
| **Compliant** | El recurso cumple con la política |
| **Non-compliant** | El recurso no cumple con la política |
| **Error** | Error en la plantilla o en la evaluación |
| **Conflict** | Dos políticas en el mismo ámbito con reglas contradictorias |
| **Protected** | Cubierto por una asignación con efecto `denyAction` |
| **Exempt** | Excluido mediante una exención |
| **Unknown** | Estado por defecto para políticas con efecto `manual` |

El porcentaje de cumplimiento se calcula dividiendo los recursos en estado *Compliant*, *Exempt* y *Unknown* entre el total.

---

### Buenas prácticas al desplegar políticas

Aplicar políticas directamente en producción sin probarlas antes puede causar problemas. La recomendación es un despliegue gradual en anillos:

1. **Empieza con `enforcementMode: Disabled`**: la política evalúa y reporta el cumplimiento, pero no bloquea ni modifica nada. Útil para ver el impacto antes de activarla.

2. **Despliega en entornos de prueba primero**: valida que la política funciona como espera y no causa efectos secundarios inesperados.

3. **Amplía gradualmente el ámbito**: de un grupo de recursos a una suscripción, de una suscripción a un grupo de administración.

4. **Activa `enforcementMode: Default`** solo cuando hayas validado el comportamiento en entornos no productivos.

> 💡 Trata las definiciones de política como código: guárdalas en control de versiones y prueba cada cambio antes de desplegarlo.

## Azure RBAC: Control de acceso basado en roles

### ¿Qué es Azure RBAC?

Azure RBAC es el sistema que controla quién puede hacer qué y dónde dentro de Azure. Mientras que Microsoft Entra ID gestiona las identidades (quién eres), RBAC gestiona los permisos (qué puedes hacer con los recursos).

Trabajan juntos: una suscripción de Azure siempre está vinculada a un directorio de Microsoft Entra, y los usuarios de ese directorio reciben permisos sobre los recursos de la suscripción mediante asignaciones de roles RBAC. Si deshabilitas una cuenta en tu AD local y tienes Microsoft Entra Connect configurado, esa cuenta pierde automáticamente el acceso a todas las suscripciones de Azure conectadas.

Los tres elementos de una asignación de roles
Toda asignación de roles se construye combinando tres piezas:

1. Entidad de seguridad — ¿Quién? El usuario, grupo o aplicación al que quieres conceder acceso.

2. Definición de rol — ¿Qué puede hacer?  
   Un conjunto de permisos. Azure incluye más de 70 roles integrados. Los cuatro fundamentales son:

   | Rol | Qué permite |
   |---|---|
   | Propietario | Acceso total, incluyendo delegar acceso a otros |
   | Colaborador | Crear y gestionar recursos, pero no asignar acceso |
   | Lector | Solo ver recursos, sin modificar nada |
   | Administrador de acceso de usuario | Gestionar quién tiene acceso, pero sin tocar los recursos |

   Si ningún rol integrado se ajusta a tus necesidades, puedes crear roles personalizados.

3. Ámbito — ¿Dónde aplica?  
   El nivel jerárquico al que se aplica el permiso. Puede ser un grupo de administración, una suscripción, un grupo de recursos o un recurso individual.

   Los permisos asignados en un nivel superior se heredan automáticamente hacia abajo: si asignas el rol Colaborador a un usuario en una suscripción, ese usuario puede gestionar todos los recursos de todos los grupos de recursos de esa suscripción.

### Modelo de permisos: additive con NotActions

RBAC es un modelo aditivo: si tienes múltiples asignaciones de roles, tus permisos efectivos son la suma de todos ellos. No hay denegaciones explícitas salvo una excepción: los NotActions.

Los NotActions son una lista de operaciones excluidas dentro de un rol. Por ejemplo, el rol Colaborador tiene permiso para todo (*) en el plano de control, pero tiene en su lista de NotActions la capacidad de asignar roles y crear blueprints. El permiso efectivo final se calcula como: Actions - NotActions.

### Gestión desde el Portal

En el Portal de Azure, el panel Control de acceso (IAM) está disponible en cualquier nivel (suscripción, grupo de recursos, recurso) y es donde:

* Ves qué roles están asignados y a quién
* Asignas nuevos roles
* Eliminas asignaciones existentes
* Consultas todos los roles disponibles

Todos los cambios de asignación de roles quedan registrados en el Registro de actividad de Azure, filtrable por operación (roleAssignments, roleDefinitions) y exportable como CSV para auditorías.

## SSPR: Autoservicio de restablecimiento de contraseña

### ¿Qué es SSPR y por qué usarlo?

El autoservicio de restablecimiento de contraseña (SSPR) permite a los usuarios restablecer su propia contraseña sin necesidad de contactar al soporte técnico. El beneficio es doble: reduce la carga del helpdesk y elimina los tiempos de espera que afectan a la productividad.

SSPR está disponible desde la pantalla de inicio de sesión de Windows o directamente en el portal web. El flujo es: el usuario se identifica → pasa un CAPTCHA → se autentica con el método registrado → establece una nueva contraseña → recibe notificación de confirmación.

### Métodos de autenticación disponibles

| Método | Cómo funciona |
|---|---|
| App Microsoft Authenticator (notificación) | Aprueba o deniega una notificación push |
| App Microsoft Authenticator (código) | Introduce el código TOTP de la app |
| Correo electrónico alternativo | Azure envía un código a una dirección externa |
| Teléfono móvil (SMS) | Azure envía un código por SMS |
| Teléfono móvil (llamada) | Llamada automatizada, pulsa # para confirmar |
| Teléfono del trabajo | Llamada automatizada al número de oficina |
| Preguntas de seguridad | El usuario responde preguntas predefinidas |

Recomendaciones:

* Habilita siempre al menos dos métodos para que el usuario tenga alternativa
* El método más recomendado es la app Authenticator (notificación o código)
* El SMS no es recomendable como único método por riesgo de SIM swapping
* Las preguntas de seguridad son el método menos seguro; úsalas solo combinadas con otro método
* Las cuentas con rol de administrador no pueden usar preguntas de seguridad y siempre requieren dos métodos, independientemente de la configuración general

### Requisitos de licencia

| Escenario | Licencia necesaria |
|---|---|
| Cambio de contraseña con sesión iniciada | Cualquier edición de Microsoft Entra ID |
| Restablecimiento sin sesión (contraseña olvidada) | Microsoft Entra ID P1 o P2, o Microsoft 365 |
| Escritura diferida al AD local (entorno híbrido) | Microsoft Entra ID P1 o P2, o Microsoft 365 Apps for Business |

### Ámbito de implementación

Al configurar SSPR puedes elegir a quién aplica:

* Ninguno: SSPR desactivado para todos (valor por defecto)
* Seleccionado: solo los miembros de un grupo de seguridad específico. Útil para hacer una prueba piloto antes del despliegue global
* Todos: disponible para todos los usuarios de la organización

La recomendación es empezar con un grupo piloto, validar que todo funciona correctamente y después ampliar a toda la organización.

### Implementación en entornos híbridos

En organizaciones con AD local y Microsoft Entra ID coexistiendo, cualquier cambio de contraseña en la nube debe sincronizarse de vuelta al directorio local (escritura diferida). Hay dos opciones:

* Microsoft Entra Connect: para usuarios de dominios locales existentes
* Cloud Sync: más ligero, mayor disponibilidad, recomendado para nuevos dominios o escenarios de fusión/escisión empresarial

Ambas opciones pueden coexistir en paralelo sobre dominios distintos.