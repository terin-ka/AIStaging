import { default as axios } from "axios";

/*API endpoint pro získání statusu renderu*/
const api_urlRender = "https://api.virtualstagingai.app/v1/render"; 

/* Virtual Staging API - endpoint Get existing render*/
export async function getRender(render_id) {
    try {
      const config = {
        params: {
          render_id: render_id,
        },
        headers: {
          Authorization: "Api-key " + process.env.API_KEY,
        },
      };
      let response = await axios.get(api_urlRender, config);
      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data);
      }
    } catch (error) {
      throw Error(error.message);
    }
  }