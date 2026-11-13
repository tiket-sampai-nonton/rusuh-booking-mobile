declare module "qrcode" {
  interface QrModules {
    readonly size: number;
    get(row: number, column: number): boolean;
  }

  interface QrSymbol {
    readonly modules: QrModules;
  }

  interface SvgOptions {
    readonly type: "svg";
    readonly margin?: number;
  }

  export function toString(value: string, options: SvgOptions): Promise<string>;
  export function create(
    value: string,
    options?: { readonly errorCorrectionLevel?: "L" | "M" | "Q" | "H" },
  ): QrSymbol;
}
