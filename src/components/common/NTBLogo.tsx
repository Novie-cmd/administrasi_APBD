import React from 'react';

interface NTBLogoProps {
  className?: string;
  size?: number;
}

export const NTBLogo: React.FC<NTBLogoProps> = ({ className = '', size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      style={style}
      className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-1 shadow-lg ring-1 ring-emerald-500/50 ${className}`}
    >
      <svg
        viewBox="10 2 180 236"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-contain drop-shadow-md"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#065F46" />
            <stop offset="50%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Outer Gold Frame Shield */}
        <path
          d="M100 4 L188 34 V128 C188 186 142 225 100 238 C58 225 12 186 12 128 V34 L100 4 Z"
          fill="url(#goldGrad)"
          stroke="#FEF08A"
          strokeWidth="2"
        />

        {/* Inner Emerald Field */}
        <path
          d="M100 12 L180 39 V125 C180 180 137 217 100 229 C63 217 20 180 20 125 V39 L100 12 Z"
          fill="url(#shieldGrad)"
          stroke="#FBBF24"
          strokeWidth="2.5"
        />

        {/* Fine Inner Gold Accent Line */}
        <path
          d="M100 20 L172 45 V122 C172 172 132 208 100 220 C68 208 28 172 28 122 V45 L100 20 Z"
          fill="none"
          stroke="#FDE047"
          strokeWidth="1"
          strokeDasharray="5 2"
          opacity="0.8"
        />

        {/* Bintang Emas (Golden Star) - Top Symbol */}
        <polygon
          points="100,26 104.5,39.5 119,39.5 107.5,48 112,61.5 100,53 88,61.5 92.5,48 81,39.5 95.5,39.5"
          fill="url(#goldGrad)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />

        {/* Gunung Rinjani (Mountain Peak) */}
        <polygon points="100,68 148,142 52,142" fill="url(#mountainGrad)" />
        <polygon points="100,68 132,142 68,142" fill="#047857" />
        <polygon points="100,68 100,142 52,142" fill="#059669" opacity="0.6" />
        {/* Mountain Snow Peak Highlight */}
        <polygon points="100,68 109,84 91,84" fill="#ECFDF5" opacity="0.9" />

        {/* Rice & Cotton Wreath Arcs */}
        <path
          d="M42 118 C42 168 92 192 100 193 C108 192 158 168 158 118"
          fill="none"
          stroke="#FDE047"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M50 148 C70 166 130 166 150 148"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Deer / Menjangan Horn Symbol */}
        <path
          d="M80 135 L100 115 L120 135"
          fill="none"
          stroke="#FEF08A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Base Banner "NTB BERSAING" / NTB */}
        <path
          d="M44 190 H156 V214 H44 Z"
          fill="#1e293b"
          stroke="url(#goldGrad)"
          strokeWidth="2"
        />
        <rect x="48" y="193" width="104" height="18" fill="#022c22" rx="2" />
        <text
          x="100"
          y="206"
          fill="#FDE047"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1"
          textAnchor="middle"
        >
          NUSA TENGGARA BARAT
        </text>
      </svg>
    </div>
  );
};

