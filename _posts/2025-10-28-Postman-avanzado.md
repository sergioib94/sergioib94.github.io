---
title: "Introducción a Postman (parte 2)"
date: 2025-10-28T17:15:00+02:00
categories: [Testing, APIs, Postman]
excerpt: "Aprende a automatizar pruebas, documentar servicios y usar Postman desde la línea de comandos. Domina las funciones avanzadas de Postman para entornos profesionales."
card_image: /assets/images/cards/Postman.png
---

# Postman avanzado: automatización, mocks, monitores y CLI

## Automatizando pruebas

### Scripts

Postman permite ejecutar scripts antes o después de enviar una petición.  
Estos se escriben en **JavaScript** dentro de las pestañas **Pre-request Script** y **Tests** (La pestaña test para a llamarse post-response a partir de la version 11).

Ejemplo básico:

~~~
pm.test("El código de estado es 200", function () {
    pm.response.to.have.status(200);
});
~~~

![script_basico](/assets/images/Postman/script_basico.PNG)

Puedes validar respuestas, guardar valores en variables o ejecutar flujos condicionales.

Ejemplo de validaciones:

~~~
// 1) comprobar status
pm.test("Status is 200", function () {
  pm.response.to.have.status(200);
});

// 2) parsear body
var body;
try {
  body = pm.response.json();
} catch (e) {
  body = null;
}

// 3) comprobar estructura
pm.test("Body is object with 'pokemon' array", function () {
  pm.expect(body, "body is null or not JSON").to.be.an("object");
  pm.expect(body).to.have.property("pokemon");
  pm.expect(Array.isArray(body.pokemon), "'pokemon' is not an array").to.be.true;
});

var first = (body && body.pokemon && body.pokemon[0]) ? body.pokemon[0] : null;

// DEBUG: descomenta si necesitas ver las keys en consola
console.log("Primer pokemon (obj):", first);
if (first) {
  console.log("Claves del primer pokemon:", Object.keys(first));
}

// 4) comprobar el primer elemento
pm.test("Primer pokemon existe y es objeto", function () {
  pm.expect(first, "Primer elemento no encontrado").to.be.an("object");
});

// Compruebo existencia de cada clave por separado con mensajes claros
var expectedKeys = ["id","num","name","img","type","height","weight","base"];
expectedKeys.forEach(function(k) {
  pm.test("Primer pokemon tiene la propiedad: " + k, function () {
    pm.expect(first).to.have.property(k);
  });
});

// Comprobaciones de tipos (ejemplo)
pm.test("Todos los pokemon tienen id numérico", function () {
  body.pokemon.forEach(function(p) {
    pm.expect(p).to.have.property("id");
    pm.expect(typeof p.id).to.equal("number");
  });
});
~~~

![comprobaciones test](/assets/images/Postman/test2.PNG)

### Enlazando llamadas ###

Es posible encadenar peticiones, por ejemplo:

* En una petición de login se obtiene un token.
* Ese token se guarda como variable (pm.environment.set("token", value)).
* La siguiente petición lo usa en el header Authorization: Bearer {{token}}.

A modo de prueba vamos a realizar una busqueda por id haciendo uso de nuestro json:

* Realizamos la siguiente request

~~~
GET {{base_url}}/pokedex.json?={{id}}
~~~

* En el apartado de scripts, ponemos el siguiente script en pre-resquest:

~~~
// Si no existe variable 'id', se define por defecto
if (!pm.variables.get("id")) {
  pm.variables.set("id", "25"); // Ejemplo: Pikachu
  console.log("Variable 'id' no definida, usando id=25");
} else {
  console.log("Usando id:", pm.variables.get("id"));
}
~~~

Este script comprobara antes de ejecutar la request si tienes una variable llamada id, si no existe, la crea con valor 25 (Pikachu) y si ya existe (porque la definiste en tu entorno), usará esa.

* En el apartado post-response por otro lado indicaremos este otro script:

~~~
// E: Filtrar Pokémon por ID y guardar variables
var body = pm.response.json();

// Obtener el id de la variable o de la query (?id=)
var id = parseInt(pm.variables.get("id") || 0);

// Buscar el Pokémon por su id
var found = body.pokemon.find(function(p) { return p.id === id; });

// Validar que se ha encontrado
pm.test("Buscar Pokémon por id " + id, function() {
  pm.expect(found, "No encontrado").to.exist;
});

// Si se encuentra, guardar variables para la siguiente request
if (found) {
  pm.environment.set("last_found_id", found.id);
  pm.environment.set("last_found_name", found.name);
  pm.environment.set("last_found_num", found.num);
  pm.environment.set("last_found_type", Array.isArray(found.type) ? found.type.join(", ") : found.type);
  console.log("Guardadas variables de", found.name);
} else {
  console.log("No se encontró Pokémon con id:", id);
}
~~~

Con este script haremos lo siguiente:

1. Carga tu pokedex.json.
2. Busca el Pokémon cuyo id coincide con {{id}}. 
3. Si lo encuentra, crea 4 variables de entorno: last_found_id, last_found_name, last_found_num, last_found_type
4. Muestra el resultado en consola.

* Ejecutamos la quest pulsando send.

Una vez realizados los pasos mencionados, abriendo la consola de postman (Ctrl + alt + c), deberiamos ver la siguiente pantalla.

![consula](/assets/images/Postman/id.PNG)

Podremos comprobar las variables que han sido creadas abriendo el apartado environments en el sidebar izquierdo.

![variables_25](/assets/images/Postman/pikachu.PNG)

### Collection Runner ###

El Collection Runner permite ejecutar automáticamente una colección completa de peticiones. Ideal para pruebas de regresión o de integración continua.
Puedes definir iteraciones, datos externos (CSV/JSON) y analizar resultados globales.

Ejemplo de CVS para iteraciones:

~~~
username,password
user1,pass1
user2,pass2
~~~

A modo de prueba pra comprobar como funcionan las collection runners, se van a usar tanto el fichero pokemon.json que se ha ido usando en todos los ejemplos practicos y ademas en este caso se va a usar tambien un fichero llamado ids.json (este fichero tambien puede crearse en formato .csv) con el siguiente contenido:

~~~
[
  { "id": 1 },
  { "id": 4 },
  { "id": 7 },
  { "id": 25 },
  { "id": 150 }
]
~~~

El collection runner lo que hara al leer este fichero sera crear una variable id en cada iteracion con el valor indicado en cada array.

* En el sidebar izquierdo abrimos la opcion collections y seleccionamos la coleccion que se este usando, en mi caso pokedex runner.
* Abrimos la opcion **run** (clic derecho en la collection) y una vez abierta la opcion run, añadiremos el fichero ids.json.

![add_file](/assets/images/Postman/file.PNG)

* Una vez subido el fichero json, antes de ejecutar el run, tenemos que asegurarnos de que la request, en este caso GET {{base_url}}/pokedex.json debemos tener en el apartado scripts, un script similar a este:

~~~
// ==========================================
// 🧩 Visualizer + Tests con ID dinámico
// ==========================================

// 1️⃣ Obtener ID desde Runner o entorno
let id = null;
if (pm.iterationData && pm.iterationData.get("id")) {
  id = parseInt(pm.iterationData.get("id"), 10);
} else if (pm.environment.get("id")) {
  id = parseInt(pm.environment.get("id"), 10);
}

// 2️⃣ Parsear JSON
let body;
try {
  body = pm.response.json();
  pm.test("✅ La respuesta es un JSON válido", function () {
    pm.expect(body).to.be.an("object");
  });
} catch (e) {
  pm.test("❌ Error al parsear JSON", function () {
    throw e;
  });
  return;
}

// 3️⃣ Verificar estructura básica
pm.test("✅ El JSON contiene el array 'pokemon'", function () {
  pm.expect(body).to.have.property("pokemon");
  pm.expect(body.pokemon).to.be.an("array");
});

// 4️⃣ Filtrar Pokémon por ID o mostrar los primeros 10
let items = [];
if (id) {
  items = body.pokemon.filter(p => p.id === id);
  pm.test(`✅ Existe un Pokémon con ID ${id}`, function () {
    pm.expect(items.length).to.eql(1);
  });
} else {
  items = body.pokemon.slice(0, 10);
}

// 5️⃣ Crear plantilla HTML (Visualizer)
const template = `
  <style>
    body { font-family: Arial, sans-serif; margin: 10px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
    th { background: #f3f3f3; }
  </style>
  <h3>Pokémon encontrado (ID = ${id || "sin especificar"})</h3>
  {{#if items.length}}
  <table>
    <thead>
      <tr>
        <th>ID</th><th>Num</th><th>Nombre</th><th>Tipo</th>
        <th>HP</th><th>Ataque</th><th>Defensa</th>
      </tr>
    </thead>
    <tbody>
      {{#each items}}
      <tr>
        <td>{{this.id}}</td>
        <td>{{this.num}}</td>
        <td>{{this.name}}</td>
        <td>{{this.type}}</td>
        <td>{{this.base.HP}}</td>
        <td>{{this.base.Attack}}</td>
        <td>{{this.base.Defense}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  {{else}}
    <p style="color:red;">⚠️ No se encontró ningún Pokémon con el ID indicado.</p>
  {{/if}}
`;

pm.visualizer.set(template, { items });
~~~

* Cuando tengamos el fichero ids.json subido, le damos a la opcion **run** y se nos deberia mostrar una pantalla en la que se muestran una serie de test realizados a cada iteracion. Al hacer el run los valores ID indicados en el json deberian haberse pasado a la variable id creada en la request (se puede comprobar si se han pasado o no abriendo la consola Ctrl + Alt + C).

![run](/assets/images/Postman/run.PNG)

* Al haberse pasado el valor de las ID, si ejecutamos si abrimos la opcion Visualize se deben mostrar los datos de los pokemons cuyas IDs correspondan con las indicadas en el json.

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

### Simulando APIs REST ###

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