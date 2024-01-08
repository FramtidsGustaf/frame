import { ServerResponse, IncomingMessage } from "http";
import { emitter } from "src";
import { Cipher } from "./Cipher.types";

type Emitter = ReturnType<typeof emitter>;

interface CtrlProps {
	res: ServerResponse;
	req: IncomingMessage;
	body: any;
	params: Map<string, string>;
	compare(data: string, encrypt: string): boolean;
	encrypt(data: string): string;
	cipher: Cipher;
}

export { CtrlProps, Emitter };
