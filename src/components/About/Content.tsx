import scoringMethod from "../../images/wellbeing-diagram.png";
import tpComputation from "../../images/time-poverty-diagram.png";
import "../../App.css";
import { Col, Row } from "react-bootstrap";

export function Content(): JSX.Element {
  return (
    <Row>
      <Col lg={3}></Col>
      <Col lg={9}>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section1" className="mt-4 fw-bold contenthead">
            About the platform
          </h3>
          <p className="mt-4">
            The TOMNET wellbeing platform is an open-source activity/time
            use-based wellbeing tool by
            <a
              className="ps-1"
              href="https://tomnet-utc.engineering.asu.edu/"
              target="_blank"
            >
              TOMNET
            </a>
            , a Tier-1 University Transportation Center funded by U.S.
            Department of Transportation. Development of open-source,
            data-driven tools is at the core of TOMNET’s mission to translate
            academic knowledge into practical applications, and the TOMNET
            wellbeing platform serves as a model endeavor of this approach. It
            consists of three activity/time use-based wellbeing indicators – a
            subjective wellbeing indicator called <i>WBEAT</i>, a time poverty
            indicator, and a zero trip-making indicator. Using data from the
            American Time Use Survey (ATUS), the platform can be used to track
            how changes in activity and time use patterns have impacted the
            wellbeing of various population groups on a year-to-year basis.
            These three indicators were developed for different purposes, so
            they provide different perspectives on the wellbeing that can be
            derived from activity and time use patterns. By combining them, it
            is possible to identify racial, economic, and other social
            disparities in society.
          </p>
          <p>
            <i>
              For any inquiries or feedback, please contact Dr. Irfan Batur at
              <a className="ms-1">ibatur@asu.edu</a>.
            </i>
          </p>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section2" className="mt-4 fw-bold contenthead">
            Wellbeing scoring method
          </h3>
          <p className="mt-4 mb-4">
            The wellbeing scoring approach used to compute the WBEAT wellbeing
            indicator is an improved version of the original methodology
            documented by Khoeini et al. (2018). The methodology was developed
            based on ATUS data and consists of seven steps summarized below.
          </p>
          <div className="text-center">
            <img src={scoringMethod} alt="WbScoringMethod" width="700px"></img>
          </div>
          <ol>
            <li className="mt-4">
              The 2010, 2012, and 2013 editions of the ATUS included a
              comprehensive
              <a
                className="px-1"
                href="https://www.bls.gov/tus/modules/wbdatafiles.htm"
                target="_blank"
              >
                wellbeing module
              </a>
              in which respondents were asked to indicate how they felt on six
              measures of subjective wellbeing (happiness, meaningfulness,
              tiredness, sadness, painfulness, and stress) for three randomly
              selected activities in their time use diary. For each measure,
              individuals indicated their feelings on a scale of 0 to 6, with 0
              representing a lack of any intensity on a particular emotion and a
              6 indicating a very strong level of intensity for a particular
              emotion. All the activities for which emotion scores are available
              (from all three years) were compiled into an integrated database.
            </li>
            <li className="mt-4">
              All activities were categorized into three groups based on
              location: in-home, travel, and out-of-home. This aimed at
              differentiating the locational influence on feelings.
            </li>
            <li className="mt-4">
              The six emotions, taken together, are assumed to define an
              unobserved (latent) wellbeing score. This wellbeing score is not
              explicitly measured. Hence, a latent joint model system
              simultaneously considering all six emotions is formulated. This
              model system relates the latent propensity functions (underlying
              the emotional measures) to an unobserved latent wellbeing score
              that is assumed to be a function of socio-demographic
              characteristics as well as activity-travel attributes. Through
              this formulation, it is possible to estimate a joint wellbeing
              model for each category of in-home, out-of-home, and travel
              activity episodes. Thus, three joint models were estimated.
            </li>
            <li className="mt-4">
              The three wellbeing score models were then applied to the ATUS
              records for a given year. The model application process thus
              computes a wellbeing score for each activity in the data set.
            </li>
            <li className="mt-4">
              The activity-specific wellbeing scores were normalized so that they
              take a value between zero and one.
            </li>
            <li className="mt-4">
              It is assumed that the daily wellbeing score is an additive
              accumulation of all activity-level wellbeing scores computed in
              the prior step. The normalized activity episode wellbeing scores
              for each individual are summed to compute a person-level daily
              wellbeing score. Although these scores do not have a
              straightforward numeric interpretation, they can be used to
              conduct comparisons and assess improvements or degradations in
              wellbeing.
            </li>
          </ol>

          <p className="mt-4">
            Here steps 4 through 6 consider an ATUS data set for a single year.
            Steps 4-6 were thus repeated for each year since 2003 to compute a
            person-level daily wellbeing score for each individual.
          </p>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section3" className="mt-4 fw-bold contenthead">
            Time poverty computation
          </h3>
          <p className="mt-4 mb-4">
            Time poverty concept is often used to describe individuals who do
            not have enough time to engage in discretionary activities that
            presumably enhance wellbeing. Similar to income-based poverty, time
            poverty is linked to poorer wellbeing. A threshold value is used to
            flag time-poor people based on their available discretionary time.
            The computation method is implemented as follows.
          </p>
          <div className="text-center">
            <img src={tpComputation} alt="TpComputation" width="700px"></img>
          </div>
          <ul>
            <li className="mt-4">
              Activities of every individual are first classified into three
              distinct categories: necessary activities, committed activities,
              and discretionary activities. The necessary and committed
              activities include personal care (including sleeping and
              grooming), household activities (including housework and food
              preparation), caring for and helping household members (both
              children and adults), and work activities. All other activities
              are treated as discretionary activities.
            </li>
            <li className="mt-4">
              For each individual, the time spent on necessary and committed
              activities is computed. The total time spent on these activities
              is subtracted from the daily available total of 1440 minutes (24 hours). The
              remaining time is treated as being available for discretionary
              activities.
            </li>
            <li className="mt-4">
              After computing the discretionary time available for each
              individual in the data set, the median discretionary time is
              computed for the entire sample.
            </li>
            <li className="mt-4">
              The threshold value for determining time poverty is set to be 60
              percent of median discretionary time. If an individual has at
              least as much discretionary time as this threshold value, then the
              individual is deemed not time-poor (and vice versa). Note that the
              60 percent median discretionary time ranges from one year to
              another (for example, it was found to be 279 minutes for 2019 and
              288 minutes for 2020).
            </li>
            <li className="mt-4">
              These values were then used to identify time-poor respondents in
              the respective years.
            </li>
          </ul>
          <p className="mt-4">
            More details about the time poverty methodology and its
            interpretation can be found in the following papers.
          </p>
          <ol>
            <li className="mt-4">
              Batur, I., Dirks, A. C., Bhat, C. R., Polzin, S. E., Chen, C., & Pendyala, R. M. (2023).
              Analysis of Changes in Time Use and Activity Participation in Response to the COVID-19 Pandemic in the United States: Implications for well-being.
              Transportation Research Record, 03611981231165020.&nbsp;
              <a href="https://doi.org/10.1177/03611981231165020" target="_blank" rel="noopener noreferrer">https://doi.org/10.1177/03611981231165020</a>
            </li>
            <li className="mt-4">
              Batur, I. (2023). Understanding and Modeling the Nexus of Mobility, Time Poverty, and Wellbeing (Doctoral dissertation, Arizona State University).&nbsp;
              <a href="https://hdl.handle.net/2286/R.2.N.189319" target="_blank" rel="noopener noreferrer">https://hdl.handle.net/2286/R.2.N.189319</a>
            </li>
            <li className="mt-4">
              Kalenkoski, C. M., & Hamrick, K. S. (2013). How does time poverty
              affect behavior? A look at eating and physical activity. Applied
              Economic Perspectives and Policy, 35(1), 89-105.
            </li>
          </ol>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section4" className="mt-4 fw-bold contenthead">
            Zero trip-making computation
          </h3>
          <p className="mt-4 mb-4">
            A situation in which no trips are undertaken throughout the day is
            referred to as zero trip-making. This can lead to feelings of social
            isolation, depression, and other mental health problems as a result
            of not being able to interact in person with others outside the
            home. Zero trip-making is generally seen as a negative indicator of
            wellbeing, indicating that those who do not make any trips in a full
            day may have a lower quality of life.
          </p>
          <p>
            It is easy to identify zero trip-makers in ATUS data sets. If a
            person's activity time use diary does not report any travel outside
            the home, that person is labeled as a zero trip-maker in the data
            set. If the diary does report travel outside the home, the person is
            labeled as a trip-maker.{" "}
          </p>
          <p className="mt-4">
            More details about the notion of zero trip-making and its
            interpretation can be found in the following paper.
          </p>
          <ul>
            <li className="mt-4">
              Batur, I., Sharda, S., Kim, T., Khoeini, S., Pendyala, R. M., &
              Bhat, C. R. (2019). Mobility, Time Poverty, and Well-Being: How
              Are They Connected and How Much Does Mobility Matter?.
            </li>
          </ul>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section5" className="mt-4 fw-bold contenthead">
            Data source
          </h3>
          <p className="mt-4">
            The primary data source for these analyses is the American Time Use
            Survey (
            <a href="https://www.bls.gov/tus/" target="_blank">
              ATUS
            </a>
            ). It collects detailed activity and time use data from randomly
            selected individuals (15+) who are interviewed only once for their
            time-use diary on the previous day (4 am to 4 am), resulting in
            nationally representative estimates of how people spend their time.
            The survey, which is sponsored by the Bureau of Labor Statistics
            (BLS), has been conducted by the U.S. Census Bureau every year since
            2003 and consists of a sample of approximately 10,000 respondents per year.
          </p>
          <p className="mt-4">
            Respondents in ATUS provide information on the time, location, and
            type of activities pursued, as well as who they were with during
            each activity, when reporting their time use data. Furthermore,
            respondents report their socio-demographic information, such as
            gender, race, age, educational attainment, occupation, income,
            marital status, and the presence of children in the household.
          </p>
          <p className="mt-4">
            The full details regarding the application of the three wellbeing
            indicators used in the TOMNET wellbeing platform and the final data
            set creation procedures can be found in this GitHub {" "}
            <a
              className="ms-1"
              href="https://github.com/tomnetutc/wb_data_set_creation"
              target="_blank"
            >
            repository
            </a>
            . This includes step-by-step instructions on how to use the
            indicators and create the data set, as well as any necessary code or
            resources. By accessing this repository, you can gain a
            comprehensive understanding of the process for utilizing the
            indicators and creating the data set.{" "}
          </p>
          <p className="mt-4">
            For more information on ATUS, please visit this
            <a className="ps-1" href="https://www.bls.gov/tus/" target="_blank">
              link
            </a>
            . You can also download the full data set used in this analysis,
            along with its data dictionary, at the following links:
          </p>
          <ul>
            <li className="mt-4">
              <a href="df.csv" target="_blank" download>
                Full data set
              </a>
            </li>
            <li className="mt-4">
              <a href="data_dictionary.xlsx" target="_blank" download>
                Data dictionary
              </a>
            </li>
          </ul>
        </section>
        <section style={{ textAlign: "justify" }}>
          <h3 id="section6" className="mt-4 fw-bold contenthead">
            Team
          </h3>
          <p className="mt-4">
          <a href="https://search.asu.edu/profile/3243599" target="_blank" className="no-underline">Irfan Batur</a>,
          <a href="https://www.linkedin.com/in/srikanth-kini/" target="_blank" className="no-underline"> P. Srikanth Kini</a>,
          <a href="https://www.linkedin.com/in/ashwathbhat98/" target="_blank" className="no-underline"> Ashwath Bhat Laxminarayana</a>,
          <a href="https://www.linkedin.com/in/roshan--varghese/" target="_blank" className="no-underline"> Roshan Varghese</a>,
          <a href="https://search.asu.edu/profile/980477" target="_blank" className="no-underline"> Ram M. Pendyala</a>,
          <a href="https://www.caee.utexas.edu/prof/bhat/home.html" target="_blank" className="no-underline"> Chandra Bhat</a>
          </p>
          </section>
          
          <section style={{ textAlign: "justify" }}>
          <h3 id="section7" className="mt-4 fw-bold contenthead">
            Citations
          </h3>
          <p className="mt-4">
            <b>Note:</b> When using any material from this website, please cite
            the relevant papers listed below.
          </p>
          <ol>
            <li className="mt-4">
            Batur, Irfan & Khoeini, Sara & Sharda, Shivam & Magassy, Tassio & Ye, Xin & Pendyala, Ram. (2024). A Methodology for Evaluating Wellbeing Implications 
            of Activity-Travel Engagement and Time Use Patterns. 10.13140/RG.2.2.35575.64164. &nbsp;
              <a href="http://dx.doi.org/10.13140/RG.2.2.35575.64164" target="_blank" rel="noopener noreferrer">http://dx.doi.org/10.13140/RG.2.2.35575.64164</a>
            </li>
            <li className="mt-4">
              Batur, I., Dirks, A. C., Bhat, C. R., Polzin, S. E., Chen, C., & Pendyala, R. M. (2023).
              Analysis of Changes in Time Use and Activity Participation in Response to the COVID-19 Pandemic in the United States: Implications for well-being.
              Transportation Research Record, 03611981231165020.&nbsp;
              <a href="https://doi.org/10.1177/03611981231165020" target="_blank" rel="noopener noreferrer">https://doi.org/10.1177/03611981231165020</a>
            </li>
            <li className="mt-4">
              Batur, I. (2023). Understanding and Modeling the Nexus of Mobility, Time Poverty, and Wellbeing (Doctoral dissertation, Arizona State University).&nbsp;
              <a href="https://hdl.handle.net/2286/R.2.N.189319" target="_blank" rel="noopener noreferrer">https://hdl.handle.net/2286/R.2.N.189319</a>
            </li>
            <li className="mt-4">
              Batur, I., S. Sharda, T. Kim, S. Khoeini, R.M. Pendyala, and C.R.
              Bhat. Mobility, Time Poverty, and Well-Being: How Are They
              Connected and How Much Does Mobility Matter? Arizona State
              University, Working Paper, 2020.
            </li>
            <li className="mt-4">
              Khoeini, S., D. Capasso da Silva, S. Sharda, and R. M. Pendyala.
              An Integrated Model of Activity-Travel Behavior and Subjective
              Wellbeing. TOMNET Transportation Center, 2018.
            </li>
          </ol>
        </section>
      </Col>
    </Row>
  );
}
