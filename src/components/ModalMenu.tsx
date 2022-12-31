import { useState } from "react";
import Select, { MultiValue } from "react-select";
import { ModalProps, Option, GroupedOption } from "./Types";

export default function ModalMenu({
  setSelectedOptions,
  groupedOptions,
  filter,
}: ModalProps): JSX.Element {
  const [val, setVal] = useState<MultiValue<Option>>([]);
  function onChangeHandler(val: MultiValue<Option>) {
    setSelectedOptions([...val]);
    setVal(val);
  }

  return (
    <div className="text-center">
      <div className="mb-3">Select up to 3 attributes</div>
      <Select<Option, true, GroupedOption>
        onChange={onChangeHandler}
        placeholder="Select attribute"
        closeMenuOnSelect={val.length >= 2}
        filterOption={filter}
        isOptionDisabled={() => val.length >= 3}
        options={groupedOptions}
        isMulti
      />
    </div>
  );
}
