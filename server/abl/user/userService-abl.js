import { Database } from "sqlite-async";
import { getAvatar,getError, getOk } from "../../helpers/utils.js";
import { randomBytes, scryptSync } from "crypto";

const my_salt = "nahodnyretezec";

// Pass the password string and get hashed password back
// ( and store only the hashed string in your database)
function encryptPassword(password, salt) {
  return scryptSync(password, salt, 32).toString("hex");
}

// Match password against the stored hash
/*function matchPassword(password, hash) {
  // extract salt from the hashed string
  // our hex password length is 32*2 = 64
  const salt = hash.slice(64);
  const originalPassHash = hash.slice(0, 64);
  const currentPassHash = encryptPassword(password, salt);
  return originalPassHash === currentPassHash;
}*/

// ověří heslo, pokusí se najít u6ivatele v databázi, pokud je nalezen vrátí jeho údaje jinak vrátí status chyby
export async function authenticate(username, password) {
  try {
    var db = await Database.open(process.env.DB_FILE);
    let hash = encryptPassword(password, my_salt);
    /*načtu záznam subscribera*/
    let row = await db.get(
      "SELECT sub_id,email,name FROM subscriber WHERE name = ? AND password = ?",
      [username, hash]
    );
    if (row) {
      /*Tento kód používá destrukturalizaci objektu v JavaScriptu k extrakci hodnoty password z objektu user a zároveň vytváří nový objekt userWithoutPassword,
       který obsahuje všechny ostatní vlastnosti objektu user, ale neobsahuje vlastnost password.*/
      //const { password, ...userWithoutPassword } = row;
      return getOk("User found", row);
    } else {
      /*nalezen9 podle emailu*/
      row = await db.get(
        "SELECT sub_id,email,name FROM subscriber WHERE email = ? AND password = ?",
        [username, hash]
      );
      if (row) {
        return getOk("User found", row);
      } else {
        return getError("User Not found.", 401);
      }
    }
  } catch (error) {
    throw Error(error.message);
  } finally {
    if (db) db.close(); // pokud selže open tak je db undefined
  }
}

export async function register(username, email, password) {
  try {
    var db = await Database.open(process.env.DB_FILE);
    /*heslo vložím do databáze jako hash*/
    /*vložím záznam do tabulky subscriber, duplicita emailu je hlídaná indexem*/
    var result = await db.run(
      "INSERT INTO subscriber(email,name,password,start_date) VALUES (?,?,?,datetime('now','localtime'))",
      [email, username, encryptPassword(password, my_salt)]
    );
    // result obsahuje v changes provedené změny a v lastID vložený id
    if (result.changes == 1) {
      return getOk("User created.", {
        sub_id: result.lastID,
        name: username,
        email: email,
      });
    } else {
      return getError("User not created.", 401);
    }
  } catch (error) {
    // pokud text chyby obsahuje SQLITE_CONSTRAINT tak to znamená že zadávaný email není unikátní
    if (error.message.includes("SQLITE_CONSTRAINT")) {
      return getError("User email is used.", 401);
    }
    throw Error(error.message);
  } finally {
    if (db) db.close(); // pokud selže open tak je db undefined
  }
}

// ověří heslo, pokusí se najít klienta v databázi, pokud je nalezen vrátí jeho údaje jinak vrátí status chyby
export async function changePassword(sub_id, old_password, password) {
  try {
    var db = await Database.open(process.env.DB_FILE);
    /*načtu záznam subscribera - hledám podle starého hesla*/
    var row = await db.get(
      "SELECT sub_id FROM subscriber WHERE sub_id = ? AND password = ?",
      [sub_id, encryptPassword(old_password, my_salt)]
    );
    if (row) {
      /*pokud staré heslo odpovídá tak updatujeme heslo v záznamu subscribera*/
      await db.run("UPDATE subscriber SET password = ? WHERE sub_id = ?", [
        encryptPassword(password, my_salt),
        sub_id,
      ]);
      var row = await db.get(
        "SELECT sub_id,email,name,end_date,start_date,last_run,last_render_id,last_render_status,total_count,max_count,disabled FROM subscriber WHERE sub_id = ?",
        [sub_id]
      );
      if (row) {
        row.avatar_url = getAvatar(row.email);
        return getOk("Ok", row);
      } else {
        return getError("User Not found.", 401);
      }
    } else {
      return getError("User Not found.", 401);
    }
  } catch (error) {
    throw Error(error.message);
  } finally {
    if (db) db.close(); // pokud selže open tak je db undefined
  }
}
