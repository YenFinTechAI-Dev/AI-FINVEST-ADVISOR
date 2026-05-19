# AI-FINVEST-ADVISOR

AI-FINVEST-ADVISOR is an AI-powered investment portfolio management dashboard built with modern web technologies.
The system helps users monitor portfolio allocation, track transactions, analyze investment risks, and receive intelligent AI-based financial insights in real-time.

Designed with a modern FinTech UI inspired by Bloomberg, TradingView, and AI-native dashboards.

---

##  Features

### Investment Dashboard

* Real-time portfolio overview
* VN-Index / HNX-Index tracking
* Profit & Loss analytics
* Portfolio allocation visualization
* Risk score monitoring

### AI Financial Advisor

* AI-powered investment analysis
* Smart portfolio recommendations
* Natural language transaction input
* Market insight generation
* Risk evaluation system

### Transaction Management

* Add buy/sell transactions
* Transaction history tracking
* Portfolio performance updates
* Auto-calculated profit/loss

### Modern FinTech UI

* Dark premium dashboard design
* Glassmorphism effects
* Responsive layout
* Interactive charts
* Smooth animations

---

# Tech Stack

## Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Chart.js
* Font Awesome

## Backend

* Python
* FastAPI

## AI Engine

* AI Investment Analysis API
* NLP Transaction Processing

---

# Project Structure

```bash
AI-FINVEST-ADVISOR/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│
├── backend/
│   ├── backend_main.py
│   ├── requirements.txt
│
├── ai_server/
│   ├── ai_main.py
│
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/YenFinTechAI-Dev/AI-FINVEST-ADVISOR.git
cd AI-FINVEST-ADVISOR
```

---

## 2️⃣ Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

## 3️⃣ Run Backend API

```bash
uvicorn backend_main:app --reload --port 8000
```

---

## 4️⃣ Run AI Server

```bash
uvicorn ai_main:app --reload --port 8001
```

---

## 5️⃣ Open Frontend

Open `index.html` using Live Server or your browser.

---

# API Endpoints

## Dashboard Data

```http

```

## Add Transaction

```http
POST /api/transactions
```

## AI Investment Analysis

```http
POST /api/analyze
```

---

# AI Capabilities

The AI module can:

* Analyze investment portfolios
* Detect buy/sell intent
* Suggest portfolio optimization
* Generate investment insights
* Evaluate investment risks

---

# Future Improvements

* Authentication system
* Database integration
* Real stock market APIs
* Machine learning prediction models
* Multi-language support
* Mobile responsive optimization
* Advanced portfolio analytics

---

# Preview

Modern AI FinTech Dashboard with:

* Neon dark UI
* AI assistant
* Portfolio analytics
* Real-time financial visualization

---

#  Author

Developed by **YenFinTechAI-Dev**

GitHub Repository:
https://github.com/YenFinTechAI-Dev/AI-FINVEST-ADVISOR

---

# Support

If you like this project:

* Give this repository a 
* Fork the project
* Contribute new features

---

# License

This project is licensed under the MIT License.
