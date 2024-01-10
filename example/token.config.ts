// This is an example of a config file for the token module.
// The config file is optional
// If you dont provide a config you will not be able to create or validate tokens
export const tokenConfig = {
	secret: "Hemligt",
	salt: "HEJSAN SVEJSAN",
	expireTime: "60s",
};
