/* eslint-disable no-console */
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, ListObjectsV2CommandInput, DeleteObjectCommand } from "@aws-sdk/client-s3";
let client: S3Client;

export interface IS3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export const getClient = ({ region, accessKeyId, secretAccessKey }: IS3Config) => {
  if (!client) {
    client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
  }

  return client;
};

export const putObject = async(config: IS3Config, data: Buffer | string, key: string, contentType?: string) => {
  try {
    const cl = getClient(config);

    const params = {
      Bucket: config.bucket,
      Key: key,
      Body: typeof data === 'string' ? Buffer.from(data, "utf-8") : data
    };
    if(contentType) {
      params.ContentType = contentType
    }

    return await cl.send(new PutObjectCommand(params));
  } catch (e) {
    console.error('Could not upload json file', { error: e });
    throw e;
  }
};

export const getObject = async(config: IS3Config, key: string) => {
  const params = {
    Bucket: config.bucket,
    Key: key,
  };

  try {
    const cl = getClient(config);

    return await cl.send(new GetObjectCommand(params));
  } catch (e) {
    console.error('Could not get object from s3', { error: e, params });
    throw e;
  }
};

export const listObjects = async(config: IS3Config, prefix: string, Marker?: string) => {
  const params: ListObjectsV2CommandInput = {
    Bucket: config.bucket,
    Prefix: prefix,
  };
  if (Marker) {
    params.StartAfter = Marker;
  }
  try {
    const cl = getClient(config);

    const response = await cl.send(new ListObjectsV2Command(params));
    return { Objects: (response.Contents ?? []), Marker: response.NextContinuationToken };
  } catch (e) {
    console.error('Could not upload json file', { error: e });
    throw e;
  }
};

export const deleteObject = async(config: IS3Config, Key: string) => {
  const params = {
    Bucket: config.bucket,
    Key,
  };

  try {
    const cl = getClient(config);

    return await cl.send(new DeleteObjectCommand(params));
  } catch (e) {
    console.error('Could not delete object from s3', { error: e, params });
    throw e;
  }
};
