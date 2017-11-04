'use strict';
    class Controller {

        // Constructor
        constructor (domAnalogSelectors, domDigitalSelectors, canWidth, canHeight, radius) {

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
                    "dragging" : false,
                    "position" : {
                        "start" : {
                            "x" : 0,
                            "y" : 0
                        },
                        "end" : {
                            "x" : 0,
                            "y" : 0
                        }
                    }
                },
                "radius" : radius,
                "time" : {
                    "hour" : {
                        "hand" : {
                            "length" : radius*0.50,
                            "width" : 6,
                            "color" :  'blue'
                        },
                        "start" : 1,
                        "end" : 12,
                        "lastSelectedAngle" : 2 * 3/4 * Math.PI,              
                    },
                    "minute" : {
                        "hand" : {
                            "length" : radius*0.80,
                            "width" : 6,
                            "color" :  "#c82124"
                        },
                        "start" : 1,
                        "end" : 60,
                        "lastSelectedAngle" : 2 * 3/4 * Math.PI,
                    },
                    "second" : {
                        "hand" : {
                            "length" : radius*0.70,
                            "width" : 1,
                            "color" :  "blue"
                        },
                        "start" : 1,
                        "end" : 60,
                        "lastSelectedAngle" : 0
                    }
                }
            }

            this._outputDigHours = document.querySelector(domDigitalSelectors.hours);
            this._outputDigMinutes = document.querySelector(domDigitalSelectors.minutes);

            this._canAndCtxBackground = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.background, this._commonVariables);
            this._canAndCtxDigitsHours = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.digits.hours, this._commonVariables);
            this._canAndCtxDigitsMinutes = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.digits.minutes, this._commonVariables);
            this._canAndCtxHandsHours = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.hands.hours, this._commonVariables);
            this._canAndCtxHandsMinutes = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.hands.minutes, this._commonVariables);
            this._canAndCtxMarkersHours = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.markers.hours, this._commonVariables);
            this._canAndCtxMarkersMinutes = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.markers.minutes, this._commonVariables);

            this._background = new Background(this._canAndCtxBackground.context,this._commonVariables.radius, "rgba(0, 0, 255, 0.3)");

            this._digitsHours = new Digits(this._canAndCtxDigitsHours.context,this._commonVariables.radius, this._commonVariables.time.hour.start, this._commonVariables.time.hour.end );
            this._digitsMinutes = new Digits(this._canAndCtxDigitsMinutes.context,this._commonVariables.radius, this._commonVariables.time.minute.start, this._commonVariables.time.minute.end );

            this._handsHours = new Hand(this._canAndCtxHandsHours, this._commonVariables.time.hour.hand, this._commonVariables.time.hour.start, this._commonVariables.time.hour.end );
            this._handsMinutes = new Hand(this._canAndCtxHandsMinutes,this._commonVariables.time.minute.hand, this._commonVariables.time.minute.start, this._commonVariables.time.minute.end);

            this._markersHours = new Markers(this._canAndCtxMarkersHours.context,this._commonVariables.radius, this._commonVariables.time.hour.start, this._commonVariables.time.hour.end );
            this._markersMinutes = new Markers(this._canAndCtxMarkersMinutes.context,this._commonVariables.radius, this._commonVariables.time.minute.start, this._commonVariables.time.minute.end );

            this._utmostCanvas = this._canAndCtxBackground.canvas.parentElement.lastElementChild;
            this._utmostContext = this._utmostCanvas.getContext("2d");

            this._background.draw();

            this._markersHours.draw();
            this._markersMinutes.draw();

            this._utmostCanvas.addEventListener("mousedown", this.MouseDown.bind(this), false);
            this._utmostCanvas.addEventListener("mousemove", this.MouseMove.bind(this), false);
            this._utmostCanvas.addEventListener("mouseout", this.MouseOut.bind(this), false);
            this._utmostCanvas.addEventListener("mouseup", this.MouseUp.bind(this), false);
            
            this._canAndCtxHandsHours.canvas.addEventListener("onHandDrawedOverNumber", this.NewHour.bind(this), false);
            this._canAndCtxHandsHours.canvas.addEventListener("onAnimationIsPassingNumber", this.NewHour.bind(this), false);            
            this._canAndCtxHandsMinutes.canvas.addEventListener("onHandDrawedOverNumber", this.NewMinute.bind(this), false);
            this._canAndCtxHandsMinutes.canvas.addEventListener("onAnimationIsPassingNumber", this.NewMinute.bind(this), false);

            this._state = "DRAW_INITIAL_TIME";

            this.Statemachine ();
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

        GetAngle (mousePos) {

            let rad = 0;
            let aWholeRound = 2 * Math.PI;

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
            rad += aWholeRound;

            return {"rad":rad, "deg":rad*360/(2*Math.PI)};
        }

        ClearDynamicCanvas () {            
            this._digitsHours.clear();
            this._digitsMinutes.clear();

            //this._handsHours.clear();
            //this._handsMinutes.clear();
        }

        Statemachine ( ) {
            
            switch (this._state) {
                case "DRAW_INITIAL_TIME":
                    this.ClearDynamicCanvas ()

                    this._digitsHours.Draw();
                    
                    this._handsHours.drawAngle(this._commonVariables.time.hour.lastSelectedAngle, true);    
                    this._handsMinutes.drawAngle(this._commonVariables.time.minute.lastSelectedAngle, true);
                    
                    this._state = "SELECT_HOUR_PREPARE";
                break;

                case "SELECT_HOUR_PREPARE":
                
                    this.ClearDynamicCanvas ()

                    this._digitsHours.Draw();

                    this._handsHours.drawAngle(this._commonVariables.time.hour.lastSelectedAngle, true);
                    
                    this._state = "SELECT_HOUR";
                break;

                case "SELECT_HOUR":
                    let endAngleH = this.GetAngle( this._commonVariables.mouse.position.end ? this._commonVariables.mouse.position.end : this._commonVariables.mouse.position.start );
                    this._commonVariables.time.hour.lastSelectedAngle = this._handsHours.closestDefinedNumberAndAngle(endAngleH.rad).angle;

                    if ( this._commonVariables.mouse.dragging ) {
                        
                        this._handsHours.drawAngle(this._commonVariables.time.hour.lastSelectedAngle, true);
                    } else {
                        this._handsHours.drawAngle(this._commonVariables.time.hour.lastSelectedAngle, true);
                        this._state = "SELECT_MINUTE_PREPARE";
                        this.Statemachine();
                    }

                break;
                
                case "SELECT_MINUTE_PREPARE":
                
                    this.ClearDynamicCanvas ()

                    this._digitsMinutes.Draw();
                    
                    this._handsMinutes.drawAngle(this._commonVariables.time.minute.lastSelectedAngle, true);

                    this._state = "SELECT_MINUTE";
                    
                break;

                case "SELECT_MINUTE":
                    let endAngleM = this.GetAngle( this._commonVariables.mouse.position.end ? this._commonVariables.mouse.position.end : this._commonVariables.mouse.position.start );
                    this._commonVariables.time.minute.lastSelectedAngle = this._handsMinutes.closestDefinedNumberAndAngle(endAngleM.rad).angle;
                    if ( this._commonVariables.mouse.dragging ) {
                        
                        this._handsMinutes.drawAngle(this._commonVariables.time.minute.lastSelectedAngle, true);
                    } else {
                        this._handsMinutes.drawAngle(this._commonVariables.time.minute.lastSelectedAngle, true);
                        this._state = "DRAW_INITIAL_TIME";
                        this.Statemachine();
                    }
                break;
            }            
        }

        MouseDown( e ) {
            this._commonVariables.mouse.dragging = true;
            this._commonVariables.mouse.position.start = this.GetTranslatedMousePosition( e , this._commonVariables);
            this._commonVariables.mouse.position.end = null;
            this.Statemachine ();
        }

        MouseMove( e ){
            if ( this._commonVariables.mouse.dragging ) {
                this._commonVariables.mouse.position.end = this.GetTranslatedMousePosition( e , this._commonVariables);
                this.Statemachine ();
            } else {
                var p = this.GetMousePos( e , this._commonVariables);
                
                switch (true){
                    case this._handsHours.mouseIsOver(p):
                        this._state = "SELECT_HOUR_PREPARE";                  
                        this.Statemachine();
                        break;
                    
                    case this._handsMinutes.mouseIsOver(p):
                        this._state = "SELECT_MINUTE_PREPARE";                        
                        this.Statemachine();
                        break;

                    default:
                        this._state = "SELECT_HOUR_PREPARE";
                        this.Statemachine();
                }
            }
        }

        MouseOut ( e ) {
            this._commonVariables.mouse.dragging = false;
        }

        MouseUp( e ) {            
            this._commonVariables.mouse.dragging = false;
            this._commonVariables.mouse.position.end = this.GetTranslatedMousePosition( e , this._commonVariables);
            this.Statemachine ();
        }

        NewMinute (e) {
            this._outputDigMinutes.innerHTML = e.detail.passedNumber < 10 ? '0' + e.detail.passedNumber : e.detail.passedNumber;
        }

        NewHour (e) {
            this._outputDigHours.innerHTML = e.detail.passedNumber < 10 ? '0' + e.detail.passedNumber : e.detail.passedNumber;
        }        
    }