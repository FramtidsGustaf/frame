import {
	createCipheriv,
	createDecipheriv,
	randomBytes,
	scryptSync,
} from "crypto";

interface CipherProps {
	algorithm: string;
	password: string;
	salt: string;
}

export class Cipher {
	/**
	 * The algorithm wich will be used to cipher the data
	 */
	private algorithm: string;
	/**
	 * The key to be used to cipher the data
	 */
	private key: Buffer;

	constructor(algorithm: string, password: string, salt: string) {
		this.algorithm = algorithm;
		this.key = scryptSync(password, salt, 32);
	}

	/**
	 *
	 * @param data
	 * @returns The encrypted data as hex string
	 * @example
	 * const cipher = instance.encrypt(data);
	 */
	encrypt(data: string) {
		const iv = randomBytes(16);
		const cipher = createCipheriv(this.algorithm, this.key, iv);

		const encrypted = cipher.update(data);
		const final = cipher.final();

		const combined = Buffer.concat([encrypted, final]);

		return iv.toString("hex") + ":" + combined.toString("hex");
	}

	/**
	 *
	 * @param data
	 * @param encrypted
	 * @returns true if the data is the same as the decrypted data
	 * @example
	 * const isSame = instance.compare(data, encrypted);
	 */
	compare(data: string, encrypted: string) {
		return this.decrypt(encrypted) === data;
	}

	/**
	 *
	 * @param data
	 * @returns the decrypted data as utf8 string
	 * @example
	 * const decipher = instance.decrypt(data);
	 */
	private decrypt(data: string) {
		const textParts = data.split(":");
		const iv = Buffer.from(textParts[0]!, "hex");

		const encryptedData = Buffer.from(textParts[1]!, "hex");

		const decipher = createDecipheriv(this.algorithm, this.key, iv);

		const decrypted = decipher.update(encryptedData);
		const final = decipher.final();

		return Buffer.concat([decrypted, final]).toString();
	}
}

/**
 * Creates a new instance of the Cipher class
 * @param algorithm The algorithm to use
 * @param password The password to use
 * @param salt The salt to use
 * @returns A new instance of the Cipher class
 * @example
 * const instance = cipher({ algorithm: "aes-256-cbc", password: "password", salt: "salt" });
 */
export default ({ algorithm, password, salt }: CipherProps) =>
	new Cipher(algorithm, password, salt);
