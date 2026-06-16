const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp();
const app = express();

app.use(cors({origin: true}));
app.use(express.json());
app.use(express.static("./static"));


app.set("view engine", "pug");
app.set("views", "./views");

// Automatically redirect to homepage
app.get("/", (req, res) => {
  res.redirect("/html/index.html");
});

exports.handler = onRequest((request, response) => app(request, response));
