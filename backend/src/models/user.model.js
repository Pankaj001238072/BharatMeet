import mongoose, { Schema } from "mongoose";


const userSchema = new Schema(
    {
        name: {type: String, required: true},
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        token: {type: String},  //token is used to verify the user and to keep the user logged in. local storage me hmm sirf token rkhegey bakki sb hm fetch krke use krengey.
        // token ko req:true esliye nhi liya kyuki user jb tk register nhi hoga to usko token nhi milega. token ko optional liya hai.

    }
)

const User = mongoose.model("User", userSchema);  //create a model named "User" using the userSchema defined above. This model will be used to interact with the "users" collection in the MongoDB database.

export { User };  //export the User model so that it can be imported and used in other parts of the application, such as controllers or routes, to perform CRUD operations on user data.