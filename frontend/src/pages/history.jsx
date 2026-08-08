import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideocamIcon from '@mui/icons-material/Videocam';
import HistoryIcon from '@mui/icons-material/History';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import DeveloperBadge from '../components/DeveloperBadge';
import CopyrightFooter from '../components/CopyrightFooter';

export default function History() {
    const { getHistoryOfUser, clearUserHistory } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const routeTo = useNavigate();

    const handleClearHistory = async () => {
        console.log("handleClearHistory clicked!");
        try {
            const result = await clearUserHistory();
            console.log("clearUserHistory result:", result);
            setMeetings([]);
        } catch (err) {
            console.error("handleClearHistory error:", err);
            alert("Error clearing history: " + (err.response ? JSON.stringify(err.response.data) : err.message));
        }
    }

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(Array.isArray(history) ? history : []);
            } catch (err) {
                setMeetings([]);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, [])

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const mins = date.getMinutes().toString().padStart(2, "0");
        return `${day}/${month}/${year} at ${hours}:${mins}`;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            color: 'white',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            display: 'flex',
            flexDirection: 'column',
        }}>
            <style>{`
                .historyNav {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 40px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    backdrop-filter: blur(10px);
                    background: rgba(15,23,42,0.6);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .historyMain {
                    flex: 1;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                    width: 100%;
                    box-sizing: border-box;
                }
                .historyHeaderRow {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    margin-bottom: 40px;
                }
                .meetingCard {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 18px 22px;
                    transition: all 0.2s;
                    cursor: default;
                }
                @media (max-width: 480px) {
                    .historyNav {
                        padding: 12px 16px;
                    }
                    .historyMain {
                        padding: 20px 12px;
                    }
                    .historyHeaderRow {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        margin-bottom: 24px;
                    }
                    .meetingCard {
                        padding: 12px;
                        gap: 10px;
                        flex-wrap: wrap;
                    }
                    .meetingCard > button {
                        width: 100%;
                        justify-content: center;
                    }
                    h1 {
                        font-size: 1.8rem !important;
                    }
                    .backBtnText {
                        display: none;
                    }
                    .historyNav button {
                        padding: 8px !important;
                    }
                }
            `}</style>
            
            {/* Navbar */}
            <nav className="historyNav">
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="BharatMeet Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        BharatMeet
                    </span>
                </div>

                <button onClick={() => routeTo("/home")} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.8)',
                    borderRadius: '10px', padding: '8px 16px',
                    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap', flexShrink: 0
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                    <ArrowBackIcon style={{ fontSize: '1.1rem' }} />
                    <span className="backBtnText">Back to Home</span>
                </button>
            </nav>

            {/* Main Content */}
            <main className="historyMain">
                {/* Header */}
                <div className="historyHeaderRow">
                    <div>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(255,152,57,0.15)',
                            border: '1px solid rgba(255,152,57,0.3)',
                            borderRadius: '999px', padding: '5px 14px',
                            fontSize: '0.78rem', fontWeight: 600,
                            color: '#FF9839', letterSpacing: '0.08em',
                            textTransform: 'uppercase', marginBottom: '16px',
                        }}>
                            <HistoryIcon style={{ fontSize: '0.9rem' }} />
                            Meeting History
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                            fontWeight: 800, letterSpacing: '-0.04em',
                            margin: '0 0 8px 0',
                        }}>
                            Your past{' '}
                            <span style={{
                                background: 'linear-gradient(90deg, #FF9839, #d97500)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>meetings</span>
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', margin: 0 }}>
                            {meetings.length > 0
                                ? `${meetings.length} meeting${meetings.length > 1 ? 's' : ''} found`
                                : 'No meetings yet'}
                        </p>
                    </div>
                    {meetings.length > 0 && (
                        <button onClick={handleClearHistory} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.25)',
                            color: '#ef4444',
                            borderRadius: '10px', padding: '10px 18px',
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                            <DeleteIcon style={{ fontSize: '1.2rem' }} />
                            Clear History
                        </button>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            border: '3px solid rgba(255,152,57,0.3)',
                            borderTopColor: '#d97500',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : meetings.length === 0 ? (
                    /* Empty state */
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', gap: '16px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        borderRadius: '20px', padding: '60px 40px',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '18px',
                            background: 'rgba(255,152,57,0.12)',
                            border: '1px solid rgba(255,152,57,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <VideocamIcon style={{ color: '#FF9839', fontSize: '2rem' }} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                            No meetings yet
                        </h3>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                            Your meeting history will appear here once you join or create a meeting.
                        </p>
                        <button onClick={() => routeTo('/home')} style={{
                            marginTop: '8px',
                            background: 'linear-gradient(135deg, #FF9839, #d97500)',
                            border: 'none', color: 'white',
                            borderRadius: '12px', padding: '12px 24px',
                            fontSize: '0.9rem', fontWeight: 600,
                            cursor: 'pointer',
                        }}>
                            Start a Meeting
                        </button>
                    </div>
                ) : (
                    /* Meeting cards grid */
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {meetings.map((e, i) => (
                            <div key={i} className="meetingCard"
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,152,57,0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(255,152,57,0.25)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: '46px', height: '46px', borderRadius: '12px',
                                    background: 'rgba(255,152,57,0.15)',
                                    border: '1px solid rgba(255,152,57,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <VideocamIcon style={{ color: '#FF9839', fontSize: '1.4rem' }} />
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        margin: '0 0 4px 0', fontWeight: 600,
                                        fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)',
                                        fontFamily: 'monospace', letterSpacing: '0.02em',
                                    }}>
                                        {e.meetingCode}
                                    </p>
                                    <p style={{
                                        margin: 0, fontSize: '0.8rem',
                                        color: 'rgba(255,255,255,0.4)',
                                    }}>
                                        {formatDate(e.date)}
                                    </p>
                                </div>

                                {/* Rejoin button */}
                                <button
                                    onClick={() => routeTo(`/${e.meetingCode}`)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: 'rgba(255,152,57,0.15)',
                                        border: '1px solid rgba(255,152,57,0.3)',
                                        color: '#FF9839',
                                        borderRadius: '10px', padding: '8px 14px',
                                        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(255,152,57,0.3)';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(255,152,57,0.15)';
                                        e.currentTarget.style.color = '#FF9839';
                                    }}
                                >
                                    <OpenInNewIcon style={{ fontSize: '0.9rem' }} />
                                    Rejoin
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <CopyrightFooter sx={{ position: "relative", bottom: "auto", transform: "none", left: "auto", marginTop: "1px", paddingBottom: "20px" }} />
            <DeveloperBadge />
        </div>
    )
}