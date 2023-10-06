const ALGORITHM = "AES-CBC";

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

  async encrypt(data: BufferSource) {
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

  async decrypt(data: BufferSource) {
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

  async encryptString(data: string) {
    const encrypted = await this.encrypt(new TextEncoder().encode(data));
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  async decryptString(data: string) {
    const decrypted = await this.decrypt(
      Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
    );
    return new TextDecoder().decode(decrypted);
  }
}
