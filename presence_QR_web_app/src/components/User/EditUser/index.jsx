import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill, BsFillArrowRightCircleFill, BsFillTrashFill } from "react-icons/bs"

const EditUser = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const userID = useParams().id
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")
    const [allFacilities, setAllFacilities] = useState([])
    const [allGroups, setAllGroups] = useState([])
    const [userRole, setUserRole] = useState("")
    const [userFirstName, setUserFirstName] = useState("")
    const [userSecondName, setUserSecondName] = useState("")
    const [userSurname, setUserSurname] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [allEmails, setAllEmails] = useState([])
    const [oldEmail, setOldEmail] = useState("")
    const [userFacility, setUserFacility] = useState("")
    const [userTitle, setUserTitle] = useState("")
    const [numberOfGroups, setNumberOfGroups] = useState("")
    const [userGroup, setUserGroup] = useState([])
    const [userBirthDate, setUserBirthDate] = useState("")
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
        if (role === 2) {
            return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
        }
    }

    function checkRegexData() {
        let regexName = new RegExp("^[A-ZŻŹĆĄŚĘŁÓŃ]{1}[a-zżźćńółęąś]{0,29}$")
        let regexEmail = new RegExp("^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$")
        let regexTitle = new RegExp("^.{1,40}$")

        if(role === 1 || role === 2) {
            switch(true) {
                case (!regexName.test(userFirstName)): 
                    setError(t("addUser:nameNC"))
                    return false
                case (!(regexName.test(userSecondName) || userSecondName === "" || userSecondName === undefined)):
                    setError(t("addUser:secondNameNC"))
                    return false
                case (!regexName.test(userSurname)):
                    setError(t("addUser:surnameNC"))
                    return false
                case (!regexEmail.test(userEmail)):
                    setError(t("addUser:addressEmailNC"))
                    return false
                case (userFacility === "" || userFacility === undefined):
                    setError(t("addUser:facilityNC"))
                    return false
                case (userRole === "" || userRole === undefined):
                    setError(t("addUser:userRoleNC"))
                    return false
                case ((parseInt(userRole) === 3) && !regexTitle.test(userTitle)):
                    setError(t("addUser:degreeNC"))
                    return false
                default:
                    return true
            }
        } else {
            return false
        }
    }

    const handleSubmit = async (e) => {
        setError("")
        var tempError = ""
        if (userEmail !== oldEmail) {
            for (var i = 0; i < allEmails.length; i++) {
                //if user with this mail exists:
                if (allEmails[i].e_mail === userEmail) {
                    tempError += "Użytkownik o mailu " + userEmail + " już istnieje!\n"
                }
            }
        }
        e.preventDefault()
        setError(tempError)

        //create user in user entity:
        const editUser = async () => {
            setError("")
            try {
                if (checkRegexData()) {
                    let dataToSend = { id: userID, facility_id: userFacility, first_name: userFirstName, second_name: userSecondName, surname: userSurname, e_mail: userEmail, title: userTitle, birth_date: userBirthDate, role_id: userRole, group_id: userGroup }
                    var url = 'http://localhost:8080/users/editUser/'
                    await axios.post(url, dataToSend, config)
                    await swal({ title: "Udało się!", text: "Dane użytkownika zostały zmienione!", icon: "success" });
                    window.location.reload(true)
                }
            } catch (err) {
                swal("Error...", err.response.data, "error")
            }
        }
        if (tempError === "") {
            editUser()
        }
        e.preventDefault()
    }

    //delete user from chosen group (student_group entity):
    async function deleteUserFromGroup(key) {
        try {
            let dataToSend = { id: userID, group_id: key }
            var url = 'http://localhost:8080/users/deleteUserFromGroup/'
            await axios.post(url, dataToSend, config)
            await swal({ title: "Udało się!", text: "Użytkownik został usunięty z grupy!", icon: "success" });
            window.location.reload(true)
        } catch (err) {
            swal("Błąd...", "Operacja usunięcia użytkownika z grupy zakończona niepowodzeniem!", "error");
        }
    }

    //delete user from user entity:
    async function deleteUser() {
            swal({
                title: "Czy jesteś pewny?",
                text: "Użytkownik zostanie usunięty bezpowrotnie!",
                icon: "warning",
                buttons: [
                  'Anuluj',
                  'Zatwierdź'
                ],
                dangerMode: true,
              }).then(function(isConfirm) {
                if (isConfirm) {
                    whenDeletationConfirmed()
                } else {
                  swal("Anulowano", "Dane użytkownika nie zostały usunięte", "error");
                }
              });

            const whenDeletationConfirmed = async () => {
                try {
                    let dataToSend = { id: userID, role_id: userRole, facility_id: facilityID }
                    var url = 'http://localhost:8080/users/deleteUser/'
                    await axios.post(url, dataToSend, config)
                    await swal({ title: "Udało się!", text: "Użytkownik został usunięty!", icon: "success" });
                    window.location.replace("http://localhost:3000/displayListOfUsers");
                } catch (err) {
                    swal("Błąd...", "Operacja usunięcia użytkownika zakończona niepowodzeniem!", "error");
                }
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
        if (decodedJWT.user_role === 2) {
            fetchAndSetFacilityLogo()
        }

        //fetch all facilities:
        const fetchAndSetAllFacitilies = async () => {
            try {
                var url = 'http://localhost:8080/facilities/getAllFacilities/'
                const { data: res } = await axios.get(url, config)
                setAllFacilities(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetAllFacitilies()

        //fetch all emails:
        const fetchAndSetAllEmails = async () => {
            try {
                var url = 'http://localhost:8080/users/getAllEmails/'
                const { data: res } = await axios.get(url, config)
                setAllEmails(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetAllEmails()

        //fetch user data:
        const fetchUserData = async () => {
            var res
            try {
                var dataToSend = { id: userID }
                var url = 'http://localhost:8080/users/oneUserDataByIDForEditing/'
                res = await axios.post(url, dataToSend, config)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            res = res.data
            setUserRole(res[0].role_id)
            setUserFirstName(res[0].first_name)
            setUserSecondName(res[0].second_name)
            setUserSurname(res[0].surname)
            setUserEmail(res[0].e_mail)
            setOldEmail(res[0].e_mail)
            setUserFacility(res[0].facility_id)
            setUserTitle(res[0].title)
            //if user is assigned to one or more then one group:
            if (res.length >= 1 && userGroup.length === 0) {
                for (var i = 0; i < res.length; i++) {
                    if (res[i].group_id !== null) {
                        userGroup.push(Number(res[i].group_id))
                    }
                }
                //if user is not assigned to any group:
            }
            else if (res.length === 1 && userGroup.length === 0) {
                setUserGroup([])
            }
            var facility_id = res[0].facility_id
            if (res[0].role_id === 4) {
                setUserBirthDate(res[0].birth_date.split('T')[0])
                try {
                    const dataToSend = { id: facility_id }
                    url = 'http://localhost:8080/groups/getAllGroupsFromFacility/'
                    const { data: res } = await axios.post(url, dataToSend, config)
                    setAllGroups(res)
                } catch (err) {
                    swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
                }
            }
            setLoading(false)
        }
        fetchUserData()
    }, []);

    function setUserFacilityFunction(facilityID) {
        setUserFacility(facilityID)
        const fetchAndSetAllGroups = async () => {
            try {
                const dataToSend = { id: facilityID }
                var url = 'http://localhost:8080/groups/getAllGroupsFromFacility/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setAllGroups(res)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        fetchAndSetAllGroups()
    }

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.choose_user_role}>
                        <div className={styles.one_element}>
                            <div className={styles.label}> Podaj typ użytkownika* </div>
                            {role === 1 ?
                                <div className={styles.radio_box}>
                                    <select name="roles" id="roles" className={styles.radio_input} onChange={e => setUserRole(Number(e.target.value))} required>
                                        <option value='2' selected>Menedżer placówki</option>
                                    </select>
                                </div> :
                                <div className={styles.radio_box}>
                                    {userRole === 3 ?
                                        <select name="roles" id="roles" className={styles.radio_input} onChange={e => setUserRole(Number(e.target.value))} required>
                                            <option value='3' selected>Prowadzący zajęcia</option>
                                            <option value='4' >Student</option>
                                        </select>
                                        :
                                        <select name="roles" id="roles" className={styles.radio_input} onChange={e => setUserRole(Number(e.target.value))} required>
                                            <option value='3' >Prowadzący zajęcia</option>
                                            <option value='4' selected>Student</option>
                                        </select>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                    <div className={styles.one_line}>
                        <div className={styles.one_element}>
                            <div className={styles.label}> Imię* </div>
                            <input
                                type="text"
                                placeholder="Imię"
                                name="userFirstName"
                                value={userFirstName}
                                onChange={e => setUserFirstName(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.one_element}>
                            <div className={styles.label}> Drugie imię </div>
                            <input
                                type="text"
                                placeholder="Drugie imię"
                                name="userSecondName"
                                value={userSecondName}
                                onChange={e => setUserSecondName(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.one_element}>
                            <div className={styles.label}> Nazwisko* </div>
                            <input
                                type="text"
                                placeholder="Nazwisko"
                                name="userSurname"
                                value={userSurname}
                                onChange={e => setUserSurname(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>
                    <div className={styles.one_line}>
                        <div className={styles.one_element}>
                            <div className={styles.label}> Adres email* </div>
                            <input
                                type="email"
                                placeholder="Adres email"
                                name="emailAdress"
                                value={userEmail}
                                onChange={e => setUserEmail(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.one_element}>
                            <div className={styles.label}> Placówka* </div>
                            {role === 1 ?
                                <div className={styles.radio_box}>
                                    <select name="facilities" id="facilities" className={styles.radio_input} onChange={e => setUserFacilityFunction(Number(e.target.value))} required>
                                        {allFacilities.map((entry, key) => (
                                            entry.id !== null ?
                                                entry.id === userFacility ?
                                                    <option value={entry.id} selected>{entry.facility_name}</option>
                                                    :
                                                    <option value={entry.id} >{entry.facility_name}</option>
                                                :
                                                <div>Błąd ładowania placówek!</div>
                                        ))}
                                    </select>
                                </div>
                                :
                                <div className={styles.radio_box}>
                                    <select name="facilities" id="facilities" className={styles.radio_input} onChange={e => setUserFacilityFunction(Number(e.target.value))} required>
                                        {allFacilities.map((entry, key) => (
                                            entry.id !== null ?
                                                entry.id === facilityID ?
                                                    <option value={entry.id} selected>{entry.facility_name}</option>
                                                    :
                                                    <div></div>
                                                :
                                                <div>Błąd ładowania placówek!</div>
                                        ))}
                                    </select>
                                </div>
                            }
                        </div>
                        {userRole === 3 ?
                            <div className={styles.one_element}>
                                <div className={styles.label}> Stopień naukowy* </div>
                                <input
                                    type="text"
                                    placeholder="Tytuł naukowy"
                                    name="title"
                                    value={userTitle}
                                    onChange={e => setUserTitle(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>
                            :
                            <div></div>
                        }
                    </div>
                    <div className={styles.one_line}>
                        {userGroup.length === 0 && userRole === 4 ?
                            <div>
                                <div className={styles.one_element}>
                                    <div className={styles.label}> Liczba grup </div>
                                    <select name="numberOfGroups" id="numberOfGroups" className={styles.radio_input} onChange={e => setNumberOfGroups(e.target.value)}>
                                        <option disabled selected value> -- wybierz liczbę grup -- </option>
                                        <option value={Number(1)} >1</option>
                                        <option value={Number(2)} >2</option>
                                        <option value={Number(3)} >3</option>
                                    </select>
                                </div>
                                {numberOfGroups === '1' ?
                                    <div className={styles.one_line}>
                                        <div className={styles.one_element}>
                                            <div className={styles.label}> Wybierz grupę I* </div>
                                            <select name="groups1" id="groups1" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                                <option disabled selected value> -- wybierz grupę I -- </option>
                                                {allGroups.map((entry, key) => (
                                                    entry.id !== null ?
                                                        <option value={entry.id}>{entry.group_name}</option>
                                                        :
                                                        <div>Błąd ładowania grup!</div>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    : numberOfGroups === '2' ?
                                        <div className={styles.one_line}>
                                            <div className={styles.one_element}>
                                                <div className={styles.label}> Wybierz grupę I* </div>
                                                <select name="groups1" id="groups1" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                                    <option disabled selected value> -- wybierz grupę I -- </option>
                                                    {allGroups.map((entry, key) => (
                                                        entry.id !== null ?
                                                            <option value={entry.id}>{entry.group_name}</option>
                                                            :
                                                            <div>Błąd ładowania grup!</div>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className={styles.one_element}>
                                                <div className={styles.label}> Wybierz grupę II* </div>
                                                <select name="groups2" id="groups2" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                                    <option disabled selected value> -- wybierz grupę II -- </option>
                                                    {allGroups.map((entry, key) => (
                                                        entry.id !== null ?
                                                            <option value={entry.id}>{entry.group_name}</option>
                                                            :
                                                            <div>Błąd ładowania grup!</div>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        : numberOfGroups === '3' ?
                                            <div className={styles.one_line}>
                                                <div className={styles.one_element}>
                                                    <div className={styles.label}> Wybierz grupę I* </div>
                                                    <select name="groups1" id="groups1" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                                        <option disabled selected value> -- wybierz grupę I -- </option>
                                                        {allGroups.map((entry, key) => (
                                                            entry.id !== null ?
                                                                <option value={entry.id}>{entry.group_name}</option>
                                                                :
                                                                <div>Błąd ładowania grup!</div>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className={styles.one_element}>
                                                    <div className={styles.label}> Wybierz grupę II* </div>
                                                    <select name="groups2" id="groups2" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                                        <option disabled selected value> -- wybierz grupę II -- </option>
                                                        {allGroups.map((entry, key) => (
                                                            entry.id !== null ?
                                                                <option value={entry.id}>{entry.group_name}</option>
                                                                :
                                                                <div>Błąd ładowania grup!</div>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className={styles.one_element}>
                                                    <div className={styles.label}> Wybierz grupę III* </div>
                                                    <select name="groups3" id="groups3" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                                        <option disabled selected value> -- wybierz grupę III -- </option>
                                                        {allGroups.map((entry, key) => (
                                                            entry.id !== null ?
                                                                <option value={entry.id}>{entry.group_name}</option>
                                                                :
                                                                <div>Błąd ładowania grup!</div>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            :
                                            <div></div>
                                }
                            </div>
                            :
                            <div></div>
                        }
                        {userGroup.length >= 1 && userRole === 4 ?
                            userGroup.map((entry, key) => (
                                entry.id !== null ?
                                    <div className={styles.one_element}>
                                        <div className={styles.label1}><div className={styles.label1_part}> Grupa </div>
                                            <div onClick={e => deleteUserFromGroup(entry)}>
                                                <BsFillTrashFill size={24} />
                                            </div>
                                        </div>
                                        <select name="groups" id="groups" className={styles.radio_input} onChange={e => userGroup[key] = Number(e.target.value)}>
                                            {allGroups.map((entry1, key1) => (
                                                entry1.id !== null ?
                                                    entry1.id === entry ?
                                                        <option value={entry1.id} selected>{entry1.group_name}</option>
                                                        : userGroup === null ?
                                                            <option disabled selected value> -- wybierz grupę -- </option>
                                                            :
                                                            <option value={entry1.id} >{entry1.group_name}</option>
                                                    :
                                                    <div>Błąd ładowania grup!</div>
                                            ))}
                                        </select>
                                    </div>
                                    :
                                    <div></div>
                            ))
                            :
                            <div></div>
                        }
                    </div>
                    <div className={styles.one_line}>
                        <div className={styles.one_element_birth_date}>
                            {userRole === 4 ?
                                <div>
                                    <div className={styles.label}> Data urodzenia* </div>
                                    <input
                                        type="date"
                                        placeholder="Data urodzenia"
                                        name="birthDate"
                                        value={userBirthDate}
                                        onChange={e => setUserBirthDate(e.target.value)}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                :
                                <div></div>
                            }
                        </div>
                    </div>
                    <div className={styles.one_line}>
                        <div className={styles.one_element}>
                            <button type="submit"
                                className={styles.modify_user_btn}>
                                Zapisz zmiany
                            </button>
                        </div>
                        <div className={styles.one_element}>
                            <div onClick={(e) => { deleteUser() }}
                                className={styles.delete_user_btn}>
                                Usuń użytkownika
                            </div>
                        </div>
                        <div className={styles.one_element_birth_date}>
                            {error && <div className={styles.error_msg}>{error}</div>}
                        </div>
                    </div>
                </form>
            </div >
        </div >
    }

    function displayRole() {
        if (role === 1) {
            return <div className={styles.role_box}>{t("loggedAsAdmin")}</div>
        } else if (role === 2) {
            return <div className={styles.role_box}>{t("loggedAsFacilityManager")}</div>
        } else {
            return <div>{t("roleBoxError")}</div>
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
                            <Link to="/displayListOfUsers">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            Szczegóły / edycja użytkownika
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
                    {role === 1 ?
                        userRole === 2 ?
                            displayContent()
                            :
                            <div className={styles.main_error_msg}>Nie masz prawa edytować tego użytkownika!</div>
                        : userRole === 3 || userRole === 4 ?
                            displayContent()
                            :
                            <div className={styles.main_error_msg}>Nie masz prawa edytować tego użytkownika!</div>
                    }
                </div>
            }
            {displayRole()}
        </div>
    )
}
export default EditUser