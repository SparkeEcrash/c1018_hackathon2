class Tickets {
  constructor(map) {
    this.concertInfo = {};
    this.map = map;
    // this.organizeTickets(location, artists);
  }

  organizeTickets(location, artists) {
    const newArtists = artists.reduce((accum, current) => {
      accum[current] ? accum[current]++ : accum[current] = 1; return accum;
    }, {});
    const arr = []; for (let key in newArtists) {
      arr.push([key, newArtists[key]]);
    }
    const a = arr.sort((a, b) => b[1] - a[1]).map(value => value[0]);
    this.getGeoHash(a, location);
  }

  getGeoHash(artists, location) {
    console.log(location)
    var hash = Geohash.encode(location.lng, location.lat, [5]);
    this.callGetDataFromApi(artists, hash)
  }

  callGetDataFromApi(artistArr, hash) {
    // artistArr  = ['eminem'];
    console.log("LOOOOOOK HERE", artistArr);
    for (var i = 0; i < artistArr.length; i++) {
      this.getDataFromApi(artistArr[i], i, hash);
    }
  }

  getDataFromApi(artistName, index, hash) {
    this.ajaxCallVar = {
      // url: 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=ihQ5Lmy34lHVnLU8xKTBu75hBUHVyQAa', // mike
      url: 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=tI1aYe3CCBWTWjMAkQJRhC6TAKtmanEY', // mike
      // url: 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=kPkBY3I9s8hIRNOlcc1L0KjBQqtwenIA',  // erick
      type: 'GET',
      dataType: 'JSON',
      data: {
        geoPoint: hash,
        keyword: artistName,
        radius: "8000",
        unit: "miles"
      }
    };
    $.ajax(this.ajaxCallVar)
      .then(response => this.organizeResponse(artistName, response, index))
      .fail(err => console.log('Error', err));
  }
  ;

  organizeResponse(name, artistInfo, index) {
    for (var i = 0; i < artistInfo["_embedded"].events.length; i++) {
      var concertObj = {};
      concertObj.priceRanges = artistInfo["_embedded"].events[i].priceRanges;
      concertObj.venue = artistInfo["_embedded"].events[i]["_embedded"]["venues"][0].name;
      concertObj.latlog = {
        latitude: [artistInfo["_embedded"].events[i]["_embedded"]["venues"][0].location.latitude],
        longitude: [artistInfo["_embedded"].events[i]["_embedded"]["venues"][0].location.longitude]
      };
      concertObj.address = artistInfo["_embedded"].events[i]["_embedded"]["venues"][0].address.line1;
      concertObj.city = artistInfo["_embedded"].events[i]["_embedded"]["venues"][0].city.name;
      concertObj.id = artistInfo["_embedded"].events[i].id;
      concertObj.country = artistInfo["_embedded"].events[i]["_embedded"]["venues"][0].country.name;
      concertObj.website = artistInfo["_embedded"].events[i].url;
      concertObj.date = artistInfo["_embedded"].events[i].dates.start.localDate;
      concertObj.time = artistInfo["_embedded"].events[i].dates.start.localTime;
      if (this.concertInfo[name] === undefined) {
        this.concertInfo[name] = [];
      }
      this.concertInfo[name][i] = concertObj;
    }
    console.log("concertInfo", this.concertInfo);
    setTimeout(() => {
        console.log(this);
        this.map.setLocations(this.concertInfo);
        this.map.initMap();
    }, 500)

    
  }
}