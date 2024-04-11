import { Database } from "sqlite-async";
import { getError, getOk } from "../../helpers/utils.js";


export async function getAll() {
  try {
    var db = await Database.open(process.env.DB_FILE);
    let images = await db.all("SELECT image_url FROM images");
    return images;
  } catch (error) {
    throw Error(error.message);
  } finally {
    if (db) db.close(); 
  }
}
