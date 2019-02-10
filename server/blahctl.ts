import * as fs from 'fs';
import { promisify } from 'util';
import * as cac from 'cac';
import * as inquirer from 'inquirer';
import chalk from 'chalk';
import { getLogger, getKnex } from './util';

/**
 * 新規ユーザーを追加する
 * @param username ユーザー名
 * @param publicKeyFilename RSA 公開鍵のファイル名
 * @param privateKeyFilename RSA 秘密鍵のファイル名
 */
async function addUser(): Promise<void> {
  const logger = getLogger();
  const knex = getKnex();

  console.log(chalk.green('Creating a new local account.'));
  const answers: any = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      validate: (n: string) => (n.match(/[a-zA-Z0-9_]{1,128}/) ? true : 'Invalid username!'),
    },
    {
      type: 'input',
      name: 'displayName',
      validate: (n: string) => n.length < 256,
    },
    {
      type: 'input',
      name: 'publicKeyFilename',
    },
    {
      type: 'input',
      name: 'privateKeyFilename',
    },
  ]);

  try {
    const pubkey = await promisify(fs.readFile)(answers.publicKeyFilename);
    const prvkey = await promisify(fs.readFile)(answers.privateKeyFilename);
    const now = new Date();
    await knex('users').insert({
      name: answers.username,
      display_name: answers.displayName,
      key_public: pubkey.toString(),
      key_private: prvkey.toString(),
      created_at: now,
      updated_at: now,
    });
    logger.info(`User ${answers.username} registered`);
  } catch (e) {
    console.log(chalk.red(e.message));
    process.exit(1);
  }
  process.exit(0);
}

const blahctl = cac('blahctl');
blahctl.command('add-user <username> <public key> <private key>', 'adds a new local account').action(addUser);
blahctl.parse();
