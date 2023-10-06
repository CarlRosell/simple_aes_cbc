# simple_aes_cbc

This is a TypeScript module that provides a simple class for encryption and decryption functionality.
It uses the `AES-CBC`-algorithm and depends on the global `crypto`, `atob` and `btoa` functions to perform the encryption and decryption, so it can be used in `deno >= 1.15` and `node >= 16.0.0` .

## Installation

### deno

```typescript
import { SimpleAesCbc } from "https://deno.land/x/simple_aes_cbc/mod.ts";
```

### node

```
npm install simple-aes-cbc
bun install simple-aes-cbc
yarn install simple-aes-cbc

... etc
```

## Usage

Here's an example of how to use this module:

```typescript
import { SimpleAesCbc } from "https://deno.land/x/simple_aes_cbc/mod.ts";

const stringCrypto = new SimpleAesCbc("1234567890123456");

const data = "hello my friend";

const encrypted = await stringCrypto.encryptString(data);

const decrypted = await stringCrypto.decryptString(encrypted);

console.log(decrypted); // "hello my friend"
```

## API

### `new SimpleAesCbc(privateKey: string)`

This is the constructor of the `SimpleAesCbc` class. It takes a `privateKey` as a parameter, which is used to encrypt and decrypt the data.

#### `encrypt(data: BufferSource): Promise<ArrayBuffer>`

This method encrypts the given data.

#### `decrypt(data: BufferSource): Promise<ArrayBuffer>`

This method decrypts the given data.

#### `encryptString(data: string): Promise<string>`

This will encrypt the given string and wrap transform it to base64.

#### `decryptString(data: string): Promise<string>`

This will decrypt the given base64 string and transform it to a normal string.

## License

This module is licensed under the MIT License.
