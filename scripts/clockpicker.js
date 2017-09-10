'use strict';
(function () {
    //https://www.kirupa.com/html5/creating_simple_html5_canvas_animation.htm
    
    
    var start = function ( ){

        const CANVAS_WIDTH = 250;
        const CANVAS_HEIGHT = 250;

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

        let domSelectors = {
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

        var controller = new Controller(domSelectors, CANVAS_WIDTH, CANVAS_HEIGHT, radius, time);
    }

    start();
})();    