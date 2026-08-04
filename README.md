# SIR Recruitment - Premier International HR & Talent Consultancy Platform

![SIR Recruitment Dubai](/public/images/hero_dubai.png)

A luxury corporate, modern, responsive web application for **SIR Recruitment**, a Dubai-headquartered international recruitment consultancy, executive search firm, visa processing agency, and HR consulting company.

---

## 🌟 Key Features

- **Luxury Corporate Design System**: Navy Blue (`#0A192F`), Gold Shimmer (`#D4AF37`), Lite Blue (`#F0F7FF`), and Glassmorphism aesthetics with responsive dark mode.
- **Full-Stack Architecture**: React (Vite frontend) + Node.js/Express REST API backend server (`/server/index.js`).
- **18+ Executive HR & Recruitment Services**: Domestic, International, Executive Search, Permanent & Contract Staffing, Bulk Hiring, Overseas Placement, Visa Assistance, Background Verification, Payroll Management, and Manpower Outsourcing.
- **12 Specialized Industry Verticals**: Construction, Oil & Gas, Healthcare, Hospitality, IT & Software, Engineering, Manufacturing, Retail, Logistics, Aviation, Banking, and Education.
- **Advanced Job Portal**: Multi-criteria filtering (keyword, destination country, category, job type, salary range) with interactive candidate application forms.
- **GCC & International Visa Eligibility Checker**: Multi-step interactive evaluation calculator + **Master 18-Country Visa Eligibility Matrix** (UAE, Saudi Arabia, Qatar, Oman, Kuwait, Bahrain, Singapore, Malaysia, Canada, Australia, New Zealand, UK, Germany, Netherlands, Ireland, US, Japan, South Korea) with Excel/CSV & PDF export options.
- **Background Verification Module**: 6-Point audit request wizard (Education, Past Employment, Address, Identity, Police, Reference) with live Case ID status tracking tool.
- **Online Payment Gateway**: Checkout simulation supporting Stripe, PayPal, and Razorpay.
- **AI Tools**: AI Resume ATS Analyzer, AI Career Assistant Chatbot, and ATS Resume Builder tool.
- **Candidate & Employer Portals**: Candidate dashboard with application tracking timeline and Employer mandate creation wizard with candidate search database.

---

## 🛠️ Project Structure

```text
consulting-website/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── images/
│       ├── hero_dubai.png
│       ├── dubai_office.png
│       └── executives.png
├── server/
│   └── index.js              # Express REST API Server (Port 5000)
├── src/
│   ├── components/           # Navbar, Footer, VisaMatrixTable, Modals, Widgets
│   ├── context/              # AppContext for theme, auth, global state
│   ├── data/                 # Master dataset for services, visa matrix, jobs, etc.
│   ├── pages/                # Home, AboutUs, Services, Industries, Jobs, Portals, Visa, Verification, Contact
│   ├── styles/               # Glassmorphism & Tailwind directives
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js v18+ and npm installed.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thejobsyncit/consulting-website.git
   cd consulting-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the Full-Stack Application (Express Server + Vite Dev Server)**:
   ```bash
   npm start
   ```
   - Frontend: `http://localhost:3000`
   - Express REST API Backend: `http://localhost:5000`

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 📄 License & Compliance

© 2026 **SIR Recruitment Consultancy FZ-LLC**. All Rights Reserved.  
Operated under UAE Ministry of Human Resources and Emiratisation (MOHRE) & Dubai Economy and Tourism guidelines.
