#!/bin/sh

set -e

echo "$1" > prog.cpp
g++ -o prog prog.cpp

./prog