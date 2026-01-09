import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// ඔබේ Backend URL එක මෙතැනට දාන්න
const GALLERY_BASE_URL = 'https://kmv-gallery-backend-4nzw.onrender.com';
const socket = io(GALLERY_BASE_URL); 

const getAdminConfig = () => {
    return {
        headers: { 'Authorization': 'NIMSARA2009' }, // මුරපදය මෙතැනට
    };
};

const GalleryDashboard = ({ isAdminLoggedIn }) => {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [caption, setCaption] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [modalPhotoUrl, setModalPhotoUrl] = useState(null);
    const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const res = await axios.get(`${GALLERY_BASE_URL}/api/gallery`);
                setPhotos(res.data);
            } catch (err) { setError('Connection failed'); }
            finally { setLoading(false); }
        };
        fetchPhotos();
        socket.on('gallery_updated', (updatedPhotos) => setPhotos(updatedPhotos));
        return () => socket.off('gallery_updated');
    }, []);

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        const total = filesToUpload.length;
        for (let i = 0; i < total; i++) {
            const formData = new FormData();
            formData.append('image', filesToUpload[i]);
            formData.append('caption', caption || `Style ${i+1}`);
            try {
                await axios.post(`${GALLERY_BASE_URL}/api/gallery/upload`, formData, getAdminConfig());
                setBulkUploadProgress(Math.round(((i + 1) / total) * 100));
            } catch (err) { console.error("Upload Error"); }
        }
        setIsUploading(false);
        setFilesToUpload([]);
        setCaption('');
        setSuccessMessage('✅ Styles Published Successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    if (loading) return <div style={styles.loading}>Wait, Beauty is loading...</div>;

    return (
        <div style={styles.container}>
            {/* Modal for Full View */}
            {modalPhotoUrl && (
                <div style={styles.modal} onClick={() => setModalPhotoUrl(null)}>
                    <img src={modalPhotoUrl} style={styles.modalImg} alt="View" />
                </div>
            )}

            {/* Premium Header */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.logo}>DISH SALON</h1>
                    <p style={styles.subtitle}>ELEGANCE IN EVERY CUT</p>
                </div>
                <div style={styles.statusBadge}>{photos.length} Styles Live</div>
            </header>

            <main style={styles.main}>
                {successMessage && <div style={styles.success}>{successMessage}</div>}
                
                {/* Admin Upload Section */}
                {isAdminLoggedIn && (
                    <section style={styles.uploadCard}>
                        <h2 style={styles.cardTitle}>Add New Styles ✂️</h2>
                        <form onSubmit={handleBulkUpload}>
                            <label style={styles.fileDrop}>
                                {filesToUpload.length > 0 ? `Selected ${filesToUpload.length} Photos` : "Drop Styles or Click to Select"}
                                <input type="file" multiple hidden onChange={(e) => setFilesToUpload(Array.from(e.target.files))} />
                            </label>
                            <input 
                                style={styles.input} 
                                placeholder="Caption (e.g. Bridal Style 2024)" 
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                            <button disabled={isUploading} style={styles.btn}>
                                {isUploading ? `Uploading ${bulkUploadProgress}%` : "PUBLISH TO DASHBOARD"}
                            </button>
                        </form>
                    </section>
                )}

                {/* Gallery Grid */}
                <div style={styles.gridHeader}>
                    <span style={styles.line}></span>
                    <h3 style={styles.gridTitle}>STYLE PORTFOLIO</h3>
                    <span style={styles.line}></span>
                </div>

                <div style={styles.grid}>
                    {photos.map((photo) => (
                        <div key={photo._id} style={styles.card} onClick={() => setModalPhotoUrl(photo.photoUrl)}>
                            <div style={styles.imgContainer}>
                                <img src={photo.photoUrl} style={styles.img} alt="Style" />
                                <div style={styles.overlay}>VIEW STYLE</div>
                            </div>
                            <div style={styles.cardInfo}>
                                <p style={styles.caption}>{photo.caption}</p>
                                <div style={styles.cardFooter}>
                                    <span style={styles.tag}>Premium</span>
                                    {isAdminLoggedIn && (
                                        <button style={styles.delBtn} onClick={(e) => {
                                            e.stopPropagation();
                                            if(window.confirm("Delete?")) axios.delete(`${GALLERY_BASE_URL}/api/gallery/${photo._id}`, getAdminConfig());
                                        }}>🗑️</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#0c0c0c', minHeight: '100vh', color: '#fff', fontFamily: "'Playfair Display', serif" },
    header: { padding: '60px 20px', textAlign: 'center', borderBottom: '1px solid #222', background: 'radial-gradient(circle, #1a1a1a 0%, #0c0c0c 100%)' },
    logo: { fontSize: '50px', fontWeight: '900', color: '#d4af37', letterSpacing: '5px', margin: 0 },
    subtitle: { color: '#888', letterSpacing: '8px', fontSize: '12px', marginTop: '10px' },
    statusBadge: { display: 'inline-block', padding: '5px 15px', border: '1px solid #d4af37', color: '#d4af37', borderRadius: '20px', fontSize: '12px', marginTop: '20px' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' },
    uploadCard: { background: '#111', padding: '30px', borderRadius: '15px', border: '1px solid #222', marginBottom: '50px' },
    cardTitle: { color: '#d4af37', marginBottom: '20px', fontSize: '20px' },
    fileDrop: { display: 'block', padding: '40px', border: '2px dashed #333', textAlign: 'center', borderRadius: '10px', cursor: 'pointer', color: '#666', marginBottom: '20px' },
    input: { width: '100%', padding: '15px', background: '#000', border: '1px solid #222', borderRadius: '8px', color: '#fff', marginBottom: '20px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '15px', backgroundColor: '#d4af37', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    gridHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '40px' },
    gridTitle: { color: '#fff', fontSize: '18px', letterSpacing: '3px' },
    line: { height: '1px', width: '50px', backgroundColor: '#d4af37' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
    card: { background: '#111', borderRadius: '20px', overflow: 'hidden', border: '1px solid #222', transition: 'transform 0.3s' },
    imgContainer: { height: '400px', position: 'relative', overflow: 'hidden' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    overlay: { position: 'absolute', inset: 0, background: 'rgba(212, 175, 55, 0.8)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', opacity: 0, transition: '0.3s' },
    cardInfo: { padding: '20px' },
    caption: { fontSize: '18px', fontWeight: '600', marginBottom: '10px' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tag: { fontSize: '10px', color: '#888', textTransform: 'uppercase' },
    delBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
    success: { padding: '15px', background: '#d4af37', color: '#000', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    modalImg: { maxWidth: '100%', maxHeight: '90vh', borderRadius: '10px' },
    loading: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', fontSize: '24px' }
};

export default GalleryDashboard;
