#!/bin/sh

echo "$1" > Main.java

javac Main.java

if [ -f "Main.class" ]
then
  java Main
fi
