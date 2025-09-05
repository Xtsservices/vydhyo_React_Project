import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

const PrivacyPolicyFooter = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <Header />
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                minHeight: "100vh",
                backgroundColor: "#f8f9fa",
                padding: "2rem 1rem",
                fontFamily: "'Inter', sans-serif",
            }}>
                <div style={{
                    backgroundColor: "#fff",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    padding: "2rem",
                    maxWidth: "56rem",
                    width: "100%",
                    margin: "2rem 0",
                    transition: "box-shadow 0.3s ease",
                }}>
                    <h1 style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: "#00203f",
                        textAlign: "center",
                        marginBottom: "1rem",
                    }}>Privacy Policy</h1>
                    <p style={{
                        textAlign: "center",
                        color: "#888",
                        fontSize: "0.875rem",
                        marginBottom: "2rem",
                    }}>
                        Last updated on August 30th, 2025
                    </p>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>1. Introduction</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>
                            This Privacy Policy outlines how Vydhyo Health Care Pvt. Ltd. ("Vydhyo," "we," "us," or "our") collects, uses, processes, stores, and protects your personal and sensitive personal data when you use the Vydhyo Healthcare Platform ("Platform") accessible through www.vydhyo.com and the Vydhyo mobile application. We are committed to protecting your privacy in compliance with the Digital Personal Data Protection Act, 2023, Information Technology Act, 2000, and other applicable laws.
                        </p>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>2. Definitions</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Personal Data</b>: Information relating to an identified or identifiable natural person as defined under the Digital Personal Data Protection Act, 2023.</li>
                            <li><b>Sensitive Personal Data</b>: Includes passwords, financial information, health information, biometric data, genetic information, sexual orientation, and other data as defined under applicable laws.</li>
                            <li><b>User</b>: Any individual accessing or using the Platform, including patients, healthcare providers, caregivers, and their authorized representatives.</li>
                            <li><b>ABDM</b>: Ayushman Bharat Digital Mission ecosystem and its associated standards.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>3. Data Collection</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>We collect the following types of data:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Personal Identification Information</b>: Name, address, phone number, email, government IDs.</li>
                            <li><b>Health Information</b>: Medical records, health conditions, prescriptions, and consultation details.</li>
                            <li><b>Payment Data</b>: Credit/debit card details, bank account information, UPI IDs, and transaction records.</li>
                            <li><b>Device and Usage Data</b>: IP address, browser type, operating system, and Platform usage analytics.</li>
                            <li><b>Location Data</b>: For service delivery (e.g., ambulance or home care services).</li>
                            <li><b>Biometric Data</b>: Where consented for enhanced security.</li>
                            <li><b>Communication Records</b>: Consultation transcripts, chatbot interactions, and customer support communications.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>4. Lawful Basis for Processing</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>We process your data based on:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Explicit consent for health data processing.</li>
                            <li>Contract performance for service delivery.</li>
                            <li>Legal obligation compliance (e.g., tax or regulatory reporting).</li>
                            <li>Vital interests in emergency situations.</li>
                            <li>Legitimate interests for service improvement (where applicable).</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>5. Data Usage</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>Your data is used to:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Facilitate healthcare services (e.g., appointment booking, teleconsultations, ambulance services).</li>
                            <li>Process payments and provide billing support.</li>
                            <li>Integrate with the ABDM ecosystem (e.g., ABHA ID creation, health record interoperability).</li>
                            <li>Provide AI-powered informational tools (e.g., symptom assessment for educational purposes).</li>
                            <li>Improve Platform functionality and user experience.</li>
                            <li>Comply with legal and regulatory requirements.</li>
                            <li>Send notifications, reminders, and promotional content (with consent).</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>6. Data Sharing and Disclosure</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>We share your data only under the following circumstances:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Healthcare Providers</b>: With explicit consent for treatment purposes.</li>
                            <li><b>Payment Processors</b>: For transaction completion and fraud prevention.</li>
                            <li><b>Government Authorities</b>: As required by law or for public health purposes.</li>
                            <li><b>Emergency Services</b>: In life-threatening situations.</li>
                            <li><b>Research Institutions</b>: Only anonymized data with appropriate consents.</li>
                            <li><b>ABDM Ecosystem</b>: With consent for interoperability.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>7. Data Security</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>We implement the following measures to protect your data:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>ISO 27001 certified information security management system.</li>
                            <li>AES-256 encryption for data at rest and in transit.</li>
                            <li>Multi-factor authentication for healthcare provider access.</li>
                            <li>Role-based access controls and audit trails.</li>
                            <li>Regular security audits and penetration testing.</li>
                            <li>Incident response and breach notification procedures.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>8. International Data Transfers</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>We comply with data localization requirements under Indian law.</li>
                            <li>Any international data transfers include adequate safeguards, such as binding corporate rules or standard contractual clauses.</li>
                            <li>Prior approval from relevant authorities is obtained where required.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>9. Data Retention</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Medical Records</b>: Retained for a minimum of 3 years as per applicable laws.</li>
                            <li><b>Personal Data</b>: Kept only as long as necessary for stated purposes.</li>
                            <li><b>Payment Records</b>: Retained as per tax and audit requirements.</li>
                            <li><b>Communication Logs</b>: Kept for 1 year unless required for legal proceedings.</li>
                            <li><b>Anonymized Data</b>: May be retained indefinitely for research and analytics.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>10. User Rights</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>You have the following rights regarding your data:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Access your personal data.</li>
                            <li>Rectify inaccurate data.</li>
                            <li>Request erasure (subject to legal and medical record requirements).</li>
                            <li>Restrict processing.</li>
                            <li>Data portability where technically feasible.</li>
                            <li>Withdraw consent (where applicable).</li>
                            <li>Complain to data protection authorities.</li>
                        </ul>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>To exercise these rights, contact our Data Protection Officer at dpo@vydhyo.com.</p>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>11. Children's Data</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Data of children under 18 is processed with parental consent.</li>
                            <li>Limited data collection and enhanced security measures apply.</li>
                            <li>Special protections are in place to ensure privacy and compliance.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>12. Consent Management</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>We obtain informed consent for health data processing and sharing.</li>
                            <li>Granular consent options are provided for different data uses.</li>
                            <li>You can withdraw consent at any time via Platform settings or by contacting us.</li>
                            <li>ABDM consent manager integration is available where applicable.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>13. Communication Consent</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>You may opt-in to receive SMS, email, push notifications, or WhatsApp messages for appointments, reminders, and promotional content.</li>
                            <li>You can manage communication preferences or unsubscribe from promotional content through Platform settings.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>14. Data Protection Officer</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Contact</b>: dpo@vydhyo.com</li>
                            <li>Our Data Protection Officer oversees privacy compliance and conducts regular data protection impact assessments.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>15. Changes to Privacy Policy</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>We may update this Privacy Policy to reflect changes in law or our practices.</li>
                            <li>Material changes will be notified via email, SMS, in-app notifications, or prominent notices on the Platform at least 30 days prior to implementation.</li>
                            <li>Continued use of the Platform after changes constitutes acceptance of the revised Privacy Policy.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>16. Contact Information</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>For questions or concerns about this Privacy Policy, contact:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Email</b>: dpo@vydhyo.com</li>
                            <li><b>Phone</b>: 9666955501</li>
                            <li><b>Address</b>: E 602, Hallmark Sunnyside, Manchirevula, Hyderabad, Telangana, India</li>
                        </ul>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicyFooter;