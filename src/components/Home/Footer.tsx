import { Container } from "react-bootstrap";
import "../../App.css";

export default function Footer(): JSX.Element {
  return (
    <Container className="text-center">
      <hr className="hr-spec" />
      <div className="d-flex justify-content-between">
        <span id="visit-count"></span>
        <span id="total-count"></span>
      </div>
      <span className="d-block mb-3 mt-3 fst-italic">
        For any inquiries or feedback, please contact Irfan Batur at
        <a className="ms-1">ibatur@asu.edu</a>
      </span>
      <span
        style={{
          fontSize: "15px",
          padding: "30px",
        }}
      >
        &copy; 2022 TOMNET UTC
      </span>
    </Container>
  );
}
