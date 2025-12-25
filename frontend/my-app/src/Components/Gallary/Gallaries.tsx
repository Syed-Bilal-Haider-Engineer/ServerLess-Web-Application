import { useEffect, useState } from "react";
import PortalModal from "../../Shared/Model/Model";
import "./Gallaries.css";
import { UploadModal } from "../UploadImage/UploadImage";

interface GalleryItem {
  url: string;
  fileName: string;
}

export const Gallaries = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [images, setImages] = useState<GalleryItem[]>([]);
  
  const handleImageUpload = async (base64Image: any, fileName: any) => {

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const email = user.user?.email || "testbilal@gmail.com";
    console.log("Uploading image for:", email);
    console.log("File Name:", fileName);
    try {
      const API_URL =
        "https://t7kpkvx5f6.execute-api.us-east-1.amazonaws.com/uploadImage";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          imageBase64: base64Image,
          fileName: fileName,
        }),
      });

      const data = await response.json();
    console.log("Upload response:", data);
      if (response.ok) {
        await fetchGallery();
        alert("Success! File uploaded to S3.");
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Network error occurred during upload.");
    }
  };


  const fetchGallery = async () => {
    try {
  
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const email = user.user?.email || 'testbilal@gmail.com';
      console.log("Fetching gallery for:", email);
      if (!email) return;
      
      const response = await fetch(`https://t7kpkvx5f6.execute-api.us-east-1.amazonaws.com/gallery/${email}`);
      const data = await response.json();

      if (response.ok) {
        setImages(data); 
      }
      console.log("Gallery fetch response:", data,"response status:", response);
    } catch (error) {
      console.error("Failed to fetch gallery:", error);
      setImages([]);
    } 
  };

  useEffect(() => {
    fetchGallery();
  }, []);

 console.log("Gallery Images:", images);

  return (
    <>
      <div className="Gallaries-container">
        <header className="Gallaries-header">
          <h1>My Gallery</h1>
          <button className="upload-btn" onClick={() => setIsModalOpen(true)}>+ Upload New Image</button>
        </header>

        <div className="image-grid">
          {images.length > 0 ? images?.map((img:any,index) => (
            <div key={index} className="image-card">
              <img src={img.url} alt={img?.fileName} />
              <div className="image-info">
                <span>{img?.fileName}</span>
              </div>
            </div> 
          )): <p>No images found in the gallery.</p>}
        </div>
      </div>
      <PortalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <UploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpload={handleImageUpload}
        />
      </PortalModal>
    </>
  );
};

export default Gallaries;
