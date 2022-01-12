declare namespace NodeJS {
  export interface ProcessEnv {
    DISCORD_TOKEN?: string;
    CLIENT_ID?: string;
    ID_SUFFIX?: string;
  }
}

declare global {
  // this doesn't work and i give up
  var config: {
    UCAT_SERVER_ID: string;
    ROLE_IDS: Map<string, Iterable<string>>;
    SPAM_CHANNEL_ID: string;
    ROLES: Map<string, string>;
  };
}
