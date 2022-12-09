import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const EditSubject = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const subjectID = Number(useParams().id);

    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")

    //stores all subject names to check when creating a subject if such a subject does not yet exist:
    const [allSubjects, setAllSubjects] = useState("")

    //stores all values ​​from the form:
    const [subjectName, setSubjectName] = useState("")
    const [subjectYear, setSubjectYear] = useState("")
    const [subjectSemester, setSubjectSemester] = useState("")
    const [oldSubjectName, setOldSubjectName] = useState("")

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

    async function deleteSubject() {
        swal({
            title: "Czy na pewno chcesz usunąć ten przedmiot?",
            text: "Wszystkie zajęcia z tego przedmiotu zostaną usunięte!",
            icon: "warning",
            buttons: [
                'Anuluj',
                'Zatwierdź'
            ],
            dangerMode: true,
        }).then(function (isConfirm) {
            if (isConfirm) {
                whenDeletationConfirmed()
            } else {
                swal("Anulowano", "Przedmiot nie został usunięty", "error");
            }
        });

        const whenDeletationConfirmed = async () => {
            try {
                let dataToSend = { id: subjectID }
                var url = 'http://localhost:8080/subjects/deleteOneSubject/'
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Przedmiot usunięty pomyślnie!", icon: "success" });
                window.location.replace("http://localhost:3000/displayListOfSubjects");
            } catch (err) {
                swal("Błąd...", "Operacja usunięcia przedmiotu zakończona niepowodzeniem!", "error");
            }
        }
    }

    function checkRegexData() {
        let regexName = new RegExp("^.{1,70}$")
        let regexYear = new RegExp("^[1-9]{1}$")
        let regexSemester = new RegExp("^[1-9]{1}[0-9]?$")

        switch (true) {
            case (!regexName.test(subjectName)):
                setError("Nazwa przedmiotu jest nieprawidłowe!")
                return false
            case (!regexYear.test(subjectYear)):
                setError("Rok jest nieprawidłowy!")
                return false
            case (!regexSemester.test(subjectSemester)):
                setError("Semestr jest nieprawidłowy!")
                return false
            default:
                return true
        }
    }

    const handleSubmit = async (e) => {
        setError("")

        var tempError = ""

        if (subjectName !== oldSubjectName) {
            for (var i = 0; i < allSubjects.length; i++) {
                //if this classroom name exist:
                if (allSubjects[i].subject_name === subjectName) {
                    tempError += "Przedmiot o nazwie " + subjectName + " już istnieje!\n"
                }
            }
        }
        e.preventDefault()
        setError(tempError)

        //update subject in subject entity:
        const editSubject = async () => {
            try {
                if (checkRegexData()) {
                    let dataToSend = { id: subjectID, facility_id: facilityID, subject_name: subjectName, year: subjectYear, semester: subjectSemester }
                    var url = 'http://localhost:8080/subjects/updateOneSubject/'
                    await axios.post(url, dataToSend, config)
                    await swal({ title: "Udało się!", text: "Dane przedmiotu zostały zaktualizowane!", icon: "success" });
                    window.location.reload(true)
                }
            } catch (err) {
                swal("Error...", err.response.data, "error")
            }
        }

        if (tempError === "") {
            editSubject()
        }
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

        //fetch all subjects from facility:
        const fetchAndSetAllSubjects = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/subjects/getAllSubjectsNamesFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllSubjects(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetAllSubjects()

        //get classroom data:
        const getSubjectData = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id, id: subjectID }
                var url = 'http://localhost:8080/subjects/getOneSubject/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setOldSubjectName(res[0].subject_name)
                setSubjectName(res[0].subject_name)
                setSubjectYear(res[0].year)
                setSubjectSemester(res[0].semester)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        getSubjectData()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.one_element}>
                        <div className={styles.label}> Nazwa przedmiotu* </div>
                        <input
                            type="text"
                            placeholder="Nazwa przedmiotu"
                            name="subjectName"
                            value={subjectName}
                            onChange={e => setSubjectName(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.one_element}>
                        <div className={styles.label}> Rok* </div>
                        <input
                            type="number"
                            placeholder="Rok"
                            name="subjectYear"
                            value={subjectYear}
                            onChange={e => setSubjectYear(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div cclassName={styles.one_element}>
                        <div className={styles.label}> Semestr* </div>
                        <input
                            type="number"
                            placeholder="Semestr"
                            name="subjectSemester"
                            value={subjectSemester}
                            onChange={e => setSubjectSemester(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.one_element}>
                        <button type="submit"
                            className={styles.save_changes_btn}>
                            Zapisz zmiany
                        </button>
                    </div>
                    <div className={styles.one_element}>
                        <button type="button" className={styles.delete_subject_btn} onClick={e => deleteSubject(e)}>
                            Usuń przedmiot
                        </button>
                    </div>
                    <div className={styles.one_element}>
                        {error && <div className={styles.error_msg}>{error}</div>}
                    </div>
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
                            <Link to="/displayListOfSubjects">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Edycja / szczegóły przedmiotu
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
export default EditSubject