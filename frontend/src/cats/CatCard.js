// importing the necessary files
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Text } from "@nextui-org/react";
import './CatCard.css'
import { useNavigate } from "react-router-dom";

// creating a function which accepts a cat as a prop
const CatCard = ({ cat }) => {
    // using navigate for dynamic navigation
    const navigate = useNavigate();
    // using state to store variables
    const [id, setId] = useState();

    // when an id is changed, this effect runs
    useEffect(() => {
        if(id) {
            // soft redirects to the Cat Details page
            navigate(`/cat/${id}`);
        }
    }, [id, navigate])


    // returns a card with Cat's photo and information
    // sets the id on press which triggers the redirect using useEffect
    return (<>
        <Card 
        onPress={() => setId(cat.id)}
        css={{ w: "300px", h: "300px", }}
        isPressable 
        isHoverable 
        className="loaded">
            <Card.Body css={{ p: 0 }}>
                <Card.Image
                    src={cat.primary_photo_cropped !== null ? cat.primary_photo_cropped.small : "/no_photo_640.jpg"}
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
                                    {cat.name}
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
                                            {cat.age} {cat.gender}
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

export default CatCard;