/**
 * Fail-fast env var helpers.
 * Use requireEnv() for secrets needed at request time.
 */

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export function optionalEnv(key: string): string | undefined {
  return process.env[key] || undefined;
}
