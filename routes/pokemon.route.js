var express = require("express");
var router = express.Router();
const pokemonController = require("../controllers/pokemon.controller");

router.get("/", pokemonController.getAllPokemon);

router.post("/insertPokemon", pokemonController.insertAllPokemon);

router.post("/saveTeam", pokemonController.saveTeam);

router.post("/createNewTeam", pokemonController.createNewTeam);

router.post("/getUserTeams", pokemonController.getUserTeams);

router.post("/getTeamByID", pokemonController.getTeamByID);

router.post("/getAllLearnableMoves", pokemonController.getAllLearnableMoves);

router.post("/getAllHoldableItems", pokemonController.getAllHoldableItems);

module.exports = router;
