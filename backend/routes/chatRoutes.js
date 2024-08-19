const express = require("express");
const router = express.Router();
const {
  createGroupeChat,
  renameGroup,
  accessChat,
  fetchChats,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatController");
// const fetchChats = require("../controllers/chatController");

const protect = require("../middleware/authMiddleware");

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupeChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/removeFromGroup").put(protect, removeFromGroup);
module.exports = router;
