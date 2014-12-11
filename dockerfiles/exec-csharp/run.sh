#!/bin/sh

set -e

echo "$1" > prog.cs
mcs prog.cs

mono prog.exe