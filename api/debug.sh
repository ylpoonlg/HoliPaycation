#!/bin/bash

cd $(dirname $0)
export ROCKET_PORT=4000
~/.cargo/bin/cargo run
