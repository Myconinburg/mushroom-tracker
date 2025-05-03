// src/views/DashboardView.jsx
import React, { useState, useMemo } from 'react';

// Import Helper Functions
// Adjust path if needed
import { formatDate, daysBetween, getFinancialYear } from '../utils/helpers';

// Import Icons from the single icons file
// Adjust path if needed
import {
    CheckIcon,
    XIcon,
    ScaleIcon,
    CalendarIcon,
    ClockIcon,
    ChartBarIcon,
    // Add any other icons used specifically here if necessary
} from '../components/icons';

function DashboardView({ batches }) {
    // State for toggling detailed summaries and date filters
    const [showMonthly, setShowMonthly] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedFy, setSelectedFy] = useState(getFinancialYear(formatDate(new Date())));

    // --- Centralized Calculation Logic ---
    const dashboardData = useMemo(() => {
        // Ensure batches is an array before processing
        if (!Array.isArray(batches)) {
            console.warn("DashboardView: batches prop is not an array.");
            // Return a default structure to prevent errors
            const defaultSummary = { count: 0, totalUnits: 0, totalInitialWeight: 0, contaminatedUnits: 0, successfulUnits: 0, totalHarvestWeight: 0, batchesWithHarvest: 0, batchesColonised: 0, totalColonisationDays: 0, batchesInGrow: 0, totalGrowDays: 0, byVariety: {}, bySubstrate: {}, bySupplier: {}, avgColonisationDays: 0, avgGrowDays: 0, contaminationRate: 0, successRate: 0, yieldPerKgSubstrate: 0, yieldPerSuccessfulUnit: 0 };
            return { allYears: [], allFy: [], sumAllTime: defaultSummary, sum30: defaultSummary, sum90: defaultSummary, sum365: defaultSummary, sum7: defaultSummary, weeklyHarvests: {}, processedMonthly: [], processedFy: [] };
        }

        // console.log("Recalculating dashboard data..."); // Uncomment for performance debugging
        const now = new Date();
        const allYears = [...new Set(batches.map(b => { try { return new Date(b.inoculationDate + 'T00:00:00').getFullYear(); } catch { return null; } }).filter(y => y))].sort((a, b) => b - a);
        const allFy = [...new Set(batches.map(b => getFinancialYear(b.inoculationDate)))].filter(fy => fy !== "Error" && fy !== "Invalid Date").sort().reverse();

        // Helper to filter batches by inoculation date relative to now
        const filterBatchesByDate = (batchList, days) => {
            const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            return batchList.filter(b => { try { const date = new Date(b.inoculationDate + 'T00:00:00'); return !isNaN(date.getTime()) && date >= cutoffDate; } catch { return false; } });
        };

        // Helper function to summarize a list of batches
        const summarizeBatches = (batchList) => {
            const summary = {
                count: batchList.length, totalUnits: 0, totalInitialWeight: 0, contaminatedUnits: 0, successfulUnits: 0,
                totalHarvestWeight: 0, batchesWithHarvest: 0, batchesColonised: 0, totalColonisationDays: 0,
                batchesInGrow: 0, totalGrowDays: 0, byVariety: {}, bySubstrate: {}, bySupplier: {},
            };

            batchList.forEach(b => {
                // Use optional chaining and defaults for safety
                const numUnits = b?.numBags || 0;
                const unitWeight = b?.unitWeight || 0;
                const contaminated = b?.contaminatedBags || 0;
                const variety = b?.variety || 'Unknown';
                const substrate = b?.substrateRecipe || 'Unknown';
                const supplier = b?.spawnSupplier || 'Unknown';

                summary.totalUnits += numUnits;
                summary.totalInitialWeight += numUnits * unitWeight;
                summary.contaminatedUnits += contaminated;

                // Calculate successful units based on batches reaching grow/retired stage
                if (b?.stage === 'grow' || b?.stage === 'retired') {
                    summary.successfulUnits += (numUnits - contaminated);
                }

                const harvestWeight = Array.isArray(b?.harvests) ? b.harvests.reduce((sum, h) => sum + (h?.weight || 0), 0) : 0;
                summary.totalHarvestWeight += harvestWeight;
                if (harvestWeight > 0) {
                    summary.batchesWithHarvest++;
                }

                // Colonisation Time
                if (b?.colonisationCompleteDate && b?.inoculationDate) {
                    const coloDays = daysBetween(b.inoculationDate, b.colonisationCompleteDate);
                    if (coloDays !== null && coloDays >= 0) {
                        summary.batchesColonised++;
                        summary.totalColonisationDays += coloDays;
                    }
                }

                // Grow Time (to first harvest)
                let firstHarvestDate = null;
                if (b?.growRoomEntryDate && Array.isArray(b?.harvests) && b.harvests.length > 0) {
                     firstHarvestDate = b.harvests.reduce((min, h) => {
                        try {
                            if (!h?.date) return min;
                            const d = new Date(h.date + 'T00:00:00');
                            if (isNaN(d.getTime())) return min;
                            return !min || d < min ? d : min;
                        } catch { return min; }
                    }, null);

                    if (firstHarvestDate) {
                         const growDays = daysBetween(b.growRoomEntryDate, formatDate(firstHarvestDate));
                         if (growDays !== null && growDays >= 0) {
                            summary.totalGrowDays += growDays;
                         }
                    }
                }
                // Count batches that reached grow/retired stage for success rate denominator and avg grow time denominator
                if (b?.stage === 'grow' || b?.stage === 'retired') {
                     summary.batchesInGrow++;
                 }


                // --- Groupings ---
                const initGroup = (group, key) => { if (!group[key]) { group[key] = { count: 0, totalUnits: 0, contaminatedUnits: 0, totalHarvestWeight: 0, batchesColonised: 0, totalColonisationDays: 0, batchesInGrow: 0, totalGrowDays: 0, successfulUnits: 0 }; } };
                initGroup(summary.byVariety, variety);
                initGroup(summary.bySubstrate, substrate);
                initGroup(summary.bySupplier, supplier);

                [summary.byVariety[variety], summary.bySubstrate[substrate], summary.bySupplier[supplier]].forEach(group => {
                    group.count++; group.totalUnits += numUnits; group.contaminatedUnits += contaminated;
                    if (b?.stage === 'grow' || b?.stage === 'retired') { group.successfulUnits += (numUnits - contaminated); }
                    group.totalHarvestWeight += harvestWeight;
                    if (b?.colonisationCompleteDate && b?.inoculationDate) { const coloDays = daysBetween(b.inoculationDate, b.colonisationCompleteDate); if (coloDays !== null && coloDays >= 0) { group.batchesColonised++; group.totalColonisationDays += coloDays; } }
                    if (b?.growRoomEntryDate && firstHarvestDate) { const growDays = daysBetween(b.growRoomEntryDate, formatDate(firstHarvestDate)); if (growDays !== null && growDays >= 0) { group.totalGrowDays += growDays; } }
                    if (b?.stage === 'grow' || b?.stage === 'retired') { group.batchesInGrow++; }
                });
            });

            // --- Calculate Averages / Ratios ---
            summary.avgColonisationDays = summary.batchesColonised > 0 ? (summary.totalColonisationDays / summary.batchesColonised) : 0;
            const batchesWithGrowDays = batchList.filter(b => b?.growRoomEntryDate && Array.isArray(b?.harvests) && b.harvests.length > 0 && b.harvests.some(h => h?.date)).length;
            summary.avgGrowDays = batchesWithGrowDays > 0 ? (summary.totalGrowDays / batchesWithGrowDays) : 0;
            summary.contaminationRate = summary.totalUnits > 0 ? (summary.contaminatedUnits / summary.totalUnits * 100) : 0;
            const unitsInGrowOrRetired = batchList.filter(b => b?.stage === 'grow' || b?.stage === 'retired').reduce((sum, b) => sum + (b?.numBags || 0), 0);
            const contaminatedInGrowOrRetired = batchList.filter(b => b?.stage === 'grow' || b?.stage === 'retired').reduce((sum, b) => sum + (b?.contaminatedBags || 0), 0);
            summary.successRate = unitsInGrowOrRetired > 0 ? ((unitsInGrowOrRetired - contaminatedInGrowOrRetired) / unitsInGrowOrRetired * 100) : 0;
            summary.yieldPerKgSubstrate = summary.totalInitialWeight > 0 ? (summary.totalHarvestWeight / summary.totalInitialWeight) : 0;
            summary.yieldPerSuccessfulUnit = summary.successfulUnits > 0 ? (summary.totalHarvestWeight / summary.successfulUnits) : 0;

            // Calculate group averages
            const calculateGroupAverages = (group) => { Object.keys(group).forEach(key => { const g = group[key]; g.avgColonisationDays = g.batchesColonised > 0 ? (g.totalColonisationDays / g.batchesColonised) : 0; const groupBatchesWithGrowDays = batchList.filter(b => (b?.variety === key || b?.substrateRecipe === key || b?.spawnSupplier === key) && b?.growRoomEntryDate && Array.isArray(b?.harvests) && b.harvests.length > 0 && b.harvests.some(h => h?.date)).length; g.avgGrowDays = groupBatchesWithGrowDays > 0 ? (g.totalGrowDays / groupBatchesWithGrowDays) : 0; g.contaminationRate = g.totalUnits > 0 ? (g.contaminatedUnits / g.totalUnits * 100) : 0; g.yieldPerSuccessfulUnit = g.successfulUnits > 0 ? (g.totalHarvestWeight / g.successfulUnits) : 0; const groupUnitsInGrowOrRetired = batchList.filter(b => (b?.variety === key || b?.substrateRecipe === key || b?.spawnSupplier === key) && (b?.stage === 'grow' || b?.stage === 'retired')).reduce((sum, b) => sum + (b?.numBags || 0), 0); const groupContaminatedInGrowOrRetired = batchList.filter(b => (b?.variety === key || b?.substrateRecipe === key || b?.spawnSupplier === key) && (b?.stage === 'grow' || b?.stage === 'retired')).reduce((sum, b) => sum + (b?.contaminatedBags || 0), 0); g.successRate = groupUnitsInGrowOrRetired > 0 ? ((groupUnitsInGrowOrRetired - groupContaminatedInGrowOrRetired) / groupUnitsInGrowOrRetired * 100) : 0; }); };
            calculateGroupAverages(summary.byVariety); calculateGroupAverages(summary.bySubstrate); calculateGroupAverages(summary.bySupplier);
            return summary;
        };

        // Calculate summaries for different periods
        const sumAllTime = summarizeBatches(batches);
        const sum30 = summarizeBatches(filterBatchesByDate(batches, 30));
        const sum90 = summarizeBatches(filterBatchesByDate(batches, 90));
        const sum365 = summarizeBatches(filterBatchesByDate(batches, 365));
        const sum7 = summarizeBatches(filterBatchesByDate(batches, 7));

        // Calculate weekly harvests
        const weeklyHarvests = filterBatchesByDate(batches, 7).reduce((acc, b) => {
             const variety = b?.variety || 'Unknown';
             if (!acc[variety]) acc[variety] = 0;
             const weekHarvest = Array.isArray(b?.harvests) ? b.harvests.filter(h => { try { const d = new Date(h?.date + 'T00:00:00'); if (isNaN(d.getTime())) return false; const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); return d >= sevenDaysAgo; } catch { return false; } }).reduce((sum, h) => sum + (h?.weight || 0), 0) : 0;
             acc[variety] += weekHarvest;
             return acc;
        }, {});

        // Group batches by month and financial year
        const monthlySummaries = batches.reduce((acc, b) => { try { const date = new Date(b?.inoculationDate + 'T00:00:00'); if (isNaN(date.getTime())) return acc; const year = date.getFullYear(); const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`; if (!acc[monthKey]) acc[monthKey] = []; acc[monthKey].push(b); } catch {} return acc; }, {});
        const financialYearSummaries = batches.reduce((acc, b) => { const fyKey = getFinancialYear(b?.inoculationDate); if (fyKey !== "Error" && fyKey !== "Invalid Date") { if (!acc[fyKey]) acc[fyKey] = []; acc[fyKey].push(b); } return acc; }, {});

        // Process monthly and FY summaries
        const processedMonthly = Object.keys(monthlySummaries).filter(key => key.startsWith(selectedYear)).sort().reverse().map(monthKey => ({ key: monthKey, summary: summarizeBatches(monthlySummaries[monthKey]) }));
        const processedFy = Object.keys(financialYearSummaries).filter(key => key === selectedFy).sort().reverse().map(fyKey => ({ key: fyKey, summary: summarizeBatches(financialYearSummaries[fyKey]) }));

        return { allYears, allFy, sumAllTime, sum30, sum90, sum365, sum7, weeklyHarvests, processedMonthly, processedFy };
    }, [batches, selectedYear, selectedFy]); // Dependencies

    // --- Reusable Display Components (Defined inside DashboardView) ---
    const StatCard = ({ title, value, unit = '', icon = null, tooltip = '' }) => (
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm text-center relative group" title={tooltip}>
            <h3 className="text-sm font-medium text-gray-500 mb-1 flex items-center justify-center gap-1">{icon}{title}</h3>
            <div className="text-2xl font-semibold text-gray-900">{value}{unit && <span className="text-lg font-medium text-gray-600"> {unit}</span>}</div>
            {tooltip && <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">{tooltip}</div>}
        </div>
    );

    const PeriodSummaryCard = ({ title, summary }) => (
        <div className="flex-1 min-w-[280px] bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-left">
            <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-1"><CalendarIcon/> {title}</h3>
            <div className="text-xs space-y-1 text-gray-600">
                <p><strong>Batches Inoc.:</strong> {summary?.count ?? 0}</p>
                <p><strong>Total Units:</strong> {summary?.totalUnits ?? 0}</p>
                <p><strong>Contamination:</strong> {summary?.contaminatedUnits ?? 0} u ({summary?.contaminationRate?.toFixed(1) ?? 0}%)</p>
                <p><strong>Success Rate:</strong> {summary?.successRate?.toFixed(1) ?? 0}%</p>
                <p><strong>Total Harvest:</strong> {summary?.totalHarvestWeight?.toFixed(2) ?? 0} kg</p>
                <p><strong>Avg Yield / Succ. Unit:</strong> {summary?.yieldPerSuccessfulUnit?.toFixed(2) ?? 0} kg</p>
                 <p><strong>Avg BE Approx:</strong> {(summary?.yieldPerKgSubstrate * 100)?.toFixed(1) ?? 0}%</p>
                <p><strong>Avg Colonisation:</strong> {summary?.avgColonisationDays?.toFixed(1) ?? 0} d</p>
                <p><strong>Avg Grow Time:</strong> {summary?.avgGrowDays?.toFixed(1) ?? 0} d</p>
            </div>
        </div>
    );

     const GroupTable = ({ title, data, valueKey, unit = '', avgKey1 = null, avgLabel1 = '', avgKey2 = null, avgLabel2 = '' }) => (
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-3">{title}</h3>
            {data && Object.keys(data).length > 0 ? ( // Check if data exists
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="py-2 px-3 font-medium">Name</th>
                                <th scope="col" className="py-2 px-3 text-right font-medium">{valueKey === 'totalHarvestWeight' ? 'Yield' : 'Value'}</th>
                                {avgKey1 && <th scope="col" className="py-2 px-3 text-right font-medium">{avgLabel1}</th>}
                                {avgKey2 && <th scope="col" className="py-2 px-3 text-right font-medium">{avgLabel2}</th>}
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {Object.entries(data)
                                .sort(([, a], [, b]) => (b?.[valueKey] || 0) - (a?.[valueKey] || 0)) // Add optional chaining
                                .map(([key, groupData]) => (
                                    <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-2 px-3 font-medium text-gray-900 whitespace-nowrap">{key}</td>
                                        <td className="py-2 px-3 text-right">{(groupData?.[valueKey] || 0).toFixed(2)}{unit}</td>
                                        {avgKey1 && <td className="py-2 px-3 text-right">{(groupData?.[avgKey1] || 0).toFixed(1)}</td>}
                                        {avgKey2 && <td className="py-2 px-3 text-right">{(groupData?.[avgKey2] || 0).toFixed(1)}</td>}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            ) : <p className="text-gray-500 text-sm italic">No data available for this grouping.</p>}
        </div>
    );

    // Main dashboard layout
    return (
        <div className="p-4 md:p-6 space-y-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Dashboard Overview</h2>
            {/* Section 1: Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Success Rate" value={dashboardData.sum90.successRate.toFixed(1)} unit="%" icon={<CheckIcon className="text-green-500 h-5 w-5"/>} tooltip="Non-contaminated units from batches reaching Grow/Retired (90d)"/>
                <StatCard title="Contam. Rate" value={dashboardData.sum90.contaminationRate.toFixed(1)} unit="%" icon={<XIcon className="text-red-500 h-5 w-5"/>} tooltip="Contaminated units / Total units inoculated (90d)"/>
                <StatCard title="Avg Yield/Unit" value={dashboardData.sum90.yieldPerSuccessfulUnit.toFixed(2)} unit="kg" icon={<ScaleIcon/>} tooltip="Avg harvest per successful unit (90d)"/>
                <StatCard title="Last 7d Yield" value={dashboardData.sum7.totalHarvestWeight.toFixed(2)} unit="kg" icon={<CalendarIcon/>} tooltip="Total harvest weight in last 7 days"/>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 <StatCard title="Avg Colo. Time" value={dashboardData.sum90.avgColonisationDays.toFixed(1)} unit="days" icon={<ClockIcon/>} tooltip="Avg days from inoculation to full colonisation (90d)"/>
                 <StatCard title="Avg Grow Time" value={dashboardData.sum90.avgGrowDays.toFixed(1)} unit="days" icon={<ClockIcon/>} tooltip="Avg days from grow room entry to first harvest (90d)"/>
                 <StatCard title="Avg BE Approx." value={(dashboardData.sum90.yieldPerKgSubstrate * 100).toFixed(1)} unit="%" icon={<ScaleIcon/>} tooltip="Total Harvest / Total Initial Substrate Weight (90d)"/>
            </div>
            {/* Section 2: Time Period Summaries */}
             <div className="flex gap-4 justify-between flex-wrap">
                 <PeriodSummaryCard title="Last 30 Days" summary={dashboardData.sum30} />
                 <PeriodSummaryCard title="Last 90 Days" summary={dashboardData.sum90} />
                 <PeriodSummaryCard title="Last 365 Days" summary={dashboardData.sum365} />
             </div>
             {/* Section 3: Grouped Summaries */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <GroupTable title="Yield by Variety (All Time)" data={dashboardData.sumAllTime.byVariety} valueKey="totalHarvestWeight" unit=" kg" avgKey1="yieldPerSuccessfulUnit" avgLabel1="kg/Unit" avgKey2="avgGrowDays" avgLabel2="Grow (d)"/>
                  <GroupTable title="Yield by Substrate (All Time)" data={dashboardData.sumAllTime.bySubstrate} valueKey="totalHarvestWeight" unit=" kg" avgKey1="yieldPerSuccessfulUnit" avgLabel1="kg/Unit" avgKey2="contaminationRate" avgLabel2="Contam %"/>
                  <GroupTable title="Yield by Supplier (All Time)" data={dashboardData.sumAllTime.bySupplier} valueKey="totalHarvestWeight" unit=" kg" avgKey1="yieldPerSuccessfulUnit" avgLabel1="kg/Unit" avgKey2="avgColonisationDays" avgLabel2="Colo (d)"/>
             </div>
             {/* Section 4: Weekly Harvest */}
             <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                 <h3 className="text-base font-semibold text-gray-800 mb-3">Harvest Last 7 Days by Variety</h3>
                 {Object.keys(dashboardData.weeklyHarvests).length > 0 && Object.values(dashboardData.weeklyHarvests).some(w => w > 0) ? (
                     <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                         {Object.entries(dashboardData.weeklyHarvests).filter(([, weight]) => weight > 0).sort(([, a], [, b]) => b - a).map(([variety, weight]) => ( <li key={variety}>{variety}: {weight.toFixed(2)} kg</li> ))}
                     </ul>
                 ) : <p className="text-gray-500 text-sm italic">No harvests recorded in the last 7 days.</p>}
             </div>
            {/* Section 5: Detailed Summaries Toggle & Filters */}
             <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4 flex-wrap">
                     <button onClick={() => setShowMonthly(!showMonthly)} className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-150 ease-in-out text-sm flex items-center justify-center gap-1">
                       <CalendarIcon className="text-white"/> {showMonthly ? 'Hide' : 'Show'} Detailed Summaries
                    </button>
                    {showMonthly && (
                        <div className="flex flex-col sm:flex-row gap-4 items-center flex-wrap">
                            <div className="flex items-center gap-2">
                                <label htmlFor="yearFilter" className="text-sm font-medium text-gray-600 whitespace-nowrap">Monthly:</label>
                                <select id="yearFilter" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-white border border-gray-300 text-gray-800 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500">
                                    {dashboardData.allYears.length > 0 ? dashboardData.allYears.map(year => <option key={year} value={year}>{year}</option>) : <option disabled>No Data</option>}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="fyFilter" className="text-sm font-medium text-gray-600 whitespace-nowrap">Financial Year:</label>
                                <select id="fyFilter" value={selectedFy} onChange={(e) => setSelectedFy(e.target.value)} className="bg-white border border-gray-300 text-gray-800 rounded-md p-2 text-sm focus:ring-orange-500 focus:border-orange-500">
                                    {dashboardData.allFy.length > 0 ? dashboardData.allFy.map(fy => <option key={fy} value={fy}>{fy}</option>) : <option disabled>No Data</option>}
                                </select>
                            </div>
                        </div>
                    )}
                 </div>
                 {/* Detailed Summary Cards */}
                {showMonthly && (
                    <div className="mt-6 space-y-6">
                        <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1">Financial Year Summary</h4>
                         {dashboardData.processedFy.length > 0 ? dashboardData.processedFy.map(item => ( <PeriodSummaryCard key={item.key} title={item.key} summary={item.summary} /> )) : <p className="text-gray-500 text-center text-sm italic">No data available for {selectedFy}.</p>}
                         <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1 mt-6">Monthly Summaries for {selectedYear}</h4>
                        {dashboardData.processedMonthly.length > 0 ? dashboardData.processedMonthly.map(item => ( <PeriodSummaryCard key={item.key} title={item.key} summary={item.summary} /> )) : <p className="text-gray-500 text-center text-sm italic">No data available for {selectedYear}.</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardView; // Export the component

