// Starting content. Once you save from the admin page, the site uses the saved copy in Firebase instead.
export default {
  "hero": {
    "eyebrow": "DATA ANALYST · BHUBANESWAR, INDIA",
    "firstName": "Shoumik",
    "lastName": "Chakravarty",
    "lede": "I turn raw data into answers people can act on. I work across the whole pipeline: collecting data from APIs, cleaning it in Python, modelling it in SQL, presenting it in Power BI, and building AI tools on top of it.",
    "email": "shoumik706@gmail.com",
    "phone": "+91 95465 13248",
    "badge": "Open to work",
    "photo": "assets/photo.jpg"
  },
  "stats": [
    {
      "value": "49,026",
      "label": "job postings collected and analyzed"
    },
    {
      "value": "2",
      "label": "internships, in data analytics and Java"
    },
    {
      "value": "7",
      "label": "certifications in data and AI"
    },
    {
      "value": "5+",
      "label": "analytics projects and dashboards"
    }
  ],
  "about": {
    "paras": [
      "I'm a Computer Science undergraduate at Siksha 'O' Anusandhan University with hands-on analytics experience from internships, freelance work and my own projects. I enjoy the full arc of a data problem, from writing the scraper to explaining the finding.",
      "My toolkit is Python, SQL, MySQL, Excel and Power BI, with a growing focus on machine learning, recommendation systems and generative AI. I've recently completed Infosys Springboard courses on OpenAI GPT models, prompt engineering and AI-first software engineering, and I use those skills in the LLM assistant I'm building for my job market project."
    ],
    "focusTitle": "Current focus",
    "focus": [
      "Power BI dashboards",
      "RFM customer segmentation",
      "RAG assistants with LLMs"
    ]
  },
  "links": [
    {
      "name": "Upwork",
      "url": "",
      "note": "Hire me for freelance data analysis, Excel and Power BI work"
    },
    {
      "name": "Wellfound",
      "url": "",
      "note": "Startup roles and internships"
    },
    {
      "name": "GitHub",
      "url": "",
      "note": "Code and notebooks for my projects"
    }
  ],
  "experience": [
    {
      "title": "Data Analyst Intern",
      "org": "Bluestock Fintech",
      "meta": "Pune (Remote) · Mutual Fund Analytics",
      "when": "Jul – Sep 2026",
      "duration": "3 months",
      "kind": "Internship",
      "points": [
        "Collected and processed mutual fund data using Python and APIs.",
        "Designed MySQL tables to store fund details and historical NAV data.",
        "Calculated CAGR, Sharpe Ratio, SIP returns and other fund performance metrics.",
        "Benchmarked fund performance against NIFTY indices to compare risk-adjusted returns."
      ]
    },
    {
      "title": "Freelance Data Analyst",
      "org": "Independent",
      "meta": "Remote",
      "when": "2026 – Present",
      "duration": "Ongoing",
      "kind": "Freelance",
      "points": [
        "Reviewed and fixed an Excel workbook and dashboard for a US collegiate athletics marketing client, delivered ahead of the agreed deadline."
      ]
    },
    {
      "title": "Java Programmer Intern",
      "org": "Codsoft",
      "meta": "Kolkata (Remote)",
      "when": "Feb – Apr 2025",
      "duration": "3 months",
      "kind": "Internship",
      "points": [
        "Built modular, reusable Java applications using object-oriented programming.",
        "Developed an ATM banking application supporting deposits, withdrawals, balance inquiries and transaction handling.",
        "Tested transaction scenarios to ensure the application handled every case accurately."
      ]
    }
  ],
  "projects": [
    {
      "title": "Job Market Intelligence Platform",
      "status": "In progress · 2026",
      "completed": false,
      "icon": "JM",
      "desc": "An end-to-end platform that maps the Indian job market: which skills are in demand, which roles pay what, and what a candidate should learn next. Built as a group project where I lead the data and data science work.",
      "points": [
        "Collected 49,026 unique postings from the Adzuna and Jooble APIs.",
        "Designed a normalized MySQL schema for jobs, companies, locations and skills.",
        "Built a skill-gap and salary-range recommendation engine, validated on real data.",
        "Building a RAG assistant that answers job-market questions with GPT-5 and Ollama."
      ],
      "stack": [
        "Python",
        "MySQL",
        "Power BI",
        "NLP",
        "RAG",
        "FastAPI"
      ],
      "pipeline": [
        {
          "step": "API data collection",
          "state": "done"
        },
        {
          "step": "Cleaning & MySQL schema",
          "state": "done"
        },
        {
          "step": "Power BI dashboards",
          "state": "building"
        },
        {
          "step": "Recommendation engine",
          "state": "done"
        },
        {
          "step": "RAG assistant",
          "state": "building"
        },
        {
          "step": "Web app & deployment",
          "state": "next"
        }
      ]
    },
    {
      "title": "Olist E-commerce Customer Intelligence",
      "status": "In progress · 2026",
      "completed": false,
      "icon": "RFM",
      "desc": "Analysis of the Olist Brazilian e-commerce dataset to understand who the customers are and how to keep them. Cleaned and documented on GitHub; RFM segmentation and a Power BI dashboard with business recommendations are underway.",
      "points": [],
      "stack": [
        "Python",
        "SQL",
        "RFM",
        "Power BI"
      ],
      "pipeline": []
    },
    {
      "title": "Mutual Fund Analytics",
      "status": "Completed · 2026",
      "completed": true,
      "icon": "NAV",
      "desc": "Fund performance analysis built during my Bluestock internship. Measured returns and risk with CAGR, Sharpe Ratio and SIP returns, and benchmarked each fund against NIFTY indices.",
      "points": [],
      "stack": [
        "Python",
        "MySQL",
        "APIs"
      ],
      "pipeline": []
    },
    {
      "title": "Business Dashboards",
      "status": "Completed",
      "completed": true,
      "icon": "BI",
      "desc": "Three Power BI dashboards that surface KPIs and trends: Retail Sales, Customer Churn, and Student Performance & Burnout.",
      "points": [],
      "stack": [
        "Power BI",
        "Excel",
        "DAX"
      ],
      "pipeline": []
    },
    {
      "title": "ATM Banking System",
      "status": "Completed · 2025",
      "completed": true,
      "icon": "ATM",
      "desc": "A Java application with an ATM interface for deposits, withdrawals and balance inquiries, with banking logic that updates balances and processes each transaction.",
      "points": [],
      "stack": [
        "Java",
        "OOP"
      ],
      "pipeline": []
    }
  ],
  "skills": [
    {
      "group": "Programming",
      "items": [
        "Python",
        "SQL",
        "Java"
      ]
    },
    {
      "group": "Data analysis",
      "items": [
        "Data cleaning",
        "EDA",
        "Statistics",
        "RFM segmentation"
      ]
    },
    {
      "group": "Databases & BI",
      "items": [
        "MySQL",
        "Database design",
        "Power BI",
        "Excel",
        "Data visualization"
      ]
    },
    {
      "group": "ML & AI",
      "items": [
        "ML fundamentals",
        "Recommendation systems",
        "NLP",
        "LLMs & RAG"
      ]
    },
    {
      "group": "Generative AI",
      "items": [
        "Prompt engineering",
        "OpenAI GPT models",
        "GPT-3 API",
        "AI-first development"
      ]
    },
    {
      "group": "Tools",
      "items": [
        "REST APIs",
        "Jupyter",
        "Git & GitHub"
      ]
    }
  ],
  "certificates": [
    {
      "title": "Introduction to OpenAI GPT Models",
      "issuer": "Infosys Springboard",
      "date": "Oct 8, 2026",
      "category": "Generative AI",
      "image": "assets/certs/openai-gpt-models.jpg"
    },
    {
      "title": "OpenAI GPT-3 for Developers",
      "issuer": "Infosys Springboard",
      "date": "Oct 8, 2026",
      "category": "Generative AI",
      "image": "assets/certs/gpt3-for-developers.jpg"
    },
    {
      "title": "Prompt Engineering",
      "issuer": "Infosys Springboard",
      "date": "Oct 8, 2026",
      "category": "Generative AI",
      "image": "assets/certs/prompt-engineering.jpg"
    },
    {
      "title": "AI-first Software Engineering",
      "issuer": "Infosys Springboard",
      "date": "Oct 8, 2026",
      "category": "Generative AI",
      "image": "assets/certs/ai-first-software-engineering.jpg"
    },
    {
      "title": "Power of Networking",
      "issuer": "Infosys Springboard",
      "date": "Oct 6, 2026",
      "category": "Professional",
      "image": "assets/certs/power-of-networking.jpg"
    },
    {
      "title": "Job Ready Data Science",
      "issuer": "CodeWithHarry",
      "date": "",
      "category": "Data",
      "image": ""
    },
    {
      "title": "GenAI Powered Data Analytics Job Simulation",
      "issuer": "Tata, via Forage",
      "date": "",
      "category": "Data",
      "image": ""
    }
  ],
  "education": [
    {
      "when": "Expected Jul 2028",
      "title": "B.Tech, Computer Science and Engineering",
      "school": "Siksha 'O' Anusandhan University, Bhubaneswar",
      "details": "Coursework: Data Structures, Algorithms, Object-Oriented Programming, Database Management Systems"
    },
    {
      "when": "Mar 2024",
      "title": "Class XII, Science",
      "school": "Carmel Junior College, Jamshedpur",
      "details": ""
    }
  ],
  "contact": {
    "heading": "Have data that needs answers?",
    "text": "I'm open to data analyst internships, freelance analytics projects and dashboard work. Email is the quickest way to reach me.",
    "location": "Bhubaneswar, Odisha",
    "year": "2026"
  }
};
