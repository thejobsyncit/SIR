import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { 
  FileText, Download, User, Briefcase, GraduationCap, 
  Code, Star, CheckCircle2, ChevronRight, ExternalLink, ShieldCheck,
  Video, Award, Calendar, Clock, MapPin, Building2, CheckSquare,
  Sparkles, Layers, BookOpen, ThumbsUp, AlertCircle
} from 'lucide-react';
import ScrollReveal from '../../../components/ScrollReveal';

export const CrmInterviewerProfiles = () => {
  const { setActiveModule } = useCrm();

  const candidates = [
    {
      id: 'CAN-801',
      name: 'Rohan Deshmukh',
      role: 'Senior Cloud Infrastructure Architect',
      targetDivision: 'Enterprise Cloud Practice (Global)',
      experience: '5.5 Years',
      education: 'B.Tech in Computer Science & Engineering',
      institution: 'National Institute of Technology (NIT), Surathkal',
      cgpa: '8.9 / 10.0',
      graduationYear: '2021',
      currentCompany: 'Cognizant Cloud Labs',
      currentDesignation: 'Lead DevOps & Cloud Engineer',
      noticePeriod: '30 Days',
      location: 'Bangalore, India',
      targetCompensation: '₹28 - ₹32 LPA',
      currentCompensation: '₹22 LPA',
      meetUrl: 'https://meet.google.com/qam-revival-tech',
      matchScore: '94%',
      certifications: [
        'AWS Certified Solutions Architect – Professional (SAP-C02)',
        'Certified Kubernetes Administrator (CKA - Linux Foundation)',
        'HashiCorp Certified: Terraform Associate (003)'
      ],
      skills: [
        { name: 'Kubernetes & Docker', category: 'Container Orchestration', level: 'Expert', percent: 96, years: '4.5 Yrs', rating: '5.0 / 5.0' },
        { name: 'AWS & GCP Architecture', category: 'Cloud Infrastructure', level: 'Expert', percent: 94, years: '5.0 Yrs', rating: '5.0 / 5.0' },
        { name: 'Terraform & CloudFormation', category: 'Infrastructure as Code', level: 'Advanced', percent: 88, years: '3.5 Yrs', rating: '4.5 / 5.0' },
        { name: 'CI/CD Pipelines & ArgoCD', category: 'GitOps & Delivery', level: 'Advanced', percent: 90, years: '4.0 Yrs', rating: '4.5 / 5.0' },
        { name: 'Go & Python Automation', category: 'Systems Scripting', level: 'Proficient', percent: 80, years: '3.0 Yrs', rating: '4.0 / 5.0' },
        { name: 'Prometheus & Grafana Observability', category: 'Monitoring & Reliability', level: 'Advanced', percent: 85, years: '3.5 Yrs', rating: '4.0 / 5.0' }
      ],
      careerHistory: [
        {
          company: 'Cognizant Cloud Labs',
          role: 'Lead DevOps & Cloud Engineer',
          period: '2023 - Present (2.5 Years)',
          location: 'Bangalore, India',
          achievements: [
            'Architected automated multi-region disaster recovery for enterprise banking client, achieving RTO < 15 mins.',
            'Containerized 140+ legacy microservices onto Amazon EKS with GitOps ArgoCD workflows.',
            'Reduced cloud infrastructure operating expenditure by 24% through intelligent spot instance fleets and right-sizing.'
          ]
        },
        {
          company: 'Wipro Digital Enterprise',
          role: 'Senior Cloud Automation Engineer',
          period: '2021 - 2023 (2.0 Years)',
          location: 'Hyderabad, India',
          achievements: [
            'Built immutable Terraform infrastructure modules serving 12 internal engineering squads.',
            'Created zero-downtime blue/green deployment pipelines in Jenkins and GitLab CI.'
          ]
        }
      ],
      previousRoundFeedback: [
        {
          round: 'Round 1: Screening & Core Algorithms',
          interviewer: 'Anand Kumar (Lead Architect)',
          date: 'Nov 04, 2026',
          score: '4.5 / 5.0',
          decision: 'Strongly Recommended',
          notes: 'Candidate demonstrated deep command of distributed systems, Go concurrency channels, and memory allocations. Solved LRU cache design cleanly with complete unit test cases. Highly articulate.',
          verdict: 'Pass to System Design'
        },
        {
          round: 'HR & Cultural Alignment Screening',
          interviewer: 'Priya Lead (HR Operations Lead)',
          date: 'Nov 02, 2026',
          score: '5.0 / 5.0',
          decision: 'Cleared',
          notes: 'Exceptional communication and professional maturity. Clear reason for seeking international project deployments. 30-day notice period is officially confirmed with employer.',
          verdict: 'Pass to Technical Rounds'
        }
      ],
      jdComparison: [
        { requirement: '5+ years production AWS & Kubernetes experience', status: 'Exceeds Bar', details: '5.5 Years documented production experience with enterprise clients.' },
        { requirement: 'Terraform & IaC infrastructure automation', status: 'Exceeds Bar', details: 'Certified Terraform Associate with 3.5 yrs hands-on module authoring.' },
        { requirement: 'Microservices observability (Prometheus/Datadog)', status: 'Meets Bar', details: 'Configured Prometheus alerts, Grafana dashboards, and OpenTelemetry.' },
        { requirement: 'Leadership & Client Advisory presentation skills', status: 'Meets Bar', details: 'Led architecture review boards in previous engagement.' }
      ],
      bio: 'Enterprise Cloud Architect with 5.5 years specializing in high-availability Kubernetes platforms, multi-region AWS/GCP deployments, zero-downtime migrations, and automated GitOps governance.'
    },
    {
      id: 'CAN-802',
      name: 'Priyanka Venkatesh',
      role: 'Full Stack React / Node Lead',
      targetDivision: 'Digital Engineering Solutions',
      experience: '4.2 Years',
      education: 'B.E in Information Science & Engineering',
      institution: 'PSG College of Technology, Coimbatore',
      cgpa: '8.5 / 10.0',
      graduationYear: '2022',
      currentCompany: 'Infosys FinTech Group',
      currentDesignation: 'Senior Frontend Tech Lead',
      noticePeriod: '15 Days',
      location: 'Chennai, India',
      targetCompensation: '₹18 - ₹22 LPA',
      currentCompensation: '₹15 LPA',
      meetUrl: 'https://meet.google.com/dxf-eng-interviews',
      matchScore: '91%',
      certifications: [
        'Meta Certified Front-End Developer',
        'AWS Certified Cloud Practitioner (CLF-C02)'
      ],
      skills: [
        { name: 'React.js & Next.js 14', category: 'Frontend Architecture', level: 'Expert', percent: 95, years: '4.0 Yrs', rating: '5.0 / 5.0' },
        { name: 'TypeScript & ESNext', category: 'Languages', level: 'Expert', percent: 92, years: '3.5 Yrs', rating: '4.5 / 5.0' },
        { name: 'Node.js & Express / NestJS', category: 'Backend Engineering', level: 'Advanced', percent: 84, years: '3.0 Yrs', rating: '4.0 / 5.0' },
        { name: 'PostgreSQL & Prisma ORM', category: 'Data & Persistence', level: 'Proficient', percent: 78, years: '2.5 Yrs', rating: '4.0 / 5.0' },
        { name: 'Tailwind CSS & Design Systems', category: 'UI / UX Styling', level: 'Expert', percent: 96, years: '4.0 Yrs', rating: '5.0 / 5.0' }
      ],
      careerHistory: [
        {
          company: 'Infosys FinTech Group',
          role: 'Senior Frontend Tech Lead',
          period: '2022 - Present (2.2 Years)',
          location: 'Chennai, India',
          achievements: [
            'Spearheaded modern web portal revamp for major European digital bank serving 1.2M active users.',
            'Engineered micro-frontend design system with Tailwind and Webpack 5 Module Federation.',
            'Optimized Core Web Vitals resulting in 42% decrease in Largest Contentful Paint (LCP).'
          ]
        }
      ],
      previousRoundFeedback: [
        {
          round: 'HR & Technical Pre-Screening',
          interviewer: 'Priya Lead (HR Operations Lead)',
          date: 'Nov 03, 2026',
          score: '4.8 / 5.0',
          decision: 'Cleared',
          notes: 'Fast 15-day joining timeline. Confident in React architecture, state management, and modern SSR. Recommended for technical panel.',
          verdict: 'Pass to Technical Round 1'
        }
      ],
      jdComparison: [
        { requirement: '4+ years hands-on React & TypeScript', status: 'Exceeds Bar', details: 'Full 4.2 years building production web apps in TypeScript.' },
        { requirement: 'Design system implementation & atomic UI', status: 'Exceeds Bar', details: 'Authored enterprise design system component library.' },
        { requirement: 'Node.js backend API integrations', status: 'Meets Bar', details: 'Built REST & GraphQL endpoints using Express and NestJS.' }
      ],
      bio: 'Full-stack engineer with 4+ years building ultra-responsive fintech web applications, enterprise design systems, and resilient Node.js microservices.'
    }
  ];

  const [selectedCandidate, setSelectedCandidate] = useState(candidates[0]);
  const [activeTab, setActiveTab] = useState('skills');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <ScrollReveal>
      <div className="space-y-6 text-xs font-sans pb-8">
        
        {/* Top Executive Command Banner (Super Admin Style) */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 p-6 rounded-3xl shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-gold-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                Interviewer Suite • Feature #3
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                CANDIDATE INTELLIGENCE & VERIFIED DOSSIER
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Candidate Technical Profile & Assessment Portfolio
            </h1>
            <p className="text-slate-500 text-xs mt-1 max-w-2xl">
              Inspect candidate CV, verifiable technical skill stack, past assessment scores, and permitted previous round interviewer observations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a 
              href={selectedCandidate.meetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold rounded-2xl border border-blue-200/70 transition flex items-center gap-1.5 shadow-xs"
            >
              <Video className="w-4 h-4 text-blue-600" />
              Launch Video Meet
            </a>

            <button 
              onClick={() => showToast(`✓ Downloading official candidate resume PDF for ${selectedCandidate.name}...`)}
              className="px-4 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Download Resume
            </button>

            <button 
              onClick={() => {
                setActiveModule('int-evaluation');
                showToast(`Navigating to scorecard evaluation for ${selectedCandidate.name}`);
              }}
              className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold rounded-2xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              Scorecard Form
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Candidate Switcher Header Pills */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-3 shadow-xs">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-2 shrink-0">
                Candidate Roster:
              </span>
              {candidates.map(c => {
                const isSelected = selectedCandidate.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-3 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100/80 dark:bg-gold-500/20 text-amber-900 dark:text-gold-300 border-amber-300/80 dark:border-gold-500/40 shadow-xs ring-1 ring-amber-300/50'
                        : 'bg-slate-50 dark:bg-navy-950 border-slate-200/80 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gold-500 text-navy-950 flex items-center justify-center font-bold text-xs shadow-xs">
                      {c.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-slate-900 dark:text-white leading-tight">{c.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          {c.matchScore} Match
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{c.role}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pr-2 shrink-0">
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                ID: <strong className="text-slate-900 dark:text-white">{selectedCandidate.id}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                ● Screening Passed
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Layout: 1/3 Profile Sidebar + 2/3 Tabbed Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (4 cols): Executive Candidate Overview Card */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5">
              
              {/* Header with Avatar */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-navy-800 text-amber-900 dark:text-gold-400 flex items-center justify-center font-serif text-3xl font-black border-2 border-amber-300/80 dark:border-gold-500/40 shadow-xs shrink-0">
                  {selectedCandidate.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedCandidate.name}
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-gold-400 font-bold mt-0.5">
                    {selectedCandidate.role}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {selectedCandidate.location}
                  </p>
                </div>
              </div>

              {/* Match Score Banner */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    JD Match Score
                  </p>
                  <p className="font-serif text-lg font-black text-emerald-700 dark:text-emerald-300">
                    {selectedCandidate.matchScore} Compatibility
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-navy-900 flex items-center justify-center shadow-xs text-emerald-600 font-black">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              {/* Profile Metadata List */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-navy-800 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-navy-800">
                  <span className="text-slate-400 font-medium">Total Experience:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">{selectedCandidate.experience}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-navy-800">
                  <span className="text-slate-400 font-medium">Current Employer:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCandidate.currentCompany}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-navy-800">
                  <span className="text-slate-400 font-medium">Current Designation:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedCandidate.currentDesignation}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-navy-800">
                  <span className="text-slate-400 font-medium">Notice Period:</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200">
                    {selectedCandidate.noticePeriod}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-navy-800">
                  <span className="text-slate-400 font-medium">Target CTC:</span>
                  <span className="font-bold text-amber-700 dark:text-gold-400 font-mono">{selectedCandidate.targetCompensation}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-medium">Current CTC:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">{selectedCandidate.currentCompensation}</span>
                </div>
              </div>

              {/* Education Box */}
              <div className="p-3.5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 space-y-1">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                  Academic Pedigree
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">{selectedCandidate.education}</p>
                <p className="text-[11px] text-slate-500">{selectedCandidate.institution}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Graduated: {selectedCandidate.graduationYear}</span>
                  <span className="font-bold text-emerald-600">CGPA: {selectedCandidate.cgpa}</span>
                </div>
              </div>

              {/* Executive Bio */}
              <div className="p-3.5 bg-amber-50/40 dark:bg-navy-950 rounded-2xl border border-amber-200/50 dark:border-navy-800 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="font-serif font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                  Executive Dossier Summary
                </p>
                <p className="italic text-slate-600 dark:text-slate-400">"{selectedCandidate.bio}"</p>
              </div>

            </div>
          </div>

          {/* Right Column (8 cols): Tabbed Dossier Sections */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Top Navigation Tabs */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-2xl p-1.5 flex gap-1 shadow-xs overflow-x-auto">
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'skills'
                    ? 'bg-gold-500 text-navy-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Technical Competency Matrix
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-gold-500 text-navy-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Career History & Impact
              </button>

              <button
                onClick={() => setActiveTab('debrief')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'debrief'
                    ? 'bg-gold-500 text-navy-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Previous Rounds & Debrief ({selectedCandidate.previousRoundFeedback.length})
              </button>

              <button
                onClick={() => setActiveTab('jd')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  activeTab === 'jd'
                    ? 'bg-gold-500 text-navy-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                JD Alignment Analysis
              </button>
            </div>

            {/* TAB 1: Technical Competencies */}
            {activeTab === 'skills' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                
                {/* Certifications Card */}
                <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gold-500" />
                    <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                      Verified Industry Credentials & Accreditations
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {selectedCandidate.certifications.map((cert, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/60 dark:bg-navy-950 rounded-2xl border border-amber-200/70 dark:border-navy-800 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-xs leading-snug">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Visual Matrix */}
                <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                        Technical Core Competency Matrix
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Evaluated across production architecture, code challenges, and algorithmic depth
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200">
                      ● Validated Assessment
                    </span>
                  </div>

                  <div className="space-y-4 pt-2">
                    {selectedCandidate.skills.map((s, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/70 dark:border-navy-800 space-y-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <span className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                              {s.name}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-2 font-mono">
                              ({s.category})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono text-slate-500 bg-white dark:bg-navy-900 px-2 py-0.5 rounded border border-slate-200 dark:border-navy-800">
                              {s.years}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-gold-300 border border-amber-200 font-mono">
                              {s.level} ({s.percent}%)
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-gold-400 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${s.percent}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                          <span>Verified in Screening Challenge</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">Score: {s.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: Career History & Impact */}
            {activeTab === 'timeline' && (
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                    Chronological Career Progression & Track Record
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">{selectedCandidate.experience} Total Work History</span>
                </div>

                <div className="space-y-5">
                  {selectedCandidate.careerHistory.map((item, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                        <div>
                          <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                            {item.role}
                          </h4>
                          <p className="text-xs font-bold text-amber-700 dark:text-gold-400 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                            {item.company} • {item.location}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800">
                          {item.period}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Core Deliverables & Engineering Accomplishments:</p>
                        <ul className="space-y-1.5 list-disc list-inside text-slate-700 dark:text-slate-300 text-xs">
                          {item.achievements.map((ach, aIdx) => (
                            <li key={aIdx} className="leading-relaxed pl-1">{ach}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Previous Rounds & Debrief */}
            {activeTab === 'debrief' && (
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                      Interviewer Committee Evaluation Trail
                    </h3>
                    <p className="text-[11px] text-slate-500">Prior round notes released for continuity and deduplication</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    ● Blind Protocol Unlocked
                  </span>
                </div>

                <div className="space-y-4">
                  {selectedCandidate.previousRoundFeedback.map((fb, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">{fb.round}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Interviewer: <strong className="text-slate-700 dark:text-slate-300">{fb.interviewer}</strong> • {fb.date}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gold-500/15 text-gold-700 dark:text-gold-300 px-3 py-1 rounded-xl font-bold font-mono">
                          <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                          <span>{fb.score}</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-navy-900 rounded-xl border border-slate-200/60 dark:border-navy-800 text-slate-700 dark:text-slate-300 italic text-xs leading-relaxed">
                        "{fb.notes}"
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-1 font-semibold">
                        <span className="text-slate-500">Interviewer Recommendation:</span>
                        <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                          ✓ {fb.decision}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: JD Alignment */}
            {activeTab === 'jd' && (
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 rounded-3xl p-6 shadow-xs space-y-5 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">
                      Job Description Mandate Comparison
                    </h3>
                    <p className="text-[11px] text-slate-500">Role: {selectedCandidate.role} ({selectedCandidate.targetDivision})</p>
                  </div>
                  <span className="font-serif font-black text-emerald-600 text-base">{selectedCandidate.matchScore} Match</span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-navy-800">
                  {selectedCandidate.jdComparison.map((item, idx) => (
                    <div key={idx} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{item.requirement}</p>
                        <p className="text-[11px] text-slate-500">{item.details}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        item.status === 'Exceeds Bar'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </ScrollReveal>
  );
};

export default CrmInterviewerProfiles;
