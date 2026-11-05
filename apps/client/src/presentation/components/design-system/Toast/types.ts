export type ToastVariant = "default" | "success" | "error";

export interface ToastData {
  readonly id: string;
  readonly message: string;
  readonly variant: ToastVariant;
  readonly duration: number;
}
