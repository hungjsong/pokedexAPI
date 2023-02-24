"use strict";
const Pokemon = require("../models/pokemon.model");

exports.getAllPokemon = function (req, res) {
  Pokemon.getAllPokemon(function (err, pokemon) {
    if (err) res.send(err);
    console.log("res", pokemon);
    res.send(pokemon);
  });
};

exports.insertAllPokemon = function (req, res) {
  Pokemon.insertAllPokemon(function (err, pokemon) {
    if (err) res.send(err);
    res.send(pokemon);
  });
};

exports.createNewTeam = function (req, res) {
  const { userID } = req.body;
  Pokemon.createNewTeam(Number(userID), function (err, team) {
    if (err) res.send(err);
    res.json({
      error: false,
      message: "Team added successfully",
      data: team,
    });
  });
};

exports.saveTeam = function (req, res) {
  const { team, teamID } = req.body;
  Pokemon.saveTeam({ team, teamID }, async function (err, team) {
    if (err) res.send(err);
    const resolvedTeam = await Promise.all(team);
    res.json({
      error: false,
      message: "Team saved successfully",
      data: resolvedTeam,
    });
  });
};

exports.getUserTeams = function (req, res) {
  const { userID } = req.body;
  Pokemon.getUserTeams(Number(userID), function (err, team) {
    if (err) res.send(err);
    res.send(team);
  });
};

exports.getTeamByID = function (req, res) {
  const { teamID } = req.body;
  Pokemon.getTeamByID(Number(teamID), async function (err, team) {
    if (err) res.send(err);
    const resolvedTeam = await Promise.all(team);
    res.json({
      error: false,
      message: `Retrieved team with id ${teamID} successfully`,
      data: resolvedTeam,
    });
  });
};

exports.getAllLearnableMoves = function (req, res) {
  const { pokemonID } = req.body;
  Pokemon.getAllLearnableMoves(Number(pokemonID), async function (err, moves) {
    if (err) res.send(err);
    const resolvedMoves = await Promise.all(moves);
    res.json({
      error: false,
      message: "All moves learnable retrieved",
      data: resolvedMoves,
    });
  });
};

exports.getAllHoldableItems = function (req, res) {
  Pokemon.getAllHoldableItems(function (err, items) {
    if (err) res.send(err);
    res.json({
      error: false,
      message: "All holdable items retrieved",
      data: items,
    });
  });
};
