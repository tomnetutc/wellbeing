import { Col } from "react-bootstrap";
import { ProfileCardProps } from "./Types";

export default function ProfileCards({
  profileList,
  removeProfile,
}: ProfileCardProps): JSX.Element {
  return (
    <>
      {profileList.map((profile, index) => {
        return (
          <Col
            md="auto"
            style={{ display: "flex", justifyContent: "space-evenly" }}
            key={index}
          >
            <div className="profiles" id="closeablecard">
              <span
                style={{
                  fontSize: "large",
                  fontWeight: "bold",
                }}
              >
                Profile {index + 1}
              </span>
              <button
                data-dismiss="alert"
                data-target="#closeablecard"
                onClick={() => removeProfile(index)}
                className="btn-close profile-close-x"
              ></button>
              {Object.values(profile)[0].map(({ label }, idx) => {
                return (
                  <div key={idx} className="text-center">
                    {label}
                  </div>
                );
              })}
            </div>
          </Col>
        );
      })}
    </>
  );
}
