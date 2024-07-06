import React, { useRef, useEffect, useState, useCallback } from 'react';

const StableSliderComponent = ({ id, initialValue, label, min, max, step, onChange }) => {
  const [value, setValue] = useState(() => {
    const parsed = parseFloat(initialValue);
    return isNaN(parsed) ? parseFloat(min) : parsed;
  });
  const sliderRef = useRef(null);
  const isDraggingRef = useRef(false);

  const minValue = parseFloat(min);
  const maxValue = parseFloat(max);
  const stepValue = parseFloat(step);

  const formatValue = useCallback((val) => {
    const stepDecimals = step.toString().split('.')[1]?.length || 0;
    return Number(val).toFixed(stepDecimals);
  }, [step]);

  const clamp = useCallback((num, min, max) => Math.min(Math.max(num, min), max), []);

  const sanitizeValue = useCallback((val) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) return minValue;
    return clamp(parsed, minValue, maxValue);
  }, [clamp, minValue, maxValue]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const getValueFromMousePosition = (clientX) => {
      const rect = slider.getBoundingClientRect();
      const percent = clamp((clientX - rect.left) / rect.width, 0, 1);
      const rawValue = percent * (maxValue - minValue) + minValue;
      return sanitizeValue(rawValue);
    };

    const updateValue = (clientX) => {
      const newValue = getValueFromMousePosition(clientX);
      setValue(newValue);
      onChange({ target: { value: newValue.toString() } });
    };

    const handleMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      updateValue(clientX);
    };

    const handleStart = (e) => {
      isDraggingRef.current = true;
      handleMove(e);
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
    };

    slider.addEventListener('mousedown', handleStart);
    slider.addEventListener('touchstart', handleStart, { passive: false });

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });

    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      slider.removeEventListener('mousedown', handleStart);
      slider.removeEventListener('touchstart', handleStart);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [minValue, maxValue, stepValue, onChange, clamp, sanitizeValue]);

  const handleInputChange = (e) => {
    const newValue = sanitizeValue(e.target.value);
    setValue(newValue);
    onChange({ target: { value: newValue.toString() } });
  };

  return (
    <div className="flex justify-center touch-none">
      <div className="w-[280px]">
        <label htmlFor={id} className="block mb-1">{label}</label>
        <div className="flex items-center space-x-2">
          <input
            ref={sliderRef}
            id={id}
            type="range"
            min={minValue}
            max={maxValue}
            step={stepValue}
            value={value}
            onChange={handleInputChange}
            className="slider w-[230px] touch-none"
          />
          <span className="w-12 text-right">{formatValue(value)}</span>
        </div>
      </div>
    </div>
  );
};

export default StableSliderComponent;