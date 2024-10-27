"use strict";

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

const app = require("./app");
// const { PORT } = require("./config");
const PORT = process.env.PORT

app.listen(PORT, function () {
  console.log(`Adoptal's back-end is now running on http://localhost:${PORT}`);
});
