export type SocialLinks = {
  instagram?: string
  facebook?: string
  tiktok?: string
  twitter?: string
  youtube?: string
  whatsappApi?: string
}

export type SiteConfig = {
  siteName: string
  brandTagline?: string
  email: string
  whatsapp: string
  phonePretty?: string
  social: SocialLinks
}

export const siteConfig: SiteConfig = {
  siteName: "CAMIGANGA",
  brandTagline: "CAMIGANGA",
  email: "souportrifasangulocapacho@gmail.com",
  whatsapp: "+584161724994",
  phonePretty: "+584161724994",
  social: {
    instagram: undefined,
    facebook: undefined,
    tiktok: "Rifascamiganga10",
    twitter: undefined,
    youtube: undefined,
    whatsappApi: undefined
  }
}

export default siteConfig

