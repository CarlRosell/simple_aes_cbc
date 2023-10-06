const ALGORITHM = "AES-CBC";

export class SimpleAesCbc {
  private iv: Uint8Array;
  private privateKey: string;
  private cryptoKey: CryptoKey | undefined;

  constructor(privateKey: string) {
    this.iv = new TextEncoder().encode(privateKey.slice(0, 16));

    this.privateKey = privateKey;
  }

  private async getCryptoKey() {
    if (this.cryptoKey) {
      return this.cryptoKey;
    }

    this.cryptoKey = await crypto.subtle.importKey(
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
    return await crypto.subtle.encrypt(
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
    return await crypto.subtle.decrypt(
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
