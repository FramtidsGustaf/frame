import { emitter } from "../../src";

import { sayHi, sayHello } from "../controllers/api.controller";

import { apiConfig } from "./api.config";

const api = emitter("api", apiConfig);

api.on("GET", sayHi);
api.on("POST", sayHello);

export { api };
