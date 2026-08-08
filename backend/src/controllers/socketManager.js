import { Server } from "socket.io"


let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {   //Ye server sab users ko manage karta hai->socket.io.
    const io = new Server(server, {     //create a new instance of the Server class from the socket.io library and pass the server object as an argument. This allows the socket.io server to listen for incoming connections on the same port as the HTTP server.
        cors: {
            origin: "*",      //allow cross-origin requests from any domain. This is useful when the client and server are hosted on different domains or ports, as it allows the client to make requests to the server without being blocked by the browser's same-origin policy.
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],  // all headers allowed not do for production
            credentials: true   // cookies send permission allowed
        }
    });


    io.on("connection", (socket) => {     // (Jab bhi koi naya user server se connect kare, us user ka socket object bana do aur ye code execute karo.) on means listen/waiting ,connection is a event name here , connection means some new user is connected to the server, socket :Jab bhi koi user connect hota hai,Socket.IO us user ke liye ek object banata hai.Us object ko hum socket naam de rahe hain.Developer kuch bhi naam rakh sakta h.Ye object us user ki saari information rakhta hai.

        console.log("SOMETHING CONNECTED")

        socket.on("join-call", (path) => {  //io.on :-Ye server sunta hai, socket.on:-Ye ek particular user se aane wale events sunta hai.(Jab user "join-call" naam ka event bheje, tab ye code chalao.) join-call :-Socket.IO ka built-in event nahi hai Developer ne khud banaya hai. path :- is a parameter jiski value frontend bhejta h.

            if (connections[path] === undefined) {  //Kya ye room pehle se exist karta hai? Agar nahi karta to andar chale jao.
                connections[path] = []   // Us room ke liye ek empty array bana do.
            }
            connections[path].push(socket.id)  //user path ko id assign hoti h

            timeOnline[socket.id] = new Date();

            // connections[path].forEach(elem => {
            //     io.to(elem)
            // })

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])  //io.to:-Ye specific socket.id wale user ko message bhejta hai.Ye code ensure karta hai ki room me jitne bhi users hain, sabko pata chal jaye ki ek naya user join hua hai.Isi information ka use WebRTC me baad me peer connections banane ke liye hota hai.
            }

            if (messages[path] !== undefined) {          //Agar is room ki chat history hai Tab hi niche wala code chalao.
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],          //Ye code newly joined user ko room ki purani chat history bhejta hai.Room me jo users pehle se hain, unko ye messages dobara nahi bheje jaate. Sirf naye user ko milte hain taaki uski chat complete ho.
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])  //messages[path][a]['socket-id-sender'] :- Ye isliye bheja jaata hai taaki newly joined user ko pata chal jaye ki ye message kisne bheja tha. Iska use frontend me chat bubble ko align karne ke liye hota hai. Agar ye id match hoti hai to message right side me dikhega, warna left side me dikhega.
            }
        }

        })

        socket.on("signal", (toId, message) => {  // Ye code ek user ka signaling data doosre specific user tak pahunchata hai.Dhyan rahe:❌ Isme video,audio stream nahi ja rahi.✅ Sirf connection banane ke messages ja rahe hain.Isi signaling ke baad browsers aapas me direct WebRTC connection banate hain. (Parameter h)->message = connection banane wali information.
            io.to(toId).emit("signal", socket.id, message); //io.to:-Ye specific socket.id wale user ko message bhejta hai. toId:- Ye us user ka socket.id hai jisko ye message bhejna hai. socket.id:- Ye us user ka socket.id hai jisse ye message aa raha hai. message:- Ye connection banane wali information hai jo ek user se doosre user tak ja rahi hai.
        })

        socket.on("chat-message", (data, sender) => {  //yeh pura block ek hee ans dhund rha h ki "Jo user message bhej raha hai, wo kis room me hai?"

            const [matchingRoom, found] = Object.entries(connections)  //Object.entries:-Ye connections object ko ek array me convert kar deta hai jisme har element ek array hota hai jisme pehla element room ka naam hota hai aur doosra element us room me connected users ka array hota hai. (Example: connections = {room1: [user1, user2], room2: [user3]} => Object.entries(connections) = [[room1, [user1, user2]], [room2, [user3]]]) .reduce:-Ye array ke elements ko ek single value me reduce kar deta hai. (Example: [1, 2, 3].reduce((accumulator, currentValue) => accumulator + currentValue) = 6). accumulator:-Ye previous iteration ka result hota hai. currentValue:-Ye current iteration ka value hota hai.
                .reduce(([room, isFound], [roomKey, roomValue]) => {  


                    if (!isFound && roomValue.includes(socket.id)) {   //Kya ye user is room me hai? Agar haan to us room ka naam return kar do aur isFound ko true kar do. Agar nahi to agla room check karo.
                        return [roomKey, true];
                    }

                    return [room, isFound];        //Agar ye user is room me nahi hai to previous iteration ka result return kar do.

                }, ['', false]);   //initial value:- Ye initial value hai jo pehli iteration me use hoti hai.  (room = '', isFound = false)

            if (found === true) {    //Agar ye user kisi room me hai to niche wala code chalao.
                if (messages[matchingRoom] === undefined) {  //Agar is room ki chat history nahi hai to ek empty array bana do.
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })  // yeh msg ko store krta h.
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {    
                    io.to(elem).emit("chat-message", data, sender, socket.id) 
                })
            }

        })

        socket.on("disconnect", () => {   //Jab koi user disconnect ho jaye, usko room se hata do aur baaki sab users ko bata do ki wo chala gaya. socket.on:-Kisi event ka wait karo. Event:"disconnect",Ye Socket.IO ka built-in event hai.Ye kab chalta hai? Browser band ho gaya, Internet chala gaya, User page refresh kar diya, User tab close kar diya.

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())  // timeOnline[socket.id] :- Ye us user ka connection start hone ka time hai. new Date() :- Ye current time hai. diffTime :- Ye dono time ka difference hai. (in milliseconds)

            var key // key :- Ye us room ka naam hai jisme ye user tha. (Example: room1, room2)

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {  // for (const [k, v] of ...) :- Ye array ke elements ko iterate karta hai. k :- Ye current iteration ka room ka naam hai. v :- Ye current iteration ka us room me connected users ka array hai. JSON.parse(JSON.stringify(...)) :- Ye deep copy banata hai taaki original connections object me changes na ho.

                for (let a = 0; a < v.length; ++a) {   // v.length :- Ye us room me connected users ka count hai. a :- Ye current iteration ka index hai.
                    if (v[a] === socket.id) {    //Kya ye user is room me hai? Agar haan to us room ka naam return kar do aur loop break kar do.
                        key = k  // key = k :- Ye us room ka naam hai jisme ye user tha. (Example: room1, room2)

                        for (let a = 0; a < connections[key].length; ++a) {   // connections[key].length :- Ye us room me connected users ka count hai. a :- Ye current iteration ka index hai.
                            io.to(connections[key][a]).emit('user-left', socket.id) //io.to:-Ye specific socket.id wale user ko message bhejta hai. connections[key][a] :- Ye us room me connected users ka socket.id hai. 'user-left' :- Ye event name hai jo frontend me handle kiya jaata hai. socket.id :- Ye us user ka socket.id hai jisse ye message aa raha hai. Iska use frontend me chat bubble ko align karne ke liye hota hai. Agar ye id match hoti hai to message right side me dikhega, warna left side me dikhega.
                        }

                        var index = connections[key].indexOf(socket.id)  // index :- Ye us user ka index hai jisse ye message aa raha hai. connections[key].indexOf(socket.id) :- Ye us room me connected users ka array hai jisme se ye user ka index find kiya jaa raha hai. Agar user nahi milta to -1 return hota hai.

                        connections[key].splice(index, 1)  // splice :- Ye array ke elements ko remove karta hai. index :- Ye us user ka index hai jisse ye message aa raha hai. 1 :- Ye number of elements hai jo remove karne hain. (Example: connections[key] = [user1, user2, user3], index = 1 => connections[key].splice(index, 1) => connections[key] = [user1, user3])


                        if (connections[key].length === 0) {   // Agar is room me koi user nahi bacha hai to is room ko delete kar do.
                            delete connections[key]
                            // Jab room bilkul empty ho jaye, tab messages bhi clear kar do.
                            // Isse rejoin pe history milti hai, lekin new session fresh start hota hai.
                            if (messages[key] !== undefined) {
                                delete messages[key]
                            }
                        }
                    }
                }

            }


        })


    })


    return io;
}
