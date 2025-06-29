// src/components/BatchCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { formatDate } from '../utils/helpers';
import { ArrowRightIcon, ArrowLeftIcon, TrashIcon, PlusIcon, MinusIcon, ArchiveIcon, EditIcon, SwitchHorizontalIcon as MoveIcon } from './icons';

function BatchCard({
    batch,
    onUpdateBatch,
    onOpenMoveConfirmModal,
    onDeleteBatch,
    onOpenHarvestModal,
    onOpenMovePartialModal,
    columns,
    onMoveBatchToColumn
}) {
    // --- STATE HOOKS ---
    const [showHarvests, setShowHarvests] = useState(false);
    const [showColonisationInput, setShowColonisationInput] = useState(false);
    const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
    const moveMenuRef = useRef(null);

    // <-- CHANGE 1: Local state for inputs. These allow the user to type freely
    // without causing a network request on every single keystroke.
    const [contaminationInput, setContaminationInput] = useState('0');
    const [colonisationDateInput, setColonisationDateInput] = useState('');
    const [notesInput, setNotesInput] = useState('');

    // --- EFFECTS ---

    // <-- CHANGE 2: Robust useEffect to sync ALL local state from props.
    // This now runs whenever the entire `batch` object changes, ensuring
    // the card always displays the latest data from App.js after an update.
    useEffect(() => {
        if (batch) {
            setContaminationInput((batch.contaminatedBags || 0).toString());
            setColonisationDateInput(batch.colonisationCompleteDate ? formatDate(batch.colonisationCompleteDate) : '');
            setNotesInput(batch.notes || '');
        }
    }, [batch]); // The dependency is now the whole batch object.

    useEffect(() => {
        function handleClickOutside(event) {
            if (moveMenuRef.current && !moveMenu_ref.current.contains(event.target)) {
                setIsMoveMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [moveMenuRef]);

    // --- EVENT HANDLERS ---
    
    // Contamination handlers now call onUpdateBatch immediately as before.
    const handleIncrementContaminated = () => { const current = batch.contaminatedBags || 0; if (current < (batch.numBags || 0)) { onUpdateBatch(batch.id, { contaminatedBags: current + 1 }); }};
    const handleDecrementContaminated = () => { const current = batch.contaminatedBags || 0; if (current > 0) { onUpdateBatch(batch.id, { contaminatedBags: current - 1 }); }};
    const handleContaminationBlur = () => {
        const value = parseInt(contaminationInput, 10) || 0;
        const validValue = Math.min(Math.max(0, value), batch.numBags || 0);
        onUpdateBatch(batch.id, { contaminatedBags: validValue });
    };

    // <-- CHANGE 3: Notes are now only saved onBlur (when you click away).
    const handleNotesBlur = () => {
        // Only send an update if the notes have actually changed.
        if (notesInput !== (batch.notes || '')) {
            onUpdateBatch(batch.id, { notes: notesInput });
        }
    };
    
    const handleSetColonisationDate = () => {
        if (colonisationDateInput) {
            if (batch.inoculationDate && new Date(colonisationDateInput) < new Date(batch.inoculationDate)) {
                alert("Colonisation date cannot be before inoculation date.");
                return;
            }
            onUpdateBatch(batch.id, { colonisationCompleteDate: formatDate(colonisationDateInput) });
        } else {
            onUpdateBatch(batch.id, { colonisationCompleteDate: null });
        }
        setShowColonisationInput(false);
    };

    const toggleColonisationInput = () => {
        if (!showColonisationInput) {
            setColonisationDateInput(batch.colonisationCompleteDate ? formatDate(batch.colonisationCompleteDate) : formatDate(new Date()));
        }
        setShowColonisationInput(!showColonisationInput);
    };
    
    // --- DERIVED STATE & STYLES (No changes here) ---
    const totalHarvested = Array.isArray(batch.harvests) ? batch.harvests.reduce((sum, h) => sum + (h?.weight || 0), 0).toFixed(2) : "0.00";
    const isNew = () => {
        if (!batch.createdAt) return false;
        const todayStr = new Date().toISOString().split('T')[0];
        const createdAtStr = batch.createdAt.split('T')[0];
        return todayStr === createdAtStr;
    };
    const isBatchNew = isNew();
    const cardBaseStyle = `bg-white border-gray-200 rounded-lg shadow-sm p-4 text-sm text-gray-700 flex flex-col h-full relative border-2 transition-colors duration-300 ${isBatchNew ? 'border-blue-500' : 'border-transparent'}`;
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500";
    const textareaStyle = `${inputStyle} placeholder-gray-400`;
    const buttonBaseStyle = "flex items-center justify-center text-xs font-medium rounded-md border cursor-pointer transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
    const primaryButtonStyle = `${buttonBaseStyle} px-3 py-1.5 bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600`;
    const dangerButtonStyle = `${buttonBaseStyle} px-3 py-1.5 bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700`;
    const incrementButtonStyle = `${buttonBaseStyle} bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 p-2`;
    const decrementButtonStyle = `${buttonBaseStyle} bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600 p-2`;
    const secondaryButtonStyle = `${buttonBaseStyle} px-3 py-1.5 bg-white border-gray-300 text-gray-700 hover:bg-gray-50`;
    const infoButtonStyle = `${buttonBaseStyle} px-3 py-1.5 bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600`;
    const moveColumnButtonStyle = `${buttonBaseStyle} px-2 py-1.5 bg-gray-200 border-gray-200 text-gray-600 hover:bg-gray-300`;


    return (
        <div className={cardBaseStyle}>
            <div className="flex-grow">
                <strong className="text-base text-orange-600 block mb-1">{batch.batchLabel || 'No Label'}</strong>
                <p><span className="font-medium text-gray-500">Variety:</span> {batch.variety?.name || 'N/A'}</p>
                <p><span className="font-medium text-gray-500">Inoculated:</span> {formatDate(batch.inoculationDate)}</p>
                {batch.colonisationCompleteDate && <p><span className="font-medium text-gray-500">Colonised:</span> {formatDate(batch.colonisationCompleteDate)}</p>}
                
                {batch.stage.toLowerCase() === 'incubation' && (
                    <div className="mt-2">
                        <label htmlFor={`contaminated-${batch.id}`} className="block text-xs font-medium text-gray-500 mb-1">Contaminated Units:</label>
                        <div className="flex items-center space-x-2">
                            {/* <-- CHANGE 4: Contamination input now uses local state for value and onChange, but saves onBlur --> */}
                            <input type="number" id={`contaminated-${batch.id}`} value={contaminationInput} onChange={(e) => setContaminationInput(e.target.value)} onBlur={handleContaminationBlur} min="0" max={batch.numBags || 0} className={`${inputStyle} text-center flex-grow w-16`} />
                            <button onClick={handleDecrementContaminated} className={decrementButtonStyle} aria-label="Decrease contaminated units"><MinusIcon className="h-4 w-4"/></button>
                            <button onClick={handleIncrementContaminated} className={incrementButtonStyle} aria-label="Increase contaminated units"><PlusIcon className="h-4 w-4"/></button>
                        </div>
                    </div>
                )}
                
                {/* <-- CHANGE 5: Notes textarea now uses local state and saves onBlur --> */}
                <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Notes:</label>
                    <textarea
                        rows="2"
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        onBlur={handleNotesBlur}
                        className={textareaStyle}
                        placeholder="Add notes..."
                    />
                </div>
            </div>

            {batch.stage.toLowerCase() === 'incubation' && (
                <div className="my-3 py-3 border-t border-b border-gray-200">
                    {!showColonisationInput ? (
                        <button onClick={toggleColonisationInput} className={`${infoButtonStyle} w-full text-xs`}>
                            {batch.colonisationCompleteDate ? <EditIcon className="h-3 w-3 mr-1" /> : <PlusIcon className="h-3 w-3 mr-1" />}
                            {batch.colonisationCompleteDate ? 'Update Colonisation Date' : 'Set Colonisation Date'}
                        </button>
                    ) : (
                        <div className="flex items-end gap-2">
                            {/* <-- CHANGE 6: Colonisation date input now uses local state --> */}
                            <div className="flex-grow"><label htmlFor={`colonisation-date-${batch.id}`} className="block text-xs font-medium text-gray-500 mb-1">Colonisation Complete:</label><input type="date" id={`colonisation-date-${batch.id}`} value={colonisationDateInput} onChange={(e) => setColonisationDateInput(e.target.value)} max={formatDate(new Date())} className={inputStyle} style={{ colorScheme: 'light' }}/></div>
                            <button onClick={handleSetColonisationDate} className={`${primaryButtonStyle} h-[38px]`}>Set</button>
                            <button onClick={toggleColonisationInput} className={`${secondaryButtonStyle} h-[38px]`}>Cancel</button>
                        </div>
                    )}
                </div>
            )}

            {/* --- ACTION BUTTONS (No changes needed below) --- */}
            <div className="mt-auto pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 items-center">
                    {batch.stage.toLowerCase() === 'incubation' && (
                        <>
                            <button onClick={() => onOpenMoveConfirmModal(batch.id, 'grow room', batch.batchLabel)} className={primaryButtonStyle} disabled={!batch.colonisationCompleteDate} title={!batch.colonisationCompleteDate ? "Set colonisation date first" : "Move ALL to Grow Room"}> Move All to Grow <ArrowRightIcon className="ml-1 h-3 w-3"/></button>
                            {columns && columns.length > 1 && (
                                <div className="relative" ref={moveMenuRef}>
                                    <button onClick={() => setIsMoveMenuOpen(prev => !prev)} className={moveColumnButtonStyle} title="Move to another column">
                                        <MoveIcon className="h-4 w-4" />
                                    </button>
                                    {isMoveMenuOpen && (
                                        <div className="absolute bottom-full mb-2 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                            <div className="py-1">
                                                <p className="px-3 py-1 text-xs text-gray-500">Move to...</p>
                                                {columns.filter(c => c.id !== batch.columnId).map(col => (
                                                    <button
                                                        key={col.id}
                                                        onClick={() => {
                                                            onMoveBatchToColumn(batch.id, col.id);
                                                            setIsMoveMenuOpen(false);
                                                        }}
                                                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: col.color}}></span>
                                                        {col.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button onClick={() => onDeleteBatch(batch.id, batch.batchLabel)} className={dangerButtonStyle}><TrashIcon className="mr-1 h-3 w-3"/> Delete</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BatchCard;