export type FieldResult<T> = {
  value: T;
  raw?: string;
  confidence: number;
};

export type ImageInput = string | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | Blob | File;