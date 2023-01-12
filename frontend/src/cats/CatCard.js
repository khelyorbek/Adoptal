import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Button, Text, Grid } from "@nextui-org/react";
import './CatCard.css'
import { useNavigate } from "react-router-dom";

// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';



const CatCard = ({ cat }) => {
    const navigate = useNavigate();
    const [id, setId] = useState();

    useEffect(() => {
        if(id) {
            navigate(`/cat/${id}`);
        }
    }, [id, navigate])


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
                    alt="Relaxing app background"
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
                                            {/* {cat.breeds.primary} */}
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