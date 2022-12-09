const express = require("express");
const app = express();
const port = 8080;
const facilitiesRouter = require("./routes/facilities");
const usersRouter = require("./routes/users");
const groupsRouter = require("./routes/groups");
const classesRouter = require("./routes/classes");
const subjectsRouter = require("./routes/subjects");
const classroomsRouter = require("./routes/classrooms");
const statusesRouter = require("./routes/statuses");
const daysRouter = require("./routes/days");
const authRouter = require("./routes/auth");

var cors = require('cors')
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.get("/", (req, res) => {
    res.json({ message: "ok" });
});
app.use("/facilities", cors(), facilitiesRouter);
app.use("/users", cors(), usersRouter);
app.use("/groups", cors(), groupsRouter);
app.use("/classes", cors(), classesRouter);
app.use("/subjects", cors(), subjectsRouter);
app.use("/classrooms", cors(), classroomsRouter);
app.use("/days", cors(), daysRouter);
app.use("/statuses", cors(), statusesRouter);
app.use("/auth", cors(), authRouter);
//Used to serve avatars to the client:
app.use("/avatars", express.static('./rescources/avatars'));
//Used to serve logos of facilities to the client:
app.use("/logos", express.static('./rescources/logos'));

/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

var server = app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = server