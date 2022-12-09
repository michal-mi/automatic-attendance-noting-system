const db = require('./db');
const helper = require('../helper');
const config = require('../config');
const authentication = require("../models/authentication");

//---auxiliary functions---:
function measure(lat1, lon1, lat2, lon2) {
    // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000; // meters
}

function toSeconds(time) {
    var hours = parseInt(time.split(":")[0])
    var minutes = parseInt(time.split(":")[1])
    var seconds = parseInt(time.split(":")[2])
    var timeInSeconds = hours * 3600 + minutes * 60 + seconds
    return timeInSeconds
}
//----

async function getAllClasses() {
    const data = db.query(
        `SELECT id, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date
         FROM class`
    );
    return data
}

async function getAllClassesForOneLecturer(lecturer_id) {
    const data = db.query(
        `SELECT id, classroom_id, subject_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date
        FROM class
        WHERE lecturer_id = "${lecturer_id}"`
    );
    return data
}

async function getLecturerCalendar(lecturer_id, facility_id) {
    const data = await db.query(
        `SELECT DISTINCT class.id, group_name, classroom_name, subject_name, beginning_time, ending_time, date
        FROM class
        INNER JOIN presence p on class.id = p.class_id
        INNER JOIN day d on p.day_id = d.id
        INNER JOIN subject on class.subject_id = subject.id
        INNER JOIN classroom on class.classroom_id = classroom.id
        INNER JOIN groups_list on class.group_id = groups_list.id
      WHERE lecturer_id = "${lecturer_id}"`
    );
    const daysWithClasses = await db.query(
        `SELECT date
        FROM day
        WHERE (facility_id = "${facility_id}" AND is_free = 0)`
    )
    var calendar = []
    var id = 1;
    for (var i = 0; i < data.length; i++) {
        //detect subject change:
        if(i >= 1){
            if(data[i].id !== data[i-1].id){
                id = 1
            }
        }
        //repair beginning and ending dates:
        var day = 60 * 60 * 24 * 1000;
        date = data[i].date
        date = new Date(date.getTime() + day);
        calendar.push({ "id": (data[i].id).toString() + "-" + id.toString(), "text": "Sala: " + data[i].classroom_name + "\n Grupa: " + data[i].group_name + "\n Przedmiot: " + data[i].subject_name, "start": (new Date(new Date(date).getTime())).toISOString().slice(0, 11) + data[i].beginning_time, "end": (new Date(new Date(date).getTime())).toISOString().slice(0, 11) + data[i].ending_time, "backColor": "#55C3FE" })
        id ++;
    }
    return calendar
}

async function getLessonData(lesson_id, facility_id) {
    //find class id:
    var id = lesson_id.split('-')[0]
    //find the number of a specific lesson
    var lessonNumber = lesson_id.split('-')[1]
    console.log(lessonNumber-1)
    //get class info:
    const data = await db.query(
        `SELECT class.id, class.group_id, class.subject_id, group_name, classroom_name, subject_name, beginning_time, ending_time, day_of_week, beginning_date, end_date
      FROM class
      INNER JOIN subject
      ON class.subject_id = subject.id
      INNER JOIN classroom
      ON class.classroom_id = classroom.id
      INNER JOIN groups_list
      ON class.group_id = groups_list.id
      WHERE class.id = "${id}"`
    );
    //get facility calendar:
    const daysWithClasses = await db.query(
        `SELECT date
        FROM day
        WHERE (facility_id = "${facility_id}" AND is_free = 0)`
    )
    //-----find lesson date-----:
    var realBeginningDate
    //repair beginning date:
    var day = 60 * 60 * 24 * 1000;
    begDate = data[0].beginning_date
    endDate = data[0].end_date
    begDateFromDB = new Date(begDate.getTime() + day);
    endDateFromDB = new Date(endDate.getTime() + day);
    //calculate date 7 days after beginning date from database:
    var weekLater = new Date(begDateFromDB.getTime() + (7 * day))
    //day of the week classes are on:
    var dayOfWeek = data[0].day_of_week
    //find first date that classes start (taking into account what day of the week the classes are on)
    for (var fd = new Date(begDateFromDB.getTime() - day); fd < weekLater; fd = new Date(fd.getTime() + day)) {
        console.log("------" + fd.getDay() + "   " + fd + "   " + dayOfWeek)
        if (fd.getDay() === dayOfWeek) {
            realBeginningDate = fd
            realBeginningDate = new Date(realBeginningDate.getTime() + day)
            break
        }
    }
    var id = 0
    var lesson
    // generate calendar for class:
    console.log(realBeginningDate)
    for (var j = realBeginningDate; j <= endDateFromDB; j = new Date(j.getTime() + (7 * day))) {
        for (var k = 0; k < daysWithClasses.length; k++) {
            console.log(daysWithClasses[k])
            //to lecturer calendar add only dates that are in facility calendar marked as lesson day:
            if (j.toISOString().split('T')[0] == (daysWithClasses[k].date).toISOString().split('T')[0]) {
                if (id === (lessonNumber - 1)) {
                    lesson = { "lesson_date": (new Date(new Date(j).getTime())).toISOString().split('T')[0], "beginning_time": data[0].beginning_time, "ending_time": data[0].ending_time, "classroom_name": data[0].classroom_name, "subject_name": data[0].subject_name, "group_name": data[0].group_name, "subject_id": data[0].subject_id, "group_id": data[0].group_id }
                }
                id++
            }
        }
    }
    return lesson
}

async function getClassesCalendar(id) {
    //get class info:
    const data = await db.query(
        `SELECT DISTINCT d.date FROM day d
        INNER JOIN presence p on d.id = p.day_id
        WHERE p.class_id = ${id}`
    );
    var day = 60 * 60 * 24 * 1000;
    for (var i = 0; i < data.length; i++) {
        data[i].date = (new Date(new Date(data[i].date).getTime() + day)).toISOString().split('T')[0]
    }
    return data
}

async function getClassesCalendarForSubjectGroup(facility_id, subject_group_id) {
    const subject_id = subject_group_id.split('-')[0]
    const group_id = subject_group_id.split('-')[1]
    //get classes calendar:
    const classesCalendar = await db.query(
        `SELECT DISTINCT date AS lesson_date, beginning_time, ending_time, classroom_name, subject_name, group_name
        FROM class
        INNER JOIN presence p on class.id = p.class_id
        INNER JOIN day d on p.day_id = d.id
        INNER JOIN subject
        ON class.subject_id = subject.id
        INNER JOIN classroom
        ON class.classroom_id = classroom.id
        INNER JOIN groups_list
        ON class.group_id = groups_list.id
        WHERE (subject.id = "${subject_id}" AND groups_list.id = "${group_id}")`
    );
    return classesCalendar
}

async function getAttendanceList(facility_id, subject_group_id, lesson_date, lecturer_id) {
    const subject_id = subject_group_id.split('-')[0]
    const group_id = subject_group_id.split('-')[1]
    const data = await db.query(
        `SELECT u.first_name, u.surname, u.id AS user_id, p.status_id, p.id
        FROM user u
        INNER JOIN presence p
        ON u.id = p.student_id
        INNER JOIN class c
        ON p.class_id = c.id
        INNER JOIN day d
        ON p.day_id = d.id
        WHERE (d.facility_id = "${facility_id}" AND c.subject_id = "${subject_id}"
        AND c.group_id = "${group_id}" AND d.date = '${lesson_date}' AND c.lecturer_id = "${lecturer_id}")`
    );
    return data
}

async function changeAttendanceList(attendance_list) {
    if (attendance_list === "" || attendance_list === undefined) {
        return false
    }
    var whenThenString = ""
    var idString = ""
    for (var i = 0; i < attendance_list.length; i++) {
        whenThenString += "WHEN " + attendance_list[i].id + " THEN " + attendance_list[i].status_id + " "
        idString += attendance_list[i].id + ","
    }
    idString = idString.slice(0, -1)
    await db.query(
        `UPDATE presence
        SET status_id = CASE id ${whenThenString}
        END
        WHERE id IN(${idString})`
    );
    return true
}

async function addClasses(IDs_of_days, classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date) {

    //get all users from group:
    const allStudentsFromGroup = await db.query(
        `SELECT user.id
        FROM user
        INNER JOIN student_group sg on user.id = sg.student_id
        INNER JOIN groups_list gl on sg.group_id = gl.id
        WHERE group_id=${group_id};`
    )

    //add classes to db:
    await db.query(
        `INSERT INTO class(classroom_id, subject_id, lecturer_id, group_id, beginning_time, ending_time, day_of_week, beginning_date, end_date)
        VALUES ("${classroom_id}" , "${subject_id}", "${lecturer_id}", "${group_id}", "${beginning_time}", "${ending_time}", "${day_of_week}", "${beginning_date}", "${end_date}")`
    )

    //get last classes ID:
    const newClassesID = await db.query(
        `SELECT MAX( id ) AS id FROM class;`)
    //generate sql code for presence insert to db:
    var presenceData = ""
    for (var i = 0; i < IDs_of_days.length; i++) {
        for (var j = 0; j < allStudentsFromGroup.length; j++) {
            presenceData += "(" + newClassesID[0].id + "," + 1 + "," + IDs_of_days[i] + "," + allStudentsFromGroup[j].id + "),"
        }
    }
    presenceData = presenceData.slice(0, -1)// take off the last comma
    //add presences for classes:
    await db.query(
        `INSERT INTO presence(class_id, status_id, day_id, student_id)
        VALUES ${presenceData}`
    )
}

async function searchClasses(facility_id, group_id, classroom_id, lecturer_id) {
    var data;
    var string_sql = `SELECT class.id, classroom_name, subject_name, title, first_name, surname, group_name, beginning_time, ending_time, day_of_week
        FROM class
        INNER JOIN subject
        ON class.subject_id = subject.id
        INNER JOIN classroom
        ON class.classroom_id = classroom.id
        INNER JOIN groups_list
        ON class.group_id = groups_list.id
        INNER JOIN user
        ON class.lecturer_id = user.id`;

    //search by facility_id only:
    if (facility_id !== "" && group_id === "" && classroom_id === "" && lecturer_id === "") {
        console.log("Searching classes by facility only...")
        data = await db.query(string_sql + ` WHERE subject.facility_id = ${facility_id}`);
    }
    //search by facility_id and group_id:
    else if (facility_id !== "" && group_id !== "" && classroom_id === "" && lecturer_id === "") {
        console.log("Searching classes by facility and group...")
        data = await db.query(string_sql + ` WHERE (subject.facility_id = ${facility_id} AND group_id = ${group_id})`);
    }
    //search by facility_id, group_id and classroom_id
    else if (facility_id !== "" && group_id !== "" && classroom_id !== "" && lecturer_id === "") {
        console.log("Searching classes by facility, group and classroom...")
        data = await db.query(string_sql + ` WHERE (subject.facility_id = ${facility_id} AND group_id = ${group_id} AND classroom_id = ${classroom_id})`);
    }
    //search by facility_id, group_id, classroom_id and lecturer_id:
    else if (facility_id !== "" && group_id !== "" && classroom_id !== "" && lecturer_id !== "") {
        console.log("Searching classes by facility, group, classroom and lecturer...")
        data = await db.query(string_sql + ` WHERE (subject.facility_id = ${facility_id} AND group_id = ${group_id} AND classroom_id = ${classroom_id} AND lecturer_id = ${lecturer_id})`);
    }
    //search by facility_id and lecturer_id:
    else if (facility_id !== "" && group_id === "" && classroom_id === "" && lecturer_id !== "") {
        console.log("Searching classes by facility and lecturer...")
        data = await db.query(string_sql + ` WHERE (subject.facility_id = ${facility_id} AND lecturer_id = ${lecturer_id})`);
    }
    //search by facility_id, classroom_id and lecturer_id:
    else if (facility_id !== "" && group_id === "" && classroom_id !== "" && lecturer_id !== "") {
        console.log("Searching classes by facility, classroom and lecturer...")
        data = await db.query(string_sql + ` WHERE (subject.facility_id = ${facility_id} AND classroom_id = ${classroom_id} AND lecturer_id = ${lecturer_id})`);
    }
    //search by facility_id and classroom_id:
    else if (facility_id !== "" && group_id === "" && classroom_id !== "" && lecturer_id === "") {
        console.log("Searching classes by facility and classroom...")
        data = await db.query(string_sql + ` WHERE (subject.facility_id = ${facility_id} AND classroom_id = ${classroom_id})`);
    }
    //search by facility_id, group_id and lecturer_id:
    else if (facility_id !== "" && group_id !== "" && classroom_id === "" && lecturer_id !== "") {
        console.log("Searching classes by facility, group and lecturer...")
        data = await db.query(string_sql + ` WHERE (subject.facility_id = ${facility_id} AND group_id = ${group_id} AND lecturer_id = ${lecturer_id})`);
    }
    return data
}

async function getClassesData(class_id) {
    const data = await db.query(
        `SELECT class.id, classroom_name, subject_name, title, first_name, surname, group_name, beginning_time, ending_time, day_of_week, beginning_date, end_date, lecturer_id, classroom_id 
            FROM class
            INNER JOIN subject
            ON class.subject_id = subject.id
            INNER JOIN classroom
            ON class.classroom_id = classroom.id
            INNER JOIN groups_list
            ON class.group_id = groups_list.id
            INNER JOIN user
            ON class.lecturer_id = user.id
            WHERE class.id = ${class_id}`
    );
    //repair beginning date:
    var day = 60 * 60 * 24 * 1000;
    data[0].beginning_date = (new Date(new Date(data[0].beginning_date).getTime() + day)).toISOString().split('T')[0]
    data[0].end_date = (new Date(new Date(data[0].end_date).getTime() + day)).toISOString().split('T')[0]
    console.log(data)
    return data
}

//for mobile app
async function getAttendanceListForStudent(student_id, date) {
    const data = await db.query(
        `SELECT s.subject_name, c.beginning_time, c.ending_time, p.status_id
        FROM presence p
        INNER JOIN class c
        ON p.class_id = c.id
        INNER JOIN subject s
        ON c.subject_id = s.id
        INNER JOIN day d
        ON d.id = p.day_id
        WHERE p.student_id = ${student_id} AND d.date = "${date}"`
    );
    return data
}

async function changePresenceStatus(user_id, qr_code, gps_x, gps_y) {
    //fetch data needed for checking if student's presence should be changed:
    today = new Date()
    today = today.toISOString().slice(0, 10)
    const dataForPresenceChange = await db.query(
        `SELECT gps_x, gps_y, c.beginning_time, c.ending_time, p.id, p.status_id
        FROM classroom
        INNER JOIN class c on classroom.id = c.classroom_id
        INNER JOIN presence p on c.id = p.class_id
        INNER JOIN user u on p.student_id = u.id
        INNER JOIN day d on p.day_id = d.id
        WHERE (QR_code = "${qr_code}" AND u.id = ${user_id} AND d.date = '${today}' AND d.is_free = 0)`)
    if (dataForPresenceChange.length === 0) { return 400 }

    //verify geolocation - if phone is inside classroom (including measurement error):
    var presenceID
    if (measure(gps_y, gps_x, dataForPresenceChange[0].gps_y, dataForPresenceChange[0].gps_x) <= 50) {
        //verify time of classes:
        for (var i = 0; i < dataForPresenceChange.length; i++) {
            //convert time to seconds:
            var timeMin = toSeconds(dataForPresenceChange[i].beginning_time) - 600
            var timeMax = toSeconds(dataForPresenceChange[i].beginning_time) + 900
            var timeStart = toSeconds(dataForPresenceChange[i].beginning_time)
            var timeEnd = toSeconds(dataForPresenceChange[i].ending_time)
            //get time from current date:
            var dateNow = new Date()
            var hours = ("0" + dateNow.getHours()).slice(-2)
            var minutes = ("0" + (dateNow.getMinutes())).slice(-2)
            var seconds = ("0" + dateNow.getSeconds()).slice(-2)
            var timeNow = hours + ":" + minutes + ":" + seconds
            timeNow = toSeconds(timeNow)

            //verify if student has scanned code on time
            //(maximum 10 minutes before classes begins or 15 minutes after classes begins):
            if (timeNow >= timeMin && timeNow <= timeEnd) {
                if (dataForPresenceChange[i].status_id == 2)
                    return 434
                if (timeMin <= timeNow && timeNow <= timeMax) {
                    presenceID = dataForPresenceChange[i].id
                    break
                    //is not scanned on time
                }
                else {
                    return 432
                }
            }
        }
        //if the presence which status is to be changed is not found:
        if (presenceID === undefined) {
            return 400 //presence is not found in database
        }
        //change presence status:
        await db.query(
            `UPDATE presence
            SET status_id = 2
            WHERE id = ${presenceID}`
        )
        console.log("Status of presence " + presenceID + " was changed succesfully to 'present' by"
        + "scanning QR code by user " + user_id)
        //everything is good
        return 200
    } else {
        //bad location
        return 433
    }
}

//edit classes
async function editClasses(id, classroom_id, lecturer_id) {
    await db.query(
        `UPDATE class
        SET classroom_id = ${classroom_id}, lecturer_id = ${lecturer_id} 
        WHERE id=${id}`
    );
}

module.exports = {
    getAllClasses,
    getAllClassesForOneLecturer,
    getLecturerCalendar,
    getLessonData,
    getClassesCalendar,
    getClassesCalendarForSubjectGroup,
    getAttendanceList,
    changeAttendanceList,
    addClasses,
    searchClasses,
    getClassesData,
    getAttendanceListForStudent,
    changePresenceStatus,
    editClasses
}