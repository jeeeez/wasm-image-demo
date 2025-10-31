declare module 'pica' {
  interface PicaResizeOptions {
    quality?: number;
    alpha?: boolean;
    unsharpAmount?: number;
    unsharpRadius?: number;
    unsharpThreshold?: number;
    cancelToken?: Promise<any>;
  }

  class Pica {
    constructor(options?: any);
    resize(
      from: HTMLCanvasElement | HTMLImageElement,
      to: HTMLCanvasElement,
      options?: PicaResizeOptions
    ): Promise<HTMLCanvasElement>;
    resizeBuffer(options: any): Promise<Uint8Array>;
    toBlob(canvas: HTMLCanvasElement, mimeType?: string, quality?: number): Promise<Blob>;
  }

  export default Pica;
}

