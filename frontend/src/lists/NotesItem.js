// Importing all the necessary libraries and components and assets
import React, { useState, useContext, useEffect } from 'react';
import { Grid, Image, Card, Textarea, Button, Row, Col, Text, Loading } from "@nextui-org/react";
import '../pets/PetCard.css'
import GlobalContext from '../GlobalContext';
import { useNavigate } from "react-router-dom";

// For cleaning up raw text received from API that contains items like &nbsp 
import { decode } from 'he';

// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';

const NotesItem = ({ pet, type }) => {
    // using navigate for dynamic navigation
    const navigate = useNavigate();
    // using state to store variables
    const [id, setId] = useState();

    // when an id is changed, this effect runs
    useEffect(() => {
        if (id) {
            // soft redirects to the Cat Details page
            navigate(`/pet/${id}`);
        }
    }, [id, navigate])

    // receiving the global context for current user
    const { currentUser, setCurrentUser } = useContext(GlobalContext);
    // using state to keep track of various items
    const [visible, setVisible] = useState(true); // displaying of component
    const [formData, setFormData] = useState(); // text input data
    const [loading, setLoading] = useState(false); // loading state for Saving
    const [loadingDelete, setLoadingDelete] = useState(false); // loading state for Deleting
    const [success, setSuccess] = useState(false); // success state


    let petPhoto = pet.data[0].attributes?.pictureThumbnailUrl
        ? pet.data[0].attributes?.pictureThumbnailUrl.replace(/width=\d+/, 'width=400')
        : "/no_photo.png";

    // using the he decoder to remove &nbsp and other artifacts from HTML to Raw text conversion in API
    pet.data[0].attributes.descriptionText = decode(pet.data[0].attributes.descriptionText);

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

    // / creating a custom method to handle the submission of the form
    async function handleSubmit(e) {
        try {
            // preventing default behavior
            // e.preventDefault();

            // if the type of notes is passed
            if (type === "notes") {
                // set the loading state of saving to true
                setLoading(true);

                // sending a back-end request with current username, pet id and the form data value
                const res = await AdoptalApi.addNote(currentUser.username, parseInt(pet.data[0].id), formData.txtInput)

                // for debugging
                // console.log(res);

                // if the request to back-end is successful
                if (res.msg === "Successfully added private note") {
                    // turning off loading
                    setLoading(false);
                    // showing success message
                    setSuccess(true);

                    // settings the current user
                    setCurrentUser({
                        // to what is there now
                        ...currentUser,
                        // but changing the private notes
                        privateNotes: {
                            // keeping whats out there now
                            ...currentUser.privateNotes,
                            // but setting the note for the select pet to new value
                            [parseInt(pet.data[0].id)]: formData.txtInput
                        }
                    })
                } else {
                    console.log("Error while saving private note")
                }

            }
            // if the type of notes was NOT passed (then it will be a comment, not a note)
            else {
                // set the loading state of saving to true
                setLoading(true);

                // sending a back-end request with current username, pet id and the form data value
                const res = await AdoptalApi.addComment(currentUser.username, parseInt(pet.data[0].id), formData.txtInput)

                // for debugging
                // console.log(res);

                // if the request to back-end is successful
                if (res.msg === "Successfully added public note") {
                    // turning off loading
                    setLoading(false);
                    // showing success message
                    setSuccess(true);

                    // settings the current user
                    setCurrentUser({
                        // to what is there now
                        ...currentUser,
                        // but changing the public comments
                        publicComments: {
                            // keeping whats out there now
                            ...currentUser.publicComments,
                            // but setting the comment for the select pet to new value
                            [parseInt(pet.data[0].id)]: formData.txtInput
                        }
                    })
                } else {
                    console.log("Error while saving public comment")
                }
            }
        } catch (err) {
            console.log("Adoptal > Front-end > lists > NotesItem.js > handleSubmit > ", err);
        }
    }

    async function handleDelete(e) {
        try {
            // preventing default behavior
            // e.preventDefault();

            // if the type of notes is passed
            if (type === "notes") {
                // set the loading state of deleting to true
                setLoadingDelete(true);

                // sending a back-end request with current username and pet id
                const res = await AdoptalApi.removeNote(currentUser.username, parseInt(pet.data[0].id))

                // for debugging
                // console.log(res);

                // if the request to back-end is successful
                if (res.msg === "Successfully deleted private note") {
                    // turning off loading
                    setLoadingDelete(false);
                    // setting the card to hidden
                    setVisible(false)

                    // creating a copy of the current private Notes of user
                    const newNotes = currentUser.privateNotes;
                    // deleting the entry that we have for this pet
                    delete newNotes[parseInt(pet.data[0].id)];

                    // settings the current user
                    setCurrentUser({
                        // to what is there now
                        ...currentUser,
                        // but replacing the private notes with the new object that DOES NOT have the note about the current pet
                        privateNotes: newNotes
                    })
                } else {
                    console.log("Error while deleting private note")
                }

            }
            // if the type of notes was NOT passed (then it will be a comment, not a note)
            else {
                // set the loading state of deleting to true
                setLoadingDelete(true);

                // sending a back-end request with current username and pet id
                const res = await AdoptalApi.removeComment(currentUser.username, parseInt(pet.data[0].id))

                // for debugging
                // console.log(res);

                // if the request to back-end is successful
                if (res.msg === "Successfully deleted public comment") {
                    // turning off loading
                    setLoadingDelete(false);
                    // setting the card to hidden
                    setVisible(false)

                    // creating a copy of the current private Notes of user
                    const newComments = currentUser.publicComments;
                    // deleting the entry that we have for this pet
                    delete newComments[parseInt(pet.data[0].id)];

                    // settings the current user
                    setCurrentUser({
                        // to what is there now
                        ...currentUser,
                        // but replacing the public comments with the new object that DOES NOT have the comment about the current pet
                        publicComments: newComments
                    })
                } else {
                    console.log("Error while saving public comment")
                }
            }
        } catch (err) {
            console.log("Adoptal > Front-end > lists > NotesItem.js > handleDelete > ", err);
        }
    }


    return (<>
        {/* {console.log("ListItem >>> pet >>>", pet)} */}
        {
            // if the component is set to visible
            visible
                ? <Grid xs={12} key={parseInt(pet.data[0].id)} justify="flex-start" >
                    {/* displaying a card with the pet's information */}
                    {/* displays 4 columns */}


                    <Card isHoverable className="loaded" >
                        <Card.Body css={{ p: 0 }} style={{ overflow: "hidden" }}>
                            <Grid.Container gap={0} justify="flex-start">

                                {/* column 1 - pet's photo */}
                                <Grid xs={12} md={3}>
                                    <div
                                        style={{ cursor: "pointer", width: "100%", height: "100%" }}
                                        onClick={() => setId(pet?.data[0]?.id)}
                                    >
                                        <Image
                                            showSkeleton
                                            // if there is no photo available, use a placeholder photo
                                            src={petPhoto}
                                            objectFit="cover"
                                            width="100%"
                                            height={300}
                                            alt={pet.data[0].attributes?.name}
                                            containerCss={{ cursor: "pointer" }}
                                            css={{ cursor: "pointer" }}
                                            onClick={() => setId(pet?.data[0]?.id)}
                                        />
                                    </div>
                                </Grid>

                                {/* column 2 - pet's details */}
                                <Grid xs={12} md={9}>
                                    <Row css={{ p: "$4", "@md": { p: "0rem 2rem" } }}>

                                        <Col>
                                            <Row justify='center' css={{ mb: "$2" }}>
                                                <Text b color="secondary" size={24}>{pet.data[0].attributes?.name}</Text>
                                            </Row>
                                            <Grid.Container gap={1}>
                                                {/* section 1 - pet's details */}
                                                <Grid xs={12} md={4} css={{ borderRight: "none", "@md": { borderRight: "1px solid $neutralBorder", pr: "$4" } }}>
                                                    <Col>
                                                        <Row>
                                                            <Col>
                                                                <Text b size={16}>ID:</Text>
                                                            </Col>
                                                            <Col>
                                                                <Text size={16}>{pet.data[0].id ? pet.data[0].id : "Unknown"}</Text>
                                                            </Col>

                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Text b size={16}>Breed:</Text>
                                                            </Col>
                                                            <Col>
                                                                <Text size={16}>   {pet.data[0].attributes.breedPrimary ? pet.data[0].attributes.breedPrimary : 'Unknown'}</Text>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Text b size={16}>Color:</Text>
                                                            </Col>
                                                            <Col>
                                                                <Text size={16}>{pet.data[0].attributes.colorDetails ? pet.data[0].attributes.colorDetails : 'Unknown'}</Text>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Text b size={16}>Age:</Text>
                                                            </Col>
                                                            <Col>
                                                                <Text size={16}>{pet.data[0].attributes.ageString ? pet.data[0].attributes.ageString : 'Unknown'}</Text>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Text b size={16}>Gender:</Text>
                                                            </Col>
                                                            <Col>
                                                                <Text size={16}>    {pet.data[0].attributes.sex ? pet.data[0].attributes.sex : 'Unknown'}</Text>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Text b size={16}>Size:</Text>
                                                            </Col>
                                                            <Col>
                                                                <Text size={16}>{pet.data[0].attributes.sizeCurrent != null
                                                                    ? `${Number(pet.data[0].attributes.sizeCurrent).toFixed(1)} ${pet.data[0].attributes.sizeUOM || 'lbs'}`
                                                                    : 'Unknown'}</Text>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Text b size={16}>Spayed / Neutered:</Text>
                                                            </Col>
                                                            <Col>
                                                                <Text size={16}>{pet.data[0].attributes.isAltered != null
                                                                    ? (pet.data[0].attributes.isAltered ? "✅ Yes" : "No")
                                                                    : "Unknown"}</Text>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Text b size={16}>Vaccinated:</Text>
                                                            </Col>
                                                            <Col>
                                                                <Text size={16}>{pet.data[0].attributes.isCurrentVaccinations != null
                                                                    ? (pet.data[0].attributes.isCurrentVaccinations ? "✅ Yes" : "No")
                                                                    : "Unknown"}</Text>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Text b size={16}>House Trained:</Text>
                                                            </Col>
                                                            <Col>
                                                                <Text size={16}> {pet.data[0].attributes.isHousetrained != null
                                                                    ? (pet.data[0].attributes.isHousetrained ? "✅ Yes" : "No")
                                                                    : "Unknown"}</Text>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Grid>

                                                {/* section 2 - pet's description and name */}
                                                <Grid xs={12} md={4} css={{ p: "1rem 0", "@md": { p: "0rem 1rem" } }}>
                                                    <Col>
                                                        <Row justify="center" css={{ mb: "$2" }}>
                                                            <Text b size={16}>Description</Text>
                                                        </Row>
                                                        <div
                                                            style={{
                                                                maxHeight: "15em",
                                                                lineHeight: "1.5",
                                                                overflowY: "auto",
                                                                overflowX: "hidden",
                                                                width: "100%",
                                                                paddingRight: "0.25rem"
                                                            }}
                                                        >
                                                            <Text size={16} style={{ lineHeight: "1.5", margin: 0 }}>
                                                                {pet.data[0].attributes?.descriptionText || 'No description available.'}
                                                            </Text>
                                                        </div>
                                                    </Col>
                                                </Grid>

                                                {/* section 3 - pet's note or comment and buttons to update and delete them */}
                                                <Grid xs={12} md={4} css={{ p: "1rem 0", borderLeft: "none", "@md": { p: "0rem 1rem", borderLeft: "1px solid $neutralBorder" } }}>
                                                    <Col>
                                                        <Row justify='center'>
                                                            {
                                                                success
                                                                    ? <Text b color="success" size={16}>{type === "notes" ? "Note" : "Comment"} successfully updated!</Text>
                                                                    : <Text b size={16}>My {type === "notes" ? "Note" : "Comment"}</Text>
                                                            }

                                                        </Row>
                                                        <Row>
                                                            <Textarea
                                                                fullWidth
                                                                size="md"
                                                                name='txtInput'
                                                                onChange={handleChange}
                                                                minRows={7}
                                                                maxRows={20}
                                                                initialValue={type === "notes" ? pet.privateNotes : pet.publicComments}
                                                                bordered
                                                                aria-label="note input"
                                                            ></Textarea>
                                                        </Row>
                                                        <Row justify="space-between" css={{ paddingTop: "1rem" }}>
                                                            {/* displaying a button that allow us to remove the item */}
                                                            <Button
                                                                flat
                                                                onPress={handleDelete}
                                                                color="error"
                                                                type="submit"
                                                                auto>
                                                                {
                                                                    loadingDelete
                                                                        ? <Loading type="points" color="currentColor" size="md" />
                                                                        : "Delete"
                                                                }
                                                            </Button>

                                                            {/* displaying a button that allow us to update the data of the item */}
                                                            <Button
                                                                flat
                                                                onPress={handleSubmit}
                                                                auto
                                                                type="submit" color="success">
                                                                {
                                                                    loading
                                                                        ? <Loading type="points" color="currentColor" size="md" />
                                                                        : "Save"
                                                                }
                                                            </Button>
                                                        </Row>
                                                    </Col>
                                                </Grid>
                                            </Grid.Container>
                                        </Col>
                                    </Row>
                                </Grid>
                            </Grid.Container>

                        </Card.Body>
                    </Card>
                </Grid>
                : ''
        }
    </>)

}

export default NotesItem;