---
title: "Introducción a las Bases De Datos (Oracle)"
date: 2021-09-07T11:33:23+02:00
categories: [Base de Datos, Apuntes]
excerpt: "En este post se comentarán y explicarán de la forma mas clara posible los conceptos basicos para poder trabajar con BBDD Oracle."
card_image: /assets/images/cards/oracle-bg.png
---

### **Introducción ###

Las bases de datos son una parte fundamental en el almacenamiento y gestión de información en el mundo digital. Oracle Database es uno de los sistemas de gestión de bases de datos más utilizados en entornos empresariales debido a su potencia, escalabilidad y seguridad.

Este post proporciona una introducción clara y estructurada a los conceptos básicos necesarios para trabajar con bases de datos en Oracle. Aprenderás sobre los tipos de sentencias SQL (DDL, DML, DCL), los modelos de bases de datos, los roles y permisos, los tipos de datos, las funciones más comunes y cómo administrar tablas y restricciones.

Si estás comenzando con Oracle o quieres repasar los fundamentos, esta guía te ayudará a comprender cómo interactuar con la base de datos y ejecutar consultas eficientes.

### **Tipos de sentencias en oracle** ###

* DDL → Nos permitirá crear,modificar o eliminar los objetos de la base de datos. Las instrucciones serian Create, Alter (modificar), Drop (eliminar objetos).

* DML → Permite manipular los datos. Esto se hace con las siguientes instrucciones: Insert, Update, Delete (elimina datos) y Select.

* DCL → Tiene las siguientes instrucciones: Commit (guardar), Rollback (deshacer hasta el ultimo commit), grant (para dar permisos a un usuario) y revoke (quitar permisos a un usuario).

SQL es un lenguaje navegacional, no hay que decirle los pasos a dar, sino decirle el objetivo final y sql da los pasos hasta el final.

### **Modelo ansi/sparc** ###

* Nivel físico de la base de datos (administradores)→ discos donde nosotros guardamos la información de la base de datos.

* Nivel conceptual (programadores)→ la base de datos es un conjunto de tablas, no debería importar como estén repartidas las tablas en los distintos discos.

* Nivel Externo → tenemos distintos usuarios, cada usuario tiene una lista de la base de datos, por lo que un usuario solo vera las tablas que necesita.

Esquema de usuario es el conjunto de objetos que tiene un usuario.

Diccionario de datos es la base de datos con información de mi base de datos (usuarios que hay, que tablas hay, su contenido…).

### **Tipos de Roles** ###

* Rol connect → te permite conectarte a una base de datos, crear tablas...empezar a trabajar.
* Rol Resource → te permite crear funciones, procedimientos, etc.
* Rol DBA → te permite asignar a un usuario permisos de administrados (no sera necesario con sys y system).

### **Tipos de datos en Oracle** ###

* varchar2 (tamaño) → cadenas de longitud variable.
* Char (tamaño) → cadena de longitud fija.
* Number (precision, escala) → precision(numero entero), escala(los decimales que tendra). Ej:number(4,1): maximo numero 999,9.
* long → cadenas con logitud variable
* date → fechas y horas.
* RAW(tamaño) → cadenas de bytes (para imagenes por ejemplo).
* long raw → graficos,sonidos.
* rowid → cadena hexadecimal, direccion de fila en tabla.
* Clob, nclob, blob → objetos binarios de mas de 2 Gb.

### **Operadores de Oracle** ###

* Aritméticos → + - * /
* Comparación → = > < >= <= <> !=
* Logicos → AND, OR, NOT.
* Comparación de cadenas con comodines→ like (% → sustituye cualquier cadena y _ sustituye los caracteres individuales).

* REGEXP_LIKE (nombre,’ expresión regular’) → compara el primer parámetro con la 	expresión regular, si esta bien devolverá un True. Es mas lento que like.

* La pertenencia a un conjunto → in. Ej: nombre in (‘pepe’,’juan’,’ana’) si nombre pertenece a pepe,juan o ana devolvera un True. Se puede usar con NOT.
      
* La pertenencia a un rango → between(con los extremos incluidos). Ej: edad between 16 and 65.

### **Funciones en Oracle** ###

Trozo de código que ha hecho alguien y que puede usarse,debes saber su nombre, que se va a mandar y que se va a devolver. A los valores de una funcion se les llama parametros, y devuelven un resultado.

* **Aritmeticas:**

    * abs → devuelve el valor absoluto.
    * Ceil → redondea hacia arriba.
    * Floor → redondea hacia abajo.
    * Mod → resto de la division entera.
    * Nvl(valor,expresion) → sustituye valor nulo por otro valor. Por ejemplo para sustituir una columna vacia por 0. se usa solo con numeros enteros (en multiplicaciones se sustituye por 1).
    * power → calcula la potencia de un numero.
    * Round → redondea numeros con los decimales que se le indiquen. Ej round(76’345,2) → 76’34. se puede usar con numeros negativos. Ej: round(17698’43,-2) → 176’9843.
    * sign → indica el signo del valor (1 si es positivo, -1 si en negatvo).
    * Sqtr → devuelve la raiz cuadrada.
    * trunc → trunca los numeros. 
    * Variance → devuelve varianza de un conjunto de valores.

    Para probar expresiones → select abs (-15) from dual (tabla por defecto para probar expresiones y funciones); .

    * AVG → calcula la media ignorando los nulos.
    * Max → devuelve el maximo.
    * Min → devuelve el minimo.
    * Sum → obtiene la suma de los valores.
    * Count → cuenta las filas de una tabla. O bien los valores no nulos de una tabla.

* Alter user scott account unlock → desbloquea un usuario oracle.
* Alter user scott identified by tiger → cambiar contraseña de usuarios.

* **Funciones de cadenas**

    * chr(n) → devuelve el carácter ascii de un numero.
    * Concat (cad1,cad2) → concatena 2 cadenas. Hay un operador que concatena las cadenas (||),se suele usar el operador.
    * Lower (cad) → devuelve la cadena en minúsculas.
    * Upper (cad) → devuelve la cadena en mayúscula.
    * Initcap → convierte cadena en titulo(iniciales de las palabras en mayusculas).
    * Lpad → añade caracteres a la izquierda de la cadena hasta cierta longitud.
    * Rpad → añade caracteres a la derecha de la cadena hasta cierta longitud.
	Se suelen usar en listados, para que quede bien.
    * Ltrim → suprime un conjunto de elementos a la izquierda.
    * Rtrim → suprime un conjunto de elementos a la derecha.
    * Replace → sustituye un carácter o caracteres con 0 o mas caracteres.
    * Substr → obtiene parte de una cadena.
    * Ascii → se le manda un ascii y se devuelve el carácter.
    * Instr → permite ver en que posición esta una subcadena en una cadena.
    * Length → devuelve el numero de caracteres de la cadena.

Ejemplo convertir ‘Ruiz Padilla, Raul’ → ‘Raul Ruiz Padilla’ (se pueden usar concat, substr, instr)

~~~
select instr(‘Ruiz Padilla, Raul’,’,’) from dual; → cojemos la coma
substr (‘Ruiz Padilla, Raul’,instr(‘Ruiz Padilla, Raul’,’,’) + 2) → extraemos el nombre
substr (‘Ruiz Padilla, Raul’, 1, instr(‘Ruiz Padilla, Raul’,’,’) - 1) → extraemos los apellidos

select substr (‘Ruiz Padilla, Raul’,instr(‘Ruiz Padilla, Raul’,’,’) + 2), ‘  ‘ || substr (‘Ruiz Padilla, Raul’, 1, instr(‘Ruiz Padilla, Raul’,’,’) - 1) from dual;
~~~

* **Funciones de fechas**

    + Sysdate → devuelve la fecha del sistema
    * Add_months → devuelve la fecha incrementada en n meses.
    * months between → meses que hay entre dos fechas. Tambien se puede hacer con la funcion interval.
    * Last day → devuelve ultimo dia del mes de la fecha introducida.
    * Next day → devuelve el primer dia de la semana indicando por una fecha.

    Se pueden hacer operaciones aritmeticas logicas (sumar y restar dias) con las fechas.

* **Funciones de conversión**

    * to_char → transforma una fecha o number en una cadena
    * to_date → transforma un number o char en date
    * to_number → transforma la cadena de caracteres en number

* **Función sobrecargada** → una funcion que puede recibir parámetros diferentes y dependiendo de los tipos de parámetros, la función funcionan de forma distinta.

    * Hiredate → fecha de contratacion.
    * Mon → mes abreviado(diciembre → dic)
    * ddd → dia (4 diciembre → dia 338)
    * horas → HH
    * minutos → MI
    * segundos → SS

    * nls date format → variable de entorno que muestra la fecha por defecto
    * alter session set nls date format → cambiar configuracion de esa sesion una variable de entorno por defecto.

### **Tablas** ###

* Mostrar tablas de un usuario → select * from cat;
* Mostrar columnas de las tablas → desc “nombre de la tabla”

Los tipos number se usan en dos casos: si usamos operaciones aritmeticas o si es importante que se ordenen los numeros de forma alfabetica es decir (10,11,8,9,…)

* Crear tabla → create table “nombre de la tabla”

~~~
(
columna	tipo(),
);
~~~

* Eliminar tabla → drop table “nombre de la tabla”

* user_tables → sinónimo de cat (para saber que tablas tiene un usuario)
* all_tables → todas las tablas en las que tiene permiso un usuario
* dba_tables(admin) → ves todas las tablas, de quienes son, etc.

Integridad de datos → que los datos tengan valores lógicos.
Integridad referencial → impide que en una tabla se introduzca un valor que no tenga su correspondencia en la tabla.

A las restricciones hay que darles un nombre, no pueden existir dos restricciones con el mismo nombre.

### **Restricciones** ###

* Clave primaria (a nivel de tabla) → constraint “nombre de la restricción” primary key(“columna”)
      
* Claves primarias compuestas:
    ◦ No pueden definirse a nivel de columna, pero sí a nivel de tabla..
    ◦ Constraint “nombre de la restriccion” Primary Key (clave1,clave2)
          
* Claves ajenas → se pueden poner tantas como sea necesario siempre que existan en la otra tabla.
    ◦ Nivel de columna → constraint “nombre de la restricción” references (tabla)

* Añadir una clave primaria que se haya olvidado meter

* alter table (tabla)
* add constraint “nombre de restriccion” primary key (clave/tabla)
      
    ◦ Nivel de tabla → constraint “nombre de restriccion”	foreign key (clave) references (tabla)
          
    En el caso de claves compuestas es recomendable poner el nombre de los campos de la tabla despues de poner el nombre.
          
* On delete cascade → cada vez que se borre una clave, borra los atributos para asegurarse no tener datos sueltos, ej: si borro un alumno, se borraran todas las notas del alumno.
      
* **Obligatoriedad** → la columna no puede estar en blanco.
    
    * A nivel de columna → Constraint “nombre de restriccion” not null
    * A nivel de tabla → Constraint “nombre de restriccion” check(nombre is not null)
    * check → comprueba que se cumple una restriccion obligaroria siempre. Ej:
          
        El precio debe estar entre 10 y 1200 → constraint “nombre” check(precio between 10 and 1200)
          
        El código de un producto debe tener 6 caracteres → constraint “nombre” check(length(codigo)=6)
          
        El tipo de producto debe ser micro,memoria o disco → constraint “nombre” check(tipo in (‘micro’,’memoria’,’disco’)
          
        El codigo de producto debe tener dos letras y cuatro números → constraint “nombre” check(regexp_like(codigo,’^[A-Za-z]{2}[0-9]{4}$’))
          
        El nombre esta en mayuscula → constraint “nombre” check(nombre=upper(nombre))
          
        Primera letra del nombre en mayuscula → constraint “nombre” check(substr(nombre,1,1) between ‘A’ and ‘Z’
          
        Productos se hacen en 2019 → constraint “nombre” check(to_char(fechacreacion, ‘YYYY’)=’2019’)
          
        Productos se crean en primavera→constraint “nombre” check(to_char(fechacreacion,’MM/DD’) between ‘04/21’ and ‘06/20’) 
          
    * Triger → programa que va comprobando si se van dando varias restricciones, se usa cuando se quieren validar restricciones complejas que dependen unas condiciones de otras. El check solo valida restricciones simples.
          
    * Meter datos en una tabla → insert into “nombre de tabla”
				                 values(filas)
~~~
	insert into “nombre de tabla” (campos)
	values(filas)
~~~

	* Los campos que no esten especificados se quedan en blanco.

    * default → pone un valor por defecto, no llevan nombre. incompatible con not null. (No puede ponerse a nivel de tabla, sino a nivel de columna)
    
    * Unicidad 
        ◦ Unique→ columna que se sabe que no se deba repetir (una clave candidata), ej: telefono.

### **Consultas al diccionario de datos** ###

Oracle almacena la información de las restricciones en el diccionario de datos. En ocasiones se necesitara saber de que va una restriccion por lo que se hacen consultas al diccionario de datos.

* Para ver la información de una tabla → select * from “nombre de la tabla”;
* Para saber todas las restricciones → select * from users_constraints;
* Para saber restricciones de una tabla concreta → select * from users_constraints where table_name=”nombre de la tabla”;

constraint_name, constraint_type(c → check, p → primary key, r → foreing key, u → unique), search condition → para que muestre el nombre,tipo y condicion de la restriccion.

    * Users_constraints → restricciones que el usuario a creado
    * All constraints → todas las restricciones que existen para un usuario(tus tablas y las que tienes permisos)

    * Dba_constraints → todas las restricciones de todos las tablas

### **Alter table** ###

* ALTER TABLE nombre_tabla

**ADD (columna)** → añade columnas en una tabla. 
    * Si la tabla esta rellena no se puede añadir una columna vacia y ponerla como not null, se tendría que rellenar la columna previamente. Ej: ALTER TABLE empleados ADD COLUMN telefono VARCHAR2(15);

**[MODIFY (colum [….])]** → modifica columnas. Ejemplo: ALTER TABLE empleados MODIFY COLUMN nombre VARCHAR2(50);. En este caso haciendo uso del ejemplo anterior, estariamos cambiando el valor anterior de varchar 15 a varchar 50.

**[DROP COLUMN (colum…..)]** → borra columnas
    * no permite borrar claves primarias refereciadas a claves ajenas
    * no borra ultimas columnas de las tablas
    Ej: ALTER TABLE empleados DROP COLUMN direccion;
      
**[ADD CONSTRAINT restricción]** → añade restricciones
    * Solo pueden añadirse y borrarse primary key, foreing keys, check, unique y not null. Ej: ALTER TABLE empleados ADD CONSTRAINT pk_empleados PRIMARY KEY (id_empleado);
      
**[DROP CONSTRAINT restricción]** → elimina restricciones
    * cada usuario puede borrar sus propias tablas
    * cascade constraint, elimina las restricciones de integridad referencial que remitan a la clave primaria de una tabla borrada.
    * El dba o usuarios con privilegos drop any table, pueden eliminar cualquier tabla
      
**[DISABLE CONSTRAINT restricción]** → desactiva una restriccion
**[ENABLE CONSTRAINT restriccion]** → activa una restriccion

Se activan y desactivan cuando se importa información desde otra base de datos que cuenta con las mismas restricciones, para evitar comprobar restricciones que ya se saben que están bien.

Se puede ver el estado de las restricciones usando Status.

* Truncate table → elimina las filas de la tabla y además libera el espacio asociado, es decir, que la tabla sigue existiendo y el espacio se libera, solo elimina los datos, la tabla sigue existiendo en el diccionario de datos. El truncate no se puede deshacer.

* Purge recyclebin; → elimina el contenido de la papelera de reciclaje de la base de datos.

Insertar valor nulo en tabla

insert into nombre de tabla (columnas que se van a rellenar)
values
