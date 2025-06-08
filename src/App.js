// src/App.js
import React, { useState, useEffect } from 'react';

// Import Components
import Navbar from './components/Navbar';
import HarvestModal from './components/HarvestModal';
import SettingsPanel from './components/SettingsPanel';
import LoginComponent from './components/LoginComponent.jsx'; // Make sure this path and .jsx extension are correct

// Import Views (assuming they are in ./views/ and use .jsx extension)
import HomepageView from './views/HomepageView.jsx';
import LabView from './views/LabView.jsx';
import IncubationView from './views/IncubationView.jsx';
import GrowRoomView from './views/GrowRoomView.jsx';
import RetirementView from './views/RetirementView.jsx';
import DashboardView from './views/DashboardView.jsx';
import ManageVarietiesView from './views/ManageVarietiesView.jsx';
import ManageSubstratesView from './views/ManageSubstratesView.jsx';
import ManageSuppliersView from './views/ManageSuppliersView.jsx';

// Import Helper Functions (adjust if you still use formatDate directly here, otherwise can remove)
// import { formatDate } from './utils/helpers'; // Only include if needed directly in App.js

// Import API Service - PATH UPDATED
import {
  fetchBatches,
  createBatch,
  updateExistingBatch,
  deleteExistingBatch,
  fetchVarieties,
} from './api'; // Ensure this path is correct: src/api.js

// Main Application Component
function App() {
  const [currentView, setCurrentView] = useState('Spawn Point');
  const [batches, setBatches] = useState([]); // Data will come from API
  const [varieties, setVarieties] = useState([]); // State for varieties, loaded from API
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [harvestTargetBatch, setHarvestTargetBatch] = useState(null);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- Authentication and Initial Data Loading ---
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      // If authenticated, fetch data
      const loadData = async () => {
        try {
          const fetchedBatchesResponse = await fetchBatches();
          // Assuming fetchBatches might also be paginated or return an array directly
          setBatches(Array.isArray(fetchedBatchesResponse) ? fetchedBatchesResponse : (fetchedBatchesResponse?.results || []));
          console.log("Loaded batches from API:", fetchedBatchesResponse);

          const fetchedVarietiesResponse = await fetchVarieties();
          // Check if the response has a 'results' property (common for DRF pagination)
          // Also ensure it's an array. Fallback to an empty array if not.
          const varietiesData = Array.isArray(fetchedVarietiesResponse)
                                ? fetchedVarietiesResponse
                                : (fetchedVarietiesResponse?.results || []);
          setVarieties(varietiesData);
          console.log("Loaded varieties from API:", fetchedVarietiesResponse, "Processed varieties:", varietiesData);

        } catch (error) {
          console.error("Error loading data:", error);
          if (error.message === 'Authentication token not found.' ||
              error.message.includes('Unauthorized') ||
              (error.status === 401 && error.data?.code === 'token_not_valid') // Handle token_not_valid from api.js
            ) {
            setIsAuthenticated(false);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            console.log('Your session has expired or token is invalid. Please log in again.');
            // Optionally: redirect to login view if not already there.
            // setCurrentView('Login'); // Or how you handle login view display
          }
        }
      };
      loadData();
    } else {
      // No token, ensure user is not authenticated
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]); // Reload data when authentication status changes

  // --- Batch Management Functions (now calling API) ---
  const addBatch = async (newBatchData) => {
    try {
      const createdBatch = await createBatch(newBatchData);
      setBatches(prevBatches => [createdBatch, ...prevBatches].sort((a, b) => b.id - a.id));
      setCurrentView('Incubation');
    } catch (error) {
      console.error("Error creating batch:", error);
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
      console.log("Failed to update batch: " + error.message);
    }
  };

  const moveBatch = async (batchId, newStage) => {
    const batchToMove = batches.find(b => b.id === batchId);
    if (!batchToMove) return;

    const updatedData = { ...batchToMove, stage: newStage };
    const todayStr = new Date().toISOString().split('T')[0];
    if (newStage === 'grow' && batchToMove.stage !== 'grow') updatedData.growRoomEntryDate = todayStr;
    if (newStage === 'retired' && batchToMove.stage !== 'retired') updatedData.retirementDate = todayStr;
    if (newStage === 'incubation') { updatedData.growRoomEntryDate = null; updatedData.retirementDate = null; }
    if (newStage === 'grow' && batchToMove.stage === 'retired') updatedData.retirementDate = null;

    try {
      await updateExistingBatch(batchId, updatedData);
      setBatches(prevBatches =>
        prevBatches.map(batch => (batch.id === batchId ? { ...batch, ...updatedData } : batch))
      );
    } catch (error) {
      console.error("Error moving batch:", error);
      console.log("Failed to move batch: " + error.message);
    }
  };

  const deleteBatch = async (batchId) => {
    const batchLabelToDelete = batches.find(b => b.id === batchId)?.batchLabel || batchId;
    if (window.confirm(`Are you sure you want to permanently delete batch ${batchLabelToDelete}? This cannot be undone.`)) {
      try {
        await deleteExistingBatch(batchId);
        setBatches(prevBatches => prevBatches.filter(batch => batch.id !== batchId));
      } catch (error) {
        console.error("Error deleting batch:", error);
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
            case 'Spawn Point':
                return <HomepageView batches={batches} setCurrentView={setCurrentView} />;
            case 'Lab':
              return <LabView onAddBatch={addBatch} availableVarieties={varieties} />;
            case 'Incubation':
                return <IncubationView batches={batches} onUpdateBatch={updateBatch} onMoveBatch={moveBatch} onDeleteBatch={deleteBatch} />;
            case 'Grow Room':
                return <GrowRoomView batches={batches} onUpdateBatch={updateBatch} onMoveBatch={moveBatch} onOpenHarvestModal={openHarvestModal} />;
            case 'Retirement':
                return <RetirementView batches={batches} onMoveBatch={moveBatch} />;
            case 'ManageVarieties':
                return <ManageVarietiesView varieties={varieties} />;
            case 'ManageSubstrates':
                return <ManageSubstratesView />; // API calls for substrates would go here if implemented
            case 'ManageSuppliers':
                return <ManageSuppliersView />; // API calls for suppliers would go here if implemented
            case 'Dashboard':
            default:
                return <DashboardView batches={batches}/>;
        }
    } catch (error) {
        console.error("Error rendering view:", currentView, error);
        return <div className="p-6 text-red-600 bg-red-100 border border-red-400 rounded-md">Error rendering view: {currentView}. Check console for details.</div>;
    }
  };

  // Main App JSX Structure
  return (
    <>
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openSettingsPanel={openSettingsPanel}
        isAuthenticated={isAuthenticated}
        onLogout={() => {
          setIsAuthenticated(false);
          localStorage.clear(); // Clear all tokens on logout
        }}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderView()}
      </main>
      {isHarvestModalOpen && harvestTargetBatch && (
          <HarvestModal
            batchId={harvestTargetBatch.id}
            batchLabel={harvestTargetBatch.label}
            onClose={closeHarvestModal}
            onSubmitHarvest={submitHarvest}
          />
       )}
       <SettingsPanel isOpen={isSettingsPanelOpen} onClose={closeSettingsPanel} />
    </>
  );
}

export default App;