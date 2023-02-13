const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Msg = require("../models/message");
const verifyToken = require('../middleware/verifyToken')

router.post("/getmsg",verifyToken, async (req, res) => {
  const { from, to } = req.body;
  try {
    //find all docs where the "users" field contains both the "from" value and the "to" value.
    const messages = await Msg.find({
      users: {
        $all: [from, to],
      },
    })
      // Sorting the documents by the update date, in ascending order
      .sort({ updatedAt: 1 });
    const projectedMessages = messages.map((msg) => {
      const fromSelf = msg.sender.toString() == from;
      const message = msg.message.text;
      const createdAt = msg.createdAt
      return { fromSelf, message, createdAt };
    });
    res.json(projectedMessages);
  } catch (error) {
    console.error("An error occurred while trying to get messages.");
  }
});

router.post("/addmsg",verifyToken, async (req, res) => {
  const { from, to, message } = req.body;
  try {
    await Msg.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    res.json({ msg: "Message added successfully." });
  } catch (error) {
    console.error("Failed to store message in database");
  }
});

module.exports = router;
