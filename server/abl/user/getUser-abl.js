import { Database } from "sqlite-async";
import { getAvatar,getError,getOk } from "../../helpers/utils.js";

export async function getUser(sub_id) {
  try {
    var db = await Database.open(process.env.DB_FILE);
    /*načtu záznam subscribera*/
    var row = await db.get(
      "SELECT sub_id,email,name,end_date,start_date,last_run,last_render_id,last_render_status,total_count,max_count,disabled FROM subscriber WHERE sub_id = ?",
      [sub_id]
    );
    if (row) {
      row.avatar_url = getAvatar(row.email);
      return getOk("Ok",row);
    } else {
      return getError("User Not found.", 401);
    }
  } catch (error) {
    throw Error(error.message);
  } finally {
    if (db) db.close(); // pokud selže open tak je db undefined
  }
}