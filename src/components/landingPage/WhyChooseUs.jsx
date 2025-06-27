import React from "react";
import { 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Space,
  Grid,
  Card
} from "antd";
import {
  InfoCircleOutlined,
  HeartOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import WhyChooseVydho from "./WhyChooseVydho"; 

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const reasons = [
  {
    icon: <InfoCircleOutlined style={{ fontSize: 20, color: '#F97316' }} />,
    iconBg: '#FEE4DB',
    title: "Follow-Up Care",
    description:
      "We ensure continuity of care through regular follow-ups and communication, helping you stay on track with health goals.",
  },
  {
    icon: <HeartOutlined style={{ fontSize: 20, color: '#7C3AED' }} />,
    iconBg: '#E9E7FD',
    title: "Patient-Centered Approach",
    description:
      "We prioritize your comfort and preferences, tailoring our services to meet your individual needs and care from our experts.",
  },
  {
    icon: <EnvironmentOutlined style={{ fontSize: 20, color: '#06B6D4' }} />,
    iconBg: '#D1F5F9',
    title: "Convenient Access",
    description:
      "Easily book appointments online or through our customer service team, with flexible hours to fit your schedule.",
  },
];

const WhyChooseUs = () => {
  const screens = useBreakpoint();

  const ReasonCard = ({ reason, showBorder }) => (
    <Card
      bordered={false}
      style={{
        height: '100%',
        borderLeft: showBorder && !screens.xs && !screens.sm ? '1px dashed #E5E7EB' : 'none',
        borderRadius: 0,
        boxShadow: 'none',
        background: 'transparent'
      }}
      bodyStyle={{ 
        padding: screens.xs ? '16px 0' : '24px 16px',
        height: '100%'
      }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Space align="center" size={12}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              background: reason.iconBg,
              borderRadius: '50%',
            }}
          >
            {reason.icon}
          </div>
          <Title 
            level={4} 
            style={{ 
              margin: 0,
              color: '#0A2240',
              fontSize: screens.xs ? 18 : 20,
              fontWeight: 700
            }}
          >
            {reason.title}
          </Title>
        </Space>
        <Paragraph
          style={{
            color: '#334155',
            fontSize: 15,
            lineHeight: 1.7,
            margin: 0,
            textAlign: 'left'
          }}
        >
          {reason.description}
        </Paragraph>
      </Space>
    </Card>
  );

  return (
    <>
    <section
      style={{
        background: '#fff',
        padding: '64px 0 0 0',
        borderBottom: '8px solid #0A2240',
        marginTop: -8,
      }}
    >
      <Row justify="center">
        <Col xs={22} sm={20} md={22} lg={20} xl={18}>
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Tag
              style={{
                background: '#00203f',
                color: 'white',
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 20,
                padding: '8px 20px',
                marginBottom: 20,
                border: 'none',
                boxShadow: '0 4px 15px rgba(66, 133, 244, 0.3)',
              }}
            >
              • Why Book With Us •
            </Tag>
            <Title
              level={1}
              style={{
                fontSize: screens.xs ? 28 : screens.sm ? 32 : 40,
                fontWeight: 700,
                color: '#0A2240',
                marginBottom: 0,
                letterSpacing: '-1px',
              }}
            >
              Compelling Reasons to Choose
            </Title>
          </div>

          {/* Reasons Section */}
          <Row 
            gutter={[32, 24]} 
            justify="center"
            align="stretch"
          >
            {reasons.map((reason, idx) => (
              <Col 
                key={reason.title}
                xs={24} 
                sm={24} 
                md={8} 
                lg={8}
                style={{ 
                  display: 'flex',
                  minHeight: 180
                }}
              >
                <ReasonCard 
                  reason={reason} 
                  showBorder={idx !== 0}
                />
              </Col>
            ))}
          </Row>

          {/* Bottom spacing */}
          <div style={{ height: 40 }} />
        </Col>
      </Row>
    </section>
 <WhyChooseVydho />
    </>
  );
};

export default WhyChooseUs;