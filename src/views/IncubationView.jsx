// src/views/IncubationView.jsx
import React from 'react';

// Import the BatchCard component
// Adjust the path if needed (e.g., if BatchCard.jsx is directly in components)
import BatchCard from '../components/BatchCard';

function IncubationView({ batches, onUpdateBatch, onMoveBatch, onDeleteBatch }) {
    // Filter the batches array to get only those in the 'incubation' stage
    // Use optional chaining and default to empty array for safety
    const incubationBatches = Array.isArray(batches)
        ? batches.filter(batch => batch?.stage === 'incubation')
        : [];

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">
                Incubation Room
            </h2>
            {/* Check if there are any batches in incubation */}
            {incubationBatches.length === 0 ? (
                // Display a message if no batches are found
                <p className="text-gray-500 italic">No batches currently in incubation.</p>
            ) : (
                // Render the grid of batch cards if batches exist
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Map over the filtered batches */}
                    {incubationBatches.map(batch =>
                        // Basic check to ensure batch object is valid before rendering card
                        batch && batch.id ? (
                            <BatchCard
                                key={batch.id} // Unique key for each card
                                batch={batch} // Pass the whole batch object
                                onUpdateBatch={onUpdateBatch} // Pass down update function
                                onMoveBatch={onMoveBatch} // Pass down move function
                                onDeleteBatch={onDeleteBatch} // Pass down delete function
                                // onOpenHarvestModal is not needed for incubation cards
                            />
                        ) : null // Don't render anything if batch or batch.id is missing
                    )}
                </div>
            )}
        </div>
    );
}

export default IncubationView; // Export the component
