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
import ManageUnitTypesView from './views/ManageUnitTypesView';
import ConfirmationModal from './components/ConfirmationModal';
import { formatDate } from './utils/helpers';
import ManageColumnsModal from './components/ManageColumnsModal';
import MovePartialToGrowRoomModal from './components/MovePartialToGrowRoomModal';


const DEFAULT_COLUMN_ID = 'col-1';
const defaultColumns = [
    { id: DEFAULT_COLUMN_ID, title: 'General', color: '#A8A29E' }
];

// --- Helper function to get data from LocalStorage ---
const getFromLocalStorage = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    try {
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
        return defaultValue;
    }
};

function App() {
  const [currentView, setCurrentView] = useState('Spawn Point');

  // --- State for Column Layouts ---
  const [columnLayouts, setColumnLayouts] = useState(() => getFromLocalStorage('mushroomColumnLayouts', { 'Incubation': defaultColumns, 'Grow Room': defaultColumns }));
  useEffect(() => {
    localStorage.setItem('mushroomColumnLayouts', JSON.stringify(columnLayouts));
  }, [columnLayouts]);

  // --- State for Batches ---
  const [batches, setBatches] = useState(() => {
       const savedBatches = getFromLocalStorage('mushroomBatches', []);
        return savedBatches.map(b => ({
             ...b,
             id: b?.id || `batch-${Date.now() + Math.random()}`,
             columnId: b?.columnId || DEFAULT_COLUMN_ID,
             createdAt: b?.createdAt || new Date().toISOString(), 
             inoculationDate: formatDate(b?.inoculationDate),
             colonisationCompleteDate: formatDate(b?.colonisationCompleteDate),
             growRoomEntryDate: formatDate(b?.growRoomEntryDate),
             retirementDate: formatDate(b?.retirementDate),
             harvests: Array.isArray(b?.harvests) ? b.harvests.map(h => ({ ...h, date: formatDate(h?.date) })) : [],
         }));
  });
  useEffect(() => {
    localStorage.setItem('mushroomBatches', JSON.stringify(batches));
  }, [batches]);
  
  // --- State for Management Views ---
  const [unitTypes, setUnitTypes] = useState(() => getFromLocalStorage('mushroomUnitTypes', ['bags', 'jars', 'trays']));
  const [substrates, setSubstrates] = useState(() => getFromLocalStorage('mushroomSubstrates', ['Masters Mix', 'Coco Coir']));
  const [varieties, setVarieties] = useState(() => getFromLocalStorage('mushroomVarieties', [{name: 'Pink Oyster', abbr: 'PO'}, {name: 'Golden Oyster', abbr: 'GO'}])); 
  const [suppliers, setSuppliers] = useState(() => getFromLocalStorage('mushroomSuppliers', ['MycoSymbiotics', 'Local Supplier']));

  useEffect(() => { localStorage.setItem('mushroomUnitTypes', JSON.stringify(unitTypes)); }, [unitTypes]);
  useEffect(() => { localStorage.setItem('mushroomSubstrates', JSON.stringify(substrates)); }, [substrates]);
  useEffect(() => { localStorage.setItem('mushroomVarieties', JSON.stringify(varieties)); }, [varieties]);
  useEffect(() => { localStorage.setItem('mushroomSuppliers', JSON.stringify(suppliers)); }, [suppliers]);

  // --- State for Modals and Panels ---
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [harvestTargetBatch, setHarvestTargetBatch] = useState(null);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({ title: '', message: '', onConfirm: () => {} });
  const [isManageColumnsModalOpen, setIsManageColumnsModalOpen] = useState(false);
  const [isMovePartialModalOpen, setIsMovePartialModalOpen] = useState(false);
  const [movePartialTargetBatch, setMovePartialTargetBatch] = useState(null);

  // --- Column Management Functions ---
  const handleAddColumn = (viewName, title, color) => {
    const newColumn = { id: `col-${Date.now()}`, title, color };
    setColumnLayouts(prev => ({ ...prev, [viewName]: [...(prev[viewName] || []), newColumn] }));
  };
  const handleUpdateColumn = (viewName, columnId, updatedData) => {
    setColumnLayouts(prev => ({ ...prev, [viewName]: prev[viewName].map(col => col.id === columnId ? { ...col, ...updatedData } : col) }));
  };
  const handleDeleteColumn = (viewName, columnId) => {
    if (columnId === DEFAULT_COLUMN_ID) { alert("The default 'General' column cannot be deleted."); return; }
    const batchesInColumn = batches.filter(b => b.columnId === columnId && (b.stage === 'incubation' || b.stage === 'grow')).length;
    if (batchesInColumn > 0) { alert("Cannot delete a column that contains batches. Please move them first."); return; }
    setColumnLayouts(prev => ({ ...prev, [viewName]: prev[viewName].filter(col => col.id !== columnId) }));
  };
  const handleMoveBatchToColumn = (batchId, newColumnId) => {
    setBatches(prevBatches => prevBatches.map(b => 
      b.id === batchId ? { ...b, columnId: newColumnId } : b
    ));
  };
  
  // --- Batch Management Functions ---
  const addBatch = (newBatchData) => {
    const newBatch = {
        ...newBatchData,
        id: `batch-${Date.now()}`,
        columnId: DEFAULT_COLUMN_ID, 
        createdAt: new Date().toISOString(),
    };
    setBatches(prevBatches => [...prevBatches, newBatch]);
    // Show confirmation
    setConfirmModalProps({
        title: "Batch Created!",
        message: `Batch "${newBatch.batchLabel}" has been added to the Incubation view.`,
        onConfirm: () => { closeConfirmModal(); setCurrentView('Incubation'); },
        confirmText: 'Go to Incubation',
        cancelText: null // Hides the cancel button
    });
    setIsConfirmModalOpen(true);
  };

  const updateBatch = (batchId, updatedData) => { 
    setBatches(prevBatches => prevBatches.map(batch => batch.id === batchId ? { ...batch, ...updatedData } : batch) ); 
  };
  
  const moveBatch = (batchId, newStage) => {
      setBatches(prevBatches => prevBatches.map(batch => {
          if (batch.id === batchId) {
              const updatedBatch = { ...batch, stage: newStage };
              if (newStage === 'grow') {
                  updatedBatch.growRoomEntryDate = formatDate(new Date());
              } else if (newStage === 'retired') {
                  updatedBatch.retirementDate = formatDate(new Date());
              } else if (newStage === 'incubation') {
                  // If moving back, we might want to clear future dates
                  updatedBatch.growRoomEntryDate = null;
                  updatedBatch.retirementDate = null;
              }
              return updatedBatch;
          }
          return batch;
      }));
      closeConfirmModal();
  };

  const deleteBatch = (batchId) => {
    setBatches(prevBatches => prevBatches.filter(batch => batch.id !== batchId));
    closeConfirmModal();
  };

  const splitBatchForGrowRoom = (parentBatchId, { quantity, colonisationDate, notes }) => {
      const parentBatch = batches.find(b => b.id === parentBatchId);
      if (!parentBatch) return;

      const numToMove = parseInt(quantity, 10);

      // Create the new batch for the grow room
      const newBatch = {
          ...parentBatch,
          id: `batch-${Date.now()}`,
          parentBatchId_lineage: parentBatchId,
          batchLabel: `${parentBatch.batchLabel}-S`, // S for split
          numBags: numToMove,
          stage: 'grow',
          notes: notes || `Split from ${parentBatch.batchLabel}`,
          colonisationCompleteDate: formatDate(colonisationDate),
          growRoomEntryDate: formatDate(new Date()),
          createdAt: new Date().toISOString(),
      };

      // Update the parent batch in incubation
      updateBatch(parentBatchId, { numBags: parentBatch.numBags - numToMove });

      // Add the new batch
      setBatches(prev => [...prev, newBatch]);
      closeMovePartialModal();
  };
  
  // --- Modal Opening/Closing Functions ---
  const openHarvestModal = (batchId) => { 
    const target = batches.find(b => b.id === batchId);
    if(target) {
        setHarvestTargetBatch(target);
        setIsHarvestModalOpen(true); 
    }
  };
  const closeHarvestModal = () => setIsHarvestModalOpen(false);

  const submitHarvest = (batchId, harvestEntries) => {
    const newHarvests = harvestEntries.map(weight => ({
        date: formatDate(new Date()),
        weight: parseFloat(weight)
    }));

    setBatches(prevBatches => prevBatches.map(batch => {
        if (batch.id === batchId) {
            return {
                ...batch,
                harvests: [...(batch.harvests || []), ...newHarvests]
            };
        }
        return batch;
    }));
    closeHarvestModal();
  };

  const openMovePartialModal = (batch) => {
      setMovePartialTargetBatch(batch);
      setIsMovePartialModalOpen(true);
  };
  const closeMovePartialModal = () => {
      setIsMovePartialModalOpen(false);
      setMovePartialTargetBatch(null);
  };

  const closeConfirmModal = () => setIsConfirmModalOpen(false);
  
  const openDeleteConfirmModal = (batchId, batchLabel) => {
    setConfirmModalProps({
        title: 'Confirm Deletion',
        message: `Are you sure you want to permanently delete batch "${batchLabel}"? This action cannot be undone.`,
        onConfirm: () => deleteBatch(batchId),
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmButtonClassName: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
    });
    setIsConfirmModalOpen(true);
  };
  
  const openMoveConfirmationModal = (batchId, newStage, batchLabel, currentStage) => {
      const messages = {
          grow: `Are you sure you want to move batch "${batchLabel}" from Incubation to the Grow Room?`,
          retired: `Are you sure you want to retire batch "${batchLabel}"?`,
          incubation: `Are you sure you want to move batch "${batchLabel}" from the Grow Room back to Incubation?`,
      };

      setConfirmModalProps({
          title: `Move Batch to ${newStage.charAt(0).toUpperCase() + newStage.slice(1)}`,
          message: messages[newStage] || `Confirm move to ${newStage}`,
          onConfirm: () => moveBatch(batchId, newStage),
          confirmText: 'Confirm Move',
          cancelText: 'Cancel'
      });
      setIsConfirmModalOpen(true);
  };

  // --- Management View Functions ---
  const handleAddUnitType = (name) => { setUnitTypes(prev => [...prev, name]); };
  const handleDeleteUnitType = (name) => { setUnitTypes(prev => prev.filter(item => item !== name)); };
  const handleAddSubstrate = (name) => { setSubstrates(prev => [...prev, name]); };
  const handleDeleteSubstrate = (name) => { setSubstrates(prev => prev.filter(item => item !== name)); };
  const handleAddVariety = (name, abbr) => { setVarieties(prev => [...prev, { name, abbr }]); };
  const handleDeleteVariety = (varietyToDelete) => { setVarieties(prev => prev.filter(v => v.name !== varietyToDelete.name)); };
  const handleAddSupplier = (name) => { setSuppliers(prev => [...prev, name]); };
  const handleDeleteSupplier = (name) => { setSuppliers(prev => prev.filter(item => item !== name)); };

  const openSettingsPanel = () => setIsSettingsPanelOpen(true);
  const closeSettingsPanel = () => setIsSettingsPanelOpen(false);


  // --- Render Logic ---
  const renderView = () => {
    try {
      switch (currentView) {
        case 'Incubation': return <IncubationView 
                                    batches={batches} 
                                    onUpdateBatch={updateBatch} 
                                    onOpenMoveConfirmModal={openMoveConfirmationModal} 
                                    onDeleteBatch={openDeleteConfirmModal} 
                                    onSplitBatch={splitBatchForGrowRoom}
                                    columns={columnLayouts['Incubation']}
                                    onOpenManageColumns={() => setIsManageColumnsModalOpen(true)}
                                    onMoveBatchToColumn={handleMoveBatchToColumn}
                                    onOpenMovePartialModal={openMovePartialModal}
                                  />;
        case 'Spawn Point': return <HomepageView batches={batches} setCurrentView={setCurrentView} />;
        case 'Lab': return <LabView onAddBatch={addBatch} availableUnitTypes={unitTypes} availableVarieties={varieties} availableSubstrates={substrates} availableSuppliers={suppliers} />;
        case 'Grow Room': return <GrowRoomView batches={batches} onUpdateBatch={updateBatch} onOpenMoveConfirmModal={openMoveConfirmationModal} onOpenHarvestModal={openHarvestModal} columns={columnLayouts['Grow Room']} onMoveBatchToColumn={handleMoveBatchToColumn} onOpenManageColumns={() => setIsManageColumnsModalOpen(true)}/>;
        case 'Retirement': return <RetirementView batches={batches} onOpenMoveConfirmModal={openMoveConfirmationModal} />;
        case 'ManageVarieties': return <ManageVarietiesView availableVarieties={varieties} onAddVariety={handleAddVariety} onDeleteVariety={handleDeleteVariety} />;
        case 'ManageSubstrates': return <ManageSubstratesView availableSubstrates={substrates} onAddSubstrate={handleAddSubstrate} onDeleteSubstrate={handleDeleteSubstrate} />;
        case 'ManageSuppliers': return <ManageSuppliersView availableSuppliers={suppliers} onAddSupplier={handleAddSupplier} onDeleteSupplier={handleDeleteSupplier} />;
        case 'ManageUnitTypes': return <ManageUnitTypesView availableUnitTypes={unitTypes} onAddUnitType={handleAddUnitType} onDeleteUnitType={handleDeleteUnitType} />;
        case 'Dashboard': default: return <DashboardView batches={batches} />;
      }
    } catch (error) { console.error("Error rendering view:", currentView, error); return (<div className="p-6 text-red-500 bg-red-100 border border-red-400 rounded-md">Error rendering view: {currentView}. Check console for details.</div>); }
  };

  return (
    <>
      <Navbar currentView={currentView} setCurrentView={setCurrentView} openSettingsPanel={openSettingsPanel} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderView()}
      </main>
      <ManageColumnsModal isOpen={isManageColumnsModalOpen} onClose={() => setIsManageColumnsModalOpen(false)} columns={columnLayouts[currentView]} onAddColumn={handleAddColumn} onUpdateColumn={handleUpdateColumn} onDeleteColumn={handleDeleteColumn} viewName={currentView} />
      {isHarvestModalOpen && harvestTargetBatch && <HarvestModal isOpen={isHarvestModalOpen} batchId={harvestTargetBatch.id} batchLabel={harvestTargetBatch.batchLabel} onClose={closeHarvestModal} onSubmitHarvest={submitHarvest} />}
      <SettingsPanel isOpen={isSettingsPanelOpen} onClose={closeSettingsPanel} />
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeConfirmModal} title={confirmModalProps.title} message={confirmModalProps.message} onConfirm={confirmModalProps.onConfirm} confirmText={confirmModalProps.confirmText} cancelText={confirmModalProps.cancelText} confirmButtonClassName={confirmModalProps.confirmButtonClassName} />
      {movePartialTargetBatch && <MovePartialToGrowRoomModal isOpen={isMovePartialModalOpen} onClose={closeMovePartialModal} parentBatch={movePartialTargetBatch} onSubmit={splitBatchForGrowRoom} />}
    </>
  );
}

export default App;
