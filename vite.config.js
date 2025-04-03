import { defineConfig } from "vite";
import fs from "fs";

export default defineConfig({
	server: {
		https: {
			key: fs.readFileSync(
				"C:/Windows/System32/certificates/localhost+2-key.pem"
			),
			cert: fs.readFileSync("C:/Windows/System32/certificates/localhost+2.pem"),
		},
		host: true,
		port: 5174,
		strictPort: false,
	},
});
