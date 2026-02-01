import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';

const COLORS = {
  purple: '#BB29BB', teal: '#2CD5C4', blue: '#05C3DE', yellow: '#F7EA48',
  darkPurple: '#3C1053', darkTeal: '#003E51', darkBlue: '#141B4D',
  black: '#000000', white: '#FFFFFF', grey: '#1a1a2e', greyLight: '#2d2d44', greyDark: '#0f0f1a',
};

const BUDGET_INVESTMENTS = [
  { id: 'training', label: 'Training', icon: '📚', effects: { engagement: 0.08, performance: 0.06, credibility: 0.04 } },
  { id: 'teamBuilding', label: 'Team Activities', icon: '🎯', effects: { trust: 0.1, engagement: 0.06, fairness: 0.04 } },
  { id: 'tools', label: 'Tools', icon: '🛠️', effects: { performance: 0.08, engagement: 0.04, retention: 0.06 } },
  { id: 'recognition', label: 'Recognition', icon: '🏆', effects: { trust: 0.06, engagement: 0.08, fairness: 0.06 } },
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
  { id: 'oneOnOnes', label: '1:1s', icon: '💬', effects: { trust: 0.1, credibility: 0.08, fairness: 0.04 }, loadEffect: 0.15 },
  { id: 'coaching', label: 'Coaching', icon: '🎓', effects: { performance: 0.06, engagement: 0.06, credibility: 0.06 }, loadEffect: 0.2 },
  { id: 'strategy', label: 'Strategy', icon: '📊', effects: { performance: 0.08, credibility: 0.08 }, loadEffect: 0.08 },
  { id: 'selfCare', label: 'Your Wellbeing', icon: '🧘', effects: { credibility: 0.04 }, loadEffect: -0.5 },
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
};

const INITIAL_CHARACTERS = [
  { id: 'dave', name: 'Dave Chen', role: 'Senior Developer', tenure: '4 years', performance: 92, avatar: '👨‍💻', traits: ['High performer', 'Abrasive', 'Politically influential'], drivers: 'Recognition, autonomy, being the expert', sensitivity: 'Low emotional sensitivity, high ego', trust: 70, engagement: 75, atRisk: false },
  { id: 'aisha', name: 'Aisha Patel', role: 'Product Manager', tenure: '3 years', performance: 78, avatar: '👩‍💼', traits: ['Solid performer', 'Overlooked', 'Values fairness'], drivers: 'Equity, growth opportunities, being heard', sensitivity: 'High sensitivity to perceived unfairness', trust: 65, engagement: 60, atRisk: true },
  { id: 'tom', name: 'Tom Williams', role: 'Marketing Lead', tenure: '2 years', performance: 55, avatar: '👨‍🎨', traits: ['Likeable', 'Underperforming', 'Personal issues'], drivers: 'Work-life balance, team connection, stability', sensitivity: 'Going through divorce, emotionally fragile', trust: 80, engagement: 45, atRisk: false },
  { id: 'sarah', name: 'Sarah Kim', role: 'Data Analyst', tenure: '1 year', performance: 85, avatar: '👩‍🔬', traits: ['Quiet', 'High potential', 'Conflict-avoidant'], drivers: 'Learning, mentorship, psychological safety', sensitivity: 'Withdraws under pressure, needs encouragement', trust: 75, engagement: 70, atRisk: false },
  { id: 'liam', name: "Liam O'Brien", role: 'Junior Developer', tenure: '3 months', performance: 68, avatar: '👨‍🎓', traits: ['New hire', 'Eager', 'Uncertain expectations'], drivers: 'Clarity, feedback, proving himself', sensitivity: 'Highly impressionable, watching everything', trust: 60, engagement: 85, atRisk: false },
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
    .animate-pulse { animation: pulse 4s ease-in-out infinite; }
    .animate-fade { animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
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
  }
  @media (min-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr 1fr;
      overflow: hidden;
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
  }
  @media (min-width: 768px) {
    .results-grid {
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      padding: 30px 40px;
      overflow: hidden;
    }
  }

  /* Insights grid - 2x2 on desktop, 1 column on mobile */
  .insights-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px;
    overflow: auto;
  }
  @media (min-width: 768px) {
    .insights-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      overflow: hidden;
    }
  }

  /* Team grid - 3 columns on desktop, 2 on tablet, 1 on mobile */
  .team-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 15px;
    overflow: auto;
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

    if (n.length < 2 && Math.random() > 0.5) {
      const g = NOTIFICATIONS.general[Math.floor(Math.random() * NOTIFICATIONS.general.length)];
      n.push({ text: g.text, icon: g.icon });
    }
    return n.slice(0, 3);
  };

  // Only regenerate notes when a new event is shown (handled changes) or round starts
  useEffect(() => { if (phase === 'playing') setNotes(genNotes(chars, metrics, inv, budget)); }, [phase, handled]);

  const pickEvents = useCallback(() => {
    const num = round === 1 ? 2 : round === 4 ? 4 : 3;
    const used = decisions.map(d => d.eventId);
    return [...ALL_EVENTS.filter(e => !used.includes(e.id))].sort(() => Math.random() - 0.5).slice(0, num);
  }, [round, decisions]);

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

  const start = () => {
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
    const e = pickEvents();
    setEvents(e);
    setEvent(e[0] || null);
  };

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
    setDecisions([...decisions, { round, eventId: event.id, eventTitle: event.title, choice: opt.text }]);
    setMetrics(m);
    setSelectedOption(null);
    const rem = events.filter(e => e.id !== event.id);
    if (rem.length) { setEvents(rem); setEvent(rem[0]); setHandled(handled + 1); }
    else { setEvents([]); setEvent(null); setDone(true); }
  };

  const endRound = () => {
    setHistory([...history, { round, ...metrics }]);
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
    setSelectedOption(null);
    setBudget({ current: 5000, lastAllocation: 0, totalReceived: 5000 });
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
          <img src="/jam-pan-logo.png" alt="Jam Pan - Leadership Development" className="intro-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          <h1 className="intro-title" style={{ color: COLORS.white }}>Under <span style={{ color: COLORS.purple }}>Pressure</span></h1>
          <p className="intro-subtitle" style={{ color: COLORS.teal }}>The People Management Simulation</p>
          <p className="intro-description" style={{ color: `${COLORS.white}cc`, fontWeight: 300 }}>Lead a team through realistic challenges. Allocate your time and budget, then navigate difficult situations where your investments shape the outcomes.</p>
          <div role="list" aria-label="Game statistics" className="stats-grid" style={{ marginTop: 32 }}>
            {[{ label: 'Quarters', value: '4', icon: '🎯' }, { label: 'Metrics', value: '7', icon: '📊' }, { label: 'Events', value: '50+', icon: '⚡' }].map((x) => (
              <div key={x.label} role="listitem" style={{ textAlign: 'center' }}><div aria-hidden="true" style={{ fontSize: '1.75rem' }}>{x.icon}</div><div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 700, color: COLORS.yellow }}>{x.value}</div><div style={{ fontSize: '0.8rem', color: `${COLORS.white}cc`, textTransform: 'uppercase', letterSpacing: 1 }}>{x.label}</div></div>
            ))}
          </div>
          <button onClick={start} aria-label="Begin the simulation" className="intro-cta" style={{ fontWeight: 600, fontFamily: "'Poppins', sans-serif", background: COLORS.purple, color: COLORS.white, border: 'none', borderRadius: 50, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 2, boxShadow: `0 10px 40px ${COLORS.purple}40`, minHeight: 56 }}>Begin Simulation</button>
          <p style={{ marginTop: 24, fontSize: '0.8rem', color: `${COLORS.white}99` }}>Demo Version • Single Player • 4 Quarters</p>
        </div>
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

  if (phase === 'results') {
    const p = profile();
    const f = history[history.length - 1] || metrics;
    return (
      <div role="main" aria-label="Simulation Results" style={{ width: '100vw', minHeight: '100vh', background: `linear-gradient(135deg, ${COLORS.black} 0%, ${COLORS.darkPurple} 100%)`, fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <style>{styles}</style>
        <a href="#results-content" className="skip-link">Skip to results</a>
        <header style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.white}10`, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/jam-pan-logo.png" alt="Jam Pan" style={{ height: 28 }} onError={(e) => { e.target.style.display = 'none'; }} />
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

    return (
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
            <div key={x.id} style={{ marginBottom: 8, opacity: disabled ? 0.5 : 1 }}>
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
                type="range"
                min="0"
                max="100"
                step="10"
                value={inv[x.id]}
                onChange={e => setInv({ ...inv, [x.id]: +e.target.value })}
                disabled={disabled}
                aria-label={`${x.label} investment: ${inv[x.id]} percent, costs £${cost}`}
              />
            </div>
          );
        })}
      <div style={{ fontSize: '0.7rem', color: `${COLORS.white}cc`, marginTop: 12, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${COLORS.white}10`, fontWeight: 500 }}>TIME</div>
      {TIME_INVESTMENTS.map(x => (
        <div key={x.id} style={{ marginBottom: 8 }}>
          <label htmlFor={`slider-${x.id}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ color: `${COLORS.white}cc`, fontSize: '0.75rem' }}><span aria-hidden="true">{x.icon}</span> {x.label}</span><span style={{ color: inv[x.id] ? COLORS.blue : `${COLORS.white}99`, fontWeight: 600, fontSize: '0.85rem' }}>{inv[x.id]}%</span></label>
          <input id={`slider-${x.id}`} type="range" min="0" max="100" step="10" value={inv[x.id]} onChange={e => setInv({ ...inv, [x.id]: +e.target.value })} aria-label={`${x.label} investment: ${inv[x.id]} percent`} />
        </div>
      ))}
      </>
    );
  };

  return (
    <div role="main" aria-label={`Under Pressure - Quarter ${round} of 4`} style={{ width: '100vw', minHeight: '100vh', background: COLORS.black, fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{styles}</style>
      <a href="#game-content" className="skip-link">Skip to game content</a>

      {/* Responsive Header */}
      <header className="game-header" style={{ background: `linear-gradient(90deg, ${COLORS.greyDark} 0%, ${COLORS.grey} 100%)`, borderBottom: `1px solid ${COLORS.white}10` }}>
        <div className="header-brand">
          <img src="/jam-pan-logo.png" alt="Jam Pan" style={{ height: 24 }} onError={(e) => { e.target.style.display = 'none'; }} />
          <span className="brand-text" style={{ fontSize: '1rem', fontWeight: 700, color: COLORS.white }}>UNDER <span style={{ color: COLORS.purple }}>PRESSURE</span></span>
          <div aria-label={`Quarter ${round} of 4`} style={{ background: `${COLORS.purple}30`, padding: '4px 12px', borderRadius: 15, fontSize: '0.75rem', color: COLORS.purple, fontWeight: 600 }}>Q{round}/4</div>
          <div aria-label={`Budget: £${budget.current.toLocaleString()}`} style={{ background: `${COLORS.teal}30`, padding: '4px 12px', borderRadius: 15, fontSize: '0.75rem', color: COLORS.teal, fontWeight: 600 }}>
            💰 £{budget.current.toLocaleString()}
          </div>
        </div>

        {/* Desktop navigation - hidden on mobile */}
        <nav role="tablist" aria-label="View selection" className="header-nav hide-mobile">{['dashboard', 'insights', 'team'].map(t => (<button key={t} role="tab" aria-selected={tab === t} aria-controls={`${t}-panel`} onClick={() => setTab(t)} className="nav-tab" style={{ padding: '8px 16px', background: tab === t ? COLORS.purple : 'transparent', border: 'none', borderRadius: 12, color: tab === t ? COLORS.white : `${COLORS.white}cc`, fontFamily: "'Poppins', sans-serif", fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1, minHeight: 40 }}>{t}</button>))}</nav>

        <div className="header-actions hide-mobile">
          <button onClick={reset} aria-label="Reset simulation" className="reset-btn" style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${COLORS.white}50`, color: `${COLORS.white}cc`, borderRadius: 10, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontSize: '0.75rem', minHeight: 40 }}>Reset</button>
        </div>
      </header>

      <div id="game-content" className="game-content" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
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
            <aside className="hide-mobile" style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}>
              <section aria-labelledby="metrics-heading" aria-live="polite" style={{ background: `linear-gradient(180deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, padding: 14, border: `1px solid ${COLORS.white}10` }}>
                <h2 id="metrics-heading" style={{ fontSize: '0.75rem', color: COLORS.purple, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>Metrics</h2>
                {[{ k: 'trust', l: 'Trust', i: '🤝' }, { k: 'engagement', l: 'Engagement', i: '⚡' }, { k: 'performance', l: 'Performance', i: '📈' }, { k: 'fairness', l: 'Fairness', i: '⚖️' }, { k: 'credibility', l: 'Credibility', i: '🎯' }].map(x => (
                  <div key={x.k} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ color: `${COLORS.white}cc`, fontSize: '0.8rem' }}><span aria-hidden="true">{x.i}</span> {x.l}</span><span style={{ color: getMetricColor(metrics[x.k]), fontWeight: 600, fontSize: '0.95rem' }}>{Math.round(metrics[x.k])}</span></div>
                    <div role="progressbar" aria-valuenow={Math.round(metrics[x.k])} aria-valuemin="0" aria-valuemax="100" aria-label={`${x.l}: ${Math.round(metrics[x.k])} percent`} style={{ height: 4, background: `${COLORS.white}10`, borderRadius: 2 }}><div style={{ width: `${metrics[x.k]}%`, height: '100%', background: getMetricColor(metrics[x.k]), borderRadius: 2 }} /></div>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: 10, background: metrics.emotionalLoad > 60 ? `${COLORS.yellow}15` : `${COLORS.black}30`, borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span style={{ color: `${COLORS.white}cc`, fontSize: '0.8rem' }}><span aria-hidden="true">🧠</span> Your Load</span><span style={{ color: metrics.emotionalLoad > 60 ? COLORS.yellow : COLORS.teal, fontWeight: 600, fontSize: '0.95rem' }}>{Math.round(metrics.emotionalLoad)}%</span></div>
                  <div role="progressbar" aria-valuenow={Math.round(metrics.emotionalLoad)} aria-valuemin="0" aria-valuemax="100" aria-label={`Your load: ${Math.round(metrics.emotionalLoad)} percent`} style={{ height: 4, background: `${COLORS.white}10`, borderRadius: 2 }}><div style={{ width: `${metrics.emotionalLoad}%`, height: '100%', background: metrics.emotionalLoad > 60 ? COLORS.yellow : COLORS.teal, borderRadius: 2 }} /></div>
                </div>
              </section>
              <section className="investments-section" aria-labelledby="investments-heading" style={{ background: `linear-gradient(180deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, padding: 14, border: `1px solid ${COLORS.white}10`, flex: 1 }}>
                <h2 id="investments-heading" style={{ fontSize: '0.75rem', color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>Investments</h2>
                {renderInvestments()}
              </section>
            </aside>
            {/* Middle column - event and observations */}
            <div className="middle-column">
              {event && !done ? (() => {
                const totalCost = calculateInvestmentCost(inv);
                const canAfford = totalCost <= budget.current;

                return (
                  <article aria-labelledby="event-title" className="event-panel" style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, display: 'flex', flexDirection: 'column', border: `1px solid ${COLORS.purple}30` }}>
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
                    <div role="radiogroup" aria-label="Decision options" className="options-grid">{event.options.map((o, i) => (
                      <button
                        key={`option-${event.id}-${i}`}
                        onClick={() => setSelectedOption(i)}
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
                    onClick={decide}
                    disabled={selectedOption === null || !canAfford}
                    aria-disabled={selectedOption === null || !canAfford}
                    className="confirm-btn"
                    style={{
                      background: selectedOption !== null && canAfford ? COLORS.purple : `${COLORS.white}20`,
                      border: 'none',
                      borderRadius: 25,
                      color: selectedOption !== null && canAfford ? COLORS.white : `${COLORS.white}70`,
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      cursor: selectedOption !== null && canAfford ? 'pointer' : 'not-allowed',
                      textTransform: 'uppercase',
                      transition: 'background 0.2s ease-out',
                      opacity: selectedOption !== null && canAfford ? 1 : 0.7
                    }}
                  >
                    {selectedOption === null
                      ? 'Select an option above'
                      : !canAfford
                        ? 'Reduce investments - over budget'
                        : 'Confirm Decision'}
                  </button>
                  <div aria-label={`Progress: ${handled} of ${events.length + handled} events completed`} style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 5 }}>{[...Array(events.length + handled)].map((_, i) => (<div key={`progress-${i}`} aria-hidden="true" style={{ width: i < handled ? 22 : 7, height: 3, borderRadius: 2, background: i < handled ? COLORS.teal : i === handled ? COLORS.purple : `${COLORS.white}20` }} />))}</div>
                </article>
                );
              })() : done ? (
                <section aria-label="Quarter complete" style={{ background: `linear-gradient(135deg, ${COLORS.darkTeal}50 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, padding: 35, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${COLORS.teal}30`, textAlign: 'center' }}>
                  <div aria-hidden="true" style={{ fontSize: '3.5rem', marginBottom: 15 }}>✓</div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: COLORS.white, margin: '0 0 12px 0' }}>Quarter {round} Complete</h2>
                  <p style={{ fontSize: '0.95rem', color: `${COLORS.white}cc`, marginBottom: 25, maxWidth: 320 }}>You handled {handled + 1} situations this quarter.</p>
                  <button onClick={endRound} aria-label={round >= 4 ? 'View your final results' : `Start quarter ${round + 1}`} style={{ padding: '14px 35px', background: COLORS.teal, border: 'none', borderRadius: 22, color: COLORS.white, fontFamily: "'Poppins', sans-serif", fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 2, minHeight: 52 }}>{round >= 4 ? 'View Results' : `Start Q${round + 1}`}</button>
                </section>
              ) : null}
              <section aria-labelledby="observations-heading" aria-live="polite" className="observations-panel" style={{ background: `linear-gradient(180deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, padding: 16, border: `1px solid ${COLORS.white}10`, display: 'flex', flexDirection: 'column' }}>
                <h2 id="observations-heading" style={{ fontSize: '0.75rem', color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontWeight: 600 }}>Observations</h2>
                <div role="log" aria-label="Team observations" style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {notes.length ? notes.map((n, i) => (
                    <div key={`note-${i}-${n.text.slice(0,10)}`} className="animate-fade" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: `${COLORS.black}40`, borderRadius: 8, borderLeft: `3px solid ${COLORS.purple}40` }}>
                      <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>{n.icon}</span>
                      <span style={{ color: `${COLORS.white}cc`, fontSize: '0.9rem', lineHeight: 1.5 }}>{n.text}</span>
                    </div>
                  )) : <div style={{ color: `${COLORS.white}99`, fontSize: '0.9rem', fontStyle: 'italic', padding: '10px 0' }}>The office hums along...</div>}
                </div>
              </section>
            </div>
            {/* Team sidebar - horizontal scroll on mobile, vertical on desktop */}
            <aside aria-labelledby="team-sidebar-heading" className="hide-mobile" style={{ background: `linear-gradient(180deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 14, padding: 14, border: `1px solid ${COLORS.white}10`, overflow: 'auto' }}>
              <h2 id="team-sidebar-heading" style={{ fontSize: '0.75rem', color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontWeight: 600 }}>Your Team</h2>
              <div role="list" aria-label="Team members" className="team-sidebar">
              {chars.map(c => (
                <article key={c.id} role="listitem" aria-label={`${c.name}, ${c.role}${c.atRisk ? ', at risk' : ''}`} style={{ background: `${COLORS.black}40`, padding: 10, borderRadius: 10, borderLeft: `3px solid ${c.atRisk ? COLORS.yellow : c.engagement < 50 ? '#ff4757' : COLORS.teal}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span aria-hidden="true" style={{ fontSize: '1.6rem' }}>{c.avatar}</span>
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: COLORS.white, fontSize: '0.95rem' }}>{c.name}</div><div style={{ fontSize: '0.75rem', color: `${COLORS.white}cc` }}>{c.role}</div></div>
                    {c.atRisk && <div aria-label="At risk indicator" style={{ background: `${COLORS.yellow}30`, color: COLORS.yellow, padding: '2px 5px', borderRadius: 6, fontSize: '0.6rem', fontWeight: 600 }}>RISK</div>}
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
          <div role="tabpanel" id="team-panel" aria-label="Team view" className="team-grid" style={{ flex: 1 }}>
            {chars.map(c => (
              <article key={c.id} aria-label={`${c.name} - ${c.role}`} style={{ background: `linear-gradient(135deg, ${COLORS.grey} 0%, ${COLORS.greyDark} 100%)`, borderRadius: 16, padding: 20, border: `1px solid ${c.atRisk ? COLORS.yellow : COLORS.white}20`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 15 }}><div aria-hidden="true" style={{ fontSize: '3rem', background: `${COLORS.black}50`, borderRadius: '50%', width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.avatar}</div><div><h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: COLORS.white }}>{c.name}</h3><p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: `${COLORS.white}99` }}>{c.role}</p><p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: `${COLORS.white}70` }}>{c.tenure}</p></div>{c.atRisk && <div aria-label="At risk" style={{ marginLeft: 'auto', background: `${COLORS.yellow}20`, color: COLORS.yellow, padding: '4px 10px', borderRadius: 12, fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>Risk</div>}</div>
                <div role="list" aria-label="Traits" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>{c.traits.map((t) => (<span key={t} role="listitem" style={{ background: `${COLORS.purple}20`, color: COLORS.purple, padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem' }}>{t}</span>))}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}><div aria-label={`Trust: ${Math.round(c.trust)}`} style={{ background: `${COLORS.black}40`, padding: 10, borderRadius: 8 }}><div style={{ fontSize: '0.65rem', color: `${COLORS.white}99`, marginBottom: 4 }}>Trust</div><div style={{ fontSize: '1.4rem', fontWeight: 700, color: getMetricColor(c.trust) }}>{Math.round(c.trust)}</div></div><div aria-label={`Engagement: ${Math.round(c.engagement)}`} style={{ background: `${COLORS.black}40`, padding: 10, borderRadius: 8 }}><div style={{ fontSize: '0.65rem', color: `${COLORS.white}99`, marginBottom: 4 }}>Engagement</div><div style={{ fontSize: '1.4rem', fontWeight: 700, color: getMetricColor(c.engagement) }}>{Math.round(c.engagement)}</div></div></div>
                <div style={{ background: `${COLORS.black}40`, padding: 10, borderRadius: 8, marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span id={`perf-label-${c.id}`} style={{ fontSize: '0.7rem', color: `${COLORS.white}99` }}>Performance</span><span style={{ fontSize: '0.8rem', color: COLORS.white, fontWeight: 600 }}>{c.performance}%</span></div><div role="progressbar" aria-valuenow={c.performance} aria-valuemin="0" aria-valuemax="100" aria-labelledby={`perf-label-${c.id}`} style={{ height: 5, background: `${COLORS.white}10`, borderRadius: 3 }}><div style={{ width: `${c.performance}%`, height: '100%', background: COLORS.teal, borderRadius: 3 }} /></div></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: '0.7rem', color: `${COLORS.white}70`, marginBottom: 4 }}>Drivers</div><p style={{ fontSize: '0.8rem', color: `${COLORS.white}cc`, lineHeight: 1.4, margin: '0 0 8px 0' }}>{c.drivers}</p><div style={{ fontSize: '0.7rem', color: `${COLORS.white}70`, marginBottom: 4 }}>Sensitivity</div><p style={{ fontSize: '0.8rem', color: `${COLORS.white}cc`, lineHeight: 1.4, margin: 0 }}>{c.sensitivity}</p></div>
              </article>
            ))}
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
          onClick={reset}
          className="mobile-nav-btn"
          aria-label="Reset simulation"
        >
          <span aria-hidden="true">↺</span>
          Reset
        </button>
      </nav>
    </div>
  );
}
