const db = require('./db');
const helper = require('../helper');
const config = require('../config');
const { checkPreferences } = require('joi');
var bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
var nodemailer = require('nodemailer');
const dotenv = require('dotenv');

//---auxiliary functions---:
const toString = (bytes) => {
  var result = '';
  for (var i = 0; i < bytes.length; ++i) {
    result += getCode(bytes[i]);
  }
  return decodeURIComponent(result);
};

const getCode = (byte) => {
  const text = byte.toString(16);
  if (byte < 16) {
    return '%0' + text;
  }
  return '%' + text;
};

function makeRandom(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

//------

async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT id, facility_id, role_id, first_name, second_name, surname, e_mail
    FROM user LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta
  }
}

async function getAllUsers() {
  const data = await db.query(
    `SELECT id, facility_id, role_id, first_name, second_name, surname, e_mail
    FROM user`
  );
  return data
}

async function getOneDataForLoginByEmail(email) {
  const data = await db.query(
    `SELECT  id, facility_id, hash_password
    FROM user WHERE e_mail = "${email}"`)
  return data
}

async function getUserRoleByUserID(id) {
  const data = await db.query(
    `SELECT  role_id
  FROM user
  WHERE id = "${id}"`)
  return data
}

async function getUserDataByUserID(id) {
  const data = await db.query(
    `SELECT  id, first_name, second_name, surname, e_mail, avatar, facility_id, title
  FROM user
  WHERE id = "${id}"`)
  return data
}
async function getStudentDataByUserIDAndroid(id){
  const data = await db.query(
    `SELECT  first_name, surname, avatar, title, groups_list.group_name
  FROM user
  LEFT JOIN student_group
  ON user.id = student_group.student_id
  INNER JOIN groups_list
  ON student_group.group_id = groups_list.id
  WHERE user.id = "${id}"
  ORDER BY groups_list.group_name`)
  console.log(data)
  return data
}
async function getLecturerDataByUserIDAndroid(id){
  const data = await db.query(
    `SELECT  first_name, surname, avatar, title
  FROM user
  LEFT JOIN student_group
  ON user.id = student_group.student_id
  WHERE user.id = "${id}"`)
  console.log(data)
  return data
}

async function getUserDataByUserIDForEditing(id) {
  const data = await db.query(
    `SELECT  user.id, first_name, second_name, surname, e_mail, avatar, facility_id, title, birth_date, role_id, group_id
  FROM user
  LEFT JOIN student_group
  ON user.id = student_group.student_id
  WHERE user.id = "${id}"`)
  return data
}

async function getUserHashedPaswordByUserID(id) {
  const data = await db.query(
    `SELECT  hash_password
  FROM user
  WHERE id = "${id}"`)
  return data
}

async function changeUserHashedPaswordByUserID(id, oldPassword, newPassword) {
  //check if user is authorized to change password:
  const check = async () => {
    const oldPasswordFromDB = await getUserHashedPaswordByUserID(id)
    const result = await bcrypt.compare(oldPassword, toString(oldPasswordFromDB[0].hash_password))
    return result
  }
  //if user is authorized:
  if (check()) {
    await db.query(
      `UPDATE user
       SET
        hash_password = "${newPassword}"
       WHERE id = "${id}"`)
    console.log("Password was changed for user " + id)
    return true
  } else {
    console.log("User was not identified! Cannot change password!")
  }
  return false
}

async function changeUserAvatarReferenceByUserID(id) {
  await db.query(
    `UPDATE user
     SET
      avatar = "${id}"
     WHERE id = "${id}"`)
  console.log("Avatar reference was changed for user " + id)
}

async function changeUserAvatarByUserID(image) {
  let filePath = './rescources/avatars/' + image.name + '.jpg'
  const fs = require('fs');
  //checking if avatar exist:
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
  fs.appendFile(filePath, image.data, (err) => {
    if (err) throw err;
  });
  console.log("Avatar was changed/uploaded for user " + image.name)
};

async function deleteUserAvatarReferenceByUserID(id) {
  await db.query(
    `UPDATE user
     SET
      avatar = ""
     WHERE id = "${id}"`)
  console.log("Avatar reference was deleted for user " + id)
}

async function deleteUserAvatarByUserID(id) {
  let fileName = id
  const fs = require('fs');
  fs.unlinkSync('./rescources/avatars/' + fileName + '.jpg')
  console.log("Avatar was deleted for user " + id)
}

async function sendLinkToChangeUserPassword(email) {

  //search if user with this email exists
  const data = await db.query(
    `SELECT id FROM user
    WHERE e_mail = "${email}"`
  )

  //if user with email as provided by users exists then:
  if (data[0] !== undefined) {

    var result = makeRandom(30);

    //prepare link for password change:
    let link = 'http://localhost:3000/recoverPassword/' + result + data[0].id

    //prepare link expiration date:
    const dateNow = new Date();
    const ms = dateNow.getTime() + 600000;
    const dateLinkExpired = new Date(ms);

    var year = dateLinkExpired.getFullYear();
    var month = ("0" + (dateLinkExpired.getMonth() + 1)).slice(-2);
    var day = ("0" + dateLinkExpired.getDate()).slice(-2);
    var hours = ("0" + dateLinkExpired.getHours()).slice(-2);
    var minutes = ("0" + (dateLinkExpired.getMinutes())).slice(-2);
    var seconds = ("0" + dateLinkExpired.getSeconds()).slice(-2);

    var link_time = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

    var transporter = nodemailer.createTransport({
      service: process.env.EMAILSERVICE,
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.EMAILPASSWORD
      }
    });

    //set mail options:
    var mailOptions = {
      from: process.env.EMAILUSER,
      to: email,
      subject: 'Password reminder',
      text: 'This is your link to enter a new password: '
        + link + ".\nThe link's expiry time is " + link_time + "."
    };

    //send e-mail:
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    })

    await db.query(
      `UPDATE user
      SET change_pswd_link = "${link}", link_time = "${link_time}"
      WHERE e_mail = "${email}"`
    );

    return link
  }
}

async function createNewPasswordRecovery(user_id, password, change_pswd_link) {
  const data = await db.query(
    `SELECT hash_password, change_pswd_link, link_time 
    FROM user
    WHERE id = ${user_id}`
  );

  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(password, salt);
  var isOk = false

  const dateNow = new Date();
  if (data.length !== 0) {
    if (change_pswd_link === data[0].change_pswd_link && dateNow <= data[0].link_time) {

      var year = dateNow.getFullYear();
      var month = ("0" + (dateNow.getMonth() + 1)).slice(-2);
      var day = ("0" + dateNow.getDate()).slice(-2);
      var hours = ("0" + dateNow.getHours()).slice(-2);
      var minutes = ("0" + (dateNow.getMinutes())).slice(-2);
      var seconds = ("0" + dateNow.getSeconds()).slice(-2);

      var link_time = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

      await db.query(
        `UPDATE user
      SET hash_password = "${hashed}", link_time = "${link_time}"
      WHERE id = ${user_id}`);
      isOk = true
    } else {
      console.log("Time is up or link is not correct")
    }
  } else {
    console.log("undefined data")
  }

  return isOk
}

async function checkLink(user_id, change_pswd_link) {
  const data = await db.query(
    `SELECT change_pswd_link, link_time
    FROM user
    WHERE id = ${user_id}`
  );

  const dateNow = new Date();

  if (data[0] !== undefined && change_pswd_link === data[0].change_pswd_link && dateNow <= data[0].link_time) {
    return true
  } else {
    return false
  }
}

async function createNewUser(facility_id, role_id, first_name, second_name, surname, e_mail, title, birth_date, group_id) {
  //generate password:
  var password = makeRandom(10)

  //set e-mail data:
  var transporter = nodemailer.createTransport({
    service: process.env.EMAILSERVICE,
    auth: {
      user: process.env.EMAILUSER,
      pass: process.env.EMAILPASSWORD
    }
  });

  //set mail options:
  var mailOptions = {
    from: process.env.EMAILUSER,
    to: e_mail,
    subject: 'Password to your account',
    text: 'This is your password: ' + password
  };

  //send e-mail:
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })

  //hash password:
  async function hashIt(password) {
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);
    return hashed
  }
  const hashedPassword = await hashIt(password)

  if (birth_date !== null && birth_date !== undefined && birth_date !== "") {
    var date = new Date(birth_date)
    date = date.toJSON().slice(0, 10);
  }
  if (role_id === '4' || role_id === 4) {
    await db.query(
      `INSERT INTO user(facility_id, role_id, first_name, second_name, surname, e_mail, hash_password, avatar, title, birth_date, change_pswd_link, link_time)
  VALUES ("${facility_id}" , "${role_id}", "${first_name}", "${second_name}", "${surname}", "${e_mail}", "${hashedPassword}", '', "${title}", '${date}', '', null)`)
  } else {
    await db.query(
      `INSERT INTO user(facility_id, role_id, first_name, second_name, surname, e_mail, hash_password, avatar, title, birth_date, change_pswd_link, link_time)
    VALUES ("${facility_id}" , "${role_id}", "${first_name}", "${second_name}", "${surname}", "${e_mail}", "${hashedPassword}", '', "${title}", null, '', null)`)
  }

  //if user is student and group was chosen (then he/she must be connected with group:)
  if (role_id == 4) {
    // && Array.isArray(group_id)
    if (group_id.length !== 0) {
      //remove duplicated groups from array:
      var group_id_unique = group_id.reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
      }, []);

      //get id of newly created user:
      const newUserID = await db.query(
        `SELECT MAX( id ) AS id FROM user;`
      )

      //if user was assigned to at least one group: 
      var sql = ""
      var sqlGroups = "("
      //generate insert to db:
      for (var i = 0; i < group_id_unique.length; i++) {
        sql += "(" + group_id_unique[i] + ", " + newUserID[0].id + "),"
        sqlGroups += group_id_unique[i] + ", "
      }
      sql = sql.slice(0, -1)
      sqlGroups = sqlGroups.slice(0, -2)
      sqlGroups += ")"

      //connect student with its group (add new record to student_group entity):
      await db.query(
        `INSERT INTO student_group(group_id, student_id)
         VALUES ${sql};`)

      //get info about what presences sholud be added for student:
      var infoAboutPresences = await db.query(
        `SELECT DISTINCT day_id, class_id, d.date FROM presence
        INNER JOIN class c on presence.class_id = c.id
        INNER JOIN groups_list gl on c.group_id = gl.id
        INNER JOIN day d on presence.day_id = d.id
        WHERE gl.id IN ${sqlGroups}`)

      //prepare string with presences to be added:
      var presences = ""
      var today = new Date()
      today = today.toISOString().slice(0, 10)
      for (var i = 0; i < infoAboutPresences.length; i++) {
        date = infoAboutPresences[i].date
        date = date.toJSON().slice(0, 10)
        if (date < today) {
          presences += "(" + infoAboutPresences[i].class_id + ", 2, " + infoAboutPresences[i].day_id + ", " + newUserID[0].id + "), "
        } else {
          presences += "(" + infoAboutPresences[i].class_id + ", 1, " + infoAboutPresences[i].day_id + ", " + newUserID[0].id + "), "
        }
      }
      presences = presences.slice(0, -2)
      await db.query(
        `INSERT INTO presence (class_id, status_id, day_id, student_id)
        VALUES ${presences}`
      )
    }
  }

  console.log("User with " + e_mail + " was created succesfully. User role is " + role_id + ". User password is: " + password)
}

async function searchUsers(user_role, id, user_surname, user_facility, user_group) {
  var data;
  //searching for facility manager:
  if (user_role == 2) {
    var string_sql = `SELECT role_id, id, surname, facility_id, first_name FROM user`;

    //(1) searching facility manager by role only:
    if (id === '' && user_surname === '' && user_facility === '') {
      console.log("Searching facility manager by role only...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}") ORDER BY role_id, id`)
    }
    //(2) searching facility manager by role and id:
    else if (id !== "" && user_surname === "" && user_facility === "") {
      console.log("Searching facility manager by role and id...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND id = "${id}") ORDER BY role_id, id`)
    }
    //(3) searching facility manager by role, id and surname:
    else if (id !== "" && user_surname !== "" && user_facility === "") {
      console.log("Searching facility manager by role, id and surname...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND id = "${id}" AND surname = "${user_surname}") ORDER BY role_id, id`)
    }
    //(4) searching facility manager by role, id, surname and facility_id:
    else if (id !== "" && user_surname !== "" && user_facility !== "") {
      console.log("Searching facility manager by role, id, surname and facility...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND id = "${id}" AND surname = "${user_surname}" AND facility_id="${user_facility}") ORDER BY role_id, id`)
    }
    //(5) searching facility manager by role, id and facility_id:
    else if (id !== "" && user_surname === "" && user_facility !== "") {
      console.log("Searching facility manager by role, id and facility...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND id = "${id}" AND facility_id="${user_facility}") ORDER BY role_id, id`)
    }
    //(6) searching facility manager by role and facility_id:
    else if (id === "" && user_surname === "" && user_facility !== "") {
      console.log("Searching facility manager by role and facility...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND facility_id="${user_facility}") ORDER BY role_id, id`)
    }
    //(7) searching facility manager by role and surname:
    else if (id === "" && user_surname !== "" && user_facility === "") {
      console.log("Searching facility manager by role and surname...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND surname = "${user_surname}") ORDER BY role_id, id`)
    }
    //(8) searching facility manager by role, surname and facility_id:
    else if (id === "" && user_surname !== "" && user_facility !== "") {
      console.log("Searching facility manager by role, surname and facility...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND surname = "${user_surname}" AND facility_id="${user_facility}") ORDER BY role_id, id`)
    }
  }
  //searching for lecturer:
  if (user_role == 3) {
    var string_sql = `SELECT role_id, id, surname, facility_id, title, first_name FROM user`

    //(1) searching lecturer by role only:
    if (id === "" && user_surname === "") {
      console.log("Searching lecturer by role only...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND facility_id = "${user_facility}" AND first_name != "Brak" AND surname != "Prowadzącego") ORDER BY role_id, id`)
    }
    //(2) searching lecturer by role, id and surname:
    else if (id !== "" && user_surname !== "") {
      console.log("Searching lecturer by role, id and surname...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND id = "${id}" AND surname = "${user_surname}" AND facility_id = "${user_facility}" AND first_name != "Brak" AND surname != "Prowadzącego") ORDER BY role_id, id`)
    }
    //(3) searching lecturer by role and id:
    else if (id !== "" && user_surname === "") {
      console.log("Searching lecturer by role and id...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND id = "${id}" AND first_name != "Brak" AND surname != "Prowadzącego") ORDER BY role_id, id`)
    }
    //(4) searching lecturer by role and surname:
    else if (id === "" && user_surname !== "") {
      console.log("Searching lecturer by role and surname...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND surname = "${user_surname}" AND facility_id = "${user_facility}" AND first_name != "Brak" AND surname != "Prowadzącego") ORDER BY role_id, id`)
    }
  }
  //searching for student:
  if (user_role == 4) {
    var string_sql = `SELECT role_id, user.id, surname, user.facility_id, group_name, year, semester, first_name
      FROM user
      LEFT JOIN student_group
      ON user.id = student_group.student_id
      LEFT JOIN groups_list
      ON student_group.group_id = groups_list.id`

    //(1) searching student by role only:
    if (id === "" && user_surname === "" && user_group === "") {
      console.log("Searching student by role only...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND user.facility_id = "${user_facility}") GROUP BY user.id ORDER BY role_id, user.id`)
    }
    //(2) searching student by role and id:
    else if (id !== "" && user_surname === "" && user_group === "") {
      console.log("Searching student by role and id...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND user.id = "${id}" AND user.facility_id = "${user_facility}") GROUP BY user.id ORDER BY role_id, user.id`)
    }
    //(3) searching student by role, id and surname:
    else if (id !== "" && user_surname !== "" && user_group === "") {
      console.log("Searching student by role, id and surname...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND user.id = "${id}" AND surname = "${user_surname} AND user.facility_id = "${user_facility}") GROUP BY user.id ORDER BY role_id, user.id`)
    }
    //(4) searching student by role, id, surname and facility_id:
    else if (id !== "" && user_surname !== "" && user_group !== "") {
      console.log("Searching student by role, id, surname and group...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND user.id = "${id}" AND surname = "${user_surname}" AND group_id="${user_group}" AND user.facility_id = "${user_facility}") ORDER BY role_id, user.id`)
    }
    //(5) searching student by role, id and facility_id:
    else if (id !== "" && user_surname === "" && user_group !== "") {
      console.log("Searching student by role, id and facility...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND user.id = "${id}" AND group_id="${user_group}" AND user.facility_id = "${user_facility}") ORDER BY role_id, user.id`)
    }
    //(6) searching student by role and facility_id:
    else if (id === "" && user_surname === "" && user_group !== "") {
      console.log("Searching student by role and facility...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND group_id="${user_group}" AND user.facility_id = "${user_facility}") ORDER BY role_id, user.id`)
    }
    //(7) searching student by role and surname:
    else if (id === "" && user_surname !== "" && user_group === "") {
      console.log("Searching student by role and surname...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND surname = "${user_surname}" AND user.facility_id = "${user_facility}") GROUP BY user.id ORDER BY role_id, user.id`)
    }
    //(8) searching student by role, surname and facility_id:
    else if (id === "" && user_surname !== "" && user_group !== "") {
      console.log("Searching student by role, surname and facility...")
      data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND surname = "${user_surname}" AND group_id="${user_group}" AND user.facility_id = "${user_facility}") ORDER BY role_id, user.id`)
    }
  }
  return data
};

async function searchUsers2(user_role, facility_id, id, user_surname, birth_year) {
  var data;
  var string_sql = `SELECT id, first_name, second_name, surname, birth_date, first_name FROM user`

  //(1) searching student by role and facility:
  if (id === "" && user_surname === "" && birth_year === "") {
    console.log("Searching student by role and facility...")
    data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND facility_id = "${facility_id}")`)
  }
  //(2) searching student by role, facility and id:
  else if (id !== "" && user_surname === "" && birth_year === "") {
    console.log("Searching student by role, facility and id...")
    data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND facility_id = "${facility_id}"
    AND id = "${id}")`)
  }
  //(3) searching student by role, facility, surname and birth year:
  else if (id === "" && user_surname !== "" && birth_year !== "") {
    console.log("Searching student by role, facility, surname and birth year...")
    data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND facility_id = "${facility_id}" AND
    surname = "${user_surname}" AND (SELECT SUBSTRING_INDEX(birth_date, '-', 1) = "${birth_year}"))`)
  }
  //(4) searching student by role, facility and birth year:
  else if (id === "" && user_surname === "" && birth_year !== "") {
    console.log("Searching student by role, facility and birth year...")
    data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND facility_id = "${facility_id}" AND (SELECT SUBSTRING_INDEX(birth_date, '-', 1) = "${birth_year}"))`)
  }
  //(5) searching student by role, facility and surname:
  else if (id === "" && user_surname !== "" && birth_year === "") {
    console.log("Searching student by role, facility and surname...")
    data = await db.query(string_sql + ` WHERE (role_id = "${user_role}" AND facility_id = "${facility_id}" AND surname = "${user_surname}")`)
  }
  return data
};

async function editUser(id, facility_id, first_name, second_name, surname, e_mail, title, birth_date, role_id, group_id) {
  console.log("Modifying user " + id + " has started...")
  //if birth_date was not provided asign to it value null
  if (birth_date === "") {
    birth_date = null
  }

  if (second_name === undefined) {
    second_name = ""
  }

  //if user is student:
  if (role_id == 4 && group_id !== 0) {
    console.log("User is a student. Proceeding with modification...")
    //remove duplicats from new student groups array:
    group_id = group_id.reduce(function (a, b) {
      if (a.indexOf(b) < 0) a.push(b);
      return a;
    }, []);

    //check old user groups:
    var userOldGroups = await db.query(
      `SELECT group_id
      FROM student_group
      WHERE student_id = "${id}"`
    )

    //map old student groups to array
    var group_id_old = []
    for (var i = 0; i < userOldGroups.length; i++) {
      group_id_old.push(userOldGroups[i].group_id)
    }

    //check if user groups were changed. If not:
    if (JSON.stringify(group_id_old) == JSON.stringify(group_id)) {
      console.log("Student group/groups were NOT changed")
      //if yes:
    } else {
      console.log("Student group/groups were changed. Saving changes...")
      if (group_id_old !== "") {
        //DELETING -----------------------------------------------------------------
        //from what groups student will be deleted:
        var groups = "("
        for (var i = 0; i < group_id_old.length; i++) {
          groups += group_id_old[i] + ","
        }
        groups = groups.slice(0, -1)
        groups += ")"
        //delete student presences:
        await db.query(
          `DELETE presence FROM presence
          INNER JOIN class c on class_id = c.id
          WHERE student_id = ${id} AND group_id IN ${groups}`
        )
        //disconnect old student groups:
        await db.query(
          `DELETE FROM student_group
           WHERE student_id = "${id}";`
        )

        //ADDING -----------------------------------------------------------------
        //connect student with new groups:
        //if user was assigned to at least one group: 
        var values = ""
        var newGroups = "("
        for (var i = 0; i < group_id.length; i++) {
          values += "(" + group_id[i] + "," + id + "),"
          newGroups += group_id[i] + ","
        }
        newGroups = newGroups.slice(0, -1)
        newGroups += ")"
        values = values.slice(0, -1)

        //connect student with its group (add new record to student_group entity):
        await db.query(
          `INSERT INTO student_group(group_id, student_id)
          VALUES ${values}`)

        //get lessons for group to which student is begin added:
        var infoAboutPresences = await db.query(
          `SELECT DISTINCT day_id, class_id, d.date FROM presence p
           INNER JOIN class c
           ON p.class_id = c.id
           INNER JOIN day d
           ON d.id = p.day_id
           WHERE c.group_id IN ${newGroups}`
        )

        var presencesToAddWithStatus1 = "", presencesToAddWithStatus2 = ""
        var today = new Date()
        today = today.toISOString()
        today = today.slice(0, 10)
        //generate presences that will be added:
        for (var i = 0; i < infoAboutPresences.length; i++) {
          if (infoAboutPresences[i].date >= today) {
            presencesToAddWithStatus1 += "(" + infoAboutPresences[i].class_id
              + ",1," + infoAboutPresences[i].day_id + "," + id + "),"
          } else {
            presencesToAddWithStatus2 += "(" + infoAboutPresences[i].class_id
              + ",2," + infoAboutPresences[i].day_id + "," + id + "),"
          }
        }
        //connect:
        var presencesToAdd = presencesToAddWithStatus1 + presencesToAddWithStatus2
        presencesToAdd = presencesToAdd.slice(0, -1)
        //add presences to db:
        await db.query(
          `INSERT INTO presence (class_id, status_id, day_id, student_id)
          VALUES ${presencesToAdd}`
        )
      }

    }
  }

  //get old user role to check if role was changed:
  var userOldRole = await getUserRoleByUserID(id)
  userOldRole = userOldRole[0].role_id

  //if role wasn't changed:
  if (role_id === userOldRole) {
    console.log("User role NOT changed")
    //set new data:
    await db.query(
      `UPDATE user
       SET
        facility_id = "${facility_id}",
        first_name = "${first_name}",
        second_name = "${second_name}",
        surname = "${surname}",
        e_mail = "${e_mail}",
        title = "${title}",
        birth_date = "${birth_date}"
       WHERE id = "${id}"`)
  } else {
    //if role is about to be changed:
    console.log("User role changed. Saving changes...")
    //if role is about to be changed from student to lecturer:
    if (role_id === 3) {
      //remove student's assignment from groups:
      await db.query(
        `DELETE FROM student_group
        WHERE student_id = "${id}";`
      )
      //remove rows from presence entity:
      await db.query(
        `DELETE FROM presence
        WHERE student_id = "${id}";`
      )
      //change data including role:
      await db.query(
        `UPDATE user
         SET
          facility_id = "${facility_id}",
          role_id = "3",
          first_name = "${first_name}",
          second_name = "${second_name}",
          surname = "${surname}",
          e_mail = "${e_mail}",
          title = "${title}",
          birth_date = NULL
         WHERE id = "${id}"`)

    }
    //if role is about to be changed from lecturer to student:
    if (role_id === 4) {
      //remove lecturer id from all classes that he leads:
      await db.query(
        `UPDATE class
        SET
        lecturer_id = NULL
        WHERE lecturer_id = "${id}";`
      )
      //change data including role:
      await db.query(
        `UPDATE user
         SET
          facility_id = "${facility_id}",
          role_id = "4",
          first_name = "${first_name}",
          second_name = "${second_name}",
          surname= "${surname}",
          e_mail = "${e_mail}",
          title = "",
          birth_date = "${birth_date}"
         WHERE id = "${id}"`)
    }
  }

  console.log("User " + id + " was updated succesfully. User role is " + role_id)
}

async function deleteUser(id, role_id, facility_id) {
  if (role_id === 3) {
    var default_id = await db.query(
      ` SELECT id FROM user
      WHERE facility_id = ${facility_id} AND first_name = "Brak"`
    )

    await db.query(
      `UPDATE class
      SET lecturer_id = ${default_id[0].id}
      WHERE lecturer_id = "${id}"`
    )
  }
  await db.query(
    `DELETE FROM user WHERE id = "${id}"`
  )
  console.log("User " + id + " was deleted succesfully")
}

async function deleteUserFromGroup(id, group_id) {
  //delete user presences related with this group:
  await db.query(
    `DELETE presence FROM presence
     INNER JOIN class c on class_id = c.id
     WHERE student_id = ${id} AND group_id = ${group_id}`
  )
  //delete user from group
  await db.query(
    `DELETE FROM student_group WHERE (student_id = "${id}" AND group_id = "${group_id}")`
  )
  console.log("User " + id + " was deleted succesfully from group " + group_id)
}

async function getManyUsersDataByID(id_array) {
  const data = await db.query(
    `SELECT id, facility_id, role_id, first_name, second_name, surname, e_mail, hash_password, avatar, title, birth_date
    FROM user
    WHERE id IN (${id_array})`
  )
  return data
}

async function getAllStudentsFromGroup(id) {
  const data = await db.query(
    `SELECT user.id, first_name, second_name, surname, birth_date
    FROM user
    INNER JOIN student_group
    ON user.id = student_group.student_id
    WHERE (group_id = "${id}" AND role_id = 4)`
  )
  return data
}

async function getAllStudentsFromFacility(id) {
  const data = await db.query(
    `SELECT user.id, first_name, second_name, surname, birth_date
    FROM user
    WHERE (facility_id = "${id}" AND role_id = 4)`
  )
  return data
}

async function getAllLecturersFromFacility(facility_id) {
  const data = await db.query(
    `SELECT id, title, first_name, second_name, surname
    FROM user
    WHERE (facility_id = "${facility_id}" AND role_id = 3)`
  )
  return data
}

async function lecturerScheduleForFacilityOnSpecificDays(facility_id, days) {
  //prepare string with dates for (sql syntax):
  var days_in_sql = ""
  for (var i = 0; i < days.length; i++) {
    days_in_sql += "'" + days[i] + "',"
  }
  days_in_sql = days_in_sql.slice(0, -1)// take off the last comma
  //query:
  if (days_in_sql !== "") {
    const data = await db.query(
      `SELECT DISTINCT lecturer_id, date, beginning_time, ending_time
      FROM class
      INNER JOIN presence p
      ON class.id = p.class_id
      INNER JOIN day d
      ON p.day_id = d.id
      INNER JOIN classroom c
      ON class.classroom_id = c.id
      WHERE (c.facility_id = ${facility_id} AND date IN (${days_in_sql}))
      ORDER BY lecturer_id, date, beginning_time, ending_time`
    );
    return data
  } else {
    return false
  }
}

async function getAllEmails() {
  const data = await db.query(
    `SELECT e_mail
      FROM user`
  );
  return data
}

module.exports = {
  getMultiple,
  getAllUsers,
  getOneDataForLoginByEmail,
  getUserRoleByUserID,
  getUserDataByUserID,
  getStudentDataByUserIDAndroid,
  getLecturerDataByUserIDAndroid,
  getUserDataByUserIDForEditing,
  getUserHashedPaswordByUserID,
  changeUserHashedPaswordByUserID,
  changeUserAvatarReferenceByUserID,
  changeUserAvatarByUserID,
  deleteUserAvatarReferenceByUserID,
  deleteUserAvatarByUserID,
  sendLinkToChangeUserPassword,
  createNewPasswordRecovery,
  checkLink,
  createNewUser,
  searchUsers,
  searchUsers2,
  editUser,
  deleteUser,
  deleteUserFromGroup,
  getManyUsersDataByID,
  getAllStudentsFromGroup,
  getAllStudentsFromFacility,
  getAllLecturersFromFacility,
  lecturerScheduleForFacilityOnSpecificDays,
  getAllEmails
}