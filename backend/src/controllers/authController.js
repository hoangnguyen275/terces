import bcrypt from "bcrypt";
import User from "../models/User.js";
import Session from "../models/Session.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_TTL = "30m"; // usually is 15 mins, but this one for testing
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days in miliseconds

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "can't have without username, password, email, firstName, or lastName",
      });
    }

    // check username already existed or not
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({ message: "username already existed" });
    }

    // encrypt password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10 (salt rounds)

    // create new user
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    // return
    return res.sendStatus(204);
  } catch (error) {
    console.error("error when call signUp", error);
    return res.status(500).json({ message: "system error" });
  }
};

export const signIn = async (req, res) => {
  try {
    // get Input
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "don't have username or password" });
    }

    // get hashedPassword in database to compare with password input
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "wrong username or password" });
    }

    // check the password
    const correctPassword = await bcrypt.compare(password, user.hashedPassword);

    if (!correctPassword) {
      return res.status(401).json({ message: "wrong username or password" });
    }

    // if valid, create accessToken with JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // create refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // save refresh token in a session or database
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // save refresh token in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    // send access token in the response
    return res
      .status(200)
      .json({ message: `User ${user.displayName} is logged in!`, accessToken });
  } catch (error) {
    console.error("error when call signIn", error);
    return res.status(500).json({ message: "system error" });
  }
};

export const signOut = async (req, res) => {
  try {
    // take refresh token from cookie
    const token = req.cookies?.refreshToken;

    if (token) {
      // delete refresh token in Session
      await Session.deleteOne({refreshToken: token});

      // delete cookie
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("error when call signOut", error);
    return res.status(500).json({ message: "system error" });
  }
};
