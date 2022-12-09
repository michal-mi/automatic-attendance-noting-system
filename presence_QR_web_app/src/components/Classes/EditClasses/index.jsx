import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs";

const EditClasses = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    var classesID = Number(useParams().id);

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
    const [availableClassrooms, setAvailableClasrooms] = useState([])
    const [availableLecturers, setAvailableLecturers] = useState([])

    //stores all values ​​from the form:
    const [classesData, setClassesData] = useState("")
    const [classesCalendar, setClassesCalendar] = useState([])

    const [classroom, setClassroom] = useState("")
    const [lecturer, setLecturer] = useState("")

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

        //add days to day entity:
        const addClasses = async () => {
            try {
                let dataToSend = { id: classesData.id, classroom_id: classroom, lecturer_id: lecturer }
                console.log(dataToSend)
                var url = 'http://localhost:8080/classes/editClasses/'
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Zajęcia zostały zmodyfikowane!", icon: "success" });
                window.location.reload(true)
            } catch (err) {
                swal("Błąd...", "Nie udało się zmodyfikować zajęć!", "error");
            }
        }
        e.preventDefault()
        addClasses()
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
                setFacilityShortLogoLink('http://localhost:8080/logos/' + res[0].facility_logo + '_short.png')
                setFacilityID(decodedJWT.facility_id)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetFacilityLogo()

        const getData = async () => {
            //fetch classes data:
            const fetchAndSetClassData = async () => {
                try {
                    var dataToSend = { id: classesID }
                    var url = 'http://localhost:8080/classes/getClasses/'
                    const { data: res } = await axios.post(url, dataToSend, config)
                    setClassesData(res[0])
                    setLecturer(res[0].lecturer_id)
                    setClassroom(res[0].classroom_id)
                    switch (res[0].day_of_week) {
                        case 0: res[0].day_of_week = "Niedziela"; break;
                        case 1: res[0].day_of_week = "Poniedziałek"; break;
                        case 2: res[0].day_of_week = "Wtorek"; break;
                        case 3: res[0].day_of_week = "Środa"; break;
                        case 4: res[0].day_of_week = "Czwartek"; break;
                        case 5: res[0].day_of_week = "Piątek"; break;
                        default: res[0].day_of_week= "Sobota"; break;
                    }
                    return res[0]
                } catch (err) {
                    swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
                }
            }
            var classesDataTemp = await fetchAndSetClassData()

            //fetch and set all classrooms from user's facility:
            const fetchAndSetAllClassroomsFromFacility = async () => {
                try {
                    var dataToSend = { facility_id: decodedJWT.facility_id }
                    var url = 'http://localhost:8080/classrooms/getAllClassroomsFromFacility/'
                    const { data: res } = await axios.post(url, dataToSend, config)
                    return res
                } catch (err) {
                    swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
                }
            }
            var allClassroomsTemp = await fetchAndSetAllClassroomsFromFacility()

            //fetch and set all lecturers from user's facility:
            const fetchAndSetAllLecturersFromFacility = async () => {
                try {
                    var dataToSend = { facility_id: decodedJWT.facility_id }
                    var url = 'http://localhost:8080/users/getAllLecturersFromFacility/'
                    const { data: res } = await axios.post(url, dataToSend, config)
                    return res
                } catch (err) {
                    swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
                }
            }
            var allLecturersTemp = await fetchAndSetAllLecturersFromFacility()

            //fetch classes data:
            const fetchAndSetClassCalendar = async () => {
                try {
                    var dataToSend = { id: classesID }
                    var url = 'http://localhost:8080/classes/classesCalendar/'
                    const { data: res } = await axios.post(url, dataToSend, config)
                    setClassesCalendar(res)
                    return res
                } catch (err) {
                    swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
                }
            }
            var calendarTemp = await fetchAndSetClassCalendar()

            findAvailableClassroomsAndLecturers(calendarTemp, allClassroomsTemp, allLecturersTemp, classesDataTemp)
        }
        getData()
    }, []);

    const findAvailableClassroomsAndLecturers = async (calendar, allClassrooms, allLecturers, classesData) => {
        var classesCalendarTemp = []
        for (var i = 0; i < calendar.length; i++) {
            classesCalendarTemp.push(calendar[i].date)
        }
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        var facilityIDTemp = decodedJWT.facility_id


        //CLASSROOM AND SHARED SECTION:
        //get schedule of classes for classrooms that have classes on the days when the added classes will take place:
        const getAllClassroomSchedule = async () => {
            var res
            try {
                var decodedJWT = parseJwt(sessionStorage.getItem("token"))
                var dataToSend = { facility_id: decodedJWT.facility_id, days: classesCalendarTemp }
                var url = 'http://localhost:8080/classrooms/classroomsScheduleForFacilityOnSpecificDays/'
                res = await axios.post(url, dataToSend, config)
                if(!res.data){
                    await swal("Błąd", "Brak studentów oraz obecności powiązanych z tymi zajęciami! Najpierw dodaj studentów aby móc edytować zajęcia.", "error");
                    window.location.replace("/displayListOfClasses")
                }
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
                var dataToSend = { facility_id: facilityIDTemp }
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
        hoursBegin = Number(classesData.beginning_time.slice(0, 2))
        minutesBegin = Number(classesData.beginning_time.slice(3, 5))
        hoursEnd = Number(classesData.beginning_time.slice(0, 2))
        minutesEnd = Number(classesData.beginning_time.slice(3, 5))
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
        var thisClassesClassrooms = { id: classesData.classroom_id, classroom_name: classesData.classroom_name }
        freeClassrooms.push(thisClassesClassrooms)
        setAvailableClasrooms(freeClassrooms)


        //LECTURER SECTION:
        //get schedule of classes for lecturers that have classes planned on the days when the added classes will take place:
        const getAllLecturersSchedule = async () => {
            var res
            try {
                var dataToSend = { facility_id: facilityIDTemp, days: classesCalendarTemp }
                var url = 'http://localhost:8080/users/lecturerScheduleForFacilityOnSpecificDays/'
                res = await axios.post(url, dataToSend, config)
                console.log(res)
                if(!res.data){
                    await swal("Błąd", "Brak studentów oraz obecności powiązanych z tymi zajęciami! Najpierw dodaj studentów aby móc edytować zajęcia.", "error");
                    window.location.replace("/displayListOfClasses")
                }
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
                var dataToSend = { facility_id: facilityIDTemp }
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
        var thisClassLect = { id: classesData.lecturer_id, first_name: classesData.first_name, surname: classesData.surname, title: classesData.title }
        freeLecturers.push(thisClassLect)
        setAvailableLecturers(freeLecturers)
        setLoading(false)
    }

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <table className={styles.table}>
                    <tr className={styles.one_line}>
                        <td className={styles.one_element}>
                            <div className={styles.label}> Grupa </div>
                            <input
                                value={classesData.group_name}
                                type="text"
                                name="groupName"
                                disabled
                                className={styles.input}
                            />
                        </td>
                        <td className={styles.one_element}>
                            <div className={styles.label}> Przedmiot </div>
                            <input
                                value={classesData.subject_name}
                                type="text"
                                name="subjectName"
                                disabled
                                className={styles.input}
                            />
                        </td>
                    </tr>
                    <tr className={styles.one_line}>
                        <td className={styles.one_element}>
                            <div className={styles.label}> Daty zajęć </div>
                            <div className={styles.preview_box}>
                                {classesCalendar.map((entry, key) => (
                                    entry.id !== null ?
                                        entry.date.slice(0, 10) + "\n"
                                        :
                                        <div>Nie wczytano pliku!</div>
                                ))}
                            </div>
                        </td>
                        <td className={styles.one_element}>
                            <div className={styles.label}> Dzień tygodnia </div>
                            <input
                                value = {classesData.day_of_week}
                                type="text"
                                name="dayOfWeek"
                                disabled
                                className={styles.input}
                            />
                        </td>
                    </tr>
                    <tr className={styles.one_line}>
                        <td className={styles.one_element}>
                            <div className={styles.label}> Data rozpoczęcia </div>
                            <input
                                value={classesData.beginning_date.slice(0, 10)}
                                type="date"
                                name="beginningDate"
                                disabled
                                className={styles.input}
                            />
                        </td>
                        <td className={styles.one_element}>
                            <div className={styles.label}> Data zakończenia </div>
                            <input
                                value={classesData.end_date.slice(0, 10)}
                                type="date"
                                name="endingDate"
                                disabled
                                className={styles.input}
                            />
                        </td>
                    </tr>
                    <tr className={styles.one_line}>
                        <td className={styles.one_element}>
                            <div className={styles.label}> Godzina rozpoczęcia </div>
                            <input
                                value={classesData.beginning_time}
                                type="text"
                                name="beginningTime"
                                disabled
                                className={styles.input}
                            />
                        </td>
                        <td className={styles.one_element}>
                            <div className={styles.label}> Godzina zakończenia </div>
                            <input
                                value={classesData.ending_time}
                                type="text"
                                name="endingTime"
                                disabled
                                className={styles.input}
                            />
                        </td>
                    </tr>
                    <tr className={styles.one_line}>
                        <td className={styles.one_element}>
                            <div className={styles.label}> Sala </div>
                            <select name="classroom" id="classroom" className={styles.radio_input} onChange={e => setClassroom(e.target.value)} required>
                                <option disabled selected value> -- wybierz salę -- </option>
                                {availableClassrooms.map((entry, key) => (
                                    entry.id !== null ?
                                        entry.id === classesData.classroom_id ?
                                            <option selected value={entry.id}>{entry.classroom_name}</option>
                                            :
                                            <option value={entry.id}>{entry.classroom_name}</option>
                                        :
                                        <div>Błąd ładowania sal lub brak wolnych sal!</div>
                                ))}
                            </select>
                        </td>
                        <td className={styles.one_element} colSpan={2}>
                            <div className={styles.label}> Prowadzący </div>
                            <select name="lecturer" id="lecturer" className={styles.radio_input} onChange={e => setLecturer(e.target.value)} required>
                                <option disabled selected value> -- wybierz prowadzącego -- </option>
                                {availableLecturers.map((entry, key) => (
                                    entry.id !== null ?
                                        entry.id === classesData.lecturer_id ?
                                            <option selected value={entry.id}>{entry.title + " " + entry.first_name + " " + entry.surname}</option>
                                            :
                                            <option value={entry.id}>{entry.title + " " + entry.first_name + " " + entry.surname}</option>
                                        :
                                        <div>Błąd ładowania prowadzących lub brak wolnych prowadzących!</div>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr className={styles.one_line}>
                        {availableClassrooms !== "" && lecturer !== "" && error === "" ?
                            <td className={styles.one_element} colSpan={2}>
                                <button type="button" className={styles.edit_classes_btn} onClick={e => handleSubmit(e)}>
                                    Zapisz zmiany
                                </button>
                            </td>
                            :
                            <td>Najpierw podaj wszystkie dane!</td>
                        }
                    </tr>
                    <tr className={styles.one_line}>
                        <td className={styles.one_element} colSpan={2}>
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
                            <Link to="/displayListOfClasses">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Szczegóły / edycja zajęć
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
export default EditClasses