const { Customer } = require("../models/customerModel");
const { Loan } = require("../models/loanModel");
const { Sequelize } = require("sequelize");

const register = async (req, res) => {
  try {
    const { first_name, last_name, age, monthly_salary, phone_number } =
      req.body;

    // Calculate approved limit based on the compound interest scheme
    const compoundInterestFactor = 36;
    const approved_limit =
      Math.round((compoundInterestFactor * monthly_salary) / 100000) * 100000;

    // Create a new customer in the database
    const newCustomer = await Customer.create({
      first_name,
      last_name,
      age,
      monthly_salary,
      approved_limit,
      phone_number,
    });

    // Prepare the response body
    const responseBody = {
      customer_id: newCustomer.customer_id,
      name: `${newCustomer.first_name} ${newCustomer.last_name}`,
      age: newCustomer.age,
      monthly_salary: newCustomer.monthly_salary,
      approved_limit: newCustomer.approved_limit,
      phone_number: newCustomer.phone_number,
    };

    // Send a success response
    res.status(201).json(responseBody);
  } catch (error) {
    console.error(error);

    // Handle errors and send an appropriate response
    if (error.name === "SequelizeValidationError") {
      // Validation error in request body
      res.status(400).json({ message: "Validation error in request body" });
    } else {
      // Other internal server errors
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

const checkEligibility = async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;

    // Retrieve customer and loan information
    const customer = await Customer.findByPk(customer_id);
    const loans = await Loan.findAll({ where: { customer_id } });

    // Calculate credit score based on historical loan data
    const creditScore = calculateCreditScore(customer, loans);

    // Function to calculate credit score
    function calculateCreditScore(customer, loans) {
      // Implement credit score calculation based on the given components
      const pastLoansPaidOnTime = loans.reduce((count, loan) => {
        if (loan.EMIs_paid_on_Time > 0) {
          return count + 1;
        }
        return count;
      }, 0);
      console.log("EMIs_paid_on_Time: ", pastLoansPaidOnTime);

      const numberOfLoansTaken = loans.length;
      console.log("Total no of loans: ", numberOfLoansTaken);
      const currentYear = new Date().getFullYear();
      const loansInCurrentYear = loans.filter((loan) => {
        const loanStartYear = new Date(loan.start_date).getFullYear();
        return loanStartYear === currentYear;
      });
      const loanActivityInCurrentYear = loansInCurrentYear.length;
      console.log("loans in current year: ", loanActivityInCurrentYear);

      const loanApprovedVolumebefore = loans.reduce(
        (sum, loan) => sum + loan.loan_amount,
        0
      );
      const loanApprovedVolume = loanApprovedVolumebefore / 10000;
      console.log("loan approved volume:", loanApprovedVolume);
      const averageCreditScore =
        (pastLoansPaidOnTime +
          numberOfLoansTaken +
          loanActivityInCurrentYear +
          loanApprovedVolume) /
        4;
      console.log("Credit Score:", averageCreditScore);
      return Math.round(averageCreditScore);
    }

    // Check loan eligibility based on credit score
    const { approval, corrected_interest_rate, monthly_payment } =
      checkLoanEligibility(
        creditScore,
        loan_amount,
        interest_rate,
        customer,
        tenure
      );

    // Function to check loan eligibility
    function checkLoanEligibility(
      creditScore,
      loanAmount,
      interestRate,
      customer,
      tenure
    ) {
      //Check eligibility based on credit score and other criteria
      let approval = false;
      let correctedInterestRate = interestRate;
      let monthly_payment = 0;
      console.log(customer);
      if (customer.current_debt > customer.approved_limit) {
        creditScore = 0;
      }

      if (creditScore > 50) {
        approval = true;
      } else if (50 >= creditScore && creditScore > 30) {
        correctedInterestRate = Math.max(interestRate, 12);
        approval = true;
      } else if (30 > creditScore && creditScore > 10) {
        correctedInterestRate = Math.max(interestRate, 16);
        approval = true;
      } else if (creditScore > 10) {
        approval = false;
      }

      // Calculate monthly installment based on loan amount, interest rate, and tenure
      if (approval) {
        const interestRatePerMonth = correctedInterestRate / 12 / 100;
        const numberOfPayments =
          customer.monthly_salary * 0.5 > 0 ? tenure * 12 : 0;
        monthly_payment =
          (loanAmount * interestRatePerMonth) /
          (1 - Math.pow(1 + interestRatePerMonth, -numberOfPayments));
      }

      return {
        approval,
        corrected_interest_rate: correctedInterestRate,
        monthly_payment,
      };
    }

    // Prepare response
    const response = {
      customer_id,
      approval,
      interest_rate,
      corrected_interest_rate,
      tenure,
      monthly_payment,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const createLoan = async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;

    // Retrieve customer information
    const customer = await Customer.findByPk(customer_id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const loans = await Loan.findAll({ where: { customer_id } });

    // Calculate credit score based on historical loan data
    const creditScore = calculateCreditScore(customer, loans);

    // Function to calculate credit score
    function calculateCreditScore(customer, loans) {
      // Calculate a simple average credit score based on some components
      const pastLoansPaidOnTime = loans.reduce((count, loan) => {
        if (loan.EMIs_paid_on_Time > 0) {
          return count + 1;
        }
        return count;
      }, 0);
      console.log("EMIs_paid_on_Time: ", pastLoansPaidOnTime);

      const numberOfLoansTaken = loans.length;
      console.log("Total no of loans: ", numberOfLoansTaken);
      const currentYear = new Date().getFullYear();
      const loansInCurrentYear = loans.filter((loan) => {
        const loanStartYear = new Date(loan.start_date).getFullYear();
        return loanStartYear === currentYear;
      });
      const loanActivityInCurrentYear = loansInCurrentYear.length;
      console.log("loans in current year: ", loanActivityInCurrentYear);

      const loanApprovedVolumebefore = loans.reduce(
        (sum, loan) => sum + loan.loan_amount,
        0
      );
      const loanApprovedVolume = loanApprovedVolumebefore / 10000;
      console.log("loan approved volume:", loanApprovedVolume);
      const averageCreditScore =
        (pastLoansPaidOnTime +
          numberOfLoansTaken +
          loanActivityInCurrentYear +
          loanApprovedVolume) /
        4;
      console.log(averageCreditScore);
      return Math.round(averageCreditScore);
    }

    // Check loan eligibility based on credit score
    const { approval, corrected_interest_rate, monthly_payment } =
      checkLoanEligibility(
        creditScore,
        loan_amount,
        interest_rate,
        customer,
        tenure
      );

    // Function to check loan eligibility
    function checkLoanEligibility(
      creditScore,
      loanAmount,
      interestRate,
      customer,
      tenure
    ) {
      // Check eligibility based on credit score and other criteria
      let approval = false;
      let correctedInterestRate = interestRate;
      let monthly_payment = 0;
      console.log(customer);
      if (customer.current_debt > customer.approved_limit) {
        creditScore = 0;
      }
      if (creditScore > 50) {
        approval = true;
      } else if (50 >= creditScore && creditScore > 30) {
        correctedInterestRate = Math.max(interestRate, 12);
        approval = true;
      } else if (30 > creditScore && creditScore > 10) {
        correctedInterestRate = Math.max(interestRate, 16);
        approval = true;
      } else if (creditScore > 10) {
        approval = false;
      }

      //Calculate monthly installment based on loan amount, interest rate, and tenure
      if (approval) {
        const interestRatePerMonth = correctedInterestRate / 12 / 100;
        const numberOfPayments =
          customer.monthly_salary * 0.5 > 0 ? tenure * 12 : 0;
        monthly_payment =
          (loanAmount * interestRatePerMonth) /
          (1 - Math.pow(1 + interestRatePerMonth, -numberOfPayments));
      }

      return {
        approval,
        corrected_interest_rate: correctedInterestRate,
        monthly_payment,
      };
    }

    if (!approval) {
      return res.status(200).json({
        customer_id,
        approval: false,
        interest_rate,
        corrected_interest_rate,
        tenure,
        monthly_payment,
        message: "Loan not approved",
      });
    }

    // Create a new loan
    const newLoan = await Loan.create({
      customer_id,
      loan_amount,
      interest_rate: corrected_interest_rate,
      tenure,
      monthly_payment,
      start_date: new Date(),
    });

    // Respond with the details of the approved loan
    return res.status(200).json({
      customer_id,
      approval: true,
      interest_rate,
      corrected_interest_rate,
      tenure,
      monthly_payment,
      loan_id: newLoan.id,
      start_date: newLoan.start_date,
      message: "Loan approved and created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getLoan = async (req, res) => {
  try {
    const loanId = req.params.loan_id;

    // Retrieve loan details
    const loan = await Loan.findByPk(loanId);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Retrieve customer details associated with the loan
    const customer = await Customer.findByPk(loan.customer_id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Prepare the response body
    const responseBody = {
      loan_id: loan.id,
      customer: {
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone_number: customer.phone_number,
        age: customer.age,
      },
      loan_amount: loan.loan_amount,
      interest_rate: loan.interest_rate,
      monthly_installment: loan.monthly_payment,
      tenure: loan.tenure,
    };

    // Respond with the loan details and customer details
    res.status(200).json(responseBody);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const makePayment = async (req, res) => {
  try {
    const customerId = req.params.customer_id;
    const loanId = req.params.loan_id;
    const { payment_amount } = req.body;

    // Retrieve loan details
    const loan = await Loan.findByPk(loanId);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Retrieve customer details associated with the loan
    const customer = await Customer.findByPk(customerId);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Calculate remaining outstanding amount
    const remainingAmount = loan.monthly_payment - payment_amount;

    if (remainingAmount < 0) {
      return res
        .status(400)
        .json({ message: "Payment amount exceeds the outstanding amount" });
    }

    // Update the loan details with the new outstanding amount
    loan.monthly_payment = remainingAmount;
    await loan.save();

    // Respond with success message
    res.status(200).json({
      message: "Payment successful",
      remaining_amount: remainingAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const viewStatement = async (req, res) => {
  try {
    const customerId = req.params.customer_id;
    const loanId = req.params.loan_id;

    // Retrieve loan details
    const loan = await Loan.findByPk(loanId, {
      where: { customer_id: customerId },
    });

    if (!loan) {
      return res
        .status(404)
        .json({ message: "Loan not found for the customer" });
    }

    // Calculate amount paid by the applicant
    const amountPaid = loan.monthly_payment * loan.EMIs_paid_on_Time;
    //  Calculate repayments_left
    repayments_left = loan.tenure - loan.EMIs_paid_on_Time;

    // loan statement
    const loanStatement = {
      customer_id: loan.customer_id,
      loan_id: loan.loan_id,
      principal: loan.loan_amount,
      interest_rate: loan.interest_rate,
      amount_paid: loan.amount_paid,
      amount_paid: amountPaid,
      monthly_installment: loan.monthly_payment,
      repayments_left: repayments_left,
    };

    // Response  loan statement
    res.status(200).json(loanStatement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  register,
  checkEligibility,
  createLoan,
  getLoan,
  makePayment,
  viewStatement,
};
