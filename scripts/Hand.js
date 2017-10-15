'use strict';
class Hand {

    // Constructor
    constructor (canAndCtx, hand, minNum, maxNum) {
        this._canAndCtx = canAndCtx;
        this._hand = hand;
        
        this._canAndCtx.context.strokeStyle = hand.color;

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
        var width = context.width;
        var height = context.height;

        //clear the entire area
        context.clearRect(0-width/2, 0-height/2, width, height);
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

    raiseAnimationIsPassingNumber (number){
        var event = new CustomEvent(
            "onAnimationIsPassingNumber", 
            {
                "detail": {
                    "passedNumber": number
                },
                "bubbles": true,
                "cancelable": true
            }
        )            
        this._canAndCtx.canvas.dispatchEvent(event);
    }
    
    raiseHandDrawedOverNumber (number){
        var event = new CustomEvent(
            "onHandDrawedOverNumber", 
            {
                "detail": {
                    "passedNumber": number
                },
                "bubbles": true,
                "cancelable": true
            }
        )            
        this._canAndCtx.canvas.dispatchEvent(event);
    }    

    angle(number) {
        let length = self._numbersAndAngles.length;
        
        for( let i = 0; i < length; i++ ) {
            if(self._numbersAndAngles[i].number === number) {
                return self._numbersAndAngles[i].angle;
            }
        }
        return null;
    }

    drawNumber (number, raiseHandDrawedOverNumberEvent) {
        angle = this.angle(number);
        return drawAngle (angle, raiseHandDrawedOverNumberEvent);
    }

    drawAngle (angle, raiseHandDrawedOverNumberEvent) {
        this.clear();

        this._canAndCtx.context.beginPath();
        this._canAndCtx.context.lineWidth = this._hand.width;
        this._canAndCtx.context.lineCap = "round";

        let hLP = this.handLinePoints(angle);

        this._canAndCtx.context.moveTo(hLP.sP.x, hLP.sP.y);
        this._canAndCtx.context.lineTo(hLP.eP.x, hLP.eP.y);
        
        this._canAndCtx.context.stroke();
        if (raiseHandDrawedOverNumberEvent) {
            let number = this.closestDefinedNumberAndAngle(angle).number;
            this.raiseHandDrawedOverNumber(number);
        }
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

    animate(startAngle, endAngle) {
        
        var self = this;
        let animate_inner;

        let smallestDiffBetweenAngles = Math.atan2(Math.sin(endAngle-startAngle), Math.cos(endAngle-startAngle));
        let rotateClockwise = smallestDiffBetweenAngles > 0;
        let willPassZeroAngle = ( rotateClockwise && ( startAngle > endAngle )) || ( !rotateClockwise && ( startAngle < endAngle ));

        startAngle = ( !rotateClockwise && willPassZeroAngle ) ? startAngle + 2 * Math.PI : startAngle;
        endAngle = ( rotateClockwise && willPassZeroAngle ) ? endAngle + 2 * Math.PI : endAngle;

        let willPassNumber = function (angleBeforeHandPass, angleAfterHandPass){
            let length = self._numbersAndAngles.length;
        
            //angleAfterHandPass = angleAfterHandPass - parseInt( angleAfterHandPass / ( 2 * Math.PI ) ) * ( 2 * Math.PI );
            let minAngle = Math.min(angleBeforeHandPass, angleAfterHandPass);
            let maxAngle = Math.max(angleBeforeHandPass, angleAfterHandPass);
            for( let i = 0; i < length; i++ ) {
                let number = self._numbersAndAngles[i].number;
                let angle = self._numbersAndAngles[i].angle;
                if ( (minAngle < angle && angle < maxAngle) || ( rotateClockwise && ( angleBeforeHandPass > angleAfterHandPass )) || ( !rotateClockwise && ( angleBeforeHandPass < angleAfterHandPass )) ){
                    //passing number
                    return number;
                }
            }
            return null;
        }

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
            let raiseHandDrawedOverNumber = false;
            self.drawAngle(curAngle, raiseHandDrawedOverNumber);
            let angleToDraw = nextAngle(curAngle, endAngle);

            //are we done
            if (angleToDraw && !isNaN(angleToDraw)) {
                
                let numberPassed = willPassNumber(curAngle, angleToDraw);
                if ( numberPassed > 0 ) raiseAnimationIsPassingNumber( numberPassed );
                curAngle = angleToDraw;
                requestAnimationFrame(function () {
                    animate_inner();
                });
            }
        }  

        var requestID = requestAnimationFrame(animate_inner);
    }
}