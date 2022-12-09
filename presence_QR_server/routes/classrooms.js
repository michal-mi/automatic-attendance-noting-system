const express = require('express');
const router = express.Router();
const classrooms = require('../models/classroom');
const authentication = require("../models/authentication");
const { verifyRegexClassroomName, verifyRegexClassroomDescription, verifyRegexClassroomGps } = require('../models/validation');

/* GET all classrooms */
router.get('/getAllClassrooms/', async function (req, res, next) {
    var msg = "Error while getting all classrooms"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
          res.status(401).send(msg + " - user was not authorized")
        } else {
          var data = await classrooms.getAllClassrooms()
          res.status(200).send(data)
        }
      } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
      }
});

/* POST all classrooms from facility */
router.post('/getAllClassroomsNamesFromFacility/', async function (req, res, next) {
    var msg = "Error while getting classrooms names from facility"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classrooms.getAllClassroomsNamesFromFacility(req.body.facility_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* CREATE new classroom */
router.post('/createClassroom/', async function (req, res, next) {
    var msg = "Error while creating new classroom"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            switch(true) {
                case (!verifyRegexClassroomName(req.body.classroom_name)):
                    res.status(403).send(msg + " - classroom name is invalid!"); break
                case (req.body.facility_id === "" || req.body.facility_id === undefined):
                    res.status(403).send(msg + " - facility id is invalid!"); break
                case (!verifyRegexClassroomDescription(req.body.classroom_description)):
                    res.status(403).send(msg + " - classroom description is invalid!"); break
                case (!verifyRegexClassroomGps(req.body.gps_x)):
                    res.status(403).send(msg + " - gps x is invalid!"); break
                case (!verifyRegexClassroomGps(req.body.gps_y)):
                    res.status(403).send(msg + " - gps y is invalid!"); break
                default:
                    var data = await classrooms.createClassroom(req.body)
                    if(data){
                        res.status(200).send(data); break
                    } else {
                        res.status(500).send(data); break
                    } 
            }
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* POST all classrooms from facility */
router.post('/getAllClassroomsFromFacility/', async function (req, res, next) {
    var msg = "Error while getting classrooms data from facility"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classrooms.getAllClassroomsFromFacility(req.body.facility_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* POST one classroom */
router.post('/getOneClassroom/', async function (req, res, next) {
    var msg = "Error while getting one classroom"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classrooms.getOneClassroom(req.body.facility_id, req.body.id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* UPDATE one classroom */
router.post('/updateOneClassroom/', async function (req, res, next) {
    var msg = "Error while updating one classroom"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            switch(true) {
                case (!verifyRegexClassroomName(req.body.classroom_name)):
                    res.status(403).send(msg + " - classroom name is invalid!"); break
                case(req.body.facility_id === "" || req.body.facility_id === undefined):
                    res.status(403).send(msg + " - facility id is invalid!"); break
                case (!verifyRegexClassroomDescription(req.body.classroom_description)):
                    res.status(403).send(msg + " - classroom description is invalid!"); break
                case (!verifyRegexClassroomGps(req.body.gps_x)):
                    res.status(403).send(msg + " - gps x is invalid!"); break
                case (!verifyRegexClassroomGps(req.body.gps_y)):
                    res.status(403).send(msg + " - gps y is invalid!"); break
                default:
                    var data = await classrooms.updateOneClassroom(req.body.id, req.body.classroom_name, req.body.facility_id, req.body.classroom_description, req.body.gps_x, req.body.gps_y)
                    res.status(200).send(data); break
            }
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* DELETE classroom CASCADE*/
router.post('/deleteOneClassroom/', async function (req, res, next) {
    var msg = "Error while deleting one classroom in cascade mode"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classrooms.deleteOneClassroom(req.body.id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* DELETE classroom NO CASCADE */
router.post('/deleteOneClassroomNoCascade/', async function (req, res, next) {
    var msg = "Error while deleting one classroom in no cascade mode"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classrooms.deleteOneClassroomNoCascade(req.body.id, req.body.facility_id)
            if(data){
                res.status(200).send(data)
            } else {
                res.status(500).send(data)
            }
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* GET all classrooms schedule for the facility on specific days */
router.post('/classroomsScheduleForFacilityOnSpecificDays/', async function (req, res, next) {
    var msg = "Error while getting classrooms schedules for facility on specific days"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classrooms.classroomsScheduleForFacilityOnSpecificDays(req.body.facility_id, req.body.days)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

module.exports = router;