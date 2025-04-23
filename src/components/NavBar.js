import React from "react";
import "./NavBar.css"; // We’ll create this next!

function NavBar({ activeSection, onSwitch }) {
  const tabs = [
    { id: "lab", label: "Lab" },
    { id: "incubation", label: "Incubation" },
    { id: "grow", label: "Grow Room" },
    { id: "retired", label: "Retirement" },
    { id: "dashboard", label: "Dashboard" },
  ];

  return (
    <div className="nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSwitch(tab.id)}
          className={activeSection === tab.id ? "active" : ""}
          id={`tab-${tab.id}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default NavBar;
