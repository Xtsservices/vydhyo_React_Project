
import React, { useState, useEffect, useMemo, useRef } from "react";
import { apiGet, apiPost } from "../../api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { debounce } from "../../../utils";
import "../../stylings/invoice-styles.css";

// Utility function to calculate age from DOB
const calculateAge = (dob) => {
  if (!dob) return "N/A";
  try {
    const [day, month, year] = dob.split("-").map(Number);
    const dobDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dobDate.getDate())
    ) {
      age--;
    }
    return age >= 0 ? age : "N/A";
  } catch (err) {
    //console.error("Error calculating age:", err);
    return "N/A";
  }
};

// Utility function to transform patient data
const transformPatientData = (result, user) => {
  //console.log(user, result, "complete user details");
  if (!user || !result) return [];
  return result.map((patient, index) => {
    const appointments = Array.isArray(patient.appointments)
      ? patient.appointments
      : [];
    const tests = Array.isArray(patient.tests) ? patient.tests : [];
    const medicines = Array.isArray(patient.medicines) ? patient.medicines : [];

const appointmentDetails = appointments.map((appointment, idx) => ({
  id: `A${index}${idx}`,
  appointmentId: appointment.appointmentId,
  appointmentType: appointment.appointmentType,
  appointmentFees: appointment?.feeDetails?.finalAmount || 0,
  addressId: appointment.addressId,
  updatedAt: appointment.createdAt
    ? new Date(appointment.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A",
  clinicName: appointment.addressId
    ? user?.addresses?.find(
        (addr) => addr.addressId === appointment.addressId
      )?.clinicName || "N/A"
    : "N/A",
  appointmentDate: appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A",
  appointmentTime: appointment.appointmentTime || "N/A",
  status: "Completed", // Set status to "Completed" by default
  clinicHeaderUrl: appointment.addressId
    ? user?.addresses?.find(
        (addr) => addr.addressId === appointment.addressId
      )?.headerImage || "N/A"
    : "N/A",
}));

    const totalTestAmount = tests.reduce(
      (sum, test) => sum + (test?.price || 0),
      0
    );
    const totalMedicineAmount = medicines.reduce(
      (sum, med) => sum + (med?.price * med?.quantity || 0),
      0
    );
    const totalAppointmentFees = appointmentDetails.reduce(
      (sum, appt) => sum + (appt?.appointmentFees || 0),
      0
    );

    return {
      id: index + 1,
      patientId: patient.patientId,
      name: `${patient.firstname} ${patient.lastname}`.trim(),
      firstname: patient.firstname,
      lastname: patient.lastname,
      age: patient?.age || calculateAge(patient.DOB),
      gender: patient.gender,
      mobile: patient.mobile || "Not Provided",
      bloodgroup: patient.bloodgroup || "Not Specified",
      prescriptionId: patient.prescriptionId || "N/A", // Add prescriptionId here
      prescriptionCreatedAt: patient.prescriptionCreatedAt
        ? new Date(patient.prescriptionCreatedAt).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      appointmentDetails,
tests: tests.map((test, idx) => ({
  id: `T${index}${idx}`,
  testId: test.testId,
  labTestID: test.labTestID,
  name: test.testName,
  price: test?.price || 0,
  status: test.status?.charAt(0).toUpperCase() + test.status?.slice(1) || "Unknown",
  createdAt: test.createdAt,
  updatedAt: test.updatedAt,
  createdDate: test.createdAt
    ? new Date(test.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A",
  updatedDate: test.updatedAt
    ? new Date(test.updatedAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A",
  labDetails: patient.labDetails || {}, // Use patient.labDetails instead of test.labDetails
})),
      medicines: medicines.map((med, idx) => ({
        id: `M${index}${idx}`,
        medicineId: med.medicineId,
        pharmacyMedID: med.pharmacyMedID,
        name: med.medName,
        quantity: med.quantity || 1,
        price: med.price || 0,
        gst: med.gst || 0,
        cgst: med.cgst || 0,
updatedAt: med.updatedAt || "N/A",
        status:
          med.status?.charAt(0).toUpperCase() + med.status?.slice(1) ||
          "Unknown",
        createdDate: med.createdAt
          ? new Date(med.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        pharmacyDetails: med.pharmacyDetails || {},
      })),
      totalTestAmount,
      totalMedicineAmount,
      totalAppointmentFees,
      grandTotal: totalTestAmount + totalMedicineAmount + totalAppointmentFees,
    };
  });
};

const BillingSystem = () => {
  const hasfetchPatients = useRef(false);
  const debouncedMarkAsPaidMap = useRef({});

  const [patients, setPatients] = useState([]);
  const [expandedPatients, setExpandedPatients] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [billingCompleted, setBillingCompleted] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const maxRetries = 3;
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
    totalItems: 0,
  });
  const [viewModePatientId, setViewModePatientId] = useState(null);
const [loadingPatients, setLoadingPatients] = useState({});

  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;
  const [isPaymentInProgress, setIsPaymentInProgress] = useState({});

  const transformedPatients = useMemo(() => {
    //console.log("Computing transformedPatients", { patients, user });
    return transformPatientData(patients, user);
  }, [patients, user]);
  //console.log("Transformed patients:", transformedPatients);

  const debouncedFetchPatients = useRef(
    debounce((page, pageSize, search) => {
      fetchPatients(page, pageSize, search);
    }, 500)
  );

  const fetchPatients = async (page = 1, pageSize = 5, search = "") => {
    if (!user || !doctorId) {
      //console.log("User or doctorId not available:", { user, doctorId });
      setError("User or doctor ID not available");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        doctorId,
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (search) {
        queryParams.append("search", search);
      }

      const response = await apiGet(
        `/receptionist/fetchMyDoctorPatients/${doctorId}?${queryParams.toString()}`,
      
      );

      if (response?.status === 200 && response?.data?.data) {
        //console.log("Fetched patients:", response.data.data);
        setPatients(response.data.data);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: response?.data?.pagination?.totalPages || 0,
          totalItems: response?.data?.pagination?.totalItems || 0,
        });
        setLoading(false);
      } else {
        throw new Error("API response unsuccessful");
      }
    } catch (err) {
      //console.error("Error fetching patients:", err);
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        setTimeout(() => fetchPatients(page, pageSize, search), 2000);
      } else {
        setError(
          `Failed to fetch patient data: ${
            err.message || "Unknown error"
          }. Please try again later.`
        );
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user && doctorId) {
      hasfetchPatients.current = true;
      setPagination((prev) => ({
        ...prev,
        current: 1,
      }));
      debouncedFetchPatients.current(1, pagination.pageSize, searchTerm);
    } else if (!user || !doctorId) {
      setLoading(false);
      setError("Waiting for user data to load...");
    }
  }, [user, doctorId, searchTerm, pagination.pageSize]);

  const handleSectionExpand = (patientId, section) => {
    const key = `${patientId}-${section}`;
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const calculateSectionTotals = (patient) => {
    const medicineTotal = patient.medicines.reduce(
      (sum, med) =>
        sum +
        (med.status.toLowerCase() === "pending" && med.price
          ? med.quantity * med.price
          : 0),
      0
    );
    const testTotal = patient.tests.reduce(
      (sum, test) =>
        sum +
        (test.status.toLowerCase() === "pending" && test.price ? test.price : 0),
      0
    );
    const appointmentTotal = patient.appointmentDetails.reduce(
      (sum, appt) =>
        sum +
        (appt.status.toLowerCase() === "pending" && appt.appointmentFees
          ? appt.appointmentFees
          : 0),
      0
    );
    return { medicineTotal, testTotal, appointmentTotal };
  };

  const handleMarkAsPaid = async (patientId, type) => {
    if (isPaymentInProgress[`${patientId}-${type}`]) return;

    const isPending = (s) => String(s || "").toLowerCase() === "pending";

    setIsPaymentInProgress((prev) => ({
      ...prev,
      [`${patientId}-${type}`]: true,
    }));

    const patient = transformedPatients.find((p) => p.id === patientId);
    if (!patient) {
      setIsPaymentInProgress((prev) => ({
        ...prev,
        [`${patientId}-${type}`]: false,
      }));
      return;
    }

    let pendingTests = [];
    let pendingMedicines = [];

    if (type === "pharmacy") {
      pendingMedicines = (patient.medicines || []).filter((m) =>
        isPending(m.status)
      );
    } else if (type === "labs") {
      pendingTests = (patient.tests || []).filter((t) => isPending(t.status));
    } else if (type === "all") {
      pendingTests = (patient.tests || []).filter((t) => isPending(t.status));
      pendingMedicines = (patient.medicines || []).filter((m) =>
        isPending(m.status)
      );
    }

    if (pendingTests.length === 0 && pendingMedicines.length === 0) {
      toast.error(`No pending ${type === "all" ? "items" : type} to pay for.`);
      setIsPaymentInProgress((prev) => ({
        ...prev,
        [`${patientId}-${type}`]: false,
      }));
      return;
    }

    const payload = {
      patientId: patient.patientId,
      doctorId: doctorId,
      tests: pendingTests
        .filter((test) => Number(test.price) > 0)
        .map((test) => ({
          testId: test.testId,
          labTestID: test.labTestID,
          status: "pending",
          price: test.price,
        })),
      medicines: pendingMedicines
        .filter((med) => Number(med.price) > 0)
        .map((med) => ({
          medicineId: med.medicineId,
          pharmacyMedID: med.pharmacyMedID,
          quantity: med.quantity,
          status: "pending",
          price: med.price,
        })),
    };

    if (payload.tests.length === 0 && payload.medicines.length === 0) {
      toast.error("At least one test or medicine must be provided.");
      setIsPaymentInProgress((prev) => ({
        ...prev,
        [`${patientId}-${type}`]: false,
      }));
      return;
    }

    try {
      const response = await apiPost(
        "/receptionist/totalBillPayFromReception",
        payload
      );

      if (response.status === 200) {
        await fetchPatientsWithoutLoading(
          pagination.current,
          pagination.pageSize,
          searchTerm
        );
        toast.success(
          `Payment processed successfully for ${
            type === "all"
              ? "all items"
              : type === "pharmacy"
              ? "pharmacy"
              : "labs"
          }!`
        );
      } else {
        throw new Error("Failed to process payment");
      }
    } catch (err) {
      //console.error("Error processing payment:", err);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsPaymentInProgress((prev) => ({
        ...prev,
        [`${patientId}-${type}`]: false,
      }));
    }
  };

  const fetchPatientsWithoutLoading = async (
    page = 1,
    pageSize = 5,
    search = ""
  ) => {
    if (!user || !doctorId) return;

    try {
      const queryParams = new URLSearchParams({
        doctorId,
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (search) {
        queryParams.append("search", search);
      }

      const response = await apiGet(
        `/receptionist/fetchMyDoctorPatients/${doctorId}?${queryParams.toString()}`,
      );

      if (response?.status === 200 && response?.data?.data) {
        setPatients(response.data.data);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: response?.data?.pagination?.totalPages || 0,
          totalItems: response?.data?.pagination?.totalItems || 0,
        });
      }
    } catch (err) {
      //console.error("Error fetching patients:", err);
    }
  };

  const handlePayClick = (patientId, type = "all") => {
    const key = `${patientId}-${type}`;
    if (!debouncedMarkAsPaidMap.current[key]) {
      debouncedMarkAsPaidMap.current[key] = debounce((event) => {
        if (event?.preventDefault) event.preventDefault();
        handleMarkAsPaid(patientId, type);
      }, 1000);
    }
    debouncedMarkAsPaidMap.current[key]();
  };

  const handlePrintInvoice = (type, patientId) => {
    //console.log("Printing invoice for:", patients, patientId);
    const patient = patients.find((p) => p.patientId === patientId);
    //console.log("Found patient:", patient);
    if (!patient) return;

    const isCompleted = (s) => {
  const v = String(s || "").toLowerCase();
  return v === "completed" || v === "complete" || v === "paid";
};

    let itemDate = "N/A";

    if (type === "pharmacy") {
      //console.log("123")
      // In the pharmacy section of handlePrintInvoice:
const completedMedicines = (patient.medicines || []).filter((m) =>
  isCompleted(m.status)
);
if (completedMedicines.length > 0) {
  const firstMed = completedMedicines[0];
  // Use updatedAt instead of updatedDate
  itemDate = firstMed.updatedAt
    ? new Date(firstMed.updatedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";
}
    } else if (type === "labs") {
      //console.log("1234")
      const completedTests = (patient.tests || []).filter((t) =>
        isCompleted(t.status)
      );
      if (completedTests.length > 0) {
        const firstTest = completedTests[0];
        itemDate = firstTest.updatedAt
  ? new Date(firstTest.updatedAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  : "N/A";
      }
    } else if (type === "appointments") {
      const completedAppointments = (patient.appointments || [])
      

      if (completedAppointments.length > 0) {
        const firstAppt = patient?.appointments[0];
        //console.log("First Appointment:", firstAppt);
        itemDate = firstAppt.feeDetails.paidAt
          ? new Date(firstAppt.feeDetails.paidAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "N/A";
      }
    }

    //console.log("mmmmmmmm", itemDate);

    const appts = patient.appointmentDetails || patient.appointments || [];
    const completedAppointments = appts.filter((a) => isCompleted(a?.status));
    //console.log("Completed appointments:", completedAppointments);
    const firstAppt = completedAppointments[0] || appts[0] || {};

    let headerUrl = "";
    let providerName = "N/A";
    let contactInfoHTML = "";
    let sectionHTML = "";
    let total = 0;

    const patientNumber = String(patient.patientId || "").replace(/\D/g, "");
    const invoiceNumber = `INV-${patientNumber.padStart(3, "0")}`;

    if (type === "pharmacy") {
      //console.log("123456")
      const completedMedicines = (patient.medicines || []).filter((m) =>
        isCompleted(m.status)
      );
      //console.log("completed medicines:", patient);
      const pharmacyDetails =
        patient?.pharmacyDetails ||
        patient.medicines?.[0]?.pharmacyDetails ||
        {};

        //console.log("pharmacy details:", pharmacyDetails);

      const isPharmacyDetailsEmptyOrNull =
  !pharmacyDetails ||
  Object.keys(pharmacyDetails).length === 0 ||
  (!pharmacyDetails.pharmacyName && !pharmacyDetails.pharmacyAddress); // Relaxed condition

if (isPharmacyDetailsEmptyOrNull) {
  toast?.error?.("Please fill the pharmacy details (name or address) to generate a bill.");
  return;
}

      headerUrl = pharmacyDetails.pharmacyHeaderUrl || "";
      providerName = pharmacyDetails.pharmacyName || "N/A";
      contactInfoHTML = `
      <div class="provider-name">${providerName}</div>
      <p>${pharmacyDetails.pharmacyAddress || "N/A"}</p>
      <p>GST: ${pharmacyDetails.pharmacyGst || "N/A"}</p>
      <p>PAN: ${pharmacyDetails.pharmacyPan || "N/A"}</p>
      <p>Registration No: ${pharmacyDetails.pharmacyRegistrationNo || "N/A"}</p>
    `;

      total = completedMedicines.reduce(
        (sum, med) =>
          sum + (Number(med.price) || 0) * (Number(med.quantity) || 0),
        0
      );

      if (!completedMedicines.length) {
        toast?.error?.("No completed medicines to print.");
        return;
      }

      sectionHTML = `
      <div class="section compact-spacing">
        <h3 class="section-title">Medicines</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>SL No.</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Unit Price (₹)</th>
              <th>Subtotal (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${completedMedicines
              .map(
                (med, idx) => `
              <tr>
                <td>${idx + 1}.</td>
                <td>${med.name || med.medName || ""}</td>
                <td>${med.quantity}</td>
                <td>${Number(med.price || 0).toFixed(2)}</td>
                <td>${(
                  (Number(med.price) || 0) * (Number(med.quantity) || 0)
                ).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="section-total" style="display: flex; justify-content: space-between; align-items: center;">
          <p class="gst-text" style="margin: 0; font-size: 13px; color: #000000ff;">GST included</p>
          <p class="total-text" style="margin: 0;">Medicine Total: ₹${total.toFixed(
            2
          )}</p>
        </div>
      </div>
    `;
   } else if (type === "labs") {
  const completedTests = (patient.tests || []).filter((t) =>
    isCompleted(t.status)
  );
  const labDetails = patient.labDetails || {}; // Use patient.labDetails directly

  const isLabDetailsEmptyOrNull =
    !labDetails ||
    Object.keys(labDetails).length === 0 ||
    Object.values(labDetails).every(
      (value) => value === null || value === undefined
    );

  if (isLabDetailsEmptyOrNull) {
    toast?.error?.("Please fill the lab details to generate a bill.");
    return;
  }

  headerUrl = labDetails.labHeaderUrl || "";
  providerName = labDetails.labName || "N/A";
  contactInfoHTML = `
    <div class="provider-name">${providerName}</div>
    <p>${labDetails.labAddress || "N/A"}</p>
    <p>GST: ${labDetails.labGst || "N/A"}</p>
    <p>PAN: ${labDetails.labPan || "N/A"}</p>
    <p>Registration No: ${labDetails.labRegistrationNo || "N/A"}</p>
  `;

      total = completedTests.reduce(
        (sum, test) => sum + (Number(test.price) || 0),
        0
      );

      if (!completedTests.length) {
        toast?.error?.("No completed tests to print.");
        return;
      }

      sectionHTML = `
      <div class="section compact-spacing">
        <h3 class="section-title">Tests</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>SL No.</th>
              <th>Name</th>
              <th>Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${completedTests
              .map(
                (test, idx) => `
              <tr>
                <td>${idx + 1}.</td>
                <td>${test.name || test.testName || ""}</td>
                <td class="price-column">${Number(test.price || 0).toFixed(
                  2
                )}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="section-total">
          <p class="total-text">Test Total: ₹${total.toFixed(2)}</p>
        </div>
      </div>
    `;
    } else if (type === "appointments") {
      const appts = patient.appointmentDetails || patient.appointments || [];
      const completedAppointments = appts.filter((a) => isCompleted(a?.status));
      const firstAppt = completedAppointments[0] || appts[0] || {};
      //console.log("Found appointment:", firstAppt);
      const addr =
        (user?.addresses || []).find(
          (a) => a.addressId === firstAppt.addressId
        ) || {};

      const isAddressEmptyOrNull =
        !addr ||
        Object.keys(addr).length === 0 ||
        Object.values(addr).every(
          (value) => value === null || value === undefined
        );

      if (isAddressEmptyOrNull) {
        toast?.error?.(
          "Please fill the appointment address details to generate a bill."
        );
        return;
      }

      headerUrl = addr.headerImage || "";
      providerName = firstAppt.clinicName || addr.clinicName || "N/A";
      //console.log("Found provider:", providerName);
      contactInfoHTML = `
      <div class="provider-name">Name: ${providerName}</div>
      <p>${addr.address || "N/A"}</p>
      <p>${addr.city || "N/A"}, ${addr.state || "N/A"} ${
        addr.pincode || "N/A"
      }</p>
      <p>Phone: ${addr.mobile || "N/A"}</p>
    `;
    //console.log(firstAppt?.feeDetails?.finalAmount, "fee details");
    total = firstAppt?.feeDetails?.finalAmount || 0;

      // total = firstAppt.reduce(
      //   (sum, a) => sum + (Number(a.appointmentFees) || 0),
      //   0
      // );

      // if (!completedAppointments.length) {
      //   toast?.error?.("No completed appointments to print.");
      //   return;
      // }

      //console.log("Total amount:", total);

      sectionHTML = `
      <div class="section compact-spacing">
        <h3 class="section-title">Appointments</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>SL No.</th>
              <th>Service</th>
              <th>Total Amount</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            ${patient?.appointments
              .map(
                (appt, idx) => `
              <tr>
                <td>${idx + 1}.</td>
                <td>Consultation Bill</td>
                <td class="price-column">${total.toFixed(2)}</td>
                <td>${appt.appointmentType || ""}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div class="section-total">
          <p class="total-text">Appointment Total: ₹${total.toFixed(2)}</p>
        </div>
      </div>
    `;
    } else {
      toast?.error?.("Unknown invoice type.");
      return;
    }

    const headerSectionHTML = headerUrl
      ? `
      <div class="invoice-header-image-only">
        <img src="${headerUrl}" alt="Header" />
      </div>
    `
      : "";

      //console.log("pharmacy")

    const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          html, body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #fff; font-size: 14px; }
          @page { margin: 0; size: A4; }
          @media print {
            @page { margin: 0; size: A4; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          .invoice-container { padding: 15px; max-width: 210mm; margin: 0 auto; min-height: calc(100vh - 30px); display: flex; flex-direction: column; }
          .invoice-content { flex: 1; }
          .invoice-header-image-only { width: 100%; margin-bottom: 12px; page-break-inside: avoid; }
          .invoice-header-image-only img { display: block; width: 100%; height: auto; max-height: 220px; object-fit: contain; background: #fff; }
          .provider-name { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 6px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #ddd; }
          .patient-info { display: flex; justify-content: space-between; background-color: #f8f9fa; padding: 12px; border-radius: 5px; }
          .patient-info p { margin: 3px 0; }
          .data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .data-table th { background-color: #f8f9fa; font-weight: bold; }
          .price-column { text-align: right; }
          .section-total { text-align: right; margin-top: 8px; }
          .total-text { font-weight: bold; font-size: 14px; color: #333; }
          .grand-total-section { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
          .grand-total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #333; border-top: 2px solid #333; padding-top: 8px; margin-top: 10px; }
          .footer { text-align: center; padding: 15px 0; border-top: 1px solid #ddd; color: #666; background: #fff; }
          .powered-by { display: flex; align-items: center; justify-content: center; margin-top: 8px; gap: 6px; color: #666; font-size: 12px; }
          .footer-logo { width: 18px; height: 18px; object-fit: contain; }
          .compact-spacing { margin-bottom: 15px; }
          .compact-spacing:last-child { margin-bottom: 0; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-content">
            ${
              headerSectionHTML ||
              `<div class="provider-details">${contactInfoHTML}</div>`
            }
            <div class="section compact-spacing">
              <h3 class="section-title">Patient Information</h3>
              <div class="patient-info">
                <div>
                  <p><strong>Patient ID:</strong> ${patient.patientId}</p>
                  <p><strong>First Name:</strong> ${patient.firstname}</p>
                  <p><strong>Last Name:</strong> ${patient.lastname}</p>
                  <p><strong>Mobile:</strong> ${patient.mobile}</p>
                </div>
                <div>
                  <p><strong>Age:</strong> ${patient.age}</p>
                  <p><strong>Gender:</strong> ${patient.gender}</p>
                  <p><strong>Referred by Dr.</strong> ${
                    user?.firstname || "N/A"
                  } ${user?.lastname || "N/A"}</p>
                  <p><strong>Date Time:</strong> ${itemDate}</p>
                  <div class="invoice-detail-item"><strong>Invoice No:</strong> #${invoiceNumber}</div>
                </div>
              </div>
            </div>
            ${sectionHTML}
            <div class="grand-total-section">
              <div class="grand-total-row">
                <span>Grand Total:</span>
                <span>₹${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>Thank you for choosing Vydhyo</p>
            <div class="powered-by">
              <img src="../assets/logo.png" alt="Vydhyo Logo" class="footer-logo">
              <span>Powered by Vydhyo</span>
            </div>
          </div>
        </div>
        <script>
          (function() {
            function waitForImagesAndThen(cb) {
              var imgs = Array.from(document.images || []);
              if (imgs.length === 0) return cb();
              var remaining = imgs.length, done = false;
              function check(){ if(done) return; remaining--; if(remaining <= 0){ done = true; cb(); } }
              imgs.forEach(function(img){
                if (img.complete) { check(); }
                else {
                  img.addEventListener('load', check, { once:true });
                  img.addEventListener('error', check, { once:true });
                }
              });
              setTimeout(function(){ if(!done) cb(); }, 2500);
            }
            waitForImagesAndThen(function(){
              try { window.focus(); } catch(e) {}
              try { window.print(); } catch(e) {}
            });
          })();
        </script>
      </body>
    </html>
  `;

    const existing = document.getElementById("vydhyo-print-iframe");
    if (existing) existing.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "vydhyo-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    iframe.setAttribute("aria-hidden", "true");

    document.body.appendChild(iframe);

    const cleanup = () => {
      try {
        iframe.remove();
      } catch {}
    };

    const onAfterPrint = () => {
      window.removeEventListener("afterprint", onAfterPrint);
      cleanup();
    };

    window.addEventListener("afterprint", onAfterPrint);

    const writeAndPrint = () => {
      try {
        const doc = iframe.contentWindow?.document;
        if (!doc) {
          cleanup();
          toast?.error?.("Could not access print frame.");
          return;
        }
        doc.open();
        doc.write(printHTML);
        doc.close();

        setTimeout(() => cleanup(), 8000);
      } catch (e) {
        cleanup();
        //console.error("Print error:", e);
        toast?.error?.("Failed to open print preview.");
      }
    };

    if (iframe.contentWindow?.document?.readyState === "complete") {
      writeAndPrint();
    } else {
      iframe.onload = writeAndPrint;
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
    }));
    fetchPatients(page, pagination.pageSize, searchTerm);
  };


const handleViewClick = async (patientId) => {
  const isCurrentlyExpanded = viewModePatientId === patientId;
  setViewModePatientId(isCurrentlyExpanded ? null : patientId);

  if (isCurrentlyExpanded) return; // If collapsing, no need to fetch

  const patient = transformedPatients.find((p) => p.id === patientId);
  if (!patient) {
    toast.error("Patient not found.");
    return;
  }

  try {
    // Use the prescriptionId from the patient's data
    const prescriptionId = patient.prescriptionId; // Ensure this field is available in transformedPatients
    if (!prescriptionId) {
      throw new Error("Prescription ID not found for this patient.");
    }

    const response = await apiGet(
      `/receptionist/fetchDoctorPatientDetails/${doctorId}/${patient.patientId}/${prescriptionId}`,
    );

    if (response?.status === 200 && response?.data?.data?.length > 0) {
      const detailedPatientData = response.data.data[0];
      //console.log("Fetched detailed patient data:", detailedPatientData);

      // Update the patients state by replacing the specific patient's data
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p.patientId === patient.patientId ? detailedPatientData : p
        )
      );

      // Expand the sections for the patient
      setExpandedSections((prev) => ({
        ...prev,
        [`${patientId}-pharmacy`]: true,
        [`${patientId}-labs`]: true,
        [`${patientId}-appointments`]: true,
      }));
    } else {
      throw new Error("No detailed patient data found.");
    }
  } catch (err) {
    //console.error("Error fetching detailed patient data:", err);
    // toast.error("Failed to fetch detailed patient data. Please try again.");
  }
};


  if (loading) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              border: "4px solid #007bff",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              borderTopColor: "transparent",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ fontSize: "18px", color: "#666" }}>Loading patients...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#333",
              marginBottom: "30px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            Billing
          </h1>
          <p
            style={{ fontSize: "18px", color: "#721c24", marginBottom: "20px" }}
          >
            {error}
          </p>
          <button
            onClick={() => {
              setRetryCount(0);
              hasfetchPatients.current = false;
              fetchPatients(pagination.current, pagination.pageSize);
            }}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user || !doctorId) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#333",
              marginBottom: "30px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            Billing
          </h1>
          <p style={{ fontSize: "18px", color: "#666" }}>
            Waiting for user data to load...
          </p>
        </div>
      </div>
    );
  }

  if (transformedPatients.length === 0) {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              color: "#333",
              marginBottom: "30px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            Billing
          </h1>
          <p style={{ fontSize: "18px", color: "#666" }}>
            No patients found for this doctor.
          </p>
          <button
            onClick={() => {
              setRetryCount(0);
              hasfetchPatients.current = false;
              fetchPatients(pagination.current, pagination.pageSize);
            }}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              marginTop: "20px",
            }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "24px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
          padding: "0 20px",
        }}
      >
        <h1
          style={{
            color: "#1a1a1a",
            marginBottom: "24px",
            fontSize: "24px",
            fontWeight: "600",
          }}
        >
          Billing
        </h1>

        {/* Search Bar */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", width: "400px" }}>
            <input
              type="text"
              placeholder="Search patient by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 40px 10px 16px",
                border: "1px solid #e1e5e9",
                borderRadius: "6px",
                fontSize: "14px",
                outline: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            >
              🔍
            </div>
          </div>
        </div>

        {/* Patient Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {transformedPatients.map((patient) => {
            const totals = calculateSectionTotals(patient);
            const grandTotal =
              totals.medicineTotal + totals.testTotal + totals.appointmentTotal;
            const isViewMode = viewModePatientId === patient.id;
const appointmentPrintDisabled = patient.appointmentDetails.length === 0;
            return (
              <div
                key={patient.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                }}
              >
                {/* Patient Header */}
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "0",
                  }}
                >
                  {/* Table Header */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 80px 100px 180px 120px",
                      padding: "12px 16px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <div>Patient Name</div>
                    <div>Patient ID</div>
                    <div>Age</div>
                    <div>Gender</div>
                    <div>Last Visit</div>
                    <div>Action</div>
                  </div>

                  {/* Patient Row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 80px 100px 180px 120px",
                      padding: "16px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#374151",
                        }}
                      >
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: "500", color: "#1f2937" }}>
                        {patient.name}
                      </span>
                    </div>
                    <div style={{ color: "#6b7280" }}>{patient.patientId}</div>
                    <div style={{ color: "#6b7280" }}>{patient.age}</div>
                    <div style={{ color: "#6b7280" }}>{patient.gender}</div>
                    <div style={{ color: "#6b7280" }}>
                      {patient.prescriptionCreatedAt}
                    </div>
                    <div>
                      <button
                        onClick={() => handleViewClick(patient.id)}
                        style={{
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "6px 12px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >

                        {viewModePatientId === patient.id ? "view " : "View "}

                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Sections (only shown in view mode) */}
                {isViewMode && (
                  <div style={{ padding: "0 16px 16px 16px" }}>
                    {/* Pharmacy Section */}
                    {patient.medicines.length > 0 && (
                      <div
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          marginBottom: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 16px",
                            backgroundColor: "#f8f9fa",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                          onClick={() =>
                            handleSectionExpand(patient.id, "pharmacy")
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#3b82f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "16px",
                              }}
                            >
                              💊
                            </div>
                            <div>
                              <div
                                style={{ fontWeight: "500", color: "#1f2937" }}
                              >
                                Pharmacy
                              </div>
                              <div
                                style={{ fontSize: "12px", color: "#6b7280" }}
                              >
                                View medicines and billing
                              </div>
                            </div>
                          </div>
                          <div
                            style={{ color: "#6b7280", fontSize: "18px" }}
                          >
                            {expandedSections[`${patient.id}-pharmacy`]
                              ? "−"
                              : ">"}
                          </div>
                        </div>

                        {expandedSections[`${patient.id}-pharmacy`] && (
                          <div style={{ padding: "16px" }}>
                            {(() => {
                            const hasCompletedPharmacyItem =
  Array.isArray(patient.medicines) &&
  patient.medicines.some((m) => {
    const s = String(m.status || "").toLowerCase();
    return s === "complete" || s === "completed" || s === "paid";
  });
const printDisabled = !hasCompletedPharmacyItem;

                              return (
                                <>
                                  <table
                                    style={{
                                      width: "100%",
                                      borderCollapse: "collapse",
                                    }}
                                  >
                                    <thead>
                                      <tr
                                        style={{ backgroundColor: "#f8f9fa" }}
                                      >
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Medicine Name
                                        </th>
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "center",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Quantity
                                        </th>
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "right",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Unit Price
                                        </th>
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "center",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Status
                                        </th>
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "right",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Sgst
                                        </th>
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "right",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Cgst
                                        </th>
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "center",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Created Date
                                        </th>
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "right",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Subtotal
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {patient.medicines.map((medicine) => (
                                        <tr key={medicine.id}>
                                          <td
                                            style={{
                                              padding: "8px",
                                              borderBottom: "1px solid #f3f4f6",
                                            }}
                                          >
                                            {medicine.name}
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px",
                                              textAlign: "center",
                                              borderBottom: "1px solid #f3f4f6",
                                            }}
                                          >
                                            {medicine.quantity}
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px",
                                              textAlign: "right",
                                              borderBottom: "1px solid #f3f4f6",
                                            }}
                                          >
                                            {medicine.price
                                              ? medicine.price.toFixed(2)
                                              : "N/A"}
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px",
                                              textAlign: "center",
                                              borderBottom: "1px solid #f3f4f6",
                                            }}
                                          >
                                            <span
                                              style={{
                                                padding: "2px 8px",
                                                borderRadius: "12px",
                                                fontSize: "11px",
                                                fontWeight: "600",
                                                backgroundColor:
                                                  medicine.status === "Pending"
                                                    ? "#fef3c7"
                                                    : "#dcfce7",
                                                color:
                                                  medicine.status === "Pending"
                                                    ? "#92400e"
                                                    : "#166534",
                                              }}
                                            >
                                              {medicine.status}
                                            </span>
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px",
                                              textAlign: "right",
                                              borderBottom: "1px solid #f3f4f6",
                                            }}
                                          >
                                            {medicine.gst}
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px",
                                              textAlign: "right",
                                              borderBottom: "1px solid #f3f4f6",
                                            }}
                                          >
                                            {medicine.cgst}
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px",
                                              textAlign: "center",
                                              borderBottom: "1px solid #f3f4f6",
                                              fontSize: "12px",
                                            }}
                                          >
                                            {medicine.createdDate}
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px",
                                              textAlign: "right",
                                              borderBottom: "1px solid #f3f4f6",
                                            }}
                                          >
                                            {medicine.price
                                              ? (
                                                  medicine.quantity *
                                                  medicine.price
                                                ).toFixed(2)
                                              : "N/A"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>

                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      marginTop: "16px",
                                      paddingTop: "16px",
                                      borderTop: "1px solid #f3f4f6",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        color: "#1f2937",
                                      }}
                                    >
                                      {totals.medicineTotal !== 0.0
                                        ? "Balance Amount"
                                        : ""}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        color: "#10b981",
                                      }}
                                    >
                                      {totals.medicineTotal !== 0.0
                                        ? `₹${totals.medicineTotal.toFixed(2)}`
                                        : ""}
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      gap: "12px",
                                      marginTop: "16px",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        handlePrintInvoice(
                                          "pharmacy",
                                          patient.patientId
                                        )
                                      }
                                      disabled={printDisabled}
                                      style={{
                                        backgroundColor: printDisabled
                                          ? "#9ca3af"
                                          : "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "8px 16px",
                                        fontSize: "14px",
                                        cursor: printDisabled
                                          ? "not-allowed"
                                          : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        opacity: printDisabled ? 0.8 : 1,
                                      }}
                                      title={
                                        printDisabled
                                          ? "Enable once at least one medicine is Completed"
                                          : "Print Invoice"
                                      }
                                    >
                                      🖨️ Print Invoice
                                    </button>

                                    <button
                                      onClick={() =>
                                        handlePayClick(patient.id, "pharmacy")
                                      }
                                      disabled={
                                        totals.medicineTotal === 0 ||
                                        isPaymentInProgress[
                                          `${patient.id}-pharmacy`
                                        ] ||
                                        billingCompleted[patient.id]?.pharmacy
                                      }
                                      style={{
                                        backgroundColor:
                                          totals.medicineTotal === 0 ||
                                          isPaymentInProgress[
                                            `${patient.id}-pharmacy`
                                          ] ||
                                          billingCompleted[patient.id]?.pharmacy
                                            ? "#d1d5db"
                                            : "#28a745",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "8px 16px",
                                        fontSize: "14px",
                                        cursor:
                                          totals.medicineTotal === 0 ||
                                          isPaymentInProgress[
                                            `${patient.id}-pharmacy`
                                          ] ||
                                          billingCompleted[patient.id]?.pharmacy
                                            ? "not-allowed"
                                            : "pointer",
                                      }}
                                    >
                                      {isPaymentInProgress[
                                        `${patient.id}-pharmacy`
                                      ]
                                        ? "Processing..."
                                        : "Pay Pharmacy"}
                                    </button>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Labs Section */}
                    {patient.tests.length > 0 && (
                      <div
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          marginBottom: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 16px",
                            backgroundColor: "#f8f9fa",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                          onClick={() =>
                            handleSectionExpand(patient.id, "labs")
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#10b981",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "16px",
                              }}
                            >
                              🧪
                            </div>
                            <div>
                              <div
                                style={{ fontWeight: "500", color: "#1f2937" }}
                              >
                                Labs
                              </div>
                              <div
                                style={{ fontSize: "12px", color: "#6b7280" }}
                              >
                                View lab reports and billing
                              </div>
                            </div>
                          </div>
                          <div style={{ color: "#6b7280", fontSize: "18px" }}>
                            {expandedSections[`${patient.id}-labs`] ? "−" : ">"}
                          </div>
                        </div>

                        {expandedSections[`${patient.id}-labs`] && (
                          <div style={{ padding: "16px" }}>
                            {(() => {
                             const completedAliases = ["complete", "completed", "paid"];
const hasCompletedLabItem =
  Array.isArray(patient.tests) &&
  patient.tests.some((t) => {
    const s = String(t.status || "").toLowerCase();
    return s === "complete" || s === "completed" || s === "paid";
  });
const printDisabled = !hasCompletedLabItem;
                              return (
                                <>
                                  <table
                                    style={{
                                      width: "100%",
                                      borderCollapse: "collapse",
                                    }}
                                  >
                                    <thead>
                                      <tr
                                        style={{ backgroundColor: "#f8f9fa" }}
                                      >
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "left",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Test Name
                                        </th>
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "right",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Price (₹)
                                        </th>
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "center",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Status
                                        </th>
                                        <th
                                          style={{
                                            padding: "8px",
                                            textAlign: "center",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            color: "#6b7280",
                                          }}
                                        >
                                          Created Date
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {patient.tests.map((test) => (
                                        <tr key={test.id}>
                                          <td
                                            style={{
                                              padding: "8px",
                                              borderBottom: "1px solid #f3f4f6",
                                            }}
                                          >
                                            {test.name}
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px",
                                              textAlign: "right",
                                              borderBottom: "1px solid #f3f4f6",
                                            }}
                                          >
                                            {test.price
                                              ? test.price.toFixed(2)
                                              : "N/A"}
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px",
                                              textAlign: "center",
                                              borderBottom: "1px solid #f3f4f6",
                                            }}
                                          >
                                            <span
                                              style={{
                                                padding: "2px 8px",
                                                borderRadius: "12px",
                                                fontSize: "11px",
                                                fontWeight: "600",
                                                backgroundColor:
                                                  test.status === "Completed"
                                                    ? "#dcfce7"
                                                    : test.status === "Pending"
                                                    ? "#fef3c7"
                                                    : "#fee2e2",
                                                color:
                                                  test.status === "Completed"
                                                    ? "#166534"
                                                    : test.status === "Pending"
                                                    ? "#92400e"
                                                    : "#dc2626",
                                              }}
                                            >
                                              {test.status}
                                            </span>
                                          </td>
                                          <td
                                            style={{
                                              padding: "8px",
                                              textAlign: "center",
                                              borderBottom: "1px solid #f3f4f6",
                                              fontSize: "12px",
                                            }}
                                          >
                                            {test.createdDate}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>

                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      marginTop: "16px",
                                      paddingTop: "16px",
                                      borderTop: "1px solid #f3f4f6",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        color: "#1f2937",
                                      }}
                                    >
                                      {totals.testTotal !== 0.0
                                        ? "Balance Amount"
                                        : ""}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        color: "#10b981",
                                      }}
                                    >
                                      {totals.testTotal !== 0.0
                                        ? `₹${totals.testTotal.toFixed(2)}`
                                        : ""}
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                      gap: "12px",
                                      marginTop: "16px",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        handlePrintInvoice("labs", patient.patientId)
                                      }
                                      disabled={printDisabled}
                                      style={{
                                        backgroundColor: printDisabled
                                          ? "#9ca3af"
                                          : "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "8px 16px",
                                        fontSize: "14px",
                                        cursor: printDisabled
                                          ? "not-allowed"
                                          : "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        opacity: printDisabled ? 0.8 : 1,
                                      }}
                                      title={
                                        printDisabled
                                          ? "Enable once at least one test is Completed"
                                          : "Print Invoice"
                                      }
                                    >
                                      🖨️ Print Invoice
                                    </button>

                                    <button
                                      onClick={() =>
                                        handlePayClick(patient.id, "labs")
                                      }
                                      disabled={
                                        totals.testTotal === 0 ||
                                        isPaymentInProgress[
                                          `${patient.id}-labs`
                                        ] ||
                                        billingCompleted[patient.id]?.labs
                                      }
                                      style={{
                                        backgroundColor:
                                          totals.testTotal === 0 ||
                                          isPaymentInProgress[
                                            `${patient.id}-labs`
                                          ] ||
                                          billingCompleted[patient.id]?.labs
                                            ? "#d1d5db"
                                            : "#28a745",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "6px",
                                        padding: "8px 16px",
                                        fontSize: "14px",
                                        cursor:
                                          totals.testTotal === 0 ||
                                          isPaymentInProgress[
                                            `${patient.id}-labs`
                                          ] ||
                                          billingCompleted[patient.id]?.labs
                                            ? "not-allowed"
                                            : "pointer",
                                      }}
                                    >
                                      {isPaymentInProgress[`${patient.id}-labs`]
                                        ? "Processing..."
                                        : "Pay Labs"}
                                    </button>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Appointment Types Section */}
                    {patient.appointmentDetails.length > 0 && (
                      <div
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          marginBottom: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 16px",
                            backgroundColor: "#f8f9fa",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                          onClick={() =>
                            handleSectionExpand(patient.id, "appointments")
                          }
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#8b5cf6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "16px",
                              }}
                            >
                              📅
                            </div>
                            <div>
                              <div
                                style={{ fontWeight: "500", color: "#1f2937" }}
                              >
                                Consultation Bill
                              </div>
                              <div
                                style={{ fontSize: "12px", color: "#6b7280" }}
                              >
                                View appointments and billing
                              </div>
                            </div>
                          </div>
                          <div style={{ color: "#6b7280", fontSize: "18px" }}>
                            {expandedSections[`${patient.id}-appointments`]
                              ? "−"
                              : ">"}
                          </div>
                        </div>

                        {expandedSections[`${patient.id}-appointments`] && (
                          <div style={{ padding: "16px" }}>
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                              }}
                            >
                              <thead>
                                <tr style={{ backgroundColor: "#f8f9fa" }}>
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "left",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#6b7280",
                                    }}
                                  >
                                    Appointment ID
                                  </th>
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "left",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#6b7280",
                                    }}
                                  >
                                    Type
                                  </th>
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "center",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#6b7280",
                                    }}
                                  >
                                    Date
                                  </th>
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "center",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#6b7280",
                                    }}
                                  >
                                    Time
                                  </th>
                                  
                                  <th
                                    style={{
                                      padding: "8px",
                                      textAlign: "right",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#6b7280",
                                    }}
                                  >
                                    Price (₹)
                                  </th>
                                  <th
                                                                        style={{
                                      padding: "8px",
                                      textAlign: "center",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      color: "#6b7280",
                                    }}
                                  >
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {patient.appointmentDetails.map(
                                  (appointment) => (
                                    <tr key={appointment.id}>
                                      <td
                                        style={{
                                          padding: "8px",
                                          borderBottom: "1px solid #f3f4f6",
                                        }}
                                      >
                                        {appointment.appointmentId}
                                      </td>
                                      <td
                                        style={{
                                          padding: "8px",
                                          borderBottom: "1px solid #f3f4f6",
                                        }}
                                      >
                                        {appointment.appointmentType}
                                      </td>
                                      <td
                                        style={{
                                          padding: "8px",
                                          textAlign: "center",
                                          borderBottom: "1px solid #f3f4f6",
                                          fontSize: "12px",
                                        }}
                                      >
                                        {appointment.appointmentDate}
                                      </td>
                                      <td
                                        style={{
                                          padding: "8px",
                                          textAlign: "center",
                                          borderBottom: "1px solid #f3f4f6",
                                          fontSize: "12px",
                                        }}
                                      >
                                        {appointment.appointmentTime}
                                      </td>
                                      
                                      <td
                                        style={{
                                          padding: "8px",
                                          textAlign: "right",
                                          borderBottom: "1px solid #f3f4f6",
                                        }}
                                      >
                                        {appointment.appointmentFees
                                          ? appointment.appointmentFees.toFixed(
                                              2
                                            )
                                          : "0.00"}
                                      </td>
                                     <td
  style={{
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    backgroundColor:
      ["Completed", "Paid"].includes(appointment.status)
        ? "#dcfce7"
        : "#fef3c7",
    color:
      ["Completed", "Paid"].includes(appointment.status)
        ? "#166534"
        : "#92400e",
  }}
>
  {appointment.status}
</td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "16px",
                                paddingTop: "16px",
                                borderTop: "1px solid #f3f4f6",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "18px",
                                  fontWeight: "600",
                                  color: "#1f2937",
                                }}
                              >
                                {totals.appointmentTotal !== 0.0
                                  ? "Balance Amount"
                                  : ""}
                              </div>
                              <div
                                style={{
                                  fontSize: "18px",
                                  fontWeight: "600",
                                  color: "#10b981",
                                }}
                              >
                                {totals.appointmentTotal !== 0.0
                                  ? `₹${totals.appointmentTotal.toFixed(2)}`
                                  : ""}
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px",
                                marginTop: "16px",
                              }}
                            >
                              <button
                                onClick={() =>
                                  handlePrintInvoice("appointments", patient.patientId)
                                }
                                disabled={appointmentPrintDisabled}
                                style={{
                                  backgroundColor: appointmentPrintDisabled
                                    ? "#9ca3af"
                                    : "#3b82f6",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "8px 16px",
                                  fontSize: "14px",
                                  cursor: appointmentPrintDisabled
                                    ? "not-allowed"
                                    : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  opacity: appointmentPrintDisabled ? 0.8 : 1,
                                }}
                                title={
                                  appointmentPrintDisabled
                                    ? "Enable once at least one appointment is Completed"
                                    : "Print Invoice"
                                }
                              >
                                🖨️ Print Invoice
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          <div>
            Showing 1-{transformedPatients.length} of{" "}
            {pagination.totalItems || pagination.total * pagination.pageSize}{" "}
            patients
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() =>
                handlePageChange(Math.max(1, pagination.current - 1))
              }
              disabled={pagination.current === 1}
              style={{
                padding: "6px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                backgroundColor: pagination.current === 1 ? "#f3f4f6" : "white",
                color: pagination.current === 1 ? "#9ca3af" : "#374151",
                cursor: pagination.current === 1 ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              Previous
            </button>

            {[...Array(Math.min(5, pagination.total))].map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid ",
                    borderRadius: "6px",
                    backgroundColor:
                      pagination.current === pageNum ? "#3b82f6" : "white",
                    color: pagination.current === pageNum ? "white" : "#374151",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: pagination.current === pageNum ? "600" : "400",
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            {pagination.total > 5 && (
              <>
                <span style={{ padding: "6px 8px" }}>...</span>
                <button
                  onClick={() => handlePageChange(pagination.total)}
                  style={{
                    padding: "6px 12px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    backgroundColor:
                      pagination.current === pagination.total
                        ? "#3b82f6"
                        : "white",
                    color:
                      pagination.current === pagination.total
                        ? "white"
                        : "#374151",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  {pagination.total}
                </button>
              </>
            )}

            <button
              onClick={() =>
                handlePageChange(
                  Math.min(pagination.total, pagination.current + 1)
                )
              }
              disabled={pagination.current >= pagination.total}
              style={{
                padding: "6px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                backgroundColor:
                  pagination.current >= pagination.total ? "#f3f4f6" : "white",
                color:
                  pagination.current >= pagination.total
                    ? "#9ca3af"
                    : "#374151",
                cursor:
                  pagination.current >= pagination.total
                    ? "not-allowed"
                    : "pointer",
                fontSize: "14px",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSystem;