const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

export default class StagingApiClient {
  constructor() {
    this.base_url = BASE_API_URL;
  }

  async request(options) {
    let query = new URLSearchParams(options.query || {}).toString();
    if (query !== "") {
      query = "?" + query;
    }
    let stagingUser = JSON.parse(localStorage.getItem("stagingUser"));
    let authdata = "";
    if (stagingUser !== null) {
      authdata = stagingUser.authdata;
    }
    let response;
    try {
      response = await fetch(this.base_url + options.url + query, {
        method: options.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + authdata,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : null,
      });
    } catch (error) {
      response = {
        ok: false,
        status: 500,
        json: async () => {
          return {
            code: 500,
            info: "The server is unresponsive",
            description: error.toString(),
          };
        },
      };
    }

    return {
      ok: response.ok,
      status: response.status,
      body: response.status !== 204 ? await response.json() : null,
    };
  }

  async get(url, query, options) {
    return this.request({ method: "GET", url, query, ...options });
  }

  async post(url, body, options) {
    return this.request({ method: "POST", url, body, ...options });
  }


  /*pokusí se autorizovat na backendu,
  najde záznam v tabulce subscriber - předané username považuje za jméno, pokud nenajde zkusí email, kontroluje heslo
  při úspěchu vrací true jinak false
  request neobsahuje header Authorization - logicky ho musí backed propustit, tyto údaje ještě nemáme*/
  async login(username, password) {
    const response = await fetch(this.base_url + "/user/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      return false;
    }
    // dostávám zpět informace o userovi, uložím si ji do local storage
    // ukládám sub_id,email,name a authdata - kód a heslo
    let user = await response.json();
    user.authdata = window.btoa(username + ":" + password);
    // infomace o přihlášení si uložím do local storage
    localStorage.setItem("stagingUser", JSON.stringify(user));
    return true;
  }

  /*odhlášení uživatele - smaže údaje o přihlášeném uživateli v local storage
  poté při pokusu o akci která požaduje přihlášení tot nelze provést a jsem přesměrováni na login page*/
  async logout() {
    localStorage.removeItem("stagingUser");
  }

  // odpovídá na otázku "kdo jsem"
  // vrací data aktuálně přihlášeného usera(subscribera), pokud není přihlášený vrací null
  // informace pro header Authentication  = přihlášení najde v local storage
  // v local storage najde i sub_id přihlášeného uživatele (subscribera)
  async userAuthenticated() {
    let stagingUser = JSON.parse(localStorage.getItem("stagingUser"));
    if (stagingUser !== null) {
      let response = await this.get("/user/" + stagingUser.sub_id, "", {});
      if (response.ok) {
        return response.body;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  //vytvoření renderu
  async createRender(formData) {
    let stagingUser = JSON.parse(localStorage.getItem("stagingUser"));
    let authdata = "";
    if (stagingUser !== null) {
      authdata = stagingUser.authdata;
    }
    let response;
    try {
      response = await fetch(this.base_url + "/staging/render", {
        method: "POST",
        headers: {
          //"content-type": "multipart/form-data",  toto nesmí být zadáno jinak multer hlásí Boundary not found
          Authorization: "Basic " + authdata,
        },
        body: formData,
      });
    } catch (error) {
      response = {
        ok: false,
        status: 500,
        json: async () => {
          return {
            code: 500,
            info: "The server is unresponsive",
            description: error.toString(),
          };
        },
      };
    }

    return {
      ok: response.ok,
      status: response.status,
      body: response.status !== 204 ? await response.json() : null,
    };
  }

  //vytvoření varianty renderu
  async createVariation(render_id, room_type, style) {
    return await this.post("/staging/variation", {
      render_id: render_id,
      room_type: room_type,
      style: style,
    });
  }

  //dotaz na stav renderu
  async syncRender(render_id) {
    return await this.post("/staging/sync_render", { render_id: render_id });
  }

  // vrací vytvořené rendery - pro jedno render_id
  async getRenderImages(render_id) {
    return await this.get("/staging/render_images/"+ render_id );
  }

  // vrací vytvořené rendery - všechny render_id za celý subjekt
  async getSubjectImages(sub_id) {
    return await this.get("/staging/subject_images/"+ sub_id );
  }

  // při neexistenci renderu vrací vzorové obrázky
  async getRenderSpecimen() {
    const result = await this.get("/staging/render_specimen");
    // do cessty ke statickým obrázkům doplníme base path aby je bylo možno zobrazit
    if (result.ok) {
       const images = result.body.data.map((item) => (
         {original:this.base_url + item.original, thumbnail:this.base_url + item.thumbnail,description:item.description}));
       result.body.data = images;
      }
    return result;
  }

}
