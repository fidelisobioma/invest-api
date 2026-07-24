import dotenv from "dotenv";
dotenv.config();

import app from "./app.ts";

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Vault backend running on http://localhost:${PORT}`);
});
