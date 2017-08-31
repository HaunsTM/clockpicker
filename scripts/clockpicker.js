'use strict';
(function () {
    //https://www.kirupa.com/html5/creating_simple_html5_canvas_animation.htm
    



    
    



    
    var start = function ( ){

        const CANVAS_WIDTH = 500;
        const CANVAS_HEIGHT = 500;

        var radius = CANVAS_HEIGHT/2;

        var time = {
            "hour" : {
                "hand" : {
                    "length" : radius*0.70,
                    "width" : 4,
                    "color" :  "blue"
                },
                "start" : 1,
                "end" : 12
            },
            "minute" : {
                "hand" : {
                    "length" : radius*0.70,
                    "width" : 4,
                    "color" :  "blue"
                },
                "start" : 1,
                "end" : 60
            },
            "second" : {
                "hand" : {
                    "length" : radius*0.70,
                    "width" : 1,
                    "color" :  "blue"
                },
                "start" : 1,
                "end" : 60
            },


        }

        var domSelBackground = '#canvBackground';
        var domSelDigits = '#canvDigits';
        var domSelHands = '#canvHands';
       

        var controller = new Controller(domSelBackground, domSelDigits, domSelHands, CANVAS_WIDTH, CANVAS_HEIGHT, radius, time);
    }

    start();
})();    