import "../src/config/env";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "../src/routes/auth.routes";
import productRoutes from "../src/routes/product.routes";
import cartRoutes from "../src/routes/cart.routes";
import wishlistRoutes from "../src/routes/wishlist.routes";
import orderRoutes from "../src/routes/order.routes";
import leadRoutes from "../src/routes/lead.routes";
import adminRoutes from "../src/routes/admin.routes";

import { errorHandler } from "../src/middleware/errorHandler";
import { ASSETS_ROOT } from "../src/config/paths";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/assets", express.static(ASSETS_ROOT));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;