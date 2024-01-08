import { CtrlProps } from "src/@types/Emitter.types";

const sayHi = ({ res }: CtrlProps) => {
	res.end("Hello World");
};

const sayHello = ({ res, encrypt }: CtrlProps) => {
	res.end(encrypt("Hello"));
};

const sayScmello = ({ res }: CtrlProps) => {
	res.end("Scmello");
};

export { sayHi, sayHello, sayScmello };
