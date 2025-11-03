import React, { useRef } from 'react';
import { LorryReceipt, CompanyDetails } from '../types';
import { DownloadIcon, WhatsAppIcon, EmailIcon, XIcon, SaveIcon, PhoneIcon } from './icons';

// Declare jspdf and html2canvas to be available in the global scope from CDN
declare var jspdf: any;
declare var html2canvas: any;

interface LRPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    lr: LorryReceipt;
    companyDetails: CompanyDetails;
    onSave: (lr: LorryReceipt) => void;
    isReadOnly?: boolean;
}

const LRPreviewModal: React.FC<LRPreviewModalProps> = ({ isOpen, onClose, lr, companyDetails, onSave, isReadOnly = false }) => {
    const previewRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = () => {
        if (!previewRef.current) return;
        
        const { jsPDF } = jspdf;
        // A4 size in mm: 210 x 297
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();

        html2canvas(previewRef.current, { 
            scale: 3, // Higher scale for better quality
            useCORS: true,
            logging: false,
            width: previewRef.current.offsetWidth,
            height: previewRef.current.offsetHeight,
            backgroundColor: '#ebf8ff' // Explicitly set background color for canvas
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 1.0);
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.height / imgProps.width;
            let imgHeight = pdfWidth * ratio;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`LR-${lr.lrNo.replace('/', '-')}.pdf`);
        });
    };
    
    const handleShareWhatsApp = () => {
        const phone = lr.consignee?.contact || '';
        const message = encodeURIComponent(`Hi ${lr.consignee?.name}, your shipment with LR No. ${lr.lrNo} from ${lr.fromPlace} is on its way. Please download the LR PDF and keep it for your records.`);
        window.open(`https://wa.me/${phone}?text=${message}`);
    };

    const handleShareEmail = () => {
        const email = lr.consignee?.gst || ''; // Assuming email is in gst field for now
        const subject = encodeURIComponent(`Lorry Receipt (LR No: ${lr.lrNo}) for your shipment`);
        const body = encodeURIComponent(`Dear ${lr.consignee?.name},\n\nPlease find the details for your shipment with LR No. ${lr.lrNo}.\n\nWe advise you to download the attached PDF for your records.\n\nThank you,\n${companyDetails.name}`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    };

    // FIX: Using a placeholder signature as the original was truncated.
    const signatureUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAABkCAMAAACf5+gRAAAAVFBMVEX///8BAQECAgIDAwMEBAQFBQUGBgYICAgJCQkKCgoLCwsMDAwNDQ4ODg8PEBAQERESEhITExMUFBQWFhYfHx8jIyMoKCgrKysxMTI5OTlCQkJycnJ/f38AAAD37x2lAAAAyElEQVR4nO3PQQEAIAwDQeaf5U8x0dE2gYAsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI43u4gD2OkZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA020bYgMANwHe2QAAAABJRU5ErkJggg==";

    if (!isOpen) {
        return null;
    }

    const totalPcs = lr.items.reduce((acc, item) => acc + (item.pcs || 0), 0);
    const totalWeight = lr.items.reduce((acc, item) => acc + (item.weight || 0), 0);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:p-0 print:bg-white" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gray-100 p-3 border-b flex justify-between items-center print:hidden">
                    <h2 className="text-xl font-bold text-gray-800">LR Preview ({lr.lrNo})</h2>
                    <div className="flex items-center space-x-2">
                        {!isReadOnly && (
                            <button onClick={() => onSave(lr)} className="flex items-center bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 font-semibold text-sm">
                                <SaveIcon className="w-4 h-4 mr-1.5" />
                                Save
                            </button>
                        )}
                        <button onClick={handleDownloadPDF} className="flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 font-semibold text-sm">
                            <DownloadIcon className="w-4 h-4 mr-1.5" />
                            Download
                        </button>
                        <button onClick={handleShareWhatsApp} className="flex items-center bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 font-semibold text-sm">
                            <WhatsAppIcon className="w-4 h-4 mr-1.5" />
                            Share
                        </button>
                         <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                            <XIcon className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                </div>

                <div ref={previewRef} className="p-2 overflow-y-auto text-black bg-blue-100" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '10px' }}>
                    <div className="border-2 border-black p-1 text-black font-bold">
                        <div className="flex justify-between items-center border-b-2 border-black pb-1">
                            {companyDetails.logoUrl && <img src={companyDetails.logoUrl} alt="logo" className="h-16 w-32 object-contain" />}
                             <div className="text-center">
                                {companyDetails.tagline && <p>{companyDetails.tagline}</p>}
                                <h1 className="text-xl">{companyDetails.name}</h1>
                                <p className="text-xs">{companyDetails.address}</p>
                                <div className="flex justify-center items-center space-x-4 text-xs">
                                    {companyDetails.email && <span>Email: {companyDetails.email}</span>}
                                    {companyDetails.contact.length > 0 && <span><PhoneIcon className="w-3 h-3 inline-block mr-1"/> {companyDetails.contact.join(' / ')}</span>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p>({lr.lrType})</p>
                                <p>Ph: {companyDetails.contact[0]}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-black">
                             <p>GSTIN: {companyDetails.gstn}</p>
                             <p>PAN: {companyDetails.pan}</p>
                        </div>
                        <table className="w-full border-collapse border-black text-xs">
                           <tbody>
                                <tr>
                                    <td className="border border-black p-1">LR No: {lr.lrNo}</td>
                                    <td className="border border-black p-1">Date: {new Date(lr.date).toLocaleDateString()}</td>
                                    <td className="border border-black p-1">Truck No: {lr.truckNo}</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-1">From: {lr.fromPlace}</td>
                                    <td className="border border-black p-1">To: {lr.toPlace}</td>
                                    <td className="border border-black p-1">E-Way Bill: {lr.ewayBillNo}</td>
                                </tr>
                           </tbody>
                        </table>
                        <div className="grid grid-cols-2 border-r border-l border-b border-black">
                            <div className="p-1">
                                <h4 className="underline">Consignor:</h4>
                                <p>{lr.consignor.name}</p>
                                <p>{lr.consignor.address}</p>
                                <p>{lr.consignor.city}</p>
                                {lr.consignor.contact && <p>Contact: {lr.consignor.contact}</p>}
                                {lr.consignor.gst && <p>GSTIN: {lr.consignor.gst}</p>}
                                {lr.consignor.pan && <p>PAN: {lr.consignor.pan}</p>}
                            </div>
                            <div className="border-l border-black p-1">
                                <h4 className="underline">Consignee:</h4>
                                <p>{lr.consignee.name}</p>
                                <p>{lr.consignee.address}</p>
                                <p>{lr.consignee.city}</p>
                                {lr.consignee.contact && <p>Contact: {lr.consignee.contact}</p>}
                                {lr.consignee.gst && <p>GSTIN: {lr.consignee.gst}</p>}
                                {lr.consignee.pan && <p>PAN: {lr.consignee.pan}</p>}
                            </div>
                        </div>
                        <table className="w-full border-collapse border-b border-l border-r border-black text-xs">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border-r border-black p-1 text-left">Description</th>
                                    <th className="border-r border-black p-1 w-20">Pcs</th>
                                    <th className="p-1 w-24">Weight (Kg)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lr.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border-r border-black p-1">{item.description}</td>
                                        <td className="border-r border-black p-1 text-center">{item.pcs}</td>
                                        <td className="p-1 text-center">{item.weight}</td>
                                    </tr>
                                ))}
                                {/* Add empty rows for consistent height */}
                                {Array.from({ length: Math.max(0, 5 - lr.items.length) }).map((_, i) => (
                                    <tr key={`empty-${i}`}><td className="border-r border-black p-1">&nbsp;</td><td className="border-r border-black p-1"></td><td className="p-1"></td></tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-100">
                                 <tr>
                                    <td className="border-t border-r border-black p-1">TOTAL</td>
                                    <td className="border-t border-r border-black p-1 text-center">{totalPcs}</td>
                                    <td className="border-t border-black p-1 text-center">{totalWeight}</td>
                                </tr>
                            </tfoot>
                        </table>
                        <div className="grid grid-cols-2 border-b border-l border-r border-black">
                           <div className="p-1 border-r border-black">
                                <p>GST Paid By: {lr.gstPaidBy}</p>
                                <p>Charged Weight: {lr.chargedWeight} kg</p>
                                <p>Freight: ₹{lr.freight.toLocaleString()}</p>
                           </div>
                           <div className="p-1">
                                <p>Invoice No: {lr.invoiceNo}</p>
                                <p>Invoice Value: ₹{lr.invoiceAmount.toLocaleString()}</p>
                           </div>
                        </div>
                        <div className="border-b border-l border-r border-black p-1">
                            Remarks: {lr.remark}
                        </div>
                        <div className="grid grid-cols-2">
                           <div className="p-1 text-xs">
                                <h4 className="underline">Terms & Conditions:</h4>
                                <p>1. The goods are accepted at owner's risk.</p>
                                <p>2. We are not responsible for any leakage/breakage.</p>
                                <p>3. Subject to Rohtak jurisdiction.</p>
                                <p className="mt-8">Receiver's Signature</p>
                           </div>
                           <div className="p-1 text-right">
                                <p>For {companyDetails.name}</p>
                                <img src={signatureUrl} alt="signature" className="h-12 w-32 object-contain ml-auto" />
                                <p>Authorised Signatory</p>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LRPreviewModal;