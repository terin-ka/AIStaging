import { default as axios } from "axios";

/*API endpoint pro vytvoření renderu*/
const api_urlCreateRender = "https://api.virtualstagingai.app/v1/render/create";

/* Virtual Staging API - endpoint CreateRender*/
/* parametrem jsou form data získaná frontendem - obsahují uploadovaný soubor
pokud zasíláme soubor formou formData (a nikoliv jako url) tak zbytek parametrů požaduje dokumentace API poslat jako query parameter
navíc ve formData nelze předat boolean hodnotu - axiom dává chybu TypeError: data should be a string, Buffer or Uint8Array
pokud se zadá jako string 'false' tak tomu API nerozumí nastavuje defaultně true což nechceme*/
export async function postCreateRender(
  room_type,
  style,
  mode,
  resolution,
  declutter,
  formData
) {
  try {
    const config = {
      params: {
        roomType: room_type,
        style: style,
        mode: mode,
        resolution: resolution,
        declutter_mode: declutter,
        wait_for_completion: false,
      },
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Api-key " + process.env.API_KEY,
      },
    };
    /* formData obsahují pouze file */
    let response = await axios.post(api_urlCreateRender, formData, config);
    if (response.status === 200) {
      return response.data;
    } else {
      throw Error(response.data);
    }
  } catch (error) {
    throw Error(error.message);
  }
}