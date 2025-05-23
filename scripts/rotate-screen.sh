#!/bin/bash

# Rotate screen based on session type
if [ "$XDG_SESSION_TYPE" = "wayland" ]; then
    echo "Wayland session detected"
    
    # Try multiple methods for Wayland rotation
    if gsettings set org.gnome.desktop.a11y.applications screen-rotation 'left'; then
        echo "Rotated using GNOME a11y settings"
    elif gsettings set org.gnome.desktop.background picture-options 'rotated'; then
        echo "Rotated using GNOME background settings"
    elif command -v gnome-display-properties &> /dev/null; then
        gnome-display-properties --set-rotation 270
        echo "Rotated using gnome-display-properties"
    else
        echo "Failed to rotate Wayland display"
        exit 1
    fi
else
    echo "X11 session detected"
    export DISPLAY=:0

    # Debug: Show current display server
    echo "Display Server: $XDG_SESSION_TYPE"

    # Allow X server connections
    xhost +local: || {
        echo "Failed to set xhost permissions"
        exit 1
    }

    echo "Attempting screen rotation..."

    # Debug: Show all available displays
    xrandr --listmonitors

    # Try multiple patterns for display detection
    DISPLAY_INFO=$(xrandr -q | grep -E "HDMI-?[0-9]|DP-?[0-9]|DVI-?[0-9]|eDP-?[0-9]" | grep " connected")

    if [ -z "$DISPLAY_INFO" ]; then
        echo "Trying alternative display detection..."
        DISPLAY_INFO=$(xrandr -q | grep " connected" | grep -Ev "Virtual|^Screen")
    fi

    if [ -z "$DISPLAY_INFO" ]; then
        echo "No physical displays found. Debug info:"
        xrandr -q
        xhost -local:
        exit 1
    fi

    # Rotate only physical displays
    echo "$DISPLAY_INFO" | while read -r line ; do
        display=$(echo "$line" | cut -d " " -f1)
        echo "Found physical display: $display"
        xrandr --output "$display" --rotate left
    done

    # Remove X server permissions
    xhost -local:
fi
