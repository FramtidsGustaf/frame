import { createServer, Server } from "http";

import { Cipher } from "../Cipher";

import type { ServerResponse, IncomingMessage } from "http";
import type { HTTPMethod, Emitter, CipherConfig } from "../@types";

import { validateStart, validateEmitter } from "./decorators";

class EventServer {
	/**
	 * The server
	 * @private
	 */
	public readonly server: Server;
	/**
	 * The collection of the servers emitters
	 * @private
	 */
	private emitters: Map<string, Emitter> = new Map();
	/**
	 * The response object of the request object
	 * @private
	 */
	private res: ServerResponse;
	/**
	 * The request object
	 * @private
	 */
	private req: IncomingMessage;
	/**
	 * The path parts of the request
	 * @private
	 */
	private pathParts: string[];
	/**
	 * The current emitter wich will emit the right event
	 * @private
	 */
	private emitter: Emitter | undefined;
	/**
	 * The params of the request
	 * @private
	 */
	private params: { [key: string]: string } | undefined;
	/**
	 * The cors url
	 * @private
	 */
	private corsURL: string | undefined;
	private cipher: Cipher | undefined;

	/**
	 * Creates a new server
	 */
	constructor({ cipher }: { cipher?: CipherConfig }) {
		if (cipher) {
			this.cipher = new Cipher(cipher.algorithm, cipher.password, cipher.salt);
		}
		this.server = createServer(async (req, res) => {
			this.res = res;
			this.req = req;
			this.exec();
		});
	}

	/**
	 * Sets the cors url
	 * @param url The cors url
	 * @returns The current instance of the server
	 * @example server.cors("https://example.com");
	 */
	cors(url: string) {
		this.corsURL = url;
	}

	/**
	 * Starts the server
	 * @param port The port of the server
	 * @param callback The callback that will be called when the server is started
	 * @example server.start(3000, () => console.log("Server started"));
	 */
	@validateStart
	start(port: number, callback?: (prop?: any) => void) {
		/**
		 * Lets the user know if the server started successfully or not
		 * Also gets both req and res objects in case the user wants to use them
		 * Using an object so that the user can destructure the props
		 */
		const callBackParams = {
			/**
			 * @property req The request object
			 */
			req: this.req,
			/**
			 * @property res The response object of the request object
			 */
			res: this.res,
			/**
			 * @property error The error if the server didn't start successfully
			 */
			error: null,
		};

		/**
		 * If the server didn't start successfully, the error will be the error
		 * This way the user can check if the server started successfully or not
		 */
		try {
			this.server.listen(port);
		} catch (error) {
			callBackParams.error = error;
		}

		callback && callback(callBackParams);
	}

	/**
	 * Adds a new emitter to the server
	 * @param newEmitter The new emitter
	 * @example server.addEmitter(new Emitter("/api"));
	 */
	@validateEmitter
	addEmitter(newEmitter: Emitter) {
		this.emitters.set(newEmitter.path, newEmitter);
	}

	/**
	 * Finds the right emitter and emits the right event
	 * @private
	 */
	private exec() {
		this.splitPath();

		/**
		 * For convenience, we throw an error if we dont find the right emitter and catch it in the try catch block
		 * this way we can send a 404 response in multiple cases
		 */
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

	/**
	 * Splits the path of the request
	 * @private
	 */
	private splitPath() {
		/**
		 * We split the path and filter out the empty strings
		 */
		this.pathParts = this.req.url!.split("/").filter((part) => part !== "");
	}

	/**
	 * Emits the right event
	 * If the request method is GET, the body will be null
	 * If the request method is not GET, the body will be parsed from the request
	 * @private
	 */
	private emit() {
		/**
		 * @event GET
		 */
		if (this.req.method === "GET") {
			this.emitter?.emit(
				"GET",
				/**
				 * Using an object so that the user can destructure the props
				 */
				{
					/**
					 * @property res The response object of the request object
					 */
					res: this.res,
					/**
					 * @property req The request object
					 */
					req: this.req,
					/**
					 * @property body The body of the request
					 */
					body: null,
					/**
					 * @property params The params of the request
					 */
					params: this.params,
				}
			);
			return;
		}

		/**
		 * @event POST
		 * @event PUT
		 * @event PATCH
		 * @event DELETE
		 */
		// TODO Atm it only works with JSON, add support for other types
		this.req.on("data", (chunk) => {
			const body = JSON.parse(chunk.toString());
			this.emitter?.emit(`${this.req.method}`, {
				res: this.res,
				req: this.req,
				params: this.params,
				body,
				encrypt: this.cipher?.encrypt.bind(this.cipher),
				compare: this.cipher?.compare.bind(this.cipher),
			});
		});
	}

	/**
	 * Sets the headers of the response
	 * @private
	 */
	private setHeaders() {
		/**
		 * If the cors url is set, the cors headers will be set
		 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
		 */
		if (this.corsURL) {
			this.res.setHeader("Access-Control-Allow-Origin", this.corsURL);
			this.res.setHeader(
				"Access-Control-Allow-Methods",
				"GET, POST, PUT, PATCH, DELETE"
			);
			this.res.setHeader("Access-Control-Allow-Headers", "Content-Type");
		}
	}

	/**
	 * Finds the right emitter recursively
	 * @param index The index of the current path part
	 * @param emitter The current emitter
	 * @private
	 */
	private findEmitter(index = 0, emitter?: Emitter): Emitter | undefined {
		/**
		 * Initially no emitter is passed, so we start with the root emitter
		 */
		if (!emitter) {
			if (!this.emitters.has(this.pathParts[index]!)) {
				throw new Error();
			}

			return this.findEmitter(
				index + 1,
				this.emitters.get(this.pathParts[index]!)
			);
		}

		/**
		 * If the current emitter has no children, it means that it's the right emitter
		 */
		if (!emitter.hasChildren) {
			if (!emitter.params && this.pathParts.length > index) {
				throw new Error();
			}

			return (this.emitter = emitter);
		}

		/**
		 * If the current emitter has params that corresponds to the request method, it means that it's the right emitter
		 */
		if (emitter.params?.has(this.req.method as HTTPMethod)) {
			return (this.emitter = emitter);
		}

		/**
		 * If the current emitter has children and the current path part is not in the subpaths, it means that the emitter doesn't exist
		 */
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
	/**
	 * Determines the params of the request according to the users config
	 * @private
	 */
	private determineParams() {
		/**
		 * If the emitter has no params, we don't need to determine the params
		 */
		if (this.emitter?.params) {
			const values = this.req
				.url!.split(this.emitter?.path!)
				.filter((part) => part !== "/")[0]
				?.split("/")
				.filter((part) => part !== "");

			/**
			 * The keys of the params of the emitter according to the request method
			 */
			const paramKeys = this.emitter.params.get(this.req.method as HTTPMethod)!;

			const params = {};

			if (paramKeys) {
				for (let i = 0; i < paramKeys.length; i++) {
					if (values && !values[i]) {
						continue;
					}

					Object.defineProperty(params, paramKeys[i] as PropertyKey, {
						value: values![i],
						enumerable: true,
					});
				}
			}

			this.params = params;
		}
	}
}

/**
 * Creates a new server
 * @returns The new server
 */
export default ({ cipher }: { cipher?: CipherConfig } = {}) =>
	new EventServer({ cipher });
