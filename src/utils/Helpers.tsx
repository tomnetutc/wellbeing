import { useAccordionButton } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import firebase, { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import firebaseConfig from '../firebaseConfig';
import { csv, mean, rollup } from "d3";
import { DSVRowString } from "d3-dsv";
import "../App.css";
import {
  CustomToggleProps,
  CustomFilterProps,
  ProfileObj,
  CountObj,
  IGraphData,
} from "../components/Types";
import { Option, GroupedOption } from "../components/Types";
import { FilterOptionOption } from "react-select/dist/declarations/src/filters";

export const CustomToggle = ({
  children,
  eventKey,
  handleClick,
}: CustomToggleProps) => {
  const decoratedOnClick = useAccordionButton(eventKey, () => {
    handleClick();
  });

  return (
    <button className="border-0 bg-transparent" onClick={decoratedOnClick}>
      {children}
    </button>
  );
};

export function filterCriteria({
  numberOfAttrs,
  featureVars,
}: CustomFilterProps): (d: DSVRowString<string>) => boolean {
  return function (d: DSVRowString<string>) {
    if (numberOfAttrs == 1) {
      return d[featureVars[0].id] == featureVars[0].val;
    } else if (numberOfAttrs == 2) {
      if (featureVars[0].groupId == featureVars[1].groupId) {
        return (
          d[featureVars[0].id] == featureVars[0].val ||
          d[featureVars[1].id] == featureVars[1].val
        );
      } else {
        return (
          d[featureVars[0].id] == featureVars[0].val &&
          d[featureVars[1].id] == featureVars[1].val
        );
      }
    } else {
      if (
        featureVars[0].groupId == featureVars[1].groupId &&
        featureVars[1].groupId == featureVars[2].groupId
      ) {
        return (
          d[featureVars[0].id] == featureVars[0].val ||
          d[featureVars[1].id] == featureVars[1].val ||
          d[featureVars[2].id] == featureVars[2].val
        );
      } else if (featureVars[0].groupId == featureVars[1].groupId) {
        return (
          (d[featureVars[0].id] == featureVars[0].val ||
            d[featureVars[1].id] == featureVars[1].val) &&
          d[featureVars[2].id] == featureVars[2].val
        );
      } else if (featureVars[1].groupId == featureVars[2].groupId) {
        return (
          d[featureVars[0].id] == featureVars[0].val &&
          (d[featureVars[1].id] == featureVars[1].val ||
            d[featureVars[2].id] == featureVars[2].val)
        );
      } else if (featureVars[0].groupId == featureVars[2].groupId) {
        return (
          (d[featureVars[0].id] == featureVars[0].val ||
            d[featureVars[2].id] == featureVars[2].val) &&
          d[featureVars[1].id] == featureVars[1].val
        );
      } else {
        return (
          d[featureVars[0].id] == featureVars[0].val &&
          d[featureVars[1].id] == featureVars[1].val &&
          d[featureVars[2].id] == featureVars[2].val
        );
      }
    }
  };
}

export const fetchData = async (passedProfileList: ProfileObj | undefined) => {
  let countObj: CountObj = { data: [], count: [] };
  let graphData: IGraphData[] = [];
  let countData: [string, number][] = [];
  let yearData: (string | undefined)[] = [];
  let wbavg: number = 0;
  let newData;
  let bValue: number = 0;
  try {
    const data = await csv(
      "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
    );
    if (passedProfileList) {
      const featureVars = Object.values(passedProfileList)[0];
      const numberOfAttrs = featureVars.length;
      newData = data.filter(filterCriteria({ numberOfAttrs, featureVars }));
    } else {
      newData = data;
    }
    let groupedValue = rollup(
      newData,
      (v) => mean(v, (d) => Number(d["norm_wb"])),
      (d) => d.year
    );
    let groupCount = rollup(
      newData,
      (d) => d.length,
      (d) => d.year
    );
    groupCount = Object.fromEntries(groupCount);
    yearData = Array.from(groupedValue.keys());
    countData = [...Object.entries(groupCount)];
    if (!passedProfileList) {
      const [baseYear, baseValue] = groupedValue.entries().next().value;
      bValue = baseValue;
    }
    const groupedValueMap: [string, number][] = Object.entries(
      Object.fromEntries(groupedValue)
    );
    for (const [key, value] of groupedValueMap) {
      graphData.push({
        "G-Year": key,
        "G-Score": Number(((value * 100) / bValue).toFixed(1)),
      });
    }
    wbavg = Number(((bValue * 100) / bValue).toFixed(1));
    countObj.data = newData;
    countObj.count = countData;
  } catch (err) {
    console.log("An error occurred: ", err);
  }
  return {
    countObj,
    graphData,
    yearData,
    wbavg,
    bValue,
  };
};

export const fetchDataForProfile = async (
  passedProfileList: ProfileObj | undefined,
  bValue: number
) => {
  let countObj: CountObj = { data: [], count: [] };
  let graphData: IGraphData[] = [];
  let countData: [string, number][] = [];
  let yearData: (string | undefined)[] = [];
  let wbavg: number = 0;
  let newData;
  try {
    const data = await csv(
      "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
    );
    if (passedProfileList) {
      const featureVars = Object.values(passedProfileList)[0];
      const numberOfAttrs = featureVars.length;
      newData = data.filter(filterCriteria({ numberOfAttrs, featureVars }));
    } else {
      newData = data;
    }
    let groupedValue = rollup(
      newData,
      (v) => mean(v, (d) => Number(d["norm_wb"])),
      (d) => d.year
    );
    let groupCount = rollup(
      newData,
      (d) => d.length,
      (d) => d.year
    );
    groupCount = Object.fromEntries(groupCount);
    yearData = Array.from(groupedValue.keys());
    countData = [...Object.entries(groupCount)];
    const groupedValueMap: [string, number][] = Object.entries(
      Object.fromEntries(groupedValue)
    );
    for (const [key, value] of groupedValueMap) {
      graphData.push({
        "G-Year": key,
        "G-Score": Number(((value * 100) / bValue).toFixed(1)),
      });
    }
    wbavg = Number(((bValue * 100) / bValue).toFixed(1));
    countObj.data = newData;
    countObj.count = countData;
  } catch (err) {
    console.log("An error occurred: ", err);
  }
  return {
    countObj,
    graphData,
    yearData,
    wbavg,
    bValue,
  };
};

export const TpFetchData = async (
  passedProfileList: ProfileObj | undefined
) => {
  let countObj: CountObj = { data: [], count: [] };
  let graphData: IGraphData[] = [];
  let countData: [string, number][] = [];
  let yearData: (string | undefined)[] = [];
  let wbavg: number = 0;
  let newData;
  try {
    const data = await csv(
      "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
    );
    if (passedProfileList) {
      const featureVars = Object.values(passedProfileList)[0];
      const numberOfAttrs = featureVars.length;
      newData = data.filter(filterCriteria({ numberOfAttrs, featureVars }));
    } else {
      newData = data;
    }
    let groupCount = rollup(
      newData,
      (d) => d.length,
      (d) => d.year
    );
    const tpNewData = newData.filter((d: DSVRowString<string>) => {
      return d["time_poor"] == "1.0";
    });
    let groupedValue = rollup(
      tpNewData,
      (d) => d.length,
      (d) => d.year
    );
    groupCount = Object.fromEntries(groupCount);
    yearData = Array.from(groupedValue.keys());
    countData = [...Object.entries(groupCount)];
    // if (!passedProfileList) {
    //   const [baseYear, baseValue] = groupedValue.entries().next().value;
    //   bValue = baseValue;
    // }
    const groupedValueMap: [string, number][] = Object.entries(
      Object.fromEntries(groupedValue)
    );
    for (let i = 0; i < groupedValueMap.length; i++) {
      graphData.push({
        "G-Year": groupedValueMap[i][0],
        "G-Score": Number(
          ((groupedValueMap[i][1] * 100) / countData[i][1]).toFixed(1)
        ),
      });
    }
    wbavg = Number(
      ((groupedValueMap[0][1] * 100) / countData[0][1]).toFixed(1)
    );
    countObj.data = newData;
    countObj.count = countData;
  } catch (err) {
    console.log("An error occurred: ", err);
  }
  return {
    countObj,
    graphData,
    yearData,
    wbavg,
    // bValue,
  };
};

export const ZTFetchData = async (
  passedProfileList: ProfileObj | undefined
) => {
  let countObj: CountObj = { data: [], count: [] };
  let graphData: IGraphData[] = [];
  let countData: [string, number][] = [];
  let yearData: (string | undefined)[] = [];
  let wbavg: number = 0;
  let newData;
  try {
    const data = await csv(
      "https://raw.githubusercontent.com/tomnetutc/wellbeing/main/src/data/df.csv"
    );
    if (passedProfileList) {
      const featureVars = Object.values(passedProfileList)[0];
      const numberOfAttrs = featureVars.length;
      newData = data.filter(filterCriteria({ numberOfAttrs, featureVars }));
    } else {
      newData = data;
    }
    let groupCount = rollup(
      newData,
      (d) => d.length,
      (d) => d.year
    );
    const tpNewData = newData.filter((d: DSVRowString<string>) => {
      return d["zero_trip"] == "1.0";
    });
    let groupedValue = rollup(
      tpNewData,
      (d) => d.length,
      (d) => d.year
    );
    groupCount = Object.fromEntries(groupCount);
    yearData = Array.from(groupedValue.keys());
    countData = [...Object.entries(groupCount)];
    // if (!passedProfileList) {
    //   const [baseYear, baseValue] = groupedValue.entries().next().value;
    //   bValue = baseValue;
    // }
    const groupedValueMap: [string, number][] = Object.entries(
      Object.fromEntries(groupedValue)
    );
    for (let i = 0; i < groupedValueMap.length; i++) {
      graphData.push({
        "G-Year": groupedValueMap[i][0],
        "G-Score": Number(
          ((groupedValueMap[i][1] * 100) / countData[i][1]).toFixed(1)
        ),
      });
    }
    wbavg = Number(
      ((groupedValueMap[0][1] * 100) / countData[0][1]).toFixed(1)
    );
    countObj.data = newData;
    countObj.count = countData;
  } catch (err) {
    console.log("An error occurred: ", err);
  }
  return {
    countObj,
    graphData,
    yearData,
    wbavg,
    // bValue,
  };
};

// Default values
export const defaultYears = [
  "2003",
  "2004",
  "2005",
  "2006",
  "2007",
  "2008",
  "2009",
  "2010",
  "2011",
  "2012",
  "2013",
  "2014",
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
];

// Default values
const defaultCountsInCountObj: [string | undefined, number][] = [
  ["2003", 0],
  ["2004", 0],
  ["2005", 0],
  ["2006", 0],
  ["2007", 0],
  ["2008", 0],
  ["2009", 0],
  ["2010", 0],
  ["2011", 0],
  ["2012", 0],
  ["2013", 0],
  ["2014", 0],
  ["2015", 0],
  ["2016", 0],
  ["2017", 0],
  ["2018", 0],
  ["2019", 0],
  ["2020", 0],
];

// Default values
const defaultCountObj: CountObj = { data: [], count: defaultCountsInCountObj };
export const defaultCounts = [defaultCountObj];

export function formatYears(
  yearData: (string | undefined)[]
): { value: string | undefined; label: string | undefined }[] {
  return yearData.map((year) => {
    return { value: year, label: year };
  });
}

export const GenderOptions: Option[] = [
  {
    value: "Female",
    label: "Female",
    id: "female",
    val: "1.0",
    groupId: "Gender",
  },
  {
    value: "Male",
    label: "Male",
    id: "female",
    val: "0.0",
    groupId: "Gender",
  },
];

export const AgeOptions: Option[] = [
  {
    value: "15 to 19 years",
    label: "15 to 19 years",
    id: "age_15_19",
    val: "1.0",
    groupId: "Age",
  },
  {
    value: "20 to 29 years",
    label: "20 to 29 years",
    id: "age_20_29",
    val: "1.0",
    groupId: "Age",
  },
  {
    value: "30 to 49 years",
    label: "30 to 49 years",
    id: "age_30_49",
    val: "1.0",
    groupId: "Age",
  },
  {
    value: "50 to 64 years",
    label: "50 to 64 years",
    id: "age_50_64",
    val: "1.0",
    groupId: "Age",
  },
  {
    value: "65 years or older",
    label: "65 years or older",
    id: "age_65p",
    val: "1.0",
    groupId: "Age",
  },
];

export const EducationOptions: Option[] = [
  {
    value: "Less than high school",
    label: "Less than high school",
    id: "less_than_hs",
    val: "1.0",
    groupId: "Education",
  },
  {
    value: "High school",
    label: "High school",
    id: "hs_grad",
    val: "1.0",
    groupId: "Education",
  },
  {
    value: "Some college degree",
    label: "Some college degree",
    id: "some_col_assc_deg",
    val: "1.0",
    groupId: "Education",
  },
  {
    value: "Bachelor's degree",
    label: "Bachelor's degree",
    id: "bachelor",
    val: "1.0",
    groupId: "Education",
  },
  {
    value: "Graduate degree(s)",
    label: "Graduate degree(s)",
    id: "grad_sch",
    val: "1.0",
    groupId: "Education",
  },
];

export const RaceOptions: Option[] = [
  {
    value: "Asian",
    label: "Asian",
    id: "asian",
    val: "1.0",
    groupId: "Race",
  },
  {
    value: "Black",
    label: "Black",
    id: "black",
    val: "1.0",
    groupId: "Race",
  },
  {
    value: "White",
    label: "White",
    id: "white",
    val: "1.0",
    groupId: "Race",
  },
  {
    value: "Other",
    label: "Other",
    id: "race_other",
    val: "1.0",
    groupId: "Race",
  },
];

const EmploymentStatusOptions: Option[] = [
  {
    value: "Employed",
    label: "Employed",
    id: "employed",
    val: "1.0",
    groupId: "Employment",
  },
  {
    value: "Unemployed",
    label: "Unemployed",
    id: "employed",
    val: "0.0",
    groupId: "Employment",
  },
];

export const IncomeOptions: Option[] = [
  {
    value: "<$35K",
    label: "<$35K",
    id: "inc_up35",
    val: "1.0",
    groupId: "Income",
  },
  {
    value: "$35K to $50K",
    label: "$35K to $50K",
    id: "inc_35_50",
    val: "1.0",
    groupId: "Income",
  },
  {
    value: "$50K to $75K",
    label: "$50K to $75K",
    id: "inc_50_75",
    val: "1.0",
    groupId: "Income",
  },
  {
    value: "$75K to $100K",
    label: "$75K to $100K",
    id: "inc_75_100",
    val: "1.0",
    groupId: "Income",
  },
  {
    value: ">$100K",
    label: ">$100K",
    id: "inc_100p",
    val: "1.0",
    groupId: "Income",
  },
];

export const HouseholdSize: Option[] = [
  {
    value: "One",
    label: "One",
    id: "hhsize_1",
    val: "1.0",
    groupId: "HouseholdSize",
  },
  {
    value: "Two",
    label: "Two",
    id: "hhsize_2",
    val: "1.0",
    groupId: "HouseholdSize",
  },
  {
    value: "Three or more",
    label: "Three or more",
    id: "hhsize_3p",
    val: "1.0",
    groupId: "HouseholdSize",
  },
];

const LocationOptions: Option[] = [
  {
    value: "Urban",
    label: "Urban",
    id: "non_metropolitan",
    val: "0.0",
    groupId: "Location",
  },
  {
    value: "Not urban",
    label: "Not urban",
    id: "non_metropolitan",
    val: "1.0",
    groupId: "Location",
  },
];

const TimePovertyOptions: Option[] = [
  {
    value: "Time poor",
    label: "Time poor",
    id: "time_poor",
    val: "1.0",
    groupId: "TimePoverty",
  },
  {
    value: "Not time poor",
    label: "Not time poor",
    id: "time_poor",
    val: "0.0",
    groupId: "TimePoverty",
  },
];

const TransportOptions: Option[] = [
  {
    value: "Car",
    label: "Car",
    id: "car_user",
    val: "1.0",
    groupId: "Transport",
  },
  {
    value: "Non-car",
    label: "Non-car",
    id: "car_user",
    val: "0.0",
    groupId: "Transport",
  },
];

const TripMakingOptions: Option[] = [
  {
    value: "One or more trips",
    label: "One or more trips",
    id: "zero_trip",
    val: "0.0",
    groupId: "ZeroTrip",
  },
  {
    value: "Zero trip",
    label: "Zero trip",
    id: "zero_trip",
    val: "1.0",
    groupId: "ZeroTrip",
  },
];

export const groupedOptions: GroupedOption[] = [
  {
    label: "Gender",
    options: GenderOptions.map((obj) => ({
      ...obj,
      groupName: "Gender",
    })),
  },
  {
    label: "Age",
    options: AgeOptions.map((obj) => ({
      ...obj,
      groupName: "Age",
    })),
  },
  {
    label: "Education",
    options: EducationOptions.map((obj) => ({
      ...obj,
      groupName: "Education",
    })),
  },
  {
    label: "Race",
    options: RaceOptions.map((obj) => ({
      ...obj,
      groupName: "Race",
    })),
  },
  {
    label: "Employment status",
    options: EmploymentStatusOptions.map((obj) => ({
      ...obj,
      groupName: "Employment status",
    })),
  },
  {
    label: "Household income",
    options: IncomeOptions.map((obj) => ({
      ...obj,
      groupName: "Household income",
    })),
  },
  {
    label: "Household size",
    options: HouseholdSize.map((obj) => ({
      ...obj,
      groupName: "Household size",
    })),
  },
  {
    label: "Location",
    options: LocationOptions.map((obj) => ({
      ...obj,
      groupName: "Location",
    })),
  },
  {
    label: "Time poverty status",
    options: TimePovertyOptions.map((obj) => ({
      ...obj,
      groupName: "Time poverty status",
    })),
  },
  {
    label: "Main mode of transportation",
    options: TransportOptions.map((obj) => ({
      ...obj,
      groupName: "Main mode of transportation",
    })),
  },
  {
    label: "Trip making status",
    options: TripMakingOptions.map((obj) => ({
      ...obj,
      groupName: "Trip making status",
    })),
  },
];

export const TpGroupedOptions: GroupedOption[] = groupedOptions.filter(
  (opt) => opt.label != "Time poverty status"
);

export const ZTGroupedOptions: GroupedOption[] = groupedOptions.filter(
  (opt) => opt.label != "Trip making status"
);

export const filterOption = (
  { label, value }: FilterOptionOption<Option>,
  string: string
) => {
  // Default search
  if (label.includes(string) || value.includes(string)) return true;

  // Check if a group as the filter string as label
  const groupOptions = groupedOptions.filter((group) =>
    group.label.toLocaleLowerCase().includes(string)
  );

  if (groupOptions) {
    for (const groupOption of groupOptions) {
      // Check if current option is in group
      const option = groupOption.options.find((opt) => opt.value === value);
      if (option) {
        return true;
      }
    }
  }
  return false;
};

export const TpfilterOption = (
  { label, value }: FilterOptionOption<Option>,
  string: string
) => {
  // Default search
  if (label.includes(string) || value.includes(string)) return true;

  // Check if a group as the filter string as label
  const groupOptions = TpGroupedOptions.filter((group) =>
    group.label.toLocaleLowerCase().includes(string)
  );

  if (groupOptions) {
    for (const groupOption of groupOptions) {
      // Check if current option is in group
      const option = groupOption.options.find((opt) => opt.value === value);
      if (option) {
        return true;
      }
    }
  }
  return false;
};

export const ZTfilterOption = (
  { label, value }: FilterOptionOption<Option>,
  string: string
) => {
  // Default search
  if (label.includes(string) || value.includes(string)) return true;

  // Check if a group as the filter string as label
  const groupOptions = ZTGroupedOptions.filter((group) =>
    group.label.toLocaleLowerCase().includes(string)
  );

  if (groupOptions) {
    for (const groupOption of groupOptions) {
      // Check if current option is in group
      const option = groupOption.options.find((opt) => opt.value === value);
      if (option) {
        return true;
      }
    }
  }
  return false;
};

export function hideFlagCounter() {
  const flagCounterImage = document.querySelector('#flag-counter-img') as HTMLImageElement;
  if (flagCounterImage) {
    flagCounterImage.style.display = 'none';
  }
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export function tracking() {
  const websiteDocRef = doc(db, "websites", "I0Tfi6aqMpIy6PfAxeAN");

  const unique_counter = document.getElementById("visit-count");
  const total_counter = document.getElementById("total-count");

  const getUniqueCount = async () => {
    const docSnap = await getDoc(websiteDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data) {
        setValue(data.uniqueCount);
      }
    }
  };

  const getTotalCount = async () => {
    const docSnap = await getDoc(websiteDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data) {
        setTotal(data.totalCount);
      }
    }
  };

  const incrementCountUnique = async () => {
    await updateDoc(websiteDocRef, {
      uniqueCount: increment(1)
    });
    await getUniqueCount();
  };

  const incrementCountTotal = async () => {
    await updateDoc(websiteDocRef, {
      totalCount: increment(1)
    });
    await getTotalCount();
  };

  const setValue = (num: number) => {
    if (unique_counter) {
      unique_counter.innerText = `Unique visitors: ${num}`;
    }
  };

  const setTotal = (num: number) => {
    if (total_counter) {
      total_counter.innerText = `Total visits: ${num}`;
    }
  };

  if (localStorage.getItem("hasVisited") == null) {
    incrementCountUnique()
      .then(() => {
        localStorage.setItem("hasVisited", "true");
      })
      .catch((err) => console.log(err));
  } else {
    getUniqueCount().catch((err) => console.log(err));
  }

  if (localStorage.getItem("expiry") == null) {
    incrementCountTotal().then(() => {
      localStorage.setItem("expiry", (Date.now() + 60000 * 120).toString());
    });
  } else if (new Date().getTime() > Number(localStorage.getItem("expiry"))) {
    incrementCountTotal().then(() => {
      localStorage.setItem("expiry", (Date.now() + 60000 * 120).toString());
    });
  } else {
    getTotalCount().catch((err) => console.log(err));
  }
}

// export function track() {
//   //We'll use the below in-case there the DB is corrupted

//   const unique_counter = document.getElementById("visit-count");
//   const total_counter = document.getElementById("total-count");

//   const fetchData = async () => {
//     try {
//       const response = await fetch('YOUR_API_ENDPOINT_URL');
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const data = await response.json();

//       const { totalUniqueVisitors, totalPageviews } = data;

//       console.log('Total Unique Visitors:', totalUniqueVisitors);
//       console.log('Total Pageviews:', totalPageviews);

//       unique_counter!.innerText = `Unique visitors: ${totalUniqueVisitors}`;
//       total_counter!.innerText = `Total visits: ${totalPageviews}`;
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   };

//   fetchData();
// }