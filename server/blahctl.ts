import * as fs from 'fs';
import { promisify } from 'util';
import * as cac from 'cac';
import { getKnex } from './util';

const blahctl = cac('blahctl');

blahctl
  .command('add-user <username> <public key> <private key>', 'adds a new local account')
  .action(async (username: string, publicKeyFilename: string, privateKeyFilename: string) => {
    console.log(`username: ${username}`);
    console.log(`pub: ${publicKeyFilename}`);
    console.log(`prv: ${privateKeyFilename}`);

    try {
      const pubkey = await promisify(fs.readFile)(publicKeyFilename);
      const prvkey = await promisify(fs.readFile)(privateKeyFilename);
      console.log(pubkey.toString());
    } catch (e) {
      console.log(e.message);
    }
  });

blahctl.parse();
