const express = require("express");
const {
  register,
  checkEligibility,
  createLoan,
  getLoan,
  makePayment,
  viewStatement,
} = require("../controllers/apiControllers");

const router = express.Router();

// APIs
// Register
router.post("/register", register);
// Check Eligibility
router.post("/check-eligibility", checkEligibility);
// Create a new loan
router.post("/create-loan", createLoan);
// Get data of a single loan
router.get("/view-loan/:loan_id", getLoan);
// Make payment towards a loan
router.post("/make-payment/:customer_id/:loan_id", makePayment);
// View Statement of a loan
router.get("/view-statement/:customer_id/:loan_id", viewStatement);

module.exports = router;
