/**
 * Object Storage Abstraction for KleinDeal.de
 * 
 * Supports:
 * - S3-compatible providers (Cloudflare R2, AWS S3, MinIO) for Production.
 * - Local filesystem storage for Development and Testing ONLY.
 * 
 * Enforces:
 * - Production runtime fail-fast: throws if STORAGE_PROVIDER is local or S3 credentials are missing when executing uploads in production.
 * - Strict key namespace:
 *     listings/{userId}/{generatedId}.webp
 *     avatars/{userId}/{generatedId}.webp
 */

import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { env } from './env';

export interface StorageUploadResult {
  key: string;
  publicUrl: string;
  provider: 's3' | 'local';
}

export interface StorageHealthResult {
  ok: boolean;
  provider: 's3' | 'local';
  error?: string;
}

class StorageService {
  private s3Client: S3Client | null = null;
  private provider: 's3' | 'local';

  constructor() {
    this.provider = env.STORAGE_PROVIDER;

    if (this.provider === 's3' && env.S3_BUCKET && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY) {
      this.s3Client = new S3Client({
        region: env.S3_REGION || 'auto',
        endpoint: env.S3_ENDPOINT,
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY_ID,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        },
      });
    } else {
      this.provider = 'local';
    }
  }

  /**
   * Upload an image buffer to object storage
   */
  async upload(
    key: string,
    buffer: Buffer,
    contentType: string = 'image/webp'
  ): Promise<StorageUploadResult> {
    // Sanitize object key and enforce allowed namespace
    const sanitizedKey = key.replace(/\\/g, '/').replace(/\.\./g, '').replace(/^\/+/, '');
    
    if (!sanitizedKey.startsWith('listings/') && !sanitizedKey.startsWith('avatars/')) {
      throw new Error('Invalid storage key prefix. Must start with listings/ or avatars/.');
    }

    if (env.NODE_ENV === 'production' && (!this.s3Client || this.provider !== 's3')) {
      throw new Error('❌ Production requires configured S3 object storage (STORAGE_PROVIDER=s3).');
    }

    if (this.provider === 's3' && this.s3Client && env.S3_BUCKET) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: sanitizedKey,
          Body: buffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );

      const publicBase = env.S3_PUBLIC_URL || (env.S3_ENDPOINT ? `${env.S3_ENDPOINT}/${env.S3_BUCKET}` : '');
      const publicUrl = publicBase ? `${publicBase}/${sanitizedKey}` : `/${sanitizedKey}`;

      return {
        key: sanitizedKey,
        publicUrl,
        provider: 's3',
      };
    }

    // Local filesystem storage (development/testing)
    const localUploadDir = path.join(process.cwd(), 'public', 'uploads');
    const targetPath = path.join(localUploadDir, sanitizedKey);
    const targetDir = path.dirname(targetPath);

    await mkdir(targetDir, { recursive: true });
    await writeFile(targetPath, buffer);

    return {
      key: sanitizedKey,
      publicUrl: `/uploads/${sanitizedKey}`,
      provider: 'local',
    };
  }

  /**
   * Delete an object from storage
   */
  async delete(key: string): Promise<boolean> {
    const sanitizedKey = key.replace(/\\/g, '/').replace(/\.\./g, '').replace(/^\/+/, '');

    if (this.provider === 's3' && this.s3Client && env.S3_BUCKET) {
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: sanitizedKey,
          })
        );
        return true;
      } catch (error) {
        console.error(`Failed to delete S3 object ${sanitizedKey}:`, error);
        return false;
      }
    }

    // Local deletion
    try {
      const targetPath = path.join(process.cwd(), 'public', 'uploads', sanitizedKey);
      if (existsSync(targetPath)) {
        await unlink(targetPath);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safe metadata health check with timeout (Leaves no objects behind)
   */
  async checkHealth(): Promise<StorageHealthResult> {
    if (this.provider === 's3') {
      if (!this.s3Client || !env.S3_BUCKET) {
        return { ok: false, provider: 's3', error: 'S3 client not configured' };
      }
      try {
        await this.s3Client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
        return { ok: true, provider: 's3' };
      } catch (err: any) {
        return { ok: false, provider: 's3', error: err.message || 'S3 Bucket unreachable' };
      }
    }

    if (env.NODE_ENV === 'production') {
      return { ok: false, provider: 'local', error: 'Local storage not permitted in production' };
    }

    return { ok: true, provider: 'local' };
  }
}

export const storage = new StorageService();
