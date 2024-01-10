import { emitter } from "../../lib";

import { sayHi, sayHello } from "../controllers/api.controller";

const apiConfig = {
	// The params object is optional
	// It will allow you to get the params from the request
	// The params object takes an array of strings
	// The strings are the names of the params and the order will be the same as the order of the strings
	//
	// example:
	// /api/:id/:name
	// params: { GET: ["id", "name"] }
	params: { GET: ["id"] },
	validate: ["GET"],
};

// The emitter function takes two arguments
// The first argument is the name of the emitter and also the path
// emitter("api", apiConfig) will create an emitter with the path /api
// The second argument is the config object and is optional
const api = emitter("api", apiConfig);

// The emitter function returns an object with the on method
// The on method takes two arguments
// The first argument is the method name
// The second argument is the function that will be called when the corresponding event is emitted
// You can chain the on method to add multiple events
// But you can also call the on method multiple times
//
// example:
// api.on("GET", sayHi);
// api.on("POST", sayHello);
api.on("GET", sayHi).on("POST", sayHello);

// The add method lets you add a child emitter
// The add method takes one argument
// The argument is the name of the child emitter
// The add method returns an emitter
// The name of the child will have the path of the parent emitter as a prefix
// In this case the something-emitter will have the path /api/something
// If a parent emitter has params on a HTTP method the child emitter can't have an event on that HTTP method but it can have events of all the other HTTP methods
//
// example:
// api.on("GET", sayHi, { params: { GET: ["id"] } });
// api.add("something").on("GET", sayHello); // This will throw an error
// This behaviour is inherited from the parent emitter
// It is possible to add a child emitter to a child emitter
const something = api.add("something");

something.on("POST", sayHi);

export { api };
