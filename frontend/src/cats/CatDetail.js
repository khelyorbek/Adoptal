import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Card, Col, Row, Button, Text, Container, Grid, Textarea, Loading, Avatar } from "@nextui-org/react";
import { useParams } from "react-router-dom";
import ImageGallery from 'react-image-gallery';
import './CatDetail.css';
import loadingSvg from '../icons/loading.svg'
// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';
import GlobalContext from '../GlobalContext';


const CatDetail = () => {
    const { id } = useParams();
    const [cat, setCat] = useState();
    const carouselItems = useMemo(() => [], []);
    const [addr, setAddr] = useState();
    const { currentUser, setCurrentUser } = useContext(GlobalContext);
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



    useEffect(() => {
        getCat(id).then(setCat);
    }, [id])

    useEffect(() => {
        function getPhotos() {
            for (let pic of cat.photos) {
                carouselItems.push({
                    thumbnail: pic.small,
                    original: pic.large,
                    fullscreen: pic.full,
                    originalHeight: "480",
                    thumbnailHeight: "100",
                    loading: loadingSvg
                })
            }
        }

        async function getAdoptListStatus(user) {
            if (user.wantToAdopt.includes(cat.id)) {
                setAdopted(true);
            } else {
                setAdopted(false);
            }
        }

        async function getPrivateNote(user) {
            setNoteData({
                txtInput: currentUser.privateNotes[cat.id]
            })
            // console.log("NOTEDATA >>>>>" , noteData.txtInput);
        }

        async function getAllComments(id) {
            const res = await AdoptalApi.getAllCommentsPerCat(id);
            console.log("RECEIVED COMMENTS >>>", res);
            setComments(res);
        }

        if (cat) {
            if (cat !== "404") {
                getPhotos();
                setAddr(`https://maps.google.com/maps?width=300&height=300&hl=en&q=${cat.contact.address.address1 ? cat.contact.address.address1 : ''}, ${cat.contact.address.city}, ${cat.contact.address.state} ${cat.contact.address.postcode}+()&t=&z=14&ie=UTF8&iwloc=B&output=embed`.replace(/ /g, '%20'));
                getAdoptListStatus(currentUser);
                getPrivateNote(currentUser);
                getAllComments(cat.id);
            }
        };
    }, [carouselItems, cat, currentUser])

    async function getCat(id) {
        const res = await AdoptalApi.getSingleCat(id);

        // console.log("RES >>>", res);
        if (res !== "Not found") { return res }
        else {
            console.log("Error while getting cat information from API!");
            return "404"
        }
    }

    async function handleAdoptToggle() {
        setAdoptedLoading(true);

        const res = await AdoptalApi.toggleAdoptItem(currentUser.username, cat.id);

        if (res.msg === "Successfully removed animal from Want to Adopt list") {
            setAdoptedLoading(false);
            setAdopted(false);

        } else {
            setAdoptedLoading(false);
            setAdopted(true);
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

    // / creating a custom method to handle the submission of the form
    async function handleNoteSubmit(e) {
        // preventing default behavior
        // e.preventDefault();
        setNoteLoadingSubmit(true);
        const res = await AdoptalApi.addNote(currentUser.username, cat.id, noteData.txtInput)
        // console.log(res);
        if (res.msg === "Successfully added private note") {
            setNoteLoadingSubmit(false);
            setNoteSuccess(true)
        } else {
            console.log("Error while saving private note")
        }

    }

    async function handleNoteDelete(e) {
        // preventing default behavior
        // e.preventDefault();
        setNoteLoadingDelete(true);
        const res = await AdoptalApi.removeNote(currentUser.username, cat.id)
        // console.log(res);
        if (res.msg === "Successfully deleted private note") {
            setNoteLoadingDelete(false);
            setNoteData(null);
            setNoteSuccess(true);
        } else {
            console.log("Error while deleting private note")
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
        // preventing default behavior
        // e.preventDefault();
        setCommentLoadingSubmit(true);
        const res = await AdoptalApi.addComment(currentUser.username, cat.id, noteData.txtInput)
        // console.log(res);
        if (res.msg === "Successfully added public note") {
            setCommentLoadingSubmit(false);
            setCommentSuccess(true)
        } else {
            console.log("Error while saving public note")
        }

    }

    async function handleCommentDelete(e) {
        // preventing default behavior
        // e.preventDefault();
        setCommentLoadingDelete(true);
        const res = await AdoptalApi.removeComment(currentUser.username, cat.id)
        // console.log(res);
        if (res.msg === "Successfully deleted public comment") {
            setCommentLoadingDelete(false);
            setCommentData(null);
        } else {
            console.log("Error while deleting public comment")
        }
    }

    return (<>

        {
            cat
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
                    : <Container aria-label="main container">
                        <Row>
                            <Col>
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
                                                addr
                                                    ? <div aria-label="map" style={{ overflow: "hidden" }}><iframe title="map" width="100%" height="300" frameBorder="0" style={{ overflow: "hidden" }} marginHeight="0" marginWidth="0" src={addr}></iframe></div>
                                                    : "Unavailable"
                                            }

                                        </Grid>
                                    </div>
                                </Grid.Container>
                            </Grid>

                            <Grid xs={3} alignItems="flex-start">
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
                                                {cat.name} is {adopted ? '' : 'not'} in your Adopt List
                                            </Text>

                                            <Button
                                                color={adopted ? "error" : "primary"}
                                                onPress={handleAdoptToggle}
                                                flat>
                                                {
                                                    adoptedLoading
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
                                            <Textarea
                                                aria-label="private note input"
                                                fullWidth
                                                size="md"
                                                name='txtInput'
                                                onChange={handleNoteChange}
                                                minRows={7}
                                                maxRows={20}
                                                initialValue={noteData ? noteData.txtInput : ''}
                                                bordered
                                            ></Textarea>
                                        </Row>
                                        <div aria-label="success message">
                                            {noteSuccess ? <Text color="success" size={16}> Successfully updated note.</Text> : ''}
                                        </div>
                                        <Row justify="space-between" css={{ paddingTop: "1rem" }}>

                                            <Button
                                                flat
                                                onPress={handleNoteDelete}
                                                color="error"
                                                type="submit"
                                                auto>
                                                {
                                                    noteLoadingDelete
                                                        ? <Loading type="points" color="currentColor" size="md" />
                                                        : "Delete"
                                                }
                                            </Button>

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
                        </Grid.Container>

                        <Row >
                            <Col xs={12} >
                                <Text h2 color="secondary" style={{ textAlign: "center" }}>Comments from users</Text>

                                {
                                    comments ?
                                        comments.length > 0
                                            ? comments.map(comment => {
                                                console.log("Comments map >>> ", comments)
                                                return (<>
                                                    <Row>
                                                        <Card xs={12} css={{ p: "$6", margin: "0.5rem 0" }}>
                                                            <Card.Header>
                                                                <Avatar
                                                                    bordered
                                                                    as="button"
                                                                    color="gradient"
                                                                    size="lg"
                                                                    // this uses automatic avatar generation API based on the first and last name
                                                                    src={`https://source.boringavatars.com/beam/150/${comment.firstName}%20${comment.lastName}?colors=FFF7E6,D48EFC,DCB3FE,AB7CFF,B4C4FF`}
                                                                />
                                                                <Grid.Container css={{ pl: "$6" }}>
                                                                    <Grid xs={12}>
                                                                        <Text h4 css={{ lineHeight: "$xs" }}>
                                                                            {comment.firstName} {' '} {comment.lastName}
                                                                        </Text>
                                                                    </Grid>
                                                                    <Grid xs={12}>
                                                                        <Text css={{ color: "$accents8" }}>@{comment.username}</Text>
                                                                    </Grid>
                                                                </Grid.Container>
                                                            </Card.Header>
                                                            <Card.Body css={{ py: "$2" }}>
                                                                <Text>
                                                                    {comment.publicComments[parseInt(cat.id)]}
                                                                </Text>
                                                            </Card.Body>
                                                        </Card>
                                                    </Row>
                                                </>)
                                            })
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
                                                <Text size={24} >Comments are empty for this pet. Be the first to comment below:</Text>
                                            </Container>
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
                                            <Text size={24} >Comments are empty for this pet. Be the first to comment below:</Text>
                                        </Container>

                                }
                            </Col>
                        </Row>
                    </Container>

                : <Container aria-label="loading container" style={{ textAlign: "center", paddingTop: "3rem" }}>
                    <img src={loadingSvg} alt='loading spinner'></img>
                </Container>
        }

    </>)

}

export default CatDetail;


