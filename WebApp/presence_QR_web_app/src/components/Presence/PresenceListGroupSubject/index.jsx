import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const PresenceListGroupSubject = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [lecturerID, setLecturerID] = useState("")
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")

    const [allGroups, setAllGroups] = useState([])
    const [allSubjects, setAllSubjects] = useState([])

    const [subjectForSearch, setSubjectForSearch] = useState("")
    const [groupForSearch, setGroupForSearch] = useState("")

    const [groups, setGroups] = useState([])

    const [error,] = useState("")

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

    async function handleSearch(event) {
        const searchGroups = async () => {
            try {
                var decodedJWT = parseJwt(sessionStorage.getItem("token"))
                var dataToSend = { facility_id: facilityID, lecturer_id: decodedJWT.id, subject_id: subjectForSearch, group_id: groupForSearch }
                var url = 'http://localhost:8080/groups/searchGroupsAndSubjects/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setGroups(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        event.preventDefault()
        await searchGroups()
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
                setFacilityID(decodedJWT.facility_id)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetFacilityLogo()

        //fetch and set all groups from user's facility:
        const fetchAndSetAllGroups = async () => {
            try {
                var dataToSend = { id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/groups/getAllGroupsFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllGroups(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetAllGroups()

        //fetch and set all subjects from user's facility:
        const fetchAndSetAllSubjects = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/subjects/getAllSubjectsFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllSubjects(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchAndSetAllSubjects()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <div className={styles.left_side}>
                    <div className={styles.box_title}>
                        Wyszukaj:
                    </div>
                    <form onSubmit={handleSearch}>
                        <div className={styles.box_border_left}>
                            <div className={styles.label}> Wybierz przedmiot </div>
                            <div className={styles.radio_box}>
                                <select name="subjects" id="subjects" className={styles.radio_input} onChange={e => setSubjectForSearch(e.target.value)}>
                                    <option selected value={""}> -- wybierz przedmiot-- </option>
                                    {allSubjects.map((entry, key) => (
                                        entry.id !== null ?
                                            <option value={entry.id} >{entry.subject_name}</option>
                                            :
                                            <div>Błąd ładowania przedmiotów!</div>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.small_text}> Lub / i</div>
                            <div className={styles.label}> Wybierz grupę </div>
                            <div className={styles.radio_box}>
                                <select name="groups" id="groups" className={styles.radio_input} onChange={e => setGroupForSearch(e.target.value)}>
                                    <option selected value={""}> -- wybierz grupę- </option>
                                    {allGroups.map((entry, key) => (
                                        entry.id !== null ?
                                            <option value={entry.id} >{entry.group_name}</option>
                                            :
                                            <div>Błąd ładowania grup!</div>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {(facilityID !== "") ?
                            <button type="submit"
                                className={styles.search_facility_btn}>
                                Wyszukaj
                            </button>
                            :
                            <div>Id placówki nie zostało wczytane poprawnie. Wyszukiwanie niemożliwe!</div>
                        }
                        {error && <div className={styles.error_msg}>{error}</div>}
                    </form>
                </div>
                <div className={styles.right_side}>
                    <div className={styles.box_title}>
                        Wyniki:
                    </div>
                    <div className={styles.box_border_right}>
                        {
                            groups.map((entry, key) => (
                                entry.id !== null ?
                                    <div className={styles.one_user_data}>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Przedmiot:</div>
                                            {entry.subject_name}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Grupa:</div>
                                            {entry.group_name}
                                        </div>
                                        <button className={styles.navigation_btn}>
                                            <Link className={styles.no_underline} to={"/listOfClassesForSubjectGroup/" + entry.subject_id + "-" + entry.group_id + "-" + lecturerID}>
                                                Lista zajęć
                                            </Link>
                                        </button>
                                        <button className={styles.navigation_btn}>
                                            <Link className={styles.no_underline} to={"/listOfStudentsForSubjectGroup/" + entry.subject_id + "-" + entry.group_id + "-" + lecturerID}>
                                                Całościowa frekwencja
                                            </Link>
                                        </button>
                                    </div>
                                    :
                                    <div>Brak grup spełniających podane kryteria</div>
                            ))
                        }
                    </div>
                </div>
            </div>
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
                            <Link to="/">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Obecności - wybór grupy
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
export default PresenceListGroupSubject