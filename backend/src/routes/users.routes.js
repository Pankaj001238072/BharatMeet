import { Router } from "express";
import { addToHistory, getUserHistory, login, register, clearAllHistory } from "../controllers/user.controller.js";  // import the login and register functions from the user.controller.js file. These functions are used to handle user authentication and registration requests. The addToHistory and getUserHistory functions are used to handle requests related to user activity history.



const router = Router();  // create a new router instance using the Router() method from the Express library. This router will be used to define routes for handling user-related requests.

router.route("/login").post(login)     //define a route for handling POST requests to the "/login" endpoint. When a POST request is made to this endpoint, the login function will be called to handle the request and perform the necessary login logic.
router.route("/register").post(register)
router.route("/add_to_activity").post(addToHistory)
router.route("/get_all_activity").get(getUserHistory)
router.route("/clear_all_activity").delete(clearAllHistory)

export default router;  //export the router instance so that it can be imported and used in other parts of the application, such as the main server file (app.js) where all routes are registered.