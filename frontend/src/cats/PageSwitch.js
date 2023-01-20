// importing the pagination component and the css
import { Pagination } from "@nextui-org/react";
import './CatCard.css'

// receiving the props from the parent component
const PageSwitch = ({ currentPage, totalPages, setFilters, setCats, filters }) => {
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
                    boundaries={2}
                    color="secondary"
                    // when a page is clicked, change the state of the parent
                    onChange={
                        (page) => {
                            try {
                                // for debugging
                                // console.log("PAGE>>>", page);

                                // settings the cats to none which will prompt a component re-render
                                setCats(null);
                                // settings the filters to what is there right now but changing the page number
                                setFilters({
                                    ...filters,
                                    page: page
                                });
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