---
title: "Introducción a la monitorización de seguridad"
date: 2025-11-27T19:31:00+02:00
categories: [Apuntes, Seguridad]
excerpt: "La monitorización y la observabilidad son pilares fundamentales en cualquier infraestructura moderna. Permiten entender lo que sucede dentro de los sistemas, detectar anomalías, responder a incidentes y garantizar la continuidad del servicio."
card_image: /assets/images/cards/seguridad.jpg
---

# Introducción

La monitorización y la observabilidad son pilares fundamentales en cualquier infraestructura moderna. Permiten entender lo que sucede dentro de los sistemas, detectar anomalías, responder a incidentes y garantizar la continuidad del servicio.

En un mundo donde las amenazas se vuelven más complejas y los entornos más distribuidos, la capacidad de detectar, correlacionar y responder a eventos críticos se ha convertido en una necesidad estratégica. De ahí que aumente la demanda de personal especializado: analistas, técnicos de monitorización, administradores de SIEM, operadores de SOC, etc.

## ¿Por qué monitorizar?

* Permite detectar ataques antes de que causen daño significativo.
* Proporciona visibilidad en tiempo real sobre el estado de los sistemas.
* Facilita el cumplimiento de normativas de seguridad y privacidad.

Hay dos conceptos importantes que hay que saber diferenciar y que a veces se llegan a confundir entre ellos:

* Observabilidad: implica entender el estado interno de un sistema a partir de sus datos de salida (logs, métricas y trazas).
* Monitorización: se centra en recopilación y análisis de estos datos y centralizarlos en una herramienta (Zabbix, Grafana, etc).

Ventajas de la monitorización:

* Detección temprana
* Respuesta rápida a incidentes
* Cumplimiento normativo
* Optimización de recursos

Desventajas: 

* Alto volumen de falsos positivos, si no tenemos una reglas bien establecidas podemos encontrarnos con alertas que realmente no representan un problema real.
* Gran volumen de datos por lo que al tener un gran volumen requiere una gran estructura que generan logs constantemente que deben almacenarse.
* Costes elevados.
* Demanda de personal cualificado ya que se buscan perfiles muy completos y con diversos conocimientos.

# Fundamentos de la monitorización de seguridad

## Principios básicos de detección de problemas

Podemos definir detección de amenazas al proceso para identificar actividades maliciosas o anómalas en un entorno informático. Esta detección de amenazas nos permite:

* Identificar compromisos activos.
* Detectar técnicas y tácticas antes del impacto.
* Iniciar respuestas oportunas en caso de confirmación de problema.

Tipos de detección de amenazas:

* Basadas en firmas: se basa en buscar patrones conocidos, como en los antivirus.
* Basadas en comportamiento: detectan desviaciones del uso normal del sistema. Se aplican en SIEM mediante reglas personalizadas o modelos de comportamiento basados en estadísticas.
* Basadas en heurística: usan reglas aproximadas, patrones desconocidos y técnicas de análisis avanzadas (incluyendo IA) para detectar comportamientos anómalos..

Flujo de detección

* Recogida: proceso en el que se hace captura de datos de múltiples fuentes relevantes para la seguridad. Fuentes más comunes: dispositivos de red, host, aplicaciones, herramientas de identidad, cloud, etc.
* Normalización: proceso de convertir datos heterogéneos a un formato estandarizado para permitir correlación y análisis del contexto mas sencillo. Los estándares más comunes son ECS, CEF, LEEF y JSON.
* Correlación: aplicación de lógica para detectar patrones maliciosos mediante múltiples eventos o condiciones.
* Alertado: generación de notificaciones automáticas cuando se cumple una condición definida. 

## Análisis de riesgos y vulnerabilidades

El riesgo en el entorno de la seguridad es la combinación de amenaza, vulnerabilidad y el impacto. Es importante saber identificarlo ya que nos va a ayudar a priorizar recursos y monitorizarlos y determina que activos son mas críticos.

Conceptos claves:

* Amenaza: cualquier actividad anómala o no legitima en una organización.
* Vulnerabilidad: fallo a nivel de código en aplicaciones o dispositivos que suponga una vía de entrada a un ciberatacante.
* Impacto: repercusión que se produce cuando hay un incidente de seguridad.
* Probabilidad: probabilidad real de que ocurran de nuevo.

Ciclo de análisis de riesgo:

* Identificación de activos: localizar y clasificar activos que procesos, almacenan o transmiten datos importantes. Por ejemplo: identificaríamos servidores, equipos de usuario, aplicaciones, infraestructuras cloud, etc. Estos activos normalmente los identificamos a través de inventarios (un excel con los datos de cada equipo de la empresa, servidor, etc) o a través de escáneres de red (nmap, angry ip, lansweeper, etc).

* Identificación de amenazas y vulnerabilidades: Las amenazas más comunes son: malware, ransomware, apts, accesos no autorizados, errores humanos o internos. Por otro lado, las vulnerabilidades más comunes son: software desactualizado, configuraciones poco seguras y contraseñas débiles. Para poder identificar estas amenazas y vulnerabilidades se usan herramientas como escáneres de vulnerabilidades (nessus, openvas), bases de datos cve (nvd, cve mitre) o auditorias técnicas.

* Evaluación del riesgo: Hay que identificar dos conceptos claves, la probabilidad de ocurrencia y el impacto en caso de que el incidente ocurra. 

    Estos riesgos se pueden tratar de varias formas:

    * Mitigandolo: se basa en reducir la probabilidad o el impacto. Por ejemplo: parchear software vulnerable.
    * Transfiriendolo: pasar el riesgo a un tercero.
    * Aceptandolo: asumiendo el riesgo si es bajo o inevitable.
    * Evitandolo: eliminando el activo o proceso que genera riesgo.  

* Tratamiento del riesgo y revision continua: consiste en revisar los cambios de tecnología a lo largo del ciclo de vida en nuestra infraestructura, las nuevas amenazas y vulnerabilidades que van a ir surgiendo y teniendo en cuenta los resultados de auditorias e incidentes. Por ejemplo: actualización de firewall de la red, cambio de sistemas, inclusión de nuevos servicios, etc.

Analizar los posibles riesgos nos ayudara a determinar que eventos monitorizar, donde desplegar los sensores (red, endpoint, cloud) y definir reglas de detección prioritarias.

# Herramientas y técnicas de monitorización

## Tipos de herramientas para la monitorización de seguridad

Es importante conocer las herramientas ya que nos van a permitir definir mejor el alcance de tu visibilidad, determinan la capacidad de detección y respuesta y son la base de toda estrategia de seguridad proactiva. Existen muchos tipos de herramientas, pero se suelen clasificar en las siguientes categorías:

* SIEM (Security Information and Event Management): recolecta, correlaciona y alerta sobre eventos de seguridad. Por ejemplo: Microsoft sentinel, splunk, elastic siem, fortinet, etc.

    Ventajas:

    * Visibilidad centrada
    * Reglas sigma
    * Cumplimiento

    Desventajas: 

    * Coste
    * Complejidad inicial

* EDR/XDR: monitorización y respuesta en endpoints. Por ejemplo: microsoft defender for endpoint, crowdstrike falcon y sentinelone.

* NDR: análisis de trafico de red en búsqueda de patrones maliciosos. Por ejemplo: darktrace, corelight y extrahop.

* HIDS/NIDS: detección de intrusiones en host/red haciendo uso de firmas, integridad de archivos y el comportamiento anómalo. Por ejemplo: Wazuh y OSSEC por parte de HIDS y Suricata y Snort por parte de NIDS.

* Sysmon y WEF: registro detallado en windows.

* SOAR (Security Orchestration Automation and Response): orquestación y respuesta automatizada. Por ejemplo: Cortex XSOAR, Flutter, Microsoft Sentinel.

* UEBA (User and Entity Behaviour Analytics): análisis de comportamiento de usuarios (cuentas comprometidas). Por ejemplo: Exabeam, Splunk UEBA, Microsoft defender for identity.


## Configuración de sistema de registro de eventos

Los sistemas de registro de eventos son los archivos o flujos que contienen información sobre lo que ocurre en sistemas, aplicaciones, redes, etc. Ejemplos de información: inicios/cierres de sesión, cambios de cuentas, ejecución de procesos, conexiones de red, etc.

Fuentes más comunes de eventos: 

* Windows/Linux: Security, aplicaciones, syslog.
* Red: firewall, DNS, proxy, netflow.
* Cloud: Azure activity, AWS cloudtrail.
* Aplicaciones: Logs HTTP, BBDD, autenticaciones.

Componentes claves de un sistema de registros:

* Agente: es donde se produce la información y encargado de enviar la información al servidor.
* Servidor: puede ser de reenvío, de salto o incluso puede no ser necesario y pasar la información al SIEM.
* SIEM: organizar y centralizar la información de los distintos agentes en la red.

Teniendo en cuenta estos conceptos, las herramientas clave para la configuración de sistemas windows serian:

* Windows Event Viewer (para revisar).
* WEF (Windows Event Forwarding) para enviar eventos a un servidor.
* Sysmon para eventos avanzados.

Conceptos claves a la hora de configurar sistemas Linux:

* Logs principales: /var/log/auth.log, /var/log/syslog y /var/log/secure.
* Recolección: rsyslog, syslog-ng, Filebeat.
* Servicios: SSH, sudo, cron, login, etc.

Herramientas de envío de logs:

* Filebeat (usado tanto en windows como Linux): ligero y fácil de configurar.
* Winlogbeat (usado en windows): especializado en eventos del sistema.
* NXlog (usado en windows y Linux): mas flexible, formato CEF, Json, etc.
* Syslog-ng (usando en Linux y firewall): estándar en redes y dispositivos.

## Implementación de alertas y notificaciones

Una alerta sería una notificación automática generada cuando un evento o conjunto de eventos coincide con una condición considerada sospechosa o peligrosa. El propósito de estas alertas es identificar y priorizar amenazas en tiempo real. Componentes de una alerta:

* Condición: la regla que determinar si una acción o acciones son sospechosas.
* Fuente: origen de los datos de registro.
* Severidad: Es algo que se configura en función al riesgo. Por ejemplo: un ataque por fuerza bruta sería una amenaza critica.
* Acción: Va a determinar la acción a realizar, ya sea un análisis, respuestas, etc.

Tipos de alertas:

* Basadas en reglas
* UEBA
* Detección por firma
* Alertas correladas

Canales por los se comunican las alertas:

* Email / SMS
* Slack / Webhook: nos permitirán conectar distintas aplicaciones entre si.
* Dashboards: nos permitirá tener un panel centralizado.
* Ticketing: herramientas que sirva para escuchar una bandeja de entrada y nos habrá un ticket al recibir alguna notificación como JIRA.

# Análisis y respuesta a incidentes

## Proceso de análisis de incidentes de seguridad

Un incidente de seguridad es cualquier acción ilegal, no autorizada o inaceptable que afecte a un sistema informático, teléfono móvil, tablet y cualquier otro dispositivo electrónico con un sistema operativo o que funcione en una red informática.

Fases de respuesta a incidentes (SANS):

* Preparación: incluye preparación de la organización, preparación de equipo y preparación de la infraestructura. Esta preparación conlleva una inversión elevada, infraestructuras complejas y sobrecarga de soluciones.

* Identificación: detectar y confirmar la existencia de incidentes de seguridad, clasificamos el incidente y evaluamos el impacto. Aquí realizamos tanto la monitorización del sistema como el análisis de los logs.

* Contención: limitar en lo posible el alcance del incidente, evitar su propagación y proteger los recursos críticos.

* Erradicación: identificar y eliminar la causa raíz de la amenaza.

* Recuperación: restablecimiento del funcionamiento normal de los sistemas, restauración de copias de seguridad, reinicio de sistemas y monitoreo continuo.

* Lección aprendida: reflexionas sobre como ocurrió el incidente y si hay maneras de prevenir futuras fugas de información y mejorar el mantenimiento.

## Estrategias de respuesta rápida a incidentes

La respuesta ante incidentes es el conjunto de acciones o técnicas organizativas que se ejecutan tras la detección de una incidencia. El objetivo es minimizar el daño y restaurar el sistema.

Tipos de respuesta rápida:

* Aislamiento del sistema: evitar que malware se propague.
* Revocación de credenciales: evitar que un atacante ataque con algún usuario vulnerado
* Bloqueo IP
* Desactivación de servicios
* Segmentación de red
* Bloqueo de dominio

Herramientas clave para la respuesta rápida:

* EDR: aislar el equipo y eliminar procesos
* SIEM: ejecutar playbook, integración con SOAR
* Firewall: Bloquear Ip o dominios
* Active directory: Deshabilitar usuario y revocar credenciales
* SOAR: automatizar múltiples pasos

Las decisiones que se toman en las respuestas rápidas se dividen en dos tipos, estratégicas y rápidas:

* Estratégicas: cambiar contraseñas de usuarios, realizar parcheos o realizar análisis forense.
* Rápidas: decisiones que se toman en minutos, aislar host, bloquear ip, suspender cuentas. Importante documentar todo lo posible.

Anteriormente hemos mencionado el termino playbook, los playbooks guía que nos va a guiar paso a paso como analizar y responder incidentes en función de su tipología.

Ventajas: 

* Evita improvisaciones
* Estandariza la respuesta
* Acelera decisiones

## Evolución post-incidente y lecciones aprendidas

Una evaluación post-incidente es el análisis estructurado posterior a la gestión del incidente. Sus objetivos son: extraer aprendizajes, validar lo que funciono y no funciono y detectar áreas de mejora. Este evaluación se suele hacer 72 horas posteriores al cierre del incidente.

# Optimización y mejora continua

## Métricas y KPIs en la monitorización de seguridad

Hay varias razones por las que necesitamos medir/usar métricas en nuestro servicio como pueden ser: identificar cuellos de botella, justificar inversiones, evaluar la eficiencia de la detección y demostrar el cumplimiento.

Diferencia entre métrica y KPI:

* Métrica: es el valor cuantificable de una actividad especificas, Por ejemplo: numero de alertas diarias.
* KPI: son métricas alineadas con objetivos estratégicos de negocio. Por ejemplo: el tiempo medio de detección (MTTD).

Algunos de los KPIS que pueden ser fundamentales son:

* MTTD (Mean Time to Detect): tiempo medio para detectar un incidente.
* MTTR (Mean Time to Respond): tiempo medio en responder y contener.
* Falsos positivos: porcentaje de alertas legitimas.
* Alertas por analista/dia: carga operativa por persona.
* Tiempo hasta alerta: tiempo desde el evento hasta la generación de la alerta.

Herramientas para recolectar KPI:

* SIEM
* Dashboards, PowerBI, Grafana
* Scripts o alertas internas (python, CSV, KQL)

## Automatización de tareas de monitorización

A la hora de realizar tareas de monitorización en seguridad, automatizar dichas tareas puede ser importante dado que reduce la carga operativa, mejora el MTTR, aumenta la precisión y el contexto y ademas permite escalar sin aumentar recursos humanos.

Algunas de las tareas que más se suelen automatizar son:

* Recolección de eventos. Por ejemplo: uso de filebeat para enviar logs automáticamente.
* Enriquecimiento de alertas. Por ejemplo: obtener información de las ips, dominios o hashes.
* Notificación automática. Por ejemplo: envío por teams, correo o ticketing.