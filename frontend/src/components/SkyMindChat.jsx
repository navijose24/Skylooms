// frontend/src/components/SkyMindChat.jsx
// SkyMind AI travel assistant — floating side panel
// Connects to FastAPI backend at port 8001

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Plane, Hotel, Car, ChevronDown, Sparkles } from 'lucide-react';

const SKYMIND_BASE = 'http://localhost:8001';

// ─── tiny storage helpers ───────────────────────────────────────
const getToken   = () => localStorage.getItem('skymind_token');
const setToken   = (t) => localStorage.setItem('skymind_token', t);
const clearToken = () => localStorage.removeItem('skymind_token');

// ─── register / login silently ────────────────────────────────
async function ensureAuth() {
  if (getToken()) return true;

  // Try to create an anonymous session-based guest user
  const guestEmail = `guest_${Date.now()}@skylooms.guest`;
  const guestPass  = 'SkyGuest!2025';
  try {
    const res = await fetch(`${SKYMIND_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Guest', email: guestEmail, password: guestPass }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.access_token);
      return true;
    }
  } catch (_) {}
  return false;
}

// ─── send message to SkyMind ─────────────────────────────────
async function sendToSkyMind(message, sessionId) {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${SKYMIND_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message, session_id: sessionId || undefined }),
  });

  if (res.status === 401) { clearToken(); return null; }
  if (!res.ok)             return null;
  return res.json();
}

// ─── sub-components ──────────────────────────────────────────

function FlightCard({ f }) {
  return (
    <div style={{
      background: 'rgba(0,186,255,0.08)',
      border: '1px solid rgba(0,186,255,0.2)',
      borderRadius: 12, padding: '10px 14px', marginBottom: 6,
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 700, color: '#00baff' }}>✈ {f.airline} {f.flight_no}</div>
      <div style={{ color: '#ccc', marginTop: 2 }}>
        {f.origin} → {f.destination} &nbsp;|&nbsp; {f.depart_time} – {f.arrive_time}
      </div>
      <div style={{ color: '#fff', fontWeight: 600, marginTop: 4 }}>
        ₹{(f.price_inr || 0).toLocaleString('en-IN')}
        <span style={{ color: '#999', fontWeight: 400, fontSize: 11 }}> · {f.class || f.tier}</span>
      </div>
    </div>
  );
}

function HotelCard({ h }) {
  return (
    <div style={{
      background: 'rgba(255,186,0,0.08)',
      border: '1px solid rgba(255,186,0,0.2)',
      borderRadius: 12, padding: '10px 14px', marginBottom: 6,
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 700, color: '#ffba00' }}>🏨 {h.name} {'★'.repeat(h.stars || 3)}</div>
      <div style={{ color: '#ccc', marginTop: 2 }}>{h.nights} nights · {h.check_in} → {h.check_out}</div>
      <div style={{ color: '#fff', fontWeight: 600, marginTop: 4 }}>
        ₹{(h.price_per_night || 0).toLocaleString('en-IN')}/night
        <span style={{ color: '#999', fontWeight: 400, fontSize: 11 }}> · Total ₹{(h.total_price || 0).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}

function CabCard({ c }) {
  return (
    <div style={{
      background: 'rgba(0,255,128,0.08)',
      border: '1px solid rgba(0,255,128,0.2)',
      borderRadius: 12, padding: '10px 14px', marginBottom: 6,
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 700, color: '#00ff80' }}>🚗 {c.vehicle}</div>
      <div style={{ color: '#ccc', marginTop: 2 }}>{c.pickup} → {c.dropoff}</div>
      <div style={{ color: '#fff', fontWeight: 600, marginTop: 4 }}>
        ₹{(c.price_inr || 0).toLocaleString('en-IN')}
        <span style={{ color: '#999', fontWeight: 400, fontSize: 11 }}> · ETA {c.eta_minutes}min</span>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
    }}>
      {/* bubble */}
      <div style={{
        maxWidth: '85%',
        background:     isUser ? 'linear-gradient(135deg,#0077cc,#00baff)' : 'rgba(255,255,255,0.06)',
        border:         isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
        borderRadius:   isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding:        '10px 14px',
        color:          '#fff',
        fontSize:       14,
        lineHeight:     1.5,
        whiteSpace:     'pre-wrap',
        wordBreak:      'break-word',
      }}>
        {msg.text}
      </div>

      {/* structured results */}
      {!isUser && (msg.flights?.length > 0 || msg.hotels?.length > 0 || msg.cabs?.length > 0) && (
        <div style={{ maxWidth: '95%', marginTop: 8, width: '100%' }}>
          {msg.flights?.slice(0, 3).map((f, i) => <FlightCard key={i} f={f} />)}
          {msg.hotels?.slice(0, 3).map((h, i) => <HotelCard  key={i} h={h} />)}
          {msg.cabs?.slice(0, 3).map((c, i)   => <CabCard    key={i} c={c} />)}
        </div>
      )}
    </div>
  );
}

// ─── quick suggestion chips ──────────────────────────────────
const CHIPS = [
  '✈ Flights to Goa',
  '🏨 Hotels in Mumbai',
  '🚗 Cab from airport',
  '📦 3-night trip bundle',
  '❌ Cancel booking',
];

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function SkyMindChat() {
  const [open,      setOpen]      = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [authed,    setAuthed]    = useState(false);
  const [authError, setAuthError] = useState(false);
  const scrollRef = useRef(null);

  // auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // auth on first open
  useEffect(() => {
    if (!open || authed) return;
    (async () => {
      const ok = await ensureAuth();
      if (ok) {
        setAuthed(true);
        setMessages([{
          role: 'assistant',
          text: "Hi! I'm SkyMind ✈️ — your AI travel concierge.\n\nI can search flights, hotels & cabs, bundle your whole trip, and even cancel bookings. Just ask!",
        }]);
      } else {
        setAuthError(true);
      }
    })();
  }, [open, authed]);

  async function handleSend(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const data = await sendToSkyMind(msg, sessionId);
      if (!data) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: 'Sorry, I couldn\'t reach the AI service. Make sure the backend is running on port 8001.',
        }]);
        return;
      }
      if (data.session_id && !sessionId) setSessionId(data.session_id);
      setMessages(prev => [...prev, {
        role:    'assistant',
        text:    data.reply || 'Here are the results I found!',
        flights: data.flights,
        hotels:  data.hotels,
        cabs:    data.cabs,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Connection error — is the SkyMind backend running?',
      }]);
    } finally {
      setLoading(false);
    }
  }

  // ── render ─────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        id="skymind-chat-trigger"
        onClick={() => setOpen(o => !o)}
        style={{
          position:     'fixed',
          bottom:       28,
          right:        28,
          zIndex:       9999,
          width:        60,
          height:       60,
          borderRadius: '50%',
          border:       'none',
          cursor:       'pointer',
          background:   'linear-gradient(135deg, #0055aa, #00baff)',
          boxShadow:    '0 4px 24px rgba(0,186,255,0.5)',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          transition:   'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform    = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform    = 'scale(1)';   }}
        title="SkyMind AI Assistant"
      >
        {open ? <X color="#fff" size={24} /> : <Sparkles color="#fff" size={24} />}
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div
          id="skymind-chat-panel"
          style={{
            position:     'fixed',
            bottom:       100,
            right:        24,
            zIndex:       9998,
            width:        380,
            height:       580,
            background:   'rgba(8,12,20,0.97)',
            backdropFilter: 'blur(24px)',
            border:       '1px solid rgba(0,186,255,0.2)',
            borderRadius: 20,
            display:      'flex',
            flexDirection: 'column',
            overflow:     'hidden',
            boxShadow:    '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,186,255,0.1)',
            animation:    'skymind-pop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Header */}
          <div style={{
            padding:        '14px 18px',
            background:     'linear-gradient(90deg, rgba(0,85,170,0.6), rgba(0,186,255,0.3))',
            borderBottom:   '1px solid rgba(0,186,255,0.15)',
            display:        'flex',
            alignItems:     'center',
            gap:            10,
            flexShrink:     0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#0055aa,#00baff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Bot color="#fff" size={20} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>SkyMind ✈</div>
              <div style={{ color: 'rgba(0,186,255,0.8)', fontSize: 11 }}>AI Travel Concierge</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', opacity: 0.6, padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex:       1,
              overflowY:  'auto',
              padding:    '14px 16px',
              scrollBehavior: 'smooth',
            }}
          >
            {authError && (
              <div style={{ color: '#ff6b6b', textAlign: 'center', fontSize: 13, marginTop: 40 }}>
                ⚠ Could not connect to SkyMind backend.<br />
                <span style={{ color: '#aaa' }}>Make sure the backend is running on port 8001.</span>
              </div>
            )}

            {messages.map((msg, i) => <Message key={i} msg={msg} />)}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#aaa', fontSize: 13 }}>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                SkyMind is thinking...
              </div>
            )}
          </div>

          {/* Quick chips (only when no messages yet) */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CHIPS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(chip.replace(/^[\S]+ /, ''))}
                  style={{
                    background:   'rgba(0,186,255,0.1)',
                    border:       '1px solid rgba(0,186,255,0.2)',
                    borderRadius: 20,
                    padding:      '5px 12px',
                    color:        '#00baff',
                    fontSize:     12,
                    cursor:       'pointer',
                    whiteSpace:   'nowrap',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding:      '10px 12px',
            borderTop:    '1px solid rgba(255,255,255,0.07)',
            display:      'flex',
            gap:          8,
            flexShrink:   0,
          }}>
            <input
              id="skymind-chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me anything about your trip..."
              disabled={!authed || loading}
              style={{
                flex:           1,
                background:     'rgba(255,255,255,0.06)',
                border:         '1px solid rgba(255,255,255,0.12)',
                borderRadius:   12,
                padding:        '10px 14px',
                color:          '#fff',
                fontSize:       14,
                outline:        'none',
              }}
            />
            <button
              id="skymind-send-btn"
              onClick={() => handleSend()}
              disabled={!authed || loading || !input.trim()}
              style={{
                background:     (!authed || loading || !input.trim()) ? 'rgba(0,186,255,0.2)' : 'linear-gradient(135deg,#0055aa,#00baff)',
                border:         'none',
                borderRadius:   12,
                width:          42,
                height:         42,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                cursor:         (!authed || loading || !input.trim()) ? 'not-allowed' : 'pointer',
                flexShrink:     0,
              }}
            >
              <Send color="#fff" size={18} />
            </button>
          </div>
        </div>
      )}

      {/* CSS animation keyframe injected inline */}
      <style>{`
        @keyframes skymind-pop {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        #skymind-chat-panel *::-webkit-scrollbar        { width: 4px; }
        #skymind-chat-panel *::-webkit-scrollbar-track  { background: transparent; }
        #skymind-chat-panel *::-webkit-scrollbar-thumb  { background: rgba(0,186,255,0.3); border-radius: 4px; }
      `}</style>
    </>
  );
}
