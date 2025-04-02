"use client"
import { useState } from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
  } from "use-places-autocomplete";
  import useOnclickOutside from "react-cool-onclickoutside";
  import styles from "../page.module.css"
  
  export default function AutoComplete({setLocation}){
    const {
      ready,
      value,
      suggestions: { status, data },
      setValue,
      clearSuggestions,
    } = usePlacesAutocomplete({
      requestOptions: {
        /* Define search scope here */
        componentRestrictions: {country: "us"},
      },
      debounce: 300,
    });
    const ref = useOnclickOutside(() => {
      // When the user clicks outside of the component, we can dismiss
      // the searched suggestions by calling this method
      clearSuggestions();
    });
  
    const handleInput = (e) => {
      // Update the keyword of the input element
      setValue(e.target.value);
    };
  
    const handleSelect =
      ({ description }) =>
      () => {
        // When the user selects a place, we can replace the keyword without request data from API
        // by setting the second parameter to "false"
        setValue(description, false);
        clearSuggestions();
  
        // Get latitude and longitude via utility functions
        getGeocode({ address: description }).then((results) => {
          console.log("Geocode results:", results);
          if(results.length > 0){
            const { lat, lng } = getLatLng(results[0]);
            const latitude = lat;
            const longitude = lng;
            const location = {latitude, longitude};
            console.log("📍 Coordinates: ", { location });
            setLocation(location);
          }else{
            throw new Error("No results found");
          }
        });
      };
  
    const renderSuggestions = () =>
      data.map((suggestion) => {
        const {
          place_id,
          structured_formatting: { main_text, secondary_text },
        } = suggestion;
  
        return (
          <li key={place_id} onClick={handleSelect(suggestion)} className={styles.links}>
            <strong>{main_text}</strong> <small>{secondary_text}</small>
          </li>
        );
      });
  
    return (
      <div ref={ref} >
        <input
          value={value}
          onChange={handleInput}
          disabled={!ready}
          className= {styles.locationInput}
          placeholder="Enter your location"
        />
        {/* We can use the "status" to decide whether we should display the dropdown or not */}
        {status === "OK" && <ul className={styles.suggestionsList}>{renderSuggestions()}</ul>}
      </div>
    );
  };