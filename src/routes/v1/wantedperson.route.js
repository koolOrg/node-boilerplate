// fetchAgencies.js
// const fetch = require('node-fetch');
const axios = require('axios');
// const mongoose = require('mongoose');
const WantedPerson = require('../../models/wantedperson.model');

const fetchOtherUsingApiKey = async () => {
  const API_KEY = '';
  console.log('fetching data from FBI');
  const collection = 'offense'; // Could be 'offense', 'offender', or 'victim'
  const variable = 'relationship'; // This is an example; replace with the actual variable you're interested in
  const fromYear = '2022';
  const toYear = '2023';

  const url = `https://api.usa.gov/crime/fbi/cde/shr/national/${collection}/${variable}?to=${toYear}&from=${fromYear}&API_KEY=${API_KEY}`;
  try {
    // const response = await fetch(`https://api.usa.gov/crime/fbi/cde/agency/byStateAbbr/TX?API_KEY=${API_KEY}`);
    const response = await axios(url);
    // if (!response.ok) {

    const data = await response.json();
    // Process the data and perform desired operations
    console.log(data);
    return data;
    // }
  } catch (error) {
    console.error(error);
    throw new Error('Error occurred while fetching and storing wanted persons');
  }
};

const fetchAndStoreWantedPerson = async () => {
  const API_KEY = '';
  //   const response = await fetch(`https://api.usa.gov/crime/fbi/cde/agency/byStateAbbr/TX?API_KEY=${API_KEY}`);
  let count = 1;
  while (count <= 50) {
    const response = await axios(`https://api.fbi.gov/wanted/v1/list?page=${count}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    //   console.log(data)
    // return data.items;
    for (const wantedPerson of data.items) {
      const wantedPersonData = {
        uid: wantedPerson.uid,
        url: wantedPerson.url,
        age_range: wantedPerson.age_range,
        weight: wantedPerson.weight,
        occupations: wantedPerson.occupations,
        field_offices: wantedPerson.field_offices,
        locations: wantedPerson.locations,
        reward_text: wantedPerson.reward_text,
        sex: wantedPerson.sex,
        hair: wantedPerson.hair,
        ncic: wantedPerson.ncic,
        dates_of_birth_used: wantedPerson.dates_of_birth_used,
        caution: wantedPerson.caution,
        nationality: wantedPerson.nationality,
        age_min: wantedPerson.age_min,
        age_max: wantedPerson.age_max,
        scars_and_marks: wantedPerson.scars_and_marks,
        subjects: wantedPerson.subjects,
        aliases: wantedPerson.aliases,
        race_raw: wantedPerson.race_raw,
        suspects: wantedPerson.suspects,
        publication: wantedPerson.publication,
        title: wantedPerson.title,
        coordinates: wantedPerson.coordinates,
        hair_raw: wantedPerson.hair_raw,
        languages: wantedPerson.languages,
        complexion: wantedPerson.complexion,
        build: wantedPerson.build,
        details: wantedPerson.details,
        status: wantedPerson.status,
        legat_names: wantedPerson.legat_names,
        eyes: wantedPerson.eyes,
        person_classification: wantedPerson.person_classification,
        description: wantedPerson.description,
        images: wantedPerson.images,
        possible_countries: wantedPerson.possible_countries,
        weight_min: wantedPerson.weight_min,
        weight_max: wantedPerson.weight_max,
        additional_information: wantedPerson.additional_information,
        remarks: wantedPerson.remarks,
        path: wantedPerson.path,
        eyes_raw: wantedPerson.eyes_raw,
        reward_min: wantedPerson.reward_min,
        url: wantedPerson.url,
        possible_states: wantedPerson.possible_states,
        modified: wantedPerson.modified,
        reward_max: wantedPerson.reward_max,
        race: wantedPerson.race,
        height_max: wantedPerson.height_max,
        place_of_birth: wantedPerson.place_of_birth,
        height_min: wantedPerson.height_min,
        poster_classification: wantedPerson.poster_classification,
        warning_message: wantedPerson.warning_message,
        files: wantedPerson.files,
        id2: wantedPerson['@id'],
      };

      try {
        const wantedPersonModel = new WantedPerson(wantedPersonData);
        await wantedPersonModel.save();
      } catch (error) {
        console.error(error);
      }
    }
    count++;
  }
  console.log('WantedPersons stored in database');
  // return data;
  return 'success';
};

module.exports = {
  fetchAndStoreWantedPerson,
  fetchOtherUsingApiKey,
};
