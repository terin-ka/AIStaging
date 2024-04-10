import express from "express";
import FormData from "form-data";
import { resolve } from "path";
import { getError } from "../helpers/utils.js";

// metody pro volání externí API
//import { getAPIPing } from "../abl/extern/getAPIPing.js"
import { getOptions } from "../abl/extern/getOptions-abl.js";
import { getRender } from "../abl/extern/getRender-abl.js";
import { postCreateRender } from "../abl/extern/postCreateRender-abl.js";
import { postCreateVariation } from "../abl/extern/postCreateVariation-abl.js"

const router = express.Router();

// http://localhost:7000/api/options
router.get("/options", async (_, res) => {
  try {
    let data = await getOptions();
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

export default router;

// http://localhost:7000/api/render/xoTTsBLPV1uN05igsmFe
router.get("/render/:render_id", async (req, res) => {
  try {
    let data = await getRender(req.params.render_id);
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

router.post("/render", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0)
    return res.status(400).send(getError("No file was uploaded"));

  const fd = new FormData();
  // jméno input field (i.e. "image_file") se použije k získání uploadovaného souboru
  // https://maximorlov.com/send-a-file-with-axios-in-nodejs/
  let imageFile = req.files.image_file;
  fd.append("file", imageFile.data, imageFile.name);
  // podle dokumentace externího API form data obsahují pouze předávaný soubor, ostatní předáme jako query parametry
  try {
    let data = await postCreateRender(
      req.body.Room_Type,
      req.body.Style,
      req.body.Mode,
      req.body.Resolution,
      req.body.Declutter,
      fd
    );
    res.status(200).send(data);
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

// http://localhost:7000/api/variation/xoTTsBLPV1uN05igsmFe
router.post("/variation/:render_id", async (req, res) => {
    try {
      let data = await postCreateVariation(
        req.params.render_id,
        req.body.Room_Type,
        req.body.Style
      );
      res.status(200).send(data);
    } catch (err) {
      res.status(400).send(getError(err.message));
    }
  });