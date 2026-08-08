const server = process.env.NODE_ENV === "production" ?
    "https://bharatmeet-app.onrender.com" :
    "http://localhost:8000"

export default server;