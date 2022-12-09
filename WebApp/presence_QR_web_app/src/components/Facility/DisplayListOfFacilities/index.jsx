import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill, BsFillArrowRightCircleFill, BsPencil } from "react-icons/bs"

const DisplayListOfFacilities = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityStatusForSearch, setFacilityStatusForSearch] = useState(1)
    const [facilityIDForSearch, setFacilityIDForSearch] = useState("")
    const [facilityNameForSearch, setFacilityNameForSearch] = useState("")
    const [facilities, setFacilities] = useState([])
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

    async function handleSearch(e) {
        const searchFacility = async () => {
            try {
                let dataToSend = { id: facilityIDForSearch, facility_name: facilityNameForSearch, facility_status: facilityStatusForSearch }
                console.log(dataToSend)
                var url = 'http://localhost:8080/facilities/searchFacilities/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setFacilities(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        e.preventDefault()
        await searchFacility()
    }

    function displayFacilityLogo(key) {
        return <img src={'http://localhost:8080/logos/' + facilities[key].facility_logo + '.png'} className={styles.logo_box} alt="facility logo" />
    }

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        setRole(decodedJWT.user_role)
        setLoading(false)
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
                            <div className={styles.label}> Podaj status placówki</div>
                            <div className={styles.radio_box}>
                                <div className={styles.radio_input}>
                                    <input type="radio" id="operating" name="facilityStatus" value='1' onChange={e => setFacilityStatusForSearch(e.target.value)} required />
                                    <label for="operating">Funkcjonująca</label>
                                </div>
                                <div className={styles.radio_input}>
                                    <input type="radio" id="notOperating" name="facilityStatus" value='0' onChange={e => setFacilityStatusForSearch(e.target.value)} required />
                                    <label for="notOperating">Niefunkcjonująca</label>
                                </div>
                            </div>
                            <div className={styles.small_text}> Lub / i</div>
                            <div className={styles.label}> Podaj ID placówki</div>
                            <input
                                type="text"
                                placeholder="ID placówki"
                                name="facilityID"
                                onChange={e => setFacilityIDForSearch(e.target.value)}
                                className={styles.input}
                            />
                            <div className={styles.small_text}> Lub / i</div>
                            <div className={styles.label}> Podaj nazwę placówki</div>
                            <input
                                type="text"
                                placeholder="Nazwa placówki"
                                name="facilityName"
                                onChange={e => setFacilityNameForSearch(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <button type="submit"
                            className={styles.search_facility_btn}>
                            Wyszukaj
                        </button>
                        {error && <div className={styles.error_msg}>{error}</div>}
                    </form>
                </div>
                <div className={styles.right_side}>
                    <div className={styles.box_title}>
                        Wyniki:
                    </div>
                    <div className={styles.box_border_right}>
                        {
                            facilities.map((entry, key) => (
                                entry.id !== null ?
                                    <div className={styles.one_facility_data}>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>ID:</div>
                                            <div className={styles.data}>{entry.id}</div>
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Nazwa:</div>
                                            {entry.facility_name}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Status:</div>
                                            {entry.facility_status === 1 ?
                                                <div className={styles.data_line}>Funkcjonująca</div> :
                                                <div className={styles.data_line}>Niefunkcjonująca</div>
                                            }
                                        </div>
                                        <div className={styles.label_inside_right_box}>{displayFacilityLogo(key)}</div>
                                        <button className={styles.edit_facility_btn}>
                                            <Link to={"/editFacility/" + entry.id}>
                                                <BsFillArrowRightCircleFill size={23} />
                                                <BsPencil size={23} />
                                            </Link>
                                        </button>
                                    </div>
                                    :
                                    <div>Brak placówek spełniających podane kryteria</div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    }

    function displayRole() {
        if (role === 1) {
            return <div className={styles.role_box}>Zalogowano jako administrator</div>
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
                            <Link to="/manageFacilitiesMenu">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                        </div>
                        <div className={styles.navbar_center}>
                            Lista placówek
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
export default DisplayListOfFacilities