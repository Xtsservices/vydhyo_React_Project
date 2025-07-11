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

  const tabs = [
    { id: 'doctor-clinic', label: 'Doctor & Clinic Info', icon: UserCheck },
    { id: 'patient-details', label: 'Patient Details & History', icon: Users },
    { id: 'vitals', label: 'Vitals & Investigation', icon: Activity },
    { id: 'diagnosis', label: 'Diagnosis & Medication', icon: Pill },
    { id: 'advice', label: 'Advice & Follow Up', icon: Calendar },
    { id: 'preview', label: 'Preview', icon: FileText }
  ];

  const handleConfirm = () => {
    setActiveTab('preview');
    setShowPreview(true);
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 2) { // -2 because we don't want to auto-select preview
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
      return <Preview />;
    }
    
    switch (activeTab) {
      case 'doctor-clinic':
        return <DoctorClinicInfo />;
      case 'patient-details':
        return <PatientDetailsHistory />;
      case 'vitals':
        return <VitalsInvestigation />;
      case 'diagnosis':
        return <DiagnosisMedication />;
      case 'advice':
        return <AdviceFollowUp />;
      default:
        return <DoctorClinicInfo />;
    }
  };

  return (
    <div className="eprescription-container">
      {/* Main Content */}
      <div className="eprescription-main">
        {/* Tab Navigation - Always visible */}
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