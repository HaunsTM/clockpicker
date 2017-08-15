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
        
        animate(startNumber, endNumber) {

            var startAngle = this._angleBetweenNumbers*startNumber - Math.PI/2;        
            var curAngle = startAngle;
            var endAngle = this._angleBetweenNumbers*endNumber - Math.PI/2;
            var that = this;

            var animate_inner = function () {
                if( curAngle < endAngle ){
                    this.draw(curAngle);
                    curAngle += .01;
                    
                    requestAnimationFrame(animate_inner.bind(this));
                }
            }
            var requestID = requestAnimationFrame(animate_inner.bind(this));
        }

    }