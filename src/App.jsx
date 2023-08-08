import { useState, useEffect } from 'react'
// Required dependencies for project:
// CoreUI Framework
import { CModal, CModalHeader, CModalTitle, CModalBody, CButton, CForm, CFormInput, CFormLabel, CInputGroup, CInputGroupText, CTable } from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css'
// Forms Library: react-hook-form
import { useForm, Controller } from "react-hook-form"
// React-select for Country and City
import Select from 'react-select'
// Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {/* CONFIGS */};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

/** 
* @author William Mucha
* @summary Main app page being rendered for technical test
* @return {HTMLElement} Returns an HTML/React component 
* @exports default
*/
function App() {
  // Modal variables
  const [visible, setVisible] = useState(false)
  const [modalType, setModalType] = useState("")

  // React Hook Form setup
  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm()

  // Rerender whenever visability of modal changes, used as catalyst to rerender the table with new database data
  useEffect(() => {
    /** 
    * @summary Function that collects the current documents in the Users database and propogates them into a table
    */
    const getInfo = async () => {
      const querySnapshot = await getDocs(collection(db, "Users"));
      let currentItemsList = []
      querySnapshot.forEach((doc) => {
        let dateOfBirth = doc.data().DateOfBirth
        let time = new Date(1970, 0, 1); // Epoch
        time.setSeconds(dateOfBirth.seconds);
        currentItemsList.push({
          name: doc.data().Name,
          dob: time.toISOString().split('T')[0].toString(),
          country: doc.data().Country,
          city: doc.data().City,
          edit: <CButton onClick={() => { updateModal(doc.id, doc.data().Name, time, doc.data().Country, doc.data().City); setModalValueType('Edit') }} color="warning">+</CButton>,
          delete: <CButton onClick={() => deleteInfo(doc.id)} color="danger">X</CButton>,
          _cellProps: { id: { scope: 'row' } },
        })
      });
      setItems(currentItemsList)
    }
    getInfo()

    /** 
    * @summary Function that removes a document from the database 
    * @param {String} id - The unique identifier of the document that is being removed
    */
    const deleteInfo = async (id) => {
      try {
        let docRef = doc(db, "Users/", id);
        await deleteDoc(docRef)
        getInfo()
      } catch (e) {
        console.error("Error deleting document: ", e);
      }
    }

    /** 
    * @summary Function that adds a current existing document to the Modal input fields for editing
    * @param {String} id - The unique identifier of the current document
    * @param {String} name - The name of the user
    * @param {Date} time - The date of birth in seconds from epoch
    * @param {String} country - The country of the user, either Canada or USA
    * @param {String} city - The city of the user, based of the country
    */
    const updateModal = (id, name, time, country, city) => {
      setValue('id', id)
      setValue('name', name)
      setValue('year', time.getFullYear().toString())
      setValue('month', (time.getMonth() + 1).toString())
      setValue('day', time.getDate().toString())
      setValue('country', { value: country, label: country })
      setValue('city', { value: city, label: city })
    }
  }, [visible]);

  /** 
  * @summary Async function that either adds a new user to the db or updates an existing one.
  * @param {Object} data - A dictionary that passes the new or updated user fields
  */
  const onSubmit = async (data) => {
    try {
      if (data.id) {
        await setDoc(doc(db, "Users/", data.id), {
          City: data.city.value,
          Country: data.country.value,
          DateOfBirth: new Date(data.year, (data.month - 1), data.day),
          Name: data.name
        });
      } else {
        await addDoc(collection(db, "Users"), {
          City: data.city.value,
          Country: data.country.value,
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
    setVisible(false)
    reset()
  }

  /** 
  * @summary Function that sets the modal type on visibility
  * @param {String} mtype - The string that determines the type of modal, either Add or Edit
  */
  function setModalValueType(mtype) {
    setModalType(mtype)
    setVisible(true)
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

  // Table variables
  const [items, setItems] = useState([]);
  const columns = [
    {
      key: 'name',
      label: 'Name',
      _props: { scope: 'col' },
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      _props: { scope: 'col' },
    },
    {
      key: 'country',
      label: 'Country',
      _props: { scope: 'col' },
    },
    {
      key: 'city',
      label: 'City',
      _props: { scope: 'col' },
    },
    {
      key: 'edit',
      label: 'Edit',
      _props: { scope: 'col' },
    },
    {
      key: 'delete',
      label: 'Delete',
      _props: { scope: 'col' },
    },
  ]

  // App return HTML
  return (
    <>
      {/* Main page with Table */}
      <h1 style={{ textAlign: 'center' }}>User table</h1>
      <CButton onClick={() => setModalValueType('Add')} color="success">Add new user</CButton>
      <CTable columns={columns} items={items} />

      {/* Modal used to Add and Edit users */}
      <CModal backdrop="static" visible={visible} onClose={() => resetValues()}>
        <CModalHeader>
          <CModalTitle>{modalType} User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit(onSubmit)}>
            <CFormLabel htmlFor="name"><b>Name</b></CFormLabel>
            <CFormInput type="hidden" id="id" {...register("id")} />
            <CFormInput type="text" id="name" placeholder="Bob Smith" {...register("name", { required: true })} />
            {errors.name && <div style={{ color: "red" }}>Name is required</div>}
            <CFormLabel style={{ paddingTop: "10px" }} htmlFor="dateOfBirth"><b>Date of birth</b></CFormLabel>
            <CInputGroup id="dateOfBirth">
              <CInputGroupText>Year</CInputGroupText>
              <CFormInput type="number" aria-label="year" {...register("year", { required: true, min: 1923, max: 2023 })} />
              <CInputGroupText>Month</CInputGroupText>
              <CFormInput type="number" aria-label="month" {...register("month", { required: true, min: 1, max: 12 })} />
              <CInputGroupText>Day</CInputGroupText>
              <CFormInput type="number" aria-label="day" {...register("day", { required: true, min: 1, max: 31 })} />
            </CInputGroup>
            {errors.year && <div style={{ color: "red" }}>Year is required (1923-2023)</div>}
            {errors.month && <div style={{ color: "red" }}>Month is required (1-12)</div>}
            {errors.day && <div style={{ color: "red" }}>Day is required (1-31)</div>}
            <CFormLabel style={{ paddingTop: "10px" }} htmlFor="country"><b>Country</b></CFormLabel>
            <Controller
              control={control}
              name="country"
              rules={{ required: true }}
              render={({
                field: { onBlur, value, name, ref },
              }) => (
                <Select
                  options={optionsCountry}
                  onChange={(e) => { reset({ 'city': "" }); setValue('country', e); setCountry(e.value); }}
                  onBlur={onBlur}
                  value={value}
                  name={name}
                  ref={ref}
                />
              )}
            />
            {errors.country && <div style={{ color: "red" }}>Country is required</div>}
            <CFormLabel style={{ paddingTop: "10px" }} htmlFor="city"><b>City</b></CFormLabel>
            <Controller
              control={control}
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
            {errors.city && <div style={{ color: "red" }}>City is required</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <CButton color="primary" type="submit" >{modalType}</CButton>
            </div>
          </CForm>
        </CModalBody>
      </CModal>
    </>
  )
}

export default App
