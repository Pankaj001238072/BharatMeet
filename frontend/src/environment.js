const server = process.env.NODE_ENV === "production" ?
    "https://YOUR_RENDER_BACKEND_URL.onrender.com" :
    "http://localhost:8000"

export default server;