import React, { useRef, useEffect } from 'react';

const StableSliderComponent = ({ curvature, handleCurvatureChange }) => {
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
      const value = percent * (max - min) + min;
      handleCurvatureChange({ target: { value } });
    };

    slider.addEventListener('touchmove', handleTouchMove, { passive: false });
    slider.addEventListener('touchstart', preventDrag, { passive: false });

    return () => {
      slider.removeEventListener('touchmove', handleTouchMove);
      slider.removeEventListener('touchstart', preventDrag);
    };
  }, [handleCurvatureChange]);

  return (
    <div className="flex justify-center touch-none">
      <div className="w-[280px]">
        <label htmlFor="curvature" className="block mb-2">Curvature:</label>
        <div className="flex items-center space-x-2">
          <input
            ref={sliderRef}
            id="curvature"
            type="range"
            min="0.6"
            max="3"
            step="0.01"
            value={curvature}
            onChange={handleCurvatureChange}
            className="slider w-[280px] touch-none"
          />
          <span className="w-12 text-right">{Number(curvature).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default StableSliderComponent