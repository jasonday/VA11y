javascript: (function () {
    'use strict';
    
    // Avoid activating more than once
    if (window.aNameInstance?.initialized) {
        console.warn('aName bookmarklet already active');
        return;
    }
    
    window.aNameInstance = window.aNameInstance || {};
    
    const script = document.createElement('script');
    
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.src = `https://cdn.jsdelivr.net/gh/jasonday/Accessibility-Testing-Bookmarklets@latest/aName.js?v=${Date.now()}`;
    
    script.onload = () => {
        try {
            console.log('Loaded aName.js');
            
            // Check if init function exists, or if aName was already auto-executed
            if (typeof window.aNameInstance.init === 'function') {
                window.aNameInstance.init();
                window.aNameInstance.initialized = true;
            } else if (typeof window.aName === 'function') {
                // If aName function exists globally, call it
                window.aName();
                window.aNameInstance.initialized = true;
            } else {
                // Script auto-executed, just mark as initialized
                window.aNameInstance.initialized = true;
                console.log('aName.js auto-executed successfully');
            }

            
           if (aNameVersion) {
                console.log('aName version:', aNameVersion);
            }

        } catch (error) {
            console.error('Error initializing aName:', error);
            alert('Failed to initialize aName bookmarklet');
        }
    };
    
    script.onerror = (error) => {
        console.error('Failed to load aName.js:', error);
        alert('Failed to load aName bookmarklet. Check your internet connection.');
    };
    
    document.documentElement.appendChild(script);
}());
