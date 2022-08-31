const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

/******************** API 1 *****************/

app.get("/players/", async (request, response) => {
  const query1 = `
       SELECT 
          *
       FROM 
         player_details;
    `;

  const playersArr = await db.all(query1);
  response.send(
    playersArr.map((player) => {
      return {
        playerId: player.player_id,
        playerName: player.player_name,
      };
    })
  );
});

/******************** API 2 *****************/

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const query2 = `
       SELECT 
          *
       FROM
         player_details
       WHERE
         player_id = ${playerId};
    `;

  const player = await db.get(query2);
  response.send({
    playerId: player.player_id,
    playerName: player.player_name,
  });
});

/**************** API 3 ***************/

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const query3 = `
       UPDATE
         player_details
       SET 
         player_name = '${playerName}'
       WHERE 
         player_id = ${playerId};
    `;

  await db.run(query3);
  response.send("Player Details Updated");
});

/*************** API 4 **************/

app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const query4 = `
       SELECT 
          *
       FROM
         match_details
       WHERE
         match_id = ${matchId};
    `;

  const matchDetail = await db.get(query4);
  response.send({
    matchId: matchDetail.match_id,
    match: matchDetail.match,
    year: matchDetail.year,
  });
});

/************* API 5 **************/

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;

  const query5 = `
       SELECT 
         match_details.match_id AS matchId, 
         match_details.match AS match,
         match_details.year AS year
       FROM 
          match_details
          INNER JOIN player_match_score
          ON match_details.match_id = player_match_score.match_id
       WHERE player_id = ${playerId};
    `;

  const playerDArr = await db.all(query5);
  response.send(playerDArr);
});

/*************** API 6 **************/

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const query6 = `
       SELECT 
          player_details.player_id AS playerId,
          player_details.player_name AS playerName
       FROM 
          player_details
          INNER JOIN player_match_score
          ON player_details.player_id = player_match_score.player_id
       WHERE 
          player_match_score.match_id = ${matchId};
    `;

  const playerDArr = await db.all(query6);
  response.send(playerDArr);
});

/******************** API 7 *****************/

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;

  const query7 = `
       SELECT 
         player_details.player_id AS playerId,
         player_name AS playerName,
         SUM(score) AS totalScore,
         SUM(fours) AS totalFours,
         SUM(sixes) AS totalSixes
       FROM 
         player_details
         INNER JOIN player_match_score
         ON player_details.player_id = player_match_score.player_id
       WHERE
         player_details.player_id = ${playerId};
    `;

  const playerD = await db.get(query7);
  response.send(playerD);
});

module.exports = app;
