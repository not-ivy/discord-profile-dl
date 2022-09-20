export default interface DiscordUser {
  success: boolean,
  error: string | undefined,
  id: bigint,
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