import React, { useRef, useState } from 'react';
import { Card, Button, Row, Col, Space, Typography } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;
import FeaturedDocs from './FeaturedDocs'; 

const specialities = [
  {
    name: "General Physician",
    doctors: 254,
    icon: "👩‍⚕️",
    bg: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Sexologist",
    doctors: 89,
    icon: "❤️",
    bg: "https://media.istockphoto.com/id/999105208/photo/close-up-of-therapist-hand-writing-notes-during-a-counseling-session-with-a-single-woman.webp?a=1&b=1&s=612x612&w=0&k=20&c=1RaB8d0LNt-Jb1jldYXt9pXNVsbyoKp1S4eChBKi1dg=",
  },
  {
    name: "Paediatrician",
    doctors: 176,
    icon: "👶",
    bg: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Gynecologist",
    doctors: 124,
    icon: "👩‍⚕️",
    bg: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Orthopedics",
    doctors: 151,
    icon: "🦴",
    bg: "https://images.unsplash.com/photo-1597764690472-ec054f1c8637?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8T3J0aG9wZWRpY3N8ZW58MHx8MHx8fDA%3D",
  },
  {
    name: "Psychologist",
    doctors: 64,
    icon: "🧠",
    bg: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Pulmonologist",
    doctors: 83,
    icon: "🫁",
    bg: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Dermatologist",
    doctors: 112,
    icon: "🌟",
    bg: "https://media.istockphoto.com/id/993954752/photo/professional-dermatologist-chatting-with-patient-on-laptop-online-consultation.webp?a=1&b=1&s=612x612&w=0&k=20&c=6b4msGLL1_LG76YGZ2SCnMnZJQcM6ayW-kEC7v_Ma18=",
  },
  {
    name: "Psychiatrist",
    doctors: 67,
    icon: "🧘",
    bg: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "ENT",
    doctors: 95,
    icon: "👂",
    bg: "https://media.istockphoto.com/id/1302254900/photo/diagnosis-and-treatment-of-ent-diseases-nasal-and-oral-cavity-anatomical-model-on-a-table.webp?a=1&b=1&s=612x612&w=0&k=20&c=WIighLT4HfLCurl8wt1GcJhdm9uYejuQFjPtRTh0b0E=",
  },
  {
    name: "Ophthalmologist",
    doctors: 78,
    icon: "👁️",
    bg: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Dental",
    doctors: 134,
    icon: "🦷",
    bg: "https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RGVudGFsfGVufDB8fDB8fHww",
  },
  {
    name: "Physiotherapy",
    doctors: 89,
    icon: "🏃‍♀️",
    bg: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Nutritionist",
    doctors: 56,
    icon: "🥗",
    bg: "https://media.istockphoto.com/id/1592967928/photo/mother-feeding-her-baby-boy.webp?a=1&b=1&s=612x612&w=0&k=20&c=wXcO29WXi7WW0gCK7mMhhqeY5344xczYDtn28JYQ3RA=",
  },
  {
    name: "Veterinary",
    doctors: 43,
    icon: "🐕",
    bg: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Ayurveda",
    doctors: 87,
    icon: "🌿",
    bg: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Homeopathy",
    doctors: 72,
    icon: "💊",
    bg: "https://media.istockphoto.com/id/158308395/photo/prescription-medicine.webp?a=1&b=1&s=612x612&w=0&k=20&c=Yi6Z1NJphURBnq6NEHshtwCbLsuPsL1S_t7cHraVjM4=",
  },
  {
    name: "Cardiologist",
    doctors: 156,
    icon: "❤️",
    bg: "https://media.istockphoto.com/id/619413554/photo/heart-care-and-ecg.webp?a=1&b=1&s=612x612&w=0&k=20&c=AF6DySmz2eElgQcgXHX3E1ZFuf0AhV2PY7XR7ONkugc=",
  },
  {
    name: "Neurologist",
    doctors: 98,
    icon: "🧠",
    bg: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Nephrologist",
    doctors: 65,
    icon: "🏥",
    bg: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Urologist",
    doctors: 84,
    icon: "🩺",
    bg: "https://plus.unsplash.com/premium_photo-1702598804759-8fb687f774fb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8VXJvbG9naXN0fGVufDB8fDB8fHww",
  },
  {
    name: "Oncologist",
    doctors: 73,
    icon: "🎗️",
    bg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Rheumatologist",
    doctors: 47,
    icon: "🦴",
    bg: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Vascular Surgeon",
    doctors: 39,
    icon: "⚕️",
    bg: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Gastroenterologist",
    doctors: 91,
    icon: "🏥",
    bg: "https://media.istockphoto.com/id/1467241368/photo/doctor-performs-ultrasound-examination-of-a-woman.webp?a=1&b=1&s=612x612&w=0&k=20&c=06Uk4Euo6DQBNpD49jD02NciKKsw627HugB0BqwxWO8=",
  },
  {
    name: "General Surgery",
    doctors: 127,
    icon: "🔪",
    bg: "https://media.istockphoto.com/id/2174193633/photo/medical-advice-help-and-doctors-with-a-clipboard-for-healthcare-research-and-medicine.webp?a=1&b=1&s=612x612&w=0&k=20&c=slGHaxm-A2kaHGwYXSJEunzqZPcBB7D4Ac4-gCYqWZE=",
  },
  {
    name: "CTVS",
    doctors: 24,
    icon: "❤️‍🩹",
    bg: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Neurosurgeon",
    doctors: 31,
    icon: "🧠",
    bg: "https://media.istockphoto.com/id/1127376129/photo/medical-diagnosis-in-the-digital-age.webp?a=1&b=1&s=612x612&w=0&k=20&c=hQ4s5nijVCSpfDbbCUiQ4hkcClxQuwY2VJ1LvRhOYvI=",
  },
  {
    name: "Ortho Surgeon",
    doctors: 68,
    icon: "🦴",
    bg: "https://images.unsplash.com/photo-1684752397429-4ce4d7856cb8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8T3J0aG8lMjBTdXJnZW9ufGVufDB8fDB8fHww",
  },
  {
    name: "ENT Surgeries",
    doctors: 52,
    icon: "👂",
    bg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Eye Surgeries",
    doctors: 45,
    icon: "👁️",
    bg: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Dental Surgeries",
    doctors: 73,
    icon: "🦷",
    bg: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Plastic Surgery",
    doctors: 41,
    icon: "💫",
    bg: "https://plus.unsplash.com/premium_photo-1682096547754-b2bb5151211a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8UGxhc3RpYyUyMFN1cmdlcnl8ZW58MHx8MHx8fDA%3D",
  },
  {
    name: "Cancer Surgeries",
    doctors: 35,
    icon: "🎗️",
    bg: "https://media.istockphoto.com/id/1334071244/photo/portrait-of-male-surgeon-giving-thumbs-up.webp?a=1&b=1&s=612x612&w=0&k=20&c=Y7LWx59zDAQCf4273PNTceoyfUCHG1b5VcIi-7j_PlQ=",
  },
  {
    name: "Bariatric Surgery",
    doctors: 28,
    icon: "⚖️",
    bg: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Gyn & Obs",
    doctors: 102,
    icon: "👩‍⚕️",
    bg: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },
  {
    name: "Physical Medicine & Rehabilitation",
    doctors: 37,
    icon: "🏥",
    bg: "https://media.istockphoto.com/id/1418999473/photo/doctors-comforting-disabled-elderly-patient.webp?a=1&b=1&s=612x612&w=0&k=20&c=YwTJIt9-LX4Acp_3ng6BD3_pke2MHOqNMqMgR2adg_g=",
  },
  {
    name: "Sports Medicine",
    doctors: 29,
    icon: "⚽",
    bg: "https://media.istockphoto.com/id/1143400985/photo/female-massage-therapist-massaging-patients-back.webp?a=1&b=1&s=612x612&w=0&k=20&c=c_YIt6KvtpBoy_q1lr9ueMnY1cTEXS8AwqzMnOkU7vI=",
  },
  {
    name: "Transfusion Medicine",
    doctors: 18,
    icon: "🩸",
    bg: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMJA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=600",
  },

];

const SpecialtyCard = ({ spec }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 600);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <Card
      hoverable
      style={{
        width: 150,
        height: 180,
        borderRadius: 20,
        overflow: 'hidden',
        padding: 0,
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0,0,0,0.3)'
          : '0 8px 25px rgba(0,0,0,0.15)',
      }}
      bodyStyle={{ padding: 0, height: '100%' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${spec.bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'all 0.4s ease',
          filter: 'brightness(0.8)',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isHovered
            ? 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)'
            : 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
          transition: 'all 0.4s ease',
        }}
      />

      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 50,
            height: 50,
            marginBottom: 12,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipping ? 'rotateY(360deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {spec.icon}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Title
            level={5}
            style={{
              color: 'white',
              margin: '0 0 6px 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {spec.name}
          </Title>
          <Text
            style={{
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {spec.doctors} Doctors
          </Text>
        </div>

        {/* {isHovered && (
          <div
            style={{
              position: 'absolute',
              bottom: 15,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(66, 133, 244, 0.9)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              animation: 'fadeInUp 0.3s ease forwards',
            }}
          >
            View Doctors
          </div>
        )} */}
      </div>
    </Card>
  );
};

const TopSpecialities = () => {
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = (index) => {
    if (carouselRef.current) {
      const cardWidth = 220 + 30;
      carouselRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < specialities.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  return (
    <>
    <div
      style={{
        position: 'relative',
        padding: 20,
        minHeight: '60vh',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 200,
            height: 200,
            background:
              'linear-gradient(45deg, rgba(66, 133, 244, 0.1), rgba(156, 39, 176, 0.1))',
            borderRadius: '50%',
            filter: 'blur(40px)',
            animation: 'float1 8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            width: 150,
            height: 150,
            background:
              'linear-gradient(45deg, rgba(255, 87, 34, 0.1), rgba(255, 193, 7, 0.1))',
            borderRadius: '50%',
            filter: 'blur(30px)',
            animation: 'float2 6s ease-in-out infinite reverse',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            right: '30%',
            width: 100,
            height: 100,
            background:
              'linear-gradient(45deg, rgba(76, 175, 80, 0.1), rgba(0, 188, 212, 0.1))',
            borderRadius: '50%',
            filter: 'blur(25px)',
            animation: 'float3 10s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            width: 120,
            height: 120,
            background:
              'linear-gradient(45deg, rgba(233, 30, 99, 0.1), rgba(103, 58, 183, 0.1))',
            borderRadius: '50%',
            filter: 'blur(35px)',
            animation: 'float4 7s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '80%',
            left: '60%',
            width: 80,
            height: 80,
            background:
              'linear-gradient(45deg, rgba(255, 152, 0, 0.1), rgba(255, 87, 34, 0.1))',
            borderRadius: '50%',
            filter: 'blur(20px)',
            animation: 'float5 9s ease-in-out infinite reverse',
          }}
        />
      </div>

      <Row justify="center" style={{ position: 'relative', zIndex: 1, marginBottom: 40 }}>
        <Col>
          <Button
            type="primary"
            shape="round"
            style={{
              background: '#00203f',
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
              height: 'auto',
              padding: '8px 20px',
              marginBottom: 20,
              boxShadow: '0 4px 15px rgba(66, 133, 244, 0.3)',
            }}
          >
            • Top Specialities •
          </Button>
        </Col>
      </Row>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1400,
          margin: '0 auto',
          marginBottom: 20,
        }}
      >
        <div
          ref={carouselRef}
          style={{
            display: 'flex',
            gap: 50,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            padding: '0px 30px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {specialities.map((spec) => (
            <div key={spec.name} style={{ scrollSnapAlign: 'start' }}>
              <SpecialtyCard spec={spec} />
            </div>
          ))}
        </div>

        <Space
          size={16}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 20,
          }}
        >
          <Button
            icon={<LeftOutlined />}
            onClick={handlePrev}
            disabled={currentIndex === 0}
            shape="circle"
            size="large"
            style={{
              background:
                currentIndex === 0
                  ? 'rgba(226, 232, 240, 0.7)'
                  : 'rgb(19 45 87 / 90%)',
              color: currentIndex === 0 ? '#4a5568' : '#fff',
            }}
          />
          <Button
            icon={<RightOutlined />}
            onClick={handleNext}
            disabled={currentIndex === specialities.length - 1}
            shape="circle"
            size="large"
            style={{
              background:
                currentIndex === specialities.length - 1
                  ? 'rgba(226, 232, 240, 0.7)'
                  : 'rgb(19 45 87 / 90%)',
              color:
                currentIndex === specialities.length - 1 ? '#4a5568' : '#fff',
            }}
          />
        </Space>
      </div>

      <style>
        {`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(30px, -20px) rotate(90deg); }
            50% { transform: translate(-20px, -40px) rotate(180deg); }
            75% { transform: translate(-40px, 20px) rotate(270deg); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-25px, 15px) scale(1.1); }
            66% { transform: translate(20px, -30px) scale(0.9); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            20% { transform: translate(15px, -25px) rotate(72deg) scale(1.2); }
            40% { transform: translate(-30px, -10px) rotate(144deg) scale(0.8); }
            60% { transform: translate(-15px, 25px) rotate(216deg) scale(1.1); }
            80% { transform: translate(25px, 10px) rotate(288deg) scale(0.9); }
          }
          @keyframes float4 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(35px, -35px) rotate(180deg); }
          }
          @keyframes float5 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            25% { transform: translate(-20px, 15px) scale(1.3) rotate(90deg); }
            50% { transform: translate(25px, -20px) scale(0.7) rotate(180deg); }
            75% { transform: translate(-15px, -25px) scale(1.1) rotate(270deg); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateX(-50%) translateY(10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}
      </style>
    </div>

    <FeaturedDocs />
    </>

  );
};

export default TopSpecialities;