const xlsx = require("xlsx");
const { Customer } = require("../models/customerModel");
const { Loan } = require("../models/loanModel");

async function ingestData(customerData, loanData) {
  // Ingest customer data into the system
  const customers = await Customer.bulkCreate(customerData, {
    returning: true,
  });
  // Update current_debt for each customer
  for (const customer of customers) {
    const currentDebt = loanData
      .filter((loan) => loan.customer_id === customer.customer_id)
      .reduce((sum, loan) => sum + loan.loan_amount, 0);

    console.log("Customer ID:", customer.customer_id);
    console.log("Calculated current_debt:", currentDebt);

    await customer.update({ current_debt: currentDebt });
  }

  // Ingest loan data into the system
  await Loan.bulkCreate(loanData);

  console.log("Data ingestion successful!");
}

async function readExcelFile(filePath) {
  const data = xlsx.readFile(filePath, { cellDates: true });
  const sheet = data.Sheets[data.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet);
}

module.exports = {
  ingestData,
  readExcelFile,
};
