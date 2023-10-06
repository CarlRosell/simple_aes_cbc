import { assertEquals } from "https://deno.land/std@0.203.0/assert/assert_equals.ts";
import { SimpleAesCbc } from "./mod.ts";

Deno.test("encrypt and decrypt", async () => {
  const stringCrypto = new SimpleAesCbc("1234567890123456");

  const data = "hello my friend";

  const encrypted = await stringCrypto.encryptString(data);

  const decrypted = await stringCrypto.decryptString(encrypted);

  assertEquals(decrypted, data);
});
