class Document {
  constructor() {
    this.grabUsername = this.grabUsername.bind(this);
    this.attachClickHandlers();
    this.attachClickHandlers = this.attachClickHandlers.bind(this);
    // this.spotifyInstance = new Spotify();
    // this.firebaseInstance = new FB();
    this.map = new Map();
    this.ticketsInstance = new Tickets(this.map);
  }

  attachClickHandlers() {
    $(".submitBtn").click(this.grabUsername);
    console.log("attached clickHandlers");
  }

  grabUsername() {
    this.username = $(".usernameInput").val();
    this.startApp();
  }

  startApp() {
    const concertData = {};

    this.map.setOrigin(() => {
      const origin = this.map.getOrigin();
      console.log("hello, ", this.username);
      fbClient.addOrigin(this.username, origin);
      setTimeout(() => {
        fbClient.getSpotifyArtistsFromFB(this.username).then(res => {
          const origin = res.val().origin;
          const artists = res.val().artists.feed;
          console.log(artists);
          this.ticketsInstance.organizeTickets(origin, artists);
        });
      }, 5000);
    });
  }
}
