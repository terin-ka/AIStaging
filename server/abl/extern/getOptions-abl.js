import { default as axios } from "axios";

const api_urlOptions = "https://api.virtualstagingai.app/v1/options";

/* Virtual Staging API - endpoint Get available room types & styles*/
export async function getOptions() {
    try {
      const config = {
        headers: {
          Authorization: "Api-key " + process.env.API_KEY,
        },
      };
      let response = await axios.get(api_urlOptions, config);
      if (response.status === 200) {
        return response.data;
      } else {
        throw Error(response.data);
      }
    } catch (error) {
      throw Error(error.message);
    }
  }