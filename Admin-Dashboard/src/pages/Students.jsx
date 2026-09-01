// src/pages/Students.jsx - STUDENT REQUESTS (uses Dashboard's RequestTable)
import React, { useState, useEffect } from 'react';
import supabase from '../config';
import { getPersistedHalls } from '../data/mockData';

export default function Students({ user }) {
  const isSuperAdmin = user?.role === 'super_admin';

  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [fixingRequestId, setFixingRequestId] = useState(null);

  const [images, setImages] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const isVideo = (uri) => {
    if (!uri) return false;
    return (
      uri.startsWith('data:video/') ||
      uri.toLowerCase().endsWith('.mp4') ||
      uri.toLowerCase().endsWith('.mov') ||
      uri.toLowerCase().endsWith('.webm')
    );
  };

  useEffect(() => {
    setHalls(getPersistedHalls());
  }, []);

  // ---- Load requests from the assign-tech edge function ----
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoadingRequests(true);

        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error getting user:', userError);
          return;
        }
        if (!authUser) {
          console.log('No authenticated user');
          return;
        }

        const { data, error } = await supabase.functions.invoke('assign-tech', {
          body: { requestId: authUser.id },
        });

        if (error) {
          console.error('Error loading request:', error);
          return;
        }

        if (data?.success && data?.request) {
          setRequests([data.request]);
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error('Unexpected error loading request:', error);
        setRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    };

    if (user?.id) loadRequests();
  }, [user?.id]);

  // ---- Load images from storage ----
  useEffect(() => {
    const loadImages = async () => {
      try {
        const { data, error } = await supabase.storage.from('images').list('');

        if (error) {
          console.error('Storage list error:', error);
          return;
        }

        const imgs = data
          .filter((file) => file.name !== '.emptyFolderPlaceholder')
          .map((file) => {
            const { data: urlData } = supabase.storage
              .from('images')
              .getPublicUrl(file.name);
            return { name: file.name, url: urlData.publicUrl };
          });

        console.log('Images:', imgs);
        setImages(imgs);
      } catch (error) {
        console.error('Unexpected image load error:', error);
      }
    };

    loadImages();
  }, []);

  const handleAssign = async (requestId) => {
    try {
      const { data, error } = await supabase.functions.invoke('assign-tech', {
        body: { requestId },
      });

      if (error) {
        console.error('Assign error:', error);
        return;
      }
      console.log('Assigned successfully:', data);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleAssigned = async (request) => {
    setFixingRequestId(request?.id);
    await handleAssign(request?.id);
  };

  // ---- Filter by search + hall ----
  const filteredRequests = requests.filter((r) => {
    if (isSuperAdmin && selectedHall && String(r.hall_id) !== String(selectedHall)) {
      return false;
    }

    const term = searchQuery.toLowerCase();
    if (!term) return true;

    return (
      (r.full_name || '').toLowerCase().includes(term) ||
      (r.location || '').toLowerCase().includes(term) ||
      (r.room || '').toString().toLowerCase().includes(term)
    );
  });

  return (
    <div className="font-body-md">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h2 className="font-headline-xl text-headline-xl font-bold text-deep-charcoal tracking-tight">
            Student Requests
          </h2>
          <p className="text-secondary font-body-lg mt-1">
            {isSuperAdmin
              ? selectedHall
                ? `Showing requests for ${
                    halls.find((h) => String(h.id) === String(selectedHall))?.name || ''
                  }`
                : 'Showing requests across all halls'
              : `Showing requests for ${user?.hallName || 'your hall'}`}
          </p>
        </div>

        <div className="bg-white border border-surface-container-highest p-4 px-6 rounded-2xl flex items-center gap-5 min-w-[200px] shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-deep-charcoal text-[28px]">
              assignment
            </span>
          </div>
          <div>
            <p className="text-[10px] text-secondary uppercase font-bold tracking-[0.1em] mb-1">
              Total Requests
            </p>
            <p className="text-2xl font-bold text-deep-charcoal">{filteredRequests.length}</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-1 items-center gap-4 w-full md:max-w-2xl">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
              search
            </span>
            <input
              className="w-full pl-12 pr-4 py-3 bg-white border border-surface-container-highest rounded-xl focus:ring-1 focus:ring-deep-charcoal focus:border-deep-charcoal outline-none transition-all text-sm font-medium"
              placeholder="Search by name, location or room..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isSuperAdmin && (
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-3 bg-white border border-surface-container-highest rounded-xl focus:ring-1 focus:ring-deep-charcoal outline-none cursor-pointer text-sm font-medium min-w-[180px]"
                value={selectedHall || ''}
                onChange={(e) => setSelectedHall(e.target.value || null)}
              >
                <option value="">All Residence</option>
                {halls.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                expand_more
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ===== REQUEST TABLE ===== */}
      <div className="premium-card overflow-hidden">
        <div className="px-8 py-6 border-b border-border-light bg-surface-low/50 flex justify-between items-center">
          <h4 className="font-title-md text-title-md font-bold uppercase tracking-widest text-deep-charcoal">
            {isSuperAdmin ? 'Global Maintenance Log' : 'Recent Hall Requests'}
          </h4>
        </div>

        <div className="overflow-x-auto thin-scrollbar">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Student Name</th>
                {isSuperAdmin && <th>Residence Hall</th>}
                <th>Location</th>
                <th>Floor</th>
                <th>Room</th>
                <th>Request Status</th>
                <th>Images</th>
                
              </tr>
            </thead>

            <tbody>
              {loadingRequests ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 8 : 7}
                    className="text-center py-12 text-secondary"
                  >
                    Loading requests...
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.id}>
                    {/* Student Name */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-deep-charcoal text-white flex items-center justify-center font-bold text-[10px] rounded-lg">
                          {request.full_name
                            ? request.full_name.substring(0, 2).toUpperCase()
                            : 'ST'}
                        </div>
                        <span className="font-bold text-[13px] text-deep-charcoal">
                          {request.full_name || 'Unknown Student'}
                        </span>
                      </div>
                    </td>

                    {/* Residence Hall */}
                    {isSuperAdmin && (
                      <td>
                        <span className="font-semibold text-xs text-secondary">
                          {request.hall || 'Unknown Hall'}
                        </span>
                      </td>
                    )}

                    {/* Location */}
                    <td className="text-secondary text-sm font-semibold">
                      {request.location || 'Not specified'}
                    </td>

                    {/* Floor */}
                    <td>
                      <span className="font-semibold text-sm text-deep-charcoal">
                        {request.floor || 'N/A'}
                      </span>
                    </td>

                    {/* Room */}
                    <td>
                      <span className="font-semibold text-sm text-deep-charcoal">
                        {request.room || 'N/A'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="text-center">
                      <span
                        className={`monochromatic-badge ${
                          request.status === 'already assigned'
                            ? 'in-progress'
                            : request.status === 'resolved'
                            ? 'success'
                            : 'pending'
                        }`}
                      >
                        {request.status ? request.status.replace('-', ' ') : 'pending'}
                      </span>
                    </td>

                    {/* Images */}
                    <td>
                      {images.length > 0 ? (
                        <div className="flex items-center gap-2">
                          {images.slice(0, 3).map((img) => (
                            <img
                              key={img.name}
                              src={img.url}
                              alt={img.name}
                              onError={() => console.error('IMG FAILED:', img.url)}
                              onClick={() => {
                                setSelectedImage(img.url);
                                setShowImageModal(true);
                              }}
                              className="w-12 h-12 object-cover rounded-lg border border-border-light cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ))}
                          {images.length > 3 && (
                            <span className="text-[11px] text-secondary font-semibold">
                              +{images.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-secondary italic">No media</span>
                      )}
                    </td>

                    {/* Request Button */}
                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 8 : 7}
                    className="text-center py-12 text-secondary font-medium"
                  >
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== EVIDENCE MEDIA PREVIEW MODAL ===== */}
      {showImageModal && selectedImage && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="modal-content bg-white border border-border-medium rounded-xl p-6 max-w-2xl w-full shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-deep-charcoal uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined">image</span>
                Evidence Media
              </h3>
              <button
                className="outline-btn py-1 px-3 text-xs"
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImage('');
                }}
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
              {isVideo(selectedImage) ? (
                <video
                  src={selectedImage}
                  controls
                  autoPlay
                  className="max-h-[60vh] w-full object-contain"
                />
              ) : (
                <img
                  src={selectedImage}
                  alt="Evidence"
                  className="max-h-[60vh] w-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
