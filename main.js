var prompt = require("prompt-sync")();
var fetch = require("node-fetch");
var id = require("yourid");
var chalk = require("chalk");
var fs = require("fs");
var filename = "nitros.txt";
var API_END_POINT_START =
  "https://discordapp.com/api/v8/entitelemnts/gift-codes";
let count;

const countOfChecks = prompt(
  chalk.gray("How many nitro gift links do you wan't to check? ")
);

if (countOfChecks) {
  count = parseInt(countOfChecks);
} else {
  count = 300;
}

// Check Lines
async function checkLines() {
  if (!fs.existsSync(filename)) {
    console.log(chalk.red("The nitros file does not exist!"));
  } else {
    fs.readFile(filename, "utf8", (err, data) => {
      if (err) throw err;

      const lines = data.split("\n");
      lines.forEach(async (line) => {
        fetch(`${API_END_POINT_START}/${line}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.code === 0) {
              console.log(
                chalk.red("Invalid Code Found > ") +
                  chalk.gray(`https://discord.gift/${line}`)
              );
            } else {
              console.log(
                chalk.green("Valid Code Found > ") +
                  chalk.gray(`https://discord.gift/${line}`)
              );
            }
          })
          .catch((err) => {
            console.log(chalk.red("Error: " + err.message));
          });
      });
    });
  }
}

// Write lines
function writeCountToFile(lines) {
  if (typeof lines !== "number") {
    console.log(chalk.red("The lines count must be a number."));
  } else {
    if (fs.existsSync(filename)) {
      console.log(
        chalk.red("Nitro file already exists, delete it to make new nitros!")
      );
    } else {
      let line = "";
      for (let i = 0; i < count; i++) {
        line += `${id.generate({ length: 16 })}\n`;
      }

      fs.writeFile(filename, line, (err) => {
        if (err) throw err;
        console.log(
          chalk.green("The nitro links has been saved to: ") +
            chalk.gray("nitros.txt")
        );

        checkLines();
      });
    }
  }
}

writeCountToFile(count);
