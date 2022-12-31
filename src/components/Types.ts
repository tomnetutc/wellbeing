import { DSVRowString } from "d3";
import { Dispatch, SetStateAction } from "react";
import { FilterOptionOption } from "react-select/dist/declarations/src/filters";

export interface AccordionProps {
    customAccordionProps: {
      img: any;
      headText1: string;
      headText2: string;
      cardTextFirst: string;
      cardTextSecond: string;
      cardTextThird: string;
    };
};

export interface CustomToggleProps {
    children: JSX.Element;
    eventKey: string;
    handleClick: () => void;
};

export interface CustomFilterProps {
    numberOfAttrs: Number;
    featureVars: Option[];
};

export interface IAddProfile {
    (newProfile: { [key: string]: Option[] }): Promise<void>;
};

export interface CountObj {
    data: DSVRowString<string>[]
    count: [string | undefined, number][];
};
  
export interface IGraphData {
    [key: string]: string | number;
};

export interface ChartProps {
    customChartProps: {
      colors: string[];
      caption: string;
      xAxis: {
        dkey: string;
        title: string;
      };
      yAxis: {
        dkey: string;
        title: string;
        reversed: boolean;
        dy: number;
      };
      mainDkey: string;
    };
    data: Object[][];
};

export interface ModalProps {
    setSelectedOptions: Dispatch<SetStateAction<Option[]>>;
    groupedOptions: GroupedOption[],
    filter: (option: FilterOptionOption<Option>, inputValue: string) => boolean,
};

export interface Option {
    value: string;
    label: string;
    id: string;
    val: string;
    groupId: string;
    groupName?: string;
    progressValue?: number;
};
  
export interface GroupedOption {
    label: string;
    options: Option[];
};

export interface ProfileObj {
    [key: string]: Option[];
};

export interface IRemoveProfile {
    (profileIndex: number): void;
}

export interface ProfileCardProps {
    profileList: ProfileObj[];
    removeProfile: IRemoveProfile;
};

export interface ProfileModalProps {
    profileList: ProfileObj[];
    addNewProfile: IAddProfile;
    groupedOptions: GroupedOption[];
    filter: ({ label, value }: FilterOptionOption<Option>, string: string) => boolean;
};

export interface WellbeingTableProps {
    years: (string | undefined)[];
    counts: CountObj[];
};

export interface GroupMenuProps {
    setSelectedGroup: Dispatch<SetStateAction<[] | Option[]>>;
};

export interface YearMenuProps {
    yearOptions: (string | undefined)[];
    setSelectedYear: Dispatch<SetStateAction<string>>;
};

export interface ProgressProps {
    value: number;
    max: number;
    selectedGroup: Option[] | [];
    selectedYear: string;
    setWbavg: Dispatch<SetStateAction<number>>;
    baseValue: number;
    characteristic: string;
    colorClass?: string;
};

export interface mappingType {
    [key: number]: string[];
}
