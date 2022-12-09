import { useState, useEffect } from "react"
import { Oval } from 'react-loader-spinner'
import axios from "axios"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import swal from 'sweetalert'
import styles from "./styles.module.css"
const Login = () => {

    const [isLoading, setLoading] = useState(true); // page loading state
    const [error, setError] = useState("")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [checkboxState, setCheckboxState] = useState(false)
    const { t } = useTranslation();

    //when 'log in' button was pressed:
    const handleSubmit = async (e) => {
        setError("")
        e.preventDefault()
        var dataToSend
        if (checkboxState) { //if checkbox is checked save email to local storage:
            localStorage.setItem("email", email)
            dataToSend = { email: localStorage.getItem("email"), password: password }
        } else { //if checkbox is not checked then remove saved email from local storage:
            localStorage.removeItem("email")
            dataToSend = { email: email, password: password }
        }

        try {
            const url = "http://localhost:8080/auth"
            const { data: res } = await axios.post(url, dataToSend)//send email and pswd to server side
            //if user is positively verified by server JWT token is received and set to session storage:
            sessionStorage.setItem("token", res.data)
            window.location = "/" //location is changed to main page
        } catch (err) {
            if (err.response.status === 401) {
                setError("Błędny email lub hasło!")
            } else if (err.response.status === 0) {
                setError("Brak połączenia z serwerem!")
                await swal("Error", "Error code: " + err.response.status + "\nError: brak połączenia z serwerem", "error");
            } else {
                await swal("Error", "Error code: " + err.response.status + "\nError name " + err.code + "\nError message: " + err.toString() + "\n Info: " + err.response.data, "error");
            }
            e.preventDefault()
        }
        e.preventDefault()
    };

    function changeChecboxState(checkbox) {
        if (checkbox.target.checked) {
            setCheckboxState(true)
        } else {
            setCheckboxState(false)
        }
    }

    useEffect(() => {
        if (localStorage.getItem("i18nextLng") === "en-US") {
            localStorage.setItem("i18nextLng", "en")
        }
        if (localStorage.getItem("email") !== null) {
            setCheckboxState(true)
            setEmail(localStorage.getItem("email"))
        }
        setLoading(false)
    }, []);

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
                <div className={styles.login_container}>
                    <div className={styles.left}>
                        <form className={styles.form_container}
                            onSubmit={handleSubmit}>
                            <h2>{t("loginPage:pageName")}</h2>
                            <div className={styles.input_group_size1}>
                                <div className={styles.label}>{t("loginPage:emailLabel")}</div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder={t("loginPage:emailLabel")}
                                    name="email"
                                    onChange={e => setEmail(e.target.value)}
                                    value={email}
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.input_group_size1}>
                                <div className={styles.label}>{t("loginPage:passwordLabel")}</div>
                                <input
                                    type="password"
                                    placeholder={t("loginPage:passwordLabel")}
                                    name="password"
                                    onChange={e => setPassword(e.target.value)}
                                    value={password}
                                    required
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.input_group_size2}>
                                {checkboxState ?
                                    <input type="checkbox" checked onChange={e => changeChecboxState(e)} />
                                    :
                                    <input type="checkbox" onChange={e => changeChecboxState(e)} />
                                }
                                {t("loginPage:memorizeEmailCheckbox")}
                            </div>
                            <div className={styles.input_group_size2}>
                                <button type="submit"
                                    className={styles.login_btn}>
                                    {t("loginPage:logInButton")}
                                </button>
                            </div>
                            <div className={styles.input_group_size2}>
                                <Link to="/recoverPassword">
                                    <button type="button"
                                        className={styles.recover_password_btn}>
                                        {t("loginPage:remindPasswordButton")}
                                    </button>
                                </Link>
                            </div>
                            {error && <div className={styles.error_msg}>{error}</div>}
                        </form>
                    </div>
                    <div className={styles.right}>
                    </div>
                </div>
            }
        </div>
    )
}
export default Login;
