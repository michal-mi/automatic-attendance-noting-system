const express = require('express');
const router = express.Router();
const statuses = require('../models/status');
const authentication = require("../models/authentication");

/* GET all statuses */
router.get('/getStatusesList/', async function (req, res, next) {
    var msg = "Error while getting statuses list"
    try {
        if (!authentication.authenticateWithRole(3, req.headers.authorization)) {
            res.status(401).send(msg + " - user was not authorized")
        } else {
            var data = await statuses.getStatusesList()
            res.status(200).send(data)
        }
    } catch (err) {
        res.status(500).send(msg)
        console.error(msg, err.message);
        next(err);
    }
});

module.exports = router;