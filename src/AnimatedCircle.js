import React, { useEffect, useRef, useState } from 'react';

export const AnimatedCircle = ({ data, path, begin = 0, duration = 1000, uniqueKey, onMilestone }) => {
  const animateMotionRef = useRef(null);
  const animateRef = useRef(null);
  const pathTraceRef = useRef(null);
  const pathTraceAnimateRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    const handleEndEvent = () => {
      if (onMilestone) onMilestone({ ...data, ...{ event: "end" } }, path);
    };

    const animateMotionElem = animateMotionRef.current;
    if (animateMotionElem) {
      animateMotionElem.addEventListener('endEvent', handleEndEvent);
    }

    const startAnimations = () => {
      if (animateMotionElem && animateRef.current && pathTraceAnimateRef.current) {
        animateMotionElem.beginElement();
        animateRef.current.beginElement();
        pathTraceAnimateRef.current.beginElement();
        if (onMilestone) onMilestone({ ...data, ...{ event: "start" } }, path);
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
  }, [data, path, uniqueKey, begin, duration, onMilestone]);

  useEffect(() => {
    const pathLength = pathTraceRef.current?.getTotalLength() || 0;
    setPathLength(pathLength);
    pathTraceRef.current?.style.setProperty('stroke-dasharray', pathLength);
    pathTraceRef.current?.style.setProperty('stroke-dashoffset', pathLength);
  }, [path]);

  return (
    <g>
      <path
        ref={pathTraceRef}
        d={path}
        fill="none"
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <animate
          ref={pathTraceAnimateRef}
          attributeName="stroke-dashoffset"
          from={pathLength}
          to="0"
          dur={`${duration}ms`}
          begin="indefinite"
          fill="freeze"
        />
      </path>
      <circle r="4" fill="black" opacity="0">
        <animateMotion
          ref={animateMotionRef}
          restart="always"
          key={uniqueKey}
          repeatCount="1"
          dur={`${duration}ms`}
          begin="indefinite"
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
          begin="indefinite"
          fill="freeze"
        />
      </circle>
    </g>
  );
};

