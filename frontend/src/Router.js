// react components
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react"

import CatList from './cats/CatList'
import CatDetail from "./cats/CatDetail";
import AdoptList from "./lists/AdoptList";
import MyComments from "./lists/MyComments";
import MyNotes from "./lists/MyNotes";
import GlobalContext from './GlobalContext';
import LoginRequiredPage from "./profile/LoginRequiredPage";

const Router = () => {
    const { currentUser, setCurrentUser } = useContext(GlobalContext)

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