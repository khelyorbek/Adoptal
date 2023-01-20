// Importing all the necessary libraries and components and assets
import React, { useState, useEffect, useContext } from 'react';
import { Grid, Container, Text } from '@nextui-org/react';
import GlobalContext from '../GlobalContext';
import loadingSvg from '../icons/loading.svg'
// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';
import NotesItem from './NotesItem';


const MyComments = () => {
    // receiving the global context for current user
    const { currentUser } = useContext(GlobalContext);
    // using state to keep track of cats
    const [cats, setCats] = useState();

    // getting all the items when the component loads
    useEffect(() => {
        // if the current user changes, runs our custom method below
        // once the method finished running, using the return of the method
        // and storing it into the state
        getCatList(currentUser).then(setCats)

        // for debugging
        // console.log("cats state >>>", cats);
    }, [currentUser])

    // custom function to grab the want to adopt lis from user's profile and then making multiple calls to get the full details of the animal
    async function getCatList(user) {
        try {
            // creating an empty array
            const arr = [];

            // for debugging
            // console.log("FILTERS >>>", filters);

            // for every key of pet's id in the public comments object
            for (let id of Object.keys(user.publicComments)) {

                // for debugging
                // console.log("PUBLIC COMMENTS >>>", user.publicComments)
                // console.log("IDDDDDDDDDD >>>", id)

                // sending a request to back-end to get information of every cat
                let res = await AdoptalApi.getSingleCat(id);

                // If the request doesn't error, 
                if (res !== 'Not found') {
                    // adding the user's comment into the res object
                    res.publicComments = user.publicComments[id]
                    // then adding the res object into the array of public comments
                    arr.push(res)
                }
            }

            // for debugging
            // console.log("cats array >>>", arr)

            // returning the array of public comments
            return arr;
        } catch (err) {
            console.log("Adoptal > Front-end > lists > MyComments.js > getCatList > ", err);
        }

    }

    // if cats have finished loading / processing
    if (cats) {
        // check if the length of the state is 0 (empty)
        if (cats.length === 0) {
            // displaying a message saying the list is empty
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
        // if the length of the state is not 0 (array with data)
        else {
            // returning the Public comments list 
            return <Container>
                <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
                    <Text b color="secondary" size={30}>My Public Comments List</Text>
                </div>

                {/* for debugging */}
                {/* {console.log("cats state >>>", cats)} */}

                <Grid.Container gap={2}>
                    {
                        // if cats are loaded
                        cats
                            // map through the array
                            ? cats.map(cat =>
                                // and render a notes item custom component and pass the cat as a prop
                                <NotesItem cat={cat} key={cat.id}></NotesItem>
                            )
                            // if the cats are still loading, display a loading spinner
                            : <img src={loadingSvg} alt='loading spinner' style={{ margin: "0 auto" }}></img>
                    }
                </Grid.Container>
            </Container>
        }
    }
    // if the cats haven't finished loading yet, show a spinner
    else {
        return <Container style={{
            textAlign: "center"
        }}> <img src={loadingSvg} alt='loading spinner' style={{ margin: "0 auto" }}></img> </Container>
    }
}
export default MyComments;