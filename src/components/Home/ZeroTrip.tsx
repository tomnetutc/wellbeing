// @ts-nocheck
import { Container, Row, Col } from "react-bootstrap";
import { CustomAccordion } from "../Accordion";
import { useState, useEffect } from "react";
import ProfileModal from "../ProfileModal";
import Chart from "../Chart";
import { csv, max } from "d3";
import {
  ZTFetchData,
  defaultCounts,
  defaultYears,
  ZTGroupedOptions,
  ZTfilterOption,
} from "../../utils/Helpers";
import ProfileCards from "../ProfileCards";
import WellbeingTable from "../WellbeingTable";
import { GroupMenu, YearMenu } from "../WellbeingMenus";
import Progress from "../Progress";
import LoadingIcon from "../../images/loading-icon.svg";

const customChartProps = {
  colors: [
    "#3073B9",
    "#F3B153",
    "#9A2A26",
    "#538644",
  ] /* These are colors used in graph from first line to last */,
  caption: "Percent of zero trip-making individuals (%)",
  xAxis: {
    dkey: "G-Year",
    title: "Year",
  },
  yAxis: {
    dkey: "G-Score",
    title: "%",
    reversed: false,
    dy: 10,
  },
  mainDkey: "G-Score",
};

const customAccordionProps = {
  img: "",
  headText1: "",
  headText2: "Mobility Analysis",
  cardTextFirst: `The mobility provided by transportation systems contributes to a high quality of life
   by enabling people to participate in society, perform their activities, and accumulate life experiences. 
   Mobility in society, thus, needs to be regularly monitored due to its significant implications on wellbeing.`,
  cardTextSecond: `The percentage of people who make no trips at all in a day, 
  known as "zero trip-makers", is a key mobility indicator. 
  Due to their limited mobility, these individuals may be at risk of social exclusion, 
  which could result in isolation, depression, and other mental health issues.`,
  cardTextThird: `This module identifies zero trip-making individuals in all editions of 
  American Time Use Survey since 2003 and present their percentages as an indication of lower wellbeing. 
  Use the charts below to track and compare how zero trip-making rates 
  evolved over time and space in and across society.`,
};

export function ZeroTrip() {
  const [ZTProfileList, setZTProfileList] = useState([]);
  const [chartData, setChartData] = useState<any>([]);
  const [years, setYears] = useState<(string | undefined)[]>([]);
  const [counts, setCounts] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Option[] | []>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [wbavg, setWbavg] = useState(0);
  const [maxYear, setMaxYear] = useState<string | undefined>("2021");

  useEffect(() => {
    const data = csv(
      "https://raw.githubusercontent.com/tomnetutc/wbeat/main/src/data/df.csv"
    ).then((data) => {
      let maxYear = max(data, function (d) {
        return d.year;
      });
      setMaxYear(maxYear);
    });
    let intOfYear = Number(maxYear);
    let cache_key = "ZTDATA-" + maxYear;
    let old_cache = "ZTDATA-" + (intOfYear - 1).toString();
    async function fetchAPI() {
      const { countObj, graphData, yearData, wbavg, bValue } =
        await ZTFetchData(ZTProfileList[ZTProfileList.length - 1]);
      setCounts([...counts, countObj]);
      setChartData([...chartData, graphData]);
      setYears(yearData);
      setWbavg(wbavg);
      setLoading(false);
      return { countObj, graphData, yearData, wbavg };
    }
    if (localStorage.getItem(cache_key) == null) {
      if (localStorage.getItem(old_cache) != null) {
        localStorage.removeItem(old_cache);
      }
      fetchAPI()
        .then((ret) => {
          localStorage.setItem(
            cache_key,
            (+new Date() + 60000 * 60 * 24).toString()
          );
          localStorage.setItem("ztcount", JSON.stringify(ret.countObj.count));
          localStorage.setItem("ztgraphData", JSON.stringify(ret.graphData));
          localStorage.setItem("ztyearData", JSON.stringify(ret.yearData));
          localStorage.setItem("ztwbavg", JSON.stringify(ret.wbavg));
        })
        .catch((err) => console.log(err));
    } else if (new Date().getTime() > Number(localStorage.getItem(cache_key))) {
      fetchAPI()
        .then((ret) => {
          localStorage.setItem(
            cache_key,
            (+new Date() + 60000 * 60 * 24).toString()
          );
          localStorage.setItem("ztcount", JSON.stringify(ret.countObj.count));
          localStorage.setItem("ztgraphData", JSON.stringify(ret.graphData));
          localStorage.setItem("ztyearData", JSON.stringify(ret.yearData));
          localStorage.setItem("ztwbavg", JSON.stringify(ret.wbavg));
        })
        .catch((err) => console.log(err));
    } else {
      let countObj: CountObj = { data: [], count: [] };
      let count = JSON.parse(localStorage.getItem("ztcount") || "");
      countObj.count = count;
      let graphData = JSON.parse(localStorage.getItem("ztgraphData") || "");
      let yearData = JSON.parse(localStorage.getItem("ztyearData") || "");
      let wbavg = JSON.parse(localStorage.getItem("ztwbavg") || "");
      setCounts([...counts, countObj]);
      setChartData([...chartData, graphData]);
      setYears(yearData);
      setWbavg(wbavg);
      setLoading(false);
      csv(
        "https://raw.githubusercontent.com/tomnetutc/wbeat/main/src/data/df.csv"
      ).then((data) => {
        countObj.data = data;
      });
    }
  }, []);

  const addNewZTProfile = async (newProfile) => {
    const { countObj, graphData } = await ZTFetchData(newProfile);
    setCounts([...counts, countObj]);
    setChartData([...chartData, graphData]);
    setZTProfileList([...ZTProfileList, newProfile]);
  };

  const removeZTProfile: IRemoveProfile = (profileIndex: number) => {
    const newProfileList = ZTProfileList.filter(
      (key: string, idx: number) => idx != profileIndex
    );
    const newChartData = chartData.filter(
      (key: string, idx: number) => idx != profileIndex + 1
    );
    const newCounts = counts.filter(
      (key: CountObj, idx: number) => idx != profileIndex + 1
    );
    setZTProfileList(newProfileList);
    setChartData(newChartData);
    setCounts(newCounts);
  };

  return (
    <>
      <Container className="text-center">
        <CustomAccordion customAccordionProps={customAccordionProps} />
      </Container>
      <Container>
        <Row className="mt-3">
          <Col lg={8}>
            <hr className="hr-spec" />
            <h4 className="fw-bold">Zero trip-making over the years</h4>
            <p>
              The graph below shows how the percentage of zero trip-making
              individuals (people who make no trips during a day) changed over
              time. The zero trip-making average for the entire sample is
              displayed by default. You can create your own population subgroups
              by adding profiles and compare them to the overall average and/or
              other subgroups.
              <i className="ms-1">
                Note that higher zero trip-making percents are indicative of
                lower wellbeing.
              </i>
            </p>
            <Row style={{ height: "140px", marginTop: "5px" }}>
              <ProfileModal
                profileList={ZTProfileList}
                addNewProfile={addNewZTProfile}
                groupedOptions={ZTGroupedOptions}
                filter={ZTfilterOption}
              />
              <Col md="auto">
                <div className="all-button">All</div>
              </Col>
              {ZTProfileList.length > 0 ? (
                <ProfileCards
                  profileList={ZTProfileList}
                  removeProfile={removeZTProfile}
                />
              ) : null}
            </Row>
            {loading ? (
              <div className="mt-5 text-center">
                <img src={LoadingIcon} alt="Loading Icon" />
              </div>
            ) : (
              <Chart data={chartData} customChartProps={customChartProps} />
            )}
          </Col>
          <Col style={{ position: "relative" }} lg={4}>
            <hr className="hr-spec" />
            <h4 className="fw-bold">Zero trip-making within years</h4>
            <p>
              Select a population group from the list below to view their
              average zero trip-making rates in a given year.
            </p>
            <GroupMenu setSelectedGroup={setSelectedGroup} />
            <YearMenu yearOptions={years} setSelectedYear={setSelectedYear} />
            <Progress
              value={wbavg}
              max={100}
              selectedGroup={selectedGroup}
              selectedYear={selectedYear}
              setWbavg={setWbavg}
              characteristic="zero_trip"
              colorClass="ztm_progress"
            />
          </Col>
        </Row>
      </Container>
      {loading ? (
        <WellbeingTable years={defaultYears} counts={defaultCounts} />
      ) : (
        <WellbeingTable years={years} counts={counts} />
      )}
    </>
  );
}
