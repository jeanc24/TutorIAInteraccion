'use client';

import { getLetterImagePath } from '@/lib/alphabet';
import { getReferenceFigureConfig, ReferenceFigureVariant } from '@/lib/referenceDisplay';

interface LetterReferenceFigureProps {
  letter: string;
  alt: string;
  variant?: ReferenceFigureVariant;
  className?: string;
}

export default function LetterReferenceFigure({
  letter,
  alt,
  variant = 'full',
  className = '',
}: LetterReferenceFigureProps) {
  const config = getReferenceFigureConfig(variant);

  return (
    <div className={[config.frameClassName, className].filter(Boolean).join(' ')}>
      <div className={config.boxClassName}>
        <img
          src={getLetterImagePath(letter)}
          alt={alt}
          className={config.imageClassName}
        />
      </div>
    </div>
  );
}
