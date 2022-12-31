import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../App.css";
import ModalMenu from "./ModalMenu";
import BluePlus from "../images/blue-plus.svg";
import { Col } from "react-bootstrap";
import { Option, ProfileObj, ProfileModalProps } from "./Types";

export default function ProfileModal({
  profileList,
  addNewProfile,
  groupedOptions,
  filter,
}: ProfileModalProps): JSX.Element {
  const [show, setShow] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  const handleSave = () => {
    setShow(false);
    const obj: ProfileObj = {};
    obj[`profile${profileList.length + 1}` as keyof ProfileObj] =
      selectedOptions;
    addNewProfile(obj);
  };
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  return (
    <Col md="auto" className="text-center ms-3">
      <button
        title="Max 3"
        className="profilebutton rounded-circle"
        onClick={handleShow}
        disabled={profileList.length > 2 ? true : false}
      >
        <img
          src={BluePlus}
          height="25px"
          width="25px"
          alt="Solid Download"
        ></img>
      </button>

      <div>
        <span className="d-block">Add</span>profile
      </div>

      <Modal
        dialogClassName="modal-width"
        contentClassName="modal-height"
        show={show}
        onHide={handleClose}
        centered
      >
        <Modal.Header className="d-flex justify-content-center align-items-center">
          <Modal.Title>Profile {profileList.length + 1}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ModalMenu
            setSelectedOptions={setSelectedOptions}
            groupedOptions={groupedOptions}
            filter={filter}
          />
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center align-items-center">
          <Button variant="danger" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Create Profile
          </Button>
        </Modal.Footer>
      </Modal>
    </Col>
  );
}
