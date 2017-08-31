'use strict';
class Background extends ContextSuper {
    // Constructor
    constructor (ctx, radius) {
        super(ctx, radius);
    }
    
    Draw () {
        var width = this._ctx.width;
        var height = this._ctx.height;
        //clear the entire area
        this._ctx.clearRect(0-width/2, 0-height/2, width, height);
        
        // draw the circle
        this._ctx.beginPath();
            var xCoord = 0;	// The x-coordinate of the center of the circle
            var yCoord = 0;	// The y-coordinate of the center of the circle
            var sAngle	= 0; // The starting angle, in radians (0 is at the 3 o'clock position of the arc's circle)
            var eAngle = Math.PI * 2;	// The ending angle, in radians
            var counterclockwise = false;   // Optional. Specifies whether the drawing should be counterclockwise or clockwise. False is default, and indicates clockwise, while true indicates counter-clockwise.

            this._ctx.arc(xCoord, yCoord, this._radius, sAngle, eAngle, counterclockwise);
        
        this._ctx.closePath();
        
        // color in the circle
        this._ctx.fillStyle = "green";
        this._ctx.fill();
    }
}