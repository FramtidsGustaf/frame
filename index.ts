import { server } from "./src";

import { api } from "./example/emitters/api";

const PORT = 8030;

const app = server();
app.cors("http://localhost:3000");

app.addEmitter(api);

app.start(PORT, ({ error, res }) => {
	if (error) {
		res.statusCode = 500;
		res.end(error.message);
		return;
	}
	console.log(`Server started on port ${PORT}...`);
});
