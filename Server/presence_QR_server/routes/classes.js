const express = require('express');
const router = express.Router();
const classes = require('../models/class');
const groups = require('../models/group');
const authentication = require("../models/authentication");
const jwt = require('jsonwebtoken');
const { route } = require('./facilities');

/* GET all classes */
router.get('/allClasses/', async function (req, res, next) {
    var msg = "Error while getting all classes"
    try {
        if (!authentication.authenticateWithRole([2, 3], req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.getAllClasses()
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* GET data needed for lecturer calendar*/
router.post('/lecturerCalendar/', async function (req, res, next) {
    var msg = "Error while getting calendar for lecturer"
    try {
        if (!authentication.authenticateWithRole(3, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.getLecturerCalendar(req.body.lecturer_id, req.body.facility_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* GET one lesson data */
router.post('/oneLessonData/', async function (req, res, next) {
    var msg = "Error while getting data about one lesson"
    try {
        if (!authentication.authenticateWithRole(3, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.getLessonData(req.body.lesson_id, req.body.facility_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* GET classes calendar */
router.post('/classesCalendar/', async function (req, res, next) {
    var msg = "Error while getting classes calendar"
    try {
        if (!authentication.authenticateWithRole([2, 3], req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.getClassesCalendar(req.body.id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* POST group-subject data for list of class attendance */
router.post('/getAttendanceList/', async function (req, res, next) {
    var msg = "Error while getting lesson attendance list"
    try {
        if (!authentication.authenticateWithRole(3, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = [await classes.getAttendanceList(req.body.facility_id, req.body.subject_group_id, req.body.lesson_date, req.body.lecturer_id)]
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

router.post('/getAttendanceListStudent/', async function (req, res, next) {
    try {
        if (!authentication.authenticateWithRole(4, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        }
        else {
            res.json(await classes.getAttendanceListForStudent(req.body.student_id, req.body.date))
        }

    } catch (err) {
        console.error(`Error while trying to get student attendance`, err.message);
        next(err);
    }
})
/* POST group-subject changed list of class attendance */
router.post('/changeAttendanceList/', async function (req, res, next) {
    var msg = "Error while changing lesson attendance list"
    try {
        if (!authentication.authenticateWithRole(3, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.changeAttendanceList(req.body.attendance_list)
            if (data) {
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

/* ADD classes */
router.post('/addClasses/', async function (req, res, next) {
    var msg = "Error while adding classes"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.addClasses(req.body.IDs_of_days, req.body.classroom_id, req.body.subject_id, req.body.lecturer_id, req.body.group_id, req.body.beginning_time, req.body.ending_time, req.body.day_of_week, req.body.beginning_date, req.body.end_date)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

router.post('/classesCalendarForSubjectGroup/', async function (req, res, next) {
    var msg = "Error while getting classes calendar for subject group"
    try {
        if (!authentication.authenticateWithRole([2,3], req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.getClassesCalendarForSubjectGroup(req.body.facility_id, req.body.subject_group_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* SEARCH classes */
router.post('/searchClasses/', async function (req, res, next) {
    var msg = "Error while searching classes"
    try {
        if (!authentication.authenticateWithRole([2,3], req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.searchClasses(req.body.facility_id, req.body.group_id, req.body.classroom_id, req.body.lecturer_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* GET classes data (one row from class entity)  */
router.post('/getClasses/', async function (req, res, next) {
    var msg = "Error while getting classes for group for subject"
    try {
        if (!authentication.authenticateWithRole([2, 3, 4], req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.getClassesData(req.body.id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

router.post("/changePresenceStatus/", async function (req, res, next) {
    var msg = "Error changing presence status"
    console.log(jwt.decode(req.headers.authorization))
    try {
        if (!authentication.authenticateWithRole(4, req.headers.authorization)
            && jwt.decode(req.headers.authorization).id === req.body.user_id) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.changePresenceStatus(req.body.user_id,
                req.body.qr_code, req.body.gps_x, req.body.gps_y)
            if (data === 200) {
                res.status(200).send(data)
            } else if (data === 400) {
                res.status(400).send(data)
            } else if (data === 432) {
                res.status(432).send(data)
            } else if (data === 433) {
                res.status(433).send(data)
            } else if (data === 434) {
                res.status(434).send(data)
            }}
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
})

/* EDIT classes data (one row from class entity)  */
router.post('/editClasses/', async function (req, res, next) {
    var msg = "Error while editing classes"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await classes.editClasses(req.body.id, req.body.classroom_id, req.body.lecturer_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

//for mobile app
/* SEARCH classes */
router.post('/searchStudentClasses/', async function (req, res, next) {
    var msg = "Error while searching classes"
    try {
        if (!authentication.authenticateWithRole(4, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var groups_data = await groups.getGroupsByStudentId(req.body.student_id)
            var data = []
            for (let i = 0; i < groups_data.length; i++) {
                data.push(await classes.searchClasses(req.body.facility_id, groups_data[i].group_id, req.body.classroom_id, ""))
            }
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

module.exports = router;