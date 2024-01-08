import { cipher } from "src/Cipher";

type Cipher = ReturnType<typeof cipher>;

interface CipherConfig {
	algorithm: string;
	password: string;
	salt: string;
}

export { Cipher, CipherConfig };
