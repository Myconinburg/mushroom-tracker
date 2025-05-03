// src/components/Navbar.jsx
import React, { useState } from 'react';

// Import necessary icons from your single icons file
// Make sure the path './icons' is correct relative to Navbar.jsx
import { SettingsIcon } from './icons';

// Import your logo image
// Make sure the path '../assets/LogoImage.png' is correct
import logoImage from '../assets/LogoImage.png';

function Navbar({ currentView, setCurrentView, openSettingsPanel }) {
  // Display names for navigation items
  const navItems = ['Homepage', 'Lab', 'Incubation', 'Grow Room', 'Retirement', 'Dashboard'];
  // Map display names back to the internal state values used in App.js
  const viewMap = {
      'Homepage': 'Spawn Point', // Display 'Homepage' but set state to 'Spawn Point'
      'Lab': 'Lab',
      'Incubation': 'Incubation',
      'Grow Room': 'Grow Room',
      'Retirement': 'Retirement',
      'Dashboard': 'Dashboard'
  };
  // State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to handle navigation and closing mobile menu
  const handleNavClick = (viewState) => {
    setCurrentView(viewState);
    setIsMobileMenuOpen(false);
  };

  // Function to handle settings click and closing mobile menu
    const handleSettingsClick = () => {
        openSettingsPanel();
        setIsMobileMenuOpen(false); // Close mobile menu if open
    };


  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                {/* Left side: Logo and Title */}
                <div className="flex">
                    <div className="flex-shrink-0 flex items-center mr-4">
                        <img
                            className="block h-8 w-auto rounded-full" // Keep logo size consistent
                            src={logoImage} // Use the imported image variable
                            alt="MycoTrack Logo"
                            // Basic fallback placeholder
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/32x32/f97316/ffffff?text=M"; e.target.alt="MycoTrack Placeholder Logo"}}
                         />
                        <span className="font-bold text-xl ml-2 text-gray-800">Spawn Point</span> {/* App title */}
                    </div>
                    {/* Desktop Navigation Links */}
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                        {navItems.map((item) => {
                            const stateValue = viewMap[item]; // Get the internal state value
                            return (
                                <button
                                    key={item}
                                    // Set the currentView state using the internal value
                                    onClick={() => handleNavClick(stateValue)}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out ${
                                        // Compare currentView state with the internal value for highlighting
                                        currentView === stateValue ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                    aria-current={currentView === stateValue ? 'page' : undefined}
                                >
                                    {item} {/* Display the user-friendly name */}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {/* Right side: Settings Icon */}
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    <div className="ml-3 relative">
                        <div>
                            <button
                                type="button"
                                onClick={handleSettingsClick} // Use handler
                                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                id="settings-menu-button" // Renamed ID for clarity
                            >
                                <span className="sr-only">Open settings</span>
                                <SettingsIcon />
                            </button>
                        </div>
                    </div>
                </div>
                 {/* Mobile menu button */}
                 <div className="-mr-2 flex items-center sm:hidden">
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Toggle mobile menu
                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                        aria-controls="mobile-menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <span className="sr-only">Open main menu</span>
                        {/* Hamburger icon */}
                        {!isMobileMenuOpen && <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /> </svg>}
                        {/* Close icon */}
                        {isMobileMenuOpen && <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> </svg>}
                    </button>
                </div>
            </div>
        </div>
         {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
            <div className="pt-2 pb-3 space-y-1">
                 {navItems.map((item) => {
                    const stateValue = viewMap[item];
                    return (
                        <button
                            key={item}
                            onClick={() => handleNavClick(stateValue)}
                            className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                                currentView === stateValue ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                            }`}
                            aria-current={currentView === stateValue ? 'page' : undefined}
                        >
                            {item}
                        </button>
                    );
                 })}
            </div>
             <div className="pt-4 pb-3 border-t border-gray-200">
                 <div className="flex items-center px-4">
                     <div className="flex-shrink-0">
                         <button
                            type="button"
                            onClick={handleSettingsClick} // Use handler
                            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                             <span className="sr-only">Settings</span>
                             <SettingsIcon />
                         </button>
                     </div>
                 </div>
                 <div className="mt-3 space-y-1">
                     {/* You might want specific actions here, like opening settings */}
                     <button onClick={handleSettingsClick} className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Settings</button>
                     <button className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Sign out</button>
                 </div>
             </div>
        </div>
    </nav>
  );
}

export default Navbar; // Make sure to export the component
