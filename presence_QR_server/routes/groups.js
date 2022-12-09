const express = require('express');
const router = express.Router();
const groups = require('../models/group');
const classes = require('../models/class');
const authentication = require("../models/authentication");
const { verifyRegexGroupName, verifyRegexGroupOrSubjectYear, verifyRegexGroupOrSubjectSemester } = require('../models/validation');

/* GET all groups */
router.get('/getAllGroups/', async function (req, res, next) {
    var msg = "Error while getting groups"
    try {
        if (!authentication.authenticateWithRole([2, 3], req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.getAllGroups()
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* POST all groups for selected facility */
router.post('/getAllGroupsFromFacility/', async function (req, res, next) {
    var msg = "Error while getting groups from facility"
    try {
        if (!authentication.authenticateWithRole([1, 2, 3], req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.getAllGroupsFromFacility(req.body.id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* SEARCH groups for selected facility by semester */
router.post('/searchGroups/', async function (req, res, next) {
    var msg = "Error while searching groups"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.searchGroups(req.body.id, req.body.semester)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* SEARCH groups-subjects using facility_id (mandatory), subject_id, group_id, semester */
router.post('/searchGroupsAndSubjects/', async function (req, res, next) {
    var msg = "Error while searching group and subjects"
    try {
        if (!authentication.authenticateWithRole(3, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.searchGroupsAndSubjects(req.body.facility_id, req.body.lecturer_id, req.body.subject_id, req.body.group_id, req.body.semester)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});


/* POST group-subject data for the view containing the list of students for the group in the subject */
router.post('/getDataAboutGroupSubject/', async function (req, res, next) {
    var msg = "Error while getting list of students for the group in the subject - numb. 0"
    try {
        if (!authentication.authenticateWithRole(3, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = []
            data.push(await groups.getDataAboutGroupInSubject(req.body.facility_id, req.body.subject_group_id));
            data.push(await groups.getDataAboutStudentsFromGroupInSubject(req.body.facility_id, req.body.subject_group_id));
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* POST group-subject data for the view containing the list of classes for the group in the subject */
router.post('/getDataAboutGroupSubject1/', async function (req, res, next) {
    var msg = "Error while getting list of classes for the group in the subject - numb. 1"
    try {
        if (!authentication.authenticateWithRole(3, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = []
            data.push(await groups.getDataAboutGroupInSubject(req.body.facility_id, req.body.subject_group_id));
            data.push(await classes.getClassesCalendarForSubjectGroup(req.body.facility_id, req.body.subject_group_id));
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* POST group-subject data for the view containing the list of classes for the group in the subject */
router.post('/getOnlyDataAboutGroupSubject/', async function (req, res, next) {
    var msg = "Error while getting data only about group subject"
    try {
        if (!authentication.authenticateWithRole(3, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.getDataAboutGroupInSubject(req.body.facility_id, req.body.subject_group_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* POST all groups names from chosen facility */
router.post('/getAllGroupsNamesFromFacility/', async function (req, res, next) {
    var msg = "Error while getting groups names from facility"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.getAllGroupsNamesFromFacility(req.body.facility_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* CREATE one group*/
router.post('/createGroup/', async function (req, res, next) {
    var msg = "Error while creating a group"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            switch(true) {
                case (req.body.facility_id === "" || req.body.facility_id === undefined):
                    res.status(403).send(msg + " - facility id is invalid!"); break
                case (!verifyRegexGroupName(req.body.group_name)):
                    res.status(403).send(msg + " - group name is invalid!"); break
                case (!verifyRegexGroupOrSubjectYear(req.body.year)):
                    res.status(403).send(msg + " - group year is invalid!"); break
                case (!verifyRegexGroupOrSubjectSemester(req.body.semester)):
                    res.status(403).send(msg + " - group semester is invalid!"); break
                default:
                    var data = await groups.createGroup(req.body.facility_id, req.body.group_name, req.body.year, req.body.semester)
                    if (data) {
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

/* POST one group */
router.post('/getOneGroup/', async function (req, res, next) {
    var msg = "Error while getting one group"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.getOneGroup(req.body.facility_id, req.body.id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* UPDATE one group */
router.post('/updateOneGroup/', async function (req, res, next) {
    var msg = "Error while updating one group"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            switch(true) {
                case (req.body.facility_id === "" || req.body.facility_id === undefined):
                    res.status(403).send(msg + " - facility id is invalid!"); break
                case (!verifyRegexGroupName(req.body.group_name)):
                    res.status(403).send(msg + " - group name is invalid!"); break
                case (!verifyRegexGroupOrSubjectYear(req.body.year)):
                    res.status(403).send(msg + " - group year is invalid!"); break
                case (!verifyRegexGroupOrSubjectSemester(req.body.semester)):
                    res.status(403).send(msg + " - group semester is invalid!"); break
                default:
                    var data = await groups.updateOneGroup(req.body.id, req.body.facility_id, req.body.group_name, req.body.year, req.body.semester)
                    res.status(200).send(data); break
            }
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* DELETE one group*/
router.post('/deleteOneGroup/', async function (req, res, next) {
    var msg = "Error while deleting one group"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.deleteOneGroup(req.body.id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* ADD students to group*/
router.post('/addStudentsToGroup/', async function (req, res, next) {
    var msg = "Error while adding students to group"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.addStudentsToGroup(req.body.id, req.body.students_array)
            if (data) {
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

/* DELETE students from group*/
router.post('/deleteStudentsFromGroup/', async function (req, res, next) {
    var msg = "Error while deleting students from group"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.deleteStudentsFromGroup(req.body.id, req.body.students_array)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* GET time and dates when group does not have any classes*/
router.post('/getDatesAndTime/', async function (req, res, next) {
    var msg = "Error while getting time and dates when group does not have any classes"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await groups.getDatesAndTimeForGroup(req.body.group_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

module.exports = router;