import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Image from "react-bootstrap/Image";
//import Spinner from "react-bootstrap/Spinner";
import { NavLink } from "react-router-dom";
import { useUser } from "../contexts/UserProvider";

export default function Header() {
  const { user, logout } = useUser();

  return (
    <Navbar bg="light" sticky="top" className="Header">
      <Container>
        <Navbar.Brand>
        <img  alt=""
              src="/logo192.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
          VirtualStaging</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link  as={NavLink} to="/home">Home</Nav.Link>
            <Nav.Link  as={NavLink} to="/generator">Generator</Nav.Link>
            <Nav.Link  as={NavLink} to="/galerie">Galerie</Nav.Link>
          </Nav>
        <Nav>
          {/* přihlášeného uživatele zobrazuji pouze pokud jsem přihlášen */}
          {user === undefined ? (
            <>
            {/*<Spinner animation="border" />*/}
            </>
          ) : (
            <>
              {user !== null && (
                <>
                  <Navbar.Collapse className="justify-content-end">
                    <NavDropdown  title={<Image src={user.avatar_url + "&s=32"} roundedCircle />} align="end" >
                      <NavDropdown.Item  as={NavLink} to={"/profil/" + user.sub_id}>
                        Profile
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item as={NavLink} to="/password">
                        Change Password
                      </NavDropdown.Item>
                      <NavDropdown.Item onClick={logout}>
                        Logout
                      </NavDropdown.Item>
                    </NavDropdown>
                    <Navbar.Text>{user.name}</Navbar.Text>
                  </Navbar.Collapse>
                </>
              )}
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
