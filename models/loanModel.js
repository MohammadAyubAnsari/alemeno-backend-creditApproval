const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Loan = sequelize.define("Loan", {
  loan_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  loan_amount: DataTypes.FLOAT,
  tenure: DataTypes.INTEGER,
  interest_rate: DataTypes.FLOAT,
  monthly_payment: DataTypes.FLOAT,
  EMIs_paid_on_Time: DataTypes.INTEGER,
  start_date: DataTypes.DATEONLY,
  end_date: DataTypes.DATEONLY,
});

module.exports = { Loan };
