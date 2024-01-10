import { Cipher } from "lib/Cipher";

export class Token {
	private expireTime: string[];
	private cipher: Cipher;

	constructor({ expireTime, cipher }: { expireTime: string; cipher: Cipher }) {
		this.expireTime = this.extractExpireTime(expireTime);
		this.cipher = cipher;
	}

	/**
	 * Creates a token based on the ip and the expire time
	 * @param ip
	 * @returns
	 */
	createToken(ip: string) {
		const token = JSON.stringify({ ip, expires: this.expires() });
		return this.cipher.encrypt(token);
	}

	/**
	 * Validates the token
	 * @param token
	 * @param ip
	 * @returns
	 */
	validateToken(token: string, ip: string) {
		try {
			const decrypted = this.cipher.decrypt(token);
			const parsed = JSON.parse(decrypted);

			if (parsed.expires < Date.now()) {
				return false;
			}

			if (parsed.ip !== ip) {
				return false;
			}

			return true;
		} catch (error) {
			return false;
		}
	}
	/**
	 * Extracts the expire time from the config
	 * @param expireTime
	 * @returns
	 */
	private extractExpireTime(expireTime: string) {
		const time = expireTime.split(/(?=[a-zA-Z])/);
		if (time.length !== 2) {
			throw new Error("Invalid expire time format (e.g. 1d, 1w, 1h, 1m, 1s)");
		}
		return time;
	}

	/**
	 * Calculates the expire time
	 * @returns
	 */
	private expires() {
		const now = Date.now();
		let multiplier: number;

		switch (this.expireTime[1]) {
			case "s":
				multiplier = 1000;
				break;
			case "m":
				multiplier = 1000 * 60;
				break;
			case "h":
				multiplier = 1000 * 60 * 60;
				break;
			case "d":
				multiplier = 1000 * 60 * 60 * 24;
				break;
			case "w":
				multiplier = 1000 * 60 * 60 * 24 * 7;
				break;
			default:
				throw new Error("Invalid expire time");
		}

		return new Date(now + parseInt(this.expireTime[0]!) * multiplier).getTime();
	}
}
