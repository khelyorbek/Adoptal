// Importing all the necessary libraries and components and assets
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react"

// importing the custom components
import CatList from './cats/CatList'
import CatDetail from "./cats/CatDetail";
import AdoptList from "./lists/AdoptList";
import MyComments from "./lists/MyComments";
import MyNotes from "./lists/MyNotes";
import LoginRequiredPage from "./profile/LoginRequiredPage";
// importing global context enabler
import GlobalContext from './GlobalContext';

const Router = () => {

    // receiving the global context for current user
    const { currentUser, setCurrentUser } = useContext(GlobalContext)

    // Pretty self explanatory here
    // Dynamically render a Catlist component
    // Dynamically render other components if the user is logged in
    // If the user tries to go to the address directly, the LoginRequired error/page is displaying
    // If the user tries to go to the route that doesn't exist, gets redirected to /
    return (<>
        <Routes>
            <Route
                path="/"
                element={
                    <CatList></CatList>
                }>
            </Route>

            <Route
                path="/adoptlist"
                element={
                    currentUser
                        ? <AdoptList currentUser={currentUser} setCurrentUser={setCurrentUser}> </AdoptList>
                        : <LoginRequiredPage></LoginRequiredPage>
                        }>
            </Route>

            <Route
                path="/mynotes"
                element={
                    currentUser
                    ? <MyNotes></MyNotes>
                    : <LoginRequiredPage></LoginRequiredPage>
                }>
            </Route>

            <Route
                path="/mycomments"
                element={
                    currentUser
                    ? <MyComments></MyComments>
                    : <LoginRequiredPage></LoginRequiredPage>
                }>
            </Route>

            <Route
                path="/cat/:id"
                element={
                    <CatDetail></CatDetail>
                }>

            </Route>

            <Route
                path="*"
                element={
                    <Navigate to='/'></Navigate>
                }>
            </Route>
        </Routes>
    </>)
}

export default Router;