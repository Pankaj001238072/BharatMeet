import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
    {
        user_id: {type: String, required: true},
        meetingCode: {type: String, required: true},
        date: {type: Date, default: Date.now, required: true},
    }
)
    
const Meeting = mongoose.model("Meeting", meetingSchema);  //create a model named "Meeting" using the meetingSchema defined above. This model will be used to interact with the "meetings" collection in the MongoDB database.

export { Meeting };  //export the Meeting model so that it can be imported and used in other parts of the application, such as controllers or routes, to perform CRUD operations on meeting data.
// {Meeting} yeh hmm jb use krte h jb hmko multiple models ko ek hi file me define krna hota h to usko export krte h. but jb hmko sirf ek hi model ko export krna hota h to usko default export krte h.