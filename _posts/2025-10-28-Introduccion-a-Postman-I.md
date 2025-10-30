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

![dashboard postman](/assets/images/Postman/dashboard.PNG)

### Otras alternativas para testing de APIs REST ###

Aunque Postman es la más popular, existen otras opciones como:

* **Insomnia**  
* **Hoppscotch (anteriormente Postwoman)**  
* **Paw (macOS)**  
* **curl** (línea de comandos)

### Colecciones y variables ###

**¿Qué son las colecciones?**

Las colecciones agrupa varias peticiones relacionadas bajo un mismo proyecto. Permite organizar, reutilizar y compartir fácilmente las pruebas.

Usos comunes:

* Agrupar endpoints por servicio.
* Añadir documentación y ejemplos.
* Preparar escenarios de pruebas para Collection Runner.

A continuación se mostrara una prueba de envío de primera petición con Postman (paso a paso). Para este ejemplo se va a usar la URL de un documento .json alojado en mi github [pokedex.json](https://raw.githubusercontent.com/sergioib94/Proyecto-Json/master/pokedex.json)

* Abrir Postman → New → Request.
* Nombre: GET Users. Guardar en colección Mi API.
* URL: https://raw.githubusercontent.com/sergioib94/Proyecto-Json/master/pokedex.json. Método: GET.
* Click Send → verás respuesta JSON, headers y status.

![primera peticion](/assets/images/Postman/primer_get.PNG)

**Entornos (Environments)**

Los entornos permiten definir variables globales o específicas (por ejemplo, url_base o token).  
Así puedes cambiar entre entorno de desarrollo, pruebas o producción sin modificar cada petición.

* base_url → https://api.dev.local
* token → abc123

Crear entornos en Postman y seleccionar el activo antes de ejecutar.

Ejemplo de variables:

* Global: accesible en todos los entornos.
* Environment: solo en el entorno activo.
* Collection: variables específicas de una colección.
* Local: variables dentro de la request.

**Crear variables**

En Postman, las variables te permiten reutilizar valores (como URLs, tokens, IDs, etc.) sin tener que escribirlos una y otra vez.Así, si mañana cambias la fuente (por ejemplo, a una API o un Mock Server), solo cambias la variable, y todas tus peticiones seguirán funcionando.

Haciendo uso de postman podemos crear variables de la siguiente forma

* En el sidebar izquierdo accedemos al apartado environments y seleccionamos el "+"
* Añade una nueva variable por ejemplo: (base_url → https://raw.githubusercontent.com/sergioib94/Proyecto-Json/master).
* Guarda y selecciona el entorno activo, en este caso el entorno creado seria "pokedex environment".

![creación de variable](/assets/images/Postman/variable.PNG)

![prueba de variable](/assets/images/Postman/prueba_variable.PNG)

Una vez que ya sepamos como crear variables y sepamos usarlas podemos pasar a realizar una prueba en la que visualizaremos una parte del Json con visualizer. Para ello seguiremos los siguientes pasos:

* Empezamos realizando una peticion GET como en el ejemplo anterior (GET {{base_url}}/pokedex.json)
* Al realizar la peticion, nos vamos a la opcion scripts, donde nos apareceran dos apartados, pre-req y post-res.

  * Pre-request → antes de enviar la petición (igual que siempre).
  * Post-response → después de recibir la respuesta (lo que antes se llamaba “Tests”).

* En post response indicaremos el siguiente scripts:

~~~
// Visualizer: muestra los 10 primeros Pokémon con estadísticas básicas

// 1) Obtener los datos del JSON
var body;
try {
  body = pm.response.json();
} catch (e) {
  body = null;
}

// 2) Si no hay datos válidos, mostrar mensaje
if (!body || !body.pokemon) {
  pm.visualizer.set("<div><strong>No se ha podido cargar la Pokédex.</strong></div>", {});
} else {
  // 3) Tomar los primeros 10 Pokémon y mapear propiedades necesarias
  var list = body.pokemon.slice(0, 10).map(function(p) {
    return {
      id: (typeof p.id !== "undefined") ? p.id : "",
      num: p.num || "",
      name: p.name || "",
      type: Array.isArray(p.type) ? p.type.join(", ") : (p.type || ""),
      hp: (p.base && typeof p.base.HP !== "undefined") ? p.base.HP : "",
      attack: (p.base && typeof p.base.Attack !== "undefined") ? p.base.Attack : "",
      defense: (p.base && typeof p.base.Defense !== "undefined") ? p.base.Defense : "",
      speed: (p.base && typeof p.base.Speed !== "undefined") ? p.base.Speed : "",
      height: p.height || "",
      weight: p.weight || ""
    };
  });

  // 4) Plantilla HTML para la tabla (usamos comillas inversas para multilínea)
  var template = `
    <h3>Pokédex — Primeros 10 Pokémon</h3>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial;">
      <thead style="background:#f3f3f3;">
        <tr>
          <th>ID</th>
          <th>Num</th>
          <th>Nombre</th>
          <th>Tipos</th>
          <th>HP</th>
          <th>Ataque</th>
          <th>Defensa</th>
          <th>Velocidad</th>
          <th>Altura</th>
          <th>Peso</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
          <tr>
            <td>{{this.id}}</td>
            <td>{{this.num}}</td>
            <td>{{this.name}}</td>
            <td>{{this.type}}</td>
            <td>{{this.hp}}</td>
            <td>{{this.attack}}</td>
            <td>{{this.defense}}</td>
            <td>{{this.speed}}</td>
            <td>{{this.height}}</td>
            <td>{{this.weight}}</td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  `;

  // 5) Renderizar en Visualize
  pm.visualizer.set(template, { items: list });
}
~~~

**Nota**: La opcion Post-response, aparecerá si la version de postman que se esta usando es 11 o superior, en caso de que sea una versión inferior aparecerá la opción test en su lugar.

Esto hará que visualizer muestre de forma sencilla a los 10 primeros pokemons de la pokedex.

* Tras indicar el script en la seccion post-res, enviamos la petición y una vez enviada le damos a la opción visualice que mostrara a los 10 primeros pokemons de la pokedex.

![test](/assets/images/Postman/test.PNG)

### Conclusión ###
En esta primera parte has aprendido:
- Qué es el testing y cómo se estructura.
- Qué es una API REST y cómo se prueban sus endpoints.
- Cómo instalar Postman y enviar tus primeras peticiones.
- Cómo usar colecciones y variables para organizar tu trabajo.

👉 En el siguiente post (Introducción a Postman (parte 2)), aprenderás a **automatizar pruebas, documentar APIs y usar Postman desde la línea de comandos** con herramientas como **Newman**.