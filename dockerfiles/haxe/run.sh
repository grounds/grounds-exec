#!/bin/sh

echo "$1" > Hello.hx
haxe -main Hello --interp
