import React, { useState, useEffect } from 'react';
import { LorryReceipt, Item } from '../types';
import LRPreviewModal from './LRPreviewModal';
import { PlusIcon, TrashIcon, CreateIcon, ListIcon } from './icons';

interface LRFormProps {
    onSave: (lr: LorryReceipt) => void;
    existingLR: LorryReceipt | null;
    onCancel: () => void;
    companyDetails: any;
}

const initialLRState: Omit<LorryReceipt, 'lrNo'> = {
    lrType: 'Original',
    truckNo: '',
    date: new Date().toISOString().split('T')[0],
    fromPlace: '',
    toPlace: '',
    invoiceNo: '',
    invoiceAmount: 0,
    invoiceDate: '',
    poNo: '',
    poDate: '',
    ewayBillNo: '',
    ewayBillDate: '',
    ewayExDate: '',
    methodOfPacking: '',
    addressOfDelivery: '',
    chargedWeight: 0,
    lorryType: '',
    gstPaidBy: 'Transporter',
    consignor: { name: '', address: '', city: '', contact: '', pan: '', gst: '' },
    consignee: { name: '', address: '', city: '', contact: '', pan: '', gst: '' },
    billingTo: { name: '', address: '', city: '', contact: '', pan: '', gst: '' },
    agent: '',
    items: [{ description: 'corrugated box', pcs: 1, weight: 0 }],
    weight: 0,
    actualWeightMT: 0,
    height: 0,
    extraHeight: 0,
    freight: 0,
    rate: 0,
    rateOn: '',
    remark: '',
    employee: '',
    truckDriverNo: '',
};

const LRForm: React.FC<LRFormProps> = ({ onSave, existingLR, onCancel, companyDetails }) => {
    const [formData, setFormData] = useState(initialLRState);
    const [showPreview, setShowPreview] = useState(false);
    
    useEffect(() => {
        if (existingLR) {
            setFormData(existingLR);
        } else {
            setFormData(initialLRState);
        }
    }, [existingLR]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePartyChange = (party: 'consignor' | 'consignee' | 'billingTo', e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [party]: {
                ...prev[party],
                [name]: value
            }
        }));
    };
    
    const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', pcs: 0, weight: 0 }] }));
    };

    const removeItem = (index: number) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.truckNo || !formData.fromPlace || !formData.toPlace || !formData.consignor.name || !formData.consignee.name) {
            alert('Please fill all required fields marked with *.');
            return;
        }
        setShowPreview(true);
    };
    
    const handleSaveFromPreview = (lr: LorryReceipt) => {
        onSave(lr);
        setShowPreview(false);
        setFormData(initialLRState);
    };

    const handleCreateNew = () => {
        // This function will be linked to the new "+ Create New LR" button
        if(window.confirm('Are you sure you want to discard current changes and create a new LR?')) {
            setFormData(initialLRState);
        }
    }

    const fullLRForPreview: LorryReceipt = {
        ...formData,
        lrNo: existingLR ? existingLR.lrNo : `DEL/${Date.now().toString().slice(-6)}`,
    };
    
    const renderPartySection = (title: string, partyKey: 'consignor' | 'consignee' | 'billingTo') => (
        <div className="border border-gray-300">
            <h3 className="bg-ssk-red text-white p-2 font-bold text-sm">{title.toUpperCase()}</h3>
            <div className="p-2 space-y-1">
                <textarea name="name" value={formData[partyKey].name} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="NAME" className="w-full text-xs p-1 border rounded-sm" rows={2}></textarea>
                <textarea name="address" value={formData[partyKey].address} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="ADDRESS" className="w-full text-xs p-1 border rounded-sm" rows={3}></textarea>
                <input type="text" name="city" value={formData[partyKey].city} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="CITY" className="w-full text-xs p-1 border rounded-sm" />
                <input type="text" name="contact" value={formData[partyKey].contact} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="CONTACT" className="w-full text-xs p-1 border rounded-sm" />
                <input type="text" name="pan" value={formData[partyKey].pan} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="PAN" className="w-full text-xs p-1 border rounded-sm" />
                <input type="text" name="gst" value={formData[partyKey].gst} onChange={(e) => handlePartyChange(partyKey, e)} placeholder="GST" className="w-full text-xs p-1 border rounded-sm" />
            </div>
        </div>
    );

    const inputClass = "w-full p-2 border-gray-200 bg-gray-100 rounded-md text-sm placeholder-gray-400";
    const labelClass = "block text-xs font-bold text-gray-600 uppercase mb-1";

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
             {/* New Navigation Header */}
            <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                <button onClick={onCancel} className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors text-sm">
                    <ListIcon className="w-5 h-5 mr-2" />
                    View LR Details
                </button>
                <button onClick={handleCreateNew} className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-200 transition-colors text-sm">
                    <CreateIcon className="w-5 h-5 mr-2" />
                    Create New LR
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4">
                    {/* Row 1 */}
                    <div>
                        <label className={labelClass}>LR TYPE*</label>
                        <div className="flex items-center space-x-4 h-10">
                             <div className="flex items-center">
                                <input id="dummy" type="radio" name="lrType" value="Dummy" checked={formData.lrType === 'Dummy'} onChange={handleChange} className="h-4 w-4 text-ssk-blue focus:ring-ssk-blue border-gray-300" />
                                <label htmlFor="dummy" className="ml-2 block text-sm text-gray-900">Dummy</label>
                            </div>
                            <div className="flex items-center">
                                <input id="original" type="radio" name="lrType" value="Original" checked={formData.lrType === 'Original'} onChange={handleChange} className="h-4 w-4 text-ssk-blue focus:ring-ssk-blue border-gray-300"/>
                                <label htmlFor="original" className="ml-2 block text-sm text-gray-900">Original</label>
                            </div>
                        </div>
                    </div>
                    <div><label className={labelClass}>TRUCK NO*</label><input type="text" name="truckNo" placeholder="TRUCK NO" value={formData.truckNo} onChange={handleChange} className={`${inputClass} border-red-300`} required /></div>
                    <div><label className={labelClass}>LR NO*</label><input type="text" value={existingLR ? existingLR.lrNo : 'DEL/00002'} disabled className={`${inputClass} bg-gray-200 cursor-not-allowed`} /></div>
                    <div><label className={labelClass}>DATE*</label><input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className={labelClass}>FROM PLACE*</label><input type="text" name="fromPlace" placeholder="FROM PLACE" value={formData.fromPlace} onChange={handleChange} className={inputClass} required /></div>
                    <div><label className={labelClass}>TO PLACE*</label><input type="text" name="toPlace" placeholder="TO PLACE" value={formData.toPlace} onChange={handleChange} className={inputClass} required /></div>

                    {/* Row 2 */}
                    <div><label className={labelClass}>INVOICE</label><input type="text" name="invoiceNo" placeholder="INVOICE" value={formData.invoiceNo} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>INVOICE AMOUNT</label><input type="number" name="invoiceAmount" placeholder="INVOICE AMOUNT" value={formData.invoiceAmount} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>INVOICE DATE</label><input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>EWAY BILL NO</label><input type="text" name="ewayBillNo" placeholder="EWAY BILL NO" value={formData.ewayBillNo} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>EWAY BILL DATE</label><input type="date" name="ewayBillDate" value={formData.ewayBillDate} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>EWAY EX. DATE</label><input type="date" name="ewayExDate" value={formData.ewayExDate} onChange={handleChange} className={inputClass} /></div>
                    
                    {/* Row 3 */}
                    <div><label className={labelClass}>P.O. NO</label><input type="text" name="poNo" placeholder="P.O. NO" value={formData.poNo} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>P.O. DATE</label><input type="date" name="poDate" value={formData.poDate} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>METHOD OF PACKING</label><input type="text" name="methodOfPacking" placeholder="METHOD OF PACKING" value={formData.methodOfPacking} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>ADDRESS OF DELIVERY</label><input type="text" name="addressOfDelivery" placeholder="ADDRESS OF DELIVERY" value={formData.addressOfDelivery} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>CHARGED WEIGHT</label><input type="number" name="chargedWeight" placeholder="CHARGED WEIGHT" value={formData.chargedWeight} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>LORRY TYPE</label><input type="text" name="lorryType" placeholder="LORRY TYPE" value={formData.lorryType} onChange={handleChange} className={inputClass} /></div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                     <div>
                        <label className={labelClass}>BILLING PARTY</label>
                        <input type="text" name="name" placeholder="Billing Party Name" value={formData.billingTo.name} onChange={(e) => handlePartyChange('billingTo', e)} className={inputClass} />
                     </div>
                     <div>
                        <label className={labelClass}>GST PAID BY</label>
                         <select name="gstPaidBy" value={formData.gstPaidBy} onChange={handleChange} className={inputClass}>
                            <option>Transporter</option>
                            <option>Consignor</option>
                            <option>Consignee</option>
                        </select>
                     </div>
                 </div>


                {/* Parties Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderPartySection('Consignor', 'consignor')}
                    {renderPartySection('Consignee', 'consignee')}
                    {renderPartySection('Billing To', 'billingTo')}
                </div>
                 <div className="flex items-center">
                    <label className="w-24 font-bold">AGENT</label>
                    <input type="text" name="agent" value={formData.agent} onChange={handleChange} className="w-full p-1 border" />
                </div>

                {/* Item Details Section */}
                <div className="border border-gray-200 p-3 rounded-md shadow-sm bg-white">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-base text-gray-800">Item Details</h3>
                        <button type="button" onClick={addItem} className="flex items-center bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-xs font-bold hover:bg-gray-200 transition-colors">
                            <PlusIcon className="w-4 h-4 mr-1" />
                            Add Row
                        </button>
                    </div>
                    <div className="grid grid-cols-12 gap-2 bg-gray-50 p-2 rounded-t-md font-bold text-gray-600 text-left text-xs">
                        <div className="col-span-1">#</div>
                        <div className="col-span-6">DESCRIPTION</div>
                        <div className="col-span-2">PCS</div>
                        <div className="col-span-2">WEIGHT</div>
                        <div className="col-span-1"></div>
                    </div>
                    <div className="border-l border-r border-b border-gray-200 rounded-b-md">
                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border-b last:border-b-0">
                                <div className="col-span-1 text-gray-500">{index + 1}</div>
                                <div className="col-span-6"><input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full p-1.5 border rounded-md text-sm"/></div>
                                <div className="col-span-2"><input type="number" value={item.pcs} onChange={(e) => handleItemChange(index, 'pcs', parseInt(e.target.value))} className="w-full p-1.5 border rounded-md text-sm" placeholder="PCS" /></div>
                                <div className="col-span-2"><input type="number" value={item.weight} onChange={(e) => handleItemChange(index, 'weight', parseFloat(e.target.value))} className="w-full p-1.5 border rounded-md text-sm" placeholder="Weight"/></div>
                                <div className="col-span-1 text-right">
                                    {formData.items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(index)} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100"><TrashIcon className="w-5 h-5"/></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other fields Section */}
                <div className="space-y-4 pt-4 text-gray-800">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div><label className={labelClass}>WEIGHT (MT)</label><input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="WEIGHT (MT)" className={inputClass} /></div>
                        <div><label className={labelClass}>ACTUAL WEIGHT (MT)</label><input type="number" name="actualWeightMT" value={formData.actualWeightMT} onChange={handleChange} placeholder="WEIGHT (MT)" className={inputClass} /></div>
                        <div><label className={labelClass}>HEIGHT</label><input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="HEIGHT" className={inputClass} /></div>
                        <div><label className={labelClass}>EXTRA HEIGHT</label><input type="number" name="extraHeight" value={formData.extraHeight} onChange={handleChange} placeholder="EX HEIGHT" className={inputClass} /></div>
                        <div><label className={labelClass}>FREIGHT</label><input type="number" name="freight" value={formData.freight} onChange={handleChange} placeholder="FREIGHT" className={inputClass} /></div>
                        <div><label className={labelClass}>RATE</label><input type="number" name="rate" value={formData.rate} onChange={handleChange} placeholder="RATE" className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className={labelClass}>RATE ON</label><select name="rateOn" value={formData.rateOn} onChange={handleChange} className={inputClass}><option value="">Select Rate Type</option><option value="Ton">Ton</option><option value="Trip">Trip</option><option value="Pcs">Pcs</option></select></div>
                        <div><label className={labelClass}>EMPLOYEE</label><select name="employee" value={formData.employee} onChange={handleChange} className={inputClass}><option value="">Select Employee</option><option value="SSK">SSK</option><option value="Driver A">Driver A</option></select></div>
                        <div><label className={labelClass}>TRUCK DRIVER NO</label><select name="truckDriverNo" value={formData.truckDriverNo} onChange={handleChange} className={inputClass}><option value="">Select Driver</option><option value="Driver 123">Driver 123</option><option value="Driver 456">Driver 456</option></select></div>
                    </div>
                    <div><label className={labelClass}>REMARK</label><textarea name="remark" value={formData.remark} onChange={handleChange} placeholder="Enter remarks..." className={`${inputClass} h-24`}></textarea></div>
                </div>
                
                <div className="flex justify-center space-x-4 pt-4 border-t">
                    <button type="submit" className="bg-ssk-blue text-white px-8 py-2.5 rounded-md hover:bg-blue-800 font-bold text-base shadow-md transition-transform transform hover:scale-105">
                        {existingLR ? 'UPDATE & SAVE' : 'PREVIEW & SAVE'}
                    </button>
                    <button type="button" onClick={onCancel} className="bg-ssk-red text-white px-8 py-2.5 rounded-md hover:bg-red-700 font-bold text-base shadow-md transition-transform transform hover:scale-105">
                        CANCEL
                    </button>
                </div>
            </form>
            
            {showPreview && (
                <LRPreviewModal 
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    lr={fullLRForPreview}
                    companyDetails={companyDetails}
                    onSave={handleSaveFromPreview}
                />
            )}
        </div>
    );
};

export default LRForm;