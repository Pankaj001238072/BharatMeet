import httpStatus from "http-status";
import { User } from "../models/user.model.js"; //import the User model from the specified file path. This model is used to interact with the "users" collection in the MongoDB database. The User model is defined using Mongoose, which is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a schema-based solution to model the application data and includes built-in type casting, validation, query building, business logic hooks and more.
import bcrypt, { hash } from "bcryptjs"; //bcrypt is a library that is used to hash the password and to compare the hashed password with the plain text password. It is used to store the password in the database in a secure way. It is also used to verify the user during login. It is also used to keep the user logged in by storing the token in the local storage.
import crypto from "crypto"; //crypto is a library that is used to generate a random token. It is used to keep the user logged in by storing the token in the local storage. It is also used to verify the user during login. It is also used to store the token in the database in a secure way.
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({
        message: "Username and password are required",
      });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (isPasswordCorrect) {
      let token = crypto.randomBytes(20).toString("hex"); //generate a random token using crypto library. The token is used to keep the user logged in. The token is stored in the local storage of the browser. The token is also sent to the server in the request header. The server verifies the token and allows the user to access the protected routes.

      user.token = token; //store the token in the user object. The token is stored in the database in the "users" collection. The token is also sent to the client in the response header. The client stores the token in the local storage of the browser. The client sends the token to the server in the request header. The server verifies the token and allows the user to access the protected routes.

      await user.save(); //save the new user to the database.

      return res
        .status(httpStatus.OK)
        .json({
          message: "Login successful",
          token: token,
        }); //send a response with status code 200 (OK) and a message indicating that the user has been logged in successfully along with the token.
    } else {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid Username or password" }); //send a response with status code 401 (Unauthorized) and a message indicating that the password is invalid.
    }
  } catch (e) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong ${e}` }); //send a response with a message indicating that something went wrong and the error message.
  }
};

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); //hash the password using bcrypt with a salt round of 10. Salt is a random string that is added to the password before hashing to make it more secure. The higher the salt round, the more secure the password will be but it will take more time to hash the password.

    const newUser = new User({
      //create a new user using the User model defined in the user.model.js file. The User model is used to interact with the "users" collection in the MongoDB database. The new user is created with the name, username, and hashed password.
      name: name,
      username: username,
      password: hashedPassword,
    });

    await newUser.save(); //save the new user to the database.

    res
      .status(httpStatus.CREATED)
      .json({ message: "User registered successfully" }); //send a response with status code 201 (Created) and a message indicating that the user has been registered successfully.
  } catch (e) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: `Something went wrong ${e}` }); //send a response with a message indicating that something went wrong and the error message.
  }
};


const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }
    const meetings = await Meeting.find({ user_id: user.username })
    res.json(meetings)
  } catch (e) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong ${e}` })
  }
}

const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }

    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meeting_code
    })

    await newMeeting.save();

    res.status(httpStatus.CREATED).json({ message: "Added code to history" })
  } catch (e) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong ${e}` })
  }
}

const clearAllHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    }
    await Meeting.deleteMany({ user_id: user.username });
    res.status(httpStatus.OK).json({ message: "History cleared successfully" });
  } catch (e) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong ${e}` });
  }
}


export { login, register, getUserHistory, addToHistory, clearAllHistory };
