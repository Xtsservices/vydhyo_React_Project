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

  const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const capitalizedValue = name === 'advice' ? capitalizeFirstLetter(value) : value;
    const updatedData = {
      ...localData,
      [name]: capitalizedValue
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

  // Get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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
          </div>
        </div>

        <div className="advice-container">
          <textarea
            placeholder=""
            value={localData.advice}
            onChange={handleChange}
            name="advice"
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
          <h3 className="follow-up-title">Follow - Up</h3>
        </div>

        <div className="common-date-input-container">
          <input
            type="date"
            name="followUpDate"
            value={localData.followUpDate}
            onChange={handleChange}
            className="common-date-input"
            min={getTomorrowDate()}
          />
        </div>
      </div>
    </div>
  );
};

export default AdviceFollowUp;