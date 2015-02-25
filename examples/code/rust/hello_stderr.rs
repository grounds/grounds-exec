#![feature(old_io)]
#![allow(unused_must_use)]
use std::old_io as io;

fn main() {
    let mut stderr = io::stderr();
    stderr.write_str("Hello stderr\n");
}
