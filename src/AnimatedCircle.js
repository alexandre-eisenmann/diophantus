import React, { useEffect, useRef } from 'react';

export const AnimatedCircle = ({ data, path, begin = 0, duration = 1000, uniqueKey, onMilestone }) => {
  const animateMotionRef = useRef(null);
  const animateRef = useRef(null);

  useEffect(() => {
    const handleEndEvent = () => {
      if (onMilestone) onMilestone({ ...data, ...{ event: "end" } }, path);

    };

    const animateMotionElem = animateMotionRef.current;
    if (animateMotionElem) {
      animateMotionElem.addEventListener('endEvent', handleEndEvent);
    }

    const startAnimations = () => {
      if (animateMotionElem && animateRef.current) {
        animateMotionElem.beginElement();
        animateRef.current.beginElement();
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
          fill="remove" />
        <animate
          ref={animateRef}
          restart="always"
          attributeName="opacity"
          values="0; 1; 1; 0"
          keyTimes="0; 0.1; 0.9; 1"
          dur={`${duration}ms`}
          begin="indefinite" // Set to "indefinite" to control the start manually
          fill="freeze" />
      </circle>
    </g>
  );
};
