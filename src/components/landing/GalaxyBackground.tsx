import React from 'react';

const GalaxyBackground = () => {
  return (
    <div className="fixed inset-0 bg-black pointer-events-none overflow-hidden z-[-1]">
      {/* Nebula Blobs */}
      <div className="absolute top-0 left-0 w-[80vw] h-[80vh] rounded-full bg-blue-500/12 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[70vw] h-[70vh] rounded-full bg-purple-500/15 blur-[100px] translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-1/2 left-1/2 w-[60vw] h-[60vh] rounded-full bg-indigo-700/8 blur-[110px] -translate-x-1/2 -translate-y-1/2" />

      {/* Star Field Layers */}
      <div className="absolute inset-0">
        <div className="stars-layer-1 absolute inset-0" />
        <div className="stars-layer-2 absolute inset-0" />
        <div className="stars-layer-3 absolute inset-0" />
      </div>
    </div>
  );
};

export default GalaxyBackground;
