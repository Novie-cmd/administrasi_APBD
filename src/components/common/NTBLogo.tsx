import React, { useState } from 'react';

interface NTBLogoProps {
  className?: string;
  size?: number;
}

export const NTBLogo: React.FC<NTBLogoProps> = ({ className = '', size }) => {
  const style = size ? { width: size, height: size } : undefined;
  const [imageError, setImageError] = useState(false);

  return (
    <div
      style={style}
      className={`relative flex items-center justify-center overflow-hidden rounded-xl p-0.5 ${className}`}
    >
      {!imageError ? (
        <img
          src="/app-logo.png"
          alt="Lambang Resmi Provinsi Nusa Tenggara Barat"
          className="h-full w-full object-contain drop-shadow-md"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 200 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full object-contain drop-shadow-md"
        >
          {/* Official Royal Blue Shield */}
          <path
            d="M20 10 H180 V150 C180 195 100 230 100 230 C100 230 20 195 20 150 Z"
            fill="#0b1b85"
            stroke="#000000"
            strokeWidth="3.5"
          />
          {/* Inner Golden Star */}
          <polygon
            points="100,20 105,35 120,35 108,44 112,58 100,50 88,58 92,44 80,35 95,35"
            fill="#FFD700"
            stroke="#B8860B"
            strokeWidth="0.8"
          />
          {/* Center Circular Mountain & Deer */}
          <circle cx="100" cy="115" r="48" fill="#0080FF" stroke="#FFFFFF" strokeWidth="2.5" />
          <polygon points="100,75 135,125 65,125" fill="#334155" />
          <polygon points="100,75 109,87 91,87" fill="#FFFFFF" />
          <path d="M52 125 H148 C145 150 125 163 100 163 C75 163 55 150 52 125 Z" fill="#16A34A" />
          {/* Golden Deer Silhouette */}
          <path
            d="M90 120 C92 110 98 108 102 112 L108 110 C109 113 107 116 104 118 L114 122 C115 125 111 127 106 125 L98 128 L94 135 L90 134 L93 127 Z"
            fill="#FFD700"
          />
          {/* White Banner "NUSA TENGGARA BARAT" */}
          <path
            d="M30 195 Q100 185 170 195 L165 210 Q100 200 35 210 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="1.5"
          />
          <text
            x="100"
            y="204"
            fill="#000000"
            fontSize="7.5"
            fontWeight="900"
            fontFamily="sans-serif"
            textAnchor="middle"
          >
            NUSA TENGGARA BARAT
          </text>
        </svg>
      )}
    </div>
  );
};


