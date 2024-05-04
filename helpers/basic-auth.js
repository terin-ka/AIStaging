import { authenticate } from "../abl/user/userService-abl.js";
import { getError } from "../helpers/utils.js";

export async function basicAuth(req, res, next) {
  // make authenticate + register path public
  // tyto route nebudu overovat a posílám je dále
  if ((req.path === "/user/authenticate") || (req.path === "/user/register")) {
    return next();
  }

  // ostatní route musí projít ověřením
  // zkontroluji zda je v requestu přítomen  header "Authorization" který obsahuje slovo "Basic" mezeru a Base64 encoded řetězec "username:password"
  // např. user "demo" password "p@55w0rd"
  // Authorization: Basic ZGVtbzpwQDU1dzByZA==
  if (
    !req.headers.authorization ||
    req.headers.authorization.indexOf("Basic ") === -1
  ) {
    return res.status(401).send(getError("Missing Authorization Header",401));
  }

  // ze zaslaného řetězce získám zpět jméno a heslo
  const base64Credentials = req.headers.authorization.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );
  const [username, password] = credentials.split(":");

  // podle jména + hesla se pokusím najít v tabulce Subscriber odpovídajícího uživatele
  const response = await authenticate(username, password);
  if (response.ok){
    // pokud jsem uživatele našel považuji ověření za úspěšné
    req.user = response.data;
  } else {
    // pokud jsem uživatele nenašel vracím status code 401 a dále jž request nepokračuje a vrací se odesilateli
    return res
      .status(401)
      .send(getError("Invalid Authentication Credentials",401));
  }

  next();
}
