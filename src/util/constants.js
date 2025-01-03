const COOKIES_OPTS = {
    expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRATION)),
    secure: eval(process.env.COOKIE_SECURE), // set to true if your using https
    httpOnly: true,
    overwrite: true
  };

module.exports = { COOKIES_OPTS };