const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
var axios = require("axios");
var router = express.Router();

require("dotenv").config();

const app = express();
app.set('views', path.join(__dirname, '..', 'views'));
app.set("view engine", "ejs");
app.use(cors({ origin: "*" }));
app.use(bodyparser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '..', 'views', 'layouts'),
    partialsDir: path.join(__dirname, '..', 'views', 'partials')}
));

app.get("/", (req, res) => {
    getData(
        `https://api.thecatapi.com/v1/breeds?limit=200&page=0`,
        req,
        res
    ).then((response) => {
        res.render("cats", { breeds: getTopBreeds(response.data) });
    });
});

const getData = async (url = "", req, res) => {
  return axios(url, {
    method: "get",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.SECRET_API_KEY,
    },
  }).catch((err) => {
    res.send(err);
  });
};

const getTopBreeds = (data) => {

    // Sort by child_friendly & stranger_friendly & dog_friendly!
   return data.sort(function (a, b) {
      if (a.child_friendly === b.child_friendly) {
        if (a.stranger_friendly === b.stranger_friendly) {
          return a.dog_friendly < b.dog_friendly
            ? -1
            : a.dog_friendly > b.dog_friendly
            ? 1
            : 0;
        } else {
          return a.stranger_friendly < b.stranger_friendly ? -1 : 1;
        }
      } else {
        return a.child_friendly < b.child_friendly ? -1 : 1;
      }
    })
    .reverse()
    .slice(0,5) // Take the top 5
    .map((data) => ({ // Get used att. only
        id: data.id,
        name: data.name,
        description: data.description,
        origin: data.origin,
        child_friendly: data.child_friendly,
        stranger_friendly: data.stranger_friendly,
        dog_friendly: data.dog_friendly,
        image: data.image.url
    }));
};

module.exports = app;
