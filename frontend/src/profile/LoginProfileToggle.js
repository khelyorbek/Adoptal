import React, { useContext, useState, useEffect } from 'react';
import { Modal, Button, Input, Row, Loading, Image, Tooltip, Avatar, Text, Dropdown, Navbar } from '@nextui-org/react';
import UserIcon from '../icons/user.svg'
import { UsernameIcon } from '../icons/UsernameIcon';
import { PasswordIcon } from '../icons/PasswordIcon';
import { UserDetailIcon } from '../icons/UserDetailIcon';
import GlobalContext from '../GlobalContext';
import AdoptalApi from '../api/adoptalBackend';
import { useNavigate } from "react-router-dom";

const LoginProfileToggle = () => {
    const { currentUser, setCurrentUser } = useContext(GlobalContext);
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

    function resolveAfterXSeconds(X) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('resolved');
            }, X * 1000);
        });
    }

    // / creating a custom method to handle the submission of the form
    async function handleLogin(e, type) {
        // preventing default behavior
        e.preventDefault();
        // showing the loading button while our API call runs 
        setLoading(true);
        setIsRegistration(false);
        setIsEditProfile(false);
        // calling the login function that is passed to us all the way from App
        // and sending the data from the form
        let res = await AdoptalApi.userLogin(formData);

        // Once the login process is done
        if (res === "Login or password is incorrect. Please try again.") {
            // turning off the loading button
            setLoading(false);
            // and setting the formErrors state so our alert can display
            setFormErrors(res);
        } else {
            setSuccess(true);
            // turning off the loading button
            setLoading(false);
            await resolveAfterXSeconds(1.5);
            // turning off the login modal
            setVisible(false)
            // setting the global user to the user that we received
            setCurrentUser(res);
            // logging the current user
            console.log("LoginProfileToggle >>> handleLogin >>> currentUser", currentUser);

        }
    }

    // / creating a custom method to handle the submission of the form
    async function handleRegister(e, type) {
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
            setSuccess(true);
            // turning off the loading button
            setLoading(false);
            await resolveAfterXSeconds(1.5);
            // turning off the login modal
            setVisible(false)
            // setting the global user to the user that we received
            setCurrentUser(res);
            // logging the current user
            console.log("LoginProfileToggle >>> handleRegister >>> currentUser", currentUser);

        }
    }

    // / creating a custom method to handle the submission of the form
    async function handleEditProfile(e, type) {
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
            console.log("LoginProfileToggle >>> handleEditProfile >>> currentUser", currentUser);
        } else {
            // turning off the loading button
            setLoading(false);
            // and setting the formErrors state so our alert can display
            setFormErrors(res);
        }
    }

    async function handleProfileDropdown(key) {
        switch (key) {
            case 'adopt_list':
                console.log("You pressed adopt_list");
                navigate("/adoptlist")
                break;
            case 'my_notes':
                console.log("You pressed my_notes");
                navigate("/mynotes")
                break;
            case 'my_comments':
                console.log("You pressed my_comments");
                navigate("/mycomments")
                break;
            case 'edit_profile':
                console.log("You pressed edit_profile");
                formData.firstName = currentUser.firstName;
                formData.lastName = currentUser.lastName;
                formData.username = currentUser.username;
                setIsEditProfile(true);
                break;
            case 'logout':
                console.log("You pressed logout");
                let res = await AdoptalApi.userLogout();

                if (res === "Error while processing your request") {
                    console.log("Error in logout logic")
                }
                console.log("Logout successful");
                setCurrentUser(null);
                break;
            default:
        }
        // console.log("Selected key from dropdown >>> ", key);

    }

    // console.log("LoginProfileToggle >>> currentUser >>>", currentUser);

    if (currentUser) {
        // User profile circle
        return (<>
            <Tooltip content="Profile" placement="bottom" color="invert">
                <Dropdown placement="bottom-right">
                    <Navbar.Item>
                        <Dropdown.Trigger>
                            <Avatar
                                bordered
                                // zoomed
                                as="button"
                                color="gradient"
                                size="md"
                                // this uses automatic avatar generation API based on the first and last name
                                src={`https://source.boringavatars.com/beam/150/${currentUser.firstName}%20${currentUser.lastName}?colors=FFF7E6,D48EFC,DCB3FE,AB7CFF,B4C4FF`}
                            />
                        </Dropdown.Trigger>
                    </Navbar.Item>

                    <Dropdown.Menu
                        aria-label="User menu actions"
                        color="secondary"
                        disabledKeys={["user_info"]}
                        onAction={handleProfileDropdown}
                    // variant="shadow"
                    // onAction={(actionKey) => console.log({ actionKey })}
                    >
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


                        <Dropdown.Item
                            key="logout"
                            withDivider
                            color="error">
                            Log Out
                        </Dropdown.Item>

                    </Dropdown.Menu>
                </Dropdown>
            </Tooltip>

            <Modal
                closeButton
                blur
                aria-labelledby="modal-title"
                open={isEditProfile}
                onOpen={() => {
                    setSuccess(false);
                    setVisible(false);
                    setIsRegistration(false);
                }}
                onClose={() => { setIsEditProfile(false); }}
            >
                <form onSubmit={handleEditProfile}>
                    <Modal.Header>
                        {
                            success
                                ? <Text id="modal-title" size={24} b color="success">
                                    Profile edit successful!
                                </Text>
                                : <Text b id="modal-title" size={20}>
                                    Edit {' '}
                                    
                                    Profile
                                </Text>

                        }

                    </Modal.Header>
                    <Image
                        showSkeleton
                        width={200}
                        height={200}
                        maxDelay={10000}
                        src={success ? "/success.svg" : "/logo.png"}
                        alt="Adoptal logo"
                    />
                    <Modal.Body>
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
                                success
                                    ? ''
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
        // Login circle
        return (<>
            <Tooltip content="Login" placement="bottom" color="invert">
                <Avatar
                    bordered
                    as="button"
                    color="gradient"
                    size="md"
                    src={UserIcon}
                    onClick={() => { setIsRegistration(false); setSuccess(false); setVisible(true); }}
                />
            </Tooltip>

            <Modal
                closeButton
                blur
                aria-labelledby="modal-title"
                open={visible}
                onClose={() => { setIsRegistration(false); setSuccess(false); setVisible(false); }}
            >
                <form onSubmit={isRegistration ? handleRegister : handleLogin}>
                    <Modal.Header>
                        {
                            success
                                ? <Text id="modal-title" size={24} b color="success">
                                    Login successful!
                                </Text>
                                : <Text id="modal-title" size={20}>
                                    Welcome to {' '}
                                    <Text b size={20}>
                                        Adoptal
                                    </Text>
                                </Text>

                        }

                    </Modal.Header>
                    <Image
                        showSkeleton
                        width={200}
                        height={200}
                        maxDelay={10000}
                        src={success ? "/success.svg" : "/logo.png"}
                        alt="Adoptal logo"
                    />
                    <Modal.Body>
                        { //JS CODE
                            isRegistration
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


                        <Text size={16} css={{ display: success ? 'none' : '' }}>
                            Don't want to register? Use
                            <Text b size={16}>
                                {' '} test {' '}
                            </Text>
                            for both fields to login.</Text>

                    </Modal.Body>

                    <Modal.Footer>
                        {
                            success
                                ? ''
                                :

                                <Row justify="space-between">

                                    {
                                        isRegistration
                                            ? ''
                                            : <Button
                                                auto
                                                flat={isRegistration ? false : true}
                                                color="secondary"
                                                onPress={() => {
                                                    setIsRegistration(true);
                                                }
                                                }>
                                                Create account
                                            </Button>
                                    }

                                    {
                                        isRegistration
                                            ? <Button
                                                type="submit"
                                                auto
                                                onPress={handleRegister}
                                                color="secondary">

                                                { // logic for showing loading icon after pressing login or ENTER
                                                    loading
                                                        ? <Loading type="points" color="currentColor" size="md" />
                                                        : "Register"}
                                            </Button>
                                            : <Button
                                                type="submit"
                                                auto
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