import { CTable } from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css'
import PropTypes from 'prop-types';

/**
* @name Table 
* @author William Mucha <william@payspace.ca>
* @summary Component used in to create the users table
* @param {Object} props - The properties passed to the function
* @param {Object} props.items - The items array passed from the database
* @return {HTMLElement} Returns the HTML structure the table
* @exports default
*/
export default function Table(props) {
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

    return(
        <CTable columns={columns} items={props.items} />
    )
}
Table.propTypes = {
    items: PropTypes.array
};