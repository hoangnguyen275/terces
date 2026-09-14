import jwt from "jsonwebtoken";
import User from "../models/User.js";

// authorize who is user
export const protectedRoute = (req, res, next) => {
  try {
    // take access token from header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer "access token"

    if (!token) {
      return res.status(401).json({ message: "can't find access token" });
    }

    // verify valid token
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          console.error(err);
          return res
            .status(403)
            .json({ message: "Access token is expired or wrong" });
        }

        // find user
        const user = await User.findById(decodedUser.userId).select(
          "-hashedPassword",
        ); // take all informations except password

        if (!user) {
          return res.status(404).json({ message: "user is not existed" });
        }

        //return user in req
        req.user = user;
        next();
      },
    );
  } catch (error) {
    console.error("Error when call signOut", error);
    return res.status(500).json({ message: "System error" });
  }
};
