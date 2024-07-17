import React, { useEffect, useState, useRef } from 'react';
import { AnimatedCircle } from './AnimatedCircle';
import StableSliderComponent from './StableSliderComponent';
import { throttle } from 'lodash';




function getCurrentTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return parseInt(`${minutes}${hour}${day}${month}${year}`, 10);
}

const DivisorGraph = ({id}) => {
  const [dividend, setDividend] = useState(getCurrentTimestamp());
  const [divisor, setDivisor] = useState(Math.floor(Math.random() * 60) + 1);
  const [arcs, setArcs] = useState([]);
  const [paths, setPaths] = useState([]);
  const [curvature, setCurvature] = useState(2);
  const [tick, setTick] = useState(200)
  const [speed, setSpeed] = useState(80)
  const cursorRef = useRef(null); // Using useRef for cursor position
  const radius = 140;
  const dotRadius = 4;

  useEffect(() => {
    updateDisplay()
    clearDividendUpTo(dividend.toString().length+1)
  }, [paths, divisor, dividend, speed]);



  useEffect(() => {
    const t = (100 - speed)/100*1000 + 1
    setTick(t)
  }, [speed]);


  useEffect(() => {
    setPaths([])
  }, [divisor, dividend, tick, curvature]);


  useEffect(() => {
    const newArcs = [];
    for (let i = 1; i < divisor; i++) {
      const end = (i * 10) % divisor;
      newArcs.push({ start: i, end: end, color: "black" });
    }
    setArcs(newArcs);
    setPaths([]);
  }, [divisor]);


  const startAnimation = () => {
    
    const newPaths = [];
    let start = 0;
    const numberString = dividend.toString();
  
    for (let i = 0; i < numberString.length; i++) {
      const digit = parseInt(numberString[i]);
  
      for (let j = 0; j < digit; j++) {
        let p = buildArcOnCircle(start, 1);
        let source = start;
        start = (start + 1) % divisor;
        let target = start;
        if (p !== null) {
          newPaths.push({
            data: { type: "circle", source, target, ref: digit - j -1, pos: i },
            path: p,
            duration: tick,
            begin: newPaths.reduce((acc, path) => acc + path.duration, 0)
          });
        }
      }
  
      if (i === numberString.length - 1) break;
  
      let end = (start * 10) % divisor;
      let p = buildArc(start, end);
      let source = start;
      let target = end;
      if (p !== null) {
        newPaths.push({
          data: { type: "shortcut", source, target, ref: target, pos: i },
          path: p,
          duration: tick,
          begin: newPaths.reduce((acc, path) => acc + path.duration, 0)
        });
      }
      start = end;
    }
  
    setPaths(newPaths);
  };
  
  const generateCursor = () => {
    return (
      <g ref={cursorRef} key={"cursor"} transform={`translate(-1000, -1000)`}>
        <circle r={8} fill="white" stroke="black" strokeWidth="0.5" />
        <text
          id={`cursor-text-${id}`}
          textAnchor="middle"
          dominantBaseline="central"
          fill="black"
          fontSize="10"
          fontFamily="Arial, sans-serif"
        >
          0
        </text> 
      </g>
    );
  };

  const generateDots = () => {
    const dots = [];
  
    for (let i = 0; i < divisor; i++) {
      const angle = (Math.PI / 2) - (i / divisor) * 2 * Math.PI;
      const x = radius * Math.cos(angle);
      const y = -radius * Math.sin(angle);
      const textX = (radius+12) * Math.cos(angle);
      const textY = -(radius+12) * Math.sin(angle);
      dots.push(
        <g key={i} transform={`translate(${x}, ${y})`}>
          <circle r={dotRadius} fill="none" stroke="black" strokeWidth="0.2" />
        </g>)
      
      if (divisor < 100) {
        dots.push(
            <text
              key={`text-${i}`}
              x={textX}
              y={textY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#999"
              fontSize={8}
              fontFamily="Roboto, monospace"
              fontWeight="300"
            >
              {i}
            </text>
          )
    
      }
    }
  
    return dots;
  };
  const buildArcOnCircle = (start, hops) => {
    if (hops === 0) {
      return null;
    }

    let path = "";
    const totalHops = start + hops;

    for (let i = start; i < totalHops; i++) {
      const newStart = i % divisor;
      const newEnd = (i + 1) % divisor;

      const startAngle = (Math.PI / 2) - (newStart / divisor) * 2 * Math.PI;
      const endAngle = (Math.PI / 2) - (newEnd / divisor) * 2 * Math.PI;

      const startX = radius * Math.cos(startAngle);
      const startY = -radius * Math.sin(startAngle);
      const endX = radius * Math.cos(endAngle);
      const endY = -radius * Math.sin(endAngle);

      const sweepFlag = "1";

      path += `M ${startX} ${startY} A ${radius} ${radius} 0 0 ${sweepFlag} ${endX} ${endY} `;
    }

    return path;
  };

  const buildArc = (start, end) => {
    if (start === end) {
      return null;
    }
    const startAngle = (Math.PI / 2) - (start / divisor) * 2 * Math.PI;
    const endAngle = (Math.PI / 2) - (end / divisor) * 2 * Math.PI;

    const startX = radius * Math.cos(startAngle);
    const startY = -radius * Math.sin(startAngle);
    const endX = radius * Math.cos(endAngle);
    const endY = -radius * Math.sin(endAngle);

    if (Math.abs((start - end)) * 2 === divisor) {
      return `M ${startX},${startY} L ${endX},${endY}`;
    }

    const mX = (startX + endX) / 2;
    const mY = (startY + endY) / 2;

    const vX = mX;
    const vY = mY;

    const vLength = Math.sqrt(vX * vX + vY * vY);
    const nvX = vX / vLength;
    const nvY = vY / vLength;

    const gcX = curvature * radius * nvX;
    const gcY = curvature * radius * nvY;

    const gRadius = Math.sqrt((gcX - startX) ** 2 + (gcY - startY) ** 2);

    let sweepFlag = 1;
    if (gcX < 0 && startY > endY) sweepFlag = 0;
    if (gcX > 0 && startY < endY) sweepFlag = 0;

    return `M ${startX} ${startY} A ${gRadius} ${gRadius} 0 0 ${sweepFlag} ${endX} ${endY}`;
  };


  const updateDisplay = (x = -1000, y = -1000, value = "") => {
    if (cursorRef.current) {
      cursorRef.current.setAttribute("transform", `translate(${x}, ${y})`);
      [`cursor-text-${id}`, `mod-${id}`].forEach((id) => {
        const textElement = document.getElementById(id);
        if (textElement) {
          textElement.textContent = value.toString();
        }
      })
    }
  }

  const clearDividendUpTo = (pos) => {
    for (let i = 0; i <= pos; i++) {
      const textElement = document.getElementById(`digit-${id}-${i}`);
      if (textElement) {
        textElement.style.color = "white";
      }
    }
  };
  
  const updateDividend = (ref = null, pos = null) => {
    if (cursorRef.current) {
      if (pos>=0 ) {
        const textElement = document.getElementById(`digit-${id}-${pos}`);
        if (textElement) {
            textElement.textContent = ref;
            textElement.style.color = "rgba(0,0,0,0.2)";
        }
      }
    }
  }

  const handleMilestone = ({ type, source, target, ref, pos, event }) => {
    if (event === "start") {
      if (type === "circle") {
        updateDividend(ref + 1 , pos)
      } else {
        updateDividend("*", pos) 
      }
      clearDividendUpTo(parseInt(pos)-1)
    }
    if (event === "end" ) {
      const angle = (Math.PI / 2) - (target / divisor) * 2 * Math.PI;
      const x = (radius + 12) * Math.cos(angle);
      const y = -(radius + 12) * Math.sin(angle);
      updateDisplay(x, y, target)
      if (pos === dividend.toString().length-1 && ref===0  ) {
        clearDividendUpTo(parseInt(pos)+100)
      }
    }
    
  };

  const drawArcLine = (index, start, end, color = "blue") => {
    const arcPath = buildArc(start, end);
    if (arcPath === null) {
      return null;
    }
    return (
      <path
        id={`path-${index}`}
        d={arcPath}
        fill="none"
        stroke={color}
        strokeWidth="0.2"
        markerEnd="url(#arrowhead)"
        strokeLinecap="round"
      />
    );
  };

  return (
    <div className="mt-1 flex flex-col items-center ">
      <div className="font-roboto-mono font-bold text-xl w-full">
          <div className="ml-10 text-left">
            {dividend} mod {divisor} = <span id={`mod-${id}`} className="inline-block w-16"></span>
          </div>
          <div className="mt-[-10px] mb-[-15px]">
          <div className="ml-10 text-left">
            {dividend.toString().split('').map((digit, index) => (
              <span className="text-white" id={`digit-${id}-${index}`}  key={`digit-${id}-${index}`} >
                {digit}
              </span>
            ))}
          </div>
          </div>
      </div>

      <svg className="mt-[-15px]"  width={radius * 2 + dotRadius * 2 + 60 } height={radius * 2 + dotRadius * 2 + 60}>
        <defs>
        <marker id="arrowhead" markerWidth="20" markerHeight="14" refX={10 * dotRadius} refY="7" orient="auto">
            <polygon points="0,0 20,7 0,14" fill="#999" />
        </marker>
        </defs>

        <g transform={`translate(${radius + dotRadius + 30}, ${radius + dotRadius + 30})`}>
          <circle r={radius} fill="none" stroke="black" strokeWidth="0.4" />
          {arcs.map((arc, index) => (
            <React.Fragment key={index}>
              {drawArcLine(index, arc.start, arc.end, arc.color)}
            </React.Fragment>
          ))}

          {paths.map(({ data, path, duration, begin }, index) => (
            <AnimatedCircle
              key={`${divisor}-${index}-${Date.now()}`}
              path={path}
              begin={begin}
              duration={duration}
              data={data}
              onMilestone={handleMilestone}
            />
            
          ))}

          {generateDots()}
          {generateCursor()} {/* Ensure cursor is rendered */}
        </g>
      </svg>

    <div className="mt-[-10px] flex flex-wrap items-center gap-2">
      <div className="flex-grow max-w-[calc(100%-150px)]">
        <input
          id="dividend"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min="1"
          max="999999999999"
          value={dividend}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value)) {
              setDividend(Math.max(1, Math.min(value, 999999999999)));
            }
          }}
          onFocus={(e) => e.target.select()}
          className="w-full border border-gray-300 rounded px-3 py-2 text-base"
        />
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="divisor" className="text-xl font-bold">/</label>
        <input
          id="divisor"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min="1"
          max="999"
          value={divisor}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value)) {
              setDivisor(Math.max(1, Math.min(value, 999)));
            }
          }}
          onFocus={(e) => e.target.select()}
          className="w-[80px] border border-gray-300 rounded px-3 py-2 text-base"
        />
      </div>

      <button 
        onClick={startAnimation} 
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        Go
      </button>
    </div>


    <div className="mt-2">
        <div>
          <StableSliderComponent 
            id = {"divis"}
            label={"Divisor"}
            initialValue={divisor } 
            min="1"
            max="120"
            step="1"
            onChange={(e) => {
              throttle(() => {
                setDivisor(Math.max(1, parseInt(e.target.value, 10)));
              }, 50)(); 
            }}
          />
        </div>
      </div>


      <div className="mt-1">
        <div>
          <StableSliderComponent 
            id = {"curv"}
            label={"Curvature"}
            initialValue={curvature} 
            min="0.6"
            max="3"
            step="0.01"
            onChange={(e) => {
              throttle(() => {
                setCurvature(parseFloat(e.target.value).toFixed(2));
              }, 10)();
            }}
          />
        </div>
      </div>


      <div className="mt-1">
        <div>
          <StableSliderComponent 
            id = {"speed"}
            label={"Speed"}
            initialValue={speed} 
            min="1"
            max="99s"
            step="1"
            onChange={(e) => {
              throttle(() => {
                setSpeed(parseInt(e.target.value));
              }, 10)();
            }}
          />
        </div>
      </div>

    </div>
  );
};

export default DivisorGraph;       