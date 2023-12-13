import {
  assertEquals,
  assertRejects,
  assertThrows,
} from "https://deno.land/std@0.203.0/assert/mod.ts";
import { SimpleAesCbc } from "./mod.ts";

const PRIVATE_KEY = "1234567890123456";

Deno.test("encrypt and decrypt with string as the private key", async () => {
  const stringCrypto = new SimpleAesCbc(PRIVATE_KEY, crypto.subtle);

  const data = "hello my friend";

  const encrypted = await stringCrypto.encryptString(data);

  const decrypted = await stringCrypto.decryptString(encrypted);

  assertEquals(decrypted, data);
});

Deno.test(
  "encrypt and decrypt with Uint8Array as the private key",
  async () => {
    const privateKey = new Uint8Array(16);
    crypto.getRandomValues(privateKey);

    const stringCrypto = new SimpleAesCbc(privateKey, crypto.subtle);

    const data = "hello my friend";

    const encrypted = await stringCrypto.encryptString(data);

    const decrypted = await stringCrypto.decryptString(encrypted);

    assertEquals(decrypted, data);
  }
);

Deno.test(
  "encrypt and decrypt with string as the private key and iv",
  async () => {
    const stringCrypto = new SimpleAesCbc(
      PRIVATE_KEY,
      crypto.subtle,
      PRIVATE_KEY.split("").reverse().join("").slice(0, 16)
    );

    const data = "hello my friend";

    const encrypted = await stringCrypto.encryptString(data);

    const decrypted = await stringCrypto.decryptString(encrypted);

    assertEquals(decrypted, data);
  }
);

Deno.test(
  "encrypt and decrypt with Uint8Array as the private key and iv",
  async () => {
    const privateKey = new Uint8Array(16);
    crypto.getRandomValues(privateKey);

    const stringCrypto = new SimpleAesCbc(
      privateKey,
      crypto.subtle,
      privateKey.toReversed()
    );

    const data = "hello my friend";

    const encrypted = await stringCrypto.encryptString(data);

    const decrypted = await stringCrypto.decryptString(encrypted);

    assertEquals(decrypted, data);
  }
);

Deno.test("should handle decryption between different classes", async () => {
  const stringCrypto1 = new SimpleAesCbc(PRIVATE_KEY, crypto.subtle);

  const stringCrypto2 = new SimpleAesCbc(PRIVATE_KEY, crypto.subtle);

  const data = "hello my friend";

  const encrypted = await stringCrypto1.encryptString(data);

  const decrypted = await stringCrypto2.decryptString(encrypted);

  assertEquals(decrypted, data);
});

Deno.test("should not decrypt with different private keys or ivs", async () => {
  const stringCrypto1 = new SimpleAesCbc(PRIVATE_KEY, crypto.subtle);

  const stringCrypto2 = new SimpleAesCbc(
    PRIVATE_KEY.split("").reverse().join(""),
    crypto.subtle
  );

  const data = "hello my friend";

  const encrypted = await stringCrypto1.encryptString(data);

  assertRejects(() => stringCrypto2.decryptString(encrypted));
});

Deno.test("should throw for invalid key sizes", () => {
  assertThrows(() => new SimpleAesCbc("a".repeat(13), crypto.subtle));
  assertThrows(() => new SimpleAesCbc("a".repeat(34), crypto.subtle));

  assertThrows(
    () => new SimpleAesCbc("a".repeat(16), crypto.subtle, "a".repeat(15))
  );
  assertThrows(
    () => new SimpleAesCbc("a".repeat(16), crypto.subtle, "a".repeat(18))
  );
});
