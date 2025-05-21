#!/bin/bash
# This file is still here to keep PM2 working on older installations.
# Add  "bash /home/colombo182/tcc-fullstack/installers/tcc.sh" inside ~~/.bashrc to autostart the application
cd /home/colombo182/tcc-fullstack
export DISPLAY=192.168.0.5:0.0
DISPLAY=:0 xrandr --output HDMI-1 --rotate left
DISPLAY=:0 npm start
