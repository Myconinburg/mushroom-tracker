import React from "react";
import NavBar from "./components/NavBar";
import LabView from "./views/LabView";

function App() {
  const [section, setSection] = React.useState("lab");

  return (
    <>
      <NavBar activeSection={section} onSwitch={setSection} />
      <div className="section-container">
      {section === "lab" && <LabView />}
      </div>
    </>
  );
}

export default App;

