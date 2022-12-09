const express = require('express');
const router = express.Router();
const subjects = require('../models/subject');
const authentication = require("../models/authentication");
const { verifyRegexSubjectName, verifyRegexGroupOrSubjectSemester, verifyRegexGroupOrSubjectYear } = require('../models/validation');
const e = require('express');

/* GET all subjects */
router.get('/getAllSubjects/', async function (req, res, next) {
    var msg = "Error while getting subjects"
    try {
        if (!authentication.authenticateWithRole([2,3], req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await subjects.getAllSubjects()
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* POST all subjects from selected facility */
router.post('/getAllSubjectsFromFacility/', async function (req, res, next) {
    var msg = "Error while getting subjects from facility"
    try {
        if (!authentication.authenticateWithRole([2,3], req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await subjects.getAllSubjectsFromFacility(req.body.facility_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* POST all subjects names from facility */
router.post('/getAllSubjectsNamesFromFacility/', async function (req, res, next) {
    var msg = "Error while getting subjects names from facility"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await subjects.getAllSubjectsNamesFromFacility(req.body.facility_id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* SEARCH subjects for selected facility by semester */
router.post('/searchSubjects/', async function (req, res, next) {
    var msg = "Error while searching subjects"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await subjects.searchSubjects(req.body.id, req.body.semester)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* CREATE subject */
router.post('/createSubject/', async function (req, res, next) {
    var msg = "Error while creating subject"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            switch(true) {
                case (req.body.facility_id === "" || req.body.facility_id === undefined):
                    res.status(403).send(msg + " - facility id is invalid!"); break
                case (!verifyRegexSubjectName(req.body.subject_name)):
                    res.status(403).send(msg + " - subject name is invalid!"); break
                case (!verifyRegexGroupOrSubjectYear(req.body.year)):
                    res.status(403).send(msg + " - subject year is invalid!"); break
                case (!verifyRegexGroupOrSubjectSemester(req.body.semester)):
                    res.status(403).send(msg + " - subject semester is invalid!"); break
                default:
                    var data = await subjects.createSubject(req.body.facility_id, req.body.subject_name, req.body.year, req.body.semester)
                    if(data){
                        res.status(200).send(data); break
                    } else {
                        res.status(400).send(data); break
                    }
            }
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* POST one subject */
router.post('/getOneSubject/', async function (req, res, next) {
    var msg = "Error while getting one subject"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await subjects.getOneSubject(req.body.facility_id, req.body.id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* UPDATE one subject */
router.post('/updateOneSubject/', async function (req, res, next) {
    var msg = "Error while updating one subject"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            switch(true) {
                case (req.body.facility_id === "" || req.body.facility_id === undefined):
                    res.status(403).send(msg + " - facility id is invalid!"); break
                case (!verifyRegexSubjectName(req.body.subject_name)):
                    res.status(403).send(msg + " - subject name is invalid!"); break
                case (!verifyRegexGroupOrSubjectYear(req.body.year)):
                    res.status(403).send(msg + " - subject year is invalid!"); break
                case (!verifyRegexGroupOrSubjectSemester(req.body.semester)):
                    res.status(403).send(msg + " - subject semester is invalid!"); break
                default:
                    var data = await subjects.updateOneSubject(req.body.id, req.body.facility_id, req.body.subject_name, req.body.year, req.body.semester)
                    res.status(200).send(data); break
            }
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

/* DELETE one subjects*/
router.post('/deleteOneSubject/', async function (req, res, next) {
    var msg = "Error while deleting one subject"
    try {
        if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await subjects.deleteOneSubject(req.body.id)
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

module.exports = router;