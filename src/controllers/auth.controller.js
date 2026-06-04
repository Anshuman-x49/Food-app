import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Issue a refresh token (contains only userId) and an access token
 * (contains userId + sessionId). Creates a new session document.
 */
const issueTokens = async (userId, ip, userAgent) => {
  const refreshToken = jwt.sign({ id: userId }, config.jwt_secret, {
    expiresIn: "7d",
  });

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  const session = await sessionModel.create({
    userId,
    refreshTokenHash,
    ip,
    userAgent,
  });

  const accessToken = jwt.sign(
    { id: userId, sessionId: session._id },
    config.jwt_secret,
    { expiresIn: "15m" }
  );

  return { refreshToken, accessToken, session };
};

/**
 * Verify a JWT and return the decoded payload.
 * Returns null if the token is invalid or expired.
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt_secret);
  } catch {
    return null;
  }
};

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * @desc   Register a new user
 * @route  POST /api/v1/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const userExists = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "A user with that email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    const { refreshToken, accessToken } = await issueTokens(
      user._id,
      req.ip,
      req.headers["user-agent"]
    );

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken,
      },
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while registering the user. Please try again.",
    });
  }
};

/**
 * @desc   Login an existing user
 * @route  POST /api/v1/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email or username along with a password",
      });
    }

    const user = await userModel.findOne({ $or: [{ username }, { email }] });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { refreshToken, accessToken } = await issueTokens(
      user._id,
      req.ip,
      req.headers["user-agent"]
    );

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        accessToken,
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while logging in. Please try again.",
    });
  }
};

/**
 * @desc   Get the currently authenticated user
 * @route  GET /api/v1/auth/get-me
 * @access Private (requires valid access token in Authorization header)
 */
const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No access token provided",
      });
    }

    const accessToken = authHeader.split(" ")[1];
    const decoded = verifyToken(accessToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    // Ensure the session is still active
    const session = await sessionModel.findOne({
      _id: decoded.sessionId,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session has been revoked or does not exist",
      });
    }

    const user = await userModel
      .findById(decoded.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the user. Please try again.",
    });
  }
};

/**
 * @desc   Issue a new access token (and rotate the refresh token)
 * @route  POST /api/v1/auth/refresh-token
 * @access Private (requires valid refresh token cookie)
 */
const refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const decoded = verifyToken(oldRefreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Find the most recent non-revoked session for this user
    const session = await sessionModel
      .findOne({ userId: decoded.id, revoked: false })
      .sort({ createdAt: -1 });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "No active session found",
      });
    }

    // Validate the incoming refresh token against the stored hash
    const isTokenValid = await bcrypt.compare(
      oldRefreshToken,
      session.refreshTokenHash
    );

    if (!isTokenValid) {
      // Possible token reuse — revoke the session as a security measure
      session.revoked = true;
      await session.save();
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid. Please log in again.",
      });
    }

    // Rotate: revoke old session and issue fresh tokens
    session.revoked = true;
    await session.save();

    const {
      refreshToken: newRefreshToken,
      accessToken,
    } = await issueTokens(decoded.id, req.ip, req.headers["user-agent"]);

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while refreshing the token. Please try again.",
    });
  }
};

/**
 * @desc   Logout the current user
 * @route  POST /api/v1/auth/logout
 * @access Private (requires valid refresh token cookie)
 */
const logoutUser = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(400).json({
        success: false,
        message: "No active session found",
      });
    }

    const decoded = verifyToken(oldRefreshToken);

    if (!decoded) {
      res.clearCookie("refreshToken");
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }

    // Find the most recent active session for this user and revoke it
    const session = await sessionModel
      .findOne({ userId: decoded.id, revoked: false })
      .sort({ createdAt: -1 });

    if (session) {
      const isTokenValid = await bcrypt.compare(
        oldRefreshToken,
        session.refreshTokenHash
      );

      if (isTokenValid) {
        session.revoked = true;
        await session.save();
      }
    }

    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logoutUser:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while logging out. Please try again.",
    });
  }
};

export default {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  logoutUser,
};
