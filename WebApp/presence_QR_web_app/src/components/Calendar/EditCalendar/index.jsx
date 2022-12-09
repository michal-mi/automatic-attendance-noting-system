import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs";

const Calendar = () => {
    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")

    const [calendar, setCalendar] = useState([])
    const [toChange, setToChange] = useState([])

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
        return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
    }

    function displayDate(date) {
        date = date.slice(0,10)
        return date
    }

    async function changeDayStatus(is_free, id, date) {
        var tempToChange = []
        tempToChange = toChange
        tempToChange.push({ id, is_free, date })
        setToChange(tempToChange)
    }

    async function saveChanges() {
        //edit calendar:
        const editCalendar = async () => {
            try {
                var dataToSend = { to_change: toChange, facility_id: facilityID }
                console.log(dataToSend)
                var url = 'http://localhost:8080/days/editCalendar/'
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Wprowadzone zmiany zostały zapisane!", icon: "success" });
                window.location.reload(true)
            } catch (err) {
                await swal("Błąd...", "Nie udało się zapisać wprowadzonych zmian!", "error");
                window.location.reload(true)
            }
        }
        editCalendar()
        setToChange([])
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

        //fetch and set calendar for facility:
        const fetchAndSetCalendarForFacility = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/days/getCalendarForFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                //correct dates:
                console.log(res)
                for(var i = 0; i < res.length; i++){
                    console.log(res[i])
                    var day = 60 * 60 * 24 * 1000;
                    var date = new Date(res[i].date)

                    console.log(date)
                    date = new Date(date.getTime() + day);
                    console.log(date)

                    res[i].date = date.toISOString().slice(0,10)
                    console.log(res[i])
                }
                setCalendar(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchAndSetCalendarForFacility()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <div className={styles.result_box}>
                    <div className={styles.box_border}>
                        {
                            calendar.map((entry, key) => (
                                entry.id !== null ?
                                    <div className={styles.one_day_data}>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Data:</div>
                                            {displayDate(entry.date)}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Status dnia:</div>
                                            {entry.is_free === 0 ?
                                                <div className={styles.radio_box}>
                                                    <select name="is_free" id="is_free" className={styles.radio_input} onChange={e => changeDayStatus(e.target.value, entry.id, entry.date.slice(0,10))} required>
                                                        <option value='0' selected >Zwykły</option>
                                                        <option value='1' >Wolny</option>
                                                    </select>
                                                </div>
                                                :
                                                <div className={styles.radio_box}>
                                                    <select name="is_free" id="is_free" className={styles.radio_input} onChange={e => changeDayStatus(e.target.value, entry.id, entry.date.slice(0,10))} required>
                                                        <option value='0' >Zwykły</option>
                                                        <option value='1' selected >Wolny</option>
                                                    </select>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    :
                                    <div>Brak kalendarza dla tej placówki!</div>
                            ))
                        }
                    </div>
                    <button type="buton" className={styles.save_changes_btn} onClick={e => saveChanges(e)}>
                        Zapisz zmiany
                    </button>
                </div>
            </div>
        </div>
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
                            <Link to="/manageCalendarMenu">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Edycja dni
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
export default Calendar