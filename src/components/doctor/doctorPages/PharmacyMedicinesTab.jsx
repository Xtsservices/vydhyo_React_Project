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

const MedicinesTab = ({ refreshTrigger }) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
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
        params: { 
          doctorId,
          page: pagination.current,
          limit: pagination.pageSize
        }
      });
      
      let dataArray = [];
      if (response?.data?.success && response?.data?.data) {
        dataArray = Array.isArray(response.data.data) ? response.data.data : [];
      }

      if (dataArray.length > 0) {
        const formattedData = dataArray.map((medicine, index) => ({
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
        }));
        
        setMedicines(formattedData);
        setPagination((prev) => ({
          ...prev,
          total: response.data.totalRecords || formattedData.length,
        }));
      } else {
        setMedicines([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      message.error(error.response?.data?.message || 'Error fetching medicines');
      setMedicines([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) fetchMedicines();
  }, [doctorId, refreshTrigger, pagination.current, pagination.pageSize]);

  const handleTableChange = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
    });
  };

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
        setMedicines(medicines.filter(med => med.key !== record.key));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
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
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      render: (price) => `₹${price.toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
            danger
          />
        </Space>
      ),
    },
  ];

  const startIndex = pagination.total > 0 ? ((pagination.current - 1) * pagination.pageSize) + 1 : 0;
  const endIndex = Math.min(pagination.current * pagination.pageSize, pagination.total);

  return (
    <div style={{ padding: '20px' }}>
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={medicines}
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
            {pagination.total > 0 
              ? `Showing ${startIndex} to ${endIndex} of ${pagination.total} results`
              : 'No results found'
            }
          </span>
          {pagination.total > pagination.pageSize && (
            <Pagination 
              current={pagination.current}
              total={pagination.total}
              pageSize={pagination.pageSize}
              showSizeChanger={true}
              pageSizeOptions={['10', '20', '50']}
              showQuickJumper={false}
              onChange={(page, pageSize) => handleTableChange(page, pageSize)}
            />
          )}
        </div>
      </Spin>

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
      `}</style>
    </div>
  );
};

export default MedicinesTab;