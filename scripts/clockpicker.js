'use strict';
(function () {
    //https://www.kirupa.com/html5/creating_simple_html5_canvas_animation.htm
    
    
    var start = function ( ){

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
        
        let settings = {
            "canvas" : { 
                "width" : 250,
                "height" :250,
            },
            "background" : {
                /**
                 * color : background color
                 */
                "color" : "rgba(0, 0, 255, 0.3)"
            },
            "hour" : {
                "hand" : {                    
                    /**
                     * width : width in pixels of hand
                     * color : hand color
                     */
                    "width" : 6,
                    "color" :  "blue",
                },
                "marker" : {
                    /**
                     * width : width in pixels of marker
                     * color : marker color
                     * drawInterval : how often a marker should be drawn 1 = every, 2 = every other, 3 = every third...
                     */
                    "width" : 4,
                    "color" :  "red",
                    "drawInterval" : 1,
                },
                "start" : 1,
                "end" : 12,            
            },
            "minute" : {
                "marker" : {
                    /**
                     * width : width in pixels of marker
                     * color : marker color
                     * drawInterval : how often a marker should be drawn 1 = every, 2 = every other, 3 = every third...
                     */
                    "width" : 2,
                    "color" :  "black",
                    "drawInterval" : 5,
                },
                "hand" : {
                    "width" : 6,
                    "color" :  "#c82124",
                },
                "start" : 1,
                "end" : 60,
            }
        };
        

        var controller = new Controller(domAnalogSelectors, domDigitalSelectors, settings);
    }

    start();
})();    