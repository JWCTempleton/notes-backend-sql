const { pool } = require("../config");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const dotenv = require("dotenv");
dotenv.config();

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      req.decodedToken = jwt.verify(
        authorization.substring(7),
        process.env.SECRET
      );
    } catch {
      return res.status(401).json({ error: "token invalid" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
};

router.get("/", async (req, res, next) => {
  try {
    const data = await pool.query(
      "SELECT n.id, n.content, n.important, n.date, (select json_agg(from_user) FROM (SELECT u.id id, u.username username, u.name name FROM users u where u.id=n.user_id) from_user) as User FROM notes n;"
    );

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

router.post("/", tokenExtractor, async (req, res, next) => {
  const query = "SELECT * FROM users where id=$1;";
  const value = [req.decodedToken.id];

  const { content, important } = req.body;
  try {
    const data = await pool.query(query, value);

    if (data.rowCount == 0) {
      return res.status(404).send("User does not exist");
    }
    const user = data.rows[0];

    const noteQuery =
      "INSERT INTO notes(content, important, date, user_id) VALUES($1,$2,$3,$4) RETURNING *;";
    const noteValues = [content, important, new Date(), user.id];

    const noteData = await pool.query(noteQuery, noteValues);

    return res.status(201).json({
      status: 201,
      message: "Note added successfully",
      data: noteData.rows,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
