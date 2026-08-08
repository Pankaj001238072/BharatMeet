import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  IconButton,
  TextField,
  Tooltip,
  Snackbar,
} from "@mui/material";
import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ShareIcon from "@mui/icons-material/Share";
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import server from "../environment";
import DeveloperBadge from "../components/DeveloperBadge";
import CopyrightFooter from "../components/CopyrightFooter";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const server_url = server;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let isCleaningUpRef = useRef(false);
  // effectiveRoomRef stores the actual room path to use for socket join-call.
  // For /join guests, this is set to the entered room code before connecting.
  let effectiveRoomRef = useRef(null);

  const { url } = useParams(); // undefined when on /join route
  const navigate = useNavigate();
  const isGuestJoinPage = !url; // true when route is /join (no :url param)

  let localVideoref = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState([]);

  let [audio, setAudio] = useState();

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(false); //Chat box open hai ya band.
  const showModalRef = useRef(showModal);
  useEffect(() => {
    showModalRef.current = showModal;
  }, [showModal]);

  let [screenAvailable, setScreenAvailable] = useState();
  let [hasPreview, setHasPreview] = useState(false);

  let [messages, setMessages] = useState([]); //Saare chat messages.

  let [message, setMessage] = useState(""); //Input box mein jo user type kar raha hai.

  let [newMessages, setNewMessages] = useState(0); //Unread messages.

  const getInitialUsername = () => {
    try {
      const savedNames = JSON.parse(localStorage.getItem("meetingNames") || "{}");
      const pathCode = window.location.pathname.substring(1);
      if (pathCode && pathCode !== "guest" && savedNames[pathCode]) {
        return savedNames[pathCode];
      }
    } catch (e) {}
    return "";
  };
  
  const initialName = getInitialUsername();
  let [askForUsername, setAskForUsername] = useState(!initialName);
  let [username, setUsername] = useState(initialName);
  let [usernameError, setUsernameError] = useState("");

  // Only used when guest arrives at /join without a specific room in the URL
  let [guestRoomCode, setGuestRoomCode] = useState("");
  let [guestRoomError, setGuestRoomError] = useState("");
  let [linkCopied, setLinkCopied] = useState(false);

  const videoRef = useRef([]); //Saare video elements ka reference store karne ke liye.

  let [videos, setVideos] = useState([]); // Saare video elements ka state store karne ke liye.

  // Inline styles
  const textPrimary = "rgba(255, 255, 255, 0.7)";
  const inputBg = "rgba(255, 255, 255, 0.06)";
  const inputText = "white";
  const inputBorder = "rgba(255, 255, 255, 0.12)";
  const inputBorderHover = "rgba(255, 152, 57, 0.6)"; // Orange hover
  const inputBorderFocus = "#FF9839"; // Orange focus
  const sectionLabelColor = "#FF9839";
  const shareBg = "rgba(255, 255, 255, 0.06)";
  const shareBorder = "rgba(255, 255, 255, 0.12)";
  const shareText = "rgba(255, 255, 255, 0.9)";
  const iconColor = "#FF9839";
  const successColor = "#4ade80";

  // TODO
  // if(isChrome() === false) {

  // }

  useEffect(() => {
    if (initialName) {
      effectiveRoomRef.current = window.location.pathname;
      getMedia();
    } else {
      getPermissions();
    }

    return () => {
      cleanupSession();
    };
  }, []);

  let getDislayMedia = () => {
    //Screen share ke liye permission mangna.
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  const getPermissions = async () => {
    try {
      const devices =
        await navigator.mediaDevices.enumerateDevices();
      setVideoAvailable(
        devices.some(
          (device) => device.kind === "videoinput",
        ),
      );
      setAudioAvailable(
        devices.some(
          (device) => device.kind === "audioinput",
        ),
      );

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const streamInitializedRef = useRef(false);

  useEffect(() => {
    if (video !== undefined && audio !== undefined && !streamInitializedRef.current) {
      streamInitializedRef.current = true;
      getUserMedia();
      console.log("SET STATE HAS ", video, audio);
    }
  }, [video, audio]);
  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream
        .getTracks()
        .forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoref.current) {
      localVideoref.current.srcObject = stream;
    }
    setHasPreview(true);

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        //offer create karne ke baad local description set karna aur server ko signal bhejna.
        console.log(description);
        connections[id]
          .setLocalDescription(description) //offer set karne ke baad server ko signal bhejna.
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({
                sdp: connections[id].localDescription,
              }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          if (isCleaningUpRef.current) {
            return;
          }

          setVideo(false);
          setAudio(false);

          try {
            let tracks =
              localVideoref.current?.srcObject?.getTracks() ||
              [];
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          if (localVideoref.current) {
            localVideoref.current.srcObject =
              window.localStream;
          }

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id]
              .createOffer()
              .then((description) => {
                connections[id]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id,
                      JSON.stringify({
                        sdp: connections[id]
                          .localDescription,
                      }),
                    );
                  })
                  .catch((e) => console.log(e));
              });
          }
        }),
    );
  };

  let getUserMedia = () => {
    // Ye function user se video aur audio ka access mangta hai. Agar user ne access diya hai to local video stream set kar deta hai aur server ko signal bhejta hai. Agar user ne access nahi diya hai to local video stream ko stop kar deta hai.
    if (
      (video && videoAvailable) ||
      (audio && audioAvailable)
    ) {
      //video user access check krta h aur videoavailable check krta h video device mein available h ya nhi
      navigator.mediaDevices
        .getUserMedia({ 
          video: video ? { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }
          } : false, 
          audio: audio ? { 
            echoCancellation: true, 
            noiseSuppression: true, 
            autoGainControl: true,
            latency: 0
          } : false 
        })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks =
          localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  let getDislayMediaSuccess = (stream) => {
    //ye function screen share ke liye permission mangta hai. Agar user ne access diya hai to local video stream set kar deta hai aur server ko signal bhejta hai. Agar user ne access nahi diya hai to local video stream ko stop kar deta hai.
    console.log("HERE");
    try {
      window.localStream
        .getTracks()
        .forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoref.current) {
      localVideoref.current.srcObject = stream;
    }
    setHasPreview(true);

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({
                sdp: connections[id].localDescription,
              }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          if (isCleaningUpRef.current) {
            return;
          }

          setScreen(false);

          try {
            let tracks =
              localVideoref.current?.srcObject?.getTracks() ||
              [];
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          if (localVideoref.current) {
            localVideoref.current.srcObject =
              window.localStream;
          }

          getUserMedia();
        }),
    );
  };

  let gotMessageFromServer = (fromId, message) => {
    //ye function server se signal receive karta hai. Agar signal mein sdp hai to remote description set kar deta hai aur agar signal mein ice hai to ice candidate add kar deta hai.
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(
            new RTCSessionDescription(signal.sdp),
          )
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId]
                            .localDescription,
                        }),
                      );
                    })
                    .catch((e) => console.log(e)); //browser answer save nhi kar paya to error aayega
                })
                .catch((e) => console.log(e)); //answer create nhi kar paya to error aayega
            }
          })
          .catch((e) => console.log(e)); //offer set karne mein error aayega to ye catch block chalega
      }

      if (signal.ice) {
        //Ye WebRTC ka last step hota hai. Agar Offer aur Answer "baat karne ki permission" hain, to ICE "kis raste se baat karni hai" batata hai.
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, {
      secure: false,
    });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      // Use effectiveRoomRef if set (guest join case), otherwise fall back to pathname.
      const roomKey = effectiveRoomRef.current || window.location.pathname;
      socketRef.current.emit(
        "join-call",
        roomKey,
      );
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) =>
          videos.filter((video) => video.socketId !== id),
        );
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;
          if (connections[socketListId]) return;

          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate =
            function (event) {
              if (event.candidate != null) {
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({ ice: event.candidate }),
                );
              }
            };

          // Wait for their video stream
          connections[socketListId].onaddstream = (
            event,
          ) => {
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID: ", socketListId);

            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId,
            );

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Update the stream of the existing video
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video,
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          // Add the local video stream
          if(window.localStream) connections[socketListId].addStream(window.localStream);
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(
                window.localStream,
              );
            } catch (e) {}

            connections[id2]
              .createOffer()
              .then((description) => {
                connections[id2]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id2,
                      JSON.stringify({
                        sdp: connections[id2]
                          .localDescription,
                      }),
                    );
                  })
                  .catch((e) => console.log(e));
              });
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(
      ctx.createMediaStreamDestination(),
    );
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], {
      enabled: false,
    });
  };
  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(
      document.createElement("canvas"),
      { width, height },
    );
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], {
      enabled: false,
    });
  };

  let handleVideo = () => {
    setVideo(!video);
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach(track => {
        track.enabled = !video;
      });
    }
  };
  let handleAudio = () => {
    setAudio(!audio);
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach(track => {
        track.enabled = !audio;
      });
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
  }, [screen]);
  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleEndCall = () => {
    cleanupSession();
    if (localStorage.getItem("token")) {
      window.location.href = "/home";
    } else {
      window.location.href = "/";
    }
  };

  const cleanupSession = () => {
    isCleaningUpRef.current = true;
    if (streamInitializedRef) streamInitializedRef.current = false;

    try {
      if (window.localStream) {
        window.localStream
          .getTracks()
          .forEach((track) => track.stop());
      }
    } catch (e) {}

    if (localVideoref.current) {
      localVideoref.current.srcObject = null;
    }

    window.localStream = null;

    Object.values(connections).forEach((peerConnection) => {
      try {
        peerConnection.onicecandidate = null;
        peerConnection.onaddstream = null;
        peerConnection.close();
      } catch (e) {}
    });
    connections = {};

    if (socketRef.current) {
      try {
        socketRef.current.off();
        socketRef.current.disconnect();
      } catch (e) {}
      socketRef.current = null;
    }

    isCleaningUpRef.current = false;
  };

  let openChat = () => {
    setModal(true);
    setNewMessages(0);
  };
  let closeChat = () => {
    setModal(false);
  };
  let handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      if (!showModalRef.current) {
        setNewMessages(
          (prevNewMessages) => prevNewMessages + 1,
        );
      }
    }
  };

  let sendMessage = () => {
    if (!message.trim()) return;
    
    socketRef.current.emit(
      "chat-message",
      message,
      username,
    );
    setMessage("");
  };

  // Generate a random unguessable room code
  let generateRoomCode = () => {
    const code = crypto.randomUUID().replace(/-/g, "").substring(0, 10);
    setGuestRoomCode(code);
    setGuestRoomError("");
  };

  // Copy the shareable link to clipboard
  let handleCopyLink = () => {
    if (!guestRoomCode.trim()) return;
    const link = `${window.location.origin}/${guestRoomCode.trim()}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Native share (mobile) or fallback to copy
  let handleShareLink = async () => {
    if (!guestRoomCode.trim()) return;
    const link = `${window.location.origin}/${guestRoomCode.trim()}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join my BharatMeet room", url: link });
      } catch (_) {}
    } else {
      handleCopyLink();
    }
  };

  let connect = () => {
    if (!username.trim()) {
      setUsernameError("Display name is required to join");
      return;
    }
    setUsernameError("");

    if (isGuestJoinPage) {
      const code = guestRoomCode.trim();
      if (!code) {
        setGuestRoomError("Please enter the meeting code.");
        return;
      }
      effectiveRoomRef.current = "/" + code;
      navigate("/" + code, { replace: true });
    } else {
      effectiveRoomRef.current = window.location.pathname;
    }
    
    try {
      const savedNames = JSON.parse(localStorage.getItem("meetingNames") || "{}");
      const finalCode = effectiveRoomRef.current.substring(1);
      savedNames[finalCode] = username;
      localStorage.setItem("meetingNames", JSON.stringify(savedNames));
    } catch (e) {}
    
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername === true ? (
        <div className={styles.lobbyContainer}>
          <IconButton
            onClick={() => {
              if (localStorage.getItem("token")) {
                navigate("/home");
              } else {
                navigate("/");
              }
            }}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              color: "rgba(255,255,255,0.7)",
              "&:hover": { color: "white", backgroundColor: "rgba(255,255,255,0.1)" }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <div className={styles.lobbyCard}>
            <div className={styles.lobbyMain}>
              <div className={styles.lobbyCopy}>
                <div className={styles.lobbyKicker} style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                  <img src="/logo.png" alt="Logo" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                  BharatMeet meeting lobby
                </div>
                <h2 className={styles.lobbyTitle}>
                  Prepare before you join
                </h2>
                <p className={styles.lobbyDescription}>
                  Enter your display name, check your
                  camera, and join the room with a clean
                  setup.
                </p>

                <div className={styles.lobbyPills}>
                  <span>Secure access</span>
                  <span>Camera preview</span>
                  <span>Fast connect</span>
                </div>
              </div>

              <div className={styles.lobbyFormRow}>
                <TextField
                  id="outlined-basic"
                  label="Display name"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError("");
                  }}
                  error={!!usernameError}
                  helperText={usernameError}
                  variant="outlined"
                  fullWidth
                  sx={{
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#FF9839" },
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
                      "&:hover fieldset": { borderColor: "rgba(255, 152, 57, 0.6)" },
                      "&.Mui-focused fieldset": { borderColor: "#FF9839" },
                    },
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px #1e1e1e inset !important",
                      WebkitTextFillColor: "white !important",
                    }
                  }}
                />
                <Button
                  className={styles.lobbyConnectButton}
                  variant="contained"
                  onClick={connect}
                >
                  Connect
                </Button>
              </div>

              {!isGuestJoinPage && (
                <div style={{
                  marginTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}>
                  <p style={{ margin: 0, color: sectionLabelColor, fontSize: "0.88rem", fontWeight: 600, letterSpacing: "0.04em" }}>
                    SHARE THIS MEETING
                  </p>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: shareBg,
                    border: `1px solid ${shareBorder}`,
                    borderRadius: "10px",
                    padding: "10px 14px",
                  }}>
                    <span style={{
                      flex: 1,
                      fontSize: "0.82rem",
                      color: shareText,
                      wordBreak: "break-all",
                      fontFamily: "monospace",
                    }}>
                      {window.location.href}
                    </span>
                    <Tooltip title={linkCopied ? "Copied!" : "Copy link"}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2500);
                        }}
                        sx={{ color: linkCopied ? successColor : iconColor }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share">
                      <IconButton
                        size="small"
                        onClick={async () => {
                          const link = window.location.href;
                          if (navigator.share) {
                            try { await navigator.share({ title: "Join my BharatMeet room", url: link }); } catch (_) {}
                          } else {
                            navigator.clipboard.writeText(link);
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2500);
                          }
                        }}
                        sx={{ color: iconColor }}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              )}

              {isGuestJoinPage && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>

                  <p style={{ margin: 0, color: sectionLabelColor, fontSize: "0.88rem", fontWeight: 600, letterSpacing: "0.04em" }}>
                    MEETING CODE
                  </p>

                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <TextField
                      id="guest-room-code"
                      label="Enter or generate a code"
                      placeholder="e.g. a3f9b2c1d4"
                      value={guestRoomCode}
                      onChange={(e) => {
                        setGuestRoomCode(e.target.value);
                        setGuestRoomError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && connect()}
                      variant="outlined"
                      fullWidth
                      error={!!guestRoomError}
                      helperText={guestRoomError || " "}
                      sx={{
                        "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#FF9839" },
                        "& .MuiOutlinedInput-root": {
                          color: "white",
                          backgroundColor: "rgba(255, 255, 255, 0.06)",
                          "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
                          "&:hover fieldset": { borderColor: "rgba(255, 152, 57, 0.6)" },
                          "&.Mui-focused fieldset": { borderColor: "#FF9839" },
                        },
                        "& input:-webkit-autofill": {
                          WebkitBoxShadow: "0 0 0 1000px #1e1e1e inset !important",
                          WebkitTextFillColor: "white !important",
                        }
                      }}
                    />
                    <Tooltip title="Generate random code">
                      <IconButton
                        onClick={generateRoomCode}
                        sx={{
                          mt: "8px",
                          background: inputBg,
                          color: iconColor,
                          border: `1px solid ${inputBorder}`,
                          "&:hover": { background: "rgba(255,255,255,0.12)" },
                        }}
                      >
                        <AutorenewIcon />
                      </IconButton>
                    </Tooltip>
                  </div>

                  {guestRoomCode.trim() && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: shareBg,
                      border: `1px solid ${shareBorder}`,
                      borderRadius: "10px",
                      padding: "10px 14px",
                    }}>
                      <span style={{
                        flex: 1,
                        fontSize: "0.82rem",
                        color: shareText,
                        wordBreak: "break-all",
                        fontFamily: "monospace",
                      }}>
                        {`${window.location.origin}/${guestRoomCode.trim()}`}
                      </span>
                      <Tooltip title={linkCopied ? "Copied!" : "Copy link"}>
                        <IconButton
                          size="small"
                          onClick={handleCopyLink}
                          sx={{ color: linkCopied ? successColor : iconColor }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share">
                        <IconButton
                          size="small"
                          onClick={handleShareLink}
                          sx={{ color: iconColor }}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}

                </div>
              )}

            </div>

            <div className={styles.lobbyPreviewWrap}>
              <div className={styles.lobbyPreviewCard}>
                <div className={styles.lobbyPreviewHeader}>
                  <span>Camera preview</span>
                  <span>Ready</span>
                </div>
                <div className={styles.lobbyPreviewStage}>
                  <video
                    ref={localVideoref}
                    autoPlay
                    muted
                    className={styles.lobbyPreview}
                  ></video>
                  {hasPreview === false ? (
                    <div
                      className={styles.lobbyPreviewOverlay}
                    >
                      <div className={styles.previewIcon}>
                        VV
                      </div>
                      <p>
                        Preview will appear here before you
                        connect.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <CopyrightFooter sx={{ position: "static", transform: "none", marginTop: "auto" }} />
          <DeveloperBadge />
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          <DeveloperBadge position="left" hideOnMobile={true} />
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Live Chat</h1>

                <div className={styles.chattingDisplay}>
                  {messages.length !== 0 ? (
                    messages.map((item, index) => {
                      return (
                        <div
                          className={styles.chatMessageWrapper}
                          key={index}
                        >
                          <p className={styles.chatMessageSender}>
                            {item.sender}
                          </p>
                          <p className={styles.chatMessageData}>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: "40px" }}>No Messages Yet</p>
                  )}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) =>
                      setMessage(e.target.value)
                    }
                    id="outlined-basic"
                    label="Type a message..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#FF9839" },
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                        "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)", borderRadius: "10px" },
                        "&:hover fieldset": { borderColor: "rgba(255, 152, 57, 0.6)" },
                        "&.Mui-focused fieldset": { borderColor: "#FF9839" },
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={sendMessage}
                    sx={{ 
                      backgroundColor: "#d97500", 
                      color: "white", 
                      height: "40px",
                      borderRadius: "10px",
                      "&:hover": { backgroundColor: "#FF9839" },
                      boxShadow: "none"
                    }}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Watermark Logo */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(0,0,0,0.3)',
            padding: '8px 12px',
            borderRadius: '12px',
            backdropFilter: 'blur(4px)'
          }}>
            <img src="/logo.png" alt="BharatMeet Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            <span style={{ color: 'white', fontWeight: 600, fontSize: '1.1rem', letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>BharatMeet</span>
          </div>

          <div className={styles.buttonContainers}>
            <IconButton
              onClick={handleVideo}
              style={{ color: "white" }}
            >
              {video === true ? (
                <VideocamIcon />
              ) : (
                <VideocamOffIcon />
              )}
            </IconButton>
            <IconButton
              onClick={handleEndCall}
              style={{ color: "red" }}
            >
              <CallEndIcon />
            </IconButton>
            <IconButton
              onClick={handleAudio}
              style={{ color: "white" }}
            >
              {audio === true ? (
                <MicIcon />
              ) : (
                <MicOffIcon />
              )}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton
                onClick={handleScreen}
                style={{ color: "white" }}
              >
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge
              badgeContent={newMessages}
              max={999}
              color="orange"
            >
              <IconButton
                onClick={() => setModal(!showModal)}
                style={{ color: "white" }}
              >
                <ChatIcon />{" "}
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
          ></video>

          <div className={`${styles.conferenceView} ${showModal ? styles.withChat : ''}`}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
