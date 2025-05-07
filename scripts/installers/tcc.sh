#!/bin/bash
# This file is still here to keep PM2 working on older installations.

cd /home/colombo182/EspelhoInteligente
DISPLAY=:0 xrandr --output HDMI-1 --rotate left
DISPLAY=:0 npm start
