'use strict';
class Hand {

    // Constructor
    constructor (canAndCtx, hand, minNum, maxNum) {
        this._canAndCtx = canAndCtx;
        this._hand = hand;
        
        this._canAndCtx.context.strokeStyle = hand.color;

        this._lastDrawnNumber = 0;
        this._lastRegisteredDirectionWasClockwise = false;

        this._minNum = minNum;
        this._maxNum = maxNum;

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
        this._angleAnimation = 2 * Math.PI / 72;
    }
    
    clear () {            
        let context = this._canAndCtx.context;
        let width = context.width;
        let height = context.height;

        //clear the entire area
        context.clearRect(0-width/2, 0-height/2, width, height);
    }

    mouseIsOver (mousePosition) {
        var pixel = this._canAndCtx.context.getImageData(mousePosition.x, mousePosition.y, 1, 1);
        var rgb = pixel.data;
        return this._canAndCtx.context.strokeStyle === '#' + ((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]).toString(16);
    }

    handLinePoints(angle) {
        //returns drawing coordinates for a hand

        let startPosition = {
            "x" : 0 - 0.1*this._hand.length*Math.cos(angle), 
            "y": 0 - 0.1*this._hand.length*Math.sin(angle)
        };

        let endPosition = {
            "x" : this._hand.length*Math.cos(angle), 
            "y": this._hand.length*Math.sin(angle)
        }

        return {
            "sP" : startPosition,
            "eP" : endPosition
        }
    }

    raiseAnimationFinished () {
        var event = new CustomEvent(
            "onAnimationFinished", 
            {
                "detail": {
                    "done": true
                },
                "bubbles": true,
                "cancelable": true
            }
        )
        this._canAndCtx.canvas.dispatchEvent(event);
    }
    
    raiseHandDrawedOverNumber (number, isMovingClockwise){
        var event = new CustomEvent(
            "onHandDrawedOverNumber", 
            {
                "detail": {
                    "passedNumber" : number,
                    "isMovingClockwise" : isMovingClockwise
                },
                "bubbles": true,
                "cancelable": true
            }
        )            
        this._canAndCtx.canvas.dispatchEvent(event);
    }    

    angle(number) {
        let length = this._numbersAndAngles.length;
        
        for( let i = 0; i < length; i++ ) {
            if (this._numbersAndAngles[i].number === number) {
                return this._numbersAndAngles[i].angle;
            }
        }
        return null;
    }

    drawNumber (number) {
        angle = this.angle(number);
        return drawAngle (angle);
    }

    handIsMovingClockwise(lastDrawnNumber, numberToDraw) {        
        var isMovingClockwise = false;
        var isPassingDay = Math.abs(lastDrawnNumber - numberToDraw) > 1;
        if (isPassingDay) {
            isMovingClockwise = lastDrawnNumber > numberToDraw;
        } else {
            
            isMovingClockwise = lastDrawnNumber == numberToDraw ? this._lastRegisteredDirectionWasClockwise :lastDrawnNumber < numberToDraw;
        }
        this._lastRegisteredDirectionWasClockwise = isMovingClockwise;
        return isMovingClockwise;
    }

    drawAngle (angle) {
        this.clear();

        this._canAndCtx.context.beginPath();
        this._canAndCtx.context.lineWidth = this._hand.width;
        this._canAndCtx.context.lineCap = "round";

        let hLP = this.handLinePoints(angle);

        this._canAndCtx.context.moveTo(hLP.sP.x, hLP.sP.y);
        this._canAndCtx.context.lineTo(hLP.eP.x, hLP.eP.y);
        
        this._canAndCtx.context.stroke();
        
        let number = this.closestDefinedNumberAndAngle(angle).number;
        let isMovingClockwise = this.handIsMovingClockwise(this._lastDrawnNumber, number);
        this._lastDrawnNumber = number;
        this.raiseHandDrawedOverNumber(number, isMovingClockwise);
    }

    closestDefinedNumberAndAngle(realAngle) {
        let i = 0;
        let iMax = this._numbersAndAngles.length;
        let isBetween = false;

        while( !isBetween && i < iMax ) {
            let nA0 = this._numbersAndAngles[i]
            let nA1 = this._numbersAndAngles[i+1]

            isBetween = nA0.angle <= realAngle && realAngle < nA1.angle;

            if ( isBetween ) {
                let nAAverage = ( nA0.angle + nA1.angle) / 2;
                if ( realAngle < nAAverage ) {
                    return nA0;
                } else {
                    return nA1;
                }
            }
            i++;
        }
        return null;
    }

    animateNumber(startNumber, endNumber) {
        let startAngle = this.angle(startNumber);
        let endAngle = this.angle(endNumber);
        this.animate(startAngle, endAngle);
    }

    animate(startAngle, endAngle) {
        
        var self = this;
        let animate_inner;

        let smallestDiffBetweenAngles = Math.atan2(Math.sin(endAngle-startAngle), Math.cos(endAngle-startAngle));
        let rotateClockwise = smallestDiffBetweenAngles > 0;
        let willPassZeroAngle = ( rotateClockwise && ( startAngle > endAngle )) || ( !rotateClockwise && ( startAngle < endAngle ));

        startAngle = ( !rotateClockwise && willPassZeroAngle ) ? startAngle + 2 * Math.PI : startAngle;
        endAngle = ( rotateClockwise && willPassZeroAngle ) ? endAngle + 2 * Math.PI : endAngle;

        let nextAngle = function (curAngle, endAngle) {
            let nextAngleCandidate;

            if( rotateClockwise ) {
                //clockwise
                //should we stop?
                nextAngleCandidate = ( 
                    curAngle === endAngle ? null : ( 
                        curAngle + self._angleAnimation < endAngle ? 
                            curAngle + self._angleAnimation : endAngle
                    )
                )                    
            } else {
                //counterclockwise
                //should we stop?
                nextAngleCandidate = (
                    curAngle === endAngle ? null : ( 
                        curAngle - self._angleAnimation > endAngle ? 
                            curAngle - self._angleAnimation : endAngle
                    )
                )
            }
            return nextAngleCandidate;
        }

        let  curAngle = startAngle;

        animate_inner = function () {

            let raiseHandDrawedOverNumber = true;
            self.drawAngle(curAngle);
            let angleToDraw = nextAngle(curAngle, endAngle);

            //are we done?
            if (angleToDraw && !isNaN(angleToDraw)) {
                //nope...
                curAngle = angleToDraw;
                requestAnimationFrame(function () {
                    animate_inner();
                });
            } else {
                //yes, we're done
                self.raiseAnimationFinished();
            }
        }
        var requestID = requestAnimationFrame(animate_inner);
    }
}