export async function uploadFilesToStorage(
  files: { images: File[]; videos: File[] }
): Promise<{ urls: string[]; types: string[] }> {
  const allFiles = [...files.images, ...files.videos];
  const urls: string[] = [];
  const types: string[] = [];

  for (const file of allFiles) {
    // Create a byte array from the file
    const bytes = await file.arrayBuffer();
    // You'll need to implement your backend API endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-File-Type': file.type,
        'X-File-Name': file.name,
      },
      body: bytes,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    const { url } = await response.json();
    urls.push(url);
    types.push(file.type);
  }

  return { urls, types };
}