import React, { useState } from "react";
import { Search, Filter, Download, MoreVertical, ChevronDown } from "lucide-react";

const patients = [
  {
    id: "P-234512",
    name: "John Doe",
    gender: "Male",
    age: 34,
    phone: "+91 98765XXXXX",
    lastVisit: "28 June 2025",
    status: "New Patient",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format"
  },
  {
    id: "P-234513",
    name: "Sarah Wilson",
    gender: "Female",
    age: 28,
    phone: "+91 98765XXXXY",
    lastVisit: "25 June 2025",
    status: "Follow-up",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face&auto=format"
  },
  {
    id: "P-234514",
    name: "Michael Chen",
    gender: "Male",
    age: 45,
    phone: "+91 98765XXXXZ",
    lastVisit: "20 June 2025",
    status: "",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format"
  }
];

const MyPatients = () => {
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("Name");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPatients, setFilteredPatients] = useState(patients);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    setFilteredPatients(
      patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(value) ||
          patient.id.toLowerCase().includes(value) ||
          patient.phone.includes(value)
      )
    );
  };

  const getStatusBadge = (status) => {
    if (status === "New Patient") {
      return (
        <span style={styles.statusBadgeGreen}>
          New Patient
        </span>
      );
    }
    if (status === "Follow-up") {
      return (
        <span style={styles.statusBadgeOrange}>
          Follow-up
        </span>
      );
    }
    return null;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b'
    },
    controls: {
      marginBottom: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    controlsRow: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    },
    leftControls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flex: '1'
    },
    searchContainer: {
      position: 'relative',
      flex: '1',
      maxWidth: '400px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 12px 12px 40px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s',
      backgroundColor: 'white'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      width: '16px',
      height: '16px'
    },
    filterButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#374151',
      transition: 'all 0.2s'
    },
    sortSelect: {
      padding: '12px 32px 12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: 'white',
      fontSize: '14px',
      color: '#374151',
      outline: 'none',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
      backgroundPosition: 'right 12px center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '16px'
    },
    exportButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      backgroundColor: '#16a34a',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    tableContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    },
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: '120px 2fr 1fr 80px 140px 120px 80px',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '14px',
      fontWeight: '600',
      color: '#475569'
    },
    tableBody: {
      borderTop: '1px solid #e2e8f0'
    },
    tableRow: {
      display: 'grid',
      gridTemplateColumns: '120px 2fr 1fr 80px 140px 120px 80px',
      gap: '16px',
      padding: '16px',
      alignItems: 'center',
      borderBottom: '1px solid #f1f5f9',
      transition: 'all 0.2s'
    },
    patientId: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b'
    },
    patientInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover'
    },
    patientDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    patientName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b'
    },
    statusBadgeGreen: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    statusBadgeOrange: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: '#fed7aa',
      color: '#9a3412'
    },
    tableCell: {
      fontSize: '14px',
      color: '#64748b'
    },
    actionButton: {
      padding: '8px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'all 0.2s'
    },
    pagination: {
      marginTop: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    },
    paginationInfo: {
      fontSize: '14px',
      color: '#64748b'
    },
    paginationControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    paginationButton: {
      padding: '8px 12px',
      fontSize: '14px',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#64748b',
      cursor: 'pointer',
      borderRadius: '6px',
      transition: 'all 0.2s'
    },
    paginationButtonActive: {
      padding: '8px 12px',
      fontSize: '14px',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      cursor: 'pointer',
      borderRadius: '6px',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Patients</h1>
        <p style={styles.subtitle}>Manage and view all registered patients</p>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.controlsRow}>
          <div style={styles.leftControls}>
            {/* Search */}
            <div style={styles.searchContainer}>
              <Search style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by Patient ID, Name or Mobile Number"
                value={searchText}
                onChange={handleSearch}
                style={styles.searchInput}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Filter */}
            <button 
              style={styles.filterButton}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <Filter style={{width: '16px', height: '16px'}} />
              Filter
            </button>

            {/* Sort */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="Name">Sort by Name</option>
              <option value="Date">Sort by Date</option>
              <option value="ID">Sort by ID</option>
            </select>
          </div>

          {/* Export */}
          <button 
            style={styles.exportButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
          >
            <Download style={{width: '16px', height: '16px'}} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {/* Table Header */}
        <div style={styles.tableHeader}>
          <div>Patient ID</div>
          <div>Patient</div>
          <div>Gender</div>
          <div>Age</div>
          <div>Phone</div>
          <div>Last Visit</div>
          <div>Action</div>
        </div>

        {/* Table Body */}
        <div style={styles.tableBody}>
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id} 
              style={styles.tableRow}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              <div style={styles.patientId}>{patient.id}</div>
              
              <div style={styles.patientInfo}>
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  style={styles.avatar}
                />
                <div style={styles.patientDetails}>
                  <div style={styles.patientName}>{patient.name}</div>
                  {patient.status && (
                    <div style={{marginTop: '4px'}}>
                      {getStatusBadge(patient.status)}
                    </div>
                  )}
                </div>
              </div>
              
              <div style={styles.tableCell}>{patient.gender}</div>
              <div style={styles.tableCell}>{patient.age}</div>
              <div style={styles.tableCell}>{patient.phone}</div>
              <div style={styles.tableCell}>{patient.lastVisit}</div>
              
              <div>
                <button 
                  style={styles.actionButton}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <MoreVertical style={{width: '16px', height: '16px', color: '#9ca3af'}} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <div style={styles.paginationInfo}>
          Showing 1 to 10 of 97 results
        </div>
        
        <div style={styles.paginationControls}>
          <button 
            style={styles.paginationButton}
            disabled={currentPage === 1}
            onMouseEnter={(e) => !e.target.disabled && (e.target.style.color = '#1e293b')}
            onMouseLeave={(e) => !e.target.disabled && (e.target.style.color = '#64748b')}
          >
            Previous
          </button>
          
          <button 
            style={styles.paginationButtonActive}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          
          <button 
            style={styles.paginationButton}
            onClick={() => setCurrentPage(2)}
            onMouseEnter={(e) => e.target.style.color = '#1e293b'}
            onMouseLeave={(e) => e.target.style.color = '#64748b'}
          >
            2
          </button>
          
          <button 
            style={styles.paginationButton}
            onClick={() => setCurrentPage(3)}
            onMouseEnter={(e) => e.target.style.color = '#1e293b'}
            onMouseLeave={(e) => e.target.style.color = '#64748b'}
          >
            3
          </button>
          
          <button 
            style={styles.paginationButton}
            disabled={currentPage === 3}
            onMouseEnter={(e) => !e.target.disabled && (e.target.style.color = '#1e293b')}
            onMouseLeave={(e) => !e.target.disabled && (e.target.style.color = '#64748b')}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPatients;