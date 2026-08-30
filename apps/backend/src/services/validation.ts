const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_INDEX = new Map([...BASE58].map((char, index) => [char, index] as const));

export function isValidSolanaAddress(value: string) {
  const input = value.trim();
  if (input.length < 32 || input.length > 44) return false;
  let bytes = [0];
  for (const char of input) {
    const digit = BASE58_INDEX.get(char);
    if (digit == null) return false;
    let carry = digit;
    for (let i = 0; i < bytes.length; i += 1) {
      const next = bytes[i] * 58 + carry;
      bytes[i] = next & 0xff;
      carry = next >> 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (const char of input) {
    if (char !== "1") break;
    bytes.push(0);
  }
  while (bytes.length > 1 && bytes[bytes.length - 1] === 0) bytes.pop();
  return bytes.length === 32;
}

export function requireSolanaAddress(value: string, field = "address") {
  if (!isValidSolanaAddress(value)) {
    const error = new Error(`Invalid Solana ${field}`) as Error & { statusCode?: number; code?: string };
    error.statusCode = 400;
    error.code = "INVALID_SOLANA_ADDRESS";
    throw error;
  }
  return value.trim();
}


function decodedBase58Length(value: string) {
  const input = value.trim();
  if (!input) return null;
  let bytes = [0];
  for (const char of input) {
    const digit = BASE58_INDEX.get(char);
    if (digit == null) return null;
    let carry = digit;
    for (let i = 0; i < bytes.length; i += 1) {
      const next = bytes[i] * 58 + carry;
      bytes[i] = next & 0xff;
      carry = next >> 8;
    }
    while (carry > 0) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  for (const char of input) { if (char !== "1") break; bytes.push(0); }
  while (bytes.length > 1 && bytes[bytes.length - 1] === 0) bytes.pop();
  return bytes.length;
}

export function isValidSolanaSignature(value: string) {
  const input = value.trim();
  return input.length >= 80 && input.length <= 90 && decodedBase58Length(input) === 64;
}

export function requireSolanaSignature(value: string, field = "signature") {
  if (!isValidSolanaSignature(value)) {
    const error = new Error(`Invalid Solana ${field}`) as Error & { statusCode?: number; code?: string };
    error.statusCode = 400;
    error.code = "INVALID_SOLANA_SIGNATURE";
    throw error;
  }
  return value.trim();
}
