import { Database } from "sqlite-async";
import { postCreateVariation } from "../extern/postCreateVariation-abl.js";
import { getError, getOk } from "../../helpers/utils.js";

// pro předané render_id načte stav z API a uloží ho do databáze
export async function createVariation(render_id, room_type, style) {
  try {
    var db = await Database.open(process.env.DB_FILE);  // nutno definovat jako var - má funkční scope a je tedy přístupný i ve finally, let s blokovým scope tam přístupný není
    let api_response = await postCreateVariation(
      render_id,
      room_type,
      style
    );
    // pokud odpověď obsahuje položku render_id považujeme za úspěšnou
    // outputs obsahuje url jednotlivých variant
    if ("render_id" in api_response) {
      /*aktualizace stavu renderu - nastavujeme rendering*/
      db.run("UPDATE render SET render_status = ? WHERE render_id = ?", [
        "rendering",
        render_id,
      ]);
      db.run(
        "UPDATE subscriber SET last_render_status = ? WHERE last_render_id = ?",
        ["rendering", render_id]
      );
      return getOk("variance vyžádána");
    }
  } catch (error) {
    throw Error(error.message);
  } finally {
    if (db) db.close(); // pokud selže open tak je db undefined
  }
}
