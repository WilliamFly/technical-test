import { useState, useEffect } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CButton, CForm, CFormInput, CFormLabel, CInputGroup, CInputGroupText } from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css'
// Forms Library: react-hook-form
import { Controller } from "react-hook-form"
// React-select for Country and City
import Select from 'react-select'
import PropTypes from 'prop-types';
import { collection, addDoc, doc, setDoc } from "firebase/firestore";


/**
* @name Modal 
* @author William Mucha <william@payspace.ca>
* @summary Component used in to create the modal form
* @param {Object} props - The properties passed to the function
* @param {Object} props.db - The users database 
* @param {String} props.modalType - The type of modal, either Add or Edit
* @param {Function} props.register - A method that registers an input or selects an element and applies validation rules to React Hook Form
* @param {Function} props.handleSubmit - Function that will receive the form data if form validation is successful
* @param {Object} props.control - Object that contains methods for registering components into React Hook Form
* @param {Object} props.errors - Object with field errors
* @param {Function} props.reset - Function that resets the entire form state, fields reference, and subscriptions.
* @param {Boolean} props.visible - Boolean that determines if the modal is visible or not
* @param {Function} props.setVisible - Function that sets the visibility of the modal
* @param {Function} props.setValue - Function to dynamically set the value of a registered field 
* @return {HTMLElement} Returns the HTML structure the modal
* @exports default
*/
export default function Modal(props) {
    /** 
    * @summary Async function that either adds a new user to the db or updates an existing one.
    * @param {Object} data - A dictionary that passes the new or updated user fields
    */
    const onSubmit = async (data) => {
        try {
            if (data.id) {
                await setDoc(doc(props.db, "Users/", data.id), {
                    City: { value: data.city.value, label: data.city.label },
                    Country: { value: data.country.value, label: data.country.label },
                    DateOfBirth: new Date(data.year, (data.month - 1), data.day),
                    Name: data.name
                });
            } else {
                await addDoc(collection(props.db, "Users"), {
                    City: { value: data.city.value, label: data.city.label },
                    Country: { value: data.country.value, label: data.country.label },
                    DateOfBirth: new Date(data.year, (data.month - 1), data.day),
                    Name: data.name
                });
            }
            resetValues()
        } catch (e) {
            console.error("Error adding/updating document: ", e);
        }
    }
    /** 
    * @summary Function that resets the modal once it is no longer visible
    */
    function resetValues() {
        props.setVisible(false)
        props.reset()
        props.setValue('id', "")
        props.setValue('country', "")
        props.setValue('city', "")
    }

    // Dynamic City from Country variables and effect
    const optionsCountry = [
        { value: 'Canada', label: 'Canada' },
        { value: 'USA', label: 'USA' }
    ]
    const [country, setCountry] = useState("")
    const [cityOptions, setCityOptions] = useState([])

    useEffect(() => {
        if (country == "Canada") {
            setCityOptions([
                { value: 'Ottawa', label: 'Ottawa' },
                { value: 'Toronto', label: 'Toronto' }
            ])
        } else if (country == "USA") {
            setCityOptions([
                { value: 'Las Vegas', label: 'Las Vegas' },
                { value: 'Chicago', label: 'Chicago' }
            ])
        }
    }, [country]);

    return (
        <CModal backdrop="static" visible={props.visible} onClose={() => resetValues()}>
            <CModalHeader>
                <CModalTitle>{props.modalType} User</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <CForm onSubmit={props.handleSubmit(onSubmit)}>
                    <CFormLabel htmlFor="name"><b>Name</b></CFormLabel>
                    <CFormInput type="hidden" id="id" {...props.register("id")} />
                    <CFormInput type="text" id="name" placeholder="Bob Smith" {...props.register("name", { required: true })} />
                    {props.errors.name && <div style={{ color: "red" }}>Name is required</div>}
                    <CFormLabel style={{ paddingTop: "10px" }} htmlFor="dateOfBirth"><b>Date of birth</b></CFormLabel>
                    <CInputGroup id="dateOfBirth">
                        <CInputGroupText>Year</CInputGroupText>
                        <CFormInput type="number" aria-label="year" {...props.register("year", { required: true, min: 1923, max: 2023 })} />
                        <CInputGroupText>Month</CInputGroupText>
                        <CFormInput type="number" aria-label="month" {...props.register("month", { required: true, min: 1, max: 12 })} />
                        <CInputGroupText>Day</CInputGroupText>
                        <CFormInput type="number" aria-label="day" {...props.register("day", { required: true, min: 1, max: 31 })} />
                    </CInputGroup>
                    {props.errors.year && <div style={{ color: "red" }}>Year is required (1923-2023)</div>}
                    {props.errors.month && <div style={{ color: "red" }}>Month is required (1-12)</div>}
                    {props.errors.day && <div style={{ color: "red" }}>Day is required (1-31)</div>}
                    <CFormLabel style={{ paddingTop: "10px" }} htmlFor="country"><b>Country</b></CFormLabel>
                    <Controller
                        control={props.control}
                        name="country"
                        rules={{ required: true }}
                        render={({
                            field: { onBlur, value, name, ref },
                        }) => (
                            <Select
                                options={optionsCountry}
                                onChange={(e) => { props.reset({ 'city': "" }); props.setValue('country', e); setCountry(e.value); }}
                                onBlur={onBlur}
                                value={value}
                                name={name}
                                ref={ref}
                            />
                        )}
                    />
                    {props.errors.country && <div style={{ color: "red" }}>Country is required</div>}
                    <CFormLabel style={{ paddingTop: "10px" }} htmlFor="city"><b>City</b></CFormLabel>
                    <Controller
                        control={props.control}
                        name="city"
                        rules={{ required: true }}
                        render={({
                            field: { onChange, onBlur, value, name, ref },
                        }) => (
                            <Select
                                options={cityOptions}
                                onChange={onChange}
                                onBlur={onBlur}
                                value={value}
                                name={name}
                                ref={ref}
                            />
                        )}
                    />
                    {props.errors.city && <div style={{ color: "red" }}>City is required</div>}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
                        <CButton color="primary" type="submit" >{props.modalType}</CButton>
                    </div>
                </CForm>
            </CModalBody>
        </CModal>
    )
}
Modal.propTypes = {
    db: PropTypes.object,
    modalType: PropTypes.string,
    register: PropTypes.func,
    handleSubmit: PropTypes.func,
    control: PropTypes.object,
    errors: PropTypes.object,
    reset: PropTypes.func,
    visible: PropTypes.bool,
    setVisible: PropTypes.func,
    setValue: PropTypes.func
};