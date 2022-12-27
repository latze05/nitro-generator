require("dotenv").config();
var prompt = require("prompt-sync")();
var fetch = require("node-fetch");
var id = require("yourid");
var chalk = require("chalk");
var fs = require("fs");
const { Webhook, MessageBuilder } = require("discord-webhook-node");
var { DISCORD_WEBHOOK_URI } = process.env;
var Time = Date.now();
var filename = "nitros.txt";

// Default configuration
var config = {
  webhooks: {
    // The URI of the webhook
    uri: DISCORD_WEBHOOK_URI,
    // If gift codes are invalid it will send a webhook.
    sendValidCodeHook: true,
    // If gift codes are invalid it will send a webhook.
    sendInvalidCodeHook: false,
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
const countOfChecks = prompt(
  chalk.cyanBright("❓ How many Nitro gift links do you wan't to check? ")
);
console.log();

// Validate the countOfChecks
if (countOfChecks) {
  if (parseInt(countOfChecks) > config.limits.MAX_REQUESTSMAX_REQUESTS) {
    console.log(
      chalk.red(`You can only check ${config.limits.MAX_REQUESTS} at the time!`)
    );
  } else if (parseInt(countOfChecks) < config.limits.MIN_REQUESTSMIN_REQUESTS) {
    console.log(
      chalk.red(
        `You must check at least ${config.limits.MIN_REQUESTSMIN_REQUESTS} at the time!`
      )
    );
  } else {
    count = parseInt(countOfChecks);
  }
} else {
  count = 200;
}

// Check Lines
async function checkLines() {
  if (!fs.existsSync(filename)) {
    console.log(chalk.red("The nitros file does not exist!"));
  } else {
    // The first Webhook That will be send
    var hook = new Webhook(DISCORD_WEBHOOK_URI);
    let embed = new MessageBuilder()
      .setTitle("🔨 Nitro Generator")
      .setDescription(`Generator was started up in: **${Date.now() - Time}ms**`)
      .setColor("#26b55a");

    hook.send(embed);

    fs.readFile(filename, "utf8", (err, data) => {
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
                  .setColor("#26b55a");

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
                  .setColor("#eb1e29");

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

// Running the main function
writeCountToFile(count);
