import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

export default function RenderingBtn() {
  return (
    <Button variant="primary" className="SideButton" disabled>
      <Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
      />{' '}
      Rendering...
    </Button>
  );
}
