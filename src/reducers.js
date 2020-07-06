import pt from "./point";
import {EPS} from "./point";

const demethodize = method => ctx => (...args) => method.apply(ctx, args);

const toRadians = angle => angle * (Math.PI / 180);
const toDegrees = angle => angle * (180 / Math.PI);
const sin = demethodize(Math.sin)(Math);
const cos = demethodize(Math.cos)(Math);
const reduce = demethodize([].reduce);

const move = (x, y, v, angle) => {
    x += v * cos(toRadians(angle));
    y += v * sin(toRadians(angle));
    return [x,y];
};

const pipe2 = (f, g) => (...args) => g(f(...args));
const pipeline = (...func) => reduce(func)(pipe2);

const mul = (x,y) => x * y;
const div = (x,y) => x / y;
const opAll = op => (cf, ...args) => args.map( v => op(v, cf));
const normalize = cf => (...args) => opAll(div)(cf, ...args);
const denormalize = cf => (...args) => opAll(mul)(cf, ...args);


const euclideanDistance = (a, b) => (a ** 2 + b ** 2) ** 0.5

class line{
    constructor(p, q) {
        this.a = p.y - q.y;
        this.b = q.x - p.x;
        this.c = - this.a * p.x - this.b * p.y;
        const z = euclideanDistance(this.a, this.b);

        if (Math.abs(z) > EPS){
            this.a/=z;
            this.b/=z;
            this.c/=z;
        }
    }

    dist(p){
        return this.a * p.x + this.b * p.y + this.c;
    }
}

const det = (a,b,c,d) => a*d-b*c;

const betw = (l, r, x) => {
    return (Math.min(l,r) <= (x + EPS)) && (x <= (Math.max(l,r) + EPS));
}

const swap = (a,b) => [b,a];

const intersect_1d = ( a,  b,  c,  d) => {
    if (a > b)  [a,b] = swap (a, b);
    if (c > d)  [c,d] = swap (c, d);
    return Math.max (a, c) <= (Math.min (b, d) + EPS);
}

const intersectInfo = (bool, left, right) => ({intersect: bool, left, right})

const intersect = (a, b, c, d) => {
    let left = new pt(undefined,undefined);
    let right = new pt(undefined,undefined);
    if (! intersect_1d (a.x, b.x, c.x, d.x) || ! intersect_1d (a.y, b.y, c.y, d.y))
        return intersectInfo(false, left,right);

    const m = new line(a, b);
    const n = new line(c, d);
    const zn = det (m.a, m.b, n.a, n.b);

    if (Math.abs (zn) < EPS) {
        if (Math.abs (m.dist (c)) > EPS || Math.abs (n.dist (a)) > EPS)
            return intersectInfo(false, left,right);

        if (b.less(a))  swap (a, b);
        if (d.less(c))  swap (c, d);
        left = a.less(c) ? c : a;
        right = b.less(d)? b : d;
        return intersectInfo(true, left,right);
    }
    else {
        left.x = right.x = - det (m.c, m.b, n.c, n.b) / zn;
        left.y = right.y = - det (m.a, m.c, n.a, n.c) / zn;
        return intersectInfo(
            betw (a.x, b.x, left.x) &&
                betw (a.y, b.y, left.y) &&
                betw (c.x, d.x, left.x) &&
                betw (c.y, d.y, left.y),
            left,
            right
        );
    }
}

const vectorize = (x11, x12, x21, x22) => new pt(x21 - x11, x22 - x12);
const hade = (v1, v2) => Math.atan2(v1.x * v2.y - v2.x * v1.y, v1.x * v2.x + v1.y * v2.y,);
const zeroVec = new pt(1,0);
const projPipeline = pipeline(hade, toDegrees);

const v = 50;
export const reducer = (state, action) => {
    switch (action.type) {
        case "MOVE":
            const [newx, newy] = move(state.x, state.y, v, state.angle);
            const info = action.borders
                .map(border => ({inters: intersect(new pt(state.x, state.y), new pt(newx, newy), ...border.getPoints()),  border: border }))
                .filter(info => info.inters.intersect && !(info.inters.left.equal(info.inters.right) && info.inters.left.equal(new pt(state.x, state.y))))[0];
            if (!info){
                return {x: newx, y: newy, angle: state.angle};
            }else{
                const projection = projPipeline(zeroVec, vectorize(info.border.a.x, info.border.a.y, info.border.b.x, info.border.b.y));
                const x = projPipeline(vectorize(state.x, state.y, newx, newy), vectorize(info.border.a.x, info.border.a.y, info.border.b.x, info.border.b.y));
                const angle = projection + x;
                return {x: info.inters.left.x, y: info.inters.left.y, angle: angle};
            }
        default:
            return state;
    }
}