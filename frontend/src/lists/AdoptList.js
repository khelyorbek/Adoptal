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
    // using state to keep track of pets
    const [pets, setPets] = useState();

    // getting all the items when the component loads
    useEffect(() => {
        // if the current user changes, runs our custom method below
        // once the method finished running, using the return of the method
        // and storing it into the state
        getAdoptList(currentUser).then(setPets)

        // for debugging
        // console.log("pets state >>>", pets);
    }, [currentUser])

    // custom function to grab the want to adopt lis from user's profile and then making multiple calls to get the full details of the animal
    async function getAdoptList(user) {
        try {
            // creating an empty array
            const arr = [];

            // for debugging
            // console.log("FILTERS >>>", filters);

            // Debug
            // console.log("Front-end > AdoptList > getAdoptList > user.wantToAdopt > ", user.wantToAdopt);

            // for every id in the wantToAdopt array
            for (let id of user.wantToAdopt) {

                // sending a request to back-end to get information of every pet
                let res = await AdoptalApi.getSinglePet(id);

                // for debugging
                // console.log("Front-end > AdoptList > getAdoptList > res > ", res);

                // If the request doesn't error, adding the pet to the array of pets
                if (res !== "Not found") { arr.push(res) }
            }
            // for debugging
            console.log("Front-end > AdoptList > getAdoptList > pets array >", arr);

            // returning the array of pets after looping is finished
            return arr;
        } catch (err) {
            console.log("Adoptal > Front-end > lists > AdoptList.js > getAdoptList > ", err);
        }

    }

    // if pets have finished loading / processing
    if (pets) {
        // check if the length of the state is 0 (empty)
        if (pets.length === 0) {
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
                {/* {console.log("pets state >>>", pets)} */}

                <Grid.Container gap={2}>
                    {
                        // if pets are loaded
                        pets
                            // map through the array
                            ? pets.map(pet =>
                                // and render a list item custom component and pass the pet as a prop
                                <ListItem pet={pet} key={pet.data[0].id}></ListItem>
                            )
                            // if the pets are still loading, display a loading spinner
                            : <img src={loadingSvg} alt='loading spinner' style={{ margin: "0 auto" }}></img>
                    }
                </Grid.Container>
            </Container>
        }
    }
    // if the pets haven't finished loading yet, show a spinner
    else {
        return <Container style={{
            textAlign: "center"
        }}> <img src={loadingSvg} alt='loading spinner' style={{ margin: "0 auto" }}></img> </Container>
    }
}

export default AdoptList;