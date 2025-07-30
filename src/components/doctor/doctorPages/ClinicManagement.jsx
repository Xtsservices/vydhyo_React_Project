import React, { useState, useCallback, useRef, useEffect } from "react";
import { Edit, Plus, Search, X, Trash2, Upload ,Image,Eye} from "lucide-react";
import {
  GoogleMap,
  useLoadScript,
  Autocomplete,
  Marker,
} from "@react-google-maps/api";
import { apiGet, apiPost, apiPut } from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import "../../stylings/ClinicManagement.css";

const libraries = ["places", "geocoding"];
const googleAPI = "AIzaSyCrmF3351j82RVuTZbVBJ-X3ufndylJsvo";

export default function ClinicManagement() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleAPI,
    libraries,
  });
    const hasfetchClinics = useRef(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
   const [previewTitle, setPreviewTitle] = useState("");
    const [selectedHeaderImage, setSelectedHeaderImage] = useState(null);
  const [selectedDigitalSignature, setSelectedDigitalSignature] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: "Clinic",
    clinicName: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    mobile: "",
    pincode: "",
    startTime: "09:00",
    endTime: "17:00",
    latitude: "",
    longitude: "",
    addressId: "",
  });
  const [headerFile, setHeaderFile] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);
   const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [selectedClinicForHeader, setSelectedClinicForHeader] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);
  const signatureFileInputRef = useRef(null);

  useEffect(() => {
    const fetchClinics = async () => {
      if (!doctorId) {
        console.error("No doctorId available. User:", user);
        setError("No doctor ID available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching clinics for doctorId:", doctorId);
        const accessToken = localStorage.getItem("accessToken");
        const response = await apiGet(`/users/getClinicAddress?doctorId=${doctorId}`, {});

        console.log("API Response:", response);

        if (response.status === 200 && response.data?.status === "success") {
          const allClinics = response.data.data || [];
          const activeClinics = allClinics.filter((clinic) => clinic.status === "Active");
          const sortedClinics = [...activeClinics].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setClinics(sortedClinics);
        } else {
          setError("Failed to fetch clinics");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && doctorId && !hasfetchClinics.current) {
      hasfetchClinics.current = true
      fetchClinics();
    }
  }, [user, doctorId]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return {
          backgroundColor: "#dcfce7",
          color: "#15803d",
          border: "1px solid #bbf7d0",
          fontWeight: 600,
        };
      case "Pending":
        return {
          backgroundColor: "#fed7aa",
          color: "#c2410c",
          border: "1px solid #fdba74",
          fontWeight: 600,
        };
      case "Inactive":
        return {
          backgroundColor: "#fecaca",
          color: "#dc2626",
          border: "1px solid #fca5a5",
          fontWeight: 600,
        };
      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#374151",
          border: "1px solid #d1d5db",
          fontWeight: 600,
        };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const geocodeLatLng = useCallback((lat, lng) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addressComponents = results[0].address_components || [];
        const componentMap = {
          street_number: "",
          route: "",
          locality: "",
          administrative_area_level_1: "",
          country: "",
          postal_code: "",
        };

        for (const component of addressComponents) {
          const componentType = component.types[0];
          if (componentMap.hasOwnProperty(componentType)) {
            componentMap[componentType] = component.long_name;
          }
        }

        const formattedAddress =
          `${componentMap.street_number} ${componentMap.route}`.trim();
        setFormData((prev) => ({
          ...prev,
          address: formattedAddress || results[0].formatted_address,
          city: componentMap.locality,
          state: componentMap.administrative_area_level_1,
          country: componentMap.country,
          pincode: componentMap.postal_code,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
      } else {
        console.error("Geocoder failed due to: " + status);
      }
    });
  }, []);

  const handlePlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) {
      setFormData((prev) => ({ ...prev, address: "" }));
      return;
    }

    const addressComponents = place.address_components || [];
    const componentMap = {
      street_number: "",
      route: "",
      locality: "",
      administrative_area_level_1: "",
      country: "",
      postal_code: "",
    };

    for (const component of addressComponents) {
      const componentType = component.types[0];
      if (componentMap.hasOwnProperty(componentType)) {
        componentMap[componentType] = component.long_name;
      }
    }

    const formattedAddress =
      `${componentMap.street_number} ${componentMap.route}`.trim();
    const latitude = place.geometry.location.lat();
    const longitude = place.geometry.location.lng();

    setFormData((prev) => ({
      ...prev,
      address: formattedAddress || place.formatted_address,
      city: componentMap.locality,
      state: componentMap.administrative_area_level_1,
      country: componentMap.country,
      pincode: componentMap.postal_code,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    }));

    setMapCenter({ lat: latitude, lng: longitude });
    setMarkerPosition({ lat: latitude, lng: longitude });
  }, []);

  const handleMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMapCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
      geocodeLatLng(lat, lng);
    },
    [geocodeLatLng]
  );

  const handleAddClinic = () => {
    setShowModal(true);
    setIsEditing(false);
    setFormData({
      type: "Clinic",
      clinicName: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      mobile: "",
      pincode: "",
      startTime: "09:00",
      endTime: "17:00",
      latitude: "",
      longitude: "",
      addressId: "",
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          setMarkerPosition({ lat: latitude, lng: longitude });
          geocodeLatLng(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setMapCenter({ lat: 20.5937, lng: 78.9629 });
          setMarkerPosition(null);
        }
      );
    } else {
      console.error("Geolocation not supported");
      setMapCenter({ lat: 20.5937, lng: 78.9629 });
      setMarkerPosition(null);
    }
  };

  const handleEditClinic = (clinic) => {
    setShowModal(true);
    setIsEditing(true);
    setFormData({
      type: clinic.type,
      clinicName: clinic.clinicName,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      country: clinic.country,
      mobile: clinic.mobile,
      pincode: clinic.pincode,
      latitude: clinic.latitude?.toString() || "",
      longitude: clinic.longitude?.toString() || "",
      addressId: clinic.addressId,
    });

    if (clinic.latitude && clinic.longitude) {
      const lat = parseFloat(clinic.latitude);
      const lng = parseFloat(clinic.longitude);
      setMapCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
    } else {
      setMapCenter({ lat: 20.5937, lng: 78.9629 });
      setMarkerPosition(null);
    }
  };

  const handleUploadHeader = (clinic) => {
    setSelectedClinicForHeader(clinic);
    setShowHeaderModal(true);
    setHeaderFile(null);
    setHeaderPreview(null);
     setSignatureFile(null);
    setSignaturePreview(null);
  };

  const handleFileChange2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeaderFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

   const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "header") {
          setHeaderFile(file);
          setHeaderPreview(reader.result);
        } else if (type === "signature") {
          setSignatureFile(file);
          setSignaturePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderSubmit = async () => {
    if (!headerFile || !selectedClinicForHeader) return;

    try {
      const formData = new FormData();
      formData.append("file", headerFile);
       if (signatureFile) {
        formData.append("signature", signatureFile);
      }
      formData.append("addressId", selectedClinicForHeader.addressId);

      const response = await apiPost("/users/uploadClinicHeader", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Header uploaded successfully");
        setShowHeaderModal(false);
        // Refresh clinics list
        const refreshResponse = await apiGet(`/users/getClinicAddress?doctorId=${doctorId}`, {});
        if (refreshResponse.status === 200 && refreshResponse.data?.status === "success") {
          const allClinics = refreshResponse.data.data || [];
          const activeClinics = allClinics.filter((clinic) => clinic.status === "Active");
          const sortedClinics = [...activeClinics].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setClinics(sortedClinics);
        }
      } else {
        toast.error(response.data?.message || "Failed to upload header");
      }
    } catch (err) {
      console.error("Header upload error:", err);
      toast.error(err.message || "Failed to upload header");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctorId) {
      toast.error("No doctor ID available. Please try logging in again.");
      return;
    }

    try {
      let response;
      console.log("Submitting with doctorId:", doctorId, "FormData:", formData);
      if (isEditing) {
        const updateData = {
          addressId: formData.addressId,
          clinicName: formData.clinicName,
          mobile: formData.mobile,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
          latitude: formData.latitude,
          longitude: formData.longitude,
          startTime: formData.startTime,
          endTime: formData.endTime,
          location: {
            type: "Point",
            coordinates: [
              parseFloat(formData.longitude),
              parseFloat(formData.latitude),
            ],
          },
        };
        response = await apiPut("/users/updateAddress", updateData);
        console.log("Update API Response:", response);

        if (response.status === 200 && response.data?.status === "success") {
          toast.success(response.data?.message || "Clinic updated successfully");
           setShowModal(false);
        } else {
          toast.error(response.data?.message || "Failed to update clinic");
          throw new Error(response.data?.message || "Failed to update clinic");
        }
      } else {
        const newClinicData = {
          ...formData,
          userId: doctorId,
          startTime: formData.startTime || "09:00",
          endTime: formData.endTime || "17:00",
        };
        delete newClinicData.addressId;
        response = await apiPost("/users/addAddress", newClinicData);
        console.log("Add API Response:", response);

        if (response.status === 200 ||response.status ===201) {
          toast.success(response.data?.message || "Clinic added successfully");
           setShowModal(false);
        } else {
          toast.error(response.data?.message || "Failed to add clinic");
          throw new Error(response.data?.message || "Failed to add clinic");
        }
      }

      const refreshResponse = await apiGet(`/users/getClinicAddress?doctorId=${doctorId}`, {});
      console.log("Refresh API Response:", refreshResponse);

      if (
        refreshResponse.status === 200 &&
        refreshResponse.data?.status === "success"
      ) {
        const allClinics = refreshResponse.data.data || [];
        const activeClinics = allClinics.filter((clinic) => clinic.status === "Active");
        const sortedClinics = [...activeClinics].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setClinics(sortedClinics);
      }

      setShowModal(false);
      setFormData({
        type: "Clinic",
        clinicName: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        mobile: "",
        pincode: "",
        startTime: "09:00",
        endTime: "17:00",
        latitude: "",
        longitude: "",
        addressId: "",
      });
    } catch (err) {
      const errorMessage =
  err?.response?.data?.message?.message ||  // nested message
  err?.response?.data?.message ||          // fallback if just a string
  err?.message ||                          // generic JS error
  "Something went wrong";                  // ultimate fallback

toast.error(errorMessage);
      console.error("Submit error:", err?.response?.data?.message?.message);
    }
  };

  const handleDeleteClinic = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this clinic?")) return;

    try {
      const response = await apiPost("/users/deleteClinicAddress", { addressId });
      console.log("Delete API Response:", response);
      if (response.status === 200 || response.data?.status === "success") {
        toast.success(response.data?.message || "Clinic deleted successfully");
        setClinics((prevClinics) =>
          prevClinics.filter((clinic) => clinic.addressId !== addressId)
        );
      } else {
        toast.error(response.data?.message || "Failed to delete clinic");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete clinic. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      type: "Clinic",
      clinicName: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      mobile: "",
      pincode: "",
      startTime: "09:00",
      endTime: "17:00",
      latitude: "",
      longitude: "",
      addressId: "",
    });
    setMapCenter({ lat: 20.5937, lng: 78.9629 });
    setMarkerPosition(null);
  };

  const handleHeaderCancel = () => {
    setShowHeaderModal(false);
    setHeaderFile(null);
    setHeaderPreview(null);
    setSelectedClinicForHeader(null);
  };

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.addressId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

   const handleViewImage = (headerImage, digitalSignature) => {
     setSelectedHeaderImage(headerImage);
    setSelectedDigitalSignature(digitalSignature);
    // setSelectedImage(image);
    //  setPreviewTitle(title);
    setShowImagePreviewModal(true);
  };
   const handleCloseImagePreview = () => {
    setShowImagePreviewModal(false);
     setSelectedHeaderImage(null);
    setSelectedDigitalSignature(null);
  };

  return (
    <div className="clinic-management-container">
      <div className="clinic-management-main">
        <div className="clinic-management-header">
          <div>
            <h1 className="clinic-management-title">Clinic Management</h1>
            <p className="clinic-management-subtitle">
              Manage your clinic information, address, and operating status.
            </p>
          </div>
          <button
            className="clinic-management-add-button"
            onClick={handleAddClinic}
          >
            <Plus size={16} />
            Add Clinic
          </button>
        </div>

        <div className="clinic-search-container">
          <div className="clinic-search-input-container">
            <Search className="clinic-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search by Clinic Name"
              className="clinic-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="clinic-search-button">Search</button>
        </div>

        <div className="clinic-table-container">
          <table className="clinic-table">
            <thead className="clinic-table-header">
              <tr>
                <th className="clinic-table-th">Clinic Name</th>
                <th className="clinic-table-th">Type</th>
                <th className="clinic-table-th">Address</th>
                <th className="clinic-table-th">Contact</th>
                  <th className="clinic-table-th">Header Image</th>
                <th className="clinic-table-th">Status</th>
                <th className="clinic-table-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.length > 0 ? (
                filteredClinics.map((clinic) => (
                  <tr key={clinic._id} className="clinic-table-tr">
                    <td className="clinic-table-td clinic-name">{clinic.clinicName}</td>
                    <td className="clinic-table-td">{clinic.type}</td>
                    <td className="clinic-table-td">
                      {clinic.address}, {clinic.city}, {clinic.state}, {clinic.country} {clinic.pincode}
                    </td>
                    <td className="clinic-table-td">{clinic.mobile}</td>
                     <td className="clinic-table-td">
                     {clinic.headerImage ? (
                        <button
                          className="clinic-view-image-button"
                          title="View Header Image"
                          
                          onClick={() => handleViewImage(clinic.headerImage, clinic.digitalSignature)}
                        >
                          <Eye size={16} />
                        </button>
                      ) : (
                         <button
                          className="clinic-upload-button"
                          title="Upload Header"
                          onClick={() => handleUploadHeader(clinic)}
                        >
                          <Upload size={16} />
                        </button>
                      )}
                    </td>
                    <td className="clinic-table-td">
                      <span className="clinic-status-badge" style={getStatusStyle(clinic.status)}>
                        {clinic.status}
                      </span>
                    </td>
                    <td className="clinic-table-td">
                      <div className="clinic-action-buttons">
                        <button
                          className="clinic-edit-button"
                          title="Edit"
                          onClick={() => handleEditClinic(clinic)}
                        >
                          <Edit size={16} />
                        </button>
                        {/* <button
                          className="clinic-upload-button"
                          title="Upload Header"
                          onClick={() => handleUploadHeader(clinic)}
                        >
                          <Upload size={16} />
                        </button> */}
                        {user?.role === "doctor" && (
                          <button
                            className="clinic-delete-button"
                            title="Delete"
                            onClick={() => handleDeleteClinic(clinic.addressId)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="clinic-table-td no-clinics">
                    {clinics.length === 0 ? "No active clinics found" : "No matching active clinics found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="clinic-modal-overlay" onClick={handleCancel}>
            <div className="clinic-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="clinic-modal-header">
                {isEditing ? "Edit Clinic Details" : "Add New Clinic Details"}
              </h2>

              <div>
                <div className="clinic-form-group">
                  <label className="clinic-form-label">
                    Location Preview (Click to select location)
                  </label>
                  <GoogleMap
                    mapContainerClassName="clinic-map-container"
                    center={mapCenter}
                    zoom={15}
                    onClick={handleMapClick}
                    onLoad={(map) => (mapRef.current = map)}
                  >
                    {markerPosition && <Marker position={markerPosition} />}
                  </GoogleMap>
                </div>

                <div className="clinic-form-group">
                  <label className="clinic-form-label">Clinic Name</label>
                  <input
                    type="text"
                    name="clinicName"
                    placeholder="Enter clinic name"
                    className="clinic-form-input"
                    value={formData.clinicName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="clinic-form-group">
                  <label className="clinic-form-label">
                    Address (or click on map to select)
                  </label>
                  <Autocomplete
                    onLoad={(autocomplete) =>
                      (autocompleteRef.current = autocomplete)
                    }
                    onPlaceChanged={handlePlaceChanged}
                    restrictions={{ country: "in" }}
                  >
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter address or select on map"
                      className="clinic-form-input"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </Autocomplete>
                </div>

                <div className="clinic-form-row">
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      className="clinic-form-input"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Enter state"
                      className="clinic-form-input"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="clinic-form-row">
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Enter mobile number"
                      className="clinic-form-input"
                      value={formData.mobile}
                      maxLength={10}
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, "");
                        if (onlyDigits.length <= 10) {
                          handleInputChange({
                            target: {
                              name: "mobile",
                              value: onlyDigits,
                            },
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Enter pincode"
                      className="clinic-form-input"
                      value={formData.pincode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="clinic-form-row">
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      placeholder="Enter latitude"
                      className="clinic-form-input"
                      value={formData.latitude}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      placeholder="Enter longitude"
                      className="clinic-form-input"
                      value={formData.longitude}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="clinic-button-group">
                  <button
                    type="button"
                    className="clinic-cancel-button"
                    onClick={handleCancel}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="clinic-confirm-button"
                    onClick={handleSubmit}
                  >
                    {isEditing ? "Update" : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showHeaderModal && (
          <div className="clinic-modal-overlay" onClick={handleHeaderCancel}>
            <div className="clinic-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="clinic-modal-header">
                Upload Header  and Signature for {selectedClinicForHeader?.clinicName}
              </h2>
              
              <div className="clinic-form-group">
                <label className="clinic-form-label">Header Image</label>
                <div className="header-upload-container">
                  {headerPreview ? (
                    <div className="header-preview-container">
                      <img 
                        src={headerPreview} 
                        alt="Header preview" 
                        className="header-preview-image"
                      />
                      <button
                        className="header-change-button"
                        onClick={() => fileInputRef.current.click()}
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="header-upload-placeholder"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Upload size={24} />
                      <p>Click to upload header image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                      onChange={(e) => handleFileChange(e, "header")}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
                <p className="header-upload-note">
                  Note: This image will be used as the header for prescriptions from this clinic.
                </p>
              </div>

                <div className="clinic-form-group">
                <label className="clinic-form-label">Digital Signature (Optional)</label>
                <div className="header-upload-container">
                  {signaturePreview ? (
                    <div className="header-preview-container">
                      <img 
                        src={signaturePreview} 
                        alt="Signature preview" 
                        className="header-preview-image"
                      />
                      <button
                        className="header-change-button"
                        onClick={() => signatureFileInputRef.current.click()}
                      >
                        Change Signature
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="header-upload-placeholder"
                      onClick={() => signatureFileInputRef.current.click()}
                    >
                      <Upload size={24} />
                      <p>Click to upload digital signature</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={signatureFileInputRef}
                    onChange={(e) => handleFileChange(e, "signature")}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
                <p className="header-upload-note">
                  Note: This signature will be used on prescriptions (optional).
                </p>
              </div>


              <div className="clinic-button-group">
                <button
                  type="button"
                  className="clinic-cancel-button"
                  onClick={handleHeaderCancel}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  className="clinic-confirm-button"
                  onClick={handleHeaderSubmit}
                  disabled={!headerFile}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}

          {showImagePreviewModal && (
          <div className="clinic-modal-overlay" onClick={handleCloseImagePreview}>
            <div className="clinic-modal image-preview-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="clinic-modal-header">Header and Signature Preview</h2>
              <div className="image-preview-container">
                <div className="image-preview-section">
                  <h3>Header Image</h3>
                  {selectedHeaderImage ? (
                    <img
                      src={selectedHeaderImage}
                      alt="Header Preview"
                      className="image-preview"
                    />
                  ) : (
                    <p>No header image available</p>
                  )}
                </div>
                {selectedDigitalSignature && (
                  <div className="image-preview-section">
                    <h3>Digital Signature</h3>
                    <img
                      src={selectedDigitalSignature}
                      alt="Digital Signature Preview"
                      className="image-preview"
                    />
                  </div>
                )}
              </div>
              <div className="clinic-button-group">
                <button
                  type="button"
                  className="clinic-cancel-button"
                  onClick={handleCloseImagePreview}
                >
                  <X size={16} />
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}