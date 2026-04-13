export type ReferenceFigureVariant = 'full' | 'compact' | 'card';

export interface ReferenceFigureConfig {
  frameClassName: string;
  boxClassName: string;
  imageClassName: string;
}

const BASE_BOX_CLASS_NAME =
  'bg-white rounded-xl border border-stone-200 flex items-center justify-center overflow-hidden shadow-sm';

const BASE_IMAGE_CLASS_NAME = 'w-full h-full object-contain object-center p-2';

export function getReferenceFigureConfig(variant: ReferenceFigureVariant): ReferenceFigureConfig {
  switch (variant) {
    case 'full':
      return {
        frameClassName: 'w-40 h-40 sm:w-52 sm:h-52 mx-auto mb-4',
        boxClassName: BASE_BOX_CLASS_NAME,
        imageClassName: BASE_IMAGE_CLASS_NAME,
      };
    case 'compact':
      return {
        frameClassName: 'w-16 h-16 sm:w-24 sm:h-24',
        boxClassName: BASE_BOX_CLASS_NAME,
        imageClassName: BASE_IMAGE_CLASS_NAME,
      };
    case 'card':
      return {
        frameClassName: 'w-28 h-28 sm:w-36 sm:h-36 mx-auto',
        boxClassName: BASE_BOX_CLASS_NAME,
        imageClassName: BASE_IMAGE_CLASS_NAME,
      };
    default:
      return {
        frameClassName: 'w-16 h-16 sm:w-24 sm:h-24',
        boxClassName: BASE_BOX_CLASS_NAME,
        imageClassName: BASE_IMAGE_CLASS_NAME,
      };
  }
}
