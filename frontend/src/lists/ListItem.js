// Importing all the necessary libraries and components and assets
import React, { useState, useContext } from 'react';
import { Grid } from '@nextui-org/react';
import { Card, Col, Row, Button, Text } from "@nextui-org/react";
import '../cats/CatCard.css'
import GlobalContext from '../GlobalContext';

// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';

// receiving the props from the parent component
const ListItem = ({ cat }) => {
    // receiving the global context for current user
    const { currentUser, setCurrentUser } = useContext(GlobalContext);
    // using state to keep track of component visibility
    const [visible, setVisible] = useState(true);

    // custom function for removing a pet from the adopt list
    async function removeFromList() {
        try {
            // sending a request to back-end and sending current username and the id of the cat
            const res = await AdoptalApi.toggleAdoptItem(currentUser.username, cat.id)

            // for debugging
            // console.log("RESSSSS >>>", res);

            // if the removal is successful
            if (res.msg === "Successfully removed animal from Want to Adopt list") {
                // setting the component to hidden
                setVisible(false);

                // creating a copy of current user
                const usr = currentUser;
                // modifying the array of want to adopt and removing the cat id from it
                usr.wantToAdopt = usr.wantToAdopt.filter(c => c !== cat.id)

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
        {/* {console.log("ListItem >>> cat >>>", cat)} */}
        {
            // if the component is visible
            visible
                ? <Grid xs={12} sm={6} md={4} lg={3} xl={2} key={cat.id} justify="center">
                    {/* display a card with the information of the pet */}
                    <Card isPressable isHoverable className="loaded">
                        <Card.Body css={{ p: 0 }}>
                            <Card.Image
                            // if there is no photo available, use a placeholder photo
                                src={cat.primary_photo_cropped !== null ? cat.primary_photo_cropped.small : "/no_photo_640.jpg"}
                                objectFit="cover"
                                width="100%"
                                height={300}
                                alt={cat.name}
                            />
                        </Card.Body>
                        <Card.Footer>
                            <Row justify="space-between" align="center">
                                <Col span={8}>
                                    <Text b>{cat.name}</Text>
                                </Col>
                                <Col span={4}>
                                    {/* displaying a button that allow us to remove the cat from the list */}
                                    <Button auto flat color="error" onPress={removeFromList}>Remove</Button>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Grid>
                : ''
        }
    </>)
}

export default ListItem;