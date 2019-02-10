import * as cac from 'cac';
import * as commandUser from './blahctl/user';

const blahctl = cac('blahctl');
blahctl.command('create-user', 'Creates a new local user.').action(commandUser.createUser);
blahctl.command('update-remote', 'Updates all known remote users.').action(commandUser.updateRemoteUser);
blahctl.command('follow', 'Follows a remote user.').action(commandUser.followRemoteUser);
blahctl.command('unfollow', 'Unfollows a remote user.').action(commandUser.UnfollowRemoteUser);
blahctl.help();
blahctl.parse();
