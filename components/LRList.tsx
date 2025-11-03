import React, { useState } from 'react';
import { LorryReceipt, CompanyDetails } from '../types';
import { PencilIcon, TrashIcon, DownloadIcon } from './icons';
import LRPreviewModal from './LRPreviewModal';

interface LRListProps {
    lorryReceipts: LorryReceipt[];
    onEdit: (lrNo: string) => void;
    onDelete: (lrNo: string) => void;
    onAddNew: () => void;
    companyDetails: CompanyDetails;
}

const LRList: React.FC<LRListProps> = ({ lorryReceipts, onEdit, onDelete, onAddNew, companyDetails }) => {
    const [previewingLR, setPreviewingLR] = useState<LorryReceipt | null>(null);

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-ssk-blue">View LR Details</h2>
                <button 
                    onClick={onAddNew}
                    className="bg-ssk-red text-white font-bold py-2 px-4 rounded hover:bg-red-700"
                >
                    ADD NEW LR
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-black font-bold uppercase bg-gray-200">
                        <tr>
                            <th scope="col" className="px-3 py-3">SR. NO</th>
                            <th scope="col" className="px-3 py-3">LR. NO</th>
                            <th scope="col" className="px-3 py-3">DATE</th>
                            <th scope="col" className="px-3 py-3">TRUCK NO</th>
                            <th scope="col" className="px-3 py-3">FROM</th>
                            <th scope="col" className="px-3 py-3">TO</th>
                            <th scope="col" className="px-3 py-3">CONSIGNOR</th>
                            <th scope="col" className="px-3 py-3">CONSIGNEE</th>
                            <th scope="col" className="px-3 py-3">AGENT</th>
                            <th scope="col" className="px-3 py-3">WT.</th>
                            <th scope="col" className="px-3 py-3">FREIGHT</th>
                            <th scope="col" className="px-3 py-3">CREATED BY</th>
                            <th scope="col" className="px-3 py-3 text-center">ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lorryReceipts.map((lr, index) => (
                            <tr key={lr.lrNo} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-3 py-2 text-black font-bold">{index + 1}</td>
                                <td className="px-3 py-2 font-bold text-black">{lr.lrNo}</td>
                                <td className="px-3 py-2 text-black font-bold">{new Date(lr.date).toLocaleDateString()}</td>
                                <td className="px-3 py-2 text-black font-bold">{lr.truckNo}</td>
                                <td className="px-3 py-2 text-black font-bold">{lr.fromPlace}</td>
                                <td className="px-3 py-2 text-black font-bold">{lr.toPlace}</td>
                                <td className="px-3 py-2 text-black font-bold">{lr.consignor.name}</td>
                                <td className="px-3 py-2 text-black font-bold">{lr.consignee.name}</td>
                                <td className="px-3 py-2 text-black font-bold">{lr.agent}</td>
                                <td className="px-3 py-2 text-black font-bold">{lr.weight}</td>
                                <td className="px-3 py-2 text-black font-bold">{lr.freight.toLocaleString()}</td>
                                <td className="px-3 py-2 text-black font-bold">{lr.createdBy}</td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center justify-center space-x-1">
                                        <button onClick={() => onEdit(lr.lrNo)} className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded" title="Edit"><PencilIcon className="w-4 h-4"/></button>
                                        <button onClick={() => setPreviewingLR(lr)} className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded" title="Download/Print"><DownloadIcon className="w-4 h-4"/></button>
                                        <button onClick={() => onDelete(lr.lrNo)} className="p-2 text-white bg-ssk-red hover:bg-red-700 rounded" title="Delete"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {previewingLR && (
                <LRPreviewModal
                    isOpen={!!previewingLR}
                    onClose={() => setPreviewingLR(null)}
                    lr={previewingLR}
                    companyDetails={companyDetails}
                    onSave={() => setPreviewingLR(null)}
                    isReadOnly={true}
                />
            )}
        </div>
    );
};

export default LRList;