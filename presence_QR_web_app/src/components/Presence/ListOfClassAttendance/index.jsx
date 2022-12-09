import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const ListOfClassesForSubjectGroup = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const linkToGoBack = "/listOfClassesForSubjectGroup/" + (useParams().id).split('-')[0] + "-" + (useParams().id).split('-')[1] + "-" + (useParams().id).split('-')[2]
    const subjectGroupID = (useParams().id).split('-')[0] + "-" + (useParams().id).split('-')[1]
    const lecturer_id = Number((useParams().id).split('-')[2])
    const [buttonAction, setButtonAction] = useState("")
    var lessonDate = (useParams().id).split('(')[1]
    lessonDate = lessonDate.slice(0, -1)

    const { t } = useTranslation();
    const config = {
        headers: { Authorization: `${sessionStorage.getItem("token")}` }
    };

    const [role, setRole] = useState("")
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")

    const [subjectGroupData, setSubjectGroupData] = useState([])
    const [attendanceList, setAttendanceList] = useState([])
    const [attendanceListWasChanged, setAttendanceListWasChanged] = useState(false)
    const [statuses, setStatuses] = useState([])

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

    const handleSubmit = async () => {
        setError("")
        if (attendanceListWasChanged) {
            try {
                var dataToSend = { attendance_list: attendanceList }
                var url = 'http://localhost:8080/classes/changeAttendanceList/'
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Lista obecności została zmodyfikowana!", icon: "success" });
                document.location.reload()
            } catch (err) {
                swal("Błąd...", "Operacja modyfikowania listy obecności zakończona niepowodzeniem!", "error");
            }
        } else {
            setError("Nie dokonano żadnych zmian!")
        }
    }

    function displayShortFacilityLogo() {
        return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
    }

    function setStatus(key, e) {
        var tempAttendanceList = attendanceList
        tempAttendanceList[key].status_id = e
        setAttendanceList(attendanceList)
        setAttendanceListWasChanged(true)
    }

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        setRole(decodedJWT.user_role)
        setButtonAction(localStorage.getItem("from"))
        //fetch facility data:
        const fetchAndSetFacilityLogo = async () => {
            try {
                var dataToSend = { id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/facilities/getOneFacilityDataByID/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setFacilityShortLogoLink('http://localhost:8080/logos/' + res[0].facility_logo + '_short.png')
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetFacilityLogo()

        //fetch and set data about lesson:
        const fetchAndSetDataAboutGivenLesson = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id, subject_group_id: subjectGroupID }
                var url = 'http://localhost:8080/groups/getOnlyDataAboutGroupSubject/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setSubjectGroupData(res[0])
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }

        //fetch and set attendance list:
        const fetchAndSetLessonAttendanceList = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id, subject_group_id: subjectGroupID, lesson_date: lessonDate, lecturer_id: lecturer_id }
                var url = 'http://localhost:8080/classes/getAttendanceList/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAttendanceList(res[0])
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }

        const getPresenceStatuses = async () => {
            try {
                var url = 'http://localhost:8080/statuses/getStatusesList/'
                const { data: res } = await axios.get(url, config)
                setStatuses(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        getPresenceStatuses()

        //before fetching and seting data about lesson and attendance list check if lecturer is permitted to view and edit this content:
        if (decodedJWT.id === lecturer_id) {
            fetchAndSetDataAboutGivenLesson()
            fetchAndSetLessonAttendanceList()
        } else {
            setLoading(false)
            setError("Próba nieuprawnionego dostępu do danych zablokowana!")
        }
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            {subjectGroupData.length !== 0 ?
                <div className={styles.content_box}>
                    <div className={styles.left_side}>
                        <div className={styles.box_title}>
                            Wybrane zajęcia
                        </div>
                        <div className={styles.box_border_left}>
                            {subjectGroupData !== "" ?
                                <div>
                                    <div className={styles.label}> Przedmiot: </div>
                                    {subjectGroupData.subject_name}
                                    <div className={styles.label}> Grupa: </div>
                                    {subjectGroupData.group_name}
                                    <div className={styles.label}> Data: </div>
                                    {lessonDate}
                                </div>
                                :
                                <div>Błąd pobierania danych o obecnościach!</div>
                            }
                        </div>
                    </div>
                    <div className={styles.right_side}>
                        <div className={styles.box_title}>
                            Lista obecności
                        </div>
                        <div className={styles.box_border_right}>
                            {
                                attendanceList.length !== 1 ?
                                    attendanceList.map((entry, key) => (
                                        entry.id !== null ?
                                            <div className={styles.one_user_data}>
                                                <div className={styles.data_part}>
                                                    <div className={styles.label_inside_right_box}>Nazwisko:</div>
                                                    {entry.surname}
                                                </div>
                                                <div className={styles.data_part}>
                                                    <div className={styles.label_inside_right_box}>Imię:</div>
                                                    {entry.first_name}
                                                </div>
                                                <div className={styles.data_part}>
                                                    <div className={styles.label_inside_right_box}>ID:</div>
                                                    {entry.user_id}
                                                </div>
                                                <div className={styles.label_inside_right_box}>Status obecności:</div>
                                                <select name="presenceStatus" id="presenceStatus" className={styles.radio_input} onChange={e => setStatus(key, e.target.value)} required>
                                                    {statuses.map((entry1, key1) => (
                                                        entry1.id !== null ?
                                                            entry1.id === entry.status_id ?
                                                                <option selected value={entry.status_id}>{entry1.status_name === "present" ? "obecny" : entry1.status_name === "extempt" ? "zwolniony" : entry1.status_name === "justified" ? "usprawiedliwony" : "nieobecny" }</option>
                                                                :
                                                                <option value={entry1.id}>{entry1.status_name}</option>
                                                            :
                                                            <div>Błąd ładowania statusów obecności!</div>
                                                    ))}
                                                </select>
                                            </div>
                                            :
                                            <div>Błąd pobierania danych o studentach!</div>
                                    ))
                                    :
                                    <div>Błąd pobierania danych o studentach!</div>
                            }
                        </div>
                        <button type="submit" className={styles.save_changes_btn} onClick={e => handleSubmit(e)}>
                            Zapisz zmiany
                        </button>
                        <div className={styles.one_element}>
                            {error && <div className={styles.error_msg}>{error}</div>}
                        </div>
                    </div>
                </div>
                :
                <div>Błąd pobierania danych!</div>
            }
        </div>
    }

    function displayRole() {
        if (role === 3) {
            return <div className={styles.role_box}>Zalogowano jako wykładowca</div>
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
                            <Link to={localStorage.getItem("from") !== null ? "/" + localStorage.getItem("from") : linkToGoBack} onClick = {e => localStorage.removeItem("from")}>
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Lista obecności
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
export default ListOfClassesForSubjectGroup