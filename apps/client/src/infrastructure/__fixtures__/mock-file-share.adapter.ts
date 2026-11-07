/**
 * MockFileShareAdapter — no-op adapter for `FileSharePort`.
 *
 * Bound under `EXPO_PUBLIC_USE_MOCKS`. Framework-free; records the last file so
 * a demo/test can assert the QR download/share flow fired without a real file
 * system or browser Blob.
 */
import type {
  FileSharePort,
  ShareableFile,
} from "@domain/services/file-share.port";

export class MockFileShareAdapter implements FileSharePort {
  readonly saved: ShareableFile[] = [];
  readonly shared: ShareableFile[] = [];

  async save(file: ShareableFile): Promise<void> {
    this.saved.push(file);
  }

  async share(file: ShareableFile): Promise<void> {
    this.shared.push(file);
  }
}
