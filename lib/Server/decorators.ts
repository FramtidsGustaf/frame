export function validateEmitter(
	_target: any,
	_key: string,
	descriptor: PropertyDescriptor
) {
	const originalMethod = descriptor.value;

	descriptor.value = function (...args: any[]) {
		if (this.emitters.has(args[0].path)) {
			throw new Error(`Path ${args[0].path} already exists`);
		}

		return originalMethod.apply(this, args);
	};
}

export function validateStart(
	_target: any,
	_key: string,
	descriptor: PropertyDescriptor
) {
	const originalMethod = descriptor.value;

	descriptor.value = function (...args: any[]) {
		if (this.emitters.size === 0) {
			throw new Error("No emitters added");
		}

		if (!args[0]) {
			throw new Error("Port is required");
		}

		return originalMethod.apply(this, args);
	};
}
