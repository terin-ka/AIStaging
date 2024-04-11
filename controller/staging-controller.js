import express from "express";
import { getError } from "../helpers/utils.js";
import FormData from "form-data"; ////

// metody pro volání staging API
import { syncRender } from "../abl/staging/syncRender-abl.js";
import { createVariation } from "../abl/staging/createVariation-abl.js";
import { createRender } from "../abl/staging/createRender-abl.js";
import { checkSubscription } from "../abl/staging/checkSubscription-abl.js";
import { getImage } from "../abl/staging/getImage-abl.js";
import { getAll } from "../abl/staging/getAll-abl.js";


const router = express.Router();

// načte stav předaného renderu a aktualizuje ho v databázi
router.post("/sync", async (req, res) => {
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
router.post("/render", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0)
    return res.status(400).send(getError("No file was uploaded"));
  const fd = new FormData();
  let imageFile = req.files.image_file;
  fd.append("file", imageFile.data, imageFile.name);
  // podle dokumentace externího API form data obsahují pouze předávaný soubor, ostatní předáme jako query parametry
  try {
    let data = await createRender(
      req.body.room_type,
      req.body.style,
      req.body.mode,
      req.body.resolution,
      req.body.declutter,
      fd
    );
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

// vytvoří novou variantu renderu
router.post("/variation", async (req, res) => {
  try {
    let data = await createVariation(
      req.body.render_id,
      req.body.room_type,
      req.body.style
    );
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
