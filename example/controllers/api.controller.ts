//THE CONTROLLERS

import { CtrlProps } from "lib/@types/Emitter.types";

const sayHi = ({ res }: CtrlProps) => {
	res.end("Hello World");
};

// The CtrlProps type is an object with the following properties:
// {
// 	req: IncomingMessage; // The request object
// 	res: ServerResponse; // The response object
// 	body: { [key: string]: string }; // The body of the request
// 	params: { [key: string]: string }; // The params of the request
// 	encrypt: (data: string) => string; // The function that lets you encrypt data
// 	compare: (data: string, encryptedData: string) => boolean; // The function that lets you compare data with encrypted data
// 	sendToken: () => void; // A function that sends a token to the client, can be used for authentication
// }
const sayHello = ({ body, encrypt, compare, sendToken }: CtrlProps) => {
	const { password } = body;
	const encryptedPassword = encrypt(password);
	if (compare(password, encryptedPassword)) {
		sendToken();
	}
};

const sayScmello = ({ res }: CtrlProps) => {
	res.end("Scmello");
};

export { sayHi, sayHello, sayScmello };
