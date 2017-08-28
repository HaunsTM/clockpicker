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
            this._angleAnimation = 2 * Math.PI / 360;
        }
        
        draw (angle) {
            var width = this._ctx.width;
            var height = this._ctx.height;

            //clear the entire area
            this._ctx.clearRect(0-width/2, 0-height/2, width, height);
            this._ctx.beginPath();
            this._ctx.lineWidth = this._lineWidth;
            this._ctx.lineCap = "round";

            this._ctx.moveTo(0,0);
            this._ctx.lineTo(this._length*Math.cos(angle), this._length*Math.sin(angle));
            this._ctx.stroke();
        }
        
        animate(startAngle, endAngle) {
            
            var self = this;
            let animate_inner;
            let  curAngle = startAngle;

            let nextAngleCounterClockWise = function (curAngle, endAngle) {  
                if ( curAngle > 0 ) {                    
                    if (curAngle < endAngle) {                            
                        curAngle -= self._angleAnimation;
                    } else { 
                        return;
                    }
                } else {
                    curAngle += 2 * Math.PI;
                }
                return curAngle;
            }
 
            let nextAngleClockWise = function (curAngle, endAngle) {
                if ( curAngle < 2 * Math.PI ) {
                    if (curAngle < endAngle) {           
                        curAngle += self._angleAnimation;
                    } else { 
                        return;
                    }
                } else {
                    curAngle -= 2 * Math.PI;
                }
                return curAngle;
            }

            if (endAngle > startAngle){
                if ((endAngle - startAngle) > Math.PI) {
                    //counter clockwise
                    animate_inner = function () {
                        self.draw(curAngle);
                        curAngle = nextAngleCounterClockWise(curAngle, endAngle);
                        if (!isNaN(curAngle)) {
                            requestAnimationFrame(function () {
                                animate_inner();
                            });
                        }
                    }
                } else {
                    //clockwise
                    animate_inner = function () {
                        self.draw(curAngle);
                        curAngle = nextAngleClockWise(curAngle, endAngle);
                        if (!isNaN(curAngle)) {
                            requestAnimationFrame(function () {
                                animate_inner();
                            });
                        }
                    }
                }

            } else if (endAngle <= startAngle){
                if ((startAngle - endAngle) > Math.PI) {
                    //clockwise
                    animate_inner = function () {
                        self.draw(curAngle);
                        curAngle = nextAngleClockWise(curAngle, endAngle);
                        if (!isNaN(curAngle)) {
                            requestAnimationFrame(function () {
                                animate_inner();
                            });
                        }
                    }                    
                } else {
                    //counter clockwise
                    animate_inner = function () {
                        self.draw(curAngle);
                        curAngle = nextAngleCounterClockWise(curAngle, endAngle);
                        if (!isNaN(curAngle)) {
                            requestAnimationFrame(function () {
                                animate_inner();
                            });
                        }
                    }
                }
            }
            var requestID = requestAnimationFrame(animate_inner);
        }

 
    }