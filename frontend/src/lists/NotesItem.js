// Importing all the necessary libraries and components and assets
import React, { useState, useContext } from 'react';
import { Grid, Image, Card, Textarea, Button, Row, Col, Text, Loading } from "@nextui-org/react";
import '../cats/CatCard.css'
import GlobalContext from '../GlobalContext';

// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';

const NotesItem = ({ cat, type }) => {
    // receiving the global context for current user
    const { currentUser, setCurrentUser } = useContext(GlobalContext);
    // using state to keep track of various items
    const [visible, setVisible] = useState(true); // displaying of component
    const [formData, setFormData] = useState(); // text input data
    const [loading, setLoading] = useState(false); // loading state for Saving
    const [loadingDelete, setLoadingDelete] = useState(false); // loading state for Deleting
    const [success, setSuccess] = useState(false); // success state

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

                // sending a back-end request with current username, cat id and the form data value
                const res = await AdoptalApi.addNote(currentUser.username, cat.id, formData.txtInput)

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
                            // but setting the note for the select cat to new value
                            [parseInt(cat.id)]: formData.txtInput
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

                // sending a back-end request with current username, cat id and the form data value
                const res = await AdoptalApi.addComment(currentUser.username, cat.id, formData.txtInput)

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
                            // but setting the comment for the select cat to new value
                            [parseInt(cat.id)]: formData.txtInput
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

                // sending a back-end request with current username and cat id
                const res = await AdoptalApi.removeNote(currentUser.username, cat.id)

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
                    // deleting the entry that we have for this cat
                    delete newNotes[parseInt(cat.id)];

                    // settings the current user
                    setCurrentUser({
                        // to what is there now
                        ...currentUser,
                        // but replacing the private notes with the new object that DOES NOT have the note about the current cat
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

                // sending a back-end request with current username and cat id
                const res = await AdoptalApi.removeComment(currentUser.username, cat.id)

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
                    // deleting the entry that we have for this cat
                    delete newComments[parseInt(cat.id)];

                    // settings the current user
                    setCurrentUser({
                        // to what is there now
                        ...currentUser,
                        // but replacing the public comments with the new object that DOES NOT have the comment about the current cat
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
        {/* {console.log("ListItem >>> cat >>>", cat)} */}
        {
            // if the component is set to visible
            visible
                ? <Grid xs={12} key={cat.id} justify="flex-start">
                    {/* displaying a card with the cat's information */}
                    {/* displays 4 columns */}

                    
                    <Card isHoverable className="loaded">
                        <Card.Body css={{ p: 0 }}>
                            <Grid.Container gap={0} justify="flex-start">

                                {/* column 1 - cat's photo */}
                                <Grid xs={3}>
                                    <Image
                                        showSkeleton
                                        // if there is no photo available, use a placeholder photo
                                        src={cat.primary_photo_cropped !== null ? cat.primary_photo_cropped.small : "/no_photo_640.jpg"}
                                        objectFit="cover"
                                        width="100%"
                                        height={300}
                                        alt={cat.name}
                                    />
                                </Grid>

                                {/* column 2 - cat's details */}
                                <Grid xs={9}>
                                    <Row css={{ p: "0rem 2rem" }}>
                                        
                                        <Col>
                                            <Row justify='center'>
                                                <Text b color="secondary" size={24}>{cat.name}</Text>
                                            </Row>
                                            <Row>
                                                {/* column 2 - cat's details */}
                                                <Col css={{ borderRight: "1px solid $neutralBorder" }}>
                                                    <Row>
                                                        <Col>
                                                            <Text b size={16}>ID:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text size={16}>{cat.id}</Text>
                                                        </Col>

                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Text b size={16}>Breed:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text size={16}>{cat.breeds.primary}</Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Text b size={16}>Color:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text size={16}>{cat.colors.primary}</Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Text b size={16}>Age:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text size={16}>{cat.age}</Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Text b size={16}>Gender:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text size={16}>{cat.gender}</Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Text b size={16}>Size:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text size={16}>{cat.size}</Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Text b size={16}>Spayed / Neutered:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text size={16}>{
                                                                cat.attributes.spayed_neutered
                                                                    ? "Yes"
                                                                    : "No"}</Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Text b size={16}>Vaccinated:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text size={16}>{
                                                                cat.attributes.shots_current
                                                                    ? "Yes"
                                                                    : "No"}</Text>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <Text b size={16}>House Trained:</Text>
                                                        </Col>
                                                        <Col>
                                                            <Text size={16}>{
                                                                cat.attributes.house_trained
                                                                    ? "Yes"
                                                                    : "No"}</Text>
                                                        </Col>
                                                    </Row>
                                                </Col>

                                                {/* column 3 - cat's description and name */}
                                                <Col css={{ p: "0rem 1rem" }}>
                                                    <Row css={{ height: "100%" }}>
                                                        <Text size={16}>{
                                                            cat.description}</Text>
                                                    </Row>
                                                </Col>

                                                {/* column 4 - cat's note or comment and buttons to update and delete them */}
                                                <Col css={{ p: "0rem 1rem", borderLeft: "1px solid $neutralBorder" }}>
                                                    <Row>
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
                                                                    initialValue={type === "notes" ? cat.privateNotes : cat.publicComments}
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


                                                    </Row>
                                                </Col>
                                            </Row>




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