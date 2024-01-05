import { createServer, Server } from "http";

import type { ServerResponse, IncomingMessage } from "http";
import type { Emitter, HTTPMethod } from "../@types";

import { validateStart, validateEmitter } from "./decorators";

class EventServer {
	server: Server;
	emitters: Map<string, Emitter> = new Map();
	res: ServerResponse;
	req: IncomingMessage;
	pathParts: string[];
	emitter: Emitter | undefined;
	params: { [key: string]: string } | undefined;
	corsURL: string | undefined;

	constructor() {
		this.server = createServer(async (req, res) => {
			this.res = res;
			this.req = req;
			this.exec();
		});
	}

	cors(url: string) {
		this.corsURL = url;
	}

	@validateStart
	start(port: number, callback?: (prop?: any) => void) {
		const callBackParams = {
			req: this.req,
			res: this.res,
			error: null,
		};

		try {
			this.server.listen(port);
		} catch (error) {
			callBackParams.error = error;
		}

		callback && callback({ callBackParams });
	}

	@validateEmitter
	addEmitter(newEmitter: Emitter) {
		this.emitters.set(newEmitter.path, newEmitter);
	}

	private exec(): any {
		this.splitPath();

		try {
			this.findEmitter();
			this.determineParams();
			this.setHeaders();
			this.emit();
		} catch (error) {
			this.res.statusCode = 404;
			this.res.end("Not found");
		}
	}

	private splitPath() {
		this.pathParts = this.req.url!.split("/").filter((part) => part !== "");
	}

	private emit() {
		if (this.req.method === "GET") {
			this.emitter?.emit("GET", {
				res: this.res,
				req: this.req,
				body: null,
				params: this.params,
			});
			return;
		}

		this.req.on("data", (chunk) => {
			const body = JSON.parse(chunk.toString());
			this.emitter?.emit(`${this.req.method}`, {
				res: this.res,
				req: this.req,
				params: this.params,
				body,
			});
		});
	}

	private setHeaders() {
		if (this.corsURL) {
			this.res.setHeader("Access-Control-Allow-Origin", this.corsURL);
			this.res.setHeader(
				"Access-Control-Allow-Methods",
				"GET, POST, PUT, PATCH, DELETE"
			);
			this.res.setHeader("Access-Control-Allow-Headers", "Content-Type");
		}
	}

	private findEmitter(index = 0, emitter?: Emitter): Emitter | undefined {
		if (!emitter) {
			if (!this.emitters.has(this.pathParts[index]!)) {
				throw new Error();
			}

			return this.findEmitter(
				index + 1,
				this.emitters.get(this.pathParts[index]!)
			);
		}

		if (!emitter.hasChildren) {
			if (!emitter.params && this.pathParts.length > index) {
				throw new Error();
			}

			return (this.emitter = emitter);
		}

		if (emitter.params?.has(this.req.method as HTTPMethod)) {
			return (this.emitter = emitter);
		}

		if (emitter.subPaths.has(this.pathParts[index]!)) {
			return this.findEmitter(
				index + 1,
				emitter.subPaths.get(this.pathParts[index]!)
			);
		} else {
			if (!emitter.params && this.pathParts.length > index) {
				throw new Error();
			}

			return (this.emitter = emitter);
		}
	}

	private determineParams() {
		if (this.emitter?.params) {
			const values = this.req
				.url!.split(this.emitter?.path!)
				.filter((part) => part !== "/")[0]
				?.split("/")
				.filter((part) => part !== "");

			const paramKeys = this.emitter.params.get(this.req.method as HTTPMethod)!;

			const params = {};

			for (let i = 0; i < paramKeys.length; i++) {
				if (values && !values[i]) {
					continue;
				}

				Object.defineProperty(params, paramKeys[i] as PropertyKey, {
					value: values![i],
					enumerable: true,
				});
			}

			this.params = params;
		}
	}
}

export default () => new EventServer();
