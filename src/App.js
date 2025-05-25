// src/App.js
import React, { useState, useEffect } from 'react';

// Import Components (assuming they are in ./components/)
import Navbar from './components/Navbar';
import HarvestModal from './components/HarvestModal';
import SettingsPanel from './components/SettingsPanel';
import LoginComponent from './components/LoginComponent.jsx'; // Updated import for .jsx extension

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

// Import API Service - PATH UPDATED
import {
  fetchBatches,
  createBatch,
  updateExistingBatch,
  deleteExistingBatch,
  fetchVarieties,
  // loginUser // loginUser is now used directly by LoginComponent, no need to import here
} from './api'; // Path updated: changed from './services/api' to './api'

// Main Application Component
function App() {
  // State for the current view displayed (internal key like 'Spawn Point')
  const [currentView, setCurrentView] = useState('Spawn Point');

  // State for the list of all batches, loaded from localStorage or initialized empty
  const [batches, setBatches] = useState([]); // Initialize as empty, data will come from API
  const [varieties, setVarieties] = useState([]); // State for varieties
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [harvestTargetBatch, setHarvestTargetBatch] = useState(null);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state for authentication

  // --- Authentication Logic (basic example) ---
  useEffect(() => {
    // Check if a token exists on component mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      // Optionally, validate the token with the backend if needed
    }
  }, []);

  // Effect to load batches and varieties from API
  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          const fetchedBatches = await fetchBatches();
          setBatches(fetchedBatches);
          console.log("Loaded batches from API:", fetchedBatches);

          const fetchedVarieties = await fetchVarieties();
          setVarieties(fetchedVarieties);
          console.log("Loaded varieties from API:", fetchedVarieties);

        } catch (error) {
          console.error("Error loading data:", error);
          // Handle token expiry or other API errors (e.g., redirect to login)
          if (error.message === 'Authentication token not found.' || error.message.includes('Unauthorized')) {
            setIsAuthenticated(false);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // alert('Your session has expired. Please log in again.'); // Use a modal or in-app message instead of alert
            console.log('Your session has expired. Please log in again.');
            // You would typically redirect to a login page here or show a login modal
          }
        }
      };
      loadData();
    }
  }, [isAuthenticated]); // Reload data when authentication status changes


  // --- API Integrated Batch Management Functions ---
  const addBatch = async (newBatchData) => {
    try {
      const createdBatch = await createBatch(newBatchData);
      setBatches(prevBatches => [createdBatch, ...prevBatches].sort((a, b) => b.id - a.id));
      setCurrentView('Incubation');
    } catch (error) {
      console.error("Error creating batch:", error);
      // alert("Failed to create batch: " + error.message); // Use a modal or in-app message instead of alert
      console.log("Failed to create batch: " + error.message);
    }
  };

  const updateBatch = async (batchId, updatedData) => {
    try {
      const updatedBatch = await updateExistingBatch(batchId, updatedData);
      setBatches(prevBatches =>
        prevBatches.map(batch => (batch.id === batchId ? updatedBatch : batch))
      );
    } catch (error) {
      console.error("Error updating batch:", error);
      // alert("Failed to update batch: " + error.message); // Use a modal or in-app message instead of alert
      console.log("Failed to update batch: " + error.message);
    }
  };

  const moveBatch = async (batchId, newStage) => {
    const batchToMove = batches.find(b => b.id === batchId);
    if (!batchToMove) return;

    const updatedData = { ...batchToMove, stage: newStage };
    // Add date logic for growRoomEntryDate and retirementDate as per your original logic
    if (newStage === 'grow' && batchToMove.stage !== 'grow') updatedData.growRoomEntryDate = new Date().toISOString().split('T')[0];
    if (newStage === 'retired' && batchToMove.stage !== 'retired') updatedData.retirementDate = new Date().toISOString().split('T')[0];
    if (newStage === 'incubation') { updatedData.growRoomEntryDate = null; updatedData.retirementDate = null; }
    if (newStage === 'grow' && batchToMove.stage === 'retired') updatedData.retirementDate = null;

    try {
      await updateExistingBatch(batchId, updatedData);
      setBatches(prevBatches =>
        prevBatches.map(batch => (batch.id === batchId ? { ...batch, ...updatedData } : batch))
      );
    } catch (error) {
      console.error("Error moving batch:", error);
      // alert("Failed to move batch: " + error.message); // Use a modal or in-app message instead of alert
      console.log("Failed to move batch: " + error.message);
    }
  };

  const deleteBatch = async (batchId) => {
    const batchLabelToDelete = batches.find(b => b.id === batchId)?.batchLabel || batchId;
    // Using a simple confirm here, but consider a custom modal for better UX
    if (window.confirm(`Are you sure you want to permanently delete batch ${batchLabelToDelete}? This cannot be undone.`)) {
      try {
        await deleteExistingBatch(batchId);
        setBatches(prevBatches => prevBatches.filter(batch => batch.id !== batchId));
      } catch (error) {
        console.error("Error deleting batch:", error);
        // alert("Failed to delete batch: " + error.message); // Use a modal or in-app message instead of alert
        console.log("Failed to delete batch: " + error.message);
      }
    }
  };

  // --- Harvest Modal Functions ---
  const openHarvestModal = (batchId) => {
    const target = batches.find(b => b.id === batchId);
    if (target) {
      setHarvestTargetBatch({ id: target.id, label: target.batchLabel });
      setIsHarvestModalOpen(true);
    } else {
      console.error("Target batch not found for harvest modal:", batchId);
    }
  };

  const closeHarvestModal = () => {
    setIsHarvestModalOpen(false);
    setHarvestTargetBatch(null);
  };

  const submitHarvest = async (batchId, harvestWeights) => {
    const newHarvestEntries = harvestWeights.map(weight => ({ date: new Date().toISOString().split('T')[0], weight: parseFloat(weight) }));
    const batchToUpdate = batches.find(b => b.id === batchId);
    if (!batchToUpdate) return;

    const updatedHarvests = [...(Array.isArray(batchToUpdate.harvests) ? batchToUpdate.harvests : []), ...newHarvestEntries];

    try {
      // Assuming your backend supports updating harvests within a batch
      await updateExistingBatch(batchId, { harvests: updatedHarvests });
      setBatches(prevBatches => prevBatches.map(batch => {
        if (batch.id === batchId) {
          return { ...batch, harvests: updatedHarvests };
        }
        return batch;
      }));
      closeHarvestModal();
    } catch (error) {
      console.error("Error submitting harvest:", error);
      // alert("Failed to submit harvest: " + error.message); // Use a modal or in-app message instead of alert
      console.log("Failed to submit harvest: " + error.message);
    }
  };


  // --- Settings Panel Functions ---
  const openSettingsPanel = () => { setIsSettingsPanelOpen(true); };
  const closeSettingsPanel = () => { setIsSettingsPanelOpen(false); };

  // --- View Rendering Logic ---
  const renderView = () => {
    // Display Login component if not authenticated
    if (!isAuthenticated) {
      return <LoginComponent onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

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
                return <ManageVarietiesView varieties={varieties} />;
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
        isAuthenticated={isAuthenticated}
        onLogout={() => {
          setIsAuthenticated(false);
          localStorage.clear(); // Clear all tokens
        }}
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