#!/bin/sh

set -e

echo "$1" > Main.java
javac Main.java

java Main