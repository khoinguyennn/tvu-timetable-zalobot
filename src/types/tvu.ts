export interface TVUUserInfo {
  IDUser: string;
  Session: string;
  id: string;
  name: string;
  FullName: string;
  principal: string;
  access_token: string;
  userName: string;
  roles: string;
  IDDVPC: string;
  UserLevel: number;
  result: boolean;
  code: number;
}

export interface TVULoginCredentials {
  username: string;
  password: string;
  uri: string;
}
