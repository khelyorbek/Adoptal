import React, { useState, useEffect, useContext } from 'react';
import { Grid, Image, Card, Textarea, Button, Row, Col, Text, Loading } from "@nextui-org/react";
import '../cats/CatCard.css'
import GlobalContext from '../GlobalContext';

// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';

const NotesItem = ({ cat, type }) => {
    const { currentUser } = useContext(GlobalContext);
    const [visible, setVisible] = useState(true);
    const [formData, setFormData] = useState();
    const [loading, setLoading] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
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

    // / creating a custom method to handle the submission of the form
    async function handleSubmit(e) {
        // preventing default behavior
        // e.preventDefault();

        if (type === "notes") {
            setLoading(true);
            const res = await AdoptalApi.addNote(currentUser.username, cat.id, formData.txtInput)
            console.log(res);
            if (res.msg === "Successfully added private note") {
                setLoading(false);
                setSuccess(true)
            } else {
                console.log("Error while saving private note")
            }

        } else {
            setLoading(true);
            const res = await AdoptalApi.addComment(currentUser.username, cat.id, formData.txtInput)
            console.log(res);
            if (res.msg === "Successfully added public note") {
                setLoading(false);
                setSuccess(true)
            } else {
                console.log("Error while saving public comment")
            }
        }
    }

    async function handleDelete(e) {
        // preventing default behavior
        // e.preventDefault();

        if (type === "notes") {
            setLoading(true);
            const res = await AdoptalApi.removeNote(currentUser.username, cat.id)
            console.log(res);
            if (res.msg === "Successfully deleted private note") {
                setLoading(false);
                setVisible(false)
            } else {
                console.log("Error while deleting private note")
            }

        } else {
            setLoading(true);
            const res = await AdoptalApi.removeComment(currentUser.username, cat.id)
            console.log(res);
            if (res.msg === "Successfully deleted public comment") {
                setLoading(false);
                setVisible(false)
            } else {
                console.log("Error while saving public comment")
            }
        }



    }


    return (<>
        {console.log("ListItem >>> cat >>>", cat)}
        {
            visible
                ? <Grid xs={12} key={cat.id} justify="flex-start">
                    <Card isHoverable className="loaded">
                        <Card.Body css={{ p: 0 }}>
                            <Grid.Container gap={0} justify="flex-start">
                                <Grid xs={3}>
                                    <Image
                                        showSkeleton
                                        src={cat.primary_photo_cropped !== null ? cat.primary_photo_cropped.small : "/no_photo_640.jpg"}
                                        objectFit="cover"
                                        width="100%"
                                        height={300}
                                        alt={cat.name}
                                    />
                                </Grid>
                                <Grid xs={9}>
                                    <Row css={{ p: "0rem 2rem" }}>
                                        <Col>
                                            <Row justify='center'>
                                                <Text b color="secondary" size={24}>{cat.name}</Text>
                                            </Row>
                                            <Row>
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
                                                <Col css={{ p: "0rem 1rem" }}>
                                                    <Row css={{ height: "100%" }}>
                                                        <Text size={16}>{
                                                            cat.description}</Text>
                                                    </Row>
                                                </Col>
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
                                                                    ></Textarea>
                                                                </Row>
                                                                <Row justify="space-between" css={{ paddingTop: "1rem" }}>
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