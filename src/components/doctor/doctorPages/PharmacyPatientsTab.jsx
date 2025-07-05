import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Pagination,
  Typography
} from 'antd';
import { useSelector } from 'react-redux';

const { Text } = Typography;

const PatientsTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(4);
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const patientData = [
    {
      key: '1',
      patientId: 'P-234512',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      gender: 'Male',
      phone: '+91 98765XXXXX',
      date: '28 June 2025',
      time: '09:00 Am',
      amount: 500,
      status: 'pending'
    },
    {
      key: '2',
      patientId: 'P-234513',
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face',
      gender: 'Female',
      phone: '+91 98765XXXXY',
      date: '25 June 2025',
      time: '10:00 Am',
      amount: 500,
      status: 'pending'
    },
    {
      key: '3',
      patientId: 'P-234514',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      gender: 'Male',
      phone: '+91 98765XXXXZ',
      date: '20 June 2025',
      time: '11:30 Pm',
      amount: 500,
      status: 'pending'
    },
    {
      key: '4',
      patientId: 'P-234515',
      name: 'Emily Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      gender: 'Female',
      phone: '+91 98765XXXXW',
      date: '25 June 2025',
      time: '04:30 Pm',
      amount: 500,
      status: 'pending'
    }
  ];

  const handleAccept = (record) => {
    console.log('Accept patient:', record);
    // Add your accept logic here
  };

  const handleReject = (record) => {
    console.log('Reject patient:', record);
    // Add your reject logic here
  };

  const handleEdit = (record) => {
    console.log('Edit patient:', record);
    // Add your edit logic here
  };

  const columns = [
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 120,
    },
    {
      title: 'Patient',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <div className="patient-info">
          <img 
            src={record.avatar} 
            alt={record.name}
            className="patient-avatar"
          />
          <span className="patient-name">{record.name}</span>
        </div>
      ),
    },
    
    {
      title: 'Action',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <div className="action-buttons">
          <Button 
            className="accept-btn"
            onClick={() => handleEdit(record)}
          >
            View
          </Button>
         
        </div>
      ),
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
      if (doctorId && user) {
        // getAllTestsPatientsByDoctorID();
      }
    }, [user, doctorId]);

  return (
    <>
      <Table 
        columns={columns} 
        dataSource={patientData}
        pagination={false}
        size="middle"
        showHeader={true}
      />
      <div className="pagination-container">
        <span className="pagination-info">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, 97)} of 97 results
        </span>
        <Pagination 
          current={currentPage}
          total={97}
          pageSize={pageSize}
          showSizeChanger={false}
          showQuickJumper={false}
          simple={false}
          onChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default PatientsTab;