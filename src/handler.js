'use strict';

import axios from 'axios';
import { getDiscordSecrets } from './secrets/discordSecret';

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

module.exports.discordHandler = async (event) => {
  const response = {
    tts: false,
    content: 'Hello world. This my tech stack. There are many more like it, but this one is mine.',
    embeds: [],
    allowed_mentions: [],
  };
  if (event.jsonBody.token && await sendResponse(response, event.jsonBody.token)) {
    console.log('Responded successfully!');
  } else {
    console.log('Failed to send response!');
  }
  return '200';
};


const sendResponse = async (response, interactionToken) => {
  const discordSecret = await getDiscordSecrets();
  const authConfig = {
    headers: {
      'Authorization': `Bot ${discordSecret?.DISCORD_TOKEN}`
    }
  };

  try {
    let url = `https://discord.com/api/v9/webhooks/${discordSecret?.CLIENT_ID}/${interactionToken}`;
    return (await axios.post(url, response, authConfig)).status == 200;
  } catch (exception) {
    console.log(`There was an error posting a response: ${exception}`);
    return false;
  }
};