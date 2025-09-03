import React from "react";

const sectionStyle = {
    marginBottom: "2rem",
};

const headingStyle = {
    color: "#00203f",
    marginBottom: "1rem",
    textAlign: "center",
};

// Removed unused subHeadingStyle

const paragraphStyle = {
    color: "#555",
    fontSize: 15,
    marginBottom: "1rem",
    lineHeight: 1.7,
};

const listStyle = {
    marginBottom: "1rem",
    paddingLeft: "1.5rem",
};

const PrivacyPolicyFooter = () => (
    <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        background: "#f8f9fa"
    }}>
        <div style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            padding: 40,
            maxWidth: 900,
            width: "100%",
            margin: "2rem 0"
        }}>
            <h1 style={headingStyle}>Privacy Policy</h1>
            <p style={{ ...paragraphStyle, textAlign: "center", color: "#888", fontSize: 14 }}>
                Last updated on August 30th, 2025
            </p>

            {/* Section 1 */}
            <section style={sectionStyle}>
                <h3>1. Introduction</h3>
                <p style={paragraphStyle}>
                    This Privacy Policy outlines how Vydhyo Health Care Pvt. Ltd. ("Vydhyo," "we," "us," or "our") collects, uses, processes, stores, and protects your personal and sensitive personal data when you use the Vydhyo Healthcare Platform ("Platform") accessible through www.vydhyo.com and the Vydhyo mobile application. We are committed to protecting your privacy in compliance with the Digital Personal Data Protection Act, 2023, Information Technology Act, 2000, and other applicable laws.
                </p>
            </section>
            {/* Section 2 */}
            <section style={sectionStyle}>
                <h3>2. Definitions</h3>
                <ul style={listStyle}>
                    <li><b>Personal Data</b>: Information relating to an identified or identifiable natural person as defined under the Digital Personal Data Protection Act, 2023.</li>
                    <li><b>Sensitive Personal Data</b>: Includes passwords, financial information, health information, biometric data, genetic information, sexual orientation, and other data as defined under applicable laws.</li>
                    <li><b>User</b>: Any individual accessing or using the Platform, including patients, healthcare providers, caregivers, and their authorized representatives.</li>
                    <li><b>ABDM</b>: Ayushman Bharat Digital Mission ecosystem and its associated standards.</li>
                </ul>
            </section>
            {/* Section 3 */}
            <section style={sectionStyle}>
                <h3>3. Data Collection</h3>
                <p style={paragraphStyle}>We collect the following types of data:</p>
                <ul style={listStyle}>
                    <li><b>Personal Identification Information</b>: Name, address, phone number, email, government IDs.</li>
                    <li><b>Health Information</b>: Medical records, health conditions, prescriptions, and consultation details.</li>
                    <li><b>Payment Data</b>: Credit/debit card details, bank account information, UPI IDs, and transaction records.</li>
                    <li><b>Device and Usage Data</b>: IP address, browser type, operating system, and Platform usage analytics.</li>
                    <li><b>Location Data</b>: For service delivery (e.g., ambulance or home care services).</li>
                    <li><b>Biometric Data</b>: Where consented for enhanced security.</li>
                    <li><b>Communication Records</b>: Consultation transcripts, chatbot interactions, and customer support communications.</li>
                </ul>
            </section>

            {/* Section 4 */}
            <section style={sectionStyle}>
                <h3>4. Lawful Basis for Processing</h3>
                <p style={paragraphStyle}>We process your data based on:</p>
                <ul style={listStyle}>
                    <li>Explicit consent for health data processing.</li>
                    <li>Contract performance for service delivery.</li>
                    <li>Legal obligation compliance (e.g., tax or regulatory reporting).</li>
                    <li>Vital interests in emergency situations.</li>
                    <li>Legitimate interests for service improvement (where applicable).</li>
                </ul>
            </section>
            {/* Section 5 */}
            <section style={sectionStyle}>
                <h3>5. Data Usage</h3>
                <p style={paragraphStyle}>Your data is used to:</p>
                <ul style={listStyle}>
                    <li>Facilitate healthcare services (e.g., appointment booking, teleconsultations, ambulance services).</li>
                    <li>Process payments and provide billing support.</li>
                    <li>Integrate with the ABDM ecosystem (e.g., ABHA ID creation, health record interoperability).</li>
                    <li>Provide AI-powered informational tools (e.g., symptom assessment for educational purposes).</li>
                    <li>Improve Platform functionality and user experience.</li>
                    <li>Comply with legal and regulatory requirements.</li>
                    <li>Send notifications, reminders, and promotional content (with consent).</li>
                </ul>
            </section>
            {/* Section 6 */}
            <section style={sectionStyle}>
                <h3>6. Data Sharing and Disclosure</h3>
                <p style={paragraphStyle}>We share your data only under the following circumstances:</p>
                <ul style={listStyle}>
                    <li><b>Healthcare Providers</b>: With explicit consent for treatment purposes.</li>
                    <li><b>Payment Processors</b>: For transaction completion and fraud prevention.</li>
                    <li><b>Government Authorities</b>: As required by law or for public health purposes.</li>
                    <li><b>Emergency Services</b>: In life-threatening situations.</li>
                    <li><b>Research Institutions</b>: Only anonymized data with appropriate consents.</li>
                    <li><b>ABDM Ecosystem</b>: With consent for interoperability.</li>
                </ul>
            </section>
            {/* Section 7 */}
            <section style={sectionStyle}>
                <h3>7. Data Security</h3>
                <p style={paragraphStyle}>We implement the following measures to protect your data:</p>
                <ul style={listStyle}>
                    <li>ISO 27001 certified information security management system.</li>
                    <li>AES-256 encryption for data at rest and in transit.</li>
                    <li>Multi-factor authentication for healthcare provider access.</li>
                    <li>Role-based access controls and audit trails.</li>
                    <li>Regular security audits and penetration testing.</li>
                    <li>Incident response and breach notification procedures.</li>
                </ul>
            </section>

            {/* Section 8 */}
            <section style={sectionStyle}>
                <h3>8. International Data Transfers</h3>
                <ul style={listStyle}>
                    <li>We comply with data localization requirements under Indian law.</li>
                    <li>Any international data transfers include adequate safeguards, such as binding corporate rules or standard contractual clauses.</li>
                    <li>Prior approval from relevant authorities is obtained where required.</li>
                </ul>
            </section>

            {/* Section 9 */}
            <section style={sectionStyle}>
                <h3>9. Data Retention</h3>
                <ul style={listStyle}>
                    <li><b>Medical Records</b>: Retained for a minimum of 3 years as per applicable laws.</li>
                    <li><b>Personal Data</b>: Kept only as long as necessary for stated purposes.</li>
                    <li><b>Payment Records</b>: Retained as per tax and audit requirements.</li>
                    <li><b>Communication Logs</b>: Kept for 1 year unless required for legal proceedings.</li>
                    <li><b>Anonymized Data</b>: May be retained indefinitely for research and analytics.</li>
                </ul>
            </section>

            {/* Section 10 */}
            <section style={sectionStyle}>
                <h3>10. User Rights</h3>
                <p style={paragraphStyle}>You have the following rights regarding your data:</p>
                <ul style={listStyle}>
                    <li>Access your personal data.</li>
                    <li>Rectify inaccurate data.</li>
                    <li>Request erasure (subject to legal and medical record requirements).</li>
                    <li>Restrict processing.</li>
                    <li>Data portability where technically feasible.</li>
                    <li>Withdraw consent (where applicable).</li>
                    <li>Complain to data protection authorities.</li>
                </ul>
                <p style={paragraphStyle}>To exercise these rights, contact our Data Protection Officer at dpo@vydhyo.com.</p>
            </section>

            {/* Section 11 */}
            <section style={sectionStyle}>
                <h3>11. Children's Data</h3>
                <ul style={listStyle}>
                    <li>Data of children under 18 is processed with parental consent.</li>
                    <li>Limited data collection and enhanced security measures apply.</li>
                    <li>Special protections are in place to ensure privacy and compliance.</li>
                </ul>
            </section>

            {/* Section 12 */}
            <section style={sectionStyle}>
                <h3>12. Consent Management</h3>
                <ul style={listStyle}>
                    <li>We obtain informed consent for health data processing and sharing.</li>
                    <li>Granular consent options are provided for different data uses.</li>
                    <li>You can withdraw consent at any time via Platform settings or by contacting us.</li>
                    <li>ABDM consent manager integration is available where applicable.</li>
                </ul>
            </section>

            {/* Section 13 */}
            <section style={sectionStyle}>
                <h3>13. Communication Consent</h3>
                <ul style={listStyle}>
                    <li>You may opt-in to receive SMS, email, push notifications, or WhatsApp messages for appointments, reminders, and promotional content.</li>
                    <li>You can manage communication preferences or unsubscribe from promotional content through Platform settings.</li>
                </ul>
            </section>

            {/* Section 14 */}
            <section style={sectionStyle}>
                <h3>14. Data Protection Officer</h3>
                <ul style={listStyle}>
                    <li><b>Contact</b>: dpo@vydhyo.com</li>
                    <li>Our Data Protection Officer oversees privacy compliance and conducts regular data protection impact assessments.</li>
                </ul>
            </section>

            {/* Section 15 */}
            <section style={sectionStyle}>
                <h3>15. Changes to Privacy Policy</h3>
                <ul style={listStyle}>
                    <li>We may update this Privacy Policy to reflect changes in law or our practices.</li>
                    <li>Material changes will be notified via email, SMS, in-app notifications, or prominent notices on the Platform at least 30 days prior to implementation.</li>
                    <li>Continued use of the Platform after changes constitutes acceptance of the revised Privacy Policy.</li>
                </ul>
            </section>

            {/* Section 16 */}
            <section style={sectionStyle}>
                <h3>16. Contact Information</h3>
                <p style={paragraphStyle}>For questions or concerns about this Privacy Policy, contact:</p>
                <ul style={listStyle}>
                    <li><b>Email</b>: dpo@vydhyo.com</li>
                    <li><b>Phone</b>: 9666955501</li>
                    <li><b>Address</b>: E 602, Hallmark Sunnyside, Manchirevula, Hyderabad, Telangana, India</li>
                </ul>
            </section>
        </div>
    </div>
);


export default PrivacyPolicyFooter;