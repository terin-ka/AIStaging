import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";  // vloží hodnoty ze souboru .env do process.env
config();

import externRouter from "./controller/extern-controller.js";  // router pro volání extern API
import stagingRouter from "./controller/staging-controller.js";  // router pro volání staging API
import userRouter from "./controller/user-controller.js";
import { basicAuth } from "./helpers/basic-auth.js";
import { errorHandler } from "./helpers/error-handler.js";

let app = express();
app.use(cors());

// Configuring body parser middleware - nezahrnuje multipart body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// zpřístupníme static file, použijeme je k zobrazení vzorových obrázků v galerii, umístíme před basicAuth
app.use(express.static("public"));
// use basic HTTP auth to secure the api
app.use(basicAuth);

app.use('/api', externRouter);
app.use('/staging', stagingRouter);
app.use('/user', userRouter);

app.get("/hello", (_, res) => {
  res.send("Hello staging!");
});

// global error handler
app.use(errorHandler);

const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Listening on port ${port}`));

