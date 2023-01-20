// Importing all the necessary libraries and components and assets
import React, { useState, useEffect, useContext } from 'react';
import { Grid, Container, Text } from '@nextui-org/react';
import GlobalContext from '../GlobalContext';
import loadingSvg from '../icons/loading.svg'
// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';
import ListItem from './ListItem';

const AdoptList = () => {
    // receiving the global context for current user
    const { currentUser } = useContext(GlobalContext);
    // using state to keep track of cats
    const [cats, setCats] = useState();

    // getting all the items when the component loads
    useEffect(() => {
        // if the current user changes, runs our custom method below
        // once the method finished running, using the return of the method
        // and storing it into the state
        getAdoptList(currentUser).then(setCats)

        // for debugging
        // console.log("cats state >>>", cats);
    }, [currentUser])

    // custom function to grab the want to adopt lis from user's profile and then making multiple calls to get the full details of the animal
    async function getAdoptList(user) {
        try {
            // creating an empty array
            const arr = [];

            // for debugging
            // console.log("FILTERS >>>", filters);

            // for every id in the wantToAdopt array
            for (let id of user.wantToAdopt) {
                // sending a request to back-end to get information of every cat
                let res = await AdoptalApi.getSingleCat(id);

                // for debugging
                // console.log("RESSSSSS>>>", res)

                // If the request doesn't error, adding the cat to the array of cats
                if (res !== "Not found") { arr.push(res) }
            }
            // for debugging
            // console.log("cats array >>>", arr)

            // returning the array of cats after looping is finished
            return arr;
        } catch (err) {
            console.log("Adoptal > Front-end > lists > AdoptList.js > getAdoptList > ", err);
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
                    <Text size={24} >Please add a pet to your adopt list for it to appear here.</Text>
                </Container>)
        }
        // if the length of the state is not 0 (array with data)
        else {
            // returning the Want to Adopt list 
            return <Container>
                <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
                    <Text b color="secondary" size={30}>Want to Adopt List</Text>
                </div>

                {/* for debugging */}
                {/* {console.log("cats state >>>", cats)} */}

                <Grid.Container gap={2}>
                    {
                        // if cats are loaded
                        cats
                            // map through the array
                            ? cats.map(cat =>
                                // and render a list item custom component and pass the cat as a prop
                                <ListItem cat={cat} key={cat.id}></ListItem>
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

export default AdoptList;