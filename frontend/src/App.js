import { useState, useEffect } from "react"
// 1. import `NextUIProvider` component
import { Row, Col, createTheme, NextUIProvider } from '@nextui-org/react';
// import AdoptalApi from './api/adoptalBackend';
import Navigation from "./NavigationBar";
import GlobalContext from './GlobalContext';
import axios from "axios";
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const APP_SECRET = process.env.REACT_APP_APP_SECRET;


// Creating a dark theme (default)
const darkTheme = createTheme({
  type: "dark",
  theme: {
    // bc2ffb
    colors: {
      gradient: 'linear-gradient(135deg, hsla(269, 100%, 50%, 1) 25%, hsla(281, 96%, 58%, 1) 75%);'

    }
  }
});

// Creating a light theme 
const lightTheme = createTheme({
  type: "light",
  theme: {
    colors: {
      gradient: 'linear-gradient(135deg, hsla(269, 100%, 50%, 1) 25%, hsla(281, 96%, 58%, 1) 75%);'
    }
  }
});

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  // using state for keeping track of the theme color
  const [isDark, setIsDark] = useState(() => {
    // checking to see if we have a value in localstorage
    const d = localStorage.getItem("isDarkThemeOn");
    // if no value in localstorage, set it to true which means dark mode is enabled which is our default theme
    if (d === undefined || d === null) {
      return true;
    } else {
      // if value is found in localstorage, set the state to that value
      return JSON.parse(d);
    }
  });

  // handle function to switch the theme from one to another
  const handleThemeChange = () => {
    setIsDark(!isDark);
  }

  async function getUser() {
    // logging a user in automatically if cookie exists
    // client sends the cookie in the header to the server
    // server matches session cookie to user
    // server sends the user data back in response
    const res = await axios.get(`${BACKEND_URL}/user/getUser`, {
      withCredentials: true
    })
    if (res.data.message === "Error while processing your request") {
      setCurrentUser(null);
    } else {
      console.log("res user >>>", res.data)
      setCurrentUser(res.data);
    }
  }

  useEffect(() => {
    getUser();
  }, [])

  // whenever dark theme state is changed, update localstorage
  useEffect(() => {
    localStorage.setItem('isDarkThemeOn', isDark);
  }, [isDark]);

  // USER STATE AND METHODS


  // 2. Use at the root of your app
  return (<>
    <NextUIProvider theme={isDark === true ? darkTheme : lightTheme} >

      {/* Passing current user state and setCurrentUser function as global context to all child componenets */}
      <GlobalContext.Provider value={{ currentUser, setCurrentUser }}>
        <BrowserRouter>
          {/* Rendering navigation and passing theme color and
       change function */}

          <Navigation handleThemeChange={handleThemeChange} isDark={isDark}></Navigation>

          <Router></Router>

        </BrowserRouter>
      </GlobalContext.Provider>

    </NextUIProvider >
  </>)
}

export default App;
