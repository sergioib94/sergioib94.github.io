---
title: "AZ-104 Módulo 1: Azure Cloud Shell y plantillas ARM"
date: 2026-04-30T18:51:00+02:00
categories: [Azure, az-104, Apuntes]
description: "Apuntes del primer módulo del AZ-104: qué es Azure Cloud Shell, cómo usarlo y cómo desplegar infraestructura en Azure con plantillas ARM de JSON."
---

Estos son mis apuntes del primer módulo del camino hacia la certificación AZ-104. Cubre dos herramientas fundamentales: **Azure Cloud Shell** para administrar recursos desde el navegador, y las **plantillas ARM** para desplegar infraestructura como código.

---

## Parte 1 — Azure Cloud Shell

### ¿Qué es?

Un terminal en la nube accesible desde cualquier navegador. Sin instalar nada, sin configurar nada. Te autenticas en Azure y ya tienes disponibles tanto **Bash** como **PowerShell**, siempre actualizados, con cifrado en reposo activado por defecto.

### ¿Cómo acceder?

- Enlace directo: [https://shell.azure.com](https://shell.azure.com)
- Desde el icono de terminal en el **Portal de Azure**
- Desde los fragmentos de código de **Microsoft Learn**

### Lo que debes saber antes de usarlo

> ⚠️ La sesión se cierra automáticamente tras **20 minutos de inactividad** y pierdes el estado. Los ficheros guardados en CloudDrive sí se conservan.

**CloudDrive** es el almacenamiento persistente de Cloud Shell. Puedes subir scripts, claves SSH o cualquier fichero y acceder a ellos desde cualquier dispositivo en sesiones futuras. También puedes montar un **Azure Files Share** para trabajar con ficheros de una región concreta.

Para editar ficheros directamente en el terminal, Cloud Shell incluye un editor integrado:

```bash
code nombre_del_fichero.sh
```

### ¿Cuándo usarlo y cuándo no?

| ✅ Úsalo para... | ❌ Evítalo si... |
|---|---|
| Administrar Azure desde cualquier dispositivo | Tienes scripts que tardan más de 20 minutos |
| No quieres instalar herramientas en el equipo | Necesitas permisos `sudo` |
| Conservar scripts entre sesiones | Necesitas instalar herramientas no soportadas |
| Editar ficheros con el editor integrado | Necesitas varias sesiones abiertas a la vez |

---

Ahora que tenemos claro cómo acceder y operar con recursos desde el terminal, en la siguiente sección veremos cómo automatizar la creación de infraestructura en Azure mediante plantillas ARM de JSON.

---

## Parte 2 — Plantillas ARM de JSON

### ¿Qué problema resuelven?

Imagina que tienes que desplegar la misma infraestructura en cinco entornos diferentes (desarrollo, pruebas, producción...). Hacerlo a mano desde el portal cada vez es lento, propenso a errores y difícil de auditar.

Las plantillas ARM son la solución: describes en un fichero JSON **qué quieres** desplegar y Azure se encarga de crearlo siempre igual, en el orden correcto y de forma repetible.

Esto es lo que se conoce como **Infraestructura como Código (IaC)**:
- Tu infraestructura vive en un repositorio junto al código
- Puedes versionar los cambios
- Las implementaciones son consistentes y trazables

### ¿Qué es una plantilla ARM exactamente?

Un fichero `.json` que le dice a Azure Resource Manager *qué recursos crear* y *con qué configuración*. Usa **sintaxis declarativa**: describes el resultado final, no los pasos para llegar a él.

Una plantilla ARM tiene siempre esta estructura:

```json
{
  "$schema": "...",        // Obligatorio. Versión del esquema JSON
  "contentVersion": "...", // Obligatorio. Tu versión de la plantilla (ej: 1.0.0.0)
  "apiProfile": "...",     // Opcional. Versiones de API globales para los recursos
  "parameters": {},        // Opcional. Valores que se pasan al desplegar
  "variables": {},         // Opcional. Valores reutilizables dentro de la plantilla
  "functions": [],         // Opcional. Funciones personalizadas
  "resources": [],         // Obligatorio. Los recursos que quieres crear
  "outputs": {}            // Opcional. Valores que devuelve la plantilla al terminar
}
```

### Ventajas clave

- **Idempotente**: puedes ejecutar la misma plantilla varias veces. Si no cambió nada, Azure no toca nada.
- **Validación previa**: Azure comprueba la plantilla antes de empezar, evitando errores a mitad de despliegue.
- **Paralelismo**: los recursos independientes se crean en paralelo, lo que acelera los despliegues.
- **Integración CI/CD**: funciona directamente con GitHub Actions o Azure Pipelines.

---

### Cómo añadir un recurso

Para añadir un recurso necesitas saber su **tipo**, que siempre sigue el formato `{proveedor}/{tipo}`. Por ejemplo, una cuenta de almacenamiento es `Microsoft.Storage/storageAccounts`.

```json
"resources": [
  {
    "type": "Microsoft.Storage/storageAccounts",
    "apiVersion": "2025-01-01",
    "name": "miCuentaDeStorage",
    "location": "[resourceGroup().location]",
    "kind": "StorageV2",
    "sku": {
      "name": "Standard_LRS"
    },
    "properties": {
      "supportsHttpsTrafficOnly": true
    }
  }
]
```

> 💡 `"[resourceGroup().location]"` es una función ARM que toma automáticamente la región del grupo de recursos. Así no tienes que escribirla a mano.

---

### Cómo desplegar una plantilla

Primero inicia sesión y crea un grupo de recursos:

```powershell
# PowerShell
Connect-AzAccount
New-AzResourceGroup -Name miGrupo -Location "westeurope"
```

```bash
# CLI de Azure
az login
az group create --name miGrupo --location "westeurope"
```

Luego despliega la plantilla:

```powershell
# PowerShell
$templateFile = "azuredeploy.json"
New-AzResourceGroupDeployment `
  -Name miDespliegue `
  -ResourceGroupName miGrupo `
  -TemplateFile $templateFile
```

```bash
# CLI de Azure
az deployment group create \
  --name miDespliegue \
  --resource-group miGrupo \
  --template-file azuredeploy.json
```

Puedes revisar el resultado en el Portal de Azure → tu grupo de recursos → **Implementaciones**.

---

### Parámetros: evitar valores hardcodeados

Tener el nombre de un recurso o su SKU escritos directamente en la plantilla es un problema: no puedes reutilizarla para entornos distintos sin editarla cada vez.

Los **parámetros** resuelven esto. Se definen en la sección `parameters` y se pasan en el momento del despliegue:

```json
"parameters": {
  "storageName": {
    "type": "string",
    "minLength": 3,
    "maxLength": 24,
    "metadata": {
      "description": "Nombre único global para la cuenta de storage"
    }
  },
  "storageSKU": {
    "type": "string",
    "defaultValue": "Standard_LRS",
    "allowedValues": [
      "Standard_LRS",
      "Standard_GRS",
      "Standard_ZRS",
      "Premium_LRS"
    ]
  }
}
```

Para usarlos dentro del recurso, la sintaxis es `[parameters('nombreDelParametro')]`:

```json
"name": "[parameters('storageName')]",
"sku": {
  "name": "[parameters('storageSKU')]"
}
```

Y al desplegar, pasas los valores por línea de comandos:

```powershell
New-AzResourceGroupDeployment `
  -Name miDespliegue `
  -TemplateFile $templateFile `
  -storageName "minombreúnico123" `
  -storageSKU "Standard_GRS"
```

> 🔒 **Seguridad**: nunca escribas contraseñas o secretos como valores por defecto en la plantilla. Usa siempre el tipo `secureString` para este tipo de parámetros.

---

### Salidas: obtener información tras el despliegue

La sección `outputs` te permite recuperar datos del recurso una vez desplegado, como por ejemplo los endpoints de una cuenta de storage:

```json
"outputs": {
  "storageEndpoint": {
    "type": "object",
    "value": "[reference(parameters('storageName')).primaryEndpoints]"
  }
}
```

El resultado aparece tanto en la terminal al finalizar el despliegue como en el Portal de Azure bajo la pestaña **Salidas** de la implementación.

---

### Plantilla final del ejercicio

Esta es la plantilla completa con todo lo visto: recurso, parámetros y salida.

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "storageName": {
      "type": "string",
      "minLength": 3,
      "maxLength": 24,
      "metadata": {
        "description": "Nombre único global para la cuenta de storage"
      }
    },
    "storageSKU": {
      "type": "string",
      "defaultValue": "Standard_LRS",
      "allowedValues": [
        "Standard_LRS",
        "Standard_GRS",
        "Standard_RAGRS",
        "Standard_ZRS",
        "Premium_LRS",
        "Premium_ZRS",
        "Standard_GZRS",
        "Standard_RAGZRS"
      ]
    }
  },
  "functions": [],
  "variables": {},
  "resources": [
    {
      "type": "Microsoft.Storage/storageAccounts",
      "apiVersion": "2025-01-01",
      "name": "[parameters('storageName')]",
      "tags": {
        "displayName": "[parameters('storageName')]"
      },
      "location": "[resourceGroup().location]",
      "kind": "StorageV2",
      "sku": {
        "name": "[parameters('storageSKU')]"
      }
    }
  ],
  "outputs": {
    "storageEndpoint": {
      "type": "object",
      "value": "[reference(parameters('storageName')).primaryEndpoints]"
    }
  }
}
```

---

## Resumen del módulo

| Concepto | Clave |
|---|---|
| Cloud Shell | Terminal en el navegador, sin instalaciones, sesión caduca a los 20 min |
| CloudDrive | Almacenamiento persistente entre sesiones |
| Plantilla ARM | JSON declarativo que describe la infraestructura a desplegar |
| Idempotencia | Puedes re-ejecutar la misma plantilla sin efectos no deseados |
| Parámetros | Hacen la plantilla reutilizable entre entornos |
| `allowedValues` | Restringe los valores válidos para un parámetro |
| Salidas | Devuelven información del recurso tras el despliegue |

