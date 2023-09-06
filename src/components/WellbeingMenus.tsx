import Select from "react-select";
import {
  GenderOptions,
  AgeOptions,
  EducationOptions,
  RaceOptions,
  IncomeOptions,
  HouseholdSize,
} from "../utils/Helpers";
import { formatYears } from "../utils/Helpers";
import { YearMenuProps, GroupMenuProps } from "./Types";

export function GroupMenu({ setSelectedGroup }: GroupMenuProps): JSX.Element {
  const groupOptions = [
    { value: "all", label: "All", category: [{ value: "ALL" }] }, // this option is added to enable 'All' option.
    { value: "gender", label: "Gender", category: GenderOptions },
    { value: "age", label: "Age", category: AgeOptions },
    { value: "education", label: "Education", category: EducationOptions },
    { value: "race", label: "Race", category: RaceOptions },
    { value: "income", label: "Household income", category: IncomeOptions },
    { value: "hsize", label: "Household size", category: HouseholdSize},
  ];

  function onChangeHandler(val: any) {
    setSelectedGroup(val.category);
  }
  return (
    <Select
      onChange={onChangeHandler}
      options={groupOptions}
      placeholder="Select a group"
    />
  );
}

export function YearMenu({
  yearOptions,
  setSelectedYear,
}: YearMenuProps): JSX.Element {
  function onChangeHandler(val: any) {
    setSelectedYear(val.value);
  }
  return (
    <Select
      className="mt-2"
      onChange={onChangeHandler}
      options={formatYears(yearOptions)}
      placeholder="Select a year"
    />
  );
}
