const db = require('./db');
const helper = require('../helper');
const config = require('../config');
const authentication = require("../models/authentication");
const classes = require("./class")
const e = require('express');
const { response } = require('express');

async function getCalendarForFacility(facility_id) {
    const data = await db.query(
        `SELECT  id, date, is_free
      FROM day
      WHERE (facility_id = "${facility_id}" AND date > NOW())`)
    return data
}

async function getWholeCalendarForFacility(facility_id) {
    const data = await db.query(
        `SELECT  id, date, is_free
      FROM day
      WHERE facility_id = ${facility_id} AND date > NOW()`)
    return data
}

async function editCalendar(to_change, facility_id) {
    var anyChangedToZero = false
    var anyChangedToOne = false
    var sql0 = ""
    var sql0P = ""
    var sql1 = ""
    var sql1P = ""

    for (var i = 0; i < to_change.length; i++) {
        if (Number(to_change[i].is_free) === 0) {
            anyChangedToZero = true
            sql0 += "id = " + to_change[i].id + " OR "
            sql0P += "d.id = " + to_change[i].id + " OR "
        } else {
            anyChangedToOne = true
            sql1 += "id = " + to_change[i].id + " OR "
            sql1P += "day_id = " + to_change[i].id + " OR "
        }
    }
    if (anyChangedToZero) {

        sql0 = sql0.slice(0, -3)
        sql0P = sql0P.slice(0, -3)

        //get all classes data
        var allClasses = await db.query(
            `SELECT class.id, classroom_id, subject_id, group_id, day_of_week, beginning_date, end_date FROM class
            INNER JOIN classroom c on class.classroom_id = c.id
            WHERE c.facility_id = ${facility_id}`
        )

        //get array of dates for which presences must be generated:
        var dates = []
        for (var i = 0; i < to_change.length; i++) {
            dates.push(to_change[i].date)
        }

        var classesCalendar = []
        for (var i = 0; i < allClasses.length; i++) { //for each classes:
            //correct all dates:
            var day = 60 * 60 * 24 * 1000;
            var begDate = allClasses[i].beginning_date
            var endDate = allClasses[i].end_date
            begDateFromDB = new Date(begDate.getTime() + day);
            endDateFromDB = new Date(endDate.getTime() + day);

            //calculate all classes calendars:
            //calculate date 7 days after beginning date from database:
            var weekLater = new Date(begDateFromDB.getTime() + (7 * day))
            //day of the week classes are on:
            var dayOfWeek = allClasses[i].day_of_week
            //find first date that classes start (taking into account what day of the week the classes are on)
            for (var fd = new Date(begDateFromDB.getTime() - day); fd < weekLater; fd = new Date(fd.getTime() + day)) {
                console.log("------" + fd.getDay() + "   " + fd + "   " + dayOfWeek)
                if (fd.getDay() === dayOfWeek) {
                    realBeginningDate = fd
                    realBeginningDate = new Date(realBeginningDate.getTime() + day)
                    break
                }
            }
            // generate calendar for class:
            for (var j = realBeginningDate; j <= endDateFromDB; j = new Date(j.getTime() + (7 * day))) {
                if (dates.includes(j.toISOString().split('T')[0])) {
                    classesCalendar.push({ "lesson_date": j.toISOString().split('T')[0], "class_id": allClasses[i].id })
                }
            }
        }

        var attendanceString = ""
        //generate presence for found classes:
        for (var i = 0; i < classesCalendar.length; i++) { //for each classes:
            //get all students ids that are from this classes:
            var students = await db.query(
                `SELECT student_id FROM class
                INNER JOIN groups_list gl on class.group_id = gl.id
                INNER JOIN student_group sg on gl.id = sg.group_id
                WHERE class.id = ${classesCalendar[i].class_id}`
            )

            var date_id = await db.query(
                `SELECT id FROM day
                WHERE date = '${classesCalendar[i].lesson_date}'`
            )

            for (var j = 0; j < students.length; j++) {
                attendanceString += "(" + classesCalendar[i].class_id + ", 1, " + date_id[0].id + ", " + students[j].student_id + "), "
            }

        }
        attendanceString = attendanceString.slice(0, -2)

        //chamge day status:
        await db.query(
            `UPDATE day
            SET
            is_free = 0
            WHERE (${sql0})`
        );

        //add presences:
        if (attendanceString.length !== 0) {
            await db.query(
                `INSERT INTO presence(class_id, status_id, day_id, student_id)
             VALUES ${attendanceString}`
            )
        }
        console.log("Some days from facility " + facility_id + " where changed succesfully to working days. Appropriate presences where added!")
    }
    if (anyChangedToOne) {
        sql1 = sql1.slice(0, -3)
        sql1P = sql1P.slice(0, -3)
        await db.query(
            `UPDATE day
            SET
            is_free = 1
            WHERE (${sql1})`
        );
        //delete presences if the day will be free:
        await db.query(
            `DELETE FROM presence WHERE ${sql1P}`
        )
        console.log("Some days from facility " + facility_id + " where changed succesfully to free days. Appropriate presences where deleted!")
    }
}

async function addDays(facility_id, start_day, end_day, days_off) {
    var day = 60 * 60 * 24 * 1000;

    //get facility calendar:
    var calendar = await getWholeCalendarForFacility(facility_id)

    //prepare string with values that will be added to db:
    var values = ""

    //loop thru days that user wants to add:
    for (var i = new Date(start_day); i <= new Date(end_day); i = new Date(i.getTime() + (1 * day))) {
        var dayWasPreviouslyOnCalendar = false //indicates if the day that loop goes currently thru was yet in facility calendar
        var dayWasSet = false //indicates if the day that loop goes currently thru was previusly added to values string
        //loop thru facility calendar:
        for (var a = 0; a < calendar.length; a++) {
            //check if the days that user want to add are not in calendar yet:
            if (calendar[a].date.toString().slice(0, 10) === i.toString().slice(0, 10)) {
                dayWasPreviouslyOnCalendar = true
            }
        }

        for (var j = 0; j < days_off.length; j++) {
            if (i.getDay() === Number(days_off[j].day_number) && !dayWasPreviouslyOnCalendar) {
                //set day off
                values += "(" + facility_id + ",'" + i.toISOString().slice(0, 10) + "'," + 1 + "),";
                dayWasSet = true
            }
        }
        if (!dayWasSet && !dayWasPreviouslyOnCalendar) {
            //set working day:
            values += "(" + facility_id + ",'" + i.toISOString().slice(0, 10) + "'," + 0 + "),"
        }
    }
    values = values.slice(0, -1)// take off the last comma
    //add values to db:
    if (values !== "") {
        await db.query(
            `INSERT INTO day(facility_id, date, is_free)
            VALUES ${values}`
        )
        console.log("At least part of days from " + start_day + " to " + end_day + " was added succesfully to facility " + facility_id)
        return true
    } else {
        console.log("Days from " + start_day + " to " + end_day + " were NOT added to facility " + facility_id + " because they all have already existed in the calendar!")
        return false
    }
}

module.exports = {
    getCalendarForFacility,
    editCalendar,
    addDays,
    getWholeCalendarForFacility
}