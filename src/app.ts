import express, {
  type Application,
  type Request,
  type Response,
} from "express";
const app: Application = express();

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timeStamp: new Date().toISOString(),
  });
});

export default app;
