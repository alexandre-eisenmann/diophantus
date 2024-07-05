import React, { useRef, useEffect } from 'react';

const StableSliderComponent = ({ id, value, label, min, max, step, handleChange }) => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    
    const preventDrag = (e) => {
      e.preventDefault();
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const slider = e.target;
      const rect = slider.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const val = percent * (max - min) + min;
      handleChange({ target: { val } });
    };

    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchstart', preventDrag, { passive: false });

    return () => {
      slider.removeEventListener('touchmove', handleTouchMove);
      slider.removeEventListener('touchstart', preventDrag);
    };
  }, [handleChange]);

  return (
    <div className="flex justify-center touch-none">
      <div className="w-[280px]">
        <label htmlFor={id} className="block mb-2">{label}</label>
        <div className="flex items-center space-x-2">
          <input
            ref={sliderRef}
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            className="slider w-[280px] touch-none"
          />
          <span className="w-12 text-right">{Number(value)}</span>
        </div>
      </div>
    </div>
  );
};

export default StableSliderComponent