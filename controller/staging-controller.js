import express from "express";
import multer from 'multer';
import { getError } from "../helpers/utils.js";
import FormData from "form-data"; ////

// metody pro volání staging API
import { syncRender } from "../abl/staging/syncRender-abl.js";
import { createVariation } from "../abl/staging/createVariation-abl.js";
import { createRender } from "../abl/staging/createRender-abl.js";
import { checkSubscription } from "../abl/staging/checkSubscription-abl.js";
import { getRenderImages } from "../abl/staging/getRenderImages-abl.js";
import { getSubjectImages } from "../abl/staging/getSubjectImages-abl.js";
import { getRenderSpecimen } from "../abl/staging/getRenderSpecimen-abl.js";
import { getImage } from "../abl/staging/getImage-abl.js";
import { getAll } from "../abl/staging/getAll-abl.js";


const router = express.Router();
let upload = multer();

// načte stav předaného renderu a aktualizuje ho v databázi
router.post("/sync_render", async (req, res) => {
  if (!req.body.render_id) {
    return res.status(400).send(getError("Render id must have value"));
  }
  try {
    let data = await syncRender(req.body.render_id);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

// vytvoří nový render a aktualizuje ho v databázi zUkXA90PTe4xgZV3mIyJ
router.post("/render", upload.single('image_file'), async (req, res) => {
  if (!req.file)
    return res.status(400).send(getError("No file was uploaded"));
  const fd = new FormData();
  const file = req.file;
  // https://maximorlov.com/send-a-file-with-axios-in-nodejs/
  fd.append("file", file.buffer, file.originalname);
  // podle dokumentace externího API form data obsahují pouze předávaný soubor, ostatní předáme jako query parametry
  try {
    let data = await createRender(req.body.sub_id,req.body.room_type,req.body.style,req.body.mode,req.body.resolution,req.body.declutter,fd);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

// vytvoří novou variantu renderu
router.post("/variation",  upload.none(), async (req, res) => {
  try {
    let data = await createVariation(req.body.render_id, req.body.room_type, req.body.style);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

//zkontroluje předplatné uživatele
router.get("/subscription", async (req, res) => {
  if (!req.body.sub_id) {
    return res.status(400).send(getError("Subscriber id must have value"));
  }
  try {
    let data = await checkSubscription(req.body.sub_id);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

// vrátí images konkrétního renderu
// upload.none() zařídí správné načtení body - nemáme žádný file
router.get("/render_images/:render_id", upload.none(), async (req, res) => {
  try {
    let data = await getRenderImages(req.params.render_id);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

// vrátí images konkrétního subjektu - všechny rendery
// upload.none() zařídí správné načtení body - nemáme žádný file
router.get("/subject_images/:sub_id", upload.none(), async (req, res) => {
  try {
    let data = await getSubjectImages(req.params.sub_id);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

// vrátí images specimen
// upload.none() zařídí správné načtení body - nemáme žádný file
router.get("/render_specimen", upload.none(), async (req, res) => {
  try {
    let data = await getRenderSpecimen();
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

/********************************************************************************* */
//vrátí všechny url od jendnoho render_id
router.get("/image", async (req, res) => {
  if (!req.body.render_id) {
    return res.status(400).send(getError("Render id must have value"));
  }
  try {
    let data = await getImage(req.body.render_id);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

//vrátí všechny již vygenerované url
router.get("/all", async (req, res) => {
  try {
    let data = await getAll();
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

export default router;
