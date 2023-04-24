const { pool } = require("../config");
const router = require("express").Router();
const bcrypt = require("bcrypt");

router.get("/", async (req, res, next) => {
  try {
    const data = await pool.query(
      //   "SELECT id, username, name, admin, disabled from users"
      //   "select u.*, (select json_agg(json_build_object('content',n.content,'important', n.important,'date', n.date)) all_notes) from users u join notes n on u.id=n.user_id where u.id=n.user_id group by u.id;"
      //   "select u.id, u.username, u.name, u.admin, u.disabled, (select json_agg(note) from (select n.id id, n.content content, n.important important, n.date date \
      //     from notes n where u.id=n.user_id) note) as notes from users u;"
      "SELECT u.*, n.id note_id, n.content, n.date, n.important, n.user_id from notes n right outer join users u on n.user_id=u.id ORDER BY note_id ASC"
    );

    if (data.rowCount == 0) {
      return res.status(404).send("No user exists");
    }

    const response = [];

    data.rows.map((data) => {
      //   if (!response.some((user) => user.username === data.username)) {
      //     response.push({ ...data, notes: [] });
      //     if (
      //       data.content !== null &&
      //       response.some((user) => user.username === data.username)
      //     ) {
      //       response.notes.push(data);
      //     }
      //   }
      // if content is not null and user does not exist in response array, push user into array and the note into the notes array on user
      if (
        data.content !== null &&
        response.some((user) => user.username === data.username) &&
        response.some((user) => user.notes.content !== data.content)
      ) {
        userNote = response.find((user) => user.username === data.username);
        userNote.notes.push({
          note_id: data.note_id,
          content: data.content,
          date: data.date,
          important: data.important,
        });
      }
      if (
        data.content !== null &&
        !response.some((user) => user.username === data.username)
      ) {
        response.push({
          id: data.id,
          username: data.username,
          name: data.name,
          admin: data.admin,
          disabled: data.disabled,
          notes: [
            {
              note_id: data.note_id,
              content: data.content,
              date: data.date,
              important: data.important,
            },
          ],
        });
      }

      if (
        data.content === null &&
        !response.some((user) => user.username === data.username)
      ) {
        response.push({
          id: data.id,
          username: data.username,
          name: data.name,
          admin: data.admin,
          disabled: data.disabled,
          notes: [],
        });
      }
    });

    let sortedResponse = response.sort((a, b) =>
      a.id > b.id ? 1 : a.id < b.id ? -1 : 0
    );

    // console.log("notes", response);
    // console.log("data", response);

    return res.status(200).json({
      status: 200,
      message: "All users",
      data: sortedResponse,
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
