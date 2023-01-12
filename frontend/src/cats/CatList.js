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
        getCats(filters);
    }, [filters])

    async function getCats(filters) {
        // console.log("FILTERS >>>", filters);
        let res = await AdoptalApi.getAllCats(filters);

        // filtering out animals without photos. sorry kitties :(
        const pets = res.animals.filter(pet => pet.photos.length > 0)

        setCats(pets);
        setCurrentPage(res.pagination.current_page)
        setTotalPages(res.pagination.total_pages);
        // console.log(res)
    }


    return (<>
        <Container>
            <Grid.Container gap={1}>
                <Grid xs={2} css={{ paddingTop: "16px" }}>
                    <FilterSidebar setFilters={setFilters} setCats={setCats} setCurrentPage={setCurrentPage}></FilterSidebar>
                </Grid>
                <Grid xs={10}>

                    <Grid.Container gap={2} >
                        {
                            cats
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
                                : cats.map(cat =>
                                    <Grid xs={12} sm={6} md={4} lg={3} xl={2} key={cat.id} justify="center">
                                        <CatCard cat={cat}></CatCard>
                                    </Grid>)
                                : <img src={loadingSvg} alt='loading spinner' style={{ margin: "0 auto" }}></img>
                        }
                    </Grid.Container>


                </Grid>
                <Grid xs={12} justify="center" >
                    <PageSwitch totalPages={totalPages} currentPage={currentPage} filters={filters} setFilters={setFilters} setCats={setCats} ></PageSwitch>
                </Grid>
            </Grid.Container>
        </Container>



    </>)
}

export default CatList;