/* eslint-disable no-console */

export interface IS3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

type S3Module = typeof import('@aws-sdk/client-s3');
let _mod: S3Module | null = null;

async function getModule(): Promise<S3Module> {
  if (!_mod) {
    try {
      _mod = await import('@aws-sdk/client-s3');
    } catch {
      throw new Error(
        '[beardos-toolbox] @aws-sdk/client-s3 is required to use the S3 helpers. ' +
        'Install it: npm i @aws-sdk/client-s3'
      );
    }
  }
  return _mod;
}

type S3ClientInstance = InstanceType<S3Module['S3Client']>;
let client: S3ClientInstance;

export const getClient = async ({ region, accessKeyId, secretAccessKey }: IS3Config): Promise<S3ClientType> => {
  if (!client) {
    const { S3Client } = await getModule();
    client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
  }
  return client;
};

export const putObject = async (config: IS3Config, data: Buffer | string, key: string, contentType?: string) => {
  try {
    const { PutObjectCommand } = await getModule();
    const cl = await getClient(config);
    const params: { Bucket: string; Key: string; Body: Buffer | string; ContentType?: string } = {
      Bucket: config.bucket,
      Key: key,
      Body: typeof data === 'string' ? Buffer.from(data, 'utf-8') : data,
    };
    if (contentType) params.ContentType = contentType;
    return await cl.send(new PutObjectCommand(params));
  } catch (e) {
    console.error('Could not upload object', { error: e });
    throw e;
  }
};

export const getObject = async (config: IS3Config, key: string) => {
  const params = { Bucket: config.bucket, Key: key };
  try {
    const { GetObjectCommand } = await getModule();
    const cl = await getClient(config);
    return await cl.send(new GetObjectCommand(params));
  } catch (e) {
    console.error('Could not get object from s3', { error: e, params });
    throw e;
  }
};

export const listObjects = async (config: IS3Config, prefix: string, Marker?: string) => {
  try {
    const { ListObjectsV2Command } = await getModule();
    const cl = await getClient(config);
    const params: import('@aws-sdk/client-s3').ListObjectsV2CommandInput = {
      Bucket: config.bucket,
      Prefix: prefix,
      ...(Marker ? { StartAfter: Marker } : {}),
    };
    const response = await cl.send(new ListObjectsV2Command(params));
    return { Objects: response.Contents ?? [], Marker: response.NextContinuationToken };
  } catch (e) {
    console.error('Could not list objects', { error: e });
    throw e;
  }
};

export const deleteObject = async (config: IS3Config, Key: string) => {
  const params = { Bucket: config.bucket, Key };
  try {
    const { DeleteObjectCommand } = await getModule();
    const cl = await getClient(config);
    return await cl.send(new DeleteObjectCommand(params));
  } catch (e) {
    console.error('Could not delete object from s3', { error: e, params });
    throw e;
  }
};
