// src/views/IncubationView.jsx
import React, { useState } from 'react';
import BatchCard from '../components/BatchCard';
// We don't need the MovePartial modal here anymore, App.js handles it.
import { ChevronUpIcon, ChevronDownIcon, SettingsIcon } from '../components/icons';

function IncubationView({ 
    batches, 
    onUpdateBatch, 
    onOpenMoveConfirmModal, 
    onDeleteBatch, 
    onOpenMovePartialModal, 
    columns, 
    onOpenManageColumns, 
    onMoveBatchToColumn
}) {
    
    const incubationBatches = Array.isArray(batches)
        ? batches.filter(batch => batch?.stage === 'Incubation')
        : [];

    const [openColumns, setOpenColumns] = useState(() => {
        const initialOpen = {};
        if (columns && columns.length > 0) {
            initialOpen[columns[0].id] = true;
        }
        return initialOpen;
    });

    const toggleColumn = (columnId) => {
        setOpenColumns(prev => ({ ...prev, [columnId]: !prev[columnId] }));
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl md:text-2xl font-semibold text-gray-900">
                    Incubation Room
                </h2>
                <button 
                    onClick={onOpenManageColumns}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    <SettingsIcon className="h-5 w-5" />
                    Manage Columns
                </button>
            </div>

            {incubationBatches.length === 0 ? (
                <p className="text-gray-500 italic">No batches currently in incubation.</p>
            ) : (
                <div className="space-y-4">
                    {columns && columns.map(column => {
                        const batchesInColumn = incubationBatches.filter(b => b.columnId === column.id);
                        const isColumnOpen = !!openColumns[column.id];

                        return (
                            <div key={column.id} className="bg-gray-50 border border-gray-200 rounded-lg">
                                <button 
                                    onClick={() => toggleColumn(column.id)}
                                    className="w-full flex justify-between items-center p-4 text-left"
                                >
                                    <div className="flex items-center">
                                        <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: column.color }}></span>
                                        <h3 className="text-lg font-semibold text-gray-800">{column.title}</h3>
                                        <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                            {batchesInColumn.length}
                                        </span>
                                    </div>
                                    {isColumnOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                </button>
                                {isColumnOpen && (
                                    <div className="p-4 border-t border-gray-200">
                                        {batchesInColumn.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {batchesInColumn.map(batch => (
                                                    <BatchCard
                                                        key={batch.id}
                                                        batch={batch}
                                                        onUpdateBatch={onUpdateBatch}
                                                        onOpenMoveConfirmModal={onOpenMoveConfirmModal}
                                                        onDeleteBatch={onDeleteBatch}
                                                        onOpenMovePartialModal={onOpenMovePartialModal}
                                                        columns={columns}
                                                        onMoveBatchToColumn={onMoveBatchToColumn}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic px-2">This column is empty.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default IncubationView;