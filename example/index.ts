import { server } from "../src";

import { api } from "./emitters/api";
import { cipherConfig } from "./cipher.config";

const PORT = 8030;

const app = server({ cipher: cipherConfig });

app.addEmitter(api);

app.start(PORT, ({ error, res }) => {
	if (error) {
		res.statusCode = 500;
		res.end(error.message);
		return;
	}
	console.log(`Server is listening on port ${PORT}`);
});
