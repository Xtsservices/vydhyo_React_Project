const Illustration =({ isMobile }) =>{
  return (
    <div className={`illustration-container ${isMobile ? 'hidden' : 'flex'}`}>
      <div className="illustration-content">
        <svg width="400" height="300" viewBox="0 0 400 300" className="illustration-svg">
          <circle cx="80" cy="60" r="25" fill="#e8f4fd" opacity="0.7" />
          <circle cx="320" cy="80" r="20" fill="#fff0e6" opacity="0.7" />
          <circle cx="60" cy="200" r="15" fill="#f0f9ff" opacity="0.7" />
          <rect x="90" y="30" width="40" height="35" rx="8" fill="#6366f1" opacity="0.8" />
          <text x="110" y="52" fill="white" fontSize="20" textAnchor="middle">+</text>
          <circle cx="200" cy="120" r="35" fill="#fde68a" />
          <rect x="175" y="145" width="50" height="60" rx="25" fill="#ffffff" />
          <rect x="185" y="155" width="30" height="3" fill="#6366f1" />
          <rect x="185" y="165" width="20" height="3" fill="#6366f1" />
          <circle cx="190" cy="115" r="3" fill="#374151" />
          <circle cx="210" cy="115" r="3" fill="#374151" />
          <path d="M185 125 Q200 135 215 125" stroke="#374151" strokeWidth="2" fill="none" />
          <circle cx="120" cy="140" r="25" fill="#fed7aa" />
          <rect x="105" y="160" width="30" height="40" rx="15" fill="#f97316" />
          <circle cx="115" cy="135" r="2" fill="#374151" />
          <circle cx="125" cy="135" r="2" fill="#374151" />
          <rect x="260" y="160" width="60" height="40" rx="8" fill="#ef4444" />
          <rect x="270" y="170" width="15" height="3" fill="white" />
          <rect x="290" y="170" width="20" height="3" fill="white" />
          <text x="300" y="190" fill="white" fontSize="12" textAnchor="middle">🏥</text>
          <rect x="50" y="180" width="30" height="25" rx="5" fill="#dc2626" />
          <rect x="60" y="175" width="10" height="8" rx="2" fill="#dc2626" />
          <text x="65" y="195" fill="white" fontSize="12" textAnchor="middle">+</text>
          <circle cx="300" cy="200" r="8" fill="#22d3ee" opacity="0.6" />
          <rect x="340" y="180" width="20" height="20" rx="3" fill="#a855f7" opacity="0.6" />
          <path
            d="M50 250 L80 250 L90 230 L100 270 L110 230 L120 250 L350 250"
            stroke="#ef4444"
            strokeWidth="3"
            fill="none"
            opacity="0.7"
          />
        </svg>
        <h2 className="illustration-title">Welcome to Vydhyo</h2>
        <p className="illustration-text">
          Your trusted healthcare companion. Secure, reliable, and always here for you.
        </p>
      </div>
    </div>
  );
}

export default  Illustration
