---
title: "Introducción a PLSQL (Oracle)"
date: 2021-09-13T12:36:20+02:00
categories: [Base de Datos, Apuntes]
excerpt: "En este post se comentarán aspectos basicos a tener en cuenta de PLSQL para trabajar con ello en oracle."
---

### **Introducción de PLSQ** ###

* **¿Que es?**

PL/SQL (Procedural Language/Structured Query Language) es un lenguaje de programación procedimental desarrollado por Oracle como una extensión de SQL. Permite combinar las capacidades de consulta de datos de SQL con estructuras de programación avanzadas como variables, bucles, condiciones, procedimientos, funciones y cursores.

* **¿Para que sirve?**

PL/SQL se utiliza principalmente en bases de datos Oracle para escribir bloques de código que pueden ser ejecutados directamente dentro del servidor de la base de datos. Sus aplicaciones incluyen:

1. Automatización de procesos dentro de la base de datos: Permite crear procedimientos almacenados y funciones para realizar cálculos o validaciones sin depender de una aplicación externa.

2. Manejo eficiente de transacciones: PL/SQL permite ejecutar múltiples sentencias SQL en un solo bloque, asegurando que todas se ejecuten correctamente o ninguna en caso de error.

3. Optimización del rendimiento: Como el código se ejecuta directamente en la base de datos, se minimiza el tráfico de red entre la aplicación y el servidor, lo que mejora el rendimiento.

4. Seguridad y control de acceso: Se pueden definir procedimientos con privilegios específicos para restringir el acceso a datos sensibles sin exponer directamente las tablas.

5. Automatización de eventos con triggers: Los triggers en PL/SQL permiten ejecutar código automáticamente cuando ocurre un evento en la base de datos, como insertar o eliminar registros.

6. Integración con aplicaciones empresariales: PL/SQL es ampliamente utilizado en sistemas de gestión empresarial (ERP, CRM, etc.) que requieren lógica de negocio dentro de la base de datos.

* **Características**

    * Es una extensión de SQL con características de lenguaje de programación.
      
    * Se ejecuta en el lado del servidor y los procedimientos y funciones se almacenan en la BD.
      
    * Las sentencias SQL de consulta y manipulación de datos pueden ser incluidas en unidades procedurales de código, pero no pueden usarse instrucciones DDL ni DCL.

    * No tiene instrucciones de entrada por teclado o salida por pantalla. Truco para mostrar por pantalla -> Usando la instrucción para depurar programas.
      
    * Incluye los tipos de datos y operadores de SQL.
      
    * Los programas se pueden compilar desde SQL*Plus (comando /) o usar SQL Developer u otros IDEs.
      
    * Los comentarios comienzan por "--" o se colocan entre "/*" y "*/".
      
    * Trae unas librerías con funciones predefinidas, se llaman paquetes.
      
    * Para ejecutar los procedimientos almacenados desde SQL*Plus se usa el comando exec.
      
    * Es solo es propietario de Oracle, en mariadb(SQL/PSM) y Postgres(PG/SQL). Mariadb no es necesario aprenderlo.

### **Estructura de un bloque** ###

Tienen 3 partes:

* **Declare (opcional)** → cuando se declaran cosas: variables, cursores (guardar resultado de una select), excepciones (posibles errores a lo largo del programa) definidas por el usuario.

~~~
	v_usuario 	VARCHAR2(10); 
	v_fecha 	DATE;
~~~

* **Begin (obligatorio)** → sentencias SQL sentencias de control PL/SQL (while, for, case, if...).

~~~
	SELECT user_id, fecha 
	INTO v_usuario, v_fecha 
	FROM tabla;
~~~

* **Exception (opcional)** → acciones a realizar cuando se producen errores.

~~~
	WHEN nombre_excepcion then
~~~

* **End; (obligatorio)** → para cerrar el programa una vez hecho.

### **Tipos de bloques de código** ###

* **Bloques anónimos:** No se almacenan en la BD. Se ejecutan tras escribirlos (para hacer pruebas).
      
* **Procedimientos:** Se almacenan en la BD y son invocados. Pueden recibir y devolver múltiples parámetros.
      
* **Funciones:** Se almacenan en el BD y son invocados. Pueden recibir parámetros y devuelven un valor “en su nombre”. Solo devuelven un parámetro.
      
* **Triggers:** Se almacenan en la BD y se ejecutan automáticamente cuando ocurre algún evento.

### **Operaciones básicas** ###

* **Declaración de variables (nombre tipo)**

Oracle recomienda que el nombre de las variables empiece por v y el de los procedimientos por para distinguir estos procesos de algunos nombres como de tablas por ejemplo.

Además de variables, pueden declararse constantes. Las constantes pueden ser útiles por ejemplo en un programa que calcule áreas geométricas y tenga que utilizar un valor constante como puede ser el valor de pi, en lugar de repetir varias veces el valor de pi se declara como constante para poder usarse varias veces dicha constante para asi mejorar la legibilidad del código.

A la hora de definir una variable podemos usar dos atributos: %type y %rowtype:

* Type sirve para declarar una variable basándonos en otras declaradas previamente o en una columna de la base de datos, es decir, declárame esta variable como esta otra que ya existe. 

Por lo que antes de %type se puede poner tanto un nombre de tabla como un nombre de columna de una base de datos o el nombre de una variable definida previamente de forma que se copiara para la nueva variable el nuevo dato del dato anterior.

* Rowtype para tipos de datos compuestos, un tipo de dato compuesto es cuando necesitas guardar varios datos en una variable, es decir, a esto se le llama una variable registro o compuesta, es una variable que esta divididas en distintas casillas con las distintas informaciones.

**Asignación de valores a variables → variable := expresión**

Ejemplos:

~~~
v_fecha := ‘31-oct-2003’
v_apellido := ‘lopez’
~~~

Se puede asignar un valor desde una consulta de la siguiente forma:

~~~
select sal * 0.10 into v_comision
from emp
where empno =7082;
~~~

De esta forma estaremos guardando el 10% del salario en la variable comisión del empleado 7082. Hay que hacerlo con cuidado porque si devuelve varios valores no se podra guardar en una unica variable number, para ello usaremos los cursores, si devuelve solo uno si se podra guardar en la variable.

* **Mostrar por pantalla una variable**

Para ello usamos el paquete dbms_output, nosotros usaremos la función put_line (solo puede recibir un parámetro). Este método se creo para poder depurar el código, pero lo usaremos para mostrar por pantalla. Ejemplo de uso:

~~~
begin
dbms_output.put_line (‘Mi 1º bloque pl/sql diseñado por ’ || user || ‘el dia ’ || sysdate ||);
end;
~~~

Como put_line solo muestra una cosa, en el caso de tener que mostrar más de una deberemos usar el  operador de concatenación(||) como en el ejemplo de arriba.

* **Recuperar datos de una BD con select**

~~~
select lista columnas
into {v_nombre[…]… | nombre_registro}
from nombre_tabla
where condicion
~~~

* **Inserción de datos**

Por ejemplo: añadir información sobre un nuevo empleado en la tabla emp.

~~~
Begin

insert into emp(empno, ename, job, deptno)
values(empno_sequence.nextval, ‘HARDING’,’CLERK’,10):

end;
~~~

* **Actualizar datos**

Por ejemplo: aumenta el salario de todos los empleados de la tabla emp que son analistas.

~~~
Declare
	v_incre_sal	emp.sal%type := 2000;
Begin
	update emp
	set sal = sal + v_incre_sal
	where job = ‘ANALYST’;
End;
~~~

* **Borrar datos**

Por ejemplo: suprimir los empleados que trabajan en el dpto 10.

~~~
Declare
	v_deptno	dept.deptno%type;
Begin
	delete from emp
	where deptno = v_deptno;
End;
~~~

### **Estructuras de control** ###

* **Sentencia if**

Sintaxis:

~~~
if condicion then
	instrucciones;
[elsif condicion then
	instrucciones];
[else
	instrucciones];
end if;
~~~

Se pueden tener if anidados como en python.

* **Sentencia case**

Sintaxis

~~~
case [expresion]
when [condicion|valor] then
	instrucciones;
when [condicion|valor] then
	instrucciones;
….
else
	instrucciones que se ejecuta si no se simple ninguna condición anterior
end case;
~~~

También es posible usar case con una variable como ejemplo de un menú. Por ejemplo:

~~~
case tipo
when 1 then
	procesar_pedido_local;
when 2 then
	procesar_pedido_domicilio;
when 3 then
	procesar_pedido_extranjero
else
	procesar_pedido_normal;
end case;
~~~

* **Sentencia for**

Se usa cuando se sabe las vueltas que dara el bucle. Si no se sabe el numero de vueltas, se usara while.

Sintaxis

~~~
for indice in [reverse] valor_inicial...valor_final loop
	instruciones;
….
end loop;
~~~

El índice se declara de manera implícita, en el momento que se sale del bucle for la variable índice ya no existe.

En mitad del bucle no se debe cambiar el valor de indice.

Ejemplo: inserta las 10 primeras filas del pedido 601.

~~~
Declare
v_id	prueba.id%type := 601;
Begin
….
for i in 1 .. 10 loop
	insert into prueba(id, contador)
	values (v_id, i);
end loop;
…
end;
~~~

* **Sentencia while**

~~~
while condicion loop
	instrucciones;
…
end loop;
~~~

### **Funciones y Procedimientos** ###

* Para ver errores de compilacion → show err

* Para ejecutar programa → exec nombre del programa (parametros)

* Para mostrar por pantalla → set serveroutput on (solo sirve hasta que se cierre la sesion)

* Para crear un procedimiento siempre utilizamos create or replace para empezar, si no existe lo crea y si ya existe lo reemplaza por el nuevo valor.

Si el trozo de codigo debe devolver una sola cosa, se usa una funcion, si no tiene porque devolver nada, se usara un procedimiento.

Ejemplo: procedimiento que muestre el nombre del empleado 7082

~~~
create or replace procedure MostrarNom7082
is
	v_nombre	emp.ename%type;
begin
	select ename input v_nombre
	from emp
	where emptno = 7082
	dbms_output.put_line(v_nombre)
end MostrarNom7082;
~~~

**¿Cuando usar funciones o procedimientos?**

| **Tipo**         | **Descripción**                                         | **Devuelve un valor?** | **Ejemplo de uso**               |
|-----------------|-----------------------------------------------------|-------------------|--------------------------------|
| **Procedimiento** | Bloque de código que ejecuta una acción específica. |  No            | `EXEC InsertarEmpleado(123, 'Juan')` |
| **Función**      | Bloque de código que devuelve un valor.              |  Sí            | `SELECT ObtenerSalario(123) FROM dual;` |


* **Programación modular**

La programación modular es dividir un programa grande, en varios trozos más pequeños de forma cada trozo resuelva una parte del problema (cada trozo preferiblemente debe ser de 12 lineas) de forma que se vea fácilmente el funcionamiento del programa.

La programación modular usa parámetros, los parámetros pueden ser de entrada o salida. De entrada, a un código llega un parámetro de entrada 

* bloques anónimos
* procedimientos
* funciones
* triggers

### **Cursores** ###

PL/SQL utiliza cursores para gestionar las instrucciones select. Un cursor es un conjunto de registros devueltos por una instrucción select. Hay dos tipos de cursores, los cursores implícitos y los explícitos.

* **Cursores implícitos** → se utiliza para operaciones select into. Se usa cuando la consulta devuelve un único registro.
      
* **Cursores explícitos** → se utilizan cuando la consulta devuelve un conjunto de registros, aunque también pueden ser usados para consultas que devuelven un único registro ya que de esta forma forma la consulta es más rápida.

Los cursores explícitos se declaran como cualquier otra variable de pl/sql, sin embargo los cursores implícitos no son necesario declararlos. Ej:

~~~
declare
 	cursor c_paises is
 	SELECT CO_PAIS, DESCRIPCION
 	FROM PAISES;
begin
	/* Sentencias del bloque ...*/
end;
~~~