import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import Body from "../components/Body";
import GeneratorSidebar from "../components/GeneratorSidebar";
import ImageGallery from "react-image-gallery";

import { useState, useEffect } from "react";
import { useApi } from "../contexts/ApiProvider";
import { useUser } from "../contexts/UserProvider";

export default function HomePage() {
  const api = useApi();
  const { user } = useUser();
  const [images, setImages] = useState(null); // pro hodnotu null zobrazím spinner

  useEffect(() => {
    (async () => {
      // pokud nemám render zobrazí specimen
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
      <Container>
        <h1>GENERÁTOR VIZUALIZACÍ</h1>
        <Row className="justify-content-md-center">
          <Col md={12} lg={4}>
            <GeneratorSidebar />
          </Col>
          <Col md={12} lg={8}>
            <div className="image-gallery-wrapper">
              {images === null || images.length === 0 ? (
              <Row className="justify-content-center">
                <Spinner className="Spinner" animation="border" />
              </Row>
              ) : (
                  <ImageGallery
                    items={images}
                    onErrorImageURL="/specimen.png"
                    showBullets="true"
                    showIndex="true"
                    thumbnailPosition="bottom"
                  />
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </Body>
  );
}
