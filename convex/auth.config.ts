export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
    {
      domain: "https://github.com",
      applicationID: process.env.AUTH_GITHUB_ID,
      secret: process.env.AUTH_GITHUB_SECRET,
    },
    {
      domain: "https://accounts.google.com",
      applicationID: process.env.AUTH_GOOGLE_ID,
      secret: process.env.AUTH_GOOGLE_SECRET,
    },
  ],
};
