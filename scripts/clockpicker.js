'use strict';
(function () {
    //https://www.kirupa.com/html5/creating_simple_html5_canvas_animation.htm
    
    
    var start = function ( ) {

        let dom = {};

        dom = {
            "selector" : { }
        };

        dom = {
            "selector" : { 
                "analog" : {
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
                },
                "digital" : {
                    "hours" : "#digHours",
                    "minutes" : "#digMinutes"
                }
            }
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
                "color" : "rgba(198, 82, 13, 0.3)"
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
                "numbers" : {
                    "start" : 1,
                    "end" : 24,
                    "roundsToDistrubuteOn" : 2,
                },
                "lastSavedValue" : 14,         
            },
            "minute" : {
                "hand" : {
                    "width" : 6,
                    "color" :  "#c82124",
                },
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
                "numbers" : {
                    "start" : 1,
                    "end" : 60,
                    "roundsToDistrubuteOn" : 1,
                },
                "lastSavedValue" : 32,
            }
        };        

        var controller = new Controller(dom, settings);
    }

    start();
})();    