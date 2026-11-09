// Importing all the necessary libraries and components and assets
import React, { useState, useContext, useEffect } from 'react';
import { Input, Col, Row, Button, Dropdown, Text, Checkbox } from '@nextui-org/react';
import GlobalContext from '../GlobalContext';

// receiving the props from the parent component
const FilterSidebar = ({ setPets, globalFilters: propFilters, setGlobalFilters: propSetFilters }) => {
    const context = useContext(GlobalContext);
    const globalFilters = propFilters || context?.globalFilters || {};
    const setGlobalFilters = propSetFilters || context?.setGlobalFilters;

    // using state to keep track of form data (zip, distance)
    const [formData, setFormData] = useState({
        zip: globalFilters?.zip || '',
        distance: globalFilters?.distance || ''
    });

    // State and handler for Age
    const [ageList, setAgeList] = useState(new Set([globalFilters?.age ? globalFilters.age.toLowerCase() : "Select All"]));

    // State and handler for Gender
    const [genderList, setGenderList] = useState(new Set([globalFilters?.gender ? globalFilters.gender.toLowerCase() : "Select All"]));

    // State for Size
    const [sizeList, setSizeList] = useState(new Set([globalFilters?.size ? globalFilters.size.toLowerCase() : "Select All"]));

    // State for Coat
    const [coatList, setCoatList] = useState(new Set([globalFilters?.coat ? globalFilters.coat.toLowerCase() : "Select All"]));

    // Checkbox keys
    const checkboxKeys = [
        "good_with_children", "good_with_dogs", "good_with_cats",
        "house_trained", "declawed", "special_needs", "current_vaccinations"
    ];

    // State for checkboxes
    const [selectedCheckboxes, setSelectedCheckboxes] = useState(() => {
        return checkboxKeys.filter(key => Boolean(globalFilters?.[key]));
    });

    // Sync input fields when globalFilters change externally
    useEffect(() => {
        setFormData({
            zip: globalFilters?.zip || '',
            distance: globalFilters?.distance || ''
        });
    }, [globalFilters?.zip, globalFilters?.distance]);

    // Sync dropdowns when globalFilters change externally
    useEffect(() => {
        if (globalFilters?.age) setAgeList(new Set([globalFilters.age.toLowerCase()]));
        if (globalFilters?.gender) setGenderList(new Set([globalFilters.gender.toLowerCase()]));
        if (globalFilters?.size) setSizeList(new Set([globalFilters.size.toLowerCase()]));
        if (globalFilters?.coat) setCoatList(new Set([globalFilters.coat.toLowerCase()]));
    }, [globalFilters?.age, globalFilters?.gender, globalFilters?.size, globalFilters?.coat]);

    // Sync checkboxes when globalFilters change externally
    useEffect(() => {
        setSelectedCheckboxes(checkboxKeys.filter(key => Boolean(globalFilters?.[key])));
    }, [
        globalFilters?.good_with_children,
        globalFilters?.good_with_dogs,
        globalFilters?.good_with_cats,
        globalFilters?.house_trained,
        globalFilters?.declawed,
        globalFilters?.special_needs,
        globalFilters?.current_vaccinations
    ]);

    // for storing the list of values for Age.
    const ageListValue = React.useMemo(
        () => Array.from(ageList).join(", ").replaceAll("_", " "),
        [ageList]
    );

    // for storing the list of values for Gender.
    const genderListValue = React.useMemo(
        () => Array.from(genderList).join(", ").replaceAll("_", " "),
        [genderList]
    );

    // for storing the list of values for Size.
    const sizeListValue = React.useMemo(
        () => Array.from(sizeList).join(", ").replaceAll("_", " "),
        [sizeList]
    );

    // for storing the list of values for Coat.
    const coatListValue = React.useMemo(
        () => Array.from(coatList).join(", ").replaceAll("_", " "),
        [coatList]
    );

    // creating a change handler function that stores input values into local form state
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(data => ({
            ...data,
            [name]: value
        }));
    };

    // creating a custom method to handle the submission of the form
    async function handleSubmit(e) {
        try {
            // preventing default behavior
            e.preventDefault();

            // setting payload with all filter criteria
            const payload = {
                zip: formData?.zip ? formData.zip : null,
                distance: formData?.distance ? formData.distance : null,
                age: ageListValue.toLowerCase() === "select all" ? null : ageListValue,
                size: sizeListValue.toLowerCase() === "select all" ? null : sizeListValue,
                coat: coatListValue.toLowerCase() === "select all" ? null : coatListValue,
                gender: genderListValue.toLowerCase() === "select all" ? null : genderListValue,
                currentPage: 1, // reset to page 1 on new filter search
            };

            // going through checkboxes and setting true or null
            checkboxKeys.forEach(key => {
                payload[key] = selectedCheckboxes.includes(key) ? true : null;
            });

            // settings the pets to null which will prompt the component to show loading spinner
            setPets(null);

            // updating the globalFilters state by merging payload
            if (setGlobalFilters) {
                setGlobalFilters(currentFilters => ({
                    ...currentFilters,
                    ...payload
                }));
            }
        } catch (err) {
            console.log("Adoptal > Front-end > pets > FilterSidebar.js > handleSubmit > ", err);
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
                        max={99999}
                        fullWidth
                        placeholder='15219'
                        css={{ marginBottom: "1rem" }}
                        name="zip"
                        value={formData?.zip !== undefined ? formData.zip : (globalFilters?.zip || '')}
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
                        labelRight="miles"
                        css={{ marginBottom: "1rem" }}
                        name="distance"
                        value={formData?.distance !== undefined ? formData.distance : (globalFilters?.distance || '')}
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

                    {/* Dropdowns for Gender */}
                    <Text color="secondary" aria-label='gender' css={{ fontSize: "var(--nextui-fontSizes-md)" }}>Gender</Text>
                    <Dropdown>
                        <Dropdown.Button
                            flat
                            color="inherit"
                            css={{ width: "100%", tt: "capitalize", marginBottom: "1rem" }}>
                            {/* sets the button text to the current value that is stored in the state */}
                            {genderListValue}
                        </Dropdown.Button>
                        <Dropdown.Menu
                            aria-label="Single selection actions"
                            color="secondary"
                            disallowEmptySelection
                            selectionMode="single"
                            // setting the key values to the memo that we initially created
                            genderListKeys={genderList}
                            // when something is selected, updating the state
                            onSelectionChange={setGenderList}
                        >
                            {/* dropdown options */}
                            <Dropdown.Item key="select_all">Select All</Dropdown.Item>
                            <Dropdown.Item key="male">Male</Dropdown.Item>
                            <Dropdown.Item key="female">Female</Dropdown.Item>
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
                            <Dropdown.Item key="wire">Wire</Dropdown.Item>
                            <Dropdown.Item key="curly">Curly</Dropdown.Item>
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
                        {/* Removing the spayed/neutered checkbox because the API doesn't really have that data available. It will still be available in API if needed for future. According to most adoption places, the pet will already be spayed/neutered when adopted */}
                        {/* <Checkbox aria-label="spayed_neutered" value="spayed_neutered">Spayed / Neutered</Checkbox> */}
                        <Checkbox aria-label="current_vaccinations" value="current_vaccinations">Current Vaccinations</Checkbox>
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

                    {/* Button for clearing all filters */}
                    <Button
                        style={{ margin: "1rem auto" }}
                        size="lg"
                        ghost
                        color="secondary"
                        auto
                        onClick={() => { setGlobalFilters({}) }}
                    >
                        Clear Filter
                    </Button>

                </Col>
            </form>
        </Row>
    )
}

export default FilterSidebar;