import { NavLink } from "react-router-dom";
import { Container, Nav, Navbar as NavbarBs } from "react-bootstrap";

export function Navbar(): JSX.Element {
  return (
    <NavbarBs sticky="top" className="bg-white shadow-sm">
      <Container>
        <Nav>
          <Nav.Link to={"/"} as={NavLink}>
            Home
          </Nav.Link>
          <Nav.Link to={"/about"} as={NavLink}>
            About
          </Nav.Link>
        </Nav>
      </Container>
    </NavbarBs>
  );
}
