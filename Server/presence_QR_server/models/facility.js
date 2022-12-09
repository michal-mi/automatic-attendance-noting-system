const db = require('./db');

async function getAllFacilities() {
  const data = await db.query(
    `SELECT  id, facility_name, facility_logo, facility_status
    FROM facility`)
  return data
}

async function getAllFacilitiesNames() {
  const data = await db.query(
    `SELECT facility_name
    FROM facility`)
  return data
}

async function getOneFacilityDataByID(id) {
  const data = await db.query(
    `SELECT  id, facility_name, facility_logo, facility_status
    FROM facility
    WHERE id = "${id}"`)
  return data
}

async function getLastID() {
  const data = await db.query(
    `SELECT MAX( id ) AS id FROM facility;`)
  return data
}

async function createNewFacility(data) {
  if (data.id === undefined) {
    var id = await getLastID()
    id = id[0].id + 1
    await db.query(
      `INSERT INTO facility (id, facility_name, facility_status, facility_logo) VALUES (${id}, "${data.facility_name}","${data.facility_status}","${data.facility_logo}")`
    )
    await db.query(
      `INSERT INTO user (facility_id, role_id, first_name, second_name, surname, e_mail, hash_password, avatar, title, birth_date, change_pswd_link, link_time)
      VALUES (${id}, 3, "Brak", "", "Prowadzącego", ${id}, ${id}, "", "", "", "", "")`
    )
    await db.query(
      `INSERT INTO classroom (facility_id, classroom_name, QR_code, classroom_description, gps_x, gps_y)
       VALUES (${id}, "Brak sali", "0000", "", "1.11111", "1.11111")`
    )
      
  } else {
    await db.query(
      `INSERT INTO facility (id, facility_name, facility_status, facility_logo) VALUES (${data.id} ,"${data.facility_name}","${data.facility_status}","${data.facility_logo}")`)
  }
  console.log("Facility " + data.name + " was created succesfully!")
  return true
}

async function changeFacilityLogo(image) {
  //set facility logo reference:
  await db.query(
    `UPDATE facility
     SET facility_logo = ${image.name}
     WHERE id = "${image.name}"`)
  let filePath = './rescources/logos/' + image.name + '.png'
  const fs = require('fs')
  //verify that logo exists:
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath) //delete logo file from server
  }
  fs.appendFile(filePath, image.data, (err) => { //add new logo file to server
    if (err) throw err;
  });
  console.log("Facility nr" + image.name + " logo was uploaded/changed")
};

async function changeFacilityShortLogo(image) {
  let filePath = './rescources/logos/' + image.name + '_short.png'
  const fs = require('fs')
  //checking if logo exist:
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
  fs.appendFile(filePath, image.data, (err) => {
    if (err) throw err;
  });
  console.log("Facility nr" + image.name + " short logo was uploaded/changed")
};

async function searchFacilities(id, facility_name, facility_status) {
  var data;
  var string_sql = `SELECT id, facility_status, facility_name, facility_logo FROM facility`;

  //when only status was provided:
  if (facility_name === "" && id === "") {
    console.log("Searching facilities by status only...")
    data = await db.query(string_sql + ` WHERE facility_status = "${facility_status}"`)
  }
  //when facility id and status were provided:
  else if (id !== "" && facility_name === "") {
    console.log("Searching facilities by facility name and status...")
    data = await db.query(string_sql + ` WHERE (facility_status= "${facility_status}" AND id = "${id}")`)
  }
  //when facility name and status were provided:
  else if (facility_name !== "" && id === "") {
    console.log("Searching facilities by facility id and status...")
    data = await db.query(string_sql + ` WHERE (facility_status= "${facility_status}" AND facility_name = "${facility_name}")`)
  }
  //when all informations were provided
  else if (facility_name !== "" && id !== "") {
    console.log("Searching facilities by facility name, id and status...")
    data = await db.query(string_sql + ` WHERE (facility_status= "${facility_status}" AND id = "${id}" AND facility_name = "${facility_name}")`)
  }
  return data
};

async function updateFacilityNameAndStatusByID(id, facility_name, facility_status) {
  await db.query(
    `UPDATE facility
     SET
      facility_name = "${facility_name}",
      facility_status = "${facility_status}"
     WHERE id = "${id}"`)
  console.log("Facility " + id + " name and status were succesfully changed")
}

async function deleteFacilityLogoReferenceByFacilityID(id) {
  await db.query(
    `UPDATE facility
     SET
      facility_logo = ""
     WHERE id = "${id}"`)
  console.log("Logo reference was deleted for facility " + id)
}

async function deleteFacilityLogoByFacilityID(id) {
  let fileName = id
  const fs = require('fs')
  fs.unlinkSync('./rescources/logos/' + fileName + '.png')
  fs.unlinkSync('./rescources/logos/' + fileName + '_short.png')
  console.log("Logos were deleted for facility " + id)
}


module.exports = {
  getAllFacilities,
  getAllFacilitiesNames,
  getOneFacilityDataByID,
  getLastID,
  createNewFacility,
  changeFacilityLogo,
  changeFacilityShortLogo,
  searchFacilities,
  updateFacilityNameAndStatusByID,
  deleteFacilityLogoReferenceByFacilityID,
  deleteFacilityLogoByFacilityID
}