const ALGORITHM = "AES-CBC";

/**
 * A simple wrapper for WebCrypto which uses the AES-CBC algorithm.
 * @class
 * @property {string} privateKey The private key used for encryption and decryption.
 * @property {SubtleCrypto} subtle The WebCrypto API.
 */
export class SimpleAesCbc {
  private privateKey: string;
  private subtle: SubtleCrypto;
  private iv: Uint8Array;
  private cryptoKey: CryptoKey | undefined;

  constructor(privateKey: string, subtle: SubtleCrypto) {
    this.privateKey = privateKey;
    this.subtle = subtle;

    this.iv = new TextEncoder().encode(privateKey.slice(0, 16));
  }

  private async getCryptoKey() {
    if (this.cryptoKey) {
      return this.cryptoKey;
    }

    this.cryptoKey = await this.subtle.importKey(
      "raw",
      new TextEncoder().encode(this.privateKey),
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
   * @param {string} data The data to encrypt.
   * @returns {Promise<string>} The encrypted string.
   * @throws {Error} If the data could not be encrypted.
   */
  async encryptString(data: string): Promise<string> {
    const encrypted = await this.encrypt(new TextEncoder().encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  /**
   * Decrypts the given string using the private key.
   * @param {string} data The data to decrypt.
   * @returns {Promise<string>} The decrypted string.
   * @throws {Error} If the data could not be decrypted.
   */
  async decryptString(data: string): Promise<string> {
    const decrypted = await this.decrypt(
      Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
    );
    return new TextDecoder().decode(decrypted);
  }
}
