import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Linkedin, Instagram, Twitter, Facebook, ExternalLink, 
  CheckCircle2, Share2, Globe, Users, ArrowRight, ShieldCheck, 
  MessageSquare, Sparkles, Building2, Bell, Heart, ThumbsUp
} from 'lucide-react';

const SOCIAL_CHANNELS = {
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: '@therevivalinternational',
    title: 'The Revival International Corporate Network',
    badge: 'Verified Enterprise Organization',
    color: '#0077B5',
    bgLight: 'bg-[#0077B5]/10',
    borderLight: 'border-[#0077B5]/30',
    textCol: 'text-[#0077B5]',
    banner: 'bg-gradient-to-r from-[#004182] to-[#0077B5]',
    followers: '48.5K+ Followers',
    connections: '12,000+ Placed Executives',
    externalUrl: 'https://www.linkedin.com/company/therevivalinternational',
    description: 'The premier GCC and international manpower consultancy network. Connect with our executive recruiters, discover confidential C-suite vacancies across Dubai, Saudi Arabia, Qatar, and Europe, and access authoritative visa legislation insights.',
    highlights: [
      { title: 'Executive GCC Placements', desc: 'Over 1,200 senior engineers, healthcare leaders, and finance executives placed across UAE & KSA in 2026.' },
      { title: 'MOHRE & GCC Regulatory Updates', desc: 'Bi-weekly briefings on GCC Golden Visa rules, work permit quotas, and labor law compliance.' },
      { title: 'Corporate Hiring Partnerships', desc: 'Direct access to HR Directors and C-suite talent acquisition heads worldwide.' }
    ],
    recentPosts: [
      {
        date: 'Today at 09:30 AM',
        content: '🌟 We are thrilled to announce that The Revival International has successfully processed 350+ Tier-1 Executive Visas for the UAE & Saudi Vision 2030 megaprojects this quarter. Explore open career tracks today.',
        likes: '1,420',
        comments: '186'
      },
      {
        date: '2 days ago',
        content: '📢 GCC Work Permit Advisory: Complete breakdown of the 2026 Ministry of Human Resources regulations for international recruitment and attested degree verification.',
        likes: '984',
        comments: '112'
      }
    ]
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    handle: '@therevivalinternational',
    title: 'Life, Careers & Global Opportunities',
    badge: 'Official Brand Channel',
    color: '#E4405F',
    bgLight: 'bg-[#E4405F]/10',
    borderLight: 'border-[#E4405F]/30',
    textCol: 'text-[#E4405F]',
    banner: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045]',
    followers: '62.4K+ Followers',
    connections: '850+ Reels & Stories',
    externalUrl: 'https://www.instagram.com/therevivalinternational',
    description: 'Immerse yourself in candidate journeys, behind-the-scenes life at top Dubai & European multinational firms, campus recruitment drives, and inspiring career milestone stories.',
    highlights: [
      { title: 'Candidate Journey Spotlights', desc: 'Real stories of professionals relocating to Dubai, Riyadh, London, and Berlin.' },
      { title: 'Interview & Resume Masterclasses', desc: 'Quick 60-second tips from certified international recruiters on cracking GCC interviews.' },
      { title: 'Campus & Academy Showcases', desc: 'Coverage of international university tours, coaching workshops, and student admissions.' }
    ],
    recentPosts: [
      {
        date: '3 hours ago',
        content: '✨ From Chennai to Downtown Dubai! Congratulations to Karthik on receiving his Senior Project Manager offer with a leading UAE construction giant.',
        likes: '3,890',
        comments: '245'
      },
      {
        date: 'Yesterday',
        content: '✈️ 5 Things you MUST know before attending a GCC Embassy visa biometric appointment. Save this reel for your journey!',
        likes: '4,510',
        comments: '310'
      }
    ]
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter (X)',
    handle: '@revivalintl',
    title: 'Real-Time GCC Visa & Recruitment Alerts',
    badge: 'Verified Official Handle',
    color: '#1DA1F2',
    bgLight: 'bg-[#1DA1F2]/10',
    borderLight: 'border-[#1DA1F2]/30',
    textCol: 'text-[#1DA1F2]',
    banner: 'bg-gradient-to-r from-[#0f1419] to-[#1DA1F2]',
    followers: '28.1K+ Followers',
    connections: 'Daily Live Dispatch',
    externalUrl: 'https://twitter.com/revivalintl',
    description: 'Instant dispatches on GCC visa law amendments, emergency consular updates, rapid vacancy releases, and live commentary on international labor markets.',
    highlights: [
      { title: 'Live Vacancy Broadcasts', desc: 'Immediate announcements when bulk vacancies open for healthcare, oil & gas, and tech.' },
      { title: 'Immigration Bulletins', desc: 'Real-time alerts on embassy processing times, biometric requirements, and flight routes.' },
      { title: 'Direct Recruiter Q&A', desc: 'Weekly live Spaces answering candidate questions regarding work permits.' }
    ],
    recentPosts: [
      {
        date: '45 mins ago',
        content: '🚨 BREAKING: UAE MOHRE announces updated expedited work visa processing timelines for licensed engineering professionals. Read the full summary here.',
        likes: '512',
        comments: '64'
      },
      {
        date: '5 hours ago',
        content: '💼 Urgent Opening: 25 Senior Hospital Registered Nurses required for Ministry of Health hospital network in Riyadh. Immediate contract issuing.',
        likes: '830',
        comments: '98'
      }
    ]
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    handle: '@therevivalinternational',
    title: 'The Revival Global Community Hub',
    badge: 'Verified Business Page',
    color: '#1877F2',
    bgLight: 'bg-[#1877F2]/10',
    borderLight: 'border-[#1877F2]/30',
    textCol: 'text-[#1877F2]',
    banner: 'bg-gradient-to-r from-[#0C3875] to-[#1877F2]',
    followers: '75.8K+ Members',
    connections: 'Active Global Community',
    externalUrl: 'https://www.facebook.com/therevivalinternational',
    description: 'Join thousands of international job seekers, students, and expatriates. Participate in live webinars, community Q&A forums, and discover comprehensive educational guidance.',
    highlights: [
      { title: 'Global Expat Community', desc: 'A welcoming space for expatriates to exchange relocation tips, accommodation advice, and lifestyle guides.' },
      { title: 'Live Educational Webinars', desc: 'Free bi-weekly webinars featuring international university delegates and visa consultants.' },
      { title: 'Verified Testimonials', desc: 'Direct reviews and experiences from over 10,000 successful applicants.' }
    ],
    recentPosts: [
      {
        date: 'Yesterday at 4:00 PM',
        content: '🎓 LIVE WEBINAR REPLAY: Navigating Fall 2026 Admissions & Post-Study Work Visas for the UK, Germany & Canada. Over 2,400 students attended live!',
        likes: '1,890',
        comments: '340'
      },
      {
        date: '3 days ago',
        content: '🌐 Welcome to our 5,000 newest community members! Remember that Revival International does not charge unreceipted fees—always verify our official channels.',
        likes: '2,150',
        comments: '175'
      }
    ]
  }
};

export const SocialMediaPage = ({ initialChannel = 'linkedin' }) => {
  const { activeTab, navigateTo } = useApp();
  const [selectedChannel, setSelectedChannel] = useState(() => {
    if (activeTab === 'social-instagram' || activeTab === 'instagram') return 'instagram';
    if (activeTab === 'social-twitter' || activeTab === 'twitter') return 'twitter';
    if (activeTab === 'social-facebook' || activeTab === 'facebook') return 'facebook';
    return initialChannel || 'linkedin';
  });

  useEffect(() => {
    if (activeTab === 'social-instagram' || activeTab === 'instagram') setSelectedChannel('instagram');
    else if (activeTab === 'social-twitter' || activeTab === 'twitter') setSelectedChannel('twitter');
    else if (activeTab === 'social-facebook' || activeTab === 'facebook') setSelectedChannel('facebook');
    else if (activeTab === 'social-linkedin' || activeTab === 'linkedin') setSelectedChannel('linkedin');
  }, [activeTab]);

  const channel = SOCIAL_CHANNELS[selectedChannel] || SOCIAL_CHANNELS.linkedin;

  const getIcon = (id, size = 'w-5 h-5') => {
    switch (id) {
      case 'linkedin': return <Linkedin className={size} />;
      case 'instagram': return <Instagram className={size} />;
      case 'twitter': return <Twitter className={size} />;
      case 'facebook': return <Facebook className={size} />;
      default: return <Globe className={size} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <button onClick={() => navigateTo('home')} className="hover:text-gold-500 transition">Home</button>
            <span>/</span>
            <span className="text-gold-500">Official Social Media</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">{channel.name}</span>
          </div>

          <button
            onClick={() => navigateTo('home')}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-gold-500 transition flex items-center gap-1.5"
          >
            ← Back to Homepage
          </button>
        </div>

        {/* Channel Selector Tabs */}
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-2 rounded-2xl shadow-sm flex flex-wrap gap-2 justify-center sm:justify-start">
          {Object.keys(SOCIAL_CHANNELS).map((key) => {
            const item = SOCIAL_CHANNELS[key];
            const isSelected = selectedChannel === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setSelectedChannel(key);
                  if (typeof window !== 'undefined') {
                    window.location.hash = `#social-${key}`;
                  }
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-navy-900 dark:bg-gold-500 text-white dark:text-navy-950 shadow-md scale-102'
                    : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800'
                }`}
              >
                {getIcon(key, 'w-4 h-4')}
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Hero Card for Selected Channel */}
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl overflow-hidden shadow-luxury">
          {/* Channel Banner */}
          <div className={`h-40 sm:h-48 ${channel.banner} relative p-6 flex items-end justify-between`}>
            <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{channel.badge}</span>
            </div>
            
            <div className="text-white">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">
                {channel.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 font-mono mt-0.5">
                {channel.handle}
              </p>
            </div>
          </div>

          {/* Profile Header Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-navy-800">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl ${channel.bgLight} border ${channel.borderLight} ${channel.textCol} flex items-center justify-center shadow-md`}>
                  {getIcon(channel.id, 'w-8 h-8')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                      The Revival International
                    </h2>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {channel.followers} • {channel.connections}
                  </p>
                </div>
              </div>

              {/* Direct External Navigation Action */}
              <a
                href={channel.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gold-shimmer text-navy-950 shadow-gold-glow hover:scale-102 transition cursor-pointer"
              >
                <span>Open Official {channel.name} Page</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Channel Description */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl font-medium">
              {channel.description}
            </p>

            {/* Key Content Highlights */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-3">
                Featured Programs & Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {channel.highlights.map((h, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-navy-800 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      <span>{h.title}</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                      {h.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Feeds / Announcements */}
            <div className="pt-4 border-t border-slate-200 dark:border-navy-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-gold-500" />
                <span>Latest Dispatches on {channel.name}</span>
              </h3>

              <div className="space-y-3">
                {channel.recentPosts.map((post, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-gold-600 dark:text-gold-400">{channel.handle}</span>
                      <span>{post.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-gold-500" /> {post.likes} reactions
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-blue-500" /> {post.comments} comments
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

