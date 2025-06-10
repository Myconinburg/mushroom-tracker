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
    const [colonisationDateInput, setColonisationDateInput] = useState(batch?.colonisationCompleteDate ? formatDate(batch.colonisationCompleteDate) : '');
    const [showColonisationInput, setShowColonisationInput] = useState(false);
    const safeBatch = batch || {};
    const [contaminationInput, setContaminationInput] = useState((safeBatch.contaminatedBags || 0).toString());
    const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
    const moveMenuRef = useRef(null);

    // --- EFFECTS ---
    useEffect(() => { setContaminationInput((safeBatch.contaminatedBags || 0).toString()); }, [safeBatch.contaminatedBags]);
    useEffect(() => { setColonisationDateInput(safeBatch.colonisationCompleteDate ? formatDate(safeBatch.colonisationCompleteDate) : ''); }, [safeBatch.colonisationCompleteDate]);
    
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
    const handleContaminationInputChange = (e) => { setContaminationInput(e.target.value); };
    const handleContaminationBlur = () => { onUpdateBatch(safeBatch.id, { contaminatedBags: Math.min(Math.max(0, parseInt(contaminationInput, 10) || 0), safeBatch.numBags || 0) }); };
    const handleIncrementContaminated = () => { const current = safeBatch.contaminatedBags || 0; if (current < (safeBatch.numBags || 0)) { onUpdateBatch(safeBatch.id, { contaminatedBags: current + 1 }); }};
    const handleDecrementContaminated = () => { const current = safeBatch.contaminatedBags || 0; if (current > 0) { onUpdateBatch(safeBatch.id, { contaminatedBags: current - 1 }); }};
    const handleNotesChange = (e) => { onUpdateBatch(safeBatch.id, { notes: e.target.value }); };
    const handleRemoveHarvest = (index) => { if (!Array.isArray(safeBatch.harvests)) return; const updatedHarvests = [...safeBatch.harvests]; updatedHarvests.splice(index, 1); onUpdateBatch(safeBatch.id, { harvests: updatedHarvests }); };
    const handleSetColonisationDate = () => { if (colonisationDateInput) { if (safeBatch.inoculationDate && new Date(colonisationDateInput) < new Date(safeBatch.inoculationDate)) { alert("Colonisation date cannot be before inoculation date."); return; } onUpdateBatch(safeBatch.id, { colonisationCompleteDate: formatDate(colonisationDateInput) }); } else { onUpdateBatch(safeBatch.id, { colonisationCompleteDate: null }); } setShowColonisationInput(false); };
    const toggleColonisationInput = () => { if (!showColonisationInput) { setColonisationDateInput(safeBatch.colonisationCompleteDate ? formatDate(safeBatch.colonisationCompleteDate) : formatDate(new Date())); } setShowColonisationInput(!showColonisationInput); };

    // --- DERIVED STATE & CALCULATIONS ---
    const totalHarvested = Array.isArray(safeBatch.harvests) ? safeBatch.harvests.reduce((sum, h) => sum + (h?.weight || 0), 0).toFixed(2) : "0.00";
    
    const isNew = () => {
        if (!safeBatch.createdAt) return false;
        const todayStr = new Date().toISOString().split('T')[0];
        const createdAtStr = safeBatch.createdAt.split('T')[0];
        return todayStr === createdAtStr;
    };
    const isBatchNew = isNew();

    // --- STYLES ---
    const cardBaseStyle = `bg-white border-gray-200 rounded-lg shadow-sm p-4 text-sm text-gray-700 flex flex-col h-full relative border-2 transition-colors duration-300 ${isBatchNew ? 'border-blue-500' : 'border-transparent'}`;
    const inputStyle = "w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500";
    const textareaStyle = `${inputStyle} placeholder-gray-400`;
    const buttonBaseStyle = "flex items-center justify-center text-xs font-medium rounded-md border cursor-pointer transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
    const primaryButtonStyle = `${buttonBaseStyle} px-3 py-1.5 bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600`;
    const secondaryButtonStyle = `${buttonBaseStyle} px-3 py-1.5 bg-white border-gray-300 text-gray-700 hover:bg-gray-50`;
    const dangerButtonStyle = `${buttonBaseStyle} px-3 py-1.5 bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700`;
    const incrementButtonStyle = `${buttonBaseStyle} bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 p-2`;
    const decrementButtonStyle = `${buttonBaseStyle} bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600 p-2`;
    const infoButtonStyle = `${buttonBaseStyle} px-3 py-1.5 bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600`;
    const movePartialButtonStyle = `${buttonBaseStyle} px-3 py-1.5 bg-teal-500 border-teal-500 text-white hover:bg-teal-600 hover:border-teal-600`;
    const compactButtonBase = "flex items-center justify-center px-2.5 py-1 text-xs font-medium rounded-md border transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
    const compactPrimaryButtonStyle = `${compactButtonBase} bg-orange-500 border-orange-500 text-white hover:bg-orange-600 hover:border-orange-600`;
    const compactSecondaryButtonStyle = `${compactButtonBase} bg-white border-gray-300 text-gray-700 hover:bg-gray-50`;
    const moveColumnButtonStyle = `${buttonBaseStyle} px-2 py-1.5 bg-gray-200 border-gray-200 text-gray-600 hover:bg-gray-300`;

    return (
        <div className={cardBaseStyle}>
            <div className="flex-grow">
                <strong className="text-base text-orange-600 block mb-1">{safeBatch.batchLabel || 'No Label'}</strong>
                
                {/* MERGED: This line now includes the ?.name fix to prevent crashes. */}
                <p><span className="font-medium text-gray-500">Variety:</span> {safeBatch.variety?.name || 'N/A'}</p>
                
                <p><span className="font-medium text-gray-500">Inoculated:</span> {formatDate(safeBatch.inoculationDate)}</p>
                {safeBatch.colonisationCompleteDate && <p><span className="font-medium text-gray-500">Colonised:</span> {formatDate(safeBatch.colonisationCompleteDate)}</p>}
                {safeBatch.stage === 'grow' && safeBatch.growRoomEntryDate && <p><span className="font-medium text-gray-500">Entered Grow:</span> {formatDate(safeBatch.growRoomEntryDate)}</p>}
                {safeBatch.stage === 'retired' && safeBatch.retirementDate && <p><span className="font-medium text-gray-500">Retired:</span> {formatDate(safeBatch.retirementDate)}</p>}
                <p><span className="font-medium text-gray-500">Units:</span> {safeBatch.numBags || 0} x {safeBatch.unitWeight || '?'} kg {safeBatch.unitType || 'units'}</p>

                {safeBatch.stage === 'incubation' && (
                    <div className="mt-2">
                        <label htmlFor={`contaminated-${safeBatch.id}`} className="block text-xs font-medium text-gray-500 mb-1">Contaminated Units:</label>
                        <div className="flex items-center space-x-2">
                            <input type="number" id={`contaminated-${safeBatch.id}`} value={contaminationInput} onChange={handleContaminationInputChange} onBlur={handleContaminationBlur} min="0" max={safeBatch.numBags || 0} className={`${inputStyle} text-center flex-grow w-16`} />
                            <button onClick={handleDecrementContaminated} className={decrementButtonStyle} aria-label="Decrease contaminated units"><MinusIcon className="h-4 w-4"/></button>
                            <button onClick={handleIncrementContaminated} className={incrementButtonStyle} aria-label="Increase contaminated units"><PlusIcon className="h-4 w-4"/></button>
                        </div>
                    </div>
                )}
                {(safeBatch.stage === 'retired' || safeBatch.stage === 'grow') && ( <p><span className="font-medium text-gray-500">Contaminated:</span> {safeBatch.contaminatedBags || 0} units</p> )}
                <p><span className="font-medium text-gray-500">Substrate:</span> {safeBatch.substrateRecipe || 'N/A'}</p>
                <p><span className="font-medium text-gray-500">Spawn:</span> {safeBatch.spawnSupplier || 'N/A'}</p>
                {(safeBatch.stage === 'incubation' || safeBatch.stage === 'grow') && ( <div className="mt-2"> <label className="block text-xs font-medium text-gray-500 mb-1">Notes:</label> <textarea rows="2" value={safeBatch.notes || ''} onChange={handleNotesChange} className={textareaStyle} placeholder="Add notes..."/> </div> )}
                {safeBatch.stage === 'retired' && ( <p><span className="font-medium text-gray-500">Notes:</span> {safeBatch.notes || '—'}</p> )}
                {(safeBatch.stage === 'grow' || safeBatch.stage === 'retired') && (
                    <div className="mt-2">
                        <p><span className="font-medium text-gray-500">Total Harvested:</span> {totalHarvested} kg</p>
                        {Array.isArray(safeBatch.harvests) && safeBatch.harvests.length > 0 && safeBatch.stage === 'grow' && (
                            <>
                                <button onClick={() => setShowHarvests(!showHarvests)} className={`mt-2 mb-1 px-2 py-1 rounded text-xs border border-gray-300 ${showHarvests ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-50 text-gray-600`}>{showHarvests ? 'Hide' : 'Show'} Harvest Entries</button>
                                {showHarvests && ( <div className="mt-1 space-y-1 text-xs bg-gray-50 p-2 rounded border border-gray-200 max-h-24 overflow-y-auto">{safeBatch.harvests.map((h, i) => ( <div key={i} className="flex justify-between items-center"><span>{formatDate(h?.date)} - {h?.weight || 0} kg</span><button onClick={() => handleRemoveHarvest(i)} className="ml-2 text-red-500 hover:text-red-700">&times;</button></div>))}</div>)}
                            </>
                        )}
                    </div>
                )}
            </div>

            {safeBatch.stage === 'incubation' && (
                <div className="my-3 py-3 border-t border-b border-gray-200">
                    {!showColonisationInput ? (
                        <button onClick={toggleColonisationInput} className={`${infoButtonStyle} w-full text-xs`}>
                            {safeBatch.colonisationCompleteDate ? <EditIcon className="h-3 w-3 mr-1" /> : <PlusIcon className="h-3 w-3 mr-1" />}
                            {safeBatch.colonisationCompleteDate ? 'Update Colonisation Date' : 'Set Colonisation Date'}
                        </button>
                    ) : (
                        <div className="flex items-end gap-2">
                            <div className="flex-grow"><label htmlFor={`colonisation-date-${safeBatch.id}`} className="block text-xs font-medium text-gray-500 mb-1">Colonisation Complete:</label><input type="date" id={`colonisation-date-${safeBatch.id}`} value={colonisationDateInput} onChange={(e) => setColonisationDateInput(e.target.value)} max={formatDate(new Date())} className={inputStyle} style={{ colorScheme: 'light' }}/></div>
                            <button onClick={handleSetColonisationDate} className={`${primaryButtonStyle} h-[38px]`}>Set</button>
                            <button onClick={toggleColonisationInput} className={`${secondaryButtonStyle} h-[38px]`}>Cancel</button>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-auto pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 items-center">
                    {safeBatch.stage === 'incubation' && (
                        <>
                            <button onClick={() => onOpenMoveConfirmModal(safeBatch.id, 'grow', safeBatch.batchLabel)} className={primaryButtonStyle} disabled={!safeBatch.colonisationCompleteDate} title={!safeBatch.colonisationCompleteDate ? "Set colonisation date first" : "Move ALL to Grow Room"}> Move All to Grow <ArrowRightIcon className="ml-1 h-3 w-3"/></button>
                            {onOpenMovePartialModal && ( <button onClick={() => onOpenMovePartialModal(safeBatch)} className={movePartialButtonStyle} title={"Move PARTIAL to Grow Room"}>Move Partial <ArrowRightIcon className="ml-1 h-3 w-3"/></button> )}
                            
                            {columns && columns.length > 1 && (
                                <div className="relative" ref={moveMenuRef}>
                                    <button onClick={() => setIsMoveMenuOpen(prev => !prev)} className={moveColumnButtonStyle} title="Move to another column">
                                        <MoveIcon className="h-4 w-4" />
                                    </button>
                                    {isMoveMenuOpen && (
                                        <div className="absolute bottom-full mb-2 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                            <div className="py-1">
                                                <p className="px-3 py-1 text-xs text-gray-500">Move to...</p>
                                                {columns.filter(c => c.id !== safeBatch.columnId).map(col => (
                                                    <button
                                                        key={col.id}
                                                        onClick={() => {
                                                            onMoveBatchToColumn(safeBatch.id, col.id);
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
                            <button onClick={() => onDeleteBatch(safeBatch.id, safeBatch.batchLabel)} className={dangerButtonStyle}><TrashIcon className="mr-1 h-3 w-3"/> Delete</button>
                        </>
                    )}
                    {safeBatch.stage === 'grow' && (
                        <>
                            <button onClick={() => onOpenHarvestModal(safeBatch.id)} className={compactPrimaryButtonStyle}><PlusIcon className="h-3 w-3 mr-1"/> Log Harvest</button>
                            <button onClick={() => onOpenMoveConfirmModal(safeBatch.id, 'retired', safeBatch.batchLabel)} className={compactSecondaryButtonStyle}><ArchiveIcon className="h-3 w-3 mr-1"/> Retire Batch</button>
                             <button onClick={() => onOpenMoveConfirmModal(safeBatch.id, 'incubation', safeBatch.batchLabel)} className={compactSecondaryButtonStyle}><ArrowLeftIcon className="h-3 w-3 mr-1"/> To Incubation</button>
                        </>
                    )}
                    {safeBatch.stage === 'retired' && (
                        <button onClick={() => onOpenMoveConfirmModal(safeBatch.id, 'grow', safeBatch.batchLabel)} className={primaryButtonStyle}><ArrowLeftIcon className="h-3 w-3 mr-1"/> Back to Grow</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BatchCard;