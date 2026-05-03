const fs = require("fs");
const a = String.fromCharCode(64);
const p1 = "postgresql://neondb_owner:npg_u9brOpC2xBdo";
const p2 =
  "ep-mute-unit-a4nthh29-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
const url = p1 + a + p2;
const content =
  "PORT=5000\nNODE_ENV=development\nJWT_SECRET=smartquestionmaker_super_secret_2024\nDATABASE_URL=" +
  url +
  "\n";
fs.writeFileSync(".env", content);
console.log("Done! Check:", url);
