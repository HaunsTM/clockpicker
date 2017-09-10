'use strict';
class ContextSuper {
    // Constructor
    constructor (ctx, radius, minNum, maxNum) {
        this._ctx = ctx;
        this._radius = radius;
    }

    
    RequestAnimationFrame () { 
        let retVal = window.requestAnimationFrame || 
                     window.mozRequestAnimationFrame || 
                     window.webkitRequestAnimationFrame || 
                     window.msRequestAnimationFrame;         
        return retVal;
    }
}