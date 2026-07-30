import express, {
  type Application,
  type Request,
  type Response,
} from "express";
const app: Application = express();
import authRoutes from "./modules/auth/auth.routes.ts";
import depositsRoutes from "./modules/deposits/deposits.routes.ts";
import { errorMiddleware } from "./middleware/error.middleware.ts";

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timeStamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/deposits", depositsRoutes);

// Error handler must be registered last — after all routes.
app.use(errorMiddleware);
export default app;
