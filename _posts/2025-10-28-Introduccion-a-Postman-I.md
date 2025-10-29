---
title: "Introducción a Postman y testing de APIs (Parte I)"
date: 2025-10-28T16:02:00+02:00
categories: [Testing, APIs, Postman]
excerpt: "Aprende desde cero qué es el testing, las APIs REST y cómo usar Postman para realizar tus primeras pruebas de servicios REST de forma práctica y visual."
card_image: /assets/images/cards/Postman.png
---

### Introducción al testing ###

**¿Qué es el testing y por qué es necesario?**

El testing (pruebas de software) consiste en ejecutar un sistema o sus partes con el objetivo de encontrar errores, verificar comportamientos esperados, y asegurar que el software cumpla requisitos funcionales y no funcionales. El testing es necesario por los siguiente motivos:

* Reduce el coste de arreglar fallos (antes de producción).
* Mejora la calidad y la confianza en despliegues.
* Protege la experiencia del usuario final.
* Facilita entregas continuas (CI/CD) con menor riesgo.

**Niveles de pruebas**

* Unitarias (Unit tests): prueban componentes muy pequeños (funciones, clases). Rápidas y repetibles.
* De integración (Integration tests): comprueban interacción entre módulos (p. ej. base de datos + API).
* De sistema (System tests): validan el sistema completo contra requisitos.
* De aceptación (Acceptance / E2E): verifican flujos reales del usuario y requisitos de negocio.

Consejo: combinar niveles y automatizarlos según ROI. Unitarias frecuentes; integración y E2E en pipelines y pre-producción.

**Tipos de pruebas**

* Funcionales: validan comportamiento (endpoints, funciones).
* No funcionales: rendimiento, carga, seguridad, usabilidad.
* Exploratorias/manuales: testers exploran el sistema buscando anomalías.
* Automatizadas: scripts o herramientas que repiten pruebas (Postman, Selenium, JMeter).

**Técnicas de caja negra (basadas en especificación)** 

En la técnica de caja negra, el tester no conoce el código fuente.  
Se basa en la entrada y salida de datos: se prueban los resultados esperados en función de las especificaciones.  
Ejemplo: si enviamos una petición a una API y esperamos un código `200 OK`, no importa cómo internamente lo procesa el servidor.

Estas bases del testing son fundamentales antes de pasar a probar APIs, que son una de las áreas más comunes donde se aplican pruebas automatizadas.

### Introducción a las APIs REST ###

**¿Qué es una API REST?**

Una API REST es un estilo arquitectónico para comunicarse entre sistemas usando HTTP. Exposición de recursos mediante URLs y métodos HTTP (GET, POST, PUT, PATCH, DELETE). Normalmente intercambian JSON.

**¿Cómo construir una petición HTTP?**

Toda petición HTTP se compone de:

* Método: GET/POST/PUT/PATCH/DELETE.

| Método | Acción | Ejemplo |
|--------|--------|----------|
| GET | Obtener recursos | /usuarios |
| POST | Crear recursos | /usuarios |
| PUT | Reemplazar un recurso | /usuarios/1 |
| PATCH | Modificar parcialmente | /usuarios/1 |
| DELETE | Eliminar un recurso | /usuarios/1 |

* URL / Endpoint: https://api.ejemplo.com/usuarios/123.
* Headers: p. ej. Content-Type: application/json, Authorization: Bearer <token>.
* Query params: ?page=2&limit=50.
* Body (cuando aplica): JSON, form-data, x-www-form-urlencoded, etc.

Ejemplo (cURL):

~~~
curl -X POST "https://api.ejemplo.com/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"sergio","password":"secreto"}'
~~~

**¿Cómo probar servicios REST?**

* Verificar códigos HTTP (200, 201, 204, 400, 401, 404, 500).
* Validar estructura del JSON y valores clave.
* Probar casos felices y casos de error (inputs inválidos, auth fallida).
* Medir latencias / tiempos de respuesta.
* Probar concurrencia y límites (rate limiting).
* Integrar pruebas en CI (Newman, Jenkins, GitHub Actions).

### Introducción a Postman ###

**¿Qué es Postman?**

Postman es una plataforma para desarrollar, probar, documentar y automatizar APIs. Permite crear peticiones HTTP, escribir tests, organizar colecciones, simular servidores (mocks), y ejecutar colecciones desde línea de comandos con Newman.

**Instalación y configuración de Postman**

Puedes descargar Postman desde [https://www.postman.com/downloads/](https://www.postman.com/downloads/).  
Una vez instalado:

1. Crea una cuenta gratuita (opcional).
2. Inicia sesión y accede al panel principal (Dashboard).
3. Crea tu primer *workspace* o entorno de trabajo

### Dashboard de Postman ###

El dashboard muestra los principales elementos:
* **Sidebar izquierda:** colecciones, entornos y peticiones.
* **Zona central:** editor de peticiones.
* **Zona inferior:** consola de respuesta (status code, tiempo, tamaño del payload).

### Otras alternativas para testing de APIs REST ###

Aunque Postman es la más popular, existen otras opciones como:

* **Insomnia**  
* **Hoppscotch (anteriormente Postwoman)**  
* **Paw (macOS)**  
* **curl** (línea de comandos)

### Colecciones y variables ###

Enviando nuestra primera petición con Postman (paso a paso)

* Abrir Postman → New → Request.
* Nombre: GET Users. Guardar en colección Mi API.
* URL: https://jsonplaceholder.typicode.com/users. Método: GET.
* Click Send → verás respuesta JSON, headers y status.

**¿Qué son las colecciones?**

Las colecciones agrupa varias peticiones relacionadas bajo un mismo proyecto. Permite organizar, reutilizar y compartir fácilmente las pruebas.

Usos comunes:

* Agrupar endpoints por servicio.
* Añadir documentación y ejemplos.
* Preparar escenarios de pruebas para Collection Runner.

**Entornos (Environments)**

Los entornos permiten definir variables globales o específicas (por ejemplo, `{{url_base}}` o `{{token}}`).  
Así puedes cambiar entre entorno de desarrollo, pruebas o producción sin modificar cada petición.

~~~
{{base_url}} → https://api.dev.local
{{token}} → abc123
~~~

Crear entornos en Postman y seleccionar el activo antes de ejecutar.

Ejemplo de variables:

* Global: accesible en todos los entornos.
* Environment: solo en el entorno activo.
* Collection: variables específicas de una colección.
* Local: variables dentro de la request.

**Crear variables**

Haciendo uso de postman podemos crear variables de la siguiente forma

* Haz clic en el icono del ojo (👁️) en la parte superior derecha.
* Selecciona “Manage Environments”.
* Añade una nueva variable (base_url → https://jsonplaceholder.typicode.com).
* Guarda y selecciona el entorno activo.

### Conclusión ###
En esta primera parte has aprendido:
- Qué es el testing y cómo se estructura.
- Qué es una API REST y cómo se prueban sus endpoints.
- Cómo instalar Postman y enviar tus primeras peticiones.
- Cómo usar colecciones y variables para organizar tu trabajo.

👉 En el siguiente post, aprenderás a **automatizar pruebas, documentar APIs y usar Postman desde la línea de comandos** con herramientas como **Newman**.