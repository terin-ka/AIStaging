import { Database } from "sqlite-async";
//import { getError, getOk } from "../../helpers/utils.js";

export async function getImage(render_id) {
  try {
    var db = await Database.open(process.env.DB_FILE);
    let images = await db.all(
        "SELECT image_url FROM images WHERE render_id = ?",
        [render_id]
      );
    return images;
  } catch (error) {
    throw Error(error.message);
  } finally {
    if (db) db.close(); // pokud selže open tak je db undefined
  }
}
