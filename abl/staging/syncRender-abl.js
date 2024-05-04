import { Database } from "sqlite-async";
import { getRender } from "../extern/getRender-abl.js";
import { getRenderName, getError, getOk } from "../../helpers/utils.js";

// pro předané render_id načte stav z API a uloží ho do databáze
export async function syncRender(render_id) {
  try {
    var db = await Database.open(process.env.DB_FILE);  // nutno definovat jako var - má funkční scope a je tedy přístupný i ve finally, let s blokovým scope tam přístupný není
    let api_response = await getRender(render_id);
    // pokud odpověď obsahuje položky render_id a outputs tak ji považujeme za úspěšnou
    // outputs obsahuje url jednotlivých variant
    if ("render_id" in api_response && "outputs" in api_response) {
      /*aktualizace stavu renderu*/
      await db.run("UPDATE render SET render_status = ? WHERE render_id = ?", [
        api_response.status,
        render_id,
      ]);
      await db.run(
        "UPDATE subscriber SET last_render_status = ? WHERE last_render_id = ?",
        [api_response.status, render_id]
      );
      /*aktualizace tabulky images*/
      for (let i = 0; i < api_response.outputs.length; i++) {
        await db.run(
          "INSERT OR REPLACE INTO images(render_id,image_url,image_name,room_type,style) VALUES (?,?,?,?,?)",
          [
            render_id,
            api_response.outputs[i],
            getRenderName(api_response.outputs[i]),
            api_response.outputs_room_types[i],
            api_response.outputs_styles[i],
          ]
        );
      }
      // za OK považuji výsledek s libovolným statusem , hodnotu status je nutno kontrolova na klintovi
      return getOk("Rendering in status" + api_response.status,{status: api_response.status})
    } else {
      throw Error("Rendering in process");
    }
  } catch (error) {
    throw Error(error.message);
  } finally {
    if (db) db.close(); // pokud selže open tak je db undefined
  }
}
