import crypto from 'crypto-js';

export const generateSignature = (
  method: string,
  path: string,
  body: any,
  timestamp: number,
  apiSecret: string
): string => {
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  const message = `${method}|${path}|${bodyStr}|${timestamp}`;
  return crypto.HmacSHA256(message, apiSecret).toString();
};

export const getTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const createSignedHeaders = (
  method: string,
  path: string,
  body: any,
  merchantId: string,
  apiSecret: string
): Record<string, string> => {
  const timestamp = getTimestamp();
  const signature = generateSignature(method, path, body, timestamp, apiSecret);

  return {
    'X-Signature': signature,
    'X-Merchant-Id': merchantId,
    'X-Timestamp': timestamp.toString(),
  };
};

export default {
  generateSignature,
  getTimestamp,
  createSignedHeaders,
};
