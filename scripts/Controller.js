'use strict';
    class Controller {
        // Constructor
        constructor (domSelectors, canWidth, canHeight, radius, time) {

            this._radius = radius;

            this._commonVariables = {
                "canvas" : {
                    "width" : canWidth,
                    "height" : canHeight
                },
                "context" : {       
                    "width" : canWidth,
                    "height" : canHeight,
                    "translation" : {
                        "initial" : {
                            "x" : canWidth / 2,
                            "y" : canHeight / 2
                        }
                    }
                },
                "mouse" : {
                    "position" : {
                        "moveStart" : {
                            "x" : 0,
                            "y" : canHeight / 2
                        },
                        "moveEnd" : {
                            "x" : 0,
                            "y" : 0
                        }
                    }
                },
                "radius" : radius,
                "time" : time
            }

            this._canAndCtxBackground = this.SizedAndCenteredOrigoCanvasAndContext(domSelectors.background, this._commonVariables);
            this._canAndCtxDigitsHours = this.SizedAndCenteredOrigoCanvasAndContext(domSelectors.digits.hours, this._commonVariables);
            this._canAndCtxDigitsMinutes = this.SizedAndCenteredOrigoCanvasAndContext(domSelectors.digits.minutes, this._commonVariables);
            this._canAndCtxHandsHours = this.SizedAndCenteredOrigoCanvasAndContext(domSelectors.hands.hours, this._commonVariables);
            this._canAndCtxHandsMinutes = this.SizedAndCenteredOrigoCanvasAndContext(domSelectors.hands.minutes, this._commonVariables);

            this._background = new Background(this._canAndCtxBackground.context,this._commonVariables.radius, "rgba(0, 0, 255, 0.3)");

            this._digitsHours = new Digits(this._canAndCtxDigitsHours.context,this._commonVariables.radius, this._commonVariables.time.hour.start, this._commonVariables.time.hour.end );
            this._digitsMinutes = new Digits(this._canAndCtxDigitsMinutes.context,this._commonVariables.radius, this._commonVariables.time.minute.start, this._commonVariables.time.minute.end );

            this._handsHours = new Hand(this._canAndCtxHandsHours, this._commonVariables.time.hour.hand, this._commonVariables.time.hour.start, this._commonVariables.time.hour.end );
            this._handsMinutes = new Hand(this._canAndCtxHandsMinutes,this._commonVariables.time.minute.hand, this._commonVariables.time.minute.start, this._commonVariables.time.minute.end);

            this._state="INITIAL";
            this.Statemachine ();
        }

        Statemachine ( ) {
            let curState = this._state;
            let nextState = "";

            switch (this._state) {
                case "INITIAL":                
                    this._background.Draw();
        
                    this._utmostCanvas = this._canAndCtxBackground.canvas.parentElement.lastElementChild;
                    this._utmostCanvas.addEventListener("mouseup", this.MouseUp.bind(this),  false);
                    nextState = "DRAW_INITIAL_TIME";

                    //break;
                case "DRAW_INITIAL_TIME":
                    this._digitsHours.clear();
                    this._digitsMinutes.clear();

                    this._handsHours.clear();
                    this._handsMinutes.clear();

                    this._digitsHours.Draw();
                    
                    this._handsHours.drawAngle(this._commonVariables.time.hour.lastSelectedAngle);
    
                    this._handsMinutes.drawAngle(this._commonVariables.time.minute.lastSelectedAngle);
                    nextState = "SELECT_HOUR";
                break;

                case "SELECT_HOUR":
                    nextState = "SELECT_MINUTE";
                break;

                case "SELECT_MINUTE":
                    this._digitsHours.clear();
                    this._digitsMinutes.clear();
                    this._digitsMinutes.Draw();
                    nextState = "DRAW_INITIAL_TIME";
                break;

            }
            this._state = nextState;
        }

        SizedAndCenteredOrigoCanvasAndContext ( domSelector, commonVariables ) {
            let curCanvas = document.querySelector( domSelector );
            let curContext = curCanvas.getContext("2d");

            curCanvas.width = commonVariables.canvas.width;
            curCanvas.height = commonVariables.canvas.height;

            curContext.translate(commonVariables.context.translation.initial.x, commonVariables.context.translation.initial.y);        
            curContext.width = commonVariables.context.width;
            curContext.height = commonVariables.context.height;
            
            return { 
                "selector" : domSelector,
                "canvas" : curCanvas,
                "context" : curContext 
            }
        }
        
        GetMousePos(e) {

            var rect = this._utmostCanvas.getBoundingClientRect();

            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
        
        GetTranslatedMousePosition(e, commonVariables) {            
            var mousePos = this.GetMousePos(e, this._utmostCanvas);
            
            return {
                x: mousePos.x - commonVariables.context.translation.initial.x,
                y: commonVariables.context.translation.initial.y - mousePos.y
            }
        }

        /*https://stackoverflow.com/questions/1114465/getting-mouse-location-in-canvas*/

        GetAngle (mousePos) {

            let rad = 0;
            if (mousePos.x > 0 && mousePos.y <= 0) {
                //Q1
                rad = Math.atan(Math.abs(mousePos.y/mousePos.x));
            } else if (mousePos.x <= 0 && mousePos.y <= 0) {
                //Q2
                rad = Math.atan(Math.abs(mousePos.x/mousePos.y)) + 0.5*Math.PI;
            } else if (mousePos.x <= 0 && mousePos.y > 0) {
                //Q3
                rad = Math.atan(Math.abs(mousePos.y/mousePos.x)) + Math.PI;                
            } else {
                //Q4
                rad = Math.atan(Math.abs(mousePos.x/mousePos.y)) + (3/2)*Math.PI;
            }
            return {"rad":rad, "deg":rad*360/(2*Math.PI)};
        }

        MouseDown(mouseEvent){
            var mousePos = this.GetTranslatedMousePosition(mouseEvent, this._commonVariables);            
        }

        MouseUp(mouseEvent){
            
            // http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
            var mousePos = this.GetTranslatedMousePosition(mouseEvent, this._commonVariables);
            
            this._commonVariables.mouse.position.moveEnd.x = mousePos.x;
            this._commonVariables.mouse.position.moveEnd.y = mousePos.y;

            let startAngle = this.GetAngle({"x": this._commonVariables.mouse.position.moveStart.x, 
                                            "y": this._commonVariables.mouse.position.moveStart.y});
            let endAngle = this.GetAngle({"x": this._commonVariables.mouse.position.moveEnd.x, 
                                            "y": this._commonVariables.mouse.position.moveEnd.y});
            
            var details = document.getElementById('details');
            details.innerHTML = "<table>"+
                                    "<tr><td colspan=2>moveStart</td><td colspan=2>moveEnd</td></tr>"+
                                    "<tr><td>x</td><td>y</td><td>x</td><td>y</td></tr>"+
                                    
                                    "<tr>"+
                                        "<td>"+this._commonVariables.mouse.position.moveStart.x+"</td>"+
                                        "<td>"+this._commonVariables.mouse.position.moveStart.y+"</td>"+
                                        "<td>"+this._commonVariables.mouse.position.moveEnd.x+"</td>"+
                                        "<td>"+this._commonVariables.mouse.position.moveEnd.y+"</td>"+
                                    "</tr>"+
                                "</table>" +
                                "<p><b>startAngle: </b>" + Math.round(startAngle.deg) + " &deg; (" + Math.round(startAngle.rad * 100)/100 + " rad" +")</p>"+
                                "<p><b>endAngle: </b>" + Math.round(endAngle.deg) + " &deg; ("+ Math.round(endAngle.rad * 100)/100 + "  rad" +")</p>";

            switch (this._state) {
                case "SELECT_HOUR" :
                    let closestHourAngle = this._handsHours.closestDefinedNumberAndAngle(endAngle.rad).angle;
                    this._handsHours.animate(this._commonVariables.time.hour.lastSelectedAngle, closestHourAngle);
                    this._commonVariables.time.hour.lastSelectedAngle = closestHourAngle;
                    break;
                case "SELECT_MINUTE" :                    
                    let closestMinuteAngle = this._handsMinutes.closestDefinedNumberAndAngle(endAngle.rad).angle;
                    this._handsMinutes.animate(this._commonVariables.time.minute.lastSelectedAngle, closestMinuteAngle);
                    this._commonVariables.time.minute.lastSelectedAngle = closestMinuteAngle;
                    break;
            }

            this._commonVariables.mouse.position.moveStart.x = mousePos.x;
            this._commonVariables.mouse.position.moveStart.y = mousePos.y;
            
            this.Statemachine();
        }
    }
