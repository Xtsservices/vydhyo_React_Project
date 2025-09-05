import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

const TermsAndConditions = () => {
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
                    }}>Terms and Conditions</h1>
                    <h2 style={{
                        fontSize: "1.75rem",
                        fontWeight: "600",
                        color: "#00203f",
                        textAlign: "center",
                        marginBottom: "0.5rem",
                    }}>Vydhyo Healthcare Platform</h2>
                    <p style={{
                        textAlign: "center",
                        color: "#888",
                        fontSize: "0.875rem",
                        marginBottom: "2rem",
                    }}>
                        Effective Date: September 1st, 2025 | Last Updated: August 30th, 2025 | Version: 1.0
                    </p>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>1. Definitions and Interpretation</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Vydhyo</b>: Vydhyo Health Care Pvt. Ltd., a company incorporated under the Companies Act, 2013, with its registered office at E 602, Hallmark Sunnyside, Manchirevula, Hyderabad, operating the Platform (www.vydhyo.com and Vydhyo mobile application).</li>
                            <li><b>User</b>: Any individual accessing or using the Platform, including patients, healthcare providers, caregivers, and their authorized representatives.</li>
                            <li><b>Patient</b>: An individual seeking healthcare services or their parent/legal guardian for minors or persons with disabilities.</li>
                            <li><b>Healthcare Provider</b>: Registered medical practitioners, hospitals, clinics, diagnostic centers, ambulance services, home care providers, physiotherapists, nutritionists, mental health professionals, and others listed on the Platform.</li>
                            <li><b>Services</b>: Appointment booking, teleconsultation facilitation, ambulance services, home care services, diagnostic services, AI-powered guidance, health information, and related offerings.</li>
                            <li><b>Personal Data</b>: Information relating to an identifiable person as defined under the Digital Personal Data Protection Act, 2023.</li>
                            <li><b>Sensitive Personal Data</b>: Includes passwords, financial information, health information, biometric data, etc.</li>
                            <li><b>ABDM</b>: Ayushman Bharat Digital Mission ecosystem.</li>
                            <li><b>Clinical Establishment</b>: Healthcare facilities registered under the Clinical Establishments Act, 2010.</li>
                            <li><b>Telemedicine</b>: Practice of medicine using electronic communication as per Telemedicine Practice Guidelines, 2020.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>2. Acceptance and Modification</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Acceptance</b>: By using the Platform, you agree to these Terms and applicable laws. If you do not agree, you must not use the Platform.</li>
                            <li><b>Modifications</b>: Vydhyo may modify these Terms, with material changes notified 30 days prior unless required by law for immediate implementation.</li>
                            <li><b>Continued Use</b>: Continued use after modifications constitutes acceptance.</li>
                            <li><b>Language</b>: English version prevails in case of translation conflicts.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>3. Eligibility and Registration</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>Age</b>: Users must be 18 or older; minors require parental/guardian consent.</p>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>Legal Capacity</b>: Users must have the legal capacity to enter contracts under Indian law.</p>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>Registration</b>:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Provide accurate, complete, and current information.</li>
                            <li>Verify mobile number and email via OTP.</li>
                            <li>Healthcare Providers must provide valid registration numbers.</li>
                            <li>Clinical Establishments must provide valid registrations.</li>
                            <li>Vydhyo may verify credentials and reject applications.</li>
                        </ul>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>ABDM Integration</b>: Optional integration with ABHA ID, HIP/HIU systems, and consent manager framework.</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Creation of ABHA (Ayushman Bharat Health Account) ID.</li>
                            <li>Integration with Health Information Provider (HIP) and Health Information User (HIU) systems.</li>
                            <li>Consent manager framework compliance.</li>
                            <li>Digital health records interoperability.</li>
                        </ul>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>Account Security</b>:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Users are responsible for credential confidentiality and must notify Vydhyo of unauthorized use.</li>
                            <li>Users are liable for all activities conducted through their account.</li>
                            <li>Multi-factor authentication is strongly recommended.</li>
                        </ul>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>Prohibited Users</b>:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Those barred by law, with revoked licenses, or previously violating Terms.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>4. Platform Role and Disclaimers</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>Role</b>: Vydhyo is a technology platform facilitating connections, not a healthcare provider.</p>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>No Medical Practice</b>:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Vydhyo does not diagnose, treat, or provide medical advice; medical decisions are between patients and providers.</li>
                            <li>Vydhyo does not endorse any particular healthcare provider or treatment.</li>
                        </ul>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>Facilitation</b>: Limited to appointment booking, communication, payment processing, and AI-powered informational tools.</p>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>Provider Independence</b>: Providers are independent contractors, not Vydhyo employees.</p>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>Emergency Disclaimer</b>: Platform is not for emergencies; contact 108/102 or visit emergency facilities.</p>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>5. Services</h3>
                        <h4 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "0.75rem",
                        }}>5.1 Doctor Consultations</h4>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Appointment Scheduling</b>: Subject to provider availability; confirmation required.</li>
                            <li><b>Telemedicine Compliance</b>: Complies with 2020 Guidelines; providers maintain valid registrations.</li>
                            <li><b>Payment Processing</b>: Vydhyo acts as a payment aggregator; taxes and fees apply.</li>
                            <li><b>Rescheduling</b>: Allowed with 2-hour notice; multiple rescheduling may incur fees.</li>
                            <li><b>Cancellation</b>: Full refund (&gt;24 hours), no refund (no-show).</li>
                        </ul>
                        <h4 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "0.75rem",
                        }}>5.2 Ambulance Services</h4>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Facilitates connection with independent providers.</li>
                            <li>Vydhyo is not liable for quality, timing, or disputes.</li>
                            <li>Suitable for non-critical transport; emergencies should use 108/102.</li>
                        </ul>
                        <h4 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "0.75rem",
                        }}>5.3 Home Care Services</h4>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Includes nursing, elder care, physiotherapy, etc.</li>
                            <li>Providers undergo verification; comply with Biomedical Waste Management Rules, 2016.</li>
                            <li>Vydhyo is not liable for disputes.</li>
                        </ul>
                        <h4 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "0.75rem",
                        }}>5.4 Specialized Consultations</h4>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Includes physiotherapy, nutrition, mental health, and second opinions.</li>
                            <li>Mental health services ensure confidentiality; nutrition services integrate with treatment plans.</li>
                        </ul>
                        <h4 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "0.75rem",
                        }}>5.5 AI-Powered Tools</h4>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Symptom assessment for informational purposes only, not diagnostic.</li>
                            <li>Recommends consulting qualified providers.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>6. Payment Terms</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Methods</b>: Credit/debit cards, net banking, UPI, digital wallets, Vydhyo wallet, insurance integration.</li>
                            <li><b>Security</b>: PCI-DSS compliant, end-to-end encryption, tokenization, fraud detection.</li>
                            <li><b>Pricing</b>: Set by providers; platform fees disclosed.</li>
                            <li><b>Taxes</b>: GST, TDS, etc., apply unless specified.</li>
                            <li><b>Refunds</b>: Per service-specific policies; processed in 5-10 days (card/bank) or immediately (wallet).</li>
                            <li><b>Disputes</b>: Raised within 30 days; resolved within 60 days.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>7. User Responsibilities</h3>
                        <h4 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "0.75rem",
                        }}>7.1 Patient Responsibilities</h4>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Provide accurate information, respect providers, use Platform for legitimate purposes.</li>
                        </ul>
                        <h4 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "0.75rem",
                        }}>7.2 Healthcare Provider Responsibilities</h4>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Maintain licenses, provide quality care, comply with ethics, maintain insurance.</li>
                        </ul>
                        <h4 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "0.75rem",
                        }}>7.3 Clinical Establishment Compliance</h4>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Comply with registration, infrastructure, and waste management regulations.</li>
                        </ul>
                        <h4 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "0.75rem",
                        }}>7.4 Prohibited Activities</h4>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Misrepresentation, unauthorized access, illegal activities, harassment, etc.</li>
                        </ul>
                        <h4 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "0.75rem",
                        }}>7.5 Professional Conduct</h4>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Respectful interactions, confidentiality, conflict disclosure.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>8. Intellectual Property</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Vydhyo’s IP</b>: Trademarks, patents, software, content, and data.</li>
                            <li><b>User License</b>: Limited, non-exclusive, non-transferable for personal use.</li>
                            <li><b>User-Generated Content</b>: Users retain ownership but grant Vydhyo a license for operations.</li>
                            <li><b>Provider Content</b>: Providers retain ownership; Vydhyo uses for listings and analytics.</li>
                            <li><b>Third-Party IP</b>: Licensed components; DMCA compliance.</li>
                            <li><b>Violations</b>: Takedown, suspension, or legal action for infringement.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>9. Limitation of Liability</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Limitations</b>: Vydhyo is not liable for medical errors, provider negligence, technical failures, or force majeure.</li>
                            <li><b>Liability Cap</b>: Limited to fees paid for the specific service in the past 12 months.</li>
                            <li><b>Consequential Damages</b>: No liability for indirect or punitive damages.</li>
                            <li><b>Exceptions</b>: Gross negligence, fraud, data protection violations, or statutory liabilities.</li>
                            <li><b>Indemnification</b>: Users indemnify Vydhyo for breaches, misuse, or violations.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>10. Governing Law and Dispute Resolution</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Governing Law</b>: Laws of India (e.g., Consumer Protection Act, 2019; Digital Personal Data Protection Act, 2023).</li>
                            <li><b>Jurisdiction</b>: Courts in Hyderabad, Telangana.</li>
                            <li><b>Dispute Resolution</b>:
                                <ul style={{
                                    listStyleType: "circle",
                                    paddingLeft: "1.5rem",
                                    marginTop: "0.5rem",
                                    color: "#555",
                                    fontSize: "1rem",
                                    lineHeight: "1.75",
                                }}>
                                    <li>Informal resolution (30 days).</li>
                                    <li>Formal grievance process (30 days).</li>
                                    <li>Mediation (60 days) under Mediation Act, 2023.</li>
                                    <li>Arbitration under Arbitration and Conciliation Act, 2015 (Hyderabad, English).</li>
                                </ul>
                            </li>
                            <li><b>Specialized Disputes</b>: Medical malpractice, data protection, consumer protection via respective mechanisms.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>11. Miscellaneous</h3>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li><b>Entire Agreement</b>: Includes Privacy Policy, Refund Policy, and referenced agreements.</li>
                            <li><b>Severability</b>: Invalid provisions modified to be enforceable.</li>
                            <li><b>Waiver</b>: Must be written; no implied waivers.</li>
                            <li><b>Assignment</b>: Users cannot assign without consent; Vydhyo may assign with notice.</li>
                            <li><b>Notices</b>: Written, via registered email/address or electronic means.</li>
                            <li><b>Language</b>: English controls; translations provided in Hindi, Telugu, etc.</li>
                            <li><b>Survival</b>: IP, liability, data protection, and dispute resolution provisions survive termination.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>12. Acknowledgment</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>By using the Platform, you acknowledge that you have read, understood, and agree to these Terms, have legal capacity, and understand your rights and obligations.</p>
                    </section>

                    <section style={{ marginBottom: "2.5rem" }}>
                        <h3 style={{
                            fontSize: "1.5rem",
                            fontWeight: "600",
                            color: "#00203f",
                            marginBottom: "1rem",
                        }}>13. Declaration of Compliance</h3>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}>Vydhyo complies with:</p>
                        <ul style={{
                            marginBottom: "1rem",
                            paddingLeft: "1.5rem",
                            listStyleType: "disc",
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                        }}>
                            <li>Digital Personal Data Protection Act, 2023</li>
                            <li>Consumer Protection Act, 2019</li>
                            <li>Ayushman Bharat Digital Mission guidelines</li>
                            <li>Telemedicine Practice Guidelines, 2020</li>
                            <li>Clinical Establishments Act</li>
                            <li>Accessibility and insurance regulations</li>
                        </ul>
                        <p style={{
                            color: "#555",
                            fontSize: "1rem",
                            lineHeight: "1.75",
                            marginBottom: "1rem",
                        }}><b>Contact</b>: Vydhyo@gmail.com, 9666955501, E 602, Hallmark Sunnyside, Manchirevula, Hyderabad.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default TermsAndConditions;