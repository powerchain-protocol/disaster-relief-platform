const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const INDEX = new Map([...BASE58].map((char, i) => [char, i] as const));

export function validateSolanaAddress(value: string) {
  const input = value.trim();
  if (input.length < 32 || input.length > 44) return { valid: false, message: "Address must be 32–44 base58 characters." };
  let bytes = [0];
  for (const char of input) {
    const digit = INDEX.get(char);
    if (digit == null) return { valid: false, message: "Address contains a non-base58 character." };
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
  return bytes.length === 32
    ? { valid: true, message: "Valid Solana address." }
    : { valid: false, message: "Address does not decode to 32 bytes." };
}

export function ValidateAddress({ value }: { value: string }) {
  if (!value.trim()) return null;
  const result = validateSolanaAddress(value);
  return <p className={result.valid ? "validate-ok" : "validate-error"}>{result.message}</p>;
}
