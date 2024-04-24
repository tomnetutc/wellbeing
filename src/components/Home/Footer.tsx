import { Container } from "react-bootstrap";
import { hideFlagCounter, tracking } from "../../utils/Helpers";
import "../../App.css";
import { useEffect } from "react";

export default function Footer(): JSX.Element {

  return (
    <Container className="text-center">
      <hr className="hr-spec" />
      <div className="d-flex justify-content-between">
        <span id="visit-count"></span>
        <span id="total-count"></span>
      </div>
      <span className="d-block mb-3 mt-3 fst-italic">
        For any inquiries or feedback, please contact Dr. Irfan Batur at
        <a className="ms-1">ibatur@asu.edu</a>
      </span>
      <span
        style={{
          fontSize: "15px",
          padding: "30px",
        }}
      >
        &copy; 2024 TOMNET UTC
      </span>


      {/* 
      The below code is for flagcounter. This fetches the user location, OS and browser details. 
       */}

      <a href="https://www.flagcounter.me/details/d6l">
        <img src="https://www.flagcounter.me/d6l/" alt="Flag Counter" id="flag-counter-img" />
      </a>
    
    </Container>
  );
}
