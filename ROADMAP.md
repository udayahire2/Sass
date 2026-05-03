# Future Improvement Roadmap (Bhavishya Ki Yojna)

This document outlines the planned future features and architectural improvements for the **NMU Study Hub** platform. These enhancements aim to increase scalability, improve user engagement, and streamline administrative workflows.

## 1. ☁️ Cloud Object Storage Integration (AWS S3 / Cloudflare R2)
**Current State:** Avatars, PDFs, and study materials are uploaded directly to the local file system (`backend/uploads/`).
**Future Implementation:** 
- Migrate file storage to a cloud provider like Amazon S3, Cloudflare R2, or Cloudinary.
- **Why:** Local storage does not scale well horizontally, increases server load, and is prone to data loss if the server fails. Cloud storage ensures global CDN delivery, security, and unlimited scalability.

## 2. 📧 Email Notifications & Verification (Nodemailer / Resend)
**Current State:** OTPs and notifications are currently mocked or logged to the console.
**Future Implementation:** 
- Integrate an email service provider (like Resend, SendGrid, or AWS SES).
- Send real emails for Account Verification (OTP), Password Resets, Faculty Approval Notifications, and Peer Review alerts.

## 3. 🔔 Real-Time In-App Notifications (WebSockets)
**Current State:** Users must manually refresh their dashboard to see if a material was approved or if they received feedback.
**Future Implementation:** 
- Implement **Socket.io** to push real-time notifications.
- Notify Faculty instantly when an Admin approves/rejects their material.
- Notify Admins instantly when a new Faculty registration occurs.

## 4. 🤖 AI Study Assistant & Quiz Generation
**Current State:** Study materials are consumed statically.
**Future Implementation:** 
- Integrate LLMs (like OpenAI or Google Gemini APIs).
- **Features:** 
  - Automatically summarize lengthy PDF documents and Markdown notes.
  - Automatically generate 5-10 question MCQ quizzes based on the uploaded syllabus/material text to help students self-evaluate.
  - An interactive chatbot overlay on the study material viewer to answer student queries contextually based on the current topic.

## 5. 🔍 Advanced Search Engine (ElasticSearch / MeiliSearch)
**Current State:** Search relies on basic SQL `LIKE` queries which are slow and strictly exact-match.
**Future Implementation:** 
- Sync the SQLite database with MeiliSearch or ElasticSearch.
- Enable highly performant, typo-tolerant, full-text search across all study materials, topics, and authors.

## 6. ⚡ Redis Caching Layer
**Current State:** Every page load hits the SQLite database directly.
**Future Implementation:** 
- Introduce **Redis** to cache heavily requested public data (e.g., `/subjects`, `/topics`, active syllabus data).
- **Why:** This will drastically reduce database read operations and lower API response times for students browsing the platform.

## 7. 📊 Advanced Analytics & Data Visualization
**Current State:** The admin dashboard has basic numeric stats.
**Future Implementation:** 
- Integrate charting libraries like **Recharts** or **Chart.js**.
- Build a dedicated Analytics tab for Admins to view:
  - Daily/Weekly active users.
  - Most downloaded/viewed study materials.
  - Engagement graphs and top faculty contributors.

## 8. 🛡️ OAuth & Social Login
**Current State:** Standard Email/Password + OTP login.
**Future Implementation:** 
- Integrate Google and GitHub OAuth to allow students to log in with one click without maintaining separate passwords.
