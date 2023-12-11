const ALGORITHM = "AES-CBC";

type Subtle = {
  importKey: SubtleCrypto["importKey"];
  encrypt: SubtleCrypto["encrypt"];
  decrypt: SubtleCrypto["decrypt"];
};

function get_uint8_array(input: Uint8Array | string) {
  if (input instanceof Uint8Array) {
    return input;
  } else if (typeof input === "string") {
    return new TextEncoder().encode(input);
  } else {
    throw new Error("Invalid input key type, must be string or Uint8Array.");
  }
}

/**
 * A simple wrapper for WebCrypto which uses the AES-CBC algorithm.
 * @class SimpleAesCbc
 */
export class SimpleAesCbc {
  private private_key: Uint8Array;
  private subtle: Subtle;
  private iv: Uint8Array;
  private crypto_key: CryptoKey | undefined;

  /**
   * Creates an instance of SimpleAesCbc.
   * @param {Uint8Array | string} private_key The private key to use for encryption and decryption.
   * @param {Subtle} subtle The WebCrypto Subtle object to use for encryption and decryption.
   * @param {Uint8Array | string} [iv] The initialization vector to use for encryption and decryption.
   * If not provided, the private key will be used as the initialization vector.
   * @throws {Error} If the key length is not 16 bytes.
   */
  constructor(
    private_key: Uint8Array | string,
    subtle: Subtle,
    iv?: Uint8Array | string
  ) {
    this.subtle = subtle;

    this.private_key = get_uint8_array(private_key);

    if (iv) {
      this.iv = get_uint8_array(iv);
    } else {
      this.iv = this.private_key;
    }

    if (this.iv.length !== 16 || this.private_key.length !== 16) {
      throw new Error("Invalid key length, must be 16 bytes.");
    }
  }

  /**
   * Gets the CryptoKey object to use for encryption and decryption.
   * @returns {Promise<CryptoKey>} The CryptoKey object to use for encryption and decryption.
   */
  private async get_crypto_key(): Promise<CryptoKey> {
    if (this.crypto_key) {
      return this.crypto_key;
    }

    this.crypto_key = await this.subtle.importKey(
      "raw",
      this.private_key,
      {
        name: ALGORITHM,
      },
      false,
      ["encrypt", "decrypt"]
    );

    return this.crypto_key;
  }

  /**
   * Encrypts the given data using the private key.
   * @param {BufferSource} data The data to encrypt.
   * @returns {Promise<ArrayBuffer>} The encrypted data.
   * @throws {Error} If the data could not be encrypted.
   */
  async encrypt(data: BufferSource): Promise<ArrayBuffer> {
    const key = await this.get_crypto_key();
    return await this.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: this.iv,
      },
      key,
      data
    );
  }

  /**
   * Decrypts the given data using the private key.
   * @param {BufferSource} data The data to decrypt.
   * @returns {Promise<ArrayBuffer>} The decrypted data.
   * @throws {Error} If the data could not be decrypted.
   */
  async decrypt(data: BufferSource): Promise<ArrayBuffer> {
    const key = await this.get_crypto_key();
    return await this.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: this.iv,
      },
      key,
      data
    );
  }

  /**
   * Encrypts the given string using the private key.
   * The encrypted string returned from this function might not be human readable or used safely in a URL.
   * If you want a human readable string that is safe to use, use
   * {@link SimpleAesCbc#encryptStringToBase64} instead.
   * @param {string} data The data to encrypt.
   * @returns {Promise<string>} The encrypted string.
   * @throws {Error} If the data could not be encrypted.
   */
  async encryptString(data: string): Promise<string> {
    const encrypted = await this.encrypt(new TextEncoder().encode(data));
    return String.fromCharCode(...new Uint8Array(encrypted));
  }

  /**
   * Decrypts the given string using the private key.
   * This function expects the string to be in the same format as the one returned from
   * {@link SimpleAesCbc#encryptString}.
   * If you want to decrypt a string that was encrypted using
   * {@link SimpleAesCbc#encryptStringToBase64}, use {@link SimpleAesCbc#decryptStringFromBase64} instead.
   * @param {string} data The data to decrypt.
   * @returns {Promise<string>} The decrypted string.
   * @throws {Error} If the data could not be decrypted.
   */
  async decryptString(data: string): Promise<string> {
    const decrypted = await this.decrypt(
      Uint8Array.from(data, (c) => c.charCodeAt(0))
    );
    return new TextDecoder().decode(decrypted);
  }

  /**
   * Encrypts the given string to a base64 encoded string using the private key.
   * The encrypted string returned from this function is human readable and safe to use in a URL.
   * @param {string} data The data to encrypt.
   * @returns {Promise<string>} The encrypted string in base64 format.
   * @throws {Error} If the data could not be encrypted.
   */
  async encryptStringToBase64(data: string): Promise<string> {
    return btoa(await this.encryptString(data));
  }

  /**
   * Decrypts the given base64 encoded string using the private key.
   * This function expects the string to be in the same format as the one returned from
   * {@link SimpleAesCbc#encryptStringToBase64}.
   * @param {string} data The data to decrypt.
   * @returns {Promise<string>} The decrypted string.
   * @throws {Error} If the data could not be decrypted.
   */
  async decryptStringFromBase64(data: string): Promise<string> {
    return await this.decryptString(atob(data));
  }
}
