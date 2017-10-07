'use strict';
class Digits {
    // Constructor
    constructor (ctx, radius, minNum, maxNum) {
        this._ctx = ctx;
        this._radius = radius;
        this._minNum = minNum;
        this._maxNum = maxNum;
    }
    
    clear(){        
        var width = this._ctx.width;
        var height = this._ctx.height;
        //clear the entire area
        this._ctx.clearRect(0-width/2, 0-height/2, width, height);
    }

    Draw() {

        this._ctx.font = this._radius*0.15 + "px arial";
        this._ctx.textBaseline="middle";
        this._ctx.textAlign="center";

        //print position
        for(var num = this._minNum; num < ( this._maxNum + 1 ); num++){
            var a = num * 2 * Math.PI / this._maxNum - Math.PI / 2;
            var xPos = this._radius * Math.cos(a)*0.85;
            var yPos = this._radius * Math.sin(a)*0.85;

            this._ctx.fillStyle = "black";
            this._ctx.fillText(num.toString(), xPos, yPos)
        }
    }
}