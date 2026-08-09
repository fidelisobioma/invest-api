import express, {
  type Application,
  type Request,
  type Response,
} from "express";
const app: Application = express();
import authRoutes from "./modules/auth/auth.routes.ts";
import depositsRoutes from "./modules/deposits/deposits.routes.ts";
import depositsAdminRoutes from "./modules/deposits/deposits.admin.routes.ts";
import balancesRoutes from "./modules/ledger/balances.routes.ts";
import transactionsRoutes from "./modules/transactions/transactions.routes.ts";
import {
  plansRouter,
  investmentsRouter,
} from "./modules/investments/investments.routes.ts";
import investmentsAdminRoutes from "./modules/investments/investments.admin.routes.ts";
import withdrawalsRoutes from "./modules/withdrawals/withdrawals.routes.ts";
import withdrawalsAdminRoutes from "./modules/withdrawals/withdrawals.admin.routes.ts";
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
app.use("/api/admin/deposits", depositsAdminRoutes);
app.use("/api/balances", balancesRoutes);

app.use("/api/plans", plansRouter);
app.use("/api/investments", investmentsRouter);
app.use("/api/admin/investments", investmentsAdminRoutes);

app.use("/api/withdrawals", withdrawalsRoutes);
app.use("/api/admin/withdrawals", withdrawalsAdminRoutes);

app.use("/api/transactions", transactionsRoutes);

// Error handler must be registered last — after all routes.
app.use(errorMiddleware);
export default app;
