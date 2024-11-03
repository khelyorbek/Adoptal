// importing the necessary libraries, custom methods, icons and stylesheets
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Card, Col, Row, Button, Text, Container, Grid, Textarea, Loading } from "@nextui-org/react";
import { Avatar as BoringAvatar } from 'boring-avatars'
import { useParams } from "react-router-dom";
import ImageGallery from 'react-image-gallery';
import './CatDetail.css';
import loadingSvg from '../icons/loading.svg'
// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';
import GlobalContext from '../GlobalContext';


const CatDetail = () => {
    // grabbing the id of a cat that is passed to us as a paramenter
    const { id } = useParams();

    // using a memo to set the items for the photo carousel
    // memos only update once
    let carouselItems = useMemo(() => [], []);

    // getting the current user from the Global Context passed to us from App.js
    const { currentUser, setCurrentUser } = useContext(GlobalContext);


    // using state to store variables
    const [cat, setCat] = useState();
    const [addr, setAddr] = useState();
    const [adopted, setAdopted] = useState();
    const [adoptedLoading, setAdoptedLoading] = useState(false);

    const [noteData, setNoteData] = useState();
    const [noteLoadingSubmit, setNoteLoadingSubmit] = useState(false);
    const [noteLoadingDelete, setNoteLoadingDelete] = useState(false);
    const [noteSuccess, setNoteSuccess] = useState(false);

    const [comments, setComments] = useState();
    const [commentData, setCommentData] = useState();
    const [commentLoadingSubmit, setCommentLoadingSubmit] = useState(false);
    const [commentLoadingDelete, setCommentLoadingDelete] = useState(false);
    const [commentSuccess, setCommentSuccess] = useState(false);


    // when an id is passed or changes
    useEffect(() => {
        // gets the cat by id and then sets it into state for usage
        getCat(id).then(setCat);
    }, [id])

    // when photos in carousel or a cat or a current user is changed
    // runs this effect
    useEffect(() => {
        // custom method for getting the photos of the pet
        function getPhotos() {
            try {
                // for every photo in the photo object
                for (let pic of cat.photos) {
                    // pushing the photo object into an array
                    carouselItems.push({
                        thumbnail: pic.small,
                        original: pic.large,
                        fullscreen: pic.full,
                        originalHeight: "480",
                        thumbnailHeight: "100",
                        // setting the photo loading as our animated SVG
                        loading: loadingSvg
                    })
                }
            } catch (err) {
                console.log("Adoptal > Front-end > cats > CatDetail.js > getPhotos > ", err);
            }

        }

        // custom method for getting the status of the pet's adoption
        async function getAdoptListStatus(user) {
            try {
                if (user) {
                    // if user's want to adopt array includes the id of an animal
                    if (user.wantToAdopt.includes(cat.id)) {
                        // set the want to adopt status to true
                        setAdopted(true);
                    } else {
                        // otherwise false
                        setAdopted(false);
                    }
                }
            } catch (err) {
                console.log("Adoptal > Front-end > cats > CatDetail.js > getAdoptListStatus > ", err);
            }
        }

        // custom function for getting the private notes for the pet
        async function getPrivateNote(user) {
            try {
                if (user) {
                    // setting the state
                    setNoteData({
                        // to the value of the key of cat's id in the private notes object
                        // example: private notes: { 123456: "Some random note "}
                        txtInput: currentUser.privateNotes[cat.id]
                    })
                    // for debugging only
                    // console.log("NOTEDATA >>>>>" , noteData.txtInput);
                }

            } catch (err) {
                console.log("Adoptal > Front-end > cats > CatDetail.js > getPrivateNote > ", err);
            }
        }

        // custom function for getting all the comments from users for a specific cat
        async function getAllComments(id) {
            try {
                // running an async request
                const res = await AdoptalApi.getAllCommentsPerCat(id);
                // for debugging
                // console.log("RECEIVED COMMENTS >>>", res);

                // settings the state as the data received
                setComments(res);
            } catch (err) {
                console.log("Adoptal > Front-end > cats > CatDetail.js > getAllComments > ", err);
            }
        }

        try {
            // when the cat loads fully
            if (cat) {
                // and if the cat is actually found
                if (cat !== "404") {
                    // get the photos and load them into the photo carousek
                    getPhotos();

                    // format the google maps iframe address to drop a pin to the correct location
                    setAddr(`https://maps.google.com/maps?width=300&height=300&hl=en&q=${cat.contact.address.address1 ? cat.contact.address.address1 : ''}, ${cat.contact.address.city}, ${cat.contact.address.state} ${cat.contact.address.postcode}+()&t=&z=14&ie=UTF8&iwloc=B&output=embed`.replace(/ /g, '%20'));

                    // get the want to adopt status
                    getAdoptListStatus(currentUser);

                    // get the private notes
                    getPrivateNote(currentUser);

                    // get the public comments
                    getAllComments(cat.id);
                }
            };
        } catch (err) {
            console.log("Adoptal > Front-end > cats > CatDetail.js > useEffect > ", err);
        }

    }, [carouselItems, cat, currentUser])

    // custom function to get the cat by  id
    async function getCat(id) {
        try {
            // seding a request to the backend
            const res = await AdoptalApi.getSingleCat(id);

            // for debugging
            // console.log("RES >>>", res);

            // if the cat is found, then returning the data that we received
            if (res !== "Not found") { return res }
            else {
                // if the cat is not found, displaying error and returning 404
                console.log("Error while getting cat information from API!");
                return "404"
            }
        } catch (err) {
            console.log("Adoptal > Front-end > cats > CatDetail.js > getCat > ", err);
        }


    }

    // custom function to handle toggling the Want to Adopt / Remove from Adopt List logic
    async function handleAdoptToggle() {
        try {
            // set the loading to true before the async request
            setAdoptedLoading(true);

            // send an async request to Back-end
            const res = await AdoptalApi.toggleAdoptItem(currentUser.username, cat.id);

            // if successful
            if (res.msg === "Successfully removed animal from Want to Adopt list") {
                // turn off loading
                setAdoptedLoading(false);
                // set the want to adopt status to false
                setAdopted(false);

                // creating a new variablle and storing the current user
                const usr = currentUser;

                // changing the want to adopt array to remove the cat's id
                usr.wantToAdopt = usr.wantToAdopt.filter(c => c !== cat.id)

                // for debugging
                // console.log("usr >>>>>>>>>>>", usr);

                // setting the current user to the new user object
                setCurrentUser(usr)

            } else {
                // turn off loading
                setAdoptedLoading(false);
                // set the want to adopt status to true
                setAdopted(true);

                // creating a new variablle and storing the current user
                const usr = currentUser;

                // changing the want to adopt array to have the cat's id
                usr.wantToAdopt.push(parseInt(cat.id))

                // for debugging
                // console.log("usr >>>>>>>>>>>", usr);

                // setting the current user to the new user object
                setCurrentUser(usr)
            }
        } catch (err) {
            console.log("Adoptal > Front-end > cats > CatDetail.js > handleAdoptToggle > ", err);
        }
    }

    // creating a universal changle handler function that stored values into state
    const handleNoteChange = e => {
        // taking the target of the event and destructuing the name attribute and the value of the input
        const { name, value } = e.target;

        // setting the new value of the state
        setNoteData(data => ({
            // to be the current value of the state
            ...data,
            // and whenever the new value is (Example: nameOfInput: valueOfInput)
            [name]: value
        }))
    }

    // creating a custom method to handle the submission of the form
    async function handleNoteSubmit(e) {
        try {
            // preventing default behavior
            // e.preventDefault();

            // set the loading to true before the async request
            setNoteLoadingSubmit(true);

            // sending an async request to the API
            const res = await AdoptalApi.addNote(currentUser.username, cat.id, noteData.txtInput)

            // for debugging
            // console.log(res);

            // if successfull
            if (res.msg === "Successfully added private note") {
                // turn off loading
                setNoteLoadingSubmit(false);

                // display the success message
                setNoteSuccess(true)

                // setting the current user
                setCurrentUser({
                    // to all the data that currently exists in the user
                    ...currentUser,
                    // but 
                    privateNotes: {
                        ...currentUser.privateNotes,
                        // with a new line with k/v in the private Notes object
                        [parseInt(cat.id)]: noteData.txtInput
                    }
                })
            } else {
                // display an error if not successful
                console.log("Error while saving private note")
            }
        } catch (err) {
            console.log("Adoptal > Front-end > cats > CatDetail.js > handleNoteSubmit > ", err);
        }
    }

    async function handleNoteDelete(e) {
        try {
            // preventing default behavior
            // e.preventDefault();

            // set the loading to true before the async request
            setNoteLoadingDelete(true);
            const res = await AdoptalApi.removeNote(currentUser.username, cat.id)
            // console.log(res);
            if (res.msg === "Successfully deleted private note") {
                // turn off loading
                setNoteLoadingDelete(false);
                // setting the text input value to none
                setNoteData(null);
                // display the success message
                setNoteSuccess(true);

                // creating a new variable and copying the current data
                const newNotes = currentUser.privateNotes;
                // deleting the data for the current pet
                delete newNotes[parseInt(cat.id)];

                // setting the current user
                setCurrentUser({
                    // to all the data that is currently there
                    ...currentUser,
                    // with a new notes variable that doesn't have the current pet data
                    privateNotes: newNotes
                })
            } else {
                // display an error if not successful
                console.log("Error while deleting private note")
            }
        } catch (err) {
            console.log("Adoptal > Front-end > cats > CatDetail.js > handleNoteDelete > ", err);
        }

    }

    // creating a universal changle handler function that stored values into state
    const handleCommentChange = e => {
        // taking the target of the event and destructuing the name attribute and the value of the input
        const { name, value } = e.target;

        // setting the new value of the state
        setCommentData(data => ({
            // to be the current value of the state
            ...data,
            // and whenever the new value is (Example: nameOfInput: valueOfInput)
            [name]: value
        }))
    }

    // / creating a custom method to handle the submission of the form
    async function handleCommentSubmit(e) {
        try {
            // preventing default behavior
            // e.preventDefault();

            // set the loading to true before the async request
            setCommentLoadingSubmit(true);
            const res = await AdoptalApi.addComment(currentUser.username, cat.id, commentData.txtInput)
            // console.log(res);
            if (res.msg === "Successfully added public note") {
                // turn off loading
                setCommentLoadingSubmit(false);
                // display the success message
                setCommentSuccess(true)

                // setting the current user
                setCurrentUser({
                    // to all the data that currently exists in the user
                    ...currentUser,
                    // but 
                    publicComments: {
                        ...currentUser.publicComments,
                        // with a new line with k/v in the publicComments object
                        [parseInt(cat.id)]: commentData.txtInput
                    }
                })
            } else {
                // display an error if not successful
                console.log("Error while saving public note")
            }
        } catch (err) {
            console.log("Adoptal > Front-end > cats > CatDetail.js > handleCommentSubmit > ", err);
        }
    }

    async function handleCommentDelete(e) {
        try {
            // preventing default behavior
            // e.preventDefault();

            // set the loading to true before the async request
            setCommentLoadingDelete(true);
            const res = await AdoptalApi.removeComment(currentUser.username, cat.id)
            // console.log(res);
            if (res.msg === "Successfully deleted public comment") {
                // turn off loading
                setCommentLoadingDelete(false);
                // setting the text input value to none
                setCommentData(null);
                // display the success message
                setCommentSuccess(true);

                // creating a new variable and copying the current data
                const newComments = currentUser.publicComments;
                // deleting the data for the current pet
                delete newComments[parseInt(cat.id)];

                // setting the current user
                setCurrentUser({
                    // to be the current value of the state
                    ...currentUser,
                    // with a new notes variable that doesn't have the current pet data
                    publicComments: newComments
                })
            } else {
                // display an error if not successful
                console.log("Error while deleting public comment")
            }
        } catch (err) {
            console.log("Adoptal > Front-end > cats > CatDetail.js > handleCommentDelete > ", err);
        }

    }

    return (<>

        {
            // if the pet has completed loading
            cat
                // if the response from back-end if 404, displaying a message saying that its not found
                ? cat === "404"
                    ? <Container aria-label="error note found image" style={{
                        textAlign: "center"
                    }}>
                        <div aria-label="error note found image">
                            <img
                                alt="empty list"
                                src="/error_not_found.png"
                            >
                            </img>
                        </div>
                        <Text size={35} b color="secondary">404 - Not found</Text>
                        <Text size={24} >The resource you are trying to access was not found or is no longer available.</Text>
                    </Container>

                    // if the response from back-end is normal (not 404), displaying cat details
                    : <Container aria-label="main container">
                        <Row>
                            <Col>
                                {/* image carousel */}
                                <ImageGallery
                                    showBullets
                                    slideInterval="5000"
                                    onErrorImageURL="/broken-robot.png"
                                    thumbnailPosition="bottom"
                                    showFullscreenButton={false}
                                    autoPlay={true}
                                    items={carouselItems}></ImageGallery>
                            </Col>
                        </Row>

                        <Row >
                            <Col xs={12} >
                                <Text h1 style={{ textAlign: "center" }}>{cat.name}</Text>
                            </Col>
                        </Row>

                        <Row >
                            <Col xs={12} >
                                <Text h4 style={{ textAlign: "center" }}>{cat.description}</Text>
                            </Col>
                        </Row>

                        {/* Multiple areas below are checking if a value exists and if not, setting to Unknown for UX */}
                        <Grid.Container gap={0} justify="space-evenly" aria-label="first column">
                            <Grid xs={3}>
                                <Grid.Container aria-label="basic info" alignContent="flex-start">
                                    <div className='cat-detail-section' aria-label="basic information">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Basic Information
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Breed:{" "}
                                                </b>
                                                {cat.breeds.primary ? cat.breeds.primary : 'Unknown'}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Color:{" "}
                                                </b>
                                                {cat.colors.primary ? cat.colors.primary : 'Unknown'}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Age:{" "}
                                                </b>
                                                {cat.age ? cat.age : 'Unknown'}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Gender:{" "}
                                                </b>
                                                {cat.gender ? cat.gender : 'Unknown'}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Size:{" "}
                                                </b>
                                                {cat.size ? cat.size : 'Unknown'}
                                            </Text>
                                        </Grid>
                                    </div>

                                    <div className='cat-detail-section' aria-label="medical behavioral section">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Medical / Behavioral
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Spayed / Neutered:{" "}
                                                </b>
                                                {cat.attributes.spayed_neutered ? "Yes" : "No"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    House Trained:{" "}
                                                </b>
                                                {cat.attributes.house_trained ? "Yes" : "No"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Declawed:{" "}
                                                </b>
                                                {cat.attributes.declawed ? "Yes" : "No"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Special Needs:{" "}
                                                </b>
                                                {cat.attributes.special_needs ? "Yes" : "No"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Up-to-date vaccinations:{" "}
                                                </b>
                                                {cat.attributes.shots_current ? "Yes" : "No"}
                                            </Text>
                                        </Grid>
                                    </div>

                                    <div className='cat-detail-section' aria-label="environmental">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Environmental
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Good with Children:{" "}
                                                </b>
                                                {cat.environment.children ? "Yes" : "No"}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Good with Dogs:{" "}
                                                </b>
                                                {cat.environment.dogs ? "Yes" : "No"}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Good with other Cats:{" "}
                                                </b>
                                                {cat.environment.cats ? "Yes" : "No"}
                                            </Text>
                                        </Grid>
                                    </div>
                                </Grid.Container>
                            </Grid>

                            <Grid xs={3}>
                                <Grid.Container aria-label="second column" alignContent="flex-start">
                                    <div className='cat-detail-section' aria-label="contact information">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Contact Information
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Adoptal ID:{" "}
                                                </b>
                                                {cat.id ? cat.id : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Pet ID:{" "}
                                                </b>
                                                {cat.organization_animal_id ? cat.organization_animal_id : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Phone #:{" "}
                                                </b>
                                                {cat.contact.phone ? cat.contact.phone : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Email:{" "}
                                                </b>
                                                <a href={cat.contact.email ? `mailto:${cat.contact.email}` : ''}>{cat.contact.email ? cat.contact.email : "Unknown"}</a>
                                            </Text>
                                        </Grid>
                                    </div>

                                    <div className='cat-detail-section' aria-label="location">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Location
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Address 1: {" "}
                                                </b>
                                                {cat.contact.address.address1 ? cat.contact.address.address1 : ''}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Address 2: {" "}
                                                </b>
                                                {cat.contact.address.address2 ? cat.contact.address.address2 : ''}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    City:{" "}
                                                </b>
                                                {cat.contact.address.city ? cat.contact.address.city : ''}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    State:{" "}
                                                </b>
                                                {cat.contact.address.state ? cat.contact.address.state : ''}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Zip:{" "}
                                                </b>
                                                {cat.contact.address.postcode ? cat.contact.address.postcode : ''}
                                            </Text>
                                        </Grid>
                                    </div>

                                    <div className='cat-detail-section' aria-label="map">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Map
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            {
                                                // logic for Google maps pin dropping. If there is an error, shows Unavalable
                                                addr
                                                    ? <div aria-label="map" style={{ overflow: "hidden" }}><iframe title="map" width="100%" height="300" frameBorder="0" style={{ overflow: "hidden" }} marginHeight="0" marginWidth="0" src={addr}></iframe></div>
                                                    : "Unavailable"
                                            }

                                        </Grid>
                                    </div>
                                </Grid.Container>
                            </Grid>


                            {
                                // if the user has finished loading / exists / logged in
                                currentUser
                                    ? <Grid xs={3} alignItems="flex-start">
                                        <Grid.Container aria-label="third column">
                                            <div className='cat-detail-section' aria-label="adopt list status">
                                                <Grid xs={12}>
                                                    <Text b size={24} color="secondary">
                                                        Adopt List
                                                    </Text>
                                                </Grid>

                                                <Grid xs={12}>
                                                    <Text
                                                        size={18}>
                                                        {/* Displays if an animal is in the adopt list or not */}
                                                        {cat.name} is {adopted ? '' : 'not'} in your Adopt List
                                                    </Text>

                                                    {/* Allows to toggle the adopt status */}
                                                    <Button
                                                        color={adopted ? "error" : "primary"}
                                                        onPress={handleAdoptToggle}
                                                        flat>
                                                        {
                                                            adoptedLoading
                                                                // Displays a loding bar if the loading state is set to true
                                                                ? <Loading type="points" color="currentColor" size="md" />
                                                                : adopted
                                                                    ? `Remove ${cat.name}`
                                                                    : `Add ${cat.name}`
                                                        }
                                                    </Button>


                                                </Grid>
                                            </div>

                                            <div className='cat-detail-section' aria-label="private notes">
                                                <Grid xs={12}>
                                                    <Text b size={24} color="secondary">
                                                        My Private Notes
                                                    </Text>
                                                </Grid>

                                                <Row>

                                                    {/* Displays user's private note about the animal */}
                                                    <Textarea
                                                        aria-label="private note input"
                                                        fullWidth
                                                        size="md"
                                                        name='txtInput'
                                                        // When the value changes, state gets updated
                                                        onChange={handleNoteChange}
                                                        minRows={7}
                                                        maxRows={20}
                                                        // Grabs the initial value from the state or sets it to empty
                                                        initialValue={noteData ? noteData.txtInput : ''}
                                                        bordered
                                                    ></Textarea>
                                                </Row>
                                                <div aria-label="success message">
                                                    {/* success message only shows when the state is set to true */}
                                                    {noteSuccess ? <Text color="success" size={16}> Successfully updated note.</Text> : ''}
                                                </div>
                                                <Row justify="space-between" css={{ paddingTop: "1rem" }}>
                                                    {/* Button for handling the private note deletion  */}
                                                    <Button
                                                        flat
                                                        onPress={handleNoteDelete}
                                                        color="error"
                                                        type="submit"
                                                        auto>
                                                        {
                                                            // Shows a loading bar if the state is true
                                                            noteLoadingDelete
                                                                ? <Loading type="points" color="currentColor" size="md" />
                                                                : "Delete"
                                                        }
                                                    </Button>
                                                    {/* Button for submitting changes to the private notes */}
                                                    <Button
                                                        flat
                                                        onPress={handleNoteSubmit}
                                                        auto
                                                        type="submit" color="success">
                                                        {
                                                            noteLoadingSubmit
                                                                ? <Loading type="points" color="currentColor" size="md" />
                                                                : "Save"
                                                        }
                                                    </Button>


                                                </Row>
                                            </div>
                                        </Grid.Container>
                                    </Grid>
                                    // if the user is not loaded yet, displays an empty area
                                    : ''
                            }

                        </Grid.Container>

                        {/* For displaying the comments from the users */}
                        <Row style={{ marginBottom: "2rem" }}>
                            <Col xs={12} className='cat-detail-section'>
                                <Text h2 color="secondary" style={{ textAlign: "center" }}>Comments from users</Text>

                                {   // if coments have loaded, display them
                                    comments ?
                                        comments.length > 0
                                            // if there are more than 0 comments, map through the comments and display a list
                                            ? comments.map(comment => {
                                                // For debugging only
                                                // console.log("Comments map >>> ", comments)
                                                return (
                                                    <Row key={comment.username}>
                                                        {/* For each commend display a row and a card */}
                                                        <Card xs={12} css={{ p: "$6", margin: "0.5rem 0" }}>
                                                            <Card.Header>
                                                                {/* OLD NEXTUI AVATAR - Displays an auto generated avatar using API endpoint 
                                                                <Avatar
                                                                    bordered
                                                                    as="button"
                                                                    color="gradient"
                                                                    size="lg"
                                                                    // this uses automatic avatar generation API based on the first and last name
                                                                    src={`https://source.boringavatars.com/beam/150/${comment.firstName}%20${comment.lastName}?colors=FFF7E6,D48EFC,DCB3FE,AB7CFF,B4C4FF`}
                                                                />
                                                                */}


                                                                <BoringAvatar as="button" name={`${comment.firstName} ${comment.lastName}`} variant="beam" colors={["#FFF7E6", "#D48EFC", "#DCB3FE", "#AB7CFF", "#B4C4FF"]} />

                                                                {/* Displays information about the user */}
                                                                <Grid.Container css={{ pl: "$6" }}>
                                                                    <Grid xs={12}>
                                                                        <Text h4 css={{ lineHeight: "$xs" }}>
                                                                            {comment.firstName} {' '} {comment.lastName}
                                                                            {' '}
                                                                            {
                                                                                currentUser
                                                                                    ? comment.username === currentUser.username ? <span style={{ color: "#8d4ad1" }}>(You)</span> : ''
                                                                                    : ''
                                                                            }

                                                                            {/* This tells the user its YOU if the current user logged in is the same as the author of the comment */}
                                                                        </Text>
                                                                    </Grid>
                                                                    <Grid xs={12}>
                                                                        {/* Displays the username of the user in a twitter @ style */}
                                                                        <Text css={{ color: "$accents8" }}>@{comment.username}</Text>
                                                                    </Grid>
                                                                </Grid.Container>
                                                            </Card.Header>
                                                            <Card.Body css={{ py: "$2" }}>
                                                                <Row >
                                                                    <Col>
                                                                        <Text>
                                                                            {/* DIsplays the actual comment */}
                                                                            {comment.publicComments[parseInt(cat.id)]}
                                                                        </Text>
                                                                    </Col>

                                                                    {/* if its user's own comment, displaying a button to remove */}
                                                                    {currentUser
                                                                        ? comment.username === currentUser.username ? <Col >
                                                                            <Button
                                                                                style={{ float: "right" }}
                                                                                flat
                                                                                // When pressed calls the custom method that we wrote
                                                                                onPress={handleCommentDelete}
                                                                                color="error"
                                                                                type="submit"
                                                                                auto>
                                                                                {
                                                                                    // Displays a loading bar if the state of loading is set to true
                                                                                    commentLoadingDelete
                                                                                        ? <Loading type="points" color="currentColor" size="md" />
                                                                                        : "Remove Comment"
                                                                                }
                                                                            </Button>
                                                                        </Col> : ''
                                                                        : ''}

                                                                    {/* If the author is not the same as logged in user, does nothing */}

                                                                </Row>

                                                            </Card.Body>
                                                        </Card>
                                                    </Row>
                                                )
                                            })
                                            // if comments are 0, display a message saying list is empty
                                            : <Container style={{
                                                textAlign: "center",
                                                padding: "0 0 2rem 0"
                                            }}>
                                                <div>
                                                    <img
                                                        height="200"
                                                        alt="empty list"
                                                        src="/error_empty.png"
                                                    >
                                                    </img>
                                                </div>
                                                <Text size={24} >Comments are empty for this pet. You can be the first person to comment!</Text>

                                            </Container>
                                        // if comments are still loading, display spinner
                                        : <Container aria-label="loading container" style={{ textAlign: "center", paddingTop: "3rem" }}>
                                            <img src={loadingSvg} alt='loading spinner'></img>
                                        </Container>

                                }


                                {
                                    // if the user is loaded / logged in / exists
                                    currentUser ?
                                        // if the user already has a public comment, display nothing
                                        currentUser.publicComments[cat.id]
                                            ? ''
                                            // if the user hasn't commented yet, show an area where that can be done
                                            : <div className='cat-detail-section' aria-label="public comments" style={{ marginTop: "0" }}>
                                                <Grid xs={12}>
                                                    <Text b size={24} color="secondary">
                                                        Add a Public Comment
                                                    </Text>
                                                </Grid>

                                                <Row>
                                                    {/* displays the comment of the user */}
                                                    <Textarea
                                                        aria-label="private note input"
                                                        fullWidth
                                                        size="md"
                                                        name='txtInput'
                                                        // when value is changed, changes the state
                                                        onChange={handleCommentChange}
                                                        minRows={7}
                                                        maxRows={20}
                                                        // gets the initial value from the state or sets to nothing
                                                        initialValue={commentData ? commentData.txtInput : ''}
                                                        bordered
                                                    ></Textarea>
                                                </Row>
                                                <div aria-label="success message">
                                                    {/* success message only shows when the state is set to true */}
                                                    {commentSuccess ? <Text color="success" size={16}> Successfully updated comment.</Text> : ''}
                                                </div>
                                                <Row justify="flex-end" css={{ paddingTop: "1rem" }}>
                                                    {/* Button to submit the public comment */}
                                                    <Button
                                                        flat
                                                        // When pressed, calls the custom method we wrote
                                                        onPress={handleCommentSubmit}
                                                        auto
                                                        type="submit" color="success">
                                                        {
                                                            // Shows a loading animations once the button is pressed and the loading state is set to true
                                                            commentLoadingSubmit
                                                                ? <Loading type="points" color="currentColor" size="md" />
                                                                : "Add Public Comment"
                                                        }
                                                    </Button>


                                                </Row>
                                            </div>
                                        // if the user is not loaded, display nothing
                                        : ''
                                }
                            </Col>
                        </Row>
                    </Container>

                // if the pet is loading
                : <Container aria-label="loading container" style={{ textAlign: "center", paddingTop: "3rem" }}>
                    <img src={loadingSvg} alt='loading spinner'></img>
                </Container>
        }

    </>)

}

export default CatDetail;


