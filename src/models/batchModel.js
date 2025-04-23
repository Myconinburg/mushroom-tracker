// batchModel.js

export function createBatch({
    variety,
    unitType = "bag",
    numUnits,
    blockWeight = 2.5,
    substrateRecipe = "",
    spawnSupplier = "",
    inoculationDate = new Date().toISOString().split("T")[0],
    notes = ""
  }) {
    return {
      id: Date.now(),
      batchLabel: "", // You can set this from outside or generate here
      variety,
      unitType,
      numUnits,
      blockWeight,
      contaminatedUnits: 0,
  
      substrateRecipe,
      spawnSupplier,
  
      inoculationDate,
      growRoomEntryDate: null,
      retirementDate: null,
  
      harvests: [],
      notes,
      stage: "lab"
    };
  }
  