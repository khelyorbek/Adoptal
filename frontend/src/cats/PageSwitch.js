import { Pagination } from "@nextui-org/react";
import './CatCard.css'

const PageSwitch = ({ currentPage, totalPages, setFilters, setCats, filters }) => {
    return (
        <>
            <div style={{
                border: "1px solid var(--nextui-colors-border)",
                borderRadius: "50px",
                boxShadow: "0px 0px 12px -7px var(--nextui-colors-text)"
            }}>
                <Pagination
                    total={totalPages}
                    page={currentPage}
                    size="lg"
                    rounded
                    shadow
                    boundaries={2}
                    color="secondary"
                    onChange={
                        (page) => {
                            console.log("PAGE>>>", page);
                            setCats(null);
                            setFilters({
                                ...filters,
                                page: page
                            });
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