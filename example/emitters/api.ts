import { emitter } from "../../src";

import { sayHi } from "../controllers/api.controller";

import { apiConfig } from "./api.config";

const api = emitter("api", apiConfig);

api.on("GET", sayHi);

export { api };
