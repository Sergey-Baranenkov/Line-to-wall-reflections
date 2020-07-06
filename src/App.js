import React, {useCallback, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from "react-redux";
import border from "./border";
import pt from "./point";

const makeMove = (borders) => () => ({type: "MOVE", borders});
const curry = (fn, len = fn.length) => !len ? fn(): x => curry(fn.bind(null, x));

const getColor = numberOfSteps => {
    let step = 0;
    const r = curry(rainbow)(numberOfSteps);
    return () => {
        return r(step++);
    }
}

function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    let r, g, b;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    return "#" + ("00" + (~~(r * 255)).toString(16)).slice(-2) + ("00" + (~~(g * 255)).toString(16)).slice(-2) + ("00" + (~~(b * 255)).toString(16)).slice(-2);
}


const width = 600;
const height = 600;
const left = new border(new pt(0,0), new pt (0, height));
const up = new border(new pt(0,height), new pt (width, height));
const bottom = new border(new pt(0,0), new pt (width, 0));
const right = new border(new pt(width,0), new pt (width, height));
const square = [left,up,bottom,right];

const rhombnorthwest = new border(new pt(0,height/2), new pt(width/2,height));
const rhombnortheast = new border(new pt(width/2,height), new pt(width,height/2));
const rhombsoutheast = new border(new pt(width,height/2), new pt(width / 2,0));
const rhombsouthwest = new border(new pt(width/2,0), new pt(0,height/2));
const rhombInside = new border(new pt(width/2,height/6), new pt(width / 10,height/ 1.8));

const rhomb = [rhombInside,rhombnorthwest,rhombnortheast,rhombsoutheast,rhombsouthwest];

const drawFigure = (ctx, borders)=>{
    borders.forEach(bord =>{
        ctx.current.beginPath();
        ctx.current.moveTo(bord.a.x,bord.a.y);
        ctx.current.strokeStyle = "gray";
        ctx.current.lineTo(bord.b.x, bord.b.y);
        ctx.current.stroke();
    })

}

function App({figure = rhomb}) {
    const r = useRef(null);
    const ctx = useRef(undefined);
    const prev = useRef({x: 300, y:300});
    const getMyColor = useCallback(getColor(10),[]);
    const makeMyMove = useCallback(makeMove(figure),[]);
    const coords = useSelector(s => s);
    const dispatch = useDispatch();

    const tick = useCallback(()=>{
        dispatch(makeMyMove());
    }, [makeMyMove])

    useEffect(()=>{
        ctx.current = r.current.getContext("2d");
        ctx.current.lineWidth = 3;
        ctx.current.translate(0, height);
        ctx.current.scale(1, -1);
        drawFigure(ctx,figure);
        const interval = setInterval(tick, 100);
        return () => clearInterval(interval);
    },[]);


    useEffect(()=>{
        ctx.current.beginPath();
        ctx.current.moveTo(prev.current.x,prev.current.y);
        ctx.current.strokeStyle = getMyColor();
        ctx.current.lineTo(coords.x, coords.y);
        prev.current = {x: coords.x, y:coords.y};
        ctx.current.stroke();
    }, [coords]);

    return (
      <>
          <canvas ref = {r}
                  height = {`${height}px`}
                  width  = {`${width}px`}
                  style  = {{border: "1px solid grey"}}
          >
              Canvas is not supported by your browser
          </canvas>
          <button onClick={tick}>tick</button>
      </>
    )
}

export default App;
