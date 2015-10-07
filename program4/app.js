requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../app'
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['Mat4','myGL','Controller'], 
    function() {
        requirejs(['webgl-utils','Mat4','Objects','app/main'], 
            function() {
                webGLStart();
            });
    });
