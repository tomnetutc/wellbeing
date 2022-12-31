import { Container, Table } from "react-bootstrap";
import exportFromJSON from "export-from-json";
import Download from "../images/download-solid.svg";
import { WellbeingTableProps } from "./Types";
import { DSVRowString } from "d3";

export default function WellbeingTable({
  years,
  counts,
}: WellbeingTableProps): JSX.Element {
  counts.map((count) => {
    const existingYears = count?.count?.map((ele) => {
      return ele[0];
    });
    years.map((year) => {
      if (!existingYears.includes(year)) {
        count.count.push([year, 0]);
      }
    });
    count.count.sort();
  });

  function downloadProfile(data: DSVRowString<string>[], index: number): void {
    const fileName = index == 0 ? "Full Sample" : `Profile-${index}`;
    exportFromJSON({ data, fileName, fields: [], exportType: "csv" });
  }

  return (
    <Container>
      <hr className="hr-spec" />
      <h5 className="text-center fw-bold">Sample sizes</h5>
      <Table responsive>
        <thead>
          <tr>
            <th style={{ fontSize: "15px" }}>Year</th>
            {years.map((year, index) => {
              return (
                <th key={index} style={{ fontSize: "15px" }}>
                  {year}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {counts.map((count, index) => {
            return (
              <tr key={index}>
                {index === 0 ? (
                  <td style={{ fontSize: "15px", display: "flex" }}>
                    <span>All</span>
                    <button
                      title="Download sample"
                      className="btn profilebutton"
                      onClick={() => downloadProfile(count.data, index)}
                      style={{
                        padding: "0px",
                        margin: "0px 0px 0px 5px",
                        transform: "translate(0px, -2px)",
                      }}
                    >
                      <img
                        src={Download}
                        height="18px"
                        width="30px"
                        alt="Solid Download"
                      ></img>
                    </button>
                  </td>
                ) : (
                  <td style={{ fontSize: "15px" }}>
                    Profile {index}
                    <button
                      title="Download sample"
                      className="btn profilebutton"
                      style={{
                        padding: "0px",
                        margin: "0px 0px 0px 5px",
                        transform: "translate(0px, -2px)",
                      }}
                    >
                      <img
                        src={Download}
                        height="18px"
                        width="30px"
                        onClick={() => downloadProfile(count.data, index)}
                        alt="Solid Download"
                      ></img>
                    </button>
                  </td>
                )}
                {count?.count?.map((c, idx) => {
                  return (
                    <td key={idx} style={{ fontSize: "15px" }}>
                      {c[1].toLocaleString("en-US")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}
