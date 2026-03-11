type IconButtonOptions = {
    ariaLabel: string;
    onClick?: (() => void) | undefined;
};
export declare function createIconButton(icon: SVGSVGElement, opts: IconButtonOptions): HTMLButtonElement;
export declare function createCloseButton(background: string, options?: {
    onClick?: () => void;
    alignEnd?: boolean;
}): HTMLButtonElement;
export {};
//# sourceMappingURL=buttons.d.ts.map