import React, {useCallback, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from "react-redux";
import border from "./border";
import pt from "./point";

const makeMove = (borders) => () => ({type: "MOVE", borders});
const spawnLine = (x, y, angle, lifetime) => ({type: "ADD", x, y, angle, lifetime});

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
        const interval = setInterval(tick, 50);
        return () => clearInterval(interval);
    },[]);

    const spawnMyLine = useCallback(()=>{
        const dot = {x: 300, y: 300, angle: 360 * Math.random()};
        dispatch(spawnLine(dot.x, dot.y, dot.angle, 20));
    })

    useEffect(()=>{
        ctx.current.clearRect(0, 0, r.current.width, r.current.height);
        drawFigure(ctx,figure);
        coords.forEach( c => {
            ctx.current.beginPath();
            ctx.current.strokeStyle = c.color;
            ctx.current.moveTo(c.vec.a.x, c.vec.a.y);
            ctx.current.lineTo(c.vec.b.x, c.vec.b.y);
            ctx.current.stroke();
        })
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
          <button onClick={spawnMyLine}>Spawn line</button>
      </>
    )
}

export default App;
