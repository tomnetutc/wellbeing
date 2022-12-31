import { Content } from "../components/About/Content";
import { Sidebar } from "../components/About/Sidebar";
import "../App.css";
import { Container } from "react-bootstrap";

export function About(): JSX.Element {
  return (
    <>
      <Container>
        <Sidebar />
        <Content />
      </Container>
    </>
  );
}
