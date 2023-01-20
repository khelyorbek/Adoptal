// Importing all the necessary libraries and components and assets
import React, { useState } from 'react';
import { Input, Col, Row, Button, Dropdown, Text, Checkbox } from '@nextui-org/react';

// receiving the props from the parent component
const FilterSidebar = ({ setFilters, setCats }) => {
    // using state to keep track of form data (filters)
    const [formData, setFormData] = useState();

    // State and handler for Age
    const [ageList, setAgeList] = useState(new Set(["Select All"]));

    // for storing the list of values for Age. Only updates / renders once on load
    const ageListValue = React.useMemo(
        () => Array.from(ageList).join(", ").replaceAll("_", " "),
        [ageList]
    );

    // for storing the list of values for State. Only updates / renders once on load
    const [sizeList, setSizeList] = useState(new Set(["Select All"]));
    const sizeListValue = React.useMemo(
        () => Array.from(sizeList).join(", ").replaceAll("_", " "),
        [sizeList]
    );

    // for storing the list of values for Coat. Only updates / renders once on load
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
        try {
            // preventing default behavior
            e.preventDefault();

            // setting payload variable to what we have in the form already
            const payload = {
                ...formData,
                // but also adding the filters from the dropdown that we selected
                // if select all is selected, passign null as the filter, which will display everything
                age: ageListValue.toLowerCase() === "select all" ? null : ageListValue,
                size: sizeListValue.toLowerCase() === "select all" ? null : sizeListValue,
                coat: coatListValue.toLowerCase() === "select all" ? null : coatListValue,
            };

            // going through all the checkboxes that we are TICKED and adding it to the payload with value of true
            selectedCheckboxes.map(i => payload[i] = true)

            // for debugging
            // console.log("FilterSidebar >>> PAYLOAD SENT to Method >>>", payload);

            // settings the cat to nothing which will prompt the component to re-render
            setCats(null);

            // settings the filters and passing the payload
            await setFilters(payload);
        } catch (err) {
            console.log("Adoptal > Front-end > cats > FilterSidebar.js > handleSubmit > ", err);
        }
        
    }

    return (
        <Row >
            {/* if submitted using enter, call the custom method */}
            <form onSubmit={handleSubmit}>
                <Col>
                    {/* Input and label for Zip Code */}
                    <Text color="secondary" aria-label='zip code' css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Zip code</Text>
                    <Input
                        color="secondary"
                        type="number"
                        fullWidth
                        placeholder='15219'
                        css={{ marginBottom: "1rem" }}
                        name="zip"
                        aria-label='zip code'
                        // When the value is changed, calling our custom handler method that updates the state
                        onChange={handleChange}
                    ></Input>

                    {/* Input and label for Distance */}
                    <Text color="secondary" aria-label='distance' css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Distance</Text>
                    <Input
                        color="secondary"
                        type="number"
                        max="500"
                        fullWidth
                        placeholder='20'
                        labelRight="Miles"
                        css={{ marginBottom: "1rem" }}
                        name="distance"
                        aria-label='distance'
                        // When the value is changed, calling our custom handler method that updates the state
                        onChange={handleChange}
                    ></Input>

                    {/* Dropdowns for Age */}
                    <Text color="secondary" aria-label='age' css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Age</Text>
                    <Dropdown>
                        <Dropdown.Button
                            flat
                            color="inherit"
                            css={{ width: "100%", tt: "capitalize", marginBottom: "1rem" }}>
                            {/* sets the button text to the current value that is stored in the state */}
                            {ageListValue}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            color="secondary"
                            disallowEmptySelection
                            selectionMode="single"
                            // setting the key values to the memo that we initially created
                            ageListKeys={ageList}
                            // when something is selected, updating the state
                            onSelectionChange={setAgeList}
                        >
                            {/* dropdown options */}
                            <Dropdown.Item key="select_all">Select All</Dropdown.Item>
                            <Dropdown.Item key="baby">Baby</Dropdown.Item>
                            <Dropdown.Item key="young">Young</Dropdown.Item>
                            <Dropdown.Item key="adult">Adult</Dropdown.Item>
                            <Dropdown.Item key="senior">Senior</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Dropdowns for size */}
                    <Text size={16} color="secondary" aria-label='size' css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Size</Text>
                    <Dropdown>
                        <Dropdown.Button
                            flat
                            color="inherit"
                            css={{ width: "100%", tt: "capitalize", marginBottom: "1rem" }}>
                            {/* sets the button text to the current value that is stored in the state */}
                            {sizeListValue}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            color="secondary"
                            disallowEmptySelection
                            selectionMode="single"
                            // setting the key values to the memo that we initially created
                            sizeListKeys={sizeList}
                            // when something is selected, updating the state
                            onSelectionChange={setSizeList}
                        >
                            {/* dropdown options */}
                            <Dropdown.Item key="select_all">Select All</Dropdown.Item>
                            <Dropdown.Item key="small">Small</Dropdown.Item>
                            <Dropdown.Item key="medium">Medium</Dropdown.Item>
                            <Dropdown.Item key="large">Large</Dropdown.Item>
                            <Dropdown.Item key="xlarge">Extra Large</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Dropdowns for coat */}
                    <Text size={16} color="secondary" aria-label='coat' css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Coat</Text>
                    <Dropdown>
                        <Dropdown.Button
                            flat
                            color="inherit"
                            css={{ width: "100%", tt: "capitalize", marginBottom: "1rem" }}>
                            {/* sets the button text to the current value that is stored in the state */}
                            {coatListValue}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            color="secondary"
                            disallowEmptySelection
                            selectionMode="single"
                            // setting the key values to the memo that we initially created
                            coatListKeys={coatList}
                            // when something is selected, updating the state
                            onSelectionChange={setCoatList}
                        >
                            {/* dropdown options */}
                            <Dropdown.Item key="select_all">Select All</Dropdown.Item>
                            <Dropdown.Item key="hairless">Hairless</Dropdown.Item>
                            <Dropdown.Item key="short">Short</Dropdown.Item>
                            <Dropdown.Item key="medium">Medium</Dropdown.Item>
                            <Dropdown.Item key="long">Long</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Input and label for boolean checkbox preferences */}
                    <Text color="secondary" aria-label='preferences' css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Preferences</Text>
                    <Checkbox.Group
                        size="xs"
                        // value is set to what we current have in the state
                        value={selectedCheckboxes}
                        // when something changes, we update the state
                        onChange={setSelectedCheckboxes}
                        color="secondary"
                        aria-label='preferences'
                    >
                        <Checkbox aria-label="good_with_children" value="good_with_children">Good with children</Checkbox>
                        <Checkbox aria-label="good_with_dogs" value="good_with_dogs">Good with dogs</Checkbox>
                        <Checkbox aria-label="good_with_cats" value="good_with_cats">Good with cats</Checkbox>
                        <Checkbox aria-label="house_trained" value="house_trained">House trained</Checkbox>
                        <Checkbox aria-label="declawed" value="declawed">De-clawed</Checkbox>
                        <Checkbox aria-label="special_needs" value="special_needs">Special needs</Checkbox>
                    </Checkbox.Group>

                    {/* Button for submitting / applying the filter */}
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