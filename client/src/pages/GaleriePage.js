
import Spinner from "react-bootstrap/Spinner";
import Body from "../components/Body";
import ImageGallery from "react-image-gallery";

import { useState, useEffect } from "react";
import { useApi } from "../contexts/ApiProvider";
import { useUser } from "../contexts/UserProvider";

/* podklady pro galerii vypadají takto

  const images = [
  {
    original: "https://picsum.photos/id/1024/1000/600/",
    thumbnail: "https://picsum.photos/id/1024/250/150/",
    description: "picture 1",
  },
  {
    original: "https://picsum.photos/id/1025/1000/600/",
    thumbnail: "https://picsum.photos/id/1025/250/150/",
    description: "picture 2",
  },
  {
    original: "https://picsum.photos/id/1026/1000/600/",
    thumbnail: "https://picsum.photos/id/1026/250/150/",
    description: "picture 3",
  },
  {
    original: "https://picsum.photos/id/1027/1000/600/",
    thumbnail: "https://picsum.photos/id/1027/250/150/",
    description: "picture 4",
  },
  {
    original: "https://picsum.photos/id/1029/1000/600/",
    thumbnail: "https://picsum.photos/id/1029/250/150/",
    description: "picture 5",
  },
];
*/

export default function GaleriePage() {
  const api = useApi();
  const { user } = useUser();

  const [images, setImages] = useState(null);    // pro hodnotu null zobrazíme spinner

  useEffect(() => {
    (async () => {
      // pokud nemám render zobrazím specimen tj. obrázky které jsou uloženy ve static files backendu
      if (user) {
        let response = await api.getSubjectImages(user.sub_id);
        setImages(response.ok ? response.body.data : null);
      } else {
        let specimen = await api.getRenderSpecimen();
        setImages(specimen.ok ? specimen.body.data : null);
      }
    })();
  }, [user, api]);


  return (
    <Body>
      <h1>Galerie</h1>
      <div className="image-gallery-wrapper">
          {images === null ? (
            <Spinner animation="border" />
          ) : (
            <ImageGallery items={images} showBullets="true" onErrorImageURL="/specimen.png" />
          )}
        </div>

    </Body>
  );
}