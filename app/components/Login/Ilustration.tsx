"use client";

import img from "./../../../public/bg-login.png"

import React from "react";

const Illustration: React.FC = () => {
  return (
    <div className="w-full md:w-1/2 bg-pink-200 flex items-center justify-center">
      <img
        src={img.src}
        className="w-full h-full object-cover"
        height={500}
        alt="Illustration"
        width={500}
      />
    </div>
  );
};

export default Illustration;