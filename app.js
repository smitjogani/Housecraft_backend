const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const adminRoutes = require("./api/routes/Admin/admin.routes");
const architectRoutes = require("./api/routes/Architect/architect.routes");
const interiorDesignerRoutes = require("./api/routes/InteriorDesigner/interiorDesigner.routes");
const productRoutes = require('./api/routes/Product/products.routes')
const userRoutes = require("./api/routes/User/user.routes");

mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.set("trust proxy", true);

app.use("/api/hsadmin", adminRoutes);
app.use("/api/hsarchitect", architectRoutes);
app.use("/api/hsinteriordesigner", interiorDesignerRoutes);
app.use("/api/hsuser", userRoutes);
app.use("/api/hsProduct", productRoutes)
app.use('/uploads', express.static('uploads'))

module.exports = app;
