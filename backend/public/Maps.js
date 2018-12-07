class Map {
  constructor() {
    this.mapElement = "#map";
    this.origin = null;
    this.locations = null;
  }

  setLocations(locations) {
    this.locations = locations;
  }

  setOrigin(callback) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        callback();
      });
    }
  }

  renderConcertCards(
    artistImageLink,
    artistName,
    concertLocation,
    concertLink
  ) {
    $(".concertCards").append(`
        <div class="col s4">
            <div class="card">
                <div class="card-image">
                    <img src="${artistImageLink}">
                    <span class="card-title">${artistName}</span>
                </div>
                <div class="card-content">
                    <p>${concertLocation}</p>
                </div>
                <div class="card-action">
                    <a href="${concertLink}">Buy Tickets</a>
                </div>
            </div>
        </div>
    `);
  }

  getOrigin() {
    return this.origin;
  }

  initMap() {
    $.getScript(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCDnACGfvcJvr6XTbNAPz8U_iXlJ2ekgqE",
      () => this.drawMap()
    );
  }

  drawMap() {
    const display = new google.maps.Map(document.getElementById("map"));
    const bounds = new google.maps.LatLngBounds();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude: lat, longitude: lng } = position.coords;

        bounds.extend(new google.maps.LatLng(lat, lng));

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: display,
          title: "Your location",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new google.maps.Size(40, 40)
          }
        });

        const infoWindow = new google.maps.InfoWindow({ content: "You" });

        marker.addListener("click", () => infoWindow.open(display, marker));

        display.fitBounds(bounds);
      });
    }

    for (let artist in this.locations) {
      this.locations[artist].forEach(concert => {
        const {
          venue,
          latlog: { latitude, longitude },
          address,
          city,
          country,
          date,
          time,
          website
        } = concert;
        
        const marker = new google.maps.Marker({
          position: { lat: +latitude[0], lng: +longitude[0] },
          map: display,
          title: concert.venue
        });

        bounds.extend(new google.maps.LatLng(+latitude[0], +longitude[0]));

        const contentString = `<div id="infoContent">
            <h5 class="infoHeading">${venue}</h5>
            <div id="infoBody">
              <p>${artist}</p>
              <p><a href=${website}>Ticketmaster</a></p>
              <p>${date} ${time.slice(0, -3)}</p>
              <p>${address}</p>
              <p>${city}</p>
              <p>${country}</p>
            </div>
          </div>`;

        this.renderConcertCards(
          "http://picsum.photos/200/200",
          artist,
          venue,
          website
        );

        const infoWindow = new google.maps.InfoWindow({
          content: contentString
        });

        marker.addListener("click", () => infoWindow.open(display, marker));

        display.fitBounds(bounds);
      });
    }

    $("infoContent")
      .parent()
      .addClass("card blue");
  }
}
