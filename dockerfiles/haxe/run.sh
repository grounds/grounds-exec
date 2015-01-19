#!/bin/sh

echo "$1" > Main.hx
haxe -main Main --interp
