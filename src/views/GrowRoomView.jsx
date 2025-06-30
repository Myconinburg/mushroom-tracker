// src/views/GrowRoomView.jsx
import React from 'react';
import BatchCard from '../components/BatchCard'; // <-- FIXED: Added this import
import { SettingsIcon } from '../components/icons'; 

function GrowRoomView({ batches, onUpdateBatch, onOpenMoveConfirmModal, onOpenHarvestModal, columns, onOpenManageColumns, onMoveBatchToColumn }) {
    const growRoomBatches = Array.isArray(batches)
        ? batches.filter(batch => batch?.stage === 'grow room')
        : [];

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl md:text-2xl font-semibold text-gray-900">
                    Grow Room
                </h2>
                <button 
                    onClick={onOpenManageColumns}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    <SettingsIcon className="h-5 w-5" />
                    Manage Columns
                </button>
            </div>
            {growRoomBatches.length === 0 ? (
                <p className="text-gray-500 italic">No batches currently in the grow room.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {growRoomBatches.map(batch =>
                        batch && batch.id ? (
                            <BatchCard
                                key={batch.id}
                                batch={batch}
                                onUpdateBatch={onUpdateBatch}
                                onOpenMoveConfirmModal={onOpenMoveConfirmModal}
                                onOpenHarvestModal={onOpenHarvestModal}
                                columns={columns}
                                onMoveBatchToColumn={onMoveBatchToColumn}
                            />
                        ) : null
                    )}
                </div>
            )}
        </div>
    );
}

export default GrowRoomView;