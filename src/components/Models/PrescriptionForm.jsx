import React, { useState, useEffect } from 'react';
import { Modal, Button, AutoComplete, InputNumber, Table, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { apiGet, apiPost } from '../api';

const PrescriptionForm = ({ selectedPatient, isVisible, onClose }) => {
  const [medicineName, setMedicineName] = useState('');
  const [medicineQuantity, setMedicineQuantity] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [testName, setTestName] = useState('');
  const [tests, setTests] = useState([]);
  const [medInventory, setMedInventory] = useState([]);
  const [testList, setTestList] = useState([]);

  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === 'doctor' ? user?.userId : user?.createdBy;

  const fetchInventory = async () => {
    try {
      const response = await apiGet('/pharmacy/getAllMedicinesByDoctorID');
      setMedInventory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      message.error('Failed to fetch medicine inventory');
    }
  };

  const fetchTests = async () => {
    if (!doctorId) {
      message.error('Doctor ID not available');
      return;
    }
    try {
      const response = await apiGet(`/lab/getTestsByDoctorId/${doctorId}`);
      setTestList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      message.error('Failed to fetch test list');
    }
  };

  useEffect(() => {
    if (user && doctorId) {
      fetchInventory();
      fetchTests();
    }
  }, [user, doctorId]);

  useEffect(() => {
    if (!isVisible) {
      setMedicineName('');
      setMedicineQuantity(null);
      setMedicines([]);
      setTestName('');
      setTests([]);
    }
  }, [isVisible]);

  const handleAddMedicine = () => {
    if (!medicineName.trim() || medicineQuantity === null || medicineQuantity <= 0) {
      message.error('Please enter a valid medicine name and quantity');
      return;
    }
    const selectedMedicine = medInventory.find(med => med.medName === medicineName);
    const newMedicine = {
      id: Date.now(),
      medName: medicineName,
      quantity: medicineQuantity,
      medInventoryId: selectedMedicine ? selectedMedicine._id : null,
    };
    setMedicines([...medicines, newMedicine]);
    setMedicineName('');
    setMedicineQuantity(null);
    message.success('Medicine added successfully');
  };

  const handleRemoveMedicine = (id) => {
    setMedicines(medicines.filter((medicine) => medicine.id !== id));
    message.success('Medicine removed successfully');
  };

  const handleAddTest = () => {
    if (!testName.trim()) {
      message.error('Please enter a valid test name');
      return;
    }
    const selectedTest = testList.find(test => test.testName === testName);
    const newTest = {
      id: Date.now(),
      testName: testName,
      testInventoryId: selectedTest ? selectedTest.id : null,
    };
    setTests([...tests, newTest]);
    setTestName('');
    message.success('Test added successfully');
  };

  const handleRemoveTest = (id) => {
    setTests(tests.filter((test) => test.id !== id));
    message.success('Test removed successfully');
  };

  const handleSubmitPatientProfile = async () => {
    if (!selectedPatient) {
      message.error('No patient selected');
      return;
    }
    try {
      const prescriptionData = {
        patientId: selectedPatient.id,
        medicines,
        tests,
        notes: 'Prescription generated from appointment',
        doctorId: doctorId,
      };
      const response = await apiPost('/pharmacy/addPrescription', prescriptionData);
      console.log('Prescription response:', response);
      if (response?.data?.success === true) {
        message.success(response.data.message || 'Prescription submitted successfully');
        setMedicines([]);
        setTests([]);
        onClose();
      } else {
        message.error(response.data?.message || 'Failed to submit prescription');
      }
    } catch (error) {
      console.error('Error submitting prescription:', error);
      message.error(error.response?.data?.message || 'Failed to submit prescription');
    }
  };

  const medicineColumns = [
    {
      title: 'Medicine Name',
      dataIndex: 'medName',
      key: 'medName',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveMedicine(record.id)}
        />
      ),
    },
  ];

  const testColumns = [
    {
      title: 'Test Name',
      dataIndex: 'testName',
      key: 'testName',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveTest(record.id)}
        />
      ),
    },
  ];

  const medicineOptions = medInventory.map((med) => ({
    value: med.medName,
    label: med.medName,
  }));

  const testOptions = testList.map((test) => ({
    value: test.testName,
    label: test.testName,
  }));

  return (
    <Modal
      title="Patient Profile"
      open={isVisible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmitPatientProfile}>
          Submit
        </Button>,
      ]}
    >
      {selectedPatient ? (
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
              Patient Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <strong>Patient ID:</strong> {selectedPatient.userId || 'N/A'}
              </div>
              <div>
                <strong>Name:</strong> {selectedPatient.name || 'N/A'}
              </div>
              <div>
                <strong>Gender:</strong> {selectedPatient.gender || 'N/A'}
              </div>
              <div>
                <strong>Age:</strong> {selectedPatient.age || 'N/A'}
              </div>
              <div>
                <strong>Phone:</strong> {selectedPatient.phone || 'N/A'}
              </div>
              <div>
                <strong>Last Visit:</strong> {selectedPatient.lastVisit || 'N/A'}
              </div>
              <div>
                <strong>Department:</strong> {selectedPatient.department || 'N/A'}
              </div>
              <div>
                <strong>Status:</strong> {selectedPatient.status || 'N/A'}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
              Add Medicine
            </h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
              <AutoComplete
                options={medicineOptions}
                style={{ flex: 1 }}
                onSelect={(value) => setMedicineName(value)}
                onChange={(value) => setMedicineName(value)}
                value={medicineName}
                placeholder="Enter or search medicine name"
                filterOption={(input, option) =>
                  option.label?.toLowerCase().includes(input.toLowerCase())
                }
                allowClear
              />
              <InputNumber
                placeholder="Quantity"
                value={medicineQuantity}
                onChange={(value) => setMedicineQuantity(value)}
                style={{ flex: 1 }}
                min={1}
                parser={(value) => value.replace(/\D/g, '')}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMedicine}>
                Add
              </Button>
            </div>

            {medicines.length > 0 && (
              <Table
                dataSource={medicines}
                columns={medicineColumns}
                rowKey="id"
                pagination={false}
                size="small"
                style={{ marginTop: '16px' }}
              />
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '20px', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>
              Add Test
            </h3>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
              <AutoComplete
                options={testOptions}
                style={{ flex: 1 }}
                onSelect={(value) => setTestName(value)}
                onChange={(value) => setTestName(value)}
                value={testName}
                placeholder="Enter or search test name"
                filterOption={(input, option) =>
                  option.label?.toLowerCase().includes(input.toLowerCase())
                }
                allowClear
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTest}>
                Add
              </Button>
            </div>

            {tests.length > 0 && (
              <Table
                dataSource={tests}
                columns={testColumns}
                rowKey="id"
                pagination={false}
                size="small"
                style={{ marginTop: '16px' }}
              />
            )}
          </div>
        </div>
      ) : (
        <div>No patient selected</div>
      )}
    </Modal>
  );
};

export default PrescriptionForm;