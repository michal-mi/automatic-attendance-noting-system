const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getAllClassrooms() {
    const data = await db.query(
        `SELECT id, facility_id, classroom_name, QR_code, classroom_name, QR_code, classroom_description, gps_x, gps_y
        FROM classroom`
    );
    return data
}

async function getAllClassroomsNamesFromFacility(facility_id) {
    const data = await db.query(
        `SELECT classroom_name
        FROM classroom
        WHERE facility_id = ${facility_id}`
    );
    return data
}

async function createClassroom(body) {
    console.log(body)
    console.log(body.classroom_name)
    //generate qr code:
    var QRCode = Date.now().toString(32).slice(-4)

    //create classroom:
    if (body.id === undefined) {
        console.log(body.classroom_name)
        await db.query(
            `INSERT INTO classroom(facility_id, classroom_name, QR_code, classroom_description, gps_x, gps_y)
             VALUES ("${body.facility_id}" , "${body.classroom_name}", "${QRCode}",
             "${body.classroom_description}", "${body.gps_x}", "${body.gps_y}")`
        )
    } else {
        await db.query(
            `INSERT INTO classroom(id, facility_id, classroom_name, QR_code, classroom_description, gps_x, gps_y)
             VALUES (${body.id}, "${body.facility_id}" , "${body.classroom_name}", "${QRCode}",
             "${body.classroom_description}", "${body.gps_x}", "${body.gps_y}")`
        )
    }
    console.log("Classroom " + body.classroom_name + " from facility " + body.facility_id + " was created succesfully!")
    if (QRCode.length === 0) { return false } else { return true }
}

async function getAllClassroomsFromFacility(facility_id) {
    const data = await db.query(
        `SELECT id, facility_id, classroom_name, QR_code, classroom_name, QR_code, classroom_description, gps_x, gps_y
        FROM classroom
        WHERE facility_id = "${facility_id}" AND classroom_name != "Brak sali"`
    );
    return data
}

async function getOneClassroom(facility_id, id) {
    const data = await db.query(
        `SELECT id, facility_id, classroom_name, QR_code, classroom_description, gps_x, gps_y
        FROM classroom
        WHERE (facility_id = "${facility_id}" AND id = "${id}")`
    );
    return data
}

async function updateOneClassroom(id, classroom_name, facility_id, classroom_description, gps_x, gps_y) {
    await db.query(
        `UPDATE classroom
        SET
        classroom_name = "${classroom_name}", classroom_description = "${classroom_description}", gps_x = "${gps_x}", gps_y = "${gps_y}"
        WHERE (facility_id = "${facility_id}" AND id = "${id}")`
    );
    console.log("Classroom " + id + " was modified sucesfully!")
}

async function deleteOneClassroom(id) {
    //delete classroom with all classes taking place there and with corresponding student attendance lists
    await db.query(
        `DELETE p FROM presence p
        INNER JOIN class c on p.class_id = c.id
        WHERE c.classroom_id = "${id}";`
    )
    
    await db.query(
        `DELETE FROM class
         WHERE classroom_id = "${id}";`
    )

    await db.query(
        `DELETE FROM classroom
         WHERE id = "${id}";`
    )
    console.log("Classroom" + id + " was deleted sucesfully in cascade mode!")
}

async function deleteOneClassroomNoCascade(id, facility_id) {
    //search default classroom id:
    var default_id = await db.query(
        `SELECT id FROM classroom
        WHERE facility_id = ${facility_id} AND classroom_name = "Brak sali"`
    )
    //delete classroom's foreign key from classes entity:
    try {
        await db.query(
            `UPDATE class
        SET
        classroom_id = ${default_id[0].id}
        WHERE classroom_id = "${id}";`
        )
    } catch (err) {
        return false
    }
    //delete classroom
    await db.query(
        `DELETE FROM classroom
         WHERE id = "${id}";`
    )
    console.log("Classroom" + id + " was deleted sucesfully in no cascade mode!")
    return true
}

async function classroomsScheduleForFacilityOnSpecificDays(facility_id, days) {
    //prepare string with dates for (sql syntax):
    var days_in_sql = ""
    for (var i = 0; i < days.length; i++) {
        days_in_sql += "'" + days[i] + "',"
    }
    days_in_sql = days_in_sql.slice(0, -1)// take off the last comma
    //query:
    if (days.length !== 0) {
        const data = await db.query(
            `SELECT DISTINCT classroom_id, classroom_name, date, beginning_time, ending_time
        FROM class
        INNER JOIN presence p
        ON class.id = p.class_id
        INNER JOIN day d
        ON p.day_id = d.id
        INNER JOIN classroom c
        ON class.classroom_id = c.id
        WHERE (c.facility_id = ${facility_id} AND date IN (${days_in_sql}))
        ORDER BY classroom_id, date, beginning_time, ending_time`
        );
        return data
    } else {
        return false
    }
}


module.exports = {
    getAllClassrooms,
    getAllClassroomsNamesFromFacility,
    createClassroom,
    getAllClassroomsFromFacility,
    getOneClassroom,
    updateOneClassroom,
    deleteOneClassroom,
    deleteOneClassroomNoCascade,
    classroomsScheduleForFacilityOnSpecificDays
}