const { pool } = require("../config");
const router = require("express").Router();

router.get("/", async (req, res, next) => {
  try {
    const data = await pool.query("SELECT * FROM notes");

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

router.get("/:id", async (req, res, next) => {
  const id = parseInt(req.params.id);
  const query = "SELECT * FROM notes WHERE id=$1";
  const value = [id];

  try {
    const data = await pool.query(query, value);

    if (data.rowCount == 0) {
      return res.status(404).send("No note exists");
    }

    return res.status(200).json({
      status: 200,
      message: "Note",
      data: data.rows,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
