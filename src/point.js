export const EPS = 1E-5;
export default class pt{
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    less(p){
        return (this.x) < (p.x - EPS) || (Math.abs(this.x - p.x) < EPS && this.y < (p.y - EPS));
    }

    equal(p){
        return Math.abs(this.x - p.x ) < EPS && Math.abs(this.y - p.y) < EPS;
    }
}
