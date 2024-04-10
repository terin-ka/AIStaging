import express from "express";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
import { config } from "dotenv";  // vloží hodnoty ze souboru .env do process.env
config();

import externRouter from "./controller/extern-controller.js";  // router pro volání extern API
import stagingRouter from "./controller/staging-controller.js";  // router pro volání staging API
// import testAPIRoutes from "./controller/testAPIRoutes.js";  // routes pro volání test API

let app = express();
// // set the view engine to ejs
// app.set('view engine', 'ejs');
app.use(cors());

// // Configuring body parser middleware - nezahrnuje multipart body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());  // toto potřebuji k uploadu souboru

//app.use(express.static("/public"));

// routes pro přímé volání API
app.use('/api', externRouter);
app.use('/staging', stagingRouter);
// app.use('/test', testAPIRoutes);

app.get("/hello", (_, res) => {
  res.send("Hello staging!");
});

const port = process.env.PORT || 7000;
app.listen(port, () => console.log(`Listening on port ${port}`));

