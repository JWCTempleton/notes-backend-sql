const { pool } = require("../config");
const router = require("express").Router();
const bcrypt = require("bcrypt");

router.get("/", async (req, res, next) => {
  try {
    const data = await pool.query(
      //   "SELECT id, username, name, admin, disabled from users"
      //   "select u.*, (select json_agg(json_build_object('content',n.content,'important', n.important,'date', n.date)) all_notes) from users u join notes n on u.id=n.user_id where u.id=n.user_id group by u.id;"
      "select u.*, (select json_agg(note) from (select n.content content, n.important important, n.date date \
        from notes n where u.id=n.user_id) note) as notes from users u;"
    );

    if (data.rowCount == 0) {
      return res.status(404).send("No user exists");
    }

    return res.status(200).json({
      status: 200,
      message: "All users",
      data: data.rows,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { username, name, password } = req.body;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const query =
    "INSERT INTO users(username, password, name) VALUES($1, $2, $3) RETURNING *;";
  const values = [username, passwordHash, name];

  try {
    const data = await pool.query(query, values);

    return res.status(201).json({
      status: 201,
      message: "User added successfully",
      data: data.rows,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
