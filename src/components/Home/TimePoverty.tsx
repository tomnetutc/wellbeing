// @ts-nocheck
import { Container, Row, Col } from "react-bootstrap";
import { CustomAccordion } from "../Accordion";
import { useState, useEffect } from "react";
import ProfileModal from "../ProfileModal";
import Chart from "../Chart";
import { csv, max } from "d3";
import {
  TpFetchData,
  defaultCounts,
  defaultYears,
  TpGroupedOptions,
  TpfilterOption,
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
  caption: "Percent of Time Poor Individuals (%)",
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
  headText2: "Time Poverty Analysis",
  cardTextFirst: `Similar to the notion of income-based poverty, time poverty is defined 
  as having too little time to pursue discretionary activities. Time poverty can have serious 
  and far-reaching consequences, such as lowered wellbeing, physical health, and productivity. 
  The problem is particularly persistent among certain socio-demographics, including women, 
  parents with children, and workers.`,
  cardTextSecond: `Time poverty is thus used as a secondary indicator of wellbeing here. 
  To determine whether a person is time poor, a threshold value of available time for 
  discretionary activities is used. Despite the fact that there are several approaches to 
  define a time poverty threshold, this study uses the "60% of median" criteria. The total 
  necessary activity time and committed activity time are essentially subtracted from 1440 
  minutes (24 hours) to determine available discretionary time. The median available 
  discretionary time across the entire population was then multiplied by 0.6 to determine 
  the threshold; those who had less discretionary time available were time poor and vice versa. 
  More details about time poverty can be found on the about page.`,
  cardTextThird: `The “60% of median” definition of time poverty was applied to all editions of 
  American Time Use Survey since 2003. Use the charts below to track and compare how time poverty 
  evolved over time and space in and across society.`,
};

export function TimePoverty() {
  const [tpProfileList, setTpProfileList] = useState([]);
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
      "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
    ).then((data) => {
      let maxYear = max(data, function (d) {
        return d.year;
      });
      setMaxYear(maxYear);
    });
    let intOfYear = Number(maxYear);
    let cache_key = "TPDATA-" + maxYear;
    let old_cache = "TPDATA-" + (intOfYear - 1).toString();
    async function fetchAPI() {
      const { countObj, graphData, yearData, wbavg, bValue } =
        await TpFetchData(tpProfileList[tpProfileList.length - 1]);
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
          localStorage.setItem("tpcount", JSON.stringify(ret.countObj.count));
          localStorage.setItem("tpgraphData", JSON.stringify(ret.graphData));
          localStorage.setItem("tpyearData", JSON.stringify(ret.yearData));
          localStorage.setItem("tpwbavg", JSON.stringify(ret.wbavg));
        })
        .catch((err) => console.log(err));
    } else if (new Date().getTime() > Number(localStorage.getItem(cache_key))) {
      fetchAPI()
        .then((ret) => {
          localStorage.setItem(
            cache_key,
            (+new Date() + 60000 * 60 * 24).toString()
          );
          localStorage.setItem("tpcount", JSON.stringify(ret.countObj.count));
          localStorage.setItem("tpgraphData", JSON.stringify(ret.graphData));
          localStorage.setItem("tpyearData", JSON.stringify(ret.yearData));
          localStorage.setItem("tpwbavg", JSON.stringify(ret.wbavg));
        })
        .catch((err) => console.log(err));
    } else {
      let countObj: CountObj = { data: [], count: [] };
      let count = JSON.parse(localStorage.getItem("tpcount") || "");
      countObj.count = count;
      let graphData = JSON.parse(localStorage.getItem("tpgraphData") || "");
      let yearData = JSON.parse(localStorage.getItem("tpyearData") || "");
      let wbavg = JSON.parse(localStorage.getItem("tpwbavg") || "");
      setCounts([...counts, countObj]);
      setChartData([...chartData, graphData]);
      setYears(yearData);
      setWbavg(wbavg);
      setLoading(false);
      csv(
        "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
      ).then((data) => {
        countObj.data = data;
      });
    }
  }, []);

  const addNewTpProfile = async (newProfile) => {
    const { countObj, graphData } = await TpFetchData(newProfile);
    setCounts([...counts, countObj]);
    setChartData([...chartData, graphData]);
    setTpProfileList([...tpProfileList, newProfile]);
  };

  const removeTpProfile: IRemoveProfile = (profileIndex: number) => {
    const newProfileList = tpProfileList.filter(
      (key: string, idx: number) => idx != profileIndex
    );
    const newChartData = chartData.filter(
      (key: string, idx: number) => idx != profileIndex + 1
    );
    const newCounts = counts.filter(
      (key: CountObj, idx: number) => idx != profileIndex + 1
    );
    setTpProfileList(newProfileList);
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
            <h4 className="fw-bold">Time poverty over the years</h4>
            <p>
              The graph below shows the evolution of time poverty over time
              relative to the base year, 2003. The time poverty average for the
              entire sample is displayed by default. You can create your own
              population sub-groups by adding profiles and compare them to the
              overall average and/or other sub-groups.
              <i className="ms-1">
                Note that higher time poverty is an indication of lower
                wellbeing.
              </i>
            </p>
            <Row style={{ height: "140px", marginTop: "5px" }}>
              <ProfileModal
                profileList={tpProfileList}
                addNewProfile={addNewTpProfile}
                groupedOptions={TpGroupedOptions}
                filter={TpfilterOption}
              />
              <Col md="auto">
                <div className="all-button">All</div>
              </Col>
              {tpProfileList.length > 0 ? (
                <ProfileCards
                  profileList={tpProfileList}
                  removeProfile={removeTpProfile}
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
            <h4 className="fw-bold">Time poverty within years</h4>
            <p>
              Select a population group from the list below to view their
              average time poverty rates in a given year.
            </p>
            <GroupMenu setSelectedGroup={setSelectedGroup} />
            <YearMenu yearOptions={years} setSelectedYear={setSelectedYear} />
            <Progress
              value={wbavg}
              max={100}
              selectedGroup={selectedGroup}
              selectedYear={selectedYear}
              setWbavg={setWbavg}
              characteristic="tpoverty"
              colorClass="tp_progress"
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
