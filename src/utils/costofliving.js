const fs = require('fs');
const path = require('path');
const { costOfLivingService } = require('../services');

const cl = async () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, '../sampledata/costofliving.json'), 'utf8');
        const costOfLivingBulkData = JSON.parse(data);
        const costOfLivingData = costOfLivingBulkData.data;

        for (let i = 0; i < costOfLivingData.length; i++) {
            const costOfLiving = costOfLivingData[i];
            await costOfLivingService.createCostOfLiving(costOfLiving);
        }

        console.log('Cost of living data loaded successfully.');
    } catch (error) {
        console.error('Error loading cost of living data:', error);
    }
};

module.exports = cl;
