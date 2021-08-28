// create an interface so Typescript can do type checking for us
export interface MousePosition {
    x: number;
    y: number;
}

// The PointSet class needs to be created here.
// 
// PointSet should be implemented as a circular buffer of fixed size 
// (the size is fixed at compile time).  Points are added until the 
// buffer is full, and when the buffer is full a new point overwrites 
// the oldest point.  
//
// The key feature of a cicular buffer is that internally, it is implemented 
// with an array, and with a "start" and "count" indices that show you were 
// the first element is, and how many elements are in the buffer.  
// When the buffer is full, "count" is the size of the array.
// 
// When an element is removed from either end of the buffer, the "start" 
// and "count" indices are updated.  
//
// When a new element is added, "count" is incremented. 
// 
// When an element is added to a full buffer, the oldest element is 
// overwritten (and the "start" is incremented).
// 
// Care must be taken to deal with wrapping around the end.
//
// You will probably find it useful to implement the methods below, at least.

export class PointSet {
	private _pts: Array <MousePosition>;
	private _idx: number;
	private _count: number;
	
    constructor (private _capacity: number = 30) {
		this._pts = new Array(this._capacity);
		this._idx = 0;
		this._count = 0;
	}
		
    // add a new point, overwritting the oldest if full
	addPoint(m: MousePosition) {
		var n = (this._idx + this._count) % this._capacity;
		this._pts[n] = m;
		
		if (this._count == this._capacity) {
			this._idx = (this._idx + 1) % this._capacity;
		} else {
			this._count ++;
		}
	}
	
    // remove the oldest point
	dropPoint() {
		if (this._count == 0) {
			throw new Error('Cannot drop point, the buffer is empty');
		}
		this._count--;
		this._idx = (this._idx + 1) % this._capacity;
	}
	
    // get the current count of number of points
	get length(): number {
		return this._count;
	}

    // get point number "i" (not array element "i")
	getPoint(i: number): MousePosition {
		if (i < 0 || i >= this._count) {
			throw new Error('Cannot get value outside of buffer range');
		} 
		const p = this._pts[(this._idx + i) % this._capacity];
		return p;
	}
} 