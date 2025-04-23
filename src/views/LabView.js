import React, { useState, useEffect } from "react";
import { createBatch } from "../models/batchModel";
import "./LabView.css";

function LabView() {
  const [form, setForm] = useState({
    variety: "Blue Oyster",
    unitType: "bag",
    numUnits: 0,
    substrateRecipe: "",
    spawnSupplier: "",
    inoculationDate: "",
    notes: "",
  });

  useEffect(() => {
    // Set today's date on first load
    setForm((prev) => ({
      ...prev,
      inoculationDate: new Date().toISOString().split("T")[0],
    }));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const batch = createBatch(form);
    batch.batchLabel = generateBatchLabel(batch.variety, batch.inoculationDate);

    const batches = JSON.parse(localStorage.getItem("batches") || "[]");
    batches.push(batch);
    localStorage.setItem("batches", JSON.stringify(batches));

    alert("✅ New batch created!");
    // Optional: redirect to incubation view or clear form
  }

  function generateBatchLabel(variety, date) {
    const abbrev = varietyAbbr[variety] || "??";
    const d = new Date(date);
    return `${abbrev}${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
  }

  const varietyAbbr = {
    "Blue Oyster": "BO",
    "White Oyster": "WO",
    "Grey Oyster": "GO",
    "Yellow Oyster": "YO",
    "Black Pearl": "BP",
    "King Oyster": "KO",
    "Lions Mane": "LM",
    "Shiitake": "SH",
    "Piopinno": "PP",
    "Maitake": "MT",
    "Reishi": "RE",
    "Turkey Tail": "TT",
  };

  return (
    <div className="form-container" style={{ maxWidth: 500, margin: "0 auto", padding: 24 }}>
      <h2>🧪 New Batch</h2>
      <form onSubmit={handleSubmit}>
        <label>Variety</label>
        <select name="variety" value={form.variety} onChange={handleChange}>
          {Object.keys(varietyAbbr).map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <label>Inoculation Date</label>
        <input type="date" name="inoculationDate" value={form.inoculationDate} onChange={handleChange} />

        <label>Number of Units (Bags, Buckets, etc)</label>
        <input type="number" name="numUnits" value={form.numUnits} onChange={handleChange} />

        <label>Substrate Recipe</label>
        <input type="text" name="substrateRecipe" value={form.substrateRecipe} onChange={handleChange} />

        <label>Spawn Supplier</label>
        <input type="text" name="spawnSupplier" value={form.spawnSupplier} onChange={handleChange} />

        <label>Notes (optional)</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} />

        <button className="button" style={{ marginTop: 24 }} type="submit">Create Batch</button>
      </form>
    </div>
  );
}

export default LabView;
