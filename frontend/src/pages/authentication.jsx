import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  createTheme,
  ThemeProvider,
} from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { Snackbar } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import InputAdornment from '@mui/material/InputAdornment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeveloperBadge from '../components/DeveloperBadge';
import CopyrightFooter from '../components/CopyrightFooter';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState();
  const [password, setPassword] = React.useState();
  const [name, setName] = React.useState();
  const [error, setError] = React.useState();
  const [message, setMessage] = React.useState();
  const [showPassword, setShowPassword] = React.useState(false);

  const [formState, setFormState] = React.useState(0);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } =
    React.useContext(AuthContext);

  React.useEffect(() => {
    if (location.state?.mode === "signup") {
      setFormState(1);
    }
  }, [location.state]);

  let handleAuth = async () => {
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);
      }
      if (formState === 1) {
        const result = await handleRegister(
          name,
          username,
          password,
        );
        setUsername("");
        setMessage(result);
        setOpen(true);
        setError("");
        setFormState(0);
        setPassword("");
      }
    } catch (err) {
      console.log(err);
      let message = err.response.data.message;
      setError(message);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        component="main"
        sx={{
          display: "flex",
          minHeight: "100vh",
          height: "100vh",
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            display: { xs: "none", sm: "block" },
            width: { sm: "41.6667%", md: "58.3333%" },
            flexShrink: 0,
            backgroundImage:
              "url('https://picsum.photos/1920/1080')",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            overflow: "hidden",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(12,18,38,0.25), rgba(12,18,38,0.45))",
            },
          }}
        />
        <Box
          component={Paper}
          className="aurora-bg"
          elevation={6}
          square
          sx={{
            width: {
              xs: "100%",
              sm: "58.3333%",
              md: "41.6667%",
            },
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div className="aurora-blob"></div>
          <IconButton
            onClick={() => navigate("/")}
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
          <Box
            sx={{
              width: "100%",
              maxWidth: 420,
              px: { xs: 3, sm: 4 },
              py: { xs: 4, sm: 6 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{ m: 1, bgcolor: "#d97500" }}
            >
              <LockOutlinedIcon />
            </Avatar>

            <div>
              <Button
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => setFormState(0)}
                sx={
                  formState === 0
                    ? { backgroundColor: "#d97500", color: "white", "&:hover": { backgroundColor: "#FF9839" } }
                    : { color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.3)", "&:hover": { borderColor: "#FF9839", color: "#FF9839" } }
                }
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => setFormState(1)}
                sx={[
                  { ml: 1 },
                  formState === 1
                    ? { backgroundColor: "#d97500", color: "white", "&:hover": { backgroundColor: "#FF9839" } }
                    : { color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.3)", "&:hover": { borderColor: "#FF9839", color: "#FF9839" } }
                ]}
              >
                Sign Up
              </Button>
            </div>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              {formState === 1 ? (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  sx={{
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#FF9839" },
                    "& .MuiOutlinedInput-root": {
                      color: "white",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                      "&.Mui-focused fieldset": { borderColor: "#FF9839" },
                    },
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px #0a0a0a inset !important",
                      WebkitTextFillColor: "white !important",
                    }
                  }}
                />
              ) : null}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus={formState === 0}
                onChange={(e) => setUsername(e.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF9839" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                    "&.Mui-focused fieldset": { borderColor: "#FF9839" },
                  },
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px #0a0a0a inset !important",
                    WebkitTextFillColor: "white !important",
                  }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                value={password}
                type={showPassword ? "text" : "password"}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{ color: "rgba(255,255,255,0.7)" }}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }
                }}
                sx={{
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#FF9839" },
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                    "&.Mui-focused fieldset": { borderColor: "#FF9839" },
                  },
                  "& input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0 1000px #0a0a0a inset !important",
                    WebkitTextFillColor: "white !important",
                  }
                }}
              />

              <p style={{ color: "#ef4444", fontSize: "0.9rem" }}>{error}</p>

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  backgroundColor: "#d97500", 
                  color: "white", 
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "#FF9839" } 
                }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Box>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          message={message}
        />
        <CopyrightFooter sx={{ left: { xs: "50%", sm: "20px" }, transform: { xs: "translateX(-50%)", sm: "none" }, width: { xs: "100%", sm: "auto" } }} />
        <DeveloperBadge />
      </Box>
    </ThemeProvider>
  );
}
