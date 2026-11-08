// importing the pagination component and the css
import React, { useContext } from 'react';
// importing a global context (current user enabler)
import GlobalContext from '../GlobalContext';
import { Pagination } from "@nextui-org/react";
import './CatCard.css'

// receiving the props from the parent component
const PageSwitch = ({ setCats, globalFilters: propFilters, setGlobalFilters: propSetFilters }) => {
    const context = useContext(GlobalContext);
    const globalFilters = propFilters || context?.globalFilters || {};
    const setGlobalFilters = propSetFilters || context?.setGlobalFilters;

    const totalPages = globalFilters?.totalPages || 1;
    const currentPage = globalFilters?.currentPage || 1;

    return (
        <>
            <div style={{
                border: "1px solid var(--nextui-colors-border)",
                borderRadius: "50px",
                boxShadow: "0px 0px 12px -7px var(--nextui-colors-text)"
            }}>
                {/* rendering a pagination component and settings the current page and total page from the props received */}
                <Pagination
                    total={totalPages}
                    page={currentPage}
                    size="lg"
                    rounded
                    shadow
                    boundaries={1}
                    color="secondary"
                    // when a page is clicked, change the state of the parent
                    onChange={
                        (page) => {
                            try {
                                // settings the cats to none which will prompt a component re-render
                                setCats(null);
                                // settings the filters to what is there right now but changing the page number
                                setGlobalFilters(prev => ({ ...prev, currentPage: page }));
                            } catch (err) {
                                console.log("Adoptal > Front-end > cats > PageSwitch.js > onChange > ", err);
                            }
                        }
                    }
                    css={{
                        margin: "0.7rem"
                    }}
                />
            </div>
        </>

    )
}

export default PageSwitch;