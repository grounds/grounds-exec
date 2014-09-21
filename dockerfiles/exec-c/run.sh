#!/bin/sh

echo "$1" > prog.c
gcc -o prog prog.c

if [ -f "prog" ]
then
  ./prog
fi
