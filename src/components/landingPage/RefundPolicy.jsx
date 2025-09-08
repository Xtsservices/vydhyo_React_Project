import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

const sections = [
    {
        title: "1. Introduction",
        content: [
            `This Refund Policy outlines the terms under which Vydhyo Health Care Pvt. Ltd. ("Vydhyo") processes refunds for services provided through the Vydhyo Healthcare Platform ("Platform"). This policy applies to all users, including patients, healthcare providers, and caregivers.`,
        ],
    },
    {
        title: "2. General Refund Terms",
        list: [
            "Refunds are processed as per the cancellation policies specific to each service.",
            "Refunds can be credited to the original payment method or the Vydhyo wallet, as chosen by the user.",
            {
                text: "Processing times:",
                sublist: [
                    "Card/bank refunds: 5-10 working days.",
                    "Vydhyo wallet credits: Immediate.",
                ],
            },
            "Partial refunds may be issued for partially availed services.",
            "All refunds are subject to applicable taxes (GST, TDS, etc.) unless specified.",
        ],
    },
    {
        title: "3. Appointment Cancellation and Refund Policy",
        list: [
            "More than 24 hours before appointment: Full refund credited to Vydhyo wallet within 2 working days.",
            "Less than 24 hours but more than 2 hours before appointment: Partial refund (subject to healthcare provider policy).",
            "No-show: No refund applicable.",
            "Rescheduling: Amount paid is adjusted against the rescheduled appointment. Multiple rescheduling requests may incur additional charges.",
        ],
    },
    {
        title: "4. Ambulance Service Refunds",
        list: [
            "Refunds for ambulance services are subject to the policies of the independent ambulance provider.",
            "Vydhyo, as a platform, facilitates refund requests but is not responsible for the final refund decision.",
            "Full refunds may be issued for cancellations made before dispatch, subject to provider terms.",
            "Partial or no refunds may apply for cancellations post-dispatch or no-shows.",
        ],
    },
    {
        title: "5. Home Care and Specialized Consultation Refunds",
        list: [
            "Refunds for home care services or specialized consultations (e.g., physiotherapy, nutrition, mental health) are processed based on the healthcare provider’s cancellation policy.",
            "Partial refunds may be available for partially completed services.",
            "Full refunds are issued for services canceled before initiation, subject to provider agreement.",
        ],
    },
    {
        title: "6. Billing Disputes",
        list: [
            "Disputes must be raised within 30 days of the transaction.",
            "Contact our customer support team at vydhyo@gmail.com or 9666955501 for resolution.",
            "Disputes are investigated and resolved within 60 days, with escalation to the healthcare provider or payment gateway if necessary.",
        ],
    },
    {
        title: "7. Payment Methods",
        list: [
            "Credit/debit cards (Visa, Mastercard, RuPay, American Express).",
            "Net banking from all major banks.",
            "UPI (Unified Payments Interface).",
            "Digital wallets (Paytm, PhonePe, Google Pay, etc.).",
            "Vydhyo wallet and stored value accounts.",
            "Insurance integration where applicable.",
        ],
    },
    {
        title: "8. Force Majeure",
        list: [
            "No liability for service disruptions due to force majeure events (e.g., natural disasters, government restrictions).",
            "Proportionate refunds may be issued for services not delivered due to force majeure.",
            "Service validity periods may be extended during extended disruptions.",
        ],
    },
    {
        title: "9. Contact Information",
        content: [
            "For refund-related inquiries, contact:",
        ],
        list: [
            { text: <><b>Email</b>: vydhyo@gmail.com</> },
            { text: <><b>Phone</b>: 9666955501</> },
            { text: <><b>Address</b>: E 602, Hallmark Sunnyside, Manchirevula, Hyderabad, Telangana, India</> },
        ],
    },
    {
        title: "10. Changes to Refund Policy",
        list: [
            "We may update this Refund Policy to reflect changes in law or our practices.",
            "Material changes will be notified via email, SMS, in-app notifications, or prominent notices on the Platform at least 30 days prior to implementation.",
            "Continued use of the Platform after changes constitutes acceptance of the revised Refund Policy.",
        ],
    },
];

function renderList(list) {
    return (
        <ul style={{
            marginBottom: "1rem",
            paddingLeft: "1.5rem",
            listStyleType: "disc",
            color: "#555",
            fontSize: "1rem",
            lineHeight: "1.75",
        }}>
            {list.map((item, idx) => {
                if (typeof item === "string" || React.isValidElement(item.text)) {
                    return <li key={idx} style={{ color: "#555", fontSize: "1rem", lineHeight: "1.75" }}>{item.text || item}</li>;
                }
                if (item.sublist) {
                    return (
                        <li key={idx} style={{ color: "#555", fontSize: "1rem", lineHeight: "1.75" }}>
                            {item.text}
                            <ul style={{
                                listStyleType: "circle",
                                paddingLeft: "1.5rem",
                                marginTop: "0.5rem",
                                color: "#555",
                                fontSize: "1rem",
                                lineHeight: "1.75",
                            }}>
                                {item.sublist.map((subItem, subIdx) => (
                                    <li key={subIdx} style={{ color: "#555", fontSize: "1rem", lineHeight: "1.75" }}>{subItem}</li>
                                ))}
                            </ul>
                        </li>
                    );
                }
                return null;
            })}
        </ul>
    );
}

const RefundPolicy = () => {
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
                    }}>Payment Terms and Refund Policy</h1>
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
                        Last updated on August 30th, 2025
                    </p>
                    {sections.map((section, idx) => (
                        <section key={idx} style={{ marginBottom: "2.5rem" }}>
                            <h3 style={{
                                fontSize: "1.5rem",
                                fontWeight: "600",
                                color: "#00203f",
                                marginBottom: "1rem",
                            }}>{section.title}</h3>
                            {section.content &&
                                section.content.map((c, i) => (
                                    <p key={i} style={{
                                        color: "#555",
                                        fontSize: "1rem",
                                        lineHeight: "1.75",
                                        marginBottom: "1rem",
                                    }}>{c}</p>
                                ))}
                            {section.list && renderList(section.list)}
                        </section>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default RefundPolicy;