import { Database } from "sqlite-async";
import { postCreateRender } from "../extern/postCreateRender-abl.js";
import { getError, getOk } from "../../helpers/utils.js";

/* Virtual Staging API - endpoint CreateRender*/
/* parametrem jsou form data získaná frontendem - obsahují i uploadovaný soubor */
export async function createRender(
  subID,
  room_type,
  style,
  mode,
  resolution,
  declutter,
  formData
) {
  try {
    var db = await Database.open(process.env.DB_FILE);  // nutno definovat jako var - má funkční scope a je tedy přístupný i ve finally, let s blokovým scope tam přístupný není
    let api_response = await postCreateRender(
      room_type,
      style,
      mode,
      resolution,
      declutter,
      formData
    );
    // pokud odpověď obsahuje položku render_id považuji za úspěšnou
    if ("render_id" in api_response) {
      /*vložím záznam do tabulky render, nastavím status na rendering*/
      await db.run(
        "INSERT INTO render(render_id,render_status,render_date,sub_id,room_type,style,mode,resolution,declutter) VALUES (?,?,datetime('now','localtime'),?,?,?,?,?,?)",
        [
          api_response.render_id,
          "rendering",
          subID,
          room_type,
          style,
          mode,
          resolution,
          declutter,
        ]
      );
      /* updatuji informace subscribera, inkrementuji počet provedených renderů, čas posledního běhu*/
      await db.run(
        "UPDATE subscriber SET total_count = total_count + 1,last_run = datetime('now','localtime'),last_render_id = ?,last_render_status = ? WHERE sub_id = ?",
        [api_response.render_id, "rendering", subID]
      );
      return getOk("Render vyžádán " + api_response.render_id,{render_id:api_response.render_id});
    }
  } catch (error) {
    throw Error(error.message);
  } finally {
    if (db) db.close(); // pokud selže open tak je db undefined
  }
}
