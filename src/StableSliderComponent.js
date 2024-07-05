import React, { useRef, useEffect } from 'react';

const StableSliderComponent = ({ id, value, label, min, max, step, handleChange }) => {
  const sliderRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    
    const handleUpdate = (e) => {
      e.preventDefault();
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const rect = slider.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const minValue = parseFloat(min);
      const maxValue = parseFloat(max);
      const newValue = percent * (maxValue - minValue) + minValue;
      handleChange({ target: { value: newValue } });
    };

    const handleTouchStart = (e) => {
      document.addEventListener('touchmove', handleUpdate, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleUpdate);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    slider.addEventListener('touchstart', handleTouchStart, { passive: false });
    slider.addEventListener('mousedown', (e) => {
      handleUpdate(e);
      document.addEventListener('mousemove', handleUpdate);
      document.addEventListener('mouseup', handleMouseUp);
    });

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleUpdate);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    return () => {
      slider.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleUpdate);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleUpdate);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleChange, min, max]);

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
            className="slider w-[230px] touch-none"
          />
          <span className="w-12 text-right">{Number(value)}</span>
        </div>
      </div>
    </div>
  );
};

export default StableSliderComponent;