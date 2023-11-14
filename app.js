const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const sequelize = require("./config/db");
const { Customer } = require("./models/customerModel");
const { Loan } = require("./models/loanModel");

const ingestion = require("./routes/ingestionRoute");
const api = require("./routes/apiRoutes");

const app = express();
const port = 3000;

sequelize.sync({ force: true });
app.use(bodyParser.json());

Customer.hasMany(Loan, { foreignKey: "customer_id" });
Loan.belongsTo(Customer, { foreignKey: "customer_id" });

app.use("/api/data", ingestion);
app.use("/api", api);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
