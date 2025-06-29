// src/views/RetirementView.jsx
import React, { useState, useMemo } from 'react';
import BatchCard from '../components/BatchCard'; // <-- FIXED: Added this import
// import { formatDate } from '../utils/helpers'; // <-- FIXED: Removed unused import

function RetirementView({ batches, onOpenMoveConfirmModal }) {
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const filteredBatches = useMemo(() => {
        if (!Array.isArray(batches)) return [];
        const retiredOnly = batches.filter(b => b?.stage === 'Retired');
        return retiredOnly.filter(b => {
            const retiredDateStr = b.retirementDate;
            if (!retiredDateStr) return false;
            const retiredDate = new Date(retiredDateStr);
            if(isNaN(retiredDate.getTime())) return false;

            if (startDateFilter) {
                 const filterStart = new Date(startDateFilter);
                 if (retiredDate < filterStart) return false;
            }
            if (endDateFilter) {
                const filterEnd = new Date(endDateFilter);
                 if (retiredDate > filterEnd) return false;
            }
            return true;
        });
    }, [batches, startDateFilter, endDateFilter]);

    const groupedBatches = useMemo(() => {
        return filteredBatches.reduce((acc, batch) => {
            const date = new Date(batch.retirementDate);
            const groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(batch);
            return acc;
        }, {});
    }, [filteredBatches]);

    const sortedMonths = useMemo(() => Object.keys(groupedBatches).sort().reverse(), [groupedBatches]);

    const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500";
    const buttonStyle = "px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500";

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">Retirement Records</h2>
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

            {filteredBatches.length === 0 ? (
                <p className="text-gray-500 text-center italic">No retired batches match the current filters.</p>
            ) : (
                sortedMonths.map(monthKey => (
                    <div key={monthKey} className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">
                            {monthKey}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedBatches[monthKey].sort((a,b) => new Date(b.retirementDate) - new Date(a.retirementDate)).map(batch => batch ? (
                                    <BatchCard
                                        key={batch.id}
                                        batch={batch}
                                        onOpenMoveConfirmModal={onOpenMoveConfirmModal}
                                    />
                                ) : null )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default RetirementView;