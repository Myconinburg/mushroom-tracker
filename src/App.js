// src/App.js
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HarvestModal from './components/HarvestModal';
import SettingsPanel from './components/SettingsPanel';
import HomepageView from './views/HomepageView';
import LabView from './views/LabView';
import IncubationView from './views/IncubationView';
import GrowRoomView from './views/GrowRoomView';
import RetirementView from './views/RetirementView';
import DashboardView from './views/DashboardView';
import ManageVarietiesView from './views/ManageVarietiesView';
import ManageSubstratesView from './views/ManageSubstratesView';
import ManageSuppliersView from './views/ManageSuppliersView';
import { formatDate } from './utils/helpers';

function App() {
  const [currentView, setCurrentView] = useState('Spawn Point');
  const [batches, setBatches] = useState(() => {
       const savedBatches = localStorage.getItem('mushroomBatches');
       try {
        const parsedBatches = savedBatches ? JSON.parse(savedBatches) : [];
        return parsedBatches.map(b => ({
             id: b?.id || Date.now() + Math.random(),
             batchLabel: b?.batchLabel || 'Unknown Label',
             variety: b?.variety || 'Unknown Variety',
             inoculationDate: formatDate(b?.inoculationDate) || null,
             numBags: parseInt(b?.numBags || 0, 10),
             unitType: b?.unitType || 'unit',
             unitWeight: parseFloat(b?.unitWeight || 0),
             substrateRecipe: b?.substrateRecipe || 'Unknown',
             spawnSupplier: b?.spawnSupplier || 'Unknown',
             contaminatedBags: parseInt(b?.contaminatedBags || 0, 10),
             harvests: Array.isArray(b?.harvests) ? b.harvests.map(h => ({ date: formatDate(h?.date) || null, weight: parseFloat(h?.weight || 0) })).filter(h => h.date) : [],
             notes: b?.notes || '',
             stage: b?.stage || 'incubation',
             colonisationCompleteDate: formatDate(b?.colonisationCompleteDate) || null,
             growRoomEntryDate: formatDate(b?.growRoomEntryDate) || null,
             retirementDate: formatDate(b?.retirementDate) || null,
             parentBatchId_lineage: b?.parentBatchId_lineage || null,
         }));
      } catch (e) {
          console.error("Error parsing saved batches from localStorage:", e);
          localStorage.removeItem('mushroomBatches');
          return [];
      }
  });

  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [harvestTargetBatch, setHarvestTargetBatch] = useState(null);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);

  useEffect(() => {
    try {
        const batchesToSave = batches.filter(b => b.id);
        localStorage.setItem('mushroomBatches', JSON.stringify(batchesToSave));
    } catch (e) {
        console.error("Error saving batches to localStorage:", e);
    }
  }, [batches]);

  const addBatch = (newBatchData) => {
    setBatches(prevBatches => {
        const parsedNumBags = parseInt(newBatchData.numBags, 10);
        const parsedUnitWeight = parseFloat(newBatchData.unitWeight);
        const batchWithDefaults = {
            ...newBatchData,
            id: Date.now(),
            numBags: isNaN(parsedNumBags) ? 0 : parsedNumBags,
            unitWeight: isNaN(parsedUnitWeight) ? 0 : parsedUnitWeight,
            inoculationDate: formatDate(newBatchData.inoculationDate) || formatDate(new Date()),
            stage: 'incubation',
            contaminatedBags: 0,
            harvests: [],
            notes: newBatchData.notes || '',
            colonisationCompleteDate: null,
            growRoomEntryDate: null,
            retirementDate: null,
            parentBatchId_lineage: null,
        };
        const newState = [ ...prevBatches, batchWithDefaults ].sort((a, b) => b.id - a.id);
        setCurrentView('Incubation');
        return newState;
    });
   };
  const updateBatch = (batchId, updatedData) => { setBatches(prevBatches => prevBatches.map(batch => batch.id === batchId ? { ...batch, ...updatedData } : batch) ); };
  const moveBatch = (batchId, newStage) => { setBatches(prevBatches => prevBatches.map(batch => { if (batch.id === batchId) { const updatedBatch = { ...batch, stage: newStage }; const todayStr = formatDate(new Date()); if (newStage === 'grow' && batch.stage !== 'grow') updatedBatch.growRoomEntryDate = todayStr; if (newStage === 'retired' && batch.stage !== 'retired') updatedBatch.retirementDate = todayStr; if (newStage === 'incubation') { updatedBatch.growRoomEntryDate = null; updatedBatch.retirementDate = null; } if (newStage === 'grow' && batch.stage === 'retired') updatedBatch.retirementDate = null; return updatedBatch; } return batch; }) ); };
  const deleteBatch = (batchId) => { const batchLabelToDelete = batches.find(b=>b.id===batchId)?.batchLabel || batchId; if (window.confirm(`Are you sure you want to permanently delete batch ${batchLabelToDelete}? This cannot be undone.`)) { setBatches(prevBatches => prevBatches.filter(batch => batch.id !== batchId)); } };

  const splitBatchForGrowRoom = (parentBatchId, splitOffData) => {
    setBatches(prevBatches => {
      const parentBatch = prevBatches.find(b => b.id === parentBatchId);
      if (!parentBatch) {
        console.error("Parent batch not found for splitting:", parentBatchId);
        alert("Error: Original batch not found. Could not complete the move.");
        return prevBatches;
      }
      const quantityToMove = parseInt(splitOffData.quantity, 10);
      if (isNaN(quantityToMove) || quantityToMove <= 0 || quantityToMove > parentBatch.numBags) {
        console.error("Invalid quantity to move:", quantityToMove);
        alert("Error: Invalid quantity specified for the move.");
        return prevBatches;
      }
      const updatedParentBatch = {
        ...parentBatch,
        numBags: parentBatch.numBags - quantityToMove,
        notes: `${parentBatch.notes || ''}\nSplit off ${quantityToMove} units on ${formatDate(new Date())}.`.trim(),
      };
      const newChildBatchId = Date.now() + 1; // Add 1 to try and ensure more uniqueness if called rapidly
      const newChildBatch = {
        ...parentBatch,
        id: newChildBatchId,
        batchLabel: `${parentBatch.batchLabel}-G${(Math.random().toString(36).substr(2, 3)).toUpperCase()}`,
        numBags: quantityToMove,
        stage: 'grow',
        colonisationCompleteDate: formatDate(splitOffData.colonisationDate),
        growRoomEntryDate: formatDate(new Date()),
        inoculationDate: parentBatch.inoculationDate,
        parentBatchId_lineage: parentBatchId,
        harvests: [],
        contaminatedBags: 0,
        notes: `Split from batch ${parentBatch.batchLabel} (ID: ${parentBatchId}). ${splitOffData.notes || ''}`.trim(),
        retirementDate: null,
      };
      const updatedBatches = prevBatches.map(b =>
        b.id === parentBatchId ? updatedParentBatch : b
      );
      updatedBatches.push(newChildBatch);
      return updatedBatches.sort((a, b) => b.id - a.id);
    });
  };

  const openHarvestModal = (batchId) => { const target = batches.find(b => b.id === batchId); if (target) { setHarvestTargetBatch({ id: target.id, label: target.batchLabel }); setIsHarvestModalOpen(true); } else { console.error("Target batch not found for harvest modal:", batchId); } };
  const closeHarvestModal = () => { setIsHarvestModalOpen(false); setHarvestTargetBatch(null); };
  const submitHarvest = (batchId, harvestWeights) => { const today = formatDate(new Date()); const newHarvestEntries = harvestWeights.map(weight => ({ date: today, weight: parseFloat(weight) })); setBatches(prevBatches => prevBatches.map(batch => { if (batch.id === batchId) { const existingHarvests = Array.isArray(batch.harvests) ? batch.harvests : []; return { ...batch, harvests: [...existingHarvests, ...newHarvestEntries] }; } return batch; }) ); closeHarvestModal(); };

  const openSettingsPanel = () => { setIsSettingsPanelOpen(true); };
  const closeSettingsPanel = () => { setIsSettingsPanelOpen(false); };

  const renderView = () => {
    try {
        switch (currentView) {
            case 'Spawn Point':
                return <HomepageView batches={batches} setCurrentView={setCurrentView} />;
            case 'Lab':
                return <LabView onAddBatch={addBatch} />;
            case 'Incubation':
                return <IncubationView batches={batches} onUpdateBatch={updateBatch} onMoveBatch={moveBatch} onDeleteBatch={deleteBatch} onSplitBatch={splitBatchForGrowRoom} />;
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
            default:
                return <DashboardView batches={batches}/>;
        }
    } catch (error) {
        console.error("Error rendering view:", currentView, error);
        return <div className="p-6 text-red-600 bg-red-100 border border-red-400 rounded-md">Error rendering view: {currentView}. Check console for details.</div>;
    }
  };

  return (
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
            isOpen={isHarvestModalOpen} // <-- THE CRUCIAL PROP
            batchId={harvestTargetBatch.id}
            batchLabel={harvestTargetBatch.label}
            onClose={closeHarvestModal}
            onSubmitHarvest={submitHarvest}
          />
       )}
       {/* Render Settings Panel conditionally */}
       <SettingsPanel isOpen={isSettingsPanelOpen} onClose={closeSettingsPanel} />
    </>
  );
}

export default App;
