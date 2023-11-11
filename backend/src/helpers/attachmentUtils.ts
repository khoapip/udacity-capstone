import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class AttachmentUtils {

  constructor(
    private readonly s3: AWS.S3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly s3Name: string = process.env.S3_BUCKET_ATTACHMENT,
    private readonly expirationPeriod: number = parseInt(process.env.SIGNED_URL_EXPIRATION)) {
  }

  getDownloadUrl(imageId: string): string {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.s3Name,
      Key: imageId
    })
  }

  getUploadUrl(imageId: string): string {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.s3Name,
      Key: imageId,
      Expires: this.expirationPeriod
    })
  }

  async deleteAttachment(todoId: string) {
    await this.s3.deleteObject({
      Bucket: this.s3Name,
      Key: todoId
    }).promise()
  }
}

