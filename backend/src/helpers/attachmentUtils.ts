import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const s3 = new AWS.S3({ signatureVersion: 'v4' })
const Bucket = process.env.ATTACHMENT_S3_BUCKET
const Expires = process.env.SIGNED_URL_EXPIRATION
const logger = createLogger('AttachmentUtils')

export const getAttachmentPresignedUrl = (Key: string) => {
    logger.info('Generating presigned file upload URL')
    return s3.getSignedUrl('putObject', {
        Bucket,
        Key,
        Expires: Number(Expires)
    })
}