import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Select,
  Button,
  Row,
  Col,
  Tag,
  Typography,
  Space,
  Divider,
  DatePicker,
  Input,
  Collapse,
  message,
  Spin,
  Modal,
} from "antd";
import {
  DownOutlined,
  UpOutlined,
  ClockCircleOutlined,
  StopOutlined,
  CalendarOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { apiGet, apiPost, apiDelete, apiPut } from "../../api";
import moment from "moment";
import { useSelector } from "react-redux";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import { toast } from "react-toastify";


const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const AvailabilityScreen = () => {
  const today = new Date();
const hasfetchClinicsForDoctor = useRef(false)

  const fullWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  
  const todayDate = moment();
  const todayName = todayDate.format("dddd"); 
  const startIndex = fullWeek.indexOf(todayName);
  const orderedDays = [...fullWeek.slice(startIndex), ...fullWeek.slice(0, startIndex)];

  const dayName = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][today.getDay()];
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedDay, setSelectedDay] = useState(todayName);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Clinic-specific slots state
  const [clinicSlots, setClinicSlots] = useState({});

  // Available slots time controls
  const [availableStartTime, setAvailableStartTime] = useState(9);
  const [availableStartPeriod, setAvailableStartPeriod] = useState("AM");
  const [availableEndTime, setAvailableEndTime] = useState(11);
  const [availableEndPeriod, setAvailableEndPeriod] = useState("AM");
  const [availableDuration, setAvailableDuration] = useState(30);

  // Unavailable slots time controls
  const [unavailableStartTime, setUnavailableStartTime] = useState(9);
  const [unavailableStartPeriod, setUnavailableStartPeriod] = useState("AM");
  const [unavailableEndTime, setUnavailableEndTime] = useState(11);
  const [unavailableEndPeriod, setUnavailableEndPeriod] = useState("AM");
  const [unavailableDuration, setUnavailableDuration] = useState(30);

  const [unavailableStartDate, setUnavailableStartDate] = useState(null);
  const [unavailableEndDate, setUnavailableEndDate] = useState(null);
  const [unavailableReason, setUnavailableReason] = useState("");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  // Helper function to get current clinic's slots
  const getCurrentClinicSlots = () => {
    if (!selectedClinic) return { availableSlots: [], unavailableSlots: [] };
    return (
      clinicSlots[selectedClinic] || {
        availableSlots: [],
        unavailableSlots: [],
      }
    );
  };

  // Helper function to set current clinic's slots
  const setCurrentClinicSlots = (newSlots) => {
    setClinicSlots((prev) => ({
      ...prev,
      [selectedClinic]: newSlots,
    }));
  };

  const fetchClinicsForDoctor = async (doctorId) => {
    try {
      setLoading(true);
      const response = await apiGet(`/users/getClinicAddress?doctorId=${doctorId}`);
      
      if (response.status === 200 && response.data?.status === "success") {
        const activeClinics = response.data.data
          .filter((address) => address.status === "Active")
          .map((address) => ({
            label: address.clinicName,
            value: address.addressId,
            addressData: address,
          }));

        setClinics(activeClinics);

        if (activeClinics.length > 0) {
          setSelectedClinic(activeClinics[0].value);
        } else {
          setSelectedClinic(null);
          message.warning("No active clinics available");
        }
      } else {
        throw new Error(response.data?.message || "Failed to fetch clinics");
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
      message.error("Failed to fetch clinic data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId && !hasfetchClinicsForDoctor.current) {
      hasfetchClinicsForDoctor.current = true
      fetchClinicsForDoctor(doctorId);
    }
  }, [doctorId]);

  useEffect(() => {
    const date = new Date().toISOString().split("T")[0];

    if (doctorId && selectedClinic) {
      if (selectedDate !== null) {
        fetchSlotsForDate(selectedDate?.format("YYYY-MM-DD"));
      } else {
        fetchSlotsForDate(date);
      }
    }
  }, [selectedDate, doctorId, selectedClinic]);

  const fetchSlotsForDate = async (date) => {
    try {
      setLoading(true);
      const response = await apiGet("/appointment/getSlotsByDoctorIdAndDate", {
        params: {
          doctorId: doctorId,
          date: date,
          addressId: selectedClinic,
        },
      });

      if (response.data && response.data.status === "success") {
        const slotsData = response.data.data;
        const available = [];
        const unavailable = [];

        if (slotsData?.slots && Array.isArray(slotsData.slots)) {
          slotsData.slots.forEach((slot) => {
            const timeStr = moment(slot.time, "HH:mm").format("hh:mm A");
            if (slot.status === "available") {
              available.push({
                time: timeStr,
                available: true,
                id: slot._id,
                originalTime: slot.time,
              });
            } else {
              unavailable.push({
                time: timeStr,
                available: false,
                id: slot._id,
                reason: slot.reason || "Not available",
                originalTime: slot.time,
              });
            }
          });
        }

        setCurrentClinicSlots({
          availableSlots: available,
          unavailableSlots: unavailable,
        });
      } else if (response.response?.status === 404) {
        setCurrentClinicSlots({
          availableSlots: [],
          unavailableSlots: [],
        });
        message.info(
          "No slots found for this date - starting with empty schedule"
        );
      } else {
        message.error(response.data?.message || "Failed to fetch slots");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      if (error.response?.status === 404) {
        setCurrentClinicSlots({
          availableSlots: [],
          unavailableSlots: [],
        });
        message.info(
          "No slots found for this date - starting with empty schedule"
        );
      } else {
        message.error("Failed to fetch slots");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlots = async () => {
    try {
      setLoading(true);
      const { availableSlots, unavailableSlots } = getCurrentClinicSlots();

      const allSlots = [
        ...availableSlots.map((slot) => ({
          time: slot.originalTime,
          status: "available",
          reason: "",
        })),
        ...unavailableSlots.map((slot) => ({
          time: slot.originalTime,
          status: "unavailable",
          reason: slot.reason,
        })),
      ];

      const timeSlots = allSlots.map((slot) => slot.time);

      const response = await apiPut("/appointment/updateDoctorSlots", {
        doctorId: doctorId,
        date: selectedDate.format("YYYY-MM-DD"),
        addressId: selectedClinic,
      });

      if (response.data && response.data.status === "success") {
        message.success("Slots updated successfully");
        fetchSlotsForDate(selectedDate.format("YYYY-MM-DD"));
      } else {
        message.error(response.data?.message || "Failed to update slots");
      }
    } catch (error) {
      console.error("Error updating slots:", error);
      message.error("Failed to update slots");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailableSlots = async () => {
    try {
      setLoading(true);

      const getDateRangeArray = (fromDate, endDate) => {
        const dates = [];
        let currentDate = moment(fromDate, "YYYY-MM-DD");
        const end = moment(endDate, "YYYY-MM-DD");

        while (currentDate.isSameOrBefore(end)) {
          dates.push(currentDate.format("YYYY-MM-DD"));
          currentDate.add(1, "days");
        }

        return dates;
      };

      const fromDate = selectedDate?.format("YYYY-MM-DD");
      const endDate = selectedEndDate?.format("YYYY-MM-DD");

      let selectedDates = [];
      if (fromDate && endDate) {
        selectedDates = getDateRangeArray(fromDate, endDate);
      } else {
        selectedDates = [fromDate];
      }

      const response = await apiPost("/appointment/createSlotsForDoctor", {
        doctorId: doctorId,
        dates: selectedDates,
        startTime: moment(
          `${availableStartTime}:00 ${availableStartPeriod}`,
          "hh:mm A"
        ).format("HH:mm"),
        endTime: moment(
          `${availableEndTime}:00 ${availableEndPeriod}`,
          "hh:mm A"
        ).format("HH:mm"),
        interval: availableDuration,
        isAvailable: true,
        addressId: selectedClinic,
      });
console.log("response", response)
      if (response.data && response.data.status === "success") {
        const message = response?.data?.results[0]?.reason || "Available slots created successfully";
          toast.success(message || response?.data?.message || "updated");

        message.success(response?.data?.message|| "Available slots created successfully");
        fetchSlotsForDate(selectedDate.format("YYYY-MM-DD"));
      } else {
          // toast.error(response?.data?.message || "Failed to create available slots");

        message.error(
          response.data?.message || "Failed to create available slots"
        );
      }
    } catch (error) {
          // toast.error( "Failed to create available slots");

      console.error("Error creating available slots:", error);
      message.error("Failed to create available slots");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllAvailable = async () => {
    try {
      setLoading(true);
      const { availableSlots } = getCurrentClinicSlots();
      const slotIds = availableSlots.map((slot) => slot.id);

      if (slotIds.length > 0) {
        const response = await apiDelete("/appointment/deleteSlots", {
          data: {
            slotIds: slotIds,
          },
        });

        if (response.data && response.data.status === "success") {
          message.success("Available slots deleted successfully");
          setCurrentClinicSlots({
            ...getCurrentClinicSlots(),
            availableSlots: [],
          });
        } else {
          message.error(
            response.data?.message || "Failed to delete available slots"
          );
        }
      } else {
        message.info("No available slots to delete");
      }
    } catch (error) {
      console.error("Error deleting available slots:", error);
      message.error("Failed to delete available slots");
    } finally {
      setLoading(false);
    }
  };

 const handleAddUnavailableSlots = async () => {
    try {
      setLoading(true);
      const { availableSlots, unavailableSlots } = getCurrentClinicSlots();

      const startTime = moment(
        `${unavailableStartTime}:00 ${unavailableStartPeriod}`,
        "hh:mm A"
      );
      const endTime = moment(
        `${unavailableEndTime}:00 ${unavailableEndPeriod}`,
        "hh:mm A"
      );

      // Filter available slots that fall within the unavailable time range
      const slotsToMarkUnavailable = availableSlots.filter((slot) => {
        const slotTime = moment(slot.originalTime, "HH:mm");
        return slotTime.isSameOrAfter(startTime) && slotTime.isSameOrBefore(endTime);
      });

      const existingUnavailableTimes = unavailableSlots.map(
        (slot) => slot.originalTime
      );

      // Filter out slots that are already unavailable
      const newSlotsToMark = slotsToMarkUnavailable.filter(
        (slot) => !existingUnavailableTimes.includes(slot.originalTime)
      );

      if (newSlotsToMark.length === 0) {
        toast.error("No available slots in the selected time range to mark as unavailable");
        message.info("No available slots in the selected time range to mark as unavailable");
        return;
      }

      // Remove the selected slots from availableSlots
      const updatedAvailableSlots = availableSlots.filter(
        (slot) => !newSlotsToMark.some((newSlot) => newSlot.originalTime === slot.originalTime)
      );

      // Add the selected slots to unavailableSlots
      const newUnavailableSlots = [
        ...unavailableSlots,
        ...newSlotsToMark.map((slot) => ({
          ...slot,
          available: false,
          reason: unavailableReason || "Not available",
        })),
      ];

      // Prepare the API payload with the exact times of the slots to mark unavailable
      const response = await apiPut("/appointment/updateDoctorSlots", {
        doctorId: doctorId,
        date: selectedDate?.format("YYYY-MM-DD"),
        timeSlots: newSlotsToMark.map((slot) => slot.originalTime),
        addressId: selectedClinic,
        status: "unavailable",
        reason: unavailableReason || "Not available",
      });
      console.log("response123", response)

      if (response.data && response.data.status === "success") {
        if (response.data.updatedSlots.length === 0) {
          console.log("response data", response.data.message);
          toast.error(response.data.message || "No slots were updated");
          return;
        }
        setCurrentClinicSlots({
          availableSlots: updatedAvailableSlots,
          unavailableSlots: newUnavailableSlots,
        });
          toast.success( "Slots marked as unavailable successfully");

        message.success("Slots marked as unavailable successfully");
      } else {
        throw new Error(response.data?.message || "Failed to update slots");
      }
    } catch (error) {
      console.error("Error creating unavailable slots:", error);
      message.error("Failed to create unavailable slots");
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteAllUnavailable = async () => {
    try {
      setLoading(true);
      const { unavailableSlots } = getCurrentClinicSlots();
      const slotIds = unavailableSlots.map((slot) => slot.id);

      if (slotIds.length > 0) {
        const response = await apiDelete("/appointment/deleteSlots", {
          data: {
            slotIds: slotIds,
          },
        });

        if (response.data && response.data.status === "success") {
          message.success("Unavailable slots deleted successfully");
          setCurrentClinicSlots({
            ...getCurrentClinicSlots(),
            unavailableSlots: [],
          });
        } else {
          message.error(
            response.data?.message || "Failed to delete unavailable slots"
          );
        }
      } else {
        message.info("No unavailable slots to delete");
      }
    } catch (error) {
      console.error("Error deleting unavailable slots:", error);
      message.error("Failed to delete unavailable slots");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (startTime, endTime, interval) => {
    const slots = [];
    let currentTime = moment(startTime, "HH:mm");
    const endTimeMoment = moment(endTime, "HH:mm");

    while (currentTime.isSameOrBefore(endTimeMoment)) {
      slots.push(currentTime.format("HH:mm"));
      currentTime.add(interval, "minutes");
    }

    return slots;
  };

  const adjustTime = (type, direction, section) => {
    if (section === "available") {
      console.log("available")
      if (type === "start") {
        if (direction === "up") {
          setAvailableStartTime((prev) => (prev === 12 ? 1 : prev + 1));
        } else {
          setAvailableStartTime((prev) => (prev === 1 ? 12 : prev - 1));
        }
      } else {
        if (direction === "up") {
          setAvailableEndTime((prev) => (prev === 12 ? 1 : prev + 1));
        } else {
          setAvailableEndTime((prev) => (prev === 1 ? 12 : prev - 1));
        }
      }
    } else {
      console.log("unavailable")
      if (type === "start") {
        if (direction === "up") {
          setUnavailableStartTime((prev) => (prev === 12 ? 1 : prev + 1));
        } else {
          setUnavailableStartTime((prev) => (prev === 1 ? 12 : prev - 1));
        }
      } else {
        if (direction === "up") {
          setUnavailableEndTime((prev) => (prev === 12 ? 1 : prev + 1));
        } else {
          setUnavailableEndTime((prev) => (prev === 1 ? 12 : prev - 1));
        }
      }
    }
  };

  const adjustDuration = (direction, section) => {
    if (section === "available") {
      if (direction === "up") {
        setAvailableDuration((prev) => Math.min(60, prev + 15));
      } else {
        setAvailableDuration((prev) => Math.max(15, prev - 15));
      }
    } else {
      if (direction === "up") {
        setUnavailableDuration((prev) => Math.min(60, prev + 15));
      } else {
        setUnavailableDuration((prev) => Math.max(15, prev - 15));
      }
    }
  };

 const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSlotTime, setSelectedSlotTime] = useState(null);

  const showModal = (slotTime) => {
    setSelectedSlotTime(slotTime);
    setIsModalVisible(true);
  };

const handleOk = async (type) => {
  console.log(type, "selected string")
  const date = dayjs(selectedDate).format("YYYY-MM-DD");
   const { availableSlots, unavailableSlots } = getCurrentClinicSlots(); 
  console.log("Selected Slot Time:", selectedSlotTime);
  console.log("Available Slots:", availableSlots);
  console.log("Available Slots:", unavailableSlots);

  const slots = type ==='available' ?availableSlots:unavailableSlots

  // Convert 12-hour time (e.g., "09:15 AM") to 24-hour format ("09:15")
  const convertTo24Hour = (time12h) => {
    console.log(time12h)
    if (typeof time12h !== 'string') {
    console.error("Invalid time format:", time12h);
    return null;
  }
    const [time, modifier] = time12h?.split(" ");
    let [hours, minutes] = time?.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };
  // Prepare the payload
  let payload = {
    doctorId: doctorId,
    addressId: selectedClinic,
    date: date,
    slotTimes: [],
  };

  if (selectedSlotTime?.length>0) {
    payload.slotTimes = [convertTo24Hour(selectedSlotTime)];
  } else {
   
   payload.slotTimes = slots
  .map((item, index) => {
    console.log(`Item[${index}] =`, item);
    return convertTo24Hour(item?.time);
  })
  .filter(Boolean); // remove any null/undefined results

  }

  console.log("Payload for deleting slots:", payload);

  try {

    
    const res = await apiDelete(
      `/appointment/deleteDoctorSlots`,
      payload
    );
    console.log(res, "complete response")
    if (res.status === 200) {
      toast.success(res.data.message|| "slot deleted successfully")
      setSelectedSlotTime([])
  fetchSlotsForDate(date)
    }else{
      toast.error(res.data.message)
    }

    // Update UI: remove deleted slots
    // if (selectedSlotTime) {
    //   setUnavailableSlots((prev) =>
    //     prev.filter((slot) => slot.time !== selectedSlotTime)
    //   );
    // } else {
    //   setUnavailableSlots([]);
    // }

    setIsModalVisible(false);
  } catch (error) {
    console.error("Error deleting slot:", error);
  }
};


  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const renderAvailableTimeControls = () => {
    const { availableSlots } = getCurrentClinicSlots();

    return (
      <>
        <Title
          level={4}
          style={{
            marginBottom: 16,
            color: "#16A34A",
          }}
        >
          Available Time Slots
        </Title>

        <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 16 }}>
          {/* Start Time */}
          <Col xs={12} sm={6}>
            <Text strong>Start Time:</Text>
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 8 }}
            >
              <span
                style={{
                  minWidth: 30,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {availableStartTime}
              </span>
              <div style={{ marginLeft: 8 }}>
                <Button
                  size="small"
                  icon={<UpOutlined />}
                  onClick={() => adjustTime("start", "up", "available")}
                  style={{
                    display: "block",
                    marginBottom: 2,
                    width: 30,
                    height: 20,
                  }}
                />
                <Button
                  size="small"
                  icon={<DownOutlined />}
                  onClick={() => adjustTime("start", "down", "available")}
                  style={{ display: "block", width: 30, height: 20 }}
                />
              </div>
              <Button
                size="small"
                onClick={() =>
                  setAvailableStartPeriod(availableStartPeriod === "AM" ? "PM" : "AM")
                }
                style={{
                  marginLeft: 8,
                  backgroundColor: availableStartPeriod === "AM" ? "#fff" : "#ffeaa7",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  minWidth: 35,
                  height: 24,
                }}
              >
                {availableStartPeriod}
              </Button>
            </div>
          </Col>

          {/* End Time */}
          <Col xs={12} sm={6}>
            <Text strong>End Time:</Text>
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 8 }}
            >
              <span
                style={{
                  minWidth: 30,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {availableEndTime}
              </span>
              <div style={{ marginLeft: 8 }}>
                <Button
                  size="small"
                  icon={<UpOutlined />}
                  onClick={() => adjustTime("end", "up", "available")}
                  style={{
                    display: "block",
                    marginBottom: 2,
                    width: 30,
                    height: 20,
                  }}
                />
                <Button
                  size="small"
                  icon={<DownOutlined />}
                  onClick={() => adjustTime("end", "down", "available")}
                  style={{ display: "block", width: 30, height: 20 }}
                />
              </div>
              <Button
                size="small"
                onClick={() =>
                  setAvailableEndPeriod(availableEndPeriod === "AM" ? "PM" : "AM")
                }
                style={{
                  marginLeft: 8,
                  backgroundColor: availableEndPeriod === "AM" ? "#fff" : "#ffeaa7",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  minWidth: 35,
                  height: 24,
                }}
              >
                {availableEndPeriod}
              </Button>
            </div>
          </Col>

          {/* Duration */}
          <Col xs={12} sm={6}>
            <Text strong>Duration (minutes):</Text>
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 8 }}
            >
              <span
                style={{
                  minWidth: 30,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {availableDuration}
              </span>
              <div style={{ marginLeft: 8 }}>
                <Button
                  size="small"
                  icon={<UpOutlined />}
                  onClick={() => adjustDuration("up", "available")}
                  style={{
                    display: "block",
                    marginBottom: 2,
                    width: 30,
                    height: 20,
                  }}
                />
                <Button
                  size="small"
                  icon={<DownOutlined />}
                  onClick={() => adjustDuration("down", "available")}
                  style={{ display: "block", width: 30, height: 20 }}
                />
              </div>
            </div>
          </Col>

          {/* Action Buttons */}
          <Col xs={12} sm={6}>
            <Space>
              <Button
                type="primary"
                onClick={handleAddAvailableSlots}
                icon={<PlusOutlined />}
                style={{ fontWeight: "bold" }}
              >
                Add Available Slots
              </Button>
              
            </Space>
          </Col>

           <Col xs={12} sm={6}>
            <Space>
              <Button
                type="primary"
                danger
                onClick={() => handleOk('available')}
                icon={<PlusOutlined />}
                style={{ fontWeight: "bold" }}
              >
                Delete Slots
              </Button>
              
            </Space>
          </Col>
        </Row>

        {/* Slots Display */}
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
         {availableSlots.map((slot, index) => {
  const isToday =
    selectedDate && selectedDate.isSame(new Date(), "day");

  // Convert slot time (e.g., "10:30 AM") and current time to comparable Date objects
  const slotDateTime = isToday
    ? new Date(`${selectedDate.format("YYYY-MM-DD")} ${slot.time}`)
    : null;

  const isPastTime =
    isToday && slotDateTime && slotDateTime < new Date();

  return (
    <Col key={index} xs={12} sm={8} md={6} lg={4}>
      <Button
        onClick={() => showModal(slot.time)}
        disabled={isPastTime}
        block
        style={{
          height: 48,
          borderRadius: 8,
          border: "1px solid #52c41a",
          backgroundColor: isPastTime ? "#f5f5f5" : "#DCFCE7",
          color: isPastTime ? "#999" : "#52c41a",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        icon={<ClockCircleOutlined />}
      >
        {slot.time}
      </Button>
    </Col>
  );
})}

        </Row>
        
      <Modal
        title="Confirm Delete"
        open={isModalVisible}
        onOk={() => handleOk('available')}
        onCancel={handleCancel}
        okText="Yes, Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete the slot: <strong>{selectedSlotTime}</strong>?</p>
      </Modal>

        <Divider />
      </>
    );
  };

  const renderUnavailableTimeControls = () => {
    const { unavailableSlots } = getCurrentClinicSlots();

    return (
      <>
        <Title
          level={4}
          style={{
            marginBottom: 16,
            color: "#FF3B30",
          }}
        >
          Unavailable Time Slots
        </Title>

        <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 16 }}>
          {/* Start Time */}
          <Col xs={12} sm={6}>
            <Text strong>Start Time:</Text>
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 8 }}
            >
              <span
                style={{
                  minWidth: 30,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {unavailableStartTime}
              </span>
              <div style={{ marginLeft: 8 }}>
                <Button
                  size="small"
                  icon={<UpOutlined />}
                  onClick={() => adjustTime("start", "up", "unavailable")}
                  style={{
                    display: "block",
                    marginBottom: 2,
                    width: 30,
                    height: 20,
                  }}
                />
                <Button
                  size="small"
                  icon={<DownOutlined />}
                  onClick={() => adjustTime("start", "down", "unavailable")}
                  style={{ display: "block", width: 30, height: 20 }}
                />
              </div>
              <Button
                size="small"
                onClick={() =>
                  setUnavailableStartPeriod(unavailableStartPeriod === "AM" ? "PM" : "AM")
                }
                style={{
                  marginLeft: 8,
                  backgroundColor: unavailableStartPeriod === "AM" ? "#fff" : "#ffeaa7",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  minWidth: 35,
                  height: 24,
                }}
              >
                {unavailableStartPeriod}
              </Button>
            </div>
          </Col>

          {/* End Time */}
          <Col xs={12} sm={6}>
            <Text strong>End Time:</Text>
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 8 }}
            >
              <span
                style={{
                  minWidth: 30,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                {unavailableEndTime}
              </span>
              <div style={{ marginLeft: 8 }}>
                <Button
                  size="small"
                  icon={<UpOutlined />}
                  onClick={() => adjustTime("end", "up", "unavailable")}
                  style={{
                    display: "block",
                    marginBottom: 2,
                    width: 30,
                    height: 20,
                  }}
                />
                <Button
                  size="small"
                  icon={<DownOutlined />}
                  onClick={() => adjustTime("end", "down", "unavailable")}
                  style={{ display: "block", width: 30, height: 20 }}
                />
              </div>
              <Button
                size="small"
                onClick={() =>
                  setUnavailableEndPeriod(unavailableEndPeriod === "AM" ? "PM" : "AM")
                }
                style={{
                  marginLeft: 8,
                  backgroundColor: unavailableEndPeriod === "AM" ? "#fff" : "#ffeaa7",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  minWidth: 35,
                  height: 24,
                }}
              >
                {unavailableEndPeriod}
              </Button>
            </div>
          </Col>

          {/* Duration */}
         

          {/* Action Buttons */}
          <Col xs={12} sm={6}>
            <Space>
              <Button
                type="primary"
                danger
                onClick={handleAddUnavailableSlots}
                icon={<StopOutlined />}
                style={{ fontWeight: "bold" }}
              >
                Add Unavailable Slots
              </Button>
              
            </Space>
          </Col>

          <Col xs={12} sm={6}>
            <Space>
              <Button
                type="primary"
                danger
               onClick={() => handleOk('unavailable')}
                icon={<StopOutlined />}
                style={{ fontWeight: "bold" }}
              >
                Delete Slots
              </Button>
              
            </Space>
          </Col>
        </Row>

        {/* Reason Input */}
        <div style={{ marginBottom: 16 }}>
          <Text strong>Reason for Unavailability:</Text>
          <Input
            placeholder="Enter reason..."
            value={unavailableReason}
            onChange={(e) => setUnavailableReason(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>

        {/* Slots Display */}
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          {unavailableSlots.map((slot, index) => (
            <Col key={index} xs={12} sm={8} md={6} lg={4}>
              <Button
                block
                 onClick={() => showModal(slot.time)}
                style={{
                  height: 48,
                  borderRadius: 8,
                  border: "1px solid #ff4d4f",
                  backgroundColor: "#FEE2E2",
                  color: "#ff4d4f",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                icon={<StopOutlined />}
              >
                {slot.time}
              </Button>
            </Col>
          ))}
        </Row>

        <Divider />
      </>
    );
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    const todayIndex = moment().isoWeekday(); // Monday=1, Sunday=7
    const selectedIndex = fullWeek.indexOf(day) + 1; // Make it 1-based like isoWeekday
    const diff = selectedIndex - todayIndex;
    const date = moment().add(diff, "days");
    setSelectedDate(date);
  };

  return (
    <div
      style={{ padding: 24, backgroundColor: "#F3FFFD", minHeight: "100vh" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Title level={3} style={{ marginBottom: 24, color: "#1f2937" }}>
          Availability Management
        </Title>

        {/* Clinic Selection */}
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Text strong style={{ marginRight: 16 }}>
            Select Clinic:
          </Text>
          <Select
            value={selectedClinic}
            onChange={setSelectedClinic}
            style={{ width: 250 }}
            suffixIcon={<DownOutlined />}
            loading={loading}
          >
            {clinics.map((clinic) => (
              <Option key={clinic.value} value={clinic.value}>
                {clinic.label}
              </Option>
            ))}
          </Select>
        </Card>

        <Spin spinning={loading}>
          {/* Main Card */}
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Space>
                  <Text strong>Manage Availability for:</Text>
                  <Text strong>Start Date:</Text>
                  <DatePicker
                    placeholder="mm/dd/yyyy"
                    style={{ width: "120px" }}
                    onChange={handleDateChange}
                    value={selectedDate}
                    format="MM/DD/YYYY"
                     disabledDate={(current) => current && current < moment().startOf('day')}
                  />

                  <Text strong>End Date:</Text>

                  <DatePicker
                    placeholder="mm/dd/yyyy"
                    style={{ width: "120px" }}
                    onChange={handleEndDateChange}
                    value={selectedEndDate}
                    format="MM/DD/YYYY"
                    disabledDate={(current) => current && current < moment().startOf('day')}
                  />
                </Space>
              </div>
            }
            style={{ borderRadius: 12, marginBottom: 24 }}
            bodyStyle={{ padding: 24 }}
          >
            {/* Day Selection */}
            <div style={{ marginBottom: 24 }}>
              <Text
                strong
                style={{ display: "block", marginBottom: 16, fontSize: 16 }}
              >
                Select Day of Week:
              </Text>
              <Row gutter={[8, 8]}>
                {orderedDays.map((day) => (
                  <Col key={day}>
                    <Button
                      type={selectedDay === day ? "primary" : "default"}
                      onClick={() => handleDayClick(day)}
                      style={{ borderRadius: 20, minWidth: 80, height: 36 }}
                    >
                      {day}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Available Slots Section */}
            {renderAvailableTimeControls()}

            {/* Unavailable Slots Section */}
            {renderUnavailableTimeControls()}

            {/* Legend */}
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color="#16A34A" icon={<ClockCircleOutlined />}>
                  Available Slots
                </Tag>
                <Tag color="#FF3B30" icon={<StopOutlined />}>
                  Unavailable Slots
                </Tag>
              </Space>
            </div>
          </Card>
        </Spin>
      </div>
    </div>
  );
};

export default AvailabilityScreen;