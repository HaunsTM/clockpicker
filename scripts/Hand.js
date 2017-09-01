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
                            let correspondingNumberAndAngle = [number, angle];
    
                            numbersAndAngles.push(correspondingNumberAndAngle);
                        }
                    }
    
    
                    return numbersAndAngles;    
                }
                return getNumbersAndAngles(totNum);
            })((maxNum - minNum) + 1);
            this._angleAnimation = 2 * Math.PI / 72;
        }
        
        draw (angle) {
            let context = this._canAndCtx.context;
            var width = context.width;
            var height = context.height;

            //clear the entire area
            context.clearRect(0-width/2, 0-height/2, width, height);
            context.beginPath();
            context.lineWidth = this._hand.width;
            context.lineCap = "round";

            context.moveTo(0,0);
            context.lineTo(this._hand.length*Math.cos(angle), this._hand.length*Math.sin(angle));
            context.stroke();
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
                
               // angleBeforeHandPass = angleBeforeHandPass - parseInt( angleBeforeHandPass / ( 2 * Math.PI ) ) * ( 2 * Math.PI );
            
         //   angleAfterHandPass = angleAfterHandPass - parseInt( angleAfterHandPass / ( 2 * Math.PI ) ) * ( 2 * Math.PI );
                let minAngle = Math.min(angleBeforeHandPass, angleAfterHandPass);
                let maxAngle = Math.max(angleBeforeHandPass, angleAfterHandPass);
                for( let i = 0; i < length; i++ ) {
                    let number = self._numbersAndAngles[i][0];
                    let angle = self._numbersAndAngles[i][1];
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
                self.draw(curAngle);
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