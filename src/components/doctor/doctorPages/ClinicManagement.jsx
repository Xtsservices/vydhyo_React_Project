import React, { useState, useCallback, useRef, useEffect } from "react";
import { Edit, Plus, Search, X, Trash2, Upload, Eye } from "lucide-react";
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
  const [showLabModal, setShowLabModal] = useState(false);
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [showPharmacyDetailsModal, setShowPharmacyDetailsModal] = useState(false);
  const [showLabDetailsModal, setShowLabDetailsModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [selectedHeaderImage, setSelectedHeaderImage] = useState(null);
  const [selectedDigitalSignature, setSelectedDigitalSignature] = useState(null);
  const [selectedPharmacyHeader, setSelectedPharmacyHeader] = useState(null);
  const [selectedLabHeader, setSelectedLabHeader] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pharmacyDetails, setPharmacyDetails] = useState(null);
  const [labDetails, setLabDetails] = useState(null);
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
    pharmacyName: "",
    pharmacyRegNum: "",
    pharmacyGST: "",
    pharmacyPAN: "",
    pharmacyAddress: "",
    labName: "",
    labRegNum: "",
    labGST: "",
    labPAN: "",
    labAddress: "",
  });
  const [headerFile, setHeaderFile] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [pharmacyHeaderFile, setPharmacyHeaderFile] = useState(null);
  const [pharmacyHeaderPreview, setPharmacyHeaderPreview] = useState(null);
  const [labHeaderFile, setLabHeaderFile] = useState(null);
  const [labHeaderPreview, setLabHeaderPreview] = useState(null);
  const [selectedClinicForHeader, setSelectedClinicForHeader] = useState(null);
  const [selectedClinicForLab, setSelectedClinicForLab] = useState(null);
  const [selectedClinicForPharmacy, setSelectedClinicForPharmacy] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);
  const signatureFileInputRef = useRef(null);
  const pharmacyFileInputRef = useRef(null);
  const labFileInputRef = useRef(null);

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
      hasfetchClinics.current = true;
      fetchClinics();
    }
  }, [user, doctorId]);

  const refreshClinics = async () => {
    try {
      const response = await apiGet(`/users/getClinicAddress?doctorId=${doctorId}`, {});
      if (response.status === 200 && response.data?.status === "success") {
        const allClinics = response.data.data || [];
        const activeClinics = allClinics.filter((clinic) => clinic.status === "Active");
        const sortedClinics = [...activeClinics].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setClinics(sortedClinics);
      }
    } catch (err) {
      console.error("Error refreshing clinics:", err);
    }
  };

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
      pharmacyName: "",
      pharmacyRegNum: "",
      pharmacyGST: "",
      pharmacyPAN: "",
      pharmacyAddress: "",
      labName: "",
      labRegNum: "",
      labGST: "",
      labPAN: "",
      labAddress: "",
    });
    setHeaderFile(null);
    setHeaderPreview(null);
    setSignatureFile(null);
    setSignaturePreview(null);
    setPharmacyHeaderFile(null);
    setPharmacyHeaderPreview(null);
    setLabHeaderFile(null);
    setLabHeaderPreview(null);

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
      pharmacyName: clinic.pharmacyName || "",
      pharmacyRegNum: clinic.pharmacyRegNum || "",
      pharmacyGST: clinic.pharmacyGST || "",
      pharmacyPAN: clinic.pharmacyPAN || "",
      pharmacyAddress: clinic.pharmacyAddress || "",
      labName: clinic.labName || "",
      labRegNum: clinic.labRegNum || "",
      labGST: clinic.labGST || "",
      labPAN: clinic.labPAN || "",
      labAddress: clinic.labAddress || "",
    });
    setHeaderFile(null);
    setHeaderPreview(clinic.headerImage || null);
    setSignatureFile(null);
    setSignaturePreview(clinic.digitalSignature || null);
    setPharmacyHeaderFile(null);
    setPharmacyHeaderPreview(clinic.pharmacyHeaderImage || null);
    setLabHeaderFile(null);
    setLabHeaderPreview(clinic.labHeaderImage || null);

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

  const handleAddLab = (clinic) => {
    setSelectedClinicForLab(clinic);
    setShowLabModal(true);
    setFormData({
      labName: clinic.labName || "",
      labRegNum: clinic.labRegNum || "",
      labGST: clinic.labGST || "",
      labPAN: clinic.labPAN || "",
      labAddress: clinic.labAddress || "",
      addressId: clinic.addressId,
    });
    setLabHeaderFile(null);
    setLabHeaderPreview(clinic.labHeaderImage || null);
  };

  const handleAddPharmacy = (clinic) => {
    setSelectedClinicForPharmacy(clinic);
    setShowPharmacyModal(true);
    setFormData({
      pharmacyName: clinic.pharmacyName || "",
      pharmacyRegNum: clinic.pharmacyRegNum || "",
      pharmacyGST: clinic.pharmacyGST || "",
      pharmacyPAN: clinic.pharmacyPAN || "",
      pharmacyAddress: clinic.pharmacyAddress || "",
      addressId: clinic.addressId,
    });
    setPharmacyHeaderFile(null);
    setPharmacyHeaderPreview(clinic.pharmacyHeaderImage || null);
  };

  const handleViewPharmacyDetails = async (clinic) => {
    try {
      const response = await apiGet(`/users/getPharmacyByClinicId/${clinic.addressId}`);
      if (response.status === 200) {
        setPharmacyDetails(response.data.data);
        setShowPharmacyDetailsModal(true);
      } else {
        toast.error("Failed to fetch pharmacy details");
      }
    } catch (err) {
      console.error("Error fetching pharmacy details:", err);
      toast.error("Failed to fetch pharmacy details");
    }
  };

  const handleViewLabDetails = async (clinic) => {
    try {
      const response = await apiGet(`/users/getLabByClinicId/${clinic.addressId}`);
      if (response.status === 200) {
        setLabDetails(response.data.data);
        setShowLabDetailsModal(true);
      } else {
        toast.error("Failed to fetch lab details");
      }
    } catch (err) {
      console.error("Error fetching lab details:", err);
      toast.error("Failed to fetch lab details");
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
        } else if (type === "pharmacyHeader") {
          setPharmacyHeaderFile(file);
          setPharmacyHeaderPreview(reader.result);
        } else if (type === "labHeader") {
          setLabHeaderFile(file);
          setLabHeaderPreview(reader.result);
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
        await refreshClinics();
      } else {
        toast.error(response.data?.message || "Failed to upload header");
      }
    } catch (err) {
      console.error("Header upload error:", err);
      toast.error(err.message || "Failed to upload header");
    }
  };

  const handleLabSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClinicForLab || !doctorId) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("userId", doctorId);
      formDataToSend.append("addressId", selectedClinicForLab.addressId);
      formDataToSend.append("labName", formData.labName);
      formDataToSend.append("labRegistrationNo", formData.labRegNum);
      formDataToSend.append("labGst", formData.labGST);
      formDataToSend.append("labPan", formData.labPAN);
      formDataToSend.append("labAddress", formData.labAddress);
      if (labHeaderFile) {
        formDataToSend.append("labHeader", labHeaderFile);
      }

      // First try without bypass
      const response = await apiPost("/users/addLabToClinic", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Lab details added successfully");
        setShowLabModal(false);
        await refreshClinics();
      } else {
        toast.error(response.data?.message || "Failed to add lab details");
      }
    } catch (err) {
      if (err.response?.data?.status === "warning" && err.response?.data?.data?.labId) {
        // Show confirmation dialog for conflict
        const shouldLink = window.confirm(
          err.response.data.message
        );
        
        if (shouldLink) {
          // Retry with bypassCheck=true
          const formDataToSend = new FormData();
          formDataToSend.append("userId", doctorId);
          formDataToSend.append("addressId", selectedClinicForLab.addressId);
          formDataToSend.append("labName", formData.labName);
          formDataToSend.append("labRegistrationNo", formData.labRegNum);
          formDataToSend.append("labGst", formData.labGST);
          formDataToSend.append("labPan", formData.labPAN);
          formDataToSend.append("labAddress", formData.labAddress);
          if (labHeaderFile) {
            formDataToSend.append("labHeader", labHeaderFile);
          }
          formDataToSend.append("bypassCheck", "true");

          const bypassResponse = await apiPost("/users/addLabToClinic?bypassCheck=true", formDataToSend, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (bypassResponse.status === 200 || bypassResponse.status === 201) {
            toast.success("Lab linked successfully");
            setShowLabModal(false);
            await refreshClinics();
          } else {
            toast.error(bypassResponse.data?.message || "Failed to link lab");
          }
        }
      } else {
        console.error("Lab submit error:", err);
        toast.error(err.message || "Failed to add lab details");
      }
    }
  };

  const handlePharmacySubmit = async (e) => {
    e.preventDefault();
    if (!selectedClinicForPharmacy || !doctorId) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("userId", doctorId);
      formDataToSend.append("addressId", selectedClinicForPharmacy.addressId);
      formDataToSend.append("pharmacyName", formData.pharmacyName);
      formDataToSend.append("pharmacyRegistrationNo", formData.pharmacyRegNum);
      formDataToSend.append("pharmacyGst", formData.pharmacyGST);
      formDataToSend.append("pharmacyPan", formData.pharmacyPAN);
      formDataToSend.append("pharmacyAddress", formData.pharmacyAddress);
      if (pharmacyHeaderFile) {
        formDataToSend.append("pharmacyHeader", pharmacyHeaderFile);
      }

      // First try without bypass
      const response = await apiPost("/users/addPharmacyToClinic", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Pharmacy details added successfully");
        setShowPharmacyModal(false);
        await refreshClinics();
      } else {
        toast.error(response.data?.message || "Failed to add pharmacy details");
      }
    } catch (err) {
      if (err.response?.data?.status === "warning" && err.response?.data?.data?.pharmacyId) {
        // Show confirmation dialog for conflict
        const shouldLink = window.confirm(
          err.response.data.message
        );
        
        if (shouldLink) {
          // Retry with bypassCheck=true
          const formDataToSend = new FormData();
          formDataToSend.append("userId", doctorId);
          formDataToSend.append("addressId", selectedClinicForPharmacy.addressId);
          formDataToSend.append("pharmacyName", formData.pharmacyName);
          formDataToSend.append("pharmacyRegistrationNo", formData.pharmacyRegNum);
          formDataToSend.append("pharmacyGst", formData.pharmacyGST);
          formDataToSend.append("pharmacyPan", formData.pharmacyPAN);
          formDataToSend.append("pharmacyAddress", formData.pharmacyAddress);
          if (pharmacyHeaderFile) {
            formDataToSend.append("pharmacyHeader", pharmacyHeaderFile);
          }
          formDataToSend.append("bypassCheck", "true");

          const bypassResponse = await apiPost("/users/addPharmacyToClinic?bypassCheck=true", formDataToSend, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (bypassResponse.status === 200 || bypassResponse.status === 201) {
            toast.success("Pharmacy linked successfully");
            setShowPharmacyModal(false);
            await refreshClinics();
          } else {
            toast.error(bypassResponse.data?.message || "Failed to link pharmacy");
          }
        }
      } else {
        console.error("Pharmacy submit error:", err);
        toast.error(err.message || "Failed to add pharmacy details");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctorId) {
      toast.error("No doctor ID available. Please try logging in again.");
      return;
    }

    if (formData.mobile && !/^[6-9]/.test(formData.mobile)) {
      toast.error("Mobile number must start with 6, 7, 8, or 9");
      return;
    }

    try {
      let response;
      const formDataToSend = new FormData();
      formDataToSend.append("type", formData.type);
      formDataToSend.append("clinicName", formData.clinicName);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("mobile", formData.mobile);
      formDataToSend.append("pincode", formData.pincode);
      formDataToSend.append("startTime", formData.startTime || "09:00");
      formDataToSend.append("endTime", formData.endTime || "17:00");
      formDataToSend.append("latitude", formData.latitude);
      formDataToSend.append("longitude", formData.longitude);
      if (headerFile) {
        formDataToSend.append("file", headerFile);
      }
      if (signatureFile) {
        formDataToSend.append("signature", signatureFile);
      }
      if (formData.labName) {
        formDataToSend.append("labName", formData.labName);
      }
      if (formData.labRegNum) {
        formDataToSend.append("labRegistrationNo", formData.labRegNum);
      }
      if (formData.labGST) {
        formDataToSend.append("labGst", formData.labGST);
      }
      if (formData.labPAN) {
        formDataToSend.append("labPan", formData.labPAN);
      }
      if (formData.labAddress) {
        formDataToSend.append("labAddress", formData.labAddress);
      }
      if (labHeaderFile) {
        formDataToSend.append("labHeader", labHeaderFile);
      }
      if (formData.pharmacyName) {
        formDataToSend.append("pharmacyName", formData.pharmacyName);
      }
      if (formData.pharmacyRegNum) {
        formDataToSend.append("pharmacyRegistrationNo", formData.pharmacyRegNum);
      }
      if (formData.pharmacyGST) {
        formDataToSend.append("pharmacyGst", formData.pharmacyGST);
      }
      if (formData.pharmacyPAN) {
        formDataToSend.append("pharmacyPan", formData.pharmacyPAN);
      }
      if (formData.pharmacyAddress) {
        formDataToSend.append("pharmacyAddress", formData.pharmacyAddress);
      }
      if (pharmacyHeaderFile) {
        formDataToSend.append("pharmacyHeader", pharmacyHeaderFile);
      }

      console.log("Submitting with doctorId:", doctorId, "FormData:", formData);
      if (isEditing) {
        formDataToSend.append("addressId", formData.addressId);
        formDataToSend.append("location", JSON.stringify({
          type: "Point",
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
        }));
        response = await apiPut("/users/updateAddress", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Update API Response:", response);

        if (response.status === 200 && response.data?.status === "success") {
          toast.success(response.data?.message || "Clinic updated successfully");
          setShowModal(false);
        } else {
          toast.warning(response.data?.message || "Failed to update clinic");
          throw new Error(response.data?.message || "Failed to update clinic");
        }
      } else {
        formDataToSend.append("userId", doctorId);
        response = await apiPost("/users/addAddressFromWeb", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Add API Response:", response);
        if (response.status === 200 && response.data?.status === "warning") {
        // Handle duplicate registration number
        const { message, data } = response.data;
        const isPharmacyConflict = data?.pharmacyId;
        const isLabConflict = data?.labId;
        const entity = isPharmacyConflict ? "pharmacy" : "lab";
        const confirmMessage = `${message} Do you want to link this ${entity}?`;

        const shouldLink = window.confirm(confirmMessage);

        if (shouldLink) {
          // Retry with bypassCheck=true
          // formDataToSend.append("bypassCheck", "true");
          const bypassResponse = await apiPost("/users/addAddressFromWeb?bypassCheck=true", formDataToSend, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (bypassResponse.status === 200 || bypassResponse.status === 201) {
            toast.success(bypassResponse.data?.message || `Clinic and ${entity} linked successfully`);
            setShowModal(false);
          } else {
            toast.warning(bypassResponse.data?.message || `Failed to link ${entity}`);
            throw new Error(bypassResponse.data?.message || `Failed to link ${entity}`);
          }
        } else {
          toast.info(`Cancelled linking ${entity}`);
          return;
        }
      }

        else if (response.status === 200 || response.status === 201) {
          toast.success(response.data?.message || "Clinic added successfully");
          setShowModal(false);
        } else {
          toast.warning(response.data?.message || "Failed to add clinic");
          throw new Error(response.data?.message || "Failed to add clinic");
        }
      }

      await refreshClinics();
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
        pharmacyName: "",
        pharmacyRegNum: "",
        pharmacyGST: "",
        pharmacyPAN: "",
        pharmacyAddress: "",
        labName: "",
        labRegNum: "",
        labGST: "",
        labPAN: "",
        labAddress: "",
      });
      setHeaderFile(null);
      setHeaderPreview(null);
      setSignatureFile(null);
      setSignaturePreview(null);
      setPharmacyHeaderFile(null);
      setPharmacyHeaderPreview(null);
      setLabHeaderFile(null);
      setLabHeaderPreview(null);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong";
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
      pharmacyName: "",
      pharmacyRegNum: "",
      pharmacyGST: "",
      pharmacyPAN: "",
      pharmacyAddress: "",
      labName: "",
      labRegNum: "",
      labGST: "",
      labPAN: "",
      labAddress: "",
    });
    setHeaderFile(null);
    setHeaderPreview(null);
    setSignatureFile(null);
    setSignaturePreview(null);
    setPharmacyHeaderFile(null);
    setPharmacyHeaderPreview(null);
    setLabHeaderFile(null);
    setLabHeaderPreview(null);
    setMapCenter({ lat: 20.5937, lng: 78.9629 });
    setMarkerPosition(null);
  };

  const handleHeaderCancel = () => {
    setShowHeaderModal(false);
    setHeaderFile(null);
    setHeaderPreview(null);
    setSignatureFile(null);
    setSignaturePreview(null);
    setSelectedClinicForHeader(null);
  };

  const handleLabCancel = () => {
    setShowLabModal(false);
    setLabHeaderFile(null);
    setLabHeaderPreview(null);
    setSelectedClinicForLab(null);
    setFormData((prev) => ({
      ...prev,
      labName: "",
      labRegNum: "",
      labGST: "",
      labPAN: "",
      labAddress: "",
    }));
  };

  const handlePharmacyCancel = () => {
    setShowPharmacyModal(false);
    setPharmacyHeaderFile(null);
    setPharmacyHeaderPreview(null);
    setSelectedClinicForPharmacy(null);
    setFormData((prev) => ({
      ...prev,
      pharmacyName: "",
      pharmacyRegNum: "",
      pharmacyGST: "",
      pharmacyPAN: "",
      pharmacyAddress: "",
    }));
  };

  const handleClosePharmacyDetails = () => {
    setShowPharmacyDetailsModal(false);
    setPharmacyDetails(null);
  };

  const handleCloseLabDetails = () => {
    setShowLabDetailsModal(false);
    setLabDetails(null);
  };

  const handleViewImage = (headerImage, digitalSignature, pharmacyHeaderImage, labHeaderImage) => {
    setSelectedHeaderImage(headerImage);
    setSelectedDigitalSignature(digitalSignature);
    setSelectedPharmacyHeader(pharmacyHeaderImage);
    setSelectedLabHeader(labHeaderImage);
    setShowImagePreviewModal(true);
  };

  const handleCloseImagePreview = () => {
    setShowImagePreviewModal(false);
    setSelectedHeaderImage(null);
    setSelectedDigitalSignature(null);
    setSelectedPharmacyHeader(null);
    setSelectedLabHeader(null);
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
                <th className="clinic-table-th">Pharmacy</th>
                <th className="clinic-table-th">Lab</th>
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
                          onClick={() => handleViewImage(clinic.headerImage, clinic.digitalSignature, clinic.pharmacyHeaderImage, clinic.labHeaderImage)}
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
                      {clinic.pharmacyName ? (
                        <button
                          className="clinic-view-image-button"
                          title="View Pharmacy Details"
                          onClick={() => handleViewPharmacyDetails(clinic)}
                        >
                          <Eye size={16} />
                        </button>
                      ) : (
                        <button
                          className="clinic-upload-button"
                          title="Add Pharmacy Details"
                          onClick={() => handleAddPharmacy(clinic)}
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </td>
                    <td className="clinic-table-td">
                      {clinic.labName ? (
                        <button
                          className="clinic-view-image-button"
                          title="View Lab Details"
                          onClick={() => handleViewLabDetails(clinic)}
                        >
                          <Eye size={16} />
                        </button>
                      ) : (
                        <button
                          className="clinic-upload-button"
                          title="Add Lab Details"
                          onClick={() => handleAddLab(clinic)}
                        >
                          <Plus size={16} />
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
                  <td colSpan="9" className="clinic-table-td no-clinics">
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
                        if (onlyDigits === "" || /^[6-9]/.test(onlyDigits)) {
                          handleInputChange({
                            target: {
                              name: "mobile",
                              value: onlyDigits.slice(0, 10),
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
                      placeholder="Pincode (auto-filled)"
                      className="clinic-form-input"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      readOnly
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

                <div className="clinic-form-group">
                  <label className="clinic-form-label">Clinic Header Image</label>
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
                      style={{ display: "none" }}
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
                      style={{ display: "none" }}
                    />
                  </div>
                  <p className="header-upload-note">
                    Note: This signature will be used on prescriptions (optional).
                  </p>
                </div>

                <h3 className="clinic-modal-subheader">Lab Details (Optional)</h3>
                <div className="clinic-form-group">
                  <label className="clinic-form-label">Lab Name</label>
                  <input
                    type="text"
                    name="labName"
                    placeholder="Enter lab name"
                    className="clinic-form-input"
                    value={formData.labName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="clinic-form-row">
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Lab Registration Number</label>
                    <input
                      type="text"
                      name="labRegNum"
                      placeholder="Enter registration number"
                      className="clinic-form-input"
                      value={formData.labRegNum}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Lab GST Number</label>
                    <input
                      type="text"
                      name="labGST"
                      placeholder="Enter GST number"
                      className="clinic-form-input"
                      value={formData.labGST}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="clinic-form-row">
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Lab PAN</label>
                    <input
                      type="text"
                      name="labPAN"
                      placeholder="Enter PAN number"
                      className="clinic-form-input"
                      value={formData.labPAN}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Lab Address</label>
                    <input
                      type="text"
                      name="labAddress"
                      placeholder="Enter lab address"
                      className="clinic-form-input"
                      value={formData.labAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="clinic-form-group">
                  <label className="clinic-form-label">Lab Header Image (Optional)</label>
                  <div className="header-upload-container">
                    {labHeaderPreview ? (
                      <div className="header-preview-container">
                        <img
                          src={labHeaderPreview}
                          alt="Lab header preview"
                          className="header-preview-image"
                        />
                        <button
                          className="header-change-button"
                          onClick={() => labFileInputRef.current.click()}
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <div
                        className="header-upload-placeholder"
                        onClick={() => labFileInputRef.current.click()}
                      >
                        <Upload size={24} />
                        <p>Click to upload lab header image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={labFileInputRef}
                      onChange={(e) => handleFileChange(e, "labHeader")}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </div>
                  <p className="header-upload-note">
                    Note: This image will be used as the header for lab-related documents.
                  </p>
                </div>

                <h3 className="clinic-modal-subheader">Pharmacy Details (Optional)</h3>
                <div className="clinic-form-group">
                  <label className="clinic-form-label">Pharmacy Name</label>
                  <input
                    type="text"
                    name="pharmacyName"
                    placeholder="Enter pharmacy name"
                    className="clinic-form-input"
                    value={formData.pharmacyName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="clinic-form-row">
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Pharmacy Registration Number</label>
                    <input
                      type="text"
                      name="pharmacyRegNum"
                      placeholder="Enter registration number"
                      className="clinic-form-input"
                      value={formData.pharmacyRegNum}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Pharmacy GST Number</label>
                    <input
                      type="text"
                      name="pharmacyGST"
                      placeholder="Enter GST number"
                      className="clinic-form-input"
                      value={formData.pharmacyGST}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="clinic-form-row">
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Pharmacy PAN</label>
                    <input
                      type="text"
                      name="pharmacyPAN"
                      placeholder="Enter PAN number"
                      className="clinic-form-input"
                      value={formData.pharmacyPAN}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="clinic-form-col">
                    <label className="clinic-form-label">Pharmacy Address</label>
                    <input
                      type="text"
                      name="pharmacyAddress"
                      placeholder="Enter pharmacy address"
                      className="clinic-form-input"
                      value={formData.pharmacyAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="clinic-form-group">
                  <label className="clinic-form-label">Pharmacy Header Image (Optional)</label>
                  <div className="header-upload-container">
                    {pharmacyHeaderPreview ? (
                      <div className="header-preview-container">
                        <img
                          src={pharmacyHeaderPreview}
                          alt="Pharmacy header preview"
                          className="header-preview-image"
                        />
                        <button
                          className="header-change-button"
                          onClick={() => pharmacyFileInputRef.current.click()}
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <div
                        className="header-upload-placeholder"
                        onClick={() => pharmacyFileInputRef.current.click()}
                      >
                        <Upload size={24} />
                        <p>Click to upload pharmacy header image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={pharmacyFileInputRef}
                      onChange={(e) => handleFileChange(e, "pharmacyHeader")}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </div>
                  <p className="header-upload-note">
                    Note: This image will be used as the header for pharmacy-related documents.
                  </p>
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
                Upload Header and Signature for {selectedClinicForHeader?.clinicName}
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
                    style={{ display: "none" }}
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
                    style={{ display: "none" }}
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

        {showLabModal && (
          <div className="clinic-modal-overlay" onClick={handleLabCancel}>
            <div className="clinic-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="clinic-modal-header">
                {selectedClinicForLab?.labName ? "Edit Lab Details for" : "Add Lab Details for"} {selectedClinicForLab?.clinicName}
              </h2>

              <div className="clinic-form-group">
                <label className="clinic-form-label">Lab Name</label>
                <input
                  type="text"
                  name="labName"
                  placeholder="Enter lab name"
                  className="clinic-form-input"
                  value={formData.labName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="clinic-form-row">
                <div className="clinic-form-col">
                  <label className="clinic-form-label">Lab Registration Number</label>
                  <input
                    type="text"
                    name="labRegNum"
                    placeholder="Enter registration number"
                    className="clinic-form-input"
                    value={formData.labRegNum}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="clinic-form-col">
                  <label className="clinic-form-label">Lab GST Number</label>
                  <input
                    type="text"
                    name="labGST"
                    placeholder="Enter GST number"
                    className="clinic-form-input"
                    value={formData.labGST}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="clinic-form-row">
                <div className="clinic-form-col">
                  <label className="clinic-form-label">Lab PAN</label>
                  <input
                    type="text"
                    name="labPAN"
                    placeholder="Enter PAN number"
                    className="clinic-form-input"
                    value={formData.labPAN}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="clinic-form-col">
                  <label className="clinic-form-label">Lab Address</label>
                  <input
                    type="text"
                    name="labAddress"
                    placeholder="Enter lab address"
                    className="clinic-form-input"
                    value={formData.labAddress}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="clinic-form-group">
                <label className="clinic-form-label">Lab Header Image (Optional)</label>
                <div className="header-upload-container">
                  {labHeaderPreview ? (
                    <div className="header-preview-container">
                      <img
                        src={labHeaderPreview}
                        alt="Lab header preview"
                        className="header-preview-image"
                      />
                      <button
                        className="header-change-button"
                        onClick={() => labFileInputRef.current.click()}
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div
                      className="header-upload-placeholder"
                      onClick={() => labFileInputRef.current.click()}
                    >
                      <Upload size={24} />
                      <p>Click to upload lab header image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={labFileInputRef}
                    onChange={(e) => handleFileChange(e, "labHeader")}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
                <p className="header-upload-note">
                  Note: This image will be used as the header for lab-related documents.
                </p>
              </div>

              <div className="clinic-button-group">
                <button
                  type="button"
                  className="clinic-cancel-button"
                  onClick={handleLabCancel}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  className="clinic-confirm-button"
                  onClick={handleLabSubmit}
                >
                  Save Lab Details
                </button>
              </div>
            </div>
          </div>
        )}

        {showPharmacyModal && (
          <div className="clinic-modal-overlay" onClick={handlePharmacyCancel}>
            <div className="clinic-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="clinic-modal-header">
                {selectedClinicForPharmacy?.pharmacyName ? "Edit Pharmacy Details for" : "Add Pharmacy Details for"} {selectedClinicForPharmacy?.clinicName}
              </h2>

              <div className="clinic-form-group">
                <label className="clinic-form-label">Pharmacy Name</label>
                <input
                  type="text"
                  name="pharmacyName"
                  placeholder="Enter pharmacy name"
                  className="clinic-form-input"
                  value={formData.pharmacyName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="clinic-form-row">
                <div className="clinic-form-col">
                  <label className="clinic-form-label">Pharmacy Registration Number</label>
                  <input
                    type="text"
                    name="pharmacyRegNum"
                    placeholder="Enter registration number"
                    className="clinic-form-input"
                    value={formData.pharmacyRegNum}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="clinic-form-col">
                  <label className="clinic-form-label">Pharmacy GST Number</label>
                  <input
                    type="text"
                    name="pharmacyGST"
                    placeholder="Enter GST number"
                    className="clinic-form-input"
                    value={formData.pharmacyGST}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="clinic-form-row">
                <div className="clinic-form-col">
                  <label className="clinic-form-label">Pharmacy PAN</label>
                  <input
                    type="text"
                    name="pharmacyPAN"
                    placeholder="Enter PAN number"
                    className="clinic-form-input"
                    value={formData.pharmacyPAN}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="clinic-form-col">
                  <label className="clinic-form-label">Pharmacy Address</label>
                  <input
                    type="text"
                    name="pharmacyAddress"
                    placeholder="Enter pharmacy address"
                    className="clinic-form-input"
                    value={formData.pharmacyAddress}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="clinic-form-group">
                <label className="clinic-form-label">Pharmacy Header Image (Optional)</label>
                <div className="header-upload-container">
                  {pharmacyHeaderPreview ? (
                    <div className="header-preview-container">
                      <img
                        src={pharmacyHeaderPreview}
                        alt="Pharmacy header preview"
                        className="header-preview-image"
                      />
                      <button
                        className="header-change-button"
                        onClick={() => pharmacyFileInputRef.current.click()}
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div
                      className="header-upload-placeholder"
                      onClick={() => pharmacyFileInputRef.current.click()}
                    >
                      <Upload size={24} />
                      <p>Click to upload pharmacy header image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={pharmacyFileInputRef}
                    onChange={(e) => handleFileChange(e, "pharmacyHeader")}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
                <p className="header-upload-note">
                  Note: This image will be used as the header for pharmacy-related documents.
                </p>
              </div>

              <div className="clinic-button-group">
                <button
                  type="button"
                  className="clinic-cancel-button"
                  onClick={handlePharmacyCancel}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  className="clinic-confirm-button"
                  onClick={handlePharmacySubmit}
                >
                  Save Pharmacy Details
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
                {selectedHeaderImage && (
                  <div className="image-preview-section">
                    <h3>Header Image</h3>
                    <img
                      src={selectedHeaderImage}
                      alt="Header Preview"
                      className="image-preview"
                    />
                  </div>
                )}
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
                {selectedPharmacyHeader && (
                  <div className="image-preview-section">
                    <h3>Pharmacy Header Image</h3>
                    <img
                      src={selectedPharmacyHeader}
                      alt="Pharmacy Header Preview"
                      className="image-preview"
                    />
                  </div>
                )}
                {selectedLabHeader && (
                  <div className="image-preview-section">
                    <h3>Lab Header Image</h3>
                    <img
                      src={selectedLabHeader}
                      alt="Lab Header Preview"
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

        {showPharmacyDetailsModal && pharmacyDetails && (
          <div className="clinic-modal-overlay" onClick={handleClosePharmacyDetails}>
            <div className="clinic-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="clinic-modal-header">Pharmacy Details</h2>
              
              <div className="pharmacy-details-container">
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">Pharmacy ID:</span>
                  <span className="pharmacy-details-value">{pharmacyDetails.pharmacyId}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">Pharmacy Name:</span>
                  <span className="pharmacy-details-value">{pharmacyDetails.pharmacyName}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">Registration Number:</span>
                  <span className="pharmacy-details-value">{pharmacyDetails.pharmacyRegistrationNo}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">GST Number:</span>
                  <span className="pharmacy-details-value">{pharmacyDetails.pharmacyGst}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">PAN Number:</span>
                  <span className="pharmacy-details-value">{pharmacyDetails.pharmacyPan}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">Address:</span>
                  <span className="pharmacy-details-value">{pharmacyDetails.pharmacyAddress}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">Updated At:</span>
                  <span className="pharmacy-details-value">{new Date(pharmacyDetails.updatedAt).toLocaleString()}</span>
                </div>
                {pharmacyDetails.pharmacyHeader && (
                  <div className="pharmacy-details-row">
                    <span className="pharmacy-details-label">Header Image:</span>
                    <div className="pharmacy-header-preview">
                      <img 
                        src={pharmacyDetails.pharmacyHeader} 
                        alt="Pharmacy Header" 
                        className="pharmacy-header-image"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="clinic-button-group">
                <button
                  type="button"
                  className="clinic-cancel-button"
                  onClick={handleClosePharmacyDetails}
                >
                  <X size={16} />
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showLabDetailsModal && labDetails && (
          <div className="clinic-modal-overlay" onClick={handleCloseLabDetails}>
            <div className="clinic-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="clinic-modal-header">Lab Details</h2>
              
              <div className="pharmacy-details-container">
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">Lab Name:</span>
                  <span className="pharmacy-details-value">{labDetails.labName}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">Registration Number:</span>
                  <span className="pharmacy-details-value">{labDetails.labRegistrationNo}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">GST Number:</span>
                  <span className="pharmacy-details-value">{labDetails.labGst}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">PAN Number:</span>
                  <span className="pharmacy-details-value">{labDetails.labPan}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">Address:</span>
                  <span className="pharmacy-details-value">{labDetails.labAddress}</span>
                </div>
                <div className="pharmacy-details-row">
                  <span className="pharmacy-details-label">Updated At:</span>
                  <span className="pharmacy-details-value">{new Date(labDetails.updatedAt).toLocaleString()}</span>
                </div>
                {labDetails.labHeader && (
                  <div className="pharmacy-details-row">
                    <span className="pharmacy-details-label">Header Image:</span>
                    <div className="pharmacy-header-preview">
                      <img 
                        src={labDetails.labHeader} 
                        alt="Lab Header" 
                        className="pharmacy-header-image"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="clinic-button-group">
                <button
                  type="button"
                  className="clinic-cancel-button"
                  onClick={handleCloseLabDetails}
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