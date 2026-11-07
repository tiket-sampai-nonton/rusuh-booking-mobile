import { Platform } from "react-native";

import type {
  FileSharePort,
  ShareableFile,
} from "@domain/services/file-share.port";

/** Native file export. Android uses the system folder picker; iOS exports via the share sheet. */
export class ExpoFileShareAdapter implements FileSharePort {
  async save(file: ShareableFile): Promise<void> {
    const FileSystem =
      require("expo-file-system") as typeof import("expo-file-system");
    if (Platform.OS === "android" && FileSystem.StorageAccessFramework) {
      const permission =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permission.granted) throw new Error("Penyimpanan tiket dibatalkan.");
      const uri = await FileSystem.StorageAccessFramework.createFileAsync(
        permission.directoryUri,
        file.fileName,
        file.mimeType,
      );
      await FileSystem.writeAsStringAsync(uri, file.base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return;
    }

    const Sharing = require("expo-sharing") as typeof import("expo-sharing");
    const uri = `${FileSystem.cacheDirectory ?? ""}${file.fileName}`;
    await FileSystem.writeAsStringAsync(uri, file.base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!(await Sharing.isAvailableAsync()))
      throw new Error("Berbagi file tidak tersedia di perangkat ini.");
    await Sharing.shareAsync(uri, {
      mimeType: file.mimeType,
      dialogTitle: "Simpan e-tiket",
    });
  }

  async share(file: ShareableFile): Promise<void> {
    const FileSystem =
      require("expo-file-system") as typeof import("expo-file-system");
    const Sharing = require("expo-sharing") as typeof import("expo-sharing");
    const uri = `${FileSystem.cacheDirectory ?? ""}${file.fileName}`;
    await FileSystem.writeAsStringAsync(uri, file.base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync())
      await Sharing.shareAsync(uri, { mimeType: file.mimeType });
  }
}
