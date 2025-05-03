// src/views/GrowRoomView.jsx
import React from 'react';

// Import the BatchCard component
// Adjust the path if needed (e.g., if BatchCard.jsx is directly in components)
import BatchCard from '../components/BatchCard';

function GrowRoomView({ batches, onUpdateBatch, onMoveBatch, onOpenHarvestModal }) {
    // Filter the batches array to get only those in the 'grow' stage
    // Use optional chaining and default to empty array for safety
    const growBatches = Array.isArray(batches)
        ? batches.filter(batch => batch?.stage === 'grow')
        : [];

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">
                Grow Room
            </h2>
            {/* Check if there are any batches in the grow room */}
            {growBatches.length === 0 ? (
                // Display a message if no batches are found
                <p className="text-gray-500 italic">No batches currently in the grow room.</p>
            ) : (
                // Render the grid of batch cards if batches exist
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Map over the filtered batches */}
                    {growBatches.map(batch =>
                        // Basic check to ensure batch object is valid before rendering card
                        batch && batch.id ? (
                            <BatchCard
                                key={batch.id} // Unique key for each card
                                batch={batch} // Pass the whole batch object
                                onUpdateBatch={onUpdateBatch} // Pass down update function
                                onMoveBatch={onMoveBatch} // Pass down move function
                                onOpenHarvestModal={onOpenHarvestModal} // Pass down modal open function
                                // onDeleteBatch is not typically needed in Grow Room view
                            />
                        ) : null // Don't render anything if batch or batch.id is missing
                    )}
                </div>
            )}
        </div>
    );
}

export default GrowRoomView; // Export the component
