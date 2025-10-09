---
layout: single
title: "Introducción a C++"
date: 2021-06-09T16:43:19+02:00
categories: [Apuntes]
excerpt: "C++ es un lenguaje de programación compilado creado en 1979 derivado del lenguaje C quedándose con lo mejor de C y añadiendo funcionalidades nuevas."
---

### **Introducción** ###

C++ es un lenguaje de programación compilado creado en 1979 derivado del lenguaje C quedándose con lo mejor de C y añadiendo funcionalidades nuevas. 

Una de las mejoras que añade C++ es la posibilidad de usar la programación orientada a objetos la cual nos permite ampliar los tipos de datos que podemos utilizar permitiendo definir clases y objetos.

Para escribir un programa en C++ necesitaremos de un editor de texto y un compilador, pero lo normal es utilizar herramientas de entornos integrados de desarrollo o IDEs que básicamente son herramientas como por ejemplo Visual Studio Code que permiten tanto editar el código fuente como compilar el programa una vez acabado.

### Herramienta Zinjai ###

Es una herramienta del mismo creador que psinc (para aprender pseudocódigo) para programas en C y C++ esta disponible tanto para Linux como para Windows.

Pasos de instalación en Windows:

1. Descargar instalador para Windows.
2. Ejecutamos el ejecutable descargado.
3. Aceptamos los términos y seleccionamos todos los componentes para la instalación.
4. Seleccionamos directorio de destino y comenzamos la instalación.
5. Configuramos el idioma.

Pasos de instalación en Linux

1. Descargar paquete para GNU/Linux.
2. Descomprimimos el archivo descargado y ejecutamos el fichero zinjai para comenzar con la instalación (es posible que se requiera tener instalado xterm, por lo que al instalar, se instalara xterm y al ejecutar de nuevo la instalación se instalara completamente).

### Estructura en C++ ###

Ejemplo de programa básico:

~~~
#include <iostream>
using namespace std;

int main (int argc, char *argv[])
{
	cout << “hola mundo”;
	return 0;
}
~~~

* La primera linea #include, nos permite añadir una librería, que en este caso se trata de la librería iostream donde se encuentran las funciones para la entrada y salida de datos.

* Para que no haya problemas ni errores entre las distintas funciones, cada una usa un distinto espacio de nombre por lo que en este caso la función cout usa el espacio de nombres por defecto, std (especificada antes de iniciar la funcion principal).
    
* La linea int main hace referencia a la función principal, la función por la que se empieza a ejecutar el programa y posteriormente se van ejecutando las distintas instrucciones en orden dentro de {}. La función principal siempre debe llamarse “main” y en este caso se indica que devuelve un valor entero (int).

* Cout nos permite escribir en pantalla.

* Return, devuelve un valor entero al sistema operativo, si la instrucción se ejecuta correctamente devuelve 0, sino dará como resultado devuelve cualquier otro valor.

### Tipos de datos ###

* Datos simples:
    ◦ Numeros enteros (int)
    ◦ Numeros reales (float o double)
    ◦ Valores lógicos (bool)
    ◦ Caracteres (char)

* Datos complejos: 
    ◦ Arrays
    ◦ Cadenas de caracteres
    ◦ Estructura de datos

Los datos que nosotros indicamos en un programa lo podemos indicar de varias formas:

* Literales: nos permiten representar valores, por ejemplo un literal entero será por ejemplo 5.

* Variables: son identificadores en los que se guarda un valor. Las variables se declaran de un tipo de dato, por ejemplo una variable entera puede guardar datos enteros.

* Constantes: nos permite declarar un valor de un determinado tipo por medio de de un identificador. Mientras el valor de una variable puede cambiar a lo largo de la ejecución de un programa, las constantes no cambian.

* Expresiones: las expresiones son operaciones que podemos hacer entre distintos tipos de datos. El tipo de dato de una expresión dependerá del resultado de la operación. Según el tipo de datos con los que trabajemos tenemos distintos tipos de operadores:

    * Operadores aritméticos: para hacer operaciones con datos numéricos.
    * Operadores relacionales: nos permiten comparar datos y nos devuelve un valor lógico.
    * Operadores lógicos: nos permite trabajar con valores lógicos.
    * Operadores de asignación: Nos permite asignar valores a variables.
    * Otras operadores: operadores para trabajar con bits o punteros. 

La precedencia de operadores es la siguiente:

* Paréntesis
* Operadores unarios (+ / - para indicar números positivos y negativos)
* Multiplicaciones, divisiones y módulos
* Sumas y restas
* Operador lógico. && (Y)
* Operador lógico. \|\| (O)
* Operadores de comparación
* Operadores de asignación

Es decir, los operadores dentro de un paréntesis serán los primeros en ejecutarse mientras que los operadores de asignación serán los últimos.

### Literales y Constantes ###

### Literales ###

Como se ha dicho anteriormente nos permiten representar valores de diferentes tipos, por lo que contamos con diferentes tipos de literales:

* Literales enteros: para representar números enteros utilizamos cifras enteras. Ej: 5, -9, números en base octal: 877, base hexadecimal 0xfe, etc.

* Literales reales: usamos un punto para separar la parte entera de la decimal. Por ejemplo 3.14159. también podemos usar “e” o “E” para representar el exponente.

* Literales booleanos o lógicos: solo tienen dos valores, false cuando algo es falso y true cuando algo es verdadero.

* Literales carácter: para indicar un valor de tipo carácter utilizamos las comillas simples (‘’). también podemos usar algunos caracteres especiales como pueden ser \n para indicar un salto de linea o \t para indicar una tabulación.

* Literales cadenas de caracteres: una cadena de caracteres es un conjunto de caracteres. Para indicar una cadena de caracteres hacemos uso de las comillas dobles (“”).

### Constantes ###

Como se ha dicho anteriormente, las constantes nos permiten declarar un valor de un determinado tipo por medio de de un identificador. Mientras el valor de una variable puede cambiar a lo largo de la ejecución de un programa, las constantes no cambian.

Para crear constantes usamos #define identificador valor (deben declararse antes del programa principal). Por ejemplo:

~~~
#include <iostream>
using namespace std;
#define ANCHURA 10
#define ALTURA 5
#define NUEVALINEA ‘\n’
int main () {
	int área;
	área = ANCHURA * ALTURA;
	cout << área;
	cout << NUEVALINEA;
	return 0;
}
~~~

Este programa lo que hace es que en programa principal cuando encuentra el identificador de la constante, en este caso altura y anchura, se sustituye el identificador por sus valores correspondientes, en este caso 5 y 10 respectivamente por lo que a la hora de ejecutar el programa principal el programa hará “área = 10 * 5” y el valor entero se mostrará en pantalla a través de cout << y después se mostrará el salto de linea.

### Variables ### 

Las variables nos permiten almacenar información. Las variables tienen un nombre y al crearlas hay que especificar el tipo de datos que se van a almacenar. Ej: 

~~~
int variable1;
~~~

En este caso en la variable1 solo se almacenaran datos enteros. 

El nombre de las variables debe ir en minúsculas para así diferenciarse de las constantes que van en mayúsculas, además el nombre de las variables deben estar compuestos por caracteres, números o subrayados, pero no puede empezar por un numero.

Ejemplos de declaración de variables:

~~~
	int variable1; → si no incluimos el valor, este se pondrá por defecto, en el caso de los enteros el valor por defecto es 0. en este caso posteriormente en el programa será necesario inicializar la variable dandole un valor.

	int variable2=10;
	int variable3, variable4;
	int variable5=20, variable6=-10;
~~~

Contamos con dos tipos o ambitas de variables:

* Variables locales: se crean dentro de la función es decir si por ejemplo tengo una variable1 cuyo valor es 5 esa variable1 solo existirá en esa función, si tenemos varias funciones en esas otras variable1 no existira, se tendrá que volver a declarar e inicializar.

* Variables Globales: estas variables sin embargo al contrario que las anteriores se declaran fuera de la función, por lo que es posible usarlas en cada una de las funciones con las que contemos en nuestro programa.

### Operadores de asignación ###

Contamos con dos operadores de asignación en C++:

* Asignación simple (=): nos permite asignar a una variable tanto valores literales, como numéricos y expresiones. Ej: a = b+7; en este caso guardamos la suma b+7 en la variable a.

* +=: suma y a continuación hace la asignación. Ej: a+=b es igual que a=a+b, es decir si tenemos a=7 y después tenemos a+=7, entonces nuestra variable a ya no vale 7, sino 14. en este caso también pueden usarse -=, *=, /=, etc.

### Tipos de datos numericos ###

* int → nos permite guardar valores enteros. Ej: 5, -8, 0...

* Float → nos permite almacenar numeros reales, es decir con decimales (maximo 7 digitos decimales). 

* Double → es parecido a float solo que permite almacenar numeros reales pero con 16 decimales.

La diferencia principal entre float y double es espacio que la variable de este tipo ocupa en memoria  ya que float ocupa 4 bytes, mientras que double al contar con 16 digitos decimales, ocupa 8 bytes.

### Tipo de dato carácter ###

* char: guarda un carácter, aunque realmente la variable es entera ya que internamente se guarda un numero que hace que cada carácter haga referencia a un numero usando la tabla ascii. Por ejemplo a una variable char le podemos asignar un valor de la siguientes formas:

~~~
	char variable1=‘a’; o bien char variable2=97 (97 es el valor numerico asignado a ‘a’ en la 	tabla ascii);
~~~

### Modificadores de tipo ###

Los modificadores de tipo se pueden usar para modificar el tamaño de memoria que se coge para guardar datos o si se quieren guardar numeros positivos o negativos. 

* int: nosotros podemos almacenar numeros desde el -2147483648 al 2147483647 mientras que si por ejemplo queremos la posibilidad de almacenar numeros solo positivos, usariamos unsigned int, que almacena valores de 0 al 4294967295.
    
* short int: se usa para el caso en el que queramos redurie el tamaño de almacenamiento en memoria limitando la cantidad de valores posibles, en este caso de -32768 a 32767. en este caso en lugar de 4 bytes, ocupa 2 bytes.
    
* unsigned short int: es una combinacion de las dos anteriores, por un lado limita el rango de valores de forma que ocupa menos espacio en memoria y a la vez permite solo valores positivos. Los valores van desde 0 a 65535.
    
* long int: al igual que hay un short int para que los valores ocupen menos espacio en memoria, tambien contamos un long int que amplia el rango de valores al doble ocupando asu 8 bytes en memoria. El rango de vlores va desde -9223372036854775808 a 9223372036854775807.

Al declarar las variables podemos usar notaciones cortas donde no es necesario indicar el tipo int. Ej: 

~~~
unsigned short var1;
long var2;
short var3;
~~~

Podemos usar sufijos para indicar literales numéricos largos (con el sufijo L) y sin signo (con el sufijo U). Por ejemplo:

~~~
var1=123U; var2=123L;
~~~

### Conversion de tipos ###

Por defecto C++ hace conversiones entre algunos tipos de datos como por ejemplo entre cgar e int o de int a float. Ej:

~~~
int var1=10
float var2=var1
~~~

En este caso por defecto el valor entero 10 se convierte en valor real 10,0.

Si tenemos expresiones donde hacemos operaciones entre datos del mismo tipo, el resultado de la expresión será del mismo tipo.

Si tenemos expresiones donde hacemos operaciones entre datos de distintos tipos el resultado de la expresión será del tipo con más precisión de los datos operados.

Por último podemos hacer una conversión explicita usando una expresión de typecast, por ejemplo para convertir un int a un float:

~~~
int num1=10,num2=3; 
float res; 
res=(float)num1 / float(num2)
~~~

### Operadores aritmeticos ###

* +: suma dos numeros.
* -: resta dos numeros.
* *: multiplica dos numeros.
* /: divide dos numeros.
* %: modulo o resto de la division.
* +, -: operadores unarios positivo y negativo.
* ++: operador de incremento, suma 1 a la variable, 1++ es lo mismo a 1=1+1.
* –: operador de decremento, resta 1 a la variable.

### Funciones matematicas ###

En la librería cmath tenemos distintas funciones matemática. Las más útiles que podemos usar en nuestros programas son:

* double pow(double, double);: Realiza la potencia, la base es el primer parámetro y el exponente el segundo. Recibe datos de tipo double y devuelve también una valor double.
      
* double sqrt(double);: Realiza la raíz cuadrada del parámetro double que recibe. Devuelve un valor `double.
      
* int abs(int);: Devuelve el valor absoluto (valor entero) del número entero que recibe como parámetro.

Veamos un ejemplo:

~~~
#include <iostream>
#include <cmath>
using namespace std;

int main(int argc, char *argv[]) {
    int num1=4, num2=2;
    cout << "Potencia:" << pow(num1,num2) << endl; //Potencia
    cout << "Raíz Cuadrada:" << sqrt(num1) << endl; //Raíz cuadrada
    num1=-4;
    cout << "Valor absoluto:" << abs(num1) << endl; //Valor absoluto
    return 0;
}
~~~

### Cadenas de caracteres ###

Tenemos dos formas de trabajar con cadenas de caracteres:

* La tradicional usada en C, que es entender  como una cadena de caracteres como un conjunto de variables de tipo carácter (arrays).
      
* C++ nos ofrece la clase string que nos permite trabajar con cadenas de caracteres.

Podemos declarar una cadena string de la siguiente forma:

~~~
string cadena1;
string cadena2=“Hola mundo”;
~~~

Las cadenas de caracteres se pueden indexar, es decir que podemos obtener el valor de cada carácter, para ello tenemos que indicar la posicion, de izquierda a derecha empezando por el 0. Ej:

~~~
cadena2[0] nos devolveria el carácter H de Hola mundo.
~~~

Otra operación que podemos hacer con las cadenas de caracteres es saber cuantos caracteres tiene la cadena, para ello usamos el metodo length. Ej:

~~~
cadena2.length() nos devolvera 10 ya que “Hola mundo” cuenta con 10 caracteres.
~~~

Podemos tambien concatenar cadenas de caracteres usando +. Ej:

~~~
string nombre=“sergio”;
string apellido=“ibañez”;
string nombre_completo;
nombre_completo=nombre+“ ”+apellido
~~~

El resultado de la concatenacion será “sergio ibañez”.

### Entrada y salida de datos ###

Las instrucciones que nos permiten leer y mostrar informacion por pantalla estan en la librería iostream.

* cout: representa el dispositivo de salida (la pantalla), el operador que escribe en pantalla es << lo que hace es enviar el mensaje al dispositivo de salida estándar a traves de cout. Ej:

~~~
	cout << “bienvenido al sistema” end1; (end1 indica el final de linea)
~~~

* cin: valor para leer por teclado. Ej:

~~~
	int edad;
	cout << “dime tu edad: ”;
	cin >> edad;
~~~

De esta forma por pantalla se nos muestra la pregunta sobre nuestra edad mientras que la edad que introduzcamos por pantalla se guardara como valor de la variable edad a traves de >>.

Sin embargo, cin no es capaz de leer variables de tipo cadena de carcteres, por lo que en caso de querer o necesitar leer cadenas de caracteres usamos la funcion getline. Ej: 

~~~
string nombre;
getline(cin,nombre);
~~~

De esta forma podremos introducir el valor que tendra la variable nombre.

* cin.ignore: lo usamos para borrar valores introducidos por teclado.