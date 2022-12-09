import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs";

const AddClasses = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")
    var today = new Date()
    var tomorrow = new Date(today.setDate(today.getDate() + 1)).toISOString().slice(0, 10);

    const { t } = useTranslation();
    const config = {
        headers: { Authorization: `${sessionStorage.getItem("token")}` }
    };

    //stores all subjects, classrooms, lecturers and groups from facility:
    const [allSubjects, setAllSubjects] = useState([])
    const [allClassrooms, setAllClasrooms] = useState([])
    const [availableClassrooms, setAvailableClasrooms] = useState([])
    const [allLecturers, setAllLecturers] = useState([])
    const [availableLecturers, setAvailableLecturers] = useState([])
    const [allGroups, setAllGroups] = useState([])

    //stores all values ​​from the form:
    const [subject, setSubject] = useState("")
    const [classroom, setClassroom] = useState("")
    const [lecturer, setLecturer] = useState("")
    const [group, setGroup] = useState("")
    const [dayOfWeek, setDayOfWeek] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endingTime, setEndingTime] = useState("")

    const [groupCalendar, setGroupCalendar] = useState([])
    const [facilityCalendar, setFacilityCalendar] = useState([])
    const [button1WasClicked, setButton1WasClicked] = useState(false)
    const [datesOfClasses, setDatesOfClasses] = useState([])
    const [availableClassStartHours, setAvailableClassStartHours] = useState([])
    const [startHourWasProvided, setStartHourWasProvided] = useState(false)
    const [forbiddenHours, setForbiddenHours] = useState([])
    const [availableClassEndHours, setAvailableClassEndHours] = useState([])

    const [error, setError] = useState("")

    const handleLogout = () => {
        sessionStorage.removeItem("token")
        window.location.reload()
    }

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    function displayShortFacilityLogo() {
        return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
    }

    // async function handleSubmit(event) {
    const handleSubmit = async (e) => {
        //get day_id from all days in datesOfClasses:
        var dayIDArray = []
        for (var i = 0; i < datesOfClasses.length; i++) {
            for (var j = 0; j < facilityCalendar.length; j++) {
                if (datesOfClasses[i] === facilityCalendar[j].date) {
                    dayIDArray.push(facilityCalendar[j].id)
                }
            }
        }
        //add days to day entity:
        const addClasses = async (e) => {
            try {
                let dataToSend = { IDs_of_days: dayIDArray, classroom_id: classroom, subject_id: subject, lecturer_id: lecturer, group_id: group, beginning_time: startTime, ending_time: endingTime, day_of_week: dayOfWeek, beginning_date: startDate, end_date: endDate }
                var url = 'http://localhost:8080/classes/addClasses/'
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Zajęcia zostały dodane!", icon: "success" });
                window.location.reload(true)
            } catch (err) {
                swal("Błąd...", "Nie udało dodać zajęć!", "error");
            }
        }
        addClasses()
        e.preventDefault()
    }

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        setRole(decodedJWT.user_role)

        //fetch facility data:
        const fetchAndSetFacilityLogo = async () => {
            try {
                var dataToSend = { id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/facilities/getOneFacilityDataByID/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setFacilityID(decodedJWT.facility_id)
                setFacilityShortLogoLink('http://localhost:8080/logos/' + res[0].facility_logo + '_short.png')
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetFacilityLogo()

        //fetch and set all subjects from facility:
        const fetchAndSetSubjectsFromFacility = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/subjects/getAllSubjectsFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllSubjects(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetSubjectsFromFacility()

        //fetch and set all groups from facility:
        const fetchAndSetGroupsFromFacility = async () => {
            try {
                var dataToSend = { id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/groups/getAllGroupsFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllGroups(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetGroupsFromFacility()

        //fetch and set all classrooms from user's facility:
        const fetchAndSetAllClassroomsFromFacility = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/classrooms/getAllClassroomsFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllClasrooms(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetAllClassroomsFromFacility()

        //fetch and set all lecturers from user's facility:
        const fetchAndSetAllLecturersFromFacility = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/users/getAllLecturersFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllLecturers(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetAllLecturersFromFacility()

        //fetch and set calendar for facility:
        const fetchAndSetCalendarForFacility = async () => {
            var res
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/days/getWholeCalendarForFacility/'
                res = await axios.post(url, dataToSend, config)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            res = res.data
            //correct received calendar:
            var day = 60 * 60 * 24 * 1000;
            for (var i = 0; i < res.length; i++) {
                var date = new Date(res[i].date)
                res[i].date = new Date(date.getTime() + (1 * day)).toISOString().slice(0, 10)
            }
            setFacilityCalendar(res)
            setLoading(false)
        }
        fetchAndSetCalendarForFacility()
    }, []);

    async function getDatesAndTime(e) {
        //get information from db when group has classes
        const getDatesAndTimeForGroup = async () => {
            var res
            try {
                var dataToSend = { group_id: e }
                var url = 'http://localhost:8080/groups/getDatesAndTime/'
                res = await axios.post(url, dataToSend, config)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            res = res.data
            //correct received calendar:
            var day = 60 * 60 * 24 * 1000;
            for (var i = 0; i < res.length; i++) {
                var date = new Date(res[i].date)
                res[i].date = new Date(date.getTime() + (1 * day)).toISOString().slice(0, 10)
            }
            setGroupCalendar(res)
        }
        getDatesAndTimeForGroup()
    }

    async function prepareAvailableStartingTimes(e) {
        //reset values when button is clicked:
        setError("")
        setAvailableClassStartHours([])
        setForbiddenHours([])
        //check if the start date is not after the end date:
        if (endDate === "" || (Date.parse(startDate) <= Date.parse(endDate))) {
            //calculates the hours when classes can start:
            if (dayOfWeek !== "" && startDate !== "" && endDate !== "") {
                //create array with dates when classes would take place:
                setButton1WasClicked(true)
                var day = 60 * 60 * 24 * 1000;
                var dates = []
                for (var i = new Date(startDate); i <= new Date(endDate); i = new Date(i.getTime() + (1 * day))) {
                    if (i.getDay() === Number(dayOfWeek)) {
                        var thisDayWasAdded = false
                        for (var j = 0; j < facilityCalendar.length; j++) {
                            if (i.toISOString().slice(0, 10) === facilityCalendar[j].date.slice(0, 10) && facilityCalendar[j].is_free === 0 && !thisDayWasAdded) {
                                dates.push(i.toISOString().slice(0, 10))
                                thisDayWasAdded = true
                            }
                        }
                    }
                }
            }
            setDatesOfClasses(dates)
            //checking if the calendar of the facility is allowing to add at least one class:
            if (dates.length !== 0) {
                //create a table of the hours when the group is busy (the group schedule is taken into account):
                var forbiddenHours = []
                for (i = 0; i < dates.length; i++) {
                    for (j = 0; j < groupCalendar.length; j++) {
                        //if group already has classes in the day to which we want to add new classes:
                        if (dates[i] === groupCalendar[j].date.slice(0, 10)) {
                            //prevents adding the same time slot multiple times to forbidden hours:
                            var itWasAddedBefore = false
                            for (var k = 0; k < forbiddenHours.length; k++) {
                                if (groupCalendar[j].beginning_time === forbiddenHours[k].begTime && groupCalendar[j].ending_time === forbiddenHours[k].endTime) {
                                    itWasAddedBefore = true
                                }
                            }
                            if (!itWasAddedBefore) {
                                //add time slot to forbidden hours array:
                                forbiddenHours.push({ begTime: groupCalendar[j].beginning_time, endTime: groupCalendar[j].ending_time })
                            }
                        }
                    }
                    if (groupCalendar.length === 0) {
                        forbiddenHours = []
                    }
                }

                var forbidden = new Set()
                for (var z = 0; z < forbiddenHours.length; z++) {
                    //find out how many quarters of an hour does the lesson take:
                    var hoursBegin = Number(forbiddenHours[z].begTime.slice(0, 2))
                    var minutesBegin = Number(forbiddenHours[z].begTime.slice(3, 5))
                    var hoursEnd = Number(forbiddenHours[z].endTime.slice(0, 2))
                    var minutesEnd = Number(forbiddenHours[z].endTime.slice(3, 5))
                    var minutesBetween = ((hoursEnd * 60) + minutesEnd) - ((hoursBegin * 60) + minutesBegin)
                    var quarter = minutesBetween / 15
                    for (var x = 0; x <= quarter; x++) {
                        var hourInMinutes = (hoursBegin * 60) + minutesBegin
                        hourInMinutes += x * 15
                        var hours1 = Math.floor(hourInMinutes / 60)
                        var minutes1 = (hourInMinutes % 60)
                        hours1 = hours1.toString().padStart(2, '0')
                        minutes1 = minutes1.toString().padStart(2, '0')
                        forbidden.add(hours1 + ":" + minutes1 + ":00")
                    }
                }
                setForbiddenHours(forbidden)

                var tempAvailableHours = []
                for (var l = 0; l < 96; l++) {
                    var hours = Math.floor(l / 4)
                    var minutes = (l % 4) * 15
                    hours = hours.toString().padStart(2, '0')
                    minutes = minutes.toString().padStart(2, '0')
                    var itIsForbiddenTimestamp = false
                    for (const entry of forbidden) {
                        if (hours + ":" + minutes + ":00" === entry) {
                            itIsForbiddenTimestamp = true
                        }
                    }
                    if (!itIsForbiddenTimestamp) {
                        tempAvailableHours.push(hours + ":" + minutes + ":00")
                    }
                }
                setAvailableClassStartHours(tempAvailableHours)
            } else {
                setError("Kalendarz placówki nie pozwala dodać ani jednych zajęć w podanym okresie")
            }
        } else {
            setError("Data rozpoczęcia nie może być poźniejsza niż data zakończenia")
        }
    }

    async function prepareAvailableEndingTimes(e) {
        //clear variables:
        var tempAvailableHours = []
        setError("")
        // var startHours = availableClassStartHours
        var begTimeHours = Number(e.slice(0, 2))
        var begTimeMinutes = Number(e.slice(3, 5))
        var begTimeHoursMinutes = (begTimeHours * 60) + begTimeMinutes
        for (var i = begTimeHoursMinutes + 15; i < 24 * 60; i += 15) {
            var hours = Math.floor(i / 60)
            var minutes = i % 60
            hours = hours.toString().padStart(2, '0')
            minutes = minutes.toString().padStart(2, '0')
            tempAvailableHours.push(hours + ":" + minutes + ":00")
        }

        var tempAvailableHoursFinal = []
        var enough = false
        console.log(forbiddenHours)
        if (forbiddenHours.size === 0) {
            tempAvailableHoursFinal = tempAvailableHours
        }
        for (var j = 0; j < tempAvailableHours.length; j++) {
            var firstForbiddenIsAvailable = 0
            for (const entry of forbiddenHours) {
                if (entry === tempAvailableHours[j] && firstForbiddenIsAvailable === 0) {
                    tempAvailableHoursFinal.push(tempAvailableHours[j])
                    enough = true
                    break;
                }
                if (enough) {
                    break;
                }
                if (entry !== tempAvailableHours[j]) {
                    tempAvailableHoursFinal.push(tempAvailableHours[j])
                }
                firstForbiddenIsAvailable++
            }
        }
        tempAvailableHoursFinal = [...new Set(tempAvailableHoursFinal)]
        if (tempAvailableHoursFinal.length !== 0) {
            setAvailableClassEndHours(tempAvailableHoursFinal)
            setStartHourWasProvided(true)
        } else {
            setError("Brak możliwości ustawienia godziny zakończenia zajęć!")
        }
    }

    async function findAvailableClassroomsAndLecturers(e) {
        //CLASSROOM AND SHARED SECTION:
        //get schedule of classes for classrooms that have classes on the days when the added classes will take place:
        const getAllClassroomSchedule = async () => {
            var res
            try {
                var dataToSend = { facility_id: facilityID, days: datesOfClasses }
                var url = 'http://localhost:8080/classrooms/classroomsScheduleForFacilityOnSpecificDays/'
                res = await axios.post(url, dataToSend, config)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            res = res.data
            //correct received calendar:
            var day = 60 * 60 * 24 * 1000;
            for (var i = 0; i < res.length; i++) {
                var date = new Date(res[i].date)
                res[i].date = new Date(date.getTime() + (1 * day)).toISOString().slice(0, 10)
            }
            return res
        }
        var classroomsCalendar = await getAllClassroomSchedule()

        //calculate for each classes hours it takes:
        var classroomsIDsSet = new Set()
        for (var i = 0; i < classroomsCalendar.length; i++) {
            classroomsIDsSet.add(classroomsCalendar[i].classroom_id)
            var hoursBegin = Number(classroomsCalendar[i].beginning_time.slice(0, 2))
            var minutesBegin = Number(classroomsCalendar[i].beginning_time.slice(3, 5))
            var hoursEnd = Number(classroomsCalendar[i].ending_time.slice(0, 2))
            var minutesEnd = Number(classroomsCalendar[i].ending_time.slice(3, 5))
            var hoursMinutesBegin = (hoursBegin * 60) + minutesBegin
            var hoursMinutesEnd = (hoursEnd * 60) + minutesEnd
            classroomsCalendar[i].beginning_time = []
            classroomsCalendar[i].ending_time = []
            for (var j = 0; j < 24 * 60; j += 15) {
                if (j >= hoursMinutesBegin && j <= hoursMinutesEnd) {
                    var hours = Math.floor(j / 60)
                    var minutes = j % 60
                    hours = hours.toString().padStart(2, '0')
                    minutes = minutes.toString().padStart(2, '0')
                    classroomsCalendar[i].beginning_time.push(hours + ":" + minutes + ":00")
                }
            }
        }

        //fetch and set all classrooms from user's facility:
        var allClassroomsTemp = []
        const fetchAndSetAllClassroomsFromFacility = async () => {
            var res
            try {
                var dataToSend = { facility_id: facilityID }
                var url = 'http://localhost:8080/classrooms/getAllClassroomsFromFacility/'
                res = await axios.post(url, dataToSend, config)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            res = res.data
            for (var i = 0; i < res.length; i++) {
                res[i] = res[i].id
            }
            return res
        }
        allClassroomsTemp = await fetchAndSetAllClassroomsFromFacility()
        const classroomIDs = Array.from(classroomsIDsSet);
        //get classrooms that will NOT have classes on the days when the added classes will take place (therefore there is no need to check them):
        var freeClassrooms = allClassroomsTemp.filter((el) => !classroomIDs.includes(el));

        //calculate the time of the lesson to be added after submit:
        var lessonTime = []
        hoursBegin = Number(startTime.slice(0, 2))
        minutesBegin = Number(startTime.slice(3, 5))
        hoursEnd = Number(e.slice(0, 2))
        minutesEnd = Number(e.slice(3, 5))
        hoursMinutesBegin = (hoursBegin * 60) + minutesBegin
        hoursMinutesEnd = (hoursEnd * 60) + minutesEnd
        for (i = hoursMinutesBegin; i <= hoursMinutesEnd; i += 15) {
            hours = Math.floor(i / 60)
            minutes = i % 60
            hours = hours.toString().padStart(2, '0')
            minutes = minutes.toString().padStart(2, '0')
            lessonTime.push(hours + ":" + minutes + ":00")
        }

        //check if classroom is free at the time of the lesson to be added after submit:
        for (const entry of classroomsIDsSet) {
            var thisClassroomIsFreeAtChosenHours = true
            for (i = 0; i < classroomsCalendar.length; i++) {
                if (entry === classroomsCalendar[i].classroom_id) {
                    for (var k = 0; k < lessonTime.length; k++) {
                        for (j = 0; j < classroomsCalendar[i].beginning_time.length; j++) {
                            if (lessonTime[k] === classroomsCalendar[i].beginning_time[j]) {
                                thisClassroomIsFreeAtChosenHours = false
                            }
                        }
                    }
                }
            }
            if (thisClassroomIsFreeAtChosenHours) {
                freeClassrooms.push(entry)
            }
        }

        //assign classrooms names to classrooms ids:
        for (i = 0; i < freeClassrooms.length; i++) {
            for (j = 0; j < allClassrooms.length; j++) {
                if (allClassrooms[j].id === freeClassrooms[i]) {
                    freeClassrooms[i] = { id: freeClassrooms[i], classroom_name: allClassrooms[j].classroom_name }
                }
            }
        }
        setAvailableClasrooms(freeClassrooms)


        //LECTURER SECTION:
        //get schedule of classes for lecturers that have classes planned on the days when the added classes will take place:
        const getAllLecturersSchedule = async () => {
            var res
            try {
                var dataToSend = { facility_id: facilityID, days: datesOfClasses }
                var url = 'http://localhost:8080/users/lecturerScheduleForFacilityOnSpecificDays/'
                res = await axios.post(url, dataToSend, config)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            res = res.data
            //correct received calendar:
            var day = 60 * 60 * 24 * 1000;
            for (var i = 0; i < res.length; i++) {
                var date = new Date(res[i].date)
                res[i].date = new Date(date.getTime() + (1 * day)).toISOString().slice(0, 10)
            }
            return res
        }
        var lecturersCalendar = await getAllLecturersSchedule()

        //calculate for each lecturers lesson hours it takes:
        var lecturersIDsSet = new Set()
        for (i = 0; i < lecturersCalendar.length; i++) {
            lecturersIDsSet.add(lecturersCalendar[i].lecturer_id)
            hoursBegin = Number(lecturersCalendar[i].beginning_time.slice(0, 2))
            minutesBegin = Number(lecturersCalendar[i].beginning_time.slice(3, 5))
            hoursEnd = Number(lecturersCalendar[i].ending_time.slice(0, 2))
            minutesEnd = Number(lecturersCalendar[i].ending_time.slice(3, 5))
            hoursMinutesBegin = (hoursBegin * 60) + minutesBegin
            hoursMinutesEnd = (hoursEnd * 60) + minutesEnd
            lecturersCalendar[i].beginning_time = []
            lecturersCalendar[i].ending_time = []
            for (j = 0; j < 24 * 60; j += 15) {
                if (j >= hoursMinutesBegin && j <= hoursMinutesEnd) {
                    hours = Math.floor(j / 60)
                    minutes = j % 60
                    hours = hours.toString().padStart(2, '0')
                    minutes = minutes.toString().padStart(2, '0')
                    lecturersCalendar[i].beginning_time.push(hours + ":" + minutes + ":00")
                }
            }
        }

        //fetch and set all lecturers from user's facility:
        var allLecturersTemp = []
        const fetchAndSetAllLecturersFromFacility = async () => {
            var res
            try {
                var dataToSend = { facility_id: facilityID }
                var url = 'http://localhost:8080/users/getAllLecturersFromFacility/'
                res = await axios.post(url, dataToSend, config)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            res = res.data
            for (var i = 0; i < res.length; i++) {
                res[i] = res[i].id
            }
            return res
        }
        allLecturersTemp = await fetchAndSetAllLecturersFromFacility()
        const lecturersIDs = Array.from(lecturersIDsSet);
        //get lecturers that will NOT have classes on the days when the added classes will take place (therefore there is no need to check them):
        var freeLecturers = allLecturersTemp.filter((el) => !lecturersIDs.includes(el));

        //check if classroom is free at the time of the lesson to be added after submit:
        for (const entry of lecturersIDsSet) {
            var thisLecturerIsFreeAtChosenHours = true
            for (i = 0; i < lecturersCalendar.length; i++) {
                if (entry === lecturersCalendar[i].lecturer_id) {
                    for (k = 0; k < lessonTime.length; k++) {
                        for (j = 0; j < lecturersCalendar[i].beginning_time.length; j++) {
                            if (lessonTime[k] === lecturersCalendar[i].beginning_time[j]) {
                                thisLecturerIsFreeAtChosenHours = false
                            }
                        }
                    }
                }
            }
            if (thisLecturerIsFreeAtChosenHours) {
                freeLecturers.push(entry)
            }
        }

        //assign classrooms names to classrooms ids:
        for (i = 0; i < freeLecturers.length; i++) {
            for (j = 0; j < allLecturers.length; j++) {
                if (allLecturers[j].id === freeLecturers[i]) {
                    freeLecturers[i] = { id: freeLecturers[i], first_name: allLecturers[j].first_name, surname: allLecturers[j].surname, title: allLecturers[j].title }
                }
            }
        }
        setAvailableLecturers(freeLecturers)

    }

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <table>
                    <tr className={styles.one_line}>
                        <td className={styles.one_element} colspan={3}>
                            <div className={styles.label}> Najpierw wybierz grupę by zobaczyć terminy kiedy ta grupa nie ma zajęć. Wybierz również przedmiot: </div>
                        </td>
                    </tr>
                    <tr className={styles.one_line}>
                        <td className={styles.one_element}>
                            <div className={styles.label}> Wybierz grupę* </div>
                            <select name="group" id="group" className={styles.radio_input} onChange={e => { setGroup(e.target.value); getDatesAndTime(e.target.value) }} required>
                                <option disabled selected value> -- wybierz grupę -- </option>
                                {allGroups.map((entry, key) => (
                                    entry.id !== null ?
                                        <option value={entry.id}>{entry.group_name}</option>
                                        :
                                        <div>Błąd ładowania grup lub brak grup!</div>
                                ))}
                            </select>
                        </td>
                        <td className={styles.one_element} colSpan={2}>
                            <div className={styles.label}> Wybierz przedmiot* </div>
                            <select name="subject" id="subject" className={styles.radio_input} onChange={e => setSubject(e.target.value)} required>
                                <option disabled selected value> -- wybierz przedmiot -- </option>
                                {allSubjects.map((entry, key) => (
                                    entry.id !== null ?
                                        <option value={entry.id}>{entry.subject_name}</option>
                                        :
                                        <div>Błąd ładowania przedmiotów lub brak dostępnych przedmiotów!</div>
                                ))}
                            </select>
                        </td>
                    </tr>
                    {(group !== "" && subject !== "") ?
                        <tr className={styles.one_line}>
                            <td className={styles.one_element} colspan={3}>
                                <div className={styles.label}> Teraz wybierz daty w jakich mają odbywać się zajęcia by zobaczyć wolne godziny dla grupy: </div>
                            </td>
                        </tr>
                        :
                        <tr></tr>
                    }
                    {(group !== "" && subject !== "") ?
                        <tr className={styles.one_line}>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Wybierz dzień tygodnia* </div>
                                <select name="dayOfTheWeek" id="dayOfTheWeek" className={styles.radio_input} onChange={e => setDayOfWeek(e.target.value)} required>
                                    <option disabled selected value> -- wybierz dzień -- </option>
                                    <option value={1} >Poniedziałek</option>
                                    <option value={2} >Wtorek</option>
                                    <option value={3} >Środa</option>
                                    <option value={4} >Czwartek</option>
                                    <option value={5} >Piątek</option>
                                    <option value={6} >Sobota</option>
                                    <option value={0} >Niedziela</option>
                                </select>
                            </td>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Wybierz datę rozpoczęcia* </div>
                                <input
                                    type="date"
                                    min={tomorrow}
                                    placeholder="Data rozpoczęcia"
                                    name="startDate"
                                    onChange={e => setStartDate(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </td>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Wybierz datę zakończenia* </div>
                                <input
                                    type="date"
                                    min={tomorrow}
                                    placeholder="Data zakończenia"
                                    name="endDate"
                                    onChange={e => setEndDate(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </td>
                        </tr>
                        :
                        <tr></tr>
                    }
                    {(group !== "" && subject !== "" && dayOfWeek !== "" && startDate !== "" && endDate !== "") ?
                        <tr className={styles.one_line}>
                            <td></td>
                            <td className={styles.one_element}>
                                <button type="button" className={styles.add_days_btn} onClick={e => prepareAvailableStartingTimes(e)}>
                                    Przejdź dalej
                                </button>
                            </td>
                            <td></td>
                        </tr>
                        :
                        <tr></tr>
                    }
                    {button1WasClicked ?
                        <tr className={styles.one_line}>
                            <td className={styles.one_element} colspan={3}>
                                <div className={styles.label}> Teraz wybierz godziny w jakich mają odbywać się zajęcia by zobaczyć dostępne sale i prowadzących: </div>
                            </td>
                        </tr>
                        :
                        <tr></tr>
                    }
                    {button1WasClicked ?
                        <tr className={styles.one_line}>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Podaj godzinę rozpoczęcia* </div>
                                <select name="startTime" id="startTime" className={styles.radio_input} onChange={e => { setStartTime(e.target.value); prepareAvailableEndingTimes(e.target.value) }} required>
                                    <option disabled selected value> -- wybierz godzinę -- </option>
                                    {availableClassStartHours.map((entry, key) => (
                                        entry.id !== null ?
                                            <option value={entry.id}>{entry}</option>
                                            :
                                            <div>Błąd ładowania godzin lub brak dostępnych godzin!</div>
                                    ))}
                                </select>
                            </td>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Podaj godzinę zakończenia* </div>
                                {startHourWasProvided ?
                                    <select name="endingTime" id="endingTime" className={styles.radio_input} onChange={e => { setEndingTime(e.target.value); findAvailableClassroomsAndLecturers(e.target.value) }} required>
                                        <option disabled selected value> -- wybierz godzinę -- </option>
                                        {availableClassEndHours.map((entry, key) => (
                                            entry.id !== null ?
                                                <option value={entry.id}>{entry}</option>
                                                :
                                                <div>Błąd ładowania godzin lub brak dostępnych godzin!</div>
                                        ))}
                                    </select>
                                    :
                                    <div>Najpierw podaj godzinę rozpoczęcia!</div>
                                }
                            </td>
                            <td className={styles.one_element}></td>
                        </tr>
                        :
                        <tr></tr>
                    }
                    {(button1WasClicked && dayOfWeek !== "" && startDate !== "" && endDate !== "" && startTime !== "" && endingTime !== "") ?
                        <tr className={styles.one_line}>
                            <td className={styles.one_element} colspan={3}>
                                <div className={styles.label}> Wybierz salę i prowadzącego z dostępnych poniżej: </div>
                            </td>
                        </tr>
                        :
                        <tr></tr>
                    }
                    {(button1WasClicked && dayOfWeek !== "" && startDate !== "" && endDate !== "" && startTime !== "" && endingTime !== "") ?
                        <tr className={styles.one_line}>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Wybierz salę* </div>
                                <select name="classroom" id="classroom" className={styles.radio_input} onChange={e => setClassroom(e.target.value)} required>
                                    <option disabled selected value> -- wybierz salę -- </option>
                                    {availableClassrooms.map((entry, key) => (
                                        entry.id !== null ?
                                            <option value={entry.id}>{entry.classroom_name}</option>
                                            :
                                            <div>Błąd ładowania sal lub brak wolnych sal!</div>
                                    ))}
                                </select>
                            </td>
                            <td className={styles.one_element} colSpan={2}>
                                <div className={styles.label}> Wybierz prowadzącego* </div>
                                <select name="lecturer" id="lecturer" className={styles.radio_input} onChange={e => setLecturer(e.target.value)} required>
                                    <option disabled selected value> -- wybierz prowadzącego -- </option>
                                    {availableLecturers.map((entry, key) => (
                                        entry.id !== null ?
                                            <option value={entry.id}>{entry.title + " " + entry.first_name + " " + entry.surname}</option>
                                            :
                                            <div>Błąd ładowania prowadzących lub brak wolnych prowadzących!</div>
                                    ))}
                                </select>
                            </td>
                        </tr>
                        :
                        <tr></tr>
                    }
                    <tr className={styles.one_line}>
                        <td></td>
                        {classroom !== "" && lecturer !== "" && error === "" ?
                            <td className={styles.one_element}>
                                <button type="button" className={styles.add_days_btn} onClick={e => handleSubmit(e)}>
                                    Utwórz
                                </button>
                            </td>
                            :
                            <td>Najpierw podaj wszystkie dane!</td>
                        }
                        <td className={styles.one_element}>
                            {error && <div className={styles.error_msg}>{error}</div>}
                        </td>
                    </tr>
                </table>
            </div >
        </div >
    }

    function displayRole() {
        if (role === 2) {
            return <div className={styles.role_box}>Zalogowano jako manager placówki</div>
        } else {
            return <div>Wystąpił błąd!!</div>
        }
    }

    return (
        <div className={styles.body_container}>
            {isLoading ?
                <div className={styles.loader}>
                    <Oval
                        height="150"
                        width="150"
                        color="#ff9742"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                        ariaLabel='oval-loading'
                        secondaryColor="#B1D2EC"
                        strokeWidth={2}
                        strokeWidthSecondary={2}
                    />
                </div>
                :
                <div className={styles.element_group}>
                    <div className={styles.navbar}>
                        <div className={styles.navbar_left}>
                            <Link to="/manageClassesMenu">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Dodawanie zajęć
                        </div>
                        <div className={styles.navbar_right}>
                            <button type="button" onClick={handleLogout} className={styles.navbar_button}>
                                <BsBoxArrowLeft />
                            </button>
                            <Link to="/myAccount" className={styles.navbar_button}>
                                <BsPersonCircle />
                            </Link>
                            <Link to="/settings" className={styles.navbar_button}>
                                <BsFillGearFill />
                            </Link>
                        </div>
                    </div>
                    {displayContent()}
                </div>
            }
            {displayRole()}
        </div>

    )
}
export default AddClasses