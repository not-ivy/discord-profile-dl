export interface DiscordUser {
  status: Status,
  response: DiscordResponse | undefined,  
}

export interface Status {
  success: boolean,
  error: string | undefined,
}

export interface DiscordResponse {
  message: string | undefined,
  errors: any, // dont have to worry about the type since we give user the whole obj encoded in json
  id: string,
  username: string,
  discriminator: string,
  avatar: string | undefined,
  bot: boolean | undefined,
  system: boolean | undefined,
  mfa_enabled: boolean | undefined,
  banner: string | undefined,
  accent_color: number | undefined,
  locale: string | undefined,
  verified: boolean | undefined,
  email: string | undefined,
  flags: number | undefined,
  premium_type: number | undefined,
  public_flags: number | undefined,
}