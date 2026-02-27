import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";



actor {
  var adminPassword = "Bubbakellen2!";
  var newsIdCounter = 0;
  var gameIdCounter = 0;

  public type Player = {
    number : Nat;
    name : Text;
    position : Text;
    photo : Text;
    height : Text;
    weight : Text;
    age : Nat;
    hometown : Text;
    maxPrepsUrl : ?Text;
    eliteProspectsUrl : ?Text;
  };

  public type PlayerStats = {
    playerNumber : Nat;
    goals : Nat;
    assists : Nat;
    gamesPlayed : Nat;
  };

  public type Game = {
    id : Nat;
    date : Text;
    opponent : Text;
    location : Text;
    isHome : Bool;
    homeScore : ?Nat;
    awayScore : ?Nat;
    isCompleted : Bool;
  };

  public type NewsPost = {
    id : Nat;
    title : Text;
    body : Text;
    date : Text;
  };

  public type TeamInfo = {
    wins : Nat;
    losses : Nat;
    overtimeLosses : Nat;
    points : Nat;
    leaguePosition : Nat;
  };

  var teamInfo : TeamInfo = {
    wins = 0;
    losses = 0;
    overtimeLosses = 0;
    points = 0;
    leaguePosition = 0;
  };

  let players = Map.empty<Nat, Player>();
  let playerStats = Map.empty<Nat, PlayerStats>();
  let games = Map.empty<Nat, Game>();
  let newsPosts = Map.empty<Nat, NewsPost>();

  // Admin check
  func checkAdmin(password : Text) {
    if (password != adminPassword) {
      Runtime.trap("Unauthorized action");
    };
  };

  // Players
  public shared ({ caller }) func addPlayer(
    number : Nat,
    name : Text,
    position : Text,
    photo : Text,
    height : Text,
    weight : Text,
    age : Nat,
    hometown : Text,
    maxPrepsUrl : ?Text,
    eliteProspectsUrl : ?Text,
    password : Text,
  ) : async () {
    checkAdmin(password);
    let player : Player = {
      number;
      name;
      position;
      photo;
      height;
      weight;
      age;
      hometown;
      maxPrepsUrl;
      eliteProspectsUrl;
    };
    players.add(number, player);
  };

  public shared ({ caller }) func removePlayer(number : Nat, password : Text) : async () {
    checkAdmin(password);
    players.remove(number);
    playerStats.remove(number);
  };

  public shared ({ caller }) func updatePlayer(
    number : Nat,
    name : Text,
    position : Text,
    photo : Text,
    height : Text,
    weight : Text,
    age : Nat,
    hometown : Text,
    maxPrepsUrl : ?Text,
    eliteProspectsUrl : ?Text,
    password : Text,
  ) : async () {
    checkAdmin(password);
    switch (players.get(number)) {
      case (null) { Runtime.trap("Player not found") };
      case (?_) {
        let updatedPlayer : Player = {
          number;
          name;
          position;
          photo;
          height;
          weight;
          age;
          hometown;
          maxPrepsUrl;
          eliteProspectsUrl;
        };
        players.add(number, updatedPlayer);
      };
    };
  };

  public query ({ caller }) func getPlayers() : async [Player] {
    players.values().toArray();
  };

  // Player Stats
  public shared ({ caller }) func setPlayerStats(
    playerNumber : Nat,
    goals : Nat,
    assists : Nat,
    gamesPlayed : Nat,
    password : Text,
  ) : async () {
    checkAdmin(password);
    let stats : PlayerStats = {
      playerNumber;
      goals;
      assists;
      gamesPlayed;
    };
    playerStats.add(playerNumber, stats);
  };

  public query ({ caller }) func getPlayerStats() : async [PlayerStats] {
    playerStats.values().toArray();
  };

  public query ({ caller }) func getPlayerStatsByNumber(playerNumber : Nat) : async ?PlayerStats {
    playerStats.get(playerNumber);
  };

  // Games
  public shared ({ caller }) func addGame(
    date : Text,
    opponent : Text,
    location : Text,
    isHome : Bool,
    password : Text,
  ) : async () {
    checkAdmin(password);
    let game : Game = {
      id = gameIdCounter;
      date;
      opponent;
      location;
      isHome;
      homeScore = null;
      awayScore = null;
      isCompleted = false;
    };
    games.add(gameIdCounter, game);
    gameIdCounter += 1;
  };

  public shared ({ caller }) func removeGame(id : Nat, password : Text) : async () {
    checkAdmin(password);
    games.remove(id);
  };

  public shared ({ caller }) func updateGameScores(
    id : Nat,
    homeScore : Nat,
    awayScore : Nat,
    isCompleted : Bool,
    password : Text,
  ) : async () {
    checkAdmin(password);
    switch (games.get(id)) {
      case (null) { Runtime.trap("Game not found") };
      case (?game) {
        let updatedGame : Game = {
          id;
          date = game.date;
          opponent = game.opponent;
          location = game.location;
          isHome = game.isHome;
          homeScore = ?homeScore;
          awayScore = ?awayScore;
          isCompleted;
        };
        games.add(id, updatedGame);
      };
    };
  };

  public query ({ caller }) func getGames() : async [Game] {
    games.values().toArray();
  };

  public query ({ caller }) func getUpcomingGames() : async [Game] {
    games.values().filter(func(g) { not g.isCompleted }).toArray();
  };

  public query ({ caller }) func getCompletedGames() : async [Game] {
    games.values().filter(func(g) { g.isCompleted }).toArray();
  };

  // News Posts
  public shared ({ caller }) func addNewsPost(title : Text, body : Text, date : Text, password : Text) : async () {
    checkAdmin(password);
    let post : NewsPost = {
      id = newsIdCounter;
      title;
      body;
      date;
    };
    newsPosts.add(newsIdCounter, post);
    newsIdCounter += 1;
  };

  public shared ({ caller }) func removeNewsPost(id : Nat, password : Text) : async () {
    checkAdmin(password);
    newsPosts.remove(id);
  };

  public shared ({ caller }) func updateNewsPost(id : Nat, title : Text, body : Text, date : Text, password : Text) : async () {
    checkAdmin(password);
    switch (newsPosts.get(id)) {
      case (null) { Runtime.trap("News post not found") };
      case (?_) {
        let updatedPost : NewsPost = {
          id;
          title;
          body;
          date;
        };
        newsPosts.add(id, updatedPost);
      };
    };
  };

  public query ({ caller }) func getNewsPosts() : async [NewsPost] {
    newsPosts.values().toArray();
  };

  public query ({ caller }) func getLatestNews(count : Nat) : async [NewsPost] {
    let sortedPosts = newsPosts.values().toArray();
    let length = sortedPosts.size();
    if (count >= length) {
      return sortedPosts;
    };
    sortedPosts.sliceToArray(0, count);
  };

  // Team Info
  public shared ({ caller }) func updateTeamInfo(
    wins : Nat,
    losses : Nat,
    overtimeLosses : Nat,
    points : Nat,
    leaguePosition : Nat,
    password : Text,
  ) : async () {
    checkAdmin(password);
    teamInfo := {
      wins;
      losses;
      overtimeLosses;
      points;
      leaguePosition;
    };
  };

  public query ({ caller }) func getTeamInfo() : async TeamInfo {
    teamInfo;
  };

  // Password Management
  public shared ({ caller }) func changePassword(oldPassword : Text, newPassword : Text) : async () {
    checkAdmin(oldPassword);
    adminPassword := newPassword;
  };
};
