import React, { useState } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Typography,
    Tag,
    Space,
    Tooltip,
    Grid,
} from "antd";
import {
    LeftOutlined,
    RightOutlined,
    HeartFilled,
    CalendarOutlined,
    EnvironmentOutlined,
    DollarOutlined,
    CheckCircleFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import WhyChooseUs from "./WhyChooseUs"; 

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Sample doctor images (replace with your own or use URLs)
const doctorImages = [
    "https://plus.unsplash.com/premium_photo-1661699733041-a4e02693adf5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8SW5kaWFuJTIwRG9jdG9yJTIwSW1hZ2V8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1659353888906-adb3e0041693?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8SW5kaWFuJTIwRG9jdG9yJTIwSW1hZ2V8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1678940805950-73f2127f9d4e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fEluZGlhbiUyMERvY3RvciUyMEltYWdlfGVufDB8fDB8fHww",
    "https://media.istockphoto.com/id/1270790502/photo/medical-concept-of-indian-beautiful-female-doctor-with-note-book.webp?a=1&b=1&s=612x612&w=0&k=20&c=fg_7luuQzYkY9AOwJDtX817uZTIDoFdKgTVG-kIf7BA=",
    "https://media.istockphoto.com/id/1410398449/photo/male-doctor-in-a-medical-clinic-writing-prescription-for-a-young-female-patient.webp?a=1&b=1&s=612x612&w=0&k=20&c=qc0xflQ7rHLudNluswcw3UqRNMaYFvnP8fjW3CqZ7XU=",
    "https://media.istockphoto.com/id/1203928556/photo/medical-concept-of-asian-beautiful-female-doctor-in-white-coat-with-stethoscope-waist-up.webp?a=1&b=1&s=612x612&w=0&k=20&c=shFtwxs-81Cyzlb6bDGs_gN2xi0Vwd1s3GG0MEG8_nE=",
    "https://plus.unsplash.com/premium_photo-1661578535048-7a30e3a71d25?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fEluZGlhbiUyMERvY3RvciUyMEltYWdlfGVufDB8fDB8fHww",
    "https://plus.unsplash.com/premium_photo-1682089872205-dbbae3e4ba32?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDF8fEluZGlhbiUyMERvY3RvciUyMEltYWdlfGVufDB8fDB8fHww",
];

const doctors = [
    {
        name: "Dr. Rajesh Sharma",
        specialty: "Psychologist",
        location: "Delhi, India",
        duration: "30 Min",
        rating: 5.0,
        fee: 1500,
        available: true,
        image: doctorImages[0],
    },
    {
        name: "Dr. Priya Patel",
        specialty: "Pediatrician",
        location: "Mumbai, India",
        duration: "60 Min",
        rating: 4.6,
        fee: 1200,
        available: true,
        image: doctorImages[1],
    },
    {
        name: "Dr. Amit Kumar",
        specialty: "Neurologist",
        location: "Bangalore, India",
        duration: "30 Min",
        rating: 4.8,
        fee: 2000,
        available: true,
        image: doctorImages[2],
    },
    {
        name: "Dr. Ananya Gupta",
        specialty: "Cardiologist",
        location: "Hyderabad, India",
        duration: "30 Min",
        rating: 4.8,
        fee: 1800,
        available: true,
        image: doctorImages[3],
    },
    {
        name: "Dr. Sanjay Verma",
        specialty: "Dermatologist",
        location: "Chennai, India",
        duration: "45 Min",
        rating: 4.7,
        fee: 1600,
        available: true,
        image: doctorImages[4],
    },
    {
        name: "Dr. Neha Singh",
        specialty: "Gynecologist",
        location: "Kolkata, India",
        duration: "60 Min",
        rating: 4.9,
        fee: 1900,
        available: true,
        image: doctorImages[5],
    },
    {
        name: "Dr. Vikram Joshi",
        specialty: "Orthopedic Surgeon",
        location: "Pune, India",
        duration: "45 Min",
        rating: 4.8,
        fee: 2200,
        available: true,
        image: doctorImages[6],
    },
    {
        name: "Dr. Meera Nair",
        specialty: "ENT Specialist",
        location: "Ahmedabad, India",
        duration: "30 Min",
        rating: 4.5,
        fee: 1400,
        available: true,
        image: doctorImages[7],
    },
];

const getVisibleCards = (screens) => {
    if (screens.xl) return 4;
    if (screens.lg) return 3;
    if (screens.md) return 2;
    return 1;
};

function StarIcon() {
    return (
        <svg width="12" height="12" fill="#fff" style={{ marginRight: 2 }} viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    );
}

const FeaturedDocs = () => {
    const screens = useBreakpoint();
    const visibleCards = getVisibleCards(screens);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    const maxIndex = Math.max(0, doctors.length - visibleCards);

    const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
    const handleNext = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    const handleBook = (doc) => navigate(`/book/${encodeURIComponent(doc.name)}`);

    const visibleDoctors = doctors.slice(currentIndex, currentIndex + visibleCards);

    return (
        <>
        <div style={{ background: "#f8fafd", minHeight: "100vh", padding: 24 }}>
            {/* Header */}
            <Row justify="center" style={{ marginBottom: 24 }}>
                <Col>
                    <Tag color="#00203f" style={{ fontWeight: 600, fontSize: 14, borderRadius: 20, padding: "8px 20px" }}>
                        • Accessibility •
                    </Tag>
                    <Title level={2} style={{ textAlign: "center", marginTop: "20px", color: "#0a2540" }}>
                        Our Doctors
                    </Title>
                </Col>
            </Row>

            {/* Carousel Controls and Cards */}
            <Row justify="center" align="middle" style={{ marginBottom: 24 }}>
                {/* <Button
                    shape="circle"
                    icon={<LeftOutlined />}
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    size="large"
                    style={{
                        marginRight: 16,
                        background: currentIndex === 0 ? "#e2e8f0" : "#1a365d",
                        color: currentIndex === 0 ? "#64748b" : "#fff",
                        border: "none",
                    }}
                /> */}
                <Row gutter={[24, 24]} style={{ width: "100%", maxWidth: 1200 }} justify="center">
                    {visibleDoctors.map((doc, idx) => (
                        <Col
                            key={doc.name + idx}
                            xs={24}
                            sm={24}
                            md={12}
                            lg={8}
                            xl={6}
                            style={{ display: "flex", justifyContent: "center" }}
                        >
                            <Card
                                hoverable
                                style={{
                                    width: 280,
                                    height: 400,
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                                cover={
                                    <div style={{ position: "relative" }}>
                                        <img
                                            src={doc.image}
                                            alt={doc.name}
                                            style={{
                                                width: "100%",
                                                height: 180,
                                                objectFit: "cover",
                                                borderTopLeftRadius: 12,
                                                borderTopRightRadius: 12,
                                            }}
                                        />
                                        <Tag
                                            color="orange"
                                            style={{
                                                position: "absolute",
                                                top: 12,
                                                left: 12,
                                                fontWeight: 600,
                                                fontSize: 12,
                                                borderRadius: 6,
                                                display: "flex",
                                                alignItems: "center",
                                                padding: "4px 8px",
                                            }}
                                            icon={<StarIcon />}
                                        >
                                            {doc.rating}
                                        </Tag>
                                        <Tooltip title="Add to favorites">
                                            <Button
                                                shape="circle"
                                                icon={<HeartFilled style={{ color: "#e53e3e" }} />}
                                                style={{
                                                    position: "absolute",
                                                    top: 12,
                                                    right: 12,
                                                    background: "#fff",
                                                    border: "none",
                                                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                }
                                bodyStyle={{
                                    padding: 20,
                                    display: "flex",
                                    flexDirection: "column",
                                    height: 260,
                                }}
                            >
                                <Space direction="vertical" style={{ width: "100%" }} size={8}>
                                    <Row justify="space-between" align="middle">
                                        <Col>
                                            <Tag
                                                color="blue"
                                                style={{
                                                    fontWeight: 500,
                                                    fontSize: 14,
                                                    borderLeft: "3px solid #1976d2",
                                                    paddingLeft: 8,
                                                }}
                                            >
                                                {doc.specialty}
                                            </Tag>
                                        </Col>
                                        <Col>
                                            {doc.available && (
                                                <Tag
                                                    color="success"
                                                    // icon={<CheckCircleFilled />}
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 12,
                                                        borderRadius: 6,
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    Available
                                                </Tag>
                                            )}
                                        </Col>
                                    </Row>
                                    <Title level={4} style={{ margin: 0, color: "#1a365d" }}>
                                        {doc.name}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                        <EnvironmentOutlined style={{ marginRight: 4 }} />
                                        {doc.location}
                                        <span style={{ margin: "0 8px", color: "#bdbdbd" }}>•</span>
                                        <CalendarOutlined style={{ marginRight: 4 }} />
                                        {doc.duration}
                                    </Text>
                                    <div style={{ marginTop: "auto" }}>
                                        <Text type="secondary" style={{ fontSize: 14 }}>
                                            Consultation Fees
                                        </Text>
                                        <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
                                            <DollarOutlined style={{ color: "#ff5722", marginRight: 4 }} />
                                            <Text strong style={{ fontSize: 20, color: "#ff5722" }}>
                                                Rs{doc.fee}
                                            </Text>
                                        </div>
                                        <Button
                                            type="primary"
                                            block
                                            style={{
                                                borderRadius: 24,
                                                fontWeight: 500,
                                                height: 40,
                                                marginLeft:120,
                                                marginTop: -50,
                                                width: "50%",
                                                fontSize: 14,
                                                background: "#1a365d",
                                                border: "none",
                                            }}
                                            onClick={() => handleBook(doc)}
                                        >
                                            Book Now
                                        </Button>
                                    </div>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Button
                    shape="circle"
                    icon={<LeftOutlined />}
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    size="large"
                    style={{
                        marginRight: 16,
                        marginTop: 15,
                        background: currentIndex === 0 ? "#e2e8f0" : "#1a365d",
                        color: currentIndex === 0 ? "#64748b" : "#fff",
                        border: "none",
                    }}
                />
                <Button
                    shape="circle"
                    icon={<RightOutlined />}
                    onClick={handleNext}
                    disabled={currentIndex >= maxIndex}
                    size="large"
                    style={{
                        marginLeft: 16,
                        marginTop: 15,
                        background: currentIndex >= maxIndex ? "#e2e8f0" : "#1a365d",
                        color: currentIndex >= maxIndex ? "#64748b" : "#fff",
                        border: "none",
                    }}
                />
            </Row>

            {/* Progress Indicators */}
            <Row justify="center" style={{ marginBottom: 20 }}>
                <Space>
                    {Array.from({ length: maxIndex + 1 }, (_, i) => (
                        <Button
                            key={i}
                            type={currentIndex === i ? "primary" : "default"}
                            shape="round"
                            size="small"
                            style={{
                                width: currentIndex === i ? 24 : 8,
                                height: 8,
                                padding: 0,
                                background: currentIndex === i ? "#1a365d" : "#e2e8f0",
                                border: "none",
                                transition: "all 0.3s",
                            }}
                            onClick={() => setCurrentIndex(i)}
                        />
                    ))}
                </Space>
            </Row>
        </div>

        <WhyChooseUs />

        </>
    );
};

export default FeaturedDocs;
