import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import VideocamIcon from '@mui/icons-material/Videocam';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import { AuthContext } from '../contexts/AuthContext';
import DeveloperBadge from '../components/DeveloperBadge';
import CopyrightFooter from '../components/CopyrightFooter';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [copied, setCopied] = useState(false);

    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    }

    const handleNewMeeting = async () => {
        const meetingCode = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7)
        try {
            await addToUserHistory(meetingCode)
            navigate(`/${meetingCode}`)
        } catch (err) {
            console.error("Failed to add to history:", err);
            if (err.response && err.response.status === 404) {
                alert("Your session is invalid or user not found. Please log out and sign in again.");
                localStorage.removeItem("token");
                navigate("/");
            } else {
                navigate(`/${meetingCode}`)
            }
        }
    }

    let handleCopyCode = () => {
        if (!meetingCode.trim()) return;
        navigator.clipboard.writeText(`${window.location.origin}/${meetingCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                .homeNav {
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
                .homeNavActions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .homeMain {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 40px;
                    gap: 80px;
                }
                .homeRightPanel {
                    flex: 0 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @media (max-width: 900px) {
                    .homeMain {
                        flex-direction: column;
                        padding: 40px 20px;
                        gap: 40px;
                        text-align: center;
                    }
                    .homeRightPanel {
                        width: 100%;
                    }
                }
                @media (max-width: 480px) {
                    .homeNav {
                        padding: 12px 16px;
                        flex-direction: column;
                        gap: 12px;
                    }
                    .homeNavActions {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .homeMain {
                        padding: 20px 12px;
                    }
                    h1 {
                        font-size: 1.8rem !important;
                    }
                    .homeActionCard {
                        padding: 16px !important;
                    }
                    .homeJoinRow {
                        flex-direction: column;
                        gap: 10px;
                    }
                    .homeJoinRow > div {
                        width: 100%;
                    }
                    .homeJoinRow > button, .homeJoinRow > div[data-mui-internal-clone-element] {
                        width: 100%;
                        justify-content: center;
                    }
                    .homeActionButtons {
                        display: flex;
                        gap: 10px;
                        width: 100%;
                    }
                    .homeActionButtons > button {
                        flex: 1;
                    }
                }
            `}</style>
            
            {/* Navbar */}
            <nav className="homeNav">
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="BharatMeet Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        BharatMeet
                    </span>
                </div>

                {/* Nav actions */}
                <div className="homeNavActions">
                    <button onClick={() => navigate("/history")} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.8)',
                        borderRadius: '10px', padding: '8px 16px',
                        cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                        transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    >
                        <RestoreIcon style={{ fontSize: '1.1rem' }} />
                        History
                    </button>
                    <button onClick={() => { localStorage.removeItem("token"); navigate("/"); }} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: '#f87171',
                        borderRadius: '10px', padding: '8px 16px',
                        cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                        transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                    >
                        <LogoutIcon style={{ fontSize: '1.1rem' }} />
                        Logout
                    </button>
                </div>
            </nav>

            <style>{`
                .homeMain {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 40px;
                    gap: 80px;
                }
                .homeRightPanel {
                    flex: 0 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @media (max-width: 900px) {
                    .homeMain {
                        flex-direction: column;
                        padding: 40px 20px;
                        gap: 40px;
                        text-align: center;
                    }
                    .homeRightPanel {
                        width: 100%;
                    }
                }
            `}</style>
            
            {/* Main Content */}
            <main className="homeMain">
                {/* Left panel */}
                <div style={{ maxWidth: '520px', flex: 1 }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(99,102,241,0.15)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '999px', padding: '5px 14px',
                        fontSize: '0.78rem', fontWeight: 600,
                        color: '#a5b4fc', letterSpacing: '0.08em',
                        textTransform: 'uppercase', marginBottom: '24px',
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', display: 'inline-block' }} />
                        Secure · Fast · HD Quality
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        letterSpacing: '-0.04em',
                        marginBottom: '16px',
                        margin: '0 0 16px 0',
                    }}>
                        Video calls that{' '}
                        <span style={{
                            background: 'linear-gradient(90deg, #818cf8, #c084fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            connect
                        </span>{' '}
                        everyone
                    </h1>

                    <p style={{
                        color: 'rgba(255,255,255,0.55)',
                        fontSize: '1.05rem', lineHeight: 1.65,
                        marginBottom: '40px', margin: '0 0 40px 0',
                    }}>
                        Start an instant meeting or join with a code. Premium quality video conferencing for everyone.
                    </p>

                    {/* Action Card */}
                    <div className="homeActionCard" style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        padding: '28px',
                        backdropFilter: 'blur(10px)',
                    }}>
                        {/* New Meeting Button */}
                        <button
                            onClick={handleNewMeeting}
                            style={{
                                width: '100%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '14px', padding: '16px 24px',
                                fontSize: '1rem', fontWeight: 700,
                                cursor: 'pointer',
                                marginBottom: '20px',
                                boxShadow: '0 8px 30px rgba(99,102,241,0.35)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(99,102,241,0.45)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.35)'; }}
                        >
                            <VideocamIcon />
                            New Meeting
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>or join with code</span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        </div>

                        {/* Join Row */}
                        <div className="homeJoinRow" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <SearchIcon style={{
                                    position: 'absolute', left: '12px', top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'rgba(255,255,255,0.3)', fontSize: '1.1rem',
                                }} />
                                <input
                                    type="text"
                                    placeholder="Enter meeting code"
                                    value={meetingCode}
                                    onChange={e => setMeetingCode(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleJoinVideoCall()}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '12px',
                                        padding: '13px 14px 13px 38px',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                />
                            </div>
                            <div className="homeActionButtons" style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleJoinVideoCall}
                                    style={{
                                        background: meetingCode.trim() ? 'rgba(99,102,241,0.85)' : 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white', borderRadius: '12px',
                                        padding: '13px 22px', cursor: 'pointer',
                                        fontSize: '0.95rem', fontWeight: 600,
                                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => meetingCode.trim() && (e.currentTarget.style.background = 'rgba(99,102,241,1)')}
                                    onMouseLeave={e => e.currentTarget.style.background = meetingCode.trim() ? 'rgba(99,102,241,0.85)' : 'rgba(255,255,255,0.08)'}
                                >
                                    Join
                                </button>
                                <Tooltip title={copied ? "Copied!" : "Copy link"}>
                                    <button
                                        onClick={handleCopyCode}
                                        style={{
                                            background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                                            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                            color: copied ? '#4ade80' : 'rgba(255,255,255,0.5)',
                                            borderRadius: '12px', padding: '13px',
                                            cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', transition: 'all 0.2s',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {copied ? <CheckIcon style={{ fontSize: '1.1rem' }} /> : <ContentCopyIcon style={{ fontSize: '1.1rem' }} />}
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* Feature Pills */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
                        {['🔒 End-to-end secure', '📹 HD Video', '💬 Live chat', '🖥️ Screen share'].map(f => (
                            <span key={f} style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '999px', padding: '5px 12px',
                                fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)',
                            }}>{f}</span>
                        ))}
                    </div>
                </div>

                {/* Right panel — image */}
                <div className="homeRightPanel">
                    <div style={{
                        position: 'relative',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        <img
                            src="/logo3.png"
                            alt="BharatMeet"
                            style={{ width: 'clamp(220px, 28vw, 380px)', height: 'auto', display: 'block' }}
                        />
                        {/* Overlay gradient */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(180deg, transparent 60%, rgba(15,23,42,0.6) 100%)',
                            pointerEvents: 'none',
                        }} />
                    </div>
                </div>
            </main>
            <CopyrightFooter sx={{ position: "relative", bottom: "auto", transform: "none", left: "auto", marginTop: "1px", paddingBottom: "20px" }} />
            <DeveloperBadge />
        </div>
    )
}

export default withAuth(HomeComponent)