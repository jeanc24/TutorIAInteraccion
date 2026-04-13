"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferenceFigureConfig = getReferenceFigureConfig;
var BASE_BOX_CLASS_NAME = 'bg-white rounded-xl border border-stone-200 flex items-center justify-center overflow-hidden shadow-sm';
var BASE_IMAGE_CLASS_NAME = 'w-full h-full object-contain object-center p-2';
function getReferenceFigureConfig(variant) {
    switch (variant) {
        case 'full':
            return {
                frameClassName: 'w-52 h-52 mx-auto mb-4',
                boxClassName: BASE_BOX_CLASS_NAME,
                imageClassName: BASE_IMAGE_CLASS_NAME,
            };
        case 'compact':
            return {
                frameClassName: 'w-24 h-24',
                boxClassName: BASE_BOX_CLASS_NAME,
                imageClassName: BASE_IMAGE_CLASS_NAME,
            };
        case 'card':
            return {
                frameClassName: 'w-36 h-36 mx-auto',
                boxClassName: BASE_BOX_CLASS_NAME,
                imageClassName: BASE_IMAGE_CLASS_NAME,
            };
        default:
            return {
                frameClassName: 'w-24 h-24',
                boxClassName: BASE_BOX_CLASS_NAME,
                imageClassName: BASE_IMAGE_CLASS_NAME,
            };
    }
}
