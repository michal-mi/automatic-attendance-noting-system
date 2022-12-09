const express = require('express');
const router = express.Router();
const upload = require('express-fileupload');
const days = require('../models/day');
const authentication = require("../models/authentication");

module.exports = router;

/* GET facility data by id */
router.post('/getCalendarForFacility/', async function (req, res, next) {
    var msg = "Error while getting calendar for facility"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await days.getCalendarForFacility(req.body.facility_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* EDIT calendar*/
router.post('/editCalendar/', async function (req, res, next) {
    var msg = "Error while editing calendar"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await days.editCalendar(req.body.to_change, req.body.facility_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* ADD days to calendar*/
router.post('/addDays/', async function (req, res, next) {
    var msg = "Error while adding days to calendar"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await days.addDays(req.body.facility_id, req.body.start_day, req.body.end_day, req.body.days_off)
            if(data){
                res.status(200).send(data)
            } else {
                res.status(400).send(data)
            }
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* GET facility data by id */
router.post('/getWholeCalendarForFacility/', async function (req, res, next) {
    var msg = "Error while getting whole calendar for facility"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await days.getWholeCalendarForFacility(req.body.facility_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});