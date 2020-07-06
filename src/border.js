export default class border{
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    getPoints(){
        return [this.a, this.b];
    }
}