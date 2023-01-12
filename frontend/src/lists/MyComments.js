import React, { useState, useEffect, useContext } from 'react';
import { Grid, Container, Loading, Text } from '@nextui-org/react';
import GlobalContext from '../GlobalContext';
import loadingSvg from '../icons/loading.svg'
// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';
import axios from 'axios';
import NotesItem from './NotesItem';


const MyComments = () => {
    const { currentUser } = useContext(GlobalContext);
    const [cats, setCats] = useState();

    // getting all the items when the component loads
    useEffect(() => {
        getCatList(currentUser).then(setCats)
        // console.log("cats state >>>", cats);
    }, [currentUser])

    // custom function to grab the want to adopt lis from user's profile and then making multiple calls to get the full details of the animal
    async function getCatList(user) {
        const arr = [];
        // console.log("FILTERS >>>", filters);
        for (let id of Object.keys(user.publicComments)) {
            // console.log("PRIVATE NOTES >>>", user.privateNotes)
            // console.log("IDDDDDDDDDD >>>", id)
            let res = await AdoptalApi.getSingleCat(id);
            if (res !== 'Not found') {
                res.publicComments = user.publicComments[id]
                arr.push(res)
            }
        }
        console.log("cats array >>>", arr)
        return arr;
    }

    if (cats) {
        if (cats.length === 0) {
            return (
                <Container style={{
                    textAlign: "center"
                }}>
                    <div>
                        <img
                            alt="empty list"
                            src="/error_empty.png"
                        >
                        </img>
                    </div>
                    <Text size={35} b color="secondary">This list is empty...</Text>
                    <Text size={24} >Please add a public comment to a pet for it to appear here.</Text>
                </Container>)
        }
        else {
            return <Container>
                <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
                <Text b color="secondary" size={30}>My Public Comments List</Text>
                </div>
                {console.log("cats state >>>", cats)}
                <Grid.Container gap={2}>
                    {
                        cats
                            ? cats.map(cat =>
                                <NotesItem cat={cat}></NotesItem>
                            )
                            : <img src={loadingSvg} alt='loading spinner' style={{ margin: "0 auto" }}></img>
                    }
                </Grid.Container>
            </Container>
        }
    }
    else {
        return <Container style={{
            textAlign: "center"
        }}> <img src={loadingSvg} alt='loading spinner' style={{ margin: "0 auto" }}></img> </Container>
    }
}
export default MyComments;