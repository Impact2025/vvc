import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export { cloudinary };

/**
 * Upload a file buffer to Cloudinary.
 * Returns the full upload result including `secure_url`.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: UploadApiOptions = {}
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "vvcgoesuk",
        resource_type: "auto",
        ...options,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}
