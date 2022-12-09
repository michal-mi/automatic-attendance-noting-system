import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsPersonCircle, BsFillGearFill } from "react-icons/bs"

const AddUser = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [role, setRole] = useState()
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")
    const [allFacilities, setAllFacilities] = useState([])
    const [allGroups, setAllGroups] = useState([])
    const [allEmails, setAllEmails] = useState([])
    const [userRole, setUserRole] = useState("")
    const [userFirstName, setUserFirstName] = useState("")
    const [userSecondName, setUserSecondName] = useState("")
    const [userSurname, setUserSurname] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [userFacility, setUserFacility] = useState("")
    const [userTitle, setUserTitle] = useState("")
    const [numberOfGroups, setNumberOfGroups] = useState([])
    const [userGroup,] = useState([])
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
        for (var i = 0; i < allEmails.length; i++) {
            //if user with this email exists:
            if (allEmails[i].e_mail === userEmail) {
                tempError += "Użytkownik o mailu " + userEmail + " już istnieje!\n"
            }
        }
        e.preventDefault()
        setError(tempError)

        //create user in user entity:
        const createUser = async () => {
            setError("")
            try {
                if (checkRegexData()) {
                    let dataToSend = { facility_id: userFacility, first_name: userFirstName, second_name: userSecondName, surname: userSurname, e_mail: userEmail, title: userTitle, birth_date: userBirthDate, role_id: userRole, group_id: userGroup }
                    console.log(dataToSend)
                    var url = 'http://localhost:8080/users/createUser/'
                    await axios.post(url, dataToSend, config)
                    await swal({ title: "Success!", text: "User created succesfully", icon: "success" });
                    window.location.reload(true)
                }
            } catch (err) {
                swal("Error...", err.response.data, "error")
            }
        }
        if (tempError === "") {
            createUser()
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
                swal("Error", "Error code: " + err.response.status + "\nError name: " + err.code + "\nError content: " + err.toString() + "\n Info: " + err.response.data, "error");
            }
        }
        if (decodedJWT.user_role === 2) {
            fetchAndSetFacilityLogo()
        }

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

        //fetch all facilities:
        const fetchAndSetAllFacitilies = async () => {
            try {
                var url = 'http://localhost:8080/facilities/getAllFacilities/'
                const { data: res } = await axios.get(url, config)
                setAllFacilities(res)
            } catch (err) {
                swal("Error", "Error code: " + err.response.status + "\nError name: " + err.code + "\nError content: " + err.toString() + "\n Info: " + err.response.data, "error");
            }
            setLoading(false)
        }
        fetchAndSetAllFacitilies()
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
                swal("Error", "Error code: " + err.response.status + "\nError name: " + err.code + "\nError content: " + err.toString() + "\n Info: " + err.response.data, "error");
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
                            <div className={styles.label}> {t("addUser:userRoleSelect")} </div>
                            {role === 1 ?
                                <div className={styles.radio_box}>
                                    <select name="roles" id="roles" className={styles.radio_input} onChange={e => setUserRole(e.target.value)} required>
                                        <option disabled selected value> {t("addUser:userRoleDefault")} </option>
                                        <option value='2' >{t("facilityManager")}</option>
                                    </select>
                                </div> :
                                <div className={styles.radio_box}>
                                    <select name="roles" id="roles" className={styles.radio_input} onChange={e => { setUserRole(e.target.value); setNumberOfGroups(0) }} required>
                                        <option disabled selected value> {t("addUser:userRoleDefault")} </option>
                                        <option value='3' >{t("lecturer")}</option>
                                        <option value='4' >{t("student")}</option>
                                    </select>
                                </div>
                            }
                        </div>
                    </div>
                    <div className={styles.one_line}>
                        <div className={styles.one_element}>
                            <div className={styles.label}> {t("addUser:firstNameLabel")}  </div>
                            <input
                                type="text"
                                placeholder={t("addUser:firstNamePlaceholder")}
                                name="userFirstName"
                                onChange={e => setUserFirstName(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.one_element}>
                            <div className={styles.label}> {t("addUser:secondNameLabel")} </div>
                            <input
                                type="text"
                                placeholder={t("addUser:secondNamePlaceholder")}
                                name="userSecondName"
                                onChange={e => setUserSecondName(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.one_element}>
                            <div className={styles.label}> {t("addUser:surnameLabel")} </div>
                            <input
                                type="text"
                                placeholder={t("addUser:surnamePlaceholder")}
                                name="userSurname"
                                onChange={e => setUserSurname(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                    </div>
                    <div className={styles.one_line}>
                        <div className={styles.one_element}>
                            <div className={styles.label}> {t("addUser:emailAddressLabel")} </div>
                            <input
                                type="email"
                                placeholder={t("addUser:emailAddressPlaceholder")}
                                name="emailAdress"
                                onChange={e => setUserEmail(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.one_element}>
                            <div className={styles.label}> {t("addUser:facilitySelect")} </div>
                            {role === 1 ?
                                <div className={styles.radio_box}>
                                    <select name="facilities" id="facilities" className={styles.radio_input} onChange={e => setUserFacilityFunction(e.target.value)} required>
                                        <option disabled selected value> {t("addUser:facilityDefault")} </option>
                                        {allFacilities.map((entry, key) => (
                                            entry.id !== null ?
                                                <option value={entry.id} >{entry.facility_name}</option>
                                                :
                                                <div>{t("addUser:errorLoadingFacilities")}</div>
                                        ))}
                                    </select>
                                </div>
                                :
                                <div className={styles.radio_box}>
                                    <select name="facilities" id="facilities" className={styles.radio_input} onChange={e => setUserFacilityFunction(e.target.value)} required>
                                        <option disabled selected value> {t("addUser:facilityDefault")} </option>
                                        {allFacilities.map((entry, key) => (
                                            entry.id !== null ?
                                                entry.id === facilityID ?
                                                    <option value={entry.id} >{entry.facility_name}</option>
                                                    :
                                                    <div></div>
                                                :
                                                <div>{t("addUser:errorLoadingFacilities")}</div>
                                        ))}
                                    </select>
                                </div>
                            }
                        </div>
                        {userRole === '3' ?
                            <div className={styles.one_element}>
                                <div className={styles.label}> {t("addUser:degreeLabel")}  </div>
                                <input
                                    type="text"
                                    placeholder="Tytuł naukowy"
                                    name="title"
                                    onChange={e => setUserTitle(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>
                            :
                            <div></div>
                        }
                        {userRole === '4' ?
                            <div className={styles.one_element}>
                                <div className={styles.label}> {t("addUser:numberOfGroupSelect")}  </div>
                                <select name="numberOfGroups" id="numberOfGroups" className={styles.radio_input} onChange={e => setNumberOfGroups(e.target.value)}>
                                    <option selected value={""}> {t("addUser:numberOfGroupsDefault")} </option>
                                    <option value={Number(1)} >1</option>
                                    <option value={Number(2)} >2</option>
                                    <option value={Number(3)} >3</option>
                                </select>
                            </div>
                            :
                            <div></div>
                        }
                    </div>
                    {numberOfGroups === '1' && userRole === '4' ?
                        <div className={styles.one_line}>
                            <div className={styles.one_element}>
                                <div className={styles.label}> {t("addUser:firstGroupSelect")} </div>
                                <select name="groups1" id="groups1" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                    <option disabled selected value> {t("addUser:firstGroupDefault")} </option>
                                    {allGroups.map((entry, key) => (
                                        entry.id !== null ?
                                            <option value={entry.id}>{entry.group_name}</option>
                                            :
                                            <div>{t("addUser:errorLoadingGroups")}</div>
                                    ))}
                                </select>
                            </div>
                        </div>
                        : numberOfGroups === '2' && userRole === '4' ?
                            <div className={styles.one_line}>
                                <div className={styles.one_element}>
                                    <div className={styles.label}> {t("addUser:firstGroupSelect")} </div>
                                    <select name="groups1" id="groups1" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                        <option disabled selected value> {t("addUser:firstGroupDefault")} </option>
                                        {allGroups.map((entry, key) => (
                                            entry.id !== null ?
                                                <option value={entry.id}>{entry.group_name}</option>
                                                :
                                                <div>{t("addUser:errorLoadingGroups")}</div>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.one_element}>
                                    <div className={styles.label}> {t("addUser:secondGroupSelect")}  </div>
                                    <select name="groups2" id="groups2" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                        <option disabled selected value> {t("addUser:secondGroupDefault")} </option>
                                        {allGroups.map((entry, key) => (
                                            entry.id !== null ?
                                                <option value={entry.id}>{entry.group_name}</option>
                                                :
                                                <div>{t("addUser:errorLoadingGroups")}</div>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            : numberOfGroups === '3' && userRole === '4' ?
                                <div className={styles.one_line}>
                                    <div className={styles.one_element}>
                                        <div className={styles.label}> {t("addUser:firstGroupSelect")} </div>
                                        <select name="groups1" id="groups1" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                            <option disabled selected value> {t("addUser:firstGroupDefault")} </option>
                                            {allGroups.map((entry, key) => (
                                                entry.id !== null ?
                                                    <option value={entry.id}>{entry.group_name}</option>
                                                    :
                                                    <div>{t("addUser:errorLoadingGroups")}</div>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.one_element}>
                                        <div className={styles.label}> {t("addUser:secondGroupSelect")}  </div>
                                        <select name="groups2" id="groups2" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                            <option disabled selected value> {t("addUser:secondGroupDefault")} </option>
                                            {allGroups.map((entry, key) => (
                                                entry.id !== null ?
                                                    <option value={entry.id}>{entry.group_name}</option>
                                                    :
                                                    <div>{t("addUser:errorLoadingGroups")}</div>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.one_element}>
                                        <div className={styles.label}> {t("addUser:thirdGroupSelect")}  </div>
                                        <select name="groups3" id="groups3" className={styles.radio_input} onChange={e => userGroup.push(Number(e.target.value))} required>
                                            <option disabled selected value> {t("addUser:thirdGroupDefault")} </option>
                                            {allGroups.map((entry, key) => (
                                                entry.id !== null ?
                                                    <option value={entry.id}>{entry.group_name}</option>
                                                    :
                                                    <div>{t("addUser:errorLoadingGroups")}</div>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                :
                                <div></div>
                    }
                    <div className={styles.one_line}>
                        <div className={styles.one_element_birth_date}>
                            {userRole === '4' ?
                                <div>
                                    <div className={styles.label}> {t("addUser:dateOfBirthLabel")}  </div>
                                    <input
                                        type="date"
                                        placeholder={t("addUser:birthDatePlaceholder")}
                                        name="birthDate"
                                        onChange={e => setUserBirthDate(e.target.value)}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                :
                                <div></div>
                            }
                        </div>
                        <div className={styles.one_element}>
                            <button type="submit"
                                className={styles.create_user_btn}>
                                {t("addUser:createButton")}
                            </button>
                        </div>
                        <div className={styles.one_element_birth_date}>
                            {error && <div className={styles.error_msg}>{error}</div>}
                        </div>
                    </div>
                </form>
                <div className={styles.button_box}>
                    <Link to="/importUsers" style={{ textDecoration: 'none' }}> <button className={styles.import_from_file_button}>{t("addUser:importFromFileButton")}</button></Link>
                </div>
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
                            <Link to="/manageUsersMenu">
                                <BsFillArrowLeftCircleFill />
                            </Link>
                            {displayShortFacilityLogo()}
                        </div>
                        <div className={styles.navbar_center}>
                            {t("addUser:pageName")}
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
export default AddUser