const fs = require('fs');
const path = require('path');
// const mongoose = require('mongoose');
// const { serialKillerService } = require('../services');
const {serialKillerService} = require('../services');

// const { SerialKiller } = require('../models');

// load serialkiller data from json file and upload to serialkiller database using serialKillerService


const sk = async () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, '../sampledata/serialkiller.json'), 'utf8');
        const serialKillers = JSON.parse(data);

        for (let i = 0; i < serialKillers.length; i++) {
            const serialKiller = serialKillers[i];
            await serialKillerService.createSerialKiller(serialKiller);
        }

        console.log('Serial killer data loaded successfully.');
    } catch (error) {
        console.error('Error loading serial killer data:', error);
    }
};

module.exports = sk;
