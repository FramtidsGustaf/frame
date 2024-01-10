import { ServerResponse, IncomingMessage } from "http";
import { emitter } from "lib";

type Emitter = ReturnType<typeof emitter>;

interface CtrlProps {
	res: ServerResponse;
	req: IncomingMessage;
	body: any;
	params: Map<string, string>;
	compare(data: string, encrypt: string): boolean;
	encrypt(data: string): string;
	sendToken(): void;
}

export { CtrlProps, Emitter };
