import React, { useState, useEffect } from "react";
import { 
  HeartOutlined,
  RightOutlined,
  ThunderboltOutlined,
  AimOutlined,
  TeamOutlined,
  CalendarOutlined,
  CarOutlined,
  HomeOutlined,
  LeftOutlined,
  RightCircleOutlined 
} from "@ant-design/icons";
import { Row, Col, Card, Button, Image, Space, Typography, Grid } from "antd";
import TopSpecialities from "./TopSpecialities";


const { useBreakpoint } = Grid;
const { Title, Text, Paragraph } = Typography;
const LandingPage1 = ({ scrollToSection }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const screens = useBreakpoint();

  const carouselData = [
    {
      id: 1,
      title: "Book Appointments",
      subtitle: "Schedule with Ease",
      description: "Connect with top-rated Indian doctors and specialists instantly. Book appointments 24/7 with our smart scheduling system and get confirmed slots within minutes.",
      features: ["Instant Booking", "Top Doctors", "24/7 Availability", "Smart Scheduling"],
      image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=500&h=500&fit=crop&crop=face",
      icon: <CalendarOutlined style={{ fontSize: '24px' }} />,
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #93c5fd 100%)",
    },
    {
      id: 2,
      title: "Verified Ambulance Services",
      subtitle: "Immediate Medical Attention",
      description: "Fast, reliable emergency medical services with certified Indian doctors. Our emergency network ensures you get immediate medical attention when every second counts.",
      features: ["24/7 Emergency", "Certified Doctors", "Quick Response", "Advanced Care"],
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=500&fit=crop&crop=face",
      icon: <CarOutlined style={{ fontSize: '24px' }} />,
      color: "#ef4444",
      gradient: "linear-gradient(135deg, #ef4444 0%, #fca5a5 100%)",
    },
    {
      id: 3,
      title: "Live Blood Bank Updates",
      subtitle: "Life-Saving Resources",
      description: "Real-time blood availability updates from certified blood banks across India. Find the right blood type when you need it most with our comprehensive network.",
      features: ["Real-time Updates", "Multiple Blood Banks", "Emergency Access", "Verified Sources"],
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500&h=500&fit=crop&crop=face",
      icon: <CarOutlined style={{ fontSize: '24px' }} />,
      color: "#dc2626",
      gradient: "linear-gradient(135deg, #dc2626 0%, #f87171 100%)",
    },
    {
      id: 4,
      title: "Certified Home Healthcare",
      subtitle: "Care at Your Doorstep",
      description: "Professional healthcare services delivered to your home by certified medical professionals. Get quality care without leaving the comfort of your home.",
      features: ["Home Visits", "Certified Staff", "Convenient Care", "Professional Service"],
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=500&h=500&fit=crop&crop=face",
      icon: <HomeOutlined style={{ fontSize: '24px' }} />,
      color: "#059669",
      gradient: "linear-gradient(135deg, #059669 0%, #6ee7b7 100%)",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselData.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '24px',
    color: 'white',
    transition: 'all 0.5s ease',
    opacity: 0,
    transform: 'translateX(100px)',
    position: 'absolute',
    width: '100%',
    boxSizing: 'border-box',
  };

  const activeCardStyle = {
    opacity: 1,
    transform: 'translateX(0)',
    position: 'relative',
  };

  const iconStyle = {
    padding: '12px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
  };

  const featureStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '8px 12px',
    borderRadius: '12px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  };

  const navButtonStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    transition: 'all 0.3s ease',
  };

  const dotStyle = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const activeDotStyle = {
    background: '#3b82f6',
    transform: 'scale(1.2)',
  };

  return (
    <>

    <section id="home" style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#00203f',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
        linear-gradient(45deg, transparent 49%, rgba(255, 255, 255, 0.02) 50%, transparent 51%)
      `,
      backgroundSize: '100px 100px, 150px 150px, 20px 20px',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '1400px',
        margin: '0 auto',
        padding: screens.xs ? '1rem' : '2rem',
        width: '100%',
      }}>
        <Row gutter={[48, 48]} align="middle" justify="center">
          {!screens.md ? null : (
            <Col xs={24} md={12} style={{ display: 'flex', justifyContent: 'center' }}>
              <Image
                src="https://media.istockphoto.com/id/1960028378/photo/female-nurse-consoling-old-man-at-home.jpg?s=612x612&w=0&k=20&c=tq-D9prBtWc7F5cM_VZFFn4ekRhdXpYaW2Dcgcd8Nfg="
                alt="Indian Doctor"
                style={{
                  width: screens.lg ? '400px' : screens.md ? '300px' : '250px',
                  height: screens.lg ? '500px' : screens.md ? '400px' : '320px',
                  borderRadius: '24px',
                  objectFit: 'cover',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                }}
                preview={false}
              />
            </Col>
          )}

          <Col xs={24} md={12}>
            <div style={{ position: 'relative', minHeight: '400px' }}>
              {carouselData.map((card, index) => (
                <Card
                  key={card.id}
                  style={{
                    ...cardStyle,
                    ...(index === currentSlide ? activeCardStyle : {}),
                    padding: screens.xs ? '24px' : '32px',
                  }}
                  bodyStyle={{ padding: 0 }}
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Space align="center">
                      <div style={{ ...iconStyle, background: card.gradient }}>
                        {card.icon}
                      </div>
                      <div>
                        <Title level={3} style={{ color: 'white', marginBottom: 4 }}>{card.title}</Title>
                        <Text type="secondary" style={{ color: '#e2e8f0' }}>{card.subtitle}</Text>
                      </div>
                    </Space>

                    <Paragraph style={{ color: '#f1f5f9' }}>{card.description}</Paragraph>

                    <Row gutter={[8, 8]}>
                      {card.features.map((feature, featureIndex) => (
                        <Col key={featureIndex} xs={24} sm={12}>
                          <div style={featureStyle}>
                            <Text style={{ color: 'white' }}>{feature}</Text>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Space>
                </Card>
              ))}

              <Space style={{ marginTop: '32px', justifyContent: 'center', width: '100%' }}>
                <Button
                  type="text"
                  shape="circle"
                  icon={<LeftOutlined />}
                  size="large"
                  style={navButtonStyle}
                  onClick={prevSlide}
                />
                
                <Space style={{ margin: '0 16px' }}>
                  {carouselData.map((_, index) => (
                    <div
                      key={index}
                      style={index === currentSlide ? { ...dotStyle, ...activeDotStyle } : dotStyle}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </Space>
                
                <Button
                  type="text"
                  shape="circle"
                  icon={<RightOutlined />}
                  size="large"
                  style={navButtonStyle}
                  onClick={nextSlide}
                />
              </Space>
            </div>
          </Col>
        </Row>
      </div>
    </section>

    <TopSpecialities />

    </>
  );
};



export default LandingPage1;