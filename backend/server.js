// import FB from './public/FB.js';
let FB = require('./public/FB_backend');
let express = require("express");
let request = require("request");
let requestpromise = require("request-promise");
let querystring = require("querystring");
let bluebird = require("bluebird");
let FBclient = new FB();
let app = express();

var access_token;

app.use(express.static("public"));

let redirect_uri = process.env.REDIRECT_URI || "http://localhost:8888/callback";

app.get("/login", function(req, res) {
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: "c01e41d46ff44ba2b73f4b8a28fa9499",
        scope: "user-read-private user-read-email",
        redirect_uri
      })
  );
});

app.get("/callback", function(req, res) {
  let code = req.query.code || null;
  let authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri,
      grant_type: "authorization_code"
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(
          "c01e41d46ff44ba2b73f4b8a28fa9499" +
            ":" +
            "4e8fc234b5694ebfa68709e4eeee23c1"
        ).toString("base64")
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    access_token = body.access_token;
    console.log(body);
    console.log(access_token);
    let uri = process.env.FRONTEND_URI || "index.html";
    res.redirect(uri);
  });
});

app.get("/search", function(req, res) {
  let username = req.query.username || null;

  let searchOptions = {
    url: `https://api.spotify.com/v1/users/${username}/playlists`,
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token
    },
    json: true
  };

  // requestpromise(searchOptions).then(function(dat) {
  //   console.log("///", dat.items);
  // }).catch(function(err) {
  //   console.log(err);
  // });

  requestpromise(searchOptions).then(function(dat) {
    var playlists = [];
    var tracks = [];
    for (var playlist = 0; playlist < dat.items.length; playlist++) {
      playlists.push(dat.items[playlist].id);
    }

    var promises = playlists.map(function(playlist) {
      let tracksOption = {
        method: "GET",
        url: `https://api.spotify.com/v1/playlists/${playlist}/tracks`,
        headers: {
          Authorization: "Bearer " + access_token
        },
        json: true
      }
      return requestpromise(tracksOption)
    })

    bluebird.all(promises).spread(function () {
      for (var albumIndex in arguments) {
        arguments[albumIndex].items.forEach(function(item) {
          tracks.push(item.track.album.artists[0].name);
        })

      }

      // let FBclient = new FB();
      FBclient.addSpotifyArtistsToFB(username, tracks);

      console.log(tracks);
      // res.send([tracks]);


    })
  }).catch(function(err) {
    console.log(err);
  });





  
  // let uri = process.env.FRONTEND_URI || "index.html";
  // res.redirect(uri);

});

let port = process.env.PORT || 8888;
console.log(
  `Listening on port ${port}. Go /login to initiate authentication flow.`
);
app.listen(port);
