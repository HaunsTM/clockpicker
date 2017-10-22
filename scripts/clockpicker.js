'use strict';
(function () {
    //https://www.kirupa.com/html5/creating_simple_html5_canvas_animation.htm
    
    
    var start = function ( ){

        const CANVAS_WIDTH = 250;
        const CANVAS_HEIGHT = 250;

        var radius = CANVAS_HEIGHT/2;

        let domAnalogSelectors = {
            "background" : "#canvBackground",
            "digits" : {
                "hours" : "#canvDigitsHours",
                "minutes" : "#canvDigitsMinutes",
            },
            "hands" : {
                "hours" : "#canvHandsHours",
                "minutes" : "#canvHandsMinutes",
            },
            "markers" : {
                "hours" : "#canvMarkersHours",
                "minutes" : "#canvMarkersMinutes",
            }
        }
        let domDigitalSelectors = { 
            "hours" : "#digHours",
            "minutes" : "#digMinutes"
        }
        var controller = new Controller(domAnalogSelectors, domDigitalSelectors, CANVAS_WIDTH, CANVAS_HEIGHT, radius);
    }

    start();
})();    