import * as fs from 'fs';
import { promisify } from 'util';
import * as inquirer from 'inquirer';
import chalk from 'chalk';
import { getKnex, getAPAxios } from '../util';
import { DbLocalUser } from '../action/types';

/**
 * 新規ユーザーを追加する
 */
export async function createUser(): Promise<void> {
  const knex = getKnex();

  console.log(chalk.green('Creating a new local account.'));
  const answers: any = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username',
      validate: (n: string) => (n.match(/^[a-zA-Z0-9_]{1,128}$/) ? true : 'Invalid username!'),
    },
    {
      type: 'input',
      name: 'displayName',
      message: 'Displayed Name',
      validate: (n: string) => n.length < 256,
    },
    {
      type: 'input',
      name: 'publicKeyFilename',
      message: 'Path to public key',
    },
    {
      type: 'input',
      name: 'privateKeyFilename',
      message: 'Path to private key',
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
  } catch (e) {
    console.log(chalk.red(e.message));
    process.exit(1);
  }
  process.exit(0);
}

/**
 * リモートユーザーをフォローする
 */
export async function followRemoteUser(): Promise<void> {
  const acctRegex = /^([a-zA-Z0-9_]+)@([a-zA-Z0-9\-\.]+)$/;
  const knex = getKnex();
  const apaxios = getAPAxios();

  const users: Partial<DbLocalUser>[] = await knex('users').select('id', 'name', 'display_name');
  if (users.length === 0) process.exit(0);

  console.log(chalk.green('Follow a remote user.'));
  const { localUser, remoteUser } = await inquirer.prompt([
    {
      type: 'list',
      name: 'localUser',
      message: 'Follow from...',
      choices: users.map((u) => ({
        name: `#${u.id} ${u.display_name} (@${u.name})`,
        value: u,
        short: `@${u.name}`,
      })),
    },
    {
      type: 'input',
      name: 'remoteUser',
      message: 'Remote user (user@example.com)',
      validate: (n: string) => (n.match(acctRegex) ? true : 'Invalid form!'),
      filter: (n: string) => n.match(acctRegex),
    },
  ]);

  console.log('Fetching remote user information...');
  const webfingerUrl = `https://${remoteUser[1]}/.well-known/webfinger?resource=acct:${remoteUser[0]}`;
  try {
    const wfResult = await apaxios.get(webfingerUrl);
  } catch (e) {
    console.log(chalk.red(`Error: ${e.message}`));
  }
}
