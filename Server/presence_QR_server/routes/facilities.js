const express = require('express');
const router = express.Router();
const upload = require('express-fileupload');
const authentication = require("../models/authentication");
const facilities = require('../models/facility');
const { verifyRegexFacilityName } = require('../models/validation');

/* GET all facilities */
router.get('/getAllFacilities/', async function (req, res, next) {
  var msg = "Error while getting all facilities"
  try {
    if (!authentication.authenticateWithRole([1, 2], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await facilities.getAllFacilities()
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* GET all facilities names */
router.get('/getAllFacilitiesNames/', async function (req, res, next) {
  var msg = "Error while getting all facilities names"
  try {
    if (!authentication.authenticateWithRole(1, req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await facilities.getAllFacilitiesNames()
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* GET facility data by id */
router.post('/getOneFacilityDataByID/', async function (req, res, next) {
  var msg = "Error while getting one facility data"
  try {
    if (!authentication.authenticateWithRole([1, 2, 3], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await facilities.getOneFacilityDataByID(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* GET last facility id */
router.get('/getLastFacilityID/', async function (req, res, next) {
  var msg = "Error while getting last facility id"
  try {
    if (!authentication.authenticateWithRole(1, req.headers.authorization)) {
      res.status(400).send(msg + " - user was not authorized")
    } else {
      var data = await facilities.getLastID()
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* CREATE new facility */
router.post('/createNewFacility/', async function (req, res, next) {
  var msg = "Error while creating new facility"
  try {
    if (!authentication.authenticateWithRole(1, req.headers.authorization)) {
      res.status(400).send(msg + " - user was not authorized")
    } else {
      if(!verifyRegexFacilityName(req.body.facility_name)) {
        res.status(403).send(msg + " - facility name is invalid!")
      } else if(req.body.facility_status === "" || req.body.facility_status === undefined) {
        res.status(403).send(msg + " - facility status is invalid!")
      } else {
        var data = await facilities.createNewFacility(req.body);
        res.status(200).send(data)
      }
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

router.use(upload())
/* UPDATE/UPLOAD facility logo */
router.post("/updateFacilityLogo/", (req, res, next) => {
  var msg = "Error while updating/uploading facility logo"
  try {
    if (!authentication.authenticateWithRole(1, req.headers.authorization)) {
      res.status(400).send(msg + " - user was not authorized")
    } else {
      var data = facilities.changeFacilityLogo(req.files.file)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* UPDATE/UPLOAD facility short logo */
router.post('/updateFacilityShortLogo/', (req, res, next) => {
  var msg = "Error while updating/uploading facility short logo"
  try {
    if (!authentication.authenticateWithRole(1, req.headers.authorization)) {
      res.status(400).send(msg + " - user was not authorized")
    } else {
      var data = facilities.changeFacilityShortLogo(req.files.file)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* SEARCH facility from facility enitity using different data */
router.post('/searchFacilities/', async function (req, res, next) {
  var msg = "Error while searching facilities"
  try {
    if (!authentication.authenticateWithRole(1, req.headers.authorization)) {
      res.status(400).send(msg + " - user was not authorized")
    } else {
      var data = await facilities.searchFacilities(req.body.id, req.body.facility_name, req.body.facility_status)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* UPDATE facility name and status by facility id */
router.post('/updateFacilityNameAndStatus/', async function (req, res, next) {
  var msg = "Error while updating facility name and status"
  try {
    if (!authentication.authenticateWithRole(1, req.headers.authorization)) {
      res.status(400).send(msg + " - user was not authorized")
    } else {
      if(!verifyRegexFacilityName(req.body.facility_name)) {
        res.status(403).send(msg + " - facility name is invalid!")
      } else if(req.body.facility_status === "" || req.body.facility_status === undefined) {
        res.status(403).send(msg + " - facility status is invalid!")
      } else {
        var data = await facilities.updateFacilityNameAndStatusByID(req.body.id, req.body.facility_name, req.body.facility_status)
        res.status(200).send(data)
      }
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* DELETE facility logo reference by id */
router.post('/deleteOneFacilityLogoReferenceByID/', async function (req, res, next) {
  var msg = "Error while deleting facility logo reference"
  try {
    if (!authentication.authenticateWithRole(1, req.headers.authorization)) {
      res.status(400).send(msg + " - user was not authorized")
    } else {
      var data = await facilities.deleteFacilityLogoReferenceByFacilityID(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* DELETE facility logo by id */
router.post("/deleteOneFacilityLogoByID/", async function (req, res, next) {
  var msg = "Error while deleting facility logos"
  try {
    if (!authentication.authenticateWithRole(1, req.headers.authorization)) {
      res.status(400).send(msg + " - user was not authorized")
    } else {
      var data = await facilities.deleteFacilityLogoByFacilityID(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

module.exports = router;