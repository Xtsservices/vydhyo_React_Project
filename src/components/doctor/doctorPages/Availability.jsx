import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Button,
  InputNumber,
  Row,
  Col,
  Tag,
  Typography,
  Space,
  Divider,
  Input
} from 'antd';
import {
  DownOutlined,
  UpOutlined,
  ClockCircleOutlined,
  StopOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const AvailabilityScreen = () => {
  const [selectedClinic, setSelectedClinic] = useState('Clinic Availability');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [startTime, setStartTime] = useState(9);
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endTime, setEndTime] = useState(11);
  const [endPeriod, setEndPeriod] = useState('AM');
  const [duration, setDuration] = useState(30);
  const [appointmentFee, setAppointmentFee] = useState(254);
  const [timeSlots, setTimeSlots] = useState([
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: true },
    { time: '10:00 AM', available: false },
    { time: '10:30 AM', available: false },
    { time: '11:00 AM', available: true }
  ]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = startPeriod === 'PM' && startTime !== 12 ? startTime + 12 : startTime;
    const endHour = endPeriod === 'PM' && endTime !== 12 ? endTime + 12 : endTime;
    
    let currentTime = startHour * 60; // Convert to minutes
    const endTimeMinutes = endHour * 60;
    
    while (currentTime < endTimeMinutes) {
      const hour = Math.floor(currentTime / 60);
      const minute = currentTime % 60;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      const timeString = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
      
      slots.push({
        time: timeString,
        available: Math.random() > 0.3 // Random availability for demo
      });
      
      currentTime += duration;
    }
    
    return slots;
  };

  const handleAddSlots = () => {
    const newSlots = generateTimeSlots();
    setTimeSlots(newSlots);
  };

  const handleDeleteAll = () => {
    setTimeSlots([]);
  };

  const toggleSlotAvailability = (index) => {
    const newSlots = [...timeSlots];
    newSlots[index].available = !newSlots[index].available;
    setTimeSlots(newSlots);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={3} style={{ marginBottom: '24px', color: '#1f2937' }}>
          Available Timings
        </Title>

        {/* Clinic Selection */}
        <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
          <Select
            value={selectedClinic}
            onChange={setSelectedClinic}
            style={{ width: '250px' }}
            suffixIcon={<DownOutlined />}
          >
            <Option value="Clinic Availability">Clinic Availability</Option>
            <Option value="Video Availability">Video Availability</Option>
            <Option value="Home Visit">Home Visit</Option>
          </Select>
        </Card>

        {/* Main Content */}
        <Card 
          title="Select Available Slots" 
          style={{ borderRadius: '12px' }}
          bodyStyle={{ padding: '32px' }}
        >
          {/* Day Selection */}
          <div style={{ marginBottom: '32px' }}>
            <Text strong style={{ display: 'block', marginBottom: '16px', fontSize: '16px' }}>
              Select Available days
            </Text>
            <Row gutter={[8, 8]}>
              {days.map(day => (
                <Col key={day}>
                  <Button
                    type={selectedDay === day ? 'primary' : 'default'}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      borderRadius: '20px',
                      minWidth: '80px',
                      height: '36px'
                    }}
                  >
                    {day}
                  </Button>
                </Col>
              ))}
            </Row>
          </div>

          <Divider />

          {/* Time Configuration */}
          <Row gutter={[24, 24]} align="middle" style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={6}>
              <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                {selectedDay}
              </Title>
            </Col>

            {/* Start Time */}
            <Col xs={12} sm={4}>
              <Text strong>Start Time :</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                <InputNumber
                  min={1}
                  max={12}
                  value={startTime}
                  onChange={setStartTime}
                  style={{ width: '70px', marginRight: '8px' }}
                />
                <div>
                  {/* <Button
                    size="small"
                    icon={<UpOutlined />}
                    // onClick={() => setStartPeriod(startPeriod === 'AM' ? 'PM' : 'AM')}
                    style={{ display: 'block', marginBottom: '2px', width: '40px' }}
                  /> */}
                  <Button
                    size="small"
                    icon={<FieldTimeOutlined />}
                    onClick={() => setStartPeriod(startPeriod === 'AM' ? 'PM' : 'AM')}
                    style={{ display: 'block', width: '40px' }}
                  />
                </div>
                <Text style={{ marginLeft: '8px', fontWeight: 'bold' }}>{startPeriod}</Text>
              </div>
            </Col>

            {/* End Time */}
            <Col xs={12} sm={4}>
              <Text strong>End Time :</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                <InputNumber
                  min={1}
                  max={12}
                  value={endTime}
                  onChange={setEndTime}
                  style={{ width: '70px', marginRight: '8px' }}
                />
                <div>
                  {/* <Button
                    size="small"
                    icon={<UpOutlined />}
                    onClick={() => setEndPeriod(endPeriod === 'AM' ? 'PM' : 'AM')}
                    style={{ display: 'block', marginBottom: '2px', width: '40px' }}
                  /> */}
                  <Button
                    size="small"
                    icon={<FieldTimeOutlined />}
                    onClick={() => setEndPeriod(endPeriod === 'AM' ? 'PM' : 'AM')}
                    style={{ display: 'block', width: '40px' }}
                  />
                </div>
                <Text style={{ marginLeft: '8px', fontWeight: 'bold' }}>{endPeriod}</Text>
              </div>
            </Col>

            {/* Duration */}
            <Col xs={12} sm={4}>
              <Text strong>Duration :</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                <InputNumber
                  min={15}
                  max={120}
                  step={15}
                  value={duration}
                  onChange={setDuration}
                  style={{ width: '70px', marginRight: '8px' }}
                />
                <div>
                  <Button
                    size="small"
                    icon={<UpOutlined />}
                    onClick={() => setDuration(prev => Math.min(120, prev + 15))}
                    style={{ display: 'block', marginBottom: '2px', width: '40px' }}
                  />
                  <Button
                    size="small"
                    icon={<DownOutlined />}
                    onClick={() => setDuration(prev => Math.max(15, prev - 15))}
                    style={{ display: 'block', width: '40px' }}
                  />
                </div>
              </div>
            </Col>

            {/* Action Buttons */}
            <Col xs={12} sm={6}>
              <Space>
                <Button 
                  type="link" 
                  onClick={handleAddSlots}
                  style={{ color: '#1890ff', fontWeight: 'bold' }}
                >
                  Add Slots
                </Button>
                <Button 
                  type="link" 
                  danger 
                  onClick={handleDeleteAll}
                  style={{ fontWeight: 'bold' }}
                >
                  Delete All
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Legend */}
          <div style={{ marginBottom: '24px' }}>
            <Space>
              <Tag color="#16A34A" icon={<ClockCircleOutlined />}>
                Availability
              </Tag>
              <Tag color="#FF3B30" icon={<StopOutlined />}>
                Unavailability
              </Tag>
            </Space>
          </div>

          {/* Time Slots */}
          <Row gutter={[12, 12]} style={{ marginBottom: '32px' }}>
            {timeSlots.map((slot, index) => (
              <Col key={index} xs={12} sm={8} md={6} lg={4}>
                <Button
                  block
                  onClick={() => toggleSlotAvailability(index)}
                  style={{
                    height: '48px',
                    borderRadius: '8px',
                    border: slot.available ? '2px solid #52c41a' : '2px solid #ff4d4f',
                    backgroundColor: slot.available ? '#f6ffed' : '#fff2f0',
                    color: slot.available ? '#52c41a' : '#ff4d4f',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  icon={slot.available ? <ClockCircleOutlined /> : <StopOutlined />}
                >
                  {slot.time}
                </Button>
              </Col>
            ))}
          </Row>

          <Divider />

          {/* Appointment Fee */}
          <Row gutter={[16, 16]} align="middle" justify="space-between">
            <Col xs={24} sm={12}>
              <div>
                <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                  Appointment Fees (₹)
                </Text>
                <Input
                  value={appointmentFee}
                  onChange={(e) => setAppointmentFee(e.target.value)}
                  style={{ width: '150px', fontSize: '18px', fontWeight: 'bold' }}
                  prefix="₹"
                />
              </div>
            </Col>

            {/* Action Buttons */}
            <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
              <Space>
                <Button size="large" style={{ minWidth: '100px' }}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  size="large" 
                  style={{ minWidth: '120px', borderRadius: '8px' }}
                >
                  Save Changes
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default AvailabilityScreen;