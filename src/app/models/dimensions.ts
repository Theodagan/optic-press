export interface Dimensions {
  readonly width: number;
  readonly height: number;
}

export interface ResizeDimensions {
  readonly input: Dimensions;
  readonly output: Dimensions;
  readonly upscaled: boolean;
}
