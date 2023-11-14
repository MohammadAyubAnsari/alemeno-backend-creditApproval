const express = require("express");
const dataController = require("../controllers/dataControllers");
const ingestDataController = require("../controllers/dataControllers");

const router = express.Router();

// API for IngestData
router.post("/ingestData", ingestDataController);

module.exports = router;
