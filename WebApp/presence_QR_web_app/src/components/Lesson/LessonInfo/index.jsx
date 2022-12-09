import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const LessonSchedule = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const lessonID = useParams().id
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [lessonInfo, setLessonInfo] = useState("")
    const [lecturerID, setLecturerID] = useState("")

    const { t } = useTranslation();
    const config = {
        headers: { Authorization: `${sessionStorage.getItem("token")}` }
    };

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
        if (role === 3) {
            return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
        }
    }

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        setRole(decodedJWT.user_role)
        setLecturerID(decodedJWT.id)

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

        //fetch informations about lesson:
        const fetchOneLessonData = async () => {
            try {
                var dataToSend = { lesson_id: lessonID, facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/classes/oneLessonData/'
                const { data: res } = await axios.post(url, dataToSend, config)
                console.log(res)
                setLessonInfo(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchOneLessonData()
    }, []);

    function displayContent() {
        return (
            <div className={styles.display_content}>
                <div className={styles.content_box}>
                    <div className={styles.horizontal_division}>
                        <div className={styles.left}>
                            <div className={styles.data_container}>
                                <div className={styles.subject_name}>{lessonInfo.subject_name}</div>
                                <div className={styles.data_inner_container}>
                                    <table className={styles.lesson_data}>
                                        <tr>
                                            <td><div className={styles.label}>Data:</div></td>
                                            <td>{lessonInfo.lesson_date}</td>
                                        </tr>
                                        <tr>
                                            <td><div className={styles.label}>Godzina rozpoczęcia:</div></td>
                                            <td>{lessonInfo.beginning_time}</td>
                                        </tr>
                                        <tr>
                                            <td><div className={styles.label}>Godzina zakończenia:</div></td>
                                            <td>{lessonInfo.ending_time}</td>
                                        </tr>
                                        <tr>
                                            <td><div className={styles.label}>Sala:</div></td>
                                            <td>{lessonInfo.classroom_name}</td>
                                        </tr>
                                        <tr>
                                            <td><div className={styles.label}>Przedmiot:</div></td>
                                            <td>{lessonInfo.subject_name}</td>
                                        </tr>
                                        <tr>
                                            <td><div className={styles.label}>Grupa:</div></td>
                                            <td>{lessonInfo.group_name}</td>
                                        </tr>
                                    </table>
                                    <button className={styles.navigation_btn}>
                                        <Link className={styles.no_underline} to={"/listOfClassAttendance/" + lessonInfo.subject_id +"-"+ lessonInfo.group_id + "-" + lecturerID + "-(" + lessonInfo.lesson_date + ")"} onClick = { e => localStorage.setItem("from", "lessonInfo/" + lessonID)}>
                                            Wyświetl listę obecności
                                        </Link>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.right}>
                            <div className={styles.image} />
                        </div>
                    </div>
                </div>
            </div>
        );
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
                            <Link to="/lessonSchedule">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Szczegóły zajęć
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
export default LessonSchedule