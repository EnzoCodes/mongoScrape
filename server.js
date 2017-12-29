const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const request = require("request");
const cheerio = require("cheerio");
const logger = require("morgan");
const axios = require("axios");
const fs = require("fs");


var app = express();

var db = require("./models");

var PORT = process.env.PORT || 3000;

var databaseUrl = "polyScraper";
var collections = ["scrapedData"];

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.engine("handlebars", exphbs({ defaultLayout: "main "}));
app.set("view engine", "handlebars");

app.use(logger("dev"));

// Not sure why I have this 2x....
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static("public"));

// Make a promise I can't keep to mongoose.
mongoose.Promise = Promise;

//Check if deployed...
if (process.env.MONGODB_URI){
  monggose.connect(process.env.MONGODB_URI);
} else{
  mongoose.connect('mongodb://localhost/polyScraper', {
    useMongoClient: true
  });
}
// Routes
app.get("/", function(req, res){

  res.render("index");
});

app.get("/scrape", function(req, res){
  axios.get("http://shoryuken.com//").then(function(response) {

  var $ = cheerio.load(response.data);
  var resuls = {};

  //Grabbing data...
  $(".blog-post-main").each(function(i, element) {

        var link = $(element).find(".blog-post-title").find("a").attr("href");
        var title = $(element).find(".blog-post-title").find("a").text();
        // Save these results in an object that we'll push into the results array we defined earlier
        results.push({
          title: title,
          link: link
      });
    });

    var data = {
      dataa: results
    }

    db.polyScraper.insert(results);
    console.log(results);
    res.render("index", {data});
  });
});

app.get("/articles", function(req, res){
  db.article.find({}).then(function(dbArticle) {
    console.log(dbArticle);
    res.render("articles", {dbArticle});
  });
});

app.get("/articles/:id", function(req, res){

  db.Article.findOne({ _id: req.params.id }).populate("note").then(function(dbArticle){
    console.log(dbArticle);
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  });
});

app.post("/save/:id", function(req, res){
  console.log(req.body);
  //Create new Note and pass req.body
  db.Note.create({
    body: req.body.info.body
  }).then(function(dbNote) {
    // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`.
    // Update the Article to be associated with the new Note
    // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
    // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id}, { new: true}).populate("note")
  }).then(function(dbArticle){
    console.log(dbArticle);
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  });
});


app.post("/save", function(req, res) {
  console.log(req.body.info.title);
  console.log(req.body.info.link);

  db.Article.create({
    title: req.body.info.title,
    link: req.body.info.link
  }).then(function(results){
    res.end();
  }).catch(function(err) {
    res.json(err);
  });
});

app.post("/delete", function(req, res) {
  console.log(req.body.info.title);

  db.article.remove({
    title: req.body.info.title
  }).then(function(result){
    res.end();
  }).catch(function(err) {
    res.json(err);
  });
});

app.post("/del/:id", function(req, res){
  console.log(req.params.id);

  db.Note.remove({
    _id: req.params.id
  }).then(function(results){
    res.end();
  }).catch(function(err) {
    res.json(err);
  });
});
//End Routes

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
