// importing the necessary files
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Text } from "@nextui-org/react";
import './PetCard.css'
import { useNavigate } from "react-router-dom";

// creating a function which accepts a cat as a prop
const PetCard = ({ pet }) => {
    //debug purposes
    // console.log("Frontend > CatCard > cat > ", cat);

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

    let petPhoto = pet?.attributes?.pictureThumbnailUrl
        ? pet.attributes.pictureThumbnailUrl.replace(/width=\d+/, 'width=400')
        : "/no_photo.png";

    // returns a card with pet's photo and information
    // sets the id on press which triggers the redirect using useEffect
    return (<>
        <Card
            onPress={() => setId(pet.id)}
            css={{ w: "300px", h: "300px", }}
            isPressable
            isHoverable
            className="loaded">
            <Card.Body css={{ p: 0 }}>
                <Card.Image
                    src={petPhoto}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                    alt="cat card"
                />
            </Card.Body>
            <Card.Footer
                isBlurred
                align="center"
                css={{
                    position: "absolute",
                    bgBlur: "#00000050",
                    borderTop: "$borderWeights$light solid $gray800",
                    bottom: 0,
                    p: '0.3rem',
                    zIndex: 1,
                }}
            >
                <Row fluid>
                    <Col>
                        <Row>
                            <Col>
                                <Text
                                    color="white"
                                    size={20}
                                    b>
                                    {pet.attributes.name}
                                </Text>

                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Row>
                                    <Col>
                                        <Text
                                            b
                                            color="#e5e5e5"
                                            size={13}>
                                            {pet.attributes.ageGroup} {pet.attributes.sex}
                                        </Text>

                                        <Text
                                            b
                                            color="#e5e5e5"
                                            size={13}>{'   '}
                                        </Text>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card.Footer>
        </Card>
    </>)
}

export default PetCard;