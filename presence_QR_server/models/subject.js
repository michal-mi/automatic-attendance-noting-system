const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getAllSubjects() {
    const data = await db.query(
        `SELECT id, facility_id, subject_name, year, semester
      FROM subject`
    );
    return data
}

async function getAllSubjectsFromFacility(facility_id) {
    const data = await db.query(
        `SELECT id, subject_name, year, semester
        FROM subject
        WHERE facility_id = "${facility_id}"`
    );
    return data
}

async function getAllSubjectsNamesFromFacility(facility_id) {
    const data = await db.query(
        `SELECT subject_name
        FROM subject
        WHERE facility_id = "${facility_id}"`
    );
    return data
}

async function createSubject(facility_id, subject_name, year, semester) {
    //create subject:
    await db.query(
        `INSERT INTO subject(facility_id, subject_name, year, semester)
       VALUES ("${facility_id}" , "${subject_name}", "${year}", "${semester}")`
    )
    console.log("Subject " + subject_name + " from facility " + facility_id + " was created succesfully!")
    return true
}

async function searchSubjects(id, semester) {
    console.log("Searching subjects by facility_id and semester")
    const data = await db.query(
        `SELECT id, subject_name, year, semester
        FROM subject
        WHERE (facility_id = "${id}" AND semester = "${semester}")`
    );
    return data
}

async function getOneSubject(facility_id, id) {
    const data = await db.query(
        `SELECT id, facility_id, subject_name, year, semester
        FROM subject
        WHERE (facility_id = "${facility_id}" AND id = "${id}")`
    );
    return data
}

async function updateOneSubject(id, facility_id, subject_name, year, semester) {
    await db.query(
        `UPDATE subject
         SET
         subject_name = "${subject_name}", year = "${year}", semester = "${semester}"
         WHERE (facility_id = "${facility_id}" AND id = "${id}")`
    );
    console.log("Subject " + id + " was modified sucesfully!")
}

async function deleteOneSubject(id) {
    //delete subject
    await db.query(
        `DELETE FROM subject
       WHERE id = "${id}";`
    )
    console.log("Subject" + id + " was deleted sucesfully!")
}

module.exports = {
    getAllSubjects,
    getAllSubjectsFromFacility,
    getAllSubjectsNamesFromFacility,
    createSubject,
    searchSubjects,
    getOneSubject,
    updateOneSubject,
    deleteOneSubject
}