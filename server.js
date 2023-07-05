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

app.post('/get-items-gids', async (req, res) => {
  console.log(req.body)
  let id = req.body.id;
  let fields = req.body.fields;
  try{
    shopify.productVariant
    .get(id, fields)
    .then(data => {
      res.send(data)
    })
    .catch((err) => {
      console.error(err)
      res.send(err)
    })
  }catch{
    console.log(error)
    res.send(error)
  }
})

app.post('/get-profile-gids', async (req, res) => {
  console.log(req.body)
  let time = req.body.time;
  try{
    let query = `
      {
        deliveryProfiles(first:100) {
          edges{
            node{
              id
              name
            }
          }
        }
      }
      `
    shopify
    .graphql(query)
    .then((profiles) => {
      console.log('profiles',profiles)
      let deliveryProfilesToDelete = profiles.deliveryProfiles.edges.map(edge => {
        let name = edge.node.name
        if(parseInt(name) < parseInt(time)){
          return edge.node.id
        }
        return
      })
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
})

app.post('/create-shipping-profile', async (req, res) => {
  console.log(req.body)
  try{
    const variables = req.body
    const query = `mutation deliveryProfileCreate($profile: DeliveryProfileInput!) {
      deliveryProfileCreate(profile: $profile) {
        profile {
          zoneCountryCount
          name
        }
        userErrors {
          field
          message
        }
      }
    }`;
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


/* {"profile": {
  "name": "render created",
  "locationGroupsToCreate": [
    {
      "locations": [
        "gid://shopify/Location/76352618802"
      ],
      "zonesToCreate": [
        {
          "countries": [
            {
              "code": "MX",
              "includeAllProvinces": true

            }
          ],
          "methodDefinitionsToCreate": [
            {
              "active": true,
              "description": "",
              "name": "Creado desde render",
              "rateDefinition": {
                "price": {
                  "amount": "999",
                  "currencyCode": "MXN"
                }
              }
            }
          ],
          "name": "admin"
        }
      ]
    }
  ]
}
} */