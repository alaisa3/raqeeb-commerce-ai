import React from "react";

interface RaqeebLogoProps {
  className?: string;
  size?: number;
}

export default function RaqeebLogo({ className = "", size = 48 }: RaqeebLogoProps) {
  return (
    <svg 
      id="raqeeb-brand-logo-svg"
      width={size} 
      height={size} 
      viewBox="0 0 256 256" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Curved Arrow (Top-Right direction) */}
      <path 
        d="M 85 45 C 110 32, 145 32, 170 45" 
        stroke="#0ea5e9" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
      <path 
        d="M 164 36 L 174 46 L 164 54" 
        stroke="#0ea5e9" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Curved Arrow (Left-Bottom to Top-Right back outer circle) */}
      <path 
        d="M 58 120 C 50 145, 58 175, 80 195 C 100 212, 128 220, 150 205" 
        stroke="#0ea5e9" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
      <path 
        d="M 52 130 L 59 116 L 68 128" 
        stroke="#0ea5e9" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Left/Bottom small arrow loop element */}
      <path 
        d="M 216 130 C 220 155, 210 180, 190 195 L 175 180" 
        stroke="#0ea5e9" 
        strokeWidth="5" 
        strokeLinecap="round" 
      />

      {/* Main Shield outline */}
      <path 
        d="M 68 80 C 68 80, 128 65, 188 80 C 188 115, 188 175, 128 215 C 68 175, 68 115, 68 80 Z" 
        stroke="#0f172a" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="#ffffff"
      />

      {/* Three teal dots on top-left of the eye */}
      <circle cx="95" cy="98" r="5" fill="#0ea5e9" />
      <circle cx="110" cy="93" r="5" fill="#0ea5e9" />
      <circle cx="125" cy="91" r="5" fill="#0ea5e9" />

      {/* Eye shape inside shield */}
      <path 
        d="M 88 135 C 104 112, 152 112, 168 135 C 152 158, 104 158, 88 135 Z" 
        stroke="#0f172a" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Iris */}
      <circle cx="128" cy="135" r="18" fill="#0ea5e9" />
      {/* Pupil */}
      <circle cx="128" cy="135" r="9" fill="#0f172a" />
      {/* Reflection highlight */}
      <circle cx="132" cy="131" r="3" fill="#ffffff" />

      {/* Decorative swoop under the eye connecting to the box */}
      <path 
        d="M 128 153 C 145 165, 155 175, 165 195" 
        stroke="#0ea5e9" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />

      {/* Isometric cube box at the bottom */}
      {/* Center of box at cx=128, cy=185 */}
      {/* Left face */}
      <path 
        d="M 128 185 L 108 174 L 108 196 L 128 207 Z" 
        fill="#0f172a" 
        stroke="#0f172a" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      {/* Right face */}
      <path 
        d="M 128 185 L 148 174 L 148 196 L 128 207 Z" 
        fill="#1e293b" 
        stroke="#0f172a" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      {/* Top face */}
      <path 
        d="M 128 185 L 148 174 L 128 163 L 108 174 Z" 
        fill="#475569" 
        stroke="#0f172a" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
