#!/bin/sh

set -e

echo "$1" > prog.c
gcc -o prog prog.c

./prog