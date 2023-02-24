"use strict";
var dbConn = require("../config/db.config");
var fsPromise = require("fs").promises;
const axios = require("axios");

var Pokemon = function (pokemon, teamID) {
  const {
    dbID,
    id,
    level,
    gender,
    happiness,
    shiny,
    nature: { name },
    item,
    ev,
    iv,
    moves,
  } = pokemon;
  this.id = dbID;
  this.teamID = teamID;
  this.pokemonID = id;
  this.level = level;
  this.gender = gender;
  this.happiness = happiness;
  this.shiny = shiny;
  this.natureID = name;
  this.itemID = item?.id;
  this.hpEV = ev.hp;
  this.atkEV = ev.atk;
  this.defEV = ev.def;
  this.spAtkEV = ev.spAtk;
  this.spDefEV = ev.spDef;
  this.spdEV = ev.spd;
  this.hpIV = iv.hp;
  this.atkIV = iv.atk;
  this.defIV = iv.def;
  this.spAtkIV = iv.spAtk;
  this.spDefIV = iv.spDef;
  this.spdIV = iv.spd;
  this.move1 = moves[0]?.id;
  this.move2 = moves[1]?.id;
  this.move3 = moves[2]?.id;
  this.move4 = moves[3]?.id;
};

Pokemon.getAllPokemon = function (result) {
  dbConn.query("SELECT * FROM pokemon", function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("All Pokemon : ", res);
      result(null, res);
    }
  });
};

//Only used for initial population of table item
async function insertAllHoldableItems() {
  const allItems = await axios
    .get(`https://pokeapi.co/api/v2/item-attribute/5/`)
    .then((response) => response.data.items)
    .then((itemResponse) => {
      return itemResponse.map((item) =>
        axios.get(item.url).then((response) => {
          const {
            id,
            name,
            sprites: { default: sprite },
          } = response.data;

          const itemData = {
            id: id,
            name: name,
            spriteURL: sprite,
            description: response.data.effect_entries[0]?.short_effect ?? null,
          };

          return itemData;
        })
      );
    });

  const resolvedItems = await Promise.all(allItems);

  resolvedItems.forEach((item) =>
    dbConn.query(
      `INSERT INTO item(id, name, spriteURL, description) VALUES('${item.id}', '${item.name}', '${item.spriteURL}', "${item.description}")`
    )
  );
}

//Only used for initial population of table Pokemon
Pokemon.insertAllPokemon = async function (result) {
  const pokemonData = await fsPromise.readFile("mock/pokemon.json", "utf8");
  const allPokemon = JSON.parse(pokemonData).results;

  allPokemon.forEach((pokemon) =>
    dbConn.query(
      `INSERT INTO pokemon(name, url) VALUES('${pokemon.name}', '${pokemon.url}')`
    )
  );

  result(null, allPokemon);
};

Pokemon.favoritePokemon = function (pokemonID) {
  //new table holding favorites; has column values id, userID, and pokemonID
  dbConn.query(`INSERT INTO () VALUES()`);
};

Pokemon.createNewTeam = function (userID, result) {
  //Use uuid to generate new id
  dbConn.query(
    `INSERT INTO team(userID) VALUES(${userID})`,
    function (err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        console.log(res.insertId);
        result(null, res.insertId);
      }
    }
  );
};

Pokemon.getUserTeams = function (userID, result) {
  dbConn.query(
    `SELECT * FROM team WHERE userID = ${userID}`,
    function (err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log("User teams : ", res);
        result(null, res);
      }
    }
  );
};

Pokemon.saveTeam = async function (teamDetails, result) {
  const { team, teamID } = teamDetails;
  const teamDBIDs = team.map((pokemon) => Number(pokemon.dbID)).join(",");

  dbConn.query(
    `DELETE FROM teamPokemon
    WHERE id NOT IN ('${teamDBIDs}')
    AND teamID = ${teamID}`,
    function (err, res) {
      if (err) {
        console.log("error: ", err);
      } else {
        console.log(res);
      }
    }
  );

  if (team.length !== 0) {
    await team.map((pokemon) => {
      let teamPokemon = new Pokemon(pokemon, teamID);
      if (teamPokemon.id === undefined) {
        dbConn.query(
          "INSERT INTO teamPokemon set ?",
          teamPokemon,
          function (err, res) {
            if (err) {
              console.log("error: ", err);
            }
          }
        );
      } else {
        dbConn.query(
          `UPDATE teamPokemon set ? WHERE id = ${teamPokemon.id}`,
          teamPokemon,
          function (err, res) {
            if (err) {
              console.log("error: ", err);
            }
          }
        );
      }
    });
  }

  dbConn.query(
    `SELECT tp.*, p.name , i.id AS itemID, i.name AS itemName, i.description, i.spriteURL
    FROM pokemon AS p 
    LEFT JOIN teampokemon AS tp 
    ON tp.pokemonID = p.id 
    LEFT JOIN item AS i
    ON i.id = tp.itemID
    WHERE teamID = ${teamID}`,
    function (err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        console.log("Saved team Pokemon : ", res);
        result(null, formatUserTeam(res));
      }
    }
  );
};

Pokemon.getTeamByID = function (teamID, result) {
  dbConn.query(
    `SELECT tp.*, p.name , i.id AS itemID, i.name AS itemName, i.description, i.spriteURL
    FROM pokemon AS p 
    LEFT JOIN teampokemon AS tp 
    ON tp.pokemonID = p.id 
    LEFT JOIN item AS i
    ON i.id = tp.itemID
    WHERE teamID = ${teamID}`,
    function (err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log("Team Pokemon : ", res);
        result(null, formatUserTeam(res));
      }
    }
  );
};

function formatUserTeam(team) {
  return team.map(async (pokemon) => {
    const {
      hpIV,
      atkIV,
      defIV,
      spAtkIV,
      spDefIV,
      spdIV,
      hpEV,
      atkEV,
      defEV,
      spAtkEV,
      spDefEV,
      spdEV,
      natureID,
      id,
      pokemonID,
      move1,
      move2,
      move3,
      move4,
      itemName,
      itemID,
      description,
      spriteURL,
    } = pokemon;
    pokemon.iv = {
      hp: hpIV,
      atk: atkIV,
      def: defIV,
      spAtk: spAtkIV,
      spDef: spDefIV,
      spd: spdIV,
    };
    pokemon.ev = {
      hp: hpEV,
      atk: atkEV,
      def: defEV,
      spAtk: spAtkEV,
      spDef: spDefEV,
      spd: spdEV,
    };
    pokemon.dbID = id;
    pokemon.id = pokemonID;
    pokemon.nature = { name: natureID };
    pokemon.moves = [
      await getMoveByID(move1),
      await getMoveByID(move2),
      await getMoveByID(move3),
      await getMoveByID(move4),
    ];
    pokemon.item = {
      id: itemID,
      name: itemName,
      description: description,
      spriteURL: spriteURL,
    };

    delete pokemon.itemID;
    delete pokemon.itemName;
    delete pokemon.description;
    delete pokemon.spriteURL;
    delete pokemon.natureID;
    delete pokemon.hpIV;
    delete pokemon.atkIV;
    delete pokemon.defIV;
    delete pokemon.spAtkIV;
    delete pokemon.spDefIV;
    delete pokemon.spdIV;
    delete pokemon.hpEV;
    delete pokemon.atkEV;
    delete pokemon.defEV;
    delete pokemon.spAtkEV;
    delete pokemon.spDefEV;
    delete pokemon.spdEV;
    delete pokemon.move1;
    delete pokemon.move2;
    delete pokemon.move3;
    delete pokemon.move4;

    return pokemon;
  });
}

async function getMoveByID(moveID) {
  return moveID === null
    ? null
    : await axios
        .get(`https://pokeapi.co/api/v2/move/${moveID}`)
        .then((response) => {
          const {
            id,
            accuracy,
            damage_class: { name: category },
            power,
            pp,
            name,
            type: { name: typeName },
            effect_chance,
          } = response.data;

          const moveData = {
            id: id,
            accuracy: accuracy,
            category: category,
            power: power,
            powerPoint: pp,
            name: name,
            type: typeName,
            effect_chance: effect_chance,
            effect_entries:
              response.data.effect_entries[0]?.short_effect ?? null,
          };

          return moveData;
        });
}

Pokemon.getAllLearnableMoves = async function getAllLearnableMoves(
  pokemonID,
  result
) {
  result(
    null,
    await axios
      .get(`https://pokeapi.co/api/v2/pokemon/${pokemonID}`)
      .then((response) => response.data.moves)
      .then((response) => {
        return response.map((move, index) =>
          axios.get(move.move.url).then((response) => {
            const {
              id,
              accuracy,
              damage_class: { name: category },
              power,
              pp,
              name,
              type: { name: typeName },
              effect_chance,
            } = response.data;

            const moveData = {
              id: id,
              accuracy: accuracy,
              category: category,
              power: power,
              powerPoint: pp,
              name: name,
              type: typeName,
              effect_chance: effect_chance,
              effect_entries:
                response.data.effect_entries[0]?.short_effect ?? null,
            };
            return moveData;
          })
        );
      })
  );
};

Pokemon.getAllHoldableItems = function (result) {
  dbConn.query(
    `SELECT * 
    FROM item`,
    function (err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        // console.log("All holdable items : ", res);
        result(null, res);
      }
    }
  );
};

module.exports = Pokemon;
