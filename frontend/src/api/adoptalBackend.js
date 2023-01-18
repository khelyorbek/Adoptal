// importing the necessary package and ENV variable
import axios from "axios";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// creating a class
class AdoptalApi {

    // Custom method for getting all cat data from Petfinder
    static async getAllCats(filters) {
        try {
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
            // sending a get request to the endpoint and passing the parameters
            const res = await axios.get(`${BACKEND_URL}/cat`, {
                params: { p }
            })
            // for debugging only
            // console.log("adoptalBackend >>> getAllCats >>> FILTERs Received at Method >>> ", filters)
            // console.log("adoptalBackend >>> getAllCats >>> Payload Sent to Backend >>> ", p)
            // console.log("adoptalBackend >>> getAllCats >>> Response received from backend >>>", res.data)

            // responding with the received data
            return res.data;
        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > getAllCats > ", err);
        }

    }

    // Custom method for getting single cat data from Petfinder
    static async getSingleCat(id) {
        try {
            // for debugging
            // console.log("adoptalBackend >>> getSingleCat >>> Response received from backend >>>", res.data.animal)

            // sending a get request to the backe-nd
            const res = await axios.get(`${BACKEND_URL}/cat/${id}`)

            // for debugging only
            // console.log("RRRRRRRRRRRRRRRRRRRRRR>>>", res)

            // if there is an error
            if (res.data === 'Not found') {
                // returning the message
                return res.data;
            } else {
                // if there is no error, returning data on animal
                return res.data.animal;
            }
        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > getSingleCat > ", err);
        }

    }

    // Custom method for toggling adopt list status in MongoDB
    static async toggleAdoptItem(username, id) {
        try {
            // sending a post request to the backend and sending data in params
            const res = await axios.post(`${BACKEND_URL}/pet/adoptlist`, {
                params: {
                    id: id,
                    username: username
                }
            })
            // returning received data
            return res.data;
        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > toggleAdoptItem > ", err);
        }

    }

    // Custom method for adding a private note in MongoDB
    static async addNote(username, id, note) {
        try {
            // sending a post request to the backend and sending data in params
            const res = await axios.post(`${BACKEND_URL}/pet/private`, {
                params: {
                    id: id,
                    username: username,
                    note: note
                }
            })
            // returning received data
            return res.data;
        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > addNote > ", err);
        }

    }

    // Custom method for removing a private note in MongoDB
    static async removeNote(username, id) {
        try {
            // sending a delete request to the backend and sending data in params
            const res = await axios.delete(`${BACKEND_URL}/pet/private`, {
                params: {
                    id: id,
                    username: username
                }
            })
            // returning received data
            return res.data;
        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > removeNote > ", err);
        }

    }

    // Custom method for adding a public comment in MongoDB
    static async addComment(username, id, comment) {
        try {
            // sending a post request to the backend and sending data in params
            const res = await axios.post(`${BACKEND_URL}/pet/public`, {
                params: {
                    id: id,
                    username: username,
                    comment: comment
                }
            })
            // returning received data
            return res.data;
        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > addComment > ", err);
        }

    }

    // Custom method for removing a public comment in MongoDB
    static async removeComment(username, id) {
        try {
            // sending a delete request to the backend and sending data in params
            const res = await axios.delete(`${BACKEND_URL}/pet/public`, {
                params: {
                    id: id,
                    username: username
                }
            })
            // returning received data
            return res.data;
        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > removeComment > ", err);
        }

    }

    // Custom method for getting all the comment for the selected pet
    static async getAllCommentsPerCat(id) {
        try {
            // sending a get request to the backend
            const res = await axios.get(`${BACKEND_URL}/pet/comments/${id}`)

            // for debugging only
            // console.log("COMMENTS >>> ", res.data);

            // returning received data
            return res.data;
        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > getAllCommentsPerCat > ", err);
        }
    }

    // Custom method for logging the user in
    static async userLogin(formData) {
        try {
            // Sending a get request to the back-end with teh params
            // also enabling withCredentials so the authentication can be done using session cookies if they exist
            const res = await axios.get(`${BACKEND_URL}/user`, {
                params: {
                    username: formData.username,
                    password: formData.password
                },
                withCredentials: true
            })

            // for debugging
            // console.log("Adoptal > Front-end > api > adoptalBackend.js > userLogin >", res.data);

            // returning received data
            return res.data.user

        } catch (e) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > userLogin >", e);
            return "Login or password is incorrect. Please try again."
        }

    }

    // Custom method for registering the user
    static async userRegister(formData) {
        try {
            // for debugging only
            // console.log("adoptalBackend >>> userRegister >>> formData", formData);

            // sending a post request to the backend and sending data in params
            const res = await axios.post(`${BACKEND_URL}/user`, {
                params: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    username: formData.username,
                    password: formData.password
                }
            })

            // for debugging
            // console.log("adoptalBackend >>> userRegister >>> res.data >>>", res.data);

            // making sure the registration is successful
            if (res.data.message === "Successfully created user") {
                // returning received data
                return res.data.user
            } else {
                return "Registration unsuccessful. Please try again with different values."
            }
        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > userRegister > ", err);
        }

    }

    // Custom method for editing the user
    static async userEdit(formData) {
        try {
            // for debugging only  
            // console.log("adoptalBackend >>> userEdit >>> formData", formData);

            // sending a patch request to the backend and sending data in params.
            // also enabling withCredentials so the authentication can be done using session cookies if they exist
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

            // for debugging
            // console.log("adoptalBackend >>> userEdit >>> res.data >>>", res.data);

            // making sure the registration is successful
            // returning received data
            return res.data;
        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > userEdit > ", err);
        }
    }

    // Custom method for logging the user out
    static async userLogout() {
        try {
            // sending a get request to the backend.
            // also enabling withCredentials so the authentication can be done using session cookies if they exist
            const res = await axios.get(`${BACKEND_URL}/user/logout`, {
                withCredentials: true
            })

            // if there is a success message
            if (res.data.message) {
                // returning received data
                return res.data.message;
            }
            // otherwise returning error text
            return "Error while processing your request."

        } catch (err) {
            console.log("Adoptal > Front-end > api > adoptalBackend.js > userLogout > ", err);
        }

    }


}

export default AdoptalApi;