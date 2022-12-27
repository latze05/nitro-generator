var prompt = require("prompt-sync")();
var axios = require("axios");
var id = require("yourid");
var chalk = require("chalk");
let count;

const countOfChecks = prompt(
  chalk.gray("How many nitro gift links do you wan't to check? ")
);

if (countOfChecks) {
  count = parseInt(countOfChecks);
} else {
  count = 300;
}
