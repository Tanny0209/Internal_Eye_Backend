const express = require("express");
const { getClient } = require("../db");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const client = await getClient();
    const db = client.db("internal_eye");
    const collection = db.collection("Users");

    const user = await collection.findOne({
      username,
      password
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Unable to login right now"
    });
  }
});

module.exports = router;
