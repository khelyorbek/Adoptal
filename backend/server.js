"use strict";

const app = require("./app");
// const { PORT } = require("./config");
const PORT = 3015;

app.listen(PORT, function () {
  console.log(`Adoptal's back-end is now running on http://localhost:${PORT}`);
});
