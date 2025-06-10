// src/App.js

// --- MERGED: Imports from both Tobys-Branch and main ---
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HarvestModal from './components/HarvestModal';
import SettingsPanel from './components/SettingsPanel';
import LoginComponent from './components/LoginComponent.jsx';
import HomepageView from './views/HomepageView.jsx';
import LabView from './views/LabView.jsx';
import IncubationView from './views/IncubationView.jsx';
import GrowRoomView from './views/GrowRoomView.jsx';
import RetirementView from './views/RetirementView.jsx';
import DashboardView from './views/DashboardView.jsx';
import ManageVarietiesView from './views/ManageVarietiesView.jsx';
import ManageSubstratesView from './views/ManageSubstratesView.jsx';
import ManageSuppliersView from './views/ManageSuppliersView.jsx';
// New imports from Tobys-Branch
import ManageUnitTypesView from './views/ManageUnitTypesView';
import ConfirmationModal from './components/ConfirmationModal';
import ManageColumnsModal from './components/ManageColumnsModal';
import MovePartialToGrowRoomModal from './components/MovePartialToGrowRoomModal';
import {
  fetchBatches,
  createBatch,
  updateExistingBatch,
  deleteExistingBatch,
  fetchVarieties,
  // NOTE: You will need to create API functions for these new types
  // fetchSubstrates, createSubstrate, deleteSubstrate etc.
} from './api';

// --- KEPT: Logic from Tobys-Branch for UI, but data should come from API ---
const getFromLocalStorage = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    try {
        return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
        return defaultValue;
    }
};

const DEFAULT_COLUMN_ID = 'col-1';
const defaultColumns = [
    { id: DEFAULT_COLUMN_ID, title: 'General', color: '#A8A29E' }
];

function App() {
  const [currentView, setCurrentView] = useState('Spawn Point');

  // --- MERGED: State management ---
  // Kept data state from 'main' (API-driven)
  const [batches, setBatches] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Kept and adapted management state from 'Tobys-Branch'.
  // NOTE: These should also be fetched from the API, not localStorage.
  const [unitTypes, setUnitTypes] = useState(['bags', 'jars', 'trays']);
  const [substrates, setSubstrates] = useState(['Masters Mix', 'Coco Coir']);
  const [suppliers, setSuppliers] = useState(['MycoSymbiotics', 'Local Supplier']);

  // Kept UI state from 'Tobys-Branch'
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [harvestTargetBatch, setHarvestTargetBatch] = useState(null);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({ title: '', message: '', onConfirm: () => {} });
  const [isManageColumnsModalOpen, setIsManageColumnsModalOpen] = useState(false);
  const [isMovePartialModalOpen, setIsMovePartialModalOpen] = useState(false);
  const [movePartialTargetBatch, setMovePartialTargetBatch] = useState(null);
  const [columnLayouts, setColumnLayouts] = useState(() => getFromLocalStorage('mushroomColumnLayouts', { 'Incubation': defaultColumns, 'Grow Room': defaultColumns }));

  // --- KEPT: Data loading logic from 'main' ---
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      const loadData = async () => {
        try {
          const fetchedBatches = await fetchBatches();
          setBatches(fetchedBatches.map(b => ({ ...b, columnId: b.columnId || DEFAULT_COLUMN_ID })));
          
          const fetchedVarieties = await fetchVarieties();
          setVarieties(fetchedVarieties);
          // TODO: Fetch substrates, suppliers, unit types from API here as well
        } catch (error) {
          console.error("Error loading data:", error);
          if (error.status === 401) {
            setIsAuthenticated(false);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      };
      loadData();
    } else {
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]);

  // Persist column layouts to local storage (UI preference)
  useEffect(() => {
    localStorage.setItem('mushroomColumnLayouts', JSON.stringify(columnLayouts));
  }, [columnLayouts]);

  // --- MERGED: Batch Management Functions ---
  // Using 'main's async/API logic but adding 'Tobys-Branch's UI feedback.
  const addBatch = async (newBatchData) => {
    try {
      const createdBatch = await createBatch({
          ...newBatchData,
          columnId: DEFAULT_COLUMN_ID
      });
      setBatches(prev => [createdBatch, ...prev].sort((a,b) => b.id - a.id));
      setConfirmModalProps({
          title: "Batch Created!",
          message: `Batch "${createdBatch.batchLabel}" has been added.`,
          onConfirm: () => { closeConfirmModal(); setCurrentView('Incubation'); },
          confirmText: 'Go to Incubation',
          cancelText: null
      });
      setIsConfirmModalOpen(true);
    } catch (error) {
      console.error("Error creating batch:", error);
      alert("Failed to create batch: " + error.message);
    }
  };

  const updateBatch = async (batchId, updatedData) => {
    try {
      const updatedBatch = await updateExistingBatch(batchId, updatedData);
      setBatches(prev => prev.map(b => (b.id === batchId ? updatedBatch : b)));
    } catch (error) {
      console.error("Error updating batch:", error);
      alert("Failed to update batch: " + error.message);
    }
  };
  
  const moveBatch = (batchId, newStage) => {
    const batchToMove = batches.find(b => b.id === batchId);
    if (!batchToMove) return;
    // We only need to send the 'stage'. The backend will handle setting the dates.
    updateBatch(batchId, { stage: newStage });
    closeConfirmModal();
  };

  const deleteBatch = async (batchId) => {
    try {
        await deleteExistingBatch(batchId);
        setBatches(prev => prev.filter(b => b.id !== batchId));
        closeConfirmModal();
    } catch (error) {
        console.error("Error deleting batch:", error);
        alert("Failed to delete batch: " + error.message);
    }
  };

  // --- MERGED: Combining harvest logic ---
  const submitHarvest = (batchId, harvestEntries) => {
    const batchToUpdate = batches.find(b => b.id === batchId);
    if (!batchToUpdate) return;
    // Backend expects array of weights, not full harvest objects for a new submission
    const newHarvestWeights = harvestEntries.map(h => h.weight); 
    // The API should be designed to handle this payload
    updateBatch(batchId, { new_harvests: newHarvestWeights });
    closeHarvestModal();
  };
  
  // --- KEPT: New UI features from 'Tobys-Branch' ---
  // These functions are kept, but some may need to be adapted to call the API
  const handleAddColumn = (viewName, title, color) => {
    const newColumn = { id: `col-${Date.now()}`, title, color };
    setColumnLayouts(prev => ({ ...prev, [viewName]: [...(prev[viewName] || []), newColumn] }));
  };
  const handleUpdateColumn = (viewName, columnId, updatedData) => {
    setColumnLayouts(prev => ({ ...prev, [viewName]: prev[viewName].map(col => col.id === columnId ? { ...col, ...updatedData } : col) }));
  };
  const handleDeleteColumn = (viewName, columnId) => {
    if (columnId === DEFAULT_COLUMN_ID) { alert("The default column cannot be deleted."); return; }
    const batchesInColumn = batches.filter(b => b.columnId === columnId).length;
    if (batchesInColumn > 0) { alert("Cannot delete a column that contains batches."); return; }
    setColumnLayouts(prev => ({ ...prev, [viewName]: prev[viewName].filter(col => col.id !== columnId) }));
  };
  const handleMoveBatchToColumn = (batchId, newColumnId) => {
    updateBatch(batchId, { column_id: newColumnId }); // Assuming backend supports this
  };

  // Modal handlers
  const openHarvestModal = (batchId) => {
    const target = batches.find(b => b.id === batchId);
    if(target) {
        setHarvestTargetBatch(target);
        setIsHarvestModalOpen(true); 
    }
  };
  const closeHarvestModal = () => setIsHarvestModalOpen(false);
  const closeConfirmModal = () => setIsConfirmModalOpen(false);
  
  const openDeleteConfirmModal = (batchId, batchLabel) => {
    setConfirmModalProps({
        title: 'Confirm Deletion',
        message: `Are you sure you want to permanently delete batch "${batchLabel}"?`,
        onConfirm: () => deleteBatch(batchId),
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmButtonClassName: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
    });
    setIsConfirmModalOpen(true);
  };
   const openMoveConfirmationModal = (batchId, newStage, batchLabel) => {
     setConfirmModalProps({
         title: `Move Batch`,
         message: `Are you sure you want to move batch "${batchLabel}" to ${newStage}?`,
         onConfirm: () => moveBatch(batchId, newStage),
         confirmText: 'Confirm Move',
     });
     setIsConfirmModalOpen(true);
   };

  // --- TODO: All "Management" functions below need to be converted to use API calls ---
  const handleAddUnitType = (name) => { setUnitTypes(prev => [...prev, name]); };
  const handleDeleteUnitType = (name) => { setUnitTypes(prev => prev.filter(item => item !== name)); };
  const handleAddSubstrate = (name) => { setSubstrates(prev => [...prev, name]); };
  const handleDeleteSubstrate = (name) => { setSubstrates(prev => prev.filter(item => item !== name)); };
  const handleAddVariety = (name, abbr) => { /* TODO: Call createVariety API */ };
  const handleDeleteVariety = (varietyToDelete) => { /* TODO: Call deleteVariety API */ };
  const handleAddSupplier = (name) => { setSuppliers(prev => [...prev, name]); };
  const handleDeleteSupplier = (name) => { setSuppliers(prev => prev.filter(item => item !== name)); };

  const openSettingsPanel = () => setIsSettingsPanelOpen(true);
  const closeSettingsPanel = () => setIsSettingsPanelOpen(false);

  // --- MERGED: renderView function ---
  const renderView = () => {
    // Kept authentication check from 'main'
    if (!isAuthenticated) {
      return <LoginComponent onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    try {
      // Using 'Tobys-Branch's structure as it's more up-to-date with views
      switch (currentView) {
        case 'Incubation': return <IncubationView batches={batches} onUpdateBatch={updateBatch} onOpenMoveConfirmModal={openMoveConfirmationModal} onDeleteBatch={openDeleteConfirmModal} columns={columnLayouts['Incubation']} onMoveBatchToColumn={handleMoveBatchToColumn} onOpenManageColumns={() => setIsManageColumnsModalOpen(true)} />;
        case 'Spawn Point': return <HomepageView batches={batches} setCurrentView={setCurrentView} />;
        case 'Lab': return <LabView onAddBatch={addBatch} availableUnitTypes={unitTypes} availableVarieties={varieties} availableSubstrates={substrates} availableSuppliers={suppliers} />;
        case 'Grow Room': return <GrowRoomView batches={batches} onUpdateBatch={updateBatch} onOpenMoveConfirmModal={openMoveConfirmationModal} onOpenHarvestModal={openHarvestModal} columns={columnLayouts['Grow Room']} onMoveBatchToColumn={handleMoveBatchToColumn} onOpenManageColumns={() => setIsManageColumnsModalOpen(true)} />;
        case 'Retirement': return <RetirementView batches={batches} onOpenMoveConfirmModal={openMoveConfirmationModal} />;
        case 'ManageVarieties': return <ManageVarietiesView availableVarieties={varieties} onAddVariety={handleAddVariety} onDeleteVariety={handleDeleteVariety} />;
        case 'ManageSubstrates': return <ManageSubstratesView availableSubstrates={substrates} onAddSubstrate={handleAddSubstrate} onDeleteSubstrate={handleDeleteSubstrate} />;
        case 'ManageSuppliers': return <ManageSuppliersView availableSuppliers={suppliers} onAddSupplier={handleAddSupplier} onDeleteSupplier={handleDeleteSupplier} />;
        case 'ManageUnitTypes': return <ManageUnitTypesView availableUnitTypes={unitTypes} onAddUnitType={handleAddUnitType} onDeleteUnitType={handleDeleteUnitType} />;
        case 'Dashboard': default: return <DashboardView batches={batches} />;
      }
    } catch (error) {
        console.error("Error rendering view:", currentView, error);
        return (<div className="p-6 text-red-500 bg-red-100 border border-red-400 rounded-md">Error rendering view.</div>);
    }
  };

  // --- MERGED: Final JSX return ---
  return (
    <>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openSettingsPanel={openSettingsPanel}
        isAuthenticated={isAuthenticated}
        onLogout={() => {
          setIsAuthenticated(false);
          localStorage.clear();
        }}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderView()}
      </main>
      
      {/* Kept all new modals from 'Tobys-Branch' */}
      <ManageColumnsModal isOpen={isManageColumnsModalOpen} onClose={() => setIsManageColumnsModalOpen(false)} columns={columnLayouts[currentView]} onAddColumn={handleAddColumn} onUpdateColumn={handleUpdateColumn} onDeleteColumn={handleDeleteColumn} viewName={currentView} />
      
      {isHarvestModalOpen && harvestTargetBatch && <HarvestModal isOpen={isHarvestModalOpen} batchId={harvestTargetBatch.id} batchLabel={harvestTargetBatch.batchLabel} onClose={closeHarvestModal} onSubmitHarvest={submitHarvest} />}
      
      <SettingsPanel isOpen={isSettingsPanelOpen} onClose={closeSettingsPanel} />
      
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeConfirmModal} {...confirmModalProps} />

      {/* Note: The 'split batch' logic needs to be implemented in the backend API */}
      {movePartialTargetBatch && <MovePartialToGrowRoomModal isOpen={isMovePartialModalOpen} onClose={() => setIsMovePartialModalOpen(false)} parentBatch={movePartialTargetBatch} onSubmit={() => {}} />}
    </>
  );
}

export default App;