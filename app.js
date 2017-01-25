/*

    Mail-in-a-Box Status Bot
    ========================

    Sends status notifications about a Mail-in-a-Box server to Slack.

*/


// Load Configuration:
var config = require(__dirname + '/config.json');


var Botkit = require('botkit');
var request = require('request');

// Botkit setup:
var controller = Botkit.slackbot({
    debug: false,
    json_file_store: config.storageLocation
});

// Connect to Slack:
var bot = controller.spawn({
    incoming_webhook: {
        url: config.webhookUrl
    }
});

// Standard WebHook message callback
function webhookCallback(err,res) {
    if (err) {
        console.log("ERROR: Something went wrong sending a message to Slack");
    }
    else {
        console.log("Sent message to Slack.");
    }
}

// Alerts:
var alerts = {
    ongoing: {
        unavailable: false,     // Problem retrieving status information
        errors: []              // Errors reported by Mail-in-a-Box
    },
    unavailable: function(isUnavailable) {

        if (isUnavailable && !alerts.ongoing.unavailable) {

            alerts.ongoing.unavailable = true;
            bot.sendWebhook({
                text: ':exclamation: Mail-in-a-Box status checks are failing!'
            }, webhookCallback);

        }

        if (!isUnavailable && alerts.ongoing.unavailable) {

            alerts.ongoing.unavailable = false;
            bot.sendWebhook({
                text: ':white_check_mark: Mail-in-a-Box is responding to status checks again!'
            }, webhookCallback);

        }

    },
    errors: function(msgs) {

        var allGood = msgs.length == 0 && alerts.ongoing.errors.length != 0;
        var newErrors = [];
        var resolvedErrors = [];

        // Check for new errors:
        msgs.forEach(function(msg) {
            if (alerts.ongoing.errors.indexOf(msg) == -1) {
                console.log("> New alert: " + msg);
                alerts.ongoing.errors.push(msg);
                newErrors.push({
                    "color": "#D00000",
                    "title": msg
                });
            }
        });

        // Check for resolved errors:
        alerts.ongoing.errors.forEach(function(error) {
            if (msgs.indexOf(error) == -1) {
                console.log("> Alert resolved: " + error);
                alerts.ongoing.errors.splice(alerts.ongoing.errors.indexOf(error), 1);
                resolvedErrors.push({
                    "color": "#00D000",
                    "title": error
                });
            }
        });

        // Report new errors:
        if (newErrors.length > 0) {
            bot.sendWebhook({
                text: ':x: New alerts open:',
                attachments: newErrors
            }, webhookCallback);
        }

        // Report resolved errors:
        if (resolvedErrors.length > 0) {
            bot.sendWebhook({
                text: ':white_check_mark: Alerts resolved:',
                attachments: resolvedErrors
            }, webhookCallback);
        }

        // Report all good:
        if (allGood) {
            setTimeout(function(){
                bot.sendWebhook({
                    text: ':raised_hands:  All alerts have been resolved!'
                }, webhookCallback);
            }, 1000);
        }

    }
};

function checkStatus() {

    request({
        url: "https://" + config.miab.domain + "/admin/system/status",
        method: "POST",
        auth: {
            username: config.miab.username,
            password: config.miab.password
        }
    }, function(error, response, body) {

        if (error) {
            alerts.unavailable(true);
            return;
        }

        try {
            var results = JSON.parse(response.body);
        } catch(e) {
            console.log(response);
            alerts.unavailable(true);
            return;
        }

        alerts.unavailable(false);

        var errors = [];

        results.forEach(function(status) {
            if (status.type != "ok" && status.type != "heading") {
                errors.push(status.text);
            }
        });

        alerts.errors(errors);

    });

}

checkStatus();
setInterval(checkStatus, 900000);

bot.sendWebhook({
    text: ':sunglasses: Bot is up and running!'
}, webhookCallback);
