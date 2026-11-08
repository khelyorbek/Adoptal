// Importing all the necessary libraries and components and assets
import React, { useState, useEffect, useContext } from 'react';
import { Grid, Container, Text } from '@nextui-org/react';
import loadingSvg from '../icons/loading.svg'
// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';
import CatCard from "./CatCard";
import FilterSidebar from "./FilterSidebar";
import PageSwitch from './PageSwitch';

// importing a global context (current user enabler)
import GlobalContext from '../GlobalContext';

// main function
const CatList = () => {
    // using state to keep track of all the cats
    const [cats, setCats] = useState();
    // using to keep track of the load state
    const [loading, setLoading] = useState(false);
    // receiving the global context for current user
    const { globalFilters, setGlobalFilters } = useContext(GlobalContext);

    // grabbing a list of cats
    useEffect(() => {
        // custom function for getting all the cats
        // accepts the filters attribute
        async function getCats(filters) {
            try {
                setLoading(true);

                // for debugging only
                // console.log("Front-end > CatList > getCats > filters > ", filters);

                // uses our custom API method to get the cats and passes the filters to the method
                let res = await AdoptalApi.getAllCats(filters);

                // filtering out animals without photos. sorry kitties :(
                // const pets = res.animals.filter(pet => pet.photos.length > 0)

                // on another note, decided to keep showing kitties without photos
                const pets = res.data.data;

                // sets the pets state to the cats received from API
                setCats(pets);

                // sets the current page and total pages from the API response
                setGlobalFilters(prev => {
                    if (
                        prev?.currentPage === res.data.meta.pageReturned &&
                        prev?.totalPages === res.data.meta.pages
                    ) {
                        return prev;
                    }
                    return {
                        ...prev,
                        currentPage: res.data.meta.pageReturned,
                        totalPages: res.data.meta.pages
                    };
                });

                setLoading(false);

                // for debugging
                // console.log("Front-end > CatList > getCats > pets", pets)
                // console.log("Front-end > CatList > getCats > cats state", cats)
            } catch (err) {
                console.log("Front-end > CatList > getCats > ", err);
            }

        }
        // debug
        console.log("Frontend > CatList > filters > ", globalFilters);

        // calling the custom function anytime a filter state is changed. helps when user changes the filter on the left and resubmits
        getCats(globalFilters);

    }, [
        globalFilters?.currentPage,
        globalFilters?.zip,
        globalFilters?.distance,
        globalFilters?.age,
        globalFilters?.gender,
        globalFilters?.size,
        globalFilters?.coat,
        globalFilters?.good_with_children,
        globalFilters?.good_with_dogs,
        globalFilters?.good_with_cats,
        globalFilters?.house_trained,
        globalFilters?.declawed,
        globalFilters?.special_needs,
        globalFilters?.current_vaccinations,
        setGlobalFilters
    ])




    return (<>
        <Container>
            <Grid.Container gap={1}>
                {/* Sidebar - Filters */}
                <Grid xs={2} css={{ paddingTop: "16px" }}>
                    {/* Displaying a custom component and passing state setters as props */}
                    <FilterSidebar globalFilters={globalFilters} setGlobalFilters={setGlobalFilters} setCats={setCats} ></FilterSidebar>
                </Grid>

                {/* Main content areas - List of pets */}
                <Grid xs={10}>

                    <Grid.Container gap={1} >
                        {/* if cats are loading display a spinner */}
                        {
                            loading
                                ?
                                <img src={loadingSvg} alt='loading spinner' style={{ margin: "0 auto" }}>

                                </img>
                                :
                                cats
                                    ?
                                    cats.map(cat =>
                                        <Grid xs={12} sm={6} md={4} lg={3} xl={2} key={cat.id} justify="center">
                                            <CatCard cat={cat}></CatCard>
                                        </Grid>)
                                    :
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
                                        <Text size={35} b color="secondary">Your filter criteria did not return any results</Text>
                                        <Text size={24} >Please adjust the filter and click on Apply Filter to retry</Text>
                                    </Container>
                        }

                    </Grid.Container>


                </Grid>
                <Grid xs={12} justify="center" >
                    {/* for displaying the pagination, passing the filters and the page number we receive from the API */}
                    <PageSwitch globalFilters={globalFilters} setGlobalFilters={setGlobalFilters} setCats={setCats} ></PageSwitch>
                </Grid>
            </Grid.Container>
        </Container>



    </>)
}

export default CatList;