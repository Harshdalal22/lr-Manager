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
        // const pdfHeight = pdf.internal.pageSize.getHeight();

        html2canvas(previewRef.current, { 
            scale: 3, // Higher scale for better quality
            useCORS: true,
            logging: false,
            width: previewRef.current.offsetWidth,
            height: previewRef.current.offsetHeight
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

    const signatureUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAABlBMVEX///8AAABVwtN+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIoSURBVHja7d1BjoQwEETRJf//6a2g0pYmJtS5F+gcnGZmzCChRo0aNWpU6f+kC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfRIL3SkC12oQhdq0IUu1KELLfT4B1p4g0atGjVq/98+sC2aN6g7xHAAAAAASUVORK5CYII=";


    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start p-4 overflow-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl my-8">
                <div className="p-4 bg-gray-100 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-800">LR Preview & Actions</h2>
                    <div className="flex items-center space-x-2">
                        {!isReadOnly && <button onClick={() => onSave(lr)} className="flex items-center bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 font-semibold"><SaveIcon className="w-5 h-5 mr-1"/>Save LR</button>}
                        <button onClick={handleDownloadPDF} className="flex items-center bg-ssk-red text-white px-3 py-2 rounded-md hover:bg-red-700 font-semibold"><DownloadIcon className="w-5 h-5 mr-1"/>Download PDF</button>
                        <button onClick={handleShareWhatsApp} className="flex items-center bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 font-semibold"><WhatsAppIcon className="w-5 h-5 mr-1"/>WhatsApp</button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-300"><XIcon className="w-6 h-6"/></button>
                    </div>
                </div>

                <div className="p-4 overflow-auto">
                    <div ref={previewRef} className="p-2 bg-white text-black font-serif aspect-[210/297] w-full mx-auto border-2 border-black">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b-2 border-black pb-1">
                             {companyDetails.logoUrl && ( <img src="https://i.ibb.co/6g2y355/logo.png" alt="Logo" className="h-12 object-contain"/> )}
                            <div className="text-center leading-tight">
                                <p className="text-[10px] font-bold">Jai Dada Udmiram Ki</p>
                                <p className="text-[9px]">SUBJECT TO DELHI JURISDICTION</p>
                                <h1 className="text-3xl font-bold -my-1"><span className="text-ssk-red">SSK</span> INDIA LOGISTICS</h1>
                                <p className="font-bold">(Fleet Owner & Contractor)</p>
                                <p className="text-[9px]">{companyDetails.address}</p>
                                <p className="text-[9px]">Mail : {companyDetails.email}, Web : {companyDetails.web || 'www.indialogistics.com'}</p>
                            </div>
                            <div className="text-[10px] font-bold text-right leading-snug">
                                {companyDetails.contact.map(c => <div key={c} className="flex items-center justify-end"><PhoneIcon className="w-3 h-3 mr-1"/>{c}</div>)}
                            </div>
                        </div>

                        {/* Top Body Grid */}
                        <div className="grid grid-cols-12 gap-x-1 text-[9px] mt-1">
                            {/* Left Col */}
                            <div className="col-span-4 flex flex-col">
                                <div className="border border-black p-1">
                                    <span className="font-bold bg-white px-1 relative -top-3 text-red-600">Available At :</span>
                                    <div className="-mt-2 grid grid-cols-2">
                                        <p className="font-bold">AHMEDABAD</p>
                                        <p className="font-bold">SURAT</p>
                                        <p className="font-bold">VAPI</p>
                                        <p className="font-bold">MUMBAI</p>
                                        <p className="font-bold">PUNE</p>
                                    </div>
                                </div>
                                <div className="border border-black p-1 mt-1">
                                    <p className="font-bold text-center underline">CAUTION</p>
                                    <p className="text-[7px]">This Consignment Will Not Be Detained Diverted,Re-Routed Or Re-Booked Without Consignee Bank Written Permission Will Be Delivered At the Destination.</p>
                                </div>
                                 <div className="border border-black p-1 mt-1 flex-grow">
                                    <p className="font-bold text-center underline">NOTICE</p>
                                    <p className="text-[7px]">This consignment covered in this set of special lorry receipt shall be stored at the destination under the control of the transport operator & shall be delivered to or to the order of the Consignee bank whose name is mentioned in the lorry receipt. And under no circumstances be delivered to anyone without the written authority form the consignee Bank or its order endorsed on the Consignee Copy or on a separated Letter or Authority.</p>
                                </div>
                                <p className="mt-1">Consignor GST No.: <span className="font-bold">{lr.consignor.gst}</span></p>
                            </div>
                            {/* Mid Col */}
                            <div className="col-span-4">
                                <div className="border border-black p-1">
                                    <p className="font-bold text-center underline">AT OWNERS RISKS</p>
                                    <p>Pan No. : {companyDetails.pan || 'CMFP S3661A'}</p>
                                    <p>GST No. : <span className="text-red-600 font-bold">{companyDetails.gstn}</span></p>
                                </div>
                                 <div className="border border-black p-1 mt-1 text-center">
                                    <p className="font-bold underline">INSURANCE</p>
                                    <p className="text-[8px] font-bold">The Customer Has Started That He Has Not Insured The Consignment</p>
                                    <div className="flex justify-between mt-1 text-left">
                                        <span>Policy No _________</span>
                                        <span>Date _________</span>
                                    </div>
                                    <div className="flex justify-between mt-1 text-left">
                                        <span>Amount _________</span>
                                        <span>Risk _________</span>
                                    </div>
                                </div>
                            </div>
                            {/* Right Col */}
                            <div className="col-span-4 text-center">
                                 <div className="border border-black p-1">
                                    <p className="font-bold underline">SCHEDULE OF DEMURRAGE CHARGES</p>
                                    <p className="text-[8px] font-bold">Demmurrage Chargeable After 5 days Arrival Of Goods Rs. 7/per Qtl.Per Day On Weight Charged</p>
                                </div>
                                <div className="border border-black p-1 mt-1 font-bold">Address Of Delivery : <span className="font-normal">{lr.addressOfDelivery}</span></div>
                                <div className="border border-black p-1 mt-1 font-bold">Vehicle No. : <span className="font-normal">{lr.truckNo}</span></div>
                                <div className="border-y-2 border-black p-1 mt-1 font-bold">C NOTE No. : <span className="font-normal">{lr.lrNo}</span></div>
                                <div className="grid grid-cols-5 mt-1">
                                    <div className="col-span-2 border border-black p-1 font-bold">DATE :</div>
                                    <div className="col-span-3 border-y border-r border-black p-1">{new Date(lr.date).toLocaleDateString('en-GB')}</div>
                                    <div className="col-span-2 border-x border-b border-black p-1 font-bold">FROM :</div>
                                    <div className="col-span-3 border-r border-b border-black p-1">{lr.fromPlace}</div>
                                    <div className="col-span-2 border-x border-b border-black p-1 font-bold">TO :</div>
                                    <div className="col-span-3 border-r border-b border-black p-1">{lr.toPlace}</div>
                                </div>
                            </div>
                        </div>
                        <p className="text-[9px] mt-1">Consignor : <span className="font-bold">{lr.consignor.name}</span></p>
                        <p className="text-[9px]">Consignee : <span className="font-bold">{lr.consignee.name}</span></p>
                        
                        {/* Main Content Table */}
                        <table className="w-full border-collapse border-2 border-black text-[8px] mt-1">
                            <thead>
                                <tr className="font-bold text-center">
                                    <td className="border-r-2 border-black p-1 w-[8%]">Packages</td>
                                    <td className="border-r-2 border-black p-1">Description</td>
                                    <td className="border-r-2 border-black p-1 w-[12%]" colSpan={2}>Weight</td>
                                    <td className="border-r-2 border-black p-1 w-[15%]">Rate</td>
                                    <td className="border-r-2 border-black p-1 w-[10%]">Amount</td>
                                    <td className="p-1 w-[20%]">Any Other Information Remarks</td>
                                </tr>
                                <tr className="font-bold text-center">
                                    <td className="border-t-2 border-r-2 border-black"></td>
                                    <td className="border-t-2 border-r-2 border-black"></td>
                                    <td className="border-t-2 border-r border-black p-1">Actual</td>
                                    <td className="border-t-2 border-r-2 border-black p-1">Charged</td>
                                    <td className="border-t-2 border-r-2 border-black"></td>
                                    <td className="border-t-2 border-r-2 border-black"></td>
                                    <td className="border-t-2 border-black"></td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border-t-2 border-r-2 border-black p-1 text-center h-40 align-top">{lr.items.reduce((sum, item) => sum + item.pcs, 0)}</td>
                                    <td className="border-t-2 border-r-2 border-black p-1 align-top">{lr.items.map(i => i.description).join(', ')}</td>
                                    <td className="border-t-2 border-r border-black p-1 text-center align-top">{lr.items.reduce((sum, item) => sum + item.weight, 0)}</td>
                                    <td className="border-t-2 border-r-2 border-black p-1 text-center align-top">{lr.chargedWeight}</td>
                                    <td className="border-t-2 border-r-2 border-black p-0 align-top">
                                        <div className="grid grid-cols-2 h-full text-center">
                                            <div className="border-b border-r border-black p-1">Hamail</div><div className="border-b border-black p-1"></div>
                                            <div className="border-b border-r border-black p-1">Sur.CH.</div><div className="border-b border-black p-1"></div>
                                            <div className="border-b border-r border-black p-1">St.CH.</div><div className="border-b border-black p-1"></div>
                                            <div className="border-b border-r border-black p-1">Collection CH.</div><div className="border-b border-black p-1"></div>
                                            <div className="border-b border-r border-black p-1">D.Dty CH.</div><div className="border-b border-black p-1"></div>
                                            <div className="border-b border-r border-black p-1">Other CH.</div><div className="border-b border-black p-1"></div>
                                            <div className="border-b border-r border-black p-1">Risk CH.</div><div className="border-b border-black p-1"></div>
                                            <div className="border-r border-black p-1 font-bold">Total</div><div className="p-1 font-bold"></div>
                                        </div>
                                    </td>
                                    <td className="border-t-2 border-r-2 border-black p-1 align-top text-center font-bold">{lr.freight.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                                    <td className="border-t-2 border-black p-1 align-top">
                                        {lr.remark}
                                        <p className="mt-4">To PAY Rs. : </p>
                                        <p className="mt-4">Paid RS. : </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="border-t-2 border-r-2 border-black p-1">
                                        <span className="text-red-600">Invoice No.:</span> {lr.invoiceNo} <span className="text-red-600 ml-4">Date:</span> {lr.invoiceDate ? new Date(lr.invoiceDate).toLocaleDateString('en-GB'): ''}
                                    </td>
                                    <td className="border-t-2 border-r-2 border-black p-1">Mark</td>
                                    <td className="border-t-2 border-r-2 border-black p-1"></td>
                                    <td className="border-t-2 border-r-2 border-black p-1"></td>
                                    <td className="border-t-2 border-black p-1"></td>
                                </tr>
                                <tr className="h-full">
                                    <td colSpan={4} className="border-t-2 border-r-2 border-black p-1 text-[7px] align-top">
                                        <p>Endorsement Its Is Intended To use Consignee Copy Of the Set For The Purpose Of Borrowing From The Consignee Bank</p>
                                        <p className="my-2">The Court In Delhi Alone Shall Have Jurisdiction In Respect Of The Claims And Matters Arising Under The Consignment Or Of The Claims And Matter Arising Under The Goods Entrusted For Transport</p>
                                        <p className="mt-4">Value :</p>
                                    </td>
                                    <td colSpan={3} className="border-t-2 border-black p-1 align-bottom">
                                        <div className="flex justify-between items-end h-full">
                                            <p className="font-bold text-red-600">GST PAYABLE BY <span className="text-black">{lr.gstPaidBy}</span></p>
                                            <div className="text-center">
                                                <p className="font-bold">For {companyDetails.name}</p>
                                                <img src={signatureUrl} alt="signature" className="h-10 mx-auto" />
                                                <p>Auth. Signatory</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LRPreviewModal;
