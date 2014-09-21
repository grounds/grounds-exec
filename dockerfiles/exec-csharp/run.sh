#!/bin/sh

echo "$1" > prog.cs
mcs prog.cs

if [ -f "prog.exe" ]
then
  mono prog.exe
fi
