import { default as axios } from "axios";

/*API endpoint pro vytvoření variace renderu*/
const api_urlCreateVariation =
  "https://api.virtualstagingai.app/v1/render/create-variation";

/* render_id se zasílá jako query parameter */
export async function postCreateVariation(render_id, room_type, style) {
  try {
    /*body parametry*/
    const data = {
      roomType: room_type,
      style: style,
      wait_for_completion: false,
      switch_to_queued_immediately: true,
    };
    const config = {
      params: {
        render_id: render_id, /*query parametr*/
      },
      headers: {
        Authorization: "Api-key " + process.env.API_KEY,
      },
    };
    let response = await axios.post(api_urlCreateVariation, data, config);
    if (response.status === 200) {
      return response.data;
    } else {
      throw Error(response.data);
    }
  } catch (error) {
    throw Error(error.message);
  }
}
