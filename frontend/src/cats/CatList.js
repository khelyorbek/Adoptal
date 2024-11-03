// Importing all the necessary libraries and components and assets
import React, { useState, useEffect } from 'react';
import { Grid, Container, Text } from '@nextui-org/react';
import loadingSvg from '../icons/loading.svg'
// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';
import CatCard from "./CatCard";
import FilterSidebar from "./FilterSidebar";
import PageSwitch from './PageSwitch';

// main function
const CatList = () => {
    // using state to keep track of all the cats
    const [cats, setCats] = useState();
    const [currentPage, setCurrentPage] = useState();
    const [totalPages, setTotalPages] = useState();
    const [filters, setFilters] = useState({});

    // grabbing a list of cats
    useEffect(() => {
        // calling the custom function anytime a filter state is changed. helps when user changes the filter on the left and resubmits
        getCats(filters);
    }, [filters])

    // custom function for getting all the cats
    // accepts the filters attribute
    async function getCats(filters) {
        try {
            // for debugging only
            // console.log("FILTERS >>>", filters);

            // uses our custom API method to get the cats and passes the filters to the method
            let res = await AdoptalApi.getAllCats(filters);

            // filtering out animals without photos. sorry kitties :(
            // const pets = res.animals.filter(pet => pet.photos.length > 0)

            // on another note, decided to keep showing kitties without photos
            const pets = res.animals;

            // sets the pets state to the cats received from API
            setCats(pets);
            // sets the current page number to the one received from api
            setCurrentPage(res.pagination.current_page)
            // sets the max num of pages to the one received from api
            setTotalPages(res.pagination.total_pages);

            // for debugging
            // console.log(res)
        } catch (err) {
            console.log("Adoptal > Front-end > cats > CatList.js > getCats > ", err);
        }

    }


    return (<>
        <Container>
            <Grid.Container gap={1}>
                <Grid xs={2} css={{ paddingTop: "16px" }}>
                    {/* Displaying a custom component and passing state setters as props */}
                    <FilterSidebar setFilters={setFilters} setCats={setCats} setCurrentPage={setCurrentPage}></FilterSidebar>
                </Grid>
                <Grid xs={10}>

                    <Grid.Container gap={2} >
                        {/* if cats have finished loading */}
                        {
                            cats
                                // If the results returned return no results, then show a message saying that no results have been received
                                ? cats.length === 0
                                    ? <Container style={{
                                        textAlign: "center"
                                    }}>
                                        <div>
                                            <img
                                                alt="empty list"
                                                src="/error_empty.png"
                                            >
                                            </img>
                                        </div>
                                        <Text size={35} b color="secondary">Your filter criteria did not return any results...</Text>
                                        <Text size={24} >Please adjust the filter on the left and click on Apply Filter to retry.</Text>
                                    </Container>
                                    // If the reults return actual data, map through it and display our custom component and pass the cat into the component as a prop
                                    : cats.map(cat =>
                                        <Grid xs={12} sm={6} md={4} lg={3} xl={2} key={cat.id} justify="center">
                                            <CatCard cat={cat}></CatCard>
                                        </Grid>)
                                // if cats are still loading, display a loading spinner
                                : <img src={loadingSvg} alt='loading spinner' style={{ margin: "0 auto" }}></img>
                        }
                    </Grid.Container>


                </Grid>
                <Grid xs={12} justify="center" >
                    {/* for displaying the pagination, passing the filters and the page number we receive from the API */}
                    <PageSwitch totalPages={totalPages} currentPage={currentPage} filters={filters} setFilters={setFilters} setCats={setCats} ></PageSwitch>
                </Grid>
            </Grid.Container>
        </Container>



    </>)
}

export default CatList;