import React, { useEffect, useState, useRef } from 'react';



const AnimatedCircle = ({ data, path, begin = 0, duration = 1000, uniqueKey, onMilestone }) => {
  const animateMotionRef = useRef(null);
  const animateRef = useRef(null);

  useEffect(() => {
    const handleEndEvent = () => {
      if (onMilestone) onMilestone({...data,...{event: "end"}}, path);
      
    };

    const animateMotionElem = animateMotionRef.current;
    if (animateMotionElem) {
      animateMotionElem.addEventListener('endEvent', handleEndEvent);
    }

    const startAnimations = () => {
      if (animateMotionElem && animateRef.current) {
        animateMotionElem.beginElement();
        animateRef.current.beginElement();
        if (onMilestone)  onMilestone({...data,...{event: "start"}}, path);
      }
    };

    const timer = setTimeout(startAnimations, begin);

    // Cleanup function to remove the event listener and clear the timeout
    return () => {
      if (animateMotionElem) {
        animateMotionElem.removeEventListener('endEvent', handleEndEvent);
      }
      clearTimeout(timer);
    };
  }, [data, path, uniqueKey, begin, onMilestone]);

  return (
    <g>
      <circle r="4" fill="black" opacity="0">
        <animateMotion
          ref={animateMotionRef}
          restart="always"
          key={uniqueKey}
          repeatCount="1"
          dur={`${duration}ms`}
          begin="indefinite" // Set to "indefinite" to control the start manually
          path={path}
          fill="remove"
        />
        <animate
          ref={animateRef}
          restart="always"
          attributeName="opacity"
          values="0; 1; 1; 0"
          keyTimes="0; 0.1; 0.9; 1"
          dur={`${duration}ms`}
          begin="indefinite" // Set to "indefinite" to control the start manually
          fill="freeze"
        />
      </circle>
    </g>
  );
};

const CircleWithDots = () => {
  const [dividend, setDividend] = useState(98);
  const [divisor, setDivisor] = useState(7);
  const [arcs, setArcs] = useState([]);
  const [paths, setPaths] = useState([]);
  const [curvature, setCurvature] = useState(2);
  const cursorRef = useRef(null); // Using useRef for cursor position
  const radius = 200;
  const dotRadius = 4;
  const tick = 200;


  useEffect(() => {
    const newArcs = [];
    for (let i = 1; i < divisor; i++) {
      const end = (i * 10) % divisor;
      newArcs.push({ start: i, end: end, color: "black" });
    }
    setArcs(newArcs);
    setPaths([]);
  }, [divisor, dividend]);

  const createPath = () => {
    cursorRef.current.setAttribute("transform", `translate(${-1000}, ${-1000})`);
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
            data: { type: "circle", source, target, ref: digit - j -1 },
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
          data: { type: "shortcut", source, target, ref: target },
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
        <circle r={8} fill="none" stroke="black" strokeWidth="0.5" />
        <text
          id={'cursor-text'}
          textAnchor="middle"
          dominantBaseline="central"
          fill="black"
          fontSize="10"
          fontFamily="Arial, sans-serif"
        >
          0
        </text>      </g>
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
              fontFamily="Roboto, sans-serif"
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

  const handleMilestone = ({ type, source, target, ref, event }) => {
    if (event === "end" ) {
       console.log(`${type}: ${source} -> ${target} -> ${ref}`); 
      const angle = (Math.PI / 2) - (target / divisor) * 2 * Math.PI;
      const x = (radius + 12) * Math.cos(angle);
      const y = -(radius + 12) * Math.sin(angle);
      

      if (cursorRef.current) {
        cursorRef.current.setAttribute("transform", `translate(${x}, ${y})`);
        // Use getElementById to find the text element
        const textElement = document.getElementById('cursor-text');
        if (textElement) {
          textElement.textContent = target.toString();
        }
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
    <div className="mt-20 flex flex-col items-center space-y-8">
      <svg width={radius * 2 + dotRadius * 2 + 60 } height={radius * 2 + dotRadius * 2 + 60}>
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
      <div className="flex items-center space-x-2">
        <input
          id="dividend"
          type="number"
          min="1"
          max="1000"
          value={dividend}
          onChange={(e) => setDividend(Math.max(1, parseInt(e.target.value, 10)))}
          className="border border-gray-300 rounded px-2 py-1 w-16"
        />

        <label htmlFor="divisor">/</label>
        <input
          id="divisor"
          type="number"
          min="1"
          max="1000"
          value={divisor}
          onChange={(e) => setDivisor(Math.max(1, parseInt(e.target.value, 10)))}
          className="border border-gray-300 rounded px-2 py-1 w-16"
          />
        <button onClick={createPath} className="bg-blue-500 text-white px-2 py-1 rounded">Calculate Reminder</button>
      </div>
      {/* Slider for curvature */}
      <div className="flex items-center space-x-2 mt-4">
        <label htmlFor="curvature">Curvature:</label>
        <input
          id="curvature"
          type="range"
          min="0.6"
          max="3"
          step="0.01" // Step increment of 0.1 for more granularity
          value={curvature}
          onChange={(e) => {
            setCurvature(parseFloat(e.target.value))
            setPaths([]);
            
          }}
          className="border border-gray-300 rounded px-2 py-1"
          style={{ width: '150px' }}
        />
        <span>{curvature}</span>
      </div>
    </div>
  );
};

export default CircleWithDots;       