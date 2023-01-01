/*

  Copyright (c) 2022 - Lasse Vestergaard
  This program is free software: you can redistribute it and/or modify it. However, use it at your own risk.
*/

"use strict";

/*
 | \ | (_) |_ _ __ ___    / ___| ___ _ __   ___ _ __ __ _| |_ ___  _ __ 
 |  \| | | __| '__/ _ \  | |  _ / _ \ '_ \ / _ \ '__/ _` | __/ _ \| '__|
 | |\  | | |_| | | (_) | | |_| |  __/ | | |  __/ | | (_| | || (_) | |   
 |_| \_|_|\__|_|  \___/   \____|\___|_| |_|\___|_|  \__,_|\__\___/|_|

*/

require("dotenv").config();
var prompt = require("prompt-sync")();
var fetch = require("node-fetch");
var id = require("yourid");
var chalk = require("chalk");
var fs = require("fs");
var open = require("open");
var child_process = require("child_process");
var { Webhook, MessageBuilder } = require("discord-webhook-node");
var { DISCORD_WEBHOOK_URI } = process.env;
var { main } = require("./package.json");
var Time = Date.now();

// Default configuration
var config = {
  webhooks: {
    // The URI of the webhook
    uri: DISCORD_WEBHOOK_URI,
    // If gift codes are invalid it will send a webhook.
    sendValidCodeHook: true,
    // If gift codes are invalid it will send a webhook.
    sendInvalidCodeHook: true,
  },

  general: {
    projectName: "Nitro Generator",
    filename: "nitros.txt",
    requiredFile: ".env",
    github_url: "https://github.com/lassv/nitro-generator",
    mainFile: main,
    cmd: "node",
  },

  colors: {
    GREEN: "#26b55a",
    RED: "#eb1e29",
  },

  limits: {
    // The maximum number of the requests allowed
    MAX_REQUESTS: 500,
    // The minimum number of the requests allowed
    MIN_REQUESTS: 10,
  },
};

var API_END_POINT_START =
  "https://discordapp.com/api/v8/entitelemnts/gift-codes";
let count;

// The main prompt

console.log();
console.log(chalk.blue("🔨 Welcome to Nitro Generator"));
console.log();
console.log(chalk.gray("What do you wan't to do?"));
console.log();

// Options
const Options = [
  {
    id: 1,
    text: "Create and check nitro codes",
  },

  {
    id: 2,
    text: "Only check existing codes in the file",
  },

  {
    id: 3,
    text: "Delete your nitro file.",
  },

  {
    id: 4,
    text: "Give a star on Github",
  },

  {
    id: 5,
    text: "Setup up the project",
  },

  {
    id: 6,
    text: "Exit program",
  },
];

// Map thought the options
Options.map((o) => {
  console.log(`${o.id}. ${o.text}`);
});

console.log();

// Enter the choice
const option = prompt(chalk.yellowBright("Enter your choice: "));

// Format the choice to a number
const formatOption = parseInt(option);

// The Choice Handler
if (formatOption === 6) {
  console.log(chalk.greenBright("Program was successfully exited!"));
  console.log();
  process.exit(0);
} else if (formatOption === 1) {
  console.log();
  checkSetup();
  checkAndCreate();
  writeCountToFile(count);
} else if (formatOption === 2) {
  console.log();
  checkSetup();
  checkLines();
} else if (formatOption === 3) {
  checkSetup();
  try {
    fs.unlinkSync(config.general.filename);
    console.log(chalk.greenBright("File was deleted successfully!"));
    runProgram({ timeout: true, time: 1500 });
  } catch (err) {
    console.log(chalk.red(`Error: ${err.message}`));
  }
} else if (formatOption === 4) {
  console.log(chalk.blue("Thanks for your support! ❤"));
  console.log();
  setTimeout(() => {
    open(config.general.github_url);
  }, 500);
} else if (formatOption === 5) {
  setup();
} else {
  console.log();
  console.log(chalk.redBright("No action taken, exiting program..."));
  console.log();
  process.exit(1);
}

// Functions starts here
function checkAndCreate() {
  const countOfChecks = prompt(
    chalk.cyanBright("❓ How many Nitro gift links do you wan't to check? ")
  );
  console.log();

  // Validate the countOfChecks
  if (countOfChecks) {
    if (parseInt(countOfChecks) > config.limits.MAX_REQUESTS) {
      console.log(
        chalk.red(
          `You can only check ${config.limits.MAX_REQUESTS} at the time!`
        )
      );

      runProgram({ timeout: true, time: 1500 });
    } else if (parseInt(countOfChecks) < config.limits.MIN_REQUESTS) {
      console.log(
        chalk.red(
          `You must check at least ${config.limits.MIN_REQUESTS} at the time!`
        )
      );

      runProgram({ timeout: true, time: 1500 });
    } else {
      count = parseInt(countOfChecks);
    }
  } else {
    count = 200;
  }
}

// Check Lines
async function checkLines() {
  if (!fs.existsSync(config.general.filename)) {
    console.log(chalk.red("The nitros file does not exist!"));

    runProgram({ timeout: true, time: 1500 });
  } else {
    // The first Webhook That will be send
    var hook = new Webhook(config.webhooks.uri);
    let embed = new MessageBuilder()
      .setTitle("🔨 Nitro Generator")
      .setDescription(`Generator was started up in: **${Date.now() - Time}ms**`)
      .setColor(config.colors.GREEN)
      .setTimestamp();

    hook.send(embed);

    fs.readFile(config.general.filename, "utf8", (err, data) => {
      if (err) throw err;

      const lines = data.split("\n");
      lines.forEach(async (line) => {
        // Fetching all the codes from nitros.txt
        fetch(`${API_END_POINT_START}/${line}`)
          .then((res) => {
            if (res.status === 200) {
              console.log(
                chalk.green("Valid Code Found > ") +
                  chalk.gray(`https://discord.gift/${line}`)
              );

              // If the weebhook is enabled
              if (config.webhooks.sendValidCodeHook) {
                let embed = new MessageBuilder()
                  .setTitle("✅ Valid Code")
                  .setDescription(
                    `Valid Code Found > **https://discord.gift/${line}**`
                  )
                  .setColor(config.colors.GREEN)
                  .setTimestamp();

                hook.send(embed);
              }
            } else {
              console.log(
                chalk.red("Invalid Code Found > ") +
                  chalk.gray(`https://discord.gift/${line}`)
              );

              // If the weebhook is enabled
              if (config.webhooks.sendInvalidCodeHook) {
                let embed = new MessageBuilder()
                  .setTitle("❌ Invalid Code")
                  .setDescription(
                    `Invalid Code Found > **https://discord.gift/${line}**`
                  )
                  .setColor(config.colors.RED)
                  .setTimestamp();

                hook.send(embed);
              }
            }
          })
          .catch((err) => {
            console.log(chalk.red("Error: " + err.message));
          });
      });
    });
  }
}

// Write lines gift codes to nitros.txt
function writeCountToFile(lines) {
  if (typeof lines !== "number") {
    console.log(chalk.red("The lines count must be a number."));

    runProgram({ timeout: true, time: 1500 });
  } else {
    if (fs.existsSync(config.general.filename)) {
      console.log(
        chalk.red("Nitro file already exists, delete it to make new nitros!")
      );

      runProgram({ timeout: true, time: 1500 });
    } else {
      let line = "";
      for (let i = 0; i < lines; i++) {
        line += `${id.generate({ length: 16 })}\n`;
      }

      fs.writeFile(config.general.filename, line, (err) => {
        if (err) throw err;
        console.log(
          chalk.green("The nitro links has been saved to: ") +
            chalk.gray(config.general.filename)
        );

        checkLines();
      });
    }
  }
}

// The setup function
function setup() {
  console.log();
  if (fs.existsSync(config.general.requiredFile)) {
    console.log(chalk.red("Your project is already setup!"));
    console.log();
  } else {
    const webHookURI = prompt(chalk.gray("Enter your Discord Webhook URI: "));

    if (!webHookURI) {
      console.log(chalk.red("Webhook URI is required"));
      console.log();
    } else {
      const fileContent = `DISCORD_WEBHOOK_URI = "${webHookURI}"`;

      // Writing the file content
      fs.writeFile(config.general.requiredFile, fileContent, (err) => {
        if (err) throw err;
        console.log();
        console.log(chalk.green("Your project is now setup and ready to go! "));

        runProgram({ timeout: true, time: 1500 });
      });
    }
  }
}

// Check if project is setup
function checkSetup() {
  if (!fs.existsSync(config.general.requiredFile)) {
    console.log(chalk.red("Your project is not setup yet!"));
    console.log();
    setup();
  }
}

// Running program!
function runProgram(options) {
  if (options.timeout) {
    setTimeout(() => {
      console.clear();
      child_process.execSync(
        `${config.general.cmd} ${config.general.mainFile}`,
        {
          stdio: "inherit",
        }
      );
    }, options.time);
  } else {
    console.clear();
    child_process.execSync(`${config.general.cmd} ${config.general.mainFile}`, {
      stdio: "inherit",
    });
  }
}
