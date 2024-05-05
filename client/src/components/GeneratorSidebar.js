import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import Icon from "@mdi/react";
import {
  mdiBed,
  mdiSofa,
  mdiCamera,
  mdiTimerSandComplete,
  mdiAutoFix,
  mdiImage,
} from "@mdi/js";
import RenderingBtn from "../components/RenderingBtn";
import { useRef, useState, useEffect } from "react";
import { useApi } from "../contexts/ApiProvider";
import { useFlash } from "../contexts/FlashProvider";
import { useUser } from "../contexts/UserProvider";

const imageMimeType = /image\/(jpg|jpeg)/i;

export default function Sidebar() {
  const roomTypeField = useRef();
  const styleField = useRef();
  const resolutionField = useRef();
  const modeField = useRef();
  const declutterField = useRef();
  const api = useApi();
  const flash = useFlash();
  const { user, refreshUser, setUser } = useUser();
  const [file, setFile] = useState(null); // vybraný soubor, výchozí hodnota je null
  const [fileDataURL, setFileDataURL] = useState(null); // url pro načtení preview
  const [isSyncActive, setIsSyncActive] = useState(false); // signalizuje že probíhá dotazování na stav renderu tj.synchronizace
  const [isRendering, setIsRendering] = useState(false); // signalizuje že bylo kliknuto na vytvořit render nebo variantu

  /* reakce na výběr souboru v input elementu*/
  const handleFileChange = (e) => {
    const fl = e.target.files[0];
    if (!fl.type.match(imageMimeType)) {
      flash("Image type is not valid", "danger");
      return;
    }
    setFile(fl);
  };

  /*https://blog.logrocket.com/using-filereader-api-preview-images-react/ */
  /* podpora pro zobrazení preview obrázku pomocí FileReader API*/
  useEffect(() => {
    let fileReader,
      isCancel = false;
    if (file) {
      fileReader = new FileReader();
      fileReader.onload = (e) => {
        const { result } = e.target;
        if (result && !isCancel) {
          setFileDataURL(result);
        }
      };
      fileReader.readAsDataURL(file);
    }
    return () => {
      isCancel = true;
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort();
      }
    };
  }, [file]);

  /*opakované dotazování na stav renderu dokud není done*/
  useEffect(() => {
    // pokud chceme opakovaně dotazovat stav renderu, pak je nastavíme interval
    const intervalId = setInterval(async () => {
      if (isSyncActive) {
        console.log("Sync called - render_id : " + user.last_render_id);
        // pokud má přihlášený uživatel aktivní render a tento není done tak se dotážeme na stav
        if (user.last_render_id && user.last_render_status !== "done") {
          const response = await api.syncRender(user.last_render_id);
          if (response.ok && response.body.data.status === "done") {
            // vracíme ok pokud došlo k úspěšnému volání API tj. i když API odpovídá že render ještě není hotov (status)
            // status done signalizuje že je render hotov
            //refreshUser(); // aktualizujeme stav uživatele (tj. načteme si render id i stav), změna user vyvolá načtení galerie
            /*okamžitě změníme stav renderu, last_render_id zůstává stejné
            !!! nelze měnit přímo user - je nutno o něm uvažovat jako read only
             je nutno pomocí spread vytvořit nový objekt a v něm provést změny a pak jím změnit state setUser */
            setUser({
              ...user, // Copy the old fields
              last_render_status: "done",
            });
            setIsSyncActive(false); // dále se nebudeme dotazovat na stav
            console.log("Sync done - render_id : " + user.last_render_id);
          } else {
            setIsSyncActive(true); // pokračujeme v dotazování
          }
        } else {
          setIsSyncActive(false); // dále se nebudeme dotazovat
        }
      }
    }, 10000); /*spouštět po 10 sekundách */
    // cleanup code
    return () => {
      clearInterval(intervalId);
    };
  }, [api, isSyncActive, user, setUser]);

  /*vytvoření nového renderu*/
  const handleCreateRender = async (ev) => {
    ev.preventDefault();
    // kontrolujeme zda byl vybrán soubor
    if (!file) {
      flash("File must be selected", "danger");
      return;
    }
    if (file) {
      setIsRendering(true); // signalizujeme vytváření renderu, button zobrazí spinner
      const formData = new FormData();
      formData.append("sub_id", user.sub_id);
      formData.append("room_type", roomTypeField.current.value);
      formData.append("style", styleField.current.value);
      formData.append("mode", modeField.current.value);
      formData.append("resolution", resolutionField.current.value);
      formData.append("declutter", declutterField.current.value);
      formData.append("image_file", file);
      try {
        console.log(
          "Create render clicked - render_id : " + user.last_render_id
        );
        const response = await api.createRender(formData);
        if (response.ok) {
          /*okamžitě změníme stav renderu a last_render_id
          !!! nelze měnit přímo objekt user - je nutno o něm uvažovat jako o read only
          je nutno pomocí spread vytvořit nový objekt a v něm provést změnu a pak jím změnit state setUser */
          setUser({
            ...user, // Copy the old fields
            last_render_status: "rendering",
            last_render_id:
              response.body.data
                .render_id /*okamžitě změníme id posledního renderu*/,
          });
          setIsSyncActive(true); /*spustíme timer pro testování stavu*/
          console.log(
            "Create render done - render_id : " + user.last_render_id
          );
        } else {
          flash(response.body.info, "danger");
        }
      } catch (error) {
        flash(error.message, "danger");
        console.error(error);
      }
      setIsRendering(false);
    }
  };

  /*vytvoření varianty existujího renderu*/
  const handleCreateVariation = async (ev) => {
    ev.preventDefault();
    try {
      setIsRendering(true);
      console.log(
        "Create variation clicked - render_id : " + user.last_render_id
      );
      const response = await api.createVariation(
        user.last_render_id,
        roomTypeField.current.value,
        styleField.current.value
      );
      if (response.ok) {
        /*okamžitě změníme stav renderu, last_render_id zůstává stejné
          !!! nelze měnit přímo objekt user - je nutno o něm uvažovat jako o read only
          je nutno pomocí spread vytvořit nový objekt a v něm provést změnu a pak jím změnit state setUser */
        setUser({
          ...user, // Copy the old fields
          last_render_status: "rendering", // stav aktivního renderu je odteď rendering
        });
        setIsSyncActive(true); /*spustíme timer pro testování stavu*/
        console.log(
          "Create variation done - render_id : " + user.last_render_id
        );
      } else {
        flash(response.body.info, "danger");
      }
    } catch (error) {
      flash(error.message, "danger");
      console.error(error);
    }
    setIsRendering(false);
  };

  /*načtení stavu renderu z externího API*/
  const handleSync = async (ev) => {
    ev.preventDefault();
    if (user.last_render_id) {
      setIsRendering(true);
      try {
        const response = await api.syncRender(user.last_render_id); // načte stav z externího api a uloží ho do databáze
        if (response.ok) {
          refreshUser(); // aktualizujeme stav uživatele - získá aktulizované hodnoty, změna usera vyvolá načtení galerie
        } else {
          flash(response.body.info, "danger");
        }
      } catch (error) {
        flash(error.message, "danger");
        console.error(error);
      }
      setIsRendering(false);
    }
  };

  /*vlastní stažení souborů, dynamicky vytvoří link element <a>, simuluje click a element zase smaže*/
  const downloadFile = async (url, fileName) => {
    try {
      let response = await fetch(url);
      let blob = await response.blob();
      const objUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = objUrl;
      link.download = fileName || "downloaded-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error fetching the file:", error);
    }
  };

  /*stažení vytvořených renderů
    načte images aktivního renderu
    stažení většího množství souborů může být blokováno browserem resp. může vyžadovat potvrzení uživatele
  */
  const handleDownload = async (ev) => {
    ev.preventDefault();
    if (user.last_render_id) {
      let response = await api.getRenderImages(user.last_render_id);
      if (response.ok){
        response.body.data.forEach(img => {
          downloadFile(img.original, img.description);
        });
      }
    }
  };

  return (
    <Form className="Sidebar">
      <Stack direction="vertical" gap={4}>
        <Container>
          <Form.Group controlId="formFile" className="mb-3">
            <Stack direction="horizontal" className="IconHeader">
              <Icon path={mdiImage} size={1} />
              &nbsp;
              <h2>Vlož obrázek</h2>
            </Stack>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg"
              onChange={handleFileChange}
            />
          </Form.Group>
          {fileDataURL ? (
            <Image
              src={fileDataURL}
              thumbnail
              alt="preview"
              className="ImagePreview"
            />
          ) : null}
        </Container>

        <Stack direction="vertical" gap={3}>
          <Container>
            <Stack direction="horizontal" className="IconHeader">
              <Icon path={mdiBed} size={1} />
              &nbsp;
              <h2>Typ pokoje</h2>
            </Stack>
            <Form.Select ref={roomTypeField}>
              <option value="living">Obývací pokoj</option>
              <option value="bed">Ložnice</option>
              <option value="kitchen">Kuchyně</option>
              <option value="dining">Jídelna</option>
              <option value="bathroom">Koupelna</option>
              <option value="home_office">Kancelář</option>
            </Form.Select>
          </Container>
          <Container>
            <Stack direction="horizontal" className="IconHeader">
              <Icon path={mdiSofa} size={1} />
              &nbsp;
              <h2>Styl pokoje</h2>
            </Stack>
            <Form.Select ref={styleField}>
              <option value="standard">Standardní</option>
              <option value="modern">Moderní</option>
              <option value="scandinavian">Skandinávský</option>
              <option value="industrial">Industriální</option>
              <option value="midcentury">Midcentury</option>
              <option value="luxury">Luxusní</option>
              <option value="farmhouse">Farmářský</option>
              <option value="coastal">Přímořský</option>
            </Form.Select>
          </Container>
          <Container>
            <Stack direction="horizontal" className="IconHeader">
              <Icon path={mdiCamera} size={1} />
              &nbsp;
              <h2>Rozlišení</h2>
            </Stack>
            <Form.Select ref={resolutionField}>
              <option value="4k">4k</option>
              <option value="full-HD">Full-HD</option>
            </Form.Select>
          </Container>
          <Container>
            <Stack direction="horizontal" className="IconHeader">
              <Icon path={mdiTimerSandComplete} size={1} />
              &nbsp;
              <h2>Kvalita</h2>
            </Stack>
            <Form.Select ref={modeField}>
              <option value="fast">Rychlý</option>
              <option value="photorealism">Fotorealistický</option>
            </Form.Select>
          </Container>
          <Container>
            <Stack direction="horizontal" className="IconHeader">
              <Icon path={mdiAutoFix} size={1} />
              &nbsp;
              <h2>Odstranit nábytek</h2>
            </Stack>
            <Form.Select ref={declutterField}>
              <option value="off">Ne</option>
              <option value="on">Ano</option>
            </Form.Select>
          </Container>
        </Stack>
        {/* Vytvořit vizualizaci - povoleno pouze pokud je načtený soubor
            Vytvořit variantu - povoleno pouze pokud je aktivní render
            Synchronizovat - povoleno pouze pokud je aktivní render + v produkci natvrdo hidden
            Stáhnout  - povoleno pouze pokud je aktivní render
        */}
        <Stack direction="vertical" gap={3}>
          {isRendering || isSyncActive ? (
            <RenderingBtn />
          ) : (
            <Button
              variant="primary"
              className="SideButton"
              onClick={handleCreateRender}
              disabled={file === null}
            >
              Vytvořit vizualizaci
            </Button>
          )}
          {isRendering || isSyncActive ? (
            <RenderingBtn />
          ) : (
            <Button
              variant="primary"
              className="SideButton"
              onClick={handleCreateVariation}
              disabled={user === null || user.last_render_id === null}
            >
              Vytvořit variantu
            </Button>
          )}
          <Button
            variant="primary"
            className="SideButton"
            onClick={handleSync}
            disabled={user === null || user.last_render_id === null}
            hidden={true}
          >
            Synchronizovat
          </Button>
          <Button
            variant="primary"
            className="SideButton"
            onClick={handleDownload}
            disabled={user === null || user.last_render_id === null}
          >
            Stáhnout vizualizace
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
