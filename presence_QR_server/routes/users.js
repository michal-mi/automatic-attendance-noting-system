const express = require('express');
const upload = require('express-fileupload');
const router = express.Router();
const users = require('../models/user');
const authentication = require("../models/authentication");
const { verifyRegexNameOrSurname, verifyRegexOptionalName, verifyRegexEmail, verifyRegexLecturerTitle, verifyRegexBirthDate } = require('../models/validation');

//---auxiliary functions---:
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
//------

/* GET all users */
router.get('/allUsers/', async function (req, res, next) {
  var msg = "Error while getting users"
  try {
    if (!authentication.authenticateWithRole([1, 2], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getAllUsers()
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* GET one user simple data by id - without pages. */
router.post('/oneUserDataByID/', async function (req, res, next) {
  var msg = "Error while getting one user data"
  try {
    //user can only get information about himself
    if (!authentication.authenticateWithRole([1, 2, 3], req.headers.authorization) && jwt.decode(req.headers.authorization).id === req.body.id) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getUserDataByUserID(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});
/* GET one user simple data by id - without pages. */
router.post('/oneStudentDataByIDAndroid/', async function (req, res, next) {
  var msg = "Error while getting one user data"
  try {
    //user can only get information about himself
    if (!authentication.authenticateWithRole([4], req.headers.authorization) && jwt.decode(req.headers.authorization).id === req.body.id) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getStudentDataByUserIDAndroid(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});
router.post('/oneLecturerDataByIDAndroid/', async function (req, res, next) {
  var msg = "Error while getting one user data"
  try {
    //user can only get information about himself
    if (!authentication.authenticateWithRole([3], req.headers.authorization) && jwt.decode(req.headers.authorization).id === req.body.id) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getLecturerDataByUserIDAndroid(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});
/* GET one user data with group by id - without pages. */
router.post('/oneUserDataByIDForEditing/', async function (req, res, next) {
  var msg = "Error while getting user data with group"
  try {
    //user can only get information about himself
    if (!authentication.authenticateWithRole([1, 2], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getUserDataByUserIDForEditing(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* GET one user hashed password by id - without pages. */
router.post('/oneUserPasswordByID/', async function (req, res, next) {
  var msg = "Error while getting user hashed password"
  try {
    //user can only get his password
    if (!authentication.authenticateWithRole([1, 2, 3], req.headers.authorization) && jwt.decode(req.headers.authorization).id === req.body.id) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getUserHashedPaswordByUserID(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* CHANGE user hashed password by id */
router.post('/changeOneUserPasswordByID/', async function (req, res, next) {
  var msg = "Error while posting user new hashed password"
  try {
    //user can only change his password
    if (!authentication.authenticateWithRole([1, 2, 3], req.headers.authorization)
      && jwt.decode(req.headers.authorization).id === req.body.id) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.changeUserHashedPaswordByUserID(req.body.id,
        req.body.oldPassword, req.body.newPassword)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* CHANGE user avatar reference by id */
router.post('/changeOneUserAvatarReferenceByID/', async function (req, res, next) {
  var msg = "Error while uploading/changing user avatar"
  try {
    //user can only change his avatar
    if (!authentication.authenticateWithRole([1, 2, 3], req.headers.authorization) && jwt.decode(req.headers.authorization).id === req.body.id) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.changeUserAvatarReferenceByUserID(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

router.use(upload())
/* UPLOAD user avatar by id */
router.post("/changeOneUserAvatarByID/", (req, res, next) => {
  var msg = "Error while uploading user avatar"
  try {
    //user can only change his avatar
    if (!authentication.authenticateWithRole([1, 2, 3], req.headers.authorization) && jwt.decode(req.headers.authorization).id === req.body.id) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = users.changeUserAvatarByUserID(req.files.file)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

/* DELETE user avatar reference by id */
router.post('/deleteOneUserAvatarReferenceByID/', async function (req, res, next) {
  var msg = "Error while deleting users avatar reference"
  try {
    //user can only delete his avatar
    if (!authentication.authenticateWithRole([1, 2, 3], req.headers.authorization) && jwt.decode(req.headers.authorization).id === req.body.id) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.deleteUserAvatarReferenceByUserID(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* DELETE user avatar by id */
router.post("/deleteOneUserAvatarByID/", (req, res, next) => {
  var msg = "Error while deleting users avatar"
  try {
    //user can only delete his avatar
    if (!authentication.authenticateWithRole([1, 2, 3], req.headers.authorization) && jwt.decode(req.headers.authorization).id === req.body.id) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = users.deleteUserAvatarByUserID(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

/* SEND user link to change password */
//WITHOUT AUTH!
router.post("/initiatePasswordChange/", async function(req, res, next) {
  var msg = "Error while initiating password change. Try once more!"
  try {
    var data = await users.sendLinkToChangeUserPassword(req.body.email)
    res.status(200).send(data)
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

/* CHANGE user password from link */
//WITHOUT AUTH!
router.post("/newPasswordRecovery/", async function (req, res, next) {
  var msg = "Error while recovering password. Try once more!"
  try {
    var data = await users.createNewPasswordRecovery(req.body.user_id, req.body.password, req.body.change_pswd_link)
    res.status(200).send(data)
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

/* CHECK if link is active */
//WITHOUT AUTH!
router.post("/checkLink/", async function (req, res, next) {
  var msg = "Error while checking link"
  try {
    var data = await users.checkLink(req.body.user_id, req.body.change_pswd_link)
    if (data) {
      res.status(200).send(data)
    } else {
      res.status(400).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

/* CREATE user */
router.post("/createUser/", async function (req, res, next) {
  var msg = "Error while creating user"
  try {
    if (!authentication.authenticateWithRole([1, 2], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      switch(true) {
        case (!verifyRegexNameOrSurname(req.body.first_name)):
          res.status(403).send(msg + " - name is invalid!"); break
        case (!verifyRegexOptionalName(req.body.second_name)):
          res.status(403).send(msg + " - second name is invalid!"); break
        case (!verifyRegexNameOrSurname(req.body.surname)):
          res.status(403).send(msg + " - surname is invalid!"); break
        case (!verifyRegexEmail(req.body.e_mail)):
          res.status(403).send(msg + " - e-mail is invalid!"); break
        case (req.body.facility_id === "" || req.body.facility_id === undefined):
          res.status(403).send(msg + " - facility id is invalid!"); break
        case (req.body.role_id === "" || req.body.role_id === undefined):
          res.status(403).send(msg + " - role id is invalid!"); break
        case (req.body.role_id === 3 && !verifyRegexLecturerTitle(req.body.title)):
          res.status(403).send(msg + " - lecturer title is invalid!"); break
        case (req.body.role_id === 4 && !verifyRegexBirthDate(req.body.birth_date)):
          res.status(403).send(msg + " - birth date is invalid!"); break
        default:
          console.log(req.body.birth_date)
          var data = await users.createNewUser(req.body.facility_id, req.body.role_id, req.body.first_name, req.body.second_name, req.body.surname, req.body.e_mail, req.body.title, req.body.birth_date, req.body.group_id)
          res.status(200).send(data); break
      }
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

/* CREATE users */
router.post("/createUsers/", async function (req, res, next) {
  var msg = "Error while creating users"
  try {
    if (!authentication.authenticateWithRole([1, 2], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      const usersArray = req.body
      async function addUsr() {
        for (var i = 0; i < usersArray.length; i++) {
          users.createNewUser(usersArray[i].facility_id, usersArray[i].role_id, usersArray[i].first_name, usersArray[i].second_name, usersArray[i].surname, usersArray[i].e_mail, usersArray[i].title, usersArray[i].birth_date, usersArray[i].group_id);
          await sleep(1500)
        }
      }
      addUsr()
      res.status(200).send();
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

/* SEARCH user from user enitity using different data (for users list view)*/
router.post('/searchUsers/', async function (req, res, next) {
  var msg = "Error while searching users"
  try {
    if (!authentication.authenticateWithRole([1, 2], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.searchUsers(req.body.user_role, req.body.id, req.body.user_surname, req.body.user_facility, req.body.user_group)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* SEARCH user from user enitity using different data 2 (for assign user to group view)*/
router.post('/searchUsers2/', async function (req, res, next) {
  var msg = "Error while searching users 2"
  try {
    if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.searchUsers2(req.body.user_role, req.body.facility_id, req.body.id, req.body.user_surname, req.body.birth_year)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* EDIT user */
router.post("/editUser/", async function (req, res, next) {
  var msg = "Error while editing user"
  try {
    if (!authentication.authenticateWithRole([1, 2], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      switch(true) {
        case (!verifyRegexNameOrSurname(req.body.first_name)):
          res.status(403).send(msg + " - name is invalid!"); break
        case (!verifyRegexOptionalName(req.body.second_name)):
          res.status(403).send(msg + " - second name is invalid!"); break
        case (!verifyRegexNameOrSurname(req.body.surname)):
          res.status(403).send(msg + " - surname is invalid!"); break
        case (!verifyRegexEmail(req.body.e_mail)):
          res.status(403).send(msg + " - e-mail is invalid!"); break
        case (req.body.facility_id === "" || req.body.facility_id === undefined):
          res.status(403).send(msg + " - facility id is invalid!"); break
        case (req.body.role_id === "" || req.body.role_id === undefined):
          res.status(403).send(msg + " - role id is invalid!"); break
        case (req.body.role_id === 3 && !verifyRegexLecturerTitle(req.body.title)):
          res.status(403).send(msg + " - lecturer title is invalid!"); break
        case (req.body.role_id === 4 && !verifyRegexBirthDate(req.body.birth_date)):
          res.status(403).send(msg + " - birth date is invalid!"); break
        default:
          var data = users.editUser(req.body.id, req.body.facility_id, req.body.first_name, req.body.second_name, req.body.surname, req.body.e_mail, req.body.title, req.body.birth_date, req.body.role_id, req.body.group_id)
          res.status(200).send(data); break
      }
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

/* DELETE user by id */
router.post("/deleteUser/", async function (req, res, next) {
  var msg = "Error while deleting user"
  try {
    if (!authentication.authenticateWithRole([1, 2], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.deleteUser(req.body.id, req.body.role_id, req.body.facility_id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

/* DELETE user from the group by id */
router.post("/deleteUserFromGroup/", async function (req, res, next) {
  var msg = "Error while deleting user from group"
  try {
    if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.deleteUserFromGroup(req.body.id, req.body.group_id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

router.post("/getManyUsersDataByID/", async function (req, res, next) {
  var msg = "Error while getting user data by ids"
  console.log(req.body.id_array)
  try {
    if (!authentication.authenticateWithRole([1, 2], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getManyUsersDataByID(req.body.id_array)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
})

/* GET all users from group */
router.post('/getAllStudentsFromGroup/', async function (req, res, next) {
  var msg = "Error while getting all students from group"
  try {
    if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getAllStudentsFromGroup(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* GET all users from facility */
router.post('/getAllStudentsFromFacility/', async function (req, res, next) {
  var msg = "Error while getting all students from facility"
  try {
    if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getAllStudentsFromFacility(req.body.id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* GET all lecturers from facility */
router.post('/getAllLecturersFromFacility/', async function (req, res, next) {
  var msg = "Error while getting all lecturers from facility"
  try {
    if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getAllLecturersFromFacility(req.body.facility_id)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* GET all lecturers schedule for the facility on specific days */
router.post('/lecturerScheduleForFacilityOnSpecificDays/', async function (req, res, next) {
  var msg = "Error while getting lecturers schedules for facility on specific days"
  try {
    if (!authentication.authenticateWithRole(2, req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.lecturerScheduleForFacilityOnSpecificDays(req.body.facility_id, req.body.days)
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});

/* GET all lecturers schedule for the facility on specific days */
router.get('/getAllEmails/', async function (req, res, next) {
  var msg = "Error while getting all user's emails"
  try {
    if (!authentication.authenticateWithRole([1,2], req.headers.authorization)) {
      res.status(401).send(msg + " - user was not authorized")
    } else {
      var data = await users.getAllEmails()
      res.status(200).send(data)
    }
  } catch (err) {
    res.status(500).send(msg)
    console.error(msg, err.message);
    next(err);
  }
});


module.exports = router;