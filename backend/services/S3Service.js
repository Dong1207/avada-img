import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

/**
 * S3Service - Class to handle AWS S3 operations using AWS SDK v3
 */
class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  /**
   * Upload file to S3
   * @param {Buffer} fileBuffer - File buffer to upload
   * @param {string} fileName - File name (key) in S3
   * @param {string} contentType - Content type (e.g., 'image/webp')
   * @returns {Promise<Object>} Upload result
   *
   * Note: ACL is not used as modern S3 buckets use bucket policies instead.
   * Ensure your bucket has a bucket policy that allows public read access.
   */
  async uploadFile(fileBuffer, fileName, contentType = "image/webp") {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileBuffer,
      StorageClass: "INTELLIGENT_TIERING",
      ContentType: contentType,
    });

    try {
      const result = await this.s3Client.send(command);
      return result;
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   * @param {string} fileName - File name (key) to delete
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(fileName) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    try {
      const result = await this.s3Client.send(command);
      return result;
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Get file URL from S3
   * @param {string} fileName - File name (key)
   * @returns {string} Public URL of the file
   */
  getFileUrl(fileName) {
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  }

  /**
   * Check if file exists in S3
   * @param {string} fileName - File name (key) to check
   * @returns {Promise<boolean>}
   */
  async fileExists(fileName) {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404)
        return false;

      throw error;
    }
  }
}

export default S3Service;
