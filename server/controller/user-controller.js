import express from "express";

import { getError } from "../helpers/utils.js";
import { authenticate, register, changePassword } from "../abl/user/userService-abl.js";
import { getUser } from "../abl/user/getUser-abl.js";

const router = express.Router();

// ověří uživatele
router.post("/authenticate", async (req, res) => {
  try {
    let data = await authenticate(req.body.username, req.body.password);
    if (data.ok) {
      res.status(200).send(data.data);
    } else {
      res.status(data.code).send(getError(data.info));
    }
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

// registruje uživatele tj. založí nový záznam v tabulce subscriber
router.post("/register", async (req, res) => {
  try {
    let data = await register(
      req.body.username,
      req.body.email,
      req.body.password
    );
    if (data.ok) {
      res.status(200).send(data.data);
    } else {
      res.status(data.code).send(getError(data.info));
    }
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

// vrátí data uživatele - subscribera
router.get("/:subID", async (req, res) => {
  try {
    let data = await getUser(req.params.subID);
    if (data.ok) {
      res.status(200).send(data.data);
    } else {
      res.status(data.code).send(data);
    }
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

// změna hesla
router.put("/:subID", async (req, res) => {
  try {
    let data = await changePassword(
      req.params.subID,
      req.body.old_password,
      req.body.password
    );
    if (data.ok) {
      res.status(200).send(data.data);
    } else {
      res.status(data.code).send(getError(data.info));
    }
  } catch (err) {
    res.status(400).send(getError(err.message));
  }
});

export default router;
