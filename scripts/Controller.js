'use strict';
    class Controller {
        
        // Constructor
        constructor (dom, settings) {

            this._initialEventsToWaitFor = 2;

            this._radius = Math.max(settings.canvas.width, settings.canvas.height)/2;

            this._canvas = {
                "width" : settings.canvas.width,
                "height" : settings.canvas.height
            };

            this._context = {       
                "width" : settings.canvas.width,
                "height" : settings.canvas.height,
                "translation" : {
                    "initial" : {
                        "x" : settings.canvas.width / 2,
                        "y" : settings.canvas.height / 2
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
                        "length" : this._radius*0.50,
                        "width" : settings.hour.hand.width,
                        "color" :  settings.hour.hand.color,
                    },
                    "start" : settings.hour.start,
                    "end" : settings.hour.end,
                    "lastSavedValue" : settings.hour.lastSavedValue,
                    "lastSelectedAngle" : 2 * 3/4 * Math.PI,              
                },
                "minute" : {
                    "hand" : {
                        "length" : this._radius*0.80,
                        "width" : settings.minute.hand.width,
                        "color" :  settings.minute.hand.color,
                    },
                    "start" : settings.minute.start,
                    "end" : settings.minute.end,
                    "lastSavedValue" : settings.minute.lastSavedValue,
                    "lastSelectedAngle" : 2 * 3/4 * Math.PI,
                }
            };

            this._outputDigHours = document.querySelector(dom.selector.digital.hours);
            this._outputDigMinutes = document.querySelector(dom.selector.digital.minutes);

            this._canAndCtxBackground = this.SizedAndCenteredOrigoCanvasAndContext(dom.selector.analog.background);
            this._canAndCtxDigitsHours = this.SizedAndCenteredOrigoCanvasAndContext(dom.selector.analog.digits.hours);
            this._canAndCtxDigitsMinutes = this.SizedAndCenteredOrigoCanvasAndContext(dom.selector.analog.digits.minutes);
            this._canAndCtxHandsHours = this.SizedAndCenteredOrigoCanvasAndContext(dom.selector.analog.hands.hours);
            this._canAndCtxHandsMinutes = this.SizedAndCenteredOrigoCanvasAndContext(dom.selector.analog.hands.minutes);
            this._canAndCtxMarkersHours = this.SizedAndCenteredOrigoCanvasAndContext(dom.selector.analog.markers.hours);
            this._canAndCtxMarkersMinutes = this.SizedAndCenteredOrigoCanvasAndContext(dom.selector.analog.markers.minutes);

            this._background = new Background(this._canAndCtxBackground.context,this._radius, settings.background.color);

            this._digitsHours = new Digits(this._canAndCtxDigitsHours.context,this._radius, this._time.hour.start, this._time.hour.end );
            this._digitsMinutes = new Digits(this._canAndCtxDigitsMinutes.context,this._radius, this._time.minute.start, this._time.minute.end );

            this._handsHours = new Hand(this._canAndCtxHandsHours, this._time.hour.hand, this._time.hour.start, this._time.hour.end );
            this._handsMinutes = new Hand(this._canAndCtxHandsMinutes,this._time.minute.hand, this._time.minute.start, this._time.minute.end);

            this._markersHours = new Markers(this._canAndCtxMarkersHours.context, settings.hour.marker.width, settings.hour.marker.color, this._radius, this._time.hour.start, this._time.hour.end, settings.hour.marker.drawInterval);
            this._markersMinutes = new Markers(this._canAndCtxMarkersMinutes.context, settings.minute.marker.width, settings.minute.marker.color, this._radius, this._time.minute.start, this._time.minute.end, settings.hour.marker.width, settings.minute.marker.drawInterval );

            this._utmostCanvas = this._canAndCtxBackground.canvas.parentElement.lastElementChild;
            this._utmostContext = this._utmostCanvas.getContext("2d");

            this._state = "DRAW_INITIAL_TIME";

            this._canAndCtxHandsHours.canvas.addEventListener("onHandDrawedOverNumber", this.newHour.bind(this), false);
            this._canAndCtxHandsMinutes.canvas.addEventListener("onHandDrawedOverNumber", this.newMinute.bind(this), false);

            this.statemachine ();
        }
        
        initialExpectedAnimationEventOccurred () {

            this._initialEventsToWaitFor --;

            if (this._initialEventsToWaitFor < 1) {
                this.addCanvasEventListeners();
            }
        }

        addCanvasEventListeners() {
            
            this._utmostCanvas.addEventListener("mousedown", this.MouseDown.bind(this), false);
            this._utmostCanvas.addEventListener("mousemove", this.MouseMove.bind(this), false);
            this._utmostCanvas.addEventListener("mouseout", this.MouseOut.bind(this), false);
            this._utmostCanvas.addEventListener("mouseup", this.MouseUp.bind(this), false);
            
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
        
        getMousePos(e) {

            var rect = this._utmostCanvas.getBoundingClientRect();

            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
        
        getTranslatedMousePosition(e) {            
            var mousePos = this.getMousePos(e);
            
            return {
                x: mousePos.x - this._context.translation.initial.x,
                y: this._context.translation.initial.y - mousePos.y
            }
        }

        getAngle (mousePos) {

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

        clearDynamicCanvas () {
            this._markersMinutes.clear();
        }

        statemachine ( ) {
            
            switch (this._state) {
                case "DRAW_INITIAL_TIME":
                    this.clearDynamicCanvas ()

                    this._background.draw();

                    this._digitsHours.Draw();
                    this._markersHours.draw();                    
                    
                    this._canAndCtxHandsHours.canvas.addEventListener("onAnimationFinished", this.initialExpectedAnimationEventOccurred.bind(this), false);
                    this._canAndCtxHandsHours.canvas.addEventListener("onAnimationFinished", this.initialExpectedAnimationEventOccurred.bind(this), false);
                    
                    this._handsHours.animateNumber(0, this._time.hour.lastSavedValue);
                    this._handsMinutes.animateNumber(0, this._time.minute.lastSavedValue);
                    this._time.hour.lastSelectedAngle = this._handsHours.angle(this._time.hour.lastSavedValue);
                    this._time.minute.lastSelectedAngle = this._handsMinutes.angle(this._time.minute.lastSavedValue);
                    
                    this._state = "SELECT_HOUR_PREPARE";
                break;

                case "SELECT_HOUR_PREPARE":
                
                    this.clearDynamicCanvas ()

                    this._markersHours.draw();

                    this._handsHours.drawAngle(this._time.hour.lastSelectedAngle);
                    
                    this._state = "SELECT_HOUR";
                break;

                case "SELECT_HOUR":
                    let endAngleH = this.getAngle( this._mouse.position.end ? this._mouse.position.end : this._mouse.position.start );
                    this._time.hour.lastSelectedAngle = this._handsHours.closestDefinedNumberAndAngle(endAngleH).angle;

                    if ( this._mouse.dragging ) {                        
                        this._handsHours.drawAngle(this._time.hour.lastSelectedAngle);
                    } else {
                        this._handsHours.drawAngle(this._time.hour.lastSelectedAngle);
                        this._state = "SELECT_MINUTE_PREPARE";
                        this.statemachine();
                    }

                break;
                
                case "SELECT_MINUTE_PREPARE":
                
                    this.clearDynamicCanvas ();

                    this._markersMinutes.draw();
                    
                    this._handsMinutes.drawAngle(this._time.minute.lastSelectedAngle);

                    this._state = "SELECT_MINUTE";
                    
                break;

                case "SELECT_MINUTE":
                    let endAngleM = this.getAngle( this._mouse.position.end ? this._mouse.position.end : this._mouse.position.start );
                    this._time.minute.lastSelectedAngle = this._handsMinutes.closestDefinedNumberAndAngle(endAngleM).angle;
                    if ( this._mouse.dragging ) {
                        this.clearDynamicCanvas ();
                        let curNumber = this._handsMinutes.closestDefinedNumberAndAngle(endAngleM).number;
                        this._markersMinutes.draw(curNumber);
                        
                        this._handsMinutes.drawAngle(this._time.minute.lastSelectedAngle);
                    } else {
                        this._handsMinutes.drawAngle(this._time.minute.lastSelectedAngle);
                        this._state = "SELECT_HOUR_PREPARE";
                        this.statemachine();
                    }
                break;
            }            
        }

        MouseDown( e ) {
            this._mouse.dragging = true;
            this._mouse.position.start = this.getTranslatedMousePosition( e );
            this._mouse.position.end = null;
            this.statemachine ();
        }

        MouseMove( e ){
            if ( this._mouse.dragging ) {
                this._mouse.position.end = this.getTranslatedMousePosition( e );
                this.statemachine ();
            } else {
                var p = this.getMousePos( e );
                
                switch (true){
                    case this._handsHours.mouseIsOver(p):
                        this._state = "SELECT_HOUR_PREPARE";                  
                        this.statemachine();
                        break;
                    
                    case this._handsMinutes.mouseIsOver(p):
                        this._state = "SELECT_MINUTE_PREPARE";                        
                        this.statemachine();
                        break;

                    default:
                        this._state = "SELECT_HOUR_PREPARE";
                        this.statemachine();
                }
            }
        }

        MouseOut ( e ) {
            //occurs when mouse leaves canvas area
            this._mouse.dragging = false;
        }

        MouseUp( e ) {            
            this._mouse.dragging = false;
            this._mouse.position.end = this.getTranslatedMousePosition( e );
            this.statemachine ();
        }

        newMinute (e) {
            this._outputDigMinutes.innerHTML = e.detail.passedNumber < 10 ? '0' + e.detail.passedNumber : e.detail.passedNumber;
        }

        newHour (e) {
            this._outputDigHours.innerHTML = e.detail.passedNumber < 10 ? '0' + e.detail.passedNumber : e.detail.passedNumber;
        }        
    }