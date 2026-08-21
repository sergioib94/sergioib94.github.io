---
title: "Lab NOC/SOC: Pipeline de alertas con IA"
date: 2026-08-21T12:45+02:00
categories: [Homelab, DevOps, IA, n8n]
excerpt: "Zabbix y Grafana ya no mandan alertas en bruto: ahora pasan primero por un triage con IA en n8n antes de llegar a Slack. El camino hasta Groq pasó por descartar la API de pago de Claude y un LLM local que el hardware del lab no pudo sostener."
card_image: /assets/images/cards/lab-noc-soc-pipeline.png
---

## Introducción

Con el reverse proxy, TLS propio y SSO delante de Grafana, Zabbix y n8n ya cerrados en el post anterior, quedaba una pieza sin usar de verdad: n8n llevaba semanas desplegado en el lab pero sin ningún workflow real corriendo detrás. Este post cierra ese hueco con un caso de uso que encaja de forma natural en un entorno NOC/SOC, un pipeline que recibe alertas de Zabbix y Grafana, les pasa un primer triage por IA, y solo entonces las manda a Slack, ya con un resumen, una severidad estimada y una acción recomendada en vez de un mensaje en bruto que el analista tiene que interpretar desde cero.

La idea no es sustituir el criterio humano, es reducir el ruido antes de que llegue a una persona. Un NOC real recibe decenas o cientos de alertas al día, muchas de ellas redundantes o de bajo impacto; que un modelo haga un primer filtro y priorización antes de despertar a nadie es exactamente el tipo de automatización que tiene sentido en este contexto. Y, como en los posts anteriores, el proceso no salió limpio a la primera ya que hubo que resolver problemas de resolución de nombres entre contenedores, un error de sintaxis en Zabbix por un despiste de mayúsculas, y un cambio de planes completo en la Fase 3 cuando la opción inicial (API de pago) y la segunda (LLM local) se descartaron por motivos muy distintos, hasta llegar a la que finalmente funcionó.

## Fase 0: Preparativos en Slack

Accedemos a api.slack.com/apps, al ser la primera vez que usamos slack, los primeros pasos nos pedirá un correo y se creara nuestro workspace, en este caso yo lo llame NOC-SOC Alertas.

![slack workspace](/assets/images/lab-noc-soc-pipeline/slack_workspace.PNG)

En una pestaña distinta fuera de la interfaz de slack accedemos a api.slack.com/apps para que esta vez si nos aparezca la opción "Create an Apps", dentro nos aparecerán varias opciones, pero para lo que necesitaremos que es un simple Incoming Webhook, la opción a elegir es "Blank app". Tras pulsar "Blank app" pedirá nombre de la app (ej. n8n-alertas) y workspace en el que seleccionamos el workspace NOC-SOC Alertas credo anteriormente y confirmamos la creación de la app.

![slack app](/assets/images/lab-noc-soc-pipeline/slack_app.PNG)

![create for scratch](/assets/images/lab-noc-soc-pipeline/create_from_scratch.PNG)

Tras confirmar la creación de la app, en el menu lateral izquierdo buscaremos la opción "Incomming webhoocks" en la que primero pondremos a **on** la opción "Activate Incoming Webhooks" y segundo tendremos que bajar hasta "Add New Webhook to Workspace", elegimos el canal (general-noc-soc-alertas o el que hayas creado) y copiamos la URL del webhoock que se nos crea ya que sera necesario para mas adelante.

![webhook activate](/assets/images/lab-noc-soc-pipeline/webhook_activate.PNG)

![webhook url](/assets/images/lab-noc-soc-pipeline/webhook_url.PNG)

## Fase 1: Creación de webhooks

### Creación de workflow n8n

* Entramos en https://n8n.lab.local
* New workflow
* Añadimos el primer nodo Webhook, con la siguiente configuración:
    * HTTP Method: POST
    * Path: zabbix-alert (n8n generará la URL completa, algo como https://n8n.lab.local/webhook/zabbix-alert)
    * Respond: Immediately (para que Zabbix reciba un 200 OK rápido y no reintente por timeout)
* Duplica el workflow o añade un segundo nodo Webhook independiente en el mismo canvas, con Path: grafana-alert

**Nota:** Zabbix y Grafana mandan payloads con estructura muy distinta, y mezclarlos en un único workflow complica el nodo de normalización más adelante.

![configuración webhook zabbix](/assets/images/lab-noc-soc-pipeline/webhook_zabbix.PNG)
![configuración webhook grafana](/assets/images/lab-noc-soc-pipeline/webhook_grafana.PNG)

### Configurar el Webhook en Zabbix

* Entremos a https://zabbix.lab.local → Alerts → Media types → Create media type.
* Tipo: Webhook.
* En la URL del script, tendremos que definir el payload, Zabbix usa un pequeño script JavaScript embebido para construir la petición HTTP. Para empezar simple, se puede usar la plantilla base y solo ajustar la URL destino a tu webhook de n8n: https://n8n.lab.local/webhook/zabbix-alert
* Definimos los parámetros del webhook (macros que quieres enviar): {EVENT.NAME}, {HOST.NAME}, {EVENT.SEVERITY}, {EVENT.DATE}, {EVENT.TIME}, {TRIGGER.STATUS}.

![media type](/assets/images/lab-noc-soc-pipeline/media_type_zabbix.PNG)

Una vez creado el media type, antes de vincularlo al usuario, realizaremos una prueba "test":

![error de test](/assets/images/lab-noc-soc-pipeline/error_test_media_type.PNG)

**Troubleshooting test error enviando alerta a n8n: Error: cannot get URL: Could not resolve hostname**

Revisamos si el contenedor zabbix-server esta conectado a la red lab_proxy:

```bash
docker inspect zabbix-zabbix-server-1 --format '{{json .NetworkSettings.Networks}}' | python3 -m json.tool
```

Si no aparece la red conectada al contenedor, ejecutamos `--force-recreate`:

```bash
docker compose -f <ruta-compose-zabbix> up -d --force-recreate zabbix-server
```

Si aparece conectada revisamos la resolucion DNS:

```bash
docker exec zabbix-zabbix-server-1 getent hosts automation-n8n-1
```

El error se debe a la url indicada inicialmente dado que la url indicada https://n8n.lab.local/webhook/zabbix-alert al ser una URL publica la peticion es interceptada por authelia por lo que a traves de esta url la peticion nunca va a llegar a zabbix o a grafana. Para solucionar esto cambiamos la url indicada anteriormente por la URL interna (http://automation-n8n-1:5678/webhook/zabbix-alert) y realizamos el test para comprobar que se ejecuta correctamente.

Zabbix-test:

![test zabbix ok](/assets/images/lab-noc-soc-pipeline/zabbix-test-ok.PNG)

* Vinculamos este Media type al usuario en Users → [tu usuario] → Media para que las alertas se disparen hacia él.
* Creamos una Action en Alerts → Actions → Trigger actions que use este media type como condición de notificación.

### Configurar el Webhook en Grafana

* Entramos a https://grafana.lab.local → Alerting → Contact points → New contact point.
* Tipo: Webhook.
* URL: http://automation-n8n-1:5678/webhook/grafana-alert
* Lo vinculamos a una Notification policy (o a una alert rule específica que ya tengas, como la de node-exporter que vimos antes en tu dashboard).
* Desde Grafana: usa el botón Test del contact point.

![contact point grafana](/assets/images/lab-noc-soc-pipeline/contact_point_grafana.PNG)

Grafana-test:

![test grafana](/assets/images/lab-noc-soc-pipeline/test-grafana.PNG)

Confirmamos en n8n que el payload llega completo en ambos casos.

## Fase 2: Enriquecimiento del contexto en n8n

Una vez comprobado que tanto Zabbix como Grafana llegan bien al workflow, es el momento de enriquecer el contexto en n8n. Zabbix y Grafana mandan estructuras muy distintas. Antes de construir el prompt para Claude, conviene mapear ambos a un formato común dentro de n8n.

### Normalizado de payloads

En el editor, tras cada nodo Webhook (zabbix-alert y grafana-alert), añadimos un nodo Edit Fields (Set) que traduzca los campos de origen a nombres comunes:

**Configuración de Edit Fields Zabbix**

```bash
origen: "zabbix"
alerta_nombre: {{ $json.body.event_name }}
host: {{ $json.body.host_name }}
severidad: {{ $json.body.event_severity }}
fecha: {{ $json.body.event_date }}
hora: {{ $json.body.event_time }}
estado: {{ $json.body.trigger_status }}
```

Esta configuración hay que indicarla una por una en campos clave-valor quedando de la siguiente forma:

![set zabbix](/assets/images/lab-noc-soc-pipeline/config-set-zabbix.PNG)

Antes de empezar con la configuración de grafana, confirmaremos el JSON real para verificar la estructura ya que el formato de grafana es mas variable que el de zabbix, para ello ejecutamos el workflow en n8n y realizamos una prueba (test) desde grafana para ver la estructura del JSON de grafana.

```JSON
{
  "receiver": "webhook",
  "status": "firing",
  "alerts": [
    {
      "status": "firing",
      "labels": {
        "alertname": "TestAlert",
        "instance": "Grafana"
      },
      "annotations": {
        "summary": "Notification test"
      },
      "startsAt": "2026-08-17T10:20:21.956376704Z",
      "endsAt": "0001-01-01T00:00:00Z",
      "generatorURL": "",
      "fingerprint": "57c6d9296de2ad39",
      "silenceURL": "http://localhost:3000/alerting/silence/new?alertmanager=grafana&matcher=alertname%3DTestAlert&matcher=instance%3DGrafana",
      "dashboardURL": "",
      "panelURL": "",
      "values": null,
      "valueString": "[ metric='foo' labels={instance=bar} value=10 ]"
    }
  ],
  "groupLabels": {
    "alertname": "TestAlert",
    "instance": "Grafana"
  },
  "commonLabels": {
    "alertname": "TestAlert",
    "instance": "Grafana"
  },
  "commonAnnotations": {
    "summary": "Notification test"
  },
  "externalURL": "http://localhost:3000/",
  "version": "1",
  "groupKey": "webhook-57c6d9296de2ad39-1786962021",
  "truncatedAlerts": 0,
  "orgId": 1,
  "title": "[FIRING:1] TestAlert Grafana",
  "state": "alerting"
}
```

Teniendo en cuenta la estructura del JSON de prueba, realizamos la configuración del payload de Edit Field Grafana para que quede de la siguiente forma:

```bash
origen: "grafana"
alerta_nombre: {{ $json.body.alerts[0].labels.alertname }}
host: {{ $json.body.alerts[0].labels.instance }}
severidad: {{ $json.body.alerts[0].labels.severity }}
fecha: {{ $json.body.alerts[0].startsAt }}
hora {{ $json.body.alerts[0].startsAt }}
estado: {{ $json.body.status }}
detalle {{ $json.body.message }}
```

![set grafana](/assets/images/lab-noc-soc-pipeline/config-set-grafana.PNG)

**Nota:** severidad quedará vacío para la alerta de test (es esperado, no es un error), pero se rellenará bien en cuanto tengas alert rules reales con la label severity definida.

Con los dos nodos Edit Fields listos, toca unir ambos caminos en un flujo común, para ello creamos un nodo merge conectando ambas salidas (la del Edit Fields de Zabbix y la de Grafana) como las dos entradas del nodo Merge. 

**Configuración de Merge**

Mode Append: esto hace que, sea cual sea el origen que dispare el workflow, el resultado siga el mismo camino a partir de aquí, sin necesitar lógica condicional.

A partir de este nodo, el resto del workflow (enriquecimiento opcional, prompt a Claude, envío a Slack) se construye una sola vez, y sirve para alertas de ambos orígenes.

Antes de continuar a la siguiente fase, comprobaremos que el workflow se completa correctamente sin errores.

**workflow zabbix**

![prueba merge zabbix](/assets/images/lab-noc-soc-pipeline/prueba-merge-zabbix.PNG)

**workflow grafana**

![prueba merge grafana](/assets/images/lab-noc-soc-pipeline/prueba-merge-grafana.PNG)

## Fase 3: Integración con un LLM para el triage

### Intento 1 — API de Claude

**Credencial de la API en n8n**

* Credentials → New → busca Anthropic (n8n suele traer un nodo nativo para Claude; en el caso de que la version no disponga del nodo, usaremos HTTP Request genérico).

![API KEY anthropic](/assets/images/lab-noc-soc-pipeline/api_key_anthropic.PNG)

* Pegamos la API key de Anthropic (la generas en console.anthropic.com).

![credential n8n](/assets/images/lab-noc-soc-pipeline/anthropic_credential.PNG)

**Nodo de llamada a Claude**

Si en n8n tenemos el nodo nativo de Anthropic/LangChain, es la opción más simple. 

* Credential: la que acabas de crear.
* Model: claude-sonnet-4-5
* System message: el prompt de triage que definimos.
* User message: los campos normalizados del Merge.

Si no, con HTTP Request:

* Method: POST
* URL: https://api.anthropic.com/v1/messages
* Headers:
    * x-api-key: (vía credencial, no en texto plano)
    * anthropic-version: 2023-06-01
    * content-type: application/json
* Body (JSON):

```JSON
{
  "model": "claude-sonnet-4-5",
  "max_tokens": 500,
  "system": "Eres un asistente de triage de alertas para un NOC/SOC. Recibes una alerta de monitorización (Zabbix o Grafana) y debes evaluarla con criterio operativo. Responde ÚNICAMENTE con un JSON válido, sin texto adicional, con este esquema exacto: {\"severidad_estimada\": \"critica|alta|media|baja|ruido\", \"resumen\": \"una frase con la causa probable\", \"accion_recomendada\": \"qué debería hacer el analista\", \"es_ruido_conocido\": true|false}",
  "messages": [
    {
      "role": "user",
      "content": "Alerta recibida:\nOrigen: {{ $json.origen }}\nNombre: {{ $json.alerta_nombre }}\nHost: {{ $json.host }}\nSeveridad reportada: {{ $json.severidad }}\nFecha: {{ $json.fecha }}\nEstado: {{ $json.estado }}\nDetalle: {{ $json.detalle }}"
    }
  ]
}
```

**Nodo de parseo de la respuesta**

Claude devolverá el JSON como texto dentro de content[0].text. Añadimos un nodo Code (JavaScript) para extraerlo y parsearlo:

```JSON
const responseText = $input.item.json.content[0].text;
const triage = JSON.parse(responseText);

return {
  json: {
    ...$('Merge').item.json,  
    ...triage                  
  }
};
```

`$('Merge')` al nombre exacto que se haya puesto al nodo Merge, para recuperar los datos originales de la alerta junto con el triage de Claude.

**Por qué se descarta**: requiere cargar crédito de pago en la cuenta de la API. Válida si se dispone de presupuesto, pero para este lab se busca alternativa sin coste.

### Intento 2 — Ollama (LLM local, self-hosted)

Creamos el directorio ollama/docker-compose.yml para desplegar el contenedor docker:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    volumes:
      - ollama-data:/root/.ollama
    networks:
      - lab_proxy   # misma red que n8n, para que puedan hablar entre sí
    # Sin exponer puertos al host — solo accesible internamente, mismo patrón de hardening

networks:
  lab_proxy:
    external: true

volumes:
  ollama-data:
```

```bash
docker compose -f ~/noc-soc/ollama/docker-compose.yml up -d
```

Una vez el contenedor esté arriba, descarga el modelo dentro de él:

```bash
docker exec -it ollama ollama pull llama3.1:8b
```

**Nota:** Esto tardará un rato (varios GB de descarga). Si tu entorno tiene poca RAM/CPU disponible (como puede pasar en WSL2 con recursos limitados), una alternativa más ligera es mistral:7b o incluso phi3:mini.

Verificamos que responde:

```bash
docker exec -it ollama ollama run llama3.1:8b "Responde solo con OK"
```

En n8n configuramos la salida del nodo merge para que la salida vaya dirigida a un nodo "Basic LLM Chain", este nodo mostrara una salida y un conector (puerto "model"), la que se usara sera la del puerto "model". Hasta aquí la estructura del workflow seria igual que con la opción de Claude, la diferencia se da en el ultimo nodo, ya que al usar Ollama, no seria necesario crear no nodo "Anthropic", sino un nodo Ollama con la siguiente configuración:

* URL base: http://ollama:11434
* modelo: modelo de ollama descargado, en este caso "llama3.1:8b".

**Por qué se descarta**: el lab está limitado a 8GB de RAM física, con WSL2 topado a 4GB (el host Windows necesita el resto para no ralentizarse). Ni el modelo más ligero probado llega a cargar de forma fiable en ese margen. Encaja con la filosofía self-hosted del resto del proyecto, pero el hardware del lab no lo permite en este caso.

### Opción final: Groq (API en la nube, tier gratuito)

**Por qué se elige**: sin coste (tier gratuito real, no crédito de prueba), sin consumo de RAM local, y con calidad de respuesta suficiente para esta tarea. Es la solución con la que se completa el resto del pipeline.

Empezamos creándonos una cuenta (no es necesario crearse una, se puede acceder con cuenta gmail/github) y una API Keyen Groq, para ello accedemos a [Groq](https://console.groq.com/).

![groq](/assets/images/lab-noc-soc-pipeline/groq.PNG)

Una vez que tengamos creada la API Key, creamos la credencial para Groq en n8n, buscamos Groq y pega la API key.

Configuramos un nodo "Basic LLM Chain" tras el Merge con un nodo "Groq Chat Model" apuntando manualmente el endpoint de Groq que es compatible con la API: https://api.groq.com/openai/v1 conectado al puerto "Model" de Basic LLM Chain.

![basic llm config](/assets/images/lab-noc-soc-pipeline/basic_llm_config.PNG)

Al configurar Groq, seleccionaremos el modelo groq/compound o groq/compound-mini pero para una tarea simple de clasificación/triage, son más potencia de la necesaria.

Realizaremos la prueba manual del Basic LLM Chain con groq/compound conectado así confirmamos si el JSON sale limpio o si hace falta activar ya el parseo tolerante desde el principio.

![output de prueba](/assets/images/lab-noc-soc-pipeline/output_de_prueba.PNG)

Con el JSON saliendo tan limpio, el nodo de Code (parseo) puede ser simple (aunque igualmente recomiendo dejar el match() tolerante como red de seguridad, por si algún día una alerta más compleja hace que el modelo se desvíe del formato). 

Configuración de node Code

```javascript
const responseText = $input.item.json.text;
const jsonMatch = responseText.match(/\{[\s\S]*\}/);
const triage = JSON.parse(jsonMatch[0]);

return {
  json: {
    ...$('Merge').item.json,
    ...triage
  }
};
```

**Nota:** `$('Merge')` tiene que coincidir con el nombre real del nodo merge.

Tras crear el nodo Code, realizamos otra prueba para comprobar que el output combina los campos:

![output code](/assets/images/lab-noc-soc-pipeline/output_code.PNG)

## Fase 4: Enrutamiento a Slack

Para enrutar los resultados que recibimos se creará la siguiente serie de nodos tras el nodo Code.

### Nodo Switch

En lugar del nodo switch, se puede usar también un nodo if dejándolo con una configuración mas simple, sin embargo para este lab se usara el nodo switch debido a que da más control sobre cómo tratar cada nivel de severidad. Así quedaría la configuración.


* Output 0 — Crítica
  Value 1: {{ $json.severidad_estimada }}
  Operation: is equal to
  Value 2: critica

* Output 1 — Alta
  Value 1: {{ $json.severidad_estimada }}
  Operation: is equal to
  Value 2: alta

* Output 2 — Media
  Value 1: {{ $json.severidad_estimada }}
  Operation: is equal to
  Value 2: media

* Output 3 — Baja
  Value 1: {{ $json.severidad_estimada }}
  Operation: is equal to
  Value 2: baja

Activamos la opción "Fallback Output" al final de la configuración del Switch, esta configuración capturará automáticamente ruido y cualquier valor inesperado que el modelo pudiera devolver, sin tener que definir una condición explícita para él.

![configuración switch](/assets/images/lab-noc-soc-pipeline/config_switch.PNG)

De este nodo switch, saldrán dos nodos merge, uno que combinara las alertas críticas/altas y otro nodo que combinara las alertas medias/bajas.

**Nota:** El uso de los nodos merge para combinar las salidas no es estrictamente necesario, se puede simplemente crear un nodo HTTP request para cada salida del nodo Switch.

Por ultimo, tras los nodos merge, creamos un nodo HTTP request que sera el nodo encargado de que las alertas lleguen a slack. la configuración de dicho nodo HTTP sera la siguiente;

* Method: POST
* URL: la URL de tu Incoming Webhook de Slack (https://hooks.slack.com/services/T.../B.../...)
* Authentication: None (la URL del webhook ya incluye la autenticación implícita)
* Send Body: activado
* Body Content Type: JSON
* Specify Body: Using JSON
* JSON:

```Json
{
  "text": "🚨 *[{{ $json.severidad_estimada.toUpperCase() }}]* {{ $json.origen }} / {{ $json.host }}\n*Alerta:* {{ $json.alerta_nombre }}\n*Resumen:* {{ $json.resumen }}\n*Acción recomendada:* {{ $json.accion_recomendada }}"
}
```
```json
{
  "text": "ℹ️ [{{ $json.severidad_estimada }}] {{ $json.host }}: {{ $json.resumen }}"
}
```

**Nota:** El primer json sera el usado en el nodo HTTP request de alertas criticas/altas, el segundo para el HTTP request para las alertas medias/bajas.

Realizamos una prueba y comprobamos (desde zabbix o desde grafana) si el pipeline funciona completamente de extremo a extremo y si el mensaje a llegado a slack tal y como debería.

![prueba http request](/assets/images/lab-noc-soc-pipeline/prueba_http.PNG)
![alerta slack](/assets/images/lab-noc-soc-pipeline/alerta_slack.PNG)

## Fase 5: Validación y hardening del pipeline

### Prueba 1: Fallo del proveedor IA

Si Groq falla, tarda demasiado, o devuelve un error ¿la alerta se pierde del todo, o llega igualmente a algún sitio?

Esta comprobación es fácil de realizar, para ello lo que hacemos será modificar la API Key para que falle y comprobar hasta donde llega la alerta y que tipo de error da. Tras realizar la modificación de la API Key, lanzamos una alerta de test para comprobar como reacciona el workflow.

![prueba 1](/assets/images/lab-noc-soc-pipeline/prueba_1.PNG)

Con una API key inválida, Basic LLM Chain falla con "Authorization failed" y el workflow entero se detiene ahí, la alerta no llega a Slack. Esto confirma que ahora mismo no hay ningún mecanismo de fallback, es decir, si Groq falla por cualquier motivo (credencial, rate limit, caída del servicio), la alerta se pierde sin más. Es una limitación real y vale la pena solucionarla antes de cerrar la fase.

Para solucionar esto, accedemos a la configuración de Basic LLM Chain y activamos la opción "on error/error handling" y cambiamos de Stop Workflow (valor por defecto) a Continue (using error output). Esto hace que el nodo, en vez de detener todo el workflow al fallar, genere una segunda salida (la de error) por la que sigue fluyendo el dato.

Es a esta segunda salida, donde conectaremos un nodo HTTP con la siguiente configuración:

* Method: POST
* URL: la misma que el webhook de slack
* Body (Json):

```json
{
  "text": "⚠️ *Alerta sin enriquecer (fallo del triage IA)*\nOrigen: {{ $json.origen }}\nHost: {{ $json.host }}\nAlerta: {{ $json.alerta_nombre }}\nSeveridad reportada: {{ $json.severidad }}\nEstado: {{ $json.estado }}\n\n_El análisis automático no estuvo disponible — revisar manualmente._"
}
```

De esta forma, aunque Groq de error la alerta seguirá su curso hasta llegar a slack y no se perderá, pero llegara sin enriquecer (si el triage/clasificación realizados)

### Prueba 2: Alertas repetidas

Zabbix reenvía alertas si el estado del trigger fluctúa. ¿El pipeline manda un mensaje a Slack cada vez, generando ruido, o hay algún tipo de deduplicación?

Para realizar la comprobación lanzamos dos alertas consecutivas, bien desde zabbix o desde grafana para comprobar la reacción.

![duplicación 1 ](/assets/images/lab-noc-soc-pipeline/duplicacion_1.PNG)
![duplicación 2](/assets/images/lab-noc-soc-pipeline/duplicacion_2.PNG)

### Prueba 3: Limites del tier gratuito de Groq

Según la documentación de Groq, dependiendo del modelo y la version puede tener limites distintos, pero eso no es necesariamente negativo. En el caso de este lab se ha usado el modelo groq/compound cuyo limite de envío de alertas es de 30/min o 250/dia por lo que para un lab de este tipo es mas que suficiente. De todas formas como se usa n8n, n8n puede agrupar varias alertas relacionadas en una única petición. Por ejemplo, si tienes 15 eventos de CPU/RAM en un minuto, en lugar de hacer una alerta distinta para cada alerta, las engloba todas en una única alerta.

## Conclusión

Con esto queda cerrado el pipeline de triage de alertas: Zabbix y Grafana disparan sus webhooks hacia n8n, que normaliza ambos formatos, pasa el contexto a un LLM para una primera evaluación, y enruta el resultado a Slack según la severidad estimada con un tono distinto para lo urgente frente a lo informativo, y sin generar ruido para lo que el propio modelo identifica como irrelevante.

El camino hasta llegar a Groq como proveedor final fue el tramo más interesante de construir: la API de Claude quedó descartada por el requisito de crédito de pago, y Ollama, la opción que mejor encajaba con la filosofía self-hosted del resto del lab resultó inviable por las limitaciones reales de hardware (8GB de RAM física, con WSL2 topado a 4GB para no penalizar al host). Groq terminó siendo la solución práctica: sin coste, sin consumo de RAM local, y con una calidad de respuesta que sorprendió para tratarse de un modelo servido gratis.

Como en el post anterior, el pipeline no se dio por bueno solo porque funcionara una vez. Se sometió a las mismas pruebas de fondo: qué pasa si el proveedor de IA falla (sin fallback, la alerta se perdía por completo corregido añadiendo una rama de error que manda la alerta sin enriquecer en vez de descartarla), y qué pasa con alertas duplicadas o repetidas en poco tiempo.

Una limitación que merece quedar por escrito, en la misma línea que el SSO parcial del post anterior: este triage no sustituye la validación humana en alertas críticas, solo la acelera. Y el tier gratuito de Groq tiene límites de tokens por minuto reales,nada que preocupe en un lab pero sí algo a tener en cuenta antes de llevar este patrón a un volumen de alertas de producción.