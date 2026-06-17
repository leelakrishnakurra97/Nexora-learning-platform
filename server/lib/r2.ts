import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.CF_R2_ACCOUNT_ID || '';
const accessKeyId = process.env.CF_R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.CF_R2_BUCKET_NAME || 'nexora-lms-uploads';
const publicUrl = process.env.CF_R2_PUBLIC_URL || '';

// Cloudflare R2 S3-compatible client
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const R2_BUCKET = bucketName;
export const R2_PUBLIC_URL = publicUrl;

/**
 * Upload a file buffer to Cloudflare R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete a file from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }),
  );
}

/**
 * Generate a signed download URL (expires in 1 hour)
 */
export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key });
  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Derive storage key from upload context
 */
export function buildStorageKey(
  type: 'notes' | 'assignment' | 'video',
  classTitle: string,
  subjectTitle: string,
  filename: string,
): string {
  const sanitize = (s: string) =>
    s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${type}/${sanitize(classTitle)}/${sanitize(subjectTitle)}/${Date.now()}-${filename}`;
}
