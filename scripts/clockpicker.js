
(function () {
    //https://www.kirupa.com/html5/creating_simple_html5_canvas_animation.htm
    


    var requestAnimationFrame = window.requestAnimationFrame || 
                                window.mozRequestAnimationFrame || 
                                window.webkitRequestAnimationFrame || 
                                window.msRequestAnimationFrame;
    
    var sizedAndCenteredOrigoContext = function ( domSelector, width, height ) {        
        var curCanvas = document.querySelector( domSelector );        
        var curContext = curCanvas.getContext("2d");      
        curCanvas.width = width;
        curCanvas.height = height;  

        curContext.translate(width/2, height/2);        
        curContext.width = width;
        curContext.height = height;
        
        return curContext;
    }    

    var drawBackground = function( ctx, radius) {
        var width = ctx.width;
        var height = ctx.height;
        //clear the entire area
        ctx.clearRect(0-width/2, 0-height/2, width, height);
        
        // draw the circle
        ctx.beginPath();
            var xCoord = 0;	// The x-coordinate of the center of the circle
            var yCoord = 0;	// The y-coordinate of the center of the circle
            var sAngle	= 0; // The starting angle, in radians (0 is at the 3 o'clock position of the arc's circle)
            var eAngle = Math.PI * 2;	// The ending angle, in radians
            var counterclockwise = false;   // Optional. Specifies whether the drawing should be counterclockwise or clockwise. False is default, and indicates clockwise, while true indicates counter-clockwise.

            ctx.arc(xCoord, yCoord, radius, sAngle, eAngle, counterclockwise);
        
        ctx.closePath();
        
        // color in the circle
        ctx.fillStyle = "red";
        ctx.fill();
    }
    
    var drawNumbers = function drawNumbers(ctx, radius, startNumber, endNumber) {

        var width = ctx.width;
        var height = ctx.height;

        //clear the entire area
        ctx.clearRect(0-width/2, 0-height/2, width, height);

        ctx.font = radius*0.15 + "px arial";
        ctx.textBaseline="middle";
        ctx.textAlign="center";

        //print position
        for(var num = startNumber; num < ( endNumber + 1 ); num++){
            var a = num * 2 * Math.PI / endNumber - Math.PI / 2;
            xPos = radius * Math.cos(a)*0.85;
            yPos = radius * Math.sin(a)*0.85;
            ctx.fillStyle = "white";
            ctx.fillText(num.toString(), xPos, yPos)
        }
    }

    var Hand = function (ctx, length, minNum, maxNum, animFromNum, animToNum ) {
        
        var totNum = (maxNum - minNum) + 1;
        var angleBetweenNumbers =  2 * Math.PI / totNum;

        var startAngle = angleBetweenNumbers*animFromNum - Math.PI/2;
        var endAngle = angleBetweenNumbers*animToNum - Math.PI/2;
        
        var draw = function (ctx, angle, length, lineWidth) {
                
            var width = ctx.width;
            var height = ctx.height;

            //clear the entire area
            //ctx.clearRect(0-width/2, 0-height/2, width, height);
            ctx.beginPath();
            ctx.lineWidth = lineWidth;
            ctx.lineCap = "round";

            ctx.moveTo(0,0);
            ctx.lineTo(length*Math.cos(angle), length*Math.sin(angle));
            ctx.stroke();
        }

        var animate = function (ctx, startAngle, endAngle, length, lineWidth) {
            var curAngle = startAngle;
            var curNbrAnimations = 0;

            var animate_inner = function () {
                if( curAngle < endAngle ){
                    curNbrAnimations === 60 ? draw( ctx, curAngle, length*2, lineWidth ) : draw( ctx, curAngle, length, lineWidth );
                    curAngle += .1;
                    curNbrAnimations ++;
                    requestAnimationFrame(animate_inner);
                }
            }
            requestID = requestAnimationFrame(animate_inner);

        }

        return {
            animate: animate(ctx, startAngle, endAngle, length, 3)
        }
    }

    var start = function ( ){

        const CANVAS_WIDTH = 500;
        const CANVAS_HEIGHT = 500;

        var ctxBackground = sizedAndCenteredOrigoContext('#canvBackground', CANVAS_WIDTH, CANVAS_HEIGHT);
        var ctxDigits = sizedAndCenteredOrigoContext('#canvDigits', CANVAS_WIDTH, CANVAS_HEIGHT);
        var ctxHands = sizedAndCenteredOrigoContext('#canvHands', CANVAS_WIDTH, CANVAS_HEIGHT);

       
        var radius = CANVAS_HEIGHT/3;
        drawBackground(ctxBackground, radius);
        var startNumber = 1;
        var endNumber = 12;
        drawNumbers(ctxDigits, radius, startNumber, endNumber);

        Hand(ctxHands, radius*0.70, startNumber, endNumber, startNumber, endNumber).animate;
        
    }

    start();
})();    