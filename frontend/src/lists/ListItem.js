import React, { useState, useEffect, useContext } from 'react';
import { Grid, Container } from '@nextui-org/react';
import { Card, Col, Row, Button, Text } from "@nextui-org/react";
import '../cats/CatCard.css'
import GlobalContext from '../GlobalContext';

// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';

const ListItem = ({ cat }) => {
    const { currentUser, setCurrentUser } = useContext(GlobalContext);
    const [visible, setVisible] = useState(true);

    async function removeFromList() {
        const res = await AdoptalApi.toggleAdoptItem(currentUser.username, cat.id)

        console.log("RESSSSS >>>", res);

        if (res.msg === "Successfully removed animal from Want to Adopt list") {
            setVisible(false);

            const usr = currentUser;
            usr.wantToAdopt = usr.wantToAdopt.filter(c => c !== cat.id)
            console.log("usr >>>>>>>>>>>", usr);
            setCurrentUser(usr)
        }
    }

    return (<>
        {console.log("ListItem >>> cat >>>", cat)}
        {
            visible
                ? <Grid xs={12} sm={6} md={4} lg={3} xl={2} key={cat.id} justify="center">
                    <Card isPressable isHoverable className="loaded">
                        <Card.Body css={{ p: 0 }}>
                            <Card.Image
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
                                    <Button auto flat color="error" onClick={removeFromList}>Remove</Button>
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