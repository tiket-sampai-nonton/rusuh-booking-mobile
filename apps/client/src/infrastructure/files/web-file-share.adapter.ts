import type {
  FileSharePort,
  ShareableFile,
} from "@domain/services/file-share.port";

/** Browser file export using the download attribute and Web Share when available. */
export class WebFileShareAdapter implements FileSharePort {
  async save(file: ShareableFile): Promise<void> {
    const bytes = Uint8Array.from(atob(file.base64), (character) =>
      character.charCodeAt(0),
    );
    const url = URL.createObjectURL(new Blob([bytes], { type: file.mimeType }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.fileName;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async share(file: ShareableFile): Promise<void> {
    const bytes = Uint8Array.from(atob(file.base64), (character) =>
      character.charCodeAt(0),
    );
    const blob = new Blob([bytes], { type: file.mimeType });
    const nativeShare = navigator.share;
    if (nativeShare && typeof File !== "undefined") {
      await nativeShare.call(navigator, {
        files: [new File([blob], file.fileName, { type: file.mimeType })],
      });
      return;
    }
    await this.save(file);
  }
}
