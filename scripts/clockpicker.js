'use strict';
(function () {
    //https://www.kirupa.com/html5/creating_simple_html5_canvas_animation.htm
    



    
    



    
    var start = function ( ){

        const CANVAS_WIDTH = 500;
        const CANVAS_HEIGHT = 500;

        var radius = CANVAS_HEIGHT/2;
        var startNumber = 1;
        var endNumber = 12;
        var handLength = radius*0.70;
        var handLineWidth = 6;

        var domSelBackground = '#canvBackground';
        var domSelDigits = '#canvDigits';
        var domSelHands = '#canvHands';
       

        var controller = new Controller(domSelBackground, domSelDigits, domSelHands, CANVAS_WIDTH, CANVAS_HEIGHT, radius, handLength, handLineWidth, startNumber, endNumber);
    }

    start();
})();    