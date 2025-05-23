#!/bin/bash
# This file is still here to keep PM2 working on older installations.
# Add  "bash /home/colombo182/tcc-fullstack/installers/tcc.sh" inside ~~/.bashrc to autostart the application
cd /home/colombo182/tcc-fullstack

# Detect if running on Raspberry Pi
is_raspberry_pi() {
    grep -q "Raspberry Pi" /proc/cpuinfo
    return $?
}

# Set display and rotate screen based on OS
if is_raspberry_pi; then
    export DISPLAY=192.168.0.5:0.0
    DISPLAY=:0 xrandr --output HDMI-1 --rotate left
else
    export DISPLAY=:0
    xrandr --output $(xrandr | grep " connected" | cut -f1 -d " ") --rotate left
fi

# Start the application
npm start
