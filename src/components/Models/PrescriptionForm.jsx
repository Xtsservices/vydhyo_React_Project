import React, { useState, useEffect } from 'react';
import { Modal, Button, AutoComplete, InputNumber, Table, Select, Input } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { apiGet, apiPost } from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const { Option } = Select;

const PrescriptionForm = ({ selectedPatient, isVisible, onClose }) => {
  const navigate = useNavigate();
  const [medicineName, setMedicineName] = useState('');
  const [medicineQuantity, setMedicineQuantity] = useState(null);
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState(null);
  const [timings, setTimings] = useState([]);
  const [frequency, setFrequency] = useState(null);
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
      toast.error('Failed to fetch medicine inventory');
    }
  };

  const fetchTests = async () => {
    if (!doctorId) {
      toast.error('Doctor ID not available');
      return;
    }
    try {
      const response = await apiGet(`/lab/getTestsByDoctorId/${doctorId}`);
      setTestList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to fetch test list');
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
      setDosage('');
      setDuration(null);
      setTimings([]);
      setFrequency(null);
      setMedicines([]);
      setTestName('');
      setTests([]);
    }
  }, [isVisible]);

  const handleAddMedicine = () => {
    if (!medicineName.trim()) {
      toast.error('Please enter a valid medicine name');
      return;
    }
    if (medicineQuantity === null || medicineQuantity <= 0) {
      toast.error('Please enter a valid quantity greater than 0');
      return;
    }
    if (!dosage.trim()) {
      toast.error('Please enter a valid dosage (e.g., 1-0-1)');
      return;
    }
    if (duration === null || duration <= 0) {
      toast.error('Please enter a valid duration greater than 0 days');
      return;
    }
    if (!frequency || frequency <= 0) {
      toast.error('Please enter a valid frequency greater than 0');
      return;
    }
    if (timings.length !== frequency) {
      toast.error(`Please select exactly ${frequency} timing${frequency > 1 ? 's' : ''} to match the frequency`);
      return;
    }
    
    const selectedMedicine = medInventory.find(med => med.medName === medicineName);
    const newMedicine = {
      medName: medicineName,
      quantity: medicineQuantity,
      dosage,
      duration,
      timings: timings.join(', '),
      frequency,
      medInventoryId: selectedMedicine ? selectedMedicine._id : null,
    };
    setMedicines([...medicines, newMedicine]);
    setMedicineName('');
    setMedicineQuantity(null);
    setDosage('');
    setDuration(null);
    setTimings([]);
    setFrequency(null);
    // toast.success('Medicine added successfully');
  };

  const handleRemoveMedicine = (id) => {
    setMedicines(medicines.filter((medicine) => medicine.id !== id));
    toast.success('Medicine removed successfully');
  };

  const handleAddTest = () => {
    if (!testName.trim()) {
      toast.error('Please enter a valid test name');
      return;
    }
    const selectedTest = testList.find(test => test.testName === testName);
    const newTest = {
      testName: testName,
      testInventoryId: selectedTest ? selectedTest.id : null,
    };
    setTests([...tests, newTest]);
    setTestName('');
    // toast.success('Test added successfully');
  };

  const handleRemoveTest = (id) => {
    setTests(tests.filter((test) => test.id !== id));
    toast.success('Test removed successfully');
  };

  const handleSubmitPatientProfile = async () => {
    if (!selectedPatient) {
      toast.error('No patient selected');
      return;
    }
    try {
      const prescriptionData = {
        patientId: selectedPatient.userId,
        medicines,
        tests,
        doctorId: doctorId,
      };
      
      const response = await apiPost('/pharmacy/addPrescription', prescriptionData);
      console.log('Prescription response:', response);
      if (response?.data?.success === true) {
        toast.success(response.data.message || 'Prescription submitted successfully');
        setMedicines([]);
        setTests([]);
        navigate('/doctor/doctorPages/EPrescription')
        onClose();
      } else {
        toast.error(response.data?.message || 'Failed to submit prescription');
      }
    } catch (error) {
      console.error('Error submitting prescription:', error);
      toast.error(error.response?.data?.message || 'Failed to submit prescription');
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
      title: 'Dosage',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: 'Duration (days)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Timings',
      dataIndex: 'timings',
      key: 'timings',
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
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

  const timingOptions = [
    'Before Breakfast',
    'After Breakfast',
    'Before Lunch',
    'After Lunch',
    'Before Dinner',
    'After Dinner',
    'Bedtime',
  ];

  return (
    <Modal
      title="Patient Profile"
      open={isVisible}
      onCancel={onClose}
      width={1000}
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
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <AutoComplete
                  options={medicineOptions}
                  style={{ width: 200 }}
                  onSelect={(value) => setMedicineName(value)}
                  onChange={(value) => setMedicineName(value)}
                  value={medicineName}
                  placeholder="Enter medicine name"
                  filterOption={(input, option) =>
                    option.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  allowClear
                />
                <InputNumber
                  placeholder="Quantity"
                  value={medicineQuantity}
                  onChange={(value) => setMedicineQuantity(value)}
                  style={{ width: 100 }}
                  min={1}
                  parser={(value) => value.replace(/\D/g, '')}
                />
                <Input
                  placeholder="Dosage (e.g., 1-0-1)"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  style={{ width: 150 }}
                  />
                <InputNumber
                  placeholder="Duration (days)"
                  value={duration}
                  onChange={(value) => setDuration(value)}
                  style={{ width: 120 }}
                  min={1}
                  parser={(value) => value.replace(/\D/g, '')}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Select
                  mode="multiple"
                  placeholder="Select timings"
                  value={timings}
                  onChange={(value) => setTimings(value)}
                  style={{ width: 300 }}
                  allowClear
                  maxTagCount={frequency || 3}
                >
                  {timingOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
                <InputNumber
                  placeholder="Frequency"
                  value={frequency}
                  onChange={(value) => {
                    setFrequency(value);
                    if (value && timings.length > value) {
                      setTimings(timings.slice(0, value));
                    }
                  }}
                  style={{ width: 100 }}
                  min={1}
                  parser={(value) => value.replace(/\D/g, '')}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMedicine}>
                  Add
                </Button>
              </div>
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