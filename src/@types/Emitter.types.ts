import { EventEmitter } from "events";
import { ServerResponse, IncomingMessage } from "http";

interface Emitter extends EventEmitter {
	path: string;
	subPaths: Map<string, Emitter>;
	add(path: string, config?: { [key: string]: any }): Emitter;
	params: Map<string, string[]> | undefined;
	parentParams: string[] | undefined;
	hasChildren: boolean;
}

interface CtrlProps {
	res: ServerResponse;
	req: IncomingMessage;
	body: any;
	params: Map<string, string>;
}

export { Emitter, CtrlProps };
