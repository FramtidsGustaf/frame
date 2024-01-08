import { EventEmitter } from "events";
import type { Emitter, HTTPMethods, HTTPMethod } from "../@types";

import { validateAdd } from "./decorators";

class EmitterClass extends EventEmitter {
	/**
	 * The path of the current emitter
	 */
	public readonly path: string;
	/**
	 * The subpaths of the current emitter
	 */
	public readonly subPaths: Map<string, Emitter> = new Map();
	/**
	 * The params of the current emitter
	 */
	public readonly params: Map<string, string[]> | undefined;
	/**
	 * The params of all the parents emitters
	 */
	public readonly parentParams: HTTPMethods | undefined;
	/**
	 * Whether the current emitter has subpaths, convenient when you want to find the right emitter
	 */
	public hasChildren = false;

	/**
	 * @param path
	 * @param config
	 * @param parentParams
	 */
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

	/**
	 * Adds a new subpath to the current emitter wich in itself is an emitter
	 * @param path The path of the new subpath
	 * @param config The config of the new subpath
	 * @returns The new subpath
	 */

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

/**
 * Creates a new emitter
 * @param path The path of the emitter
 * @param config The config of the emitter
 * @returns The new emitter
 */
export default (path: string, config?: { [key: string]: any }) =>
	new EmitterClass(path, config) as Emitter;
