'use strict';
class Hand {

        // Constructor
        constructor (ctx, length, lineWidth, minNum, maxNum) {
            this._ctx = ctx;
            this._length = length;
            this._lineWidth = lineWidth;
            this._minNum = minNum;
            this._maxNum = maxNum;
            this._totNum = (maxNum - minNum) + 1;
            this._angleBetweenNumbers =  2 * Math.PI / this._totNum;
            this._angleAnimation = 2 * Math.PI / 72;
        }
        
        draw (angle) {
            var width = this._ctx.width;
            var height = this._ctx.height;

            //clear the entire area
            this._ctx.clearRect(0-width/2, 0-height/2, width, height);
            this._ctx.beginPath();
            this._ctx.lineWidth = this._lineWidth+10;
            this._ctx.lineCap = "round";

            this._ctx.moveTo(0,0);
            this._ctx.lineTo(this._length*Math.cos(angle), this._length*Math.sin(angle));
            this._ctx.stroke();
        }
        
        animate(startAngle, endAngle) {
            
            var self = this;
            let animate_inner;

            let smallestDiffBetweenAngles = Math.atan2(Math.sin(endAngle-startAngle), Math.cos(endAngle-startAngle));
            let rotateClockwise = smallestDiffBetweenAngles > 0;
            let willPassZeroAngle = ( rotateClockwise && ( startAngle > endAngle )) || ( !rotateClockwise && ( startAngle < endAngle ));

            startAngle = ( !rotateClockwise && willPassZeroAngle ) ? startAngle + 2 * Math.PI : startAngle;
            endAngle = ( rotateClockwise && willPassZeroAngle ) ? endAngle + 2 * Math.PI : endAngle;

            let  curAngle = startAngle;

            let nextAngle = function (curAngle, endAngle) {
                let nextAngleCandidate;

                if( rotateClockwise ) {
                    //clockwise
                    nextAngleCandidate = curAngle + self._angleAnimation;

                    //should we stop?
                    nextAngleCandidate = nextAngleCandidate <= endAngle ? nextAngleCandidate : null;
                } else {
                    //counterclockwise
                    nextAngleCandidate = curAngle - self._angleAnimation;

                    //should we stop?
                    nextAngleCandidate = nextAngleCandidate >= endAngle ? nextAngleCandidate : null;
                }
                return nextAngleCandidate;
            }

            animate_inner = function () {
                self.draw(curAngle);
                let angleToDraw = nextAngle(curAngle, endAngle);
                curAngle = angleToDraw;
                if (angleToDraw && !isNaN(angleToDraw)) {
                    requestAnimationFrame(function () {
                        animate_inner();
                    });
                }
            }  

            var requestID = requestAnimationFrame(animate_inner);
        }

 
    }