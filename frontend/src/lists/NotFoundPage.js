// Importing all the necessary libraries and components and assets
import React from 'react';
import { Container, Text } from "@nextui-org/react";

// displaying a text with image saying that the page was not found. This is used as a 404 page
const NotFoundPage = () => {
    return (
        <Container aria-label="error note found image" style={{
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
    )
}

export default NotFoundPage;

