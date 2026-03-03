import express from "express";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Express + TypeScript + ESM 🚀");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
