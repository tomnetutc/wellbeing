import { useEffect, useState } from "react";
import { Row, Col, Container } from "react-bootstrap";
import ProgressBar from "react-bootstrap/ProgressBar";
import { csv, mean, rollup } from "d3";
import { ProgressProps } from "./Types";
import { DSVRowString } from "d3";
import { Option } from "./Types";

export default function Progress({
  value,
  max,
  selectedGroup,
  selectedYear,
  setWbavg,
  baseValue,
  characteristic,
  colorClass,
}: ProgressProps): JSX.Element {
  const [levelData, setLevelData] = useState<Option[] | []>([]);
  useEffect(() => {
    if (selectedGroup && selectedYear) {
      csv(
        "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
      ).then((data) => {
        if (characteristic == "wellbeing") {
          const levels: Option[] = [];
          selectedGroup.map((group) => {
            function filterCriteria(d: DSVRowString<string>) {
              return d[group.id] == group.val;
            }
            let filteredData;
            let allGroupedUwb;
            if (selectedGroup[0].value != "ALL") {
              filteredData = data.filter(filterCriteria);
              allGroupedUwb = rollup(
                data,
                (v) => mean(v, (d) => Number(d["norm_wb"])),
                (d) => d.year
              );
            } else {
              filteredData = data;
            }
            const groupedUwb = rollup(
              filteredData,
              (v) => mean(v, (d) => Number(d["norm_wb"])),
              (d) => d.year
            );
            let progressValue = groupedUwb.get(selectedYear);
            progressValue = (progressValue! * 100) / baseValue;
            if (selectedGroup[0].value != "ALL") {
              let allValue = allGroupedUwb?.get(selectedYear);
              allValue = (allValue! * 100) / baseValue;
              setWbavg(allValue);
              levels.push({ ...group, progressValue });
            } else {
              setWbavg(progressValue);
            }
          });
          setLevelData(levels);
        } else if (characteristic == "tpoverty") {
          const levels: Option[] = [];
          selectedGroup.map((group) => {
            function filterCriteria(d: DSVRowString<string>) {
              return d[group.id] == group.val;
            }
            let filteredData;
            let allGroupedUwb;
            let tpNewData;
            let allTpGroupedUwb;
            if (selectedGroup[0].value != "ALL") {
              filteredData = data.filter(filterCriteria);
              allGroupedUwb = rollup(
                data,
                (d) => d.length,
                (d) => d.year
              );
              tpNewData = data.filter((d: DSVRowString<string>) => {
                return d["time_poor"] == "1.0";
              });
              allTpGroupedUwb = rollup(
                tpNewData,
                (d) => d.length,
                (d) => d.year
              );
            } else {
              filteredData = data;
            }
            const groupedUwb = rollup(
              filteredData,
              (d) => d.length,
              (d) => d.year
            );
            let allTpData = filteredData.filter((d: DSVRowString<string>) => {
              return d["time_poor"] == "1.0";
            });
            const denomGroup = rollup(
              allTpData,
              (d) => d.length,
              (d) => d.year
            );
            let progressValue = groupedUwb.get(selectedYear);
            let progressDenom = denomGroup.get(selectedYear);
            progressValue = (progressDenom! * 100) / progressValue!;
            if (selectedGroup[0].value != "ALL") {
              let allValue = allTpGroupedUwb?.get(selectedYear);
              let allDenomValue = allGroupedUwb?.get(selectedYear);
              allValue = (allValue! * 100) / allDenomValue!;
              setWbavg(allValue);
              levels.push({ ...group, progressValue });
            } else {
              setWbavg(progressValue);
            }
          });
          setLevelData(levels);
        } else {
          const levels: Option[] = [];
          selectedGroup.map((group) => {
            function filterCriteria(d: DSVRowString<string>) {
              return d[group.id] == group.val;
            }
            let filteredData;
            let allGroupedUwb;
            let tpNewData;
            let allTpGroupedUwb;
            if (selectedGroup[0].value != "ALL") {
              filteredData = data.filter(filterCriteria);
              allGroupedUwb = rollup(
                data,
                (d) => d.length,
                (d) => d.year
              );
              tpNewData = data.filter((d: DSVRowString<string>) => {
                return d["zero_trip"] == "1.0";
              });
              allTpGroupedUwb = rollup(
                tpNewData,
                (d) => d.length,
                (d) => d.year
              );
            } else {
              filteredData = data;
            }
            const groupedUwb = rollup(
              filteredData,
              (d) => d.length,
              (d) => d.year
            );
            let allTpData = filteredData.filter((d: DSVRowString<string>) => {
              return d["zero_trip"] == "1.0";
            });
            const denomGroup = rollup(
              allTpData,
              (d) => d.length,
              (d) => d.year
            );
            let progressValue = groupedUwb.get(selectedYear);
            let progressDenom = denomGroup.get(selectedYear);
            progressValue = (progressDenom! * 100) / progressValue!;
            if (selectedGroup[0].value != "ALL") {
              let allValue = allTpGroupedUwb?.get(selectedYear);
              let allDenomValue = allGroupedUwb?.get(selectedYear);
              allValue = (allValue! * 100) / allDenomValue!;
              setWbavg(allValue);
              levels.push({ ...group, progressValue });
            } else {
              setWbavg(progressValue);
            }
          });
          setLevelData(levels);
        }
      });
    }
  }, [selectedGroup, selectedYear]);

  return (
    <Container>
      <Row
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "50px",
        }}
      >
        <Col className="col-3 p-0" style={{ fontSize: "15px" }}>
          All
        </Col>
        <Col className="col-8" style={{ height: "25px" }}>
          <ProgressBar
            variant={colorClass}
            max={max}
            style={{ height: "100%", width: "95%" }}
            now={value}
          />
        </Col>
        <Col className="col-1 p-0">
          <span style={{ position: "relative", left: "-11px" }}>
            {value.toFixed(1)}
            {characteristic != "wellbeing" ? "%" : null}
          </span>
        </Col>
      </Row>
      {levelData.map((lvl, idx) => {
        return (
          <Row
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "30px",
            }}
          >
            <Col className="col-3 p-0" style={{ fontSize: "15px" }}>
              {lvl.label}
            </Col>
            <Col className="col-8" style={{ height: "25px" }}>
              <ProgressBar
                variant={colorClass}
                max={max}
                style={{ height: "100%", width: "95%" }}
                now={lvl.progressValue}
              />
            </Col>
            <Col className="col-1 p-0">
              <span style={{ position: "relative", left: "-11px" }}>
                {lvl.progressValue?.toFixed(1)}
                {characteristic != "wellbeing" ? "%" : null}
              </span>
            </Col>
          </Row>
        );
      })}
    </Container>
  );
}
