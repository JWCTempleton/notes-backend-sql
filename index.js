const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const notesRouter = require("./controllers/notes");
const usersRouter = require("./controllers/users");

dotenv.config();

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Node.js listening on port ${port}`);
});

app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
