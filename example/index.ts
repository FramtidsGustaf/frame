import { server } from "../lib";

import { api } from "./emitters/api";
import { cipherConfig } from "./cipher.config";
import { tokenConfig } from "./token.config";

const PORT = 8030;

// The server function takes an object with two optional arguments
// The first argument is the cipher config, see example/cipher.config.ts
// The second argument is the token config see example/token.config.ts
const app = server({ cipher: cipherConfig, token: tokenConfig });

// The addEmitter method takes an emitter and adds it to the server
app.addEmitter(api);

// The start method takes two arguments
// The first argument is the port of the server
// The second argument is a callback that will be called when the server is started
// The callback will be called with an object with the following properties:
// {
// 	req: IncomingMessage; // The request object
// 	res: ServerResponse; // The response object
// 	error: Error; // The error if the server didn't start successfully
// }
app.start(PORT, ({ error, res }) => {
	if (error) {
		res.statusCode = 500;
		res.end(error.message);
		return;
	}
	console.log(`Server is listening on port ${PORT}`);
});
