import { CtrlProps } from "src/@types/Emitter.types";

const sayHi = ({ res }: CtrlProps) => {
	console.log(res);
	res.end("Hello World");
};

const sayHello = ({ res }: CtrlProps) => {
	res.end("Hello");
};

const sayScmello = ({ res }: CtrlProps) => {
	res.end("Scmello");
};

export { sayHi, sayHello, sayScmello };
