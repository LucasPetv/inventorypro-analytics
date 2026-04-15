import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16'
  };

  const textSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl'
  };

  // Logo-Pfad für das PNG-Bild
  const logoPath = './assets/logo.png';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoPath}
        alt="InventoryPro Analytics Logo"
        className={`
          ${sizeClasses[size]}
          object-contain
          drop-shadow-lg
        `}
        onError={(e) => {
          // Fallback falls das Bild nicht geladen werden kann
          console.warn('Logo could not be loaded');
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-slate-800 ${textSizes[size]}`}>
            InventoryPro
          </h1>
          <span className="text-xs text-slate-600 -mt-1">
            Analytics
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
