const db = require('./db');
const helper = require('../helper');
const config = require('../config');

async function getAllGroups() {
  const data = await db.query(
    `SELECT id, facility_id, group_name, year, semester
      FROM groups_list`
  );
  return data
}

async function getAllGroupsFromFacility(id) {
  const data = await db.query(
    `SELECT id, group_name, year, semester
      FROM groups_list
      WHERE facility_id = "${id}"`
  );
  return data
}

async function searchGroups(id, semester) {
  console.log("Searching groups by facility_id and semester")
  const data = await db.query(
    `SELECT id, group_name, year, semester
      FROM groups_list
      WHERE (facility_id = "${id}" AND semester = "${semester}")`
  );
  return data
}

async function searchGroupsAndSubjects(facility_id, lecturer_id, subject_id, group_id) {
  var data;
  var string_sql = `SELECT subject.id AS subject_id, groups_list.id AS group_id, subject_name, group_name
  FROM class
  INNER JOIN subject
  ON class.subject_id = subject.id
  INNER JOIN groups_list  
  ON class.group_id = groups_list.id`;

  //search by facility_id and lecturer_id only:
  if (facility_id !== "" && lecturer_id !== "" && subject_id === "" && group_id === "") {
    console.log("Searching groups and subjects by facility_id only")
    data = await db.query(string_sql + ` WHERE subject.facility_id = "${facility_id}" AND class.lecturer_id = "${lecturer_id}"`);
  }
  //search by facility_id, lecturer_id and subject_id:
  else if (facility_id !== "" && lecturer_id !== "" && subject_id !== "" && group_id === "") {
    console.log("Searching groups and subjects by facility_id and subject_id")
    data = await db.query(string_sql + ` WHERE (subject.facility_id = "${facility_id}" AND class.lecturer_id = "${lecturer_id}" AND subject.id = "${subject_id}")`);
  }
  //search by facility_id, lecturer_id, subject_id and group_id:
  else if (facility_id !== "" && lecturer_id !== "" && subject_id !== "" && group_id !== "") {
    console.log("Searching groups and subjects facility_id, subject_id and group_id")
    data = await db.query(string_sql + ` WHERE (subject.facility_id= "${facility_id}" AND class.lecturer_id = "${lecturer_id}" AND subject.id = "${subject_id}" AND groups_list.id = "${group_id}")`);
  }
  //search by facility_id, lecturer_id and group_id:
  else if (facility_id !== "" && lecturer_id !== "" && subject_id === "" && group_id !== "") {
    console.log("Searching groups and subjects by facility_id and group_id")
    data = await db.query(string_sql + ` WHERE (subject.facility_id = "${facility_id}" AND class.lecturer_id = "${lecturer_id}" AND groups_list.id = "${group_id}")`);
  }
  return data;
}

async function getDataAboutGroupInSubject(facility_id, subject_group_id) {
  const subject_id = subject_group_id.split('-')[0]
  const group_id = subject_group_id.split('-')[1]
  data = await db.query(
    `SELECT subject_name, group_name
    FROM class
    INNER JOIN subject
    ON class.subject_id = subject.id
    INNER JOIN groups_list
    ON class.group_id = groups_list.id
    WHERE (subject.facility_id = "${facility_id}" AND groups_list.id = "${group_id}" AND subject.id = "${subject_id}")`
  );
  return data
}

async function getDataAboutStudentsFromGroupInSubject(facility_id, subject_group_id) {
  const subject_id = subject_group_id.split('-')[0]
  const group_id = subject_group_id.split('-')[1]
  const class_id = await db.query(
    `SELECT c.id
    FROM class c
    WHERE c.subject_id = ${subject_id} AND c.group_id = ${group_id}`
  )

  const currentDate = new Date().toISOString().slice(0, 10)

  var data = await db.query(
    `SELECT u.id, u.first_name,  u.surname, COUNT(CASE WHEN p.status_id IN (2, 3) THEN 1 END) AS presentAmount, COUNT(CASE WHEN d.date <= '${currentDate}' THEN 1 END) AS lessonsUpToDate
    FROM user u
    INNER JOIN presence p on u.id = p.student_id
    INNER JOIN class c on p.class_id = c.id
    INNER JOIN day d on p.day_id = d.id
    WHERE (p.class_id = ${class_id[0].id} AND d.is_free = 0)
    GROUP BY (u.id)`
  )

  if (data.length !== 0) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].lessonsUpToDate === 0) {
        data[i].presentAmount = 100
      } else {
        data[i].presentAmount = data[i].presentAmount / data[i].lessonsUpToDate * 100
      }
    }
  }
  console.log(data)

  return data
}

async function getAllGroupsNamesFromFacility(facility_id) {
  const data = await db.query(
    `SELECT group_name
      FROM groups_list
      WHERE facility_id = ${facility_id}`
  );
  return data
}

async function createGroup(facility_id, group_name, year, semester) {

  //create group:
  await db.query(
    `INSERT INTO groups_list(facility_id, group_name, year, semester)
     VALUES ("${facility_id}" , "${group_name}", "${year}", "${semester}")`
  )
  console.log("Group " + group_name + " from facility " + facility_id + " was created succesfully!")
  return true
}

async function getOneGroup(facility_id, id) {
  const data = await db.query(
    `SELECT id, facility_id, group_name, year, semester
      FROM groups_list
      WHERE (facility_id = "${facility_id}" AND id = "${id}")`
  );
  return data
}

async function updateOneGroup(id, facility_id, group_name, year, semester) {
  await db.query(
    `UPDATE groups_list
      SET
      group_name = "${group_name}", year = "${year}", semester = "${semester}"
      WHERE (facility_id = "${facility_id}" AND id = "${id}")`
  );
  console.log("Group " + id + " was modified sucesfully!")
}

async function deleteOneGroup(id) {
  //delete presences:
  await db.query(
    `DELETE p FROM presence p
    INNER JOIN class c ON p.class_id = c.id
    WHERE c.group_id = "${id}";`
  )

  //delete classes:
  await db.query(
    `DELETE c FROM class c
  WHERE c.group_id = "${id}";`
  )

  //unsubscribe students from the group:
  await db.query(
    `DELETE FROM student_group
      WHERE group_id = "${id}";`
  )

  //delete group
  await db.query(
    `DELETE FROM groups_list
     WHERE id = "${id}";`
  )
  console.log("Group " + id + " was deleted sucesfully!")
}

async function addStudentsToGroup(id, students_array) {


  //get info about what presences sholud be added for student:
  var infoAboutPresences = await db.query(
    `SELECT DISTINCT day_id, class_id, d.date FROM presence
    INNER JOIN class c on presence.class_id = c.id
    INNER JOIN groups_list gl on c.group_id = gl.id
    INNER JOIN day d on presence.day_id = d.id
    WHERE gl.id = ${id}`)

  console.log(students_array)
  //prepare string with information for student_group entity:
  var student_group = ""
  for (var i = 0; i < students_array.length; i++) { //for each student:
    student_group += "(" + id + "," + students_array[i] + "), ";
  }
  student_group = student_group.slice(0, -2)

  //prepare string with presences to be added:
  var presences = ""
  var today = new Date()
  today = today.toISOString().slice(0, 10)
  for (var i = 0; i < infoAboutPresences.length; i++) {
    for (var j = 0; j < students_array.length; j++) { //for each student:
      date = infoAboutPresences[i].date
      date = date.toJSON().slice(0, 10)
      if (date < today) {
        presences += "(" + infoAboutPresences[i].class_id + ", 2, " + infoAboutPresences[i].day_id + ", " + students_array[j] + "), "
      } else {
        presences += "(" + infoAboutPresences[i].class_id + ", 1, " + infoAboutPresences[i].day_id + ", " + students_array[j] + "), "
      }
    }
  }
  presences = presences.slice(0, -2)

  console.log(student_group)
  console.log(presences)

  await db.query(
    `INSERT INTO student_group(group_id, student_id)
     VALUES ${student_group}`
  )

  await db.query(
    `INSERT INTO presence (class_id, status_id, day_id, student_id)
    VALUES ${presences}`
  )

  console.log("Student/students: " + students_array + " added succesfully to group " + id + "!")
  return true
}

async function deleteStudentsFromGroup(id, students_array) {
  //delete students presences related with this group:
  await db.query(
    `DELETE presence FROM presence
     INNER JOIN class c on class_id = c.id
     WHERE group_id = ${id} AND student_id IN (${students_array})`
  )

  //delete students from group:
  await db.query(
    `DELETE FROM student_group
       WHERE student_id IN (${students_array})`
  )

  console.log("Student/students: " + students_array + " deleted succesfully from group " + id + "!")
}

async function getDatesAndTimeForGroup(group_id) {
  //get calendar for group
  const calendar = await db.query(
    `SELECT DISTINCT date, beginning_time, ending_time
    FROM groups_list
    INNER JOIN class c
    ON groups_list.id = c.group_id
    INNER JOIN presence p
    ON c.id = p.class_id
    INNER JOIN day d
    ON p.day_id = d.id
    WHERE (group_id = ${group_id} AND is_free = 0)
    ORDER BY date, beginning_time, ending_time`
  )
  return calendar
}

async function getGroupsByStudentId(student_id) {
  //get groups for student
  const groups = await db.query(
    `SELECT group_id, group_name FROM student_group sg 
    INNER JOIN groups_list gl 
    ON sg.group_id = gl.id 
    WHERE sg.student_id = ${student_id}`
  )
  return groups
}

module.exports = {
  getAllGroups,
  getAllGroupsFromFacility,
  searchGroups,
  searchGroupsAndSubjects,
  getDataAboutGroupInSubject,
  getDataAboutStudentsFromGroupInSubject,
  getAllGroupsNamesFromFacility,
  createGroup,
  getOneGroup,
  updateOneGroup,
  deleteOneGroup,
  addStudentsToGroup,
  deleteStudentsFromGroup,
  getDatesAndTimeForGroup,
  getGroupsByStudentId
}