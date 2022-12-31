import { Container } from "react-bootstrap";
import { CustomAccordion } from "../Accordion";
import HeartbeatLifeline from "../../images/heart-beat-lifeline.svg";

const customAccordionProps = {
  img: HeartbeatLifeline,
  headText1: "WBEAT",
  headText2: "Wellbeing Estimator for Activities and Travel",
  cardTextFirst: `WBEAT is developed based on the wellbeing modules available in
  the 2010, 2012, and 2013 editions of the American Time Use Survey
  (ATUS). It translates time use and activity participation patterns
  of individuals into wellbeing scores while controlling for their
  socio-demographic and economic attributes. The estimated scores
  reflect the overall daily wellbeing of individuals. When these scores are
  aggregated from the person level, they can be used to compare the
  wellbeing of one group to that of other groups in the population.
  More details about the methodology can be found on the about page.`,
  cardTextSecond: `The developed WBEAT model was applied to all editions of American
  Time Use Survey since 2003. Use the charts below to track and
  compare how wellbeing evolved over time and space in and across
  society.`,
  cardTextThird: "",
};

export default function Header(): JSX.Element {
  return (
    <Container className="text-center">
      <h1 className="display-5 fw-bold lead mt-4">
        Tracking Wellbeing in Society
      </h1>
      <h6 className="lead">
        An Interactive Activity-Based Wellbeing Assessment Platform by TOMNET
        University Transportation Center
      </h6>
      <span className="d-block mt-4 mb-4 lead fs-5">
        Measurement of wellbeing is critical for addressing social disparities
        and promoting equitable and sustainable living. Here, we present three
        activity/time use-based wellbeing indicators that are designed to assess
        how wellbeing has changed over time and place for different population
        subgroups.
      </span>
      <CustomAccordion customAccordionProps={customAccordionProps} />
    </Container>
  );
}
