import Footer from "../components/Home/Footer";
import Header from "../components/Home/Header";
import HeatMap from "../components/Home/HeatMap";
import { TimePoverty } from "../components/Home/TimePoverty";
import TpHeatMap from "../components/Home/TpHeatMap";
import Wellbeing from "../components/Home/Wellbeing";
import { ZeroTrip } from "../components/Home/ZeroTrip";
import ZTHeatMap from "../components/Home/ZTHeatMap";
import { hideFlagCounter, tracking } from "../utils/Helpers";
import { useEffect } from "react";

export function Home(): JSX.Element {
  useEffect(() => {
    hideFlagCounter();
    tracking();
  });
  return (
    <div>
      <Header />
      <Wellbeing />
      <HeatMap />
      <TimePoverty />
      <TpHeatMap />
      <ZeroTrip />
      <ZTHeatMap />
      <Footer />
    </div>
  );
}
