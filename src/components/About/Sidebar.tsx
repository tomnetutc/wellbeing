import "../../App.css";
import { HashLink as Link } from "react-router-hash-link";

export function Sidebar(): JSX.Element {
  const LinkStyle = {
    textDecoration: "none",
    color: "#802020",
    fontSize: "16px",
    // width: "50%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
  };
  return (
    <div className="col col-lg-3">
      <div className="sidediv">
        <nav className="sidenavbar">
          <ul className="sidenavbarlist">
            <li className="sidenavbarlistitem">
              <Link style={LinkStyle} to="/about#section1">
                About the platform
              </Link>
            </li>
            <li className="sidenavbarlistitem">
              <Link style={LinkStyle} to="/about#section2">
                Wellbeing scoring method
              </Link>
            </li>
            <li className="sidenavbarlistitem">
              <Link style={LinkStyle} to="/about#section3">
                Time poverty computation
              </Link>
            </li>
            <li className="sidenavbarlistitem">
              <Link style={LinkStyle} to="/about#section4">
                Zero trip-making computation
              </Link>
            </li>
            <li className="sidenavbarlistitem">
              <Link style={LinkStyle} to="/about#section5">
                Data source
              </Link>
            </li>
            <li className="sidenavbarlistitem">
              <Link style={LinkStyle} to="/about#section6">
                Credits
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
