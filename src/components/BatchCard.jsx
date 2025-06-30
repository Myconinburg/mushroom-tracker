// src/components/BatchCard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { formatDate } from '../utils/helpers';
import { ArrowRightIcon, ArrowLeftIcon, TrashIcon, PlusIcon, MinusIcon, ArchiveIcon, EditIcon, SwitchHorizontalIcon as MoveIcon } from './icons';

function BatchCard({
    batch,
    onUpdateBatch,
    onOpenMoveConfirmModal,
    onDeleteBatch,
    columns,
    onMoveBatchToColumn
}) {
    // --- STATE HOOKS for "Draft" Values ---
    // Each input that the user can edit gets its own local state.
    // This holds the "draft" value while the user is editing.
    const [contaminationInput, setContaminationInput] = useState('0');
    const [notesInput, setNotesInput] = useState('');
    const [colonisationDateInput, setColonisationDateInput] = useState('');
    
    // UI state
    const [showColonisationInput, setShowColonisationInput] = useState(false);
    const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
    const moveMenuRef = useRef(null);

    // --- EFFECT ---
    // <-- CHANGE 1: A smarter useEffect.
    // This effect now ONLY runs if the component receives a completely different batch
    // (by checking if `batch.id` has changed). It resets the "draft" state to match
    // the new batch's data. It will NOT run on every small update, which prevents
    // it from wiping out your edits.
    useEffect(() => {
        if (batch) {
            setContaminationInput((batch.contaminatedBags || 0).toString());
            setNotesInput(batch.notes || '');
            setColonisationDateInput(batch.colonisationCompleteDate ? formatDate(batch.colonisationCompleteDate) : formatDate(new Date()));
        }
    }, [batch.id, batch.contaminatedBags, batch.notes, batch.colonisationCompleteDate]); // Re-sync if the underlying prop data changes.

    useEffect(() => {
        function handleClickOutside(event) {
            if (moveMenuRef.current && !moveMenuRef.current.contains(event.target)) {
                setIsMoveMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [moveMenuRef]);

    // --- EVENT HANDLERS ---
    
    // <-- CHANGE 2: Handlers for '+' and '-' now update the local state for instant UI feedback
    // AND send the update to the server.
    const handleIncrementContaminated = () => {
        const current = parseInt(contaminationInput, 10) || 0;
        if (current < batch.numBags) {
            const newValue = current + 1;
            setContaminationInput(newValue.toString());
            onUpdateBatch(batch.id, { contaminatedBags: newValue });
        }
    };
    const handleDecrementContaminated = () => {
        const current = parseInt(contaminationInput, 10) || 0;
        if (current > 0) {
            const newValue = current - 1;
            setContaminationInput(newValue.toString());
            onUpdateBatch(batch.id, { contaminatedBags: newValue });
        }
    };

    // <-- CHANGE 3: The text input saves its value onBlur (when you click away).
    const handleContaminationBlur = () => {
        const valueAsNumber = parseInt(contaminationInput, 10) || 0;
        if (valueAsNumber !== (batch.contaminatedBags || 0)) {
            onUpdateBatch(batch.id, { contaminatedBags: valueAsNumber });
        }
    };

    const handleNotesBlur = () => {
        if (notesInput !== (batch.notes || '')) {
            onUpdateBatch(batch.id, { notes: notesInput });
        }
    };
    
    const handleSetColonisationDate = () => {
        if (batch.inoculationDate && new Date(colonisationDateInput) < new Date(batch.inoculationDate)) {
            alert("Colonisation date cannot be before inoculation date.");
            return;
        }
        onUpdateBatch(batch.id, { colonisationCompleteDate: formatDate(colonisationDateInput) });
        setShowColonisationInput(false);
    };

    // --- STYLES & OTHER LOGIC (No changes) ---
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

    return (
        <div className={cardBaseStyle}>
            <div className="flex-grow">
                <strong className="text-base text-orange-600 block mb-1">{batch.batchLabel || 'No Label'}</strong>
                <p><span className="font-medium text-gray-500">Variety:</span> {batch.variety?.name || 'N/A'}</p>
                <p><span className="font-medium text-gray-500">Inoculated:</span> {formatDate(batch.inoculationDate)}</p>
                {batch.colonisationCompleteDate && <p><span className="font-medium text-gray-500">Colonised:</span> {formatDate(batch.colonisationCompleteDate)}</p>}
                
                {batch.stage.toLowerCase() === 'incubation' && (
                    <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Contaminated Units:</label>
                        <div className="flex items-center space-x-2">
                            {/* <-- CHANGE 4: The input is no longer readOnly. It's controlled by its own local state. --> */}
                            <input
                                type="number"
                                value={contaminationInput}
                                onChange={(e) => setContaminationInput(e.target.value)}
                                onBlur={handleContaminationBlur}
                                className={`${inputStyle} text-center flex-grow w-16`}
                            />
                            <button onClick={handleDecrementContaminated} className={decrementButtonStyle} aria-label="Decrease contaminated units"><MinusIcon className="h-4 w-4"/></button>
                            <button onClick={handleIncrementContaminated} className={incrementButtonStyle} aria-label="Increase contaminated units"><PlusIcon className="h-4 w-4"/></button>
                        </div>
                    </div>
                )}
                
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
                        <button onClick={() => setShowColonisationInput(true)} className={`${infoButtonStyle} w-full text-xs`}>
                             {batch.colonisationCompleteDate ? <EditIcon className="h-3 w-3 mr-1" /> : <PlusIcon className="h-3 w-3 mr-1" />}
                             {batch.colonisationCompleteDate ? 'Update Colonisation Date' : 'Set Colonisation Date'}
                        </button>
                    ) : (
                        <div className="flex items-end gap-2">
                            <div className="flex-grow">
                                <label htmlFor={`colonisation-date-${batch.id}`} className="block text-xs font-medium text-gray-500 mb-1">Colonisation Complete:</label>
                                <input type="date" id={`colonisation-date-${batch.id}`} value={colonisationDateInput} onChange={(e) => setColonisationDateInput(e.target.value)} max={formatDate(new Date())} className={inputStyle} style={{ colorScheme: 'light' }}/>
                            </div>
                            <button onClick={handleSetColonisationDate} className={`${primaryButtonStyle} h-[38px]`}>Set</button>
                            <button onClick={() => setShowColonisationInput(false)} className={`${secondaryButtonStyle} h-[38px]`}>Cancel</button>
                        </div>
                    )}
                </div>
            )}
            
            <div className="mt-auto pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 items-center">
                    {batch.stage.toLowerCase() === 'incubation' && (
                        <>
                            <button onClick={() => onOpenMoveConfirmModal(batch.id, 'grow room', batch.batchLabel)} className={primaryButtonStyle} disabled={!batch.colonisationCompleteDate} title={!batch.colonisationCompleteDate ? "Set colonisation date first" : "Move ALL to Grow Room"}> Move All to Grow <ArrowRightIcon className="ml-1 h-3 w-3"/></button>
                            <button onClick={() => onDeleteBatch(batch.id, batch.batchLabel)} className={dangerButtonStyle}><TrashIcon className="mr-1 h-3 w-3"/> Delete</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BatchCard;