import { useState } from 'react';
import './UploadImage.css'
export const UploadModal = ({ isOpen, onClose, onUpload }: { isOpen: boolean, onClose: any, onUpload: any }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      // Sends the base64 string and filename to your S3 Lambda function
      await onUpload(reader.result, selectedFile.name);
      setSelectedFile(null); // Reset
      onClose(); 
    };
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal-container">
    <h3>Upload File</h3>
    <p>Upload your image to S3</p>
    
    <div className="upload-zone-simple">
       <input 
         type="file" 
         onChange={handleFileChange} 
         className="file-input-field"
       />
    </div>

    <div className="modal-actions">
       <button className="btn-cancel" onClick={onClose}>Cancel</button>
       <button className="btn-confirm" onClick={handleUploadClick}>Upload</button>
    </div>
  </div>
  );
};