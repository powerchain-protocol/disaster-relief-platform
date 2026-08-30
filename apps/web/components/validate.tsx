const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const INDEX = new Map([...BASE58].map((char, i) => [char, i] as const));

function decodedLength(input: string) {
  let bytes = [0];
  for (const char of input) {
    const digit = INDEX.get(char);
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

export function validateSolanaAddress(value: string) {
  const input = value.trim();
  if (input.length < 32 || input.length > 44) return { valid: false, message: "Address must contain 32–44 base58 characters." };
  const length = decodedLength(input);
  if (length == null) return { valid: false, message: "Address contains a non-base58 character." };
  return length === 32 ? { valid: true, message: "Valid 32-byte Solana address." } : { valid: false, message: `Address decodes to ${length} bytes instead of 32.` };
}

export function validateSolanaSignature(value: string) {
  const input = value.trim();
  if (input.length < 80 || input.length > 90) return { valid: false, message: "Signature has an invalid base58 length." };
  const length = decodedLength(input);
  if (length == null) return { valid: false, message: "Signature contains a non-base58 character." };
  return length === 64 ? { valid: true, message: "Valid 64-byte Ed25519 signature." } : { valid: false, message: `Signature decodes to ${length} bytes instead of 64.` };
}

export function ValidateAddress({ value }: { value: string }) {
  if (!value.trim()) return null;
  const result = validateSolanaAddress(value);
  return <p className={result.valid ? "validate-ok" : "validate-error"}>{result.message}</p>;
}
