import cors from "cors";
import express from "express";
import routes from "./routes/index.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(requestLogger);

app.use((req, res, next) => {
	res.set("Accept-CH", "Sec-CH-UA, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version");
	res.set("Critical-CH", "Sec-CH-UA-Platform-Version");
	res.set("Permissions-Policy", "ch-ua=*, ch-ua-platform=*, ch-ua-platform-version=*");
	res.append("Vary", "Sec-CH-UA");
	res.append("Vary", "Sec-CH-UA-Platform");
	res.append("Vary", "Sec-CH-UA-Platform-Version");
	next();
});

app.use(cors());
app.use(express.json());

app.use(routes);

app.use(errorHandler);

export default app;
