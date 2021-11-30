'use strict';

const axios = require('axios');
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
    console.error('Invalid request, return 401.');
    return callback(null, {
      statusCode: 401,
      body: 'Bad request signature'
    });
  }

  // Handle the payload
  // TODO: safeguard json parse?
  const interaction = JSON.parse(event.body);
  if (interaction && interaction.type === InteractionType.APPLICATION_COMMAND) {
    console.log('Identified incoming command. Assuming it is /dadjoke.');

    // Fetch icanhazdadjoke from API
    console.log('Fetching joke from API.');
    const jokeApiResponse = await axios.get('https://icanhazdadjoke.com/', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'axios 0.23.0'
      }
    });

    let joke = 'Yeah... Not funny, but something didn\'t quite work.';
    if (jokeApiResponse && jokeApiResponse.data && jokeApiResponse.data.joke) {
      console.log('Successfully fetched joke from API.');
      joke = jokeApiResponse.data.joke;
    } else {
      console.error('Failed to fetch joke from API.');
    }

    const responseBody = JSON.stringify({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        tts: false,
        content: joke,
        embeds: [],
        allowed_mentions: []
      }
    });

    return responseBody;
  } else {
    console.log('Not application command, assuming a ping. Return pong.');

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        type: InteractionResponseType.PONG
      })
    });
  }
};