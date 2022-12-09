function verifyRegexFacilityName(facilityName) {
    let regex = new RegExp("^.{1,70}$")
    if(regex.test(facilityName)) {
        return true
    } else {
        return false
    }
}

function verifyRegexNameOrSurname(name) {
    let regex = new RegExp("^[A-ZŻŹĆĄŚĘŁÓŃ]{1}[a-zżźćńółęąś]{0,29}$")
    if(regex.test(name)) {
        return true
    } else {
        return false
    }
}

function verifyRegexOptionalName(name) {
    let regex = new RegExp("^[A-ZŻŹĆĄŚĘŁÓŃ]{1}[a-zżźćńółęąś]{0,29}$")
    if(regex.test(name) || name === "") {
        return true
    } else {
        return false
    }
}

function verifyRegexEmail(email) {
    let regex = new RegExp("^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$")
    if(regex.test(email)) {
        return true
    } else {
        return false
    }
}

function verifyRegexLecturerTitle(title) {
    let regex = new RegExp("^.{1,40}$")
    if(regex.test(title)) {
        return true
    } else {
        return false
    }
}

function verifyRegexBirthDate(date) {
    let regex = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}$")
    if(regex.test(date)) {
        return true
    } else {
        return false
    }
}

function verifyRegexClassroomName(name) {
    let regex = new RegExp("^.{1,15}$")
    if(regex.test(name)) {
        return true
    } else {
        console.log("NAME!!" + name)
        return false
    }
}

function verifyRegexClassroomGps(gps) {
    let regex = new RegExp("^[0-9]{1,3}\.[0-9]{5}$")
    if(regex.test(gps)) {
        return true
    } else {
        console.log("GPS!" + gps)
        return false
    }
}

function verifyRegexClassroomDescription(description) {
    let regex = new RegExp("^.{0,1000}$")
    if(regex.test(description) || description === "") {
        return true
    } else {
        console.log("DESC!!" + description)
        return false
    }
}

function verifyRegexGroupName(name) {
    let regex = new RegExp("^.{1,25}$")
    if(regex.test(name)) {
        return true
    } else {
        return false
    }
}

function verifyRegexGroupOrSubjectYear(year) {
    let regex = new RegExp("^[1-9]{1}$")
    if(regex.test(year)) {
        return true
    } else {
        return false
    }
}

function verifyRegexGroupOrSubjectSemester(semester) {
    let regex = new RegExp("^[1-9]{1}[0-9]?$")
    if(regex.test(semester)) {
        return true
    } else {
        return false
    }
}

function verifyRegexSubjectName(name) {
    let regex = new RegExp("^.{1,70}$")
    if(regex.test(name)) {
        return true
    } else {
        return false
    }
}

module.exports = {
    verifyRegexFacilityName,
    verifyRegexNameOrSurname,
    verifyRegexOptionalName,
    verifyRegexEmail,
    verifyRegexLecturerTitle,
    verifyRegexBirthDate,
    verifyRegexClassroomName,
    verifyRegexClassroomGps,
    verifyRegexClassroomDescription,
    verifyRegexGroupName,
    verifyRegexGroupOrSubjectYear,
    verifyRegexGroupOrSubjectSemester,
    verifyRegexSubjectName
}