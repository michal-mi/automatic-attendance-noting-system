import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const DisplayListOfGroups = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")

    const [groupSemesterForSearch, setGroupSemesterForSearch] = useState("")
    const [allGroups, setAllGroups] = useState([])

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
                var dataToSend = { id: facilityID, semester: groupSemesterForSearch }
                var url = 'http://localhost:8080/groups/searchGroups/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllGroups(res)
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

        //fetch and set all classrooms from user's facility:
        const fetchAndSetAllGroupsFromFacility = async () => {
            try {
                var dataToSend = { id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/groups/getAllGroupsFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllGroups(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchAndSetAllGroupsFromFacility()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <div className={styles.left_side}>
                    <div className={styles.box_title}>
                        Wyszukaj:
                    </div>
                    <div className={styles.box_border_left}>
                        <form onSubmit={handleSearch}>
                            <div className={styles.label}> Podaj semestr</div>
                            <div className={styles.radio_box}>
                                <select name="roles" id="roles" className={styles.radio_input} onChange={e => setGroupSemesterForSearch(e.target.value)} required>
                                    <option disabled selected value> -- wybierz semestr -- </option>
                                    <option value={1} >1</option>
                                    <option value={2} >2</option>
                                    <option value={3} >3</option>
                                    <option value={4} >4</option>
                                    <option value={5} >5</option>
                                    <option value={6} >6</option>
                                    <option value={7} >7</option>
                                    <option value={8} >8</option>
                                    <option value={9} >9</option>
                                    <option value={10} >10</option>
                                </select>
                            </div>
                            <button type="submit"
                                className={styles.search_group_btn}>
                                Wyszukaj
                            </button>
                        </form>
                    </div>
                </div>
                <div className={styles.right_side}>
                    <div className={styles.box_title}>
                        Wyniki:
                    </div>
                    <div className={styles.box_border_right}>
                        {
                            allGroups.map((entry, key) => (
                                entry.id !== null ?
                                    <div className={styles.one_classroom_data}>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Nazwa grupy:</div>
                                            {entry.group_name}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Rok:</div>
                                            {entry.year}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Semestr:</div>
                                            {entry.semester}
                                        </div>
                                        <button className={styles.navigation_btn}>
                                            <Link className={styles.no_underline} to={"/editGroup/" + entry.id}>
                                                Szczegóły
                                            </Link>
                                        </button>
                                        <button className={styles.navigation_btn}>
                                            <Link className={styles.no_underline} to={"/assignStudents/" + entry.id}>
                                                Przypisz studentów
                                            </Link>
                                        </button>
                                    </div>
                                    :
                                    <div>Brak sal dla tej placówki!</div>
                            ))
                        }
                    </div>
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
                            <Link to="/manageGroupsMenu">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Lista grup
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
export default DisplayListOfGroups