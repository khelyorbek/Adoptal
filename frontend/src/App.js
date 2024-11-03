// Importing all the necessary libraries and components and assets
import { useState, useEffect } from "react"
// 1. import `NextUIProvider` component per NextUI documentation
import { createTheme, NextUIProvider } from '@nextui-org/react';
// import AdoptalApi from './api/adoptalBackend';
import Navigation from "./NavigationBar";
import GlobalContext from './GlobalContext';
import axios from "axios";
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


// Creating a dark theme (default)
const darkTheme = createTheme({
  type: "dark",
  theme: {
    colors: {
      // creating a custom gradient for gradient color
      gradient: 'linear-gradient(135deg, hsla(269, 100%, 50%, 1) 25%, hsla(281, 96%, 58%, 1) 75%);'

    }
  }
});

// Creating a light theme 
const lightTheme = createTheme({
  type: "light",
  theme: {
    colors: {
      // creating a custom gradient for gradient color
      gradient: 'linear-gradient(135deg, hsla(269, 100%, 50%, 1) 25%, hsla(281, 96%, 58%, 1) 75%);'
    }
  }
});

// MAIN APP
function App() {
  // using state to keep track of current user
  const [currentUser, setCurrentUser] = useState(null);
  // using state to keep track of current page
  const [currentPage, setCurrentPage] = useState(null);

  // using state for keeping track of the theme color
  const [isDark, setIsDark] = useState(() => {
    // checking to see if we have a value in localstorage
    const d = localStorage.getItem("isDarkThemeOn");

    // if no value in localstorage, set it to true which means dark mode is enabled which is our default theme
    if (d === undefined || d === null) {
      return true;
    }
    else {
      // if value is found in localstorage, set the state to that value
      return JSON.parse(d);
    }
  });

  // handle function to switch the theme from one to another
  const handleThemeChange = () => {
    // setting to negative of whats out there now
    setIsDark(!isDark);
  }

  // custom function for getting the user from the back-end, runs on first load
  async function getUser() {
    try {
      // logging a user in automatically if cookie exists
      // client sends the cookie in the header to the server
      // server matches session cookie to user in MongoDB session storage
      // server sends the user data back in response
      const res = await axios.get(`${BACKEND_URL}/user/getUser`, {
        withCredentials: true
      })

      // if the request errors out
      if (res.data.message === "Error while processing your request") {
        // set the current user to nothing
        setCurrentUser(null);

        // for debugging
        // console.log("App.js > res.data.message", res.data.message);
      }
      // if the request is successful
      else {
        // then setting the current user to the data that we received from the back-end
        setCurrentUser(res.data);

        // for debugging
        // console.log("res user >>>", res.data)
      }
    } catch (err) {
      console.log("Adoptal > Front-end > App.js > getUser > ", err);
    }

  }

  // useEffect to handle custom methods that need run on first App load
  useEffect(() => {
    getUser();
  }, [])

  // useEffect to handle whenever the dark theme state is changed
  useEffect(() => {
    // if the state has been changed, update localstorage
    localStorage.setItem('isDarkThemeOn', isDark);
  }, [isDark]);

  // 2. Use at the root of your app per NextUI documentation
  return (<>
    {/* wrapping our entire application in the provider */}
    <NextUIProvider theme={isDark === true ? darkTheme : lightTheme} >

      {/* Passing current user and page states and as global context to all child componenets */}
      <GlobalContext.Provider value={{ currentUser, setCurrentUser, currentPage, setCurrentPage }}>

        {/* using BrowserRouter from react-router-dom for dynamic navigation (refresh-less) */}
        <BrowserRouter>

          {/* Rendering navigation and passing theme color and
       change function */}
          <Navigation handleThemeChange={handleThemeChange} isDark={isDark}></Navigation>

          {/* Rendering our navigation / router */}
          <Router></Router>

        </BrowserRouter>
      </GlobalContext.Provider>
      <script type="text/javascript" src="https://unpkg.com/default-passive-events"></script>
    </NextUIProvider >

  </>)
}

export default App;
