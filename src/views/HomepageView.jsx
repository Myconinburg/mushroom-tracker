// src/views/HomepageView.jsx
import React, { useState, useEffect, useMemo } from 'react';

// Import Components
import ActivitySection from '../components/ActivitySection'; // Adjust path if needed

// Import Icons (assuming they are in ../components/icons/icons.jsx)
// Adjust path if needed
import { HomeIcon, ActivityIcon, LabIcon, ClockIcon, ChartBarIcon, MushroomIcon, RecipeIcon, SupplierIcon } from '../components/icons';

function HomepageView({ batches, setCurrentView }) { // Receive setCurrentView as a prop
    const welcomeMessages = [
        "Welcome, fellow cultivator! May your mycelium run strong today.",
        "Ready to track some fungal feats? Let's grow!",
        "Spawn Point: Where great batches begin. What's new?",
        "Keep calm and cultivate on. Welcome back!",
        "Time to check on your mushroom magic!",
        "From spore to store, track it all here. Welcome!",
        "Wishing you low contamination and high yields!",
    ];
    const [currentMessageIndex, setCurrentMessageIndex] = useState( Math.floor(Math.random() * welcomeMessages.length) );

    // Cycle through welcome messages
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % welcomeMessages.length);
        }, 10000); // Change every 10 seconds
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [welcomeMessages.length]); // Rerun effect only if message count changes

    // --- Generate Activity Lists ---
    const { labActivity, incubationActivity, growRoomActivity } = useMemo(() => {
        // Ensure batches is an array before proceeding
        if (!Array.isArray(batches)) {
            console.warn("HomepageView: batches prop is not an array. Initializing as empty.");
            return { labActivity: [], incubationActivity: [], growRoomActivity: [] };
        }

        const allActivities = [];
        try {
            // Iterate over batches to create activity entries
            batches.forEach(batch => {
                // Basic check for valid batch object
                if (!batch || typeof batch !== 'object' || !batch.id) {
                    console.warn("Skipping invalid batch object:", batch);
                    return; // Skip this iteration if essential data is missing
                }
                // Use optional chaining and provide defaults for safety
                const batchLabel = batch.batchLabel || `ID ${batch.id}`;
                const variety = batch.variety || 'Unknown Variety';

                // Lab Activity: Batch Creation
                let creationTimestamp = batch.id; // Fallback timestamp
                try {
                    if (batch.inoculationDate) {
                        const ts = new Date(batch.inoculationDate + 'T00:00:00').getTime();
                        if (!isNaN(ts)) creationTimestamp = ts; // Use valid date timestamp if available
                    }
                } catch { /* Use fallback timestamp on error */ }
                allActivities.push({
                    key: `create-${batch.id}`,
                    stage: 'Lab',
                    timestamp: creationTimestamp,
                    displayTimestamp: new Date(creationTimestamp), // Store Date object for reliable sorting/display
                    text: `Batch ${batchLabel} (${variety}) created.`
                });

                // Incubation Activity: Colonisation Complete
                if (batch.colonisationCompleteDate) {
                    try {
                        const coloTimestamp = new Date(batch.colonisationCompleteDate + 'T00:00:00').getTime();
                        if (!isNaN(coloTimestamp)) {
                            allActivities.push({
                                key: `colo-${batch.id}`,
                                stage: 'Incubation',
                                timestamp: coloTimestamp,
                                displayTimestamp: new Date(coloTimestamp),
                                text: `Batch ${batchLabel} marked as fully colonised.`
                            });
                        }
                    } catch (e) { console.error("Error processing colonisation date for batch:", batch.id, e); }
                }

                // Incubation/Grow Activity: Moved to Grow Room
                if (batch.growRoomEntryDate && batch.stage !== 'incubation') {
                    try {
                        const growTimestamp = new Date(batch.growRoomEntryDate + 'T00:00:00').getTime();
                        if (!isNaN(growTimestamp)) {
                            allActivities.push({
                                key: `move-grow-${batch.id}`,
                                stage: 'Incubation', // Action originates from Incubation
                                timestamp: growTimestamp,
                                displayTimestamp: new Date(growTimestamp),
                                text: `Batch ${batchLabel} moved to Grow Room.`
                            });
                        }
                    } catch (e) { console.error("Error processing grow room entry date for batch:", batch.id, e); }
                }

                // Grow Room Activity: Harvest Logged
                if (Array.isArray(batch.harvests) && batch.harvests.length > 0) {
                    // Find the most recent valid harvest date
                    const latestHarvest = batch.harvests.reduce((latest, current) => {
                        try {
                            if (!current || !current.date) return latest; // Skip if harvest or date is missing
                            const currentDate = new Date(current.date + 'T00:00:00');
                            if (isNaN(currentDate.getTime())) return latest; // Skip invalid dates
                            // Ensure 'latest' is valid before comparison
                            return !latest || !latest.date || currentDate > latest.date ? { date: currentDate, weight: current?.weight || 0 } : latest;
                        } catch { return latest; } // Ignore errors during reduction
                    }, null);

                    if (latestHarvest && latestHarvest.date) { // Check if a valid latest harvest was found
                        allActivities.push({
                            key: `harvest-${batch.id}-${latestHarvest.date.getTime()}`, // More unique key
                            stage: 'Grow Room',
                            timestamp: latestHarvest.date.getTime(),
                            displayTimestamp: latestHarvest.date,
                            text: `Harvest logged for ${batchLabel} (${latestHarvest.weight} kg).`
                        });
                    }
                }

                // Grow Room Activity: Moved to Retirement
                if (batch.retirementDate && batch.stage === 'retired') {
                    try {
                        const retireTimestamp = new Date(batch.retirementDate + 'T00:00:00').getTime();
                        if (!isNaN(retireTimestamp)) {
                            allActivities.push({
                                key: `retire-${batch.id}`,
                                stage: 'Grow Room', // Action originates from Grow Room
                                timestamp: retireTimestamp,
                                displayTimestamp: new Date(retireTimestamp),
                                text: `Batch ${batchLabel} moved to Retirement.`
                            });
                        }
                    } catch (e) { console.error("Error processing retirement date for batch:", batch.id, e); }
                }
            });
        } catch (error) {
            console.error("Error processing batches for activity log:", error);
            // Return empty lists if an error occurs during the main loop
            return { labActivity: [], incubationActivity: [], growRoomActivity: [] };
        }

        // Sort all collected activities by timestamp descending
        allActivities.sort((a, b) => b.timestamp - a.timestamp);

        // Filter and take the top 5 for each section
        const labActivity = allActivities.filter(a => a.stage === 'Lab').slice(0, 5);
        const incubationActivity = allActivities.filter(a => a.stage === 'Incubation').slice(0, 5);
        const growRoomActivity = allActivities.filter(a => a.stage === 'Grow Room').slice(0, 5);

        // Format timestamps for display just before returning
        const formatDisplayTime = (activity) => ({
            ...activity,
            timestamp: activity.displayTimestamp instanceof Date && !isNaN(activity.displayTimestamp)
                       ? activity.displayTimestamp.toLocaleString()
                       : 'Timestamp N/A'
        });

        return {
            labActivity: labActivity.map(formatDisplayTime),
            incubationActivity: incubationActivity.map(formatDisplayTime),
            growRoomActivity: growRoomActivity.map(formatDisplayTime)
        };
    }, [batches]); // Dependency array

    // Handlers to navigate to management views using setCurrentView prop
    const handleManageVarieties = () => {
        console.log("Navigate to Manage Varieties view");
        setCurrentView('ManageVarieties'); // Use the key defined in App.js switch statement
    };
    const handleManageSubstrates = () => {
        console.log("Navigate to Manage Substrates view");
        setCurrentView('ManageSubstrates');
    };
    const handleManageSuppliers = () => {
        console.log("Navigate to Manage Suppliers view");
        setCurrentView('ManageSuppliers');
    };

    // Button style consistent with the theme
    const buttonStyle = "flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500";

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 p-6 rounded-lg shadow-sm text-center">
                 <h2 className="text-2xl md:text-3xl font-semibold mb-3 font-sans text-gray-800 flex items-center justify-center gap-2">
                    <HomeIcon /> Welcome to Spawn Point!
                </h2>
                <p className="text-lg text-orange-700 italic min-h-[2.5em]">
                    "{welcomeMessages[currentMessageIndex]}"
                </p>
            </div>

            {/* Activity Sections */}
            <div className="space-y-4">
                 <h2 className="text-xl font-semibold text-gray-800 mb-0 flex items-center gap-1">
                    <ActivityIcon/> Recent Activity
                 </h2>
                 <ActivitySection title="Lab Activity" icon={<LabIcon />} activities={labActivity} defaultOpen={true} />
                 <ActivitySection title="Incubation Activity" icon={<ClockIcon />} activities={incubationActivity} />
                 <ActivitySection title="Grow Room Activity" icon={<ChartBarIcon />} activities={growRoomActivity} />
            </div>

             {/* Management Buttons Section */}
             <div className="mt-8 pt-6 border-t border-gray-200">
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Manage Data</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <button onClick={handleManageVarieties} className={buttonStyle}>
                         <MushroomIcon /> Manage Varieties
                     </button>
                     <button onClick={handleManageSubstrates} className={buttonStyle}>
                         <RecipeIcon /> Manage Substrates
                     </button>
                     <button onClick={handleManageSuppliers} className={buttonStyle}>
                          <SupplierIcon /> Manage Suppliers
                     </button>
                 </div>
            </div>
            {/* Logout Button was previously removed */}
        </div>
    );
}

export default HomepageView; // Export the component
