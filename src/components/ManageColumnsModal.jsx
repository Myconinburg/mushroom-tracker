// src/components/ManageColumnsModal.jsx
import React, { useState } from 'react';
import ModalBase from './ModalBase';
import { PlusIcon, TrashIcon, CheckIcon } from './icons';

// A predefined color palette for a consistent look and feel
// The order matches the visual layout from the image provided.
const colorPalette = [
  '#F87171', // 1. Light Red
  '#FBBF24', // 2. Amber
  '#4ADE80', // 3. Green
  '#F472B6', // 4. Pink
  '#60A5FA', // 5. Blue
  '#9CA3AF', // 6. Gray
  '#8B5CF6', // 7. Violet
  '#52525B', // 8. Dark Gray
  '#DC2626', // 9. Solid Red
];

// A reusable component for rendering the color grid, styled to match the image.
const ColorPaletteGrid = ({ selectedColor, onColorSelect }) => {
  return (
    // Updated to a 3x3 grid
    <div className="grid grid-cols-3 gap-2 w-max">
      {colorPalette.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => onColorSelect(color)}
          className={`w-10 h-10 rounded-md border border-gray-900 transition-all duration-150 focus:outline-none 
            ${
            selectedColor === color
              // Add a ring for a clear selection indicator
              ? 'ring-2 ring-offset-2 ring-orange-500'
              : 'hover:opacity-80'
          }`}
          style={{ backgroundColor: color }}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
};


function ManageColumnsModal({
  isOpen,
  onClose,
  columns,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  viewName // e.g., "Incubation"
}) {
  const [newColumnName, setNewColumnName] = useState('');
  // Default to the first color in the palette
  const [newColumnColor, setNewColumnColor] = useState(colorPalette[0]);

  const handleAddClick = () => {
    if (newColumnName.trim() === '') {
      alert('Please enter a column name.');
      return;
    }
    onAddColumn(viewName, newColumnName, newColumnColor);
    setNewColumnName('');
    setNewColumnColor(colorPalette[0]); // Reset to default after adding
  };

  // --- List Item for Editing Existing Columns ---
  const ListItem = ({ column }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(column.title);
    const [color, setColor] = useState(column.color);

    const handleUpdate = () => {
      onUpdateColumn(viewName, column.id, { title, color });
      setIsEditing(false);
    };

    return (
      <li className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b border-gray-200 gap-2">
        {isEditing ? (
          <div className="flex-grow w-full space-y-3">
            <div className="flex items-center gap-2 flex-grow">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-md"
              />
              <button onClick={handleUpdate} className="p-2 text-green-600 hover:text-green-800" aria-label="Confirm changes">
                  <CheckIcon className="h-5 w-5" />
              </button>
            </div>
            <ColorPaletteGrid selectedColor={color} onColorSelect={setColor} />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsEditing(true)}>
              <span className="w-5 h-5 rounded-md border border-gray-400 flex-shrink-0" style={{ backgroundColor: column.color }}></span>
              <span className="font-medium">{column.title}</span>
            </div>
            <button
              onClick={() => onDeleteColumn(viewName, column.id)}
              className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 self-end sm:self-center"
              title={`Delete ${column.title}`}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </li>
    );
  };

  const modalFooter = (
    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">
      Close
    </button>
  );

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} title={`Manage ${viewName} Columns`} footerContent={modalFooter}>
      <div className="space-y-6">
        {/* Add New Column Section */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
          <h4 className="text-md font-semibold text-gray-800">Add New Column</h4>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="New column name..."
              className="flex-grow p-2 border border-gray-300 rounded-md"
            />
            <button onClick={handleAddClick} className="flex items-center justify-center p-2 bg-green-600 text-white rounded-md hover:bg-green-700" aria-label="Add new column">
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Column Color</label>
            <ColorPaletteGrid selectedColor={newColumnColor} onColorSelect={setNewColumnColor} />
          </div>
        </div>

        {/* Existing Columns List */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-2">Existing Columns</h3>
          {columns && columns.length > 0 ? (
            <ul className="space-y-1">
              {columns.map(col => <ListItem key={col.id} column={col} />)}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No columns created yet.</p>
          )}
        </div>
      </div>
    </ModalBase>
  );
}

export default ManageColumnsModal;
