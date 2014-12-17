#!/bin/sh

echo "$1" > prog.hx
haxe -main prog.hx --interp
