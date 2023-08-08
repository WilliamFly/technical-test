import { useState, useEffect } from 'react'
// Required dependencies for project:
// CoreUI Framework
import { CButton } from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css'
// Forms Library: react-hook-form
import { useForm } from "react-hook-form"
// Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
// Components
import Table from "../components/Table/Table"
import Modal from "../components/Modal/Modal"

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCgB8k6DgjXcutnCQZMhNz-kr9-cJ3-0aw",
    authDomain: "technical-test-81417.firebaseapp.com",
    projectId: "technical-test-81417",
    storageBucket: "technical-test-81417.appspot.com",
    messagingSenderId: "114602002505",
    appId: "1:114602002505:web:60c2b87dbf647f1ef11798"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

/** 
* @author William Mucha
* @summary Main app page being rendered for technical test
* @return {HTMLElement} Returns an HTML/React component 
* @exports default
*/
export default function App() {
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
                    country: doc.data().Country.value,
                    city: doc.data().City.value,
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
            setValue('country', { value: country.value, label: country.label })
            setValue('city', { value: city.value, label: city.label })
        }
    }, [visible]);

    /** 
    * @summary Function that sets the modal type on visibility
    * @param {String} mtype - The string that determines the type of modal, either Add or Edit
    */
    function setModalValueType(mtype) {
        setModalType(mtype)
        setVisible(true)
    }

    // Table variables
    const [items, setItems] = useState([]);

    // App return HTML
    return (
        <>
            {/* Main page with Table */}
            <h1 style={{ textAlign: 'center' }}>User table</h1>
            <CButton onClick={() => setModalValueType('Add')} color="success">Add new user</CButton>
            <Table items={items}></Table>
            <Modal db={db} visible={visible} setVisible={setVisible} setValue={setValue} modalType={modalType} register={register} handleSubmit={handleSubmit} control={control} errors={errors} reset={reset}></Modal>
        </>
    )
}
