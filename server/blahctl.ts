import * as cac from 'cac';
import * as commandUser from './blahctl/user';

const blahctl = cac('blahctl');
blahctl.command('create-user', 'Creates a new local user.').action(commandUser.createUser);
blahctl.command('follow', 'Follows a remote user.').action(commandUser.followRemoteUser);
blahctl.help();
blahctl.parse();
