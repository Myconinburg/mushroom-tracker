// src/App.js
import React, { useState, useEffect } from 'react';

// Import Components (assuming they are in ./components/)
import Navbar from './components/Navbar';
import HarvestModal from './components/HarvestModal';
import SettingsPanel from './components/SettingsPanel';
// BatchCard is imported within views that use it, not directly needed in App usually

// Import Views (assuming they are in ./views/)
import HomepageView from './views/HomepageView';
import LabView from './views/LabView';
import IncubationView from './views/IncubationView';
import GrowRoomView from './views/GrowRoomView';
import RetirementView from './views/RetirementView';
import DashboardView from './views/DashboardView';
import ManageVarietiesView from './views/ManageVarietiesView';
import ManageSubstratesView from './views/ManageSubstratesView';
import ManageSuppliersView from './views/ManageSuppliersView';

// Import Helper Functions (assuming they are in ./utils/)
import { formatDate } from './utils/helpers';

// Main Application Component
function App() {
  // State for the current view displayed (internal key like 'Spawn Point')
  const [currentView, setCurrentView] = useState('Spawn Point');

  // State for the list of all batches, loaded from localStorage or initialized empty
  const [batches, setBatches] = useState(() => {
       const savedBatches = localStorage.getItem('mushroomBatches');
       try {
        const parsedBatches = savedBatches ? JSON.parse(savedBatches) : [];
        console.log("Loaded batches from localStorage:", parsedBatches);
        // Map over parsed data, ensuring data integrity and providing defaults
        return parsedBatches.map(b => ({
             id: b?.id || Date.now() + Math.random(), // Ensure ID exists
             batchLabel: b?.batchLabel || 'Unknown Label',
             variety: b?.variety || 'Unknown Variety',
             inoculationDate: formatDate(b?.inoculationDate) || null,
             numBags: b?.numBags || 0,
             unitType: b?.unitType || 'unit',
             unitWeight: b?.unitWeight || 0,
             substrateRecipe: b?.substrateRecipe || 'Unknown',
             spawnSupplier: b?.spawnSupplier || 'Unknown',
             contaminatedBags: b?.contaminatedBags || 0,
             harvests: Array.isArray(b?.harvests) ? b.harvests.map(h => ({ date: formatDate(h?.date) || null, weight: h?.weight || 0 })).filter(h => h.date) : [], // Filter out invalid harvest dates
             notes: b?.notes || '',
             stage: b?.stage || 'incubation',
             colonisationCompleteDate: formatDate(b?.colonisationCompleteDate) || null,
             growRoomEntryDate: formatDate(b?.growRoomEntryDate) || null,
             retirementDate: formatDate(b?.retirementDate) || null,
         }));
      } catch (e) {
          console.error("Error parsing saved batches from localStorage:", e);
          localStorage.removeItem('mushroomBatches'); // Clear corrupted data if parsing fails
          return []; // Return empty array if parsing fails
      }
  });

  // State for controlling the Harvest Modal visibility
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  // State to store the ID and label of the batch targeted by the Harvest Modal
  const [harvestTargetBatch, setHarvestTargetBatch] = useState(null);
  // State for controlling the Settings Panel visibility
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);

  // Effect to save the 'batches' state to localStorage whenever it changes
  useEffect(() => {
    try {
        // Filter out any potentially problematic temporary states before saving
        const batchesToSave = batches.filter(b => b.id); // Basic check
        localStorage.setItem('mushroomBatches', JSON.stringify(batchesToSave));
        // console.log("Batches saved to localStorage."); // Optional: uncomment for debugging saves
    } catch (e) {
        console.error("Error saving batches to localStorage:", e);
    }
  }, [batches]); // Dependency array ensures this runs only when 'batches' changes

  // --- Batch Management Functions ---
  const addBatch = (newBatchData) => {
    setBatches(prevBatches => {
        const newState = [
            ...prevBatches,
            { ...newBatchData, id: Date.now() } // Assign a unique ID based on timestamp
        ].sort((a, b) => b.id - a.id); // Sort newest first
        // Use functional update to ensure navigation happens after state is set
        setCurrentView('Incubation'); // Navigate immediately after setting state
        return newState;
    });
   };
  const updateBatch = (batchId, updatedData) => { setBatches(prevBatches => prevBatches.map(batch => batch.id === batchId ? { ...batch, ...updatedData } : batch) ); };
  const moveBatch = (batchId, newStage) => { setBatches(prevBatches => prevBatches.map(batch => { if (batch.id === batchId) { const updatedBatch = { ...batch, stage: newStage }; const todayStr = formatDate(new Date()); if (newStage === 'grow' && batch.stage !== 'grow') updatedBatch.growRoomEntryDate = todayStr; if (newStage === 'retired' && batch.stage !== 'retired') updatedBatch.retirementDate = todayStr; if (newStage === 'incubation') { updatedBatch.growRoomEntryDate = null; updatedBatch.retirementDate = null; } if (newStage === 'grow' && batch.stage === 'retired') updatedBatch.retirementDate = null; return updatedBatch; } return batch; }) ); };
  const deleteBatch = (batchId) => { const batchLabelToDelete = batches.find(b=>b.id===batchId)?.batchLabel || batchId; if (window.confirm(`Are you sure you want to permanently delete batch ${batchLabelToDelete}? This cannot be undone.`)) { setBatches(prevBatches => prevBatches.filter(batch => batch.id !== batchId)); } };

  // --- Harvest Modal Functions ---
  const openHarvestModal = (batchId) => { const target = batches.find(b => b.id === batchId); if (target) { setHarvestTargetBatch({ id: target.id, label: target.batchLabel }); setIsHarvestModalOpen(true); } else { console.error("Target batch not found for harvest modal:", batchId); } };
  const closeHarvestModal = () => { setIsHarvestModalOpen(false); setHarvestTargetBatch(null); };
  const submitHarvest = (batchId, harvestWeights) => { const today = formatDate(new Date()); const newHarvestEntries = harvestWeights.map(weight => ({ date: today, weight: parseFloat(weight) })); setBatches(prevBatches => prevBatches.map(batch => { if (batch.id === batchId) { const existingHarvests = Array.isArray(batch.harvests) ? batch.harvests : []; return { ...batch, harvests: [...existingHarvests, ...newHarvestEntries] }; } return batch; }) ); closeHarvestModal(); };

  // --- Settings Panel Functions ---
  const openSettingsPanel = () => { setIsSettingsPanelOpen(true); };
  const closeSettingsPanel = () => { setIsSettingsPanelOpen(false); };


  // --- View Rendering Logic ---
  const renderView = () => {
    try {
        switch (currentView) {
            case 'Spawn Point': // Internal name for the state
                return <HomepageView batches={batches} setCurrentView={setCurrentView} />;
            case 'Lab':
                return <LabView onAddBatch={addBatch} />;
            case 'Incubation':
                return <IncubationView batches={batches} onUpdateBatch={updateBatch} onMoveBatch={moveBatch} onDeleteBatch={deleteBatch} />;
            case 'Grow Room':
                return <GrowRoomView batches={batches} onUpdateBatch={updateBatch} onMoveBatch={moveBatch} onOpenHarvestModal={openHarvestModal} />;
            case 'Retirement':
                return <RetirementView batches={batches} onMoveBatch={moveBatch} />;
            case 'ManageVarieties':
                return <ManageVarietiesView />;
            case 'ManageSubstrates':
                return <ManageSubstratesView />;
            case 'ManageSuppliers':
                return <ManageSuppliersView />;
            case 'Dashboard':
            default: // Default to Dashboard if view name is unknown
                return <DashboardView batches={batches}/>;
        }
    } catch (error) {
        console.error("Error rendering view:", currentView, error);
        // Display a user-friendly error message within the UI
        return <div className="p-6 text-red-600 bg-red-100 border border-red-400 rounded-md">Error rendering view: {currentView}. Check console for details.</div>;
    }
  };

  // Main App JSX Structure
  return (
    // Use a React Fragment <>...</> if you don't need an extra div
    <>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openSettingsPanel={openSettingsPanel}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderView()}
      </main>
      {/* Render Harvest Modal conditionally */}
      {isHarvestModalOpen && harvestTargetBatch && (
          <HarvestModal
            batchId={harvestTargetBatch.id}
            batchLabel={harvestTargetBatch.label}
            onClose={closeHarvestModal}
            onSubmitHarvest={submitHarvest}
          />
       )}
       {/* Render Settings Panel conditionally */}
       <SettingsPanel isOpen={isSettingsPanelOpen} onClose={closeSettingsPanel} />
    </>
    // Removed the outer div as min-h-screen/bg-gray-100 might be better on body/html via index.css
  );
}

// Export App as default (Essential for VS Code build process)
export default App;
