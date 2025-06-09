// src/components/Navbar.jsx
import React, { useState } from 'react';

// Import necessary icons from your single icons file
import { SettingsIcon } from './icons'; // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]

// Import your logo image
import logoImage from '../assets/LogoImage.png'; // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]

function Navbar({ currentView, setCurrentView, openSettingsPanel }) { // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
  // Display names for navigation items
  const navItems = ['Homepage', 'Lab', 'Incubation', 'Grow Room', 'Retirement', 'Dashboard']; // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
  // Map display names back to the internal state values used in App.js
  const viewMap = { // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
      'Homepage': 'Spawn Point',
      'Lab': 'Lab',
      'Incubation': 'Incubation',
      'Grow Room': 'Grow Room',
      'Retirement': 'Retirement',
      'Dashboard': 'Dashboard'
  };
  // State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]

  // Function to handle navigation and closing mobile menu
  const handleNavClick = (viewState) => { // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
    setCurrentView(viewState);
    setIsMobileMenuOpen(false);
  };

  // Function to handle settings click and closing mobile menu
    const handleSettingsClick = () => { // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
        openSettingsPanel();
        setIsMobileMenuOpen(false); // Close mobile menu if open
    };


  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
        {/* Increased overall navbar height from h-16 to h-20 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
            {/* Increased height of this div from h-16 to h-20 */}
            <div className="flex justify-between h-20"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                {/* Left side: Logo and Title */}
                <div className="flex items-center"> {/* Added items-center for better vertical alignment */}
                    <div className="flex-shrink-0 flex items-center mr-4"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                        <img
                            // Increased logo height from h-8 to h-10
                            className="block h-10 w-auto rounded-full" // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                            src={logoImage}
                            alt="MycoTrack Logo"
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/f97316/ffffff?text=M"; e.target.alt="MycoTrack Placeholder Logo"}} // Updated placeholder size
                         />
                         {/* Optionally increase text size if needed, e.g., text-2xl */}
                        <span className="font-bold text-xl md:text-2xl ml-3 text-gray-800">Spawn Point</span> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                    </div>
                    {/* Desktop Navigation Links - ensure they align well with taller navbar */}
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8 items-center"> {/* Added items-center */}
                        {navItems.map((item) => { // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                            const stateValue = viewMap[item];
                            return (
                                <button
                                    key={item}
                                    onClick={() => handleNavClick(stateValue)} // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                                    // Adjusted padding slightly for taller bar if needed, or rely on items-center
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-150 ease-in-out ${ // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                                        currentView === stateValue ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700' // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                                    }`}
                                    aria-current={currentView === stateValue ? 'page' : undefined} // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {/* Right side: Settings Icon */}
                <div className="hidden sm:ml-6 sm:flex sm:items-center"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                    <div className="ml-3 relative"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                        <div>
                            <button
                                type="button"
                                onClick={handleSettingsClick} // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500" // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                                id="settings-menu-button"
                            >
                                <span className="sr-only">Open settings</span> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                                <SettingsIcon /> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                            </button>
                        </div>
                    </div>
                </div>
                 {/* Mobile menu button */}
                 <div className="-mr-2 flex items-center sm:hidden"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500" // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                        aria-controls="mobile-menu"
                        aria-expanded={isMobileMenuOpen} // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                    >
                        <span className="sr-only">Open main menu</span> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                        {!isMobileMenuOpen && <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /> </svg>} {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                        {isMobileMenuOpen && <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> </svg>} {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                    </button>
                </div>
            </div>
        </div>
         {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
            <div className="pt-2 pb-3 space-y-1"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                 {navItems.map((item) => { // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                    const stateValue = viewMap[item]; // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                    return (
                        <button
                            key={item}
                            onClick={() => handleNavClick(stateValue)} // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                            className={`block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium ${ // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                                currentView === stateValue ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800' // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                            }`}
                            aria-current={currentView === stateValue ? 'page' : undefined} // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                        >
                            {item}
                        </button>
                    );
                 })}
            </div>
             <div className="pt-4 pb-3 border-t border-gray-200"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                 <div className="flex items-center px-4"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                     <div className="flex-shrink-0"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                         <button
                            type="button"
                            onClick={handleSettingsClick} // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
                            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                             <span className="sr-only">Settings</span> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                             <SettingsIcon /> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                         </button>
                     </div>
                 </div>
                 <div className="mt-3 space-y-1"> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                     <button onClick={handleSettingsClick} className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Settings</button> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                     <button className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Sign out</button> {/* [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx] */}
                 </div>
             </div>
        </div>
    </nav>
  );
}

export default Navbar; // [cite: uploaded:myconinburg/mushroom-tracker/mushroom-tracker-Tobys-Branch/src/components/Navbar.jsx]
