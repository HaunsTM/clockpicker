
(function () {
    const CANVAS_WIDTH = 200;
    const CANVAS_HEIGHT = 200;
    
    var allCanvas = document.querySelectorAll("#container canvas");
    var allContext = function ( ) {
        
    }
    var setCanvasSizes = function() {
        var allCanvas = document.querySelectorAll("#container canvas");
        for( var i = 0; i < allCanvas.length; i++){
            allCanvas[i].width = CANVAS_WIDTH;
            allCanvas[i].height = CANVAS_HEIGHT;
        }
    }

    var start = function ( ){
        setCanvasSizes();
    }

    start();
})();