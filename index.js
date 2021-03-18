'use strict';

/**
 * @description Required libraries
 */
const express = require('express');
const AWS = require("aws-sdk");

/**
 * @description Crete Express Application
 */
const app = express();

/**
 * @description Configure ASW library to utilize it 
 */
AWS.config.loadFromPath('./config.json');

/**
 * @description This configs we can move to .env by using npm library dotenv
 */
const PORT = 3000; // Server Port
const api = 'api'; // API Version

/**
 * @description This routes we can define better way using app.route or some similar approach using express.js
 */
const ROUTES = {
    REGIONS: `/${api}/regions`,
    VPC: `/${api}/vpc`,
    SUBNETS: `/${api}/subnets/:id`,
};

/**
 * @description This status codes can be use to return in api response
 */
const STATUS_CODES = {
    SUCCESS: 200,
    ERROR: 500
}

/**
 * @description This api will work as a ping api to check server status with current timestamp
 */
app.get('/', (req, res) => {
    res.json({ status: 'up', timestamp: new Date().getTime(), routes: "1. /api/regions 2. /api/vpc  3. /api/subnets/<vpc-id>",info : "please setup aws credentials in config.json" });
});

/**
 * @description This api returns the regions for aws
 */
app.get(ROUTES.REGIONS, (req, res) => {

    const result = new Promise((resolve, reject) => {
        const ec2 = new AWS.EC2();
        let params = {}
        ec2.describeRegions(params, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });

    result.then((data) => {
        let regions = [];
        data.Regions.forEach(region => regions.push(region.RegionName));
        res.status(STATUS_CODES.SUCCESS).send(regions);
    }).catch((error) => {
        res.status(STATUS_CODES.ERROR).send(error);
    })
});

/**
 * @description This api returns the vpcs 
 */
app.get(ROUTES.VPC, (req, res) => {

    const result = new Promise((resolve, reject) => {
        const ec2 = new AWS.EC2();
        let params = {}
        ec2.describeVpcs(params, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });

    result.then((data) => {
        let vpcs = [];
        data.Vpcs.forEach(vpc => vpcs.push(vpc.VpcId))
        res.status(STATUS_CODES.SUCCESS).send(vpcs);
    }).catch((error) => {
        res.status(STATUS_CODES.ERROR).send(error);
    })
});


/**
 * @description Returns the subnets for vpc-id
 * @param : vpc-id
 */
app.get(ROUTES.SUBNETS, (req, res) => {
    const result = new Promise((resolve, reject) => {
        const ec2 = new AWS.EC2();
        let params = { 
            Filters: [
                        {
                            Name: "vpc-id", 
                            Values: [req.params.id]
                        }
                     ]
        }
        ec2.describeSubnets(params, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });

    result.then((data) => {
        res.status(STATUS_CODES.SUCCESS).send(data);
    }).catch((error) => {
        res.status(STATUS_CODES.ERROR).send(error);
    })
});

/**
 * @description Start server listen on provided port
 */
app.listen(PORT, () => console.log(`Server is listening on: ${PORT}`));