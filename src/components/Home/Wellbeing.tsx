import { Container, Row, Col } from "react-bootstrap";
import Chart from "../Chart";
import ProfileModal from "../ProfileModal";
import { GroupMenu, YearMenu } from "../WellbeingMenus";
import Progress from "../Progress";
import ProfileCards from "../ProfileCards";
import { useEffect, useState } from "react";
import WellbeingTable from "../WellbeingTable";
import LoadingIcon from "../../images/loading-icon.svg";
import { csv, max } from "d3";
import {
  fetchData,
  defaultCounts,
  defaultYears,
  groupedOptions,
  filterOption,
  fetchDataForProfile,
} from "../../utils/Helpers";
import { CountObj, IAddProfile, IRemoveProfile, Option } from "../Types";

const customChartProps = {
  colors: [
    "#3073B9",
    "#F3B153",
    "#9A2A26",
    "#538644",
  ] /* These are colors used in graph from first line to last */,
  caption: "Annual wellbeing score (base year 2003=100)",
  xAxis: {
    dkey: "G-Year",
    title: "Year",
  },
  yAxis: {
    dkey: "G-Score",
    title: "Wellbeing score",
    reversed: false,
    dy: 60,
  },
  mainDkey: "G-Score",
};

export default function Wellbeing(): JSX.Element {
  const [profileList, setProfileList] = useState<any>([]);
  const [chartData, setChartData] = useState<any>([]);
  const [years, setYears] = useState<(string | undefined)[]>([]);
  const [counts, setCounts] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [wbavg, setWbavg] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<Option[] | []>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [baseValue, setBaseValue] = useState(0);
  const [maxYear, setMaxYear] = useState<string | undefined>("2021");

  useEffect(() => {
    csv(
      "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
    ).then((data) => {
      let maxYear = max(data, function (d) {
        return d.year;
      });
      setMaxYear(maxYear);
    });
    let intOfYear = Number(maxYear);
    let cache_key = "WBDATA-" + maxYear;
    let old_cache = "WBDATA-" + (intOfYear - 1).toString();
    async function fetchAPI() {
      const { countObj, graphData, yearData, wbavg, bValue } = await fetchData(
        profileList[profileList.length - 1]
      );
      setCounts([...counts, countObj]);
      setChartData([...chartData, graphData]);
      setYears(yearData);
      setBaseValue(bValue);
      setWbavg(wbavg);
      setLoading(false);
      return { countObj, graphData, yearData, wbavg, bValue };
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
          localStorage.setItem("count", JSON.stringify(ret.countObj.count));
          localStorage.setItem("graphData", JSON.stringify(ret.graphData));
          localStorage.setItem("yearData", JSON.stringify(ret.yearData));
          localStorage.setItem("wbavg", JSON.stringify(ret.wbavg));
          localStorage.setItem("bValue", JSON.stringify(ret.bValue));
        })
        .catch((err) => console.log(err));
    } else if (new Date().getTime() > Number(localStorage.getItem(cache_key))) {
      fetchAPI()
        .then((ret) => {
          localStorage.setItem(
            cache_key,
            (+new Date() + 60000 * 60 * 24).toString()
          );
          localStorage.setItem("count", JSON.stringify(ret.countObj.count));
          localStorage.setItem("graphData", JSON.stringify(ret.graphData));
          localStorage.setItem("yearData", JSON.stringify(ret.yearData));
          localStorage.setItem("wbavg", JSON.stringify(ret.wbavg));
          localStorage.setItem("bValue", JSON.stringify(ret.bValue));
        })
        .catch((err) => console.log(err));
    } else {
      let countObj: CountObj = { data: [], count: [] };
      let count = JSON.parse(localStorage.getItem("count") || "");
      countObj.count = count;
      let graphData = JSON.parse(localStorage.getItem("graphData") || "");
      let yearData = JSON.parse(localStorage.getItem("yearData") || "");
      let bValue = JSON.parse(localStorage.getItem("bValue") || "");
      let wbavg = JSON.parse(localStorage.getItem("wbavg") || "");
      setCounts([...counts, countObj]);
      setChartData([...chartData, graphData]);
      setYears(yearData);
      setBaseValue(bValue);
      setWbavg(wbavg);
      setLoading(false);
      csv(
        "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
      ).then((data) => {
        countObj.data = data;
      });
    }
  }, []);

  const addNewProfile: IAddProfile = async (newProfile) => {
    const { countObj, graphData } = await fetchDataForProfile(
      newProfile,
      baseValue
    );
    setCounts([...counts, countObj]);
    setChartData([...chartData, graphData]);
    setProfileList([...profileList, newProfile]);
  };

  const removeProfile: IRemoveProfile = (profileIndex: number) => {
    const newProfileList = profileList.filter(
      (key: string, idx: number) => idx != profileIndex
    );
    const newChartData = chartData.filter(
      (key: string, idx: number) => idx != profileIndex + 1
    );
    const newCounts = counts.filter(
      (key: CountObj, idx: number) => idx != profileIndex + 1
    );
    setProfileList(newProfileList);
    setChartData(newChartData);
    setCounts(newCounts);
  };
  return (
    <>
      <Container>
        <Row className="mt-3">
          <Col lg={8}>
            <hr className="hr-spec" />
            <h4 className="fw-bold">Wellbeing over the years</h4>
            <p>
              The graph below shows the evolution of wellbeing over time since
              2003. The wellbeing average for the entire sample is displayed by
              default. You can create your own population subgroups by adding
              profiles and compare them to the overall average and/or other
              subgroups.{" "}
              <i className="ms-1">
                Note that the wellbeing scores over the years were computed
                relative to the 2003 level, for which average wellbeing is
                assumed to be 100.
              </i>
            </p>
            <Row style={{ height: "140px", marginTop: "5px" }}>
              <ProfileModal
                profileList={profileList}
                addNewProfile={addNewProfile}
                groupedOptions={groupedOptions}
                filter={filterOption}
              />
              <Col md="auto">
                <div className="all-button">All</div>
              </Col>
              {profileList.length > 0 ? (
                <ProfileCards
                  profileList={profileList}
                  removeProfile={removeProfile}
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
            <h4 className="fw-bold">Wellbeing within years</h4>
            <p>
              Select a population group from the list below to view their
              average wellbeing in a given year, compared to 2003 level.
            </p>
            <GroupMenu setSelectedGroup={setSelectedGroup} />
            <YearMenu yearOptions={years} setSelectedYear={setSelectedYear} />
            <Progress
              value={wbavg}
              max={120}
              selectedGroup={selectedGroup}
              selectedYear={selectedYear}
              setWbavg={setWbavg}
              baseValue={baseValue}
              characteristic="wellbeing"
              colorClass="wb_progress"
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
