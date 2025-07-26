import os
import base64

def read_file_as_bytes(file_path: str) -> bytes:
    """Read file as bytes"""
    with open(file_path, 'rb') as f:
        return f.read()

def save_bytes_to_txt(byte_data: bytes, output_path: str):
    """Save byte data to a text file (as base64)"""
    base64_str = base64.b64encode(byte_data).decode('utf-8')
    with open(output_path, 'w') as f:
        f.write(base64_str)

def process_media_files(media_files: list, output_dir: str):
    for file_path in media_files:
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            continue

        # Get byte stream
        byte_data = read_file_as_bytes(file_path)

        # Print as base64 (more readable than raw bytes)
        base64_str = base64.b64encode(byte_data).decode('utf-8')
        print(f"\n📂 File: {os.path.basename(file_path)}\n🔢 Base64 Bytes (first 300 chars):\n{base64_str[:300]}...\n")

        # Save to .txt
        filename = os.path.splitext(os.path.basename(file_path))[0]
        output_path = os.path.join(output_dir, f"{filename}_bytes.txt")
        save_bytes_to_txt(byte_data, output_path)
        print(f"✅ Saved byte stream to: {output_path}")

# --------------------
# Example usage:
media_files = [
    r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_1.mp4",
    r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_image2.jpg",
    r"D:\Projects\GenAI\Metropulse\Backend\local_media\bassi_image1.jpg"
]

output_dir = r"D:\Projects\GenAI\Metropulse\Backend\local_media\encoded_bytes"
os.makedirs(output_dir, exist_ok=True)

process_media_files(media_files, output_dir)
