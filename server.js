const express = require("express"),
  app = express(),
  bodyParser = require("body-parser");

const { User, Exercise } = require("./models");

const { wrap, checkUserId } = require("./tools");

const cors = require("cors");

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost/exercise-track");
mongoose.set('debug', true);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post(
  "/api/exercise/new-user",
  wrap(async (req, res) => {
    const model = await User.create(req.body);
    res.send(model);
  })
);

app.post(
  "/api/exercise/add",
  wrap(async (req, res) => {
    const { userId } = req.body;
    checkUserId(userId);
    const user = await User.findById(userId);
    if (!user) throw new Error(`User with id [${userId}] not found!`);
    req.body.date = req.body.date || new Date();
    const model = await Exercise.create(req.body);
    res.send({ user, exercise: model });
  })
);

app.get(
  "/api/exercise/users",
  wrap(async (req, res) => {
    const users = await User.find();
    res.send(users);
  })
);

app.get(
  "/api/exercise/log",
  wrap(async (req, res) => {
    const { userId, from: fromStr, to: toStr, limit: limitStr } = req.query;

    checkUserId(userId);

    const userQuery = User.findById(userId);

    let query = { userId: userId };
    const countQuery = Exercise.count(query);

    const [from, to] = [new Date(fromStr), new Date(toStr)];
    if (!isNaN(from.getTime()) || !isNaN(to.getTime())) {
      query.date = {};
      if (!isNaN(from.getTime())) query.date.$gte = from;
      if (!isNaN(to.getTime())) query.date.$lte = to;
    }

    let exerciseQuery = Exercise.find(query);

    const limit = parseInt(limitStr);
    if (limit) {
      exerciseQuery = exerciseQuery.limit(limit);
    }
    const [user, count, exercises] = await Promise.all([
      userQuery,
      countQuery,
      exerciseQuery
    ]);

    if (!user) {
      throw new Error(`User with id [${userId}] not found!`);
    }

    res.send({ ...user.toObject(), log: exercises, count });
  })
);

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
