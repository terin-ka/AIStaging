import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

//https://bobbyhadz.com/blog/javascript-dirname-is-not-defined-in-es-module-scope

export function getFilename(metaUrl) {
  const __filename = fileURLToPath(metaUrl);

  return __filename;
}

export function getDirname(metaUrl) {
  const __dirname = path.dirname(getFilename(metaUrl));

  return __dirname;
}

export function getError(message, code = 500) {
  return { status: "error", code: code, info: message, error: true };
}

export function getOk(message, data = null) {
  return { status: "ok", code: 200, info: message, data: data, ok: true };
}

export function getAvatar(email) {
  // Výpočet MD5 hashe
  const hash = crypto
    .createHash("md5")
    .update(email.toLowerCase(), "utf8")
    .digest("hex");
  // Generování URL pro Gravatar
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}

/*z url renderu vybere jméno souboru renderu*/
export function getRenderName(image_url) {
  let rest = image_url.substring(image_url.indexOf("outputs/") + 8); // Najdeme část za "outputs/"
  if (rest !== -1) {
    const pos = rest.indexOf(".png?"); // Najdeme pozici ".png?" ve zbytku URL
    rest = rest.substring(0, pos + 4); // Vybereme část URL od začátku do pozice ".png?" včetně
  } else {
    rest = null;
  }
  return rest;
}
