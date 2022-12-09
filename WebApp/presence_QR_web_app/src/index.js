import React, { Suspense } from "react";
import { Oval } from 'react-loader-spinner'
import ReactDOM from 'react-dom'
import styles from "./styles.module.css"
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import "./i18n"
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={
        <div className={styles.body_container}>
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
        </div>
      }>
        <App />
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)