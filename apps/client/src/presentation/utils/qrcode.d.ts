declare module "qrcode" {
  interface SvgOptions {
    readonly type: "svg";
    readonly margin?: number;
  }

  export function toString(value: string, options: SvgOptions): Promise<string>;
}
