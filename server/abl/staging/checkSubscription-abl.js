import { Database } from "sqlite-async";
import { getError, getOk } from "../../helpers/utils.js";

// kontroluje limit předplatného
export async function checkSubscription(subID) {
  try {
    var db = await Database.open(process.env.DB_FILE);
    /*načteme záznam subscribera*/
    let row = await db.get(
      "SELECT sub_id,end_date,start_date,total_count,max_count,disabled FROM subscriber WHERE sub_id = ?",
      [subID]
    );
    if (row) {
      const endDate = new Date(row.end_date);
      if (row.disabled === 1) {
        return getError("Předplatné zakázáno ");
      } else if (row.total_count >= row.max_count) {
        return getError(
          `Limit uploadů předplatného (${row.max_count}) je vyčerpán`
        );
      } else if (Date.now() > endDate) {
        return getError("Předplatné vypršelo ");
      } else {
        return getOk("Render povolen ");
      }
    } else {
      return getError("Subscriber nenalezen ");
    }
  } catch (error) {
    throw Error(error.message);
  } finally {
    if (db) db.close(); // pokud selže open tak je db undefined
  }
}
