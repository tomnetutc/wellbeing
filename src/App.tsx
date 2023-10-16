import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Navbar } from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import ReactGA from "react-ga4";

ReactGA.initialize('YOUR_GOOGLE_ANALYTICS_TRACKING_ID');

function App(): JSX.Element {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

export default App;
