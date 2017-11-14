'use strict';
class Markers {
    // Constructor
    constructor (ctx, markerWidth, markerFillStyle, radius, minNum, maxNum, drawInterval) {
        
        this._ctx = ctx;
        this._markerFillStyle = markerFillStyle;
        this._markerWidth = markerWidth;
        this._markerHighlightWidth = markerWidth*5;

        //some default values
        this._ctx.lineWidth = markerWidth;
        this._ctx.lineCap = "round";

        this._radius = radius;

        this._minNum = minNum;
        this._maxNum = maxNum;

        this._drawInterval = drawInterval ? drawInterval : 1;

        this._numbersAndAngles =  (function (totNum) {
            
            function getNumbersAndAngles (totNum){

                let angleBetweenNumbers =  2 * Math.PI / totNum
                let numbersAndAngles = [];

                let aWholeRound = 2 * Math.PI;

                for ( let r = 0; r < 2; r++) {
                    for ( let i = 0; i < totNum ; i++){
                        let number = i;

                        let angle = number < (totNum/4) ? (3/2*Math.PI) + angleBetweenNumbers*number : aWholeRound + angleBetweenNumbers*(number-totNum/4);
                        angle += r*2*Math.PI;
                        
                        let correspondingNumberAndAngle = {"number": number, "angle": angle};

                        numbersAndAngles.push(correspondingNumberAndAngle);
                    }
                }                
                return numbersAndAngles;    
            }
            return getNumbersAndAngles(totNum);
        })((maxNum - minNum) + 1);
    }
    
    clear(){
        //clear the entire area
        var width = this._ctx.width;
        var height = this._ctx.height;
        this._ctx.clearRect(0-width/2, 0-height/2, width, height);
    }

    angle(number) {
        let length = this._numbersAndAngles.length;
        
        for( let i = 0; i < length; i++ ) {
            if(this._numbersAndAngles[i].number === number) {
                return this._numbersAndAngles[i].angle;
            }
        }
        return null;
    }

    markerLinePoints(angle) {
        //returns drawing coordinates for a marker
        let startPosition = {
            "x" : (1-0.05)*this._radius*Math.cos(angle), 
            "y": (1-0.05)*this._radius*Math.sin(angle)
        };

        let endPosition = {
            "x" : this._radius*Math.cos(angle), 
            "y": this._radius*Math.sin(angle)
        }

        return {
            "sP" : startPosition,
            "eP" : endPosition
        }
    }

    drawAngle (angle, highlight)  {
        //draws a single marker           
        this._ctx.beginPath();

        let hLP = this.markerLinePoints(angle);
        
        this._ctx.lineWidth = highlight ? this._markerHighlightWidth : this._markerWidth; 
        this._ctx.moveTo(hLP.sP.x, hLP.sP.y);
        this._ctx.lineTo(hLP.eP.x, hLP.eP.y);
        
        this._ctx.stroke();
    }

    draw(highlightNumber) {

        //draws every marker
        for(var num = this._minNum - 1; num < ( this._maxNum + 1 ) - 1; num++){

            var angle = this.angle(num);
            let highlight = highlightNumber == num;

            this.drawAngle (angle, highlight);
        }
    }
}