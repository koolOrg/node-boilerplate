const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { costOfLivingService } = require('../services');
// fs-extra
const fs = require('fs-extra');

const createCostOfLiving = catchAsync(async (req, res) => {
    // console.log(req.body)
    const costOfLiving = await costOfLivingService.createCostOfLiving(req.body);
    res.status(httpStatus.CREATED).send(costOfLiving);
});

const getCostOfLivings = catchAsync(async (req, res) => {
    const filter =  {};
    // const options = {
    //   sortBy: req.query.sortBy,
    //   limit: parseInt(req.query.limit, 10) || 10,
    //   page: parseInt(req.query.page, 10) || 1
    // };

    console.log(req.query)
    const options = {
        sortBy: req.query.sortBy,
        limit: 100,
        page: req.query.page || 1
    }
    const result = await costOfLivingService.queryCostOfLiving(filter, options);
    
    res.status(httpStatus.OK).send(result);
});

// const excludeItems = [
//     "Domestic Beer", "Imported Beer", "Cappuccino", "Coke/Pepsi", "Rice",
//     "Local Cheese", "Apples", "Banana", "Oranges", "Tomato", "Potato", "Onion",
//     "Lettuce", "Taxi Start", "Taxi 1hour Waiting", "Taxi 1 mile", "Cigarettes",
//     "Volkswagen Golf", "Toyota Corolla", "Tennis Court Rent", "1 Pair of Jeans",
//     "1 Summer Dress", "1 Pair of Nike Running Shoes", "1 Pair of Men Leather Business Shoes"
//   ];
// function filterCostOfLivingDetails(data) {

    
    
//    // write to a file even if the file does not exist or already exists. Output to /app/src/input/data.json
//     fs.outputJson('./src/input/data.json', data)
//     .then(() => {
//         console.log('success!')
//     })
//     .catch(err => {
//         console.error(err)
//     }
//     )

//     // Normalize excludeItems to lowercase for case-insensitive comparison
//     const normalizedExcludes = excludeItems.map(item => item.toLowerCase());
  
//     // Extract cost_of_living_details
//     const { cost_of_living_details } = data;
  
//     // Filter the items based on the exclude list
//     const filteredDetails = cost_of_living_details.map(section => {
//       const filteredItems = section.details.filter(item => 
//         !normalizedExcludes.includes(item.Item.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')) // Normalize by removing non-alphanumeric characters
//       );
//       return {
//         ...section,
//         details: filteredItems
//       };
//     });

//     // log intial data and filtered data to console for debugging purposes 
//     // console.log(data);
//     // console.log(filteredDetails);

//     // log the length of the initial data and the filtered data to console for debugging purposes
//     console.log(data.cost_of_living_details[0].details.length);
//     console.log(filteredDetails[0].details.length);

  
//     return {
//       ...data,
//       cost_of_living_details: filteredDetails
//     };
//   }

// function filterCostOfLivingDetails(data) {
//     // Items to exclude, formatted in a way to match the incoming data formatting
//     const excludeItems = [
//         "Domestic Beer", "Imported Beer", "Cappuccino", "Coke/Pepsi", "Rice",
//         "Local Cheese", "Apples", "Banana", "Oranges", "Tomato", "Potato", "Onion",
//         "Lettuce", "Taxi Start", "Taxi 1 hour Waiting", "Taxi 1 mile", "Cigarettes",
//         "Volkswagen Golf", "Toyota Corolla", "Tennis Court Rent", "1 Pair of Jeans",
//         "1 Summer Dress", "1 Pair of Nike Running Shoes", "1 Pair of Men Leather Business Shoes"
//     ];

//     // Normalize and prepare the items for comparison by removing spaces and converting to lower case
//     const normalizedExcludes = excludeItems.map(item => item.toLowerCase().replace(/[^a-z0-9]+/g, ""));

//     // Extract cost_of_living_details
//     const { cost_of_living_details } = data;

//     // Filter the items based on the exclude list
//     const filteredDetails = cost_of_living_details.map(section => {
//         const filteredItems = section.details.filter(item => {
//             // Normalize item names for comparison
//             const normalizedItemName = item.Item.toLowerCase().replace(/[^a-z0-9]+/g, "");
//             // log which data is being filtered out successfully
//             // console.log(normalizedItemName);

//             console.log(normalizedExcludes.includes(normalizedItemName));
//             return !normalizedExcludes.includes(normalizedItemName);
//         });
        
//         return {
//             ...section,
//             details: filteredItems
//         };
//     });


//     // write input and output data to a file for debugging purposes
//     fs.outputJson('./src/input/data.json', data)
//         .then(() => {
//             console.log('Success!');
//         })
//         .catch(err => {
//             console.error(err);
//         });

//     fs.outputJson('./src/output/filteredData.json', filteredDetails)
//         .then(() => {
//             console.log('Success!');
//         })
//         .catch(err => {
//             console.error(err);
//         });

//     // Log the length of the initial data and the filtered data for debugging purposes
//     console.log("Original length:", data.cost_of_living_details[0].details.length);
//     console.log("Filtered length:", filteredDetails[0].details.length);

//     return {
//         ...data,
//         cost_of_living_details: filteredDetails
//     };
// }

// function filterCostOfLivingDetails(data) {
//     const excludeItems = [
//         "Domestic Beer", "Imported Beer", "Cappuccino", "Coke/Pepsi", "Rice",
//         "Cheese", "Apples", "Banana", "Oranges", "Tomato", "Potato", "Onion",
//         "Lettuce", "Taxi Start", "Taxi Waiting", "Taxi", "Cigarettes",
//         "Volkswagen Golf", "Toyota Corolla", "Tennis Court", "Jeans",
//         "Dress", "Nike Shoes", "Men Leather Shoes"
//     ];

//     // Normalize and prepare for partial matching
//     const normalizedExcludes = excludeItems.map(item => item.toLowerCase().replace(/[^a-z0-9]+/g, ''));

//     const { cost_of_living_details } = data;

//     const filteredDetails = cost_of_living_details.map(section => {
//         const filteredItems = section.details.filter(item => {
//             const normalizedItemName = item.Item.toLowerCase().replace(/[^a-z0-9]+/g, '');
//             return !normalizedExcludes.some(exclude => normalizedItemName.includes(exclude));
//         });

//         console.log("Items removed:", section.details.filter(item => normalizedExcludes.some(exclude => item.Item.toLowerCase().replace(/[^a-z0-9]+/g, '').includes(exclude))).map(item => item.Item));

//         return {
//             ...section,
//             details: filteredItems
//         };
//     });

//     // log the initial data and the filtered data length  to the console for debugging purposes
//     console.log("Original length:", data.cost_of_living_details[0].details.length);
//     console.log("Filtered length:", filteredDetails[0].details.length);
//     return {
//         ...data,
//         cost_of_living_details: filteredDetails
//     };
// }

const getCostOfLivingById = catchAsync(async (req, res) => {
    let costOfLiving = await costOfLivingService.getCostOfLivingById(req.params.id);

    if (!costOfLiving) {
        res.status(httpStatus.NOT_FOUND).send();
    } else {
        res.status(httpStatus.OK).send(costOfLiving);
    }
});

const updateCostOfLivingById = catchAsync(async (req, res) => {
    const costOfLiving = await costOfLivingService.updateCostOfLivingById(req.params.id, req.body);
    if (!costOfLiving) {
        res.status(httpStatus.NOT_FOUND).send();
    } else {
        res.status(httpStatus.OK).send(costOfLiving);
    }
});

const deleteCostOfLivingById = catchAsync(async (req, res) => {
    await costOfLivingService.deleteCostOfLivingById(req.params.id);
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createCostOfLiving,
    getCostOfLivings,
    getCostOfLivingById,
    updateCostOfLivingById,
    deleteCostOfLivingById
};
