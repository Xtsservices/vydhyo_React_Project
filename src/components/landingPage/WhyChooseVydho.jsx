import React, { useState, useEffect } from "react";
import { Row, Col, Card, Typography, Space, Button, Grid } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import PrivacyPolicy from "./PrivacyPolicy"; 

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const features = [
  {
    icon: <CalendarOutlined />,
    title: "Real-time bookings & instant confirmation",
    description:
      "Schedule appointments with verified healthcare providers and receive immediate confirmation, saving precious time.",
    iconBgColor: "#8b5cf6",
    iconColor: "white",
  },
  {
    icon: <MedicineBoxOutlined />,
    title: "Local verified doctors & providers you can trust",
    description:
      "Every healthcare professional on our platform undergoes thorough verification for your peace of mind.",
    iconBgColor: "#10b981",
    iconColor: "white",
  },
  {
    icon: <TeamOutlined />,
    title: "Vernacular language support",
    description:
      "Navigate healthcare in your preferred language, making quality care accessible to everyone.",
    iconBgColor: "#22d3ee",
    iconColor: "white",
  },
  {
    icon: <LineChartOutlined />,
    title: "Integrated services & seamless payments",
    description:
      "Access multiple healthcare needs through one platform with hassle-free payment options.",
    iconBgColor: "#f97316",
    iconColor: "white",
  },
];

const ChooseUsSection = () => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [currentFlipIndex, setCurrentFlipIndex] = useState(0);
  const [counterValues, setCounterValues] = useState({
    hospitals: 0,
    doctors: 0,
  });
  const [isInView, setIsInView] = useState(false);
  
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setCurrentFlipIndex((prev) => (prev + 1) % features.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isInView]);

  useEffect(() => {
    if (!isInView) {
      setCounterValues({ hospitals: 0, doctors: 0 });
      return;
    }

    const targetValues = {
      hospitals: 50,
      doctors: 100,
    };

    const startCounters = () => {
      const duration = 3000;
      const startTime = Date.now();
      const endTime = startTime + duration;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = 1 - Math.pow(1 - progress, 3);

        setCounterValues({
          hospitals: Math.floor(easedProgress * targetValues.hospitals),
          doctors: Math.floor(easedProgress * targetValues.doctors),
        });

        if (now < endTime) {
          requestAnimationFrame(animate);
        } else {
          setCounterValues(targetValues);
          setTimeout(() => {
            setCounterValues({ hospitals: 0, doctors: 0 });
            setTimeout(startCounters, 500);
          }, 3000);
        }
      };

      requestAnimationFrame(animate);
    };

    startCounters();
  }, [isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.42, 0, 0.58, 1],
      },
    },
  };

  const flipVariants = {
    front: {
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    back: {
      rotateY: 180,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const contentVariants = {
    front: { opacity: 1 },
    back: { opacity: 0 },
  };

  const backContentVariants = {
    front: { opacity: 0 },
    back: { opacity: 1 },
  };

  return (
    <>
    <div
      style={{
        backgroundColor: "#0a132d",
        padding: "6rem 1rem",
        backgroundImage:
          "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true, margin: "-100px" }}
        onViewportEnter={() => setIsInView(true)}
        onViewportLeave={() => setIsInView(false)}
      >
        <Row 
          gutter={[40, 40]} 
          justify="center" 
          align="top"
          style={{ maxWidth: 1200, margin: "0 auto" }}
        >
          {/* Left Content */}
          <Col xs={24} lg={11}>
            <motion.div variants={itemVariants}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 9999,
                  padding: "8px 20px",
                  border: "2px solid #8b5cf6",
                  backgroundColor: "white",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#4b5563",
                  marginBottom: 16,
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <CalendarOutlined style={{ color: "#8b5cf6" }} />
                <span>Why Choose Vydhyo</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Title
                level={1}
                style={{
                  fontWeight: 800,
                  margin: "16px 0 24px",
                  color: "white",
                  lineHeight: 1.2,
                  fontSize: isMobile ? "2rem" : "2.5rem",
                }}
              >
                Trusted By Healthcare Providers
              </Title>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Paragraph
                style={{
                  fontSize: "1.125rem",
                  color: "#a1a9bb",
                  lineHeight: 1.6,
                  marginBottom: "1.5rem",
                  maxWidth: isMobile ? "100%" : "440px",
                }}
              >
                Vydhyo is a comprehensive doctor appointment and clinic management
                platform designed to streamline your practice, enhance patient
                experience, and boost operational efficiency.
              </Paragraph>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
                <Col xs={24} sm={8}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      style={{
                        textAlign: "center",
                        backgroundColor: "rgba(30, 58, 138, 0.2)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        minHeight: "160px",
                      }}
                      bodyStyle={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "2rem",
                          fontWeight: 700,
                          color: "#3b82f6",
                          display: "block",
                        }}
                      >
                        {counterValues.hospitals}
                        <span style={{ color: "#f43f5e", marginLeft: 4 }}>+</span>
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#cbd5e1",
                          fontWeight: 500,
                          display: "block",
                          marginTop: 8,
                        }}
                      >
                        Partner Hospitals
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          lineHeight: 1.4,
                          marginTop: 4,
                        }}
                      >
                        Leading healthcare institutions across multiple cities
                      </Text>
                    </Card>
                  </motion.div>
                </Col>
                
                <Col xs={24} sm={8}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      style={{
                        textAlign: "center",
                        backgroundColor: "rgba(30, 58, 138, 0.2)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        minHeight: "160px",
                      }}
                      bodyStyle={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "2rem",
                          fontWeight: 700,
                          color: "#3b82f6",
                          display: "block",
                        }}
                      >
                        {counterValues.doctors}
                        <span style={{ color: "#f43f5e", marginLeft: 4 }}>+</span>
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#cbd5e1",
                          fontWeight: 500,
                          display: "block",
                          marginTop: 8,
                        }}
                      >
                        Verified Doctors
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          lineHeight: 1.4,
                          marginTop: 4,
                        }}
                      >
                        Specialists across numerous medical fields
                      </Text>
                    </Card>
                  </motion.div>
                </Col>
                
                <Col xs={24} sm={8}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card
                      style={{
                        textAlign: "center",
                        backgroundColor: "rgba(30, 58, 138, 0.2)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        minHeight: "160px",
                      }}
                      bodyStyle={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "2rem",
                          fontWeight: 700,
                          color: "#3b82f6",
                          display: "block",
                        }}
                      >
                        24/7
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#cbd5e1",
                          fontWeight: 500,
                          display: "block",
                          marginTop: 8,
                        }}
                      >
                        Support Available
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          lineHeight: 1.4,
                          marginTop: 4,
                        }}
                      >
                        Round-the-clock assistance for all users
                      </Text>
                    </Card>
                  </motion.div>
                </Col>
              </Row>
            </motion.div>
          </Col>

          {/* Right Content - Feature Cards */}
          <Col xs={24} lg={13}>
            <Row gutter={[24, 24]}>
              {features.map((feature, index) => {
                const isHovered = hoverIndex === index;
                const isFlipping = currentFlipIndex === index && isInView;

                return (
                  <Col xs={24} sm={12} key={index}>
                    <motion.div
                      style={{
                        position: "relative",
                        height: "240px",
                        perspective: "1000px",
                      }}
                      onMouseEnter={() => setHoverIndex(index)}
                      onMouseLeave={() => setHoverIndex(null)}
                      variants={itemVariants}
                      transition={{
                        delay: 0.2 + index * 0.1,
                        duration: 0.8,
                        ease: [0.16, 0.77, 0.47, 0.97],
                      }}
                      whileHover={{ y: -5 }}
                    >
                      {/* Background gradient animation */}
                      <motion.div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background:
                            "linear-gradient(to top, #0ea5e9 0%, #3b82f6 100%)",
                          borderRadius: 12,
                          zIndex: 1,
                        }}
                        animate={{
                          height: isHovered ? "100%" : 0,
                        }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      />

                      {/* Card with flip animation */}
                      <motion.div
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          transformStyle: "preserve-3d",
                          zIndex: 2,
                        }}
                        animate={isFlipping ? "back" : "front"}
                        variants={flipVariants}
                      >
                        {/* Front Content */}
                        <motion.div
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                          }}
                          variants={contentVariants}
                          animate={isFlipping ? "back" : "front"}
                        >
                          <Card
                            style={{
                              height: "100%",
                              backgroundColor: "#0f172a",
                              border: "none",
                              borderRadius: 12,
                            }}
                            bodyStyle={{
                              padding: "24px",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <motion.div
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 12,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  marginBottom: 20,
                                }}
                                animate={{
                                  backgroundColor: isHovered
                                    ? "white"
                                    : feature.iconBgColor,
                                }}
                                transition={{ duration: 0.4 }}
                              >
                                {React.cloneElement(feature.icon, {
                                  style: {
                                    color: isHovered ? "#3b82f6" : feature.iconColor,
                                    fontSize: 24,
                                  },
                                })}
                              </motion.div>
                              <Title
                                level={4}
                                style={{
                                  color: isHovered ? "white" : "#cbd5e1",
                                  fontWeight: 700,
                                  fontSize: 18,
                                  marginBottom: 12,
                                  transition: "all 0.3s ease",
                                }}
                              >
                                {feature.title}
                              </Title>
                            </div>
                            <Paragraph
                              style={{
                                color: isHovered ? "white" : "#94a3b8",
                                fontSize: 14,
                                lineHeight: 1.6,
                                marginBottom: 0,
                                transition: "all 0.3s ease",
                              }}
                            >
                              {feature.description}
                            </Paragraph>
                          </Card>
                        </motion.div>

                        {/* Back Content */}
                        <motion.div
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                          }}
                          variants={backContentVariants}
                          animate={isFlipping ? "back" : "front"}
                        >
                          <Card
                            style={{
                              height: "100%",
                              backgroundColor: "#1e293b",
                              border: "none",
                              borderRadius: 12,
                            }}
                            bodyStyle={{
                              padding: "24px",
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                backgroundColor: "#3b82f6",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: 20,
                              }}
                            >
                              {React.cloneElement(feature.icon, {
                                style: {
                                  color: "white",
                                  fontSize: 24,
                                },
                              })}
                            </div>
                            <Title
                              level={4}
                              style={{
                                color: "white",
                                fontWeight: 700,
                                fontSize: 18,
                                marginBottom: 12,
                              }}
                            >
                              {feature.title}
                            </Title>
                            <Paragraph
                              style={{
                                color: "#e2e8f0",
                                fontSize: 14,
                                lineHeight: 1.6,
                                marginBottom: 16,
                              }}
                            >
                              Learn more about this feature
                            </Paragraph>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                type="primary"
                                style={{
                                  background: "linear-gradient(to right, #3b82f6, #1d4ed8)",
                                  border: "none",
                                  fontWeight: 600,
                                }}
                              >
                                Explore
                              </Button>
                            </motion.div>
                          </Card>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
      </motion.div>
    </div>
<PrivacyPolicy />
    </>
  );
};

export default ChooseUsSection;