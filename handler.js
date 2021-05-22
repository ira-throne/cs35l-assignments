const { request } = require('express');
const express = require('express');
const router = express.Router();
const Schemas = require('../models/Schemas');

router.get('/listings', async (request, response) => {
    const listings = Schemas.Listings;
    const this_listing = await listings.find({}).exec((err, listingData) => {
        if (err) throw err;
        if (listingData) {
            response.end(JSON.stringify(listingData));
        } else {
            response.end();
        }
    });
});

router.get('/', async (request, response) => {
    let noMatch = null;
    const listings = Schemas.Listings;
    if (request.query.searchbar) {
        const regex = new RegExp(regexEsc(request.query.searchbar), 'gi');
        listings.find({$or:[{'listing_title': regex },{'listing_description': regex}, {'listing_category': regex }]}).exec((err, listResults) => {
            if (err) {
                throw err;
            } else {
                if(listResults.length < 1) {
                    noMatch = "Sorry, there are no matches";
                }
                response.end(JSON.stringify({results: listResults, noMatch: noMatch}));
            }
        });
    } else {
        listings.find({}).exec((err, listResults) => {
            if (err) throw err;
            if (listResults) {
                response.end(JSON.stringify(listResults));
            } else {
                response.end();
            }
        });
    }
});


// These are the options:
// /sort?sortBy=date:acs
// /sort?sortBy=date:desc
// /sort?sortBy=category:acs
// /sort?sortBy=category:desc
router.get('/sort', async (request, response) => {
    const listings = Schemas.Listings;
    let sortby = '';
    let ascdesc = 1;
    if(request.query.sortBy) {
        const str = request.query.sortBy.split(':');
        sortby = str[0];
        ascdesc = (str[1] === 'desc') ? -1 : 1
    }
    if (sortby === 'category') {
        await listings.find({}).sort({listing_category: ascdesc}).exec((err, listingData) => {
            if (err) throw err;
            if (listingData) {
                response.end(JSON.stringify(listingData));
            } else {
                response.end();
            }
    });
    } else{
        await listings.find({}).sort({date_posted: ascdesc,}).exec((err, listingData) => {
            if (err) throw err;
            if (listingData) {
                response.end(JSON.stringify(listingData));
            } else {
                response.end();
            }
        });
    }
});


router.post('/addListing', async (request, response)=>{
    const newListing = new Schemas.Listings({
        listing_title: request.body.title,
        listing_price: request.body.price,
        listing_category: request.body.category,
        listing_description: request.body.description
    })
    try{
        await newListing.save((err, data)=>{
            if (err) response.end('Error Saving.');
            response.redirect('/');
            response.end();
        });
    } catch(err){
        console.log(err);
        response.redirect('/');
        response.end();
    }  
});

function regexEsc(txt) {
    return txt.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
