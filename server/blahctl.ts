import * as cac from 'cac';

const blahctl = cac('blahctl');

blahctl
  .command('add-user <username> <public key> <private key>', 'adds a new local account')
  .action((username: string, publicKeyFilename: string, privateKeyFilename: string) => {
    console.log(`username: ${username}`);
    console.log(`pub: ${publicKeyFilename}`);
    console.log(`prv: ${privateKeyFilename}`);
  });

blahctl.parse();
