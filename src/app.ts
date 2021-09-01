// library source and docs at https://github.com/Qix-/color
import  Color  from 'color'

// a simple implementation of a circular buffer for holding 
// a fixed size set of points in PointSet
import * as ps from './pointset';

// simple convenience 
function randomColor() {
    return Color({
        r: Math.random() * 255, 
        g: Math.random() * 255, 
        b: Math.random() * 255
    })
}

// yes, it's one line, but it's one less thing for you to figure out
function darken(color: Color) {
    return color.darken(0.25)   // creates a new color
}

function drawTriangle(p1:ps.MousePosition, p2: ps.MousePosition, p3:ps.MousePosition, color:Color, ctx:CanvasRenderingContext2D, step:number){
    var midPoint1:ps.MousePosition = {x: (p2.x - p1.x)/2 + p1.x, y: (p2.y - p1.y)/2 + p1.y};
    var midPoint2:ps.MousePosition = {x: (p3.x - p1.x)/2 + p1.x, y: (p3.y - p1.y)/2 + p1.y};
    var midPoint3:ps.MousePosition = {x: (p3.x - p2.x)/2 + p2.x, y: (p3.y - p2.y)/2 + p2.y};
    var original = ctx.fillStyle
    ctx.fillStyle = color.toString()
    ctx.beginPath()
    ctx.moveTo(midPoint1.x, midPoint1.y)
    ctx.lineTo(midPoint2.x, midPoint2.y)
    ctx.lineTo(midPoint3.x, midPoint3.y)
    ctx.lineTo(midPoint1.x, midPoint1.y)
    ctx.stroke()
    ctx.fill()
    ctx.closePath()
    if (step > 0) {
        drawTriangle(p1, midPoint1, midPoint2, darken(color), ctx, step-1);
        drawTriangle(midPoint1, p2, midPoint3, darken(color), ctx, step-1);
        drawTriangle(midPoint2, midPoint3, p3, darken(color), ctx, step-1);
    }
}

// an interface that describes what our Rectangle object might look like.  
// Remember, a Typescript interface is just a description of the required
// properties (and methods, although we don't use methods here) an object
// must implement.  It is not a class or an object itself.
interface Rectangle {
    p1: ps.MousePosition;
    p2: ps.MousePosition;
    color: Color;
}

// A class for our application state and functionality
class Drawing {
    // the constructor paramater "canv" is automatically created 
    // as a property because the parameter is marked "public" in the 
    // constructor parameter
    //    canv: HTMLCanvasElement
    //
    // rendering context for the canvas, also public
    //    ctx: CanvasRenderingContext2D

    // some suggested properties you might use in your implementation
    mousePosition: ps.MousePosition | null = null;
    clickStart: ps.MousePosition | null = null;
    rects: Array <Rectangle>;   // an array that only contains objects that
                                // satisfy the Rectangle interface
    points: ps.PointSet;
    
    // a simple wrapper to reliably get the offset within an DOM element
    // We need this because the mouse position in the mouse event is
    // relative to the Window, but we want to specify draw coordinates
    // relative to the canvas DOM element  
    // see: http://www.jacklmoore.com/notes/mouse-position/
    static offset(e: MouseEvent): ps.MousePosition {
        e = e || <MouseEvent> window.event;

        var target = <Element> (e.target || e.srcElement),
            rect = target.getBoundingClientRect(),
            offsetX = e.clientX - rect.left,
            offsetY = e.clientY - rect.top;

        return {x: offsetX, y: offsetY};
    }

    // Web pages are reactive; Javascript is single threaded, and all 
    // javascript code in your page is executed in response to 
    // some action.   Actions include
    // - by the user (various callbacks like mouse and keyboard callback)
    // - by timers (we can use a timeout function to execute something in
    //   the future)
    // - things like network actions (e.g., fetch this resource, call this
    //   code when it's been retrieved)
    // - a callback synchronized with the next display refresh rate 
    //   that was created for doing animation
    // 
    // We use the this last one, triggered by a call to 
    //      requestAnimationFrame(() => this.render());
    // to do continuous rendering.  The requestAnimationFrame has one
    // parameter, a function.  The "() => this.render()" syntax is a 
    // shorthand for writing inline functions.  It says "this is a function
    // with no parameters" ("() =>") whose body is one line of code, the 
    // "this.render()" call.  It could also be
    //              requestAnimationFrame(() => {
    //                   this.render()
    //                });
    // where the function body is betwee {} and we could write more methods.

    render() {
        // Store the current drawing transformation matrix (and other state)
        this.ctx.save();
        
        // Use the identity matrix while clearing the canvas (just in case you change it someday!)
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = "lightgrey";
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
        
        // Restore the transform
        this.ctx.restore();        

        // **** TODO *****
        // if the mouse is over the canvas, it's position is here, otherwise it's null
        // add code to deal with the mouse position each render frame
        if (this.mousePosition) {
            this.points.addPoint(this.mousePosition);
        } else {
            if (this.points.length > 0) {
                this.points.dropPoint();
            }
        }

        // add code to draw rectangles we have so far at the back
        this.rects.forEach(element => {
            var container = this.ctx.lineWidth
            this.ctx.lineWidth = 2
            var width = - element.p1.x + element.p2.x;
            var height = - element.p1.y + element.p2.y;
            this.ctx.strokeRect(element.p1.x, element.p1.y, width, height);
            this.ctx.beginPath();
            this.ctx.moveTo(element.p1.x, element.p1.y);
            this.ctx.lineTo(element.p2.x, element.p2.y);
            this.ctx.moveTo(element.p1.x + width, element.p1.y);
            this.ctx.lineTo(element.p2.x - width, element.p2.y);
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.lineWidth = container
            var centerPoint:ps.MousePosition = {x: element.p1.x + width/2, y: element.p1.y + height/2};
            var p1 = element.p1
            var p2:ps.MousePosition = {x: p1.x + width, y:p1.y}
            var p3:ps.MousePosition = {x:p2.x, y:p2.y + height}
            var p4:ps.MousePosition = {x: p1.x, y:p1.y + height}
            var smaller = Math.min(Math.abs(width), Math.abs(height));
            var step = Math.floor(smaller/128)
            var check = smaller%128
            if (check == 0) {
                step = step - 1;
            }
            drawTriangle(centerPoint, p1, p2, element.color, this.ctx, step);
            drawTriangle(centerPoint, p2, p3, element.color, this.ctx, step);
            drawTriangle(centerPoint, p3, p4, element.color, this.ctx, step);
            drawTriangle(centerPoint, p4, p1, element.color, this.ctx, step);
        });


        // add code to draw points with the oldest ones more transparent 
        var container = this.ctx.strokeStyle
        var dotColor = Color('blue')
        this.ctx.fillStyle = dotColor.toString();
        for (let index = this.points.length - 1; index >= 0; index--) {
            var element = this.points.getPoint(index);
            this.ctx.fillRect(element.x, element.y, 2 ,2);
            this.ctx.fillStyle = dotColor.fade(.7).toString()
        }
        this.ctx.fillStyle = container
        

        // if we've clicked, add code draw the rubber band
        if (this.clickStart) {
            if (this.mousePosition) {
                var original = this.ctx.strokeStyle
                this.ctx.strokeStyle = 'grey'
                this.ctx.strokeRect(this.clickStart.x, this.clickStart.y, 
                    -this.clickStart.x + this.mousePosition.x, -this.clickStart.y + this.mousePosition.y);
                this.ctx.strokeStyle = original
            } else {
                this.clickStart = null;
            }
        }

        // do it again!  and again!  AND AGAIN!  AND ...       
        requestAnimationFrame(() => this.render());
    }
    
    constructor (public canv: HTMLCanvasElement, public ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
        this.rects = new Array(0)  // 0 sized array
        this.points = new ps.PointSet()
 

        // All interaction in browsers is done via event handlers.  Setting
        // "onmousedown", "onmouseup", "onmousemove", and "onmouseout" on
        // the Canvas DOM element to a function will cause that function to
        // be called when the appropriate action happens.

        canv.onmousedown = (ev: MouseEvent) => {
            // this method is called when a mouse button is pressed.
            var mousePosition = Drawing.offset(ev);   
            this.clickStart = mousePosition        
            this.mousePosition = mousePosition
        }
        
        canv.onmouseup = (ev: MouseEvent) => {
            // this method is called when a mouse button is released.
            const clickEnd = Drawing.offset(ev);

            // **** TODO *****
            // add code here to react to mouse up events
            if (this.clickStart) {
                let rect:Rectangle = {p1: this.clickStart, p2:clickEnd, color: randomColor()};
                this.rects.push(rect);
                this.clickStart = null;
            }
            this.mousePosition = clickEnd;
        }
        
        canv.onmousemove = (ev: MouseEvent) => {
            // this method is called when the mouse moves.   
            const mouse = Drawing.offset(ev);
            this.mousePosition = mouse 
        }
        
        canv.onmouseout = (ev: MouseEvent) => {
            // this method is called when the mouse goes out of
            // the window.  
            this.mousePosition = null;
            this.clickStart = null;
        }
    }
}

// a global variable for our state.  We implement the drawing as a class, and 
// will have one instance
var myDrawing: Drawing;

// main function that we call below.
// This is done to keep things together and keep the variables created self contained.
// It is a common pattern on the web, since otherwise the variables below woudl be in 
// the global name space.  Not a huge deal here, of course.

function exec() {
    // find our container
    var div = document.getElementById("drawing");

    if (!div) {
        console.warn("Your HTML page needs a DIV with id='drawing'")
        return;
    }

    // let's create a canvas and to draw in
    var canv = document.createElement("canvas");
    let ctx = canv.getContext("2d");
    if (!ctx) {
        console.warn("our drawing element does not have a 2d drawing context")
        return
    }
    
    div.appendChild(canv);

    canv.id = "main";
    canv.style.width = "100%";
    canv.style.height = "100%";
    canv.width  = canv.offsetWidth;
    canv.height = canv.offsetHeight;

    window.addEventListener('resize', (event) => {
        canv.width  = canv.offsetWidth;
        canv.height = canv.offsetHeight;
    });
    

    // create a Drawing object
    myDrawing = new Drawing(canv, ctx);
    
    // kick off the rendering!
    myDrawing.render(); 
}

exec()