// src/App.js
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HarvestModal from './components/HarvestModal';
import SettingsPanel from './components/SettingsPanel';

// Import Views
import HomepageView from './views/HomepageView';
import LabView from './views/LabView';
import IncubationView from './views/IncubationView';
import GrowRoomView from './views/GrowRoomView';
import RetirementView from './views/RetirementView';
import DashboardView from './views/DashboardView';
import ManageVarietiesView from './views/ManageVarietiesView';
import ManageSubstratesView from './views/ManageSubstratesView';
import ManageSuppliersView from './views/ManageSuppliersView';

// Import API Service
import {
  fetchBatches,
  createBatch,
  updateExistingBatch,
  deleteExistingBatch,
  fetchVarieties,
  loginUser // You'll need a login component to use this
} from './services/api'; // Make sure the path is correct

function App() {
  const [currentView, setCurrentView] = useState('Spawn Point');
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
            alert('Your session has expired. Please log in again.');
            // You would typically redirect to a login page here
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
      alert("Failed to create batch: " + error.message);
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
      alert("Failed to update batch: " + error.message);
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
      alert("Failed to move batch: " + error.message);
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
        alert("Failed to delete batch: " + error.message);
      }
    }
  };

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
      alert("Failed to submit harvest: " + error.message);
    }
  };


  const openSettingsPanel = () => { setIsSettingsPanelOpen(true); };
  const closeSettingsPanel = () => { setIsSettingsPanelOpen(false); };

  const renderView = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            {/* You'll need to create a dedicated Login component */}
            <p>Please implement a Login component that calls `loginUser` from `./services/api` and sets `isAuthenticated` to true upon success.</p>
            {/* Example: <Login onLoginSuccess={() => setIsAuthenticated(true)} /> */}
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'Spawn Point':
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
        return <ManageVarietiesView varieties={varieties} />; // Pass varieties if needed
      case 'ManageSubstrates':
        return <ManageSubstratesView />; // You'll need API calls for substrates here
      case 'ManageSuppliers':
        return <ManageSuppliersView />; // You'll need API calls for suppliers here
      case 'Dashboard':
      default:
        return <DashboardView batches={batches} />;
    }
  };

  return (
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