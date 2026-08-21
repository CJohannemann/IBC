const express = require("express");
const app = express();
const port = 3000;

const assistantsRouter = require("./routes/assistants");
app.use("/api/assistants", assistantsRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
