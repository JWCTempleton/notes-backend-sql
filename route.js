const express = require("express");
const router = express.Router();

const { getNotes } = require("./controller");

router.get("/", getNotes);

module.exports = router;
