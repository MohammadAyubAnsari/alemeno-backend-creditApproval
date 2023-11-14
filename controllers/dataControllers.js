const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const path = require("path");

const {
  ingestData,
  readExcelFile,
} = require("../controllers/servicesControllers");

router.use(bodyParser.json());

const ingestDataController = async (req, res) => {
  try {
    const customerData = await readExcelFile(
      path.join(__dirname, "..", "asset", "customer_data.xlsx")
    );
    const loanData = await readExcelFile(
      path.join(__dirname, "..", "asset", "loan_data.xlsx")
    );

    await ingestData(customerData, loanData);

    res.status(200).json({ message: "Data ingestion task completed!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = ingestDataController;
