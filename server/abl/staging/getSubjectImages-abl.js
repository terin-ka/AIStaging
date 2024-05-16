import { Database } from "sqlite-async";
import { getError, getOk } from "../../helpers/utils.js";

// pro předané render_id načte stav z API a uloží ho do databáze
export async function getSubjectImages(sub_id) {
    try {
      var db = await Database.open(process.env.DB_FILE);
      /*načtu záznam subscribera*/
      let rows = await db.all(
        "SELECT img_id,image_url,image_name FROM images img INNER JOIN render rnd ON rnd.render_id = img.render_id WHERE rnd.sub_id = ? ORDER BY rnd.render_date,img_id DESC",
        [sub_id]
      );
      if (rows) {
        let images = [];
        rows.forEach((row) => {
          images.push({
            original: row.image_url,
            thumbnail: row.image_url,
            description: row.image_name,
          });
        });
        return getOk("", images);
      } else {
        return getError("No images found");
      }
    } catch (error) {
      throw Error(error.message);
    } finally {
      if (db) db.close(); // pokud selže open tak je db undefined
    }
  }