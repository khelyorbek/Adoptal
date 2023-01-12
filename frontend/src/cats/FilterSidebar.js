import React, { useState, useEffect } from 'react';
import { Input, Col, Row, Button, Dropdown, Text, Checkbox } from '@nextui-org/react';

// Custom components and functions
import AdoptalApi from '../api/adoptalBackend';


const FilterSidebar = ({ setFilters, setCats }) => {
    const [formData, setFormData] = useState();

    // State and handler for Age
    const [ageList, setAgeList] = useState(new Set(["Select All"]));
    const ageListValue = React.useMemo(
        () => Array.from(ageList).join(", ").replaceAll("_", " "),
        [ageList]
    );

    // State and handler for Size
    const [sizeList, setSizeList] = useState(new Set(["Select All"]));
    const sizeListValue = React.useMemo(
        () => Array.from(sizeList).join(", ").replaceAll("_", " "),
        [sizeList]
    );

    // State and handler for Coat
    const [coatList, setCoatList] = useState(new Set(["Select All"]));
    const coatListValue = React.useMemo(
        () => Array.from(coatList).join(", ").replaceAll("_", " "),
        [coatList]
    );

    // State for checkboxes
    const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);

    // creating a universal changle handler function that stored values into state
    const handleChange = e => {
        // taking the target of the event and destructuing the name attribute and the value of the input
        const { name, value } = e.target;

        // if the form input is the username, sending it in all lowercase to make sure username is case in-sensitive
        let valueFormatted = name === 'username' ? value.toLowerCase() : value;

        // setting the new value of the state
        setFormData(data => ({
            // to be the current value of the state
            ...data,
            // and whenever the new value is (Example: nameOfInput: valueOfInput)
            [name]: valueFormatted
        }))
    }

    // / creating a custom method to handle the submission of the form
    async function handleSubmit(e, type) {
        // preventing default behavior
        e.preventDefault();
        const payload = {
            ...formData,
            age: ageListValue.toLowerCase() === "select all" ? null : ageListValue,
            size: sizeListValue.toLowerCase() === "select all" ? null : sizeListValue,
            coat: coatListValue.toLowerCase() === "select all" ? null : coatListValue,
        };
        selectedCheckboxes.map(i => payload[i]=true)

        console.log("FilterSidebar >>> PAYLOAD SENT to Method >>>", payload);

        setCats(null);

        await setFilters(payload);
    }

    return (
        <Row >
            <form onSubmit={handleSubmit}>
                <Col>
                    <Text color="secondary" css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Zip code</Text>
                    <Input
                        color="secondary"
                        type="number"
                        fullWidth
                        placeholder='15219'
                        css={{ marginBottom: "1rem" }}
                        name="zip"
                        onChange={handleChange}
                    ></Input>

                    <Text color="secondary" css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Distance</Text>
                    <Input
                        color="secondary"
                        type="number"
                        max="500"
                        fullWidth
                        placeholder='20'
                        labelRight="Miles"
                        css={{ marginBottom: "1rem" }}
                        name="distance"
                        onChange={handleChange}
                    ></Input>

                    <Text color="secondary" css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Age</Text>
                    <Dropdown>
                        <Dropdown.Button
                            flat
                            color="inherit"
                            css={{ width: "100%", tt: "capitalize", marginBottom: "1rem" }}>
                            {ageListValue}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            color="secondary"
                            disallowEmptySelection
                            selectionMode="single"
                            ageListKeys={ageList}
                            onSelectionChange={setAgeList}
                        >
                            <Dropdown.Item key="select_all">Select All</Dropdown.Item>
                            <Dropdown.Item key="baby">Baby</Dropdown.Item>
                            <Dropdown.Item key="young">Young</Dropdown.Item>
                            <Dropdown.Item key="adult">Adult</Dropdown.Item>
                            <Dropdown.Item key="senior">Senior</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Text size={16} color="secondary" css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Size</Text>
                    <Dropdown>
                        <Dropdown.Button
                            flat
                            color="inherit"
                            css={{ width: "100%", tt: "capitalize", marginBottom: "1rem" }}>
                            {sizeListValue}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            color="secondary"
                            disallowEmptySelection
                            selectionMode="single"
                            sizeListKeys={sizeList}
                            onSelectionChange={setSizeList}
                        >
                            <Dropdown.Item key="select_all">Select All</Dropdown.Item>
                            <Dropdown.Item key="small">Small</Dropdown.Item>
                            <Dropdown.Item key="medium">Medium</Dropdown.Item>
                            <Dropdown.Item key="large">Large</Dropdown.Item>
                            <Dropdown.Item key="xlarge">Extra Large</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Text size={16} color="secondary" css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Coat</Text>
                    <Dropdown>
                        <Dropdown.Button
                            flat
                            color="inherit"
                            css={{ width: "100%", tt: "capitalize", marginBottom: "1rem" }}>
                            {coatListValue}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            color="secondary"
                            disallowEmptySelection
                            selectionMode="single"
                            coatListKeys={coatList}
                            onSelectionChange={setCoatList}
                        >
                            <Dropdown.Item key="select_all">Select All</Dropdown.Item>
                            <Dropdown.Item key="hairless">Hairless</Dropdown.Item>
                            <Dropdown.Item key="short">Short</Dropdown.Item>
                            <Dropdown.Item key="medium">Medium</Dropdown.Item>
                            <Dropdown.Item key="long">Long</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Text color="secondary" css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Preferences</Text>
                    <Checkbox.Group
                        size="xs"
                        value={selectedCheckboxes}
                        onChange={setSelectedCheckboxes}
                        color="secondary"
                    >
                        <Checkbox value="good_with_children">Good with children</Checkbox>
                        <Checkbox value="good_with_dogs">Good with dogs</Checkbox>
                        <Checkbox value="good_with_cats">Good with cats</Checkbox>
                        <Checkbox value="house_trained">House trained</Checkbox>
                        <Checkbox value="declawed">De-clawed</Checkbox>
                        <Checkbox value="special_needs">Special needs</Checkbox>
                    </Checkbox.Group>


                    {/* <Text size={16} color="secondary" css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Breed</Text>
                <Dropdown>
                    <Dropdown.Button
                        flat
                        color="inherit"
                        css={{ width: "100%", tt: "capitalize", marginBottom: "1rem" }}>
                        {breedListValue}
                    </Dropdown.Button>
                    <Dropdown.Menu
                        aria-label="Single selection actions"
                        color="secondary"
                        disallowEmptySelection
                        selectionMode="single"
                        breedListKeys={breedList}
                        onSelectionChange={setBreedList}
                    >
                        <Dropdown.Item key="select_all">All</Dropdown.Item>
                        <Dropdown.Item key="number">Number</Dropdown.Item>
                        <Dropdown.Item key="date">Date</Dropdown.Item>
                        <Dropdown.Item key="single_date">Single Date</Dropdown.Item>
                        <Dropdown.Item key="iteration">Iteration</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown> */}



                    <Button
                        style={{ margin: "1rem auto" }}
                        size="lg"
                        shadow
                        type='submit'
                        color="secondary"
                        auto>
                        Apply Filter
                    </Button>

                </Col>
            </form>
        </Row>
    )
}

export default FilterSidebar;