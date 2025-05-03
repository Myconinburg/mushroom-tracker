// src/views/RetirementView.jsx
import React, { useState, useMemo } from 'react';

// Import Components
import BatchCard from '../components/BatchCard'; // Adjust path if needed

// Import Helper Functions
import { formatDate } from '../utils/helpers'; // Adjust path if needed

function RetirementView({ batches, onMoveBatch }) {
    // State for date filters
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    // Filter batches based on stage and date filters
    const filteredBatches = useMemo(() => {
        // Ensure batches is an array
        if (!Array.isArray(batches)) {
            console.error("RetirementView: batches prop is not an array.");
            return [];
        }
        try {
            // Filter for retired batches first
            const retiredOnly = batches.filter(b => b?.stage === 'retired');

            // Then apply date filters if they are set
            return retiredOnly.filter(b => {
                // Determine the effective retirement date, falling back if needed
                const retiredDateStr = b.retirementDate || b.growRoomEntryDate || b.inoculationDate;
                if (!retiredDateStr) {
                    // console.warn(`Batch ${b.id} has no valid retirement/fallback date for filtering.`);
                    return false; // Cannot filter if no date
                }

                const retiredDate = new Date(retiredDateStr + 'T00:00:00'); // Use local date
                if (isNaN(retiredDate.getTime())) {
                    // console.warn(`Batch ${b.id} has invalid retirement/fallback date: ${retiredDateStr}`);
                    return false; // Skip batches with invalid dates
                }

                // Apply start date filter
                if (startDateFilter) {
                     const filterStart = new Date(startDateFilter + 'T00:00:00');
                     // Only filter if filterStart is a valid date
                     if (!isNaN(filterStart.getTime()) && retiredDate < filterStart) {
                         return false; // Exclude if before start date
                     }
                }
                // Apply end date filter
                if (endDateFilter) {
                    const filterEnd = new Date(endDateFilter + 'T00:00:00');
                     // Only filter if filterEnd is a valid date
                     if (!isNaN(filterEnd.getTime()) && retiredDate > filterEnd) {
                         return false; // Exclude if after end date
                     }
                }
                return true; // Include if passes filters
            });
        } catch (error) {
            console.error("Error during filtering in RetirementView:", error);
            return []; // Return empty array on error
        }
    }, [batches, startDateFilter, endDateFilter]); // Dependencies for filtering

    // Group filtered batches by retirement month (YYYY-MM)
    const groupedBatches = useMemo(() => {
        try {
            return filteredBatches.reduce((acc, batch) => {
                let groupKey = "Unknown Date"; // Default key
                try {
                    // Use the most relevant date available for grouping
                    const dateStr = batch.retirementDate || batch.growRoomEntryDate || batch.inoculationDate;
                    if (!dateStr) throw new Error("No valid date for grouping");

                    const date = new Date(dateStr + 'T00:00:00');
                    if (isNaN(date.getTime())) throw new Error("Invalid date for grouping");

                    // Format key as YYYY-MM
                    groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                } catch (groupingError) {
                     // console.warn(`Error determining group key for batch ${batch.id}:`, groupingError.message);
                     // Batch will be added to "Unknown Date" group
                }

                if (!acc[groupKey]) acc[groupKey] = []; // Initialize group array if it doesn't exist
                acc[groupKey].push(batch);
                return acc;
            }, {}); // Initial value for accumulator is an empty object
        } catch (error) {
             console.error("Error during grouping in RetirementView:", error);
             return {}; // Return empty object on error
        }
    }, [filteredBatches]); // Dependency for grouping

    // Sort months reverse chronologically (most recent first)
    const sortedMonths = useMemo(() => {
        try {
            return Object.keys(groupedBatches).sort().reverse(); // Sort keys (YYYY-MM strings)
        } catch (error) {
            console.error("Error sorting months in RetirementView:", error);
            return [];
        }
    }, [groupedBatches]); // Dependency for sorting

    // Styles
    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500";
    const buttonStyle = "px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500";

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">Retirement Records</h2>

            {/* Date Filters Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg items-end">
                <div className="flex-1">
                    <label htmlFor="retiredFilterStart" className={labelStyle}>Retired After</label>
                    <input type="date" id="retiredFilterStart" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className={inputStyle} style={{ colorScheme: 'light' }}/>
                </div>
                <div className="flex-1">
                    <label htmlFor="retiredFilterEnd" className={labelStyle}>Retired Before</label>
                     <input type="date" id="retiredFilterEnd" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className={inputStyle} style={{ colorScheme: 'light' }}/>
                </div>
                 <button onClick={() => {setStartDateFilter(''); setEndDateFilter('');}} className={buttonStyle}>
                    Clear Filters
                </button>
            </div>

            {/* Batch List Section */}
            {filteredBatches.length === 0 ? (
                <p className="text-gray-500 text-center italic">No retired batches match the current filters.</p>
            ) : (
                // Map over sorted months to create sections
                sortedMonths.map(monthKey => (
                    <div key={monthKey} className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">
                            {monthKey === "Unknown Date" ? "Unknown Retirement Date" : monthKey}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Sort batches within the month by date descending */}
                            {groupedBatches[monthKey]
                                .sort((a, b) => {
                                    try {
                                        const dateA = new Date(a.retirementDate || a.growRoomEntryDate || a.inoculationDate || 0);
                                        const dateB = new Date(b.retirementDate || b.growRoomEntryDate || b.inoculationDate || 0);
                                        // Handle invalid dates during sort comparison
                                        const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
                                        const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
                                        return timeB - timeA; // Sort descending (newest first)
                                    } catch { return 0; } // Fallback if date parsing fails
                                })
                                // Map over sorted batches for the current month
                                .map(batch => batch ? (
                                    <BatchCard
                                        key={batch.id}
                                        batch={batch}
                                        onMoveBatch={onMoveBatch} // Pass only needed props
                                        // onUpdateBatch, onDeleteBatch, onOpenHarvestModal not needed here
                                    />
                                ) : null )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default RetirementView; // Export the component
