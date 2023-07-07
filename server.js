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
  origin: 'https://dev.allnutrition.cl',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express();
const port = 3000;

app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/get-profile-gids', async (req, res) => {
  console.log(req.body)
  try{
    let query = `
      {
        deliveryProfiles(first:10){
          edges{
            node{
              id
              name
              profileLocationGroups{
                locationGroup{
                  id
                }
                locationGroupZones(first:5){
                  edges{
                    node{
                      zone{
                        id
                        name
                      }
                      methodDefinitions(first:5){
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
      console.log('length', profiles.deliveryProfiles.edges[0].node.profileLocationGroups[0].locationGroupZones.edges[0].node.methodDefinitions.edges)
      await profiles.deliveryProfiles.edges[0].node.profileLocationGroups[0].locationGroupZones.edges[0].node.methodDefinitions.edges.forEach(async (edge) => {
        let profileDescription = edge.node.description

        if(profileDescription && profileDescription.includes('-')){
          let destructuredDescription = profileDescription.split('-')
          let givenDate = destructuredDescription[1].trim()
          console.log(givenDate)
          let isOlder = await isDateMoreThanTwoDaysOlder(givenDate);
          console.log('older?',isOlder);

          if(isOlder){
            deliveryProfilesToDelete.push(edge.node.id)
          }
        }
      })
      console.log('delete:', deliveryProfilesToDelete)
      res.send(deliveryProfilesToDelete)
    })
    .catch((err) => {
      console.error(err)
      res.send(err)
    });
  }catch{
    console.log(error)
    res.send(error)
  }

  const isDateMoreThanTwoDaysOlder = async (givenDate) => {

    let today = new Date();

    let givenDateParts = givenDate.split("/");
    let givenDay = parseInt(givenDateParts[0], 10);
    let givenMonth = parseInt(givenDateParts[1], 10) - 1;
    let givenYear = parseInt(givenDateParts[2], 10);
  
    let parsedGivenDate = new Date(givenYear, givenMonth, givenDay);
  
    let timeDifference = today - parsedGivenDate;
    
    let daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  
    if (daysDifference >= 1) {
      return true;
    } else {
      return false;
    }
  }

})

app.post('/create-shipping-profile', async (req, res) => {
  console.log(req.body)
  try{
    const variables = req.body
    const query = `mutation deliveryProfileUpdate($id: ID!, $profile: DeliveryProfileInput!) {
      deliveryProfileUpdate(id: $id, profile: $profile) {
        profile {
          zoneCountryCount
          name
          id
          profileLocationGroups{
            locationGroup{
              id
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
      if(profile){
        console.log(profile)
        res.send(profile)
      }else{
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
  console.log(`Server listening on port ${port}`);
});

