// src/components/ActivitySection.jsx
import React, { useState } from 'react';

// Import required icons from your single icons file
// Adjust path if needed
import { ChevronUpIcon, ChevronDownIcon } from './icons'; // Assuming icons.jsx is in ./icons/

function ActivitySection({ title, icon, activities, defaultOpen = false }) {
    // State to manage whether the section is expanded or collapsed
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Header Button to Toggle Collapse State */}
            <button
                onClick={() => setIsOpen(!isOpen)} // Toggle the isOpen state on click
                className="flex justify-between items-center w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-t-lg" // Added focus ring
                aria-expanded={isOpen} // Indicate expanded state for accessibility
                aria-controls={`activity-content-${title.replace(/\s+/g, '-')}`} // Link button to content for accessibility
            >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    {icon} {/* Render the icon passed as a prop */}
                    {title} {/* Render the title passed as a prop */}
                </h3>
                {/* Show up or down chevron based on the isOpen state */}
                {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>

            {/* Collapsible Content Area */}
            {isOpen && (
                <div
                    id={`activity-content-${title.replace(/\s+/g, '-')}`} // ID for accessibility linking
                    className="px-4 pb-4 pt-0 border-t border-gray-200" // Padding and top border when open
                >
                    {/* Check if there are activities to display */}
                    {Array.isArray(activities) && activities.length > 0 ? (
                        <ul className="space-y-2 text-sm mt-3">
                            {/* Map over the activities array */}
                            {activities.map(activity => (
                                <li key={activity.key} className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    {/* Display timestamp */}
                                    <span className="text-gray-500 text-xs block mb-0.5">
                                        {activity.timestamp ? activity.timestamp : 'Timestamp N/A'} {/* Handle potential missing timestamp */}
                                    </span>
                                    {/* Display activity text */}
                                    <span className="text-gray-700">{activity.text}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        // Display message if no activities
                        <p className="text-gray-500 text-sm mt-3 italic">No recent activity for this stage.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default ActivitySection; // Export the component
