import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock,
  FileText,
  Award,
  Laptop,
  MessageSquare,
  Users,
  X,
  Lock,
  Mail,
  UserCheck
} from "lucide-react";

// --- ABSOLUTE COMPREHENSIVE KNOWLEDGE GRAPH DATA ---
const faqDatabase = [
  {
    category: "1. About the internship",
    icon: HelpCircle,
    items: [
      { id: "1.1", q: "What is the Vicharanashala internship?", a: "A two-month, full-time engagement at the Vicharanashala Lab, a research lab at IIT Ropar. You will work on a real open-source project under a mentor, after a short training phase tailored to where you already are. The internship is free — we do not charge, and the work is real." },
      { id: "1.2", q: "What is VINS?", a: "VINS is the Vicharanashala Internship — an online programme open to anyone who clears our interview. The work is real open-source contribution under a mentor, the certificate is from the Vicharanashala Lab for Education Design at IIT Ropar, and the programme itself is free (we charge nothing). There is no stipend. If you are seeing a yellow VINS panel on your result page, you are selected." },
      { id: "1.3", q: "What are the phases of VINS, and what do the badges mean?", a: "VINS is structured as four phases:\n🥉 Bronze (Phase 1) — a short training period at the start. If you arrive comfortable with the basics, your mentor may skip Bronze and put you straight on to the project.\n🥈 Silver (Phase 2) — the main work contributing to a real open-source project. Finishing Bronze and Silver completes your internship and earns the certificate.\n🥇 Gold (Phase 3) — a recognition awarded during Silver if your contribution stands as a meaningful feature, not just a small fix.\n🏆 Platinum (Phase 4) — a standing invitation to visit the lab any time during the year after your internship ends with a small visit stipend." },
      { id: "1.4", q: "Who is the internship for? Are alumni eligible?", a: "The internship is for currently-enrolled students at any college or university — undergraduate, postgraduate, or doctoral. The NOC requirement is the practical reflection of this: we ask for institutional consent that you can commit your time to this internship. Candidates who have already graduated and are not currently enrolled in any programme are not eligible for this cycle." },
      { id: "1.5", q: "Is this the same as IIT Ropar's official Summer Research Internship?", a: "No. Summership 2026 is a VLED Lab initiative. The certificate is issued by the Vicharanashala Lab for Education Design, not centrally by the institute. IIT Ropar runs a separate institutional summer research internship through its own office. Do not represent Summership 2026 as equivalent to that programme." },
      { id: "1.6", q: "I have to attend my class tomorrow/today/some day can I take leave", a: "Leave is not permitted. If you are also attending classes or exams, you will be relieved from the internship immediately and will need to join the next batch when it starts." }
    ]
  },
  {
    category: "2. Timing and dates",
    icon: Clock,
    items: [
      { id: "2.1", q: "When can I start?", a: "You can start any time in 2026 — VINS is flexible on the start date — but your internship must finish by 31 December 2026. That date is non-negotiable. We strongly recommend starting as soon as possible to catch the May–July main cohort window when full Cohort networking, peer discussions, and intensive TA support are concentrated." },
      { id: "2.2", q: "How long is the internship?", a: "Two months from your chosen start date, with an optional one-month grace period if you need it. The absolute end must land on or before 31 December 2026." },
      { id: "2.3", q: "Can I start in July, August or later if I have exams now?", a: "Yes — but only if your exams genuinely make an earlier start impossible. Wait until your exams are done, then opt in and start. Do not attempt to juggle this internship with ongoing exams. Make sure your chosen start date plus 2 months (or 3 with grace) lands on or before 31 December 2026." },
      { id: "2.4", q: "Can I start with the cohort and take a relaxation during my exam window?", a: "No. This is not an arrangement we offer. VINS is a full-attention internship requiring six to ten hours a day. Splitting that with college exams damages both sides. If your exams fall inside the cohort duration, defer your start to after your exams end. If we later learn that a candidate was sitting college exams during their internship period, we reserve the right to terminate the internship or withhold the certificate." },
      { id: "2.5", q: "Can I take leave or get an exemption during the internship for an exam scheduled in June?", a: "The attendance rule is firm — the 55-day continuous window is a non-negotiable part of the internship, and we cannot offer an exemption for an exam during this period. The policy exists because split attention damages both your exam preparation and your internship work." },
      { id: "2.6", q: "Are orientation session recordings shared with interns, and can project or group assignments be changed after watching them?", a: "Recordings of the sessions will not be provided. However, we may provide access to an abridged version of a talk or session if we consider it important. We do not guarantee this for every session." }
    ]
  },
  {
    category: "3. NOC (No Objection Certificate)",
    icon: FileText,
    items: [
      { id: "3.1", q: "What dates do I put on the NOC?", a: "Default: your chosen start date → your start + 2 months (with up to 1 month grace), ensuring the end date is on or before 31 December 2026. Pick the earliest start date you can realistically make — the May–July summer window is the main cohort. If the NOC will be signed on a specific later date, pick a start date after the signature date." },
      { id: "3.2", q: "Who can sign the NOC?", a: "Any authorised signatory at your college: HOD, Acting HOD (during holidays), Principal, Dean, Director, or Training & Placement Officer. For dual-degree students, either institution can sign — pick whichever is easier. For IITM BS Online Degree (standalone) students, any officer from the BS office can sign." },
      { id: "3.3", q: "When do I submit the NOC? Is the deadline hard?", a: "There is no specific calendar cut-off date by which the NOC must be uploaded — but your internship cannot formally begin until your official institutional NOC has been uploaded and validated by us. So submit your signed NOC as early as possible and join the current summer cohort." },
      { id: "3.4", q: "What format should I use? Do I need to design it myself?", a: "No — we provide a printable NOC format. Once your result is out and you log in to samagama.in, you will see a 'Download blank NOC' button on your dashboard. Take a printout, get it physically signed and stamped by your authorised signatory, scan it, and upload the signed PDF using the 'Upload signed NOC' button. You do not need college letterhead; the format we provide is the canonical layout." },
      { id: "3.5", q: "What if my college / Program Chair gives me an NOC in their own format?", a: "A college's own NOC format is acceptable, as long as all of the required entries are present on it: the signing authority's handwritten signature, their name, designation, official email address, and phone number, your full name and the internship period, and your signature." },
      { id: "3.6", q: "Does it need to be signed by hand?", a: "Yes. Three things are required on our format: the authorised signatory's handwritten signature, the institutional rubber stamp/seal applied in the designated area, and the signatory's email address filled in the designated field for verification. Digital signatures are not accepted on the PDF path." },
      { id: "3.7", q: "Can my HOD email the NOC instead of uploading it?", a: "No. Your NOC must be uploaded by you, the student, from your dashboard — we no longer accept NOCs sent by email. The email-forward path has been retired. NOCs emailed to us will not be processed." },
      { id: "3.8", h: "NOC Download/Upload Location", q: "How do I download and upload the NOC?", a: "Both happen on your dashboard at samagama.in once your result is out. You will see a NOC section with two buttons in three places: a compact pill in the dark header bar, a standalone NOC card on the dashboard, and a NOC section at the bottom of your full Result message itself. Use 'Download blank NOC' and 'Upload signed NOC (PDF)'." },
      { id: "3.9", q: "What if my NOC is not formally verified?", a: "NOC verification takes time — typically anywhere between an hour and one full working day from the moment you upload. Your offer letter is issued automatically once your signed institutional NOC is uploaded and validated. The earlier self-declaration path was retired on 2026-05-27." },
      { id: "3.10", q: "My online course (Masai, NPTEL, Coursera, etc.) won't issue an NOC. What do I do?", a: "The internship is open only to candidates currently enrolled in a full-time degree programme at a recognised college or university. Online-only courses do not by themselves make a candidate eligible. If concurrently enrolled in a full-time degree elsewhere, obtain the NOC from that college." },
      { id: "3.11", q: "My HOD/college official wants written confirmation before signing my NOC. What do I show them?", a: "Your selection is already confirmed the moment your yellow VINS (or green VISE) result panel appears on your samagama.in dashboard. There is no separate written confirmation letter issued before the NOC step. Show them your dashboard as evidence." },
      { id: "3.12", q: "Can Prof. Sudarshan Iyengar or a faculty member from IIT Ropar sign my NOC for the internship?", a: "Your NOC must be signed by an authorised signatory at the institution where you are enrolled as a student. Prof. Sudarshan Iyengar is a faculty member at IIT Ropar and is not the authorised signatory for the separate IIT Ropar/Masai online AIML programme. He cannot sign your NOC in a personal capacity." }
    ]
  },
  {
    category: "4. Selection, offer letter, and certificate",
    icon: Award,
    items: [
      { id: "4.1", q: "How do I know I am selected?", a: "If you can see your yellow VINS result panel on samagama.in, you are selected. There is no separate selection step or confirmation email." },
      { id: "4.2", q: "How do I opt into VINS?", a: "Tell Yaksha in the chat: 'I want to take up the online internship without stipend.' Yaksha will confirm. Opting in is the selection — no separate confirmation email is sent at that stage." },
      { id: "4.3", q: "When do I get the offer letter?", a: "Your offer letter is issued automatically once you upload your signed institutional NOC and confirm your internship dates on the dashboard, typically within an hour to one full working day of upload. Log in and click 'Download Offer Letter' from the Offer Letter card on your dashboard." },
      { id: "4.4", q: "Will I get a certificate?", a: "Yes — every intern who completes the internship gets a certificate from Vicharanashala, IIT Ropar. The internship is genuinely demanding; candidates who drop out mid-way do not get a certificate." },
      { id: "4.5", q: "How do I confirm my internship dates?", a: "Once you have opted into VINS in the chat, log in to samagama.in. On the dashboard, you will see a yellow card titled '🗓️ Confirm your internship dates'. Save or edit the dates to your earliest realistic start. Your end must be on or before 31 December 2026." },
      { id: "4.6", q: "I am a minor/major in AI student, can I join the programme? I don't need a NOC as I am from IIT Ropar", a: "Minor/Major in AI courses from IIT Ropar are certification courses and will have a different track of internship equivalent to them. Kindly write to us separately for this. You must be a registered student in a UG/PG programme with some university." },
      { id: "4.7", q: "How do I accept the offer letter?", a: "Reply All on the offer-letter thread (no-reply@vicharanashala.ai with sudarshan@iitrpr.ac.in kept on cc) within 5 days. Paste this statement exactly:\n'I, [Full Name], confirm that I have read, understood, and accepted all terms, conditions, and obligations set out in this offer letter and in the program FAQ at samagama.in. I formally accept the offer of Summer Internship 2026.' Alternatively, you can scan and sign the block on the PDF acceptance block." },
      { id: "4.8", q: "What if I reply without using the exact acceptance format printed in the letter?", a: "The offer is withdrawn, effective immediately, with no further correspondence. The withdrawal is final. This is a deliberate policy testing your attention to detail." },
      { id: "4.9", q: "I received a withdrawal email because I didn't accept the offer letter correctly. Can it be reversed?", a: "To appeal, send a fresh email to sudarshansudarshan@gmail.com with the exact subject line: 'Request to Reconsider: Confirmation Reply Error'. If granted, you will be placed on a separate track with an additional course on attention to detail." },
      { id: "4.10", q: "What happens after I send my acceptance? My dashboard doesn't update.", a: "The dashboard tracks your NOC, internship dates, and your offer letter — it does not track the acceptance email. We process acceptance emails manually. If your reply was compliant, you are accepted and the internship will proceed." },
      { id: "4.11", q: "Can I change my internship dates?", a: "Before the offer letter is issued: yes — open the Confirm Internship Dates card on your dashboard and edit the dates. After the offer letter is issued: no. Dates are final." },
      { id: "4.12", q: "When and how do I get the Zoom link for the kickoff meeting?", a: "The kickoff orientation is held for the main summer cohort only. The Zoom link is delivered via email to your registered samagama.in address and your Yaksha chat portal." },
      { id: "4.13", q: "My NOC is not ready but my start date is approaching. What do I do?", a: "Your start date cannot be honoured until your official NOC is uploaded and validated by us. If your NOC is not in by your chosen start date, your start simply shifts to whenever it is validated." },
      { id: "4.14", q: "When does my internship actually begin? Will I receive a notification on the day?", a: "Your internship begins on the start date you confirmed on the dashboard, provided your official NOC has been validated. There is no separate notification message sent on the day. On that morning, log in to samagama.in and Yaksha will guide you through your Day-1 steps." },
      { id: "4.15", q: "Can I switch from VINS (online) to VISE (offline) after being selected?", a: "No. The two tracks are finalised at the interview stage, and we do not move candidates between them. VISE has a fixed on-campus capacity. The project, the mentor, and the certificate are exactly the same." },
      { id: "4.16", q: "Can I change my internship dates after the offer letter?", a: "No. Once your offer letter has been issued, the dates you confirmed are final. They will not be changed at this stage." },
      { id: "4.17", q: "How do I get the link for the daily Zoom standups? Are they mandatory?", a: "Daily Zoom standup links are posted in the Announcements section on your samagama.in dashboard. Attending the daily standups is strictly mandatory. Late joiners must complete a special proctored catch-up orientation path on ViBe before participating." },
      { id: "4.18", q: "How do I provide my Zoom ID, and why does it matter?", a: "On your dashboard, enter the exact email address linked to your Zoom account under 'Provide your Zoom ID'. This matters because we match your live-session attendance and participation parameters using this email." },
      { id: "4.19", q: "I saved the wrong Zoom ID — can I change it?", a: "Once saved, your Zoom ID is final and cannot be changed by you. If you entered it wrong, type #escalate in the Yaksha chat with your correct Zoom email and our team will fix it for you." }
    ]
  },
  {
    category: "5. Work, mentorship, and projects",
    icon: Laptop,
    items: [
      { id: "5.1", q: "What will I work on?", a: "A real open-source project from Vicharanashala's portfolio assigned based on your background and the lab's current needs (AI/ML, web development, NLP, computer vision, agriculture-tech Annam.AI, education-tech ViBe, etc.)." },
      { id: "5.2", q: "How many hours per day?", a: "Plan for 6 to 10 hours a day, sometimes more during the build phase. This is a full-time internship for the two-month window. VINS expects your full, split-free attention." },
      { id: "5.3", q: "Who is my mentor?", a: "You will work with the lab's research and engineering team. The model is fluid — you will get help from a senior researcher one day, a peer the next, and someone else for a different question." },
      { id: "5.4", q: "Is there a stipend?", a: "No. The internship is unpaid. Stellar performers may be recognised with a discretionary stipend at the lab's option, but this is not promised or expected." },
      { id: "5.5", q: "Do I need my own laptop? Should I preload any software?", a: "Yes — a personal laptop is required. We prefer Linux or macOS. If you use Windows, please install Windows Subsystem for Linux (WSL) or a tool like PuTTY. You will be SSH-ing into machines and using the command line." },
      { id: "5.6", q: "I am using a different email on GitHub / Zoom / the learning platform. Is that okay?", a: "No. Your registered email is your sole identifier across all programme platforms. Mismatches between platforms cannot be retroactively corrected — ensure you use your registered email everywhere from day one." },
      { id: "5.7", q: "Why has my mentor not been assigned yet, or contacted me on day 1?", a: "Mentors are not assigned on day 1. You will be assigned a mentor when you move on to the project phase of VINS. Before that, you must complete the mandatory coursework of the Bronze phase. Also note: we do not run a Discord server." }
    ]
  },
  {
    category: "6. Code of conduct — communication channels",
    icon: MessageSquare,
    items: [
      { id: "6.1", q: "What are the official communication channels?", a: "Official channels only, in this order:\n1. Announcements section on samagama.in.\n2. Yaksha chat on samagama.in (use #escalate to reach a human).\n3. Discussion forum for peer collaboration.\n4. Email to sudarshansudarshan@gmail.com as a last resort.\n⚠️ WhatsApp support is cancelled. Unofficial groups are strictly prohibited. Creating, joining, or operating any unofficial WhatsApp/Telegram/Discord group or contacting interns via personal phone numbers will lead to immediate termination of your internship." }
    ]
  },
  {
    category: "7. Interviews Related",
    icon: Search,
    items: [
      { id: "7.1", q: "My interview is not marked as complete on the dashboard — what do I do?", a: "A data-sync issue sometimes occurs where the chat session closes but the interview record doesn't update. The team will check your record and manually mark it as complete within 1–2 hours. If it continues to show incomplete, write to us at sudarshansudarshan@gmail.com." }
    ]
  },
  {
    category: "8. Certificate",
    icon: FileText,
    items: [
      { id: "8.1", q: "Does Vicharanashala send a grade report or evaluation to my university for internship credit?", a: "Vicharanashala does not send formal evaluation or grade reports to universities — that process is between you and your college. The completion certificate is the document you can submit to your college." },
      { id: "8.2", q: "Does the Vicharanashala internship certificate specify whether it was completed online or offline ?", a: "The certificate you receive on completing the internship is the same for both tracks. It is issued by Vicharanashala, IIT Ropar, and does not specify whether you completed it online or on campus." },
      { id: "8.3", q: "Will the completion certificate be a physical hardcopy or an e-certificate?", a: "The completion certificate is issued as an e-certificate — you download it from your dashboard on samagama.in after completing both Bronze and Silver. We do not print and mail physical copies." },
      { id: "8.4", q: "Is there a WhatsApp group for candidates during the internship?", a: "No. See §6.1 for the official communication channels." }
    ]
  },
  {
    category: "9. Rosetta — your internship journal",
    icon: BookOpen,
    items: [
      { id: "9.1", q: "What is Rosetta?", a: "Rosetta is your internship journal — a 65-day document, one entry per day, every day, for the full duration of Summership 2026. You write in it daily, keep it privately, and submit it at the end of the internship as a completion requirement." },
      { id: "9.2", q: "Why does this exist? Is it just busywork?", a: "No. It helps you process and articulate what you learned and where you struggled. For the lab, it provides invaluable qualitative insight into your experience to help make future cohorts better." },
      { id: "9.3", q: "What is a \"thinking routine\"?", a: "Each day has a short framework that gives your reflection a specific shape (e.g. 3-2-1 prompts, Muddy/Clear targets, What? So What? Now What? bounds). Read the description at the top of each day's entry and write." },
      { id: "9.4", q: "How do I get my Rosetta journal?", a: "Your journal will be shared with you as a Google Doc template link during orientation. Open the link, make a copy to your own Google Drive, rename it, and work in your own private copy." },
      { id: "9.5", q: "How do I use it day to day?", a: "Open your Rosetta Google Doc, scroll to today's day number, fill in the date, read the thinking routine, answer the three prompts in the writing boxes below. It takes 10 to 20 minutes." },
      { id: "9.6", q: "How long should each entry be?", a: "There is no strict word count. A good entry is honest and specific. Three to five sentences per prompt is usually enough. One-word answers or vague non-answers are completely unacceptable." },
      { id: "9.7", q: "What is the one rule?", a: "Write what is true. Not what sounds impressive or what you think we want to read. We will know immediately if an entry reads like an LLM wrote it." },
      { id: "9.8", q: "Can I use ChatGPT or any AI tool to write my entries?", a: "No. This is the one firm rule of Rosetta. Entries that read as AI-generated will not be counted toward your completion requirement. If your entire journal reads this way, it will be rejected." },
      { id: "9.9", q: "What if I miss a day?", a: "Fill it in as soon as you can. Write the actual date you are filling it in, and be honest about the fact that you are writing it late and why." },
      { id: "9.10", w: "Rosetta Privacy", q: "Will anyone read my journal during the internship?", a: "No. We will not access your journal during the 65 days. The only time we read it is after you submit it at the end of the internship so you can write freely and honestly." },
      { id: "9.11", q: "Can the prompts change mid-internship?", a: "Occasionally we may update a prompt for a specific day based on what is happening in the cohort. When this happens, we will announce it in the Announcements section on samagama.in before that day begins." },
      { id: "9.12", q: "How do I submit Rosetta at the end?", a: "On or before Day 65, share your Rosetta Google Doc with the coordinator's email address and set the sharing permission to Viewer." },
      { id: "9.13", q: "I have a question about Rosetta that is not answered here. What do I do?", a: "Ask Yaksha first. If Yaksha cannot answer it, escalate to your programme coordinator." },
      { id: "9.14", q: "My college requires a written confirmation that the internship is self-paced and will not clash with college classes — what document can I share with them?", a: "This is not a self-paced internship, but a very rigorous one which is time-demanding. It is not permitted for one to be part of any other activity during this period." }
    ]
  },
  {
    category: "10. Phase 1 — coursework, Vibe LMS, and live sessions",
    icon: Award,
    items: [
      { id: "10.1", q: "I've previously interned with VLED — am I exempt from any coursework?", a: "Yes — partially. If you previously completed the MERN Stack coursework, you don't need to repeat it. However, the AI Fundamentals course is a new addition this cycle and is mandatory for everyone. Type #exemption from mern stack course in Yaksha chat to claim it." },
      { id: "10.2", q: "How do I register for the AI Fundamentals course on Vibe?", a: "Click the registration link in the Announcements section on samagama.in at Phase 1 launch. Sign in or create a Vibe account using your Samagama Gmail, and click the link a second time to enrol." },
      { id: "10.3", q: "I registered on Vibe with a different email than my Samagama email — is that OK?", a: "Please use the same email. If you must use a different Gmail due to Samagama being a college alias email, tag Yaksha in your chat using: '#vibe-email your-gmail@gmail.com' so we can link the records." },
      { id: "10.4", q: "Are live sessions mandatory if I'm on the viva route?", a: "Yes — live sessions are mandatory for every single intern, regardless of path. You are expected to attend every live session to engage in knowledge exchange across the cohort." },
      { id: "10.5", q: "Where do I find the daily live-session schedule?", a: "The daily schedule is posted in the Announcements section on samagama.in at least 1 hour before the session begins. Check it regularly during working hours." },
      { id: "10.6", q: "Can we register and start the vibe courses before our internship date formally starts?", a: "No. You will receive the viBE course link only after your internship formally starts." },
      { id: "10.7", q: "What are the attendance and participation rules?", a: "Tracked strictly over a rolling window of the last 5 working days:\n1. Live-session attendance — at least 85% of total Zoom meeting time.\n2. Live participation — at least 85% of in-session polls/quizzes.\n3. Quizzes — attempted and passed with at least 50% score.\nIf you fall below any threshold, you will be moved to the next batch." },
      { id: "10.8", q: "What are Spurti Points (SP)? Do they affect my internship?", a: "Spurti Points (SP) are a points layer that reflects your overall engagement, and they are currently in an early beta phase. No negative decision is taken on SP alone. Higher SP can be a nice upside for small perks or recognition." }
    ]
  },
  {
    category: "11. Yaksha Chat Related",
    icon: MessageSquare,
    items: [
      { id: "11.1", q: "I'm unable to type in the chat after clicking 'Interact with Yaksha' — what should I do?", a: "After logging into your Yaksha portal, if the field shows that you can't type, scroll up to the top of your window and click on the 'Chat with Yaksha' button to activate Yaksha." }
    ]
  },
  {
    category: "12. ViBe Platform",
    icon: Laptop,
    items: [
      { id: "12.1", q: "How do I log in to ViBe?", a: "Go to https://vibe.vicharanashala.ai/auth, sign up as a student with your registered email, check the 'Notifications' tab in the top right of the dashboard, and accept the course invite." },
      { id: "12.2", q: "Invite accepted but shows \"No course enrolled\"?", a: "Verify the registered email address. Try personal WiFi instead of college network paths. If persistent, turn off third-party cookie blocking for .vicharanashala.ai in your browser settings, and change your laptop DNS configuration to Google DNS (8.8.8.8 / 8.8.4.4) followed by an ipconfig /flushdns cache wipe execution." },
      { id: "12.3", q: "Why are videos stuck or repeating?", a: "This happens due to ViBe's monitored learning system. Videos must be watched fully and in sequence. Camera/microphone permissions must be allowed, and switching tabs or staying idle will pause or restart the video loop." },
      { id: "12.4", q: "Can I use a mobile or tablet?", a: "No, only desktop/laptop layout parameters are supported." },
      { id: "12.5", q: "I'm experiencing video issues (stuck, looping, skipping) on ViBe. How do I troubleshoot?", a: "Refresh the page, inspect the browser console for network logs, log out and log back in, clear browsing cache data, or report to Yaksha via '#escalate-ViBe'." },
      { id: "12.6", q: "I have completed all videos and quizzes in the ViBe course, but my progress is still showing less than 100%. What should I do?", a: "This might be a skip made due to a penalty score segment where a quiz item wasn't successfully marked. Verify that you've completed all course items (1006/1006). If not, retry the missed item contents." },
      { id: "12.7", q: "I feel the ViBe content or platform is not good or I am unhappy with the way progress is evaluated. Can I request an exception or bypass the system?", a: "There is an alternative path: watch specified content on YouTube and appear for a highly rigorous three-hour proctored exam under strict live human proctor supervision with a dual-camera view setup. Scoring below 80% requires you to retry or rejoin the next cohort on ViBe." },
      { id: "12.8", q: "Is the ViBe consent form compulsory? What if I don't want to grant camera access?", a: "Yes — the consent form is compulsory. Proctoring requires access to your webcam and microphone to ensure integrity and active participation. ViBe does not continuously record videos; it operates via real-time presence checks." },
      { id: "12.9", q: "What are penalty scores on the ViBe platform, and how do they affect our performance or HP?", a: "Penalty scores are generated when anomalies are detected (e.g. irregular behavior or moving away while watching video lessons). High penalty scores require you to rewatch the video and retake the quiz, but they currently do not impact your performance scores or evaluation thresholds." },
      { id: "12.10", q: "When should I use the Flag option on ViBe, and when should I contact support?", a: "Use the Flag feature on ViBe only for course content-related issues (video typos, incorrect quiz keys). For technical platform execution errors or logistics queries, contact Yaksha directly." },
      { id: "12.11", q: "What is Linear Progression on ViBe?", a: "Linear progression is enabled for every course on ViBe. You must watch the videos and attempt the quizzes in the exact sequential order they appear on the left panel. Skipping is blocked by design." },
      { id: "12.12", q: "Can I use the left navigation panel to jump ahead to a later video or quiz?", a: "No. The left panel is only a progress map. You must click 'Next Quiz' or 'Next Lesson' on the active dashboard view. Attempting to skip ahead triggers the 'Access Restricted' block." },
      { id: "12.13", q: "I am seeing a red \"Access Restricted\" banner. Is this a bug?", a: "No, this is an intentional alert. It appears when you try to open an item out of sequence. ViBe automatically returns you to your last valid content vector." },
      { id: "12.14", q: "How do I resolve the \"Access Restricted\" error?", a: "Scroll through your left panel from the beginning, look for any item without a completion tick, complete that missed item, and refresh the page. If stuck, report to Yaksha mentioning #escalate-ViBe." },
      { id: "12.15", q: "Why does ViBe sometimes make me re-watch a clip after a quiz?", a: "If your check-in answer didn't go through correctly, ViBe returns you to that clip to help the core ideas stick before unlocking the next module. It does not count against your performance scores." },
      { id: "12.16", q: "What kinds of quiz questions will I see on ViBe?", a: "Four formats: Pick one (MCQ), Pick one or more (MSQ), Type a number (NAT), and True or False check targets. Watch the clip first in full before attempting to answer." },
      { id: "12.17", q: "Are the same proctoring rules applied to every course on ViBe?", a: "No. ViBe's proctoring system is completely modular. Instructors independently switch individual checks on or off depending on the course or cohort design scope." },
      { id: "12.18", q: "What does the \"quiet helper\" on ViBe actually do?", a: "It runs locally on your browser using your camera and microphone to ensure basic learning parameters are present: verifying face visibility, checking single-face boundaries, mapping lighting levels, flagging background voices, and confirming gaze metrics." },
      { id: "12.19", q: "Does ViBe record long videos of me while I'm learning?", a: "No. It uses your sensors for real-time presence checks only. Long recordings are never stored on our servers." },
      { id: "12.20", q: "What is the single most common avoidable mistake learners make?", a: "Sitting with a window directly behind you during the day. The camera sees only a dark silhouette where your face should be. Move so the window or lamp light is to your side or in front of your screen." },
      { id: "12.21", q: "Why does the lesson keep pausing or restarting even when I'm paying attention?", a: "Check this environment list: Is your face too dark? Are you partly out of frame? Are there voices or a TV playing in the room? Did you switch tabs? Are browser permissions for camera/mic set to Allow?" },
      { id: "12.22", q: "Can I read the quiz questions aloud or mutter to myself while watching?", a: "It's best not to. The microphone filters for background voices, and muttering can trigger anomaly flags. Watch and answer in silence." },
      { id: "12.23", q: "Can I study with a friend on camera since we're learning together?", a: "In most proctored internship modules, no. Only the registered learner should be in the camera frame. The platform verifies single-face presence unless collaborative pairing modes are explicitly enabled by the admin." },
      { id: "12.24", q: "Will I lose my progress if I clear my browser or reinstall it?", a: "No. Progress data records are saved on our central servers tied to your email, not locally in your browser storage." },
      { id: "12.25", q: "Is there a recommended daily learning rhythm on ViBe?", a: "Yes — short, regular sessions beat marathon cramming. Aim for the progress milestone target announced for your specific cohort (typically around 3.33% progress per day)." },
      { id: "12.26", q: "What should my \"study corner\" look like before I start a ViBe session?", a: "Ensure light is in front of your face, confirm you are the only one in the camera frame, and make sure the room is reasonably quiet with no background voices." }
    ]
  },
  {
    category: "13. Team Formation",
    icon: Users,
    items: [
      { id: "13.1", q: "Is team formation compulsory?", a: "Yes. All projects in Phase 2 and Phase 3 must be completed in teams. Every participant is required to be part of a team." },
      { id: "13.2", q: "What is the size of a team?", a: "The team size is fixed at four members. This is mandatory — you cannot have fewer or more members in a team at the time of final formation." },
      { id: "13.3", q: "How are teams formed?", a: "For students who joined on May 15 and 16: Teams were formed through a structured activity. For students joining later: Teams will be randomly assigned by the administration." },
      { id: "13.4", q: "I started on May 15/16 but couldn't form a team during the activity. What happens now?", a: "You will be randomly assigned to a team by the administration." },
      { id: "13.5", q: "There was a typo in our email addresses during team formation. Can we fix it?", a: "No action is required from your side. The administration will verify and match email IDs with names before locking teams." },
      { id: "13.6", q: "I formed a team with only two members. Will it be considered?", a: "No. Teams with fewer than four members will be expanded by adding additional members to make a final team of four." },
      { id: "13.7", q: "What if a team member leaves or becomes ineligible during Phase 1?", a: "The administration will attempt to assign a replacement member. If none is found, you may continue as a team of three. Inform the admin immediately." },
      { id: "13.8", q: "Can I form a team with someone from my own college?", a: "No. Teams must consist of members from different institutions to encourage networking. Exception: Students from the same institution but different physical campus locations may be allowed." },
      { id: "13.9", q: "Can I form a team with students from my IIT MBS cohort?", a: "No. You are explicitly encouraged to collaborate with participants outside your existing cohort." },
      { id: "13.10", q: "Can we change our team name after submission?", a: "Yes, team names are tentative and can be changed. However, frequent changes are discouraged due to operational logging metrics." },
      { id: "13.11", q: "What if multiple teams choose the same name?", a: "Teams will be distinguished using automatic alphanumeric suffixes (e.g., Team X-1, Team X-2, etc.)." },
      { id: "13.12", q: "What should I do if I face issues within my team?", a: "Report any concerns immediately to your assigned scholar or mentor. Maintaining a safe and respectful environment is a high priority." },
      { id: "13.13", q: "How will I know who my mentor is?", a: "Mentors are assigned when your team completes Phase 1 and moves to your specific matched open-source project repository stream in Phase 2." },
      { id: "13.14", q: "When will I know my team details?", a: "Team details and final lists are announced directly in the Announcements section on samagama.in." },
      { id: "13.15", q: "I received a team list email but my name is not included. What should I do?", a: "Team announcements are phased, so your name may appear in a later list. If your entire cohort has moved to team activities and you are still unassigned, raise #escalate in Yaksha chat." },
      { id: "13.16", q: "We selected Project X as our top priority but were assigned Project Y. Can we change it?", a: "No. Project assignments are final and cannot be changed. Allocation is done to ensure balanced distribution across project repositories." },
      { id: "13.17", q: "I just started the internship. Can I form my own team now?", a: "No. For later cohorts, teams will be randomly assigned. Please wait for the official communication on your dashboard." },
      { id: "13.18", q: "When do team activities begin?", a: "Team-based work begins in Phase 2. During Phase 1 (online coursework), you do not need to worry about team activities." },
      { id: "13.19", q: "Can I request a specific teammate after teams are assigned?", a: "No. Team assignments are final and requests for changes are not entertained." },
      { id: "13.20", q: "What happens if a team member is inactive or not contributing?", a: "You should report the issue to your mentor/scholar early. Prolonged inactivity will lead to administrative intervention or termination." },
      { id: "13.21", q: "Can I switch teams if there are conflicts?", a: "Team switches are not allowed except in exceptional, admin-approved cases involving serious verified concerns." },
      { id: "13.22", q: "Will team performance affect individual evaluation?", a: "Yes. While some components are individual, team deliverables are a key part of your final completion criteria evaluation." },
      { id: "13.23", q: "How will communication happen within teams?", a: "Teams self-organise internal coordination over LinkedIn or email only, limited to their own team members. Creating a team WhatsApp group is strictly prohibited under §6.1 and will lead to immediate termination." },
      { id: "13.24", q: "What if I miss the team allocation announcement?", a: "All programme updates are posted in the Announcements section on samagama.in. Log in and check it regularly." },
      { id: "13.25", q: "Can a team be dissolved and reformed?", a: "No. Once finalized, teams are locked and cannot be dissolved." },
      { id: "13.26", q: "What happens if I drop out of the internship?", a: "Your team will be adjusted accordingly, and the remaining members may continue as a team of three or receive an administrative replacement." },
      { id: "13.27", q: "Will we get time to get to know our teammates before Phase 2?", a: "Yes. There is typically a buffer period before Phase 2 where teams can connect over official channels and prepare together." }
    ]
  }
];

export function YakshaSearch({ onAskCommunity, currentView, onInterceptNavigate, isAuthenticated, onLoginSuccess }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [feedback, setFeedback] = useState("none");
  const [discrepancy, setDiscrepancy] = useState("");
  const [activeFaqCategory, setActiveFaqCategory] = useState(null);
  const [openFaqItem, setOpenFaqItem] = useState(null);
  
  // Auth Modal State Machine
  const [authModal, setAuthModal] = useState({ isOpen: false, pendingAction: null });
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const showSuggestions = open && q.trim().length > 2;
  
  const searchResults = React.useMemo(() => {
    if (!showSuggestions) return [];
    const searchToken = q.toLowerCase();
    const matches = [];
    
    faqDatabase.forEach(categoryGroup => {
      categoryGroup.items.forEach(item => {
        if (item.q.toLowerCase().includes(searchToken) || item.a.toLowerCase().includes(searchToken)) {
          const confidenceScore = item.q.toLowerCase().startsWith(searchToken) ? 95 : 82;
          matches.push({
            id: item.id,
            question: item.q,
            answer: item.a,
            match: confidenceScore,
            upvotes: Math.floor(Math.random() * 50) + 10,
            answeredBy: { name: "Sara AI Engine", role: "System Knowledge Graph" }
          });
        }
      });
    });
    return matches;
  }, [q, showSuggestions]);

  // Protected Action Interception Gateway Handler
  const executeProtectedAction = (actionType, callback) => {
    if (isAuthenticated) {
      callback();
    } else {
      setAuthError("");
      setAuthModal({ isOpen: true, pendingAction: { type: actionType, proceed: callback } });
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError("Please fill out all credential fields.");
      return;
    }
    // Strict mock criteria parsing to unblock session storage metrics layout tokens
    if (emailInput.includes("@") && passwordInput.length >= 4) {
      onLoginSuccess({ email: emailInput, name: emailInput.split("@")[0] });
      const actionToExecute = authModal.pendingAction;
      setAuthModal({ isOpen: false, pendingAction: null });
      setEmailInput("");
      setPasswordInput("");
      
      if (actionToExecute && actionToExecute.proceed) {
        actionToExecute.proceed();
      }
    } else {
      setAuthError("Invalid email layout structure or password criteria length too short.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      {/* Search Header Banner */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-4"
        >
          <Sparkles className="w-3 h-3" />
          Redundancy check powered by Sara AI
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Ask once. <span className="text-gradient">Help everyone.</span>
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Before posting, Sara checks if your question already has a verified answer in the campus knowledge graph.
        </p>
      </div>

      {/* Main Vector Interception Search Bar */}
      <div className="relative z-40 max-w-3xl mx-auto">
        <div
          className={`relative flex items-center gap-3 bg-card border rounded-2xl px-5 py-4 shadow-elegant transition-all ${
            showSuggestions ? "ring-2 ring-primary/20 border-primary" : "border-border"
          }`}
        >
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setExpanded(null);
              setFeedback("none");
            }}
            placeholder="Search all 13 categories (e.g., NOC dates, ViBe proctoring, Rosetta)..."
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground text-foreground"
          />
          <kbd className="hidden md:inline-flex h-6 px-2 items-center rounded-md bg-secondary text-[10px] font-mono text-muted-foreground border border-border">
            ⌘ K
          </kbd>
        </div>

        {/* Live Dropdown Vector Matches Wrapper */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 mt-3 bg-card border border-border rounded-2xl shadow-elegant overflow-hidden max-h-[500px] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40 sticky top-0 bg-card z-10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 anonymity-pulse animate-pulse-ring" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {searchResults.length} knowledge vectors matched your search token
                  </span>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">sara match graph</span>
              </div>

              {searchResults.length > 0 ? (
                <div className="divide-y divide-border">
                  {searchResults.map((s) => {
                    const high = s.match >= 80;
                    const isOpen = expanded === s.id;
                    return (
                      <div key={s.id} className="bg-card">
                        <button
                          onClick={() => {
                            setExpanded(isOpen ? null : s.id);
                            setFeedback("none");
                          }}
                          className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-secondary/60 transition-colors"
                        >
                          <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tabular-nums ${
                            high ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"
                          }`}>
                            {s.match}% Match
                          </span>
                          <span className="flex-1 text-sm font-medium text-foreground">{s.question}</span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden bg-gradient-to-b from-secondary/40 to-transparent border-t border-border/40"
                            >
                              <div className="px-5 py-5 space-y-4">
                                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line bg-card p-4 rounded-xl border border-border">
                                  {s.answer}
                                </p>

                                {feedback === "none" && (
                                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
                                    <span className="text-sm font-medium text-foreground">Was this Sara result useful?</span>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => setFeedback("yes")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-success text-success-foreground hover:opacity-90 transition">
                                        <ThumbsUp className="w-3.5 h-3.5" /> Yes
                                      </button>
                                      <button onClick={() => setFeedback("no")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary hover:bg-accent text-foreground transition">
                                        <ThumbsDown className="w-3.5 h-3.5" /> No
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {feedback === "yes" && (
                                  <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/30 text-success text-sm">
                                    <Check className="w-4 h-4 shrink-0" />
                                    <span>Thank you! This log has been submitted to refine the AI's validation metrics.</span>
                                  </div>
                                )}

                                {feedback === "no" && (
                                  <div className="space-y-3 p-3 rounded-xl bg-card border border-border">
                                    <label className="text-xs font-medium text-muted-foreground">Briefly tell us what's different:</label>
                                    <textarea
                                      value={discrepancy}
                                      onChange={(e) => setDiscrepancy(e.target.value)}
                                      rows={2}
                                      placeholder="e.g., My online program didn't issue an NOC, how do I clear my tracking loop?..."
                                      className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm border border-border outline-none resize-none text-foreground"
                                    />
                                    <div className="flex justify-between items-center">
                                      <button onClick={() => setFeedback("submitted")} disabled={!discrepancy.trim()} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-foreground text-background disabled:opacity-40">
                                        Submit feedback
                                      </button>
                                      <button 
                                        onClick={() => executeProtectedAction("DRAFT_QUERY", onAskCommunity)} 
                                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                                      >
                                        Ask the community instead <ArrowRight className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                  
                  {/* None of these match bottom intercept option inside search suggestion drawer */}
                  <div className="p-3 bg-muted/20 border-t border-border flex justify-center">
                    <button
                      onClick={() => executeProtectedAction("DRAFT_QUERY", onAskCommunity)}
                      className="text-xs text-primary font-bold tracking-wide hover:text-primary/80 transition-colors inline-flex items-center gap-2 py-1 px-3 rounded-lg hover:bg-secondary"
                    >
                      None of the above matches — draft a new query <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground space-y-3">
                  <p>No matching verified graph nodes located for your query.</p>
                  <button 
                    onClick={() => executeProtectedAction("DRAFT_QUERY", onAskCommunity)} 
                    className="px-4 py-2 bg-gradient-primary text-white text-xs font-bold rounded-xl shadow-glow"
                  >
                    None of these match — draft a new question
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- EXPLICIT COMPREHENSIVE FAQ BROWSER DIRECTORY --- */}
      <div className="space-y-6 pt-6 border-t border-border/60">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight text-foreground">Browse Internship FAQ Directory (13 Chapters)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {faqDatabase.map((categoryGroup, catIdx) => {
            const CategoryIcon = categoryGroup.icon;
            const isCategoryActive = activeFaqCategory === catIdx;

            return (
              <div 
                key={catIdx} 
                className={`bg-card border rounded-2xl p-4 transition-all shadow-soft overflow-hidden h-fit ${
                  isCategoryActive ? "ring-1 ring-primary/40 border-primary/60 md:col-span-2" : "border-border hover:border-border-hover"
                }`}
              >
                <button 
                  onClick={() => {
                    setActiveFaqCategory(isCategoryActive ? null : catIdx);
                    setOpenFaqItem(null);
                  }}
                  className="w-full flex items-center justify-between text-left gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center text-primary shrink-0">
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <span className="font-display font-bold text-sm text-foreground">{categoryGroup.category}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isCategoryActive ? "rotate-90" : ""}`} />
                </button>

                <AnimatePresence>
                  {isCategoryActive && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-border/60 divide-y divide-border/60 space-y-2"
                    >
                      {categoryGroup.items.map((item) => {
                        const isItemOpen = openFaqItem === item.id;
                        return (
                          <div key={item.id} className="pt-2 first:pt-0">
                            <button
                              onClick={() => setOpenFaqItem(isItemOpen ? null : item.id)}
                              className="w-full flex items-start justify-between text-left py-2 gap-4 text-sm font-medium text-foreground/90 hover:text-primary transition-colors"
                            >
                              <span className="leading-snug">
                                <span className="font-mono text-xs text-muted-foreground mr-1.5">{item.id}</span>
                                {item.q}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 mt-0.5 transition-transform ${isItemOpen ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                              {isItemOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mt-1.5"
                                >
                                  <p className="bg-secondary/40 text-foreground/85 text-xs leading-relaxed p-4 rounded-xl border border-border/60 whitespace-pre-line tabular-nums">
                                    {item.a}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- AUTHENTICATION OVERLAY SHEET SYSTEM GATEWAY --- */}
      <AnimatePresence>
        {authModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-6 relative space-y-4"
            >
              <button 
                onClick={() => setAuthModal({ isOpen: false, pendingAction: null })}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1 pt-2">
                <div className="w-12 h-12 bg-primary-glow text-primary rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground">Authentication Required</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  {authModal.pendingAction?.type === "DRAFT_QUERY" 
                    ? "Log in with your Samagama account parameters to draft new community questions." 
                    : `Please authenticatate to unlock access to the private ${authModal.pendingAction?.type === "NAV_COMMUNITY" ? "Community Feed" : "Profile Ledger"} dashboard.`}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3.5 pt-2">
                {authError && (
                  <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2">
                    <span>⚠️</span>
                    <p className="font-medium">{authError}</p>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80 block">Account Email ID</label>
                  <div className="flex items-center gap-2.5 bg-secondary/50 border border-border rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <input 
                      type="email" 
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="vamsi@college.edu" 
                      className="bg-transparent outline-none text-sm w-full text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80 block">Password</label>
                  <div className="flex items-center gap-2.5 bg-secondary/50 border border-border rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••" 
                      className="bg-transparent outline-none text-sm w-full text-foreground"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full mt-2 py-3 bg-gradient-primary text-primary-foreground text-sm font-bold rounded-xl shadow-glow transition hover:opacity-95 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" /> Authenticate Session
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}