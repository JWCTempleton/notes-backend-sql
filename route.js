const express = require("express");
const router = express.Router();

const { getNotes } = require("./controllers/notes");
const { getUsers } = require("./controllers/users");

router.get("/", getNotes);
router.get("/", getUsers);

module.exports = router;
