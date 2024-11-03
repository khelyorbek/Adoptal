// Importing all the necessary libraries and components and assets
import React, { useContext, useState } from 'react';
import { Modal, Button, Input, Row, Loading, Image, Avatar as NextUIAvatar, Tooltip, Text, Dropdown, Navbar } from '@nextui-org/react';
import { useNavigate } from "react-router-dom";

// Importing Avatar from the boring avatars library instead
import Avatar from 'boring-avatars'

// importing icons
import UserIcon from '../icons/user.svg'
import { UsernameIcon } from '../icons/UsernameIcon';
import { PasswordIcon } from '../icons/PasswordIcon';
import { UserDetailIcon } from '../icons/UserDetailIcon';

// importing a global context (current user enabler)
import GlobalContext from '../GlobalContext';

// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';


const LoginProfileToggle = () => {
    // receiving the global context for current user
    const { currentUser, setCurrentUser } = useContext(GlobalContext);
    // receiving the soft/dynamic navigation from React-router
    const navigate = useNavigate();

    // For showing and hiding the login modal
    const [visible, setVisible] = useState(false);
    const [isRegistration, setIsRegistration] = useState(false);
    const [isEditProfile, setIsEditProfile] = useState(false);

    // creating an initial state for username and password input fields so we can initialize the form and clean it afterwards if necessary
    const initialState = {
        username: '',
        password: ''
    }

    // creating state to store form data and also setter function
    const [formData, setFormData] = useState(initialState);
    // for storing and displaying errors
    const [formErrors, setFormErrors] = useState([]);
    // for storing the loading bar display/hide
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // creating a universal changle handler function that stored values into state
    const handleChange = e => {
        // taking the target of the event and destructuing the name attribute and the value of the input
        const { name, value } = e.target;

        // if the form input is the username, sending it in all lowercase to make sure username is case in-sensitive
        let valueFormatted = name === 'username' ? value.toLowerCase() : value;

        // setting the new value of the state
        setFormData(data => ({
            // to be the current value of the state
            ...data,
            // and whenever the new value is (Example: nameOfInput: valueOfInput)
            [name]: valueFormatted
        }))
    }

    // custom method for waiting X seconds
    function resolveAfterXSeconds(X) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('resolved');
            }, X * 1000);
        });
    }

    // creating a custom method to handle the submission of the login form
    async function handleLogin(e) {
        try {
            // setting the reigstration page to none
            setIsRegistration(false);
            // setting the profile editing page to none
            setIsEditProfile(false);

            // preventing default behavior
            e.preventDefault();

            // showing the loading button while our API call runs 
            setLoading(true);

            // calling the login function that is passed to us all the way from App
            // and sending the data from the form
            let res = await AdoptalApi.userLogin(formData);

            // for debugging
            // console.log("LoginProfileToggle >>> handleLogin >>> res", res);

            // Once the login process is done
            if (res === "Login or password is incorrect. Please try again.") {
                // turning off the loading button
                setLoading(false);
                // and setting the formErrors state so our alert can display
                setFormErrors(res);
            } else {
                // setting the form errors to null
                setFormErrors(null);
                // settings the success to true
                setSuccess(true);
                // turning off the loading button
                setLoading(false);
                // 1.5 seconds wait
                await resolveAfterXSeconds(1.5);
                // turning off the login modal
                setVisible(false)
                // setting the global user to the user that we received
                setCurrentUser(res);

                // for debugging
                // console.log("LoginProfileToggle >>> handleLogin >>> currentUser", currentUser);

            }
        } catch (err) {
            console.log("Adoptal > Front-end > cats > LoginProfileToggle.js > handleLogin > ", err);
        }
    }

    // / creating a custom method to handle the submission of the registration form
    async function handleRegister(e, type) {
        try {
            // preventing default behavior
            e.preventDefault();

            // showing the loading button while our API call runs 
            setLoading(true);

            // calling the login function that is passed to us all the way from App
            // and sending the data from the form
            let res = await AdoptalApi.userRegister(formData);

            // Once the login process is done
            if (res === "Registration unsuccessful. Please try again with different values.") {
                // turning off the loading button
                setLoading(false);
                // and setting the formErrors state so our alert can display
                setFormErrors(res);
            } else {
                // setting the success message to true
                setSuccess(true);
                // turning off the loading button
                setLoading(false);
                // waiting 1.5 secs
                await resolveAfterXSeconds(1.5);
                // turning off the login modal
                setVisible(false)
                // setting the global user to the user that we received
                setCurrentUser(res);

                // for debugging
                // console.log("LoginProfileToggle >>> handleRegister >>> currentUser", currentUser);

            }
        } catch (err) {
            console.log("Adoptal > Front-end > cats > LoginProfileToggle.js > handleRegister > ", err);
        }

    }

    // / creating a custom method to handle the submission of the edit profile form
    async function handleEditProfile(e, type) {
        try {
            // preventing default behavior
            e.preventDefault();
            // showing the loading button while our API call runs 
            setLoading(true);
            // calling the login function that is passed to us all the way from App
            // and sending the data from the form
            let res = await AdoptalApi.userEdit(formData);

            // Once the login process is done
            if (res.message === "Successfully update profile for user") {
                setSuccess(true);
                // turning off the loading button
                setLoading(false);

                await resolveAfterXSeconds(1.5);

                // turning off the login modal
                setIsEditProfile(false)
                // setting the global user to the user that we received
                setCurrentUser(res.user);

                // logging the current user
                // console.log("LoginProfileToggle >>> handleEditProfile >>> currentUser", currentUser);
            } else {
                // turning off the loading button
                setLoading(false);
                // and setting the formErrors state so our alert can display
                setFormErrors(res);
            }
        } catch (err) {
            console.log("Adoptal > Front-end > cats > LoginProfileToggle.js > handleEditProfile > ", err);
        }
    }

    // custom function for handling the navigation and routing from the profile dropdown
    async function handleProfileDropdown(key) {

        // using a switch statement whch is O(1)
        switch (key) {
            case 'adopt_list':
                // for debugging
                // console.log("You pressed adopt_list");

                // soft redirecting and stopping the other cases from executing
                navigate("/adoptlist")
                break;

            case 'my_notes':
                // for debugging
                // console.log("You pressed my_notes");

                // soft redirecting and stopping the other cases from executing
                navigate("/mynotes")
                break;

            case 'my_comments':
                // for debugging
                // console.log("You pressed my_comments");

                // soft redirecting and stopping the other cases from executing
                navigate("/mycomments")
                break;

            case 'edit_profile':
                // for debugging
                // console.log("You pressed edit_profile");

                // getting the current value of the user profile and settings input values to that data
                formData.firstName = currentUser.firstName;
                formData.lastName = currentUser.lastName;
                formData.username = currentUser.username;

                // displaying the edit profile modal
                setIsEditProfile(true);
                break;

            case 'logout':
                // for debugging
                // console.log("You pressed logout");

                // seding a back-end request to log the user out
                let res = await AdoptalApi.userLogout();

                // if there is an error
                if (res === "Error while processing your request") {
                    // logging it into a console
                    console.log("Error in logout logic")
                }
                // for debugging
                // console.log("Logout successful");

                // otherwise removing the user from the state
                setCurrentUser(null);
                break;

            default:
            // ^ nothing happens by default. but we must have it
        }
        // for debugging
        // console.log("Selected key from dropdown >>> ", key);
    }

    // for debugging
    // console.log("LoginProfileToggle >>> currentUser >>>", currentUser);

    // if the user is logged in
    if (currentUser) {
        // Show a user profile circle
        return (<>
            <Tooltip content="Profile" placement="bottom" color="invert">
                <Dropdown placement="bottom-right">
                    <Navbar.Item>
                        <Dropdown.Trigger>
                            {/* Old Avatar using NextUI 
                            <Avatar
                                bordered
                                as="button"
                                color="gradient"
                                size="md"
                                // this uses automatic avatar generation API based on the first and last name
                                src={`https://source.boringavatars.com/beam/150/${currentUser.firstName}%20${currentUser.lastName}?colors=FFF7E6,D48EFC,DCB3FE,AB7CFF,B4C4FF`}
                            />
                            */}

                            <Avatar as="button" name={`${currentUser.firstName} ${currentUser.lastName}`} variant="beam" colors={["#FFF7E6", "#D48EFC", "#DCB3FE", "#AB7CFF", "#B4C4FF"]} />


                        </Dropdown.Trigger>
                    </Navbar.Item>

                    <Dropdown.Menu
                        aria-label="User menu actions"
                        color="secondary"
                        disabledKeys={["user_info"]}
                        onAction={handleProfileDropdown}>

                        {/* Displays information about the user like name and username */}
                        <Dropdown.Item
                            key="user_info"
                            textValue="Full name of the user and username"
                            css={
                                {
                                    height: "$18"
                                }
                            }>

                            <Text b color="secondary" css={{ d: "flex" }}>
                                {currentUser.firstName} {' '} {currentUser.lastName}
                            </Text>

                            <Text b color="secondary" css={{ d: "flex" }}>
                                @{currentUser.username}
                            </Text>

                        </Dropdown.Item>

                        {/* Menu options */}
                        <Dropdown.Item key="adopt_list" withDivider>
                            Adopt List
                        </Dropdown.Item>

                        <Dropdown.Item key="my_notes">
                            My notes
                        </Dropdown.Item>

                        <Dropdown.Item key="my_comments">
                            My comments
                        </Dropdown.Item>

                        <Dropdown.Item key="edit_profile" withDivider>
                            Edit Profile
                        </Dropdown.Item>

                        {/* Log out is colored red */}
                        <Dropdown.Item
                            key="logout"
                            withDivider
                            color="error">
                            Log Out
                        </Dropdown.Item>

                    </Dropdown.Menu>
                </Dropdown>
            </Tooltip>

            {/* Modal for eidting the profile of the user */}
            <Modal
                closeButton
                blur
                aria-labelledby="modal-title"
                open={isEditProfile}
                onOpen={() => {
                    // when opened, setting the success message to false
                    // then making the login page hidden
                    // then making the registration page hidden
                    setSuccess(false);
                    setVisible(false);
                    setIsRegistration(false);
                }}
                // whe closed, settings the visibility of the modal to false
                onClose={() => { setIsEditProfile(false); }}
            >
                {/* if the form is submitted using Enter */}
                <form onSubmit={handleEditProfile}>
                    <Modal.Header>
                        {
                            // if the user is on the edit profile modal
                            isEditProfile
                                // and the edit is successful
                                ? success
                                    ? <Text id="modal-title" size={24} b color="success">
                                        Profile edit successful!
                                        {/* then show the message ^ */}
                                    </Text>
                                    : <Text b id="modal-title" size={20}>
                                        Edit {' '}

                                        Profile
                                        {/* otherwise just show message saing Edit Profile */}
                                    </Text>
                                : ''
                        }

                    </Modal.Header>
                    {/* show either logo or the success image based on success state */}
                    <Image
                        showSkeleton
                        width={200}
                        height={200}
                        maxDelay={10000}
                        src={success ? "/success.svg" : "/logo.png"}
                        alt="Adoptal logo"
                    />
                    <Modal.Body>
                        {/* this will show the username but it will be disabled */}
                        <Input
                            disabled
                            underlined
                            name="username"
                            type="text"
                            aria-label="username input field"
                            fullWidth
                            color="secondary"
                            size="lg"
                            placeholder="Username"
                            initialValue={formData.username}
                            contentLeft={<UsernameIcon fill="currentColor" />}
                            css={{ display: success ? 'none' : '' }}
                        />
                        {/* first name */}
                        <Input
                            onChange={handleChange}
                            name="firstName"
                            type="text"
                            aria-label="first name input field"
                            bordered
                            fullWidth
                            color="secondary"
                            size="lg"
                            placeholder="First Name"
                            initialValue={formData.firstName}
                            contentLeft={<UserDetailIcon fill="currentColor" />}
                            css={{ display: success ? 'none' : '' }}
                        />
                        {/* last name */}
                        <Input
                            onChange={handleChange}
                            name="lastName"
                            type="text"
                            aria-label="last name input field"
                            bordered
                            fullWidth
                            color="secondary"
                            size="lg"
                            placeholder="Last Name"
                            initialValue={formData.lastName}
                            contentLeft={<UserDetailIcon fill="currentColor" />}
                            css={{ display: success ? 'none' : '' }}
                        />
                    </Modal.Body>

                    <Modal.Footer>

                        <Row justify="center">
                            {
                                // if the operation is successful
                                success
                                    // then the button is hidden
                                    ? ''
                                    // otherwise the button is shown
                                    : <Button
                                        type="submit"
                                        auto
                                        onPress={handleEditProfile}
                                        color="secondary">

                                        { // logic for showing loading icon after pressing login or ENTER
                                            loading
                                                ? <Loading type="points" color="currentColor" size="md" />
                                                : "Save Profile"}
                                    </Button>
                            }
                        </Row>

                    </Modal.Footer>

                </form>

            </Modal>
        </>)
    } else {
        // Login circle ( if the user is NOT logged in )
        return (<>
            <Tooltip content="Login" placement="bottom" color="invert">
                {/* showing a standard user icon */}
                <NextUIAvatar
                    bordered
                    as="button"
                    color="gradient"
                    size="md"
                    src={UserIcon}
                    // when clicked, settings the registartion modal to false
                    // then setting the success state to false
                    // then setting the login modal's visibility to true
                    onClick={() => { setIsRegistration(false); setSuccess(false); setVisible(true); }}
                />
            </Tooltip>

            {/* Login / Registration Modal */}
            <Modal
                closeButton
                blur
                aria-labelledby="modal-title"
                // displays when visible state = true
                open={visible}
                // when clicked, settings the registartion modal to false
                // then setting the success state to false
                // then setting the login modal's visibility to false
                onClose={() => { setIsRegistration(false); setSuccess(false); setVisible(false); }}
            >
                {/* in case the form is submitted using enter */}
                {/* depends on the isRegistration state */}
                {/* if true, we show the registration modal */}
                {/* otherwise we initiate a login custom method */}
                <form onSubmit={isRegistration ? handleRegister : handleLogin}>
                    <Modal.Header>
                        {
                            // if successful operation
                            success
                                ? <Text id="modal-title" size={24} b color="success">
                                    Login successful!
                                    {/* displaying a success message */}
                                </Text>
                                // otherwise show welcome message
                                : <Text id="modal-title" size={20}>
                                    Welcome to {' '}
                                    <Text b size={20}>
                                        Adoptal
                                    </Text>
                                </Text>

                        }

                    </Modal.Header>
                    {/* showing a success image or the adoptal logo */}
                    <Image
                        showSkeleton
                        width={200}
                        height={200}
                        maxDelay={10000}
                        src={success ? "/success.svg" : "/logo.png"}
                        alt="Adoptal logo"
                    />
                    <Modal.Body>
                        {
                            // if the modal is registartion
                            isRegistration
                                // then show additional input (first name)
                                ? <Input
                                    onChange={handleChange}
                                    name="firstName"
                                    type="text"
                                    aria-label="first name input field"
                                    bordered
                                    fullWidth
                                    color="secondary"
                                    size="lg"
                                    placeholder="First Name"
                                    contentLeft={<UserDetailIcon fill="currentColor" />}
                                    css={{ display: success ? 'none' : '' }}
                                />
                                :
                                ''
                        }
                        {
                            isRegistration
                                // and show additional input (last name)
                                ? <Input
                                    onChange={handleChange}
                                    name="lastName"
                                    type="text"
                                    aria-label="last name input field"
                                    bordered
                                    fullWidth
                                    color="secondary"
                                    size="lg"
                                    placeholder="Last Name"
                                    contentLeft={<UserDetailIcon fill="currentColor" />}
                                    css={{ display: success ? 'none' : '' }}
                                />
                                : ''
                        }

                        {/* if its NOT registration ,then its login */}
                        {/* only show 2 inputs (username and password) */}
                        <Input
                            onChange={handleChange}
                            name="username"
                            type="text"
                            aria-label="username input field"
                            bordered
                            fullWidth
                            color="secondary"
                            size="lg"
                            placeholder="Username"
                            contentLeft={<UsernameIcon fill="currentColor" />}
                            css={{ display: success ? 'none' : '' }}
                        />
                        <Input.Password
                            onChange={handleChange}
                            name="password"
                            type="password"
                            aria-label="password input field"
                            bordered
                            fullWidth
                            color="secondary"
                            size="lg"
                            placeholder="Password"
                            contentLeft={<PasswordIcon fill="currentColor" />}
                            css={{ display: success ? 'none' : '' }}
                        />

                        {/* if there are any error generated, show the Text component and pass the error message as the value */}
                        {formErrors ? <Text b size={16} color="error">{formErrors}</Text> : ""}

                        {/* show a friendly message to peopel who don't want to register */}
                        <Text size={16} css={{ display: success ? 'none' : '' }}>
                            Don't want to register? Use
                            <Text b size={16}>
                                {' '} test {' '}
                            </Text>
                            for both fields to login.</Text>

                    </Modal.Body>

                    <Modal.Footer>
                        {
                            // if successful
                            success
                                // show nothing
                                ? ''
                                // otherwise show a row of buttons
                                :

                                <Row justify="space-between">

                                    {
                                        // if its a registration modal
                                        isRegistration
                                            // don't show this button
                                            ? ''
                                            // otherwise - show
                                            : <Button
                                                auto
                                                flat={isRegistration ? false : true}
                                                color="secondary"
                                                // when the button is pressed, shows the registration modal
                                                onPress={() => {
                                                    setIsRegistration(true);
                                                }
                                                }>
                                                Create account
                                            </Button>
                                    }

                                    {
                                        // if its a registration modal already
                                        isRegistration
                                            ? <Button
                                                type="submit"
                                                auto
                                                // call the custom registration handler method
                                                onPress={handleRegister}
                                                color="secondary">

                                                { // logic for showing loading icon after pressing login or ENTER
                                                    loading
                                                        ? <Loading type="points" color="currentColor" size="md" />
                                                        : "Register"}
                                            </Button>
                                            // if its not a registration modal
                                            : <Button
                                                type="submit"
                                                auto
                                                // then call the custom login handler method
                                                onPress={handleLogin}
                                                color="secondary">

                                                { // logic for showing loading icon after pressing login or ENTER
                                                    loading
                                                        ? <Loading type="points" color="currentColor" size="md" />
                                                        : "Login"}
                                            </Button>
                                    }

                                </Row>
                        }
                    </Modal.Footer>

                </form>

            </Modal>

        </>)
    }




}

export default LoginProfileToggle;