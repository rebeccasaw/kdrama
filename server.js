const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const rp = require("request-promise");
const $ = require("cheerio");

app.use(express.static("public"));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.set("port", process.env.PORT || 5000);
http.listen(app.get("port"), function() {
  console.log("listening on port", app.get("port"));
});

io.on("connection", function(socket) {
  socket.on("compare", function(ttnumber, seen) {
    var allShows = [];

    allShows.push(getComparingTitleInfo(ttnumber));

    for (var i = 0; i < seen.length; i++) {
      if (seen[i][1] != ttnumber) {
        allShows.push(
          getPeopleFromShow(ttnumber, seen[i])
            .then(function(people) {
              return people;
            })
            .catch(function(err) {
              console.log("error " + err);
            })
        );
      }
    }

    Promise.all(allShows)
      .then(results => {
        socket.emit("displayInfo", results);
      })
      .catch(err => console.log(err)); // First rejected promise
  });
});

function getComparingTitleInfo(titleCode) {
  var url = "https://www.imdb.com/title/" + titleCode;
  return rp(url)
    .then(function(html) {
      var infoArray = [];
      var title = $(".title_wrapper >h1", html)
        .eq(0)
        .text()
        .trim();

      //  var heading = $("title", html).text().trim();
      // console.log("heading = "+heading);
      var imgCode = $(".poster > a > img", html)[0].attribs.src;

      var summary = $(".summary_text", html)
        .text()
        .trim();

      infoArray.push(title);
      infoArray.push(titleCode);
      infoArray.push(imgCode);
      infoArray.push(summary);
      // console.log(infoArray);
      return infoArray;
    })
    .catch(function(err) {
      console.log("error " + err);
    });
}

function getPeopleFromShow(ttnumber, seen) {
  var showPeople = [];
  var titleCode = ttnumber;
  showPeople.push(seen);
  const url =
    "https://www.imdb.com/search/name/?roles=" + ttnumber + "," + seen[1];
  return rp(url)
    .then(function(html) {
      var people = $(".lister-item-header > a", html);

      var ps = [];

      for (var i = 0; i < people.length; i++) {
        var person = [];
        var name = $(".lister-item-header > a", html)[
          i
        ].children[0].data.trim();

        var nameCode = $(".lister-item-header > a", html)[i].attribs.href;
        nameCode = nameCode.replace("/name/", "");

        var image = $(".lister-item-image > a > img", html)[i].attribs.src;

        person.push(name);
        person.push(nameCode);
        person.push(image);
        showPeople.push(person);
        ps.push(
          getRole(nameCode, seen[1])
            .then(function(role) {
              return role;
            })
            .catch(function(a) {})
        );
      }
      return Promise.all(ps)
        .then(results => {
          //console.log("all results = " + results); // Result of all resolve as an array
          for (var i = 1; i < showPeople.length; i++) {
            showPeople[i][3] = results[i - 1];
          }

          return showPeople;
        })
        .catch(err => console.log(err)); // First rejected promise
    })

    .catch(function(err) {
      console.log("Error " + err);
    });

  return showPeople;
}

function getRole(nameCode, titleCode, person) {
  var url = "https://www.imdb.com/name/" + nameCode;
  return rp(url)
    .then(function(html) {
      var allText = $("#actor-" + titleCode, html)
        .eq(0)
        .text();

      if (!allText)
        allText = $("#actress-" + titleCode, html)
          .eq(0)
          .text();

      var lines = allText.split("\n");
      var actualLines = [];
      for (var i = 0; i < lines.length; i++) {
        if (lines[i]) actualLines.push(lines[i]);
      }
      var characterPosition;
      for (var i = 0; i < actualLines.length; i++) {
        if (actualLines[i] == "(TV Series)") {
          characterPosition = i + 1;
          break;
        }
      }
      var character = actualLines[characterPosition];
      return character;
    })
    .catch(function(err) {
      //handle error
      console.log("Error " + err);
    });
}
