/**
 * Bitigey Design Studio - TypeScript Definitions
 * Author: Tunahan Haksever
 */

export type LayerType = 'rect' | 'circle' | 'triangle' | 'star' | 'text' | 'image' | 'brush' | 'line' | 'arrow';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface ColorStop {
  offset: number;
  color: string;
}

export interface ShadowConfig {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface FilterConfig {
  brightness: number; // 0 - 200 (100 default)
  contrast: number;   // 0 - 200 (100 default)
  saturate: number;   // 0 - 200 (100 default)
  hueRotate: number;  // 0 - 360 deg
  blur: number;       // 0 - 20 px
  sepia: number;      // 0 - 100 %
  grayscale: number;  // 0 - 100 %
  invert: number;     // 0 - 100 %
}

export interface LayerItem extends BoundingBox {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  shadow?: ShadowConfig;
  
  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;

  // Image specific
  imageSrc?: string;
  filters?: FilterConfig;
  aspectRatio?: number;

  // Path / Brush specific
  points?: Array<{ x: number; y: number }>;
}

export interface DesignProject {
  version: string;
  title: string;
  author: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  layers: LayerItem[];
  createdAt: string;
  updatedAt: string;
}
