export async function uploadFilesToStorage(
  files: { images: File[]; videos: File[] }
): Promise<{
  mediaFiles: {
    name: string;
    type: string;
    mimeType: string;
    size: number;
    bytes: Uint8Array;
  }[];
}> {
  const allFiles = [...files.images, ...files.videos];
  const mediaFiles: {
    name: string;
    type: string;
    mimeType: string;
    size: number;
    bytes: Uint8Array;
  }[] = [];

  for (const file of allFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer); // Convert to byte array

    mediaFiles.push({
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      mimeType: file.type,
      size: file.size,
      bytes,
    });
  }

  return { mediaFiles };
}
