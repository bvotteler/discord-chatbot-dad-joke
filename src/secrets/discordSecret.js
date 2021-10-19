import { SecretsManager } from "aws-sdk";
import { discordBotAPIKeyName } from "../consts/envProps";

const secretsManager = new SecretsManager();

/**
 * Cached Discord secrets so we can reduce warm start times.
 */
let __discordSecrets = undefined;

/**
 * Gets the Discord secrets (public key, client ID, etc.) for use in our lambdas.
 * 
 * @returns The Discord secrets to be used.
 */
export async function getDiscordSecrets() {
  if (!__discordSecrets) {
    try {
      const discordApiKeys = await secretsManager.getSecretValue({
        SecretId: discordBotAPIKeyName,
      }).promise();
      if (discordApiKeys.SecretString) {
        __discordSecrets = JSON.parse(discordApiKeys.SecretString);
      }
    } catch (exception) {
      console.log(`Unable to get Discord secrets: ${exception}`);
    }
  }
  return __discordSecrets;
};