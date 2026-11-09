// importing the necessary libraries, custom methods, icons and stylesheets
import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { Card, Col, Row, Button, Text, Container, Grid, Textarea, Loading, Modal } from "@nextui-org/react";
import BoringAvatar from 'boring-avatars'
import { useParams } from "react-router-dom";
import ImageGallery from 'react-image-gallery';
import './PetDetail.css';
import loadingSvg from '../icons/loading.svg'
// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';
import GlobalContext from '../GlobalContext';

// For cleaning up raw text received from API that contains items like &nbsp 
import { decode } from 'he';


// Custom component for rendering embedded YouTube videos in ImageGallery
const YouTubeSlide = ({ item, galleryRef }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const handleSlide = () => {
            // Revert to thumbnail and unmount iframe when navigating away from slide
            setIsPlaying(false);
        };
        window.addEventListener('gallery-slide', handleSlide);
        return () => {
            window.removeEventListener('gallery-slide', handleSlide);
        };
    }, []);

    const handlePlay = (e) => {
        e.stopPropagation();
        // Pause carousel autoplay immediately when video play is clicked
        galleryRef?.current?.pause();
        setIsPlaying(true);
    };

    const embedSrc = item?.embedUrl
        ? (item.embedUrl.includes('?')
            ? `${item.embedUrl}&autoplay=1&enablejsapi=1`
            : `${item.embedUrl}?autoplay=1&enablejsapi=1`)
        : '';

    return (
        <div
            className="image-gallery-image video-wrapper"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                borderRadius: '1rem',
                overflow: 'hidden',
            }}
        >
            {isPlaying ? (
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <iframe
                        title="YouTube video"
                        src={embedSrc}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                            width: '100%',
                            height: '100%',
                            aspectRatio: '16 / 9',
                            maxWidth: '100%',
                            maxHeight: '100%',
                            border: 0,
                            borderRadius: '1rem',
                        }}
                    />
                </div>
            ) : (
                <div
                    onClick={handlePlay}
                    style={{
                        position: 'relative',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <img
                        src={item.original || item.thumbnail}
                        alt="YouTube video thumbnail"
                        className="image-gallery-image"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <div
                        className="video-play-button"
                        style={{
                            position: 'absolute',
                            width: '68px',
                            height: '48px',
                            backgroundColor: '#ff0000',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            transition: 'transform 0.2s ease, background-color 0.2s ease',
                            cursor: 'pointer',
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};


const PetDetail = () => {
    // grabbing the id of a pet that is passed to us as a paramenter
    const { id } = useParams();

    // using a memo to set the items for the photo carousel
    // memos only update once
    let carouselItems = useMemo(() => [], []);
    let orgDetails = useMemo(() => [], []);

    // ref to ImageGallery to pause/play carousel slides
    const galleryRef = useRef(null);

    // getting the current user from the Global Context passed to us from App.js
    const { currentUser, setCurrentUser } = useContext(GlobalContext);


    // using state to store variables
    const [pet, setPet] = useState();
    const [isAdoptionInfoOpen, setAdoptionInfoOpen] = useState(false);
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


    // Listen for YouTube iframe player events and focus blur to pause carousel
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin && event.origin.includes('youtube.com') && event.data) {
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    // info === 1 is PLAYING, info === 3 is BUFFERING
                    if (data && data.event === 'onStateChange' && (data.info === 1 || data.info === 3)) {
                        galleryRef.current?.pause();
                    }
                } catch (e) { }
            }
        };

        const handleBlur = () => {
            if (document.activeElement instanceof HTMLIFrameElement) {
                galleryRef.current?.pause();
            }
        };

        window.addEventListener('message', handleMessage);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    // when an id is passed or changes
    useEffect(() => {

        // gets the pet by id and then sets it into state for usage
        getPet(id).then(setPet);


    }, [id])

    // when photos in carousel or a pet or a current user is changed
    // runs this effect
    useEffect(() => {
        // custom method for getting the photos of the pet
        function getPhotosAndOrg() {
            try {
                // Clear any existing items to prevent duplicates on re-render
                carouselItems.length = 0;

                // Filter and push only picture items
                pet?.included?.forEach(item => {
                    // if the items are pictures, add them to the carousel memo
                    if (item.type === 'pictures' && item.attributes) {
                        carouselItems.push({
                            thumbnail: item.attributes.small?.url || "/no_photo.png",
                            original: item.attributes.large?.url || "/no_photo.png",
                            fullscreen: item.attributes.original?.url || item.attributes.large?.url || "/no_photo.png",
                            loading: loadingSvg
                        });
                    }
                    // if the items are video urls, add them to the carousel memo 
                    // and render a custom component for Youtube videos
                    if (item.type === 'videourls' && item.attributes) {
                        carouselItems.push({
                            thumbnail: `https://img.youtube.com/vi/${item.attributes.videoId}/hqdefault.jpg`,
                            original: `https://img.youtube.com/vi/${item.attributes.videoId}/hqdefault.jpg`,
                            embedUrl: `https://www.youtube.com/embed/${item.attributes.videoId}`,
                            renderItem: (item) => <YouTubeSlide key={item.embedUrl} item={item} galleryRef={galleryRef} />,
                            thumbnailClass: 'video-thumb',
                            loading: loadingSvg
                        });
                    }
                    // if the item are organization info, store it in the memo
                    // could be multiple orgs listed
                    // but we will only show first [0]
                    if (item.type === 'orgs' && item.attributes) {
                        orgDetails.push(item.attributes);

                        // debugging
                        // console.log("Front-end > PetDetail > getPhotosAndOrg > orgDetails > ", orgDetails)
                    }
                });

                // If no photos exist, add a single fallback placeholder
                if (carouselItems.length === 0) {
                    carouselItems.push({
                        thumbnail: "/no_photo.png",
                        original: "/no_photo.png",
                        fullscreen: "/no_photo.png",
                        thumbnailHeight: "125",
                        loading: loadingSvg
                    });
                }
            } catch (err) {
                console.log("Adoptal > Front-end > pets > PetDetail.js > getPhotosAndOrg > ", err);
            }

        }

        // custom method for getting the status of the pet's adoption
        async function getAdoptListStatus(user) {
            try {
                if (user) {
                    // if user's want to adopt array includes the id of an animal
                    if (user.wantToAdopt.includes(parseInt(pet.data[0].id))) {
                        // set the want to adopt status to true
                        setAdopted(true);
                    } else {
                        // otherwise false
                        setAdopted(false);
                    }
                }
            } catch (err) {
                console.log("Adoptal > Front-end > pets > PetDetail.js > getAdoptListStatus > ", err);
            }
        }

        // custom function for getting the private notes for the pet
        async function getPrivateNote(user) {
            try {
                if (user) {
                    // setting the state
                    setNoteData({
                        // to the value of the key of pet's id in the private notes object
                        // example: private notes: { 123456: "Some random note "}
                        txtInput: currentUser.privateNotes[pet.data[0].id]
                    })
                    // for debugging only
                    // console.log("NOTEDATA >>>>>" , noteData.txtInput);
                }

            } catch (err) {
                console.log("Adoptal > Front-end > pets > PetDetail.js > getPrivateNote > ", err);
            }
        }

        // custom function for getting all the comments from users for a specific pet
        async function getAllComments(id) {
            try {
                // running an async request
                const res = await AdoptalApi.getAllCommentsPerPet(id);
                // for debugging
                // console.log("RECEIVED COMMENTS >>>", res);

                // settings the state as the data received
                setComments(res);
            } catch (err) {
                console.log("Adoptal > Front-end > pets > PetDetail.js > getAllComments > ", err);
            }
        }

        try {
            // when the pet loads fully
            if (pet) {
                // and if the pet is actually found
                if (pet !== "404") {
                    // get the photos and load them into the photo carousel
                    // get the org details and store them in a memo to be displayed later
                    getPhotosAndOrg();

                    // format the google maps iframe address to drop a pin to the correct location
                    setAddr(`https://maps.google.com/maps?width=300&height=300&hl=en&q=${orgDetails[0]?.street ? orgDetails[0]?.street : ''}, ${orgDetails[0]?.city}, ${orgDetails[0]?.state} ${orgDetails[0]?.postalcode}+()&t=&z=14&ie=UTF8&iwloc=B&output=embed`.replace(/ /g, '%20'));

                    // get the want to adopt status
                    getAdoptListStatus(currentUser);

                    // get the private notes
                    getPrivateNote(currentUser);

                    // get the public comments
                    getAllComments(pet.data[0].id);
                }
            };
        } catch (err) {
            console.log("Adoptal > Front-end > pets > PetDetail.js > useEffect > ", err);
        }

    }, [carouselItems, orgDetails, pet, currentUser])

    // custom function to get the pet by  id
    async function getPet(id) {
        try {
            // seding a request to the backend
            const res = await AdoptalApi.getSinglePet(id);

            // for debugging
            // console.log("Front-end > PetDetail > getPet(id) > ", res);

            // if the pet is found, then returning the data that we received
            if (res.data) {
                // using the he decoder to remove &nbsp and other artifacts from HTML to Raw text conversion in API
                res.data[0].attributes.descriptionText = decode(res.data[0].attributes.descriptionText);
                return res;
            }
            else {
                // if the pet is not found, displaying error and returning 404
                console.log("Error while getting pet information from API");
                return "404";
            }
        } catch (err) {
            console.log("Adoptal > Front-end > pets > PetDetail.js > getPet > ", err);
            return "404";
        }


    }

    // custom function to handle toggling the Want to Adopt / Remove from Adopt List logic
    async function handleAdoptToggle() {
        try {
            // set the loading to true before the async request
            setAdoptedLoading(true);

            // send an async request to Back-end
            const res = await AdoptalApi.toggleAdoptItem(currentUser.username, pet.data[0].id);

            // if successful
            if (res.msg === "Successfully removed animal from Want to Adopt list") {
                // turn off loading
                setAdoptedLoading(false);
                // set the want to adopt status to false
                setAdopted(false);

                // creating a new variablle and storing the current user
                const usr = currentUser;

                // changing the want to adopt array to remove the pet's id
                usr.wantToAdopt = usr.wantToAdopt.filter(c => c !== pet.data[0].id)

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

                // changing the want to adopt array to have the pet's id
                usr.wantToAdopt.push(parseInt(pet.data[0].id))

                // for debugging
                // console.log("usr >>>>>>>>>>>", usr);

                // setting the current user to the new user object
                setCurrentUser(usr)
            }
        } catch (err) {
            console.log("Adoptal > Front-end > pets > PetDetail.js > handleAdoptToggle > ", err);
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
            const res = await AdoptalApi.addNote(currentUser.username, parseInt(pet.data[0].id), noteData.txtInput)

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
                        [parseInt(pet.data[0].id)]: noteData.txtInput
                    }
                })
            } else {
                // display an error if not successful
                console.log("Error while saving private note")
            }
        } catch (err) {
            console.log("Adoptal > Front-end > pets > PetDetail.js > handleNoteSubmit > ", err);
        }
    }

    async function handleNoteDelete(e) {
        try {
            // preventing default behavior
            // e.preventDefault();

            // set the loading to true before the async request
            setNoteLoadingDelete(true);
            const res = await AdoptalApi.removeNote(currentUser.username, parseInt(pet.data[0].id))
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
                delete newNotes[parseInt(pet.data[0].id)];

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
            console.log("Adoptal > Front-end > pets > PetDetail.js > handleNoteDelete > ", err);
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
            const res = await AdoptalApi.addComment(currentUser.username, parseInt(pet.data[0].id), commentData.txtInput)
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
                        [parseInt(pet.data[0].id)]: commentData.txtInput
                    }
                })
            } else {
                // display an error if not successful
                console.log("Error while saving public note")
            }
        } catch (err) {
            console.log("Adoptal > Front-end > pets > PetDetail.js > handleCommentSubmit > ", err);
        }
    }

    async function handleCommentDelete(e) {
        try {
            // preventing default behavior
            // e.preventDefault();

            // set the loading to true before the async request
            setCommentLoadingDelete(true);
            const res = await AdoptalApi.removeComment(currentUser.username, parseInt(pet.data[0].id))
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
                delete newComments[parseInt(pet.data[0].id)];

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
            console.log("Adoptal > Front-end > pets > PetDetail.js > handleCommentDelete > ", err);
        }

    }

    return (<>

        {
            // if the pet has completed loading
            pet
                // if the response from back-end is 404, displaying a message saying that its not found
                ? pet === "404"
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

                    // if the response from back-end is normal (not 404), displaying pet details
                    : <Container aria-label="main container">
                        {/* Adding a modal that goes over everything for Adoption Process as a text */}
                        <Modal
                            closeButton
                            blur
                            width="1000px"
                            aria-labelledby="adoption-process"
                            open={isAdoptionInfoOpen}
                            // whe closed, settings the visibility of the modal to false
                            onClose={() => { setAdoptionInfoOpen(false); }}

                        >
                            <Modal.Header>
                                <Text h3 size={22} style={{ color: "#8f27ff" }}>
                                    Adoption Process
                                </Text>
                            </Modal.Header>

                            <Modal.Body >
                                <Text size={22} style={{ fontWeight: "normal" }}>
                                    {orgDetails[0]?.adoptionProcess}

                                </Text>


                            </Modal.Body>

                        </Modal>
                        <Row>
                            <Col>


                                {/* image carousel */}
                                <ImageGallery
                                    ref={galleryRef}
                                    onBeforeSlide={() => {
                                        window.dispatchEvent(new CustomEvent('gallery-slide'));
                                    }}
                                    onSlide={() => {
                                        window.dispatchEvent(new CustomEvent('gallery-slide'));
                                    }}
                                    lazyload
                                    showNav
                                    showThumbnails
                                    thumbnailPosition="bottom"
                                    showFullscreenButton={true}
                                    // useBrowserFullscreen={false}
                                    showIndex={true}
                                    autoPlay={true}
                                    slideInterval="6000"
                                    onErrorImageURL="/broken-robot.png"
                                    items={carouselItems}></ImageGallery>
                            </Col>
                        </Row>
                        <br></br>
                        <Row >
                            <Col xs={12} >
                                <Text h1 style={{ textAlign: "center" }}>{pet.data[0].attributes.name}</Text>
                            </Col>
                        </Row>
                        <Row >
                            <Col xs={12} >
                                <Text h3 style={{ textAlign: "center", color: "green" }}>
                                    {pet.data[0].attributes.isAdoptionPending != null && pet.data[0].attributes.isAdoptionPending === true ? "📝 Adoption pending" : ''}

                                </Text>
                            </Col>
                        </Row>
                        <Row >
                            <Col xs={12} >
                                <Text h3 style={{ textAlign: "center", color: "purple" }}>
                                    {pet.data[0].attributes.adoptionFeeString != null ? pet.data[0].attributes.adoptionFeeString === true : ''}

                                </Text>
                            </Col>
                        </Row>


                        <Row >
                            <Col xs={12} >
                                <Text h3 size={22}>

                                    <span style={{ color: "#8f27ff" }}>About Me: </span>
                                    <span style={{ fontWeight: "normal", }}>{pet.data[0].attributes.descriptionText}</span>
                                </Text>
                            </Col>
                        </Row>


                        <br></br>





                        <br></br>
                        {/* Multiple areas below are checking if a value exists and if not, setting to Unknown for UX */}
                        <Grid.Container gap={1} justify="space-evenly" aria-label="details-columns">
                            <Grid xs={12} md={6} lg={4}>
                                <Grid.Container aria-label="basic info" alignContent="flex-start">
                                    <div className='pet-detail-section' aria-label="basic information">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Information
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Breed:{" "}
                                                </b>
                                                {pet.data[0].attributes.breedPrimary ? pet.data[0].attributes.breedPrimary : 'Unknown'}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Color:{" "}
                                                </b>
                                                {pet.data[0].attributes.colorDetails ? pet.data[0].attributes.colorDetails : 'Unknown'}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Age:{" "}
                                                </b>
                                                {pet.data[0].attributes.ageString ? pet.data[0].attributes.ageString : 'Unknown'}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Gender:{" "}
                                                </b>
                                                {pet.data[0].attributes.sex ? pet.data[0].attributes.sex : 'Unknown'}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Size:{" "}
                                                </b>
                                                {pet.data[0].attributes.sizeCurrent != null
                                                    ? `${Number(pet.data[0].attributes.sizeCurrent).toFixed(1)} ${pet.data[0].attributes.sizeUOM || 'lbs'}`
                                                    : 'Unknown'}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Coat Length:{" "}
                                                </b>
                                                {pet.data[0].attributes.coatLength ? pet.data[0].attributes.coatLength : 'Unknown'}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Indoor or Outdoor:{" "}
                                                </b>
                                                {pet.data[0].attributes.indoorOutdoor != null
                                                    ? pet.data[0].attributes.indoorOutdoor
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Qualities:{" "}
                                                </b>
                                                {
                                                    pet.data[0].attributes.qualities != null
                                                        ? pet.data[0].attributes.qualities.map(quality => {
                                                            return (
                                                                // 20889175
                                                                <span key={quality}
                                                                    style={{
                                                                        border: "1px solid #8f27ff",
                                                                        borderRadius: "1rem",
                                                                        paddingRight: "0.5rem", paddingLeft: "0.5rem",
                                                                        margin: "0.3rem",
                                                                        display: "inline-block"
                                                                    }}>
                                                                    {quality}
                                                                </span>
                                                            )
                                                        })
                                                        : ''
                                                }
                                            </Text>
                                        </Grid>
                                    </div>

                                    <div className='pet-detail-section' aria-label="medical behavioral section">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Medical
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Spayed/Neutered:{" "}
                                                </b>
                                                {pet.data[0].attributes.isAltered != null
                                                    ? (pet.data[0].attributes.isAltered ? "✅ Yes" : "❌ No")
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Declawed:{" "}
                                                </b>
                                                {pet.data[0].attributes.isDeclawed != null
                                                    ? (pet.data[0].attributes.isDeclawed ? "Yes" : "No")
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Up-to-date vaccinations:{" "}
                                                </b>
                                                {pet.data[0].attributes.isCurrentVaccinations != null
                                                    ? (pet.data[0].attributes.isCurrentVaccinations ? "✅ Yes" : "No")
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>


                                    </div>

                                    <div className='pet-detail-section' aria-label="environmental">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Social
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Good with Children:{" "}
                                                </b>
                                                {pet.data[0].attributes.isKidsOk != null
                                                    ? (pet.data[0].attributes.isKidsOk ? "✅ Yes" : "No")
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Good with Dogs:{" "}
                                                </b>
                                                {pet.data[0].attributes.isDogsOk != null
                                                    ? (pet.data[0].attributes.isDogsOk ? "✅ Yes" : "No")
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Good with Cats:{" "}
                                                </b>
                                                {pet.data[0].attributes.isCatsOk != null
                                                    ? (pet.data[0].attributes.isCatsOk ? "✅ Yes" : "No")
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Reaction to new people:{" "}
                                                </b>
                                                {pet.data[0].attributes.newPeopleReaction != null
                                                    ? pet.data[0].attributes.newPeopleReaction
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    House Trained:{" "}
                                                </b>
                                                {pet.data[0].attributes.isHousetrained != null
                                                    ? (pet.data[0].attributes.isHousetrained ? "✅ Yes" : "No")
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>
                                    </div>

                                    <div className='pet-detail-section' aria-label="levels">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Temperament
                                            </Text>

                                            <Grid xs={12}>
                                                <Text size={18}>
                                                    <b>
                                                        Activity Level:{" "}
                                                    </b>
                                                    {pet.data[0].attributes.activityLevel != null
                                                        ? pet.data[0].attributes.activityLevel
                                                        : "Unknown"}
                                                </Text>
                                            </Grid>
                                            <Grid xs={12}>
                                                <Text size={18}>
                                                    <b>
                                                        Energy Level:{" "}
                                                    </b>
                                                    {pet.data[0].attributes.energyLevel != null
                                                        ? pet.data[0].attributes.energyLevel
                                                        : "Unknown"}
                                                </Text>
                                            </Grid>
                                            <Grid xs={12}>
                                                <Text size={18}>
                                                    <b>
                                                        Vocal Level:{" "}
                                                    </b>
                                                    {pet.data[0].attributes.vocalLevel != null
                                                        ? pet.data[0].attributes.vocalLevel
                                                        : "Unknown"}
                                                </Text>
                                            </Grid>
                                        </Grid>

                                    </div>
                                </Grid.Container>
                            </Grid>

                            <Grid xs={12} md={6} lg={4}>
                                <Grid.Container aria-label="basic info" alignContent="flex-start">





                                    <div className='pet-detail-section' aria-label="needs">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Care
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Exercise Needs:{" "}
                                                </b>
                                                {pet.data[0].attributes.exerciseNeeds != null
                                                    ? pet.data[0].attributes.exerciseNeeds
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>

                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Grooming Needs:{" "}
                                                </b>
                                                {pet.data[0].attributes.groomingNeeds != null
                                                    ? pet.data[0].attributes.groomingNeeds
                                                    : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Special Needs:{" "}
                                                </b>
                                                {pet.data[0].attributes.isSpecialNeeds != null
                                                    ? (pet.data[0].attributes.isSpecialNeeds ? "Yes" : "No")
                                                    : "Unknown"}
                                                {pet.data[0].attributes.isSpecialNeeds ? pet.data[0].attributes.specialNeedsDetails : ''}
                                            </Text>
                                        </Grid>
                                    </div>
                                    <div className='pet-detail-section' aria-label="contact information">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Contact
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    RescueGroups ID:{" "}
                                                </b>
                                                {pet.data[0].id ? pet.data[0].id : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Pet ID:{" "}

                                                </b>
                                                {pet.data[0].attributes.rescueId ? pet.data[0].attributes.rescueId : "Unknown"}

                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Organization Name:{" "}
                                                </b>
                                                {orgDetails[0]?.name ? orgDetails[0]?.name : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Phone #:{" "}
                                                </b>
                                                {orgDetails[0]?.phone ? orgDetails[0]?.phone : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Email:{" "}
                                                </b>
                                                <a href={orgDetails[0]?.email ? `mailto:${orgDetails[0]?.email}` : ''}>
                                                    {orgDetails[0]?.email ? orgDetails[0]?.email : "Unknown"}
                                                </a>
                                            </Text>
                                        </Grid>
                                    </div>

                                    <div className='pet-detail-section' aria-label="location">
                                        <Grid xs={12}>
                                            <Text b size={24} color="secondary">
                                                Location
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Address: {" "}
                                                </b>
                                                {orgDetails[0]?.street ? orgDetails[0]?.street : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    City:{" "}
                                                </b>
                                                {orgDetails[0]?.city ? orgDetails[0]?.city : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    State:{" "}
                                                </b>
                                                {orgDetails[0]?.state ? orgDetails[0]?.state.toUpperCase() : "Unknown"}
                                            </Text>
                                        </Grid>
                                        <Grid xs={12}>
                                            <Text size={18}>
                                                <b>
                                                    Zip:{" "}
                                                </b>
                                                {orgDetails[0]?.postalcode ? orgDetails[0]?.postalcode : "Unknown"}
                                            </Text>
                                        </Grid>
                                    </div>

                                    <div className='pet-detail-section' aria-label="map">
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

                            <Grid xs={12} md={6} lg={4}>
                                <Grid.Container aria-label="third column" alignContent="flex-start">

                                    {
                                        // if the user has finished loading / exists / logged in
                                        currentUser
                                            ?
                                            <>
                                                <div className='pet-detail-section' aria-label="adopt list status">
                                                    <Grid xs={12}>
                                                        <Text b size={24} color="secondary">
                                                            Want to Adopt List
                                                        </Text>
                                                    </Grid>

                                                    <Grid xs={12}>
                                                        <Text
                                                            size={18}>
                                                            {/* Displays if an animal is in the adopt list or not */}
                                                            {pet.data[0].attributes.name} is {adopted ? '' : 'not'} in your Adopt List
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
                                                                        ? `Remove ${pet.data[0].attributes.name}`
                                                                        : `Add ${pet.data[0].attributes.name}`
                                                            }
                                                        </Button>


                                                    </Grid>
                                                </div>

                                                <div className='pet-detail-section' aria-label="private notes">
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
                                            </>
                                            // if the user is not loaded yet, displays an empty area
                                            : ''
                                    }



                                    {/* Only show Adoption, Organization website and Facebook page buttons if links exists in data */}
                                    {pet.data[0].attributes.url || orgDetails[0]?.url || orgDetails[0]?.facebookUrl || pet.data[0].attributes.adoptionProcess
                                        ? <div className='pet-detail-section' aria-label="map">
                                            <Grid xs={12}>
                                                <Text b size={24} color="secondary">
                                                    Learn more
                                                </Text>
                                            </Grid>
                                            <Grid xs={12}>
                                                {
                                                    pet.data[0].attributes.url
                                                        ? <Button as="a" color="secondary" style={{ marginBottom: "1rem" }} href={pet.data[0].attributes.url} target="_blank" rel="noopener noreferrer" >Adoption link for {pet.data[0].attributes.name}</Button>
                                                        : ''
                                                }

                                                {
                                                    orgDetails[0]?.adoptionProcess
                                                        ? <Button flat color="secondary" style={{ marginBottom: "1rem", width: "100%" }} onPress={() => setAdoptionInfoOpen(true)}>
                                                            Adoption Process
                                                        </Button>
                                                        : ''
                                                }

                                                {
                                                    orgDetails[0]?.url
                                                        ? <Button as="a" style={{ marginBottom: "1rem" }} href={orgDetails[0]?.url} target="_blank" rel="noopener noreferrer" >Organization website</Button>
                                                        : ''
                                                }
                                                {
                                                    orgDetails[0]?.facebookUrl
                                                        ? <Button as="a" flat href={orgDetails[0]?.facebookUrl} target="_blank" rel="noopener noreferrer" >Facebook page</Button>
                                                        : ''
                                                }

                                            </Grid>
                                        </div>
                                        : ''
                                    }



                                </Grid.Container>
                            </Grid>
                            <br></br>

                        </Grid.Container >



                        {/* For displaying the comments from the users */}
                        <Row style={{ marginBottom: "2rem" }
                        }>
                            <Col xs={12} className='pet-detail-section'>
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


                                                                <BoringAvatar as="button" size={48} name={`${comment.firstName} ${comment.lastName}`} variant="beam" colors={["#FFF7E6", "#D48EFC", "#DCB3FE", "#AB7CFF", "#B4C4FF"]} />

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
                                                                            {comment.publicComments[parseInt(pet.data[0].id)]}
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
                                        currentUser.publicComments[pet.data[0].id]
                                            ? ''
                                            // if the user hasn't commented yet, show an area where that can be done
                                            : <div className='pet-detail-section' aria-label="public comments" style={{ marginTop: "0" }}>
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
                        </Row >
                    </Container >

                // if the pet is loading
                : <Container aria-label="loading container" style={{ textAlign: "center", paddingTop: "3rem" }}>
                    <img src={loadingSvg} alt='loading spinner'></img>
                </Container>
        }

    </>)

}

export default PetDetail;


