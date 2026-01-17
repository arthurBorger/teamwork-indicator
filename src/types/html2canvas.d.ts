declare module 'html2canvas' {
  export default function html2canvas(
    element: HTMLElement,
    options?: {
      backgroundColor?: string;
      scale?: number;
      // add more options if you want, or just use `any` here
      [key: string]: unknown;
    }
  ): Promise<HTMLCanvasElement>;
}