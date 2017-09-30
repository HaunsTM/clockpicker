'use strict';
class Hand {

        // Constructor
        constructor (canAndCtx, hand, minNum, maxNum) {
            this._canAndCtx = canAndCtx;
            this._hand = hand;
            this._minNum = minNum;
            this._maxNum = maxNum;
            this._numbersAndAngles =  (function (totNum) {

                function getNumbersAndAngles (totNum){

                    let angleBetweenNumbers =  2 * Math.PI / totNum
                    let numbersAndAngles = [];

                    for ( let r = 0; r < 2; r++) {
                        for ( let i = 0; i < totNum ; i++){
                            let number = i+1;
    
                            let angle = number < (totNum/4) ? (3/2*Math.PI) + angleBetweenNumbers*(i+1) : angleBetweenNumbers*((i+1)-totNum/4)
                            angle += r*2*Math.PI;
                            
                            //rad = rad - parseInt( rad / ( 2 * Math.PI ) ) * ( 2 * Math.PI );
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

        drawAngle (angle) {
            this.clear();
            let context = this._canAndCtx.context;

            context.beginPath();
            context.lineWidth = this._hand.width;
            context.lineCap = "round";

            context.moveTo(0,0);
            context.lineTo(this._hand.length*Math.cos(angle), this._hand.length*Math.sin(angle));
            context.stroke();
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
                        //debugger;
                        //passing number
                        return number;
                    }
                }
                return null;
            }
    
            let raiseAnimationIsPassingNumber = function (number){
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
                
                self._canAndCtx.canvas.dispatchEvent(event);
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
                self.drawAngle(curAngle);
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