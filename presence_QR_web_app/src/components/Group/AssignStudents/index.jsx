import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill, BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs"

const AssignStudents = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const groupID = Number(useParams().id);

    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")

    const [userIDForSearch, setUserIDForSearch] = useState("")
    const [userSurnameForSearch, setUserSurnameForSearch] = useState("")
    const [userBirthYearForSearch, setUserBirthYearForSearch] = useState("")

    const [usersFromGroup, setUsersFromGroup] = useState([])
    const [allUsers, setAllUsers] = useState([])

    const [moveOutOfGroup, setMoveOutOfGroup] = useState([])
    const [moveToGroup, setMoveToGroup] = useState([])

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
        const searchUsers = async () => {
            try {
                var dataToSend = { user_role: 4, facility_id: facilityID, id: userIDForSearch, user_surname: userSurnameForSearch, birth_year: userBirthYearForSearch }
                var url = 'http://localhost:8080/users/searchUsers2/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllUsers(await checkUserAffiliation(res, usersFromGroup))
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        event.preventDefault()
        await searchUsers()
    }

    const checkUserAffiliation = async (usersArray, usersInGroup) => {
        var x= usersArray.filter(({id: x}) => !usersInGroup.some(({id: y}) => x === y))
        return x
    }

    function moveOneOutOfGroupFunction(e) {
        var tempArray = []
        tempArray = moveOutOfGroup
        tempArray.push(e)
        setMoveOutOfGroup(tempArray)
    }

    function moveOneToGroupFunction(e) {
        var tempArray = []
        tempArray = moveToGroup
        tempArray.push(e)
        setMoveToGroup(tempArray)
    }

    async function addStudentsToGroup() {
        //add selected students to group:
        const addStudents = async () => {
            try {
                var dataToSend = { id: groupID, students_array: moveToGroup }
                var url = 'http://localhost:8080/groups/addStudentsToGroup/'
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Operacja dodawania studentów do grupy przebiegła pomyślnie!", icon: "success" });
            } catch (err) {
                swal("Błąd...", "Operacja dodawania studentów do grupy zakończona niepowodzeniem!", "error");
            }
        }
        await addStudents()
        window.location.reload(true)
    }

    async function deleteStudentsFromGroup() {
        //delete selected students from group:
        const deleteStudents = async () => {
            try {
                var dataToSend = { id: groupID, students_array: moveOutOfGroup }
                var url = 'http://localhost:8080/groups/deleteStudentsFromGroup/'
                await axios.post(url, dataToSend, config)
                await swal({ title: "Udało się!", text: "Operacja usuwania studentów z grupy przebiegła pomyślnie!", icon: "success" });
            } catch (err) {
                swal("Błąd...", "Operacja usuwania studentów z grupy zakończona niepowodzeniem!", "error");
            }
        }
        await deleteStudents()
        window.location.reload(true)
    }

    //fetch and set all students from group:
    const fetchAndSetStudentsFromGroup = async () => {
        try {
            var dataToSend = { id: groupID }
            var url = 'http://localhost:8080/users/getAllStudentsFromGroup/'
            const { data: res } = await axios.post(url, dataToSend, config)
            setUsersFromGroup(res)
            return res
        } catch (err) {
            swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
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

        //fetch and set all students from facility:
        const fetchAndSetAllUsersFromFacility = async () => {
            try {
                var dataToSend = { id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/users/getAllStudentsFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                var tempUsersFromGroup = await fetchAndSetStudentsFromGroup()
                setAllUsers(await checkUserAffiliation(res, tempUsersFromGroup))
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchAndSetAllUsersFromFacility()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <div className={styles.upper_part}>
                    <div className={styles.box_title}>
                        Grupa {groupID}
                    </div>
                    <div className={styles.box_title}>
                        Filtruj studentów:
                    </div>
                    <div className={styles.box_border_upper}>
                        <div className={styles.test}>
                            <form onSubmit={handleSearch}>
                                <div className={styles.one_element}>
                                    <div className={styles.label}> Podaj ID:</div>
                                    <input
                                        type="number"
                                        placeholder="ID studenta"
                                        name="userID"
                                        onChange={e => setUserIDForSearch(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.small_text}> Lub / i</div>
                                <div className={styles.one_element}>
                                    <div className={styles.label}> Podaj nazwisko:</div>
                                    <input
                                        type="text"
                                        placeholder="Nazwisko studenta"
                                        name="userSurname"
                                        onChange={e => setUserSurnameForSearch(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.small_text}> Lub / i</div>
                                <div className={styles.one_element}>
                                    <div className={styles.label}> Podaj rok urodzenia:</div>
                                    <input
                                        type="number"
                                        min="1900"
                                        max="2099"
                                        step="1"
                                        placeholder="Rok urodzenia studenta"
                                        name="userBirthYear"
                                        onChange={e => setUserBirthYearForSearch(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                <button type="submit"
                                    className={styles.search_users_btn}>
                                    Filtruj
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className={styles.left_side}>
                    <div className={styles.box_title}>
                        Studenci:
                    </div>
                    <div className={styles.box_border_left}>
                        {
                            allUsers.map((entry, key) => (
                                entry.id !== null ?
                                    <div className={styles.one_classroom_data}>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>ID:</div>
                                            {entry.id}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Nazwisko:</div>
                                            {entry.surname}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Imię:</div>
                                            {entry.first_name}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Data urodzenia:</div>
                                            {entry.birth_date ? entry.birth_date.slice(0, 10) : "brak"}
                                        </div>
                                        <button className={styles.navigation_btn}>
                                            <input type="checkbox" id={key} value={key} onChange={e => moveOneToGroupFunction(entry.id)} />
                                        </button>
                                    </div>
                                    :
                                    <div>Brak sal dla tej placówki!</div>
                            ))
                        }
                    </div>
                </div>
                <div className={styles.middle}>
                    <div className={styles.box_middle}>
                        <button className={styles.middle_btn} onClick={e => addStudentsToGroup()}>
                            <BsFillCaretRightFill size={25} />
                        </button>
                        <button className={styles.middle_btn} onClick={e => deleteStudentsFromGroup()}>
                            <BsFillCaretLeftFill size={25} />
                        </button>
                    </div>
                </div>
                <div className={styles.right_side}>
                    <div className={styles.box_title}>
                        Studenci w grupie:
                    </div>
                    <div className={styles.box_border_right}>
                        {
                            usersFromGroup.map((entry, key) => (
                                entry.id !== null ?
                                    <div className={styles.one_classroom_data}>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>ID:</div>
                                            {entry.id}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Nazwisko:</div>
                                            {entry.surname}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Imię:</div>
                                            {entry.first_name}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>Data urodzenia:</div>
                                            {entry.birth_date !== null ? entry.birth_date.slice(0, 10) : "brak"}
                                        </div>
                                        <button className={styles.navigation_btn}>
                                            <input type="checkbox" id={key} value={key} onChange={e => moveOneOutOfGroupFunction(entry.id)} />
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
                            <Link to="/displayListOfGroups">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Przypisywanie studentów do grupy
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
export default AssignStudents