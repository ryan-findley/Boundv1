import React, { useState } from 'react';

// Wireframe styling - intentionally sketch-like
const wireframeStyles = {
  container: "font-mono bg-slate-50 min-h-screen",
  card: "bg-white border-2 border-slate-300 border-dashed rounded-lg p-4",
  cardSolid: "bg-white border-2 border-slate-400 rounded-lg p-4",
  label: "text-xs uppercase tracking-wide text-slate-500 font-bold",
  heading: "text-lg font-bold text-slate-800",
  placeholder: "bg-slate-100 border border-slate-300 rounded p-3 text-slate-500 text-sm",
  button: "bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium",
  buttonOutline: "border-2 border-slate-400 text-slate-700 px-4 py-2 rounded text-sm font-medium",
  alertRed: "bg-red-50 border-2 border-red-400 rounded-lg p-4",
  alertYellow: "bg-amber-50 border-2 border-amber-400 rounded-lg p-4",
  alertGreen: "bg-emerald-50 border-2 border-emerald-400 rounded-lg p-4",
};

// Navigation component
function Navigation({ activeScreen, setActiveScreen, activeChild, setActiveChild }) {
  const screens = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'conversations', label: 'Conversations' },
    { id: 'controls', label: 'Controls' },
    { id: 'activity', label: 'Activity Log' },
    { id: 'settings', label: 'Settings' },
  ];
  
  const children = ['Emma (12)', 'Jake (9)'];

  return (
    <div className="bg-slate-800 text-white p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="font-bold text-xl tracking-tight">BOUND</div>
          <div className="text-slate-400 text-sm">Parent Portal</div>
        </div>
        
        <div className="flex items-center gap-2">
          {screens.map(screen => (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              className={`px-3 py-1.5 rounded text-sm ${
                activeScreen === screen.id 
                  ? 'bg-white text-slate-800 font-medium' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {screen.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={activeChild}
            onChange={(e) => setActiveChild(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-sm"
          >
            {children.map(child => (
              <option key={child} value={child}>{child}</option>
            ))}
          </select>
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs">
            MA
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Screen
function DashboardScreen() {
  // Mock data for the 7-day chart
  const weekData = [
    { day: 'Mon', safety: 10, sandbox: 15, skilling: 5, total: 30 },
    { day: 'Tue', safety: 5, sandbox: 25, skilling: 10, total: 40 },
    { day: 'Wed', safety: 0, sandbox: 20, skilling: 0, total: 20 },
    { day: 'Thu', safety: 15, sandbox: 10, skilling: 15, total: 40 },
    { day: 'Fri', safety: 0, sandbox: 30, skilling: 5, total: 35 },
    { day: 'Sat', safety: 10, sandbox: 35, skilling: 0, total: 45 },
    { day: 'Sun', safety: 5, sandbox: 20, skilling: 0, total: 25 },
  ];
  
  const maxMinutes = 60; // For scaling the bars

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Emma's Dashboard</h1>
          <p className="text-slate-500 text-sm">Last active: Today at 3:45 PM</p>
        </div>
        <div className="flex gap-2">
          <button className={wireframeStyles.buttonOutline}>+ 15 min</button>
          <button className={wireframeStyles.buttonOutline}>+ 30 min</button>
          <button className={wireframeStyles.button}>Custom time</button>
        </div>
      </div>

      {/* Hero Section: 7-Day Usage Chart */}
      <div className={wireframeStyles.cardSolid}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className={wireframeStyles.label}>This Week's Activity</div>
            <p className="text-2xl font-bold text-slate-800 mt-1">3h 55m total</p>
            <p className="text-sm text-slate-500">across 12 sessions</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-slate-600">Safety</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500"></div>
              <span className="text-slate-600">Sandbox</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-500"></div>
              <span className="text-slate-600">Skilling</span>
            </div>
          </div>
        </div>
        
        {/* Stacked Bar Chart */}
        <div className="flex items-end justify-between gap-2 h-32 mt-6">
          {weekData.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col-reverse" style={{ height: '100px' }}>
                {/* Safety (blue) */}
                <div 
                  className="w-full bg-blue-500 rounded-b"
                  style={{ height: `${(day.safety / maxMinutes) * 100}%` }}
                ></div>
                {/* Sandbox (green) */}
                <div 
                  className="w-full bg-emerald-500"
                  style={{ height: `${(day.sandbox / maxMinutes) * 100}%` }}
                ></div>
                {/* Skilling (purple) */}
                <div 
                  className="w-full bg-purple-500 rounded-t"
                  style={{ height: `${(day.skilling / maxMinutes) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-slate-500 mt-2">{day.day}</span>
              <span className="text-xs text-slate-400">{day.total}m</span>
            </div>
          ))}
        </div>
        
        {/* Time limit indicator */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            <span className="font-medium">Today:</span> 24 min used of 45 min limit
          </div>
          <div className="w-48 h-2 bg-slate-200 rounded-full">
            <div className="h-2 bg-emerald-500 rounded-full" style={{width: '53%'}}></div>
          </div>
        </div>
      </div>

      {/* Highlights and Alerts - Side by Side */}
      <div className="grid grid-cols-2 gap-6">
        {/* Highlights */}
        <div className={wireframeStyles.cardSolid}>
          <div className="flex justify-between items-center mb-4">
            <div className={wireframeStyles.label}>✨ Highlights</div>
            <button className="text-sm text-slate-600 underline">View all →</button>
          </div>
          
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-200 rounded flex items-center justify-center text-lg">🐉</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Emma shared: "My dragon story idea!"</p>
                  <p className="text-xs text-slate-500 mt-1">She brainstormed a story about a dragon living in a library who eats boring books. Creative worldbuilding!</p>
                  <p className="text-xs text-emerald-600 mt-1">Today at 3:40 PM</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded flex items-center justify-center text-lg">🎓</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Lesson completed: "Why AI Hallucinates"</p>
                  <p className="text-xs text-slate-500 mt-1">Emma learned about AI confidence vs accuracy. Ask her about it!</p>
                  <p className="text-xs text-blue-600 mt-1">Yesterday at 4:30 PM</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-200 rounded flex items-center justify-center text-lg">🐢</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Emma shared: "Sea turtle facts!"</p>
                  <p className="text-xs text-slate-500 mt-1">Researched sea turtle migration patterns for a school project.</p>
                  <p className="text-xs text-purple-600 mt-1">Yesterday at 4:15 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className={wireframeStyles.cardSolid}>
          <div className="flex justify-between items-center mb-4">
            <div className={wireframeStyles.label}>⚠️ Alerts</div>
            <button className="text-sm text-slate-600 underline">View all →</button>
          </div>
          
          <div className="space-y-3">
            {/* Red Alert */}
            <div className="bg-red-50 border border-red-300 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-medium text-sm">🔴 Immediate</span>
                    <span className="text-xs text-slate-500">Today 2:30 PM</span>
                  </div>
                  <p className="text-sm text-slate-800 mt-1">Emma asked about "dating older boys"</p>
                  <p className="text-xs text-slate-500 mt-1">AI redirected to age-appropriate friendship topics.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button className="text-xs text-red-700 underline">View chat</button>
                  <button className="text-xs text-slate-600 underline">Mark reviewed</button>
                </div>
              </div>
            </div>
            
            {/* Yellow Alert */}
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 font-medium text-sm">🟡 Flagged</span>
                    <span className="text-xs text-slate-500">Monday 3:30 PM</span>
                  </div>
                  <p className="text-sm text-slate-800 mt-1">Conversation about "what is politics"</p>
                  <p className="text-xs text-slate-500 mt-1">AI provided neutral, educational response.</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button className="text-xs text-amber-700 underline">View chat</button>
                </div>
              </div>
            </div>
            
            {/* No more alerts state */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
              <p className="text-sm text-slate-500">No other alerts this week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: Progress, Weekly Digest, Recent Activity */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Progress Across Pillars */}
        <div className={wireframeStyles.card}>
          <div className={wireframeStyles.label}>Progress</div>
          
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">🛡️ Safety</span>
                <span className="text-slate-500">4/6 lessons</span>
              </div>
              <div className="mt-1 h-2 bg-slate-200 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full" style={{width: '66%'}}></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Latest: "Why AI Hallucinates"</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">💬 Sandbox</span>
                <span className="text-slate-500">12 conversations</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Topics: dragons, sea turtles, fractions</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">⚡ Skilling</span>
                <span className="text-slate-500">2/8 challenges</span>
              </div>
              <div className="mt-1 h-2 bg-slate-200 rounded-full">
                <div className="h-2 bg-purple-500 rounded-full" style={{width: '25%'}}></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">In progress: "Iterate an Image"</p>
            </div>
          </div>
        </div>

        {/* Weekly Digest Preview */}
        <div className={wireframeStyles.card}>
          <div className={wireframeStyles.label}>Weekly Digest</div>
          <p className="text-xs text-slate-500">Full report emailed Sunday</p>
          
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Top Topics</p>
              <p className="text-sm text-slate-500">1. Creative writing (dragon story)</p>
              <p className="text-sm text-slate-500">2. Sea turtles & marine biology</p>
              <p className="text-sm text-slate-500">3. Math homework help</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-700">Discussion Prompts</p>
              <p className="text-sm text-slate-500 italic">"Ask Emma about the dragon character she created—who discovers it in the library?"</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className={wireframeStyles.card}>
          <div className="flex justify-between items-center">
            <div className={wireframeStyles.label}>Recent Activity</div>
            <button className="text-xs text-slate-600 underline">Full log →</button>
          </div>
          
          <div className="mt-4 space-y-2">
            {[
              { time: '3:45 PM', event: 'Session ended', detail: 'Dragon story' },
              { time: '3:21 PM', event: 'Session started', detail: 'Continued chat' },
              { time: '2:30 PM', event: '🔴 Alert', detail: 'Relationships' },
              { time: 'Yesterday', event: 'Lesson done', detail: 'AI Hallucinations' },
              { time: 'Yesterday', event: 'Time +15m', detail: 'by Mom' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0 text-xs">
                <span className="text-slate-400 w-16">{item.time}</span>
                <span className="font-medium text-slate-700 flex-1">{item.event}</span>
                <span className="text-slate-500">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Conversations Screen
function ConversationsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpeaker, setFilterSpeaker] = useState('all');
  const [filterFlag, setFilterFlag] = useState('all');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Conversation Logs</h1>
        <p className="text-slate-500 text-sm">Full transcripts of Emma's chats</p>
      </div>

      {/* Search and Filters */}
      <div className={wireframeStyles.cardSolid}>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className={wireframeStyles.label}>Search conversations</label>
            <input 
              type="text"
              placeholder="Search by keyword (e.g., 'sister', 'homework', 'scary')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-1 w-full border-2 border-slate-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className={wireframeStyles.label}>Speaker</label>
            <select 
              value={filterSpeaker}
              onChange={(e) => setFilterSpeaker(e.target.value)}
              className="mt-1 border-2 border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="child">Emma said</option>
              <option value="ai">AI said</option>
            </select>
          </div>
          <div>
            <label className={wireframeStyles.label}>Flag status</label>
            <select 
              value={filterFlag}
              onChange={(e) => setFilterFlag(e.target.value)}
              className="mt-1 border-2 border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All conversations</option>
              <option value="red">🔴 Red flags only</option>
              <option value="yellow">🟡 Yellow flags only</option>
              <option value="flagged">Any flagged</option>
            </select>
          </div>
          <div>
            <label className={wireframeStyles.label}>Date range</label>
            <select className="mt-1 border-2 border-slate-300 rounded px-3 py-2 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>All time</option>
              <option>Custom...</option>
            </select>
          </div>
          <button className={wireframeStyles.button}>Search</button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="grid grid-cols-3 gap-4">
        {/* List of conversations */}
        <div className="col-span-1 space-y-2">
          <div className={wireframeStyles.label}>Conversations</div>
          
          {[
            { title: 'Dragon story brainstorming', time: 'Today 3:21 PM', duration: '24 min', flag: null },
            { title: 'Dating question', time: 'Today 2:30 PM', duration: '3 min', flag: 'red' },
            { title: 'Sea turtle research', time: 'Yesterday 4:00 PM', duration: '18 min', flag: null },
            { title: 'Fractions homework', time: 'Monday 3:45 PM', duration: '12 min', flag: null },
            { title: 'What is politics', time: 'Monday 3:30 PM', duration: '8 min', flag: 'yellow' },
          ].map((convo, i) => (
            <div 
              key={i} 
              className={`p-3 rounded cursor-pointer border-2 ${
                i === 0 ? 'border-slate-800 bg-slate-50' : 'border-transparent hover:bg-slate-50'
              } ${convo.flag === 'red' ? 'border-l-4 border-l-red-500' : ''} ${convo.flag === 'yellow' ? 'border-l-4 border-l-amber-500' : ''}`}
            >
              <div className="flex items-center gap-2">
                {convo.flag === 'red' && <span>🔴</span>}
                {convo.flag === 'yellow' && <span>🟡</span>}
                <span className="font-medium text-sm text-slate-800">{convo.title}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{convo.time} • {convo.duration}</div>
            </div>
          ))}
        </div>

        {/* Selected conversation transcript */}
        <div className="col-span-2">
          <div className={wireframeStyles.cardSolid}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-800">Dragon story brainstorming</h3>
                <p className="text-sm text-slate-500">Today 3:21 PM • 24 minutes • 18 messages</p>
              </div>
              <button className={wireframeStyles.buttonOutline}>Export PDF</button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {[
                { speaker: 'emma', text: 'I want to write a story about a dragon but I don\'t know how to start' },
                { speaker: 'ai', text: 'Dragons are a great story choice! Let\'s brainstorm together. First, what kind of dragon are you imagining? Is it friendly or scary? Big or small? Does it live in a cave, a city, or somewhere unexpected?' },
                { speaker: 'emma', text: 'A friendly one that\'s small and lives in a library' },
                { speaker: 'ai', text: 'Oh, I love that! A small friendly dragon living in a library is such a creative idea. What do you think the dragon does in the library? Does it read books? Protect them? Maybe it accidentally causes trouble?' },
                { speaker: 'emma', text: 'Maybe it eats the boring books and protects the good ones' },
                { speaker: 'ai', text: 'Ha! That\'s really imaginative. So your dragon is like a book critic with teeth. Now let\'s think about your main character - who discovers this dragon? A kid? A librarian? Someone who wasn\'t supposed to be in the library?' },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.speaker === 'emma' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-lg ${
                    msg.speaker === 'emma' 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    <div className="text-xs font-medium mb-1">
                      {msg.speaker === 'emma' ? 'Emma' : 'Bound AI'}
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 text-center text-sm text-slate-500">
              [Scroll to see 12 more messages]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Controls Screen
function ControlsScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Controls</h1>
        <p className="text-slate-500 text-sm">Time limits, content settings, and notifications for Emma</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Time Controls */}
        <div className={wireframeStyles.cardSolid}>
          <div className={wireframeStyles.label}>Time Limits</div>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Daily time limit</label>
              <div className="flex items-center gap-4 mt-2">
                <input 
                  type="range" 
                  min="15" 
                  max="120" 
                  defaultValue="45" 
                  className="flex-1"
                />
                <span className="text-lg font-bold text-slate-800 w-20">45 min</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Quiet hours (no access)</label>
              <div className="flex items-center gap-2 mt-2">
                <input type="time" defaultValue="21:00" className="border rounded px-2 py-1" />
                <span>to</span>
                <input type="time" defaultValue="07:00" className="border rounded px-2 py-1" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Weekend adjustment</label>
              <select className="mt-2 w-full border rounded px-3 py-2">
                <option>Same as weekdays (45 min)</option>
                <option>+15 minutes (60 min)</option>
                <option>+30 minutes (75 min)</option>
                <option>Double time (90 min)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Sensitivity */}
        <div className={wireframeStyles.cardSolid}>
          <div className={wireframeStyles.label}>Content Sensitivity</div>
          <p className="text-xs text-slate-500 mt-1">Set alert levels by category</p>
          
          <div className="mt-4 space-y-3">
            {[
              { category: 'Sexual content', default: 'red' },
              { category: 'Violence', default: 'red' },
              { category: 'Religious topics', default: 'yellow' },
              { category: 'Political topics', default: 'yellow' },
              { category: 'Relationships/dating', default: 'red' },
              { category: 'Mental health', default: 'yellow' },
              { category: 'Drugs/alcohol', default: 'red' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{item.category}</span>
                <select 
                  defaultValue={item.default}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="red">🔴 Instant alert</option>
                  <option value="yellow">🟡 Weekly digest</option>
                  <option value="green">🟢 No flag</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Keywords */}
        <div className={wireframeStyles.cardSolid}>
          <div className={wireframeStyles.label}>Custom Keywords</div>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Always alert me about:</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">girlfriend ✕</span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">boyfriend ✕</span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">kiss ✕</span>
              </div>
              <input 
                type="text" 
                placeholder="Add keyword..."
                className="mt-2 w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Never flag these (exceptions):</label>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm">hunting ✕</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm">bow and arrow ✕</span>
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm">puberty ✕</span>
              </div>
              <input 
                type="text" 
                placeholder="Add exception..."
                className="mt-2 w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={wireframeStyles.cardSolid}>
          <div className={wireframeStyles.label}>Notification Preferences</div>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Instant alerts (🔴 red flags)</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked /> 
                  <span className="text-sm">Push notification</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked /> 
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> 
                  <span className="text-sm">SMS</span>
                  <span className="text-xs text-slate-500">(to 555-123-4567)</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Weekly digest</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked /> 
                  <span className="text-sm">Email (Sundays at 9am)</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Progress updates</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked /> 
                  <span className="text-sm">When Emma completes a lesson</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> 
                  <span className="text-sm">When Emma shares something with me</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className={wireframeStyles.button}>Save Changes</button>
      </div>
    </div>
  );
}

// Activity Log Screen
function ActivityLogScreen() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Activity Log</h1>
          <p className="text-slate-500 text-sm">Complete audit trail for Emma's account</p>
        </div>
        <div className="flex gap-2">
          <select className="border rounded px-3 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>All time</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm">
            <option>All events</option>
            <option>Sessions only</option>
            <option>Parent actions only</option>
            <option>Alerts only</option>
          </select>
          <button className={wireframeStyles.buttonOutline}>Export CSV</button>
        </div>
      </div>

      <div className={wireframeStyles.cardSolid}>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-500 border-b">
              <th className="pb-2 font-medium">Timestamp</th>
              <th className="pb-2 font-medium">Event</th>
              <th className="pb-2 font-medium">Details</th>
              <th className="pb-2 font-medium">Actor</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[
              { time: 'Dec 28, 3:45 PM', event: 'Session ended', detail: 'Dragon story brainstorming (24 min)', actor: 'Emma' },
              { time: 'Dec 28, 3:21 PM', event: 'Session started', detail: 'Continued previous conversation', actor: 'Emma' },
              { time: 'Dec 28, 2:33 PM', event: 'Alert reviewed', detail: 'Dating question - marked as reviewed', actor: 'Mom' },
              { time: 'Dec 28, 2:30 PM', event: '🔴 Alert triggered', detail: 'Topic: relationships/dating', actor: 'System' },
              { time: 'Dec 28, 2:28 PM', event: 'Session started', detail: 'New conversation', actor: 'Emma' },
              { time: 'Dec 27, 4:30 PM', event: 'Lesson completed', detail: '"Why AI Hallucinates"', actor: 'Emma' },
              { time: 'Dec 27, 4:15 PM', event: 'Time extended', detail: '+15 minutes', actor: 'Mom' },
              { time: 'Dec 27, 4:00 PM', event: 'Session started', detail: 'Sea turtle research', actor: 'Emma' },
              { time: 'Dec 27, 10:00 AM', event: 'Settings changed', detail: 'Added keyword exception: "puberty"', actor: 'Dad' },
              { time: 'Dec 26, 3:45 PM', event: 'Session ended', detail: 'Fractions homework (12 min)', actor: 'Emma' },
              { time: 'Dec 26, 3:33 PM', event: 'Session started', detail: 'New conversation', actor: 'Emma' },
              { time: 'Dec 25, 9:00 AM', event: 'Weekly digest sent', detail: 'Email delivered', actor: 'System' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-3 text-slate-500">{row.time}</td>
                <td className="py-3 font-medium text-slate-800">{row.event}</td>
                <td className="py-3 text-slate-600">{row.detail}</td>
                <td className="py-3 text-slate-500">{row.actor}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 flex justify-center">
          <button className="text-sm text-slate-600 underline">Load more</button>
        </div>
      </div>
    </div>
  );
}

// Settings Screen
function SettingsScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-500 text-sm">Manage family account and child profiles</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Child Profiles */}
        <div className={wireframeStyles.cardSolid}>
          <div className={wireframeStyles.label}>Child Profiles</div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center font-bold text-blue-800">E</div>
                <div>
                  <p className="font-medium text-slate-800">Emma</p>
                  <p className="text-sm text-slate-500">Age 12 • 5th grade</p>
                </div>
              </div>
              <button className="text-sm text-slate-600 underline">Edit</button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-800">J</div>
                <div>
                  <p className="font-medium text-slate-800">Jake</p>
                  <p className="text-sm text-slate-500">Age 9 • 3rd grade</p>
                </div>
              </div>
              <button className="text-sm text-slate-600 underline">Edit</button>
            </div>
            
            <button className={wireframeStyles.buttonOutline + " w-full"}>+ Add child</button>
          </div>
        </div>

        {/* Parent Accounts */}
        <div className={wireframeStyles.cardSolid}>
          <div className={wireframeStyles.label}>Parent Accounts</div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="font-medium text-slate-800">Mom (Sarah)</p>
                <p className="text-sm text-slate-500">sarah@email.com • Owner</p>
              </div>
              <button className="text-sm text-slate-600 underline">Edit</button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="font-medium text-slate-800">Dad (Mike)</p>
                <p className="text-sm text-slate-500">mike@email.com • Admin</p>
              </div>
              <button className="text-sm text-slate-600 underline">Edit</button>
            </div>
            
            <button className={wireframeStyles.buttonOutline + " w-full"}>+ Invite parent/caregiver</button>
          </div>
        </div>

        {/* Subscription */}
        <div className={wireframeStyles.cardSolid}>
          <div className={wireframeStyles.label}>Subscription</div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-bold text-slate-800">Family Plan</p>
                <p className="text-sm text-slate-500">$12.99/month • Up to 4 children</p>
              </div>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">Active</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">Next billing: January 28, 2025</p>
              <div className="mt-2 flex gap-2">
                <button className="text-sm text-slate-600 underline">Change plan</button>
                <button className="text-sm text-slate-600 underline">Update payment</button>
                <button className="text-sm text-red-600 underline">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className={wireframeStyles.cardSolid}>
          <div className={wireframeStyles.label}>Data & Privacy</div>
          
          <div className="mt-4 space-y-3">
            <button className={wireframeStyles.buttonOutline + " w-full text-left"}>
              Export all data (COPPA compliant)
            </button>
            <button className={wireframeStyles.buttonOutline + " w-full text-left"}>
              Delete conversation history
            </button>
            <button className={wireframeStyles.buttonOutline + " w-full text-left text-red-600 border-red-300"}>
              Delete account and all data
            </button>
            
            <p className="text-xs text-slate-500 mt-4">
              Bound complies with COPPA regulations. We collect minimal data, never sell personal information, 
              and you can request complete data deletion at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App
export default function BoundParentPortal() {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [activeChild, setActiveChild] = useState('Emma (12)');

  const renderScreen = () => {
    switch(activeScreen) {
      case 'dashboard': return <DashboardScreen />;
      case 'conversations': return <ConversationsScreen />;
      case 'controls': return <ControlsScreen />;
      case 'activity': return <ActivityLogScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <div className={wireframeStyles.container}>
      <Navigation 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen}
        activeChild={activeChild}
        setActiveChild={setActiveChild}
      />
      <main className="max-w-6xl mx-auto p-6">
        {renderScreen()}
      </main>
      
      {/* Wireframe Label */}
      <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-3 py-1 rounded text-xs font-mono">
        WIREFRAME v1 — Parent Portal
      </div>
    </div>
  );
}
