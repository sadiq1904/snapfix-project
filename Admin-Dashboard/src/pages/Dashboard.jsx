// src/pages/Dashboard.jsx - COMPREHENSIVE HALL ADMIN OVERVIEW WITH TECHNICIAN ASSIGNMENT
import { useEffect, useState } from 'react';
//import supabase from '../config';
import supabase from '../config';
import {
  getPersistedHalls,
  getPersistedReports,
  getReportsByHall,
  getTechnicians,
  savePersistedReports
} from '../data/mockData';
export default   function Dashboard({ user }) {
const [Report,SetReport] = useState(0);
const [Raised,SetRaised] = useState(0);
const [images, setImages] = useState([]);
const [User, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [HallAdmin, setHallAdmin] = useState('');
const [Email, setEmail] = useState('');
const [Hall, setHall] = useState('');
//const [Counter,SetCounter] = useState(0)
const [Data,SetData] = useState();
//const [BenData,SetBenData] = useState();
// Get all data from a table
const [requests, setRequests] = useState([]);
const [recentReports, setRecentReports] = useState([]);
const [loadingRequests, setLoadingRequests] = useState(false);
const [fixingRequestId, setFixingRequestId] = useState(null);
//const isFixing = Number(Data?.request?.count || 0) > 0;
 //console.log("HallAdmin",HallAdmin);
 
useEffect(() => {
  const getSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }

    setLoading(false);
      

  };

  getSession();

 
}, []);
 function getServiceData(request, HallAdmin) {
  if (!request) return null;

  switch (HallAdmin) {
    case "Carpentry":
      return request.Carpentry?.[0] || null;

    case "Electrical":
      return request.Electrical?.[0] || null;

    case "Plumbing":
      return request.Plumbing?.[0] || null;

    case "Masonry":
      return request.Masonry?.[0] || null;

    default:
      return null;
  }
}
const getUserServiceData = async () => {
 
  try {
   const {
  data: { session },
  error:Error
} = await supabase.auth.getSession();
console.log("SESSION:", session);
console.log("ERROR:", Error);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

 const buckets = await supabase.storage.listBuckets();
  console.log("BUCKETS:", buckets);
    if (userError) {
      console.error("Error getting user:", userError);
      return null;
    }

    if (!user) {
      console.log("No authenticated user");
      return null;
    }

console.log("SESSION:", session);
console.log("ERROR:", Error);
    const userId = user.id;
 

    const [
      electricalResult,
      plumbingResult,
      carpentryResult,
      masonryResult,
    ] = await Promise.all([
      supabase
        .from("Electrical")
        .select("*")
        .eq("user_id", userId),

      supabase
        .from("Plumbing")
        .select("*")
        .eq("user_id", userId),

      supabase
        .from("Carpentry")
        .select("*")
        .eq("user_id", userId),

      supabase
        .from("Masonry")
        .select("*")
        .eq("user_id", userId),
    ]);

    if (electricalResult.error) {
      console.error("Electrical error:", electricalResult.error);
    }

    if (plumbingResult.error) {
      console.error("Plumbing error:", plumbingResult.error);
    }

    if (carpentryResult.error) {
      console.error("Carpentry error:", carpentryResult.error);
    }

    if (masonryResult.error) {
      console.error("Masonry error:", masonryResult.error);
    }

    return {
      userId,
      electrical: electricalResult.data ?? [],
      plumbing: plumbingResult.data ?? [],
      carpentry: carpentryResult.data ?? [],
      masonry: masonryResult.data ?? [],
    };
  } catch (error) {
    console.error("Unexpected error getting service data:", error);
    return null;
  }
};
const handleAssigned = async (request) => {
  const {
  data: { session },
  error:Error
} = await supabase.auth.getSession();
console.log("SESSION:", session);
console.log("ERROR:", Error);
 const { data: { user } } = await supabase.auth.getUser();
 const meat = handleAssign(user?.id)
 // Immediately change this specific button to yellow
    setFixingRequestId(request?.id);

 console.log(meat)
 console.log(user?.id)
      const sdata = await getUserServiceData(); 
  console.log("User service data:", sdata);
 // SetBenData(sdata)
 
  try{
 const { data, error } = await supabase.functions.invoke('email-handler', {
  body: { name: Email?.user_metadata.full_name,email:Email?.email },
})
console.log(data)
console.log(error)
  }
  catch(error){
console.log(error)
  }
 


};

useEffect(()=>{

const loadRequests = async () => {
  try {
    setLoadingRequests(true);
const {
  data: { session },
  error:Error
} = await supabase.auth.getSession();
console.log("SESSION:", session);
console.log("ERROR:", Error);
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      return;
    }

    if (!user) {
      console.log("No authenticated user");
      return;
    }

    /*
      IMPORTANT:

      This is where you should call the function/query
      that retrieves the request from your database.

      For now, I'm using your existing assign-tech
      function because that is the function you showed
      me that produces:

      {
        success: true,
        message: "Already assigned",
        request: {...}
      }
    */
  

    const { data, error } = await supabase.functions.invoke(
      "assign-tech",
      {
        body: {
          requestId: user.id
        }
      }
    );

    if (error) {
      console.error("Error loading request:", error);
      return;
    }

    console.log("Request loaded:", data);

    if (data?.success && data?.request) {
      setRequests([data.request]);
    } else {
      setRequests([]);
    }

  } catch (error) {
    console.error("Unexpected error loading request:", error);
    setRequests([]);
  } finally {
    setLoadingRequests(false);
  }
};
 if (user?.id) {
    loadRequests();
  }
},[user?.id ,])

function RequestTable({ requests,HallAdmin, loadingRequests, isSuperAdmin, images = []  }) {
  return (
    <div className="premium-card overflow-hidden">

      <div className="px-8 py-6 border-b border-border-light bg-surface-low/50 flex justify-between items-center">
        <h4 className="font-title-md text-title-md font-bold uppercase tracking-widest text-deep-charcoal">
          {isSuperAdmin ? "Global Maintenance Log" : "Recent Hall Requests"}
        </h4>
      </div>

      <div className="overflow-x-auto thin-scrollbar">

        <table className="premium-table">

          <thead>
            <tr>
              <th>Student Name</th>

              {isSuperAdmin && (
                <th>Residence Hall</th>
              )}

              <th>Location</th>

              <th>service type</th>

              <th>Selected issues</th>

              <th>status</th>
                <th>images</th>
              <th className="text-center">
                Request
              </th>
               <th className="text-center">
                
              </th>
            </tr>
          </thead>

          <tbody>

            {loadingRequests ? (

              <tr>
                <td
                  colSpan={isSuperAdmin ? 7 : 6}
                  className="text-center py-12 text-secondary"
                >
                  Loading requests...
                </td>
              </tr>

            ) : requests.length > 0 ? (

              HallAdmin.map((request) => (

                <tr key={request.id}>

                  {/* Student Name */}
                  <td>
                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 bg-deep-charcoal text-white flex items-center justify-center font-bold text-[10px] rounded-lg">
                        {request.full_name
                          ? request.full_name
                              .substring(0, 2)
                              .toUpperCase()
                          : "ST"}
                      </div>

                      <span className="font-bold text-[13px] text-deep-charcoal">
                        {request.full_name || "Unknown Student"}
                      </span>

                    </div>
                  </td>


                  {/* Residence Hall */}
                  {isSuperAdmin && (
                    <td>
                      <span className="font-semibold text-xs text-secondary">
                        {request.hall || "Unknown Hall"}
                      </span>
                    </td>
                  )}


                  {/* Location */}
                  <td className="text-secondary text-sm font-semibold">
                    {request.location || "Not specified"}
                  </td>


                  {/* Floor */}
                  <td>
                    <span className="font-semibold text-sm text-deep-charcoal">
                      {request.Plumbing?.[0].service_type || "N/A"}
                    </span>
                  </td>


                  {/* Room */}
                  <td>
                    <span className="font-semibold text-sm text-deep-charcoal">
                      {request.Plumbing?.[0].selected_issues
 || "N/A"}
                    </span>
                  </td>


                  {/* Status */}
                  <td className="text-center">

                    <span
                      className={`monochromatic-badge ${
                        request.status === "already assigned"
                          ? "in-progress"
                          : request.status === "resolved"
                          ? "success"
                          : "pending"
                      }`}
                    >
                      {request.status
                        ? request.status.replace("-", " ")
                        : "pending"}
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
                  <td className="text-center">

                    <button
                      onClick={() => handleAssigned(request)}
                      style={{
                        backgroundColor: fixingRequestId === request.id ? "#facc15" : "#16a34a",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      {fixingRequestId === request.id ? "Fixing" : "Accept"}
                    </button>

                  </td>

 <td className="text-center">

                    <button
                     // onClick={}
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontSize: "15px",
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >Resolved
                    </button>

                  </td>
                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={isSuperAdmin ? 7 : 6}
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
  );
}


const getAllData = async () => {
  try {
    const {
  data: { session },
  error:Error
} = await supabase.auth.getSession();
console.log("SESSION:", session);
console.log("ERROR:", Error);
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Auth error:", userError);
      return null;
    }

    if (!user) {
      console.log("No authenticated user");
      return null;
    }

    console.log("Current user:", user);
setEmail(user)
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        Electrical (*),
        Plumbing (*),
        Carpentry (*),
        Masonry (*)
      `);

    if (error) {
      console.error("Error fetching all related data:", error);
      return null;
    }

    console.log("ALL RELATED DATA:", data);
 setHallAdmin(data)
    return data;

  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
};

// Count total rows in a table
const countRows = async (tableName) => {
  try {
    const {
  data: { session },
  error:Error
} = await supabase.auth.getSession();

console.log("SESSION:", session);
console.log("ERROR:", Error);
    const { count, error } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (error) {
      throw error;
    }

    return count;

  } catch (error) {
    console.log(`Error counting ${tableName} rows:`, error.message);
    return null;
  }
};
 
 
useEffect(()=>{
const fetchData = async () => {

  const datad = await getAllData();

  console.log("All records:", datad);
try {
  const {
  data: { session },
  error:Error
} = await supabase.auth.getSession();
console.log("SESSION:", session);
console.log("ERROR:", Error);
  const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

     if (userError) {
      console.error("Error getting user:", userError);
      return null;
    }
  
 const { data, error } = await supabase.storage
  .from('images')
  .list("");

if (error) {
  console.error(error);
  return;
}
const imageFiles = data.filter(
  file => file.name !== '.emptyFolderPlaceholder'
);
const images = await Promise.all(
  imageFiles.map(async (file) => {
    const { data: urlData, error: urlError } = await supabase.storage
      .from('images')
      .createSignedUrl(file.name, 3600); // URL valid for 1 hour

    if (urlError) {
      console.error(`Error creating URL for ${file.name}:`, urlError);
      return null;
    }

    return {
      name: file.name,
      url: urlData.signedUrl,
    };
  })
);

const validImages = images.filter(Boolean);

console.log("Images:", validImages);
setImages(validImages);
const buckets = await supabase.storage

console.log("BUCKETS:", buckets);

} catch (error) {
  console.log(error)
}
    const [electrical, plumbing, carpentry, masonry] = await Promise.all([
    countRows("Electrical"),
    countRows("Plumbing"),
    countRows("Carpentry"),
    countRows("Masonry"),
  ]);

  const total =
    (electrical || 0) +
    (plumbing || 0) +
    (carpentry || 0) +
    (masonry || 0);




 // const total = await countRows();
SetReport(total)
SetRaised(total)
  console.log("Total rows:", total);
  return total;
};
fetchData();


},[])

if (HallAdmin === "University Hall(Katanga)") {
  setHall("University Hall");
} else if (HallAdmin === "Republic Hall") {
  setHall("Republic Hall");
} else if (HallAdmin === "Africa Hall") {
  setHall("Africa Hall");
} else if (HallAdmin === "Queens Hall") {
  setHall("Queens Hall");
} else if (HallAdmin=== "Independence Hall") {
 setHall("Independence Hall");
} else if (HallAdmin === "Unity Hall") {
 setHall("Unity Hall");
}
const handleAssign = async (requestId) => {
  
  try {
    const { data, error } = await supabase.functions.invoke(
      "assign-tech",
      {
        body: {
          requestId,
        },
      }
    );

    if (error) {
      console.error("Assign error:", error);
      return;
    }

    console.log("Assigned successfully:", data);
    SetData(data)
   
  } catch (error) {
    console.error("Unexpected error:", error);
  }
  
};


 console.log(Data)

useEffect(()=>{
if(Data?.request?.count !==0){
SetReport(0)
}
},[Data?.request?.count])



  const isSuperAdmin = user?.role === 'super_admin';
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    scheduled: 0,
    inProgress: 0,
    resolved: 0
  });
  
  const [reports, setReports] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [halls, setHalls] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const isVideo = (uri) => {
    if (!uri) return false;
    return uri.startsWith('data:video/') || uri.toLowerCase().endsWith('.mp4') || uri.toLowerCase().endsWith('.mov') || uri.toLowerCase().endsWith('.webm');
  };

  const loadData = () => {
    setHalls(getPersistedHalls());
    setTechnicians(getTechnicians());

    const hallId = isSuperAdmin ? selectedHall : user?.hallId;
    const hallReports = getReportsByHall(hallId);
    
    // Sort reports: newest first
    const sortedReports = [...hallReports].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setReports(sortedReports);

    const total = hallReports.length;
    const pending = hallReports.filter(r => r.status === 'pending').length;
    const scheduled = hallReports.filter(r => r.status === 'scheduled').length;
    const inProgress = hallReports.filter(r => r.status === 'in-progress').length;
    const resolved = hallReports.filter(r => r.status === 'resolved').length;
    
    setStats({ total, pending, scheduled, inProgress, resolved });
  };

  // Load stats and reports dynamically
  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      window.addEventListener('mock-data-updated', loadData);
      return () => window.removeEventListener('mock-data-updated', loadData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedHall, isSuperAdmin]);

  const handleAssignTechnician = (reportId, techId) => {
    const allReports = getPersistedReports();
    const tech = technicians.find(t => String(t.id) === String(techId));
    
    const updated = allReports.map(report => {
      if (report.id === reportId) {
        // Safe type assignment supporting both seeded numeric IDs (e.g. 4) and custom string IDs (e.g. 't12345')
        const finalTechId = techId ? (isNaN(Number(techId)) ? techId : Number(techId)) : null;
        return {
          ...report,
          assignedTo: finalTechId,
          assignedName: tech ? tech.name : null,
          assignedSpecialty: tech ? tech.specialty : null,
          status: techId ? 'scheduled' : 'pending' // Transition status on assignment
        };
      }
      return report;
    });
    
    savePersistedReports(updated);
    
    // Dispatch global event so the other windows/tabs catch database mutations
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mock-data-updated'));
    }

    loadData();
  };
//console.log("requests",requests)
  const getHallDisplay = () => {
    if (isSuperAdmin) {
      if (selectedHall) {
        const hall = halls.find(h => String(h.id) === String(selectedHall));
        return hall ? hall.name : 'All Halls';
      }
      return 'All Halls';
    }
    return user?.hallName || 'Your Hall';
  };

  const getInitials = (name) => {
    if (!name) return 'SA';
    const parts = name.trim().toUpperCase().split(/\s+/);
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return parts[0].slice(0, 2);
  };

  //const recentReports = reports.slice(0, 15); // Show top 15 reports directly in the dashboard

  return (
    <div className="font-headline-md min-h-screen p-4 md:p-8 animate-fade-in-up space-y-8">
      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="font-headline-xl text-headline-xl font-bold text-deep-charcoal tracking-tight">
            {getHallDisplay()} Overview
          </h2>
          <p className="text-secondary font-body-lg mt-1 border-l-2 border-deep-charcoal pl-4">
            Manage residential logs, track maintenance reports, and delegate jobs to specialists.
          </p>
        </div>

        {/* Global Hall Selector (Super Admin Only) */}
        {isSuperAdmin && (
          <div className="relative w-full md:w-64">
            <select
              value={selectedHall || ''}
              onChange={(e) => setSelectedHall(e.target.value ? Number(e.target.value) : null)}
              className="w-full premium-select appearance-none pl-4 pr-10 py-3"
            >
              <option value="">All Residence Halls</option>
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
              expand_more
            </span>
          </div>
        )}
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <span className="material-symbols-outlined text-deep-charcoal">assignment</span>
            <span className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">Total</span>
          </div>
          <div>
            <p className="text-secondary font-label-md uppercase tracking-widest text-[10px] mb-1">Reports Raised</p>
            <span className="text-4xl font-bold text-deep-charcoal tracking-tight">{Raised}</span>
          </div>
        </div>

        {/* Pending */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <span className="material-symbols-outlined text-status-critical-text" style={{ color: 'var(--status-critical-text)' }}>info</span>
            <span className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">Pending</span>
          </div>
          <div>
            <p className="text-secondary font-label-md uppercase tracking-widest text-[10px] mb-1">Unassigned</p>
            <span className="text-4xl font-bold text-deep-charcoal tracking-tight">{Report}</span>
          </div>
        </div>

        {/* Scheduled */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <span className="material-symbols-outlined text-status-pending-text" style={{ color: 'var(--status-pending-text)' }}>calendar_today</span>
            <span className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">Scheduled</span>
          </div>
          <div>
            <p className="text-secondary font-label-md uppercase tracking-widest text-[10px] mb-1">Assigned</p>
            <span className="text-4xl font-bold text-deep-charcoal tracking-tight">{Data?.request.count ||0}</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <span className="material-symbols-outlined text-status-pending-text" style={{ color: 'var(--status-pending-text)' }}>engineering</span>
            <span className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">Fixing</span>
          </div>
          <div>
            <p className="text-secondary font-label-md uppercase tracking-widest text-[10px] mb-1">In Progress</p>
            <span className="text-4xl font-bold text-deep-charcoal tracking-tight">{stats.inProgress + (fixingRequestId ? 1 : 0)}</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="premium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <span className="material-symbols-outlined text-status-success-text" style={{ color: 'var(--status-success-text)' }}>check_circle</span>
            <span className="text-secondary text-[10px] font-bold uppercase tracking-[0.2em]">Done</span>
          </div>
          <div>
            <p className="text-secondary font-label-md uppercase tracking-widest text-[10px] mb-1">Resolved</p>
            <span className="text-4xl font-bold text-deep-charcoal tracking-tight">{stats.resolved}</span>
          </div>
        </div>
      </div>

      {/* Master Reports Table Container */}
          <RequestTable
  requests={requests}
  loadingRequests={loadingRequests}
  isSuperAdmin={isSuperAdmin}
   images={images}
    HallAdmin={HallAdmin}
/>
      

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