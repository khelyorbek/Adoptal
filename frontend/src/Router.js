// react components
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react"

import CatList from './cats/CatList'
import CatDetail from "./cats/CatDetail";
import AdoptList from "./lists/AdoptList";
import MyComments from "./lists/MyComments";
import MyNotes from "./lists/MyNotes";
import EditProfile from "./profile/EditProfile";
import GlobalContext from './GlobalContext';

const Router = () => {
    const { currentUser, setCurrentUser } = useContext(GlobalContext)

    return (<>
        <Routes>
            <Route path="/" element={<CatList></CatList>}></Route>

            <Route path="/adoptlist" element={<AdoptList currentUser={currentUser} setCurrentUser={setCurrentUser}></AdoptList>}></Route>

            <Route path="/mynotes" element={<MyNotes></MyNotes>}></Route>

            <Route path="/mycomments" element={<MyComments></MyComments>}></Route>

            <Route path="/profile" element={<EditProfile></EditProfile>}></Route>

            <Route path="/cat/:id" element={<CatDetail></CatDetail>}></Route>

            <Route path="*" element={<Navigate to='/'></Navigate>}></Route>
        </Routes>
    </>)
}

export default Router;