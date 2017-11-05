'use strict';
    class Controller {
        
        // Constructor
        constructor (domAnalogSelectors, domDigitalSelectors, canWidth, canHeight, radius) {

            this._radius = radius;

            this._canvas = {
                "width" : canWidth,
                "height" : canHeight
            };

            this._context = {       
                "width" : canWidth,
                "height" : canHeight,
                "translation" : {
                    "initial" : {
                        "x" : canWidth / 2,
                        "y" : canHeight / 2
                    }
                }
            };

            this._mouse = {
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
            };

            this._time = {
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
            };

            this._outputDigHours = document.querySelector(domDigitalSelectors.hours);
            this._outputDigMinutes = document.querySelector(domDigitalSelectors.minutes);

            this._canAndCtxBackground = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.background);
            this._canAndCtxDigitsHours = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.digits.hours);
            this._canAndCtxDigitsMinutes = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.digits.minutes);
            this._canAndCtxHandsHours = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.hands.hours);
            this._canAndCtxHandsMinutes = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.hands.minutes);
            this._canAndCtxMarkersHours = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.markers.hours);
            this._canAndCtxMarkersMinutes = this.SizedAndCenteredOrigoCanvasAndContext(domAnalogSelectors.markers.minutes);

            this._background = new Background(this._canAndCtxBackground.context,this._radius, "rgba(0, 0, 255, 0.3)");

            this._digitsHours = new Digits(this._canAndCtxDigitsHours.context,this._radius, this._time.hour.start, this._time.hour.end );
            this._digitsMinutes = new Digits(this._canAndCtxDigitsMinutes.context,this._radius, this._time.minute.start, this._time.minute.end );

            this._handsHours = new Hand(this._canAndCtxHandsHours, this._time.hour.hand, this._time.hour.start, this._time.hour.end );
            this._handsMinutes = new Hand(this._canAndCtxHandsMinutes,this._time.minute.hand, this._time.minute.start, this._time.minute.end);

            let markerHoursWidth  = "4";
            let markerHoursFillStyle = "red";
            let drawMarkerIntervalHours = "1";

            let markerMinutesWidth = "2";
            let markerMinutesFillStyle = "black";
            let drawMarkerIntervalMinutes =  "5";

           // ctx, markerWidth, markerFillStyle, radius, minNum, maxNum, drawInterval

            this._markersHours = new Markers(this._canAndCtxMarkersHours.context, markerHoursWidth, markerHoursFillStyle, this._radius, this._time.hour.start, this._time.hour.end );
            this._markersMinutes = new Markers(this._canAndCtxMarkersMinutes.context, markerMinutesWidth, markerMinutesFillStyle, this._radius, this._time.minute.start, this._time.minute.end, drawMarkerIntervalMinutes );

            this._utmostCanvas = this._canAndCtxBackground.canvas.parentElement.lastElementChild;
            this._utmostContext = this._utmostCanvas.getContext("2d");

            this._background.draw();

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

        SizedAndCenteredOrigoCanvasAndContext (domSelector) {
            let curCanvas = document.querySelector( domSelector );
            let curContext = curCanvas.getContext("2d");

            curCanvas.width = this._canvas.width;
            curCanvas.height = this._canvas.height;

            curContext.translate(this._context.translation.initial.x, this._context.translation.initial.y);        
            curContext.width = this._context.width;
            curContext.height = this._context.height;
            
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
        
        GetTranslatedMousePosition(e) {            
            var mousePos = this.GetMousePos(e);
            
            return {
                x: mousePos.x - this._context.translation.initial.x,
                y: this._context.translation.initial.y - mousePos.y
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

            return rad;
        }

        ClearDynamicCanvas () {            
            //this._digitsHours.clear();
            //this._digitsMinutes.clear();

            //this._markersHours.clear();
            this._markersMinutes.clear();
        }

        Statemachine ( ) {
            
            switch (this._state) {
                case "DRAW_INITIAL_TIME":
                    this.ClearDynamicCanvas ()

                    this._digitsHours.Draw();
                    this._markersHours.draw();
                    
                    this._handsHours.drawAngle(this._time.hour.lastSelectedAngle, true);    
                    this._handsMinutes.drawAngle(this._time.minute.lastSelectedAngle, true);
                    
                    this._state = "SELECT_HOUR_PREPARE";
                break;

                case "SELECT_HOUR_PREPARE":
                
                    this.ClearDynamicCanvas ()

                    this._markersHours.draw();

                    this._handsHours.drawAngle(this._time.hour.lastSelectedAngle, true);
                    
                    this._state = "SELECT_HOUR";
                break;

                case "SELECT_HOUR":
                let endAngleH = this.GetAngle( this._mouse.position.end ? this._mouse.position.end : this._mouse.position.start );
                    this._time.hour.lastSelectedAngle = this._handsHours.closestDefinedNumberAndAngle(endAngleH).angle;

                    if ( this._mouse.dragging ) {
                        
                        this._handsHours.drawAngle(this._time.hour.lastSelectedAngle, true);
                    } else {
                        this._handsHours.drawAngle(this._time.hour.lastSelectedAngle, true);
                        this._state = "SELECT_MINUTE_PREPARE";
                        this.Statemachine();
                    }

                break;
                
                case "SELECT_MINUTE_PREPARE":
                
                    this.ClearDynamicCanvas ();

                    //this._digitsMinutes.Draw();
                    
                    this._markersMinutes.draw();
                    
                    this._handsMinutes.drawAngle(this._time.minute.lastSelectedAngle, true);

                    this._state = "SELECT_MINUTE";
                    
                break;

                case "SELECT_MINUTE":
                    let endAngleM = this.GetAngle( this._mouse.position.end ? this._mouse.position.end : this._mouse.position.start );
                    this._time.minute.lastSelectedAngle = this._handsMinutes.closestDefinedNumberAndAngle(endAngleM).angle;
                    if ( this._mouse.dragging ) {
                        this.ClearDynamicCanvas ();
                        let curNumber = this._handsMinutes.closestDefinedNumberAndAngle(endAngleM).number;
                        this._markersMinutes.draw(curNumber);
                        
                        this._handsMinutes.drawAngle(this._time.minute.lastSelectedAngle, true);
                    } else {
                        this._handsMinutes.drawAngle(this._time.minute.lastSelectedAngle, true);
                        this._state = "DRAW_INITIAL_TIME";
                        this.Statemachine();
                    }
                break;
            }            
        }

        MouseDown( e ) {
            this._mouse.dragging = true;
            this._mouse.position.start = this.GetTranslatedMousePosition( e );
            this._mouse.position.end = null;
            this.Statemachine ();
        }

        MouseMove( e ){
            if ( this._mouse.dragging ) {
                this._mouse.position.end = this.GetTranslatedMousePosition( e );
                this.Statemachine ();
            } else {
                var p = this.GetMousePos( e );
                
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
            //occurs when mouse leaves canvas area
            this._mouse.dragging = false;
        }

        MouseUp( e ) {            
            this._mouse.dragging = false;
            this._mouse.position.end = this.GetTranslatedMousePosition( e );
            this.Statemachine ();
        }

        NewMinute (e) {
            this._outputDigMinutes.innerHTML = e.detail.passedNumber < 10 ? '0' + e.detail.passedNumber : e.detail.passedNumber;
        }

        NewHour (e) {
            this._outputDigHours.innerHTML = e.detail.passedNumber < 10 ? '0' + e.detail.passedNumber : e.detail.passedNumber;
        }        
    }