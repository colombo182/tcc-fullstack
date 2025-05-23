window.addEventListener('load', () => {
    // Handle rotation changes
    window.addEventListener('resize', () => {
        if (window.innerHeight > window.innerWidth) {
            document.body.classList.add('rotated');
        } else {
            document.body.classList.remove('rotated');
        }
    });

    // Load your existing mirror functionality here
    // You'll need to adapt your Electron-specific code for browser usage
});
