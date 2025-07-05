import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Pagination,
  Typography,
  Modal,
  Input,
  InputNumber,
  Space,
  message
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;

const MedicinesTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [form, setForm] = useState({
    medName: '',
    quantity: '',
    price: ''
  });

  // Sample medicine data - replace with actual API call
  const sampleMedicines = [
    {
      key: '1',
      id: 'MED-001',
      medName: 'Paracetamol',
      quantity: 100,
      price: 5.50,
      category: 'Pain Relief',
      expiryDate: '2025-12-31',
      manufacturer: 'PharmaCorp'
    },
    {
      key: '2',
      id: 'MED-002',
      medName: 'Amoxicillin',
      quantity: 50,
      price: 12.75,
      category: 'Antibiotic',
      expiryDate: '2025-10-15',
      manufacturer: 'MediLabs'
    },
    {
      key: '3',
      id: 'MED-003',
      medName: 'Ibuprofen',
      quantity: 75,
      price: 8.25,
      category: 'Pain Relief',
      expiryDate: '2025-11-20',
      manufacturer: 'HealthCare Inc'
    },
    {
      key: '4',
      id: 'MED-004',
      medName: 'Cetirizine',
      quantity: 30,
      price: 15.00,
      category: 'Antihistamine',
      expiryDate: '2025-09-30',
      manufacturer: 'AllergyFree'
    },
    {
      key: '5',
      id: 'MED-005',
      medName: 'Metformin',
      quantity: 25,
      price: 18.50,
      category: 'Diabetes',
      expiryDate: '2025-08-25',
      manufacturer: 'DiabetesControl'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setMedicines(sampleMedicines);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEdit = (record) => {
    setEditingMedicine(record);
    setForm({
      medName: record.medName,
      quantity: record.quantity,
      price: record.price
    });
    setEditModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Delete Medicine',
      content: `Are you sure you want to delete ${record.medName}?`,
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        // Add delete logic here
        setMedicines(medicines.filter(med => med.key !== record.key));
        message.success('Medicine deleted successfully');
      }
    });
  };

  const handleUpdateMedicine = () => {
    if (!form.medName || !form.quantity || !form.price) {
      message.error('Please fill all required fields');
      return;
    }

    const updatedMedicines = medicines.map(med => 
      med.key === editingMedicine.key 
        ? { ...med, medName: form.medName, quantity: form.quantity, price: form.price }
        : med
    );
    
    setMedicines(updatedMedicines);
    setEditModalVisible(false);
    setEditingMedicine(null);
    setForm({ medName: '', quantity: '', price: '' });
    message.success('Medicine updated successfully');
  };

  const handleCancel = () => {
    setEditModalVisible(false);
    setEditingMedicine(null);
    setForm({ medName: '', quantity: '', price: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleNumberChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const columns = [
    {
      title: 'Medicine ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Medicine Name',
      dataIndex: 'medName',
      key: 'medName',
      width: 150,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity) => (
        <span className={quantity < 20 ? 'low-stock' : 'normal-stock'}>
          {quantity}
        </span>
      ),
    },
    
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            size="small"
            danger
          />
        </Space>
      ),
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedData = medicines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (medicines.length === 0 && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Text type="secondary">No medicines in inventory</Text>
      </div>
    );
  }

  return (
    <>
      <Table 
        columns={columns} 
        dataSource={paginatedData}
        pagination={false}
        size="middle"
        showHeader={true}
        loading={loading}
      />
      
      {medicines.length > 0 && (
        <div className="pagination-container">
          <span className="pagination-info">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, medicines.length)} of {medicines.length} results
          </span>
          <Pagination 
            current={currentPage}
            total={medicines.length}
            pageSize={pageSize}
            showSizeChanger={false}
            showQuickJumper={false}
            simple={false}
            onChange={handlePageChange}
          />
        </div>
      )}

      {/* Edit Medicine Modal */}
      <Modal
        title="Edit Medicine"
        open={editModalVisible}
        onOk={handleUpdateMedicine}
        onCancel={handleCancel}
        okText="Update"
        cancelText="Cancel"
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Medicine Name</label>
            <Input
              name="medName"
              value={form.medName}
              onChange={handleInputChange}
              placeholder="Enter medicine name"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Quantity</label>
            <InputNumber
              name="quantity"
              value={form.quantity}
              onChange={(value) => handleNumberChange('quantity', value)}
              min={0}
              placeholder="Enter quantity"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Price (₹)</label>
            <InputNumber
              name="price"
              value={form.price}
              onChange={(value) => handleNumberChange('price', value)}
              min={0}
              step={0.01}
              placeholder="Enter price"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .low-stock {
          color: #ff4d4f;
          font-weight: bold;
        }
        .normal-stock {
          color: #52c41a;
          font-weight: bold;
        }
        .expiry-warning {
          color: #ff4d4f;
          font-weight: bold;
        }
        .expiry-normal {
          color: #595959;
        }
      `}</style>
    </>
  );
};

export default MedicinesTab;