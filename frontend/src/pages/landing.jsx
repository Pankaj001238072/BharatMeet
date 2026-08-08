import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import DeveloperBadge from "../components/DeveloperBadge";
import CopyrightFooter from "../components/CopyrightFooter";

export default function LandingPage() {
  const router = useNavigate();

  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="BharatMeet Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <h2 style={{ margin: 0 }}>Connect with BharatMeet</h2>
        </div>
        <div className="navlist">
          <p
            onClick={() => {
              router("/join");
            }}
          >
            Join as Guest
          </p>

          <p
            onClick={() => {
              router("/auth", {
                state: { mode: "signup" },
              });
            }}
          >
            Register
          </p>

          <div
            onClick={() => {
              router("/auth");
            }}
            role="button"
          >
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#FF9839" }}>
              Connect
            </span>{" "}
            with your Loved Ones
          </h1>

          <p>Bring People Closer with BharatMeet</p>

          <div role="button">
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>

        <div>
          <img src="/mobile.png" alt="mobile_app" />
        </div>
      </div>

      <CopyrightFooter sx={{ position: "relative", bottom: "auto", transform: "none", left: "auto", marginTop: "20px", paddingBottom: "20px" }} />

      <DeveloperBadge />

    </div>
  );
}
