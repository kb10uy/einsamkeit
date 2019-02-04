import * as fs from 'fs';
import { promisify } from 'util';
import * as cac from 'cac';
import { getLogger, getKnex } from './util';

async function addUser(username: string, publicKeyFilename: string, privateKeyFilename: string): Promise<void> {
  const logger = getLogger();
  const knex = getKnex();
  try {
    const pubkey = await promisify(fs.readFile)(publicKeyFilename);
    const prvkey = await promisify(fs.readFile)(privateKeyFilename);
    const now = new Date();
    await knex('users').insert({
      name: username,
      key_public: pubkey.toString(),
      key_private: prvkey.toString(),
      created_at: now,
      updated_at: now,
    });
    logger.info(`User ${username} registered`);
  } catch (e) {
    console.log(e.message);
  }
}

const blahctl = cac('blahctl');
blahctl.command('add-user <username> <public key> <private key>', 'adds a new local account').action(addUser);
blahctl.parse();
