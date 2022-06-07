import { version } from '../package.json';
import { Command } from 'commander';
import mergeDeep from 'merge-deep';
import fs from 'fs';
const config = {};

const commander = new Command();

commander
  .version(version, '-v, --version',)
  .usage('[OPTIONS]...',)
  .option('-sk, --secretKey <value>', 'Define secret key to genereta access token', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',)
  .option('-h, --host <value>', 'Define host', 'http://127.0.0.1',)
  .option('-p, --port <value>', 'Define listing port', 3333,)
  .option('-an, --applicationName <value>', 'Define application name', 'WhatsApp.Bot')
  .option('-ll, --logLevel <value>', 'Define log level', 'debug')
  .option('-lp, --logPretty <value>', 'Define log pretty print', true)
  .option('-qr, --printQRInTerminal <value>', 'Define print qrcode in terminal', true)
  .option('-lc, --logColorize <value>', 'Define log colorize print', true)
  .option('-lmf, --logMessageFormat <value>', 'Define log message format', false)
  .option('-ltm, --logTranslateTime <value>', 'Define log translate the epoch time value into a human readable date and time string', true)
  .option('-bn, --browserName <value>', 'Set device browser name', 'Chrome')
  .option('-sas, --startAllSession <value>', 'Define starts all sessions when starting the server', true)
  .option('-ml, --maxListeners <value>', 'Define the maximum global listeners. 0 = infinity', 15)
  .option('-sd, --sessionDirectory <value>', 'Define sessionDirectory for each whatsapp instance for working with multi device', './session/')
  .option('-ajr, --autoRejectCall <value>', 'Define to auto reject call', true)
  .option('-wu, --webhookUrl <value>', 'Define event webhook url to send all event', 'http://127.0.0.1:3000/hook/')
  .option('-wad, --mediaAutoDownload <value>', 'Define automatically downloads files to upload to the webhook', true)
  .option('-wrm, --webhookReadMessage <value>', 'Define to marks messages as read when the webhook returns ok', true)
  .option('-suc, --sendUnreadCount <value>', 'Define to load message count from unread chats', 100)
  .option('-c, --config <value>', 'Read config from json file or json string', {})

let options = commander.opts();
options = mergeDeep({}, config, options);
if (!fs.existsSync(options.sessionDirectory)) {
  fs.mkdirSync(options.sessionDirectory, { recursive: true });
}
if (fs.existsSync(options.config)) {
  try {
    const json = JSON.parse(fs.readFileSync(options.config));
    options = mergeDeep(options, json);
  } catch (e) {}
} else {
  try {
    const json = JSON.parse(options.config);
    options = mergeDeep(options, json);
  } catch (e) {}
}
module.exports = {
  ...options,
};
