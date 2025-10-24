---
title: "Active Directory vs Azure Active Directory: diferencias"
date: 2025-08-06T17:19:00+02:00
categories: [Sistemas, Microsoft, Administración]
excerpt: "Tanto **Active Directory (AD)** como **Azure Active Directory (Azure AD)** son tecnologías de Microsoft orientadas a la **gestión de identidades y accesos** dentro de entornos corporativos. A pesar de compartir nombre, no son exactamente equivalentes: cada una responde a una arquitectura y propósito diferente."
card_image: /assets/images/cards/advsaad.png
---

La gestión de identidades y accesos es un pilar fundamental en cualquier entorno empresarial moderno.  
Microsoft ofrece dos soluciones clave para cubrir esta necesidad: **Active Directory** (local) y **Azure Active Directory** (en la nube).  

Aunque ambos comparten objetivos similares —centralizar la autenticación, proteger los accesos y gestionar usuarios— su arquitectura, alcance y forma de administración son diferentes.  
En este artículo analizamos las **principales diferencias entre ambas plataformas**, sus ventajas, limitaciones y cuándo conviene usar cada una.

## ¿Qué es Active Directory (Windows Server)?

**Active Directory Domain Services (AD DS)** es la tecnología clásica de Microsoft para la **gestión centralizada de usuarios, equipos y recursos** dentro de una red corporativa local.  
Se basa en una estructura jerárquica donde los objetos (usuarios, equipos, grupos, impresoras, etc.) se organizan dentro de **dominios** y **unidades organizativas (OU)**.

AD DS se instala en servidores Windows que actúan como **controladores de dominio**.  
Estos servidores almacenan y replican la base de datos del dominio, asegurando la autenticación y autorización de todos los dispositivos y usuarios conectados a la red.

### Características principales

- Autenticación mediante **Kerberos** o **NTLM**, protocolos internos de Windows.  
- Administración de **usuarios, grupos, contraseñas, equipos y políticas de seguridad**.  
- Uso de **Group Policy Objects (GPOs)** para aplicar configuraciones automáticas a equipos y usuarios.  
- Dependencia de servicios de infraestructura como **DNS** y **DHCP**.  
- Requiere una **infraestructura local o virtualizada**, con controladores de dominio y copias de seguridad.

### Ejemplo de uso típico

Una empresa con oficinas físicas, donde todos los equipos Windows están conectados a la red corporativa, puede unirlos al dominio.  
El administrador crea usuarios en AD DS, define contraseñas y aplica políticas mediante GPO (por ejemplo, bloqueo de USB o fondo de escritorio corporativo).

Los empleados inician sesión en sus equipos con credenciales verificadas por el dominio, y el acceso a recursos compartidos se controla de forma centralizada.

### Ventajas

- Control granular sobre políticas, permisos y configuraciones de sistema.  
- Integración completa con la red local y recursos compartidos.  
- Posibilidad de trabajar incluso sin conexión a Internet.  
- Amplio ecosistema de herramientas de administración (ADUC, GPMC, RSAT, PowerShell, etc.).  

### Limitaciones

- Requiere mantenimiento, hardware y personal especializado.  
- Escalabilidad limitada para entornos globales o distribuidos.  
- No está diseñado para gestionar accesos a servicios en la nube.  
- La movilidad y el trabajo remoto requieren soluciones adicionales como VPN o DirectAccess.

## ¿Qué es Azure Active Directory?

**Azure Active Directory (Azure AD)** es la solución moderna basada en la nube de Microsoft para la **gestión de identidades y accesos (IAM)**.  
Su objetivo no es reemplazar completamente a AD DS, sino **extender la autenticación tradicional al entorno cloud**, especialmente para aplicaciones SaaS y servicios como **Microsoft 365, Teams, SharePoint Online o Azure Portal**.

A diferencia del AD clásico, Azure AD **no utiliza controladores de dominio** ni gestiona equipos locales de forma directa.  
En su lugar, centraliza las identidades en la nube y ofrece autenticación a través de protocolos modernos como **OAuth 2.0**, **OpenID Connect** y **SAML**.

### Características principales

- Gestión de usuarios, grupos, roles y permisos desde el **portal de Azure**.  
- Soporte para **autenticación multifactor (MFA)** y **acceso condicional**.  
- Integración con **Single Sign-On (SSO)** para miles de aplicaciones SaaS.  
- Posibilidad de **unión de dispositivos a Azure AD** (Azure AD Join) o **registro híbrido**.  
- Integración con **Microsoft Intune** para políticas de dispositivos y cumplimiento.  
- Sin necesidad de infraestructura local ni mantenimiento de servidores.

### Ejemplo de uso típico

Una empresa con empleados remotos o dispersos globalmente utiliza **Microsoft 365** y aplicaciones en la nube.  
Cada usuario se autentica en Azure AD con sus credenciales corporativas, sin necesidad de conectarse a una VPN.  
El administrador puede imponer MFA, restringir accesos desde ubicaciones no seguras o exigir dispositivos registrados y actualizados.

### Ventajas

- Totalmente gestionado por Microsoft (sin servidores ni mantenimiento local).  
- Acceso seguro desde cualquier lugar y dispositivo.  
- Integración directa con servicios cloud y aplicaciones SaaS.  
- Soporte nativo para MFA, SSO y políticas de acceso condicional.  
- Escalabilidad global y alta disponibilidad.  

### Limitaciones

- No utiliza GPOs ni ofrece control directo sobre configuraciones de Windows.  
- Gestión limitada de equipos locales (requiere Intune para políticas avanzadas).  
- Algunas funcionalidades (como Identity Protection o Access Reviews) requieren licencias Premium P1/P2.  
- No reemplaza al 100 % a AD DS en entornos puramente locales.

## Active Directory híbrido: el enfoque más común

En la práctica, muchas organizaciones adoptan un modelo **híbrido** combinando ambas soluciones.  
Esto se consigue mediante **Azure AD Connect**, una herramienta que sincroniza los objetos del Active Directory local con Azure AD, permitiendo que los usuarios utilicen las mismas credenciales en ambos entornos.

Este modelo híbrido ofrece lo mejor de ambos mundos:

- Control local mediante AD DS para los recursos on-premises.  
- Acceso unificado a servicios cloud mediante Azure AD.  
- Experiencia de inicio de sesión única para el usuario.  

Además, con herramientas como **Azure AD Domain Services (Azure AD DS)** es posible desplegar un dominio gestionado en la nube compatible con Kerberos y LDAP, sin necesidad de servidores propios.

## Comparativa detallada

| Característica | Active Directory (Windows Server) | Azure Active Directory |
|----------------|-----------------------------------|------------------------|
| **Ubicación** | Local (on-premises) | En la nube (cloud) |
| **Protocolos de autenticación** | Kerberos / NTLM | OAuth 2.0 / OpenID Connect / SAML |
| **Gestión de equipos** | Sí | Limitada (requiere Intune) |
| **Group Policies (GPO)** | Sí | No |
| **Acceso remoto** | Requiere VPN o túnel | Global, sin VPN |
| **Mantenimiento** | Manual (servidores propios) | Gestionado por Microsoft |
| **Alta disponibilidad** | Depende de la configuración del dominio | Incluida por defecto |
| **Integración con SaaS** | Limitada | Total |
| **Seguridad avanzada (MFA, acceso condicional)** | Requiere soluciones externas | Integrada |
| **Ideal para** | Infraestructura local | Entornos cloud y trabajo remoto |

## ¿Cuál elegir?

La elección entre **Active Directory** y **Azure Active Directory** depende del tipo de infraestructura y del modelo de trabajo de la organización:

- Si tu empresa **mantiene servidores y equipos locales** unidos a dominio, **Active Directory** sigue siendo esencial.  
- Si trabajas con **Microsoft 365, aplicaciones SaaS o empleados remotos**, **Azure AD** te ofrece más flexibilidad y seguridad.  
- Y si estás en proceso de migración a la nube, **una configuración híbrida** es el punto de equilibrio ideal.

## Conclusión

Active Directory y Azure Active Directory no son competidores, sino **soluciones complementarias** diseñadas para contextos distintos.  
Mientras AD DS ofrece un control total sobre la red interna y los dispositivos, Azure AD proporciona acceso seguro y escalable a los servicios en la nube.

En el panorama actual, donde el **trabajo híbrido y la movilidad** son la norma, el modelo más eficiente es combinar ambas tecnologías:  
usar **Active Directory** para gestionar la infraestructura local y **Azure AD** para extender la identidad al entorno cloud con seguridad y flexibilidad.

¿Tu empresa está migrando a la nube o quieres integrar ambos entornos?  
Explorar una estrategia **híbrida de identidades** puede ser el paso más inteligente para modernizar tu infraestructura sin perder el control ni la seguridad.

## Gestión de identidades: paso a paso y comparación detallada

A continuación se detalla **paso a paso** cómo se gestiona una identidad en **Active Directory (AD DS)** y en **Azure Active Directory (Azure AD)**, comparando cada etapa —creación, autenticación, sincronización, provisión, gestión de acceso, auditoría y baja—. Esto te servirá como guía práctica para entender las diferencias operacionales y técnicas.

---

### 1. Creación de la identidad

**Active Directory (on-prem)** 

1. El administrador abre **Active Directory Users and Computers (ADUC)** o usa **PowerShell** (cmdlets como `New-ADUser`).  
2. Se crea el objeto **user** dentro de un dominio y una OU específica (ej. `OU=Users,DC=empresa,DC=local`).  
3. Se establecen atributos LDAP: `sAMAccountName`, `userPrincipalName (UPN)`, `displayName`, `mail`, etc.  
4. Se asigna contraseña inicial y políticas de expiración/longitud aplicadas por la GPO de dominio.  
5. Se agregan grupos locales/globales según permisos (p. ej. `Domain Users`, `Finance_Group`).  

**Azure Active Directory (cloud)**  

1. El administrador crea el usuario desde el **Portal de Azure**, **Azure CLI** o **PowerShell** (`New-AzureADUser` / `Microsoft.Graph` cmdlets).  
2. Azure AD mantiene atributos como `userPrincipalName`, `mail`, `displayName` y éstos se expresan según el esquema de Graph API.  
3. Se puede opcionalmente habilitar **Azure AD Join** o registrar el dispositivo en el momento de creación.  
4. Si hay sincronización con AD (Azure AD Connect), la mayoría de usuarios se crean en AD DS y se sincronizan a Azure AD (no se crean manualmente en Azure en un entorno híbrido).  

**Comparación clave:**

- En AD DS la creación es **local y explícita** dentro de una OU con control de GPOs y herencia.  
- En Azure AD la creación es **nativa en la nube** y pensada para usuarios que consumen servicios SaaS; en entornos híbridos se suele crear en AD y sincronizar a Azure.

### 2. Propagación / replicación

**Active Directory**

- Los controladores de dominio replican cambios mediante el **protocolo de replicación de AD**; hay consideración de sites/Subnets para optimizar tráfico.  
- Los atributos y contraseñas (si se usa PHS) se replican según la topología de AD.  

**Azure AD** 

- Cuando un usuario se crea en Azure, está disponible globalmente casi inmediatamente (alta disponibilidad nativa).  
- En entornos híbridos, **Azure AD Connect** sincroniza los cambios en intervalos (por defecto cada 30 minutos o según configuración) y hay opciones como sincronización inmediata (`Start-ADSyncSyncCycle -PolicyType Delta`) desde el servidor de sincronización.

**Comparación clave:** 

- AD replica dentro de la infraestructura controlada por el equipo de infra; Azure AD replica globalmente sin que el administrador de la empresa gestione la topología física.

### 3. Autenticación

**Active Directory**  

- Autenticación de equipos Windows: **Kerberos** (preferente) y fallback **NTLM**.  
- El equipo envía un ticket Kerberos al controlador de dominio; el controlador valida credenciales y devuelve tickets de servicio.  
- Para recursos on-prem (archivos, impresoras, SQL on-prem), las ACLs y tokens basados en SIDs determinan acceso.  

**Azure Active Directory** 

- Autenticación web y app: **OAuth 2.0 / OpenID Connect / SAML** para SSO con aplicaciones SaaS.  
- Para recursos Microsoft 365 y aplicaciones registradas, Azure AD emite **tokens JWT** (id token / access token).  
- Azure AD ofrece opciones de autenticación: **Password Hash Sync (PHS)**, **Pass-through Authentication (PTA)** o **Federation (AD FS / 3rd party)**:
  - **PHS:** hash de contraseña sincronizado (no la contraseña en texto) a Azure AD; la autenticación se puede realizar en Azure.
  - **PTA:** la autenticación se valida contra AD on-prem en tiempo real mediante un agente.
  - **Federation:** autenticación delegada a un proveedor (ej. AD FS) — tokens emitidos por el federador.  

**Comparación clave:** 

- AD usa protocolos Kerberos/NTLM y está optimizado para dominio Windows y recursos locales.  
- Azure AD usa protocolos web para emitir tokens y facilitar SSO con servicios cloud; la estrategia de autenticación híbrida depende de PHS, PTA o Federation según requisitos de seguridad.

### 4. Inicio de sesión único (SSO) y dispositivos

**Active Directory**  

- SSO para recursos en la red local: el ticket Kerberos permite acceder a servicios sin volver a introducir credenciales.  
- Las políticas GPO y la pertenencia a grupos determinan permisos sobre equipos y recursos.

**Azure AD** 

- SSO web para aplicaciones SaaS y Microsoft 365: al autenticarse con Azure AD, los tokens permiten acceder a múltiples aplicaciones sin re-login.  
- **Azure AD Join** permite unir dispositivos Windows 10/11 directamente al directorio en la nube; combinación con Intune permite aplicar políticas.  
- **Hybrid Azure AD Join** combina unión a AD DS local y registro en Azure para escenarios híbridos (útil para dispositivos corporativos que necesitan GPOs pero también acceder a servicios cloud).  

**Comparación clave:** 

- AD proporciona SSO sobre recursos Windows nativos mediante Kerberos.  
- Azure AD proporciona SSO sobre aplicaciones web y SaaS mediante tokens; para control de dispositivos se apoya en Intune + Azure AD Join.

### 5. Gestión de acceso y privilegios (RBAC, grupos y roles)

**Active Directory**  

- Grupos (Global, Domain Local, Universal) y anidamiento de grupos definen permisos sobre recursos locales.  
- Delegación administrativa a través de OU y permisos sobre objetos LDAP.  
- Aplicación de privilegios mediante ACLs basadas en SIDs.  

**Azure Active Directory**  

- Uso de **Grupos de Microsoft 365** y **Grupos de seguridad de Azure AD** para asignar roles/permiso en aplicaciones y recursos cloud.  
- **Azure RBAC** (en Azure) controla acceso a recursos de suscripción/recursos Azure; roles asignados a usuarios, grupos o identidades de servicio.  
- **Privileged Identity Management (PIM)** para administración de privilegios temporales en Azure (solo P1/P2).  

**Comparación clave:**  

- AD controla permisos a nivel de recursos locales mediante grupos y ACLs; la delegación es muy granular en objetos LDAP.  
- Azure AD centraliza roles y RBAC para servicios cloud, con capacidades avanzadas como PIM y acceso condicional.

### 6. Multifactor Authentication (MFA), acceso condicional y políticas

**Active Directory**  

- MFA y acceso condicional típicamente requieren soluciones adicionales (AD FS + soluciones MFA o NPS + MFA).  
- Las políticas de contraseñas y bloqueo se configuran con GPO o políticas finas en AD.

**Azure Active Directory**  

- MFA nativo y **Conditional Access**: políticas basadas en riesgo, ubicación, estado del dispositivo, aplicación y usuario.  
- Azure Identity Protection proporciona detección de riesgo de inicios de sesión y usuarios.  

**Comparación clave:**  

- Azure AD incorpora MFA y políticas condicionales como funcionalidades integradas; en AD esto suele requerir despliegues adicionales.

---

### 7. Self-service, provisión y automatización

**Active Directory**  

- Self-service limitado por defecto; se pueden implementar soluciones (SCSM, soluciones de terceros) para autoservicio de restablecimiento de contraseña o aprovisionamiento.  
- Automatización mediante PowerShell y scripts que interactúan con LDAP/AD cmdlets.  

**Azure Active Directory**  

- Self-service Password Reset (SSPR) integrado (con configuración y reportes).  
- Provisionamiento automático de cuentas hacia aplicaciones SaaS mediante **SCIM** y conectores (p. ej. aprovisionamiento automatizado a ServiceNow, Slack, etc.).  
- API Graph / Microsoft Graph para automatización y flujo de trabajo.  

**Comparación clave:**  

- Azure AD facilita la provisión/desprovisión automática hacia aplicaciones cloud; AD requiere integraciones o herramientas adicionales para igualar esa capacidad.

---

### 8. Auditoría, logs y cumplimiento

**Active Directory**  

- Auditoría mediante Security Event Logs en controladores de dominio; requiere configuración de políticas de auditoría y SIEM para centralizar.  
- Herramientas como Microsoft Advanced Threat Analytics (ATA) o soluciones SIEM (Splunk, ELK, Sentinel) para detección avanzada.  

**Azure Active Directory** 

- Registros de actividad, sign-ins, auditorías y reportes accesibles desde el portal de Azure.  
- Integración nativa con **Azure Sentinel** y exportación de logs a SIEMs.  
- Informes de riesgo e inteligencia integrada.  

**Comparación clave:**  

- Azure AD ofrece telemetría y reportes listos para usar y exportar; en AD se necesitan más pasos para centralizar y enriquecer datos de auditoría.

---

### 9. Baja de cuentas / offboarding

**Active Directory**  

1. Deshabilitar la cuenta en ADUC o con `Disable-ADAccount`.  
2. Revocar pertenencia a grupos privilegiados.  
3. Archivar o mover el objeto a OU de contención para políticas de retención.  
4. Eliminar cuando haya vencido el periodo de retención.  
5. Revocar certificados y limpiar cuentas de servicio asociadas.

**Azure Active Directory** 

1. Deshabilitar o bloquear acceso en Azure Portal (bloquear el inicio de sesión).  
2. Revocar tokens de sesión (por ejemplo, invalidar refresh tokens).  
3. Desaprovisionamiento automático hacia aplicaciones SaaS vía SCIM si está configurado.  
4. Eliminar la cuenta del tenant cuando corresponda.  

**Comparación clave:**

- En entornos híbridos, hay que coordinar ambos (deshabilitar en AD y asegurarse que Azure AD Connect sincroniza esa baja).  
- Azure AD facilita revocar acceso cloud y tokens inmediatamente.

### 10. Provisión de aplicaciones y usuarios B2B / B2C

**Active Directory**  

- AD DS no está diseñado para gestionar identidades externas (clientes o partners) de forma nativa. Se usan soluciones externas o cuentas forest trust según el caso.  

**Azure Active Directory**  

- **Azure AD B2B** permite invitar identidades externas y darles acceso a recursos con control.  
- **Azure AD B2C** está pensado para escenarios orientados al consumidor final (autenticación de clientes).  

**Comparación clave:**  

- Azure AD está preparado para escenarios modernos de colaboración externa y aplicaciones al cliente; AD no es la opción natural para esa funcionalidad.