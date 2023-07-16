const bodyParser = require('body-parser');
const cors = require('cors')
const express = require('express')
const Shopify = require('shopify-api-node');

require('dotenv').config();

const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  apiKey: process.env.DELIVERY_API_KEY,
  password: process.env.DELIVERY_APP_PASSWORD
});

var corsOptions = {
  origin: ['https://dev.allnutrition.cl', '*'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express();
const port = 3000;

app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  console.log('hola')
  res.send('Hello World!');
});

app.post('/get-profile-gids', async (req, res) => {
  console.log('/get-profile-gids')
  try{
    let query = `
      {
        deliveryProfiles(first:1){
          edges{
            node{
              id
              name
              profileLocationGroups{
                locationGroup{
                  id
                }
                locationGroupZones(first:1){
                  edges{
                    node{
                      zone{
                        id
                        name
                      }
                      methodDefinitions(first:30){
                        edges{
                          node{
                            id
                            name
                            description
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
    shopify
    .graphql(query)
    .then(async (profiles) => {
      console.log('profiles:',profiles)
      let deliveryProfilesToDelete = []
      await profiles.deliveryProfiles.edges[0].node.profileLocationGroups[0].locationGroupZones.edges[0].node.methodDefinitions.edges.forEach(async (edge) => {
        let profileDescription = edge.node.description

        if(profileDescription && profileDescription.includes('-')){
          let destructuredDescription = profileDescription.split('-')
          let givenDate = destructuredDescription[2].trim()
          let isOlder = await minuteDifference(givenDate);

          if(isOlder){
            deliveryProfilesToDelete.push(edge.node.id)
          }
        }
      })
      console.log('delete:', deliveryProfilesToDelete)
      res.send(deliveryProfilesToDelete)
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    });
  }catch{
    console.log(error)
    res.send(error)
  }

  const minuteDifference = async (givenDate) => {
    let currentDate = new Date();

    let givenDateParts = givenDate.split("/");
    let givenYear = parseInt(givenDateParts[0], 10);
    let givenMonth = parseInt(givenDateParts[1], 10) - 1; 
    let givenDay = parseInt(givenDateParts[2], 10);
    let givenTime = givenDateParts[3].split(':')
    let givenHour = parseInt(givenTime[0], 10);
    let givenMinute = parseInt(givenTime[1], 10);
    let givenSecond = parseInt(givenTime[2], 10);

    let parsedGivenDate = new Date(givenYear, givenMonth, givenDay, givenHour, givenMinute, givenSecond);
    let timeDifference = currentDate - parsedGivenDate;
    let hoursDifference = Math.floor(timeDifference / (1000 * 60));

    if(hoursDifference > 4){
      return true 
    }else{
      return false;
    }  
  }

})

app.post('/create-shipping-method', async (req, res) => {
  console.log('/create-shipping-profile', req.body)
  try{
    const variables = req.body
    const query = `mutation deliveryProfileUpdate($id: ID!, $profile: DeliveryProfileInput!){
      deliveryProfileUpdate(id: $id, profile: $profile){
        profile{
          zoneCountryCount
          name
          id
          profileLocationGroups{
            locationGroupZones(first:1){
              edges{
                node{
                  methodDefinitions(first: 10 reverse:true){
                    edges{
                      node{
                        id
                        name
                        description
                      }
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`
    shopify
    .graphql(query, variables)
    .then((profile) => {
      console.log(profile)
      if(profile.deliveryProfileUpdate.userErrors.length === 0){
        let generalProfileShippingMethods = profile.deliveryProfileUpdate.profile.profileLocationGroups[0].locationGroupZones.edges[0].node.methodDefinitions.edges.map(edge => edge.node)
        res.send(generalProfileShippingMethods)
      }else{
        res.send(profile)
        return
      }
    })
    .catch((err) => {
      console.error(err)
      res.send(err)
    });
  }catch(error){
    console.log(error)
    res.send(error)
  }

});

app.post('/delete-shipping-method', async (req, res) => {
  console.log('/delete-shipping-method', req.body)
  try{
    const variables = req.body
    const query = `mutation deliveryProfileUpdate($id: ID!, $profile: DeliveryProfileInput!){
      deliveryProfileUpdate(id: $id, profile: $profile){
        profile{
          zoneCountryCount
          name
          id
          profileLocationGroups{
            locationGroupZones(first:1){
              edges{
                node{
                  methodDefinitions(first: 10 reverse:true){
                    edges{
                      node{
                        id
                        name
                        description
                      }
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`
    shopify
    .graphql(query, variables)
    .then((profile) => {
      console.log(profile)
      if(profile.deliveryProfileUpdate.userErrors.length === 0){
        let generalProfileShippingMethods = profile.deliveryProfileUpdate.profile.profileLocationGroups[0].locationGroupZones.edges[0].node.methodDefinitions.edges.map(edge => edge.node)
        res.send(generalProfileShippingMethods)
      }else{
        res.send(profile)
        return
      }
    })
    .catch((err) => {
      console.error(err)
      res.send(err)
    });
  }catch(error){
    console.log(error)
    res.send(error)
  }

});


app.listen(port, () => {
  const { address } = server.address();
  console.log(address)
  console.log(`Server listening on port ${port}`);
});
