import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const EditGroup = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const groupID = Number(useParams().id);

    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")

    //stores all groups to check when creating a group if such a group does not yet exists:
    const [allGroups, setAllGroups] = useState("")

    //stores all values ​​from the form:
    const [groupName, setGroupName] = useState("")
    const [groupYear, setGroupYear] = useState("")
    const [groupSemester, setGroupSemester] = useState("")
    const [oldGroupName, setOldGroupName] = useState("")

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

    async function deleteGroup() {
        swal({
            title: "Czy na pewno chcesz usunąć tą grupę?",
            text: "Wszyscy studenci, którzy byli przypisani do tej grupy zostaną z niej wypisani\nWszystkie zajęcia które realizowała te grupa pozostaną bez grupy\nPamiętaj by przypisać zajęcia do nowej grupy!",
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
                swal("Anulowano", "Grupa nie została usunięta", "error");
            }
        });

        const whenDeletationConfirmed = async () => {
                try {
                    let dataToSend = { id: groupID }
                    var url = 'http://localhost:8080/groups/deleteOneGroup/'
                    await axios.post(url, dataToSend, config)
                    await swal({ title: "Udało się!", text: "Grupa usunięta pomyślnie!", icon: "success" });
                    window.location.replace("http://localhost:3000/displayListOfGroups");
                } catch (err) {
                    swal("Błąd...", "Operacja usuwania grupy zakończona niepowodzeniem!", "error");
                }
            }
    }

    function checkRegexData() {
        let regexName = new RegExp("^.{1,25}$")
        let regexYear = new RegExp("^[1-9]{1}$")
        let regexSemester = new RegExp("^[1-9]{1}[0-9]?$")

        switch(true) {
            case (!regexName.test(groupName)):
                setError("Nazwa grupy jest nieprawidłowa!")
                return false
            case (!regexYear.test(groupYear)):
                setError("Rok jest nieprawidłowy!")
                return false
            case (!regexSemester.test(groupSemester)):
                setError("Semestr jest nieprawidłowy!")
                return false
            default:
                return true
        }
    }

    const handleSubmit = async (e) => {
        setError("")

        var tempError = ""

        if (groupName !== oldGroupName) {
            for (var i = 0; i < allGroups.length; i++) {
                //if this classroom name exist:
                if (allGroups[i].group_name === groupName) {
                    tempError += "Grupa o nazwie " + groupName + " już istnieje!\n"
                }
            }
        }
        e.preventDefault()
        setError(tempError)

        //edit group in group entity:
        const changeGroupData = async () => {
            try {
                if(checkRegexData()) {
                    let dataToSend = { id: groupID, facility_id: facilityID, group_name: groupName, year: groupYear, semester: groupSemester }
                    var url = 'http://localhost:8080/groups/updateOneGroup/'
                    await axios.post(url, dataToSend, config)
                    await swal({ title: "Udało się!", text: "Dane grupy zostały zaktualizowane!", icon: "success" });
                    window.location.reload(true)
                } 
            } catch (err) {
                swal("Error...", err.response.data, "error")
            }
        }
        if (tempError === "") {
            await changeGroupData()
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

        //fetch all groups from facility:
        const fetchAndSetAllGroups = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/groups/getAllGroupsNamesFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllGroups(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }

        }
        fetchAndSetAllGroups()

        //get classroom data:
        const getGroupData = async () => {
            try {
                var dataToSend = { facility_id: decodedJWT.facility_id, id: groupID }
                var url = 'http://localhost:8080/groups/getOneGroup/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setOldGroupName(res[0].group_name)
                setGroupName(res[0].group_name)
                setGroupYear(res[0].year)
                setGroupSemester(res[0].semester)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        getGroupData()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.one_element}>
                        <div className={styles.label}> Nazwa grupy* </div>
                        <input
                            type="text"
                            placeholder="Nazwa grupy"
                            name="groupName"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.one_element}>
                        <div className={styles.label}> Rok* </div>
                        <input
                            type="number"
                            placeholder="Rok"
                            name="groupYear"
                            value={groupYear}
                            onChange={e => setGroupYear(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div cclassName={styles.one_element}>
                        <div className={styles.label}> Semestr* </div>
                        <input
                            type="number"
                            placeholder="Semestr"
                            name="groupSemester"
                            value={groupSemester}
                            onChange={e => setGroupSemester(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.one_element}>
                        <button type="submit" className={styles.assign_student_btn}>
                            <Link to={"/assignStudents/" + groupID} className={styles.no_underline}>
                                Przypisz studentów
                            </Link>
                        </button>
                    </div>
                    <div className={styles.one_element}>
                        <button type="submit"
                            className={styles.save_changes_btn}>
                            Zapisz zmiany
                        </button>
                    </div>
                    <div className={styles.one_element}>
                        <button type="button" className={styles.delete_group_btn} onClick={e => deleteGroup(e)}>
                            Usuń grupę
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
                            <Link to="/displayListOfGroups">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Edycja / szczegóły grupy
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
export default EditGroup