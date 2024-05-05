import { Stack } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import Body from "../components/Body";
import GeneratorSidebar from "../components/GeneratorSidebar";
import ImageGallery from "react-image-gallery";

import { useState, useEffect } from "react";
import { useApi } from "../contexts/ApiProvider";
import { useUser } from "../contexts/UserProvider";

export default function GeneratorPage() {
  const api = useApi();
  const { user } = useUser();

  const [images, setImages] = useState(null);    // pro hodnotu null zobrazíme spinner

  useEffect(() => {
    (async () => {
      // pokud nemám render zobrazím specimen 
      if (user.last_render_id) {
        let response = await api.getRenderImages(user.last_render_id);
        setImages(response.ok ? response.body.data : null);
      } else {
        let specimen = await api.getRenderSpecimen();
        setImages(specimen.ok ? specimen.body.data : null);
      }
    })();
  }, [user, api]);

  return (
    <Body>
      <Stack direction="horizontal">
        <GeneratorSidebar />
        <div className="image-gallery-wrapper">
          {images === null ? (
            <Spinner animation="border" />
          ) : (
            <ImageGallery items={images} showBullets="true" showIndex="true" thumbnailPosition="bottom" />
          )}
        </div>
      </Stack>
    </Body>
  );
}
