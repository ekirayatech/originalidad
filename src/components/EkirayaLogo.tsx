import React, { useState } from 'react';
import { EKIRAYA_CONFIG } from '../data/ekirayaConfig';

interface EkirayaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export const EkirayaLogo: React.FC<EkirayaLogoProps> = ({
  className = 'h-10 w-auto',
  size = 'md',
  id = 'report-header-logo'
}) => {
  const [failed, setFailed] = useState(false);

  const dimensionClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';

  if (failed) {
    return (
      <div
        id={id}
        className={`rounded-xl bg-gradient-to-br from-red-950 via-slate-900 to-indigo-950 text-amber-400 font-extrabold flex flex-col items-center justify-center shadow-md border border-amber-500/40 shrink-0 select-none ${dimensionClass} ${className}`}
        title="Colegio Bilingüe Ekirayá - CEM"
      >
        <span className="tracking-tighter leading-none">CEM</span>
        <span className="text-[7px] text-slate-300 tracking-widest font-mono">EKIRAYÁ</span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <img
        id={id}
        src={EKIRAYA_CONFIG.logoUrl}
        alt="Colegio Bilingüe Ekirayá"
        className="h-full w-auto object-contain"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </div>
  );
};
