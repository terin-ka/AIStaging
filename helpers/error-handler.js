import { getError } from "../helpers/utils.js";

export function errorHandler(err, req, res, next) {
  if (typeof err === "string") {
    // custom application error
    //return res.status(400).json({ message: err });
    return res.status(400).send(getError(err,400));
  }
  // default to 500 server error
  //return res.status(500).json({ message: err.message });
  return res.status(500).send(getError(err.message,500));
}
