---
title: "Postman avanzado: automatización, mocks, monitores y CLI"
date: 2025-10-28T17:15:00+02:00
categories: [Testing, APIs, Postman]
excerpt: "Aprende a automatizar pruebas, documentar servicios y usar Postman desde la línea de comandos. Domina las funciones avanzadas de Postman para entornos profesionales."
card_image: /assets/images/cards/Postman.png
---

# Postman avanzado: automatización, mocks, monitores y CLI

## Automatizando pruebas

### Scripts

Postman permite ejecutar scripts antes o después de enviar una petición.  
Estos se escriben en **JavaScript** dentro de las pestañas **Pre-request Script** y **Tests**.

Ejemplo básico:

~~~
pm.test("El código de estado es 200", function () {
    pm.response.to.have.status(200);
});
~~~

Puedes validar respuestas, guardar valores en variables o ejecutar flujos condicionales.

### Enlazando llamadas ###

Es posible encadenar peticiones, por ejemplo:

* En una petición de login se obtiene un token.
* Ese token se guarda como variable (pm.environment.set("token", value)).
* La siguiente petición lo usa en el header Authorization: Bearer {{token}}.

Ejemplo:

~~~
// En test de login
const res = pm.response.json();
pm.environment.set("auth_token", res.token);
~~~

Luego en Authorization o Headers usar {{auth_token}}.

### Collection Runner ###

El Collection Runner permite ejecutar automáticamente una colección completa de peticiones.
Ideal para pruebas de regresión o de integración continua.
Puedes definir iteraciones, datos externos (CSV/JSON) y analizar resultados globales.

Ejemplo de CVS para iteraciones:

~~~
username,password
user1,pass1
user2,pass2
~~~

### Documentación de APIs ###

Una documentación clara mejora la colaboración entre equipos y reduce errores. Postman genera documentación automática a partir de las colecciones.

**Introducción a Markdown**

Postman admite Markdown en descripciones. Sintaxis habitual: #, ###, listas, bloques de código, y tablas.

Ejemplo:

~~~
markdown
# Título
**Negrita**, *cursiva*, `código`
~~~

**Documentando un servicio en Postman**

* Selecciona tu colección.
* Haz clic en View documentation.
* Añade descripciones en Markdown a cada petición.
* Publica la documentación en línea o compártela con tu equipo.

### Simulando APIs REST###

**¿Qué es un Mock y por qué puede ser útil?**

Un mock server simula respuestas de una API sin tener un backend real. Útil para:

* Desarrollar frontend mientras backend no está listo.
* Probar flujos sin tocar datos reales.
* Demos y pruebas aisladas.

**Creando un Mock Server**

* Desde Postman, selecciona New → Mock Server.
* Asocia una colección existente.
* Define las respuestas simuladas.
* Obtén una URL temporal que podrás usar en tus peticiones.

### Monitores ###

**¿Qué son los monitores y cómo utilizarlos?**

Los monitores ejecutan automáticamente colecciones en intervalos definidos (por ejemplo, cada hora).
Sirven para verificar que una API sigue respondiendo correctamente o para pruebas de disponibilidad. Los monitores se usan para: 

* Uptime básico de endpoints.
* Verificar integridad tras despliegues.
* Alertas tempranas sobre regresiones.

Opciones: configurar notificaciones por email/Slack y ver historial.

### Newman y su línea de comandos ###

**¿Qué es Newman?**

Newman es la herramienta de línea de comandos de Postman que permite ejecutar colecciones desde el terminal o integrarlas en CI/CD (Jenkins, GitLab, etc.).

**Instalación de Newman**

~~~
npm install -g newman
~~~

**Usando Postman desde la línea de comandos**

Ejecuta una colección exportada:

~~~
newman run MiColeccion.postman_collection.json -e Entorno.postman_environment.json
~~~

Opciones útiles:

* --reporters cli,json,html para generar reportes.
* --iteration-data data.csv para datos parametrizados.

Integración: Jenkins, GitHub Actions, GitLab CI (ejecutar antes de deploy).

### La API de Postman ###

**¿Qué es la API de Postman?**

Es un conjunto de endpoints públicos que exponen la gestión de recursos de tu workspace (colecciones, entornos, etc.). Se usa para automatizar cargas, sincronizar y desplegar colecciones

**Autenticación**

Normalmente con una API Key que obtienes desde tu cuenta de Postman. Se envía en header:

~~~
x-api-key: <tu_api_key>
~~~

**Colecciones, entornos, mocks y monitores**

Puedes crear, actualizar o eliminar colecciones, entornos o monitores directamente desde la API.
Ideal para automatizar la gestión de pruebas y despliegues.

**Workspaces, usuario e importar**

Los workspaces organizan tus proyectos por equipo.
También puedes importar colecciones, usuarios o entornos mediante endpoints específicos.

### Últimos pasos ###

**¿Qué más cosas hacer con Postman?**

* Integrar con CI/CD usando Jenkins o GitHub Actions.
* Exportar resultados de tests.
* Colaborar con equipos mediante Workspaces compartidos.
* Usar variables globales o cifradas para mayor seguridad.