import { EventEmitter } from "events";
import type { Emitter, HTTPMethods, HTTPMethod } from "../@types";

import { validateAdd } from "./decorators";

class EmitterClass extends EventEmitter {
	path: string;
	subPaths: Map<string, Emitter> = new Map();
	params: Map<string, string[]> | undefined;
	parentParams: HTTPMethods | undefined;
	hasChildren = false;

	constructor(
		path: string,
		config?: { [key: string]: any },
		parentParams?: HTTPMethods
	) {
		super();
		this.parentParams = parentParams as HTTPMethods;

		if (config && config.params) {
			this.params = new Map(Object.entries(config.params));
		}

		this.path = path;
		this.on("newListener", (event: HTTPMethod) => {
			if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(event)) {
				throw new Error(`Invalid event name: ${event}`);
			}

			if (this.parentParams && this.parentParams.includes(event)) {
				throw new Error(
					`A parent emitter has params for its ${event} event. Due to that you can't add a ${event} event on ${path}`
				);
			}

			if (this.eventNames().includes(event)) {
				throw new Error(`Event ${event} already exists on ${path}`);
			}
		});
	}

	@validateAdd
	add(path: string, config?: { [key: string]: any }) {
		const parentParams: HTTPMethods = this.params
			? (Array.from(this.params.keys()) as HTTPMethods)
			: [];

		this.parentParams && parentParams.push(...this.parentParams);

		const subPath = new EmitterClass(path, config, [...parentParams]);

		this.subPaths.set(path, subPath);

		this.hasChildren = true;

		return subPath;
	}
}

export default (path: string, config?: { [key: string]: any }) =>
	new EmitterClass(path, config) as Emitter;
