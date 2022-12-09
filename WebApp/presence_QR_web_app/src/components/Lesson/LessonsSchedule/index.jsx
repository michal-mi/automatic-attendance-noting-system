import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"
import { DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react"

const LessonSchedule = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [, setFacilityID] = useState("")
    const [lecturerCalendar, setLecturerCalendar] = useState("")

    //set starting date and end date by default so that current week is displayed
    const date = new Date();
    const [startCalDays, setStartCalDays] = useState(date)
    const [endCalDays, setEndCalDays] = useState(date + 7)

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

        //fetch calendar:
        const fetchLecturerCalendar = async () => {
            try {
                var dataToSend = { lecturer_id: decodedJWT.id, facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/classes/lecturerCalendar/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setLecturerCalendar(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + " Nazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchLecturerCalendar()

    }, []);

    function displayContent() {
        //set configuration of the calendar
        var config = {
            viewType: "Week",
            businessBeginsHour: 8,
            businessEndsHour: 21,
            cellHeight: 20,
            startDate: startCalDays,
            endDate: endCalDays,
            events: lecturerCalendar,
            onEventClicked: function (args) {
                window.location.replace("/lessonInfo/" + args.e.id())
            }
        }
        return (
            <div className={styles.display_content}>
                <div className={styles.content_box}>
                    <div className={styles.wrap}>
                        <div className={styles.left}>
                            <div className={styles.pick_week}>
                                <div className={styles.label}>Wybierz tydzień:</div>
                                {/* create week picker: */}
                                <DayPilotNavigator
                                    selectMode={"week"}
                                    showMonths={1}
                                    skipMonths={1}
                                    onTimeRangeSelected={args => {
                                        setStartCalDays(args.day.value)
                                        setEndCalDays(args.end.value)
                                    }}
                                />
                            </div>
                            <div className={styles.info}> Aby wyświetlić szczegóły danych zajęć kliknij na nie w kalendarzu</div>
                        </div>
                        <div className={styles.right}>
                            {/* create calendar: */}
                            <DayPilotCalendar
                                {...config}
                            />
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
                            <Link to="/">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Plan zajęć
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