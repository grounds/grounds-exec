#![allow(unused_must_use)]
use std::io;
 
fn main() {
    let mut stderr = io::stderr();
    stderr.write_str("Hello stderr\n");
}
