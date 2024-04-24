import { useEffect, useRef, useState } from "react";
import { Row, Col, Container } from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import Plot from "react-plotly.js";
import { csv, DSVRowString, rollup, max } from "d3";
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
  "#ECE6E4",
  "#DED3CF",
  "#D0BFBB",
  "#C3ACA6",
  "#B59892",
  "#A7857D",
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

export default function TpHeatMap(): JSX.Element | null {
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
    let cache_key = "TPHMAP-" + cacheMaxYear;
    let old_cache = "TPHMAP-" + (intOfYear - 1).toString();
    if (localStorage.getItem(cache_key) == null) {
      if (localStorage.getItem(old_cache) != null) {
        localStorage.removeItem(old_cache);
      }
      csv(
        "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
      ).then((rows) => {
        let groupedUwb = rollup(
          rows,
          (d) => d.length,
          (d) => d.year
        );
        // const [baseYear, baseValue] = groupedUwb.entries().next().value;
        let mYear = max(rows, function (d) {
          return d.year;
        });

        const yearly = rows.filter((val) => val.year === sliderFinalValue);
        let stateValue = Object.fromEntries(
          rollup(
            yearly,
            (d) => d.length,
            (d) => d.state
          )
        );
        const yearlyNew = yearly.filter((d: DSVRowString<string>) => {
          return d["time_poor"] == "1.0";
        });
        let stateNumerator = Object.fromEntries(
          rollup(
            yearlyNew,
            (d) => d.length,
            (d) => d.state
          )
        );
        const textNames: string[] = [];
        const finalStateValues: number[] = [];
        const colorQuintileValues: number[] = [];
        let evaluatedScore: [string, number][] = [];
        for (const property in stateValue) {
          evaluatedScore.push([
            property,
            Number(
              ((stateNumerator[property] * 100) / stateValue[property]).toFixed(
                1
              )
            ),
          ]);
        }
        evaluatedScore.sort((a, b) => b[1]! - a[1]!);
        let deepCopy = structuredClone(evaluatedScore);
        evaluatedScore.forEach((ele, ind) => {
          textNames.push(`N = ${stateValue[Number(ele[0])]}`);
          finalStateValues.push(ele[1]!);
          ele[0] = mapping[Number(ele[0])][0];
        });
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 1) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.8) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.6) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.4) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.2) - 1]
        );
        colorQuintileValues.push(finalStateValues[0]);
        const calcColorScale = makeDiscreteColorScale(
          colorQuintileValues,
          colorValues
        );

        let vetoStates: any = [];
        for (const property in stateValue) {
          if (stateValue[property] <= 100) {
            vetoStates.push(mapping[Number(property)][1]);
          }
        }
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
            locations: Object.keys(Object.fromEntries(evaluatedScore)),
            z: Object.values(Object.fromEntries(evaluatedScore)),
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
        localStorage.setItem("tpFinalValues", JSON.stringify(stateOrder));
        localStorage.setItem(
          "tpQuintileVals",
          JSON.stringify(colorQuintileValues)
        );
        localStorage.setItem("tpmYear", JSON.stringify(mYear));
        localStorage.setItem("tphmdata", JSON.stringify(data));
        localStorage.setItem("tplayout", JSON.stringify(layout));
        localStorage.setItem("tpconfig", JSON.stringify(config));
        localStorage.setItem("tpTopFive", JSON.stringify(topFiveStates));
        localStorage.setItem("tpBotFive", JSON.stringify(bottomFiveStates));
      });
    } else if (new Date().getTime() > Number(localStorage.getItem(cache_key))) {
      csv(
        "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
      ).then((rows) => {
        let groupedUwb = rollup(
          rows,
          (d) => d.length,
          (d) => d.year
        );
        // const [baseYear, baseValue] = groupedUwb.entries().next().value;
        let mYear = max(rows, function (d) {
          return d.year;
        });

        const yearly = rows.filter((val) => val.year === sliderFinalValue);
        let stateValue = Object.fromEntries(
          rollup(
            yearly,
            (d) => d.length,
            (d) => d.state
          )
        );
        const yearlyNew = yearly.filter((d: DSVRowString<string>) => {
          return d["time_poor"] == "1.0";
        });
        let stateNumerator = Object.fromEntries(
          rollup(
            yearlyNew,
            (d) => d.length,
            (d) => d.state
          )
        );
        const textNames: string[] = [];
        const finalStateValues: number[] = [];
        const colorQuintileValues: number[] = [];
        let evaluatedScore: [string, number][] = [];
        for (const property in stateValue) {
          evaluatedScore.push([
            property,
            Number(
              ((stateNumerator[property] * 100) / stateValue[property]).toFixed(
                1
              )
            ),
          ]);
        }
        evaluatedScore.sort((a, b) => b[1]! - a[1]!);
        let deepCopy = structuredClone(evaluatedScore);
        evaluatedScore.forEach((ele, ind) => {
          textNames.push(`N = ${stateValue[Number(ele[0])]}`);
          finalStateValues.push(ele[1]!);
          ele[0] = mapping[Number(ele[0])][0];
        });
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 1) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.8) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.6) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.4) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.2) - 1]
        );
        colorQuintileValues.push(finalStateValues[0]);
        const calcColorScale = makeDiscreteColorScale(
          colorQuintileValues,
          colorValues
        );

        let vetoStates: any = [];
        for (const property in stateValue) {
          if (stateValue[property] <= 100) {
            vetoStates.push(mapping[Number(property)][1]);
          }
        }
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
            locations: Object.keys(Object.fromEntries(evaluatedScore)),
            z: Object.values(Object.fromEntries(evaluatedScore)),
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
        localStorage.setItem("tpFinalValues", JSON.stringify(stateOrder));
        localStorage.setItem(
          "tpQuintileVals",
          JSON.stringify(colorQuintileValues)
        );
        localStorage.setItem("tpmYear", JSON.stringify(mYear));
        localStorage.setItem("tphmdata", JSON.stringify(data));
        localStorage.setItem("tplayout", JSON.stringify(layout));
        localStorage.setItem("tpconfig", JSON.stringify(config));
        localStorage.setItem("tpTopFive", JSON.stringify(topFiveStates));
        localStorage.setItem("tpBotFive", JSON.stringify(bottomFiveStates));
      });
    } else {
      let fvals = JSON.parse(localStorage.getItem("tpFinalValues") || "");
      let qvals = JSON.parse(localStorage.getItem("tpQuintileVals") || "");
      let hmdata = JSON.parse(localStorage.getItem("tphmdata") || "");
      let hmxyear = JSON.parse(localStorage.getItem("tpmYear") || "");
      let hmlayout = JSON.parse(localStorage.getItem("tplayout") || "");
      let hmconfig = JSON.parse(localStorage.getItem("tpconfig") || "");
      let tfive = JSON.parse(localStorage.getItem("tpTopFive") || "");
      let bfive = JSON.parse(localStorage.getItem("tpBotFive") || "");
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
          (d) => d.length,
          (d) => d.year
        );
        // const [baseYear, baseValue] = groupedUwb.entries().next().value;
        let mYear = max(rows, function (d) {
          return d.year;
        });

        const yearly = rows.filter((val) => val.year === sliderFinalValue);
        let stateValue = Object.fromEntries(
          rollup(
            yearly,
            (d) => d.length,
            (d) => d.state
          )
        );
        const yearlyNew = yearly.filter((d: DSVRowString<string>) => {
          return d["time_poor"] == "1.0";
        });
        let stateNumerator = Object.fromEntries(
          rollup(
            yearlyNew,
            (d) => d.length,
            (d) => d.state
          )
        );
        const textNames: string[] = [];
        const finalStateValues: number[] = [];
        const colorQuintileValues: number[] = [];
        let evaluatedScore: [string, number][] = [];
        for (const property in stateValue) {
          evaluatedScore.push([
            property,
            Number(
              ((stateNumerator[property] * 100) / stateValue[property]).toFixed(
                1
              )
            ),
          ]);
        }
        evaluatedScore.sort((a, b) => b[1]! - a[1]!);
        let deepCopy = structuredClone(evaluatedScore);
        evaluatedScore.forEach((ele, ind) => {
          textNames.push(`N = ${stateValue[Number(ele[0])]}`);
          finalStateValues.push(ele[1]!);
          ele[0] = mapping[Number(ele[0])][0];
        });
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 1) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.8) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.6) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.4) - 1]
        );
        colorQuintileValues.push(
          finalStateValues[Math.floor(finalStateValues.length * 0.2) - 1]
        );
        colorQuintileValues.push(finalStateValues[0]);
        const calcColorScale = makeDiscreteColorScale(
          colorQuintileValues,
          colorValues
        );

        let vetoStates: any = [];
        for (const property in stateValue) {
          if (stateValue[property] <= 100) {
            vetoStates.push(mapping[Number(property)][1]);
          }
        }
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
            locations: Object.keys(Object.fromEntries(evaluatedScore)),
            z: Object.values(Object.fromEntries(evaluatedScore)),
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
        setMaxYear(Number(mYear));
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
            <h4 className="fw-bold">Time poverty by states</h4>
            <p>
              The map below shows how time poverty changes across the states
              since 2003. Use the slider to move between years.
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
              <Col className="border">Percent of time poor individuals (%)</Col>
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
            See below the states with highest and lowest time poverty rates for
            the year selected.{" "}
            <i className="ms-1">
              Note that the states with less than 100 observations are excluded
              from the rankings.
            </i>
          </p>
          <Row className="mt-5"></Row>
          <Row style={{ paddingLeft: "12px" }}>
            <Col
              className="border"
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
          {bottom.map((state, idx) => {
            return (
              <Row key={idx} style={{ height: "30px", paddingLeft: "12px" }}>
                <Col className="border" style={{ backgroundColor: "#FBFCF2" }}>
                  <span>{(finalValues[finalValues.length - 1 - idx][0])}
                  </span>
                </Col>
                <Col
                  lg={3}
                  className="border text-center"
                  style={{ backgroundColor: "#FBFCF2" }}
                >
                  <span>
                    {finalValues[finalValues.length - 1 - idx][1].toFixed(1) + "%"}
                  </span>
                </Col>
                <Col lg={3}></Col>
              </Row>
            );
          })}
          <Row style={{ paddingLeft: "12px" }}>
            <Col
              className="border mt-5"
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
          {top.map((state, idx) => {
            return (
              <Row key={idx} style={{ height: "30px", paddingLeft: "12px" }}>
                <Col className="border" style={{ backgroundColor: "#FBFCF2" }}>
                  <span>{finalValues[4 - idx][0]}</span>
                </Col>
                <Col
                  lg={3}
                  className="border text-center"
                  style={{ backgroundColor: "#FBFCF2" }}
                >
                  <span>{finalValues[4 - idx][1].toFixed(1) + "%"}</span>
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
