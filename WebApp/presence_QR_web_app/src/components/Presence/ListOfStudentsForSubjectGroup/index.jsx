import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const ListOfStudentsForSubjectGroup = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const subjectGroupID = (useParams().id).split('-')[0] + "-" + (useParams().id).split('-')[1]
    const lecturer_id = Number((useParams().id).split('-')[2])

    const [role, setRole] = useState("")
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")

    const [subjectGroupData, setSubjectGroupData] = useState([])

    const [error, setError] = useState("")

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
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetFacilityLogo()

        //fetch and set data about group-subject:
        const fetchAndSetDataAboutGivenGroupSubject = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id, subject_group_id: subjectGroupID }
                var url = 'http://localhost:8080/groups/getDataAboutGroupSubject/'
                const { data: res } = await axios.post(url, dataToSend, config)
                console.log(res)
                setSubjectGroupData(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }

        //before fetching and seting data chceck if lecturer is permitted to view and edit this content:
        if (decodedJWT.id === lecturer_id) {
            fetchAndSetDataAboutGivenGroupSubject()
        } else {
            setLoading(false)
            setError("Próba nieuprawnionego dostępu do danych zablokowana!")
        }
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            {error && <div className={styles.error_msg}>{error}</div>}
            {subjectGroupData.length !== 0 ?
                <div className={styles.content_box}>
                    <div className={styles.left_side}>
                        <div className={styles.box_title}>
                            Wybrana grupa
                        </div>
                        <div className={styles.box_border_left}>
                            {subjectGroupData[0] !== "" ?
                                <div>
                                    <div className={styles.label}> Przedmiot: </div>
                                    {subjectGroupData[0][0].subject_name}
                                    <div className={styles.label}> Grupa: </div>
                                    {subjectGroupData[0][0].group_name}
                                </div>
                                :
                                <div>Błąd pobierania danych o zajęciach!</div>
                            }
                        </div>
                    </div>
                    <div className={styles.right_side}>
                        <div className={styles.box_title}>
                            Frekwencja studentów
                        </div>
                        <div className={styles.box_border_right}>
                            {
                                subjectGroupData.length !== 1 ?
                                    subjectGroupData[1].map((entry, key) => (
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
                                                    {entry.id}
                                                </div>
                                                <div className={styles.data_part}>
                                                    <div className={styles.label_inside_right_box}>Frekwencja:</div>
                                                    {entry.presentAmount}%
                                                </div>
                                            </div>
                                            :
                                            <div>Błąd pobierania danych o studentach!</div>
                                    ))
                                    :
                                    <div>Błąd pobierania danych o studentach!</div>
                            }
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
                            <Link to="/presenceListGroupSubject">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Lista studentów z frekwencją
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
export default ListOfStudentsForSubjectGroup