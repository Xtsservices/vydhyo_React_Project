import React from "react";
import { Row, Col, Card, Typography, Button, Tag, Space } from "antd";
import { RightOutlined } from "@ant-design/icons";
import Footer from "./Footer"; 
const { Title, Text } = Typography;

const blogs = [
  {
    id: 1,
    date: { day: "15", month: "May" },
    category: "Home Care",
    title: "Essential Home Care Services for Elderly Patients",
    desc: "Comprehensive guide to providing quality home care for seniors, including medication management and daily living assistance...",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
  },
  {
    id: 2,
    date: { day: "18", month: "May" },
    category: "Physiotherapy",
    title: "Post-Surgery Rehabilitation: Key Exercises for Recovery",
    desc: "Expert physiotherapy techniques and exercises to help patients recover faster from surgical procedures...",
    image: "https://media.istockphoto.com/id/165419099/photo/close-up-of-a-doctor-in-scrubs-with-stethoscope.webp?a=1&b=1&s=612x612&w=0&k=20&c=6OXLAK7eBH_AP4aY8XSenpfS2VrwbtYCnP7jc1ZpuGE=",
  },
  {
    id: 3,
    date: { day: "21", month: "Apr" },
    category: "Blood Bank",
    title: "Blood Donation: Safety Guidelines and Health Benefits",
    desc: "Understanding the importance of blood donation, safety protocols, and how it benefits both donors and recipients...",
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
  },
  {
    id: 4,
    date: { day: "22", month: "Jan" },
    category: "Elder Care",
    title: "Managing Chronic Conditions in Senior Citizens",
    desc: "Professional strategies for managing diabetes, hypertension, and other chronic conditions in elderly patients...",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
  },
  {
    id: 5,
    date: { day: "10", month: "Mar" },
    category: "Skilled Nursing",
    title: "Advanced Wound Care Techniques for Home Patients",
    desc: "Professional wound care management, infection prevention, and healing protocols for home healthcare settings...",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
  },
  {
    id: 6,
    date: { day: "05", month: "Feb" },
    category: "Post-Surgery Care",
    title: "Home Recovery After Major Surgery: A Complete Guide",
    desc: "Essential post-operative care tips, pain management, and recovery milestones for patients recovering at home...",
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80",
  },
];

const categoryColors = {
  "Home Care": "blue",
  "Physiotherapy": "green",
  "Blood Bank": "red",
  "Elder Care": "purple",
  "Skilled Nursing": "geekblue",
  "Post-Surgery Care": "orange",
};

const Blogs = () => {
  return (
    <>
    <div style={{ background: "#fff", padding: "48px 24px" }}>
      <Row justify="center" style={{ marginBottom: 24 }}>
        <Col>
          <Tag color="blue" style={{ fontSize: 14, padding: "4px 16px" }}>
            Vydhyo Healthcare Services
          </Tag>
        </Col>
      </Row>
      
      <Row justify="center" style={{ marginBottom: 48 }}>
        <Col>
          <Title level={3} style={{ textAlign: "center", color: "#1a1a1a" }}>
            Comprehensive healthcare services at your fingertips
          </Title>
        </Col>
      </Row>

      <Row gutter={[32, 32]} justify="center" style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Left Column */}
        <Col xs={24} md={12}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            {blogs.filter((_, i) => i % 2 === 0).map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </Space>
        </Col>

        {/* Right Column */}
        <Col xs={24} md={12}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            {blogs.filter((_, i) => i % 2 === 1).map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </Space>
        </Col>
      </Row>

      <Row justify="center" style={{ marginTop: 48 }}>
        <Col>
          <Button 
            type="primary" 
            size="large"
            style={{ 
              background: "#00203f",
              padding: "0 32px",
              height: 48,
              borderRadius: 24
            }}
          >
            View All Articles
            <RightOutlined />
          </Button>
        </Col>
      </Row>
    </div>
<Footer />

    </>
  );
};

const BlogCard = ({ blog }) => {
  return (
    <>
    <Card
      hoverable
      style={{ 
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Row gutter={0}>
        <Col xs={24} sm={10}>
          <div style={{ position: "relative", height: 200 }}>
            <img
              src={blog.image}
              alt={blog.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
            <Card
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                padding: "0px 0px",
                borderRadius: 100,
                textAlign: "center",
                // width: 60
              }}
            >
              <Text strong style={{ color: "#1890ff", fontSize: 18, lineHeight: 1 }}>
                {blog.date.day}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {blog.date.month}
              </Text>
            </Card>
          </div>
        </Col>
        <Col xs={24} sm={14}>
          <div style={{ padding: 24 }}>
            <Tag color={categoryColors[blog.category]} style={{ marginBottom: 12 }}>
              {blog.category}
            </Tag>
            <Title level={4} style={{ marginBottom: 8 }}>
              {blog.title}
            </Title>
            <Text type="secondary">{blog.desc}</Text>
          </div>
        </Col>
      </Row>
    </Card>
    </>
  );
};

export default Blogs;