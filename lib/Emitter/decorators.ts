export function validateAdd(
	_target: any,
	_key: string,
	descriptor: PropertyDescriptor
) {
	const originalMethod = descriptor.value;

	descriptor.value = function (...args: any[]) {
		if (!args[0]) {
			throw new Error("Path is required");
		}

		if (this.subPaths.has(args[0])) {
			throw new Error(`Path ${args[0]} already exists`);
		}

		return originalMethod.apply(this, args);
	};
}
