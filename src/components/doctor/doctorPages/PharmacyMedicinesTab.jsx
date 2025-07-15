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
  message,
  Spin,
  Empty
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { apiGet } from "../../api";

const { Text } = Typography;

const MedicinesTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [form, setForm] = useState({
    medName: '',
    quantity: '',
    price: ''
  });

  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === "doctor" ? user?.userId : user?.createdBy;

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/pharmacy/getAllMedicinesByDoctorID', {
        params: { doctorId: doctorId }
      });
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response dataaaa:', response.data.data);

      let dataArray = [];
      console.log(response.data, "medicines API response");
      
      if (response?.data.success && response?.data?.data) {
        if (Array.isArray(response.data.data)) {
          dataArray = response.data.data;
        }
      }

      console.log('Processed medicines data array:', dataArray);
      
      if (dataArray.length > 0) {
        const formattedData = dataArray.map((medicine, index) => {
          console.log('Processing medicine:', medicine);
          
          return {
            key: medicine._id || `medicine-${index}`,
            id: medicine._id || `MED-${index}`,
            medName: medicine.medName || 'Unknown Medicine',
            quantity: medicine.quantity || 0,
            price: parseFloat(medicine.price) || 0,
            category: medicine.category || 'N/A',
            expiryDate: medicine.expiryDate || 'N/A',
            manufacturer: medicine.manufacturer || 'N/A',
            doctorId: medicine.doctorId || 'N/A',
            createdAt: medicine.createdAt || 'N/A',
            originalData: medicine
          };
        });
        
        console.log('Formatted Medicines Data:', formattedData);
        
        setMedicines(formattedData);
        setTotalMedicines(formattedData.length);
      } else {
        console.log('No medicines found or empty data array');
        setMedicines([]);
        setTotalMedicines(0);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      message.error(error.response?.data?.message || 'Error fetching medicines');
      setMedicines([]);
      setTotalMedicines(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchMedicines();
    } else {
      console.log('No doctorId found, user:', user);
    }
  }, [doctorId]);

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
        // Add delete logic here - you might want to call a delete API
        setMedicines(medicines.filter(med => med.key !== record.key));
        setTotalMedicines(prev => prev - 1);
        message.success('Medicine deleted successfully');
      }
    });
  };

  const handleUpdateMedicine = () => {
    if (!form.medName || !form.quantity || !form.price) {
      message.error('Please fill all required fields');
      return;
    }

    // Add update API call here if needed
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
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      render: (price) => `₹${price.toFixed(2)}`,
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate current page data
  const currentPageData = medicines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startIndex = totalMedicines > 0 ? ((currentPage - 1) * pageSize) + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalMedicines);

  return (
    <div style={{ padding: '20px' }}>
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={currentPageData}
          pagination={false}
          size="middle"
          showHeader={true}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: <Empty description={loading ? 'Loading...' : 'No medicines in inventory'} />
          }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ lineHeight: '32px' }}>
            {totalMedicines > 0 
              ? `Showing ${startIndex} to ${endIndex} of ${totalMedicines} results`
              : 'No results found'
            }
          </span>
          {totalMedicines > pageSize && (
            <Pagination 
              current={currentPage}
              total={totalMedicines}
              pageSize={pageSize}
              showSizeChanger={false}
              showQuickJumper={false}
              onChange={handlePageChange}
            />
          )}
        </div>
      </Spin>

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
    </div>
  );
};

export default MedicinesTab;