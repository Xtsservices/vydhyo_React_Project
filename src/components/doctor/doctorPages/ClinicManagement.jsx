import React, { useState } from 'react';
import { Edit, Eye, Plus, Search, X, Trash2 } from 'lucide-react';

export default function ClinicManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: '',
    opdAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const clinics = [
    {
      id: 'CLN001',
      name: 'Apollo Clinic',
      type: 'General',
      address: 'Hyderabad',
      contact: '+91 9876SXXXX',
      status: 'Active'
    },
    {
      id: 'CLN002',
      name: 'MedLife Center',
      type: 'Diagnostic',
      address: 'Bangalore',
      contact: '+91 9876SYYYY',
      status: 'Pending'
    },
    {
      id: 'CLN003',
      name: 'City Health Hub',
      type: 'Specialty',
      address: 'Chennai',
      contact: '+91 9876SZZZZ',
      status: 'Inactive'
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return {
          backgroundColor: '#dcfce7',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          fontWeight: 600
        };
      case 'Pending':
        return {
          backgroundColor: '#fed7aa',
          color: '#c2410c',
          border: '1px solid #fdba74',
          fontWeight: 600
        };
      case 'Inactive':
        return {
          backgroundColor: '#fecaca',
          color: '#dc2626',
          border: '1px solid #fca5a5',
          fontWeight: 600
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db',
          fontWeight: 600
        };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowModal(false);
    setFormData({
      clinicName: '',
      opdAddress: '',
      landmark: '',
      city: '',
      state: '',
      pincode: ''
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      clinicName: '',
      opdAddress: '',
      landmark: '',
      city: '',
      state: '',
      pincode: ''
    });
  };

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const mainStyle = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '16px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '4px'
  };

  const subtitleStyle = {
    color: '#6b7280',
    fontSize: '14px'
  };

  const addButtonStyle = {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s',
    fontSize: '14px'
  };

  const searchContainerStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  };

  const searchInputContainerStyle = {
    position: 'relative',
    flex: '1',
    maxWidth: '300px'
  };

  const searchIconStyle = {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  };

  const searchInputStyle = {
    width: '100%',
    paddingLeft: '32px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };

  const searchButtonStyle = {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '13px'
  };

  const tableContainerStyle = {
    backgroundColor: 'white',
    borderRadius: '6px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px'
  };

  const theadStyle = {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  };

  const thStyle = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151'
  };

  const trStyle = {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
    height: '60px'
  };

  const tdStyle = {
    padding: '16px',
    fontSize: '13px',
    lineHeight: '18px',
    fontWeight: '400',
    color: '#374151'
  };

  const statusBadgeStyle = {
    display: 'inline-flex',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '400',
    borderRadius: '12px'
  };

  const actionButtonsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const iconButtonStyle = {
    padding: '4px',
    cursor: 'pointer',
    transition: 'color 0.2s',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    width: '90%',
    maxWidth: '800px',
    position: 'relative',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    maxHeight: '90vh',
    overflowY: 'auto',
    marginTop:'4rem'
  };

  const modalHeaderStyle = {
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '32px',
    textAlign: 'left'
  };

  const formGroupStyle = {
    marginBottom: '24px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: '#ffffff'
  };

  const formRowStyle = {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '32px'
  };

  const cancelButtonStyle = {
    flex: 1,
    padding: '12px 24px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#374151',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const confirmButtonStyle = {
    flex: 1,
    padding: '12px 24px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    backgroundColor: '#2563eb',
    color: 'white',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={mainStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Clinic Management</h1>
            <p style={subtitleStyle}>Manage your clinic information, address, and operating status.</p>
          </div>
          <button 
            style={addButtonStyle}
            onClick={() => setShowModal(true)}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            <Plus size={16} />
            Add Clinic
          </button>
        </div>

        {/* Search Bar */}
        <div style={searchContainerStyle}>
          <div style={searchInputContainerStyle}>
            <Search style={searchIconStyle} size={16} />
            <input
              type="text"
              placeholder="Search by Clinic Name or ID"
              style={searchInputStyle}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <button 
            style={searchButtonStyle}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Search
          </button>
        </div>

        {/* Table */}
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Clinic ID</th>
                <th style={thStyle}>Clinic Name</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.map((clinic) => (
                <tr 
                  key={clinic.id} 
                  style={trStyle}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <td style={{...tdStyle, fontWeight: '500', color: '#111827'}}>
                    {clinic.id}
                  </td>
                  <td style={{...tdStyle, color: '#111827'}}>
                    {clinic.name}
                  </td>
                  <td style={tdStyle}>
                    {clinic.type}
                  </td>
                  <td style={tdStyle}>
                    {clinic.address}
                  </td>
                  <td style={tdStyle}>
                    {clinic.contact}
                  </td>
                  <td style={tdStyle}>
                    <span style={{...statusBadgeStyle, ...getStatusStyle(clinic.status)}}>
                      {clinic.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={actionButtonsStyle}>
                      <button 
                        style={{...iconButtonStyle, color: '#2563eb'}}
                        onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                        onMouseLeave={(e) => e.target.style.color = '#2563eb'}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        style={{...iconButtonStyle, color: '#6b7280'}}
                        onMouseEnter={(e) => e.target.style.color = '#374151'}
                        onMouseLeave={(e) => e.target.style.color = '#6b7280'}
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        style={{...iconButtonStyle, color: '#dc2626'}}
                        onMouseEnter={(e) => e.target.style.color = '#b91c1c'}
                        onMouseLeave={(e) => e.target.style.color = '#dc2626'}
                        title="Delete"
                        onClick={() => console.log('Delete clinic:', clinic.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enhanced Modal */}
        {showModal && (
          <div style={modalOverlayStyle} onClick={handleCancel}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <h2 style={modalHeaderStyle}>Add New Clinic Details</h2>
              
              <div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Clinic name</label>
                  <input
                    type="text"
                    name="clinicName"
                    placeholder="Enter clinic name"
                    style={inputStyle}
                    value={formData.clinicName}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>OPD Address</label>
                  <input
                    type="text"
                    name="opdAddress"
                    placeholder="Enter OPD address"
                    style={inputStyle}
                    value={formData.opdAddress}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={formRowStyle}>
                  <div style={{flex: 1}}>
                    <label style={labelStyle}>Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      placeholder="Enter landmark"
                      style={inputStyle}
                      value={formData.landmark}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={labelStyle}>City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      style={inputStyle}
                      value={formData.city}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={formRowStyle}>
                  <div style={{flex: 1}}>
                    <label style={labelStyle}>State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Enter state"
                      style={inputStyle}
                      value={formData.state}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={labelStyle}>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Enter pincode"
                      style={inputStyle}
                      value={formData.pincode}
                      onChange={handleInputChange}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={buttonGroupStyle}>
                  <button 
                    type="button"
                    style={cancelButtonStyle}
                    onClick={handleCancel}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button 
                    type="button"
                    style={confirmButtonStyle}
                    onClick={handleSubmit}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}