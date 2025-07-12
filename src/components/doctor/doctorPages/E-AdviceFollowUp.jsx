import React, { useState, useEffect } from 'react';
import { Calendar, User, Stethoscope } from 'lucide-react';
import '../../stylings/EPrescription.css';

const AdviceFollowUp = ({ formData, updateFormData }) => {
  const [localData, setLocalData] = useState({
    advice: '',
    followUpDate: ''
  });

  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setLocalData(formData);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...localData,
      [name]: value
    };
    setLocalData(updatedData);
    updateFormData(updatedData);
  };

  const handleCancel = () => {
    const resetData = {
      advice: '',
      followUpDate: ''
    };
    setLocalData(resetData);
    updateFormData(resetData);
  };

  return (
    <div className="common-container">
      {/* Advice Section */}
      <div className="common-section">
        <div className="common-section-header">
          <div className="common-icon-container">
            <Stethoscope size={16} color="#16a34a" />
          </div>
          <div>
            <h2 className="common-section-title">Advice</h2>
            <p className="common-section-subtitle">Clinical examination findings and observations</p>
          </div>
        </div>

        <div className="advice-container">
          <div className="advice-header">
            <h3 className="advice-title">Examination Findings</h3>
            <p className="advice-subtitle">Record all relevant physical examination findings</p>
          </div>
          
          <textarea
            placeholder="Enter findings from clinical examination..."
            value={localData.advice}
            onChange={(e) => handleChange({ target: { name: 'advice', value: e.target.value } })}
            className="common-textarea"
          />
        </div>
      </div>

      {/* Follow-Up Section */}
      <div className="common-section">
        <div className="follow-up-header">
          <div className="follow-up-icon-container">
            <User size={14} color="#16a34a" />
          </div>
          <h3 className="follow-up-title">Follow - Ups</h3>
        </div>

        <div className="common-date-input-container">
          <input
            type="date"
            name="followUpDate"
            value={localData.followUpDate}
            onChange={handleChange}
            className="common-date-input"
          />
          {/* <Calendar size={16} className="common-calendar-icon" /> */}
        </div>
      </div>
    </div>
  );
};

export default AdviceFollowUp;