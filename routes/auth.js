const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const secret = process.env.JWT_SECRET;
const verifyToken = require('../middleware/verifyToken')

// Register
router.post("/register", async (req, res) => {
  const { username, email, password, avatarImage } = req.body;

  try {
    if (await User.findOne({ username })) {
      return res.status(400).json({
        status: 400,
        error: "Username already taken",
      });
    }
    const hashedPsw = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPsw,
      avatarImage,
    });

    const token = jwt.sign({ id: newUser._id }, secret);

    delete newUser.password;

    return res.status(201).json({
      user: newUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error has occurred",
    });
  }
});

//Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const verifyUser = await User.findOne({ username });

    //Check if username exist
    if (!verifyUser) {
      return res.status(404).json({
        error: "Username not found",
      });
    }

    //Compare password with hashedPsw in Db
    const validPassword = await bcrypt.compare(password, verifyUser.password);
    if (!validPassword) {
      return res.status(401).json({
        error: "Incorrect password",
      });
    }

    const token = jwt.sign({ id: verifyUser._id }, secret);

    delete verifyUser.password;

    return res.status(200).json({
      message: "Login successful",
      user: verifyUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error has occurred",
    });
  }
});

//SetAvatar
router.post("/setavatar/:id", async (req, res) => {
  const userId = req.params.id;
  const avatarImage = req.body.image;

  try {
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      // return the updated document
      { new: true }
    );
    return res.status(200).json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/allusers/:id", async (req, res) => {
  try {
    //Find all users that is not equal to sender's ID
    const allUsers = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.status(200).json({
      success: true,
      count: allUsers.length,
      data: allUsers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

router.get("/logout/:id", async (req, res) => {
  const {id} = req.params
  if (id) {
    onlineUsers.delete(id)
    return res.status(200).json({ message: "You have logged out successfully." });
  }else{
    return res.status(400).json({ error: "User id is required for logging out." });
  }
});

module.exports = router;
