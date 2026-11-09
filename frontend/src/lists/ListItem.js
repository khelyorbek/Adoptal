// Importing all the necessary libraries and components and assets
import React, { useState, useContext, useEffect } from 'react';
import { Grid } from '@nextui-org/react';
import { Card, Col, Row, Button, Text } from "@nextui-org/react";
import '../pets/PetCard.css'
import GlobalContext from '../GlobalContext';
import { useNavigate } from "react-router-dom";

// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';

// receiving the props from the parent component
const ListItem = ({ pet }) => {
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

    // Debug
    // console.log("Front-end > ListItem > pet > ", pet);

    let petPhoto = pet.data[0].attributes?.pictureThumbnailUrl
        ? pet.data[0].attributes?.pictureThumbnailUrl.replace(/width=\d+/, 'width=400')
        : "/no_photo.png";

    // receiving the global context for current user
    const { currentUser, setCurrentUser } = useContext(GlobalContext);
    // using state to keep track of component visibility
    const [visible, setVisible] = useState(true);

    // custom function for removing a pet from the adopt list
    async function removeFromList() {
        try {
            // sending a request to back-end and sending current username and the id of the pet
            const res = await AdoptalApi.toggleAdoptItem(currentUser.username, parseInt(pet.data[0].id))

            // for debugging
            // console.log("RESSSSS >>>", res);

            // if the removal is successful
            if (res.msg === "Successfully removed animal from Want to Adopt list") {
                // setting the component to hidden
                setVisible(false);

                // creating a copy of current user
                const usr = currentUser;
                // modifying the array of want to adopt and removing the pet id from it
                usr.wantToAdopt = usr.wantToAdopt.filter(c => c !== parseInt(pet.data[0].id))

                // for debugging
                // console.log("usr >>>>>>>>>>>", usr);

                // setting the user to our new user object with removed id from the want to adopt list array
                setCurrentUser(usr)
            }
        } catch (err) {
            console.log("Adoptal > Front-end > lists > ListItem.js > removeFromList > ", err);
        }

    }

    return (<>
        {/* {console.log("ListItem >>> pet >>>", pet)} */}
        {
            // if the component is visible
            visible
                ? <Grid xs={12} sm={6} md={4} lg={3} xl={2} key={parseInt(pet.data[0].id)} justify="center">
                    {/* display a card with the information of the pet */}
                    <Card isHoverable className="loaded">
                        <Card.Body css={{ p: 0, cursor: "pointer" }} onClick={() => setId(pet?.data[0]?.id)}>
                            <Card.Image
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
                        </Card.Body>
                        <Card.Footer>
                            <Row justify="space-between" align="center">
                                <Col span={8}>
                                    <Text b>{pet?.data[0].attributes.name}</Text>
                                </Col>
                                <Col span={4}>
                                    {/* displaying a button that allow us to remove the pet from the list */}
                                    <Button auto flat color="error" onPress={removeFromList}>Remove</Button>
                                </Col>
                            </Row>

                        </Card.Footer>
                        {/* <Row style={{
                            textAlign: "center"
                        }}>
                            <Col span={12}>
                                <Text >{pet.data[0].attributes.breedPrimary}</Text>
                            </Col>
                        </Row> */}
                    </Card>
                </Grid>
                : ''
        }
    </>)
}

export default ListItem;