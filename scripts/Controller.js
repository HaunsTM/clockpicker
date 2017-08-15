'use strict';
    class Controller {
        
        // Constructor
        constructor (domBackground, domDigits, domHands, canWidth, canHeight, radius, handLength, handLineWidth, minNum, maxNum) {
            this._canAndCtxBackground = this.SizedAndCenteredOrigoCanvasAndContext(domBackground, canWidth, canHeight);
            this._canAndCtxDigits = this.SizedAndCenteredOrigoCanvasAndContext(domDigits, canWidth, canHeight);
            this._canAndCtxHands = this.SizedAndCenteredOrigoCanvasAndContext(domHands, canWidth, canHeight);

            this._radius = radius;
            this._length = handLength;
            this._handLineWidth= handLineWidth;
            this._minNum = minNum;
            this._maxNum = maxNum;

            this._background = new Background(this._canAndCtxBackground.context,this._radius, this._minNum, this._maxNum );            
            this._digits = new Digits(this._canAndCtxDigits.context,this._radius, this._minNum, this._maxNum );

            this.DrawCanvas();
            this._canAndCtxHands.canvas.addEventListener("mousemove", this.MoveHand.bind(this),  false);
        }
        
        SizedAndCenteredOrigoCanvasAndContext ( domSelector, width, height ) {        
            var curCanvas = document.querySelector( domSelector );        
            var curContext = curCanvas.getContext("2d");      
            curCanvas.width = width;
            curCanvas.height = height;  

            curContext.translate(width/2, height/2);        
            curContext.width = width;
            curContext.height = height;
            
            return { "selector" : domSelector,
                     "canvas" : curCanvas,
                     "context" : curContext }
        }
        
        DrawCanvas(){ 
            this._background.Draw();
            this._digits.Draw();
        }
        
        GetMousePos(canvasAndContext, evt) {

            return {
                x: (e.clientX - rect.left - translateX) / scaleFillNative,
                y:  (e.clientY - rect.top - translateY) / scaleFillNative
            };
        }


        MoveHand(mouseEvent){
            // http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
            var mousePos = this.GetMousePos(this._canAndCtxHands.canvas, mouseEvent)
            
            console.log('(x:' + mousePos.x + ', y:' + mousePos.y + ')');
        }
    }
