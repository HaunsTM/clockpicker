'use strict';
class Background {
    // Constructor
    constructor (ctx, radius, color) {        
        this._ctx = ctx;
        this._radius = radius;
        // color in the circle
        this._ctx.fillStyle = color;
    }
    
    clear(){
        //clear the entire area
        var width = this._ctx.width;
        var height = this._ctx.height;
        this._ctx.clearRect(0-width/2, 0-height/2, width, height);
    }
    
    draw () {
        this.clear()
        
        // draw the circle
        this._ctx.beginPath();
            var xCoord = 0;	// The x-coordinate of the center of the circle
            var yCoord = 0;	// The y-coordinate of the center of the circle
            var sAngle	= 0; // The starting angle, in radians (0 is at the 3 o'clock position of the arc's circle)
            var eAngle = Math.PI * 2;	// The ending angle, in radians
            var counterclockwise = false;   // Optional. Specifies whether the drawing should be counterclockwise or clockwise. False is default, and indicates clockwise, while true indicates counter-clockwise.

            this._ctx.arc(xCoord, yCoord, this._radius, sAngle, eAngle, counterclockwise);
        
        this._ctx.closePath();        
        
        this._ctx.fill();
    }
}