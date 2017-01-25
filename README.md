# Mail-in-a-Box Status Bot

I conceived this bot to complement the [Mail-in-a-Box Mail Bot](https://github.com/carlfriess/miab-mail-bot). It sends status notifications about a [Mail-in-a-Box](https://mailinabox.email) server to Slack.

## Installation

Clone the repository and run npm install:
 
```
git clone https://github.com/carlfriess/miab-status-bot.git
cd miab-status-bot
npm install --production

```

Set up an admin account on your Mail-in-a-Box for the bot and adjust the configuration in `config.json`. You'll also need to [add an incoming webhook](https://my.slack.com/services/new/incoming-webhook/) to your Slack team and copy the webhook URL to `config.json`.

Finally, to run the bot type:

```
node app.js
```

## Configuration

The configuration for the bot is set in the `config.json` file:


| Field | Example | Description |
| ----- |:-------:| ----------- |
| **`webhookUrl`** | `<SLACK_WEBHOOK_URL>` | Slack incoming webhook URL |
| **`miab.domain`** | `box.your-domain.com` | Domain where the Mail-in-a-box is reachable at. |
| **`miab.username`** | `status-bot@your-domain.com` | The username for an admin account on the Mail-in-a-Box server. |
| **`miab.password`** | `<PASSWORD>` | The password for an admin account on the Mail-in-a-Box server. |

*All fields are required for the bot to work correctly!*
