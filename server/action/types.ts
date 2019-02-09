export interface DbObject {
  id: number;
  created_at: Date;
  updated_at: Date;
}

export interface DbServer extends DbObject {
  scheme: string;
  domain: string;
  shared_inbox: string;
}

export interface DbRemoteUser extends DbObject {
  user_id: string;
  server_id: string;
  name: string;
  display_name: string;
  key_public: string;
  inbox: string;
}

export interface DbLocalUser extends DbObject {
  name: string;
  display_name: string;
  key_public: string;
  key_private: string;
}

export interface Server extends DbObject {
  baseUrl: string;
  sharedInbox?: string;
}

export interface RemoteUser extends DbObject {
  userId: string;
  server: Server;
  name: string;
  displayName: string;
  publicKey?: string;
  inbox: string;
}

export interface LocalUser extends DbObject {
  name: string;
  displayName: string;
  publicKey: string;
  privateKey: string;
}
