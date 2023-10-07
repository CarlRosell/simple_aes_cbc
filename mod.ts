const ALGORITHM = "AES-CBC";

/**
 * A simple wrapper for WebCrypto which uses the AES-CBC algorithm.
 * @class
 * @property {string} privateKey The private key used for encryption and decryption.
 * @property {SubtleCrypto} subtle The WebCrypto API.
 */
export class SimpleAesCbc {
  private privateKey: Uint8Array;
  private subtle: SubtleCrypto;
  private iv: Uint8Array;
  private cryptoKey: CryptoKey | undefined;

  constructor(privateKey: string, subtle: SubtleCrypto) {
    this.privateKey = new TextEncoder().encode(privateKey);
    this.subtle = subtle;

    this.iv = this.privateKey.slice(0, 16);
  }

  private async getCryptoKey() {
    if (this.cryptoKey) {
      return this.cryptoKey;
    }

    this.cryptoKey = await this.subtle.importKey(
      "raw",
      this.privateKey,
      {
        name: ALGORITHM,
      },
      false,
      ["encrypt", "decrypt"]
    );

    return this.cryptoKey;
  }

  /**
   * Encrypts the given data using the private key.
   * @param {BufferSource} data The data to encrypt.
   * @returns {Promise<ArrayBuffer>} The encrypted data.
   * @throws {Error} If the data could not be encrypted.
   */
  async encrypt(data: BufferSource): Promise<ArrayBuffer> {
    const key = await this.getCryptoKey();
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
    const key = await this.getCryptoKey();
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
