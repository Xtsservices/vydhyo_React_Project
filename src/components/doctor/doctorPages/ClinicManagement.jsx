import React, { useState, useCallback, useRef, useEffect } from "react";
import { Edit, Eye, Plus, Search, X, Trash2 } from "lucide-react";
import {
  GoogleMap,
  useLoadScript,
  Autocomplete,
  Marker,
} from "@react-google-maps/api";
import { apiGet, apiPost } from "../../api";
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const libraries = ["places", "geocoding"];
const googleAPI = "AIzaSyCrmF3351j82RVuTZbVBJ-X3ufndylJsvo";

export default function ClinicManagement() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleAPI,
    libraries,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: "Clinic",
    clinicName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    mobile: "",
    pincode: "",
    startTime: "",
    endTime: "",
    latitude: "",
    longitude: "",
  });
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India center
  const [markerPosition, setMarkerPosition] = useState(null);

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiGet("/users/getClinicAddress", {});

        if (response.status === 200 && response.data?.status === "success") {
          setClinics(response.data.data || []);
        } else {
          throw new Error(response.data?.message || "Failed to fetch clinics");
        }
      } catch (err) {
        console.error("Error fetching clinics:", err);
        setError(err.message);
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    if (["Clinic", "Hospital"].includes(formData.type)) {
      if (!formData.startTime || !formData.endTime) {
        // alert(
        //   "Both start time and end time are required for Clinic or Hospital type"
        // );
        toast.error(
          "Both start time and end time are required for Clinic or Hospital type"
        );
        return;
      }
      if (
        !timeRegex.test(formData.startTime) ||
        !timeRegex.test(formData.endTime)
      ) {
        // alert("Invalid time format. Use HH:MM (24-hour format)");
        toast.error("Invalid time format. Use HH:MM (24-hour format)");
        return;
      }
      const toMinutes = (t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      if (toMinutes(formData.startTime) >= toMinutes(formData.endTime)) {
        // alert("Start time must be before end time");
        toast.error("Start time must be before end time");
        return;
      }
    }

    try {
      const response = await apiPost("/users/addAddress", formData);

      if (response.status === 200) {
        toast.success(response.data?.message || "Clinic added successfully");
        // Refresh the clinics list after successful addition
        const refreshResponse = await apiPost("/users/getClinicAddress", {});
        if (
          refreshResponse.status === 200 &&
          refreshResponse.data?.status === "success"
        ) {
          setClinics(refreshResponse.data.data || []);
        }

        // Reset form and close modal
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
          startTime: "",
          endTime: "",
          latitude: "",
          longitude: "",
        });
      } else {
        toast.error(response.data?.message || "Failed to add clinic");
        throw new Error(response.data?.message || "Failed to add clinic");
      }
    } catch (err) {
      // console.error("Error adding clinic:", err);
      // alert(err.message || "Failed to add clinic. Please try again.");
      toast.error(err.message || "Failed to add clinic. Please try again.");
    }
  };

  const handleDeleteClinic = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this clinic?")) return;

    try {
      const response = await apiPost("/users/deleteClinicAddress", {
        addressId,
      });

      if (response.status === 200) {
        toast.success(response.data?.message || "Clinic deleted successfully");
        // Refresh the clinics list after successful deletion
        const refreshResponse = await apiPost("/users/getClinicAddress", {});
        if (refreshResponse.status === 200) {
          setClinics(refreshResponse.data.data || []);
        }
      } else {
        toast.error(response.data?.message || "Failed to delete clinic");
        throw new Error(response.data?.message || "Failed to delete clinic");
      }
    } catch (err) {
      // console.error("Error deleting clinic:", err);
      // alert(err.message || "Failed to delete clinic. Please try again.");
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
      startTime: "",
      endTime: "",
      latitude: "",
      longitude: "",
    });
    setMapCenter({ lat: 20.5937, lng: 78.9629 });
    setMarkerPosition(null);
  };

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.addressId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const mainStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "16px",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "4px",
  };

  const subtitleStyle = {
    color: "#6b7280",
    fontSize: "14px",
  };

  const addButtonStyle = {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background-color 0.2s",
    fontSize: "14px",
  };

  const searchContainerStyle = {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
  };

  const searchInputContainerStyle = {
    position: "relative",
    flex: "1",
    maxWidth: "300px",
  };

  const searchIconStyle = {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  };

  const searchInputStyle = {
    width: "100%",
    paddingLeft: "32px",
    paddingRight: "12px",
    paddingTop: "8px",
    paddingBottom: "8px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const searchButtonStyle = {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "6px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    fontSize: "13px",
  };

  const tableContainerStyle = {
    backgroundColor: "white",
    borderRadius: "6px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  };

  const theadStyle = {
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  };

  const thStyle = {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#374151",
  };

  const trStyle = {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
    height: "60px",
  };

  const tdStyle = {
    padding: "16px",
    fontSize: "13px",
    lineHeight: "18px",
    fontWeight: "400",
    color: "#374151",
  };

  const statusBadgeStyle = {
    display: "inline-flex",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: "400",
    borderRadius: "12px",
  };

  const actionButtonsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const iconButtonStyle = {
    padding: "4px",
    cursor: "pointer",
    transition: "color 0.2s",
    border: "none",
    backgroundColor: "transparent",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "32px",
    width: "90%",
    maxWidth: "800px",
    position: "relative",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    maxHeight: "90vh",
    overflowY: "auto",
    marginTop: "4rem",
  };

  const modalHeaderStyle = {
    fontSize: "22px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "32px",
    textAlign: "left",
  };

  const formGroupStyle = {
    marginBottom: "24px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "8px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    backgroundColor: "#ffffff",
  };

  const selectStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    backgroundColor: "#ffffff",
    appearance: "none",
  };

  const formRowStyle = {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: "12px",
    marginTop: "32px",
  };

  const cancelButtonStyle = {
    flex: 1,
    padding: "12px 24px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    backgroundColor: "white",
    color: "#374151",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  const confirmButtonStyle = {
    flex: 1,
    padding: "12px 24px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    backgroundColor: "#2563eb",
    color: "white",
    transition: "background-color 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "6px",
    marginBottom: "24px",
  };

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={mainStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Clinic Management</h1>
            <p style={subtitleStyle}>
              Manage your clinic information, address, and operating status.
            </p>
          </div>
          <button
            style={addButtonStyle}
            onClick={handleAddClinic}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#2563eb")}
          >
            <Plus size={16} />
            Add Clinic
          </button>
        </div>

        {/* Search Bar */}
        <div style={searchContainerStyle}>
          <div style={searchInputContainerStyle}>
            <Search style={searchIconStyle} size={16} />
            <input
              type="text"
              placeholder="Search by Clinic Name or ID"
              style={searchInputStyle}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <button
            style={searchButtonStyle}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#2563eb")}
          >
            Search
          </button>
        </div>

        {/* Table */}
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                {/* <th style={thStyle}>Address ID</th> */}
                <th style={thStyle}>Clinic Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Operating Hours</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.length > 0 ? (
                filteredClinics.map((clinic) => (
                  <tr
                    key={clinic._id} // Using _id from MongoDB as key
                    style={trStyle}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    {/* <td
                      style={{
                        ...tdStyle,
                        fontWeight: "500",
                        color: "#111827",
                      }}
                    >
                      {clinic.addressId}
                    </td> */}
                    <td style={{ ...tdStyle, color: "#111827" }}>
                      {clinic.clinicName}
                    </td>
                    <td style={tdStyle}>{clinic.type}</td>
                    <td style={tdStyle}>
                      {clinic.address}, {clinic.city}, {clinic.state},{" "}
                      {clinic.country} {clinic.pincode}
                    </td>
                    <td style={tdStyle}>{clinic.mobile}</td>
                    <td style={tdStyle}>
                      {clinic.startTime} - {clinic.endTime}
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          ...statusBadgeStyle,
                          ...getStatusStyle(clinic.status),
                        }}
                      >
                        {clinic.status}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={actionButtonsStyle}>
                        <button
                          style={{ ...iconButtonStyle, color: "#2563eb" }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = "#1d4ed8")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = "#2563eb")
                          }
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          style={{ ...iconButtonStyle, color: "#6b7280" }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = "#374151")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = "#6b7280")
                          }
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          style={{ ...iconButtonStyle, color: "#dc2626" }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = "#b91c1c")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = "#dc2626")
                          }
                          title="Delete"
                          onClick={() => handleDeleteClinic(clinic.addressId)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ ...tdStyle, textAlign: "center" }}>
                    {clinics.length === 0
                      ? "No clinics found"
                      : "No matching clinics found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Enhanced Modal */}
        {showModal && (
          <div style={modalOverlayStyle} onClick={handleCancel}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <h2 style={modalHeaderStyle}>Add New Clinic Details</h2>

              <div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Location Preview (Click to select location)
                  </label>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    onClick={handleMapClick}
                    onLoad={(map) => (mapRef.current = map)}
                  >
                    {markerPosition && <Marker position={markerPosition} />}
                  </GoogleMap>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Clinic Name</label>
                  <input
                    type="text"
                    name="clinicName"
                    placeholder="Enter clinic name"
                    style={inputStyle}
                    value={formData.clinicName}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#3b82f6";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(59, 130, 246, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#d1d5db";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
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
                      style={inputStyle}
                      value={formData.address}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </Autocomplete>
                </div>

                <div style={formRowStyle}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      style={inputStyle}
                      value={formData.city}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Enter state"
                      style={inputStyle}
                      value={formData.state}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                <div style={formRowStyle}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Enter mobile number"
                      style={inputStyle}
                      value={formData.mobile}
                      maxLength={10} // ✅ limit to 10 characters
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, ""); // remove non-digit characters
                        if (onlyDigits.length <= 10) {
                          handleInputChange({
                            target: {
                              name: "mobile",
                              value: onlyDigits,
                            },
                          });
                        }
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Enter pincode"
                      style={inputStyle}
                      value={formData.pincode}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                <div style={formRowStyle}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Latitude</label>
                    <input
                      type="number"
                      name="latitude"
                      placeholder="Enter latitude"
                      style={inputStyle}
                      value={formData.latitude}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Longitude</label>
                    <input
                      type="number"
                      name="longitude"
                      placeholder="Enter longitude"
                      style={inputStyle}
                      value={formData.longitude}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                <div style={formRowStyle}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>
                      Start Time (required for Clinic/Hospital)
                    </label>
                    <input
                      type="text"
                      name="startTime"
                      placeholder="HH:MM (e.g., 09:00)"
                      style={inputStyle}
                      value={formData.startTime}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>
                      End Time (required for Clinic/Hospital)
                    </label>
                    <input
                      type="text"
                      name="endTime"
                      placeholder="HH:MM (e.g., 17:00)"
                      style={inputStyle}
                      value={formData.endTime}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#3b82f6";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#d1d5db";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                <div style={buttonGroupStyle}>
                  <button
                    type="button"
                    style={cancelButtonStyle}
                    onClick={handleCancel}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "white")
                    }
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={confirmButtonStyle}
                    onClick={handleSubmit}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#1d4ed8")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#2563eb")
                    }
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
