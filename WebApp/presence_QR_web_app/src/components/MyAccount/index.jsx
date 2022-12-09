import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import styles from "./styles.module.css"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import { BsFillArrowLeftCircleFill, BsBoxArrowLeft, BsFillGearFill, BsPencil, BsArrowsFullscreen, BsXCircle, BsFillTrashFill } from "react-icons/bs"
var bcrypt = require('bcryptjs');

const MyAccount = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [userData, setUserData] = useState({ id: "", first_name: "", surname: "", e_mail: "", avatar: "", facility_id: "", title: "" })
    const [role, setRole] = useState()
    const [avatarLink, setAvatarLink] = useState("")
    const [facilityShortLogoLink, setFacilityShortLogoLink] = useState("")
    const [facilityLogoLink, setFacilityLogoLink] = useState("")
    const [facilityName, setFacilityName] = useState("")
    const [error, setError] = useState("")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [repeatedPassword, setRepeatedPassword] = useState("")
    const [uploadWindowOpen, setUploadWindowOpen] = useState(false)
    const [imageIsZoomed, setImageIsZoomed] = useState(null)

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

    async function handleSubmit(e) {
        setError("")
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        e.preventDefault()

        const fetchUserPassword = async () => {
            try {
                var dataToSend = { id: decodedJWT.id }
                var url = 'http://localhost:8080/users/oneUserPasswordByID/'
                const { data: res } = await axios.post(url, dataToSend, config)
                var pswd = res[0].hash_password.data
                return pswd
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        const userPswdFromDB = await fetchUserPassword()

        const check = async () => {
            const result = await bcrypt.compare(oldPassword.target.value, toString(userPswdFromDB))
            return result
        }
        const pswdCorrect = await check()

        //verifying if old password is correct:
        if (pswdCorrect) {
            //checking if new password is different than old password:
            if (newPassword.target.value !== oldPassword.target.value) {
                //checking if the new password meets the rules:
                if (isPasswordStrong()) {
                    //checking if new password was repeated correctly:
                    if (newPassword.target.value === repeatedPassword.target.value) {
                        async function hashIt(password) {
                            const salt = await bcrypt.genSalt(12);
                            const hashed = await bcrypt.hash(password, salt);
                            return hashed
                        }
                        const hashedNewPassword = await hashIt(newPassword.target.value)

                        try {
                            var dataToSend = { id: decodedJWT.id, oldPassword: oldPassword.target.value, newPassword: hashedNewPassword }
                            var url = 'http://localhost:8080/users/changeOneUserPasswordByID/'
                            await axios.post(url, dataToSend, config)
                            await swal({ title: "Udało się!", text: "Hasło zostało zmienione!", icon: "success" });
                            window.location.reload(true)
                        } catch (err) {
                            swal("Błąd...", "Operacja zmiany hasła zakończona niepowodzeniem!", "error");
                        }

                    } else {
                        setError("Hasła różnią się od siebie!")
                    }
                }
            } else {
                setError("Ustaw nowe hasło!")
            }
        } else {
            setError("Stare hasło niepoprawne!")
        }
        e.preventDefault()
    }

    const toString = (bytes) => {
        var result = '';
        for (var i = 0; i < bytes.length; ++i) {
            result += getCode(bytes[i]);
        }
        return decodeURIComponent(result);
    };

    const getCode = (byte) => {
        const text = byte.toString(16);
        if (byte < 16) {
            return '%0' + text;
        }
        return '%' + text;
    };

    const isPasswordStrong = () => {
        //checking if the new password meets the rules:
        //min. 8 chars:)
        if (newPassword.target.value.length >= 8) {
            //min. 1 number:
            let regex1 = new RegExp(".*[0-9].*")
            if (regex1.test(newPassword.target.value)) {
                //min. 1 special sign:
                let regex2 = new RegExp("(?=.*[!@#$%^&*])")
                if (regex2.test(newPassword.target.value)) {
                    return true
                } else {
                    setError("Hasło musi posiadać min. 1 znak spec.!")
                }
            } else {
                setError("Hasło musi posiadać min. 1 cyfrę!")
            }
        } else {
            setError("Nowe hasło ma za mało znaków!")
        }
        return false
    }

    // async function addAvatar 
    const addAvatar = async (e) => {
        var res1 = true
        var res2 = true
        //uploads image to the server:
        const uploadAvatarToServer = async () => {
            try {
                let dataToSend = new FormData();
                var decodedJWT = parseJwt(sessionStorage.getItem("token"))
                dataToSend.append('file', e, decodedJWT.id);
                var url = 'http://localhost:8080/users/changeOneUserAvatarByID/'
                let config = {
                    headers: {
                        'accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.8',
                        'Content-Type': `multipart/form-data; boundary=${dataToSend._boundary}`,
                        'Authorization': `${sessionStorage.getItem("token")}`
                    }
                }
                await axios.post(url, dataToSend, config)
                res1 = true
            } catch (err) {
                res2 = false
            }
        }
        await uploadAvatarToServer()
        //changes reference in database (so there is information saved that user has his own avatar - not the default one):
        const setAvatarReference = async () => {
            try {
                var dataToSend = { id: userData[0].id }
                var url = 'http://localhost:8080/users/changeOneUserAvatarReferenceByID/'
                await axios.post(url, dataToSend, config)
            } catch (err) {
                res2 = false
            }
        }
        setAvatarReference()
        if (res1 && res2) {
            await swal({ title: "Udało się!", text: "Operacja dodawania avatara przebiegła pomyślnie!", icon: "success" });
            window.location.reload(true)
        } else {
            swal("Błąd...", "Operacja dodawania avatara nieudana!", "error");
        }
        window.location.reload(false)
    }

    const deleteAvatar = async (e) => {
        swal({
            title: "Czy na pewno chcesz usunąć swój avatar?",
            text: "Operacja będzie nieodwracalna!",
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
                swal("Anulowano", "Avatar nie został usunięty", "error");
            }
        });

        const whenDeletationConfirmed = async () => {
            var res1 = true
            var res2 = true
            //changes reference in database (so there is information saved that user has no avatar):
            const deleteAvatarReference = async () => {
                try {
                    var dataToSend = { id: userData[0].id }
                    var url = 'http://localhost:8080/users/deleteOneUserAvatarReferenceByID/'
                    await axios.post(url, dataToSend, config)
                } catch {
                    res1 = false
                }
            }
            deleteAvatarReference()
            //delete image (avatar) from server:
            const deleteAvatar = async () => {
                try {
                    var dataToSend = { id: userData[0].id }
                    var url = 'http://localhost:8080/users/deleteOneUserAvatarByID/'
                    await axios.post(url, dataToSend, config)
                } catch {
                    res1 = false
                }
            }
            deleteAvatar()
            if (res1 && res2) {
                await swal({ title: "Udało się!", text: "Avatar usunięty pomyślnie!", icon: "success" });
                window.location.reload(true)
            } else {
                swal("Błąd...", "Operacja usuwania avatara zakończona niepowodzeniem!", "error");
            }
            window.location.reload(false)
        }
    }

    useEffect(() => {
        var decodedJWT = parseJwt(sessionStorage.getItem("token"))
        setRole(decodedJWT.user_role)

        //fetch facility data:
        const fetchAndSetFacilityData = async () => {
            try {
                var dataToSend = { id: decodedJWT.facility_id }
                var url = 'http://localhost:8080/facilities/getOneFacilityDataByID/'
                const { data: res } = await axios.post(url, dataToSend, config)
                setFacilityShortLogoLink('http://localhost:8080/logos/' + res[0].facility_logo + '_short.png')
                setFacilityLogoLink('http://localhost:8080/logos/' + res[0].facility_logo + '.png')
                setFacilityName(res[0].facility_name)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
        }
        if (decodedJWT.user_role === 2 || decodedJWT.user_role === 3) {
            fetchAndSetFacilityData()
        }

        //fetch user data:
        const fetchAndSetUserData = async () => {
            //get user data:
            var res
            try {
                var dataToSend = { id: decodedJWT.id }
                var url = 'http://localhost:8080/users/oneUserDataByID/'
                res = await axios.post(url, dataToSend, config)
                setUserData(res.data)
            } catch (err) {
                swal("Błąd", "Kod błędu: " + err.response.status + "\nNazwa błędu: " + err.code + "\nTreść błędu: " + err.toString() + "\n Informacje: " + err.response.data, "error");
            }
            res = res.data

            //set avatar link:
            //if user has no avatar:
            if (res[0].avatar === "") {
                setAvatarLink('http://localhost:8080/avatars/no_image_image.jpg')
                //if user has avatar (avatar name is user id):
            } else {
                setAvatarLink('http://localhost:8080/avatars/' + res[0].avatar + '.jpg')
            }
            setLoading(false)
            return res[0].facility_id
        }
        fetchAndSetUserData()
    }, []);

    function displayContent() {
        return <div className={styles.display_content}>
            <div className={styles.left_side}>
                <div className={styles.left_upper_box}>
                    <div className={styles.box_title}>
                        Ustawienie avatara
                        <img src={avatarLink} className={styles.avatar_box} alt="user's avatar" />
                        <div className={styles.avatar_icon1} onClick={() => {
                            setUploadWindowOpen(true)
                        }}>
                            <BsPencil size={22} strokeWidth={1} />
                            <div className={styles.circle1} />
                        </div>
                        <div className={styles.avatar_icon2} onClick={() => {
                            setImageIsZoomed(true)
                        }}>
                            <BsArrowsFullscreen size={22} strokeWidth={1} />
                            <div className={styles.circle2} />
                        </div>
                    </div>
                </div>
                {uploadWindowOpen ?
                    <div className={styles.modal}>
                        <div className={styles.close_modal_button} onClick={() => {
                            setUploadWindowOpen(false)
                        }}>
                            <BsXCircle size={27} strokeWidth={1} />
                        </div>
                        <input encType="multipart/form-data" type="file" name="myImage" onChange={(event) => { addAvatar(event.target.files[0]) }} className={styles.modal_content} />
                        {userData[0].avatar !== "" ?
                            <div className={styles.close_modal_button} onClick={() => {
                                deleteAvatar()
                                setUploadWindowOpen(false)
                            }}>
                                <BsFillTrashFill size={27} />
                            </div>
                            :
                            <div></div>
                        }
                    </div>
                    :
                    <div></div>
                }
                {imageIsZoomed ?
                    <div className={styles.modal}>
                        <div className={styles.close_modal_button} onClick={() => {
                            setImageIsZoomed(false)
                        }}>
                            <BsXCircle size={27} strokeWidth={1} />
                        </div>
                        <img src={avatarLink} alt="user's avatar" className={styles.modal_content} />
                    </div>
                    :
                    <div></div>
                }
                <div className={styles.left_bottom_box}>
                    <div className={styles.box_title}>
                        Moje dane
                    </div>
                    {userData[0] !== undefined ?
                        <div>
                            <div className={styles.dataLine}>
                                <div className={styles.label_left_side}> ID: </div>
                                <div className={styles.box_for_data}><div className={styles.data}>{userData[0].id}</div> </div>
                                <div className={styles.label_left_side}>Imię: </div>
                                <div className={styles.box_for_data}><div className={styles.data}>{userData[0].first_name}</div> </div>
                            </div>
                            <div className={styles.dataLine}>
                                {role === 3 ?
                                    <div className={styles.dataLine}>
                                        <div className={styles.label_left_side}> Nazwisko: </div>
                                        <div className={styles.box_for_data}><div className={styles.data}>{userData[0].surname}</div> </div>
                                        <div className={styles.label_left_side}> Stopień: </div>
                                        <div className={styles.box_for_data}><div className={styles.data}>{userData[0].title}</div> </div>
                                    </div>
                                    :
                                    <div className={styles.dataLine}>
                                        <div className={styles.label_left_side}> Nazwisko: </div>
                                        <div className={styles.box_for_data}><div className={styles.data}>{userData[0].surname}</div> </div>
                                    </div>
                                }
                            </div>
                            <div className={styles.dataLine}>
                                <div className={styles.label_left_side}> E-mail: </div>
                                <div className={styles.box_for_data}><div className={styles.data}>{userData[0].e_mail}</div> </div>
                            </div>
                            {role === 2 | role === 3 ?
                                <div>
                                    <div className={styles.dataLine}>
                                        <div className={styles.label_left_side}>Placówka: </div>
                                        <div className={styles.box_for_data}><div className={styles.data}>{facilityName}</div> </div>
                                        <div className={styles.label_left_side}>{displayFacilityLogo()}</div>
                                    </div>
                                </div>
                                :
                                <div></div>
                            }
                        </div>
                        :
                        <div></div>
                    }
                </div>
            </div >
            <div className={styles.right_side}>
                <div className={styles.right_box}>
                    <div className={styles.box_title}>
                        Zmiana hasła
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.input_group_size1}>
                            <div className={styles.label_right_side}> Podaj stare hało </div>
                            <input
                                type="password"
                                placeholder="Stare hasło"
                                name="oldPassword"
                                onChange={e => setOldPassword(e)}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.input_group_size1}>
                            <div className={styles.label_right_side}>Podaj nowe hasło</div>
                            <input
                                type="password"
                                placeholder="Nowe hasło"
                                name="NewPassword"
                                onChange={e => setNewPassword(e)}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.input_group_size1}>
                            <div className={styles.label_right_side}>Powtórz nowe hasło</div>
                            <input
                                type="password"
                                placeholder="Powtórz nowe hasło"
                                name="ReapeatedNewPassword"
                                onChange={e => setRepeatedPassword(e)}
                                required
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.pswd_info}>
                            Hasło powinno zawierać:
                            <ul className={styles.list}>
                                <li>minimum 8 znaków</li>
                                <li>minimum 1 liczbę</li>
                                <li>minimum 1 znak specjalny</li>
                                <li>minimum 1 dużą literę </li>
                            </ul>
                        </div>
                        <button type="submit"
                            className={styles.change_pswd_btn}>
                            Zatwierdź
                        </button>
                        {error && <div className={styles.error_msg}>{error}</div>}
                    </form>
                </div>
            </div>
        </div >
    }

    function displayShortFacilityLogo() {
        if (role === 2 || role === 3) {
            return <img src={facilityShortLogoLink} className={styles.navbar_logo_box} alt="facility logo short" />
        }
    }

    function displayFacilityLogo() {
        return <img src={facilityLogoLink} className={styles.navbar_logo_box} alt="facility logo" />
    }

    function displayRole() {
        if (role === 1) {
            return <div className={styles.role_box}>Zalogowano jako administrator</div>
        } else if (role === 2) {
            return <div className={styles.role_box}>Zalogowano jako menadżer placówki</div>
        } else if (role === 3) {
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
                            Moje konto
                        </div>
                        <div className={styles.navbar_right}>
                            <button type="button" onClick={handleLogout} className={styles.navbar_button}>
                                <BsBoxArrowLeft />
                            </button>
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
export default MyAccount