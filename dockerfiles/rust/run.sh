#!/bin/sh

echo "$1" > prog.rs

rustc -o prog prog.rs

if [ -f "prog" ]
then
  ./prog
fi
