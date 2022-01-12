declare namespace NodeJS {
  export interface ProcessEnv {
    DISCORD_TOKEN?: string;
    CLIENT_ID?: string;
    ID_SUFFIX?: string;
    UCAT_SERVER_ID?: string;
    SPAM_CHANNEL_ID?: string;
    ROLE_IDS?: string;
    TUTOR_ROLE?: string;
  }
}
