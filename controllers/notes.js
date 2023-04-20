const { pool } = require("../config");
const router = require("express").Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await pool.query("SELECT * from notes");

    if (data.rowCount == 0) {
      return res.status(404).send("No note exists");
    }

    return res.status(200).json({
      status: 200,
      message: "All notes",
      data: data.rows,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
