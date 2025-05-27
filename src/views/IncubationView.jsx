// src/views/IncubationView.jsx
// Make sure useState is imported from React
import React, { useState } from 'react';
import BatchCard from '../components/BatchCard';
import MovePartialToGrowRoomModal from '../components/MovePartialToGrowRoomModal';

// Accept onSplitBatch as a new prop
function IncubationView({ batches, onUpdateBatch, onMoveBatch, onDeleteBatch, onSplitBatch }) {
    const incubationBatches = Array.isArray(batches)
        ? batches.filter(batch => batch?.stage === 'incubation')
        : [];

    const [isMovePartialModalOpen, setIsMovePartialModalOpen] = useState(false);
    const [selectedBatchForPartialMove, setSelectedBatchForPartialMove] = useState(null);

    const handleOpenMovePartialModal = (batch) => {
        setSelectedBatchForPartialMove(batch);
        setIsMovePartialModalOpen(true);
    };

    const handleCloseMovePartialModal = () => {
        setIsMovePartialModalOpen(false);
        setSelectedBatchForPartialMove(null);
    };

    // Modified to use onSplitBatch
    const handlePartialMoveSubmit = async (formData) => {
        if (!selectedBatchForPartialMove) {
            console.error("No batch selected for partial move.");
            alert("Error: No batch selected. Please try again."); // Or use a more sophisticated error display
            return;
        }

        try {
            // Call the onSplitBatch function passed down from App.js
            // formData from the modal contains: { quantity, colonisationDate, notes }
            await onSplitBatch(selectedBatchForPartialMove.id, formData);

            alert(`Batch ${selectedBatchForPartialMove.batchLabel || selectedBatchForPartialMove.id} partially moved successfully!`);
            handleCloseMovePartialModal();
        } catch (error) {
            console.error("Failed to move partial batch:", error);
            // You could set an error state here to display in the modal or view
            alert(`Error moving batch: ${error.message || 'An unknown error occurred.'}`);
            // Optionally, decide if the modal should close on error or stay open
            // handleCloseMovePartialModal();
        }
    };

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">
                Incubation Room
            </h2>
            {incubationBatches.length === 0 ? (
                <p className="text-gray-500 italic">No batches currently in incubation.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {incubationBatches.map(batch =>
                        batch && batch.id ? (
                            <BatchCard
                                key={batch.id}
                                batch={batch}
                                onUpdateBatch={onUpdateBatch}
                                onMoveBatch={onMoveBatch}
                                onDeleteBatch={onDeleteBatch}
                                onOpenMovePartialModal={handleOpenMovePartialModal}
                                // onOpenHarvestModal is not typically needed for incubation
                            />
                        ) : null
                    )}
                </div>
            )}

            {selectedBatchForPartialMove && (
                <MovePartialToGrowRoomModal
                    isOpen={isMovePartialModalOpen}
                    onClose={handleCloseMovePartialModal}
                    parentBatch={selectedBatchForPartialMove}
                    onSubmit={handlePartialMoveSubmit}
                />
            )}
        </div>
    );
}

export default IncubationView;