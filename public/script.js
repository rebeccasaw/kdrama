var socket = io();

var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
queryString = queries[0];

var seen = [
  ["W", "tt5797194"],
  ["Doctor Stranger", "tt3693414"],
  ["Hwarang", "tt5646594"],
  ["Strong Girl Bong Soon", "tt6263222"],
  ["Itaewon Class", "tt11239552"],
  ["Crash Landing on You", "tt10850932"],
  ["Extracurricular", "tt10262630"]
];

var emmaSeen = [
  ["Hospital Playlist", "tt11769304"],
  ["Kingdom", "tt6611916"],
  ["Mr Sunshine", "tt7094780"],
  ["Sky Castle", "tt9151274"],
  ["Strong Girl Bong Soon", "tt6263222"],
  ["W", "tt5797194"],
  ["Doctor Stranger", "tt3693414"],
  ["Hwarang", "tt5646594"],
  ["Itaewon Class", "tt11239552"],
  ["Crash Landing on You", "tt10850932"],
  ["Cheese in the Trap", "tt4741110"],
  ["Hospital Ship", "tt7074992"],
  ["Welcome to Waikiki", "tt7890304"],
  ["Haechi", "tt9467164"],
  ["Chicago Typewriter", "tt6516076"],
  ["My Contracted Husband Mr Oh", "tt8067766"],
  ["Dr Romantic", "tt6157190"],
  ["Warm and Cozy", "tt4686292"],
  ["She Was Pretty", "tt5045900"],
  ["Boys Over Flowers", "tt1370334"],
  ["Oh My Ghost", "tt4799574"],
  ["The King Eternal Monarch", "tt11228748"],
  ["Tempted", "tt7923816"],
  ["Inheritors", "tt3243098"],
  ["Pinocchio", "tt4201628"],
  ["The Doctors", "tt5764332"],
  ["Temperature of Love", "tt7208182"],
  ["Weight Lifting Fairy Kim Bok-Joo", "tt6157148"],
  ["Secret Garden", "tt1841321"],
  ["Reply 1994", "tt3357586"],
  ["Reply 1997", "tt2782216"],
  ["Descendants of the Sun", "tt4925000"],
  ["Romance is a Bonus Book", "tt9130542"],
  ["Welcome to my Twenties", "tt5858892"],
  ["Warm and Cozy", "tt4686292"],
  ["Uncontrollably Fond", "tt5764282"],
  ["Misaeng", "tt4240730"],
  ["When the Camellia Blooms", "tt10826064"],
  ["Fight for my Way", "tt6824234"],
  ["Kill Me Heal Me", "tt4339192"],
  ["Pride and Prejudice", "tt4284162"],
  ["Love in the Moonlight", "tt5575678"],
  ["My ID is Gangnam Beauty", "tt8585954"],
  ["12 Years Promise", "tt5476252"],
  ["Cinderella with Four Knights", "tt5764414"],
  ["The Third Charm", "tt8954026"],
  ["Because this is my First Life", "tt7278588"],
  ["Clean with Passion Now", "tt7981562"],
  ["My First First Love", "tt8995604"],
  ["Love Alarm", "tt9145880"],
  ["Love Rain", "tt2286707"],
  ["You are Beautiful", "tt2074131"]
];

var shevSeen = [
  ["I am not a Robot", "tt7521778"],
  ["Oh My Ghost", "tt4799574"]
];

function goClicked() {
  var ttnumber = document.getElementById("input").value;

  if (!ttnumber) alert("Input box is empty");
  else {
    document.getElementById("loadingText").style.display = "block";
    if (queryString == "emma") socket.emit("compare", ttnumber, emmaSeen);
    else if (queryString == "shev") socket.emit("compare", ttnumber, shevSeen);
    else socket.emit("compare", ttnumber, seen);
  }
}

socket.on("displayInfo", function(data) {
  console.log("recieved data " + data);
  var main = document.getElementById("main");
  while (main.hasChildNodes()) {
    main.removeChild(main.firstChild);
  }

  addComparingShow(data[0]);

  for (var i = 1; i < data.length; i++) {
    addShow(data[i]);
  }
  document.getElementById("loadingText").style.display = "none";
});

function addComparingShow(data) {
  var comparing = document.getElementById("comparingExample");
  var clone = comparing.cloneNode(true);
  clone.id = "";

  var image = clone.children[0];
  var title = clone.children[1].children[0];
  var summary = clone.children[1].children[1];

  var correctTitle = data[0];

  for (var i = 0; i < emmaSeen.length; i++) {
    if (data[1] == emmaSeen[i][1]) correctTitle = emmaSeen[i][0];
  }

  title.innerHTML = correctTitle;
  title.href = "https://www.imdb.com/title/" + data[1];
  image.src = data[2];

  var summaryData = data[3].replace("See full summary", "");
  summaryData = summaryData.replace("»", "");
  summary.innerHTML = summaryData;
  document.getElementById("main").appendChild(clone);
}

function addPerson(personData, showTitle) {
  var person = document.getElementById("personExample");

  var clone = person.cloneNode(true);
  clone.id = "";

  var image = clone.children[0];
  var name = clone.children[1].children[0];
  var role = clone.children[1].children[1];
  var googleLink = clone.children[1].children[2];

  var correctName;
  var nameArray = personData[0].split(" ");
  if (nameArray.length == 2 && nameArray[0].includes("-"))
    correctName = nameArray[1] + " " + nameArray[0];
  else correctName = personData[0];

  name.innerHTML = correctName;
  name.href = "https://www.imdb.com/name/" + personData[1];
  image.src = personData[2];

  if (personData[3]) role.innerHTML = "Role: " + personData[3];
  else role.innerHTML = "";
  correctName = correctName.replace(/ /g, "+");
  googleLink.href =
    "https://www.google.com/search?q=" +
    correctName +
    "+" +
    showTitle +
    "&tbm=isch";

  return clone;
}

function addShow(showData) {
  var show = document.getElementById("showExample");
  var cloneShow = show.cloneNode(true);

  cloneShow.id = "";
  var title = cloneShow.children[0];

  title.innerHTML = showData[0][0];
  title.href = "https://www.imdb.com/title/" + showData[0][1];

  for (var i = 1; i < showData.length; i++) {
    //staring at 1 because 0 is title data
    cloneShow.appendChild(addPerson(showData[i], showData[0][0]));
  }
  if (showData.length > 1)
    document.getElementById("main").appendChild(cloneShow);
}
