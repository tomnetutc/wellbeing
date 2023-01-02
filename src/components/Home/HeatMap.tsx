import { useEffect, useRef, useState } from "react";
import { Row, Col, Container } from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import Plot from "react-plotly.js";
import { csv, mean, rollup, rollups, max } from "d3";
import { mappingType } from "../Types";
import "../../App.css";

const mapping: mappingType = {
  1: ["AL", "Alabama"],
  2: ["AK", "Alaska"],
  4: ["AZ", "Arizona"],
  5: ["AR", "Arkansas"],
  6: ["CA", "California"],
  8: ["CO", "Colorado"],
  9: ["CT", "Connecticut"],
  10: ["DE", "Delaware"],
  11: ["DC", "District of Columbia"],
  12: ["FL", "Florida"],
  13: ["GA", "Georgia"],
  15: ["HI", "Hawaii"],
  16: ["ID", "Idaho"],
  17: ["IL", "Illinois"],
  18: ["IN", "Indiana"],
  19: ["IA", "Iowa"],
  20: ["KS", "Kansas"],
  21: ["KY", "Kentucky"],
  22: ["LA", "Louisiana"],
  23: ["ME", "Maine"],
  24: ["MD", "Maryland"],
  25: ["MA", "Massachusetts"],
  26: ["MI", "Michigan"],
  27: ["MN", "Minnesota"],
  28: ["MS", "Mississippi"],
  29: ["MO", "Missouri"],
  30: ["MT", "Montana"],
  31: ["NE", "Nebraska"],
  32: ["NV", "Nevada"],
  33: ["NH", "New Hampshire"],
  34: ["NJ", "New Jersey"],
  35: ["NM", "New Mexico"],
  36: ["NY", "New York"],
  37: ["NC", "North Carolina"],
  38: ["ND", "North Dakota"],
  39: ["OH", "Ohio"],
  40: ["OK", "Oklahoma"],
  41: ["OR", "Oregon"],
  42: ["PA", "Pennsylvania"],
  44: ["RI", "Rhode Island"],
  45: ["SC", "South Carolina"],
  46: ["SD", "South Dakota"],
  47: ["TN", "Tennessee"],
  48: ["TX", "Texas"],
  49: ["UT", "Utah"],
  50: ["VT", "Vermont"],
  51: ["VA", "Virginia"],
  53: ["WA", "Washington"],
  54: ["WV", "West Virginia"],
  55: ["WI", "Wisconsin"],
  56: ["WY", "Wyoming"],
};

const colorValues = [
  "#e9ece5",
  "#CEE2CD",
  "#B3D9B5",
  "#97CF9D",
  "#7CC685",
  "#61bc6d",
];

function makeDiscreteColorScale(
  vals: number[],
  colors: string[]
): (string | number)[][] {
  const colorscale = [];
  const zmin = vals[0];
  const zmax = vals[vals.length - 1];
  const d = zmax - zmin;
  const valsNormed = vals.map((val) => {
    return (val - zmin) / d;
  });

  valsNormed.slice(0, -1).map((val, ind) => {
    colorscale.push([val, colors[ind]]);
    colorscale.push([val, colors[ind + 1]]);
  });
  colorscale.push([
    valsNormed[valsNormed.length - 1],
    colors[colors.length - 1],
  ]);
  return colorscale;
}

export default function HeatMap(): JSX.Element | null {
  const [data, setData] = useState<any>([]);
  const [layout, setLayout] = useState({});
  const [config, setConfig] = useState({});
  const [top, setTop] = useState<(string | undefined)[]>([]);
  const [bottom, setBottom] = useState<(string | undefined)[]>([]);
  const [loading, setLoading] = useState(true);
  const [sliderValue, setSliderValue] = useState("2003");
  const [sliderFinalValue, setSliderFinalValue] = useState("2003");
  const [quintileVals, setQuintileVals] = useState<number[]>([]);
  const [finalValues, setFinalValues] = useState<
    [string | undefined, number | undefined][]
  >([]);
  const [maxYear, setMaxYear] = useState<number>();
  const [cacheMaxYear, setCacheMaxYear] = useState<string | undefined>("2021");
  const notInitialRender = useRef(false);

  useEffect(() => {
    csv(
      "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
    ).then((data) => {
      const maxYear = max(data, function (d) {
        return d.year;
      });
      setCacheMaxYear(maxYear);
    });
    let intOfYear = Number(cacheMaxYear);
    let cache_key = "WBHMAP-" + cacheMaxYear;
    let old_cache = "WBHMAP-" + (intOfYear - 1).toString();
    if (localStorage.getItem(cache_key) == null) {
      if (localStorage.getItem(old_cache) != null) {
        localStorage.removeItem(old_cache);
      }
      csv(
        "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
      ).then((rows) => {
        let groupedUwb = rollup(
          rows,
          (group) => mean(group, (d) => Number(d["norm_wb"])),
          (d) => d.year
        ); // This is the average well being for each year
        const [baseYear, baseValue] = groupedUwb.entries().next().value; // Gets the value for base year 2003
        let mYear = max(rows, function (d) {
          return d.year;
        });

        const yearly = rows.filter((val) => val.year === sliderFinalValue); // Subsets the data for the selected year (say 2003)

        let stateValue = rollups(
          yearly,
          (group) => mean(group, (d) => Number(d["norm_wb"])),
          (d) => d.state
        ); // Gets the average wellbeing for the subsetted year per state.
        let stateCounts = rollups(
          yearly,
          (d) => d.length,
          (d) => d.state
        ); // Gets the count of data points of wellbeing for the subsetted year per state.

        const textNames: string[] = [];
        const finalStateValues: number[] = [];
        const colorQuintileValues: number[] = [];

        stateValue.forEach((ele, ind) => {
          ele[1] = Number(((ele[1]! * 100) / baseValue).toFixed(1));
        });

        stateValue.sort((a, b) => b[1]! - a[1]!);

        let deepCopy = structuredClone(stateValue);

        let vetoStates: any = structuredClone(stateCounts);
        vetoStates = vetoStates.filter((ele: any) => ele[1] <= 100);
        vetoStates.forEach((ele: any) => {
          ele[0] = mapping[Number(ele[0])][1];
        });
        vetoStates = Object.keys(Object.fromEntries(vetoStates));

        const sampleCounts = Object.fromEntries(stateCounts);

        stateValue.forEach((ele, ind) => {
          textNames.push(`N = ${sampleCounts[Number(ele[0])]}`);
          finalStateValues.push(ele[1]!);
          ele[0] = mapping[Number(ele[0])][0];
        });

        let quintileLevel = 1;
        for (let step = 0; step < 5; step++) {
          colorQuintileValues.push(
            finalStateValues[
              Math.floor(finalStateValues.length * quintileLevel) - 1
            ]
          );
          quintileLevel -= 0.2;
        }
        colorQuintileValues.push(finalStateValues[0]);
        const calcColorScale = makeDiscreteColorScale(
          colorQuintileValues,
          colorValues
        );

        deepCopy.forEach((ele, ind) => {
          ele[0] = mapping[Number(ele[0])][1];
        });
        let stateOrder = structuredClone(deepCopy);
        stateOrder = stateOrder.filter((ele) => !vetoStates.includes(ele[0]));
        const topFiveStates = stateOrder.slice(0, 5).map((elm) => elm[0]);
        const bottomFiveStates = stateOrder
          .slice(stateOrder.length - 5, stateOrder.length)
          .map((elm) => elm[0]);

        const data = [
          {
            type: "choropleth",
            locationmode: "USA-states",
            locations: Object.keys(Object.fromEntries(stateValue)),
            z: Object.values(Object.fromEntries(stateValue)),
            text: textNames,
            autocolorscale: false,
            colorscale: calcColorScale,
            showscale: false,
            marker: {
              line: {
                color: "rgb(250,250,250)",
                width: 2,
              },
            },
          },
        ];
        const layout = {
          geo: {
            scope: "usa",
            bgcolor: "rgba(0,0,0,0)",
          },
          dragmode: false,
          width: 850,
          height: 650,
          paper_bgcolor: "rgba(0, 0, 0, 0)",
          margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
          },
        };
        const config = {
          displaylogo: false,
          displayModeBar: false,
        };
        setMaxYear(Number(mYear));
        setFinalValues(stateOrder);
        setQuintileVals(colorQuintileValues);
        setData(data);
        setLayout(layout);
        setConfig(config);
        setTop(topFiveStates);
        setBottom(bottomFiveStates);
        setLoading(false);
        localStorage.setItem(
          cache_key,
          (+new Date() + 60000 * 60 * 24).toString()
        );
        localStorage.setItem("wbFinalValues", JSON.stringify(stateOrder));
        localStorage.setItem(
          "wbQuintileVals",
          JSON.stringify(colorQuintileValues)
        );
        localStorage.setItem("wbmYear", JSON.stringify(mYear));
        localStorage.setItem("wbhmdata", JSON.stringify(data));
        localStorage.setItem("wblayout", JSON.stringify(layout));
        localStorage.setItem("wbconfig", JSON.stringify(config));
        localStorage.setItem("wbTopFive", JSON.stringify(topFiveStates));
        localStorage.setItem("wbBotFive", JSON.stringify(bottomFiveStates));
      });
    } else if (new Date().getTime() > Number(localStorage.getItem(cache_key))) {
      csv(
        "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
      ).then((rows) => {
        let groupedUwb = rollup(
          rows,
          (group) => mean(group, (d) => Number(d["norm_wb"])),
          (d) => d.year
        ); // This is the average well being for each year
        const [baseYear, baseValue] = groupedUwb.entries().next().value; // Gets the value for base year 2003
        let mYear = max(rows, function (d) {
          return d.year;
        });

        const yearly = rows.filter((val) => val.year === sliderFinalValue); // Subsets the data for the selected year (say 2003)

        let stateValue = rollups(
          yearly,
          (group) => mean(group, (d) => Number(d["norm_wb"])),
          (d) => d.state
        ); // Gets the average wellbeing for the subsetted year per state.
        let stateCounts = rollups(
          yearly,
          (d) => d.length,
          (d) => d.state
        ); // Gets the count of data points of wellbeing for the subsetted year per state.

        const textNames: string[] = [];
        const finalStateValues: number[] = [];
        const colorQuintileValues: number[] = [];

        stateValue.forEach((ele, ind) => {
          ele[1] = Number(((ele[1]! * 100) / baseValue).toFixed(1));
        });

        stateValue.sort((a, b) => b[1]! - a[1]!);

        let deepCopy = structuredClone(stateValue);

        let vetoStates: any = structuredClone(stateCounts);
        vetoStates = vetoStates.filter((ele: any) => ele[1] <= 100);
        vetoStates.forEach((ele: any) => {
          ele[0] = mapping[Number(ele[0])][1];
        });
        vetoStates = Object.keys(Object.fromEntries(vetoStates));

        const sampleCounts = Object.fromEntries(stateCounts);

        stateValue.forEach((ele, ind) => {
          textNames.push(`N = ${sampleCounts[Number(ele[0])]}`);
          finalStateValues.push(ele[1]!);
          ele[0] = mapping[Number(ele[0])][0];
        });

        let quintileLevel = 1;
        for (let step = 0; step < 5; step++) {
          colorQuintileValues.push(
            finalStateValues[
              Math.floor(finalStateValues.length * quintileLevel) - 1
            ]
          );
          quintileLevel -= 0.2;
        }
        colorQuintileValues.push(finalStateValues[0]);
        const calcColorScale = makeDiscreteColorScale(
          colorQuintileValues,
          colorValues
        );

        deepCopy.forEach((ele, ind) => {
          ele[0] = mapping[Number(ele[0])][1];
        });
        let stateOrder = structuredClone(deepCopy);
        stateOrder = stateOrder.filter((ele) => !vetoStates.includes(ele[0]));
        const topFiveStates = stateOrder.slice(0, 5).map((elm) => elm[0]);
        const bottomFiveStates = stateOrder
          .slice(stateOrder.length - 5, stateOrder.length)
          .map((elm) => elm[0]);

        const data = [
          {
            type: "choropleth",
            locationmode: "USA-states",
            locations: Object.keys(Object.fromEntries(stateValue)),
            z: Object.values(Object.fromEntries(stateValue)),
            text: textNames,
            autocolorscale: false,
            colorscale: calcColorScale,
            showscale: false,
            marker: {
              line: {
                color: "rgb(250,250,250)",
                width: 2,
              },
            },
          },
        ];
        const layout = {
          geo: {
            scope: "usa",
            bgcolor: "rgba(0,0,0,0)",
          },
          dragmode: false,
          width: 850,
          height: 650,
          paper_bgcolor: "rgba(0, 0, 0, 0)",
          margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0,
          },
        };
        const config = {
          displaylogo: false,
          displayModeBar: false,
        };
        setMaxYear(Number(mYear));
        setFinalValues(stateOrder);
        setQuintileVals(colorQuintileValues);
        setData(data);
        setLayout(layout);
        setConfig(config);
        setTop(topFiveStates);
        setBottom(bottomFiveStates);
        setLoading(false);
        localStorage.setItem(
          cache_key,
          (+new Date() + 60000 * 60 * 24).toString()
        );
        localStorage.setItem("wbFinalValues", JSON.stringify(stateOrder));
        localStorage.setItem(
          "wbQuintileVals",
          JSON.stringify(colorQuintileValues)
        );
        localStorage.setItem("wbmYear", JSON.stringify(mYear));
        localStorage.setItem("wbhmdata", JSON.stringify(data));
        localStorage.setItem("wblayout", JSON.stringify(layout));
        localStorage.setItem("wbconfig", JSON.stringify(config));
        localStorage.setItem("wbTopFive", JSON.stringify(topFiveStates));
        localStorage.setItem("wbBotFive", JSON.stringify(bottomFiveStates));
      });
    } else {
      let fvals = JSON.parse(localStorage.getItem("wbFinalValues") || "");
      let qvals = JSON.parse(localStorage.getItem("wbQuintileVals") || "");
      let hmdata = JSON.parse(localStorage.getItem("wbhmdata") || "");
      let hmxyear = JSON.parse(localStorage.getItem("wbmYear") || "");
      let hmlayout = JSON.parse(localStorage.getItem("wblayout") || "");
      let hmconfig = JSON.parse(localStorage.getItem("wbconfig") || "");
      let tfive = JSON.parse(localStorage.getItem("wbTopFive") || "");
      let bfive = JSON.parse(localStorage.getItem("wbBotFive") || "");
      setFinalValues(fvals);
      setQuintileVals(qvals);
      setData(hmdata);
      setMaxYear(Number(hmxyear));
      setLayout(hmlayout);
      setConfig(hmconfig);
      setTop(tfive);
      setBottom(bfive);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (notInitialRender.current) {
      csv(
        "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
      ).then((rows) => {
        let groupedUwb = rollup(
          rows,
          (group) => mean(group, (d) => Number(d["norm_wb"])),
          (d) => d.year
        ); // This is the average well being for each year
        const [baseYear, baseValue] = groupedUwb.entries().next().value; // Gets the value for base year 2003
        // let maxYear = max(rows, function (d) {
        //   return d.year;
        // });
        // setMaxYear(Number(maxYear));

        const yearly = rows.filter((val) => val.year === sliderFinalValue); // Subsets the data for the selected year (say 2003)

        let stateValue = rollups(
          yearly,
          (group) => mean(group, (d) => Number(d["norm_wb"])),
          (d) => d.state
        ); // Gets the average wellbeing for the subsetted year per state.
        let stateCounts = rollups(
          yearly,
          (d) => d.length,
          (d) => d.state
        ); // Gets the count of data points of wellbeing for the subsetted year per state.

        const textNames: string[] = [];
        const finalStateValues: number[] = [];
        const colorQuintileValues: number[] = [];

        stateValue.forEach((ele, ind) => {
          ele[1] = Number(((ele[1]! * 100) / baseValue).toFixed(1));
        });

        stateValue.sort((a, b) => b[1]! - a[1]!);

        let deepCopy = structuredClone(stateValue);

        let vetoStates: any = structuredClone(stateCounts);
        vetoStates = vetoStates.filter((ele: any) => ele[1] <= 100);
        vetoStates.forEach((ele: any) => {
          ele[0] = mapping[Number(ele[0])][1];
        });
        vetoStates = Object.keys(Object.fromEntries(vetoStates));

        const sampleCounts = Object.fromEntries(stateCounts);

        stateValue.forEach((ele, ind) => {
          textNames.push(`N = ${sampleCounts[Number(ele[0])]}`);
          finalStateValues.push(ele[1]!);
          ele[0] = mapping[Number(ele[0])][0];
        });

        let quintileLevel = 1;
        for (let step = 0; step < 5; step++) {
          colorQuintileValues.push(
            finalStateValues[
              Math.floor(finalStateValues.length * quintileLevel) - 1
            ]
          );
          quintileLevel -= 0.2;
        }
        colorQuintileValues.push(finalStateValues[0]);
        const calcColorScale = makeDiscreteColorScale(
          colorQuintileValues,
          colorValues
        );

        deepCopy.forEach((ele, ind) => {
          ele[0] = mapping[Number(ele[0])][1];
        });
        let stateOrder = structuredClone(deepCopy);
        stateOrder = stateOrder.filter((ele) => !vetoStates.includes(ele[0]));
        const topFiveStates = stateOrder.slice(0, 5).map((elm) => elm[0]);
        const bottomFiveStates = stateOrder
          .slice(stateOrder.length - 5, stateOrder.length)
          .map((elm) => elm[0]);

        const data = [
          {
            type: "choropleth",
            locationmode: "USA-states",
            locations: Object.keys(Object.fromEntries(stateValue)),
            z: Object.values(Object.fromEntries(stateValue)),
            text: textNames,
            autocolorscale: false,
            colorscale: calcColorScale,
            showscale: false,
            marker: {
              line: {
                color: "rgb(250,250,250)",
                width: 2,
              },
            },
          },
        ];
        // const layout = {
        //   geo: {
        //     scope: "usa",
        //     bgcolor: "rgba(0,0,0,0)",
        //   },
        //   dragmode: false,
        //   width: 850,
        //   height: 650,
        //   paper_bgcolor: "rgba(0, 0, 0, 0)",
        //   margin: {
        //     l: 0,
        //     r: 0,
        //     b: 0,
        //     t: 0,
        //   },
        // };
        // const config = {
        //   displaylogo: false,
        //   displayModeBar: false,
        // };
        setFinalValues(stateOrder);
        setQuintileVals(colorQuintileValues);
        setData(data);
        // setLayout(layout);
        // setConfig(config);
        setTop(topFiveStates);
        setBottom(bottomFiveStates);
        // setLoading(false);
      });
    } else {
      notInitialRender.current = true;
    }
  }, [sliderFinalValue]);

  const handleSliderChange = (v: string) => {
    setSliderFinalValue(v);
  };

  if (loading) {
    return null;
  }
  return (
    <Container>
      <hr className="hr-spec"></hr>
      <Row>
        <Col lg={8}>
          <div>
            <h4 className="fw-bold">Wellbeing by states</h4>
            <p>
              The map below shows how wellbeing changes across the states since
              2003. Use the slider to move between years.{" "}
              <i className="ms-1">
                Note that the wellbeing scores were computed relative to the
                base year, 2003.
              </i>
            </p>
          </div>
          <RangeSlider
            variant="danger"
            value={sliderValue}
            onChange={(e) => setSliderValue(e.target.value)}
            onAfterChange={(e) => handleSliderChange(e.target.value)}
            tooltip="on"
            min={2003}
            max={maxYear}
          />
          <div style={{ transform: "translate(0px,50px)" }}>
            <Row className="text-center">
              <Col lg={3}></Col>
              <Col className="border">Annual wellbeing score</Col>
              <Col lg={3}></Col>
            </Row>
            <Row className="text-center">
              <Col lg={3}></Col>
              <Col style={{ backgroundColor: colorValues[1], height: "26px" }}>
                <div
                  style={{
                    position: "relative",
                    left: "75px",
                    top: "14px",
                    borderLeft: "2px solid black",
                    height: "15px",
                  }}
                ></div>
              </Col>
              <Col style={{ backgroundColor: colorValues[2], height: "26px" }}>
                <div
                  style={{
                    position: "relative",
                    left: "75px",
                    top: "14px",
                    borderLeft: "2px solid black",
                    height: "15px",
                  }}
                ></div>
              </Col>
              <Col style={{ backgroundColor: colorValues[3], height: "26px" }}>
                <div
                  style={{
                    position: "relative",
                    left: "75px",
                    top: "14px",
                    borderLeft: "2px solid black",
                    height: "15px",
                  }}
                ></div>
              </Col>
              <Col style={{ backgroundColor: colorValues[4], height: "26px" }}>
                <div
                  style={{
                    position: "relative",
                    left: "75px",
                    top: "14px",
                    borderLeft: "2px solid black",
                    height: "15px",
                  }}
                ></div>
              </Col>
              <Col style={{ backgroundColor: colorValues[5], height: "26px" }}>
                <div
                  style={{
                    position: "relative",
                    left: "75px",
                    top: "14px",
                    borderLeft: "2px solid black",
                    height: "15px",
                  }}
                ></div>
              </Col>
              <Col lg={3}></Col>
            </Row>
            <Row className="text-center">
              <Col lg={3}></Col>
              <Col style={{ position: "relative", left: "40px" }}>
                {quintileVals[1].toFixed(0)}
              </Col>
              <Col style={{ position: "relative", left: "40px" }}>
                {quintileVals[2].toFixed(0)}
              </Col>
              <Col style={{ position: "relative", left: "40px" }}>
                {quintileVals[3].toFixed(0)}
              </Col>
              <Col style={{ position: "relative", left: "40px" }}>
                {quintileVals[4].toFixed(0)}
              </Col>
              <Col style={{ position: "relative", left: "40px" }}>
                {quintileVals[5].toFixed(0)}
              </Col>
              <Col lg={3}></Col>
            </Row>
          </div>
          <Plot data={data} layout={layout} config={config} useResizeHandler />
        </Col>
        <Col lg={4}>
          <h4 className="fw-bold">State rankings</h4>
          <p>
            See below the states with highest and lowest wellbeing scores for
            the year selected.{" "}
            <i>
              Note that the states with less than 100 observations are excluded
              from the rankings.
            </i>
          </p>
          <Row style={{ paddingLeft: "12px" }}>
            <Col
              className="border mt-5"
              style={{
                backgroundColor: "#6987A3",
                color: "white",
                fontSize: "20px",
              }}
            >
              Best Five
            </Col>
            <Col lg={3}></Col>
          </Row>
          {top.map((state, idx) => {
            return (
              <Row key={idx} style={{ height: "30px", paddingLeft: "12px" }}>
                <Col className="border" style={{ backgroundColor: "#FBFCF2" }}>
                  <span>{state}</span>
                </Col>
                <Col
                  lg={3}
                  className="border text-center"
                  style={{ backgroundColor: "#FBFCF2" }}
                >
                  <span>{finalValues[idx][1]}</span>
                </Col>
                <Col lg={3}></Col>
              </Row>
            );
          })}
          <Row className="mt-5"></Row>
          <Row style={{ paddingLeft: "12px" }}>
            <Col
              className="border"
              style={{
                backgroundColor: "#9F9E9C",
                color: "white",
                fontSize: "20px",
              }}
            >
              Worst Five
            </Col>
            <Col lg={3}></Col>
          </Row>
          {bottom.map((state, idx) => {
            return (
              <Row key={idx} style={{ height: "30px", paddingLeft: "12px" }}>
                <Col className="border" style={{ backgroundColor: "#FBFCF2" }}>
                  <span>{state}</span>
                </Col>
                <Col
                  lg={3}
                  className="border text-center"
                  style={{ backgroundColor: "#FBFCF2" }}
                >
                  <span>{finalValues[finalValues.length - 5 + idx][1]}</span>
                </Col>
                <Col lg={3}></Col>
              </Row>
            );
          })}
        </Col>
      </Row>
    </Container>
  );
}
