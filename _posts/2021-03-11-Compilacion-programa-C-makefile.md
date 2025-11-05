---
title: "Compilación programa C con Makefile"
date: 2021-03-11T16:10:39+01:00
categories: [Sistemas]
excerpt: "En este post a modo de aprendizaje para aprender mas sobre Debian y su paquetería se va a proceder a la compilación de un paquete escrito en C, en este caso el paquete less para posteriormente ser capaces de compilar nuestro sistema operativo."
card_image: /assets/images/cards/debian.png
---

## **Introducción** ##

En este post a modo de aprendizaje para aprender mas sobre Debian y su paquetería se va a proceder a la compilación de un paquete escrito en C, en este caso el paquete less para posteriormente ser capaces de compilar nuestro sistema operativo.

### **Compilación paquete less** ### 

Para dicha compilación empezaremos ejecutando el siguiente comando para tener el código fuente del paquete que vamos a compilar que en este caso a modo de prueba se compilara el paquete less.

~~~
apt source less
~~~

Una vez que se tengamos el código en nuestra maquina, lo siguiente sera descomprimirlo ejecutando el comando tar.

~~~
tar xvzf less_487.orig.tar.gz
~~~

Dentro del directorio less ejecutamos ./configure para comprobar si el paquete esta bien configurado para el sistema. Salida de ejecución  de ./configure:

~~~
vagrant@compilacion:~/less$ ./configure 
checking for gcc... gcc
checking whether the C compiler works... yes
checking for C compiler default output file name... a.out
checking for suffix of executables... 
checking whether we are cross compiling... no
checking for suffix of object files... o
checking whether we are using the GNU C compiler... yes
checking whether gcc accepts -g... yes
checking for gcc option to accept ISO C89... none needed
checking for library containing strerror... none required
checking how to run the C preprocessor... gcc -E
checking for grep that handles long lines and -e... /usr/bin/grep
checking for egrep... /usr/bin/grep -E
checking whether gcc needs -traditional... no
checking for a BSD-compatible install... /usr/bin/install -c
checking for special C compiler options needed for large files... no
checking for _FILE_OFFSET_BITS value needed for large files... no
checking for tgoto in -ltinfo... no
checking for initscr in -lxcurses... no
checking for initscr in -lncursesw... no
checking for initscr in -lncurses... no
checking for initscr in -lcurses... no
checking for tgetent in -ltermcap... no
checking for tgetent in -ltermlib... no
checking for library containing regcmp... no
checking for working terminal libraries... Cannot find terminal libraries - configure failed
~~~

./configure nos da un error ya que faltan librerías que deben ser instaladas para que el paquete pueda compilarse. Instalamos la librería necesaria en el sistema, que en este caso es libtinfo-dev.. Una vez instala la librería la salida de ./configure sera la siguiente:

~~~
vagrant@compilacion:~/less$ ./configure 
checking for gcc... gcc
checking whether the C compiler works... yes
checking for C compiler default output file name... a.out
checking for suffix of executables... 
checking whether we are cross compiling... no
checking for suffix of object files... o
checking whether we are using the GNU C compiler... yes
checking whether gcc accepts -g... yes
checking for gcc option to accept ISO C89... none needed
checking for library containing strerror... none required
checking how to run the C preprocessor... gcc -E
checking for grep that handles long lines and -e... /usr/bin/grep
checking for egrep... /usr/bin/grep -E
checking whether gcc needs -traditional... no
checking for a BSD-compatible install... /usr/bin/install -c
checking for special C compiler options needed for large files... no
checking for _FILE_OFFSET_BITS value needed for large files... no
checking for tgoto in -ltinfo... yes
checking for initscr in -lxcurses... no
checking for initscr in -lncursesw... yes
checking for initscr in -lncurses... yes
checking for initscr in -lcurses... yes
checking for tgetent in -ltermcap... yes
checking for tgetent in -ltermlib... no
checking for library containing regcmp... no
checking for working terminal libraries... using -ltinfo
checking for ANSI C header files... yes
checking for sys/types.h... yes
checking for sys/stat.h... yes
checking for stdlib.h... yes
checking for string.h... yes
checking for memory.h... yes
checking for strings.h... yes
checking for inttypes.h... yes
checking for stdint.h... yes
checking for unistd.h... yes
checking ctype.h usability... yes
checking ctype.h presence... yes
checking for ctype.h... yes
checking errno.h usability... yes
checking errno.h presence... yes
checking for errno.h... yes
checking fcntl.h usability... yes
checking fcntl.h presence... yes
checking for fcntl.h... yes
checking limits.h usability... yes
checking limits.h presence... yes
checking for limits.h... yes
checking stdio.h usability... yes
checking stdio.h presence... yes
checking for stdio.h... yes
checking for stdlib.h... (cached) yes
checking for string.h... (cached) yes
checking termcap.h usability... yes
checking termcap.h presence... yes
checking for termcap.h... yes
checking termio.h usability... yes
checking termio.h presence... yes
checking for termio.h... yes
checking termios.h usability... yes
checking termios.h presence... yes
checking for termios.h... yes
checking time.h usability... yes
checking time.h presence... yes
checking for time.h... yes
checking for unistd.h... (cached) yes
checking values.h usability... yes
checking values.h presence... yes
checking for values.h... yes
checking sys/ioctl.h usability... yes
checking sys/ioctl.h presence... yes
checking for sys/ioctl.h... yes
checking sys/stream.h usability... no
checking sys/stream.h presence... no
checking for sys/stream.h... no
checking wctype.h usability... yes
checking wctype.h presence... yes
checking for wctype.h... yes
checking whether stat file-mode macros are broken... no
checking for an ANSI C-conforming const... yes
checking for off_t... yes
checking for size_t... yes
checking whether time.h and sys/time.h may both be included... yes
checking for off_t... (cached) yes
checking for void... yes
checking for const... yes
checking for time_t... yes
checking for st_ino in struct stat... yes
checking return type of signal handlers... void
checking for fsync... yes
checking for popen... yes
checking for _setjmp... yes
checking for sigprocmask... yes
checking for sigsetmask... yes
checking for snprintf... yes
checking for stat... yes
checking for system... yes
checking for fchmod... yes
checking for memcpy... yes
checking for strchr... yes
checking for strstr... yes
checking for tcgetattr... yes
checking for fileno... yes
checking for strerror... yes
checking for sys_errlist... yes
checking for sigset_t... yes
checking for sigemptyset... yes
checking for errno... yes - in errno.h
checking for locale... yes
checking for ctype functions... yes
checking for wctype functions... yes
checking termcap for ospeed... yes - in termcap.h
checking for floating point... yes
checking for POSIX regcomp... yes
regular expression library:  posix
configure: creating ./config.status
config.status: creating Makefile
config.status: creating defines.h
~~~

Ya configurado el paquete, se podrá ejecutar make primero y después make install. Con make comenzamos la compilación:

~~~
vagrant@compilacion:~/less$ make
test ! -f stamp-h || CONFIG_FILES= CONFIG_HEADERS=defines.h ./config.status
touch stamp-h
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 main.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 screen.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 brac.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 ch.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 charset.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 cmdbuf.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 command.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 cvt.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 decode.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 edit.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 filename.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 forwback.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 help.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 ifile.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 input.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 jump.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 line.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 linenum.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 lsystem.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 mark.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 optfunc.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 option.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 opttbl.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 os.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 output.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 pattern.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 position.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 prompt.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 search.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 signal.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 tags.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 ttyin.c
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 version.c
gcc  -o less main.o screen.o brac.o ch.o charset.o cmdbuf.o command.o cvt.o decode.o edit.o filename.o forwback.o help.o ifile.o input.o jump.o line.o linenum.o lsystem.o mark.o optfunc.o option.o opttbl.o os.o output.o pattern.o position.o prompt.o search.o signal.o tags.o ttyin.o version.o   -ltinfo
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 lesskey.c
gcc  -o lesskey lesskey.o version.o
gcc -I. -c -DBINDIR=\"/usr/local/bin\" -DSYSDIR=\"/usr/local/etc\"  -g -O2 lessecho.c
gcc  -o lessecho lessecho.o version.o
~~~

Ejecutamos make install para instalar el paquete, por defecto make install instala los paquetes relacionados con el paquete en /usr/local/bin, mientras que lo relacionados con el manual, lo instala en /usr/local/share/man.

~~~
vagrant@compilacion:~/less$ sudo make install
./mkinstalldirs /usr/local/bin /usr/local/share/man/man1
/usr/bin/install -c less /usr/local/bin/less
/usr/bin/install -c lesskey /usr/local/bin/lesskey
/usr/bin/install -c lessecho /usr/local/bin/lessecho
/usr/bin/install -c -m 644 ./less.nro /usr/local/share/man/man1/less.1
/usr/bin/install -c -m 644 ./lesskey.nro /usr/local/share/man/man1/lesskey.1
/usr/bin/install -c -m 644 ./lessecho.nro /usr/local/share/man/man1/lessecho.1
~~~

### **Desinstalación** ###

El paquete compilado lo podemos desinstalar del sistema con varios métodos:

* Ejecutando el comando make uninstall -> deshace los instalado con make install, pero en este caso less no cuenta con ningún fichero uninstall para deshacer la instalación.
* Ejecutando el make clean -> elimina ficheros binarios además de ficheros objetos creados en la compilación.

~~~
vagrant@compilacion:~/less$ make clean
rm -f *.o core less lesskey lessecho
~~~

* Ejecutando make distclean ->  además de eliminar ficheros binarios y objetos como el comando clean, también elimina los ficheros de configuración.

~~~
vagrant@compilacion:~/less$ make distclean
rm -f *.o core less lesskey lessecho
rm -f Makefile config.status config.log config.cache defines.h stamp-h
~~~

Una vez probada la compilacion de un paquete, podremos ser capaces de compilar nuestro sistema operativo sin provocar errores.