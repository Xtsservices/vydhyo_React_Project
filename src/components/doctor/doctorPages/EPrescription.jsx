import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Activity, 
  Pill, 
  UserCheck, 
  Building, 
  CheckCircle, 
  BarChart3,
  Star,
  Menu,
  X
} from 'lucide-react';

// Import components
import DoctorClinicInfo from './E-DoctorClinicInfo';
import PatientDetailsHistory from './E-PatientDetailsHistory';
import VitalsInvestigation from './E-VitalsInvestigation';
import DiagnosisMedication from './E-DiagnosisMedication';
import AdviceFollowUp from './E-AdviceFollowUp';
import Preview from './Preview';
import '../../stylings/EPrescription.css';

const EPrescription = () => {
  const [activeTab, setActiveTab] = useState('doctor-clinic');
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctorInfo: {},
    patientInfo: {},
    vitals: {},
    diagnosis: {},
    advice: {}
  });

  const tabs = [
    { id: 'doctor-clinic', label: 'Doctor & Clinic Info', icon: UserCheck },
    { id: 'patient-details', label: 'Patient Details & History', icon: Users },
    { id: 'vitals', label: 'Vitals & Investigation', icon: Activity },
    { id: 'diagnosis', label: 'Diagnosis & Medication', icon: Pill },
    { id: 'advice', label: 'Advice & Follow Up', icon: Calendar },
    { id: 'preview', label: 'Preview', icon: FileText }
  ];

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handlePrescriptionAction = (type) => {
    if (type === 'print') {
      window.print();
    } else if (type === 'whatsapp') {
      const message = `Here's my medical prescription from VYDHYO MULTISPECIALTY CLINIC` +
                     `Patient: ${formData.patientInfo?.patientName || 'N/A'}` +
                     `Doctor: ${formData.doctorInfo?.doctorName || 'N/A'}` +
                     `Date: ${formData.doctorInfo?.reportDate || 'N/A'}`;
      const url = "https://wa.me/?text=" + encodeURIComponent(message);
      window.open(url, '_blank');
    }
  };


  const handleConfirm = () => {
    console.log('Form dataaaaaaaaaaaaaa:', formData); 
    setActiveTab('preview');
    setShowPreview(true);
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 2) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'preview') {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
    setActiveTab(tabId);
  };

  const renderActiveComponent = () => {
    if (activeTab === 'preview') {
      return <Preview formData={formData} handlePrescriptionAction={handlePrescriptionAction} />;
    }
    
    switch (activeTab) {
      case 'doctor-clinic':
        return <DoctorClinicInfo 
                 formData={formData.doctorInfo} 
                 updateFormData={(data) => updateFormData('doctorInfo', data)} 
               />;
      case 'patient-details':
        return <PatientDetailsHistory 
                 formData={formData.patientInfo} 
                 updateFormData={(data) => updateFormData('patientInfo', data)} 
               />;
      case 'vitals':
        return <VitalsInvestigation 
                 formData={formData.vitals} 
                 updateFormData={(data) => updateFormData('vitals', data)} 
               />;
      case 'diagnosis':
        return <DiagnosisMedication 
                 formData={formData.diagnosis} 
                 updateFormData={(data) => updateFormData('diagnosis', data)} 
               />;
      case 'advice':
        return <AdviceFollowUp 
                 formData={formData.advice} 
                 updateFormData={(data) => updateFormData('advice', data)} 
               />;
      default:
        return <DoctorClinicInfo 
                 formData={formData.doctorInfo} 
                 updateFormData={(data) => updateFormData('doctorInfo', data)} 
               />;
    }
  };

  return (
    <div className="eprescription-container">
      {/* Main Content */}
      <div className="eprescription-main">
        {/* Tab Navigation */}
        <div className="eprescription-tabs">
          <nav style={{ display: 'flex', gap: '8px' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`eprescription-tab ${activeTab === tab.id ? 'eprescription-tab-active' : 'eprescription-tab-inactive'}`}
                disabled={tab.id === 'preview' && activeTab !== 'advice' && !showPreview}
              >
                <tab.icon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="eprescription-content">
          {renderActiveComponent()}
          
          {/* Action Buttons - Hidden in preview */}
          {activeTab !== 'preview' && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              marginTop: '24px' 
            }}>
              <button className="common-button common-cancel-button">
                Cancel
              </button>
              
              <button 
                onClick={activeTab === 'advice' ? handleConfirm : handleNext}
                className="common-button common-confirm-button"
              >
                {activeTab === 'advice' ? 'Preview' : 'Next'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EPrescription;