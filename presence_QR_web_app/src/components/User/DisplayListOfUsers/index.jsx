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
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityID, setFacilityID] = useState("")

    const [allFacilities, setAllFacilities] = useState([])
    const [allGroups, setAllGroups] = useState([])

    const [userRoleForSearch, setUserRoleForSearch] = useState("")
    const [userIDForSearch, setUserIDForSearch] = useState("")
    const [userSurnameForSearch, setUserSurnameForSearch] = useState("")
    const [facilityIDForSearch, setFacilityIDForSearch] = useState("")
    const [groupIDForSearch, setGroupIDForSearch] = useState("")

    const [users, setUsers] = useState([])

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
        if (role === 2) {
            return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
        }
    }

    async function handleSearch(event) {
        const searchUsers = async () => {
            var dataToSend
            if (role === 1) {
                dataToSend = { user_role: userRoleForSearch, id: userIDForSearch, user_surname: userSurnameForSearch, user_facility: facilityIDForSearch, user_group: groupIDForSearch }
            } else if (role === 2) {
                dataToSend = { user_role: userRoleForSearch, id: userIDForSearch, user_surname: userSurnameForSearch, user_facility: facilityID, user_group: groupIDForSearch }
            }
            try {
                var url = 'http://localhost:8080/users/searchUsers/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setUsers(res)
            } catch (err) {
                swal("Error", "Error code: " + err.response.status + "\nError name: " + err.code + "\nError content: " + err.toString() + "\n Info: " + err.response.data, "error");
            }
        }
        event.preventDefault()
        await searchUsers()
    }

    function displayFacilityLogo(key) {
        return <img src={'http://localhost:8080/logos/' + key + '.png'} className={styles.logo_box} alt="facility logo" />
    }

    async function goToExport() {
        var usersID = []
        for (var i = 0; i < users.length; i++) {
            usersID.push(users[i].id)
        }
        window.location.replace("/exportUsers/" + usersID)
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

        //fetch and set all facilities:
        if (decodedJWT.user_role === 1) {
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
        }

        //fetch and set all groups:
        if (decodedJWT.user_role === 2) {
            const fetchAndSetAllGroups = async () => {
                try {
                    var dataToSend = { id: decodedJWT.facility_id }
                    var url = 'http://localhost:8080/groups/getAllGroupsFromFacility/'
                    const { data: res } = await axios.post(url, dataToSend, config)
                    setAllGroups(res)
                } catch (err) {
                    swal("Error", "Error code: " + err.response.status + "\nError name: " + err.code + "\nError content: " + err.toString() + "\n Info: " + err.response.data, "error");
                }
                setLoading(false)
            }
            fetchAndSetAllGroups()
        }
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.content_box}>
                <div className={styles.left_side}>
                    <div className={styles.box_title}>
                        {t("displayListOfUsers:searchBoxTitle")}
                    </div>
                    <form onSubmit={handleSearch}>
                        <div className={styles.box_border_left}>
                            <div className={styles.label}>{t("displayListOfUsers:userRoleSelect")}</div>
                            <div className={styles.radio_box}>
                                {
                                    role === 1 ?
                                        <select name="roles" id="roles" className={styles.radio_input} onChange={e => setUserRoleForSearch(e.target.value)} required>
                                            <option disabled selected value>{t("displayListOfUsers:userRoleDefault")}</option>
                                            <option value={2} >{t("facilityManager")}</option>
                                        </select>
                                        :
                                        <select name="roles" id="roles" className={styles.radio_input} onChange={e => setUserRoleForSearch(e.target.value)} required>
                                            <option disabled selected value>{t("displayListOfUsers:userRoleDefault")}</option>
                                            <option value={3} >{t("lecturer")}</option>
                                            <option value={4} >{t("student")}</option>
                                        </select>
                                }
                            </div>
                            <div className={styles.small_text}>{t("displayListOfUsers:andOrText")}</div>
                            <div className={styles.label}>{t("displayListOfUsers:userIDLabel")}</div>
                            <input
                                type="text"
                                placeholder={t("displayListOfUsers:userIDLabel")}
                                name="userID"
                                onChange={e => setUserIDForSearch(e.target.value)}
                                className={styles.input}
                            />
                            <div className={styles.small_text}>{t("displayListOfUsers:andOrText")}</div>
                            <div className={styles.label}>{t("displayListOfUsers:userSurnameLabel")}</div>
                            <input
                                type="text"
                                placeholder={t("displayListOfUsers:userSurnamePlaceholder")}
                                name="userSurname"
                                onChange={e => setUserSurnameForSearch(e.target.value)}
                                className={styles.input}
                            />
                            {role === 1 ?
                                <div>
                                    <div className={styles.small_text}>{t("displayListOfUsers:andOrText")}</div>
                                    <div className={styles.label}>{t("displayListOfUsers:facilitySelect")}</div>
                                    <div className={styles.radio_box}>
                                        <select name="facilities" id="facilities" className={styles.radio_input} onChange={e => setFacilityIDForSearch(e.target.value)}>
                                            <option disabled selected value>{t("displayListOfUsers:selectFacilityDefault")}</option>
                                            {allFacilities.map((entry, key) => (
                                                entry.id !== null ?
                                                    <option value={entry.id} >{entry.facility_name}</option>
                                                    :
                                                    <div>{t("displayListOfUsers:facilityError")}</div>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                : role === 2 && userRoleForSearch === '4' ?
                                    <div>
                                        <div className={styles.small_text}>{t("displayListOfUsers:andOrText")}</div>
                                        <div className={styles.label}>{t("displayListOfUsers:selectGroupLabel")}</div>
                                        <div className={styles.radio_box}>
                                            <select name="groups" id="groups" className={styles.radio_input} onChange={e => setGroupIDForSearch(e.target.value)}>
                                                <option selected value={""}>{t("displayListOfUsers:selectGroupDefault")}</option>
                                                {allGroups.map((entry, key) => (
                                                    entry.id !== null ?
                                                        <option value={entry.id} >{entry.group_name}</option>
                                                        :
                                                        <div>{t("displayListOfUsers:groupError")}</div>
                                                ))}
                                            </select>
                                        </div>
                                    </div> :
                                    <div></div>
                            }
                        </div>
                        {userRoleForSearch !== "" ?
                            <button type="submit"
                                className={styles.search_facility_btn}>
                                {t("displayListOfUsers:searchButton")}
                            </button>
                            :
                            <div>{t("displayListOfUsers:searchButtonComunicate")}</div>
                        }
                        {error && <div className={styles.error_msg}>{error}</div>}
                    </form>
                </div>
                <div className={styles.right_side}>
                    <div className={styles.box_title}>
                        {t("displayListOfUsers:resultsBoxTitle")}
                    </div>
                    <div className={styles.box_border_right}>
                        {
                            users.map((entry, key) => (
                                entry.id !== null ?
                                    <div className={styles.one_user_data}>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>{t("displayListOfUsers:resultsRole")}</div>
                                            <div className={styles.data}>{entry.role_id === 2 ? <div>{t("facilityManager")}</div> : entry.role_id === 3 ? <div>{t("lecturer")}</div> : entry.role_id === 4 ? <div>{t("student")}</div> : <div>Błąd!!</div>}</div>
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>ID:</div>
                                            {entry.id}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>{t("displayListOfUsers:resultsSurname")}</div>
                                            {entry.surname}
                                        </div>
                                        <div className={styles.data_part}>
                                            <div className={styles.label_inside_right_box}>{t("displayListOfUsers:resultsFirstName")}</div>
                                            {entry.first_name}
                                        </div>
                                        {entry.role_id === 3 ?
                                            <div className={styles.data_part}>
                                                <div className={styles.label_inside_right_box}>{t("displayListOfUsers:resultDegree")}</div>
                                                <div className={styles.data_line}>{entry.title}</div>
                                            </div>
                                            : entry.role_id === 4 ?
                                                <div>
                                                    <div className={styles.data_part}>
                                                        <div className={styles.label_inside_right_box}>{t("displayListOfUsers:resultGroup")}</div>
                                                        <div className={styles.data_line}>{entry.group_name}</div>
                                                    </div>
                                                    <div className={styles.data_part}>
                                                        <div className={styles.label_inside_right_box}>{t("displayListOfUsers:resultYear")}</div>
                                                        <div className={styles.data_line}>{entry.year}</div>
                                                    </div>
                                                    <div className={styles.data_part}>
                                                        <div className={styles.label_inside_right_box}>{t("displayListOfUsers:resultSemester")}</div>
                                                        <div className={styles.data_line}>{entry.semester}</div>
                                                    </div>
                                                </div>
                                                : <div></div>
                                        }
                                        <div className={styles.label_inside_right_box}>{displayFacilityLogo(entry.facility_id)}</div>
                                        <button className={styles.edit_user_btn}>
                                            <Link to={"/editUser/" + entry.id}>
                                                <BsFillArrowRightCircleFill size={23} />
                                                <BsPencil size={23} />
                                            </Link>
                                        </button>
                                    </div>
                                    :
                                    <div>{t("displayListOfUsers:noUsers")}</div>
                            ))
                        }
                    </div>
                    {users.length !== 0 ?
                        <button className={styles.export_users_btn} onClick={e => { goToExport() }}>
                            {t("displayListOfUsers:exportButton")}
                        </button>
                        :
                        <div>{t("displayListOfUsers:exportButtonComunicate")}</div>
                    }
                </div>
            </div>
        </div>
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
                            {t("displayListOfUsers:pageName")}
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