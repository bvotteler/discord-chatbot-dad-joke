'use strict';

// const axios = require('axios');
const { InteractionResponseType, InteractionType, verifyKey } = require('discord-interactions');
const getDiscordSecrets = require('./secrets/discordSecret.js').getDiscordSecrets;
const apiKeyName = require('./secrets/discordSecret.js').apiKeyName;

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Hello world. This my tech stack. There are many more like it, but this one is mine.',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.discordHandler = async (event, ctx, callback) => {
  // TODO: clean up later when confident about event structure
  console.log('event: ' + JSON.stringify(event, null, 2));

  // get discord secrets
  const discordSecrets = await getDiscordSecrets();

  // Verify the request
  const signature = event.headers['x-signature-ed25519'];
  const timestamp = event.headers['x-signature-timestamp'];

  const rawBody = event.body;
  const isValidRequest = await verifyKey(rawBody, signature, timestamp, discordSecrets.CLIENT_PUBLIC_KEY);
  if (!isValidRequest) {
    return callback(null, {
      statusCode: 401,
      body: 'Bad request signature'
    });
  }

  // Handle the payload
  // TODO: safeguard json parse?
  const interaction = JSON.parse(event.body);
  if (interaction && interaction.type === InteractionType.APPLICATION_COMMAND) {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `You used: ${interaction.data.name}`
        }
      })
    });
  } else {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        type: InteractionResponseType.PONG
      })
    });
  }

  return;

  // dead code, keep for later use
  // const response = {
  //   tts: false,
  //   content: 'Hello world. This my tech stack. There are many more like it, but this one is mine.',
  //   embeds: [],
  //   allowed_mentions: [],
  // };
  // console.log('event: ' + JSON.stringify(event));
  // // TODO: need to make this a LOT safer
  // const token = JSON.parse(event.body).token;
  // if (token && await sendResponse(response, token)) {
  //   console.log('Responded successfully!');
  // } else {
  //   console.log('Failed to send response!');
  // }
  // return '200';
};


const sendResponse = async (response, interactionToken) => {
  const discordSecret = await getDiscordSecrets();
  if (discordSecret == null) {
    console.error('Unable to get discord secrets for key: ' + apiKeyName);
    return false;
  }

  const authConfig = {
    headers: {
      'Authorization': `Bot ${discordSecret.DISCORD_TOKEN}`
    }
  };

  // TODO: continue here, use axios for real calls
  console.log('got a token? ' + (discordSecret.DISCORD_TOKEN !== undefined));
  // remember to remove this
  return true;

//   try {
//     let url = `https://discord.com/api/v9/webhooks/${discordSecret?.CLIENT_ID}/${interactionToken}`;
//     return (await axios.post(url, response, authConfig)).status == 200;
//   } catch (exception) {
//     console.log(`There was an error posting a response: ${exception}`);
//     return false;
//   }
};