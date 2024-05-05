import { Database } from "sqlite-async";
import { getError, getOk } from "../../helpers/utils.js";

// vrátí odkazy na vzorové images které jsou umístěny ve folderu public
// v app.js zpřístupním static files
// vrací pole tj. lze doplnit další
export async function getRenderSpecimen() {
    return getOk("", [{
      original: "/specimen.png",
      thumbnail: "/specimen.png",
      description: "specimen",
    }]);
  }
  