import { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';

const COLORS = {
  purple: '#BB29BB', teal: '#2CD5C4', blue: '#05C3DE', yellow: '#F7EA48',
  darkPurple: '#3C1053', darkTeal: '#003E51', darkBlue: '#141B4D',
  black: '#000000', white: '#FFFFFF', grey: '#1a1a2e', greyLight: '#2d2d44', greyDark: '#0f0f1a',
};

const BUDGET_INVESTMENTS = [
  { id: 'training', label: 'Training', icon: '📚', effects: { engagement: 0.08, performance: 0.06, credibility: 0.04 }, helpText: 'Develops skills and knowledge. Affects engagement, performance, and credibility.' },
  { id: 'teamBuilding', label: 'Team Activities', icon: '🎯', effects: { trust: 0.1, engagement: 0.06, fairness: 0.04 }, helpText: 'Social and team-building events. Affects trust, engagement, and fairness.' },
  { id: 'tools', label: 'Tools', icon: '🛠️', effects: { performance: 0.08, engagement: 0.04, retention: 0.06 }, helpText: 'Better equipment and software. Affects performance, engagement, and retention.' },
  { id: 'recognition', label: 'Recognition', icon: '🏆', effects: { trust: 0.06, engagement: 0.08, fairness: 0.06 }, helpText: 'Rewards and acknowledgment programs. Affects trust, engagement, and fairness.' },
];

const INVESTMENT_COSTS = {
  training: 200,       // £200 per 10%
  teamBuilding: 150,   // £150 per 10%
  tools: 250,          // £250 per 10%
  recognition: 100,    // £100 per 10%
  oneOnOnes: 0,        // Time investments free
  coaching: 0,
  strategy: 0,
  selfCare: 0
};

const TIME_INVESTMENTS = [
  { id: 'oneOnOnes', label: '1:1s', icon: '💬', effects: { trust: 0.1, credibility: 0.08, fairness: 0.04 }, loadEffect: 0.15, helpText: 'Regular individual meetings. Choose who to meet — selected people get a trust and engagement boost. Higher investment unlocks more slots.' },
  { id: 'coaching', label: 'Coaching', icon: '🎓', effects: { performance: 0.06, engagement: 0.06, credibility: 0.06 }, loadEffect: 0.2, helpText: 'Hands-on skill development. Choose who to coach — selected people get a performance and engagement boost. High time cost.' },
  { id: 'strategy', label: 'Strategy', icon: '📊', effects: { performance: 0.08, credibility: 0.08 }, loadEffect: 0.08, helpText: 'Planning and direction-setting. Affects performance and credibility. Moderate time cost.' },
  { id: 'selfCare', label: 'Your Wellbeing', icon: '🧘', effects: { credibility: 0.04 }, loadEffect: -0.5, helpText: 'Time for your own wellbeing. Reduces your personal load significantly.' },
];

const TUTORIAL_STEPS = [
  { id: 'metrics', title: 'Metrics', icon: '📊', description: 'These six measures show how your team is doing. Green is healthy, yellow is warning, red is trouble.', position: 'right' },
  { id: 'load', title: 'Your Load', icon: '🔋', description: 'Your personal stress level. Push too hard for too long and it affects your effectiveness.', position: 'right' },
  { id: 'investments', title: 'Investments', icon: '💰', description: 'Allocate your budget and time each quarter. These choices shape how events play out.', position: 'right' },
  { id: 'event', title: 'Event Panel', icon: '📋', description: 'Situations will land on your desk. Read the context, then choose how to respond.', position: 'left' },
  { id: 'options', title: 'Options', icon: '🎯', description: 'Click an option to select it. You can change your mind before confirming.', position: 'top' },
  { id: 'observations', title: 'Observations', icon: '👀', description: 'Ambient signals from your team. Not instructions — just things you might notice.', position: 'left' },
  { id: 'team', title: 'Team Panel', icon: '👥', description: 'Five individuals with their own personalities and limits. Their trust and engagement shift based on your decisions.', position: 'left' },
];

const NOTIFICATIONS = {
  character: [
    { check: (c) => c.find(x => x.id === 'sarah' && x.engagement < 50), text: "Sarah's been quieter than usual in meetings.", icon: '👩‍🔬' },
    { check: (c) => c.find(x => x.id === 'dave' && x.trust < 60), text: "Dave seems to be keeping more to himself.", icon: '👨‍💻' },
    { check: (c) => c.find(x => x.id === 'aisha' && x.engagement < 55), text: "Aisha hasn't volunteered for anything recently.", icon: '👩‍💼' },
    { check: (c) => c.find(x => x.id === 'tom' && x.trust < 70), text: "Tom's been leaving right on time every day.", icon: '👨‍🎨' },
    { check: (c) => c.find(x => x.id === 'liam' && x.engagement > 80), text: "Liam asked about stretch opportunities.", icon: '👨‍🎓' },
    { check: (c) => c.find(x => x.id === 'sarah' && x.trust > 80), text: "Sarah shared some concerns she hadn't mentioned before.", icon: '👩‍🔬' },
    { check: (c) => c.find(x => x.id === 'dave' && x.engagement < 65), text: "Dave's code reviews have been shorter lately.", icon: '👨‍💻' },
    { check: (c) => c.find(x => x.id === 'aisha' && x.trust < 55), text: "Aisha's been checking her phone more in meetings.", icon: '👩‍💼' },
    { check: (c) => c.find(x => x.id === 'tom' && x.engagement < 40), text: "Tom missed the team lunch again.", icon: '👨‍🎨' },
    { check: (c) => c.find(x => x.id === 'liam' && x.trust < 55), text: "Liam seems hesitant to ask questions.", icon: '👨‍🎓' },
  ],
  metrics: [
    { check: (m) => m.trust < 55, text: "The office feels tense. People are careful about what they say.", icon: '🌡️' },
    { check: (m) => m.engagement < 50, text: "Discretionary effort seems low. People are doing the minimum.", icon: '📉' },
    { check: (m) => m.fairness < 50, text: "There's been grumbling about how decisions are made.", icon: '⚖️' },
    { check: (m) => m.credibility < 50, text: "You sense skepticism when you announce things.", icon: '🤔' },
    { check: (m) => m.emotionalLoad > 70, text: "You've been forgetting small things. Sleep hasn't been great.", icon: '😓' },
    { check: (m) => m.emotionalLoad > 85, text: "Your patience is thinner than usual.", icon: '🔥' },
    { check: (m) => m.performance > 80, text: "Deliverables are on track. The team is executing well.", icon: '✅' },
    { check: (m) => m.trust > 80, text: "Someone shared personal news with you unprompted.", icon: '💬' },
    { check: (m) => m.retention < 60, text: "LinkedIn activity from the team seems higher.", icon: '👀' },
    { check: (m) => m.engagement > 80 && m.trust > 75, text: "There's genuine laughter in the office today.", icon: '😊' },
  ],
  investment: [
    { check: (i) => i.oneOnOnes === 0, text: "Your calendar has been light on 1:1s lately.", icon: '📅' },
    { check: (i) => i.training === 0, text: "No one's mentioned learning opportunities recently.", icon: '📚' },
    { check: (i) => i.teamBuilding === 0, text: "The team hasn't done anything social in a while.", icon: '🎯' },
    { check: (i) => i.selfCare === 0 && i.oneOnOnes > 40, text: "You skipped lunch to take another meeting.", icon: '🥪' },
    { check: (i) => i.recognition === 0, text: "It's been a while since anyone got a shoutout.", icon: '🏆' },
    { check: (i) => i.coaching > 50, text: "Liam mentioned he's learning a lot from your guidance.", icon: '🎓' },
    { check: (i) => i.teamBuilding > 40, text: "People seem to be chatting more at the coffee machine.", icon: '☕' },
    { check: (i) => i.selfCare > 30, text: "You feel more present in conversations today.", icon: '🧘' },
  ],
  general: [
    { text: "Monday morning. The week stretches ahead.", icon: '📆' },
    { text: "End of day. Some people lingering, others rushing out.", icon: '🌆' },
    { text: "The Slack channel has been quiet today.", icon: '💬' },
    { text: "Someone brought cake for no particular reason.", icon: '🎂' },
    { text: "The heating's broken again. Everyone's in extra layers.", icon: '🥶' },
    { text: "IT pushed an update overnight. Nothing works properly.", icon: '💻' },
    { text: "Rain hammering the windows. No one wants to go out for lunch.", icon: '🌧️' },
    { text: "Friday afternoon energy. Focus is wavering.", icon: '🎉' },
  ],
  budget: [
    { check: (b) => b.current < 2000 && b.current > 0, text: "Funds running low. Prioritize carefully.", icon: '💰' },
    { check: (b) => b.current === 0, text: "No budget remaining. Time investments only.", icon: '🚫' },
    { check: (b) => b.lastAllocation > 5000, text: "Strong funding this quarter. Well done.", icon: '📈' },
    { check: (b) => b.lastAllocation < 4000 && b.lastAllocation > 0, text: "Below-average allocation. Leadership expects improvement.", icon: '📉' },
  ],
  workload: [
    {
      check: (c) => c.find(x => !x.departed && x.loadPercent > 140),
      text: "Someone's on the verge of burnout. The workload is unsustainable.",
      icon: '🔥'
    },
    {
      check: (c) => c.find(x => !x.departed && x.loadPercent > 120),
      text: "The team is stretched thin. People are working overtime.",
      icon: '⚠️'
    },
    {
      check: (c) => c.filter(x => !x.departed).length < 4,
      text: "An empty desk is a constant reminder of what was lost.",
      icon: '🪑'
    },
  ],
  attrition: [
    {
      check: (c) => c.find(x => !x.departed && x.performance >= 80 && x.engagement < 60),
      text: "One of your top performers has updated their LinkedIn profile.",
      icon: '👀'
    },
    {
      check: (c) => c.find(x => !x.departed && x.trust < 45 && x.engagement < 50),
      text: "Someone was overheard asking about opportunities in other teams.",
      icon: '🚪'
    },
  ],
};

const INITIAL_CHARACTERS = [
  { id: 'dave', name: 'Dave Chen', role: 'Senior Developer', tenure: '4 years', performance: 92, avatar: '👨‍💻', traits: ['High performer', 'Abrasive', 'Politically influential'], drivers: 'Recognition, autonomy, being the expert', sensitivity: 'Low emotional sensitivity, high ego', trust: 70, engagement: 75, atRisk: false, baseCapacity: 20, currentLoad: 20, loadPercent: 100, departed: false, departureReason: null },
  { id: 'aisha', name: 'Aisha Patel', role: 'Product Manager', tenure: '3 years', performance: 78, avatar: '👩‍💼', traits: ['Solid performer', 'Overlooked', 'Values fairness'], drivers: 'Equity, growth opportunities, being heard', sensitivity: 'High sensitivity to perceived unfairness', trust: 65, engagement: 60, atRisk: true, baseCapacity: 20, currentLoad: 20, loadPercent: 100, departed: false, departureReason: null },
  { id: 'tom', name: 'Tom Williams', role: 'Marketing Lead', tenure: '2 years', performance: 55, avatar: '👨‍🎨', traits: ['Likeable', 'Underperforming', 'Personal issues'], drivers: 'Work-life balance, team connection, stability', sensitivity: 'Going through divorce, emotionally fragile', trust: 80, engagement: 45, atRisk: false, baseCapacity: 20, currentLoad: 20, loadPercent: 100, departed: false, departureReason: null },
  { id: 'sarah', name: 'Sarah Kim', role: 'Data Analyst', tenure: '1 year', performance: 85, avatar: '👩‍🔬', traits: ['Quiet', 'High potential', 'Conflict-avoidant'], drivers: 'Learning, mentorship, psychological safety', sensitivity: 'Withdraws under pressure, needs encouragement', trust: 75, engagement: 70, atRisk: false, baseCapacity: 20, currentLoad: 20, loadPercent: 100, departed: false, departureReason: null },
  { id: 'liam', name: "Liam O'Brien", role: 'Junior Developer', tenure: '3 months', performance: 68, avatar: '👨‍🎓', traits: ['New hire', 'Eager', 'Uncertain expectations'], drivers: 'Clarity, feedback, proving himself', sensitivity: 'Highly impressionable, watching everything', trust: 60, engagement: 85, atRisk: false, baseCapacity: 20, currentLoad: 20, loadPercent: 100, departed: false, departureReason: null },
];

const ALL_EVENTS = [
  { id: 'e1', category: 'Performance vs Fairness', title: 'Cost of Living Request', description: 'Tom asks for a 15% pay rise citing rising costs. His performance has been below target for 6 months.', delivery: 'email', character: 'tom', tags: ['oneOnOnes', 'recognition'], options: [{ text: 'Approve the raise to show empathy', effects: { trust: 5, engagement: 10, performance: -5, fairness: -15, credibility: -10 } }, { text: 'Deny but offer performance bonus path', effects: { trust: -5, engagement: -5, performance: 5, fairness: 5, credibility: 10 } }, { text: 'Defer decision pending performance review', effects: { trust: -10, engagement: -10, performance: 0, fairness: 0, credibility: -5 } }, { text: 'Have honest conversation about performance first', effects: { trust: 0, engagement: -5, performance: 10, fairness: 10, credibility: 15 } }] },
  { id: 'e2', category: 'Performance vs Fairness', title: 'The Indispensable Problem', description: 'Dave delivers exceptional results but junior team members are complaining about his aggressive code reviews.', delivery: 'slack', character: 'dave', tags: ['coaching', 'teamBuilding'], options: [{ text: 'Ignore it - results matter most', effects: { trust: -15, engagement: -10, performance: 5, fairness: -20, credibility: -10 } }, { text: 'Formal warning to Dave', effects: { trust: 5, engagement: 5, performance: -15, fairness: 15, credibility: 5 } }, { text: 'Coach Dave privately on communication', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Move Dave to solo projects', effects: { trust: 0, engagement: -5, performance: -5, fairness: 0, credibility: 0 } }] },
  { id: 'e3', category: 'Performance vs Fairness', title: 'Unequal Workloads', description: "Sarah has quietly taken on 40% more work than her peers. She hasn't complained, but you noticed.", delivery: 'observation', character: 'sarah', tags: ['oneOnOnes', 'recognition'], options: [{ text: 'Redistribute work publicly', effects: { trust: 10, engagement: 5, performance: -5, fairness: 15, credibility: 10 } }, { text: 'Privately thank Sarah and offer comp time', effects: { trust: 5, engagement: 10, performance: 0, fairness: -5, credibility: 5 } }, { text: 'Wait for her to raise it', effects: { trust: -10, engagement: -15, performance: 0, fairness: -10, credibility: -10 } }, { text: 'Address in team meeting without naming her', effects: { trust: 5, engagement: 5, performance: 0, fairness: 10, credibility: 5 } }] },
  { id: 'e4', category: 'Performance vs Fairness', title: 'Promotion Bypass', description: 'Aisha discovers Dave was promoted ahead of her despite similar tenure. She requests a meeting.', delivery: 'calendar', character: 'aisha', tags: ['oneOnOnes', 'training'], options: [{ text: "Explain Dave's higher metrics justified it", effects: { trust: -10, engagement: -20, performance: 5, fairness: -15, credibility: 5 } }, { text: 'Acknowledge the gap and create a development plan', effects: { trust: 5, engagement: 5, performance: 0, fairness: 10, credibility: 10 } }, { text: 'Hint at future opportunities without committing', effects: { trust: -15, engagement: -10, performance: 0, fairness: -10, credibility: -15 } }, { text: 'Advocate for a title adjustment for Aisha', effects: { trust: 15, engagement: 15, performance: 0, fairness: 15, credibility: 5 } }] },
  { id: 'e5', category: 'Performance vs Fairness', title: 'The Late Starter', description: 'Liam consistently arrives 30 minutes late but stays late to compensate. Other team members have noticed.', delivery: 'observation', character: 'liam', tags: ['oneOnOnes', 'coaching'], options: [{ text: 'Enforce strict start times for everyone', effects: { trust: -5, engagement: -10, performance: 5, fairness: 10, credibility: 5 } }, { text: 'Let it slide - output matters more', effects: { trust: -5, engagement: 0, performance: 0, fairness: -15, credibility: -10 } }, { text: 'Privately discuss with Liam to understand why', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Implement flexible hours policy for all', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 10 } }] },
  { id: 'e6', category: 'Performance vs Fairness', title: 'Bonus Pool Dilemma', description: "You have £10k bonus pool for 5 people. Dave's metrics justify 50%, but that leaves scraps for others.", delivery: 'email', character: null, tags: ['recognition', 'strategy'], options: [{ text: 'Merit-based: Dave gets £5k, others split rest', effects: { trust: -10, engagement: -15, performance: 10, fairness: -20, credibility: 5 } }, { text: 'Equal split: £2k each', effects: { trust: 5, engagement: 5, performance: -10, fairness: 15, credibility: -5 } }, { text: 'Weighted but capped: Dave £3k, scale others', effects: { trust: 0, engagement: 0, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Push back on budget and request more', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 5, emotionalLoad: 10 } }] },
  { id: 'e7', category: 'Performance vs Fairness', title: 'Credit Stealing', description: "Sarah tells you privately that Dave presented her analysis as his own in a leadership meeting.", delivery: 'corridor', character: 'sarah', tags: ['oneOnOnes', 'recognition'], options: [{ text: 'Confront Dave directly', effects: { trust: 10, engagement: 10, performance: -5, fairness: 15, credibility: 10 } }, { text: 'Correct the record in the next leadership meeting', effects: { trust: 15, engagement: 15, performance: 0, fairness: 20, credibility: 15 } }, { text: 'Tell Sarah to speak up for herself next time', effects: { trust: -15, engagement: -20, performance: 0, fairness: -10, credibility: -15 } }, { text: "Note it but don't act yet", effects: { trust: -10, engagement: -10, performance: 0, fairness: -15, credibility: -10 } }] },
  { id: 'e8', category: 'Performance vs Fairness', title: 'The Quiet Quitter', description: 'Aisha is doing the bare minimum lately. Meets targets but no discretionary effort.', delivery: 'observation', character: 'aisha', tags: ['oneOnOnes', 'training'], options: [{ text: 'Document and prepare for performance management', effects: { trust: -15, engagement: -20, performance: 5, fairness: -5, credibility: 0 } }, { text: 'Have a supportive check-in conversation', effects: { trust: 10, engagement: 15, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Increase her workload to test commitment', effects: { trust: -20, engagement: -25, performance: -5, fairness: -15, credibility: -10 } }, { text: "Offer her a stretch project she'd find meaningful", effects: { trust: 10, engagement: 20, performance: 5, fairness: 5, credibility: 10 } }] },
  { id: 'e9', category: 'Performance vs Fairness', title: 'Remote Work Request', description: 'Tom requests permanent remote work due to childcare. Others have been denied similar requests.', delivery: 'email', character: 'tom', tags: ['oneOnOnes', 'strategy'], options: [{ text: 'Approve as compassionate exception', effects: { trust: 5, engagement: 10, performance: -5, fairness: -15, credibility: -5 } }, { text: 'Deny to maintain policy consistency', effects: { trust: -10, engagement: -15, performance: 5, fairness: 10, credibility: 5 } }, { text: 'Propose hybrid compromise', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Revisit remote policy for entire team', effects: { trust: 15, engagement: 15, performance: -5, fairness: 15, credibility: 15, emotionalLoad: 15 } }] },
  { id: 'e10', category: 'Performance vs Fairness', title: 'The Knowledge Hoarder', description: 'Dave refuses to document his processes, making the team dependent on him.', delivery: 'observation', character: 'dave', tags: ['coaching', 'tools'], options: [{ text: 'Make documentation a formal objective', effects: { trust: 5, engagement: -5, performance: 5, fairness: 10, credibility: 10 } }, { text: 'Pair him with Liam for knowledge transfer', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 5 } }, { text: 'Accept it - his output is worth the risk', effects: { trust: -5, engagement: -5, performance: 5, fairness: -10, credibility: -10 } }, { text: 'Hire someone to shadow and document him', effects: { trust: 0, engagement: 0, performance: 0, fairness: 5, credibility: 5, emotionalLoad: 10 } }] },
  { id: 'e11', category: 'Emotional & Ethical', title: 'Morning Concern', description: 'Tom arrives smelling of alcohol. He has a client presentation in 2 hours.', delivery: 'observation', character: 'tom', tags: ['oneOnOnes', 'selfCare'], options: [{ text: 'Send him home quietly', effects: { trust: 5, engagement: -5, performance: -10, fairness: 5, credibility: 10 } }, { text: 'Escalate to HR immediately', effects: { trust: -10, engagement: -15, performance: -5, fairness: 10, credibility: 5 } }, { text: 'Cover for him and discuss tomorrow', effects: { trust: 5, engagement: 5, performance: 5, fairness: -10, credibility: -15 } }, { text: "Direct conversation now about what's happening", effects: { trust: 10, engagement: 5, performance: -5, fairness: 10, credibility: 15 } }] },
  { id: 'e12', category: 'Emotional & Ethical', title: 'Bullying Accusation', description: 'Anonymous HR complaint: Sarah claims Dave bullied her in a meeting. Dave denies it. No witnesses.', delivery: 'hr_complaint', character: 'sarah', tags: ['oneOnOnes', 'teamBuilding'], options: [{ text: 'Launch formal investigation', effects: { trust: 5, engagement: -5, performance: -10, fairness: 15, credibility: 10 } }, { text: 'Mediate informally between them', effects: { trust: 0, engagement: 0, performance: -5, fairness: 5, credibility: 5 } }, { text: 'Dismiss without evidence', effects: { trust: -20, engagement: -15, performance: 5, fairness: -25, credibility: -15 } }, { text: 'Implement team behaviour training for all', effects: { trust: 5, engagement: 0, performance: -5, fairness: 10, credibility: 10 } }] },
  { id: 'e13', category: 'Emotional & Ethical', title: 'Mental Health Disclosure', description: "Hours before her performance review, Aisha discloses she's been struggling with depression.", delivery: 'corridor', character: 'aisha', tags: ['oneOnOnes', 'selfCare'], options: [{ text: 'Postpone the review', effects: { trust: 10, engagement: 5, performance: -5, fairness: 5, credibility: 10 } }, { text: 'Proceed but factor it into the conversation', effects: { trust: 5, engagement: 5, performance: 0, fairness: 0, credibility: 5 } }, { text: 'Proceed as normal to maintain fairness', effects: { trust: -10, engagement: -15, performance: 5, fairness: 5, credibility: -5 } }, { text: 'Connect her with EAP and reschedule for next week', effects: { trust: 15, engagement: 10, performance: -5, fairness: 10, credibility: 15 } }] },
  { id: 'e14', category: 'Emotional & Ethical', title: 'The Breakdown', description: "Sarah breaks down crying in a 1:1, admitting she's overwhelmed and hasn't slept properly in weeks.", delivery: 'meeting', character: 'sarah', tags: ['oneOnOnes', 'selfCare'], options: [{ text: 'Immediately reduce her workload', effects: { trust: 15, engagement: 10, performance: -10, fairness: 5, credibility: 10 } }, { text: 'Listen fully, then ask what support she needs', effects: { trust: 20, engagement: 15, performance: -5, fairness: 10, credibility: 15 } }, { text: 'Suggest she takes some annual leave', effects: { trust: 5, engagement: 5, performance: -5, fairness: 5, credibility: 5 } }, { text: 'Tell her everyone is under pressure right now', effects: { trust: -20, engagement: -25, performance: 5, fairness: -10, credibility: -20 } }] },
  { id: 'e15', category: 'Emotional & Ethical', title: 'Inappropriate Joke', description: "You overhear Dave make a sexist joke. Sarah and Aisha were present but didn't react visibly.", delivery: 'observation', character: 'dave', tags: ['coaching', 'teamBuilding'], options: [{ text: 'Address it publicly in the moment', effects: { trust: 10, engagement: 5, performance: -5, fairness: 15, credibility: 15 } }, { text: 'Pull Dave aside privately afterwards', effects: { trust: 5, engagement: 5, performance: 0, fairness: 10, credibility: 10 } }, { text: 'Let it go - it was just a joke', effects: { trust: -15, engagement: -10, performance: 0, fairness: -20, credibility: -15 } }, { text: 'Check in with Sarah and Aisha separately first', effects: { trust: 10, engagement: 10, performance: 0, fairness: 10, credibility: 10 } }] },
  { id: 'e16', category: 'Emotional & Ethical', title: 'Family Emergency', description: "Liam needs 2 weeks off immediately - his mother has been hospitalised overseas.", delivery: 'urgent_meeting', character: 'liam', tags: ['oneOnOnes', 'selfCare'], options: [{ text: 'Approve fully paid compassionate leave', effects: { trust: 20, engagement: 15, performance: -10, fairness: 10, credibility: 15 } }, { text: 'Approve 1 week paid, 1 week unpaid', effects: { trust: 5, engagement: 5, performance: -5, fairness: 0, credibility: 5 } }, { text: 'Ask him to work remotely where possible', effects: { trust: -15, engagement: -20, performance: 0, fairness: -10, credibility: -15 } }, { text: 'Follow policy strictly - 3 days compassionate only', effects: { trust: -10, engagement: -15, performance: 0, fairness: 5, credibility: 0 } }] },
  { id: 'e17', category: 'Emotional & Ethical', title: 'Substance Concern', description: 'Multiple team members have mentioned Tom seems "different" lately. You suspect substance issues.', delivery: 'pulse_survey', character: 'tom', tags: ['oneOnOnes', 'selfCare'], options: [{ text: 'Have a direct, caring conversation with Tom', effects: { trust: 10, engagement: 5, performance: 0, fairness: 10, credibility: 15 } }, { text: 'Escalate to HR for welfare check', effects: { trust: -5, engagement: -5, performance: 0, fairness: 5, credibility: 5 } }, { text: "Monitor but don't intervene yet", effects: { trust: -5, engagement: -5, performance: 0, fairness: -5, credibility: -5 } }, { text: 'Focus purely on performance metrics', effects: { trust: -10, engagement: -10, performance: 5, fairness: -10, credibility: -10 } }] },
  { id: 'e18', category: 'Emotional & Ethical', title: 'Grief at Work', description: "Sarah's father passed away last month. She returned after a week but seems disengaged.", delivery: 'observation', character: 'sarah', tags: ['oneOnOnes', 'selfCare'], options: [{ text: 'Give her space and reduce expectations quietly', effects: { trust: 15, engagement: 10, performance: -10, fairness: 5, credibility: 10 } }, { text: "Check in directly about how she's coping", effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 15 } }, { text: 'Treat her the same to maintain normalcy', effects: { trust: -5, engagement: -10, performance: 5, fairness: 5, credibility: 0 } }, { text: 'Suggest professional bereavement support', effects: { trust: 5, engagement: 5, performance: -5, fairness: 5, credibility: 10 } }] },
  { id: 'e19', category: 'Emotional & Ethical', title: 'Conflict Escalation', description: 'Heated argument between Dave and Tom in the open office. Others are uncomfortable.', delivery: 'observation', character: null, tags: ['teamBuilding', 'coaching'], options: [{ text: 'Intervene immediately and separate them', effects: { trust: 5, engagement: 0, performance: -5, fairness: 10, credibility: 15 } }, { text: 'Let them work it out, address later', effects: { trust: -10, engagement: -10, performance: -5, fairness: -10, credibility: -10 } }, { text: 'Take both to a private room now', effects: { trust: 10, engagement: 5, performance: -5, fairness: 15, credibility: 15 } }, { text: 'Send team-wide message about professional conduct', effects: { trust: 0, engagement: 0, performance: 0, fairness: 5, credibility: 5 } }] },
  { id: 'e20', category: 'Emotional & Ethical', title: 'Whistle-blower Dilemma', description: "Aisha shows you evidence that a senior leader falsified project metrics. She's scared.", delivery: 'private_meeting', character: 'aisha', tags: ['oneOnOnes', 'strategy'], options: [{ text: 'Escalate through official channels immediately', effects: { trust: 15, engagement: 10, performance: -5, fairness: 20, credibility: 15, emotionalLoad: 20 } }, { text: 'Advise her to report it herself, offer support', effects: { trust: 10, engagement: 5, performance: 0, fairness: 10, credibility: 10 } }, { text: 'Bury it - too politically dangerous', effects: { trust: -25, engagement: -20, performance: 5, fairness: -30, credibility: -25 } }, { text: 'Gather more evidence before acting', effects: { trust: 5, engagement: 5, performance: -5, fairness: 5, credibility: 5, emotionalLoad: 15 } }] },
  { id: 'e21', category: 'Trust & Perception', title: 'The Rumour Mill', description: 'Team believes promotions are "favourites only". Aisha mentioned it in a skip-level meeting.', delivery: 'feedback', character: 'aisha', tags: ['recognition', 'strategy'], options: [{ text: 'Create transparent promotion criteria publicly', effects: { trust: 15, engagement: 10, performance: 0, fairness: 20, credibility: 15 } }, { text: 'Address the rumour in team meeting', effects: { trust: 5, engagement: 5, performance: 0, fairness: 10, credibility: 10 } }, { text: 'Have 1:1s to understand perceptions', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 15, emotionalLoad: 10 } }, { text: 'Dismiss as unfounded gossip', effects: { trust: -15, engagement: -15, performance: 5, fairness: -20, credibility: -15 } }] },
  { id: 'e22', category: 'Trust & Perception', title: 'Broken Promise', description: "Tom claims you promised him a project lead role 3 months ago. You don't remember this.", delivery: 'email', character: 'tom', tags: ['oneOnOnes', 'recognition'], options: [{ text: 'Apologise and honour what he remembers', effects: { trust: 10, engagement: 15, performance: -5, fairness: -10, credibility: -5 } }, { text: 'Ask for context and investigate your notes', effects: { trust: 0, engagement: 0, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Deny making the promise', effects: { trust: -20, engagement: -20, performance: 0, fairness: -10, credibility: -15 } }, { text: "Acknowledge miscommunication, discuss what's possible now", effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 10 } }] },
  { id: 'e23', category: 'Trust & Perception', title: 'Behind Closed Doors', description: 'Sarah asks why Dave has so many private meetings with you. She feels excluded.', delivery: 'corridor', character: 'sarah', tags: ['oneOnOnes', 'teamBuilding'], options: [{ text: "Explain they're performance-related", effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Start having visible 1:1s with everyone', effects: { trust: 15, engagement: 15, performance: -5, fairness: 15, credibility: 15 } }, { text: 'Dismiss her concern', effects: { trust: -15, engagement: -20, performance: 0, fairness: -15, credibility: -10 } }, { text: "Ask what she's really worried about", effects: { trust: 10, engagement: 10, performance: 0, fairness: 10, credibility: 10 } }] },
  { id: 'e24', category: 'Trust & Perception', title: 'Social Media Storm', description: 'Anonymous post on Glassdoor describes your team as "toxic with a weak manager".', delivery: 'notification', character: null, tags: ['teamBuilding', 'strategy'], options: [{ text: 'Address it openly with the team', effects: { trust: 10, engagement: 5, performance: 0, fairness: 10, credibility: 15 } }, { text: 'Investigate who posted it', effects: { trust: -15, engagement: -15, performance: 0, fairness: -10, credibility: -10 } }, { text: "Ignore it - anonymous feedback isn't valid", effects: { trust: -5, engagement: -5, performance: 5, fairness: -5, credibility: -5 } }, { text: 'Run anonymous team survey to get real feedback', effects: { trust: 15, engagement: 10, performance: -5, fairness: 15, credibility: 10 } }] },
  { id: 'e25', category: 'Trust & Perception', title: 'Lunch Table Politics', description: 'You notice Aisha and Sarah have stopped eating with the team. Dave dominates the lunch group.', delivery: 'observation', character: null, tags: ['teamBuilding', 'coaching'], options: [{ text: 'Organise inclusive team activities', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 10 } }, { text: 'Speak to Dave about being more inclusive', effects: { trust: 5, engagement: 5, performance: 0, fairness: 10, credibility: 10 } }, { text: 'Check in with Aisha and Sarah separately', effects: { trust: 10, engagement: 10, performance: 0, fairness: 10, credibility: 10 } }, { text: "It's just lunch - not your concern", effects: { trust: -10, engagement: -10, performance: 0, fairness: -15, credibility: -10 } }] },
  { id: 'e26', category: 'Trust & Perception', title: 'Email Forward Disaster', description: 'You accidentally forwarded internal feedback about Tom to the whole team. He saw.', delivery: 'crisis', character: 'tom', tags: ['oneOnOnes', 'selfCare'], options: [{ text: 'Public apology to Tom and the team', effects: { trust: 10, engagement: 5, performance: -5, fairness: 10, credibility: 10 } }, { text: 'Private apology to Tom, ignore the rest', effects: { trust: -5, engagement: -10, performance: 0, fairness: -10, credibility: -5 } }, { text: 'Send correction email minimising it', effects: { trust: -10, engagement: -10, performance: 0, fairness: -5, credibility: -15 } }, { text: 'Urgent 1:1 with Tom to discuss and repair', effects: { trust: 5, engagement: 5, performance: -5, fairness: 5, credibility: 10 } }] },
  { id: 'e27', category: 'Trust & Perception', title: 'The Comparison Game', description: "Liam asks why Dave gets the interesting projects while he's stuck on maintenance work.", delivery: 'meeting', character: 'liam', tags: ['coaching', 'training'], options: [{ text: 'Explain experience-based allocation', effects: { trust: 5, engagement: 0, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Give Liam a stretch opportunity', effects: { trust: 15, engagement: 20, performance: -5, fairness: 10, credibility: 10 } }, { text: 'Tell him to focus on his own development', effects: { trust: -10, engagement: -15, performance: 5, fairness: -10, credibility: -10 } }, { text: 'Create a rotation system for projects', effects: { trust: 10, engagement: 10, performance: -5, fairness: 15, credibility: 10 } }] },
  { id: 'e28', category: 'Trust & Perception', title: 'The Whisperers', description: "You walk into a room and conversation stops. Something's being discussed without you.", delivery: 'observation', character: null, tags: ['teamBuilding', 'oneOnOnes'], options: [{ text: 'Ask directly what was being discussed', effects: { trust: -5, engagement: -5, performance: 0, fairness: 0, credibility: 5 } }, { text: 'Create more open communication channels', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 10 } }, { text: 'Ignore it - some privacy is healthy', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 0 } }, { text: 'Schedule team retrospective on communication', effects: { trust: 10, engagement: 5, performance: -5, fairness: 10, credibility: 10 } }] },
  { id: 'e29', category: 'Trust & Perception', title: 'Exit Interview Bombshell', description: "A former team member's exit interview cited \"inconsistent leadership\" as reason for leaving.", delivery: 'hr_report', character: null, tags: ['strategy', 'selfCare'], options: [{ text: 'Request full feedback and reflect seriously', effects: { trust: 10, engagement: 5, performance: -5, fairness: 10, credibility: 15 } }, { text: 'Dismiss as sour grapes', effects: { trust: -10, engagement: -10, performance: 5, fairness: -10, credibility: -15 } }, { text: 'Survey current team for similar concerns', effects: { trust: 15, engagement: 10, performance: -5, fairness: 15, credibility: 15 } }, { text: 'Privately review your recent decisions', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 10 } }] },
  { id: 'e30', category: 'Trust & Perception', title: 'Playing Favourites', description: 'Aisha directly accuses you of favouring Dave in a team meeting. Everyone goes silent.', delivery: 'meeting', character: 'aisha', tags: ['oneOnOnes', 'recognition'], options: [{ text: 'Deny it calmly and move on', effects: { trust: -10, engagement: -10, performance: 5, fairness: -15, credibility: -10 } }, { text: 'Thank her for the feedback and discuss after', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 15 } }, { text: 'Get defensive and list counterexamples', effects: { trust: -15, engagement: -15, performance: 5, fairness: -10, credibility: -20 } }, { text: 'Acknowledge perception matters and commit to review', effects: { trust: 15, engagement: 15, performance: -5, fairness: 15, credibility: 15 } }] },
  { id: 'e31', category: 'Organisational Constraints', title: 'Budget Freeze', description: 'Finance announces an immediate freeze on all discretionary spending. Your team was expecting training.', delivery: 'announcement', character: null, tags: ['training', 'strategy'], options: [{ text: 'Fight for exceptions for critical training', effects: { trust: 10, engagement: 10, performance: 0, fairness: 5, credibility: 10, emotionalLoad: 15 } }, { text: 'Find free alternatives and pivot messaging', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Communicate transparently and apologise', effects: { trust: 10, engagement: 5, performance: 0, fairness: 10, credibility: 10 } }, { text: 'Promise to reinstate once freeze lifts', effects: { trust: -5, engagement: -5, performance: 0, fairness: 0, credibility: -5 } }] },
  { id: 'e32', category: 'Organisational Constraints', title: 'Hiring Blocked', description: 'Your request to replace a departed team member has been denied. Team is already stretched.', delivery: 'email', character: null, tags: ['strategy', 'tools'], options: [{ text: 'Push back with data on capacity', effects: { trust: 10, engagement: 10, performance: -5, fairness: 5, credibility: 10, emotionalLoad: 15 } }, { text: 'Redistribute work and reduce scope', effects: { trust: 5, engagement: 0, performance: -5, fairness: 5, credibility: 10 } }, { text: 'Request contractor budget instead', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 5 } }, { text: 'Accept and push team harder', effects: { trust: -15, engagement: -20, performance: 5, fairness: -10, credibility: -10 } }] },
  { id: 'e33', category: 'Organisational Constraints', title: 'Policy Conflict', description: 'HR says you must put Tom on a PIP. Your instinct says he needs support, not punishment.', delivery: 'meeting', character: 'tom', tags: ['oneOnOnes', 'coaching'], options: [{ text: 'Follow HR policy and start the PIP', effects: { trust: -10, engagement: -15, performance: 5, fairness: 5, credibility: 5 } }, { text: 'Negotiate a support plan alternative', effects: { trust: 10, engagement: 10, performance: 0, fairness: 10, credibility: 15, emotionalLoad: 10 } }, { text: 'Delay and hope things improve', effects: { trust: 0, engagement: 0, performance: -5, fairness: -5, credibility: -10 } }, { text: 'Escalate your concerns about the policy', effects: { trust: 5, engagement: 5, performance: -5, fairness: 10, credibility: 10, emotionalLoad: 15 } }] },
  { id: 'e34', category: 'Organisational Constraints', title: 'Senior Override', description: 'Your boss overrides your recommendation to promote Sarah. They want Dave instead.', delivery: 'meeting', character: null, tags: ['strategy', 'recognition'], options: [{ text: 'Accept the decision and explain to Sarah', effects: { trust: -10, engagement: -15, performance: 0, fairness: -15, credibility: -5 } }, { text: 'Push back with documented rationale', effects: { trust: 10, engagement: 5, performance: -5, fairness: 15, credibility: 15, emotionalLoad: 15 } }, { text: 'Accept but document your disagreement', effects: { trust: 0, engagement: 0, performance: 0, fairness: 5, credibility: 5 } }, { text: 'Ask to promote both', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 10, emotionalLoad: 10 } }] },
  { id: 'e35', category: 'Organisational Constraints', title: 'Restructure Rumours', description: 'Rumours of layoffs are circulating. Your team is anxious. You have limited information.', delivery: 'observation', character: null, tags: ['oneOnOnes', 'teamBuilding'], options: [{ text: 'Share what you know honestly', effects: { trust: 15, engagement: 5, performance: -5, fairness: 15, credibility: 15 } }, { text: 'Deny the rumours to maintain calm', effects: { trust: -15, engagement: 0, performance: 5, fairness: -10, credibility: -15 } }, { text: "Say you'll share updates when you can", effects: { trust: 5, engagement: 0, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Focus team on controllables - their work', effects: { trust: 5, engagement: 5, performance: 5, fairness: 5, credibility: 10 } }] },
  { id: 'e36', category: 'Organisational Constraints', title: 'Mandatory RTO', description: 'Company announces mandatory 5-day return to office. Your team is furious.', delivery: 'announcement', character: null, tags: ['teamBuilding', 'strategy'], options: [{ text: 'Advocate loudly for team flexibility', effects: { trust: 15, engagement: 15, performance: -5, fairness: 10, credibility: 15, emotionalLoad: 15 } }, { text: 'Enforce it strictly to show compliance', effects: { trust: -20, engagement: -25, performance: 5, fairness: -10, credibility: -10 } }, { text: 'Find creative workarounds quietly', effects: { trust: 10, engagement: 10, performance: 0, fairness: -5, credibility: 5 } }, { text: 'Listen to team concerns and escalate themes', effects: { trust: 15, engagement: 10, performance: -5, fairness: 10, credibility: 15, emotionalLoad: 10 } }] },
  { id: 'e37', category: 'Organisational Constraints', title: 'Impossible Deadline', description: 'Leadership wants the project done in half the time with the same team.', delivery: 'email', character: null, tags: ['tools', 'strategy'], options: [{ text: 'Push back with realistic estimates', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 15, emotionalLoad: 15 } }, { text: 'Commit and push team to deliver', effects: { trust: -15, engagement: -20, performance: 10, fairness: -10, credibility: 5 } }, { text: 'Propose scope reduction', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 10 } }, { text: 'Request additional resources', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 5, emotionalLoad: 10 } }] },
  { id: 'e38', category: 'Organisational Constraints', title: 'Merger Anxiety', description: 'Your company is being acquired. Team roles are uncertain. Morale is tanking.', delivery: 'announcement', character: null, tags: ['teamBuilding', 'oneOnOnes'], options: [{ text: 'Be a source of stability and consistency', effects: { trust: 10, engagement: 10, performance: 0, fairness: 10, credibility: 15 } }, { text: 'Encourage people to update their CVs', effects: { trust: -5, engagement: -15, performance: -5, fairness: 5, credibility: 0 } }, { text: 'Advocate for your team in the transition', effects: { trust: 15, engagement: 15, performance: -5, fairness: 10, credibility: 15, emotionalLoad: 15 } }, { text: 'Focus purely on deliverables to prove value', effects: { trust: -5, engagement: -10, performance: 10, fairness: -5, credibility: 5 } }] },
  { id: 'e39', category: 'Organisational Constraints', title: 'Conflicting Priorities', description: 'Two senior leaders are giving your team conflicting priorities. Team is confused.', delivery: 'meeting', character: null, tags: ['strategy', 'coaching'], options: [{ text: 'Escalate and force alignment', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 15, emotionalLoad: 15 } }, { text: 'Make the call yourself and take ownership', effects: { trust: 10, engagement: 10, performance: 0, fairness: 5, credibility: 15 } }, { text: 'Split team to try satisfying both', effects: { trust: -5, engagement: -10, performance: 5, fairness: -5, credibility: -5 } }, { text: 'Ask team which priority they think is right', effects: { trust: 5, engagement: 10, performance: -5, fairness: 10, credibility: 5 } }] },
  { id: 'e40', category: 'Organisational Constraints', title: 'Cost-Cutting Cascade', description: 'You must cut 20% from your team budget. Options: training, tools, or a contractor.', delivery: 'directive', character: null, tags: ['training', 'tools'], options: [{ text: 'Cut training - least immediate impact', effects: { trust: -5, engagement: -15, performance: 5, fairness: -5, credibility: 0 } }, { text: 'Cut tools - team can adapt', effects: { trust: -5, engagement: -10, performance: -5, fairness: 0, credibility: 0 } }, { text: 'Cut the contractor', effects: { trust: 0, engagement: -5, performance: -10, fairness: 5, credibility: 5 } }, { text: 'Propose alternative savings to leadership', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 15, emotionalLoad: 15 } }] },
  { id: 'e41', category: 'You as Manager', title: 'Burnout Warning', description: "You've worked 60+ hour weeks for a month. Your own performance is slipping.", delivery: 'self_reflection', character: null, tags: ['selfCare', 'strategy'], options: [{ text: 'Push through - the team needs you', effects: { trust: -5, engagement: 5, performance: 5, fairness: 0, credibility: 5, emotionalLoad: 25 } }, { text: 'Delegate more and set boundaries', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 10, emotionalLoad: -15 } }, { text: 'Take a few days off to recover', effects: { trust: 5, engagement: 5, performance: -10, fairness: 5, credibility: 5, emotionalLoad: -20 } }, { text: 'Keep going but ask for help from your boss', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 10, emotionalLoad: -10 } }] },
  { id: 'e42', category: 'You as Manager', title: 'Back-to-Back Doom', description: 'You have 8 hours of meetings today. Three team members need urgent 1:1s.', delivery: 'calendar', character: null, tags: ['oneOnOnes', 'selfCare'], options: [{ text: 'Cancel lower priority meetings', effects: { trust: 10, engagement: 10, performance: -5, fairness: 5, credibility: 10, emotionalLoad: -5 } }, { text: 'Squeeze 1:1s into lunch and evening', effects: { trust: 5, engagement: 5, performance: 5, fairness: 0, credibility: 5, emotionalLoad: 15 } }, { text: 'Postpone 1:1s to tomorrow', effects: { trust: -10, engagement: -10, performance: 5, fairness: -5, credibility: -5 } }, { text: 'Quick standing check-ins between meetings', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 5, emotionalLoad: 5 } }] },
  { id: 'e43', category: 'You as Manager', title: 'Boss Pressure', description: 'Your boss is pushing you to "deal with" Tom. The implication is termination.', delivery: 'private_meeting', character: null, tags: ['oneOnOnes', 'strategy'], options: [{ text: 'Begin exit process for Tom', effects: { trust: -15, engagement: -20, performance: 5, fairness: -15, credibility: -5 } }, { text: 'Present a case for giving Tom more time', effects: { trust: 10, engagement: 10, performance: -5, fairness: 15, credibility: 15, emotionalLoad: 15 } }, { text: 'Agree publicly, delay privately', effects: { trust: 0, engagement: 0, performance: 0, fairness: -5, credibility: -10 } }, { text: 'Ask what specific outcomes would change their mind', effects: { trust: 5, engagement: 5, performance: 0, fairness: 10, credibility: 10 } }] },
  { id: 'e44', category: 'You as Manager', title: 'Decision Fatigue', description: "It's 4pm and you've made 50+ decisions today. Sarah needs guidance on a complex issue.", delivery: 'slack', character: 'sarah', tags: ['coaching', 'selfCare'], options: [{ text: 'Give her your best thinking now', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 5, emotionalLoad: 10 } }, { text: 'Ask her to come back tomorrow', effects: { trust: -5, engagement: -5, performance: 0, fairness: 0, credibility: 0, emotionalLoad: -5 } }, { text: 'Coach her to decide for herself', effects: { trust: 10, engagement: 10, performance: 0, fairness: 10, credibility: 15, emotionalLoad: -5 } }, { text: 'Quickly make a call to move things forward', effects: { trust: 0, engagement: 0, performance: 5, fairness: 0, credibility: 0, emotionalLoad: 5 } }] },
  { id: 'e45', category: 'You as Manager', title: 'Imposter Syndrome', description: "Liam asks for your advice on something you're genuinely unsure about.", delivery: 'meeting', character: 'liam', tags: ['coaching', 'training'], options: [{ text: "Admit you don't know and find out together", effects: { trust: 15, engagement: 15, performance: -5, fairness: 10, credibility: 15 } }, { text: 'Give confident-sounding advice anyway', effects: { trust: -5, engagement: 0, performance: 0, fairness: -5, credibility: -10 } }, { text: 'Deflect to someone with more expertise', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 5 } }, { text: "Say you'll research and follow up", effects: { trust: 5, engagement: 5, performance: -5, fairness: 5, credibility: 10 } }] },
  { id: 'e46', category: 'You as Manager', title: 'Personal Crisis', description: 'You receive bad news about a family member during an important team meeting.', delivery: 'notification', character: null, tags: ['selfCare', 'teamBuilding'], options: [{ text: 'Power through and deal with it later', effects: { trust: -5, engagement: 0, performance: 5, fairness: 0, credibility: 0, emotionalLoad: 20 } }, { text: 'Excuse yourself and ask Dave to take over', effects: { trust: 5, engagement: 5, performance: -5, fairness: 5, credibility: 10 } }, { text: 'Be transparent about needing to step out', effects: { trust: 15, engagement: 10, performance: -10, fairness: 10, credibility: 10 } }, { text: 'Abruptly end the meeting', effects: { trust: -10, engagement: -10, performance: -5, fairness: -5, credibility: -5 } }] },
  { id: 'e47', category: 'You as Manager', title: 'Micromanagement Feedback', description: 'Anonymous feedback says you "hover too much" and "don\'t trust the team".', delivery: 'pulse_survey', character: null, tags: ['coaching', 'selfCare'], options: [{ text: 'Consciously step back and delegate more', effects: { trust: 15, engagement: 15, performance: -5, fairness: 10, credibility: 15, emotionalLoad: -10 } }, { text: 'Ask for specific examples to understand', effects: { trust: 5, engagement: 5, performance: 0, fairness: 5, credibility: 10 } }, { text: "Get defensive - you're just being thorough", effects: { trust: -10, engagement: -15, performance: 5, fairness: -10, credibility: -15 } }, { text: 'Discuss with the team openly', effects: { trust: 15, engagement: 10, performance: -5, fairness: 15, credibility: 15 } }] },
  { id: 'e48', category: 'You as Manager', title: 'Sleep Deficit', description: "You've slept poorly for a week. You have a difficult conversation with Aisha scheduled today.", delivery: 'self_reflection', character: 'aisha', tags: ['oneOnOnes', 'selfCare'], options: [{ text: 'Have the conversation anyway', effects: { trust: -5, engagement: -5, performance: 0, fairness: -5, credibility: -5, emotionalLoad: 10 } }, { text: "Reschedule to when you're sharper", effects: { trust: -5, engagement: -5, performance: -5, fairness: 0, credibility: 5 } }, { text: 'Proceed but stick to a script', effects: { trust: 0, engagement: 0, performance: 0, fairness: 5, credibility: 5 } }, { text: "Have the conversation but acknowledge you're tired", effects: { trust: 10, engagement: 5, performance: -5, fairness: 5, credibility: 10 } }] },
  { id: 'e49', category: 'You as Manager', title: 'Career Crossroads', description: "You've been offered a role in another team. Your current team would struggle without you.", delivery: 'private_meeting', character: null, tags: ['strategy', 'coaching'], options: [{ text: 'Take the opportunity - team will adapt', effects: { trust: -10, engagement: -15, performance: -10, fairness: 0, credibility: -5 } }, { text: 'Stay and invest in developing the team', effects: { trust: 15, engagement: 15, performance: 5, fairness: 10, credibility: 15 } }, { text: 'Negotiate a transition period', effects: { trust: 5, engagement: 5, performance: -5, fairness: 10, credibility: 10 } }, { text: 'Ask team for input on the decision', effects: { trust: 10, engagement: 10, performance: -5, fairness: 10, credibility: 10 } }] },
  { id: 'e50', category: 'You as Manager', title: 'The Mirror', description: 'A coach asks you: "What kind of manager do you want to be remembered as?"', delivery: 'reflection', character: null, tags: ['selfCare', 'strategy'], options: [{ text: 'Results-driven - someone who delivered', effects: { trust: -5, engagement: -5, performance: 15, fairness: -5, credibility: 10 } }, { text: 'People-first - someone who cared', effects: { trust: 15, engagement: 15, performance: -10, fairness: 10, credibility: 10 } }, { text: 'Balanced - effective and humane', effects: { trust: 10, engagement: 10, performance: 5, fairness: 10, credibility: 15 } }, { text: 'Honest - someone who told the truth', effects: { trust: 15, engagement: 10, performance: 0, fairness: 15, credibility: 15 } }] },
];

const INITIAL_METRICS = { trust: 65, engagement: 65, performance: 70, retention: 70, fairness: 65, credibility: 60, emotionalLoad: 30 };
const INITIAL_INVESTMENTS = { training: 0, teamBuilding: 0, tools: 0, recognition: 0, oneOnOnes: 0, coaching: 0, strategy: 0, selfCare: 0 };

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const getMetricColor = (v) => v >= 70 ? COLORS.teal : v >= 40 ? COLORS.yellow : '#ff4757';
const getDeliveryIcon = (d) => ({ email: '📧', slack: '💬', calendar: '📅', corridor: '🚶', observation: '👁️', meeting: '🤝', hr_complaint: '📋', pulse_survey: '📊', urgent_meeting: '🚨', private_meeting: '🔒', feedback: '💭', notification: '🔔', hr_report: '📑', announcement: '📢', directive: '⚡', self_reflection: '🪞', crisis: '⚠️', reflection: '💡' })[d] || '📌';

const getInvestmentModifier = (event, inv) => {
  if (!event.tags?.length) return 1;
  let total = 0, count = 0;
  event.tags.forEach(t => { if (inv[t] !== undefined) { total += inv[t]; count++; } });
  return count ? total / count / 50 : 1;
};

const calculateInvestmentCost = (investments) => {
  return Object.entries(investments).reduce((total, [key, value]) => {
    const costPer10 = INVESTMENT_COSTS[key] || 0;
    const units = value / 10;
    return total + (costPer10 * units);
  }, 0);
};

const FACILITATION_PROMPTS = {
  plan: [
    { round: 1, prompt: "This is your first quarter. What do you notice about your team's starting position? Where are the risks and opportunities?" },
    { round: 2, prompt: "Reflect on Q1. What patterns emerged? Which relationships need attention heading into this quarter?" },
    { round: 3, prompt: "You're past the halfway mark. What's your strategy for the remaining quarters? Are you reacting or leading?" },
    { round: 4, prompt: "Final quarter. What legacy are you building? What would you do differently if you started over?" },
  ],
  reflect: [
    { round: 1, prompt: "How did your first set of decisions feel? Were you surprised by any of the consequences?" },
    { round: 2, prompt: "Are you noticing any trade-offs between metrics? What tensions are emerging in your approach?" },
    { round: 3, prompt: "Think about the team members individually. Who needs your attention most, and why?" },
    { round: 4, prompt: "Looking at the full journey, what would you tell a new manager about what you've learned?" },
  ],
};

const generatePlanInsights = (chars, metrics, budget, round, history) => {
  const insights = [];
  const active = chars.filter(c => !c.departed);

  const avgEngagement = active.reduce((s, c) => s + c.engagement, 0) / Math.max(1, active.length);
  if (avgEngagement < 50) {
    insights.push({ icon: '📉', text: `Team engagement is low (avg ${Math.round(avgEngagement)}).` });
  } else if (avgEngagement > 75) {
    insights.push({ icon: '✅', text: `Team engagement is healthy (avg ${Math.round(avgEngagement)}).` });
  } else {
    insights.push({ icon: '📊', text: `Team engagement is moderate (avg ${Math.round(avgEngagement)}).` });
  }

  const overloaded = active.filter(c => c.loadPercent > 120);
  if (overloaded.length > 0) {
    insights.push({ icon: '🔥', text: `${overloaded.length} team member${overloaded.length > 1 ? 's are' : ' is'} overloaded. Burnout risk is real.` });
  }

  const burnoutRisk = active.filter(c => c.loadPercent > 140);
  if (burnoutRisk.length > 0) {
    insights.push({ icon: '🚨', text: `${burnoutRisk.map(c => c.name).join(', ')} at critical burnout levels.` });
  }

  if (budget.current === 0) {
    insights.push({ icon: '🚫', text: 'No budget remaining. You can only make time investments this quarter.' });
  } else if (budget.current < 1000) {
    insights.push({ icon: '💰', text: `Budget tight at £${budget.current.toLocaleString()}.` });
  } else {
    insights.push({ icon: '💰', text: `£${budget.current.toLocaleString()} available this quarter.` });
  }

  const atRiskChars = active.filter(c => c.atRisk);
  if (atRiskChars.length > 0) {
    insights.push({ icon: '⚠️', text: `${atRiskChars.map(c => c.name).join(', ')} flagged as at risk of leaving.` });
  }

  if (metrics.trust < 50) {
    insights.push({ icon: '🤝', text: `Trust is critically low (${Math.round(metrics.trust)}).` });
  }

  if (metrics.emotionalLoad > 70) {
    insights.push({ icon: '🧠', text: `Your personal load is high (${Math.round(metrics.emotionalLoad)}%).` });
  }

  const departed = chars.filter(c => c.departed).length;
  if (departed > 0) {
    insights.push({ icon: '🪑', text: `${departed} team member${departed > 1 ? 's have' : ' has'} departed. Remaining team is absorbing extra work.` });
  }

  if (history.length > 1 && round > 1) {
    const prev = history[history.length - 1];
    const trustDelta = metrics.trust - prev.trust;
    const perfDelta = metrics.performance - prev.performance;
    if (trustDelta < -10) {
      insights.push({ icon: '📉', text: `Trust dropped ${Math.abs(Math.round(trustDelta))} points last quarter.` });
    }
    if (perfDelta < -10) {
      insights.push({ icon: '📉', text: `Performance fell ${Math.abs(Math.round(perfDelta))} points last quarter.` });
    }
  }

  return insights.slice(0, 5);
};

const generateReflectionPrompts = (chars, metrics, history, decisions, round) => {
  const prompts = [];
  const roundDecisions = decisions.filter(d => d.round === round);

  const departures = chars.filter(c => c.departed);
  if (departures.length > 0) {
    prompts.push({ icon: '🚪', text: `${departures.map(c => c.name).join(', ')} left the team. What could have been done differently to retain them?` });
  }

  if (history.length >= 2) {
    const prevLoad = history[history.length - 2]?.emotionalLoad || 30;
    const loadDelta = metrics.emotionalLoad - prevLoad;
    if (loadDelta > 15) {
      prompts.push({ icon: '🧠', text: 'Your personal load increased significantly this quarter. Is that sustainable?' });
    } else if (loadDelta < -10) {
      prompts.push({ icon: '🧘', text: 'You managed to reduce your load this quarter. What choices made that possible?' });
    }
  }

  if (history.length >= 2) {
    const prevPerf = history[history.length - 2]?.performance || 70;
    if (metrics.performance > prevPerf + 5) {
      prompts.push({ icon: '📈', text: 'Performance improved this quarter. Which decisions contributed most to that?' });
    } else if (metrics.performance < prevPerf - 5) {
      prompts.push({ icon: '📉', text: 'Performance declined. Was that a deliberate trade-off, or an unintended consequence?' });
    }
  }

  if (metrics.fairness < 50) {
    prompts.push({ icon: '⚖️', text: 'Fairness perception is low. Are your decisions consistent, or do some people get preferential treatment?' });
  }

  if (metrics.trust > 75 && metrics.performance < 60) {
    prompts.push({ icon: '🤔', text: "Your team trusts you, but performance is lagging. What might be behind that gap?" });
  }
  if (metrics.performance > 80 && metrics.trust < 50) {
    prompts.push({ icon: '🤔', text: "Results are strong but trust is fragile. Is this approach sustainable long-term?" });
  }

  prompts.push({ icon: '📋', text: `You made ${roundDecisions.length} decision${roundDecisions.length !== 1 ? 's' : ''} this quarter. Looking back, would you change any of them?` });

  prompts.push({ icon: '💡', text: "How did your investment choices (budget and time) support or undermine your event decisions?" });

  return prompts.slice(0, 4);
};

const styles = `
  /* ============================================
     RESPONSIVE BREAKPOINTS
     Mobile: < 768px
     Tablet: 768px - 1023px
     Desktop: >= 1024px
     ============================================ */

  /* Smooth transitions for all interactive elements */
  *, *::before, *::after {
    transition-property: background-color, border-color, color, opacity, transform, box-shadow;
    transition-duration: 0.15s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 0.8; } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulseText { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
    @keyframes countUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
    @keyframes notificationSlideIn {
      0% { opacity: 0; transform: translateX(100px) scale(0.8); }
      70% { transform: translateX(-5px) scale(1.02); }
      100% { opacity: 1; transform: translateX(0) scale(1); }
    }
    @keyframes notificationFadeOut {
      0% { opacity: 1; transform: translateX(0); }
      100% { opacity: 0; transform: translateX(50px); }
    }
    @keyframes positiveGlow {
      0%, 100% { box-shadow: 0 4px 20px rgba(45, 213, 196, 0.2); }
      50% { box-shadow: 0 4px 30px rgba(45, 213, 196, 0.4); }
    }
    @keyframes negativeGlow {
      0%, 100% { box-shadow: 0 4px 20px rgba(255, 71, 87, 0.2); }
      50% { box-shadow: 0 4px 30px rgba(255, 71, 87, 0.4); }
    }
    .animate-pulse { animation: pulse 4s ease-in-out infinite; }
    .animate-fade { animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
    .metric-notification { animation: notificationSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    .metric-notification.positive { animation: notificationSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both, positiveGlow 2s ease-in-out infinite; }
    .metric-notification.negative { animation: notificationSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both, negativeGlow 2s ease-in-out infinite; }

    /* Observation slide-in animation (staggered from top) */
    @keyframes slideInObservation {
      0% { transform: translateY(-20px); opacity: 0; }
      60% { transform: translateY(3px); }
      100% { transform: translateY(0); opacity: 1; }
    }
    .observation-item { opacity: 0; }
    .observation-item.animate { animation: slideInObservation 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
  }

  /* Focus styles for accessibility */
  *:focus-visible {
    outline: 2px solid #BB29BB;
    outline-offset: 2px;
  }
  button:focus-visible {
    outline: 2px solid #BB29BB;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(187, 41, 187, 0.25);
  }

  /* Button hover states */
  button:not(:disabled):hover {
    transform: translateY(-1px);
  }
  button:not(:disabled):active {
    transform: translateY(0);
  }

  /* Consistent selection color */
  ::selection {
    background: rgba(187, 41, 187, 0.3);
    color: inherit;
  }

  /* Range slider styles with better touch targets */
  input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: rgba(255,255,255,0.1);
    cursor: pointer;
    touch-action: manipulation;
  }
  input[type="range"]:focus-visible {
    outline: 2px solid #BB29BB;
    outline-offset: 2px;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #BB29BB;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }
  input[type="range"]::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #BB29BB;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }

  /* Firefox scrollbar support */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(187, 41, 187, 0.4) #0f0f1a;
  }

  /* Skip link for keyboard navigation */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: #BB29BB;
    color: white;
    padding: 8px 16px;
    z-index: 100;
    text-decoration: none;
    font-weight: 600;
  }
  .skip-link:focus {
    top: 0;
  }

  /* Screen reader only utility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* ============================================
     RESPONSIVE GRID LAYOUTS
     ============================================ */

  /* Dashboard grid - 3 columns on desktop, 1 on mobile */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
  }
  @media (min-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr 1fr;
      overflow: hidden;
      touch-action: auto;
    }
  }
  @media (min-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: 1fr 1fr 1fr;
    }
  }

  /* Results grid - 2 columns on desktop, 1 on mobile */
  .results-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
  }
  @media (min-width: 768px) {
    .results-grid {
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      padding: 30px 40px;
      overflow: hidden;
      touch-action: auto;
    }
  }

  /* Insights grid - 2x2 on desktop, 1 column on mobile */
  .insights-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
  }
  @media (min-width: 768px) {
    .insights-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      overflow: hidden;
      touch-action: auto;
    }
  }

  /* Team grid - 3 columns on desktop, 2 on tablet, 1 on mobile */
  .team-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-y;
  }
  @media (min-width: 640px) {
    .team-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (min-width: 1024px) {
    .team-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* Options grid - 2 columns on desktop, 1 on mobile */
  .options-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
  @media (min-width: 640px) {
    .options-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  /* Metrics grid - 2 columns on tablet+ */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  @media (max-width: 479px) {
    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Stats grid - inline on mobile */
  .stats-grid {
    display: flex;
    gap: 24px;
    justify-content: center;
    flex-wrap: wrap;
  }
  @media (min-width: 640px) {
    .stats-grid {
      gap: 40px;
    }
  }

  /* ============================================
     RESPONSIVE HEADER & NAVIGATION
     ============================================ */

  .game-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    min-height: auto;
  }
  @media (min-width: 768px) {
    .game-header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0 25px;
      height: 56px;
    }
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
  }
  @media (min-width: 768px) {
    .header-brand {
      gap: 50px;
      justify-content: flex-start;
    }
  }

  .header-nav {
    display: flex;
    gap: 4px;
    justify-content: center;
    order: 1;
  }
  @media (min-width: 768px) {
    .header-nav {
      order: 0;
    }
  }

  .header-actions {
    display: flex;
    justify-content: center;
  }
  @media (min-width: 768px) {
    .header-actions {
      justify-content: flex-end;
    }
  }

  /* Hide logo text on very small screens */
  .brand-text {
    display: none;
  }
  @media (min-width: 480px) {
    .brand-text {
      display: inline;
    }
  }

  /* ============================================
     RESPONSIVE TYPOGRAPHY
     ============================================ */

  .intro-title {
    font-size: clamp(2rem, 8vw, 4rem);
    font-weight: 700;
    letter-spacing: -1px;
    text-transform: uppercase;
    margin: 0;
    line-height: 1.1;
  }

  .intro-subtitle {
    font-size: clamp(0.875rem, 3vw, 1.4rem);
    font-weight: 300;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 8px;
  }

  .intro-description {
    font-size: clamp(0.9rem, 2.5vw, 1.1rem);
    line-height: 1.7;
    max-width: 600px;
    margin: 20px auto 0;
    padding: 0 16px;
  }

  .event-title {
    font-size: clamp(1.1rem, 4vw, 1.4rem);
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 10px 0;
  }

  .profile-title {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    font-weight: 700;
    margin: 0 0 15px 0;
  }

  /* ============================================
     RESPONSIVE PANELS & CARDS
     ============================================ */

  .panel {
    background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
    border-radius: 14px;
    padding: 14px;
    border: 1px solid rgba(255,255,255,0.06);
  }
  @media (min-width: 768px) {
    .panel {
      padding: 18px;
    }
  }

  .event-panel {
    padding: 16px;
  }
  @media (min-width: 768px) {
    .event-panel {
      padding: 18px;
    }
  }

  /* Mobile: sidebar becomes horizontal scroller */
  .team-sidebar {
    display: flex;
    flex-direction: row;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
  }
  .team-sidebar > article {
    min-width: 200px;
    flex-shrink: 0;
  }
  @media (min-width: 1024px) {
    .team-sidebar {
      flex-direction: column;
      overflow-x: visible;
      padding-bottom: 0;
    }
    .team-sidebar > article {
      min-width: auto;
      flex-shrink: 1;
    }
  }

  /* ============================================
     RESPONSIVE INTRO SCREEN
     ============================================ */

  .intro-content {
    text-align: center;
    z-index: 1;
    padding: 20px 16px;
    width: 100%;
    max-width: 700px;
  }
  @media (min-width: 768px) {
    .intro-content {
      padding: 40px;
    }
  }

  .intro-logo {
    height: 32px;
    margin-bottom: 24px;
  }
  @media (min-width: 768px) {
    .intro-logo {
      height: 45px;
      margin-bottom: 35px;
    }
  }

  .intro-cta {
    margin-top: 32px;
    padding: 16px 40px;
    font-size: 1rem;
  }
  .intro-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 50px rgba(187, 41, 187, 0.5);
  }
  .intro-cta:active {
    transform: translateY(0);
    box-shadow: 0 8px 30px rgba(187, 41, 187, 0.4);
  }
  @media (min-width: 768px) {
    .intro-cta {
      margin-top: 50px;
      padding: 20px 60px;
      font-size: 1.2rem;
    }
  }

  /* ============================================
     RESPONSIVE MIDDLE PANEL (Events + Observations)
     ============================================ */

  .middle-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .observations-panel {
    min-height: 120px;
    flex: 1;
  }
  @media (min-width: 768px) {
    .observations-panel {
      min-height: 200px;
      flex: 1;
    }
  }

  .event-panel {
    flex: none;
    max-height: none;
  }
  @media (min-width: 768px) {
    .event-panel {
      flex: 1.5;
      max-height: 55%;
      overflow-y: auto;
    }
  }

  /* ============================================
     RESPONSIVE INVESTMENTS PANEL
     ============================================ */

  .investments-section {
    display: none;
  }
  @media (min-width: 768px) {
    .investments-section {
      display: block;
    }
  }

  /* Mobile investments drawer */
  .mobile-investments {
    display: block;
    margin-bottom: 12px;
  }
  @media (min-width: 768px) {
    .mobile-investments {
      display: none;
    }
  }

  .investments-toggle {
    width: 100%;
    padding: 12px 16px;
    background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: #2CD5C4;
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .investments-toggle:hover {
    border-color: rgba(44, 213, 196, 0.3);
    background: linear-gradient(180deg, #1f1f35 0%, #12121f 100%);
  }
  .investments-toggle:active {
    transform: none;
  }

  .investments-drawer {
    margin-top: 8px;
    padding: 14px;
    background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
  }

  /* ============================================
     RESPONSIVE BUTTONS
     ============================================ */

  .confirm-btn {
    margin-top: 12px;
    padding: 14px 20px;
    width: 100%;
    min-height: 52px;
    font-size: 0.9rem;
    letter-spacing: 1px;
  }
  .confirm-btn:not(:disabled):hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(187, 41, 187, 0.35);
  }
  .confirm-btn:disabled {
    cursor: not-allowed;
    transform: none;
  }
  @media (min-width: 640px) {
    .confirm-btn {
      padding: 14px 30px;
      font-size: 0.95rem;
      letter-spacing: 2px;
    }
  }

  .option-btn {
    padding: 12px;
    min-height: 48px;
    font-size: 0.8rem;
    line-height: 1.4;
    text-align: left;
  }
  .option-btn:hover {
    transform: translateY(-1px);
  }
  .option-btn:active {
    transform: translateY(0);
  }
  .option-btn[aria-pressed="true"] {
    transform: none;
  }
  @media (min-width: 640px) {
    .option-btn {
      padding: 14px;
    }
  }

  /* ============================================
     HIDE/SHOW UTILITIES
     ============================================ */

  .hide-mobile {
    display: none;
  }
  @media (min-width: 768px) {
    .hide-mobile {
      display: block;
    }
  }

  .hide-desktop {
    display: block;
  }
  @media (min-width: 768px) {
    .hide-desktop {
      display: none;
    }
  }

  /* ============================================
     MOBILE BOTTOM NAVIGATION (for game phase)
     ============================================ */

  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
    border-top: 1px solid rgba(255,255,255,0.1);
    padding: 8px 16px;
    padding-bottom: max(8px, env(safe-area-inset-bottom));
    z-index: 50;
    justify-content: space-around;
  }
  @media (min-width: 768px) {
    .mobile-bottom-nav {
      display: none;
    }
  }

  .mobile-nav-btn {
    flex: 1;
    max-width: 100px;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255,255,255,0.6);
    font-family: 'Poppins', sans-serif;
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .mobile-nav-btn:hover {
    color: rgba(255,255,255,0.85);
    background: rgba(255,255,255,0.05);
  }
  .mobile-nav-btn.active {
    color: #BB29BB;
    background: rgba(187,41,187,0.15);
  }
  .mobile-nav-btn.active:hover {
    background: rgba(187,41,187,0.2);
  }
  .mobile-nav-btn span {
    font-size: 1.2rem;
  }

  /* Add padding at bottom for mobile nav */
  .game-content {
    padding-bottom: 0;
  }
  @media (max-width: 767px) {
    .game-content {
      padding-bottom: 70px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  /* ============================================
     MOBILE METRICS BAR
     ============================================ */

  .mobile-metrics {
    display: flex;
    gap: 8px;
    padding: 12px;
    background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
    border-radius: 10px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 12px;
  }
  @media (min-width: 768px) {
    .mobile-metrics {
      display: none;
    }
  }

  .metric-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(0,0,0,0.4);
    border-radius: 8px;
    flex-shrink: 0;
  }

  .metric-chip-label {
    font-size: 0.65rem;
    color: rgba(255,255,255,0.7);
    white-space: nowrap;
  }

  .metric-chip-value {
    font-size: 0.85rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  /* ============================================
     TOUCH IMPROVEMENTS
     ============================================ */

  @media (pointer: coarse) {
    /* Larger touch targets on touch devices */
    input[type="range"]::-webkit-slider-thumb {
      width: 28px;
      height: 28px;
    }
    input[type="range"]::-moz-range-thumb {
      width: 28px;
      height: 28px;
    }

    button {
      min-height: 44px;
    }
  }

  /* ============================================
     PROGRESS BAR ANIMATIONS
     ============================================ */

  .progress-bar-fill {
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Tabular numbers for metrics */
  .metric-value {
    font-variant-numeric: tabular-nums;
  }

  /* Play Again button */
  .play-again-btn:hover {
    background: rgba(187, 41, 187, 0.1);
    border-color: #BB29BB;
  }

  /* Reset button */
  .reset-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.6);
    color: #fff;
  }

  /* Header nav tabs */
  .nav-tab {
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .nav-tab:hover:not([aria-selected="true"]) {
    background: rgba(187, 41, 187, 0.15);
    color: #fff;
  }

  /* ============================================
     LANDSCAPE PHONE ADJUSTMENTS
     ============================================ */

  @media (max-height: 500px) and (orientation: landscape) {
    .intro-content {
      padding: 16px;
    }
    .intro-title {
      font-size: 2rem;
    }
    .intro-cta {
      margin-top: 16px;
      padding: 12px 32px;
    }
    .stats-grid {
      gap: 24px;
      margin-top: 16px;
    }
  }

  /* ============================================
     QUARTER GUIDE PANEL
     ============================================ */

  .guided-panel {
    width: 300px;
    min-width: 300px;
    background: linear-gradient(180deg, #1e1230 0%, #120a1e 100%);
    border: 1px solid rgba(187, 41, 187, 0.35);
    border-radius: 14px;
    margin: 8px 0 8px 8px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    position: relative;
    flex-shrink: 0;
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .guided-panel.collapsed {
    width: 48px;
    min-width: 48px;
    overflow: hidden;
    cursor: pointer;
  }

  .guided-panel-toggle {
    position: absolute;
    right: -14px;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #1a1a2e;
    border: 1px solid rgba(187, 41, 187, 0.4);
    color: #BB29BB;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    font-size: 0.85rem;
    font-family: 'Poppins', sans-serif;
    padding: 0;
    line-height: 1;
  }
  .guided-panel-toggle:hover {
    background: rgba(187, 41, 187, 0.2);
    border-color: #BB29BB;
  }

  .guided-phase-progress {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .guided-phase-step {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7rem;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
    color: rgba(255, 255, 255, 0.35);
    white-space: nowrap;
  }

  .guided-phase-step.active {
    color: #BB29BB;
    font-weight: 600;
  }

  .guided-phase-step.completed {
    color: #2CD5C4;
  }

  .guided-phase-connector {
    flex: 1;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    margin: 0 8px;
    min-width: 12px;
  }

  .guided-phase-connector.completed {
    background: #2CD5C4;
  }

  .guided-phase-content {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
  }

  .guided-insight {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    margin-bottom: 8px;
    border-left: 3px solid rgba(187, 41, 187, 0.3);
  }

  .guided-insight-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .guided-insight-text {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }

  .guided-checklist-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin-bottom: 6px;
  }

  .guided-check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.7rem;
    color: transparent;
  }

  .guided-check.done {
    background: rgba(45, 213, 196, 0.2);
    border-color: #2CD5C4;
    color: #2CD5C4;
  }

  .guided-check-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .guided-check-label.done {
    color: #2CD5C4;
  }

  .guided-facilitation {
    background: rgba(187, 41, 187, 0.08);
    border: 1px solid rgba(187, 41, 187, 0.2);
    border-radius: 10px;
    padding: 16px;
    margin-top: 16px;
  }

  .guided-facilitation-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #BB29BB;
    font-weight: 600;
    margin-bottom: 8px;
    font-family: 'Poppins', sans-serif;
  }

  .guided-facilitation-text {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.85);
    line-height: 1.6;
    font-style: italic;
    margin: 0;
  }

  /* Plan phase: glowing panel to draw attention */
  .guided-panel.plan-active {
    border-color: rgba(187, 41, 187, 0.5);
    box-shadow: 0 0 24px rgba(187, 41, 187, 0.15);
  }

  @keyframes guidedPanelGlow {
    0%, 100% { box-shadow: 0 0 24px rgba(187, 41, 187, 0.15); }
    50% { box-shadow: 0 0 40px rgba(187, 41, 187, 0.3); }
  }

  .guided-panel.plan-active {
    animation: guidedPanelGlow 3s ease-in-out infinite;
  }

  .guided-start-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, rgba(187, 41, 187, 0.2) 0%, rgba(187, 41, 187, 0.08) 100%);
    border-bottom: 1px solid rgba(187, 41, 187, 0.3);
    font-size: 0.7rem;
    font-weight: 700;
    color: #BB29BB;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-family: 'Poppins', sans-serif;
  }

  @keyframes guidedArrowBounce {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-6px); }
  }

  .guided-arrow-hint {
    animation: guidedArrowBounce 1.5s ease-in-out infinite;
    display: inline-block;
  }

  @keyframes guidedFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ============================================
     METRIC CHANGES OVERLAY
     ============================================ */

  .metric-overlay-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: metricOverlayFadeIn 0.3s ease-out;
  }

  @keyframes metricOverlayFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .metric-overlay-panel {
    background: linear-gradient(180deg, #1e1230 0%, #120a1e 100%);
    border: 1px solid rgba(187, 41, 187, 0.4);
    border-radius: 20px;
    padding: 32px;
    min-width: 340px;
    max-width: 420px;
    width: 90vw;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(187, 41, 187, 0.15);
    animation: metricOverlaySlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes metricOverlaySlideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes metricItemSlideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .metric-overlay-item {
    opacity: 0;
    animation: metricItemSlideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .guided-phase-content > * {
    animation: guidedFadeIn 0.3s ease-out both;
  }

  .guided-collapsed-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 16px;
    gap: 8px;
    height: 100%;
  }

  .guided-collapsed-icon {
    font-size: 1.3rem;
  }

  .guided-collapsed-label {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    font-size: 0.7rem;
    font-weight: 600;
    color: #BB29BB;
    letter-spacing: 2px;
    text-transform: uppercase;
    font-family: 'Poppins', sans-serif;
  }

  /* Tablet: default to collapsed */
  @media (max-width: 1199px) and (min-width: 768px) {
    .guided-panel:not(.force-open) {
      width: 48px;
      min-width: 48px;
    }
  }

  /* Mobile: horizontal banner */
  @media (max-width: 767px) {
    .guided-panel {
      width: calc(100% - 16px) !important;
      min-width: calc(100% - 16px) !important;
      border: 1px solid rgba(187, 41, 187, 0.35);
      border-radius: 14px;
      margin: 8px;
      overflow: visible;
      flex-shrink: 0;
    }

    .guided-panel.collapsed {
      width: 100% !important;
      min-width: 100% !important;
      height: auto;
    }

    .guided-collapsed-content {
      flex-direction: row;
      padding: 10px 16px;
      gap: 10px;
      height: auto;
    }

    .guided-collapsed-label {
      writing-mode: horizontal-tb;
      text-orientation: initial;
    }

    .guided-panel-toggle {
      position: static;
      transform: none;
      margin-left: auto;
    }

    .guided-phase-progress {
      padding: 10px 16px;
    }

    .guided-phase-content {
      padding: 12px 16px;
      max-height: 200px;
      overflow-y: auto;
    }
  }
`;

export default function App() {
  const [phase, setPhase] = useState('intro');
  const [round, setRound] = useState(1);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [chars, setChars] = useState(INITIAL_CHARACTERS);
  const [history, setHistory] = useState([{ round: 0, ...INITIAL_METRICS }]);
  const [decisions, setDecisions] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState(null);
  const [done, setDone] = useState(false);
  const [handled, setHandled] = useState(0);
  const [inv, setInv] = useState(INITIAL_INVESTMENTS);
  const [notes, setNotes] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showMobileInvestments, setShowMobileInvestments] = useState(false);
  const [budget, setBudget] = useState({ current: 5000, lastAllocation: 0, totalReceived: 5000 });
  const [workDemand] = useState(100);  // Constant work demand
  const [departingChar, setDepartingChar] = useState(null);  // Departing character
  const [teamCapacity, setTeamCapacity] = useState(5);  // Active member count

  // Quarter Guide panel state
  const [guidedPhase, setGuidedPhase] = useState('plan'); // 'plan' | 'execute' | 'reflect'
  const [guidedPanelOpen, setGuidedPanelOpen] = useState(typeof window !== 'undefined' && window.innerWidth >= 1200);
  const [oneOnOneTargets, setOneOnOneTargets] = useState([]); // Character IDs selected for 1:1s
  const [coachingTargets, setCoachingTargets] = useState([]); // Character IDs selected for coaching

  // Tutorial state
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasSeenTabsHint, setHasSeenTabsHint] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  const [investmentTab, setInvestmentTab] = useState('budget'); // 'budget' | 'time'

  // Notification and sound state
  const [notifications, setNotifications] = useState([]);
  const [showMetricOverlay, setShowMetricOverlay] = useState(false);
  const [roundStartMetrics, setRoundStartMetrics] = useState(INITIAL_METRICS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef(null);

  // Observation animation state
  const [animatedObservations, setAnimatedObservations] = useState([]);
  const observationAnimationRef = useRef(null);

  // Tutorial target refs
  const metricsRef = useRef(null);
  const loadRef = useRef(null);
  const investmentsRef = useRef(null);
  const eventRef = useRef(null);
  const optionsRef = useRef(null);
  const observationsRef = useRef(null);
  const teamRef = useRef(null);

  // Tutorial helper functions
  const getTargetRef = (stepId) => {
    const refMap = {
      metrics: metricsRef,
      load: loadRef,
      investments: investmentsRef,
      event: eventRef,
      options: optionsRef,
      observations: observationsRef,
      team: teamRef,
    };
    return refMap[stepId];
  };

  const nextTutorialStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  // Sound system using Web Audio API
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type) => {
    if (!soundEnabled) return;

    const ctx = initAudioContext();
    if (!ctx || ctx.state === 'suspended') {
      ctx?.resume();
      return;
    }

    const now = ctx.currentTime;

    switch (type) {
      case 'positive': {
        // Ascending two-note chime (major third)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.value = 523.25; // C5
        osc2.frequency.value = 659.25; // E5

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.08);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.5);
        break;
      }

      case 'negative': {
        // Descending minor second (tension)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'triangle';
        osc1.frequency.value = 392; // G4
        osc2.frequency.value = 349.23; // F4

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.1);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.45);
        break;
      }

      case 'select': {
        // Soft click/tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 880; // A5

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case 'confirm': {
        // Decisive confirmation tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.1);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'slider': {
        // Subtle tick for slider movement
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 1200;

        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
        break;
      }
    }
  }, [soundEnabled, initAudioContext]);

  // Animate observations one by one when notes change
  useEffect(() => {
    // Clear any existing animation timeout
    if (observationAnimationRef.current) {
      clearTimeout(observationAnimationRef.current);
    }

    if (notes.length === 0) {
      setAnimatedObservations([]);
      return;
    }

    // Reset animated observations when notes change
    setAnimatedObservations([]);

    // Stagger the animations with 300ms delay between each
    notes.forEach((_, index) => {
      const timeoutId = setTimeout(() => {
        setAnimatedObservations(prev => [...prev, index]);
        // Play a subtle sound for each observation
        playSound('select');
      }, 400 + index * 300); // Start after 400ms, then 300ms between each

      // Store the last timeout for cleanup
      if (index === notes.length - 1) {
        observationAnimationRef.current = timeoutId;
      }
    });

    return () => {
      if (observationAnimationRef.current) {
        clearTimeout(observationAnimationRef.current);
      }
    };
  }, [notes, playSound]);

  // Tutorial Overlay Component
  const TutorialOverlay = () => {
    const currentStep = TUTORIAL_STEPS[tutorialStep];
    const targetRef = getTargetRef(currentStep.id);
    const [tooltipStyle, setTooltipStyle] = useState({});
    const [spotlightStyle, setSpotlightStyle] = useState({});
    const [arrowStyle, setArrowStyle] = useState({});

    useEffect(() => {
      if (!targetRef?.current) return;

      const updatePosition = () => {
        const rect = targetRef.current.getBoundingClientRect();
        const gap = 15;
        const tooltipWidth = 280;
        const tooltipHeight = 180;
        const padding = 8;
        const arrowSize = 10;

        // Spotlight position
        setSpotlightStyle({
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });

        // Calculate tooltip position based on specified direction
        let top, left;
        const position = currentStep.position;

        if (position === 'right') {
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + gap;
        } else if (position === 'left') {
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - gap;
        } else if (position === 'top') {
          top = rect.top - tooltipHeight - gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
        } else if (position === 'bottom') {
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
        }

        // Viewport clamping
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left < gap) left = gap;
        if (left + tooltipWidth > viewportWidth - gap) {
          left = viewportWidth - tooltipWidth - gap;
        }
        if (top < gap) top = gap;
        if (top + tooltipHeight > viewportHeight - gap) {
          top = viewportHeight - tooltipHeight - gap;
        }

        setTooltipStyle({ top, left, width: tooltipWidth });

        // Arrow positioning
        let arrowTop, arrowLeft, arrowBorder;
        if (position === 'right') {
          arrowTop = top + tooltipHeight / 2 - arrowSize;
          arrowLeft = left - arrowSize;
          arrowBorder = `transparent ${COLORS.greyDark} transparent transparent`;
        } else if (position === 'left') {
          arrowTop = top + tooltipHeight / 2 - arrowSize;
          arrowLeft = left + tooltipWidth;
          arrowBorder = `transparent transparent transparent ${COLORS.greyDark}`;
        } else if (position === 'top') {
          arrowTop = top + tooltipHeight;
          arrowLeft = left + tooltipWidth / 2 - arrowSize;
          arrowBorder = `${COLORS.greyDark} transparent transparent transparent`;
        } else if (position === 'bottom') {
          arrowTop = top - arrowSize * 2;
          arrowLeft = left + tooltipWidth / 2 - arrowSize;
          arrowBorder = `transparent transparent ${COLORS.greyDark} transparent`;
        }
        setArrowStyle({ top: arrowTop, left: arrowLeft, border: arrowBorder, size: arrowSize });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }, [targetRef, currentStep, tutorialStep]);

    if (!targetRef?.current) return null;

    const isLastStep = tutorialStep === TUTORIAL_STEPS.length - 1;

    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Dark overlay with spotlight cutout */}
        <div
          style={{
            position: 'absolute',
            top: spotlightStyle.top,
            left: spotlightStyle.left,
            width: spotlightStyle.width,
            height: spotlightStyle.height,
            borderRadius: 12,
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 15px 5px rgba(187, 41, 187, 0.3), inset 0 0 1px 1px rgba(255, 255, 255, 0.1)`,
            transition: 'top 200ms ease-out, left 200ms ease-out, width 200ms ease-out, height 200ms ease-out',
            pointerEvents: 'none',
          }}
        />

        {/* Arrow pointer */}
        <div
          style={{
            position: 'absolute',
            top: arrowStyle.top,
            left: arrowStyle.left,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: arrowStyle.size,
            borderColor: arrowStyle.border,
            transition: 'top 200ms ease-out, left 200ms ease-out',
            pointerEvents: 'none',
          }}
        />

        {/* Tooltip */}
        <div
          style={{
            position: 'absolute',
            top: tooltipStyle.top,
            left: tooltipStyle.left,
            width: tooltipStyle.width,
            background: COLORS.greyDark,
            border: `1px solid ${COLORS.purple}50`,
            borderRadius: 12,
            padding: '20px 24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            transition: 'top 200ms ease-out, left 200ms ease-out, opacity 200ms ease-out',
            pointerEvents: 'auto',
          }}
        >
          {/* Step indicator */}
          <div
            style={{
              fontSize: '0.7rem',
              color: `${COLORS.white}60`,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {tutorialStep + 1} of {TUTORIAL_STEPS.length}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: COLORS.white,
              margin: '0 0 8px 0',
            }}
          >
            {currentStep.title}
          </h3>

          {/* Description */}
          <p
            style={{
              fontSize: '0.85rem',
              color: `${COLORS.white}cc`,
              lineHeight: 1.5,
              margin: '0 0 20px 0',
            }}
          >
            {currentStep.description}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => { playSound('select'); skipTutorial(); }}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: `1px solid ${COLORS.white}30`,
                borderRadius: 20,
                color: `${COLORS.white}80`,
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                transition: 'border-color 200ms ease-out, color 200ms ease-out',
              }}
              onMouseOver={e => { e.target.style.borderColor = `${COLORS.white}60`; e.target.style.color = COLORS.white; }}
              onMouseOut={e => { e.target.style.borderColor = `${COLORS.white}30`; e.target.style.color = `${COLORS.white}80`; }}
            >
              Skip tour
            </button>
            <button
              onClick={() => { playSound('select'); nextTutorialStep(); }}
              style={{
                padding: '8px 20px',
                background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.blue} 100%)`,
                border: 'none',
                borderRadius: 20,
                color: COLORS.white,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
                boxShadow: `0 4px 15px ${COLORS.purple}40`,
              }}
              onMouseOver={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 6px 20px ${COLORS.purple}60`; }}
              onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 4px 15px ${COLORS.purple}40`; }}
            >
              {isLastStep ? 'Got it!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Tutorial Overlay - Full-screen cards instead of positioned tooltips
  const MobileTutorialOverlay = () => {
    const currentStep = TUTORIAL_STEPS[tutorialStep];
    const isLastStep = tutorialStep === TUTORIAL_STEPS.length - 1;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: "'Poppins', sans-serif"
        }}
      >
        {/* Step indicator */}
        <div style={{ color: COLORS.purple, fontSize: '0.8rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 2 }}>
          {tutorialStep + 1} of {TUTORIAL_STEPS.length}
        </div>

        {/* Icon */}
        <div style={{ fontSize: '4rem', marginBottom: 24 }}>
          {currentStep.icon}
        </div>

        {/* Title */}
        <h2 style={{ color: COLORS.white, fontSize: '1.5rem', fontWeight: 600, marginBottom: 16, textAlign: 'center' }}>
          {currentStep.title}
        </h2>

        {/* Description */}
        <p style={{ color: `${COLORS.white}cc`, fontSize: '1rem', textAlign: 'center', maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
          {currentStep.description}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
          <button
            onClick={() => { playSound('select'); skipTutorial(); }}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: `1px solid ${COLORS.white}30`,
              borderRadius: 25,
              color: `${COLORS.white}80`,
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Skip
          </button>
          <button
            onClick={() => { playSound('select'); nextTutorialStep(); }}
            style={{
              padding: '12px 28px',
              background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.blue} 100%)`,
              border: 'none',
              borderRadius: 25,
              color: COLORS.white,
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: `0 4px 15px ${COLORS.purple}40`
            }}
          >
            {isLastStep ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    );
  };

  const genNotes = (currentChars, currentMetrics, currentInv, currentBudget) => {
    const n = [];

    // Add contextual notifications based on quarter and progress
    if (round === 1 && handled === 0) {
      n.unshift({ text: "Fiscal year ending soon. You have £5k remaining.", icon: '📅' });
    }

    if (round === 1 && done) {
      n.push({ text: "Budget review meeting tomorrow. Results being reviewed.", icon: '📊' });
    }

    if (round > 1 && handled === 0) {
      if (currentBudget.lastAllocation > 5000) {
        n.unshift({ text: "Finance approved your request. Leadership is impressed.", icon: '🎯' });
      } else if (currentBudget.lastAllocation >= 4000) {
        n.unshift({ text: "Standard allocation this quarter. Room to improve.", icon: '📊' });
      } else if (currentBudget.lastAllocation > 0) {
        n.unshift({ text: "Budget was reduced. Other teams showed stronger results.", icon: '⚠️' });
      }
    }

    NOTIFICATIONS.character.forEach(x => { if (x.check(currentChars) && Math.random() > 0.6) n.push({ text: x.text, icon: x.icon }); });
    NOTIFICATIONS.metrics.forEach(x => { if (x.check(currentMetrics) && Math.random() > 0.5) n.push({ text: x.text, icon: x.icon }); });
    NOTIFICATIONS.investment.forEach(x => { if (x.check(currentInv) && Math.random() > 0.6) n.push({ text: x.text, icon: x.icon }); });
    NOTIFICATIONS.budget.forEach(x => { if (x.check(currentBudget) && Math.random() > 0.5) n.push({ text: x.text, icon: x.icon }); });
    NOTIFICATIONS.workload.forEach(x => { if (x.check(currentChars) && Math.random() > 0.5) n.push({ text: x.text, icon: x.icon }); });
    NOTIFICATIONS.attrition.forEach(x => { if (x.check(currentChars) && Math.random() > 0.5) n.push({ text: x.text, icon: x.icon }); });

    if (n.length < 2 && Math.random() > 0.5) {
      const g = NOTIFICATIONS.general[Math.floor(Math.random() * NOTIFICATIONS.general.length)];
      n.push({ text: g.text, icon: g.icon });
    }
    return n.slice(0, 3);
  };

  // Only regenerate notes when a new event is shown (handled changes) or round starts
  useEffect(() => { if (phase === 'playing') setNotes(genNotes(chars, metrics, inv, budget)); }, [phase, handled]);

  // Auto-transition to reflect phase and show metric summary when all events handled
  useEffect(() => {
    if (done && guidedPhase === 'execute') {
      setGuidedPhase('reflect');

      // Calculate cumulative metric changes for the whole round
      const METRIC_LABELS = {
        trust: 'Trust', engagement: 'Engagement', performance: 'Performance',
        retention: 'Retention', fairness: 'Fairness', credibility: 'Credibility',
        emotionalLoad: 'Your Load'
      };
      const roundNotifications = [];
      Object.keys(roundStartMetrics).forEach(key => {
        const delta = Math.round(metrics[key]) - Math.round(roundStartMetrics[key]);
        if (delta !== 0) {
          roundNotifications.push({
            id: `${Date.now()}-${key}`,
            metric: key,
            label: METRIC_LABELS[key],
            delta,
            isPositive: key === 'emotionalLoad' ? delta < 0 : delta > 0,
          });
        }
      });

      if (roundNotifications.length > 0) {
        const hasPositive = roundNotifications.some(n => n.isPositive);
        playSound(hasPositive ? 'positive' : 'negative');
        setNotifications(roundNotifications);
        setShowMetricOverlay(true);
      }
    }
  }, [done, guidedPhase]);

  // Track mobile viewport for tutorial
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pickEvents = useCallback(() => {
    const num = round === 1 ? 2 : round === 4 ? 4 : 3;
    const used = decisions.map(d => d.eventId);
    const departedIds = chars.filter(c => c.departed).map(c => c.id);
    return [...ALL_EVENTS.filter(e =>
      !used.includes(e.id) &&
      (!e.character || !departedIds.includes(e.character))
    )].sort(() => Math.random() - 0.5).slice(0, num);
  }, [round, decisions, chars]);

  const allocateBudget = (quarterPot = 20000) => {
    const compositeScore = (
      metrics.trust + metrics.engagement + metrics.performance +
      metrics.fairness + metrics.credibility
    ) / 5;

    const simulatedCompetitors = [60, 60, 60];
    const allScores = [compositeScore, ...simulatedCompetitors];
    const totalScore = allScores.reduce((a, b) => a + b, 0);
    const playerShare = (compositeScore / totalScore) * quarterPot;
    const allocation = Math.round(playerShare);

    setBudget(prev => ({
      current: prev.current + allocation,
      lastAllocation: allocation,
      totalReceived: prev.totalReceived + allocation
    }));

    return allocation;
  };

  const calculateIndividualLoads = (currentChars, demand = 100) => {
    const activeChars = currentChars.filter(c => !c.departed);
    const activeCount = activeChars.length;

    if (activeCount === 0) return currentChars;

    const loadPerPerson = demand / activeCount;

    return currentChars.map(c => {
      if (c.departed) return c;

      const loadPercent = (loadPerPerson / c.baseCapacity) * 100;

      return {
        ...c,
        currentLoad: loadPerPerson,
        loadPercent: loadPercent
      };
    });
  };

  const applyBurnoutPenalties = (currentChars) => {
    return currentChars.map(c => {
      if (c.departed) return c;

      const overloadPercent = Math.max(0, c.loadPercent - 100);
      if (overloadPercent === 0) return c;

      const penaltyMultiplier = Math.floor(overloadPercent / 10);

      return {
        ...c,
        engagement: clamp(c.engagement - (5 * penaltyMultiplier), 0, 100),
        trust: clamp(c.trust - (3 * penaltyMultiplier), 0, 100),
        atRisk: c.atRisk || overloadPercent > 40
      };
    });
  };

  const checkAttrition = (currentChars, currentMetrics) => {
    const activeChars = currentChars.filter(c => !c.departed);
    if (activeChars.length === 0) return null;

    const atRiskChars = [];

    activeChars.forEach(c => {
      let risk = 0;

      // High performer triggers
      if (c.performance >= 80) {
        if (c.trust < 50) risk += 25;
        if (currentMetrics.fairness < 50) risk += 20;
        if (currentMetrics.credibility < 45) risk += 20;
      }

      // General triggers
      if (c.engagement < 35) risk += 30;
      if (c.trust < 40) risk += 25;

      // Workload triggers
      if (c.loadPercent > 120) risk += 15;
      if (c.loadPercent > 140) risk += 25;

      // At-risk bonus
      if (c.atRisk) risk += 15;

      if (risk > 0) atRiskChars.push({ character: c, risk });
    });

    // Sort by risk (highest first)
    atRiskChars.sort((a, b) => b.risk - a.risk);

    // Check each (first success wins)
    for (const { character, risk } of atRiskChars) {
      if (Math.random() * 100 < risk) return character;
    }

    return null;
  };

  const getDepartureReason = (character, currentMetrics) => {
    if (character.performance >= 80 && character.trust < 50) {
      return "I don't feel valued here anymore. I need to work somewhere that appreciates what I bring.";
    }
    if (character.engagement < 35) {
      return "I've been checked out for months. It's time I found something that excites me again.";
    }
    if (character.loadPercent > 140) {
      return "I can't keep doing the work of two people. The burnout isn't worth it.";
    }
    if (character.loadPercent > 120) {
      return "The workload has been unsustainable. I need better balance.";
    }
    if (character.trust < 40) {
      return "I've lost confidence in the leadership here. I need a fresh start.";
    }
    if (currentMetrics.fairness < 50) {
      return "I don't think decisions are being made fairly. I deserve better.";
    }
    return "I've decided it's time to move on. This just isn't the right fit anymore.";
  };

  const handleBeginClick = () => {
    setShowTutorialPrompt(true);
  };

  const startGame = (withTutorial = false) => {
    // Request fullscreen mode
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen request failed:', err);
      });
    }

    setShowTutorialPrompt(false);
    setShowTutorial(withTutorial);
    setTutorialStep(0);
    setPhase('playing');
    setRound(1);
    setMetrics(INITIAL_METRICS);
    setChars(INITIAL_CHARACTERS);
    setHistory([{ round: 0, ...INITIAL_METRICS }]);
    setDecisions([]);
    setHandled(0);
    setDone(false);
    setInv(INITIAL_INVESTMENTS);
    setSelectedOption(null);
    setBudget({ current: 5000, lastAllocation: 0, totalReceived: 5000 });
    setGuidedPhase('plan');
    setGuidedPanelOpen(window.innerWidth >= 1200);
    setOneOnOneTargets([]);
    setCoachingTargets([]);
    setRoundStartMetrics(INITIAL_METRICS);
    setNotifications([]);
    setShowMetricOverlay(false);
    const e = pickEvents();
    setEvents(e);
    setEvent(e[0] || null);
  };

  const start = () => startGame(false);

  const decide = () => {
    if (!event || selectedOption === null) return;

    const opt = event.options[selectedOption];
    const mod = getInvestmentModifier(event, inv);
    const m = { ...metrics };
    [...BUDGET_INVESTMENTS, ...TIME_INVESTMENTS].forEach(i => {
      const a = inv[i.id] / 100;
      Object.entries(i.effects).forEach(([k, v]) => { if (m[k] !== undefined) m[k] = clamp(m[k] + a * v * 2, 0, 100); });
      if (i.loadEffect) m.emotionalLoad = clamp(m.emotionalLoad + a * i.loadEffect * 5, 0, 100);
    });
    Object.entries(opt.effects).forEach(([k, v]) => {
      if (k in m) {
        const adj = v < 0 ? v * (2 - mod) : v * (0.5 + mod * 0.5);
        m[k] = clamp(m[k] + adj, 0, 100);
      }
    });
    if (event.character) {
      const ci = chars.findIndex(c => c.id === event.character);
      if (ci >= 0) {
        const nc = [...chars];
        nc[ci] = { ...nc[ci], trust: clamp(nc[ci].trust + (opt.effects.trust || 0) / 2, 0, 100), engagement: clamp(nc[ci].engagement + (opt.effects.engagement || 0) / 2, 0, 100) };
        setChars(nc);
      }
    }

    // Play feedback sound based on this decision's impact
    const hasPositiveEffect = Object.entries(opt.effects).some(([k, v]) =>
      k === 'emotionalLoad' ? v < 0 : v > 0
    );
    playSound(hasPositiveEffect ? 'positive' : 'negative');

    setDecisions([...decisions, { round, eventId: event.id, eventTitle: event.title, choice: opt.text }]);
    setMetrics(m);
    setSelectedOption(null);
    const rem = events.filter(e => e.id !== event.id);
    if (rem.length) { setEvents(rem); setEvent(rem[0]); setHandled(handled + 1); }
    else { setEvents([]); setEvent(null); setDone(true); }
  };

  const endRound = () => {
    // 1. Apply burnout penalties
    let updatedChars = applyBurnoutPenalties(chars);

    // 2. Check for attrition
    const departingCharacter = checkAttrition(updatedChars, metrics);

    // 3. Save history
    setHistory([...history, { round, ...metrics }]);

    // 4. If someone is leaving
    if (departingCharacter) {
      // Mark as departed
      updatedChars = updatedChars.map(c =>
        c.id === departingCharacter.id
          ? { ...c, departed: true, departureReason: getDepartureReason(c, metrics) }
          : c
      );

      // Team-wide morale hit
      updatedChars = updatedChars.map(c =>
        c.departed ? c : {
          ...c,
          trust: clamp(c.trust - 5, 0, 100),
          engagement: clamp(c.engagement - 8, 0, 100)
        }
      );

      // Recalculate loads
      updatedChars = calculateIndividualLoads(updatedChars, workDemand);

      // Update state
      setChars(updatedChars);
      setDepartingChar(departingCharacter);
      setTeamCapacity(updatedChars.filter(c => !c.departed).length);
      setPhase('departure');
      return;
    }

    // 5. No departure - continue normally
    setChars(updatedChars);

    if (round >= 4) {
      setPhase('results');
    } else {
      allocateBudget(20000);
      setPhase('budgetAllocation');
    }
  };

  const reset = () => {
    setPhase('intro');
    setRound(1);
    setMetrics(INITIAL_METRICS);
    setChars(INITIAL_CHARACTERS);
    setHistory([{ round: 0, ...INITIAL_METRICS }]);
    setDecisions([]);
    setEvents([]);
    setEvent(null);
    setDone(false);
    setHandled(0);
    setInv(INITIAL_INVESTMENTS);
    setNotes([]);
    setAnimatedObservations([]);
    setSelectedOption(null);
    setBudget({ current: 5000, lastAllocation: 0, totalReceived: 5000 });
    setDepartingChar(null);
    setTeamCapacity(5);
    setShowTutorialPrompt(false);
    setShowTutorial(false);
    setTutorialStep(0);
    setHasSeenTabsHint(false);
    setAnimatedObservations([]);
    setGuidedPhase('plan');
    setGuidedPanelOpen(window.innerWidth >= 1200);
    setOneOnOneTargets([]);
    setCoachingTargets([]);
    setRoundStartMetrics(INITIAL_METRICS);
    setNotifications([]);
    setShowMetricOverlay(false);
  };

  const profile = () => {
    const at = history.reduce((s, m) => s + m.trust, 0) / history.length;
    const ap = history.reduce((s, m) => s + m.performance, 0) / history.length;
    const af = history.reduce((s, m) => s + m.fairness, 0) / history.length;
    if (at > 70 && af > 70) return { title: 'The Trusted Leader', desc: 'You prioritised relationships and fairness.' };
    if (ap > 75) return { title: 'The Results Driver', desc: 'You focused on performance and delivery.' };
    if (metrics.emotionalLoad > 60) return { title: 'The Burnt Out Hero', desc: 'You gave everything, perhaps too much.' };
    if (af < 50) return { title: 'The Pragmatist', desc: "You made tough calls that weren't always popular." };
    return { title: 'The Balanced Manager', desc: 'You navigated trade-offs with measured judgment.' };
  };

  const radar = [{ metric: 'Trust', value: metrics.trust }, { metric: 'Engagement', value: metrics.engagement }, { metric: 'Performance', value: metrics.performance }, { metric: 'Retention', value: metrics.retention }, { metric: 'Fairness', value: metrics.fairness }, { metric: 'Credibility', value: metrics.credibility }];

  if (phase === 'intro') {
    return (
      <div role="main" aria-label="Under Pressure - Welcome Screen" style={{ width: '100vw', minHeight: '100vh', background: `linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.darkPurple} 50%, ${COLORS.darkBlue} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Poppins', sans-serif", position: 'relative', overflow: 'auto' }}>
        <style>{styles}</style>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <div aria-hidden="true" className="animate-pulse hide-mobile" style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${COLORS.purple}20 0%, transparent 70%)` }} />
        <div aria-hidden="true" className="animate-pulse hide-mobile" style={{ position: 'absolute', bottom: '15%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${COLORS.teal}20 0%, transparent 70%)` }} />
        <div id="main-content" className="intro-content">
          <h1 className="intro-title" style={{ color: COLORS.white }}>Under <span style={{ color: COLORS.purple }}>Pressure</span></h1>
          <p className="intro-subtitle" style={{ color: COLORS.teal }}>The People Management Simulation</p>
          <p className="intro-description" style={{ color: `${COLORS.white}cc`, fontWeight: 300 }}>Lead a team through realistic challenges. Allocate your time and budget, then navigate difficult situations where your investments shape the outcomes.</p>
          <div role="list" aria-label="Game statistics" className="stats-grid" style={{ marginTop: 32 }}>
            {[{ label: 'Quarters', value: '4', icon: '🎯' }, { label: 'Metrics', value: '7', icon: '📊' }, { label: 'Events', value: '50+', icon: '⚡' }].map((x) => (
              <div key={x.label} role="listitem" style={{ textAlign: 'center' }}><div aria-hidden="true" style={{ fontSize: '1.75rem' }}>{x.icon}</div><div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, color: COLORS.yellow }}>{x.value}</div><div style={{ fontSize: '0.8rem', color: `${COLORS.white}cc`, textTransform: 'uppercase', letterSpacing: 1 }}>{x.label}</div></div>
            ))}
          </div>
          <button onClick={handleBeginClick} aria-label="Begin the simulation" className="intro-cta" style={{ fontWeight: 600, fontFamily: "'Poppins', sans-serif", background: COLORS.purple, color: COLORS.white, border: 'none', borderRadius: 50, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 2, boxShadow: `0 10px 40px ${COLORS.purple}40`, minHeight: 56 }}>Begin Simulation</button>
          <p style={{ marginTop: 24, fontSize: '0.8rem', color: `${COLORS.white}99` }}>Demo Version • Single Player • 4 Quarters</p>
        </div>

        {/* Tutorial Welcome Modal */}
        {showTutorialPrompt && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-modal-title"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: COLORS.greyDark,
                border: `1px solid ${COLORS.purple}50`,
                borderRadius: 16,
                padding: '32px 40px',
                maxWidth: 400,
                width: '90%',
                textAlign: 'center',
              }}
            >
              <h2
                id="tutorial-modal-title"
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: COLORS.white,
                  margin: '0 0 12px 0',
                }}
              >
                Welcome
              </h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: `${COLORS.white}cc`,
                  lineHeight: 1.6,
                  margin: '0 0 28px 0',
                }}
              >
                Would you like a quick tour of the interface?
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  onClick={() => { playSound('select'); startGame(false); }}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    border: `1px solid ${COLORS.white}30`,
                    borderRadius: 25,
                    color: `${COLORS.white}80`,
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Skip
                </button>
                <button
                  onClick={() => { playSound('confirm'); startGame(true); }}
                  style={{
                    padding: '12px 24px',
                    background: `linear-gradient(135deg, ${COLORS.purple} 0%, ${COLORS.blue} 100%)`,
                    border: 'none',
                    borderRadius: 25,
                    color: COLORS.white,
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Show me around
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'budgetAllocation') {
    const allocation = budget.lastAllocation;
    const compositeScore = (
      metrics.trust + metrics.engagement + metrics.performance +
      metrics.fairness + metrics.credibility
    ) / 5;

    const narrative = allocation > 6000
      ? "Outstanding performance. Your team's results exceeded expectations."
      : allocation > 5000
        ? "Strong performance. Your balanced approach is paying dividends."
        : allocation > 4000
          ? "Solid performance. You're meeting targets, but there's room for improvement."
          : "Performance concerns. Leadership is watching closely.";

    return (
      <div role="main" aria-label="Budget Allocation" style={{
        width: '100vw', minHeight: '100vh',
        background: `linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.darkPurple} 100%)`,
        fontFamily: "'Poppins', sans-serif",
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 20
      }}>
        <style>{styles}</style>

        <div style={{
          maxWidth: 600, width: '100%',
          background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`,
          borderRadius: 20, padding: 40,
          border: `1px solid ${COLORS.purple}40`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', color: COLORS.purple,
                        textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            Q{round} Budget Allocation
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', fontWeight: 700,
                       color: COLORS.white, margin: '0 0 20px 0' }}>
            Performance Review
          </h1>

          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: '0.9rem', color: `${COLORS.white}cc`, marginBottom: 8 }}>
              Your Composite Score
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: COLORS.teal, marginBottom: 15 }}>
              {Math.round(compositeScore)}
            </div>
            <div style={{ fontSize: '0.85rem', color: `${COLORS.white}99`, lineHeight: 1.6,
                         padding: '15px 20px', background: `${COLORS.black}40`, borderRadius: 12,
                         marginBottom: 20 }}>
              {narrative}
            </div>
          </div>

          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: '0.75rem', color: `${COLORS.white}99`, marginBottom: 8 }}>
              Company Quarterly Pot
            </div>
            <div style={{ fontSize: '1.2rem', color: `${COLORS.white}cc`, marginBottom: 20 }}>
              £20,000
            </div>

            <div style={{ fontSize: '0.75rem', color: COLORS.purple, marginBottom: 8,
                         textTransform: 'uppercase', letterSpacing: 1 }}>
              Your Allocation
            </div>
            <div className="count-up" style={{
              fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 700,
              color: COLORS.yellow, marginBottom: 10,
              animation: 'countUp 1.5s ease-out'
            }}>
              £{allocation.toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => {
              setRound(round + 1);
              setDone(false);
              setHandled(0);
              setInv(INITIAL_INVESTMENTS);
              setSelectedOption(null);
              const e = pickEvents();
              setEvents(e);
              setEvent(e[0] || null);
              setGuidedPhase('plan');
              setOneOnOneTargets([]);
              setCoachingTargets([]);
              setRoundStartMetrics({ ...metrics });
              setNotifications([]);
              setShowMetricOverlay(false);
              setPhase('playing');
            }}
            style={{
              padding: '14px 40px', background: COLORS.purple,
              border: 'none', borderRadius: 25, color: COLORS.white,
              fontFamily: "'Poppins', sans-serif", fontSize: '0.95rem',
              fontWeight: 600, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: 2, minHeight: 52,
              boxShadow: `0 10px 30px ${COLORS.purple}40`
            }}
          >
            Start Q{round + 1}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'departure') {
    const departedChar = chars.find(c => c.id === departingChar.id);
    const remainingCount = chars.filter(c => !c.departed).length;

    return (
      <div role="main" aria-label="Team Member Departure" style={{
        width: '100vw', minHeight: '100vh',
        background: `linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.darkPurple} 100%)`,
        fontFamily: "'Poppins', sans-serif",
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <style>{styles}</style>

        <div style={{
          maxWidth: 600, width: '100%',
          background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`,
          borderRadius: 20, padding: 40,
          border: `2px solid ${COLORS.yellow}`
        }}>
          {/* Avatar & Name */}
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ fontSize: '5rem', marginBottom: 15, opacity: 0.7 }}>
              {departedChar.avatar}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: COLORS.white, marginBottom: 8 }}>
              {departedChar.name} Has Left
            </h1>
            <p style={{ fontSize: '1.1rem', color: COLORS.yellow, margin: 0 }}>
              {departedChar.role}
            </p>
          </div>

          {/* Departure Quote */}
          <div style={{
            background: `${COLORS.black}40`,
            borderLeft: `4px solid ${COLORS.yellow}`,
            padding: 20, borderRadius: 8, marginBottom: 30
          }}>
            <p style={{
              fontSize: '1.05rem', color: `${COLORS.white}cc`,
              lineHeight: 1.6, margin: 0, fontStyle: 'italic'
            }}>
              "{departedChar.departureReason}"
            </p>
          </div>

          {/* Impact Summary */}
          <div style={{
            background: `${COLORS.black}40`,
            padding: 20, borderRadius: 8, marginBottom: 30
          }}>
            <h2 style={{
              fontSize: '0.9rem', color: COLORS.purple,
              textTransform: 'uppercase', letterSpacing: 2, marginBottom: 15
            }}>
              Impact on Team
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: `${COLORS.white}99` }}>Team Size:</span>
                <span style={{ color: COLORS.yellow, fontWeight: 600 }}>
                  {remainingCount} / 5 members
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: `${COLORS.white}99` }}>Team Morale:</span>
                <span style={{ color: '#ff4757', fontWeight: 600 }}>
                  -5 Trust, -8 Engagement
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: `${COLORS.white}99` }}>Workload per Person:</span>
                <span style={{
                  color: chars.filter(c => !c.departed)[0]?.loadPercent > 120 ? '#ff4757' : COLORS.yellow,
                  fontWeight: 600
                }}>
                  {Math.round(chars.filter(c => !c.departed)[0]?.loadPercent || 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => {
              setDepartingChar(null);
              if (round >= 4) {
                setPhase('results');
              } else {
                allocateBudget(20000);
                setPhase('budgetAllocation');
              }
            }}
            style={{
              width: '100%', padding: '16px 32px',
              fontSize: '1.1rem', fontWeight: 600,
              background: COLORS.purple, color: COLORS.white,
              border: 'none', borderRadius: 12, cursor: 'pointer'
            }}
          >
            Continue to Q{round + 1}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const p = profile();
    const f = history[history.length - 1] || metrics;
    return (
      <div role="main" aria-label="Simulation Results" style={{ width: '100vw', minHeight: '100vh', background: `linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.darkPurple} 100%)`, fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <style>{styles}</style>
        <a href="#results-content" className="skip-link">Skip to results</a>
        <header style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.white}10`, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="brand-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: COLORS.white }}>UNDER <span style={{ color: COLORS.purple }}>PRESSURE</span></span>
          </div>
          <button onClick={reset} aria-label="Start a new simulation" className="play-again-btn" style={{ padding: '10px 20px', background: 'transparent', border: `2px solid ${COLORS.purple}`, color: COLORS.purple, borderRadius: 25, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, minHeight: 44 }}>Play Again</button>
        </header>
        <div id="results-content" className="results-grid" style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section aria-labelledby="profile-heading" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 16, padding: 'clamp(16px, 4vw, 30px)', border: `1px solid ${COLORS.purple}40` }}>
              <div id="profile-heading" style={{ fontSize: '0.8rem', color: COLORS.purple, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Your Leadership Profile</div>
              <h2 className="profile-title" style={{ color: COLORS.white }}>{p.title}</h2>
              <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', color: `${COLORS.white}cc`, lineHeight: 1.6 }}>{p.desc}</p>
            </section>
            <section aria-labelledby="metrics-heading" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 16, padding: 'clamp(16px, 4vw, 25px)', border: `1px solid ${COLORS.white}10`, flex: 1 }}>
              <h3 id="metrics-heading" style={{ fontSize: '0.8rem', color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, fontWeight: 600 }}>Final Metrics</h3>
              <div role="list" className="metrics-grid">
                {[{ k: 'trust', l: 'Trust' }, { k: 'engagement', l: 'Engagement' }, { k: 'performance', l: 'Performance' }, { k: 'retention', l: 'Retention' }, { k: 'fairness', l: 'Fairness' }, { k: 'credibility', l: 'Credibility' }].map(x => (
                  <div key={x.k} role="listitem" aria-label={`${x.l}: ${Math.round(f[x.k])} percent`} style={{ background: `${COLORS.black}50`, padding: 15, borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: `${COLORS.white}cc`, fontSize: '0.85rem' }}>{x.l}</span><span style={{ color: getMetricColor(f[x.k]), fontWeight: 700, fontSize: '1.2rem' }}>{Math.round(f[x.k])}</span></div>
                    <div role="progressbar" aria-valuenow={Math.round(f[x.k])} aria-valuemin="0" aria-valuemax="100" aria-label={`${x.l} progress`} style={{ height: 6, background: `${COLORS.white}10`, borderRadius: 3 }}><div style={{ width: `${f[x.k]}%`, height: '100%', background: getMetricColor(f[x.k]), borderRadius: 3 }} /></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section aria-labelledby="journey-heading" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 20, padding: 25, border: `1px solid ${COLORS.white}10`, height: 280 }}>
              <h3 id="journey-heading" style={{ fontSize: '0.85rem', color: COLORS.blue, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 15, fontWeight: 600 }}>Your Journey</h3>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={history} aria-label="Chart showing trust and performance over time"><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3}/><stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/></linearGradient></defs><XAxis dataKey="round" stroke={`${COLORS.white}50`} tick={{ fill: `${COLORS.white}99`, fontSize: 12 }} /><YAxis domain={[0, 100]} stroke={`${COLORS.white}50`} tick={{ fill: `${COLORS.white}99`, fontSize: 12 }} /><Tooltip contentStyle={{ background: COLORS.greyDark, border: `1px solid ${COLORS.white}20`, borderRadius: 10, color: COLORS.white }} /><Area type="monotone" dataKey="trust" stroke={COLORS.purple} fill="url(#tg)" strokeWidth={2} name="Trust" /><Area type="monotone" dataKey="performance" stroke={COLORS.teal} fill="transparent" strokeWidth={2} name="Performance" /></AreaChart>
              </ResponsiveContainer>
            </section>
            <section aria-labelledby="decisions-heading" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 20, padding: 25, border: `1px solid ${COLORS.white}10`, flex: 1, overflow: 'auto' }}>
              <h3 id="decisions-heading" style={{ fontSize: '0.85rem', color: COLORS.yellow, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 15, fontWeight: 600 }}>Key Decisions ({decisions.length})</h3>
              <div role="list" aria-label="List of your decisions" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{decisions.slice(-6).map((d) => (<div key={d.eventId} role="listitem" style={{ background: `${COLORS.black}50`, padding: '12px 15px', borderRadius: 10, borderLeft: `3px solid ${COLORS.purple}` }}><div style={{ fontSize: '0.75rem', color: COLORS.purple, marginBottom: 4 }}>Q{d.round}: {d.eventTitle}</div><div style={{ fontSize: '0.9rem', color: `${COLORS.white}cc` }}>{d.choice}</div></div>))}</div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Render investment sliders component (used in both desktop sidebar and mobile drawer)
  const renderInvestments = () => {
    const totalCost = calculateInvestmentCost(inv);
    const canAfford = totalCost <= budget.current;
    const budgetRemaining = budget.current - totalCost;
    const totalTime = TIME_INVESTMENTS.reduce((sum, x) => sum + inv[x.id], 0);
    const isOverAllocated = totalTime > 100;

    return (
      <>
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 10, background: `${COLORS.black}40`, borderRadius: 8, padding: 3 }}>
          <button
            onClick={() => setInvestmentTab('budget')}
            style={{
              flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif", fontSize: '0.7rem', fontWeight: 600,
              background: investmentTab === 'budget' ? `${COLORS.teal}25` : 'transparent',
              color: investmentTab === 'budget' ? COLORS.teal : `${COLORS.white}60`,
              transition: 'all 0.15s ease-out',
            }}
          >
            💰 Budget
          </button>
          <button
            onClick={() => setInvestmentTab('time')}
            style={{
              flex: 1, padding: '6px 0', border: 'none', borderRadius: 6, cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif", fontSize: '0.7rem', fontWeight: 600,
              background: investmentTab === 'time' ? `${COLORS.blue}25` : 'transparent',
              color: investmentTab === 'time' ? COLORS.blue : `${COLORS.white}60`,
              transition: 'all 0.15s ease-out',
            }}
          >
            ⏱️ Time {(inv.oneOnOnes > 0 && oneOnOneTargets.length === 0) || (inv.coaching > 0 && coachingTargets.length === 0) ? '•' : ''}
          </button>
        </div>

        {/* Budget tab */}
        {investmentTab === 'budget' && (
          <>
            <div style={{ fontSize: '0.7rem', color: canAfford ? COLORS.teal : COLORS.yellow, marginBottom: 8, padding: '6px 8px', background: `${COLORS.black}40`, borderRadius: 6 }}>
              {budget.current === 0 ? (
                <><span aria-hidden="true">🚫</span> Budget: £0 - Time investments only</>
              ) : (
                <><span aria-hidden="true">💰</span> Budget: £{budgetRemaining.toLocaleString()} remaining</>
              )}
            </div>
            {BUDGET_INVESTMENTS.map(x => {
              const cost = (inv[x.id] / 10) * INVESTMENT_COSTS[x.id];
              const disabled = budget.current === 0;
              return (
                <div key={x.id} style={{ marginBottom: 12, opacity: disabled ? 0.5 : 1 }}>
                  <label htmlFor={`slider-${x.id}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ color: `${COLORS.white}cc`, fontSize: '0.75rem' }}>
                      <span aria-hidden="true">{x.icon}</span> {x.label}
                    </span>
                    <span style={{ color: inv[x.id] ? COLORS.teal : `${COLORS.white}99`, fontWeight: 600, fontSize: '0.85rem' }}>
                      {inv[x.id]}% <span style={{ fontSize: '0.7rem', color: `${COLORS.white}70` }}>(£{cost})</span>
                    </span>
                  </label>
                  <input
                    id={`slider-${x.id}`}
                    type="range" min="0" max="100" step="10"
                    value={inv[x.id]}
                    onChange={e => { playSound('slider'); setInv({ ...inv, [x.id]: +e.target.value }); }}
                    disabled={disabled}
                    aria-label={`${x.label} investment: ${inv[x.id]} percent, costs £${cost}`}
                  />
                  <div style={{ fontSize: '0.65rem', color: `${COLORS.white}60`, marginTop: 2, lineHeight: 1.3 }}>{x.helpText}</div>
                </div>
              );
            })}
          </>
        )}

        {/* Time tab */}
        {investmentTab === 'time' && (
          <>
            <div style={{ fontSize: '0.7rem', color: isOverAllocated ? '#ff4757' : COLORS.blue, marginBottom: 8, padding: '6px 8px', background: `${COLORS.black}40`, borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span><span aria-hidden="true">⏱️</span> Time: {100 - totalTime >= 0 ? `${100 - totalTime}% remaining` : `${Math.abs(100 - totalTime)}% over capacity`}</span>
                <span style={{ fontWeight: 600 }}>{totalTime}% used</span>
              </div>
              <div style={{ height: 4, background: `${COLORS.white}15`, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(totalTime, 100)}%`, height: '100%', background: isOverAllocated ? '#ff4757' : COLORS.blue, borderRadius: 2, transition: 'width 0.2s ease-out' }} />
              </div>
            </div>
            {TIME_INVESTMENTS.map(x => (
              <div key={x.id} style={{ marginBottom: 12 }}>
                <label htmlFor={`slider-${x.id}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ color: `${COLORS.white}cc`, fontSize: '0.75rem' }}><span aria-hidden="true">{x.icon}</span> {x.label}</span><span style={{ color: inv[x.id] ? COLORS.blue : `${COLORS.white}99`, fontWeight: 600, fontSize: '0.85rem' }}>{inv[x.id]}%</span></label>
                <input id={`slider-${x.id}`} type="range" min="0" max="100" step="10" value={inv[x.id]} onChange={e => {
                  const newVal = +e.target.value;
                  playSound('slider');
                  setInv({ ...inv, [x.id]: newVal });
                  if (x.id === 'oneOnOnes') {
                    if (newVal === 0) setOneOnOneTargets([]);
                    else {
                      const newMax = Math.min(Math.ceil(newVal / 25), chars.filter(c => !c.departed).length);
                      if (oneOnOneTargets.length > newMax) setOneOnOneTargets(oneOnOneTargets.slice(0, newMax));
                    }
                  }
                  if (x.id === 'coaching') {
                    if (newVal === 0) setCoachingTargets([]);
                    else {
                      const newMax = Math.min(Math.ceil(newVal / 25), chars.filter(c => !c.departed).length);
                      if (coachingTargets.length > newMax) setCoachingTargets(coachingTargets.slice(0, newMax));
                    }
                  }
                }} aria-label={`${x.label} investment: ${inv[x.id]} percent`} />
                <div style={{ fontSize: '0.65rem', color: `${COLORS.white}60`, marginTop: 2, lineHeight: 1.3 }}>{x.helpText}</div>
                {x.id === 'oneOnOnes' && inv.oneOnOnes > 0 && (() => {
                  const availableChars = chars.filter(c => !c.departed);
                  const maxSlots = Math.min(Math.ceil(inv.oneOnOnes / 25), availableChars.length);
                  return (
                    <div style={{ marginTop: 8, padding: 10, background: `${COLORS.purple}12`, borderRadius: 10, border: `1px solid ${COLORS.purple}25` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.7rem', color: '#d580d5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Who will you meet with?
                        </span>
                        <span style={{ fontSize: '0.65rem', color: `${COLORS.white}60` }}>
                          {oneOnOneTargets.length}/{maxSlots} slots
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {availableChars.map(c => {
                          const isSelected = oneOnOneTargets.includes(c.id);
                          const canSelect = isSelected || oneOnOneTargets.length < maxSlots;
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                if (isSelected) {
                                  setOneOnOneTargets(oneOnOneTargets.filter(id => id !== c.id));
                                } else if (canSelect) {
                                  playSound('slider');
                                  setOneOnOneTargets([...oneOnOneTargets, c.id]);
                                }
                              }}
                              disabled={!canSelect && !isSelected}
                              aria-label={`${isSelected ? 'Remove' : 'Select'} ${c.name} for 1:1`}
                              aria-pressed={isSelected}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                                background: isSelected ? `${COLORS.purple}30` : `${COLORS.black}40`,
                                border: `1px solid ${isSelected ? COLORS.purple : `${COLORS.white}15`}`,
                                borderRadius: 20,
                                color: isSelected ? COLORS.white : canSelect ? `${COLORS.white}99` : `${COLORS.white}30`,
                                fontFamily: "'Poppins', sans-serif", fontSize: '0.7rem',
                                fontWeight: isSelected ? 600 : 400,
                                cursor: canSelect || isSelected ? 'pointer' : 'default',
                                transition: 'all 0.15s ease-out',
                              }}
                            >
                              <span aria-hidden="true" style={{ fontSize: '0.85rem' }}>{c.avatar}</span>
                              <span>{c.name.split(' ')[0]}</span>
                              {isSelected && <span aria-hidden="true" style={{ fontSize: '0.6rem', marginLeft: 2 }}>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      {oneOnOneTargets.length > 0 && (
                        <div style={{ marginTop: 8, fontSize: '0.6rem', color: `${COLORS.white}50`, lineHeight: 1.4 }}>
                          Selected team members will get a trust and engagement boost this quarter.
                        </div>
                      )}
                    </div>
                  );
                })()}
                {x.id === 'coaching' && inv.coaching > 0 && (() => {
                  const availableChars = chars.filter(c => !c.departed);
                  const maxSlots = Math.min(Math.ceil(inv.coaching / 25), availableChars.length);
                  return (
                    <div style={{ marginTop: 8, padding: 10, background: `${COLORS.blue}12`, borderRadius: 10, border: `1px solid ${COLORS.blue}25` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.7rem', color: COLORS.blue, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Who will you coach?
                        </span>
                        <span style={{ fontSize: '0.65rem', color: `${COLORS.white}60` }}>
                          {coachingTargets.length}/{maxSlots} slots
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {availableChars.map(c => {
                          const isSelected = coachingTargets.includes(c.id);
                          const canSelect = isSelected || coachingTargets.length < maxSlots;
                          return (
                            <button
                              key={c.id}
                              onClick={() => {
                                if (isSelected) {
                                  setCoachingTargets(coachingTargets.filter(id => id !== c.id));
                                } else if (canSelect) {
                                  playSound('slider');
                                  setCoachingTargets([...coachingTargets, c.id]);
                                }
                              }}
                              disabled={!canSelect && !isSelected}
                              aria-label={`${isSelected ? 'Remove' : 'Select'} ${c.name} for coaching`}
                              aria-pressed={isSelected}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
                                background: isSelected ? `${COLORS.blue}30` : `${COLORS.black}40`,
                                border: `1px solid ${isSelected ? COLORS.blue : `${COLORS.white}15`}`,
                                borderRadius: 20,
                                color: isSelected ? COLORS.white : canSelect ? `${COLORS.white}99` : `${COLORS.white}30`,
                                fontFamily: "'Poppins', sans-serif", fontSize: '0.7rem',
                                fontWeight: isSelected ? 600 : 400,
                                cursor: canSelect || isSelected ? 'pointer' : 'default',
                                transition: 'all 0.15s ease-out',
                              }}
                            >
                              <span aria-hidden="true" style={{ fontSize: '0.85rem' }}>{c.avatar}</span>
                              <span>{c.name.split(' ')[0]}</span>
                              {isSelected && <span aria-hidden="true" style={{ fontSize: '0.6rem', marginLeft: 2 }}>✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      {coachingTargets.length > 0 && (
                        <div style={{ marginTop: 8, fontSize: '0.6rem', color: `${COLORS.white}50`, lineHeight: 1.4 }}>
                          Selected team members will get a performance and engagement boost this quarter.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </>
        )}
      </>
    );
  };

  const renderGuidedPanel = () => {
    if (phase !== 'playing' || tab !== 'dashboard') return null;

    const phases = [
      { key: 'plan', icon: '🧭', label: 'Plan' },
      { key: 'execute', icon: '⚙️', label: 'Execute' },
      { key: 'reflect', icon: '💡', label: 'Reflect' },
    ];
    const currentPhaseIndex = phases.findIndex(p => p.key === guidedPhase);
    const currentPhaseData = phases.find(p => p.key === guidedPhase);

    const handlePlanProceed = () => {
      playSound('confirm');
      // Apply 1:1 and coaching boosts to selected characters
      let updatedChars = [...chars];
      if (inv.oneOnOnes > 0 && oneOnOneTargets.length > 0) {
        const intensity = inv.oneOnOnes / 100;
        const trustBoost = 3 + intensity * 4;   // 3-7 per person
        const engagementBoost = 2 + intensity * 3; // 2-5 per person
        updatedChars = updatedChars.map(c => {
          if (oneOnOneTargets.includes(c.id) && !c.departed) {
            return { ...c, trust: clamp(c.trust + trustBoost, 0, 100), engagement: clamp(c.engagement + engagementBoost, 0, 100) };
          }
          return c;
        });
      }
      if (inv.coaching > 0 && coachingTargets.length > 0) {
        const intensity = inv.coaching / 100;
        const perfBoost = 2 + intensity * 4;       // 2-6 per person
        const engagementBoost = 2 + intensity * 3;  // 2-5 per person
        updatedChars = updatedChars.map(c => {
          if (coachingTargets.includes(c.id) && !c.departed) {
            return { ...c, performance: clamp(c.performance + perfBoost, 0, 100), engagement: clamp(c.engagement + engagementBoost, 0, 100) };
          }
          return c;
        });
      }
      if (updatedChars !== chars) setChars(updatedChars);
      setGuidedPhase('execute');
    };

    const hasSetInvestments = Object.values(inv).some(v => v > 0);
    const totalEvents = events.length + handled;

    if (!guidedPanelOpen) {
      return (
        <div
          className="guided-panel collapsed"
          onClick={() => setGuidedPanelOpen(true)}
          role="complementary"
          aria-label="Quarter Guide (collapsed)"
        >
          <div className="guided-collapsed-content">
            <span className="guided-collapsed-icon" aria-hidden="true">{currentPhaseData.icon}</span>
            <span className="guided-collapsed-label">{currentPhaseData.label}</span>
          </div>
        </div>
      );
    }

    return (
      <aside
        className={`guided-panel force-open ${guidedPhase === 'plan' ? 'plan-active' : ''}`}
        role="complementary"
        aria-label="Quarter Guide"
      >
        <button
          className="guided-panel-toggle hide-mobile"
          onClick={() => setGuidedPanelOpen(false)}
          aria-label="Collapse Quarter Guide"
        >
          ‹
        </button>

        <div style={{ fontSize: '0.85rem', color: '#d580d5', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
          Quarter Guide
        </div>

        {guidedPhase === 'plan' && (
          <div className="guided-start-badge">
            <span aria-hidden="true">▶</span>
            <span>Start Here — Q{round}</span>
          </div>
        )}

        <div className="guided-phase-progress">
          {phases.map((p, i) => (
            <span key={p.key} style={{ display: 'contents' }}>
              <div className={`guided-phase-step ${guidedPhase === p.key ? 'active' : ''} ${i < currentPhaseIndex ? 'completed' : ''}`}>
                <span aria-hidden="true">{p.icon}</span>
                <span>{p.label}</span>
              </div>
              {i < phases.length - 1 && (
                <div className={`guided-phase-connector ${i < currentPhaseIndex ? 'completed' : ''}`} />
              )}
            </span>
          ))}
        </div>

        <div className="guided-phase-content" key={guidedPhase}>
          {guidedPhase === 'plan' && (
            <>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: COLORS.white, margin: '0 0 16px 0' }}>
                Review the Situation
              </h3>

              {generatePlanInsights(chars, metrics, budget, round, history).map((insight, i) => (
                <div key={i} className="guided-insight">
                  <span className="guided-insight-icon" aria-hidden="true">{insight.icon}</span>
                  <span className="guided-insight-text">{insight.text}</span>
                </div>
              ))}

              <div className="guided-facilitation">
                <div className="guided-facilitation-label">Discussion Prompt</div>
                <p className="guided-facilitation-text">
                  {FACILITATION_PROMPTS.plan.find(p => p.round === round)?.prompt ||
                   FACILITATION_PROMPTS.plan[0].prompt}
                </p>
              </div>

              <button
                onClick={handlePlanProceed}
                style={{
                  width: '100%',
                  marginTop: 20,
                  padding: '12px 24px',
                  background: COLORS.purple,
                  border: 'none',
                  borderRadius: 22,
                  color: COLORS.white,
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  minHeight: 48,
                }}
              >
                Ready to Start Q{round}
              </button>
            </>
          )}

          {guidedPhase === 'execute' && (
            <>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: COLORS.white, margin: '0 0 16px 0' }}>
                Make Your Decisions
              </h3>

              <div className="guided-checklist-item">
                <div className={`guided-check ${hasSetInvestments ? 'done' : ''}`}>
                  {hasSetInvestments ? '✓' : ''}
                </div>
                <span className={`guided-check-label ${hasSetInvestments ? 'done' : ''}`}>
                  Set investments
                </span>
              </div>
              {inv.oneOnOnes > 0 && (
                <div className="guided-checklist-item">
                  <div className={`guided-check ${oneOnOneTargets.length > 0 ? 'done' : ''}`}>
                    {oneOnOneTargets.length > 0 ? '✓' : ''}
                  </div>
                  <span className={`guided-check-label ${oneOnOneTargets.length > 0 ? 'done' : ''}`}>
                    1:1s scheduled ({oneOnOneTargets.length} selected)
                  </span>
                </div>
              )}
              {inv.coaching > 0 && (
                <div className="guided-checklist-item">
                  <div className={`guided-check ${coachingTargets.length > 0 ? 'done' : ''}`}>
                    {coachingTargets.length > 0 ? '✓' : ''}
                  </div>
                  <span className={`guided-check-label ${coachingTargets.length > 0 ? 'done' : ''}`}>
                    Coaching scheduled ({coachingTargets.length} selected)
                  </span>
                </div>
              )}
              {Array.from({ length: totalEvents }, (_, i) => (
                <div key={i} className="guided-checklist-item">
                  <div className={`guided-check ${i < handled ? 'done' : ''}`}>
                    {i < handled ? '✓' : ''}
                  </div>
                  <span className={`guided-check-label ${i < handled ? 'done' : ''}`}>
                    {i < handled ? `Event ${i + 1} handled` : i === handled ? `Event ${i + 1} (current)` : `Event ${i + 1}`}
                  </span>
                </div>
              ))}

              <div style={{
                marginTop: 16,
                padding: 12,
                background: `${COLORS.black}30`,
                borderRadius: 8,
                borderLeft: `3px solid ${COLORS.teal}30`,
              }}>
                <div style={{ fontSize: '0.65rem', color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>
                  Tip
                </div>
                <p style={{ fontSize: '0.8rem', color: `${COLORS.white}99`, lineHeight: 1.5, margin: 0 }}>
                  {hasSetInvestments
                    ? 'Your investments shape how events play out. Higher relevant investments soften negative outcomes.'
                    : 'Set your budget and time investments before handling events. They affect your options\' effectiveness.'
                  }
                </p>
              </div>
            </>
          )}

          {guidedPhase === 'reflect' && (
            <>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: COLORS.white, margin: '0 0 16px 0' }}>
                Review Your Results
              </h3>

              {generateReflectionPrompts(chars, metrics, history, decisions, round).map((prompt, i) => (
                <div key={i} className="guided-insight">
                  <span className="guided-insight-icon" aria-hidden="true">{prompt.icon}</span>
                  <span className="guided-insight-text">{prompt.text}</span>
                </div>
              ))}

              <div className="guided-facilitation">
                <div className="guided-facilitation-label">Discussion Prompt</div>
                <p className="guided-facilitation-text">
                  {FACILITATION_PROMPTS.reflect.find(p => p.round === round)?.prompt ||
                   FACILITATION_PROMPTS.reflect[0].prompt}
                </p>
              </div>

              <button
                onClick={endRound}
                aria-label={round >= 4 ? 'View your final results' : `Start quarter ${round + 1}`}
                style={{
                  width: '100%',
                  marginTop: 20,
                  padding: '12px 24px',
                  background: COLORS.teal,
                  border: 'none',
                  borderRadius: 22,
                  color: COLORS.white,
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  minHeight: 48,
                }}
              >
                {round >= 4 ? 'View Results' : `Start Q${round + 1}`}
              </button>
            </>
          )}
        </div>

        {/* Mobile collapse toggle at bottom */}
        <button
          className="hide-desktop"
          onClick={() => setGuidedPanelOpen(false)}
          aria-label="Collapse Quarter Guide"
          style={{
            width: '100%',
            padding: '8px',
            background: 'transparent',
            border: 'none',
            borderTop: `1px solid ${COLORS.white}10`,
            color: `${COLORS.white}60`,
            fontFamily: "'Poppins', sans-serif",
            fontSize: '0.7rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Collapse ▲
        </button>
      </aside>
    );
  };

  return (
    <div role="main" aria-label={`Under Pressure - Quarter ${round} of 4`} style={{ width: '100vw', minHeight: '100vh', background: COLORS.black, fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{styles}</style>
      <a href="#game-content" className="skip-link">Skip to game content</a>

      {/* Metric Changes Overlay */}
      {showMetricOverlay && notifications.length > 0 && (
        <div className="metric-overlay-backdrop" onClick={() => setShowMetricOverlay(false)}>
          <div className="metric-overlay-panel" onClick={e => e.stopPropagation()} role="dialog" aria-label="Key metric changes this quarter">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: COLORS.white, margin: 0, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                Key Metric Changes
              </h2>
              <span style={{ fontSize: '0.7rem', color: `${COLORS.white}60`, background: `${COLORS.purple}30`, padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>
                Q{round}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {notifications.map((n, i) => {
                const bgColor = n.isPositive
                  ? `linear-gradient(135deg, ${COLORS.greyDark} 0%, rgba(45, 213, 196, 0.15) 100%)`
                  : `linear-gradient(135deg, ${COLORS.greyDark} 0%, rgba(255, 71, 87, 0.15) 100%)`;
                const borderColor = n.isPositive ? COLORS.teal : '#ff4757';
                const textColor = n.isPositive ? COLORS.teal : '#ff4757';
                const displayDelta = n.delta > 0 ? `+${n.delta}` : n.delta;

                return (
                  <div
                    key={n.id}
                    className="metric-overlay-item"
                    style={{
                      background: bgColor,
                      borderLeft: `3px solid ${borderColor}`,
                      borderRadius: 10,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      animationDelay: `${i * 150}ms`,
                    }}
                  >
                    <span style={{ color: `${COLORS.white}cc`, fontSize: '0.9rem', fontWeight: 500 }}>
                      {n.label}
                    </span>
                    <span style={{ color: textColor, fontSize: '1.2rem', fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                      {displayDelta}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowMetricOverlay(false)}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: COLORS.purple,
                border: 'none',
                borderRadius: 22,
                color: COLORS.white,
                fontFamily: "'Poppins', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 1,
                minHeight: 44,
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Responsive Header */}
      <header className="game-header" style={{ background: `linear-gradient(90deg, ${COLORS.greyDark} 0%, ${COLORS.grey} 100%)`, borderBottom: `1px solid ${COLORS.white}10` }}>
        <div className="header-brand">
          <span className="brand-text" style={{ fontSize: '1rem', fontWeight: 700, color: COLORS.white }}>UNDER <span style={{ color: COLORS.purple }}>PRESSURE</span></span>
          <div aria-label={`Quarter ${round} of 4`} style={{ background: `${COLORS.purple}30`, padding: '4px 12px', borderRadius: 15, fontSize: '0.75rem', color: COLORS.purple, fontWeight: 600 }}>Q{round}/4</div>
          <div aria-label={`Budget: £${budget.current.toLocaleString()}`} style={{ background: `${COLORS.teal}30`, padding: '4px 12px', borderRadius: 15, fontSize: '0.75rem', color: COLORS.teal, fontWeight: 600 }}>
            💰 £{budget.current.toLocaleString()}
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            style={{
              background: `${COLORS.white}10`,
              border: 'none',
              borderRadius: 15,
              padding: '4px 12px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              color: COLORS.white,
              opacity: soundEnabled ? 1 : 0.5
            }}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        {/* Desktop navigation - hidden on mobile */}
        <div className="hide-mobile" style={{ position: 'relative' }}>
          <nav role="tablist" aria-label="View selection" className="header-nav">{['dashboard', 'insights', 'team'].map(t => (<button key={t} role="tab" aria-selected={tab === t} aria-controls={`${t}-panel`} onClick={() => setTab(t)} className="nav-tab" style={{ padding: '8px 16px', background: tab === t ? COLORS.purple : 'transparent', border: 'none', borderRadius: 12, color: tab === t ? COLORS.white : `${COLORS.white}cc`, fontFamily: "'Poppins', sans-serif", fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1, minHeight: 40 }}>{t}</button>))}</nav>
          {/* Tabs hint tooltip - Round 1 only */}
          {round === 1 && !hasSeenTabsHint && !showTutorial && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 8,
                background: COLORS.greyDark,
                border: `1px solid ${COLORS.purple}50`,
                borderRadius: 10,
                padding: '12px 16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                zIndex: 100,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: '0.8rem', color: `${COLORS.white}cc` }}>
                More detail lives in these tabs — explore anytime.
              </span>
              <button
                onClick={() => setHasSeenTabsHint(true)}
                style={{
                  padding: '6px 14px',
                  background: COLORS.purple,
                  border: 'none',
                  borderRadius: 15,
                  color: COLORS.white,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Got it
              </button>
              {/* Arrow pointing up */}
              <div
                style={{
                  position: 'absolute',
                  top: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: `6px solid ${COLORS.greyDark}`,
                }}
              />
            </div>
          )}
        </div>

        <div className="header-actions hide-mobile" style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { playSound('confirm'); setShowTutorial(true); setTutorialStep(0); setTab('dashboard'); }}
            aria-label="Show tutorial"
            title="Show tutorial"
            style={{ padding: '8px 12px', background: 'transparent', border: `1px solid ${COLORS.purple}50`, color: COLORS.purple, borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', fontWeight: 600, minHeight: 40 }}
          >?</button>
          <button onClick={reset} aria-label="Reset simulation" className="reset-btn" style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${COLORS.white}50`, color: `${COLORS.white}cc`, borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontSize: '0.75rem', minHeight: 40 }}>Reset</button>
        </div>
      </header>

      <div id="game-content" className="game-content" style={{ flex: 1, display: 'flex', overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
        {renderGuidedPanel()}
        {tab === 'dashboard' && (
          <div role="tabpanel" id="dashboard-panel" aria-label="Dashboard view" className="dashboard-grid" style={{ flex: 1 }}>

            {/* Mobile metrics bar - quick overview of key metrics */}
            <div className="mobile-metrics" role="list" aria-label="Key metrics overview">
              {[
                { k: 'trust', l: 'Trust', i: '🤝' },
                { k: 'engagement', l: 'Engage', i: '⚡' },
                { k: 'performance', l: 'Perf', i: '📈' },
                { k: 'fairness', l: 'Fair', i: '⚖️' },
                { k: 'emotionalLoad', l: 'Load', i: '🧠' }
              ].map(x => (
                <div key={x.k} className="metric-chip" role="listitem">
                  <span aria-hidden="true">{x.i}</span>
                  <span className="metric-chip-label">{x.l}</span>
                  <span className="metric-chip-value" style={{ color: x.k === 'emotionalLoad' ? (metrics[x.k] > 60 ? COLORS.yellow : COLORS.teal) : getMetricColor(metrics[x.k]) }}>
                    {Math.round(metrics[x.k])}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile investments toggle - only visible on mobile */}
            <div className="mobile-investments">
              <button onClick={() => setShowMobileInvestments(!showMobileInvestments)} className="investments-toggle" aria-expanded={showMobileInvestments}>
                <span>⚙️ Investments</span>
                <span style={{ transform: showMobileInvestments ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
              </button>
              {showMobileInvestments && (
                <div className="investments-drawer">
                  {renderInvestments()}
                </div>
              )}
            </div>

            {/* Desktop sidebar with metrics and investments - hidden on mobile */}
            <aside className="hide-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflow: 'hidden' }}>
              <section ref={metricsRef} aria-labelledby="metrics-heading" aria-live="polite" style={{ background: `linear-gradient(180deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, padding: 14, border: `1px solid ${COLORS.white}10`, flexShrink: 0 }}>
                <h2 id="metrics-heading" style={{ fontSize: '0.75rem', color: COLORS.purple, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>Metrics</h2>
                {[{ k: 'trust', l: 'Trust', i: '🤝' }, { k: 'engagement', l: 'Engagement', i: '⚡' }, { k: 'performance', l: 'Performance', i: '📈' }, { k: 'fairness', l: 'Fairness', i: '⚖️' }, { k: 'credibility', l: 'Credibility', i: '🎯' }].map(x => (
                  <div key={x.k} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ color: `${COLORS.white}cc`, fontSize: '0.8rem' }}><span aria-hidden="true">{x.i}</span> {x.l}</span><span style={{ color: getMetricColor(metrics[x.k]), fontWeight: 600, fontSize: '0.95rem' }}>{Math.round(metrics[x.k])}</span></div>
                    <div role="progressbar" aria-valuenow={Math.round(metrics[x.k])} aria-valuemin="0" aria-valuemax="100" aria-label={`${x.l}: ${Math.round(metrics[x.k])} percent`} style={{ height: 4, background: `${COLORS.white}10`, borderRadius: 2 }}><div style={{ width: `${metrics[x.k]}%`, height: '100%', background: getMetricColor(metrics[x.k]), borderRadius: 2 }} /></div>
                  </div>
                ))}
                <div ref={loadRef} style={{ marginTop: 8, padding: 10, background: metrics.emotionalLoad > 60 ? `${COLORS.yellow}15` : `${COLORS.black}30`, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ color: `${COLORS.white}cc`, fontSize: '0.8rem' }}><span aria-hidden="true">🧠</span> Your Load</span><span style={{ color: metrics.emotionalLoad > 60 ? COLORS.yellow : COLORS.teal, fontWeight: 600, fontSize: '0.95rem' }}>{Math.round(metrics.emotionalLoad)}%</span></div>
                  <div role="progressbar" aria-valuenow={Math.round(metrics.emotionalLoad)} aria-valuemin="0" aria-valuemax="100" aria-label={`Your load: ${Math.round(metrics.emotionalLoad)} percent`} style={{ height: 4, background: `${COLORS.white}10`, borderRadius: 2 }}><div style={{ width: `${metrics.emotionalLoad}%`, height: '100%', background: metrics.emotionalLoad > 60 ? COLORS.yellow : COLORS.teal, borderRadius: 2 }} /></div>
                </div>
              </section>
              <section ref={investmentsRef} className="investments-section" aria-labelledby="investments-heading" style={{ background: `linear-gradient(180deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, padding: 14, border: `1px solid ${COLORS.white}10`, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <h2 id="investments-heading" style={{ fontSize: '0.75rem', color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>Investments</h2>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {renderInvestments()}
                </div>
              </section>
            </aside>
            {/* Middle column - event and observations */}
            <div className="middle-column">
              {guidedPhase === 'plan' ? (
                <div style={{
                  background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`,
                  borderRadius: 14,
                  padding: 35,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${COLORS.purple}30`,
                  textAlign: 'center',
                }}>
                  <div aria-hidden="true" style={{ fontSize: '3rem', marginBottom: 15, opacity: 0.6 }}>🧭</div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: COLORS.white, margin: '0 0 10px 0' }}>
                    Reviewing the Situation
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: `${COLORS.white}80`, maxWidth: 360, lineHeight: 1.6, marginBottom: 20 }}>
                    {isMobile
                      ? 'Review the Quarter Guide above, then tap "Ready to Start" when you\'re ready.'
                      : 'Review the situation in the Quarter Guide, then click "Ready to Start" when you\'re ready to begin.'}
                  </p>
                  {!isMobile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: COLORS.purple, fontSize: '0.85rem', fontWeight: 600 }}>
                      <span className="guided-arrow-hint" aria-hidden="true" style={{ fontSize: '1.2rem' }}>←</span>
                      <span>Start in the Quarter Guide</span>
                    </div>
                  )}
                </div>
              ) : event && !done ? (() => {
                const totalCost = calculateInvestmentCost(inv);
                const canAfford = totalCost <= budget.current;
                const totalTime = TIME_INVESTMENTS.reduce((sum, x) => sum + inv[x.id], 0);
                const timeValid = totalTime <= 100;
                const canConfirm = canAfford && timeValid;

                return (
                  <article ref={eventRef} aria-labelledby="event-title" className="event-panel" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, display: 'flex', flexDirection: 'column', border: `1px solid ${COLORS.purple}30` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ background: `${COLORS.purple}30`, padding: '4px 10px', borderRadius: 12, fontSize: '0.65rem', color: COLORS.purple, fontWeight: 600, textTransform: 'uppercase' }}>{event.category}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: `${COLORS.white}99`, fontSize: '0.75rem' }}><span aria-hidden="true">{getDeliveryIcon(event.delivery)}</span><span style={{ textTransform: 'capitalize' }}>via {event.delivery.replace('_', ' ')}</span></span>
                  </div>
                  <h2 id="event-title" className="event-title" style={{ color: COLORS.white }}>{event.title}</h2>
                  <p style={{ fontSize: '0.95rem', color: `${COLORS.white}cc`, lineHeight: 1.6, marginBottom: 12 }}>{event.description}</p>
                  {event.character && <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '6px 10px', background: `${COLORS.black}40`, borderRadius: 8, width: 'fit-content' }}><span aria-hidden="true" style={{ fontSize: '1.2rem' }}>{chars.find(c => c.id === event.character)?.avatar}</span><span style={{ color: `${COLORS.white}cc`, fontSize: '0.8rem' }}>Involves: <strong style={{ color: COLORS.white }}>{chars.find(c => c.id === event.character)?.name}</strong></span></div>}
                  <fieldset style={{ border: 'none', margin: 0, padding: 0, marginTop: 'auto' }}>
                    <legend style={{ fontSize: '0.85rem', color: COLORS.purple, marginBottom: 8, fontWeight: 600, animation: selectedOption === null ? 'pulseText 2s ease-in-out infinite' : 'none' }}>
                      Choose your response:
                    </legend>
                    <div ref={optionsRef} role="radiogroup" aria-label="Decision options" className="options-grid">{event.options.map((o, i) => (
                      <button
                        key={`option-${event.id}-${i}`}
                        onClick={() => { playSound('select'); setSelectedOption(i); }}
                        aria-pressed={selectedOption === i}
                        className="option-btn"
                        onFocus={e => { if (selectedOption !== i) { e.target.style.borderColor = COLORS.purple + '80'; e.target.style.background = `${COLORS.purple}20`; }}}
                        onBlur={e => { if (selectedOption !== i) { e.target.style.borderColor = `${COLORS.white}15`; e.target.style.background = `${COLORS.black}50`; }}}
                        onMouseOver={e => { if (selectedOption !== i) { e.target.style.borderColor = COLORS.purple + '80'; e.target.style.background = `${COLORS.purple}20`; }}}
                        onMouseOut={e => { if (selectedOption !== i) { e.target.style.borderColor = `${COLORS.white}15`; e.target.style.background = `${COLORS.black}50`; }}}
                        style={{ background: selectedOption === i ? `${COLORS.purple}40` : `${COLORS.black}50`, border: selectedOption === i ? `2px solid ${COLORS.purple}` : `2px dashed ${COLORS.white}15`, borderRadius: 10, color: COLORS.white, fontFamily: "'Poppins', sans-serif", cursor: 'pointer', transition: 'all 0.2s ease-out' }}
                      >{o.text}</button>
                    ))}</div>
                  </fieldset>
                  <button
                    onClick={() => { playSound('confirm'); decide(); }}
                    disabled={selectedOption === null || !canConfirm}
                    aria-disabled={selectedOption === null || !canConfirm}
                    className="confirm-btn"
                    style={{
                      background: selectedOption !== null && canConfirm ? COLORS.purple : `${COLORS.white}20`,
                      border: 'none',
                      borderRadius: 25,
                      color: selectedOption !== null && canConfirm ? COLORS.white : `${COLORS.white}70`,
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      cursor: selectedOption !== null && canConfirm ? 'pointer' : 'not-allowed',
                      textTransform: 'uppercase',
                      transition: 'background 0.2s ease-out',
                      opacity: selectedOption !== null && canConfirm ? 1 : 0.7
                    }}
                  >
                    {selectedOption === null
                      ? 'Select an option above'
                      : !canAfford
                        ? 'Reduce investments - over budget'
                        : !timeValid
                          ? 'Reduce time - over 100%'
                          : 'Confirm Decision'}
                  </button>
                  <div aria-label={`Progress: ${handled} of ${events.length + handled} events completed`} style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 5 }}>{[...Array(events.length + handled)].map((_, i) => (<div key={`progress-${i}`} aria-hidden="true" style={{ width: i < handled ? 22 : 7, height: 3, borderRadius: 2, background: i < handled ? COLORS.teal : i === handled ? COLORS.purple : `${COLORS.white}20` }} />))}</div>
                </article>
                );
              })() : done ? (
                <section aria-label="Quarter complete" style={{ background: `linear-gradient(135deg, ${COLORS.darkTeal}50 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, padding: 35, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${COLORS.teal}30`, textAlign: 'center' }}>
                  <div aria-hidden="true" style={{ fontSize: '3.5rem', marginBottom: 15 }}>✓</div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: COLORS.white, margin: '0 0 12px 0' }}>Quarter {round} Complete</h2>
                  <p style={{ fontSize: '0.95rem', color: `${COLORS.white}cc`, marginBottom: 20, maxWidth: 320 }}>You handled {handled + 1} situations this quarter.</p>
                  <p style={{ fontSize: '0.85rem', color: `${COLORS.white}80`, maxWidth: 300, lineHeight: 1.5 }}>
                    {isMobile ? 'Review your results in the Quarter Guide above.' : 'Review your results in the Quarter Guide.'}
                  </p>
                </section>
              ) : null}
              <section ref={observationsRef} aria-labelledby="observations-heading" aria-live="polite" className="observations-panel" style={{ background: `linear-gradient(180deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, padding: 16, border: `1px solid ${COLORS.white}10`, display: 'flex', flexDirection: 'column' }}>
                <h2 id="observations-heading" style={{ fontSize: '0.75rem', color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>Observations</h2>
                <div role="log" aria-label="Team observations" style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {notes.length ? notes.map((n, i) => (
                    <div
                      key={`note-${i}-${n.text.slice(0,10)}`}
                      className={`observation-item ${animatedObservations.includes(i) ? 'animate' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 12px',
                        background: `${COLORS.black}40`,
                        borderRadius: 8,
                        borderLeft: `3px solid ${COLORS.purple}40`,
                      }}
                    >
                      <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>{n.icon}</span>
                      <span style={{ color: `${COLORS.white}cc`, fontSize: '0.9rem', lineHeight: 1.5 }}>{n.text}</span>
                    </div>
                  )) : <div style={{ color: `${COLORS.white}99`, fontSize: '0.9rem', fontStyle: 'italic', padding: '10px 0' }}>The office hums along...</div>}
                </div>
              </section>
            </div>
            {/* Team sidebar - horizontal scroll on mobile, vertical on desktop */}
            <aside ref={teamRef} aria-labelledby="team-sidebar-heading" className="hide-mobile" style={{ background: `linear-gradient(180deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, padding: 14, border: `1px solid ${COLORS.white}10`, overflow: 'auto' }}>
              <h2 id="team-sidebar-heading" style={{ fontSize: '0.75rem', color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>Your Team</h2>
              <div role="list" aria-label="Team members" className="team-sidebar">
              {chars.map(c => (
                <article key={c.id} role="listitem" aria-label={`${c.name}, ${c.role}${c.departed ? ', departed' : c.atRisk ? ', at risk' : ''}`} style={{ background: `${COLORS.black}40`, padding: 10, borderRadius: 10, borderLeft: `3px solid ${c.atRisk ? COLORS.yellow : c.engagement < 50 ? '#ff4757' : COLORS.teal}`, opacity: c.departed ? 0.5 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span aria-hidden="true" style={{ fontSize: '1.6rem' }}>{c.avatar}</span>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: COLORS.white, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>{c.name}{c.departed ? <span aria-label="Departed indicator" style={{ background: `${COLORS.white}20`, color: `${COLORS.white}70`, padding: '2px 5px', borderRadius: 6, fontSize: '0.55rem', fontWeight: 600 }}>DEPARTED</span> : c.atRisk ? <span aria-label="At risk indicator" style={{ background: `${COLORS.yellow}30`, color: COLORS.yellow, padding: '2px 5px', borderRadius: 6, fontSize: '0.55rem', fontWeight: 600 }}>RISK</span> : null}</div><div style={{ fontSize: '0.75rem', color: `${COLORS.white}cc` }}>{c.role}</div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div><div id={`trust-${c.id}`} style={{ fontSize: '0.65rem', color: `${COLORS.white}cc`, marginBottom: 2 }}>Trust</div><div role="progressbar" aria-valuenow={Math.round(c.trust)} aria-valuemin="0" aria-valuemax="100" aria-labelledby={`trust-${c.id}`} style={{ height: 3, background: `${COLORS.white}10`, borderRadius: 2 }}><div style={{ width: `${c.trust}%`, height: '100%', background: COLORS.purple, borderRadius: 2 }} /></div></div>
                    <div><div id={`engagement-${c.id}`} style={{ fontSize: '0.65rem', color: `${COLORS.white}cc`, marginBottom: 2 }}>Engagement</div><div role="progressbar" aria-valuenow={Math.round(c.engagement)} aria-valuemin="0" aria-valuemax="100" aria-labelledby={`engagement-${c.id}`} style={{ height: 3, background: `${COLORS.white}10`, borderRadius: 2 }}><div style={{ width: `${c.engagement}%`, height: '100%', background: COLORS.teal, borderRadius: 2 }} /></div></div>
                  </div>
                </article>
              ))}
              </div>
            </aside>
          </div>
        )}
        {tab === 'insights' && (
          <div role="tabpanel" id="insights-panel" aria-label="Insights view" className="insights-grid" style={{ flex: 1 }}>
            <section aria-labelledby="trust-chart-heading" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 16, padding: 20, border: `1px solid ${COLORS.white}10` }}><h2 id="trust-chart-heading" style={{ fontSize: '0.75rem', color: COLORS.purple, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>Trust & Engagement</h2><ResponsiveContainer width="100%" height="85%"><LineChart data={history} aria-label="Line chart showing trust and engagement over quarters"><XAxis dataKey="round" stroke={`${COLORS.white}50`} tick={{ fill: `${COLORS.white}99`, fontSize: 11 }} /><YAxis domain={[0, 100]} stroke={`${COLORS.white}50`} tick={{ fill: `${COLORS.white}99`, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.greyDark, border: `1px solid ${COLORS.white}20`, borderRadius: 8, color: COLORS.white }} /><Line type="monotone" dataKey="trust" stroke={COLORS.purple} strokeWidth={2} dot={{ fill: COLORS.purple, r: 4 }} name="Trust" /><Line type="monotone" dataKey="engagement" stroke={COLORS.teal} strokeWidth={2} dot={{ fill: COLORS.teal, r: 4 }} name="Engagement" /></LineChart></ResponsiveContainer></section>
            <section aria-labelledby="perf-chart-heading" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 16, padding: 20, border: `1px solid ${COLORS.white}10` }}><h2 id="perf-chart-heading" style={{ fontSize: '0.75rem', color: COLORS.yellow, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>Performance & Fairness</h2><ResponsiveContainer width="100%" height="85%"><LineChart data={history} aria-label="Line chart showing performance and fairness over quarters"><XAxis dataKey="round" stroke={`${COLORS.white}50`} tick={{ fill: `${COLORS.white}99`, fontSize: 11 }} /><YAxis domain={[0, 100]} stroke={`${COLORS.white}50`} tick={{ fill: `${COLORS.white}99`, fontSize: 11 }} /><Tooltip contentStyle={{ background: COLORS.greyDark, border: `1px solid ${COLORS.white}20`, borderRadius: 8, color: COLORS.white }} /><Line type="monotone" dataKey="performance" stroke={COLORS.yellow} strokeWidth={2} dot={{ fill: COLORS.yellow, r: 4 }} name="Performance" /><Line type="monotone" dataKey="fairness" stroke={COLORS.blue} strokeWidth={2} dot={{ fill: COLORS.blue, r: 4 }} name="Fairness" /></LineChart></ResponsiveContainer></section>
            <section aria-labelledby="profile-chart-heading" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 16, padding: 20, border: `1px solid ${COLORS.white}10` }}><h2 id="profile-chart-heading" style={{ fontSize: '0.75rem', color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>Profile</h2><ResponsiveContainer width="100%" height="85%"><RadarChart data={radar} aria-label="Radar chart showing your leadership profile across all metrics"><PolarGrid stroke={`${COLORS.white}20`} /><PolarAngleAxis dataKey="metric" tick={{ fill: `${COLORS.white}99`, fontSize: 10 }} /><PolarRadiusAxis domain={[0, 100]} tick={{ fill: `${COLORS.white}70`, fontSize: 9 }} axisLine={false} /><Radar dataKey="value" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.3} strokeWidth={2} name="Score" /></RadarChart></ResponsiveContainer></section>
            <section aria-labelledby="decisions-list-heading" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 16, padding: 20, border: `1px solid ${COLORS.white}10`, overflow: 'auto' }}><h2 id="decisions-list-heading" style={{ fontSize: '0.75rem', color: COLORS.blue, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>Decisions ({decisions.length})</h2><div role="list" aria-label="Your decisions this game" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{decisions.length ? decisions.slice().reverse().map((d) => (<div key={d.eventId} role="listitem" style={{ background: `${COLORS.black}40`, padding: '10px 12px', borderRadius: 8, borderLeft: `3px solid ${COLORS.purple}` }}><div style={{ fontSize: '0.7rem', color: COLORS.purple, marginBottom: 3 }}>Q{d.round}: {d.eventTitle}</div><div style={{ fontSize: '0.85rem', color: `${COLORS.white}cc` }}>{d.choice}</div></div>)) : <div style={{ color: `${COLORS.white}70`, textAlign: 'center', padding: 30 }}>No decisions yet</div>}</div></section>
          </div>
        )}
        {tab === 'team' && (
          <div role="tabpanel" id="team-panel" aria-label="Team view" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Team Capacity Widget */}
            <section aria-labelledby="team-capacity-heading" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 16, padding: 20, border: `1px solid ${COLORS.white}10` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                <div>
                  <h2 id="team-capacity-heading" style={{ fontSize: '0.75rem', color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontWeight: 600 }}>👥 Team Capacity</h2>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{
                      fontSize: '3rem', fontWeight: 700,
                      color: teamCapacity >= 4 ? COLORS.teal : COLORS.yellow
                    }}>{teamCapacity}</span>
                    <span style={{ fontSize: '1.2rem', color: `${COLORS.white}70` }}>/ 5 members</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: `${COLORS.white}cc` }}>
                    {teamCapacity === 5 ? 'Full team capacity' :
                     teamCapacity >= 4 ? 'Slightly reduced capacity' : 'Significantly understaffed'}
                  </div>
                </div>
                {teamCapacity > 0 && (
                  <div style={{ background: `${COLORS.black}40`, padding: 16, borderRadius: 12, minWidth: 180 }}>
                    <div style={{ fontSize: '0.7rem', color: `${COLORS.white}99`, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Average Workload</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{
                        fontSize: '2.5rem', fontWeight: 700,
                        color: chars.filter(c => !c.departed)[0]?.loadPercent > 120 ? '#ff4757' :
                               chars.filter(c => !c.departed)[0]?.loadPercent > 100 ? COLORS.yellow : COLORS.teal
                      }}>
                        {Math.round(chars.filter(c => !c.departed)[0]?.loadPercent || 100)}
                      </span>
                      <span style={{ fontSize: '1.2rem', color: `${COLORS.white}70` }}>%</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: `${COLORS.white}99`, marginTop: 4 }}>
                      {chars.filter(c => !c.departed)[0]?.loadPercent > 140 ? '🔥 Critical burnout risk' :
                       chars.filter(c => !c.departed)[0]?.loadPercent > 120 ? '⚠️ Team overloaded' :
                       chars.filter(c => !c.departed)[0]?.loadPercent > 100 ? '⚡ Above capacity' : '✓ Sustainable load'}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Team Members Grid */}
            <div className="team-grid" style={{ display: 'grid', gap: 16 }}>
            {chars.map(c => (
              <article key={c.id} aria-label={`${c.name} - ${c.role}`} style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 16, padding: 20, border: `1px solid ${c.atRisk ? COLORS.yellow : COLORS.white}20`, display: 'flex', flexDirection: 'column', opacity: c.departed ? 0.5 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 15 }}><div aria-hidden="true" style={{ fontSize: '3rem', background: `${COLORS.black}50`, borderRadius: '50%', width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.avatar}</div><div><h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: COLORS.white, display: 'flex', alignItems: 'center', gap: 8 }}>{c.name}{c.departed ? <span aria-label="Departed" style={{ background: `${COLORS.white}20`, color: `${COLORS.white}70`, padding: '3px 8px', borderRadius: 10, fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>DEPARTED</span> : c.atRisk ? <span aria-label="At risk" style={{ background: `${COLORS.yellow}20`, color: COLORS.yellow, padding: '3px 8px', borderRadius: 10, fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase' }}>RISK</span> : null}</h3><p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: `${COLORS.white}99` }}>{c.role}</p><p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: `${COLORS.white}70` }}>{c.tenure}</p></div></div>
                <div role="list" aria-label="Traits" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>{c.traits.map((t) => (<span key={t} role="listitem" style={{ background: `${COLORS.purple}20`, color: COLORS.purple, padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem' }}>{t}</span>))}</div>
                {!c.departed && c.loadPercent > 100 && (
                  <div style={{
                    background: c.loadPercent > 140 ? `${COLORS.yellow}20` : `rgba(255, 165, 0, 0.2)`,
                    borderLeft: `4px solid ${c.loadPercent > 140 ? '#ff4757' : c.loadPercent > 120 ? 'orange' : COLORS.yellow}`,
                    padding: 10, borderRadius: 8, marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: COLORS.white, fontWeight: 600, textTransform: 'uppercase' }}>
                        {c.loadPercent > 140 ? '🔥 BURNOUT RISK' : c.loadPercent > 120 ? '⚠️ OVERLOADED' : '⚡ STRETCHED'}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: COLORS.white, fontWeight: 700 }}>
                        {Math.round(c.loadPercent)}%
                      </span>
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}><div aria-label={`Trust: ${Math.round(c.trust)}`} style={{ background: `${COLORS.black}40`, padding: 10, borderRadius: 8 }}><div style={{ fontSize: '0.65rem', color: `${COLORS.white}99`, marginBottom: 4 }}>Trust</div><div style={{ fontSize: '1.4rem', fontWeight: 700, color: getMetricColor(c.trust) }}>{Math.round(c.trust)}</div></div><div aria-label={`Engagement: ${Math.round(c.engagement)}`} style={{ background: `${COLORS.black}40`, padding: 10, borderRadius: 8 }}><div style={{ fontSize: '0.65rem', color: `${COLORS.white}99`, marginBottom: 4 }}>Engagement</div><div style={{ fontSize: '1.4rem', fontWeight: 700, color: getMetricColor(c.engagement) }}>{Math.round(c.engagement)}</div></div></div>
                <div style={{ background: `${COLORS.black}40`, padding: 10, borderRadius: 8, marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span id={`perf-label-${c.id}`} style={{ fontSize: '0.7rem', color: `${COLORS.white}99` }}>Performance</span><span style={{ fontSize: '0.8rem', color: COLORS.white, fontWeight: 600 }}>{c.performance}%</span></div><div role="progressbar" aria-valuenow={c.performance} aria-valuemin="0" aria-valuemax="100" aria-labelledby={`perf-label-${c.id}`} style={{ height: 5, background: `${COLORS.white}10`, borderRadius: 3 }}><div style={{ width: `${c.performance}%`, height: '100%', background: COLORS.teal, borderRadius: 3 }} /></div></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: '0.7rem', color: `${COLORS.white}70`, marginBottom: 4 }}>Drivers</div><p style={{ fontSize: '0.8rem', color: `${COLORS.white}cc`, lineHeight: 1.4, margin: '0 0 8px 0' }}>{c.drivers}</p><div style={{ fontSize: '0.7rem', color: `${COLORS.white}70`, marginBottom: 4 }}>Sensitivity</div><p style={{ fontSize: '0.8rem', color: `${COLORS.white}cc`, lineHeight: 1.4, margin: 0 }}>{c.sensitivity}</p></div>
              </article>
            ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile bottom navigation */}
      <nav className="mobile-bottom-nav" role="tablist" aria-label="Mobile navigation">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'insights', label: 'Insights', icon: '📈' },
          { id: 'team', label: 'Team', icon: '👥' }
        ].map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`${t.id}-panel`}
            onClick={() => setTab(t.id)}
            className={`mobile-nav-btn ${tab === t.id ? 'active' : ''}`}
          >
            <span aria-hidden="true">{t.icon}</span>
            {t.label}
          </button>
        ))}
        <button
          onClick={() => { playSound('confirm'); setShowTutorial(true); setTutorialStep(0); setTab('dashboard'); }}
          className="mobile-nav-btn"
          aria-label="Show tutorial"
        >
          <span aria-hidden="true">?</span>
          Help
        </button>
        <button
          onClick={reset}
          className="mobile-nav-btn"
          aria-label="Reset simulation"
        >
          <span aria-hidden="true">↺</span>
          Reset
        </button>
      </nav>

      {/* Tutorial Overlay */}
      {showTutorial && phase === 'playing' && tab === 'dashboard' && (
        isMobile ? <MobileTutorialOverlay /> : <TutorialOverlay />
      )}
    </div>
  );
}
