const pageRegex = {
  landing: /^\/.*\/?$/i,
  pricing: /^\/.*\/pricing/i,
  login: /^\/.*\/login/i,
  register: /^\/.*\/register/i,
}

export const isLandingPage = (pathname: string) =>
  pageRegex.landing.test(pathname) || pageRegex.pricing.test(pathname)

export const isAuthPage = (pathname: string) =>
  pageRegex.login.test(pathname) || pageRegex.register.test(pathname)

export const isPublicPage = (pathname: string) =>
  isLandingPage(pathname) || isAuthPage(pathname)
