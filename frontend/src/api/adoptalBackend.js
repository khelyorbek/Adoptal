import { useContext } from 'react';
import axios from "axios";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const APP_SECRET = process.env.REACT_APP_APP_SECRET;

class AdoptalApi {
    // Get data from Petfinder
    static async getAllCats(filters) {
        const p = {
            zip: filters.zip,
            page: filters.page,
            distance: filters.distance,
            age: filters.age,
            size: filters.size,
            coat: filters.coat,
            good_with_children: filters.good_with_children,
            good_with_dogs: filters.good_with_dogs,
            good_with_cats: filters.good_with_cats,
            house_trained: filters.house_trained,
            declawed: filters.declawed,
            special_needs: filters.special_needs
        }
        const res = await axios.get(`${BACKEND_URL}/cat`, {
            params: { p }
        })
        // console.log("adoptalBackend >>> getAllCats >>> FILTERs Received at Method >>> ", filters)
        // console.log("adoptalBackend >>> getAllCats >>> Payload Sent to Backend >>> ", p)
        // console.log("adoptalBackend >>> getAllCats >>> Response received from backend >>>", res.data)
        return res.data;
    }

    static async getSingleCat(id) {
        // console.log("adoptalBackend >>> getSingleCat >>> Response received from backend >>>", res.data.animal)

        const res = await axios.get(`${BACKEND_URL}/cat/${id}`,)
        console.log("RRRRRRRRRRRRRRRRRRRRRR>>>", res)
        if(res.data === 'Not found') {
            return res.data;
        } else {
            return res.data.animal;
        }
    }

    static async toggleAdoptItem(username, id) {
        const res = await axios.post(`${BACKEND_URL}/pet/adoptlist`, {
            params: {
                id: id,
                username: username
            }
        })
        return res.data;
    }

    // NOTES
    static async addNote(username, id, note) {
        const res = await axios.post(`${BACKEND_URL}/pet/private`, {
            params: {
                id: id,
                username: username,
                note: note
            }
        })
        return res.data;
    }
    
    static async removeNote(username, id) {
        const res = await axios.delete(`${BACKEND_URL}/pet/private`, {
            params: {
                id: id,
                username: username
            }
        })
        return res.data;
    }

    // COMMENTS
    static async addComment(username, id, comment) {
        const res = await axios.post(`${BACKEND_URL}/pet/public`, {
            params: {
                id: id,
                username: username,
                comment: comment
            }
        })
        return res.data;
    }

    static async removeComment(username, id) {
        const res = await axios.delete(`${BACKEND_URL}/pet/public`, {
            params: {
                id: id,
                username: username
            }
        })
        return res.data;
    }

    static async getAllCommentsPerCat(id) {
        const res = await axios.get(`${BACKEND_URL}/pet/comments/${id}`)
        console.log("COMMENTS >>> ", res.data);
        return res.data;
    }

    // User
    static async userLogin(formData) {
        const res = await axios.get(`${BACKEND_URL}/user`, {
            params: {
                username: formData.username,
                password: formData.password
            },
            withCredentials: true
        })

        console.log("adoptalBackend >>> userLogin >>> res.data >>>", res.data);

        // making sure the login is successful
        if (res.data.message === "Login successful") {
            return res.data.user
        } else {
            return "Login or password is incorrect. Please try again."
        }
    }

    static async userRegister(formData) {
        console.log("adoptalBackend >>> userRegister >>> formData", formData);

        const res = await axios.post(`${BACKEND_URL}/user`, {
            params: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                password: formData.password
            }
        })

        console.log("adoptalBackend >>> userRegister >>> res.data >>>", res.data);

        // making sure the registration is successful
        if (res.data.message === "Successfully created user") {
            return res.data.user
        } else {
            return "Registration unsuccessful. Please try again with different values."
        }
    }

    static async userEdit(formData) {

        console.log("adoptalBackend >>> userEdit >>> formData", formData);


        const res = await axios(`${BACKEND_URL}/user`, {
            method: "PATCH",
            data: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
            },
            withCredentials: true
        }
        )

        console.log("adoptalBackend >>> userEdit >>> res.data >>>", res.data);

        // making sure the registration is successful

        return res.data;

    }


    static async userLogout() {
        const res = await axios.get(`${BACKEND_URL}/user/logout`, {
            withCredentials: true
        })

        if (res.data.message) {
            return res.data.message;
        }
        return "Error while processing your request."
    }


}

export default AdoptalApi;