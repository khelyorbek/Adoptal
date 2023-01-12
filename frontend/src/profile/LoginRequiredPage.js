import React from 'react';
import { Container, Text } from "@nextui-org/react";

const LoginRequiredPage = () => {
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
            <Text size={35} b color="secondary">403 - Not Allowed</Text>
            <Text size={24} >The resource you are trying to access requires an account. Please use the user icon on the top right to login or register.</Text>
        </Container>
    )
}

export default LoginRequiredPage;

