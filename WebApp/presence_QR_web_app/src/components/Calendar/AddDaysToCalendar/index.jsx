import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs";

const AddDaysToCalendar = () => {
    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")
    let today = new Date()
    let tomorrow = new Date(today.setDate(today.getDate() + 1)).toISOString().slice(0, 10);
    const { t } = useTranslation();
    const config = {
        headers: { Authorization: `${sessionStorage.getItem("token")}` }
    };

    //stores all days to check when addding days if such a days does not yet exists
    const [, setCalendar] = useState([])

    //stores all values ​​from the form:
    const [startDay, setStartDay] = useState("")
    const [endDay, setEndDay] = useState("")
    const [numberOfDaysOffInWeek, setNumberOfDaysOffInWeek] = useState("")
    const [daysOff, setDaysOff] = useState([])

    const [error] = useState("")

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

    //add day to daysOff array :
    function setDayOff(dayNumber) {
        var tempArr = []
        tempArr = daysOff
        var isPresentInArray = false
        for (var i = 0; i < tempArr.length; i++) {
            if (tempArr[i] === dayNumber) {
                isPresentInArray = true
            }
        }
        //if this day has not been previously added:
        if (!isPresentInArray) {
            tempArr.push({ "day_number": Number(dayNumber) })
            setDaysOff(tempArr)
        }
    }

    // async function handleSubmit(event) {
    const handleSubmit = async (e) => {

        //add days to day entity:
        const addDays = async () => {
            var dataToSend = { facility_id: facilityID, start_day: startDay, end_day: endDay, days_off: daysOff }
            console.log(dataToSend)
            var url = 'http://localhost:8080/days/addDays/'
            try {
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Operacja dodawania dni do kalendarza placówki przebiegła pomyślnie!", icon: "success" });
                window.location.reload(true)
            } catch (err) {
                swal("Błąd...", "Operacja dodawania dni do kalendarza placówki nieudana!", "error");
            }
        }
        addDays()
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
                <form onSubmit={handleSubmit}>
                    <table>
                        <tr className={styles.one_line}>
                            <td className={styles.one_element} colSpan={3}><div className={styles.label}> Dni które już istnieją w kalendarzu nie zostaną dodane!</div></td>
                        </tr>
                        <tr className={styles.one_line}>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Pierwszy dzień* </div>
                                <input
                                    type="date"
                                    min={tomorrow}
                                    placeholder="Pierwszy dzień"
                                    name="startDay"
                                    onChange={e => setStartDay(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </td>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Ostatni dzień* </div>
                                <input
                                    type="date"
                                    min={tomorrow}
                                    placeholder="Ostatni dzień"
                                    name="endDay"
                                    onChange={e => setEndDay(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </td>
                            <td className={styles.one_element}>
                                <div className={styles.label}> Liczba dni wolnych w tygodniu </div>
                                <select name="numberOfDaysOffInWeek" id="numberOfDaysOffInWeek" className={styles.radio_input} onChange={e => { setNumberOfDaysOffInWeek(Number(e.target.value)); setDaysOff([]) }}>
                                    <option selected value={Number(0)}> -- wybierz liczbę dni wolnych -- </option>
                                    <option value={1} >1</option>
                                    <option value={2} >2</option>
                                    <option value={3} >3</option>
                                </select>
                            </td>
                        </tr>
                        {numberOfDaysOffInWeek === 1 ?
                            <tr className={styles.one_line}>
                                <td></td>
                                <td className={styles.one_element}>
                                    <div className={styles.label}> *Dzień wolny w tygodniu </div>
                                    <select name="dayOff" id="dayOff" className={styles.radio_input} onChange={e => setDayOff(e.target.value)}>
                                        <option disabled selected value> -- wybierz dzień wolny -- </option>
                                        <option value={1} >Poniedziałek</option>
                                        <option value={2} >Wtorek</option>
                                        <option value={3} >Środa</option>
                                        <option value={4} >Czwartek</option>
                                        <option value={5} >Piątek</option>
                                        <option value={6} >Sobota</option>
                                        <option value={0} >Niedziela</option>
                                    </select>
                                </td>
                                <td></td>
                            </tr>
                            :
                            <tr></tr>
                        }
                        {numberOfDaysOffInWeek === 2 ?
                            <tr className={styles.one_line}>
                                <td className={styles.one_element}>
                                    <div className={styles.label}> *Dzień wolny w tygodniu 1 </div>
                                    <select name="dayOff1" id="dayOff1" className={styles.radio_input} onChange={e => setDayOff(e.target.value)}>
                                        <option disabled selected value> -- wybierz dzień wolny -- </option>
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
                                    <div className={styles.label}> *Dzień wolny w tygodniu 2</div>
                                    <select name="dayOff2" id="dayOff2" className={styles.radio_input} onChange={e => setDayOff(e.target.value)}>
                                        <option disabled selected value> -- wybierz dzień wolny -- </option>
                                        <option value={1} >Poniedziałek</option>
                                        <option value={2} >Wtorek</option>
                                        <option value={3} >Środa</option>
                                        <option value={4} >Czwartek</option>
                                        <option value={5} >Piątek</option>
                                        <option value={6} >Sobota</option>
                                        <option value={0} >Niedziela</option>
                                    </select>
                                </td>
                                <td></td>
                            </tr>
                            :
                            <tr></tr>
                        }
                        {numberOfDaysOffInWeek === 3 ?
                            <tr className={styles.one_line}>
                                <td className={styles.one_element}>
                                    <div className={styles.label}> *Dzień wolny w tygodniu 1 </div>
                                    <select name="dayOff1" id="dayOff1" className={styles.radio_input} onChange={e => setDayOff(e.target.value)}>
                                        <option disabled selected value> -- wybierz dzień wolny -- </option>
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
                                    <div className={styles.label}> *Dzień wolny w tygodniu 2</div>
                                    <select name="dayOff2" id="dayOff2" className={styles.radio_input} onChange={e => setDayOff(e.target.value)}>
                                        <option disabled selected value> -- wybierz dzień wolny -- </option>
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
                                    <div className={styles.label}> *Dzień wolny w tygodniu 3</div>
                                    <select name="dayOff3" id="dayOff3" className={styles.radio_input} onChange={e => setDayOff(e.target.value)}>
                                        <option disabled selected value> -- wybierz dzień wolny -- </option>
                                        <option value={1} >Poniedziałek</option>
                                        <option value={2} >Wtorek</option>
                                        <option value={3} >Środa</option>
                                        <option value={4} >Czwartek</option>
                                        <option value={5} >Piątek</option>
                                        <option value={6} >Sobota</option>
                                        <option value={0} >Niedziela</option>
                                    </select>
                                </td>
                            </tr>
                            :
                            <tr></tr>
                        }
                        <tr className={styles.one_line}>
                            <td></td>
                            <td className={styles.one_element}>
                                <button type="submit"
                                    className={styles.add_days_btn}>
                                    Dodaj dni
                                </button>
                            </td>
                            <td className={styles.one_element}>
                                {error && <div className={styles.error_msg}>{error}</div>}
                            </td>
                        </tr>
                    </table>
                </form>
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
                            <Link to="/manageCalendarMenu">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Dodawanie dni do kalendarza
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
export default AddDaysToCalendar