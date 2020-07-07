import border from "./border";
import getColor from "./getColor";
import bounceSound from "./bounce.mp3";

export default class ray{
    constructor(a, b, angle, lifetime = 10, maxColors = 20) {
        this.vec = new border(a, b);
        this.angle = angle;
        this.lifetime = lifetime;
        this.colorGenerator = getColor(maxColors);
        this.color = this.colorGenerator();
    }

    soundClick (){
        const audio = new Audio();
        audio.src = bounceSound;
        audio.play();
    };

    continue(p, angle = this.angle){
        this.vec.a = this.vec.b;
        this.vec.b = p;
        this.angle = angle;
        return this;
    }

    hit(){
        this.lifetime--;
        this.color = this.colorGenerator();
        this.soundClick();
        return this;
    }

}