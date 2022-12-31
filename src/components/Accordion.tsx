import { useState } from "react";
import { Accordion, Card } from "react-bootstrap";
import { CustomToggle } from "../utils/Helpers";
import { AccordionProps } from "./Types";

export function CustomAccordion({
  customAccordionProps,
}: AccordionProps): JSX.Element {
  const [activeKey, setActiveKey] = useState(0);
  return (
    <Accordion>
      <Card>
        <Card.Header
          style={{
            backgroundColor: "#fffcd9",
            height: "90px",
            display: "table",
          }}
        >
          <div
            style={{
              color: "#802020",
              verticalAlign: "middle",
              display: "table-cell",
            }}
          >
            {customAccordionProps.headText1 ? (
              <span className="d-block fs-5">
                {customAccordionProps.headText1}
                {customAccordionProps.img ? (
                  <img
                    src={customAccordionProps.img}
                    height="35px"
                    width="35px"
                    alt="Accordion Image"
                    className="ms-2"
                  ></img>
                ) : null}
              </span>
            ) : null}
            <span className="fs-5">{customAccordionProps.headText2}</span>
            <CustomToggle
              eventKey="0"
              handleClick={() => {
                if (activeKey === 0) {
                  setActiveKey(1);
                } else {
                  setActiveKey(0);
                }
              }}
            >
              {activeKey === 0 ? (
                <div className="downward-arrow ms-1">
                  <span></span>
                </div>
              ) : (
                <div className="upward-arrow ms-1">
                  
                  <span></span>
                </div>
              )}
            </CustomToggle>
          </div>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body style={{ backgroundColor: "#fffcd9" }}>
            <Card.Text style={{ textAlign: "justify" }}>
              {customAccordionProps.cardTextFirst ? (
                <span>{customAccordionProps.cardTextFirst}</span>
              ) : null}
              {customAccordionProps.cardTextSecond ? (
                <span className="d-block mt-3">
                  {customAccordionProps.cardTextSecond}
                </span>
              ) : null}
              {customAccordionProps.cardTextThird ? (
                <span className="d-block mt-3">
                  {customAccordionProps.cardTextThird}
                </span>
              ) : null}
            </Card.Text>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
}
