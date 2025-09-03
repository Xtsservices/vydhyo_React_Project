import React from "react";

const sectionStyle = {
    marginBottom: "2rem",
};

const headingStyle = {
    color: "#00203f",
    marginBottom: "1rem",
    textAlign: "center",
};

const subHeadingStyle = {
    marginBottom: "0.5rem",
    textAlign: "center",
};

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
            "Contact our customer support team at Vydhyo@gmail.com or 9666955501 for resolution.",
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
            { text: <><b>Email</b>: Vydhyo@gmail.com</> },
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

function renderList(list, style) {
    return (
        <ul style={style}>
            {list.map((item, idx) => {
                if (typeof item === "string" || React.isValidElement(item.text)) {
                    return <li key={idx}>{item.text || item}</li>;
                }
                if (item.sublist) {
                    return (
                        <li key={idx}>
                            {item.text}
                            {renderList(item.sublist, { listStyleType: "circle", paddingLeft: 24 })}
                        </li>
                    );
                }
                return null;
            })}
        </ul>
    );
}

const RefundPolicy = () => (
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
            <h1 style={headingStyle}>Payment Terms and Refund Policy</h1>
            <h2 style={subHeadingStyle}>Vydhyo Healthcare Platform</h2>
            <p style={{ ...paragraphStyle, textAlign: "center", color: "#888", fontSize: 14 }}>
                Last updated on August 30th, 2025
            </p>
            {sections.map((section, idx) => (
                <section key={idx} style={sectionStyle}>
                    <h3>{section.title}</h3>
                    {section.content &&
                        section.content.map((c, i) => (
                            <p key={i} style={paragraphStyle}>{c}</p>
                        ))}
                    {section.list &&
                        renderList(section.list, listStyle)}
                </section>
            ))}
        </div>
    </div>
);

export default RefundPolicy;